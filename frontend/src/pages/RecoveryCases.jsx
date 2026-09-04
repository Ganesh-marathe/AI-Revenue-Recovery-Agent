import React, { useEffect, useMemo, useState } from "react";
import {
  getRevenueRisk,
  getCustomers,
  analyzeRecovery,
  executeRecoveryAction,
} from "../services/api";
import "./RecoveryCases.css";

function RecoveryCases() {
  const [cases, setCases] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      setLoading(true);
      setError("");

      const [riskData, customerData] = await Promise.all([
        getRevenueRisk(),
        getCustomers(),
      ]);

      const caseList = Array.isArray(riskData)
        ? riskData
        : riskData?.cases || [];

      const customerList = Array.isArray(customerData)
        ? customerData
        : customerData?.customers || [];

      setCases(caseList);
      setCustomers(customerList);
    } catch (err) {
      console.error("Recovery cases error:", err);
      setError(err?.message || "Unable to load recovery cases.");
    } finally {
      setLoading(false);
    }
  }

  function getCustomerName(customerId) {
    const customer = customers.find(
      (item) =>
        Number(item.id) === Number(customerId) ||
        Number(item.customer_id) === Number(customerId)
    );

    return (
      customer?.name ||
      customer?.customer_name ||
      customer?.company_name ||
      `Customer #${customerId}`
    );
  }

  function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  }

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getRiskClass(risk) {
    const value = String(risk || "").toLowerCase();

    if (value === "high") return "rc-risk-high";
    if (value === "medium") return "rc-risk-medium";
    if (value === "low") return "rc-risk-low";

    return "rc-risk-default";
  }

  function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value === "executed") return "rc-status-executed";
    if (value === "open") return "rc-status-open";
    if (value === "failed") return "rc-status-failed";

    return "rc-status-default";
  }

  const filteredCases = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return cases.filter((item) => {
      const invoiceId = String(item.invoice_id || "").toLowerCase();
      const customerId = String(item.customer_id || "").toLowerCase();
      const customerName = getCustomerName(item.customer_id).toLowerCase();

      const matchesSearch =
        !search ||
        invoiceId.includes(search) ||
        customerId.includes(search) ||
        customerName.includes(search);

      const matchesRisk =
        riskFilter === "ALL" ||
        String(item.risk_level || "").toUpperCase() === riskFilter;

      const currentStatus =
        item.case_status ||
        item.status ||
        "open";

      const matchesStatus =
        statusFilter === "ALL" ||
        String(currentStatus).toUpperCase() === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [cases, customers, searchTerm, riskFilter, statusFilter]);

  const highRisk = cases.filter(
    (item) =>
      String(item.risk_level || "").toUpperCase() === "HIGH"
  ).length;

  const mediumRisk = cases.filter(
    (item) =>
      String(item.risk_level || "").toUpperCase() === "MEDIUM"
  ).length;

  const openCases = cases.filter(
    (item) =>
      String(item.case_status || item.status || "open").toLowerCase() ===
      "open"
  ).length;

  const totalRisk = cases.reduce(
    (sum, item) => sum + Number(item.revenue_at_risk || 0),
    0
  );

  async function handleViewCase(item) {
    try {
      setSelectedCase(item);
      setCaseDetails(null);
      setDetailsLoading(true);
      setError("");
      setSuccessMessage("");

      const details = await analyzeRecovery(item.invoice_id);
      setCaseDetails(details);
    } catch (err) {
      console.error("Recovery case details error:", err);
      setError(
        err?.message || "Unable to load recovery case details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeCase() {
    if (executeLoading) return;

    setSelectedCase(null);
    setCaseDetails(null);
    setError("");
    setSuccessMessage("");
  }

  async function handleExecuteAction() {
    const caseId = caseDetails?.case_id;

    if (!caseId) {
      setError("Recovery Case ID is not available.");
      return;
    }

    if (caseDetails?.case_status === "executed") {
      return;
    }

    try {
      setExecuteLoading(true);
      setError("");
      setSuccessMessage("");

      const result = await executeRecoveryAction(caseId);

      setCaseDetails((previous) => ({
        ...(previous || {}),
        case_status: result?.status || "executed",
      }));

      setSuccessMessage(
        result?.execution_message ||
          result?.message ||
          "Recovery action executed successfully."
      );

      await loadCases();
    } catch (err) {
      console.error("Execute recovery action error:", err);
      setError(
        err?.message ||
          "Unable to execute the recovery action."
      );
    } finally {
      setExecuteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rc-page-state">
        <div className="rc-spinner"></div>
        <h2>Loading Recovery Cases...</h2>
        <p>Analyzing revenue risk and recovery opportunities.</p>
      </div>
    );
  }

  return (
    <div className="rc-page">

      {/* HEADER */}
      <section className="rc-header">
        <div>
          <span className="rc-eyebrow">AI REVENUE RECOVERY</span>
          <h1>Recovery Cases</h1>
          <p>
            Manage at-risk revenue, review AI recommendations,
            and execute recovery actions.
          </p>
        </div>

        <button
          className="rc-refresh-button"
          onClick={loadCases}
        >
          ↻ Refresh
        </button>
      </section>

      {/* ALERTS */}
      {error && (
        <div className="rc-alert rc-alert-error">
          <span>!</span>
          <div>
            <strong>Action Required</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="rc-alert rc-alert-success">
          <span>✓</span>
          <div>
            <strong>Recovery Action Completed</strong>
            <p>{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage("")}>×</button>
        </div>
      )}

      {/* KPI */}
      <section className="rc-kpi-grid">
        <Kpi icon="◈" label="Total Cases" value={cases.length} />
        <Kpi icon="!" label="Open Cases" value={openCases} type="orange" />
        <Kpi icon="▲" label="High Risk" value={highRisk} type="red" />
        <Kpi icon="₹" label="Revenue At Risk" value={formatCurrency(totalRisk)} type="purple" />
      </section>

      {/* MAIN CARD */}
      <section className="rc-card">

        <div className="rc-card-header">
          <div>
            <h2>Recovery Case Portfolio</h2>
            <p>Live cases requiring AI-assisted recovery decisions.</p>
          </div>

          <span className="rc-live">● LIVE</span>
        </div>

        {/* FILTERS */}
        <div className="rc-toolbar">

          <div className="rc-search">
            <span>⌕</span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoice or customer..."
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="EXECUTED">Executed</option>
          </select>

        </div>

        {/* TABLE */}
        <div className="rc-table-wrap">
          <table className="rc-table">
            <thead>
              <tr>
                <th>CASE</th>
                <th>INVOICE</th>
                <th>CUSTOMER</th>
                <th>REVENUE AT RISK</th>
                <th>RISK</th>
                <th>AI RECOMMENDATION</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="rc-empty-cell">
                    <div className="rc-empty">
                      <div className="rc-empty-icon">✓</div>
                      <h3>No Recovery Cases Found</h3>
                      <p>Try changing the search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCases.map((item, index) => {
                  const caseId =
                    item.case_id ||
                    item.id ||
                    item.invoice_id ||
                    index + 1;

                  const status =
                    item.case_status ||
                    item.status ||
                    "open";

                  return (
                    <tr key={caseId}>
                      <td>
                        <strong>
                          CASE-{caseId}
                        </strong>
                      </td>

                      <td>
                        <span className="rc-invoice-id">
                          INV-{item.invoice_id}
                        </span>
                      </td>

                      <td>
                        <div className="rc-customer">
                          <div className="rc-avatar">
                            {getCustomerName(item.customer_id)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span>
                            {getCustomerName(item.customer_id)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(item.revenue_at_risk)}
                        </strong>
                      </td>

                      <td>
                        <span className={`rc-risk ${getRiskClass(item.risk_level)}`}>
                          {item.risk_level || "UNKNOWN"}
                        </span>
                      </td>

                      <td>
                        <span className="rc-action">
                          {item.intervention_action ||
                            item.recommended_action ||
                            "Manual Review"}
                        </span>
                      </td>

                      <td>
                        <span className={`rc-status ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="rc-view-button"
                          onClick={() => handleViewCase(item)}
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="rc-table-footer">
          Showing <strong>{filteredCases.length}</strong> of{" "}
          <strong>{cases.length}</strong> recovery cases
        </div>
      </section>

      {/* DETAILS MODAL */}
      {selectedCase && (
        <div
          className="rc-modal-overlay"
          onClick={closeCase}
        >
          <div
            className="rc-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="rc-modal-header">
              <div>
                <span className="rc-eyebrow">
                  RECOVERY CASE INTELLIGENCE
                </span>
                <h2>
                  CASE-
                  {caseDetails?.case_id ||
                    selectedCase.case_id ||
                    selectedCase.invoice_id}
                </h2>
              </div>

              <button
                className="rc-close"
                onClick={closeCase}
              >
                ×
              </button>
            </div>

            {detailsLoading ? (
              <div className="rc-modal-loading">
                <div className="rc-spinner"></div>
                <h3>Analyzing Recovery Case...</h3>
                <p>
                  ReviveAI is evaluating payment risk,
                  diagnosis and recommended intervention.
                </p>
              </div>
            ) : (
              <div className="rc-modal-body">

                {/* CASE SUMMARY */}
                <div className="rc-detail-summary">

                  <div className="rc-detail-id">
                    <span>Invoice</span>
                    <strong>
                      INV-
                      {caseDetails?.invoice_id ||
                        selectedCase.invoice_id}
                    </strong>
                  </div>

                  <div className="rc-detail-id">
                    <span>Customer</span>
                    <strong>
                      {getCustomerName(
                        caseDetails?.customer_id ||
                          selectedCase.customer_id
                      )}
                    </strong>
                  </div>

                  <div className="rc-detail-id">
                    <span>Revenue At Risk</span>
                    <strong>
                      {formatCurrency(
                        caseDetails?.revenue_at_risk ??
                          selectedCase.revenue_at_risk
                      )}
                    </strong>
                  </div>

                  <div className="rc-detail-id">
                    <span>Risk Level</span>
                    <strong>
                      <span
                        className={`rc-risk ${getRiskClass(
                          caseDetails?.risk_level ||
                            selectedCase.risk_level
                        )}`}
                      >
                        {caseDetails?.risk_level ||
                          selectedCase.risk_level ||
                          "UNKNOWN"}
                      </span>
                    </strong>
                  </div>

                </div>

                {/* AI DIAGNOSIS */}
                <div className="rc-ai-panel">

                  <div className="rc-ai-title">
                    <div className="rc-ai-icon">AI</div>

                    <div>
                      <h3>AI Recovery Intelligence</h3>
                      <p>
                        Powered by ReviveAI Decision Engine
                      </p>
                    </div>
                  </div>

                  <div className="rc-ai-grid">

                    <div className="rc-ai-item">
                      <span>Payment Status</span>
                      <strong>
                        {caseDetails?.payment_status ||
                          "Pending"}
                      </strong>
                    </div>

                    <div className="rc-ai-item">
                      <span>Payment Amount</span>
                      <strong>
                        {formatCurrency(
                          caseDetails?.payment_amount
                        )}
                      </strong>
                    </div>

                    <div className="rc-ai-item rc-ai-wide">
                      <span>Diagnosis</span>
                      <p>
                        {caseDetails?.diagnosis ||
                          "No diagnosis available."}
                      </p>
                    </div>

                    <div className="rc-ai-item rc-ai-wide">
                      <span>Recommended Action</span>
                      <strong>
                        {caseDetails?.intervention_action ||
                          caseDetails?.recommended_action ||
                          "Manual Review"}
                      </strong>

                      <p>
                        {caseDetails?.intervention_message ||
                          "AI recommendation based on current payment risk."}
                      </p>
                    </div>

                  </div>
                </div>

                {/* TIMELINE */}
                <div className="rc-timeline-section">

                  <div className="rc-section-heading">
                    <h3>Recovery Timeline</h3>
                    <p>
                      Track the case from risk detection
                      to recovery execution.
                    </p>
                  </div>

                  <div className="rc-timeline">

                    <TimelineItem
                      number="1"
                      title="Invoice Created"
                      text="Invoice entered into ReviveAI monitoring."
                      completed
                    />

                    <TimelineLine />

                    <TimelineItem
                      number="2"
                      title="Payment Risk Detected"
                      text={`${caseDetails?.risk_level || selectedCase.risk_level || "MEDIUM"} risk identified from payment signals.`}
                      completed
                    />

                    <TimelineLine />

                    <TimelineItem
                      number="3"
                      title="AI Diagnosis"
                      text={
                        caseDetails?.diagnosis ||
                        "AI diagnosis generated for the recovery case."
                      }
                      completed={Boolean(caseDetails?.case_id)}
                    />

                    <TimelineLine />

                    <TimelineItem
                      number="4"
                      title="Recovery Action"
                      text={
                        caseDetails?.case_status === "executed"
                          ? "Recovery action executed successfully."
                          : "Recovery action is waiting for execution."
                      }
                      completed={
                        caseDetails?.case_status === "executed"
                      }
                    />

                  </div>
                </div>

                {/* ACTION */}
                <div className="rc-action-panel">

                  <div>
                    <span className="rc-action-label">
                      NEXT BEST ACTION
                    </span>

                    <h3>
                      {caseDetails?.intervention_action ||
                        caseDetails?.recommended_action ||
                        "Manual Review"}
                    </h3>

                    <p>
                      Execute the AI-selected recovery
                      intervention when ready.
                    </p>
                  </div>

                  <button
                    className="rc-execute-button"
                    onClick={handleExecuteAction}
                    disabled={
                      executeLoading ||
                      caseDetails?.case_status === "executed"
                    }
                  >
                    {executeLoading
                      ? "Executing..."
                      : caseDetails?.case_status === "executed"
                      ? "✓ Action Executed"
                      : "Execute Recovery Action"}
                  </button>

                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// KPI
// ============================================================

function Kpi({ icon, label, value, type = "" }) {
  return (
    <div className="rc-kpi">
      <div className={`rc-kpi-icon ${type}`}>
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}


// ============================================================
// TIMELINE
// ============================================================

function TimelineItem({
  number,
  title,
  text,
  completed,
}) {
  return (
    <div className={`rc-timeline-item ${completed ? "completed" : ""}`}>
      <div className="rc-timeline-dot">
        {completed ? "✓" : number}
      </div>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function TimelineLine() {
  return <div className="rc-timeline-line"></div>;
}

export default RecoveryCases;

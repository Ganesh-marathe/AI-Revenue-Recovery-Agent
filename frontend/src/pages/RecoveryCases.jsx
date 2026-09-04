import React, { useEffect, useMemo, useState } from "react";

import {
  getRevenueRisk,
  getCustomers,
  analyzeRecovery,
  executeRecoveryAction,
} from "../services/api";


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

  const [selectedCase, setSelectedCase] = useState(null);
  const [analysis, setAnalysis] = useState(null);


  /* =========================
     LOAD RECOVERY CASES
  ========================= */

  const loadCases = async () => {
    try {
      setLoading(true);
      setError("");

      const [riskData, customerData] =
        await Promise.all([
          getRevenueRisk(),
          getCustomers(),
        ]);

      setCases(
        Array.isArray(riskData?.cases)
          ? riskData.cases
          : []
      );

      setCustomers(
        Array.isArray(customerData)
          ? customerData
          : Array.isArray(customerData?.customers)
          ? customerData.customers
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Recovery cases load करताना error आला."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadCases();
  }, []);


  /* =========================
     CUSTOMER NAME
  ========================= */

  const getCustomerName = (customerId) => {
    const customer = customers.find(
      (item) =>
        item.id === customerId ||
        item.customer_id === customerId
    );

    if (!customer) {
      return `Customer #${customerId}`;
    }

    return (
      customer.name ||
      customer.customer_name ||
      customer.company_name ||
      customer.email ||
      `Customer #${customerId}`
    );
  };


  /* =========================
     FILTER CASES
  ========================= */

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const search = searchTerm
        .trim()
        .toLowerCase();

      const matchesSearch =
        !search ||
        String(item.case_id || item.id || "")
          .toLowerCase()
          .includes(search) ||
        String(item.invoice_id || "")
          .toLowerCase()
          .includes(search) ||
        getCustomerName(item.customer_id)
          .toLowerCase()
          .includes(search);

      const matchesRisk =
        riskFilter === "ALL" ||
        String(item.risk_level || "")
          .toUpperCase() === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [
    cases,
    customers,
    searchTerm,
    riskFilter,
  ]);


  /* =========================
     OPEN CASE DETAILS
  ========================= */

  const handleViewDetails = async (item) => {
    try {
      setDetailsLoading(true);
      setError("");
      setSuccessMessage("");

      setSelectedCase(item);
      setAnalysis(null);

      const invoiceId =
        item.invoice_id ||
        item.id;

      const result =
        await analyzeRecovery(invoiceId);

      setAnalysis(result);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Recovery analysis मिळवताना error आला."
      );
    } finally {
      setDetailsLoading(false);
    }
  };


  /* =========================
     CLOSE DETAILS
  ========================= */

  const handleCloseDetails = () => {
    if (executeLoading) {
      return;
    }

    setSelectedCase(null);
    setAnalysis(null);
    setError("");
  };


  /* =========================
     EXECUTE ACTION
  ========================= */

  const handleExecuteAction = async () => {
    if (!analysis?.case_id) {
      setError(
        "Execute करण्यासाठी Recovery Case ID मिळाला नाही."
      );
      return;
    }

    try {
      setExecuteLoading(true);
      setError("");
      setSuccessMessage("");

      const result =
        await executeRecoveryAction(
          analysis.case_id
        );

      setSuccessMessage(
        result.execution_message ||
          result.message ||
          "Recovery action successfully executed."
      );

      setAnalysis((previous) => ({
        ...previous,
        case_status:
          result.status || "executed",
      }));

      await loadCases();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Recovery action execute करताना error आला."
      );
    } finally {
      setExecuteLoading(false);
    }
  };


  /* =========================
     CLOSE SUCCESS MESSAGE
  ========================= */

  const clearSuccessMessage = () => {
    setSuccessMessage("");
  };


  /* =========================
     SUMMARY
  ========================= */

  const totalCases = cases.length;

  const highRiskCases = cases.filter(
    (item) =>
      String(item.risk_level || "")
        .toUpperCase() === "HIGH"
  ).length;

  const mediumRiskCases = cases.filter(
    (item) =>
      String(item.risk_level || "")
        .toUpperCase() === "MEDIUM"
  ).length;

  const totalRevenueAtRisk =
    cases.reduce(
      (total, item) =>
        total +
        Number(
          item.revenue_at_risk || 0
        ),
      0
    );


  /* =========================
     CURRENCY FORMAT
  ========================= */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };


  /* =========================
     RISK CLASS
  ========================= */

  const getRiskClass = (risk) => {
    const value = String(risk || "")
      .toLowerCase();

    if (value === "high") {
      return "risk-high";
    }

    if (value === "medium") {
      return "risk-medium";
    }

    if (value === "low") {
      return "risk-low";
    }

    return "risk-default";
  };


  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <span className="section-label">
              RECOVERY OPERATIONS
            </span>

            <h1>Recovery Cases</h1>

            <p>
              AI-powered revenue recovery
              cases and interventions.
            </p>
          </div>
        </div>

        <div className="loading-card">
          <div className="loading-spinner"></div>

          <p>
            Recovery cases load होत आहेत...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="page-container">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <span className="section-label">
            RECOVERY OPERATIONS
          </span>

          <h1>Recovery Cases</h1>

          <p>
            AI-powered revenue recovery
            cases and interventions.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadCases}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="alert-error">
          <span>⚠</span>

          <div>
            <strong>
              Something went wrong
            </strong>

            <p>{error}</p>
          </div>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}


      {/* =========================
          SUCCESS
      ========================= */}

      {successMessage && (
        <div className="alert-success">

          <span>✓</span>

          <div>
            <strong>
              Recovery Action Completed
            </strong>

            <p>
              {successMessage}
            </p>
          </div>

          <button
            onClick={clearSuccessMessage}
          >
            ×
          </button>

        </div>
      )}


      {/* =========================
          KPI CARDS
      ========================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Total Cases</span>
          <strong>{totalCases}</strong>
          <small>
            Active recovery portfolio
          </small>
        </div>


        <div className="stat-card">
          <span>High Risk</span>
          <strong>{highRiskCases}</strong>
          <small>
            Requires immediate action
          </small>
        </div>


        <div className="stat-card">
          <span>Medium Risk</span>
          <strong>{mediumRiskCases}</strong>
          <small>
            Requires monitoring
          </small>
        </div>


        <div className="stat-card">
          <span>Revenue at Risk</span>
          <strong>
            {formatCurrency(
              totalRevenueAtRisk
            )}
          </strong>
          <small>
            Potential revenue exposure
          </small>
        </div>

      </div>


      {/* =========================
          FILTER BAR
      ========================= */}

      <div className="table-toolbar">

        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search case, invoice or customer..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

        </div>


        <select
          value={riskFilter}
          onChange={(e) =>
            setRiskFilter(e.target.value)
          }
        >
          <option value="ALL">
            All Risk Levels
          </option>

          <option value="HIGH">
            High Risk
          </option>

          <option value="MEDIUM">
            Medium Risk
          </option>

          <option value="LOW">
            Low Risk
          </option>
        </select>

      </div>


      {/* =========================
          CASE TABLE
      ========================= */}

      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h2>
              Recovery Case Portfolio
            </h2>

            <p>
              {filteredCases.length} cases
              displayed
            </p>
          </div>

          <span className="live-indicator">
            ● LIVE DATA
          </span>

        </div>


        {filteredCases.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              ✓
            </div>

            <h3>
              No recovery cases found
            </h3>

            <p>
              तुमच्या search किंवा filter
              नुसार कोणतेही cases मिळाले नाहीत.
            </p>

          </div>
        ) : (

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>

                  <th>CASE</th>
                  <th>INVOICE</th>
                  <th>CUSTOMER</th>
                  <th>AMOUNT</th>
                  <th>RISK</th>
                  <th>PAYMENT</th>
                  <th>AI ACTION</th>
                  <th></th>

                </tr>
              </thead>


              <tbody>

                {filteredCases.map(
                  (item, index) => {

                    const caseId =
                      item.case_id ||
                      item.id ||
                      index + 1;

                    return (
                      <tr
                        key={caseId}
                      >

                        <td>
                          <strong>
                            CASE-{caseId}
                          </strong>
                        </td>


                        <td>
                          INV-
                          {item.invoice_id ||
                            "N/A"}
                        </td>


                        <td>
                          <div className="customer-cell">

                            <div className="customer-avatar">
                              {getCustomerName(
                                item.customer_id
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span>
                              {getCustomerName(
                                item.customer_id
                              )}
                            </span>

                          </div>
                        </td>


                        <td>
                          <strong>
                            {formatCurrency(
                              item.invoice_amount
                            )}
                          </strong>
                        </td>


                        <td>
                          <span
                            className={`risk-badge ${getRiskClass(
                              item.risk_level
                            )}`}
                          >
                            {item.risk_level ||
                              "UNKNOWN"}
                          </span>
                        </td>


                        <td>
                          <span
                            className={
                              String(
                                item.payment_status ||
                                  ""
                              ).toLowerCase() ===
                              "success"
                                ? "payment-success"
                                : "payment-pending"
                            }
                          >
                            {item.payment_status ||
                              "Pending"}
                          </span>
                        </td>


                        <td>
                          <span className="ai-action">
                            {item.intervention_action ||
                              item.recommended_action ||
                              "Review"}
                          </span>
                        </td>


                        <td>
                          <button
                            className="view-button"
                            onClick={() =>
                              handleViewDetails(
                                item
                              )
                            }
                          >
                            View Details →
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* =========================
          DETAILS MODAL
      ========================= */}

      {selectedCase && (
        <div
          className="modal-overlay"
          onClick={handleCloseDetails}
        >

          <div
            className="recovery-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span className="section-label">
                  AI RECOVERY ANALYSIS
                </span>

                <h2>
                  Recovery Case Details
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={handleCloseDetails}
              >
                ×
              </button>

            </div>


            {detailsLoading ? (

              <div className="modal-loading">

                <div className="loading-spinner"></div>

                <p>
                  AI recovery analysis
                  तयार होत आहे...
                </p>

              </div>

            ) : analysis ? (

              <div className="modal-content">

                {/* CASE SUMMARY */}

                <div className="detail-grid">

                  <div className="detail-item">
                    <span>Case ID</span>
                    <strong>
                      CASE-{analysis.case_id}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Invoice ID</span>
                    <strong>
                      INV-{analysis.invoice_id}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Customer</span>
                    <strong>
                      {getCustomerName(
                        analysis.customer_id
                      )}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Invoice Amount</span>
                    <strong>
                      {formatCurrency(
                        analysis.invoice_amount
                      )}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Payment Amount</span>
                    <strong>
                      {formatCurrency(
                        analysis.payment_amount
                      )}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Revenue at Risk</span>
                    <strong>
                      {formatCurrency(
                        analysis.revenue_at_risk
                      )}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Risk Level</span>

                    <span
                      className={`risk-badge ${getRiskClass(
                        analysis.risk_level
                      )}`}
                    >
                      {analysis.risk_level}
                    </span>

                  </div>

                  <div className="detail-item">
                    <span>Status</span>

                    <span className="status-badge">
                      {analysis.case_status ||
                        "OPEN"}
                    </span>

                  </div>

                </div>


                {/* AI DIAGNOSIS */}

                <div className="ai-panel">

                  <div className="ai-panel-header">

                    <div className="ai-icon">
                      AI
                    </div>

                    <div>
                      <h3>
                        AI Diagnosis
                      </h3>

                      <p>
                        ReviveAI Decision Engine
                      </p>
                    </div>

                  </div>


                  <div className="ai-diagnosis">

                    <span>
                      Problem Diagnosis
                    </span>

                    <p>
                      {analysis.diagnosis ||
                        "No diagnosis available."}
                    </p>

                  </div>


                  <div className="ai-recommendation">

                    <span>
                      Recommended Action
                    </span>

                    <strong>
                      {analysis.recommended_action ||
                        analysis.intervention_action ||
                        "Manual Review"}
                    </strong>

                    <p>
                      {analysis.intervention_message ||
                        "Recovery action recommended based on payment risk."}
                    </p>

                  </div>

                </div>


                {/* ACTION */}

                <div className="action-section">

                  <div>

                    <h3>
                      Recovery Intervention
                    </h3>

                    <p>
                      AI ने सुचवलेली action
                      execute करण्यासाठी खालील
                      button वापरा.
                    </p>

                  </div>


                  <button
                    className="execute-button"
                    onClick={
                      handleExecuteAction
                    }
                    disabled={
                      executeLoading ||
                      analysis.case_status !==
                        "open"
                    }
                  >

                    {executeLoading ? (
                      <>
                        <span className="button-spinner"></span>
                        Executing...
                      </>
                    ) : analysis.case_status ===
                      "executed" ? (
                      "✓ Action Executed"
                    ) : (
                      "Execute Recovery Action"
                    )}

                  </button>

                </div>


                {/* INTERVENTION INFO */}

                <div className="intervention-grid">

                  <div>
                    <span>
                      AI Action
                    </span>

                    <strong>
                      {analysis.intervention_action ||
                        "N/A"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Priority
                    </span>

                    <strong>
                      {analysis.intervention_priority ||
                        "N/A"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Payment Status
                    </span>

                    <strong>
                      {analysis.payment_status ||
                        "N/A"}
                    </strong>
                  </div>

                </div>

              </div>

            ) : (

              <div className="empty-state">

                <h3>
                  Analysis unavailable
                </h3>

                <p>
                  Recovery analysis मिळू शकले नाही.
                </p>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}


export default RecoveryCases;
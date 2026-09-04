import React, { useEffect, useMemo, useState } from "react";
import {
  getRevenueRisk,
  getCustomers,
  getInvoice,
  getInvoicePayments,
  analyzeRecovery,
  executeRecoveryAction,
} from "../services/api";
  import "./invoice.css";
function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [analysis, setAnalysis] = useState(null);


  /* =====================================================
     LOAD INVOICES
  ===================================================== */

  useEffect(() => {
    loadInvoices();
  }, []);


  async function loadInvoices() {
    try {
      setLoading(true);
      setError("");

      const [riskData, customerData] =
        await Promise.all([
          getRevenueRisk(),
          getCustomers(),
        ]);

      setInvoices(
        Array.isArray(riskData?.cases)
          ? riskData.cases
          : []
      );

      setCustomers(
        Array.isArray(customerData?.customers)
          ? customerData.customers
          : Array.isArray(customerData)
          ? customerData
          : []
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load invoices."
      );
    } finally {
      setLoading(false);
    }
  }


  /* =====================================================
     CUSTOMER NAME
  ===================================================== */

  function getCustomerName(customerId) {
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
  }


  /* =====================================================
     CURRENCY
  ===================================================== */

  function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  }


  /* =====================================================
     DATE
  ===================================================== */

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }


  /* =====================================================
     RISK CLASS
  ===================================================== */

  function getRiskClass(risk) {
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
  }


  /* =====================================================
     PAYMENT CLASS
  ===================================================== */

  function getPaymentClass(status) {
    const value = String(status || "")
      .toLowerCase();

    if (value === "success") {
      return "payment-success";
    }

    if (value === "failed") {
      return "payment-failed";
    }

    if (value === "pending") {
      return "payment-pending";
    }

    return "payment-default";
  }


  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredInvoices = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return invoices.filter((item) => {

      const matchesSearch =
        !search ||
        String(item.invoice_id || "")
          .toLowerCase()
          .includes(search) ||
        String(item.customer_id || "")
          .toLowerCase()
          .includes(search) ||
        getCustomerName(item.customer_id)
          .toLowerCase()
          .includes(search);

      const matchesRisk =
        riskFilter === "ALL" ||
        String(item.risk_level || "")
          .toUpperCase() === riskFilter;

      return (
        matchesSearch &&
        matchesRisk
      );
    });

  }, [
    invoices,
    customers,
    searchTerm,
    riskFilter,
  ]);


  /* =====================================================
     VIEW INVOICE DETAILS
  ===================================================== */

  async function handleViewDetails(item) {
    try {
      setSelectedInvoice(item);

      setInvoiceDetails(null);
      setPaymentHistory(null);
      setAnalysis(null);

      setSuccessMessage("");
      setError("");

      setDetailsLoading(true);

      const invoiceId =
        item.invoice_id;

      const [
        invoiceData,
        paymentsData,
        analysisData,
      ] = await Promise.all([
        getInvoice(invoiceId),
        getInvoicePayments(invoiceId),
        analyzeRecovery(invoiceId),
      ]);

      setInvoiceDetails(invoiceData);
      setPaymentHistory(paymentsData);
      setAnalysis(analysisData);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load invoice details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  function handleCloseDetails() {
    if (executeLoading) {
      return;
    }

    setSelectedInvoice(null);
    setInvoiceDetails(null);
    setPaymentHistory(null);
    setAnalysis(null);

    setError("");
  }


  /* =====================================================
     EXECUTE RECOVERY ACTION
  ===================================================== */

  async function handleExecuteAction() {

    if (!analysis?.case_id) {
      setError(
        "Recovery Case ID उपलब्ध नाही."
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
          "Recovery action executed successfully."
      );

      setAnalysis((previous) => ({
        ...previous,
        case_status:
          result.status ||
          "executed",
      }));

      await loadInvoices();

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Recovery action execute करताना error आला."
      );
    } finally {
      setExecuteLoading(false);
    }
  }


  /* =====================================================
     KPI CALCULATIONS
  ===================================================== */

  const totalInvoices =
    invoices.length;

  const failedInvoices =
    invoices.filter(
      (item) =>
        String(item.payment_status)
          .toLowerCase() === "failed"
    ).length;

  const pendingInvoices =
    invoices.filter(
      (item) =>
        String(item.payment_status)
          .toLowerCase() === "pending"
    ).length;

  const totalRisk =
    invoices.reduce(
      (sum, item) =>
        sum +
        Number(
          item.revenue_at_risk || 0
        ),
      0
    );


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="invoice-page">

        <div className="invoice-loading">

          <div className="invoice-spinner"></div>

          <h2>
            Loading Invoices...
          </h2>

          <p>
            Fetching invoice and payment
            information.
          </p>

        </div>

      </div>
    );
  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (error && invoices.length === 0) {
    return (
      <div className="invoice-page">

        <div className="invoice-error">

          <div className="invoice-error-icon">
            !
          </div>

          <h2>
            Unable to Load Invoices
          </h2>

          <p>
            {error}
          </p>

          <button
            className="invoice-primary-button"
            onClick={loadInvoices}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  return (
    <div className="invoice-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="invoice-header">

        <div>

          <span className="invoice-eyebrow">
            REVENUE OPERATIONS
          </span>

          <h1>
            Invoices
          </h1>

          <p>
            Monitor invoice amounts, payment
            status and revenue risk.
          </p>

        </div>


        <button
          className="invoice-refresh"
          onClick={loadInvoices}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </section>


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && invoices.length > 0 && (
        <div className="invoice-alert error">

          <span>!</span>

          <div>
            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {successMessage && (
        <div className="invoice-alert success">

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
            onClick={() =>
              setSuccessMessage("")
            }
          >
            ×
          </button>

        </div>
      )}


      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="invoice-kpi-grid">

        <div className="invoice-kpi-card">

          <div className="invoice-kpi-icon">
            ▤
          </div>

          <div>

            <span>
              Total Invoices
            </span>

            <strong>
              {totalInvoices}
            </strong>

            <small>
              Invoices under monitoring
            </small>

          </div>

        </div>


        <div className="invoice-kpi-card">

          <div className="invoice-kpi-icon failed">
            !
          </div>

          <div>

            <span>
              Failed Payments
            </span>

            <strong>
              {failedInvoices}
            </strong>

            <small>
              Require retry action
            </small>

          </div>

        </div>


        <div className="invoice-kpi-card">

          <div className="invoice-kpi-icon pending">
            ↓
          </div>

          <div>

            <span>
              Pending Payments
            </span>

            <strong>
              {pendingInvoices}
            </strong>

            <small>
              Require follow-up
            </small>

          </div>

        </div>


        <div className="invoice-kpi-card">

          <div className="invoice-kpi-icon revenue">
            ₹
          </div>

          <div>

            <span>
              Revenue At Risk
            </span>

            <strong>
              {formatCurrency(totalRisk)}
            </strong>

            <small>
              Potential recovery
            </small>

          </div>

        </div>

      </section>


      {/* =================================================
          INVOICE CARD
      ================================================= */}

      <section className="invoice-card">

        <div className="invoice-card-header">

          <div>

            <h2>
              Invoice Monitoring
            </h2>

            <p>
              Live invoice risk information
              from ReviveAI.
            </p>

          </div>

          <span className="invoice-live">
            ● LIVE DATA
          </span>

        </div>


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="invoice-toolbar">

          <div className="invoice-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search invoice or customer..."
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


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="invoice-table-wrapper">

          <table className="invoice-table">

            <thead>

              <tr>

                <th>
                  INVOICE
                </th>

                <th>
                  CUSTOMER
                </th>

                <th>
                  INVOICE AMOUNT
                </th>

                <th>
                  PAYMENT
                </th>

                <th>
                  REVENUE RISK
                </th>

                <th>
                  RISK LEVEL
                </th>

                <th>
                  DETAILS
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredInvoices.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="invoice-empty-cell"
                  >

                    <div className="invoice-empty">

                      <div className="invoice-empty-icon">
                        ✓
                      </div>

                      <h3>
                        No Invoices Found
                      </h3>

                      <p>
                        तुमच्या search किंवा
                        filter नुसार invoice
                        मिळाले नाहीत.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredInvoices.map(
                  (item) => (

                    <tr
                      key={item.invoice_id}
                    >

                      <td>

                        <strong className="invoice-id">
                          INV-
                          {item.invoice_id}
                        </strong>

                      </td>


                      <td>

                        <div className="invoice-customer">

                          <div className="invoice-avatar">
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
                          className={`invoice-payment ${getPaymentClass(
                            item.payment_status
                          )}`}
                        >
                          {item.payment_status ||
                            "Unknown"}
                        </span>

                      </td>


                      <td>

                        <strong>
                          {formatCurrency(
                            item.revenue_at_risk
                          )}
                        </strong>

                      </td>


                      <td>

                        <span
                          className={`invoice-risk ${getRiskClass(
                            item.risk_level
                          )}`}
                        >
                          {item.risk_level ||
                            "Unknown"}
                        </span>

                      </td>


                      <td>

                        <button
                          className="invoice-view-button"
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

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          INVOICE DETAILS MODAL
      ================================================= */}

      {selectedInvoice && (
        <div
          className="invoice-modal-overlay"
          onClick={handleCloseDetails}
        >

          <div
            className="invoice-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="invoice-modal-header">

              <div>

                <span className="invoice-eyebrow">
                  INVOICE INTELLIGENCE
                </span>

                <h2>
                  Invoice Details
                </h2>

              </div>

              <button
                className="invoice-modal-close"
                onClick={handleCloseDetails}
              >
                ×
              </button>

            </div>


            {detailsLoading ? (

              <div className="invoice-modal-loading">

                <div className="invoice-spinner"></div>

                <h3>
                  Loading invoice details...
                </h3>

                <p>
                  Fetching payment history and
                  AI recovery analysis.
                </p>

              </div>

            ) : (

              <div className="invoice-modal-content">

                {/* =================================================
                    INVOICE SUMMARY
                ================================================= */}

                <div className="invoice-detail-top">

                  <div>

                    <span>
                      Invoice
                    </span>

                    <strong>
                      INV-
                      {invoiceDetails?.invoice_id ||
                        selectedInvoice.invoice_id}
                    </strong>

                  </div>


                  <span
                    className={`invoice-risk ${getRiskClass(
                      invoiceDetails?.status ===
                        "paid"
                        ? "low"
                        : analysis?.risk_level
                    )}`}
                  >
                    {analysis?.risk_level ||
                      selectedInvoice.risk_level ||
                      "UNKNOWN"}
                  </span>

                </div>


                {/* =================================================
                    DETAIL GRID
                ================================================= */}

                <div className="invoice-detail-grid">

                  <div className="invoice-detail-item">

                    <span>
                      Customer
                    </span>

                    <strong>
                      {invoiceDetails?.customer_name ||
                        getCustomerName(
                          selectedInvoice.customer_id
                        )}
                    </strong>

                  </div>


                  <div className="invoice-detail-item">

                    <span>
                      Invoice Amount
                    </span>

                    <strong>
                      {formatCurrency(
                        invoiceDetails?.amount ||
                          selectedInvoice.invoice_amount
                      )}
                    </strong>

                  </div>


                  <div className="invoice-detail-item">

                    <span>
                      Due Date
                    </span>

                    <strong>
                      {formatDate(
                        invoiceDetails?.due_date
                      )}
                    </strong>

                  </div>


                  <div className="invoice-detail-item">

                    <span>
                      Days Overdue
                    </span>

                    <strong>
                      {invoiceDetails?.days_overdue ??
                        0}{" "}
                      days
                    </strong>

                  </div>


                  <div className="invoice-detail-item">

                    <span>
                      Payment Status
                    </span>

                    <strong>
                      {analysis?.payment_status ||
                        selectedInvoice.payment_status ||
                        "Unknown"}
                    </strong>

                  </div>


                  <div className="invoice-detail-item">

                    <span>
                      Payment Amount
                    </span>

                    <strong>
                      {formatCurrency(
                        analysis?.payment_amount
                      )}
                    </strong>

                  </div>


                  <div className="invoice-detail-item">

                    <span>
                      Revenue At Risk
                    </span>

                    <strong>
                      {formatCurrency(
                        analysis?.revenue_at_risk ||
                          selectedInvoice.revenue_at_risk
                      )}
                    </strong>

                  </div>


                  <div className="invoice-detail-item">

                    <span>
                      Recovery Case
                    </span>

                    <strong>
                      {analysis?.case_id
                        ? `CASE-${analysis.case_id}`
                        : "Not Created"}
                    </strong>

                  </div>

                </div>


                {/* =================================================
                    PAYMENT HISTORY
                ================================================= */}

                <div className="invoice-section">

                  <div className="invoice-section-header">

                    <div>

                      <h3>
                        Payment History
                      </h3>

                      <p>
                        Payment attempts recorded
                        for this invoice.
                      </p>

                    </div>

                    <span>
                      {paymentHistory?.payment_count ||
                        0}{" "}
                      attempts
                    </span>

                  </div>


                  {paymentHistory?.payments?.length ? (

                    <div className="payment-history">

                      {paymentHistory.payments.map(
                        (payment) => (

                          <div
                            className="payment-row"
                            key={
                              payment.payment_id
                            }
                          >

                            <div className="payment-icon">
                              {String(
                                payment.status
                              ).toLowerCase() ===
                              "success"
                                ? "✓"
                                : "!"}
                            </div>

                            <div className="payment-main">

                              <strong>
                                Payment #
                                {payment.payment_id}
                              </strong>

                              <span>
                                {formatDate(
                                  payment.payment_date
                                )}
                              </span>

                            </div>

                            <strong>
                              {formatCurrency(
                                payment.amount
                              )}
                            </strong>

                            <span
                              className={`invoice-payment ${getPaymentClass(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="payment-empty">
                      No payment attempts recorded.
                    </div>

                  )}

                </div>


                {/* =================================================
                    AI RECOVERY INTELLIGENCE
                ================================================= */}

                {analysis && (

                  <div className="invoice-ai-panel">

                    <div className="invoice-ai-header">

                      <div className="invoice-ai-icon">
                        AI
                      </div>

                      <div>

                        <h3>
                          AI Recovery Intelligence
                        </h3>

                        <p>
                          Powered by ReviveAI
                          Decision Engine
                        </p>

                      </div>

                    </div>


                    <div className="invoice-ai-grid">

                      <div>

                        <span>
                          Diagnosis
                        </span>

                        <p>
                          {analysis.diagnosis ||
                            "No diagnosis available."}
                        </p>

                      </div>


                      <div>

                        <span>
                          Recommended Action
                        </span>

                        <strong>
                          {analysis.intervention_action ||
                            analysis.recommended_action ||
                            "Manual Review"}
                        </strong>

                        <p>
                          {analysis.intervention_message ||
                            "AI recommendation based on payment risk."}
                        </p>

                      </div>

                    </div>

                  </div>

                )}


                {/* =================================================
                    RECOVERY ACTION
                ================================================= */}

                {analysis && (

                  <div className="invoice-action-box">

                    <div>

                      <h3>
                        Recovery Intervention
                      </h3>

                      <p>
                        Execute the AI recommended
                        recovery action for this invoice.
                      </p>

                    </div>


                    <button
                      className="invoice-execute-button"
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
                          <span className="invoice-button-spinner"></span>
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

                )}


                {/* =================================================
                    TIMELINE
                ================================================= */}

                <div className="invoice-section">

                  <div className="invoice-section-header">

                    <div>

                      <h3>
                        Recovery Timeline
                      </h3>

                      <p>
                        Invoice lifecycle and AI
                        recovery activity.
                      </p>

                    </div>

                  </div>


                  <div className="invoice-timeline">

                    <div className="timeline-item completed">

                      <div className="timeline-dot">
                        ✓
                      </div>

                      <div>

                        <strong>
                          Invoice Created
                        </strong>

                        <span>
                          Invoice entered into
                          ReviveAI monitoring.
                        </span>

                      </div>

                    </div>


                    <div className="timeline-line"></div>


                    <div className="timeline-item completed">

                      <div className="timeline-dot">
                        ✓
                      </div>

                      <div>

                        <strong>
                          Payment Attempt
                        </strong>

                        <span>
                          Status:{" "}
                          {analysis?.payment_status ||
                            selectedInvoice.payment_status ||
                            "Pending"}
                        </span>

                      </div>

                    </div>


                    <div className="timeline-line"></div>


                    <div
                      className={`timeline-item ${
                        analysis?.case_id
                          ? "completed"
                          : ""
                      }`}
                    >

                      <div className="timeline-dot">
                        {analysis?.case_id
                          ? "✓"
                          : "3"}
                      </div>

                      <div>

                        <strong>
                          AI Risk Analysis
                        </strong>

                        <span>
                          {analysis?.risk_level
                            ? `${analysis.risk_level} risk identified.`
                            : "Awaiting analysis."}
                        </span>

                      </div>

                    </div>


                    <div className="timeline-line"></div>


                    <div
                      className={`timeline-item ${
                        analysis?.case_status ===
                        "executed"
                          ? "completed"
                          : ""
                      }`}
                    >

                      <div className="timeline-dot">
                        {analysis?.case_status ===
                        "executed"
                          ? "✓"
                          : "4"}
                      </div>

                      <div>

                        <strong>
                          Recovery Action
                        </strong>

                        <span>
                          {analysis?.case_status ===
                          "executed"
                            ? "Recovery action executed successfully."
                            : "Action pending execution."}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default Invoices;
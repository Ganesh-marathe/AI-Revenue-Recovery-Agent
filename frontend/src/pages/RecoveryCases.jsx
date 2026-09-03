import React, { useEffect, useState } from "react";
import { getRevenueRisk, getCustomers } from "../services/api";

function RecoveryCases() {
  const [cases, setCases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      setCases(riskData?.cases || []);
      setCustomers(customerData?.customers || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load recovery cases.");
    } finally {
      setLoading(false);
    }
  }

  function getCustomerName(customerId) {
    const customer = customers.find(
      (item) => item.id === customerId
    );

    return customer
      ? customer.name
      : `Customer #${customerId}`;
  }

  function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  }

  function getAction(status) {
    if (status === "failed") {
      return "Retry Payment";
    }

    if (status === "pending") {
      return "Payment Reminder";
    }

    return "Monitor";
  }

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="spinner"></div>
        <h2>Loading Recovery Cases...</h2>
        <p>Fetching live revenue risk data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-state error-state">
        <h2>Unable to Load Cases</h2>
        <p>{error}</p>

        <button
          className="primary-button"
          onClick={loadCases}
        >
          Retry
        </button>
      </div>
    );
  }

  const highRisk = cases.filter(
    (item) =>
      String(item.risk_level).toUpperCase() === "HIGH"
  ).length;

  const mediumRisk = cases.filter(
    (item) =>
      String(item.risk_level).toUpperCase() === "MEDIUM"
  ).length;

  const totalRisk = cases.reduce(
    (sum, item) =>
      sum + Number(item.revenue_at_risk || 0),
    0
  );

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <section className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            REVENUE RECOVERY OPERATIONS
          </span>

          <h1>Recovery Cases</h1>

          <p>
            Monitor revenue risk and AI recommended
            recovery actions.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="secondary-button"
            onClick={loadCases}
          >
            ↻ Refresh
          </button>
        </div>
      </section>

      {/* SUMMARY */}

      <section className="kpi-grid">

        <div className="kpi-card">
          <div className="kpi-icon blue">
            ▣
          </div>

          <div className="kpi-content">
            <span>Total Risk Cases</span>
            <strong>{cases.length}</strong>
            <small>Invoices requiring attention</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            !
          </div>

          <div className="kpi-content">
            <span>High Risk</span>
            <strong>{highRisk}</strong>
            <small>Immediate attention</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            ↓
          </div>

          <div className="kpi-content">
            <span>Medium Risk</span>
            <strong>{mediumRisk}</strong>
            <small>Follow-up recommended</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            ₹
          </div>

          <div className="kpi-content">
            <span>Revenue At Risk</span>
            <strong>{formatCurrency(totalRisk)}</strong>
            <small>Potential recovery</small>
          </div>
        </div>

      </section>

      {/* TABLE */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>Active Recovery Cases</h2>
            <p>
              Live cases generated from revenue risk analysis.
            </p>
          </div>

          <span className="live-label">
            ● LIVE
          </span>
        </div>

        <div className="cases-table-wrapper">

          <table className="cases-table">

            <thead>
              <tr>
                <th>Case ID</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Risk</th>
                <th>Payment</th>
                <th>AI Action</th>
              </tr>
            </thead>

            <tbody>

              {cases.map((item) => (
                <tr key={item.invoice_id}>

                  <td>
                    <strong>
                      RC-
                      {String(item.invoice_id).padStart(
                        4,
                        "0"
                      )}
                    </strong>
                  </td>

                  <td>
                    INV-{item.invoice_id}
                  </td>

                  <td>
                    <strong>
                      {getCustomerName(item.customer_id)}
                    </strong>
                  </td>

                  <td>
                    {formatCurrency(item.invoice_amount)}
                  </td>

                  <td>
                    <span
                      className={`risk-badge ${String(
                        item.risk_level
                      ).toLowerCase()}`}
                    >
                      {item.risk_level}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`payment-status ${String(
                        item.payment_status
                      ).toLowerCase()}`}
                    >
                      {item.payment_status}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {getAction(item.payment_status)}
                    </strong>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default RecoveryCases;
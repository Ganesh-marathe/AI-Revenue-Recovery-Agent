import React, { useEffect, useState } from "react";
import { getRevenueRisk, getCustomers } from "../services/api";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      setError("");

      const [riskData, customerData] = await Promise.all([
        getRevenueRisk(),
        getCustomers(),
      ]);

      setInvoices(riskData?.cases || []);
      setCustomers(customerData?.customers || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load invoices.");
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

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="spinner"></div>
        <h2>Loading Invoices...</h2>
        <p>Fetching invoice and payment information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-state error-state">
        <h2>Unable to Load Invoices</h2>
        <p>{error}</p>

        <button
          className="primary-button"
          onClick={loadInvoices}
        >
          Retry
        </button>
      </div>
    );
  }

  const totalInvoices = invoices.length;

  const failedInvoices = invoices.filter(
    (item) => item.payment_status === "failed"
  ).length;

  const pendingInvoices = invoices.filter(
    (item) => item.payment_status === "pending"
  ).length;

  const totalRisk = invoices.reduce(
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
            REVENUE OPERATIONS
          </span>

          <h1>Invoices</h1>

          <p>
            Monitor invoice amounts, payment status and
            revenue risk.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadInvoices}
        >
          ↻ Refresh
        </button>
      </section>

      {/* KPI CARDS */}

      <section className="kpi-grid">

        <div className="kpi-card">
          <div className="kpi-icon blue">▤</div>

          <div className="kpi-content">
            <span>Total Invoices</span>
            <strong>{totalInvoices}</strong>
            <small>Invoices under monitoring</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">!</div>

          <div className="kpi-content">
            <span>Failed Payments</span>
            <strong>{failedInvoices}</strong>
            <small>Require retry action</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">↓</div>

          <div className="kpi-content">
            <span>Pending Payments</span>
            <strong>{pendingInvoices}</strong>
            <small>Require follow-up</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">₹</div>

          <div className="kpi-content">
            <span>Revenue At Risk</span>
            <strong>{formatCurrency(totalRisk)}</strong>
            <small>Potential recovery</small>
          </div>
        </div>

      </section>

      {/* INVOICE TABLE */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>Invoice Monitoring</h2>
            <p>
              Live invoice risk information from ReviveAI.
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
                <th>Invoice</th>
                <th>Customer</th>
                <th>Invoice Amount</th>
                <th>Payment</th>
                <th>Revenue Risk</th>
                <th>Risk Level</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((item) => (
                <tr key={item.invoice_id}>

                  <td>
                    <strong>
                      INV-{item.invoice_id}
                    </strong>
                  </td>

                  <td>
                    {getCustomerName(item.customer_id)}
                  </td>

                  <td>
                    {formatCurrency(item.invoice_amount)}
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
                      {formatCurrency(item.revenue_at_risk)}
                    </strong>
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

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default Invoices;
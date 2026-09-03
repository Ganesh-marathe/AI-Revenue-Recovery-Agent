import React, { useEffect, useState } from "react";
import { getRevenueRisk } from "../services/api";

function AIInsights() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      const data = await getRevenueRisk();
      setCases(data?.cases || []);
    } catch (error) {
      console.error("AI Insights error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="spinner"></div>
        <h2>Loading AI Insights...</h2>
        <p>Analyzing revenue recovery opportunities.</p>
      </div>
    );
  }

  const highRisk = cases.filter(
    (item) =>
      String(item.risk_level).toUpperCase() === "HIGH"
  );

  const mediumRisk = cases.filter(
    (item) =>
      String(item.risk_level).toUpperCase() === "MEDIUM"
  );

  const failedPayments = cases.filter(
    (item) => item.payment_status === "failed"
  );

  const pendingPayments = cases.filter(
    (item) => item.payment_status === "pending"
  );

  const totalRisk = cases.reduce(
    (sum, item) => sum + Number(item.revenue_at_risk || 0),
    0
  );

  const currency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <section className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            AI-POWERED OPERATIONS
          </span>

          <h1>AI Insights</h1>

          <p>
            Intelligent recommendations to maximize revenue
            recovery.
          </p>
        </div>

        <span className="ai-label">
          ✦ AI POWERED
        </span>
      </section>

      {/* AI SUMMARY */}

      <section className="kpi-grid">

        <div className="kpi-card">
          <div className="kpi-icon orange">!</div>

          <div className="kpi-content">
            <span>High Priority</span>
            <strong>{highRisk.length}</strong>
            <small>Immediate action required</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">↓</div>

          <div className="kpi-content">
            <span>Medium Priority</span>
            <strong>{mediumRisk.length}</strong>
            <small>Follow-up recommended</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">!</div>

          <div className="kpi-content">
            <span>Failed Payments</span>
            <strong>{failedPayments.length}</strong>
            <small>Retry recommended</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">₹</div>

          <div className="kpi-content">
            <span>Revenue Opportunity</span>
            <strong>{currency(totalRisk)}</strong>
            <small>Potential recovery</small>
          </div>
        </div>

      </section>

      {/* AI RECOMMENDATIONS */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>AI Recovery Recommendations</h2>
            <p>
              Recommendations generated from payment risk
              analysis.
            </p>
          </div>

          <span className="live-label">
            ● LIVE
          </span>
        </div>

        <div className="ai-grid">

          <div className="ai-box high">
            <span className="ai-priority">
              HIGH PRIORITY
            </span>

            <h3>Retry Failed Payments</h3>

            <p>
              {failedPayments.length} failed payment
              {failedPayments.length !== 1 ? "s" : ""} detected.
              Retry the payment and notify the customer.
            </p>

            <strong>
              Recovery opportunity:{" "}
              {currency(
                failedPayments.reduce(
                  (sum, item) =>
                    sum + Number(item.revenue_at_risk || 0),
                  0
                )
              )}
            </strong>

            <button>
              Execute Action →
            </button>
          </div>

          <div className="ai-box medium">
            <span className="ai-priority">
              MEDIUM PRIORITY
            </span>

            <h3>Send Payment Reminders</h3>

            <p>
              {pendingPayments.length} pending payment
              {pendingPayments.length !== 1 ? "s" : ""} require
              customer follow-up.
            </p>

            <strong>
              Recovery opportunity:{" "}
              {currency(
                pendingPayments.reduce(
                  (sum, item) =>
                    sum + Number(item.revenue_at_risk || 0),
                  0
                )
              )}
            </strong>

            <button>
              Review Cases →
            </button>
          </div>

          <div className="ai-box low">
            <span className="ai-priority">
              LOW PRIORITY
            </span>

            <h3>Continue Monitoring</h3>

            <p>
              Continue monitoring payment behavior and
              automatically identify new recovery opportunities.
            </p>

            <strong>
              AI Monitoring Active
            </strong>

            <button>
              View Details →
            </button>
          </div>

        </div>

      </section>

      {/* INSIGHT TABLE */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>AI Case Analysis</h2>
            <p>
              Risk-based action recommendations.
            </p>
          </div>
        </div>

        <div className="cases-table-wrapper">

          <table className="cases-table">

            <thead>
              <tr>
                <th>Invoice</th>
                <th>Risk</th>
                <th>Payment</th>
                <th>Revenue Risk</th>
                <th>AI Recommendation</th>
              </tr>
            </thead>

            <tbody>
              {cases.map((item) => {

                const action =
                  item.payment_status === "failed"
                    ? "Retry Payment"
                    : item.payment_status === "pending"
                    ? "Payment Reminder"
                    : "Monitor";

                return (
                  <tr key={item.invoice_id}>

                    <td>
                      <strong>
                        INV-{item.invoice_id}
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
                      {currency(item.revenue_at_risk)}
                    </td>

                    <td>
                      <strong>{action}</strong>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default AIInsights;
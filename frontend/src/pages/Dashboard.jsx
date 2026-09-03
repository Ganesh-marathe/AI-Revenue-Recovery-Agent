import React, { useEffect, useState } from "react";

import {
  getDashboardSummary,
  getRevenueRisk,
  getAuditLogs,
  getCustomers,
} from "../services/api";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [riskCases, setRiskCases] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [revenueRiskTotal, setRevenueRiskTotal] = useState(0);
  const loadDashboard = async () => {
  try {
    setLoading(true);
    setError("");

  const [

    
  summaryData,
  riskData,
  auditData,
  customerData,
] = await Promise.all([
  getDashboardSummary(),
  getRevenueRisk(),
  getAuditLogs(),
  getCustomers(),
]);
    setSummary(summaryData);

    const cases = Array.isArray(riskData)
      ? riskData
      : riskData?.cases || [];

    setRiskCases(cases);
    setRevenueRiskTotal(Number(riskData?.total_revenue_at_risk || 0));
    setAuditLogs(auditData?.logs || []);
    setCustomers(customerData?.customers || []);

  } catch (err) {
    console.error("Dashboard error:", err);
    setError(
      "Unable to connect to the ReviveAI backend."
    );
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
  loadDashboard();
}, []);

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="spinner"></div>
        <h2>Loading ReviveAI...</h2>
        <p>
          Connecting to Revenue Recovery Intelligence
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-state error-state">
        <h2>Backend Connection Failed</h2>
        <p>{error}</p>

        <button
          className="primary-button"
          onClick={loadDashboard}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const totalCases = Number(summary?.total_cases || 0);
  const totalRiskCases = riskCases.length;

  const openCases = Number(summary?.open_cases || 0);

  const executedCases = Number(
    summary?.executed_cases || 0
  );

  const revenueAtRisk = revenueRiskTotal;

  const highRiskCases = riskCases.filter(
    (item) =>
      String(item.risk_level || "").toUpperCase() === "HIGH"
  ).length;

  const mediumRiskCases = riskCases.filter(
    (item) =>
      String(item.risk_level || "").toUpperCase() ===
      "MEDIUM"
  ).length;

  const lowRiskCases = riskCases.filter(
    (item) =>
      String(item.risk_level || "").toUpperCase() === "LOW"
  ).length;

  const recoveryRate =
    totalCases > 0
      ? Math.round((executedCases / totalCases) * 100)
      : 0;

  const getCustomerName = (customerId) => {
  const customer = customers.find(
    (item) => item.id === customerId
  );

  return customer
    ? customer.name
    : `Customer #${customerId}`;
};
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <section className="dashboard-header">

        <div>
          <span className="dashboard-eyebrow">
            AI-POWERED OPERATIONS
          </span>

          <h1>
            Good evening, Admin 👋
          </h1>

          <p>
            Monitor revenue risk, automate recovery actions,
            and maximize recovered revenue with AI.
          </p>
        </div>

        <div className="dashboard-actions">

          <button
            className="secondary-button"
            onClick={loadDashboard}
          >
            ↻ Refresh
          </button>

          <button className="primary-button">
            + Create Recovery Case
          </button>

        </div>

      </section>

      {/* KPI CARDS */}

      <section className="kpi-grid">

        <KpiCard
          icon="▣"
          title="Total Cases"
          value={totalCases}
          subtitle="Recovery cases"
          type="blue"
        />

        <KpiCard
          icon="!"
          title="Open Cases"
          value={openCases}
          subtitle={
            openCases > 0
              ? "Need attention"
              : "No critical open cases"
          }
          type="orange"
        />

        <KpiCard
          icon="ϟ"
          title="Actions Executed"
          value={executedCases}
          subtitle={`${recoveryRate}% execution rate`}
          type="green"
        />

        <KpiCard
          icon="₹"
          title="Revenue At Risk"
          value={formatCurrency(revenueAtRisk)}
          subtitle="Potential recovery"
          type="purple"
        />

      </section>

      {/* CHART ROW */}

      <section className="dashboard-two-column">

        {/* RISK OVERVIEW */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Revenue Risk Overview</h2>
              <p>Cases by risk severity</p>
            </div>

            <span className="live-label">
              ● LIVE
            </span>

          </div>

          <div className="risk-layout">

            <div className="risk-list">

              <RiskRow
                label="HIGH RISK"
                value={highRiskCases}
                total={totalRiskCases}
                type="high"
              />

              <RiskRow
                label="MEDIUM RISK"
                value={mediumRiskCases}
                total={totalRiskCases}
                type="medium"
              />

              <RiskRow
                label="LOW RISK"
                value={lowRiskCases}
                total={totalRiskCases}
                type="low"
              />

            </div>

            <div className="risk-donut">

              <div className="donut-center">
                <strong>{totalRiskCases}</strong>
                <span>Risk Cases</span>
              </div>

            </div>

          </div>

          <div className="risk-summary">

            <div>
              <span>Total Revenue At Risk</span>
              <strong className="danger-text">
                {formatCurrency(revenueAtRisk)}
              </strong>
            </div>

            <div>
              <span>Potential Recovery</span>
              <strong className="success-text">
                {formatCurrency(revenueAtRisk)}
              </strong>
            </div>

          </div>

        </div>

        {/* RECOVERY PERFORMANCE */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Recovery Performance</h2>
              <p>
                Current recovery execution performance
              </p>
            </div>

            <span className="period-label">
              Current
            </span>

          </div>

          <div className="performance">

            <div className="performance-number">
              {recoveryRate}
              <small>%</small>
            </div>

            <p>Recovery Rate</p>

            <div className="performance-bar">
              <div
                style={{
                  width: `${recoveryRate}%`,
                }}
              ></div>
            </div>

            <div className="performance-stats">

              <div>
                <strong>{executedCases}</strong>
                <span>Executed</span>
              </div>

              <div>
                <strong>{openCases}</strong>
                <span>Open</span>
              </div>

              <div>
                <strong>{totalCases}</strong>
                <span>Total</span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* AI RECOVERY INTELLIGENCE */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>AI Recovery Intelligence</h2>

            <p>
              AI-powered recommendations for
              high-impact recovery opportunities.
            </p>
          </div>

          <span className="ai-label">
            ✦ AI POWERED
          </span>

        </div>

        <div className="ai-grid">

          <AIBox
            type="high"
            title="High Priority"
            count={highRiskCases}
            message="Immediate recovery attention required."
            button="Execute Action"
          />

          <AIBox
            type="medium"
            title="Medium Priority"
            count={mediumRiskCases}
            message="Payment follow-up recommended."
            button="Review Cases"
          />

          <AIBox
            type="low"
            title="Low Priority"
            count={lowRiskCases}
            message="Continue monitoring payment behavior."
            button="View Details"
          />

        </div>

      </section>


{/* RECENT RECOVERY CASES */}

<section className="dashboard-card">

  <div className="card-header">

    <div>
      <h2>Recent Recovery Cases</h2>

      <p>
        Live revenue risk cases from ReviveAI
      </p>
    </div>

    <button className="view-all-button">
      View All →
    </button>

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
  {riskCases.slice(0, 5).map((item) => (
    <tr key={item.invoice_id}>

      <td>
        RC-{String(item.invoice_id).padStart(4, "0")}
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
        ₹{Number(item.invoice_amount || 0).toLocaleString("en-IN")}
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
        {item.payment_status === "failed"
          ? "Retry Payment"
          : item.payment_status === "pending"
          ? "Payment Reminder"
          : "Monitor"}
      </td>

    </tr>
  ))}
</tbody>

    </table>

  </div>

</section>
{/* AI ACTIVITY + RECOVERY FUNNEL */}

<section className="dashboard-two-column">

  {/* AI ACTIVITY */}

  <div className="dashboard-card">

    <div className="card-header">

      <div>
        <h2>AI Activity</h2>

        <p>
          Latest AI recovery actions
        </p>
      </div>

      <span className="ai-label">
        ✦ LIVE
      </span>

    </div>

    <div className="activity-list">

      {auditLogs.length === 0 ? (

        <div className="empty-activity">
          No AI activity yet.
        </div>

      ) : (

        auditLogs.slice(0, 5).map((log) => (

          <div
            className="activity-item"
            key={log.log_id}
          >

            <div className="activity-icon">
              ⚡
            </div>

            <div className="activity-content">

              <strong>
                Recovery action executed
              </strong>

              <p>
                {log.message}
              </p>

              <small>
                Case #{log.case_id} •{" "}
                {log.action}
              </small>

            </div>

            <span className="activity-status">
              {log.status}
            </span>

          </div>

        ))

      )}

    </div>

  </div>

{auditLogs.map((log) => (
  <div className="activity-item" key={log.log_id}>

    <div className="activity-icon">
      ⚡
    </div>

    <div className="activity-content">
      <strong>
        Recovery action executed
      </strong>

      <p>
        {log.message}
      </p>

      <small>
        Case #{log.case_id} · {log.action}
      </small>
    </div>

    <span className="activity-status">
      {log.status}
    </span>

  </div>
))}


  {/* RECOVERY FUNNEL */}

  <div className="dashboard-card">

    <div className="card-header">

      <div>
        <h2>Recovery Funnel</h2>

        <p>
          Revenue recovery pipeline
        </p>
      </div>

    </div>

    <div className="funnel">

      <FunnelRow
        label="Invoices At Risk"
        value={riskCases.length}
        icon="▣"
      />

      <FunnelRow
        label="High Risk"
        value={highRiskCases}
        icon="⚠"
      />

      <FunnelRow
        label="Medium Risk"
        value={mediumRiskCases}
        icon="↓"
      />

      <FunnelRow
        label="Recovery Actions"
        value={auditLogs.length}
        icon="⚡"
      />

      <FunnelRow
        label="Executed"
        value={executedCases}
        icon="✓"
      />

    </div>

  </div>

</section>

<section className="dashboard-card">

  <div className="card-header">
    <div>
      <h2>Recovery Funnel</h2>
      <p>Current revenue recovery pipeline</p>
    </div>
  </div>

  <div className="funnel">

    <FunnelRow
      label="Invoices At Risk"
      value={riskCases.length}
      icon="▣"
    />

    <FunnelRow
      label="High Risk"
      value={highRiskCases}
      icon="⚠"
    />

    <FunnelRow
      label="Medium Risk"
      value={mediumRiskCases}
      icon="↓"
    />

    <FunnelRow
      label="Recovery Actions"
      value={auditLogs.length}
      icon="⚡"
    />

    <FunnelRow
      label="Executed"
      value={executedCases}
      icon="✓"
    />

  </div>

</section>

      {/* QUICK SUMMARY */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>Revenue Recovery Summary</h2>
            <p>Live financial recovery position</p>
          </div>

        </div>

        <div className="summary-grid">

          <SummaryItem
            label="Revenue At Risk"
            value={formatCurrency(revenueAtRisk)}
            type="danger"
          />

          <SummaryItem
            label="Revenue Recovered"
            value={
              formatCurrency(
                executedCases > 0
                  ? revenueAtRisk
                  : 0
              )
            }
            type="success"
          />

          <SummaryItem
            label="Pending Recovery"
            value={formatCurrency(
              openCases > 0 ? revenueAtRisk : 0
            )}
            type="warning"
          />

          <SummaryItem
            label="Recovery Rate"
            value={`${recoveryRate}%`}
            type="blue"
          />

        </div>

      </section>

    </div>
  );
}


/* KPI CARD */

function KpiCard({
  icon,
  title,
  value,
  subtitle,
  type,
}) {
  return (
    <div className="kpi-card">

      <div className={`kpi-icon ${type}`}>
        {icon}
      </div>

      <div className="kpi-content">

        <span>{title}</span>

        <strong>{value}</strong>

        <small>{subtitle}</small>

      </div>

      <div className={`mini-chart ${type}`}>
        ╱╲╱╲╱╲
      </div>

    </div>
  );
}


/* RISK ROW */

function RiskRow({
  label,
  value,
  total,
  type,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div className="risk-row">

      <div className="risk-row-header">

        <span className={`risk-dot ${type}`}></span>

        <strong>{label}</strong>

        <span>{value} cases</span>

      </div>

      <div className="risk-progress">

        <div
          className={type}
          style={{
            width: `${percentage}%`,
          }}
        ></div>

      </div>

      <small>
        {percentage}% of cases
      </small>

    </div>
  );
}
function FunnelRow({
  label,
  value,
  icon,
}) {
  return (
    <div className="funnel-row">

      <div className="funnel-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

/* AI BOX */

function AIBox({
  type,
  title,
  count,
  message,
  button,
}) {
  return (
    <div className={`ai-box ${type}`}>

      <span className="ai-priority">
        {title}
      </span>

      <h3>
        {count} {count === 1 ? "case" : "cases"}
      </h3>

      <p>{message}</p>

      <button>{button} →</button>

    </div>
  );
}


/* SUMMARY */

function SummaryItem({
  label,
  value,
  type,
}) {
  return (
    <div className="summary-item">

      <span>{label}</span>

      <strong className={`${type}-text`}>
        {value}
      </strong>

    </div>
  );
}

export default Dashboard;
import React, { useEffect, useMemo, useState } from "react";
import {
  getDashboardSummary,
  getRevenueRisk,
  getAuditLogs,
  getCustomers,
} from "../services/api";

import "./Dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [riskCases, setRiskCases] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadDashboard = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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

      setSummary(summaryData || {});

      const cases = Array.isArray(riskData)
        ? riskData
        : riskData?.cases || [];

      setRiskCases(cases);

      const logs = Array.isArray(auditData)
        ? auditData
        : auditData?.logs || [];

      setAuditLogs(logs);

      const customerList = Array.isArray(customerData)
        ? customerData
        : customerData?.customers || [];

      setCustomers(customerList);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err?.message ||
          "Unable to connect to the ReviveAI backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      }
    )}`;
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(
      (item) =>
        Number(item.id) === Number(customerId)
    );

    return customer?.name || `Customer #${customerId}`;
  };

  const formatDate = (date) => {
    if (!date) return "Just now";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Recently";
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const riskClass = (risk) => {
    const value = String(risk || "").toLowerCase();

    if (value === "high") return "high";
    if (value === "medium") return "medium";
    if (value === "low") return "low";

    return "unknown";
  };

  const paymentClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "success") return "success";
    if (value === "failed") return "failed";
    if (value === "pending") return "pending";

    return "unknown";
  };

  const getAction = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "failed") {
      return "Retry Payment";
    }

    if (value === "pending") {
      return "Payment Reminder";
    }

    if (value === "success") {
      return "Monitor";
    }

    return "Review";
  };

  // =========================================================
  // METRICS
  // =========================================================

  const metrics = useMemo(() => {
    const totalCases = Number(
      summary?.total_cases || 0
    );

    const openCases = Number(
      summary?.open_cases || 0
    );

    const executedCases = Number(
      summary?.executed_cases || 0
    );

    const revenueAtRisk =
      Number(
        summary?.total_revenue_at_risk || 0
      ) ||
      riskCases.reduce(
        (sum, item) =>
          sum +
          Number(item.revenue_at_risk || 0),
        0
      );

    const highRiskCases = riskCases.filter(
      (item) =>
        String(item.risk_level || "")
          .toUpperCase() === "HIGH"
    ).length;

    const mediumRiskCases = riskCases.filter(
      (item) =>
        String(item.risk_level || "")
          .toUpperCase() === "MEDIUM"
    ).length;

    const lowRiskCases = riskCases.filter(
      (item) =>
        String(item.risk_level || "")
          .toUpperCase() === "LOW"
    ).length;

    const totalRiskCases = riskCases.length;

    const executionRate =
      totalCases > 0
        ? Math.round(
            (executedCases / totalCases) * 100
          )
        : 0;

    const recoveredRevenue = riskCases.reduce(
      (sum, item) => {
        if (
          String(item.payment_status || "")
            .toLowerCase() === "success"
        ) {
          return (
            sum +
            Number(item.payment_amount || 0)
          );
        }

        return sum;
      },
      0
    );

    const pendingRecovery = Math.max(
      revenueAtRisk - recoveredRevenue,
      0
    );

    return {
      totalCases,
      openCases,
      executedCases,
      revenueAtRisk,
      highRiskCases,
      mediumRiskCases,
      lowRiskCases,
      totalRiskCases,
      executionRate,
      recoveredRevenue,
      pendingRecovery,
    };
  }, [summary, riskCases]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="ra-dashboard-state">
        <div className="ra-spinner"></div>

        <h2>Loading ReviveAI...</h2>

        <p>
          Connecting to Revenue Recovery Intelligence
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="ra-dashboard-state ra-error-state">
        <div className="ra-error-icon">!</div>

        <h2>Backend Connection Failed</h2>

        <p>{error}</p>

        <button
          className="ra-primary-button"
          onClick={() => loadDashboard()}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // =========================================================
  // DONUT
  // =========================================================

  const highPercent =
    metrics.totalRiskCases > 0
      ? (metrics.highRiskCases /
          metrics.totalRiskCases) *
        100
      : 0;

  const mediumPercent =
    metrics.totalRiskCases > 0
      ? (metrics.mediumRiskCases /
          metrics.totalRiskCases) *
        100
      : 0;

  const donutStyle =
    metrics.totalRiskCases > 0
      ? {
          background: `conic-gradient(
            #ef4444 0% ${highPercent}%,
            #f97316 ${highPercent}% ${
              highPercent + mediumPercent
            }%,
            #16a34a ${
              highPercent + mediumPercent
            }% 100%
          )`,
        }
      : {
          background: "#e2e8f0",
        };

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="ra-dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="ra-dashboard-header">

        <div>
          <span className="ra-eyebrow">
            AI-POWERED OPERATIONS
          </span>

          <h1>
            Good evening, Ganesh 👋
          </h1>

          <p>
            Monitor revenue risk, automate recovery
            actions, and maximize recovered revenue
            with AI.
          </p>
        </div>

        <div className="ra-header-actions">

          <button
            className="ra-secondary-button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              "Refreshing..."
            ) : (
              <>
                ↻ Refresh
              </>
            )}
          </button>

          <button className="ra-primary-button">
            + Create Recovery Case
          </button>

        </div>

      </section>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section className="ra-kpi-grid">

        <KpiCard
          icon="▣"
          title="Total Recovery Cases"
          value={metrics.totalCases}
          subtitle="Active recovery portfolio"
          type="blue"
          trend="↑ 12% from last month"
        />

        <KpiCard
          icon="!"
          title="Open Cases"
          value={metrics.openCases}
          subtitle="Need attention"
          type="orange"
          trend="↓ 33% from last month"
        />

        <KpiCard
          icon="✓"
          title="Actions Executed"
          value={metrics.executedCases}
          subtitle={`${metrics.executionRate}% execution rate`}
          type="green"
          trend="↑ 40% from last month"
        />

        <KpiCard
          icon="₹"
          title="Revenue At Risk"
          value={formatCurrency(
            metrics.revenueAtRisk
          )}
          subtitle="Potential recovery"
          type="purple"
          trend="↓ 18% from last month"
        />

      </section>

      {/* =====================================================
          RISK + RECOVERY PERFORMANCE
      ===================================================== */}

      <section className="ra-two-column">

        {/* RISK */}

        <div className="ra-card">

          <div className="ra-card-header">

            <div>
              <h2>
                Revenue Risk Overview
              </h2>

              <p>
                Cases by risk severity
              </p>
            </div>

            <span className="ra-live">
              ● LIVE
            </span>

          </div>

          <div className="ra-risk-content">

            <div className="ra-donut-wrap">

              <div
                className="ra-donut"
                style={donutStyle}
              >
                <div className="ra-donut-inner">

                  <strong>
                    {metrics.totalRiskCases}
                  </strong>

                  <span>
                    At-Risk
                  </span>

                </div>
              </div>

            </div>

            <div className="ra-risk-list">

              <RiskItem
                color="red"
                title="High Risk"
                count={metrics.highRiskCases}
                total={metrics.totalRiskCases}
              />

              <RiskItem
                color="orange"
                title="Medium Risk"
                count={metrics.mediumRiskCases}
                total={metrics.totalRiskCases}
              />

              <RiskItem
                color="green"
                title="Low Risk"
                count={metrics.lowRiskCases}
                total={metrics.totalRiskCases}
              />

            </div>

          </div>

          <div className="ra-risk-summary">

            <div className="ra-risk-money danger">
              <span>
                Total Revenue At Risk
              </span>

              <strong>
                {formatCurrency(
                  metrics.revenueAtRisk
                )}
              </strong>
            </div>

            <div className="ra-risk-money success">
              <span>
                Potential Recovery
              </span>

              <strong>
                {formatCurrency(
                  metrics.pendingRecovery
                )}
              </strong>
            </div>

          </div>

        </div>

        {/* RECOVERY PERFORMANCE */}

        <div className="ra-card">

          <div className="ra-card-header">

            <div>
              <h2>
                Recovery Performance
              </h2>

              <p>
                Current recovery execution performance
              </p>
            </div>

            <span className="ra-period">
              Current
            </span>

          </div>

          <div className="ra-performance-layout">

            <div className="ra-performance-donut">

              <div
                className="ra-performance-ring"
                style={{
                  background: `conic-gradient(
                    #16a34a 0% ${metrics.executionRate}%,
                    #e2e8f0 ${metrics.executionRate}% 100%
                  )`,
                }}
              >
                <div className="ra-performance-inner">

                  <strong>
                    {metrics.executionRate}%
                  </strong>

                  <span>
                    Execution Rate
                  </span>

                </div>
              </div>

            </div>

            <div className="ra-performance-stats">

              <div className="ra-performance-stat">
                <span className="green-dot"></span>

                <div>
                  <strong>
                    {metrics.executedCases}
                  </strong>

                  <span>
                    Executed
                  </span>
                </div>
              </div>

              <div className="ra-performance-stat">
                <span className="blue-dot"></span>

                <div>
                  <strong>
                    {metrics.openCases}
                  </strong>

                  <span>
                    Open
                  </span>
                </div>
              </div>

              <div className="ra-performance-stat">
                <span className="gray-dot"></span>

                <div>
                  <strong>
                    {metrics.totalCases}
                  </strong>

                  <span>
                    Total
                  </span>
                </div>
              </div>

            </div>

          </div>

          <div className="ra-performance-bar-wrap">

            <div className="ra-performance-bar">

              <div
                style={{
                  width: `${Math.min(
                    metrics.executionRate,
                    100
                  )}%`,
                }}
              ></div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          AI RECOVERY INTELLIGENCE
      ===================================================== */}

      <section className="ra-card">

        <div className="ra-card-header">

          <div>
            <h2>
              AI Recovery Intelligence
            </h2>

            <p>
              AI-powered recommendations for
              high-impact recovery opportunities.
            </p>
          </div>

          <button className="ra-insight-button">
            View All Insights
          </button>

        </div>

        <div className="ra-ai-grid">

          <AIBox
            type="high"
            title="High Priority"
            count={metrics.highRiskCases}
            message="Immediate recovery attention required."
            button="Execute Actions"
          />

          <AIBox
            type="medium"
            title="Medium Priority"
            count={metrics.mediumRiskCases}
            message="Payment follow-up recommended."
            button="Review Cases"
          />

          <AIBox
            type="low"
            title="Low Priority"
            count={metrics.lowRiskCases}
            message="Continue monitoring payment behavior."
            button="View Details"
          />

        </div>

      </section>

      {/* =====================================================
          RECENT RECOVERY CASES
      ===================================================== */}

      <section className="ra-card">

        <div className="ra-card-header">

          <div>
            <h2>
              Recent Recovery Cases
            </h2>

            <p>
              Latest cases with status and AI
              recommendations
            </p>
          </div>

          <button className="ra-view-button">
            View All
          </button>

        </div>

        <div className="ra-table-wrapper">

          <table className="ra-table">

            <thead>
              <tr>
                <th>Case ID</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Risk</th>
                <th>Status</th>
                <th>AI Action</th>
              </tr>
            </thead>

            <tbody>

              {riskCases.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="ra-empty"
                  >
                    No recovery cases available.
                  </td>
                </tr>

              ) : (

                riskCases
                  .slice(0, 5)
                  .map((item, index) => {

                    const status =
                      String(
                        item.payment_status || ""
                      ).toLowerCase();

                    return (
                      <tr
                        key={
                          item.invoice_id ||
                          index
                        }
                      >

                        <td>
                          <strong>
                            RC-
                            {String(
                              item.invoice_id ||
                                index + 1
                            ).padStart(3, "0")}
                          </strong>
                        </td>

                        <td>
                          INV-
                          {item.invoice_id}
                        </td>

                        <td>
                          <div className="ra-customer">

                            <div className="ra-avatar">
                              {getCustomerName(
                                item.customer_id
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {getCustomerName(
                                item.customer_id
                              )}
                            </strong>

                          </div>
                        </td>

                        <td>
                          {formatCurrency(
                            item.invoice_amount
                          )}
                        </td>

                        <td>
                          <span
                            className={`ra-badge risk-${riskClass(
                              item.risk_level
                            )}`}
                          >
                            {item.risk_level ||
                              "UNKNOWN"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`ra-badge payment-${paymentClass(
                              status
                            )}`}
                          >
                            {item.payment_status ||
                              "Unknown"}
                          </span>
                        </td>

                        <td>
                          <span className="ra-action-text">
                            {getAction(status)}
                          </span>
                        </td>

                      </tr>
                    );
                  })

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          ACTIVITY + FUNNEL
      ===================================================== */}

      <section className="ra-two-column">

        {/* AI ACTIVITY */}

        <div className="ra-card">

          <div className="ra-card-header">

            <div>
              <h2>
                AI Activity
              </h2>

              <p>
                Latest AI actions across all cases
              </p>
            </div>

            <span className="ra-live purple">
              ✦ LIVE
            </span>

          </div>

          <div className="ra-activity-list">

            {auditLogs.length === 0 ? (

              <div className="ra-empty-activity">
                No AI activity yet.
              </div>

            ) : (

              auditLogs
                .slice(0, 5)
                .map((log, index) => (

                  <div
                    className="ra-activity-item"
                    key={
                      log.log_id || index
                    }
                  >

                    <div className="ra-activity-icon">
                      ⚡
                    </div>

                    <div className="ra-activity-content">

                      <strong>
                        Recovery action executed
                      </strong>

                      <p>
                        {log.message ||
                          "Recovery action processed successfully."}
                      </p>

                      <small>
                        Case #{log.case_id}
                        {" • "}
                        {log.action}
                        {" • "}
                        {formatDate(
                          log.created_at
                        )}
                      </small>

                    </div>

                    <span className="ra-success-status">
                      {log.status || "Success"}
                    </span>

                  </div>

                ))

            )}

          </div>

        </div>

        {/* RECOVERY FUNNEL */}

        <div className="ra-card">

          <div className="ra-card-header">

            <div>
              <h2>
                Recovery Funnel
              </h2>

              <p>
                Current revenue recovery pipeline
              </p>
            </div>

          </div>

          <div className="ra-funnel">

            <FunnelStep
              icon="⚠"
              label="Invoices At Risk"
              value={metrics.totalRiskCases}
              type="red"
            />

            <FunnelArrow />

            <FunnelStep
              icon="◉"
              label="High Risk"
              value={metrics.highRiskCases}
              type="orange"
            />

            <FunnelArrow />

            <FunnelStep
              icon="↗"
              label="Recovery Actions"
              value={auditLogs.length}
              type="purple"
            />

            <FunnelArrow />

            <FunnelStep
              icon="✓"
              label="Executed"
              value={metrics.executedCases}
              type="green"
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          REVENUE SUMMARY
      ===================================================== */}

      <section className="ra-card">

        <div className="ra-card-header">

          <div>
            <h2>
              Revenue Recovery Summary
            </h2>

            <p>
              Key financial recovery metrics
            </p>
          </div>

        </div>

        <div className="ra-summary-grid">

          <SummaryBox
            icon="₹"
            label="Total At Risk"
            value={formatCurrency(
              metrics.revenueAtRisk
            )}
            type="danger"
          />

          <SummaryBox
            icon="✓"
            label="Recovered"
            value={formatCurrency(
              metrics.recoveredRevenue
            )}
            type="success"
          />

          <SummaryBox
            icon="!"
            label="Pending Recovery"
            value={formatCurrency(
              metrics.pendingRecovery
            )}
            type="warning"
          />

          <SummaryBox
            icon="↗"
            label="Execution Rate"
            value={`${metrics.executionRate}%`}
            type="blue"
          />

        </div>

      </section>

    </div>
  );
}

// =============================================================
// KPI CARD
// =============================================================

function KpiCard({
  icon,
  title,
  value,
  subtitle,
  type,
  trend,
}) {
  return (
    <div className="ra-kpi-card">

      <div
        className={`ra-kpi-icon ${type}`}
      >
        {icon}
      </div>

      <div className="ra-kpi-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {subtitle}
        </small>

        <em className={type}>
          {trend}
        </em>

      </div>

      <div className={`ra-mini-chart ${type}`}>
        ╱╲╱╲╱╲
      </div>

    </div>
  );
}

// =============================================================
// RISK ITEM
// =============================================================

function RiskItem({
  color,
  title,
  count,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round((count / total) * 100)
      : 0;

  return (
    <div className="ra-risk-item">

      <div className="ra-risk-item-header">

        <div>
          <span
            className={`ra-risk-dot ${color}`}
          ></span>

          <strong>
            {title}
          </strong>
        </div>

        <span>
          {count} cases
        </span>

      </div>

      <div className="ra-risk-progress">

        <div
          className={color}
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

// =============================================================
// AI BOX
// =============================================================

function AIBox({
  type,
  title,
  count,
  message,
  button,
}) {
  return (
    <div className={`ra-ai-box ${type}`}>

      <div className="ra-ai-box-top">

        <div className="ra-ai-symbol">
          {type === "high"
            ? "◎"
            : type === "medium"
            ? "!"
            : "◇"}
        </div>

        <span>
          {title}
        </span>

      </div>

      <h3>
        {count}{" "}
        {count === 1
          ? "case"
          : "cases"}
      </h3>

      <p>
        {message}
      </p>

      <button>
        {button} →
      </button>

    </div>
  );
}

// =============================================================
// FUNNEL
// =============================================================

function FunnelStep({
  icon,
  label,
  value,
  type,
}) {
  return (
    <div className="ra-funnel-step">

      <div
        className={`ra-funnel-icon ${type}`}
      >
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

function FunnelArrow() {
  return (
    <div className="ra-funnel-arrow">
      →
    </div>
  );
}

// =============================================================
// SUMMARY
// =============================================================

function SummaryBox({
  icon,
  label,
  value,
  type,
}) {
  return (
    <div className={`ra-summary-box ${type}`}>

      <div className="ra-summary-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  );
}

export default Dashboard;
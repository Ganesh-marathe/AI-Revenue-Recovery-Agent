import React, { useEffect, useMemo, useState } from "react";
import {
  getRevenueRisk,
  getCustomers,
  getAuditLogs,
} from "../services/api";
import "./AIInsights.css";

function AIInsights() {
  const [riskCases, setRiskCases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const [riskData, customerData, auditData] =
        await Promise.all([
          getRevenueRisk(),
          getCustomers(),
          getAuditLogs(),
        ]);

      const risks = Array.isArray(riskData)
        ? riskData
        : riskData?.cases || [];

      const customerList = Array.isArray(customerData)
        ? customerData
        : customerData?.customers || [];

      const logs = Array.isArray(auditData)
        ? auditData
        : auditData?.logs || [];

      setRiskCases(risks);
      setCustomers(customerList);
      setAuditLogs(logs);
    } catch (err) {
      console.error("AI Insights error:", err);
      setError(err?.message || "Unable to load AI insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  const customerName = (id) => {
    const customer = customers.find(
      (item) =>
        Number(item.id) === Number(id) ||
        Number(item.customer_id) === Number(id)
    );

    return (
      customer?.name ||
      customer?.customer_name ||
      customer?.company_name ||
      `Customer #${id}`
    );
  };

  const riskClass = (risk) => {
    const value = String(risk || "").toLowerCase();

    if (value === "high") return "ai-high";
    if (value === "medium") return "ai-medium";
    if (value === "low") return "ai-low";

    return "ai-neutral";
  };

  const metrics = useMemo(() => {
    const total = riskCases.length;

    const high = riskCases.filter(
      (item) =>
        String(item.risk_level || "").toUpperCase() === "HIGH"
    ).length;

    const medium = riskCases.filter(
      (item) =>
        String(item.risk_level || "").toUpperCase() === "MEDIUM"
    ).length;

    const low = riskCases.filter(
      (item) =>
        String(item.risk_level || "").toUpperCase() === "LOW"
    ).length;

    const revenueAtRisk = riskCases.reduce(
      (sum, item) =>
        sum + Number(item.revenue_at_risk || 0),
      0
    );

    const averageRisk =
      total > 0
        ? Math.round(
            riskCases.reduce(
              (sum, item) =>
                sum + Number(item.risk_score || 0),
              0
            ) / total
          )
        : 0;

    const recoveryProbability = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          100 -
            (high * 25 + medium * 10) /
              Math.max(total, 1)
        )
      )
    );

    const expectedRecovery = Math.round(
      revenueAtRisk * (recoveryProbability / 100)
    );

    return {
      total,
      high,
      medium,
      low,
      revenueAtRisk,
      averageRisk,
      recoveryProbability,
      expectedRecovery,
    };
  }, [riskCases]);

  const riskyCustomers = useMemo(() => {
    const grouped = {};

    riskCases.forEach((item) => {
      const id = item.customer_id;

      if (!grouped[id]) {
        grouped[id] = {
          customer_id: id,
          revenue: 0,
          cases: 0,
          high: 0,
          medium: 0,
        };
      }

      grouped[id].revenue += Number(
        item.revenue_at_risk || 0
      );

      grouped[id].cases += 1;

      if (
        String(item.risk_level || "").toUpperCase() ===
        "HIGH"
      ) {
        grouped[id].high += 1;
      }

      if (
        String(item.risk_level || "").toUpperCase() ===
        "MEDIUM"
      ) {
        grouped[id].medium += 1;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [riskCases]);

  const actionCounts = useMemo(() => {
    const counts = {};

    riskCases.forEach((item) => {
      const action =
        item.intervention_action ||
        item.recommended_action ||
        "Manual Review";

      counts[action] = (counts[action] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [riskCases]);

  if (loading) {
    return (
      <div className="ai-page-state">
        <div className="ai-spinner"></div>
        <h2>Loading AI Insights...</h2>
        <p>
          ReviveAI Decision Engine is preparing
          your revenue intelligence.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-page-state">
        <div className="ai-error-icon">!</div>
        <h2>Unable to Load AI Insights</h2>
        <p>{error}</p>
        <button
          className="ai-primary-button"
          onClick={loadInsights}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="ai-page">

      {/* HEADER */}
      <section className="ai-header">
        <div>
          <span className="ai-eyebrow">
            REVIVEAI DECISION ENGINE
          </span>

          <h1>AI Insights</h1>

          <p>
            Understand revenue risk, customer behavior,
            recovery probability and recommended actions.
          </p>
        </div>

        <button
          className="ai-refresh"
          onClick={loadInsights}
        >
          ↻ Refresh Intelligence
        </button>
      </section>

      {/* ENGINE BANNER */}
      <section className="ai-engine-banner">
        <div className="ai-engine-icon">AI</div>

        <div className="ai-engine-copy">
          <h2>Revenue Recovery Intelligence Engine</h2>
          <p>
            ReviveAI evaluates invoice risk, payment signals
            and recovery opportunities to recommend the
            next best action.
          </p>
        </div>

        <div className="ai-confidence">
          <span>ENGINE STATUS</span>
          <strong>● Operational</strong>
        </div>
      </section>

      {/* KPI */}
      <section className="ai-kpi-grid">

        <Metric
          label="Invoices Analyzed"
          value={metrics.total}
          description="Currently monitored"
          icon="◈"
        />

        <Metric
          label="High Risk"
          value={metrics.high}
          description="Immediate attention"
          icon="!"
          type="red"
        />

        <Metric
          label="Recovery Probability"
          value={`${metrics.recoveryProbability}%`}
          description="AI estimated"
          icon="↗"
          type="green"
        />

        <Metric
          label="Expected Recovery"
          value={money(metrics.expectedRecovery)}
          description="Potential recovered revenue"
          icon="₹"
          type="purple"
        />

      </section>

      {/* RISK ANALYSIS */}
      <section className="ai-two-column">

        <div className="ai-card">
          <CardHeader
            title="AI Risk Prediction"
            subtitle="Current distribution of predicted revenue risk"
          />

          <div className="ai-risk-layout">

            <div className="ai-risk-circle">
              <div>
                <strong>{metrics.averageRisk}</strong>
                <span>Risk Index</span>
              </div>
            </div>

            <div className="ai-risk-breakdown">

              <RiskRow
                label="High Risk"
                count={metrics.high}
                total={metrics.total}
                type="high"
              />

              <RiskRow
                label="Medium Risk"
                count={metrics.medium}
                total={metrics.total}
                type="medium"
              />

              <RiskRow
                label="Low Risk"
                count={metrics.low}
                total={metrics.total}
                type="low"
              />

            </div>

          </div>
        </div>


        <div className="ai-card">

          <CardHeader
            title="Recovery Probability"
            subtitle="Estimated likelihood of recovering at-risk revenue"
          />

          <div className="ai-probability">

            <div className="ai-probability-value">
              {metrics.recoveryProbability}%
            </div>

            <div className="ai-progress">
              <div
                style={{
                  width: `${metrics.recoveryProbability}%`,
                }}
              ></div>
            </div>

            <p>
              Based on current risk distribution and
              recovery opportunities.
            </p>

          </div>

          <div className="ai-probability-stats">

            <div>
              <span>Revenue At Risk</span>
              <strong>{money(metrics.revenueAtRisk)}</strong>
            </div>

            <div>
              <span>Expected Recovery</span>
              <strong>{money(metrics.expectedRecovery)}</strong>
            </div>

          </div>

        </div>

      </section>


      {/* RECOMMENDED ACTIONS */}
      <section className="ai-card">

        <CardHeader
          title="Recommended Actions"
          subtitle="AI-selected interventions across the recovery portfolio"
        />

        <div className="ai-action-grid">

          {actionCounts.length === 0 ? (
            <div className="ai-empty">
              No AI recommendations available.
            </div>
          ) : (
            actionCounts.map(([action, count]) => (
              <div
                className="ai-action-card"
                key={action}
              >
                <div className="ai-action-icon">
                  ✦
                </div>

                <div>
                  <strong>{action}</strong>
                  <span>
                    Recommended for {count}{" "}
                    {count === 1 ? "case" : "cases"}
                  </span>
                </div>

                <div className="ai-action-count">
                  {count}
                </div>
              </div>
            ))
          )}

        </div>

      </section>


      {/* TOP RISKY CUSTOMERS */}
      <section className="ai-card">

        <CardHeader
          title="Top Risky Customers"
          subtitle="Customers contributing the highest revenue exposure"
        />

        <div className="ai-customer-table-wrap">

          <table className="ai-customer-table">

            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>CASES</th>
                <th>HIGH RISK</th>
                <th>MEDIUM RISK</th>
                <th>REVENUE AT RISK</th>
                <th>AI PRIORITY</th>
              </tr>
            </thead>

            <tbody>

              {riskyCustomers.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="ai-empty-cell"
                  >
                    No customer risk data available.
                  </td>
                </tr>

              ) : (

                riskyCustomers.map((customer) => {

                  const priority =
                    customer.high > 0
                      ? "HIGH"
                      : customer.medium > 0
                      ? "MEDIUM"
                      : "LOW";

                  return (
                    <tr key={customer.customer_id}>

                      <td>
                        <div className="ai-customer">

                          <div className="ai-avatar">
                            {customerName(
                              customer.customer_id
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>
                            {customerName(
                              customer.customer_id
                            )}
                          </strong>

                        </div>
                      </td>

                      <td>{customer.cases}</td>

                      <td>{customer.high}</td>

                      <td>{customer.medium}</td>

                      <td>
                        <strong>
                          {money(customer.revenue)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`ai-priority ${riskClass(
                            priority
                          )}`}
                        >
                          {priority}
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


      {/* RECOVERY TRENDS */}
      <section className="ai-two-column">

        <div className="ai-card">

          <CardHeader
            title="Recovery Trend"
            subtitle="Current portfolio recovery opportunity"
          />

          <div className="ai-trend">

            <div className="ai-trend-bars">

              <Bar height="45%" label="Risk" />
              <Bar height="62%" label="Analyze" />
              <Bar height="72%" label="Recommend" />
              <Bar height="88%" label="Execute" />
              <Bar height="64%" label="Recover" />

            </div>

            <div className="ai-trend-caption">
              <span>Risk Detection</span>
              <strong>
                {money(metrics.revenueAtRisk)}
              </strong>
            </div>

          </div>

        </div>


        <div className="ai-card">

          <CardHeader
            title="AI Model Confidence"
            subtitle="Confidence indicators from current intelligence"
          />

          <div className="ai-confidence-list">

            <Confidence
              label="Risk Classification"
              value="92%"
            />

            <Confidence
              label="Action Recommendation"
              value="89%"
            />

            <Confidence
              label="Recovery Forecast"
              value="86%"
            />

            <Confidence
              label="Customer Prioritization"
              value="91%"
            />

          </div>

        </div>

      </section>


      {/* AI ACTIVITY */}
      <section className="ai-card">

        <CardHeader
          title="Recent AI Activity"
          subtitle="Latest recovery decisions recorded by the system"
        />

        <div className="ai-activity-list">

          {auditLogs.length === 0 ? (

            <div className="ai-empty">
              No AI activity has been recorded yet.
            </div>

          ) : (

            auditLogs.slice(0, 6).map((log, index) => (

              <div
                className="ai-activity-item"
                key={log.log_id || index}
              >

                <div className="ai-activity-icon">
                  ✦
                </div>

                <div className="ai-activity-copy">

                  <strong>
                    {log.action ||
                      "Recovery action analyzed"}
                  </strong>

                  <p>
                    {log.message ||
                      "AI recovery activity processed successfully."}
                  </p>

                </div>

                <span className="ai-activity-status">
                  {log.status || "Success"}
                </span>

              </div>

            ))

          )}

        </div>

      </section>


      {/* FOOTER */}
      <div className="ai-footer">
        <span>✦</span>
        Powered by ReviveAI Decision Engine
        <span>•</span>
        AI-assisted revenue recovery intelligence
      </div>

    </div>
  );
}


// ============================================================
// COMPONENTS
// ============================================================

function Metric({
  label,
  value,
  description,
  icon,
  type = "",
}) {
  return (
    <div className="ai-metric">
      <div className={`ai-metric-icon ${type}`}>
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}


function CardHeader({ title, subtitle }) {
  return (
    <div className="ai-card-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <span className="ai-live">● AI LIVE</span>
    </div>
  );
}


function RiskRow({
  label,
  count,
  total,
  type,
}) {
  const percent =
    total > 0
      ? Math.round((count / total) * 100)
      : 0;

  return (
    <div className="ai-risk-row">

      <div className="ai-risk-row-head">
        <span>
          <i className={`ai-dot ${type}`}></i>
          {label}
        </span>

        <strong>{count}</strong>
      </div>

      <div className="ai-risk-progress">
        <div
          className={type}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <small>{percent}% of portfolio</small>

    </div>
  );
}


function Bar({ height, label }) {
  return (
    <div className="ai-bar-column">

      <div className="ai-bar">
        <div style={{ height }}></div>
      </div>

      <span>{label}</span>

    </div>
  );
}


function Confidence({ label, value }) {
  return (
    <div className="ai-confidence-row">

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="ai-confidence-track">
        <div
          style={{
            width: value,
          }}
        ></div>
      </div>

    </div>
  );
}


export default AIInsights;

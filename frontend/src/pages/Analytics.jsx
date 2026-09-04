import React, { useEffect, useMemo, useState } from "react";
import {
  getDashboardSummary,
  getRevenueRisk,
  getAuditLogs,
} from "../services/api";
import "./Analytics.css";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function Analytics() {
  const [summary, setSummary] = useState({});
  const [riskCases, setRiskCases] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryData, riskData, auditData] =
        await Promise.all([
          getDashboardSummary(),
          getRevenueRisk(),
          getAuditLogs(),
        ]);

      setSummary(summaryData || {});

      const risks = Array.isArray(riskData)
        ? riskData
        : riskData?.cases || [];

      const logs = Array.isArray(auditData)
        ? auditData
        : auditData?.logs || [];

      setRiskCases(risks);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const stats = useMemo(() => {
    const totalRisk = riskCases.reduce(
      (sum, item) => sum + Number(item.revenue_at_risk || 0),
      0
    );

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

    const executed = auditLogs.filter(
      (item) =>
        String(item.status || "").toLowerCase() === "executed"
    ).length;

    return {
      totalRisk:
        Number(
          summary?.total_revenue_at_risk ??
            summary?.revenue_at_risk ??
            totalRisk
        ) || totalRisk,
      high,
      medium,
      low,
      executed,
      totalCases: riskCases.length,
    };
  }, [summary, riskCases, auditLogs]);

  const actionStats = useMemo(() => {
    const map = {};

    auditLogs.forEach((log) => {
      const action = log.action || "Unknown Action";
      if (!map[action]) {
        map[action] = {
          action,
          total: 0,
          executed: 0,
        };
      }

      map[action].total += 1;

      if (
        String(log.status || "").toLowerCase() === "executed"
      ) {
        map[action].executed += 1;
      }
    });

    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [auditLogs]);

  const activityByDay = useMemo(() => {
    const days = Number(period);
    const now = new Date();
    const result = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      const key = date.toISOString().slice(0, 10);

      const count = auditLogs.filter((log) => {
        const raw =
          log.created_at ||
          log.timestamp ||
          log.date;

        if (!raw) return false;

        const logDate = new Date(raw)
          .toISOString()
          .slice(0, 10);

        return logDate === key;
      }).length;

      result.push({
        key,
        label: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        count,
      });
    }

    return result;
  }, [auditLogs, period]);

  const maxActivity = Math.max(
    1,
    ...activityByDay.map((item) => item.count)
  );

  const exportCSV = () => {
    const headers = [
      "Case",
      "Invoice",
      "Customer",
      "Risk Level",
      "Revenue At Risk",
      "Recommended Action",
    ];

    const rows = riskCases.map((item) => [
      item.case_id || "",
      item.invoice_id || "",
      item.customer_id || "",
      item.risk_level || "",
      item.revenue_at_risk || 0,
      item.recommended_action ||
        item.intervention_action ||
        "",
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "reviveai-analytics.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="analytics-state">
        <div className="analytics-spinner"></div>
        <h2>Loading Analytics...</h2>
        <p>Preparing your revenue intelligence.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-state">
        <div className="analytics-error">!</div>
        <h2>Analytics Unavailable</h2>
        <p>{error}</p>
        <button
          className="analytics-primary"
          onClick={loadAnalytics}
        >
          Try Again
        </button>
      </div>
    );
  }

  const riskTotal =
    stats.high + stats.medium + stats.low;

  return (
    <div className="analytics-page">

      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            REVENUE INTELLIGENCE
          </span>
          <h1>Analytics</h1>
          <p>
            Measure revenue exposure, recovery activity
            and AI-driven intervention performance.
          </p>
        </div>

        <div className="analytics-actions">
          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
            aria-label="Analytics period"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <button
            className="analytics-export"
            onClick={exportCSV}
          >
            ↓ Export CSV
          </button>

          <button
            className="analytics-refresh"
            onClick={loadAnalytics}
          >
            ↻
          </button>
        </div>
      </header>

      <section className="analytics-kpis">

        <Kpi
          label="Revenue At Risk"
          value={money(stats.totalRisk)}
          icon="₹"
          type="danger"
        />

        <Kpi
          label="Risk Cases"
          value={stats.totalCases}
          icon="!"
        />

        <Kpi
          label="High Risk Cases"
          value={stats.high}
          icon="◆"
          type="danger"
        />

        <Kpi
          label="Actions Executed"
          value={stats.executed}
          icon="✓"
          type="success"
        />

      </section>

      <section className="analytics-grid">

        <div className="analytics-card analytics-large">

          <CardHeader
            title="Recovery Activity Trend"
            subtitle={`Recorded AI recovery actions — last ${period} days`}
          />

          <div className="analytics-chart">

            {activityByDay.map((item) => (
              <div
                className="analytics-chart-column"
                key={item.key}
              >
                <div className="analytics-chart-value">
                  {item.count}
                </div>

                <div className="analytics-chart-bar-wrap">
                  <div
                    className="analytics-chart-bar"
                    style={{
                      height: `${Math.max(
                        4,
                        (item.count / maxActivity) * 100
                      )}%`,
                    }}
                  />
                </div>

                <span>{item.label}</span>
              </div>
            ))}

          </div>

        </div>

        <div className="analytics-card">

          <CardHeader
            title="Risk Distribution"
            subtitle="Current portfolio"
          />

          <div className="analytics-donut-area">

            <div
              className="analytics-donut"
              style={{
                background:
                  riskTotal === 0
                    ? "#e2e8f0"
                    : `conic-gradient(
                      #ef4444 0 ${
                        (stats.high / riskTotal) * 100
                      }%,
                      #f97316 ${
                        (stats.high / riskTotal) * 100
                      }% ${
                        ((stats.high + stats.medium) /
                          riskTotal) *
                        100
                      }%,
                      #22c55e ${
                        ((stats.high + stats.medium) /
                          riskTotal) *
                        100
                      }% 100%
                    )`,
              }}
            >
              <div>
                <strong>{riskTotal}</strong>
                <span>Cases</span>
              </div>
            </div>

            <div className="analytics-legend">
              <Legend
                label="High Risk"
                value={stats.high}
                type="high"
              />
              <Legend
                label="Medium Risk"
                value={stats.medium}
                type="medium"
              />
              <Legend
                label="Low Risk"
                value={stats.low}
                type="low"
              />
            </div>

          </div>

        </div>

      </section>

      <section className="analytics-grid">

        <div className="analytics-card">

          <CardHeader
            title="Revenue Risk Overview"
            subtitle="Exposure by risk level"
          />

          <div className="analytics-risk-list">

            <RiskMetric
              label="High Risk Revenue"
              value={riskCases
                .filter(
                  (item) =>
                    String(item.risk_level || "")
                      .toUpperCase() === "HIGH"
                )
                .reduce(
                  (sum, item) =>
                    sum +
                    Number(item.revenue_at_risk || 0),
                  0
                )}
              count={stats.high}
              type="high"
            />

            <RiskMetric
              label="Medium Risk Revenue"
              value={riskCases
                .filter(
                  (item) =>
                    String(item.risk_level || "")
                      .toUpperCase() === "MEDIUM"
                )
                .reduce(
                  (sum, item) =>
                    sum +
                    Number(item.revenue_at_risk || 0),
                  0
                )}
              count={stats.medium}
              type="medium"
            />

            <RiskMetric
              label="Low Risk Revenue"
              value={riskCases
                .filter(
                  (item) =>
                    String(item.risk_level || "")
                      .toUpperCase() === "LOW"
                )
                .reduce(
                  (sum, item) =>
                    sum +
                    Number(item.revenue_at_risk || 0),
                  0
                )}
              count={stats.low}
              type="low"
            />

          </div>

        </div>


        <div className="analytics-card">

          <CardHeader
            title="Action Performance"
            subtitle="Recovery actions recorded in audit trail"
          />

          <div className="analytics-action-list">

            {actionStats.length === 0 ? (
              <div className="analytics-empty">
                No recovery actions recorded yet.
              </div>
            ) : (
              actionStats.map((item) => {
                const rate =
                  item.total > 0
                    ? Math.round(
                        (item.executed / item.total) * 100
                      )
                    : 0;

                return (
                  <div
                    className="analytics-action-row"
                    key={item.action}
                  >
                    <div className="analytics-action-top">
                      <strong>{item.action}</strong>
                      <span>
                        {item.executed}/{item.total}
                      </span>
                    </div>

                    <div className="analytics-progress">
                      <div
                        style={{
                          width: `${rate}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}

          </div>

        </div>

      </section>


      <section className="analytics-card">

        <CardHeader
          title="AI Recovery Intelligence"
          subtitle="Operational signals from the current recovery portfolio"
        />

        <div className="analytics-insights">

          <Insight
            icon="⚡"
            title="Immediate Attention"
            value={`${stats.high} high-risk cases`}
            text={
              stats.high > 0
                ? "Prioritize high-risk invoices before additional revenue exposure occurs."
                : "No high-risk cases are currently detected."
            }
          />

          <Insight
            icon="◈"
            title="Revenue Opportunity"
            value={money(stats.totalRisk)}
            text="Total revenue currently identified as being at risk by the recovery engine."
          />

          <Insight
            icon="✓"
            title="Execution Activity"
            value={`${stats.executed} executed`}
            text="Completed recovery actions are recorded in the audit trail for traceability."
          />

        </div>

      </section>


      <footer className="analytics-footer">
        <span>✦</span>
        ReviveAI Decision Engine
        <span>•</span>
        Revenue recovery analytics
      </footer>

    </div>
  );
}


function Kpi({ label, value, icon, type = "" }) {
  return (
    <div className="analytics-kpi">
      <div className={`analytics-kpi-icon ${type}`}>
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}


function CardHeader({ title, subtitle }) {
  return (
    <div className="analytics-card-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <span className="analytics-live">● LIVE</span>
    </div>
  );
}


function Legend({ label, value, type }) {
  return (
    <div className="analytics-legend-row">
      <span>
        <i className={`analytics-dot ${type}`} />
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}


function RiskMetric({
  label,
  value,
  count,
  type,
}) {
  return (
    <div className="analytics-risk-item">

      <div className={`analytics-risk-icon ${type}`}>
        {type === "high"
          ? "!"
          : type === "medium"
          ? "≈"
          : "✓"}
      </div>

      <div className="analytics-risk-copy">
        <strong>{label}</strong>
        <span>
          {count} {count === 1 ? "case" : "cases"}
        </span>
      </div>

      <b>{money(value)}</b>

    </div>
  );
}


function Insight({ icon, title, value, text }) {
  return (
    <div className="analytics-insight">

      <div className="analytics-insight-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <p>{text}</p>
      </div>

    </div>
  );
}

export default Analytics;

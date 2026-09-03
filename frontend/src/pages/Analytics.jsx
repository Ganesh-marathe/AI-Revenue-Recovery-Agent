import React, { useEffect, useState } from "react";
import { getDashboardSummary, getRevenueRisk } from "../services/api";

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const [summaryData, revenueData] = await Promise.all([
        getDashboardSummary(),
        getRevenueRisk(),
      ]);

      setSummary(summaryData);
      setRiskData(revenueData);
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="spinner"></div>
        <h2>Loading Analytics...</h2>
        <p>Analyzing revenue recovery performance.</p>
      </div>
    );
  }

  const cases = riskData?.cases || [];

  const high = cases.filter(
    (item) =>
      String(item.risk_level).toUpperCase() === "HIGH"
  ).length;

  const medium = cases.filter(
    (item) =>
      String(item.risk_level).toUpperCase() === "MEDIUM"
  ).length;

  const low = cases.filter(
    (item) =>
      String(item.risk_level).toUpperCase() === "LOW"
  ).length;

  const totalRisk = Number(
    riskData?.total_revenue_at_risk || 0
  );

  const totalCases = Number(summary?.total_cases || 0);
  const executed = Number(summary?.executed_cases || 0);
  const open = Number(summary?.open_cases || 0);

  const recoveryRate =
    totalCases > 0
      ? Math.round((executed / totalCases) * 100)
      : 0;

  const currency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <section className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            BUSINESS INTELLIGENCE
          </span>

          <h1>Analytics</h1>

          <p>
            Revenue risk, recovery performance and AI
            operations analytics.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadAnalytics}
        >
          ↻ Refresh
        </button>
      </section>

      {/* KPI */}

      <section className="kpi-grid">

        <div className="kpi-card">
          <div className="kpi-icon purple">₹</div>

          <div className="kpi-content">
            <span>Revenue At Risk</span>
            <strong>{currency(totalRisk)}</strong>
            <small>Potential recovery</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">!</div>

          <div className="kpi-content">
            <span>High Risk Cases</span>
            <strong>{high}</strong>
            <small>Immediate attention</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">↻</div>

          <div className="kpi-content">
            <span>Open Cases</span>
            <strong>{open}</strong>
            <small>Currently active</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">✓</div>

          <div className="kpi-content">
            <span>Recovery Rate</span>
            <strong>{recoveryRate}%</strong>
            <small>Execution performance</small>
          </div>
        </div>

      </section>

      {/* RISK ANALYTICS */}

      <section className="dashboard-two-column">

        <div className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>Risk Distribution</h2>
              <p>Revenue risk cases by severity.</p>
            </div>
          </div>

          <div className="risk-list">

            <RiskBar
              label="HIGH RISK"
              value={high}
              total={cases.length}
              type="high"
            />

            <RiskBar
              label="MEDIUM RISK"
              value={medium}
              total={cases.length}
              type="medium"
            />

            <RiskBar
              label="LOW RISK"
              value={low}
              total={cases.length}
              type="low"
            />

          </div>

          <div className="risk-summary">
            <div>
              <span>Total Risk Cases</span>
              <strong>{cases.length}</strong>
            </div>

            <div>
              <span>Revenue At Risk</span>
              <strong className="danger-text">
                {currency(totalRisk)}
              </strong>
            </div>
          </div>

        </div>

        {/* PERFORMANCE */}

        <div className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>Recovery Performance</h2>
              <p>Current AI recovery execution.</p>
            </div>
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
                <strong>{executed}</strong>
                <span>Executed</span>
              </div>

              <div>
                <strong>{open}</strong>
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

      {/* BUSINESS SUMMARY */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>Revenue Recovery Insights</h2>
            <p>Key business metrics from ReviveAI.</p>
          </div>

          <span className="ai-label">
            ✦ AI ANALYTICS
          </span>
        </div>

        <div className="summary-grid">

          <Summary
            label="Revenue At Risk"
            value={currency(totalRisk)}
            type="danger"
          />

          <Summary
            label="High Risk Cases"
            value={high}
            type="warning"
          />

          <Summary
            label="Medium Risk Cases"
            value={medium}
            type="blue"
          />

          <Summary
            label="Recovery Rate"
            value={`${recoveryRate}%`}
            type="success"
          />

        </div>

      </section>

    </div>
  );
}

function RiskBar({ label, value, total, type }) {
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
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <small>{percentage}% of cases</small>

    </div>
  );
}

function Summary({ label, value, type }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong className={`${type}-text`}>
        {value}
      </strong>
    </div>
  );
}

export default Analytics;
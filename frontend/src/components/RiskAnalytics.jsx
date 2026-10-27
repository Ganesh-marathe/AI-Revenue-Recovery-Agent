import { useEffect, useState } from "react";
function RiskAnalytics() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRiskData() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/analytics/customer-risk"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch customer risk data.");
        }

        const data = await response.json();
        setRiskData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRiskData();
  }, []);

  if (loading) {
    return <p>Loading customer risk analytics...</p>;
  }

  if (error) {
    return <p role="alert">Error: {error}</p>;
  }

  if (!riskData) {
    return <p>No customer risk data available.</p>;
  }

  const customerRisk = riskData.customer_risk;
  const metrics = riskData.customer_metrics;

  return (
    <section className="risk-analytics">
      <h2>Customer Risk Analytics</h2>

      <div className="risk-card">
        <h3>Risk Level</h3>
        <p className={`risk-level ${customerRisk.risk_level.toLowerCase()}`}>
          {customerRisk.risk_level}
        </p>

        <h3>Risk Score</h3>
        <p>{customerRisk.risk_score}/100</p>

        <h3>Recommended Action</h3>
        <p>{customerRisk.recommendation}</p>

        <hr />

        <h3>Customer Metrics</h3>
        <p>Days Overdue: {metrics.days_overdue}</p>
        <p>
          Failed Payment Rate:{" "}
          {(metrics.failed_payment_rate * 100).toFixed(0)}%
        </p>
        <p>
          Invoice Amount: ₹
          {Number(metrics.invoice_amount).toLocaleString("en-IN")}
        </p>
      </div>
    </section>
  );
}

export default RiskAnalytics;
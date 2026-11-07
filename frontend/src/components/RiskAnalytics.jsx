import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/analytics/customer-risk";

function RiskAnalytics() {
    const [riskData, setRiskData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRiskData = async () => {
            try {
                const response = await fetch(
                    `${API_URL}?days_overdue=45&failed_payment_rate=0.75&invoice_amount=50000`
                );

                if (!response.ok) {
                    throw new Error("Unable to fetch customer risk data");
                }

                const data = await response.json();
                setRiskData(data.customer_risk);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRiskData();
    }, []);

    if (loading) return <p>Loading customer analytics...</p>;

    if (error) return <p>Error: {error}</p>;

    if (!riskData) return <p>No risk data available.</p>;

    return (
        <div className="risk-analytics">
            <h2>Customer Risk Analytics</h2>

            <div className="risk-card">
                <h3>Risk Level</h3>
                <h1>{riskData.risk_level}</h1>

                <p>
                    Risk Score: {riskData.risk_score}/100
                </p>

                <p>
                    Recommendation: {riskData.recommendation}
                </p>
            </div>
        </div>
    );
}

export default RiskAnalytics;
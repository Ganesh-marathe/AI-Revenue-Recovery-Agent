import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../services/api";

function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      setError("");

      const data = await getAuditLogs();
      setLogs(data?.logs || []);
    } catch (err) {
      console.error("Audit Trail error:", err);
      setError("Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN");
  }

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="spinner"></div>
        <h2>Loading Audit Trail...</h2>
        <p>Fetching AI recovery activity.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-state error-state">
        <h2>Unable to Load Audit Trail</h2>
        <p>{error}</p>

        <button
          className="primary-button"
          onClick={loadLogs}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <section className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            SYSTEM ACTIVITY
          </span>

          <h1>Audit Trail</h1>

          <p>
            Track AI recovery actions and system activity.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadLogs}
        >
          ↻ Refresh
        </button>
      </section>

      {/* SUMMARY */}

      <section className="kpi-grid">

        <div className="kpi-card">
          <div className="kpi-icon blue">
            ☷
          </div>

          <div className="kpi-content">
            <span>Total Activities</span>
            <strong>{logs.length}</strong>
            <small>Recorded system actions</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            ✓
          </div>

          <div className="kpi-content">
            <span>Executed</span>
            <strong>
              {
                logs.filter(
                  (log) => log.status === "executed"
                ).length
              }
            </strong>
            <small>Successful actions</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            ✦
          </div>

          <div className="kpi-content">
            <span>AI Actions</span>
            <strong>{logs.length}</strong>
            <small>AI recovery activity</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            ⚡
          </div>

          <div className="kpi-content">
            <span>Latest Action</span>
            <strong>
              {logs.length > 0
                ? logs[logs.length - 1].action
                : "None"}
            </strong>
            <small>Most recent activity</small>
          </div>
        </div>

      </section>

      {/* AUDIT TABLE */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>System Activity Log</h2>
            <p>
              Complete record of ReviveAI recovery actions.
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
                <th>Log ID</th>
                <th>Case ID</th>
                <th>Action</th>
                <th>Status</th>
                <th>Message</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>

              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No audit activity found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id}>

                    <td>
                      <strong>
                        LOG-{String(
                          log.log_id
                        ).padStart(4, "0")}
                      </strong>
                    </td>

                    <td>
                      CASE-{log.case_id}
                    </td>

                    <td>
                      <strong>
                        {log.action}
                      </strong>
                    </td>

                    <td>
                      <span className="payment-status success">
                        {log.status}
                      </span>
                    </td>

                    <td>
                      {log.message}
                    </td>

                    <td>
                      {formatDate(log.created_at)}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default AuditTrail;
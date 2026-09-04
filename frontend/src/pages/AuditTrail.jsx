import React, { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../services/api";

function AuditTrail() {
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =====================================================
     LOAD AUDIT LOGS
  ===================================================== */

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getAuditLogs();

      const auditLogs = Array.isArray(data?.logs)
        ? data.logs
        : [];

      setLogs(auditLogs);
    } catch (err) {
      console.error("Audit Trail error:", err);

      setError(
        err.message ||
          "Unable to load audit logs."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* =====================================================
     ACTION FORMAT
  ===================================================== */

  function formatAction(action) {
    if (!action) {
      return "Unknown Action";
    }

    return action
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  function getStatusClass(status) {
    const value = String(status || "")
      .toLowerCase();

    if (value === "executed") {
      return "audit-status executed";
    }

    if (value === "failed") {
      return "audit-status failed";
    }

    if (value === "pending") {
      return "audit-status pending";
    }

    return "audit-status default";
  }

  /* =====================================================
     FILTER LOGS
  ===================================================== */

  const filteredLogs = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !search ||
        String(log.log_id || "")
          .toLowerCase()
          .includes(search) ||
        String(log.case_id || "")
          .toLowerCase()
          .includes(search) ||
        String(log.action || "")
          .toLowerCase()
          .includes(search) ||
        String(log.message || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(log.status || "")
          .toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    logs,
    searchTerm,
    statusFilter,
  ]);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalActivities = logs.length;

  const executedActivities = logs.filter(
    (log) =>
      String(log.status || "")
        .toLowerCase() === "executed"
  ).length;

  const failedActivities = logs.filter(
    (log) =>
      String(log.status || "")
        .toLowerCase() === "failed"
  ).length;

  /*
     Backend returns newest logs first.
     Therefore logs[0] is the latest activity.
  */

  const latestAction =
    logs.length > 0
      ? formatAction(logs[0].action)
      : "None";

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loading) {
    return (
      <div className="audit-page">

        <div className="audit-loading-card">

          <div className="audit-spinner"></div>

          <h2>
            Loading Audit Trail...
          </h2>

          <p>
            Fetching ReviveAI recovery activity.
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     ERROR STATE
  ===================================================== */

  if (error) {
    return (
      <div className="audit-page">

        <div className="audit-error-card">

          <div className="audit-error-icon">
            !
          </div>

          <h2>
            Unable to Load Audit Trail
          </h2>

          <p>
            {error}
          </p>

          <button
            className="audit-primary-button"
            onClick={() => loadLogs()}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="audit-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="audit-header">

        <div>

          <span className="audit-eyebrow">
            SYSTEM ACTIVITY
          </span>

          <h1>
            Audit Trail
          </h1>

          <p>
            Track AI recovery actions and system
            activity across ReviveAI.
          </p>

        </div>

        <button
          className="audit-refresh-button"
          onClick={() => loadLogs(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span className="audit-small-spinner"></span>
              Refreshing...
            </>
          ) : (
            <>
              ↻ Refresh
            </>
          )}
        </button>

      </section>


      {/* =================================================
          KPI SUMMARY
      ================================================= */}

      <section className="audit-kpi-grid">

        {/* TOTAL */}

        <div className="audit-kpi-card">

          <div className="audit-kpi-icon">
            ☷
          </div>

          <div>

            <span>
              Total Activities
            </span>

            <strong>
              {totalActivities}
            </strong>

            <small>
              Recorded system actions
            </small>

          </div>

        </div>


        {/* EXECUTED */}

        <div className="audit-kpi-card">

          <div className="audit-kpi-icon executed-icon">
            ✓
          </div>

          <div>

            <span>
              Executed
            </span>

            <strong>
              {executedActivities}
            </strong>

            <small>
              Successfully executed actions
            </small>

          </div>

        </div>


        {/* FAILED */}

        <div className="audit-kpi-card">

          <div className="audit-kpi-icon failed-icon">
            !
          </div>

          <div>

            <span>
              Failed
            </span>

            <strong>
              {failedActivities}
            </strong>

            <small>
              Actions requiring attention
            </small>

          </div>

        </div>


        {/* LATEST */}

        <div className="audit-kpi-card">

          <div className="audit-kpi-icon ai-icon">
            AI
          </div>

          <div>

            <span>
              Latest Action
            </span>

            <strong className="latest-action">
              {latestAction}
            </strong>

            <small>
              Most recent activity
            </small>

          </div>

        </div>

      </section>


      {/* =================================================
          ACTIVITY CARD
      ================================================= */}

      <section className="audit-card">

        {/* CARD HEADER */}

        <div className="audit-card-header">

          <div>

            <h2>
              System Activity Log
            </h2>

            <p>
              Complete record of ReviveAI recovery
              actions.
            </p>

          </div>

          <span className="audit-live-label">
            ● LIVE DATA
          </span>

        </div>


        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="audit-toolbar">

          <div className="audit-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search log, case, action or message..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="ALL">
              All Statuses
            </option>

            <option value="EXECUTED">
              Executed
            </option>

            <option value="FAILED">
              Failed
            </option>

            <option value="PENDING">
              Pending
            </option>

          </select>

        </div>


        {/* =================================================
            RESULT COUNT
        ================================================= */}

        <div className="audit-result-info">

          <span>
            Showing{" "}
            <strong>
              {filteredLogs.length}
            </strong>{" "}
            of{" "}
            <strong>
              {logs.length}
            </strong>{" "}
            activities
          </span>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="audit-table-wrapper">

          <table className="audit-table">

            <thead>

              <tr>

                <th>
                  LOG ID
                </th>

                <th>
                  CASE
                </th>

                <th>
                  ACTION
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  MESSAGE
                </th>

                <th>
                  CREATED AT
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredLogs.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="audit-empty-cell"
                  >

                    <div className="audit-empty">

                      <div className="audit-empty-icon">
                        ✓
                      </div>

                      <h3>
                        No Activity Found
                      </h3>

                      <p>
                        तुमच्या search किंवा filter
                        नुसार कोणतीही activity मिळाली नाही.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredLogs.map((log) => (

                  <tr key={log.log_id}>

                    {/* LOG ID */}

                    <td>

                      <strong className="audit-log-id">
                        LOG-
                        {String(
                          log.log_id
                        ).padStart(4, "0")}
                      </strong>

                    </td>


                    {/* CASE */}

                    <td>

                      <span className="audit-case-id">
                        CASE-{log.case_id}
                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <div className="audit-action-cell">

                        <div className="audit-action-icon">
                          AI
                        </div>

                        <strong>
                          {formatAction(
                            log.action
                          )}
                        </strong>

                      </div>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={getStatusClass(
                          log.status
                        )}
                      >

                        <span className="status-dot">
                          ●
                        </span>

                        {log.status || "unknown"}

                      </span>

                    </td>


                    {/* MESSAGE */}

                    <td>

                      <span className="audit-message">
                        {log.message || "-"}
                      </span>

                    </td>


                    {/* DATE */}

                    <td>

                      <span className="audit-date">
                        {formatDate(
                          log.created_at
                        )}
                      </span>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          FOOTER INFORMATION
      ================================================= */}

      <div className="audit-footer">

        <span>
          🔐 Audit records are protected by
          ReviveAI authentication.
        </span>

        <span>
          ReviveAI Decision Engine
        </span>

      </div>

    </div>
  );
}

export default AuditTrail;
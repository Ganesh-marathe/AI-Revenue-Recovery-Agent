import React from "react";
function Sidebar() {
  return (
    <aside
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "30px",
      }}
    >
      <h2>ReviveAI</h2>

      <p>Dashboard</p>
      <p>Recovery Cases</p>
      <p>Invoices</p>
      <p>AI Insights</p>
      <p>Analytics</p>
      <p>Audit Trail</p>
    </aside>
  );
}

export default Sidebar;
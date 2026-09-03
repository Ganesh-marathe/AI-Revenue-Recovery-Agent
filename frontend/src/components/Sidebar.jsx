import React from "react";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: "▣" },
    { name: "Recovery Cases", icon: "↻" },
    { name: "Invoices", icon: "▤" },
    { name: "AI Insights", icon: "✦" },
    { name: "Analytics", icon: "◫" },
    { name: "Audit Trail", icon: "☷" },
  ];

  return (
    <aside
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: "35px" }}>ReviveAI</h2>

      {menuItems.map((item) => (
        <div
          key={item.name}
          onClick={() => setActivePage(item.name)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "13px 14px",
            marginBottom: "8px",
            borderRadius: "8px",
            cursor: "pointer",
            background:
              activePage === item.name
                ? "#2563eb"
                : "transparent",
          }}
        >
          <span>{item.icon}</span>
          <span>{item.name}</span>
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
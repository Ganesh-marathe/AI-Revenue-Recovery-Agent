import React, { useState } from "react";
import RecoveryCases from "./pages/RecoveryCases";
import Navbar from "./components/Navbar";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/AIInsights";
import Sidebar from "./components/Sidebar";
import AuditTrail from "./pages/AuditTrail";    
import Dashboard from "./pages/Dashboard";
import "./App.css";

function SimplePage({ title, description }) {
  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            REVIVEAI OPERATIONS
          </span>

          <h1>{title}</h1>

          <p>{description}</p>
        </div>
      </section>

      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>{title}</h2>
            <p>Module is ready for integration.</p>
          </div>
        </div>

        <div style={{ padding: "40px 10px" }}>
          <h3>ReviveAI {title}</h3>
          <p>
            This module will display live revenue recovery
            information from the backend.
          </p>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Recovery Cases":
  return <RecoveryCases />;

      case "Invoices":
  return <Invoices />;

      case "AI Insights":
  return <AIInsights />;

     case "Analytics":
  return <Analytics />;

      case "Audit Trail":
  return <AuditTrail />;

      default:
        return <Dashboard />;
    }
  }; 

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="app-main">
        <Navbar />

        <main className="main-page">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
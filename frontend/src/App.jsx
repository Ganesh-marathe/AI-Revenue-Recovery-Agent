import React, { useState } from "react";

import RecoveryCases from "./pages/RecoveryCases";
import Navbar from "./components/Navbar";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/AIInsights";
import Sidebar from "./components/Sidebar";
import AuditTrail from "./pages/AuditTrail";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import "./App.css";

function App() {

  // Check whether JWT token already exists
  const [isAuthenticated, setIsAuthenticated] =
    useState(
      !!localStorage.getItem("reviveai_token")
    );

  // Current active page
  const [activePage, setActivePage] =
    useState("Dashboard");


  // Login successful
  const handleLogin = () => {
    setIsAuthenticated(true);
  };


  // Logout
  const handleLogout = () => {

    // Remove JWT token
    localStorage.removeItem("reviveai_token");

    // Remove user information
    localStorage.removeItem("reviveai_user");

    // Show Login page
    setIsAuthenticated(false);

    // Reset page
    setActivePage("Dashboard");
  };


  // Display selected page
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


  /*
   * जर user login केलेला नसेल
   * तर Login page दाखवा
   */
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  /*
   * User login केलेला असल्यास
   * पूर्ण Dashboard application दाखवा
   */
  return (
    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="app-main">

        <Navbar
          onLogout={handleLogout}
        />

        <main className="main-page">
          {renderPage()}
        </main>

      </div>

    </div>
  );
}

export default App;
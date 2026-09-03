import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      <div className="navbar-left">
        <div className="mobile-menu">
          ☰
        </div>

        <div className="page-title">
          <span>AI-POWERED OPERATIONS</span>
          <h2>Revenue Recovery Intelligence</h2>
        </div>
      </div>

      <div className="navbar-right">

        <button className="nav-icon" title="Search">
          ⌕
        </button>

        <button className="nav-icon notification" title="Notifications">
          ♧
          <span className="notification-dot"></span>
        </button>

        <div className="nav-divider"></div>

        <div className="user-profile">
          <div className="user-avatar">
            GM
          </div>

          <div className="user-info">
            <strong>Ganesh Marathe</strong>
            <span>Administrator</span>
          </div>

          <span className="user-arrow">⌄</span>
        </div>

      </div>

    </header>
  );
}

export default Navbar;
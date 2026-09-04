import React from "react";
import "./Navbar.css";

function Navbar({ onLogout }) {
  // ==========================================================
  // GET CURRENT LOGGED-IN USER
  // ==========================================================

  const storedUser = localStorage.getItem("reviveai_user");

  let currentUser = null;

  try {
    currentUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    currentUser = null;
  }

  // Username from logged-in account
  const username =
    currentUser?.username ||
    currentUser?.name ||
    "User";


  // ==========================================================
  // FORMAT DISPLAY NAME
  // ==========================================================

  const displayName = username
    .trim()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );


  // ==========================================================
  // CREATE INITIALS
  // ==========================================================

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();


  // ==========================================================
  // NAVBAR
  // ==========================================================

  return (
    <header className="navbar">

      {/* ------------------------------------------------------
          BRAND
      ------------------------------------------------------ */}

      <div className="navbar-brand">

        <div className="navbar-eyebrow">
          AI-POWERED OPERATIONS
        </div>

        <div className="navbar-title">
          Revenue Recovery Intelligence
        </div>

      </div>


      {/* ------------------------------------------------------
          RIGHT SIDE
      ------------------------------------------------------ */}

      <div className="navbar-actions">

        {/* Search */}

        <button
          className="navbar-icon-button"
          title="Search"
          type="button"
        >
          ⌕
        </button>


        {/* Notifications */}

        <button
          className="navbar-icon-button"
          title="Notifications"
          type="button"
        >
          ♧
        </button>


        {/* --------------------------------------------------
            USER
        -------------------------------------------------- */}

        <div className="navbar-user">

          <div className="navbar-avatar">
            {initials || "U"}
          </div>


          <div className="navbar-user-info">

            <div className="navbar-user-name">
              {displayName}
            </div>

            <div className="navbar-user-role">
              Administrator
            </div>

          </div>

        </div>


        {/* --------------------------------------------------
            LOGOUT
        -------------------------------------------------- */}

        <button
          className="logout-button"
          onClick={onLogout}
          type="button"
        >
          Logout
        </button>

      </div>

    </header>
  );
}


export default Navbar;
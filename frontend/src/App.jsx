import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <div className="app-layout">

      <Sidebar />

      <div className="app-main">

        <Navbar />

        <main className="main-page">
          <Dashboard />
        </main>

      </div>

    </div>
  );
}

export default App;
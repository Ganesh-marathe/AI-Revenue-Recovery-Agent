import React, { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  async function checkBackend() {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/status"
      );

      const data = await response.json();

      setMessage(data.message);
    } catch (error) {
      setMessage("Backend connection failed!");
    }
  }

  return (
    <div>
      <h1>ReviveAI</h1>

      <h2>AI Revenue Recovery Agent</h2>

      <p>
        Detect revenue at risk, diagnose the problem,
        and recover lost revenue.
      </p>

      <hr />

      <button onClick={checkBackend}>
        Check Backend Connection
      </button>

      <h3>{message}</h3>

      <hr />

      <h3>Revenue At Risk</h3>
      <p>₹1,42,500</p>

      <h3>Recovered Revenue</h3>
      <p>₹58,000</p>

      <h3>Recovery Rate</h3>
      <p>40.7%</p>
    </div>
  );
}

export default App;
import React, { useState } from "react";
import "./Login.css";

const API_URL = "http://127.0.0.1:8000";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      let response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      // Fallback for form-based login APIs
      if (response.status === 422) {
        const formData = new URLSearchParams();

        formData.append("username", username.trim());
        formData.append("password", password);

        response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid username or password."
        );
      }

      const token =
        data.access_token ||
        data.token ||
        data.accessToken;

      if (!token) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      localStorage.setItem("reviveai_token", token);

      localStorage.setItem(
        "reviveai_user",
        JSON.stringify({
          username:
            data.username ||
            data.user?.username ||
            username.trim(),
          email:
            data.email ||
            data.user?.email ||
            "",
        })
      );

      onLogin();
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (username.trim().length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to create account."
        );
      }

      setSuccess(
        "Account created successfully! You can now login."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setMode("login");
        setSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-logo">R</div>

          <div>
            <h1>ReviveAI</h1>
            <p>Revenue Recovery Intelligence</p>
          </div>
        </div>

        {/* TOP TOGGLE */}
        <div className="auth-toggle">

          <button
            type="button"
            className={
              mode === "register"
                ? "active"
                : ""
            }
            onClick={() => switchMode("register")}
          >
            Sign up
          </button>

          <button
            type="button"
            className={
              mode === "login"
                ? "active"
                : ""
            }
            onClick={() => switchMode("login")}
          >
            Login
          </button>

        </div>

        {mode === "login" ? (

          <>
            <div className="auth-heading">
              <h2>Log in to your existing profile</h2>
            </div>

            {/* GOOGLE */}
            <button
              type="button"
              className="google-button"
              onClick={() =>
                setError(
                  "Google sign-in is not configured yet."
                )
              }
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

            {/* OR */}
            <div className="auth-divider">
              <span></span>
              <p>OR</p>
              <span></span>
            </div>

            <form onSubmit={handleLogin}>

              <div className="auth-field">
                <label>Username or Email</label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter username or email"
                  autoComplete="username"
                />
              </div>

              <div className="auth-field">
                <label>Password</label>

                <div className="password-wrapper">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword ? "◉" : "◉"}
                  </button>

                </div>
              </div>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "LOGIN"}
              </button>

            </form>

            <div className="forgot-password">
              Forgot Password?
            </div>

            <div className="auth-switch-text">
              Don't have an account?

              <button
                type="button"
                onClick={() =>
                  switchMode("register")
                }
              >
                Create Account
              </button>
            </div>

          </>

        ) : (

          <>
            <div className="auth-heading">
              <h2>Create your ReviveAI account</h2>

              <p>
                Start managing revenue recovery
                with intelligent AI insights.
              </p>
            </div>

            <form onSubmit={handleRegister}>

              <div className="auth-field">
                <label>Username</label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              <div className="auth-field">
                <label>Email Address</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label>Password</label>

                <div className="password-wrapper">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    ◉
                  </button>

                </div>
              </div>

              <div className="auth-field">
                <label>Confirm Password</label>

                <div className="password-wrapper">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    ◉
                  </button>

                </div>
              </div>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-success">
                  ✓ {success}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "CREATE ACCOUNT"}
              </button>

            </form>

            <div className="auth-switch-text">
              Already have an account?

              <button
                type="button"
                onClick={() =>
                  switchMode("login")
                }
              >
                Login
              </button>
            </div>

          </>
        )}

        <div className="auth-footer">
          Protected by ReviveAI Authentication
        </div>

      </div>

    </div>
  );
}

export default Login;
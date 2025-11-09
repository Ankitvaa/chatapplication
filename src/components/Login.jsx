import React, { useState } from "react";
import API from "../api/api";

// Renaming the component to 'App' for primary export, keeping the login logic flow.
const Login = ({ onLogin }) => {
  const [view, setView] = useState("register"); // Default to Register/Signup view

  // RETAINING ORIGINAL STATE + new state for registration
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Added state to display non-alert errors on screen
  const [error, setError] = useState(null);

  const isLogin = view === "login";

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Logic to switch between endpoints and payloads
    const endpoint = isLogin ? "/users/login" : "/users/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const { data } = await API.post(endpoint, payload);

      // Save JWT token for authenticated API calls
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Pass only the user object to parent
      if (data.user && onLogin) {
        onLogin(data.user);
      }

      console.log("✅ Auth successful. User:", data.user);
    } catch (err) {
      console.error("Auth failed:", err);
      // Replaced alert() with state-based display
      const errorMessage =
        err.response?.data?.error ||
        (isLogin
          ? "Login failed, please try again."
          : "Registration failed, please try again.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // UI dynamic values
  const title = isLogin ? "Welcome back!" : "Create an account";
  const subtitle = isLogin
    ? "We're so excited to see you again!"
    : "Enter your details to start chatting!";

  return (
    <div style={styles.container}>
      <form onSubmit={handleAuth} style={styles.formCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Conditional Username Field for Registration */}
        {!isLogin && (
          <>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </>
        )}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {/* Error Message Display (in place of alert) */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Forgot Password link (Discord style) - only for Login view */}
        {isLogin && (
          <a href="#" style={styles.forgotPassword}>
            Forgot your password?
          </a>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
        >
          {loading
            ? isLogin
              ? "Logging in..."
              : "Registering..."
            : isLogin
            ? "Login"
            : "Continue"}
        </button>

        {/* View Switcher (Register/Login Link) */}
        <div style={styles.registerLink}>
          {isLogin ? (
            <>
              Need an account?{" "}
              <a
                href="#"
                onClick={() => setView("register")}
                style={styles.registerButton}
              >
                Register
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a
                href="#"
                onClick={() => setView("login")}
                style={styles.registerButton}
              >
                Login
              </a>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

// CSS styles to mimic Discord, using standard inline JS objects.
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#36393f",
    fontFamily: "Inter, sans-serif",
    padding: "1rem",
  },
  formCard: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "100%",
    maxWidth: "30rem",
    backgroundColor: "#36393f",
    borderRadius: "0.3rem",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
  },
  header: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    color: "#fff",
    fontWeight: "700",
    marginBottom: "0.25rem",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#b9bbbe",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: "bold",
    color: "#b9bbbe",
    textTransform: "uppercase",
    marginTop: "0.5rem",
  },
  input: {
    padding: "0.625rem",
    borderRadius: "0.2rem",
    border: "none",
    backgroundColor: "#202225",
    color: "#dcddde",
    fontSize: "1rem",
    marginBottom: "0.75rem",
  },
  errorBox: {
    backgroundColor: "rgba(150, 40, 40, 0.5)",
    color: "#f0a0a0",
    padding: "0.5rem",
    borderRadius: "0.2rem",
    fontSize: "0.875rem",
    textAlign: "center",
    marginBottom: "1rem",
  },
  forgotPassword: {
    fontSize: "0.75rem",
    color: "#00aff4",
    textDecoration: "none",
    marginBottom: "1rem",
    alignSelf: "flex-start",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.625rem 1rem",
    borderRadius: "0.2rem",
    border: "none",
    backgroundColor: "#5865f2",
    color: "#fff",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "0.5rem",
  },
  buttonLoading: {
    backgroundColor: "#4a54c6",
    cursor: "not-allowed",
  },
  registerLink: {
    fontSize: "0.875rem",
    color: "#99aab5",
    textAlign: "center",
    marginTop: "0.5rem",
  },
  registerButton: {
    color: "#00aff4",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

// Exporting 'Login' to satisfy the environment requirements.
export default Login;

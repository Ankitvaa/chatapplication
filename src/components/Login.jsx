import React, { useState } from "react";
import API from "../api/api";

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await API.post("/users/login", { email, password });

            // Save JWT token for authenticated API calls
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            // Pass only the user object to parent
            if (data.user) {
                onLogin(data.user);
            }

            console.log("✅ Logged in user:", data.user);
        } catch (err) {
            console.error("Login failed:", err);
            alert(err.response?.data?.error || "Login failed, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleLogin}
            style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                maxWidth: "300px",
                margin: "auto",
            }}
        >
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
};

export default Login;

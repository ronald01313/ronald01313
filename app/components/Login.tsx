import { useState } from "react";
import { signIn } from "../lib/supabase";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setEmail("");
      setPassword("");
      // Redirect to home after successful login
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>Login</h2>

      {error && (
        <div style={{ padding: "10px", marginBottom: "20px", backgroundColor: "#fee", color: "#c00", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: "10px", marginBottom: "20px", backgroundColor: "#efe", color: "#060", borderRadius: "4px" }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
              boxSizing: "border-box",
              color: "#333",
            }}
            placeholder="your@email.com"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
              boxSizing: "border-box",
              color: "#333",
            }}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: isLoading ? "#ccc" : "rgb(33, 150, 243)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: isLoading ? "not-allowed" : "pointer",
            marginTop: "10px",
            transition: "all 0.3s ease",
          }}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
        Don't have an account? <a href="/register" style={{ color: "#333", textDecoration: "none", fontWeight: "500" }}>Register here</a>
      </p>
    </div>
  );
}

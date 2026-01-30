import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", margin: "0", padding: "0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 0",
            borderBottom: "2px solid #e0e0e0",
            marginBottom: "30px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
          }}
        >
          <h1 style={{ margin: "0", fontSize: "28px", color: "#333", cursor: "pointer" }}>
            <a href="/" style={{ textDecoration: "none", color: "#333" }}>
              📝 RHD Blog
            </a>
          </h1>
          <div style={{ display: "flex", gap: "15px" }}>
            <a
              href="/"
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "block",
              }}
            >
              Home
            </a>
            <a
              href="/create"
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "block",
              }}
            >
              Create Post
            </a>
            <a
              href="/manage"
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "block",
              }}
            >
              Manage Posts
            </a>
            <a
              href="/login"
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "block",
              }}
            >
              Login
            </a>
            <a
              href="/register"
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "block",
              }}
            >
              Register
            </a>
          </div>
        </nav>

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
}

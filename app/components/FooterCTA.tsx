export default function FooterCTA() {
  return (
    <section style={{ textAlign: "center", marginTop: "50px", padding: "30px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
      <h2 style={{ color: "#333", marginBottom: "10px" }}>Want to stay updated?</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>Subscribe to get new posts delivered to your inbox</p>
      <button
        style={{
          padding: "12px 30px",
          fontSize: "16px",
          backgroundColor: "rgb(255, 152, 0)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "500",
          transition: "all 0.3s ease",
        }}
      >
        Subscribe Now
      </button>
    </section>
  );
}

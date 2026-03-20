export default function Loading() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2px", marginBottom: "32px" }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ background: "var(--card)", padding: "28px" }}>
            <div className="skeleton" style={{ height: "10px", width: "60%", marginBottom: "16px" }} />
            <div className="skeleton" style={{ height: "44px", width: "80%" }} />
          </div>
        ))}
      </div>
      <div style={{ background: "var(--card)", padding: "28px" }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
            <div className="skeleton" style={{ height: "12px", width: "100px", marginBottom: "10px" }} />
            <div className="skeleton" style={{ height: "16px", width: "90%", marginBottom: "8px" }} />
            <div className="skeleton" style={{ height: "10px", width: "40%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

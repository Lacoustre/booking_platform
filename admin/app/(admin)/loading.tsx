export default function Loading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    }}>
      {/* KPI skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2px", marginBottom: "32px" }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ background: "var(--card)", padding: "28px", position: "relative", overflow: "hidden" }}>
            <div className="skeleton" style={{ height: "10px", width: "60%", marginBottom: "16px" }} />
            <div className="skeleton" style={{ height: "44px", width: "80%" }} />
            <div className="skeleton" style={{ height: "10px", width: "50%", marginTop: "12px" }} />
          </div>
        ))}
      </div>

      {/* Panel skeleton */}
      <div style={{ background: "var(--card)", padding: "28px" }}>
        <div className="skeleton" style={{ height: "14px", width: "200px", marginBottom: "24px" }} />
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ display: "flex", gap: "20px", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <div className="skeleton" style={{ height: "40px", width: "160px" }} />
            <div className="skeleton" style={{ height: "40px", width: "120px" }} />
            <div className="skeleton" style={{ height: "40px", width: "100px" }} />
            <div className="skeleton" style={{ height: "40px", flex: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

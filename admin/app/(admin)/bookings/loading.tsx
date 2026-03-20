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
        <div className="skeleton" style={{ height: "14px", width: "200px", marginBottom: "24px" }} />
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: "36px", width: "80px" }} />)}
        </div>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ display: "flex", gap: "16px", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
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

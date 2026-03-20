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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
        {[1,2].map(i => (
          <div key={i} style={{ background: "var(--card)", padding: "28px" }}>
            <div className="skeleton" style={{ height: "14px", width: "160px", marginBottom: "24px" }} />
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "160px" }}>
              {[40,70,55,85,45,100,60,75,50,90,65,80].map((h, j) => (
                <div key={j} className="skeleton" style={{ flex: 1, height: `${h}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

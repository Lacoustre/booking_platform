"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl: "/" });
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "var(--ink)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px",
        height: "600px",
        background: "radial-gradient(ellipse, rgba(214,63,168,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border2)",
        width: "100%",
        maxWidth: "420px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Top shimmer */}
        <div className="shimmer-line" />

        <div style={{ padding: "48px 40px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "9px",
              letterSpacing: "5px",
              color: "var(--fuchsia)",
              marginBottom: "8px",
            }}>
              Admin Portal
            </div>
            <div style={{
              fontFamily: "'Cormorant', serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "36px",
              background: "linear-gradient(90deg, var(--rose), var(--lavender), var(--gold2))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.1,
              marginBottom: "8px",
            }}>
              Trayart GH
            </div>
            <div style={{
              display: "inline-block",
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              letterSpacing: "2px",
              color: "var(--gold2)",
              background: "rgba(212,168,67,0.1)",
              border: "1px solid rgba(212,168,67,0.25)",
              padding: "2px 10px",
            }}>
              MAKEOVER STUDIO
            </div>
          </div>

          {/* Fields */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "9px",
              letterSpacing: "4px",
              color: "var(--muted2)",
              marginBottom: "8px",
            }}>Email</div>
            <input
              type="email"
              placeholder="admin@trayart.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--ink3)",
                border: "1px solid var(--border)",
                color: "var(--cream)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--fuchsia)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "9px",
              letterSpacing: "4px",
              color: "var(--muted2)",
              marginBottom: "8px",
            }}>Password</div>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--ink3)",
                border: "1px solid var(--border)",
                color: "var(--cream)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--fuchsia)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "14px",
              fontSize: "13px",
              opacity: loading ? 0.7 : 1,
              clipPath: "none",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

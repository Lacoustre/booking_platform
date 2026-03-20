"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    setReference(searchParams.get("reference") || searchParams.get("trxref"));
  }, [searchParams]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "72px", marginBottom: "24px", filter: "drop-shadow(0 0 30px rgba(214,63,168,0.5))" }}>✨</div>

      <h1 style={{ fontFamily: "'Cormorant', serif", fontSize: "clamp(36px,7vw,60px)", fontWeight: 700, fontStyle: "italic", background: "linear-gradient(90deg, var(--blush), var(--lavender))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px", lineHeight: 1.1 }}>
        Booking Confirmed
      </h1>
      <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: "22px", color: "var(--gold2)", marginBottom: "36px", filter: "drop-shadow(0 0 8px rgba(240,201,106,0.3))" }}>
        Your beauty journey begins here
      </div>

      <div style={{ background: "rgba(214,63,168,0.06)", border: "1px solid rgba(214,63,168,0.15)", borderRadius: "16px", padding: "28px 32px", marginBottom: "32px", textAlign: "left" }}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "10px", letterSpacing: "4px", color: "var(--fuchsia)", marginBottom: "16px" }}>PAYMENT RECEIVED</p>
        <p style={{ fontFamily: "'Didact Gothic', sans-serif", fontSize: "15px", color: "rgba(249,240,246,0.85)", lineHeight: 1.7, marginBottom: "12px" }}>
          🎉 Your deposit has been received and your date is now secured.
        </p>
        {reference && (
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "10px", letterSpacing: "2px", color: "rgba(249,240,246,0.4)" }}>
            REF: {reference}
          </p>
        )}
      </div>

      <div style={{ background: "rgba(214,63,168,0.04)", border: "1px solid rgba(214,63,168,0.1)", borderRadius: "12px", padding: "24px", marginBottom: "32px", textAlign: "left" }}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "10px", letterSpacing: "4px", color: "var(--fuchsia)", marginBottom: "16px" }}>WHAT HAPPENS NEXT</p>
        {[
          "A confirmation email has been sent to your inbox",
          "Tracy will contact you within 24 hours",
          "You'll discuss your vision and finalize all details",
          "Get ready to look absolutely stunning"
        ].map((step, i) => (
          <p key={i} style={{ fontFamily: "'Didact Gothic', sans-serif", fontSize: "14px", color: "rgba(249,240,246,0.8)", marginBottom: "10px", display: "flex", gap: "10px" }}>
            <span style={{ color: "var(--fuchsia)", flexShrink: 0 }}>✦</span> {step}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="nav-btn">✦ Back to Home</Link>
        <a href="https://instagram.com/trayart_gh" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "2px", color: "var(--blush)", border: "1px solid rgba(252,212,238,0.2)", padding: "12px 28px", borderRadius: "9999px", textDecoration: "none" }}>
          Follow @trayart_gh
        </a>
      </div>

      <p style={{ marginTop: "32px", fontSize: "13px", color: "rgba(249,240,246,0.45)" }}>
        Questions? <a href="https://wa.me/233542361468" style={{ color: "var(--gold2)", textDecoration: "none" }}>WhatsApp +233 54 236 1468</a>
      </p>
    </div>
  );
}

export default function BookingSuccess() {
  return (
    <main style={{ background: "#07000a", color: "#f9f0f6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "'Didact Gothic', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <Suspense fallback={<div style={{ textAlign: "center", color: "var(--fuchsia)" }}>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  );
}

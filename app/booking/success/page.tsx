"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BookingSuccess() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Get payment reference from URL params
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    if (reference || trxref) {
      setPaymentDetails({
        reference: reference || trxref,
        status: 'success'
      });
    }
  }, [searchParams]);

  return (
    <main style={{ 
      background: "#07000a", 
      color: "#f9f0f6", 
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Didact Gothic', sans-serif"
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "600px",
        padding: "60px 40px",
        background: "linear-gradient(135deg, rgba(107,26,138,0.1), rgba(214,63,168,0.05))",
        border: "1px solid rgba(214,63,168,0.2)",
        clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))"
      }}>
        {/* Success Icon */}
        <div style={{
          fontSize: "80px",
          marginBottom: "30px",
          background: "linear-gradient(90deg, #d63fa8, #c9a0f5, #f0c96a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          ✨
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontFamily: "'Cormorant', serif",
          fontSize: "48px",
          fontWeight: 700,
          fontStyle: "italic",
          background: "linear-gradient(90deg, #fcd4ee, #c9a0f5)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "20px",
          lineHeight: 1.2
        }}>
          Booking Confirmed
        </h1>

        {/* Subtitle */}
        <div style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: "24px",
          color: "#f0c96a",
          marginBottom: "40px",
          filter: "drop-shadow(0 0 10px rgba(240, 201, 106, 0.3))"
        }}>
          Your beauty journey begins here
        </div>

        {/* Success Messages */}
        <div style={{ marginBottom: "40px", lineHeight: 1.8 }}>
          <p style={{ 
            fontSize: "18px", 
            color: "#fef5fb", 
            marginBottom: "15px",
            fontWeight: 500
          }}>
            🎉 Your deposit has been received successfully
          </p>
          
          <p style={{ 
            fontSize: "16px", 
            color: "rgba(249,240,246,0.7)", 
            marginBottom: "15px" 
          }}>
            Tracy will contact you within 24 hours to finalize your session details
          </p>

          {paymentDetails?.reference && (
            <p style={{ 
              fontSize: "14px", 
              color: "rgba(249,240,246,0.5)",
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "2px"
            }}>
              Reference: {paymentDetails.reference}
            </p>
          )}
        </div>

        {/* Next Steps */}
        <div style={{
          background: "rgba(214,63,168,0.1)",
          padding: "30px",
          marginBottom: "40px",
          border: "1px solid rgba(214,63,168,0.2)",
          clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
        }}>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "16px",
            letterSpacing: "3px",
            color: "#d63fa8",
            marginBottom: "20px"
          }}>
            What Happens Next?
          </h3>
          
          <div style={{ textAlign: "left", fontSize: "14px", color: "rgba(249,240,246,0.8)" }}>
            <p style={{ marginBottom: "10px" }}>✦ Confirmation email sent to your inbox</p>
            <p style={{ marginBottom: "10px" }}>✦ Tracy will call you to discuss your vision</p>
            <p style={{ marginBottom: "10px" }}>✦ Schedule your trial session (if applicable)</p>
            <p>✦ Finalize all details for your special day</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <a 
            href="/"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "13px",
              letterSpacing: "3px",
              color: "white",
              background: "linear-gradient(135deg, #ec4899, #a855f7)",
              border: "none",
              padding: "12px 32px",
              borderRadius: "9999px",
              textDecoration: "none",
              display: "inline-block",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 20px rgba(236, 72, 153, 0.3)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(236, 72, 153, 0.5)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(236, 72, 153, 0.3)";
            }}
          >
            ✦ Back to Home
          </a>

          <a 
            href="https://instagram.com/trayart_gh"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "13px",
              letterSpacing: "3px",
              color: "#fcd4ee",
              background: "transparent",
              border: "1px solid rgba(252,212,238,0.25)",
              padding: "12px 32px",
              borderRadius: "9999px",
              textDecoration: "none",
              display: "inline-block",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#f08acc";
              e.currentTarget.style.color = "#f08acc";
              e.currentTarget.style.background = "rgba(214,63,168,0.08)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(252,212,238,0.25)";
              e.currentTarget.style.color = "#fcd4ee";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Follow @trayart_gh
          </a>
        </div>

        {/* Contact Info */}
        <div style={{
          marginTop: "40px",
          padding: "20px",
          borderTop: "1px solid rgba(214,63,168,0.2)",
          fontSize: "14px",
          color: "rgba(249,240,246,0.6)"
        }}>
          <p>Questions? WhatsApp: <a href="https://wa.me/233542361468" style={{ color: "#f0c96a" }}>+233 54 236 1468</a></p>
        </div>
      </div>
    </main>
  );
}
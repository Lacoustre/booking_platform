"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Regex constants to avoid recreation
const phoneRegex = /^[0-9+\-\s()]*$/;
const nameRegex = /^[a-zA-Z\s]*$/;

// Style constants to avoid recreation
const toastBaseStyle = {
  position: "fixed" as const,
  top: "20px",
  right: "20px",
  zIndex: 10000,
  padding: "16px 24px",
  borderRadius: "12px",
  color: "white",
  fontFamily: "Bebas Neue, sans-serif",
  fontSize: "14px",
  letterSpacing: "2px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  animation: "slideIn 0.3s ease-out"
};

const dateCheckIndicatorStyle = {
  color: "var(--fuchsia)",
  fontSize: "12px",
  marginTop: "4px"
};

const dateWrapperStyle = {
  position: "relative" as const,
  display: "flex",
  alignItems: "center"
};

const dateIconStyle = {
  position: "absolute" as const,
  right: "16px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--fuchsia)",
  pointerEvents: "none" as const,
  fontSize: "18px"
};

async function checkDateAvailability(date: string) {
  const res = await fetch(`/api/availability?date=${date}`);

  if (!res.ok) {
    throw new Error("Availability check failed");
  }

  const data = await res.json();

  if (!data.available) {
    throw { type: "UNAVAILABLE" };
  }

  return true;
};

type BookingForm = {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  package: string;
  location: string;
  dressColor: string;
  makeupType: string;
  message: string;
};

const initialFormState: BookingForm = {
  name: "",
  email: "",
  phone: "",
  eventDate: "",
  eventType: "",
  package: "",
  location: "",
  dressColor: "",
  makeupType: "",
  message: ""
};

function validateForm(data: BookingForm): string | null {
  const requiredFields = [
    { field: "name", label: "Full Name" },
    { field: "email", label: "Email Address" },
    { field: "phone", label: "Phone Number" },
    { field: "eventDate", label: "Event Date" },
    { field: "location", label: "Event Location" },
    { field: "makeupType", label: "Makeup Style" },
    { field: "package", label: "Package" },
    { field: "eventType", label: "Event Type" }
  ];

  for (const { field, label } of requiredFields) {
    if (!data[field as keyof BookingForm]) {
      return `Please fill in ${label}`;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return "Please enter a valid email address";
  }

  return null;
}

function sanitizeForm(data: BookingForm): BookingForm {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v
    ])
  ) as BookingForm;
}

export default function BookingPage() {
  const [formData, setFormData] = useState<BookingForm>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [checkingDate, setCheckingDate] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [minDate, setMinDate] = useState<string>("");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDateRef = useRef<string>("");
  const lastCheckedDateRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    setMinDate(new Date().toISOString().slice(0, 10));

    // Page loader
    const timer = setTimeout(() => setPageLoaded(true), 1200);

    async function fetchBookedDates() {
      try {
        const res = await fetch("/api/booked-dates");
        const data = await res.json();
        setBookedDates(data);
      } catch {
        console.error("Failed to load booked dates");
      }
    }

    fetchBookedDates();

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      clearTimeout(timer);
      mountedRef.current = false;
    };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    if (!mountedRef.current) return;
    if (toast?.message === message && toast?.type === type) return;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setToast(null);
      }
    }, 4000);
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (checkingDate) {
      showToast("Please wait while we verify the date.", "error");
      return;
    }
    
    // Honeypot spam check
    const form = e.target as HTMLFormElement;
    const honeypotField = form.elements.namedItem("company") as HTMLInputElement | null;
    
    if (honeypotField?.value) {
      return;
    }
    
    // Validate form
    const validationError = validateForm(formData);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setLoading(true);

    try {
      const sanitizedData = sanitizeForm(formData);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(sanitizedData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Server error");
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!data.success) {
        showToast(data.message || "Booking failed", "error");
        return;
      }

      // Initialize payment with Paystack
      const paymentResponse = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sanitizedData.email,
          package: sanitizedData.package,
          bookingId: data.bookingId
        })
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.url) {
        showToast('Payment initialization failed. Please try again.', 'error');
        return;
      }

      // Show detailed success message before redirect
      showToast('✓ Date reserved temporarily (30 mins) - Redirecting to payment...', 'success');
      
      // Redirect to Paystack payment page
      setTimeout(() => {
        window.location.href = paymentData.url;
      }, 2000);
    } catch (err) {
      console.error(err);
      showToast("Error sending booking request. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Phone number validation
    if (name === 'phone' && !phoneRegex.test(value)) {
      return;
    }
    
    // Name validation
    if (name === 'name' && !nameRegex.test(value)) {
      return;
    }

    // Fast exit for non-date fields
    if (name !== "eventDate") {
      setFormData(prev => {
        if (prev[name as keyof BookingForm] === value) return prev;
        return { ...prev, [name]: value };
      });
      return;
    }

    // Date availability check
    if (value) {
      if (bookedDates.includes(value)) {
        showToast("This date is already booked.", "error");
        return;
      }

      if (value === formData.eventDate) return;
      
      // Reset cache if different date
      if (value !== lastCheckedDateRef.current) {
        lastCheckedDateRef.current = null;
      }
      
      // Check cache to prevent duplicate API calls
      if (lastCheckedDateRef.current === value) {
        setFormData(prev => ({ ...prev, eventDate: value }));
        return;
      }
      
      currentDateRef.current = value;
      setCheckingDate(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 250));
        
        if (currentDateRef.current !== value) {
          setCheckingDate(false);
          return;
        }
        
        await checkDateAvailability(value);
        if (mountedRef.current) {
          lastCheckedDateRef.current = value;
        }
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'type' in error && error.type === "UNAVAILABLE") {
          showToast("This date is already booked. Please choose another.", "error");
          if (mountedRef.current) {
            setFormData(prev => ({ ...prev, eventDate: "" }));
          }
          return;
        }
        
        console.error(error);
        showToast("Could not verify availability. You can still submit the request.", "error");
      } finally {
        setCheckingDate(false);
      }
    }
    
    if (mountedRef.current) {
      setFormData(prev => ({ ...prev, eventDate: value }));
    }
  };

  return (
    <>
      {/* Page Loader */}
      <div className={`page-loader ${pageLoaded ? 'hidden' : ''}`}>
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading Trayart GH</div>
      </div>

      {/* Toast */}
      {toast && (
        <div 
          role="alert"
          aria-live="assertive"
          style={{
            ...toastBaseStyle,
            background: toast.type === 'success' 
              ? 'linear-gradient(135deg, #10b981, #059669)' 
              : 'linear-gradient(135deg, var(--fuchsia), var(--violet))'
          }}
        >
          {toast.message}
        </div>
      )}

      <main style={{ background: "#07000a", color: "#f9f0f6", fontFamily: "'Didact Gothic', sans-serif", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <Link href="/" className="nav-brand">
            <div className="nav-brand-name">Trayart GH Makeover</div>
          </Link>
          <Link href="/" className="nav-btn">← Back</Link>
        </div>
      </nav>

      {/* Booking Form */}
      <section style={{ padding: "clamp(100px, 15vw, 140px) clamp(20px, 5vw, 60px) 80px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div className="pre-label">Book Your Session</div>
          <h1 style={{ 
            fontFamily: "Cormorant, serif", 
            fontSize: "clamp(48px, 8vw, 80px)", 
            fontWeight: 700, 
            color: "var(--cream)",
            marginBottom: "20px"
          }}>
            Your <em style={{ 
              fontStyle: "italic",
              background: "linear-gradient(100deg, var(--hot), var(--rose), var(--lavender), var(--gold2))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Transformation</em> Awaits
          </h1>
          <p style={{ 
            fontSize: "18px", 
            color: "rgba(249,240,246,0.7)", 
            maxWidth: "600px", 
            margin: "0 auto" 
          }}>
            Fill out the form below and Tracy will get back to you within 24 hours to confirm your booking and discuss your vision.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "linear-gradient(135deg, rgba(42,0,64,0.4), rgba(16,0,24,0.6))",
          borderRadius: "clamp(16px, 4vw, 24px)",
          padding: "clamp(30px, 8vw, 60px)",
          border: "1px solid rgba(214,63,168,0.2)"
        }}>
          <div className="booking-grid">
            <input
              required
              id="name"
              aria-label="Full Name"
              autoComplete="name"
              maxLength={80}
              type="text"
              name="name"
              placeholder="Your Full Name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading || checkingDate}
              className="review-input"
            />
            <input
              required
              id="email"
              aria-label="Email Address"
              autoComplete="email"
              maxLength={120}
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || checkingDate}
              className="review-input"
            />
          </div>

          <div className="booking-grid">
            <input
              required
              inputMode="tel"
              id="phone"
              aria-label="Phone Number"
              autoComplete="tel"
              maxLength={20}
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading || checkingDate}
              className="review-input"
            />
            <div style={dateWrapperStyle}>
              <input
                required
                id="eventDate"
                aria-label="Event Date"
                type="date"
                name="eventDate"
                min={minDate}
                value={formData.eventDate}
                onChange={handleChange}
                disabled={loading || checkingDate}
                className="review-input"
                style={{ 
                  cursor: 'pointer',
                  colorScheme: 'dark',
                  paddingRight: '50px'
                }}
              />
              <div style={dateIconStyle}>
                📅
              </div>
            </div>
            {checkingDate && (
              <small style={dateCheckIndicatorStyle}>
                Checking date availability...
              </small>
            )}
            {toast?.message.includes("already booked") && (
              <small style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>
                Please choose another date
              </small>
            )}
          </div>

          <div className="booking-grid">
            <input
              required
              inputMode="text"
              id="location"
              aria-label="Event Location"
              autoComplete="address-line1"
              maxLength={120}
              type="text"
              name="location"
              placeholder="Event Location (e.g. East Legon, Accra)"
              value={formData.location}
              onChange={handleChange}
              disabled={loading || checkingDate}
              className="review-input"
            />
            <input
              id="dressColor"
              aria-label="Dress Color"
              maxLength={40}
              type="text"
              name="dressColor"
              placeholder="Dress Color"
              value={formData.dressColor}
              onChange={handleChange}
              disabled={loading || checkingDate}
              className="review-input"
            />
          </div>

          <div className="booking-grid">
            <select
              required
              id="makeupType"
              aria-label="Makeup Style"
              name="makeupType"
              value={formData.makeupType}
              onChange={handleChange}
              disabled={loading || checkingDate}
              className="review-input"
            >
              <option value="">Select Makeup Style</option>
              <option value="soft-glam">Soft Glam</option>
              <option value="full-glam">Full Glam</option>
              <option value="natural">Natural Glam</option>
              <option value="editorial">Editorial Glam</option>
              <option value="traditional">Traditional Bridal</option>
            </select>
            <select
              required
              id="package"
              aria-label="Package Selection"
              name="package"
              value={formData.package}
              onChange={handleChange}
              disabled={loading || checkingDate}
              className="review-input"
            >
              <option value="">Select Package</option>
              <option value="gold-3hrs">Gold - 3 Hours (GHS 2,000)</option>
              <option value="gold-hair">Gold + Hair (GHS 2,600)</option>
              <option value="gold-mum">Gold + Mum (GHS 3,100)</option>
              <option value="premium-full">Premium Full Day (GHS 3,400)</option>
              <option value="two-days-gold">Two Days Gold (GHS 3,600)</option>
              <option value="two-days-premium">Two Days Premium (GHS 5,000)</option>
              <option value="styling-two-days">Styling Two Days (GHS 4,300)</option>
              <option value="full-styling">Full Day + Styling (GHS 5,500)</option>
            </select>
          </div>

          <div className="booking-grid">
            <select
              required
              id="eventType"
              aria-label="Event Type"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              disabled={loading || checkingDate}
              className="review-input"
            >
              <option value="">Select Event Type</option>
              <option value="traditional-wedding">Traditional Wedding</option>
              <option value="white-wedding">White Wedding</option>
              <option value="both-weddings">Both Traditional & White</option>
              <option value="engagement">Engagement</option>
              <option value="photoshoot">Photoshoot</option>
              <option value="other">Other Event</option>
            </select>
          </div>

          <textarea
            id="message"
            aria-label="Additional Message"
            maxLength={500}
            name="message"
            placeholder="Tell us about your vision, any special requests, or questions you have..."
            value={formData.message}
            onChange={handleChange}
            disabled={loading || checkingDate}
            className="review-message"
            style={{ marginBottom: "20px" }}
          />
          <small style={{ color: "rgba(249,240,246,0.6)", fontSize: "12px", display: "block", marginBottom: "20px" }}>
            {formData.message.length}/500 characters
          </small>

          {/* Honeypot field for spam protection */}
          <input
            type="text"
            name="company"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="new-password"
          />

          <div style={{ textAlign: "center" }}>
            <button 
              type="submit" 
              className="review-submit"
              disabled={loading || checkingDate}
              style={{ 
                cursor: loading || checkingDate ? "not-allowed" : "pointer",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <span style={{ opacity: loading ? 0 : 1 }}>
                {loading ? "" : checkingDate ? "Checking Date..." : "✦ Book & Pay Deposit ✦"}
              </span>
              {loading && (
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  fontSize: "12px",
                  letterSpacing: "2px"
                }}>
                  <span style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid transparent",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                  PROCESSING
                </span>
              )}
            </button>
          </div>
        </form>

        <div style={{ 
          textAlign: "center", 
          marginTop: "40px", 
          padding: "30px", 
          background: "rgba(214,63,168,0.05)", 
          borderRadius: "16px",
          border: "1px solid rgba(214,63,168,0.1)"
        }}>
          <p style={{ fontSize: "16px", color: "rgba(249,240,246,0.8)", marginBottom: "15px", fontWeight: "500" }}>
            ✓ Your date will be reserved for 30 minutes
          </p>
          <p style={{ fontSize: "14px", color: "rgba(249,240,246,0.6)", marginBottom: "15px" }}>
            ✦ Complete payment to confirm your booking
          </p>
          <p style={{ fontSize: "14px", color: "rgba(249,240,246,0.6)", marginBottom: "15px" }}>
            ✦ A non-refundable deposit of GHS 1,000 is required for bridal packages
          </p>
          <p style={{ fontSize: "14px", color: "rgba(249,240,246,0.6)" }}>
            For urgent bookings or questions, WhatsApp us at +233 54 236 1468
          </p>
        </div>
      </section>
    </main>
    </>
  );
}
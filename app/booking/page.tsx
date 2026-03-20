"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, AsYouType } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

const nameRegex = /^[a-zA-Z\s]*$/;

type Country = { code: CountryCode; name: string; dial: string };

function codeToFlag(code: string): string {
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

function buildCountryList(): Country[] {
  const display = new Intl.DisplayNames(["en"], { type: "region" });
  return getCountries()
    .map((code) => ({
      code,
      name: display.of(code) ?? code,
      dial: `+${getCountryCallingCode(code)}`
    }))
    .sort((a, b) => {
      if (a.code === "GH") return -1;
      if (b.code === "GH") return 1;
      return a.name.localeCompare(b.name);
    });
}

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

type BookingForm = {
  name: string;
  email: string;
  phone: string;
  countryCode: CountryCode;
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
  countryCode: "GH",
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

  // Block past dates
  const today = new Date().toISOString().slice(0, 10);
  if (data.eventDate < today) {
    return "Please choose today or a future date";
  }

  // Phone validation
  const fullPhone = `+${getCountryCallingCode(data.countryCode)}${data.phone.replace(/\D/g, "")}`;
  const parsed = parsePhoneNumberFromString(fullPhone, data.countryCode);
  if (!parsed || !parsed.isValid()) {
    return "Please enter a valid phone number for the selected country";
  }

  return null;
}

function sanitizeForm(data: BookingForm): BookingForm {
  const sanitized = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v
    ])
  ) as BookingForm;
  // Store phone in full international format
  const fullPhone = `+${getCountryCallingCode(data.countryCode)}${data.phone.replace(/\D/g, "")}`;
  const parsed = parsePhoneNumberFromString(fullPhone, data.countryCode);
  sanitized.phone = parsed ? parsed.formatInternational() : fullPhone;
  return sanitized;
}

export default function BookingPage() {
  const [formData, setFormData] = useState<BookingForm>(initialFormState);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [checkingDate, setCheckingDate] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [minDate, setMinDate] = useState<string>("");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedDateRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    setMinDate(new Date().toISOString().slice(0, 10));
    setCountries(buildCountryList());

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countrySearch.trim()
    ? countries.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dial.includes(countrySearch)
      )
    : countries;

  const selectedCountry = countries.find(c => c.code === formData.countryCode);

  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const calendarDays = (() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, firstDay, daysInMonth };
  })();

  const formatCalDate = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    if (!mountedRef.current) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setToast(null);
    }, 4000);
  }, []);

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

  const validatePhone = useCallback((number: string, country: CountryCode) => {
    if (!number) { setPhoneError(null); return; }
    const formatted = new AsYouType(country).input(number);
    const fullPhone = `+${getCountryCallingCode(country)}${number.replace(/\D/g, "")}`;
    const parsed = parsePhoneNumberFromString(fullPhone, country);
    if (parsed && parsed.isValid()) {
      setPhoneError(null);
    } else if (number.replace(/\D/g, "").length >= 6) {
      setPhoneError("Invalid number for this country");
    } else {
      setPhoneError(null);
    }
    return formatted;
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Name validation
    if (name === 'name' && !nameRegex.test(value)) {
      return;
    }

    // Phone input — format as you type
    if (name === 'phone') {
      const digits = value.replace(/[^0-9]/g, "");
      const formatted = new AsYouType(formData.countryCode).input(digits);
      validatePhone(digits, formData.countryCode);
      setFormData(prev => ({ ...prev, phone: formatted }));
      return;
    }

    // Country code change — reset phone
    if (name === 'countryCode') {
      setFormData(prev => ({ ...prev, countryCode: value as CountryCode, phone: "" }));
      setPhoneError(null);
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
      // Block past dates
      if (value < minDate) {
        showToast("Please choose today or a future date.", "error");
        return;
      }

      if (bookedDates.includes(value)) {
        showToast("This date is already booked.", "error");
        return;
      }

      if (value === formData.eventDate) return;

      // Already verified this date
      if (lastCheckedDateRef.current === value) {
        setFormData(prev => ({ ...prev, eventDate: value }));
        return;
      }

      setCheckingDate(true);

      try {
        const res = await fetch(`/api/availability?date=${value}`);
        const data = await res.json();

        if (!data.available) {
          showToast("This date is already booked. Please choose another.", "error");
          return;
        }

        lastCheckedDateRef.current = value;
        if (mountedRef.current) {
          setFormData(prev => ({ ...prev, eventDate: value }));
        }
      } catch {
        // Network error — still allow selection
        if (mountedRef.current) {
          setFormData(prev => ({ ...prev, eventDate: value }));
        }
      } finally {
        if (mountedRef.current) setCheckingDate(false);
      }
      return;
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

        </div>
      </nav>

      {/* Booking Form */}
      <section className="booking-section">
        {/* Header */}
        <div className="booking-header">
          <div className="pre-label">Book Your Session</div>
          <h1 className="booking-title">
            Your <em style={{
              fontStyle: "italic",
              background: "linear-gradient(100deg, var(--hot), var(--rose), var(--lavender), var(--gold2))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Transformation</em> Awaits
          </h1>
          <p className="booking-subtitle">
            Fill out the form below and Tracy will get back to you within 24 hours to confirm your booking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">

          {/* Section: Personal Info */}
          <p className="form-section-label">Personal Details</p>
          <div className="booking-grid">
            <div className="field-wrap">
              <label className="field-label">Full Name</label>
              <input required id="name" autoComplete="name" maxLength={80} type="text" name="name"
                placeholder="e.g. Abena Mensah" value={formData.name} onChange={handleChange}
                disabled={loading || checkingDate} className="review-input" />
            </div>
            <div className="field-wrap">
              <label className="field-label">Email Address</label>
              <input required id="email" autoComplete="email" maxLength={120} type="email" name="email"
                placeholder="e.g. abena@email.com" value={formData.email} onChange={handleChange}
                disabled={loading || checkingDate} className="review-input" />
            </div>
          </div>

          {/* Section: Contact & Date */}
          <p className="form-section-label">Contact & Date</p>
          <div className="booking-grid">
            <div className="field-wrap">
              <label className="field-label">Phone Number</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <div ref={countryRef} style={{ position: "relative", flexShrink: 0 }}>
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => { setCountryOpen(o => !o); setCountrySearch(""); }}
                    disabled={loading || checkingDate}
                    className="review-input country-trigger"
                    aria-label="Select country code"
                  >
                    {selectedCountry ? `${codeToFlag(selectedCountry.code)} ${selectedCountry.dial}` : "🌍"}
                    <span style={{ marginLeft: "4px", opacity: 0.5, fontSize: "10px" }}>▾</span>
                  </button>

                  {/* Dropdown */}
                  {countryOpen && (
                    <div className="country-dropdown">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search country or code..."
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        className="country-search"
                      />
                      <ul className="country-list">
                        {filteredCountries.length === 0 && (
                          <li className="country-empty">No results</li>
                        )}
                        {filteredCountries.map(({ code, name, dial }) => (
                          <li
                            key={code}
                            className={`country-option${formData.countryCode === code ? " active" : ""}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, countryCode: code, phone: "" }));
                              setPhoneError(null);
                              setCountryOpen(false);
                              setCountrySearch("");
                            }}
                          >
                            <span>{codeToFlag(code)}</span>
                            <span className="country-name">{name}</span>
                            <span className="country-dial">{dial}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <input required inputMode="tel" id="phone" autoComplete="tel" maxLength={20} type="tel"
                    name="phone" placeholder="54 236 1468" value={formData.phone} onChange={handleChange}
                    disabled={loading || checkingDate}
                    className={`review-input${phoneError ? " input-error" : ""}`}
                    style={{ width: "100%" }} />
                  {formData.phone && !phoneError && (() => {
                    const full = `+${getCountryCallingCode(formData.countryCode)}${formData.phone.replace(/\D/g, "")}`;
                    const p = parsePhoneNumberFromString(full, formData.countryCode);
                    return p?.isValid() ? (
                      <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#10b981", fontSize: "13px" }}>✓</span>
                    ) : null;
                  })()}
                </div>
              </div>
              {phoneError
                ? <small className="field-hint" style={{ color: "#f87171" }}>{phoneError}</small>
                : <small className="field-hint">{selectedCountry?.dial} · {selectedCountry?.name}</small>
              }
            </div>
            <div className="field-wrap">
              <label className="field-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Event Date</span>
                {formData.eventDate && (
                  <button type="button" onClick={() => {
                    setFormData(prev => ({ ...prev, eventDate: "" }));
                    lastCheckedDateRef.current = null;
                  }} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "9px", letterSpacing: "2px", color: "var(--fuchsia)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    CLEAR
                  </button>
                )}
              </label>

              {/* Visual Calendar */}
              <div className="booking-calendar">
                {/* Month nav */}
                <div className="cal-header">
                  <button type="button" className="cal-nav" onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>&#8249;</button>
                  <span className="cal-month">
                    {calendarDate.toLocaleString("default", { month: "long", year: "numeric" })}
                  </span>
                  <button type="button" className="cal-nav" onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>&#8250;</button>
                </div>

                {/* Day labels */}
                <div className="cal-grid">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                    <div key={d} className="cal-day-label">{d}</div>
                  ))}

                  {/* Empty cells */}
                  {Array(calendarDays.firstDay).fill(null).map((_, i) => (
                    <div key={`e${i}`} />
                  ))}

                  {/* Day cells */}
                  {Array(calendarDays.daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const dateStr = formatCalDate(calendarDays.year, calendarDays.month, day);
                    const isPast = dateStr < minDate;
                    const isBooked = bookedDates.includes(dateStr);
                    const isSelected = formData.eventDate === dateStr;
                    const isToday = dateStr === minDate;

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast || isBooked || loading || checkingDate}
                        onClick={() => {
                          if (isPast || isBooked) return;
                          const syntheticEvent = {
                            target: { name: "eventDate", value: dateStr }
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleChange(syntheticEvent);
                        }}
                        className={`cal-day${
                          isSelected ? " cal-selected" :
                          isBooked ? " cal-booked" :
                          isPast ? " cal-past" :
                          isToday ? " cal-today" : ""
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="cal-legend">
                  <span><span className="cal-dot cal-dot-avail" />Available</span>
                  <span><span className="cal-dot cal-dot-booked" />Booked</span>
                  <span><span className="cal-dot cal-dot-selected" />Selected</span>
                </div>

                {formData.eventDate && (
                  <p className="cal-selected-label">
                    ✦ {new Date(formData.eventDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
              {checkingDate && <small className="field-hint" style={{ color: "var(--fuchsia)", marginTop: "8px", display: "block" }}>Checking availability...</small>}
            </div>
          </div>

          {/* Section: Event Details */}
          <p className="form-section-label">Event Details</p>
          <div className="booking-grid">
            <div className="field-wrap">
              <label className="field-label">Location</label>
              <input required id="location" autoComplete="address-line1" maxLength={120} type="text"
                name="location" placeholder="e.g. East Legon, Accra" value={formData.location}
                onChange={handleChange} disabled={loading || checkingDate} className="review-input" />
            </div>
            <div className="field-wrap">
              <label className="field-label">Dress Color <span className="field-optional">(optional)</span></label>
              <input id="dressColor" maxLength={40} type="text" name="dressColor"
                placeholder="e.g. Ivory, Champagne" value={formData.dressColor}
                onChange={handleChange} disabled={loading || checkingDate} className="review-input" />
            </div>
          </div>

          {/* Section: Package & Style */}
          <p className="form-section-label">Package & Style</p>
          <div className="booking-grid">
            <div className="field-wrap">
              <label className="field-label">Makeup Style</label>
              <select required id="makeupType" name="makeupType" value={formData.makeupType}
                onChange={handleChange} disabled={loading || checkingDate} className="review-input">
                <option value="">Select style...</option>
                <option value="soft-glam">Soft Glam</option>
                <option value="full-glam">Full Glam</option>
                <option value="natural">Natural Glam</option>
                <option value="editorial">Editorial Glam</option>
                <option value="traditional">Traditional Bridal</option>
              </select>
            </div>
            <div className="field-wrap">
              <label className="field-label">Package</label>
              <select required id="package" name="package" value={formData.package}
                onChange={handleChange} disabled={loading || checkingDate} className="review-input">
                <option value="">Select package...</option>
                <option value="gold-3hrs">Gold · 3 Hours — GHS 2,000</option>
                <option value="gold-hair">Gold + Hair — GHS 2,600</option>
                <option value="gold-mum">Gold + Mum — GHS 3,100</option>
                <option value="premium-full">Premium Full Day — GHS 3,400</option>
                <option value="two-days-gold">Two Days Gold — GHS 3,600</option>
                <option value="two-days-premium">Two Days Premium — GHS 5,000</option>
                <option value="styling-two-days">Styling Two Days — GHS 4,300</option>
                <option value="full-styling">Full Day + Styling — GHS 5,500</option>
                <option disabled value="">── Bridesmaids (4+) ──</option>
                <option value="bridesmaid-soft">Bridesmaids Soft Glam — GHS 450/person</option>
                <option value="bridesmaid-full">Bridesmaids Full Glam — GHS 500/person</option>
              </select>
            </div>
          </div>
          <div className="field-wrap" style={{ marginBottom: "24px" }}>
            <label className="field-label">Event Type</label>
            <select required id="eventType" name="eventType" value={formData.eventType}
              onChange={handleChange} disabled={loading || checkingDate} className="review-input">
              <option value="">Select event type...</option>
              <option value="traditional-wedding">Traditional Wedding</option>
              <option value="white-wedding">White Wedding</option>
              <option value="both-weddings">Both Traditional & White</option>
              <option value="engagement">Engagement</option>
              <option value="photoshoot">Photoshoot</option>
              <option value="other">Other Event</option>
            </select>
          </div>

          {/* Message */}
          <div className="field-wrap">
            <label className="field-label">Additional Notes <span className="field-optional">(optional)</span></label>
            <textarea id="message" maxLength={500} name="message"
              placeholder="Tell us about your vision, special requests, or any questions..."
              value={formData.message} onChange={handleChange}
              disabled={loading || checkingDate} className="review-message" />
            <small className="field-hint" style={{ textAlign: "right", display: "block", marginTop: "6px" }}>
              {formData.message.length}/500
            </small>
          </div>

          {/* Honeypot */}
          <input type="text" name="company" style={{ display: "none" }} tabIndex={-1} autoComplete="new-password" />

          {/* Submit */}
          <div style={{ textAlign: "center", marginTop: "36px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <button type="submit" className="booking-submit" disabled={loading || checkingDate}>
              <span style={{ opacity: loading ? 0 : 1 }}>
                {checkingDate ? "Checking Date..." : "✦ Book & Pay Deposit ✦"}
              </span>
              {loading && (
                <span className="submit-spinner">
                  <span className="spinner-ring" />
                  PROCESSING
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormState);
                setPhoneError(null);
                lastCheckedDateRef.current = null;
              }}
              disabled={loading}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "10px", letterSpacing: "3px", color: "rgba(249,240,246,0.4)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--fuchsia)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(249,240,246,0.4)")}
            >
              RESET FORM
            </button>
          </div>
        </form>

        {/* Info strip */}
        <div className="booking-info-strip">
          <span>✓ Date reserved for 30 mins</span>
          <span className="strip-divider">·</span>
          <span>✦ Bridal: GHS 1,000 non-refundable deposit</span>
          <span className="strip-divider">·</span>
          <span>✦ Non-bridal: 50% deposit required</span>
          <span className="strip-divider">·</span>
          <span>WhatsApp <a href="https://wa.me/233542361468" style={{ color: "var(--fuchsia)", textDecoration: "none" }}>+233 54 236 1468</a></span>
        </div>
      </section>
    </main>
    </>
  );
}
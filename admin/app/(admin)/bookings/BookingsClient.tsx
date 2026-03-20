"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Activity = {
  id: string;
  action: string;
  note: string | null;
  createdAt: Date;
};

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  package: string;
  location: string;
  dressColor: string | null;
  makeupType: string;
  message: string | null;
  packagePrice: number | null;
  depositAmount: number | null;
  paymentStatus: string;
  paymentRef: string | null;
  status: string;
  adminNotes: string | null;
  paidAt: Date | null;
  createdAt: Date;
  activity: Activity[];
};

const PILL = (s: string) =>
  s === "confirmed" ? "confirmed"
  : s === "completed" ? "completed"
  : s === "cancelled" ? "cancelled"
  : s === "in-progress" ? "completed"
  : "pending";

const LABEL = (s: string) =>
  ({ "pending-payment": "Awaiting Payment", pending: "Awaiting Payment",
     paid: "Paid", confirmed: "Confirmed", "in-progress": "In Progress",
     completed: "Completed", cancelled: "Cancelled", "refund-requested": "Refund Req." }[s] ?? s);

const WA_MESSAGES = (b: Booking) => ({
  payment: `Hi ${b.name}! 👋 This is a reminder that your deposit of GHS ${b.depositAmount?.toLocaleString()} for your ${b.package} on ${b.eventDate} is still outstanding. Please complete payment to secure your date. Thank you! 💕 — Trayart GH`,
  confirm: `Hi ${b.name}! 🎉 Your booking for ${b.package} on ${b.eventDate} has been confirmed! We're so excited to glam you up. See you soon! 💄✨ — Trayart GH`,
  reminder: `Hi ${b.name}! 💄 Just a friendly reminder that your appointment is on ${b.eventDate}. Please arrive on time and come with a clean face. Can't wait to see you! 💕 — Trayart GH`,
  thankyou: `Hi ${b.name}! 🌟 Thank you so much for choosing Trayart GH! It was an absolute pleasure working with you. We'd love it if you left us a review. You looked absolutely stunning! 💕 — Trayart GH`,
});

export default function BookingsClient({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Filter + search
  const filtered = bookings
    .filter(b => {
      if (filter === "all") return true;
      if (filter === "unpaid") return b.paymentStatus === "unpaid";
      if (filter === "paid") return b.paymentStatus === "paid";
      return b.status === filter;
    })
    .filter(b => {
      if (!search) return true;
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.phone.includes(q) || (b.paymentRef || "").toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
    });

  const counts = {
    all: bookings.length,
    "pending-payment": bookings.filter(b => b.status === "pending-payment" || b.status === "pending").length,
    paid: bookings.filter(b => b.paymentStatus === "paid").length,
    unpaid: bookings.filter(b => b.paymentStatus === "unpaid").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  const totalRevenue = bookings.reduce((s, b) => s + (b.depositAmount || 0), 0);
  const pendingAmt = bookings.filter(b => b.paymentStatus === "unpaid").reduce((s, b) => s + (b.depositAmount || 0), 0);

  const updateStatus = async (id: string, status: string) => {
    setLoading(id + status);
    await fetch("/api/admin/update-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLoading(null);
    router.refresh();
    if (drawer?.id === id) setDrawer(prev => prev ? { ...prev, status } : null);
  };

  const saveNotes = async () => {
    if (!drawer) return;
    setSavingNotes(true);
    await fetch("/api/admin/update-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: drawer.id, status: drawer.status, adminNotes: notes }),
    });
    setSavingNotes(false);
    router.refresh();
  };

  const openDrawer = (b: Booking) => {
    setDrawer(b);
    setNotes(b.adminNotes || "");
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "unpaid", label: "Unpaid" },
    { key: "paid", label: "Paid" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi gold-accent">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">GHS {totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue}</div>
          <div className="kpi-change up">↑ From deposits</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Bookings</div>
          <div className="kpi-value">{counts.all}</div>
          <div className="kpi-change up">↑ {counts.confirmed} confirmed</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Pending Deposits</div>
          <div className="kpi-value">{counts.unpaid}</div>
          <div className="kpi-change flat">GHS {pendingAmt.toLocaleString()} outstanding</div>
        </div>
        <div className="kpi gold-accent">
          <div className="kpi-label">Completed</div>
          <div className="kpi-value">{counts.completed}</div>
          <div className="kpi-change up">↑ Jobs done</div>
        </div>
      </div>

      {/* Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">All Bookings</div>
            <div className="panel-sub">{filtered.length} records · click row to open details</div>
          </div>
          {/* Search */}
          <div className="search-bar" style={{ width: "260px" }}>
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Name, phone, payment ref…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`tab ${filter === t.key ? "active" : ""}`}
              onClick={() => setFilter(t.key)}
              style={{ background: "none", border: "none" }}
            >
              {t.label}
              {(counts[t.key as keyof typeof counts] ?? 0) > 0 && (
                <span className="nav-badge" style={{ marginLeft: "6px", fontSize: "9px" }}>
                  {counts[t.key as keyof typeof counts]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Package</th>
                <th>Event Date</th>
                <th>Price</th>
                <th>Deposit</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => openDrawer(b)}>
                  <td>
                    <span className="cell-name">{b.name}</span>
                    <span className="cell-sub">{b.phone}</span>
                    <span className="cell-sub">{b.email}</span>
                  </td>
                  <td>
                    <span className="cell-mono">{b.package}</span>
                    <span className="cell-sub">{b.eventType}</span>
                  </td>
                  <td>
                    <span className="cell-mono">{b.eventDate}</span>
                    <span className="cell-sub">{b.location}</span>
                  </td>
                  <td><span className="cell-price">GHS {b.packagePrice?.toLocaleString() ?? "—"}</span></td>
                  <td><span className="cell-price">GHS {b.depositAmount?.toLocaleString() ?? "—"}</span></td>
                  <td>
                    <span className={`pill ${b.paymentStatus === "paid" ? "confirmed" : "pending"}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td><span className={`pill ${PILL(b.status)}`}>{LABEL(b.status)}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      {b.status !== "confirmed" && b.status !== "completed" && b.status !== "cancelled" && (
                        <button className="review-btn approve" disabled={loading === b.id + "confirmed"} onClick={() => updateStatus(b.id, "confirmed")}>✓</button>
                      )}
                      {b.status === "confirmed" && (
                        <button className="review-btn" style={{ borderColor: "rgba(214,63,168,0.4)", color: "var(--rose)" }} disabled={loading === b.id + "completed"} onClick={() => updateStatus(b.id, "completed")}>★</button>
                      )}
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <button className="review-btn" style={{ borderColor: "rgba(248,113,113,0.3)", color: "var(--red)" }} disabled={loading === b.id + "cancelled"} onClick={() => updateStatus(b.id, "cancelled")}>✕</button>
                      )}
                      <a
                        href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="review-btn"
                        style={{ borderColor: "rgba(74,222,128,0.3)", color: "var(--green)", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                        onClick={e => e.stopPropagation()}
                      >💬</a>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "60px", color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SIDE DRAWER ─────────────────────────────── */}
      {drawer && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawer(null)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(6,0,10,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 200,
            }}
          />

          {/* Drawer */}
          <div style={{
            position: "fixed",
            top: 0, right: 0, bottom: 0,
            width: "clamp(320px, 480px, 100vw)",
            background: "var(--panel)",
            borderLeft: "1px solid var(--border2)",
            zIndex: 201,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            animation: "drawer-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: "28px",
              borderBottom: "1px solid var(--border)",
              background: "linear-gradient(135deg, rgba(214,63,168,0.08), transparent)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant', serif", fontStyle: "italic", fontWeight: 700, fontSize: "26px", color: "var(--cream)", lineHeight: 1.1 }}>
                    {drawer.name}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "9px", letterSpacing: "4px", color: "var(--fuchsia)", marginTop: "4px" }}>
                    {drawer.package}
                  </div>
                </div>
                <button
                  onClick={() => setDrawer(null)}
                  style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", width: "32px", height: "32px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >✕</button>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span className={`pill ${PILL(drawer.status)}`}>{LABEL(drawer.status)}</span>
                <span className={`pill ${drawer.paymentStatus === "paid" ? "confirmed" : "pending"}`}>{drawer.paymentStatus}</span>
              </div>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: "24px", flex: 1 }}>

              {/* Client Details Grid */}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "9px", letterSpacing: "5px", color: "var(--muted2)", marginBottom: "16px" }}>
                Client Details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                {[
                  { label: "Phone", value: drawer.phone },
                  { label: "Email", value: drawer.email },
                  { label: "Event Date", value: drawer.eventDate },
                  { label: "Event Type", value: drawer.eventType },
                  { label: "Location", value: drawer.location },
                  { label: "Makeup Type", value: drawer.makeupType },
                  { label: "Dress Color", value: drawer.dressColor || "—" },
                  { label: "Package Price", value: `GHS ${drawer.packagePrice?.toLocaleString() ?? "—"}` },
                  { label: "Deposit", value: `GHS ${drawer.depositAmount?.toLocaleString() ?? "—"}` },
                  { label: "Payment Ref", value: drawer.paymentRef || "—" },
                  { label: "Paid At", value: drawer.paidAt ? new Date(drawer.paidAt).toLocaleDateString("en-GB") : "—" },
                  { label: "Booked On", value: new Date(drawer.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "8px", letterSpacing: "3px", color: "var(--muted2)", marginBottom: "3px" }}>{item.label}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--cream)" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Message */}
              {drawer.message && (
                <div style={{ padding: "16px", background: "var(--ink3)", borderLeft: "2px solid var(--fuchsia)", marginBottom: "24px" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "8px", letterSpacing: "3px", color: "var(--muted2)", marginBottom: "8px" }}>Client Message</div>
                  <div style={{ fontFamily: "'Cormorant', serif", fontStyle: "italic", fontSize: "15px", color: "var(--cream)", lineHeight: 1.6 }}>
                    "{drawer.message}"
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "9px", letterSpacing: "5px", color: "var(--muted2)", marginBottom: "12px" }}>
                Update Status
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                {[
                  { status: "confirmed", label: "✓ Confirm", color: "rgba(74,222,128,0.2)", border: "rgba(74,222,128,0.4)", text: "var(--green)" },
                  { status: "in-progress", label: "▶ In Progress", color: "rgba(214,63,168,0.15)", border: "rgba(214,63,168,0.4)", text: "var(--rose)" },
                  { status: "completed", label: "★ Complete", color: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.4)", text: "var(--lavender)" },
                  { status: "cancelled", label: "✕ Cancel", color: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", text: "var(--red)" },
                ].map(action => (
                  <button
                    key={action.status}
                    disabled={drawer.status === action.status || loading === drawer.id + action.status}
                    onClick={() => updateStatus(drawer.id, action.status)}
                    style={{
                      padding: "8px 14px",
                      background: drawer.status === action.status ? action.color : "transparent",
                      border: `1px solid ${action.border}`,
                      color: action.text,
                      cursor: drawer.status === action.status ? "default" : "pointer",
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      opacity: drawer.status === action.status ? 1 : 0.7,
                      transition: "all 0.2s",
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* WhatsApp Quick Messages */}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "9px", letterSpacing: "5px", color: "var(--muted2)", marginBottom: "12px" }}>
                WhatsApp Quick Messages
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "24px" }}>
                {Object.entries(WA_MESSAGES(drawer)).map(([key, msg]) => (
                  <a
                    key={key}
                    href={`https://wa.me/${drawer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qa-btn"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="qa-icon">💬</span>
                    <span className="qa-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span className="qa-sub">Send via WhatsApp</span>
                  </a>
                ))}
              </div>

              {/* Admin Notes */}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "9px", letterSpacing: "5px", color: "var(--muted2)", marginBottom: "12px" }}>
                Admin Notes (Private)
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Likes soft glam, usually arrives early, VIP client…"
                style={{
                  width: "100%",
                  minHeight: "80px",
                  background: "var(--ink3)",
                  border: "1px solid var(--border)",
                  color: "var(--cream)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "12px",
                  padding: "12px",
                  resize: "vertical",
                  outline: "none",
                  marginBottom: "8px",
                }}
              />
              <button
                className="btn-primary"
                style={{ fontSize: "10px", padding: "8px 18px" }}
                onClick={saveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? "Saving…" : "Save Notes"}
              </button>

              {/* Activity Log */}
              {drawer.activity && drawer.activity.length > 0 && (
                <>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "9px", letterSpacing: "5px", color: "var(--muted2)", margin: "24px 0 12px" }}>
                    Activity Log
                  </div>
                  <div className="activity-list">
                    {drawer.activity.map(a => (
                      <div key={a.id} className="activity-item">
                        <div className="activity-dot pink" />
                        <div>
                          <div className="activity-text">{a.action}</div>
                          {a.note && <div className="activity-text" style={{ color: "var(--muted)", fontSize: "12px" }}>{a.note}</div>}
                          <div className="activity-time">
                            {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {new Date(a.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

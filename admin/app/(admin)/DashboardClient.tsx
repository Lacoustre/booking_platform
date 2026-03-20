"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Booking = {
  id: string;
  name: string;
  phone: string;
  email: string;
  package: string;
  eventDate: string;
  location: string;
  status: string;
  paymentStatus: string;
  depositAmount: number | null;
  packagePrice: number | null;
  createdAt: Date;
};

type Review = {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  approved: boolean;
  createdAt: Date;
};

type Stats = {
  totalBookings: number;
  thisMonthBookings: number;
  confirmed: number;
  pending: number;
  completed: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
  pendingDepositAmount: number;
  avgOrderValue: number;
  topPackage: string;
  avgRating: string;
  totalReviews: number;
  pendingReviewsCount: number;
};

type MonthlyData = { month: string; revenue: number; bookings: number };
type PackageStat = { name: string; count: number };

export default function DashboardClient({
  stats,
  monthlyData,
  packageStats,
  recentBookings,
  pendingReviews,
  bookedDates,
}: {
  stats: Stats;
  monthlyData: MonthlyData[];
  packageStats: PackageStat[];
  recentBookings: Booking[];
  pendingReviews: Review[];
  bookedDates: string[];
}) {
  const router = useRouter();
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const now = new Date();
  const today = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOffset = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;

  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  const maxPkg = Math.max(...packageStats.map(p => p.count), 1);

  const handleReview = async (id: string, action: "approve" | "reject") => {
    setReviewLoading(id + action);
    await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setReviewLoading(null);
    router.refresh();
  };

  const pillClass = (status: string) =>
    status === "confirmed" ? "confirmed"
    : status === "completed" ? "completed"
    : status === "cancelled" ? "cancelled"
    : "pending";

  return (
    <div>
      {/* ── KPI ROW ─────────────────────────────────── */}
      <div className="kpi-row">
        <div className="kpi gold-accent">
          <div className="kpi-label">Revenue · This Month</div>
          <div className="kpi-value">
            GHS {stats.thisMonthRevenue >= 1000
              ? `${(stats.thisMonthRevenue / 1000).toFixed(1)}k`
              : stats.thisMonthRevenue.toLocaleString()}
          </div>
          <div className={`kpi-change ${stats.revenueGrowth >= 0 ? "up" : "down"}`}>
            {stats.revenueGrowth >= 0 ? "↑" : "↓"} {Math.abs(stats.revenueGrowth)}% vs last month
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Bookings · This Month</div>
          <div className="kpi-value">{stats.thisMonthBookings}</div>
          <div className="kpi-change up">↑ {stats.totalBookings} total all time</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Pending Deposits</div>
          <div className="kpi-value">{stats.pending}</div>
          <div className="kpi-change flat">
            GHS {stats.pendingDepositAmount.toLocaleString()} outstanding
          </div>
        </div>

        <div className="kpi gold-accent">
          <div className="kpi-label">Avg Rating</div>
          <div className="kpi-value">★ {stats.avgRating}</div>
          <div className="kpi-change up">↑ {stats.totalReviews} reviews total</div>
        </div>
      </div>

      {/* ── SECONDARY KPI ROW ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2px", marginBottom: "32px" }}>
        {[
          { label: "Confirmed", value: stats.confirmed, sub: "Deposits paid", color: "var(--green)" },
          { label: "Completed", value: stats.completed, sub: "Jobs done", color: "var(--rose)" },
          { label: "Avg Order Value", value: `GHS ${stats.avgOrderValue.toLocaleString()}`, sub: "Per booking", color: "var(--gold2)" },
          { label: "Top Package", value: stats.topPackage, sub: "This month", color: "var(--lavender)", small: true },
        ].map((item) => (
          <div key={item.label} style={{
            background: "var(--card)",
            padding: "20px 24px",
            borderTop: `2px solid ${item.color}`,
            position: "relative",
            overflow: "hidden",
          }}>
            <div className="kpi-label">{item.label}</div>
            <div style={{
              fontFamily: item.small ? "'Bebas Neue', sans-serif" : "'Cormorant', serif",
              fontStyle: item.small ? "normal" : "italic",
              fontWeight: 700,
              fontSize: item.small ? "18px" : "32px",
              letterSpacing: item.small ? "2px" : "0",
              color: item.color,
              lineHeight: 1.2,
              marginTop: "8px",
            }}>{item.value}</div>
            <div className="kpi-change flat" style={{ marginTop: "6px" }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* ── ROW 1: BOOKINGS TABLE + CALENDAR ────────── */}
      <div className="grid-2">
        {/* Recent Bookings */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Recent Bookings</div>
              <div className="panel-sub">Latest confirmed & pending appointments</div>
            </div>
            <Link href="/bookings" className="panel-action">View all →</Link>
          </div>

          <div className="tabs">
            <div className="tab active">All</div>
            <div className="tab">Confirmed</div>
            <div className="tab">Pending</div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Package</th>
                <th>Date</th>
                <th>GHS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => router.push("/bookings")}>
                  <td>
                    <span className="cell-name">{b.name}</span>
                    <span className="cell-sub">{b.phone}</span>
                  </td>
                  <td><span className="cell-mono">{b.package}</span></td>
                  <td><span className="cell-mono">{b.eventDate}</span></td>
                  <td><span className="cell-price">{b.packagePrice?.toLocaleString() ?? "—"}</span></td>
                  <td>
                    <span className={`pill ${pillClass(b.status)}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {/* Calendar */}
          <div className="panel">
            <div className="cal-header">
              <div className="cal-month">
                {now.toLocaleString("default", { month: "long" })} {now.getFullYear()}
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                color: "var(--muted2)",
              }}>
                {bookedDates.length} booked
              </div>
            </div>
            <div className="cal-grid">
              {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
                <div key={d} className="cal-day-label">{d}</div>
              ))}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`e${i}`} className="cal-day empty" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const hasBooking = bookedDates.some(d => d.startsWith(dateStr));
                return (
                  <div
                    key={day}
                    className={`cal-day ${day === today ? "today" : ""} ${hasBooking ? "has-booking" : ""}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <div className="panel-title">Upcoming</div>
              <Link href="/bookings" className="panel-action">All →</Link>
            </div>
            {recentBookings.slice(0, 3).map((b, i) => (
              <div key={b.id} className={`booking-card ${i % 2 === 1 ? "gold-border" : ""}`}>
                <div className="booking-card-name">{b.name}</div>
                <div className="booking-card-pkg">{b.package}</div>
                <div className="booking-card-meta">
                  <span className="booking-card-date">{b.eventDate}</span>
                  <span className={`pill ${pillClass(b.status)}`} style={{ fontSize: "8px", padding: "2px 8px" }}>
                    {b.status}
                  </span>
                  <span className="booking-card-price">
                    GHS {b.packagePrice?.toLocaleString() ?? "—"}
                  </span>
                </div>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <p style={{ color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "12px", textAlign: "center", padding: "20px 0" }}>
                No upcoming bookings
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: "2px" }} />

      {/* ── ROW 2: CHARTS + REVIEWS + ACTIVITY ──────── */}
      <div className="grid-3">
        {/* Revenue Chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Monthly Revenue</div>
              <div className="panel-sub">GHS · Last 6 months</div>
            </div>
          </div>
          <div className="chart-bars">
            {monthlyData.map((m, i) => (
              <div key={m.month} className="chart-bar-wrap">
                <div
                  className={`chart-bar ${i === monthlyData.length - 1 ? "gold-bar" : ""}`}
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}%` }}
                >
                  <span className="chart-val">
                    {m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue}
                  </span>
                </div>
                <div className="chart-label">{m.month}</div>
              </div>
            ))}
          </div>

          <div className="section-divider" />

          {/* Donut */}
          <div className="donut-wrap">
            <div className="donut" style={{
              background: `conic-gradient(var(--fuchsia) 0deg ${Math.round((stats.confirmed / Math.max(stats.totalBookings, 1)) * 360)}deg, var(--ink3) ${Math.round((stats.confirmed / Math.max(stats.totalBookings, 1)) * 360)}deg 360deg)`
            }}>
              <span className="donut-label">
                {stats.totalBookings > 0 ? Math.round((stats.confirmed / stats.totalBookings) * 100) : 0}%
              </span>
            </div>
            <div>
              <div className="donut-info-name">Confirmation Rate</div>
              <div className="donut-info-sub">
                {stats.confirmed} of {stats.totalBookings}<br />bookings confirmed
              </div>
            </div>
          </div>
        </div>

        {/* Package Popularity */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Package Sales</div>
              <div className="panel-sub">All time · by bookings</div>
            </div>
          </div>
          {packageStats.length === 0 ? (
            <p style={{ color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "12px", textAlign: "center", padding: "30px 0" }}>
              No data yet
            </p>
          ) : (
            packageStats.map((pkg, i) => {
              const colors = [
                "linear-gradient(90deg,var(--fuchsia),var(--plum))",
                "linear-gradient(90deg,var(--gold2),var(--gold))",
                "linear-gradient(90deg,var(--lavender),var(--violet))",
                "linear-gradient(90deg,var(--rose),var(--fuchsia))",
                "linear-gradient(90deg,var(--gold),var(--gold2))",
                "linear-gradient(90deg,var(--hot),var(--fuchsia))",
              ];
              return (
                <div key={pkg.name} className="pkg-bar-item">
                  <div className="pkg-bar-top">
                    <span className="pkg-bar-name">{pkg.name}</span>
                    <span className="pkg-bar-val">{pkg.count} bookings</span>
                  </div>
                  <div className="pkg-bar-track">
                    <div
                      className="pkg-bar-fill"
                      style={{
                        width: `${(pkg.count / maxPkg) * 100}%`,
                        background: colors[i % colors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}

          <div className="section-divider" />
          <div className="panel-title" style={{ marginBottom: "12px" }}>Quick Actions</div>
          <div className="quick-actions">
            <Link href="/bookings" className="qa-btn">
              <span className="qa-icon">📋</span>
              <span className="qa-label">Bookings</span>
              <span className="qa-sub">Manage all</span>
            </Link>
            <Link href="/reviews" className="qa-btn">
              <span className="qa-icon">⭐</span>
              <span className="qa-label">Reviews</span>
              <span className="qa-sub">{stats.pendingReviewsCount} pending</span>
            </Link>
            <Link href="/analytics" className="qa-btn">
              <span className="qa-icon">📊</span>
              <span className="qa-label">Analytics</span>
              <span className="qa-sub">Full report</span>
            </Link>
            <a href="http://localhost:3000" target="_blank" className="qa-btn">
              <span className="qa-icon">🌐</span>
              <span className="qa-label">View Site</span>
              <span className="qa-sub">Live preview</span>
            </a>
          </div>
        </div>

        {/* Activity + Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {/* Activity Feed */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Activity</div>
              <Link href="/bookings" className="panel-action">All →</Link>
            </div>
            <div className="activity-list">
              {recentBookings.slice(0, 4).map((b) => (
                <div key={b.id} className="activity-item">
                  <div className={`activity-dot ${
                    b.status === "confirmed" ? "green"
                    : b.paymentStatus === "paid" ? "gold"
                    : "pink"
                  }`} />
                  <div>
                    <div className="activity-text">
                      <strong>{b.name}</strong> ·{" "}
                      {b.status === "confirmed"
                        ? "booking confirmed"
                        : b.paymentStatus === "paid"
                        ? "deposit received"
                        : "submitted request"}{" "}
                      · {b.package}
                    </div>
                    <div className="activity-time">
                      {new Date(b.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short",
                      })} · {new Date(b.createdAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p style={{ color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "12px", textAlign: "center", padding: "20px 0" }}>
                  No recent activity
                </p>
              )}
            </div>
          </div>

          {/* Reviews Queue */}
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <div>
                <div className="panel-title">Reviews Queue</div>
                <div className="panel-sub">{stats.pendingReviewsCount} awaiting approval</div>
              </div>
              <Link href="/reviews" className="panel-action">All →</Link>
            </div>
            {pendingReviews.length === 0 ? (
              <p style={{ color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "12px", textAlign: "center", padding: "20px 0" }}>
                ✓ All reviews moderated
              </p>
            ) : (
              pendingReviews.slice(0, 2).map((r) => (
                <div key={r.id} className="review-row">
                  <div className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  <div className="review-q">
                    "{r.message.substring(0, 100)}{r.message.length > 100 ? "…" : ""}"
                  </div>
                  <div className="review-author">
                    {r.name} · {new Date(r.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </div>
                  <div className="review-actions">
                    <button
                      className="review-btn approve"
                      disabled={reviewLoading === r.id + "approve"}
                      onClick={() => handleReview(r.id, "approve")}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="review-btn"
                      style={{ borderColor: "rgba(248,113,113,0.3)", color: "var(--red)" }}
                      disabled={reviewLoading === r.id + "reject"}
                      onClick={() => handleReview(r.id, "reject")}
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

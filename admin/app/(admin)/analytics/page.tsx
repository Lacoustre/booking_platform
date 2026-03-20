import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await getServerSession();
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  const now = new Date();
  const allBookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
  const allReviews = await prisma.review.findMany();

  // Monthly breakdown — last 12 months
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 0);
    const mb = allBookings.filter(b => {
      const c = new Date(b.createdAt);
      return c >= d && c <= end;
    });
    const paid = mb.filter(b => b.paymentStatus === "paid");
    return {
      month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      total: mb.length,
      paid: paid.length,
      revenue: paid.reduce((s, b) => s + (b.depositAmount || 0), 0),
      conversionRate: mb.length > 0 ? Math.round((paid.length / mb.length) * 100) : 0,
    };
  });

  // Package performance
  const pkgMap: Record<string, { count: number; revenue: number }> = {};
  allBookings.forEach(b => {
    if (!pkgMap[b.package]) pkgMap[b.package] = { count: 0, revenue: 0 };
    pkgMap[b.package].count++;
    pkgMap[b.package].revenue += b.depositAmount || 0;
  });
  const packages = Object.entries(pkgMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Overall stats
  const totalRevenue = allBookings.reduce((s, b) => s + (b.depositAmount || 0), 0);
  const paidBookings = allBookings.filter(b => b.paymentStatus === "paid");
  const conversionRate = allBookings.length > 0
    ? Math.round((paidBookings.length / allBookings.length) * 100)
    : 0;
  const avgDeposit = paidBookings.length > 0
    ? Math.round(paidBookings.reduce((s, b) => s + (b.depositAmount || 0), 0) / paidBookings.length)
    : 0;
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : "0.0";

  // Busiest months
  const monthCount: Record<string, number> = {};
  allBookings.forEach(b => {
    const m = new Date(b.createdAt).toLocaleString("default", { month: "long" });
    monthCount[m] = (monthCount[m] || 0) + 1;
  });
  const busiestMonths = Object.entries(monthCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxMonthly = Math.max(...monthly.map(m => m.revenue), 1);
  const maxPkg = Math.max(...packages.map(p => p.revenue), 1);

  return (
    <div>
      <div className="panel-header" style={{ marginBottom: "24px" }}>
        <div>
          <div className="panel-title" style={{ fontSize: "20px", letterSpacing: "6px" }}>Analytics</div>
          <div className="panel-sub">Business performance overview</div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="kpi-row" style={{ marginBottom: "24px" }}>
        <div className="kpi gold-accent">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">
            GHS {totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue}
          </div>
          <div className="kpi-change up">All time deposits</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Conversion Rate</div>
          <div className="kpi-value">{conversionRate}%</div>
          <div className="kpi-change flat">{paidBookings.length} of {allBookings.length} paid</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Deposit</div>
          <div className="kpi-value">GHS {avgDeposit.toLocaleString()}</div>
          <div className="kpi-change flat">Per paid booking</div>
        </div>
        <div className="kpi gold-accent">
          <div className="kpi-label">Avg Rating</div>
          <div className="kpi-value">★ {avgRating}</div>
          <div className="kpi-change up">{allReviews.length} reviews</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "2px" }}>
        {/* Monthly Revenue Chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Monthly Revenue</div>
              <div className="panel-sub">GHS · Last 12 months</div>
            </div>
          </div>
          <div className="chart-bars" style={{ height: "160px" }}>
            {monthly.map((m, i) => (
              <div key={m.month} className="chart-bar-wrap">
                <div
                  className={`chart-bar ${i >= 10 ? "gold-bar" : ""}`}
                  style={{ height: `${Math.max((m.revenue / maxMonthly) * 100, 4)}%` }}
                >
                  {m.revenue > 0 && (
                    <span className="chart-val">
                      {m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(0)}k` : m.revenue}
                    </span>
                  )}
                </div>
                <div className="chart-label">{m.month}</div>
              </div>
            ))}
          </div>

          <div className="section-divider" />

          {/* Conversion table */}
          <div style={{ marginTop: "8px" }}>
            <div className="panel-title" style={{ marginBottom: "12px", fontSize: "11px" }}>Monthly Conversion</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                  <th>Paid</th>
                  <th>Revenue</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthly.slice(-6).reverse().map(m => (
                  <tr key={m.month}>
                    <td><span className="cell-mono">{m.month}</span></td>
                    <td><span className="cell-mono">{m.total}</span></td>
                    <td><span className="cell-mono">{m.paid}</span></td>
                    <td><span className="cell-price" style={{ fontSize: "14px" }}>GHS {m.revenue.toLocaleString()}</span></td>
                    <td>
                      <span className={`pill ${m.conversionRate >= 50 ? "confirmed" : m.conversionRate > 0 ? "pending" : "cancelled"}`}>
                        {m.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Package Performance */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Package Performance</div>
              <div className="panel-sub">Revenue by package · all time</div>
            </div>
          </div>

          {packages.length === 0 ? (
            <p style={{ color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "12px", textAlign: "center", padding: "40px 0" }}>
              No data yet
            </p>
          ) : (
            packages.map((pkg, i) => {
              const colors = [
                "linear-gradient(90deg,var(--gold2),var(--gold))",
                "linear-gradient(90deg,var(--fuchsia),var(--plum))",
                "linear-gradient(90deg,var(--lavender),var(--violet))",
                "linear-gradient(90deg,var(--rose),var(--fuchsia))",
                "linear-gradient(90deg,var(--hot),var(--fuchsia))",
                "linear-gradient(90deg,var(--green),var(--violet))",
              ];
              return (
                <div key={pkg.name} className="pkg-bar-item">
                  <div className="pkg-bar-top">
                    <span className="pkg-bar-name">{pkg.name}</span>
                    <span className="pkg-bar-val">
                      {pkg.count} · GHS {pkg.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="pkg-bar-track">
                    <div
                      className="pkg-bar-fill"
                      style={{ width: `${(pkg.revenue / maxPkg) * 100}%`, background: colors[i % colors.length] }}
                    />
                  </div>
                </div>
              );
            })
          )}

          <div className="section-divider" />

          {/* Busiest months */}
          <div className="panel-title" style={{ marginBottom: "12px", fontSize: "11px" }}>Busiest Months</div>
          {busiestMonths.map(([month, count]) => (
            <div key={month} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "'Cormorant', serif", fontSize: "16px", color: "var(--cream)" }}>{month}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--gold2)" }}>{count} bookings</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

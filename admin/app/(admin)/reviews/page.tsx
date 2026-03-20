import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ReviewActions from "./ReviewActions";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const session = await getServerSession();
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  const filter = searchParams?.filter;

  const reviews = await prisma.review.findMany({
    where:
      filter === "approved" ? { approved: true }
      : filter === "pending" ? { approved: false }
      : filter === "featured" ? { featured: true }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const [total, approved, pending, featured] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { approved: true } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.review.count({ where: { featured: true } }),
  ]);

  const avgRating = await prisma.review.aggregate({ _avg: { rating: true } });

  return (
    <div>
      <div className="panel-header" style={{ marginBottom: "24px" }}>
        <div>
          <div className="panel-title" style={{ fontSize: "20px", letterSpacing: "6px" }}>Reviews</div>
          <div className="panel-sub">Moderation centre · {total} total</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row" style={{ marginBottom: "24px" }}>
        <div className="kpi gold-accent">
          <div className="kpi-label">Avg Rating</div>
          <div className="kpi-value">★ {avgRating._avg.rating?.toFixed(1) || "0.0"}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Reviews</div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-change up">↑ {approved} approved</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Pending</div>
          <div className="kpi-value">{pending}</div>
          <div className="kpi-change flat">Awaiting moderation</div>
        </div>
        <div className="kpi gold-accent">
          <div className="kpi-label">Featured</div>
          <div className="kpi-value">{featured}</div>
          <div className="kpi-change up">Shown on homepage</div>
        </div>
      </div>

      <div className="panel">
        {/* Tabs */}
        <div className="tabs">
          {[
            { href: "/reviews", label: "All", count: total, key: undefined },
            { href: "/reviews?filter=pending", label: "Pending", count: pending, key: "pending" },
            { href: "/reviews?filter=approved", label: "Approved", count: approved, key: "approved" },
            { href: "/reviews?filter=featured", label: "Featured", count: featured, key: "featured" },
          ].map((t) => (
            <a
              key={t.label}
              href={t.href}
              className={`tab ${filter === t.key || (!filter && !t.key) ? "active" : ""}`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="nav-badge" style={{ marginLeft: "6px", fontSize: "9px" }}>
                  {t.count}
                </span>
              )}
            </a>
          ))}
        </div>

        {reviews.length === 0 ? (
          <p style={{ textAlign: "center", padding: "60px", color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
            No reviews found
          </p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="review-row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                    {r.verified && (
                      <span className="pill confirmed" style={{ fontSize: "8px", padding: "2px 8px" }}>✓ Verified</span>
                    )}
                    {r.featured && (
                      <span className="pill" style={{ fontSize: "8px", padding: "2px 8px", background: "rgba(212,168,67,0.15)", color: "var(--gold2)" }}>★ Featured</span>
                    )}
                  </div>
                  <div className="review-q">"{r.message}"</div>
                  <div className="review-author" style={{ marginTop: "6px" }}>
                    {r.name} · {r.email} · {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <span className={`pill ${r.approved ? "confirmed" : "pending"}`} style={{ flexShrink: 0 }}>
                  {r.approved ? "Approved" : "Pending"}
                </span>
              </div>
              <ReviewActions id={r.id} approved={r.approved} featured={r.featured} verified={r.verified} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

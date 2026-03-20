"use client";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/bookings": "Bookings",
  "/reviews": "Reviews",
};

export default function AdminHeader() {
  const path = usePathname();
  const router = useRouter();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const title = PAGE_TITLES[path] || "Admin";

  return (
    <>
      <div className="shimmer-line" />
      <header className="topbar">
        <span className="topbar-title">{title}</span>
        <div className="topbar-divider" />
        <span className="topbar-sub">{dateStr} · Accra, Ghana</span>

        <div className="topbar-right">
          {/* Search */}
          <div className="search-bar">
            <span className="search-icon">⌕</span>
            <input type="text" placeholder="Search bookings, clients…" />
          </div>

          {/* Notifications */}
          <button className="notif-btn" title="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <div className="notif-dot" />
          </button>

          {/* New Booking CTA */}
          <Link href="/bookings" className="btn-primary">
            + New Booking
          </Link>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost"
            style={{ fontSize: "11px", padding: "8px 18px", letterSpacing: "3px" }}
          >
            Sign Out
          </button>
        </div>
      </header>
    </>
  );
}

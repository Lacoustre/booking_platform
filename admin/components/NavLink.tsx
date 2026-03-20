"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`nav-item ${isActive ? "active" : ""} ${className || ""}`}
      style={{
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
      onClick={() => startTransition(() => {})}
    >
      {children}
      {isPending && (
        <span style={{
          marginLeft: "auto",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "var(--fuchsia)",
          boxShadow: "0 0 6px var(--fuchsia)",
          animation: "pulse-dot 1s ease-in-out infinite",
          flexShrink: 0,
        }} />
      )}
    </Link>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewActions({
  id,
  approved,
  featured,
  verified,
}: {
  id: string;
  approved: boolean;
  featured: boolean;
  verified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (action: string) => {
    setLoading(action);
    await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="review-actions" style={{ flexWrap: "wrap" }}>
      {!approved && (
        <button className="review-btn approve" disabled={loading === "approve"} onClick={() => handle("approve")}>
          ✓ Approve
        </button>
      )}
      {approved && (
        <button
          className="review-btn"
          style={{ borderColor: "rgba(251,191,36,0.3)", color: "var(--amber)" }}
          disabled={loading === "unapprove"}
          onClick={() => handle("unapprove")}
        >
          ↩ Unapprove
        </button>
      )}
      <button
        className="review-btn"
        style={{
          borderColor: featured ? "rgba(212,168,67,0.5)" : "rgba(212,168,67,0.2)",
          color: "var(--gold2)",
        }}
        disabled={loading === "feature" || loading === "unfeature"}
        onClick={() => handle(featured ? "unfeature" : "feature")}
      >
        {featured ? "★ Unfeature" : "★ Feature"}
      </button>
      <button
        className="review-btn"
        style={{
          borderColor: verified ? "rgba(74,222,128,0.5)" : "rgba(74,222,128,0.2)",
          color: "var(--green)",
        }}
        disabled={loading === "verify" || loading === "unverify"}
        onClick={() => handle(verified ? "unverify" : "verify")}
      >
        {verified ? "✓ Unverify" : "✓ Verify"}
      </button>
      <button
        className="review-btn"
        style={{ borderColor: "rgba(248,113,113,0.3)", color: "var(--red)" }}
        disabled={loading === "reject"}
        onClick={() => handle("reject")}
      >
        ✕ Delete
      </button>
    </div>
  );
}

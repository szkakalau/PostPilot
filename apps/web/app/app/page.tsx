"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AppHomePage() {
  const [checkout, setCheckout] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setCheckout(sp.get("checkout"));
  }, []);

  async function startCheckout() {
    const data = (await apiFetch("/api/billing/create-checkout", { method: "POST" })) as {
      checkout_url: string | null;
    };
    if (data.checkout_url) window.location.href = data.checkout_url;
  }

  return (
    <div className="card">
      <h1 className="h1">App</h1>
      <p className="muted">Use the navigation to create posts, view the calendar, or connect accounts.</p>
      {checkout ? (
        <p className="muted" style={{ marginTop: 10 }}>
          Checkout status: {checkout}
        </p>
      ) : null}
      <p style={{ marginTop: 14 }}>
        <button className="btn secondary" type="button" onClick={startCheckout}>
          Stripe Checkout (placeholder)
        </button>
      </p>
    </div>
  );
}


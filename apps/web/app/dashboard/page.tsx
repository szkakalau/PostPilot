"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
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
      <h1 className="h1">控制台</h1>
      <p className="muted">从左侧导航创建内容、查看日历或绑定社交账号。</p>
      {checkout ? (
        <p className="muted" style={{ marginTop: 10 }}>
          结账状态：{checkout}
        </p>
      ) : null}
      <p style={{ marginTop: 14 }}>
        <button className="btn secondary" type="button" onClick={startCheckout}>
          Stripe Checkout（预留）
        </button>
      </p>
    </div>
  );
}

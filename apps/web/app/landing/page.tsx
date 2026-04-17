"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    try {
      await apiFetch("/api/waitlist", { method: "POST", body: JSON.stringify({ email }) });
      setStatus("ok");
      setMsg("已加入候补名单。");
      setEmail("");
    } catch (err) {
      setStatus("err");
      setMsg(err instanceof Error ? err.message : "提交失败");
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="pill">PostPilot</div>
        <h1 className="h1" style={{ marginTop: 12 }}>
          把内容节奏交给系统
        </h1>
        <p className="muted" style={{ fontSize: 16, maxWidth: 720 }}>
          用 AI 起草、排期并发布到 Twitter / LinkedIn。前后端分离部署，Stripe 订阅预留，DeepSeek 驱动文案。
        </p>
      </div>

      <div className="card">
        <h2 className="h2">加入候补名单</h2>
        <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <div>
            <label className="label" htmlFor="wl">
              邮箱
            </label>
            <input
              id="wl"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <button className="btn" type="submit">
            提交
          </button>
          {msg ? (
            <p className={status === "err" ? "error" : "muted"} style={{ margin: 0 }}>
              {msg}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

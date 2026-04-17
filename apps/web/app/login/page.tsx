"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/request-link", { method: "POST", body: JSON.stringify({ email }) });
      setMsg("登录链接已发送，请查收邮件。");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "发送失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h1 className="h1">登录</h1>
      <p className="muted">输入邮箱，我们会发送一次性登录链接。</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <div>
          <label className="label" htmlFor="em">
            邮箱
          </label>
          <input
            id="em"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "发送中…" : "发送登录链接"}
        </button>
        {msg ? <p className="muted" style={{ margin: 0 }}>{msg}</p> : null}
        {err ? <p className="error" style={{ margin: 0 }}>{err}</p> : null}
      </form>
    </div>
  );
}

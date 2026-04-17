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
      setMsg("Magic link sent. Check your inbox.");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Send failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h1 className="h1">Log in</h1>
      <p className="muted">Enter your email and we will send a one-time magic link.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <div>
          <label className="label" htmlFor="em">
            Email
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
          {loading ? "Sending…" : "Send magic link"}
        </button>
        {msg ? <p className="muted" style={{ margin: 0 }}>{msg}</p> : null}
        {err ? <p className="error" style={{ margin: 0 }}>{err}</p> : null}
      </form>
    </div>
  );
}

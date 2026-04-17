"use client";

import { useEffect, useState } from "react";
import { API, apiFetch, getToken } from "@/lib/api";

type Row = {
  id: string;
  platform: string;
  account_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function AccountsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
    try {
      const data = (await apiFetch("/api/accounts")) as Row[];
      setRows(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load failed");
    }
  }

  useEffect(() => {
    refresh();
    const sp = new URLSearchParams(window.location.search);
    const connected = sp.get("connected");
    const error = sp.get("error");
    if (connected) setInfo(`Connected: ${connected}`);
    if (error) setErr(error);
  }, []);

  async function connectTwitter() {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${API}/api/oauth/twitter/start`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error || "Unable to start OAuth");
    if (data.url) window.location.href = data.url;
  }

  async function connectLinkedIn() {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${API}/api/oauth/linkedin/start`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error || "Unable to start OAuth");
    if (data.url) window.location.href = data.url;
  }

  async function connectReddit() {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${API}/api/oauth/reddit/start`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error || "Unable to start OAuth");
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="card">
      <h1 className="h1">Accounts</h1>
      <p className="muted">Connect Twitter / LinkedIn / Reddit to select publish targets when creating a post.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button className="btn" type="button" onClick={() => connectTwitter().catch((e) => setErr(String(e.message)))}>
          Connect Twitter
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => connectLinkedIn().catch((e) => setErr(String(e.message)))}
        >
          Connect LinkedIn
        </button>
        <button className="btn secondary" type="button" onClick={() => connectReddit().catch((e) => setErr(String(e.message)))}>
          Connect Reddit
        </button>
        <button className="btn secondary" type="button" onClick={refresh}>
          Refresh
        </button>
      </div>

      {info ? <p className="muted">{info}</p> : null}
      {err ? <p className="error">{err}</p> : null}

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {rows.length === 0 ? <p className="muted">No accounts connected yet.</p> : null}
        {rows.map((r) => (
          <div key={r.id} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
            {r.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.avatar_url} alt="" width={44} height={44} style={{ borderRadius: 10, border: "1px solid var(--border)" }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.06)" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{r.platform}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {r.account_name || r.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

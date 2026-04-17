"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Row = {
  id: string;
  content: string;
  scheduled_at: string | null;
  platforms: string[];
  status: string;
};

export default function CalendarPage() {
  const month = useMemo(() => {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, []);

  const [value, setValue] = useState(month);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      try {
        const data = (await apiFetch(`/api/posts/calendar?month=${encodeURIComponent(value)}`)) as Row[];
        setRows(data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Load failed");
      }
    })();
  }, [value]);

  return (
    <div className="card">
      <h1 className="h1">Calendar</h1>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <label className="label" htmlFor="m" style={{ margin: 0 }}>
          Month (YYYY-MM)
        </label>
        <input id="m" className="input" style={{ maxWidth: 220 }} value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      {err ? <p className="error">{err}</p> : null}
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {rows.length === 0 ? <p className="muted">No scheduled posts this month.</p> : null}
        {rows.map((r) => (
          <div key={r.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <strong>{r.scheduled_at ? new Date(r.scheduled_at).toISOString() : "—"}</strong>
              <span className="pill">{r.status}</span>
            </div>
            <p style={{ margin: "10px 0 0", whiteSpace: "pre-wrap" }}>{r.content}</p>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
              Platforms: {r.platforms.length ? r.platforms.join(", ") : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

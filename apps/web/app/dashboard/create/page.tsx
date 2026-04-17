"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AiGenerator } from "./components/AiGenerator";
import { PlatformSelector, type SocialAccount } from "./components/PlatformSelector";
import { PostEditor } from "./components/PostEditor";
import { SchedulerPanel } from "./components/SchedulerPanel";

export default function CreatePage() {
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = (await apiFetch("/api/accounts")) as SocialAccount[];
        setAccounts(rows);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const payload = useMemo(
    () => ({
      content,
      scheduledAt: scheduledAt.trim() ? scheduledAt.trim() : null,
      socialAccountIds: selected,
    }),
    [content, scheduledAt, selected]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = (await apiFetch("/api/posts/create", {
        method: "POST",
        body: JSON.stringify(payload),
      })) as { id?: string };
      setMsg(`Post created: ${res.id ?? ""}`);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid2">
      <form className="card" onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <h1 className="h1" style={{ marginBottom: 0 }}>
          Create post
        </h1>
        <PostEditor value={content} onChange={setContent} />
        <SchedulerPanel scheduledAt={scheduledAt} onChange={setScheduledAt} />
        <div>
          <div className="label">Publish to</div>
          <PlatformSelector accounts={accounts} selected={selected} onChange={setSelected} />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </button>
        {msg ? <p className="muted" style={{ margin: 0 }}>{msg}</p> : null}
        {err ? <p className="error" style={{ margin: 0 }}>{err}</p> : null}
      </form>
      <AiGenerator onPick={(text) => setContent(text)} />
    </div>
  );
}

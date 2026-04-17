"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export function AiGenerator({ onPick }: { onPick: (text: string) => void }) {
  const [prompt, setPrompt] = useState("Write 3 Twitter posts about SaaS growth tips");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setErr(null);
    setLoading(true);
    try {
      const data = (await apiFetch("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      })) as { posts?: string[] };
      setPosts(data.posts ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <h2 className="h2" style={{ marginTop: 0 }}>
        DeepSeek 生成
      </h2>
      <label className="label" htmlFor="prompt">
        提示词
      </label>
      <textarea id="prompt" className="textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <div style={{ marginTop: 10 }}>
        <button className="btn secondary" type="button" onClick={generate} disabled={loading}>
          {loading ? "生成中…" : "生成"}
        </button>
      </div>
      {err ? <p className="error">{err}</p> : null}
      {posts.length ? (
        <ul style={{ margin: "12px 0 0", paddingLeft: 18 }}>
          {posts.map((p) => (
            <li key={p.slice(0, 24)} style={{ marginBottom: 8 }}>
              <span className="muted" style={{ display: "block", fontSize: 12 }}>
                备选
              </span>
              {p}{" "}
              <button className="btn secondary" type="button" onClick={() => onPick(p)}>
                使用
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

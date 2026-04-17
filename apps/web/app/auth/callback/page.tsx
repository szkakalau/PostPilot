"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, setToken } from "@/lib/api";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setErr("缺少 token");
      return;
    }
    (async () => {
      try {
        const data = (await apiFetch("/api/auth/verify", {
          method: "POST",
          body: JSON.stringify({ token }),
        })) as { token?: string };
        if (!data.token) throw new Error("无 token 返回");
        setToken(data.token);
        router.replace("/dashboard");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "验证失败");
      }
    })();
  }, [params, router]);

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h1 className="h1">正在登录…</h1>
      {err ? <p className="error">{err}</p> : <p className="muted">请稍候。</p>}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="card" style={{ maxWidth: 520 }}>
          <h1 className="h1">正在登录…</h1>
          <p className="muted">请稍候。</p>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

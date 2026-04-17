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
      setErr("Missing token");
      return;
    }
    (async () => {
      try {
        const data = (await apiFetch("/api/auth/verify", {
          method: "POST",
          body: JSON.stringify({ token }),
        })) as { token?: string };
        if (!data.token) throw new Error("No token returned");
        setToken(data.token);
        router.replace("/app");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Verification failed");
      }
    })();
  }, [params, router]);

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h1 className="h1">Signing you in…</h1>
      {err ? <p className="error">{err}</p> : <p className="muted">Please wait.</p>}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="card" style={{ maxWidth: 520 }}>
          <h1 className="h1">Signing you in…</h1>
          <p className="muted">Please wait.</p>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

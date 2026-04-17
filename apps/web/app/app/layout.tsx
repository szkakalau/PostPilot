"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearToken, getToken } from "@/lib/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  return (
    <div>
      <div className="nav">
        <strong style={{ letterSpacing: "-0.02em" }}>PostPilot</strong>
        <span style={{ opacity: 0.35 }}>|</span>
        <Link href="/app">Overview</Link>
        <Link href="/app/create">Create</Link>
        <Link href="/app/calendar">Calendar</Link>
        <Link href="/app/accounts">Accounts</Link>
        <span style={{ flex: 1 }} />
        <button
          className="btn secondary"
          type="button"
          onClick={() => {
            clearToken();
            router.replace("/login");
          }}
        >
          Log out
        </button>
      </div>
      {children}
    </div>
  );
}


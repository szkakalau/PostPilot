"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearToken, getToken } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  return (
    <div>
      <div className="nav">
        <strong style={{ letterSpacing: "-0.02em" }}>PostPilot</strong>
        <span style={{ opacity: 0.35 }}>|</span>
        <Link href="/dashboard">总览</Link>
        <Link href="/dashboard/create">创建帖子</Link>
        <Link href="/dashboard/calendar">日历</Link>
        <Link href="/dashboard/accounts">账号</Link>
        <span style={{ flex: 1 }} />
        <button
          className="btn secondary"
          type="button"
          onClick={() => {
            clearToken();
            router.replace("/login");
          }}
        >
          退出
        </button>
      </div>
      {children}
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="card">
      <h1 className="h1">PostPilot</h1>
      <p className="muted">跨平台社媒排期与发布。</p>
      <p style={{ marginTop: 14 }}>
        <Link className="btn" href="/landing">
          进入落地页
        </Link>{" "}
        <Link className="btn secondary" href="/login">
          登录
        </Link>{" "}
        <Link className="btn secondary" href="/dashboard">
          控制台
        </Link>
      </p>
    </div>
  );
}

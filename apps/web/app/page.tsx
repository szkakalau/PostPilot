import Link from "next/link";

export default function Home() {
  return (
    <div className="card">
      <h1 className="h1">PostPilot</h1>
      <p className="muted">Schedule and publish across platforms.</p>
      <p style={{ marginTop: 14 }}>
        <Link className="btn" href="/landing">
          Landing
        </Link>{" "}
        <Link className="btn secondary" href="/login">
          Log in
        </Link>{" "}
        <Link className="btn secondary" href="/dashboard">
          Dashboard
        </Link>
      </p>
    </div>
  );
}

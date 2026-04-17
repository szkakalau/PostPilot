"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMsg("");
    try {
      await apiFetch("/api/waitlist", { method: "POST", body: JSON.stringify({ email }) });
      setStatus("ok");
      setMsg("You are on the waitlist.");
      setEmail("");
    } catch (err) {
      setStatus("err");
      setMsg(err instanceof Error ? err.message : "Submission failed");
    }
  }

  function jumpToWaitlist() {
    const el = document.getElementById("waitlist");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const input = document.getElementById("wl") as HTMLInputElement | null;
      input?.focus();
    }, 250);
  }

  return (
    <div className="stack">
      {/* Module 1 — HERO */}
      <section className="card section">
        <div className="kicker">
          <span className="kickerDot" />
          Early access • Early adopter pricing • Launching soon
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="pill">PostPilot</div>
        </div>
        <h1 className="h1" style={{ marginTop: 12 }}>
          Stop paying <span style={{ color: "var(--accent2)" }}>$150–$400/month</span> for tools that don’t
          write.
        </h1>
        <p className="muted lead" style={{ marginTop: 6 }}>
          PostPilot is the <span style={{ color: "var(--text)", fontWeight: 700 }}>$19/month</span> AI social
          scheduling tool for Twitter + LinkedIn — write with AI, schedule once, publish automatically.{" "}
          <span style={{ color: "var(--text)", fontWeight: 700 }}>Launching soon.</span>
        </p>
        <div className="priceRow" style={{ marginTop: 14 }}>
          <button className="btn" type="button" onClick={jumpToWaitlist}>
            Join the early access waitlist
          </button>
          <button className="btn ghost" type="button" onClick={jumpToWaitlist}>
            Get early access
          </button>
          <span className="note">Built for freelancers & small agencies</span>
        </div>
      </section>

      {/* Module 2 — SOCIAL PROOF / PRICE PAIN */}
      <section className="section">
        <div className="card">
          <h2 className="h2">The $400/month stack problem</h2>
          <p className="muted" style={{ marginTop: 0, maxWidth: 900 }}>
            If you’re a freelancer or small agency, you’ve probably ended up stacking tools to “cover
            everything”:
          </p>
          <div className="cols3" style={{ marginTop: 12 }}>
            <div className="card">
              <div className="pill">Buffer</div>
              <h3 className="h3" style={{ marginTop: 10 }}>
                Scheduling
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                Queue posts and basic calendars.
              </p>
            </div>
            <div className="card">
              <div className="pill">Hootsuite</div>
              <h3 className="h3" style={{ marginTop: 10 }}>
                Account management
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                More dashboards than output.
              </p>
            </div>
            <div className="card">
              <div className="pill">Later</div>
              <h3 className="h3" style={{ marginTop: 10 }}>
                Planning
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                Another tool, another monthly fee.
              </p>
            </div>
          </div>
          <hr className="hr" />
          <p style={{ margin: 0 }}>
            That stack quietly turns into <b>$150–$400/month</b> — and you still have to write the posts
            yourself (or pay for yet another tool).
          </p>
          <p style={{ margin: "10px 0 0" }}>
            <b>PostPilot replaces the entire stack.</b>
          </p>
        </div>
      </section>

      {/* Module 3 — PROBLEM SECTION */}
      <section className="section">
        <div className="card">
          <h2 className="h2" style={{ marginBottom: 12 }}>
            The usual setup is broken
          </h2>
          <div className="cols3">
            <div className="card">
              <h3 className="h3">Too expensive</h3>
              <p className="muted" style={{ margin: 0 }}>
                You shouldn’t need a $300/month subscription just to stay consistent on Twitter and LinkedIn.
              </p>
            </div>
            <div className="card">
              <h3 className="h3">Too complicated</h3>
              <p className="muted" style={{ margin: 0 }}>
                Most tools feel built for enterprise teams, not one person juggling clients and deadlines.
              </p>
            </div>
            <div className="card">
              <h3 className="h3">Writing and scheduling are separate</h3>
              <p className="muted" style={{ margin: 0 }}>
                You write in one place, schedule in another, and lose time switching tabs and copying drafts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Module 4 — SOLUTION / FEATURES */}
      <section className="section">
        <div className="card">
          <h2 className="h2">One tool to write, schedule and publish.</h2>
          <div className="featureGrid" style={{ marginTop: 12 }}>
            <div className="card">
              <div className="pill">AI Post Writer</div>
              <h3 className="h3" style={{ marginTop: 10 }}>
                Write posts fast
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                Generate posts in seconds for Twitter or LinkedIn. Rewrite, shorten, expand, or change tone
                until it sounds like you. Go from “blank page” to ready-to-post fast.
              </p>
            </div>
            <div className="card">
              <div className="pill">Smart Scheduler</div>
              <h3 className="h3" style={{ marginTop: 10 }}>
                Set a cadence, then ship
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                Pick your cadence and let PostPilot handle the calendar. Queue posts, avoid gaps, and
                schedule in batches. Set it once — your content keeps shipping.
              </p>
            </div>
            <div className="card">
              <div className="pill">Multi-account management</div>
              <h3 className="h3" style={{ marginTop: 10 }}>
                Built for small teams
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                Manage multiple profiles without the agency-tier price tag. Keep accounts organized and
                publishing consistently. Built for small teams with real constraints.
              </p>
            </div>
            <div className="card">
              <h3 className="h3">Twitter + LinkedIn first</h3>
              <p className="muted" style={{ margin: 0 }}>
                No “everything to everyone” roadmap. Just the two platforms most freelancers and indie teams
                actually use to get leads.
              </p>
              <hr className="hr" />
              <button className="btn" type="button" onClick={jumpToWaitlist}>
                Join the early access waitlist
              </button>
              <p className="note" style={{ marginTop: 10 }}>
                Early users will shape the roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Module 5 — DIFFERENTIATION */}
      <section className="section">
        <div className="card">
          <h2 className="h2">Built differently from traditional tools</h2>
          <div className="cols3" style={{ marginTop: 12 }}>
            <div className="card">
              <h3 className="h3">Simple pricing</h3>
              <p className="muted" style={{ margin: 0 }}>
                One plan, one price, no “contact sales” nonsense.
              </p>
            </div>
            <div className="card">
              <h3 className="h3">AI built-in</h3>
              <p className="muted" style={{ margin: 0 }}>
                Writing and scheduling in the same workflow.
              </p>
            </div>
            <div className="card">
              <h3 className="h3">Built for small teams</h3>
              <p className="muted" style={{ margin: 0 }}>
                Freelancers, indie hackers, tiny agencies — not enterprises.
              </p>
            </div>
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <h3 className="h3">No enterprise complexity</h3>
            <p className="muted" style={{ margin: 0 }}>
              Fewer dashboards, more output.
            </p>
          </div>
        </div>
      </section>

      {/* Module 6 — PRICING + FINAL CTA */}
      <section className="section" id="waitlist">
        <div className="card">
          <h2 className="h2">Early adopter pricing</h2>
          <div className="priceRow" style={{ marginTop: 8 }}>
            <p className="bigPrice">
              $19<span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>/month</span>
            </p>
            <span className="pill">Early adopter price</span>
            <span className="note">
              Future price: <span className="strike">$29/month</span>
            </span>
          </div>
          <p style={{ margin: "10px 0 0" }}>
            <b>Lock in early access pricing forever.</b>
          </p>

          <hr className="hr" />

          <h2 className="h2" style={{ marginBottom: 6 }}>
            Launching soon
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Early users will shape the roadmap
          </p>

          <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            <div>
              <label className="label" htmlFor="wl">
                Email
              </label>
              <input
                id="wl"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <button className="btn" type="submit" disabled={status === "submitting"}>
              Get early access
            </button>
            {msg ? (
              <p className={status === "err" ? "error" : status === "ok" ? "ok" : "muted"} style={{ margin: 0 }}>
                {msg}
              </p>
            ) : (
              <p className="note" style={{ margin: 0 }}>
                No spam. Just the launch email.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

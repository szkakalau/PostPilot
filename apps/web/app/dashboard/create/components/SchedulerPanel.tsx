"use client";

export function SchedulerPanel({
  scheduledAt,
  onChange,
}: {
  scheduledAt: string;
  onChange: (iso: string) => void;
}) {
  return (
    <div>
      <label className="label" htmlFor="sched">
        Schedule time (UTC ISO, optional)
      </label>
      <input
        id="sched"
        className="input"
        value={scheduledAt}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 2026-04-20T10:00:00.000Z"
      />
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        If you select accounts and leave this empty, we schedule it for now and the worker will publish it.
      </p>
    </div>
  );
}

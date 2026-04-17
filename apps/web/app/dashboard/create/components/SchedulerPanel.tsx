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
        计划时间（UTC ISO，可留空表示尽快）
      </label>
      <input
        id="sched"
        className="input"
        value={scheduledAt}
        onChange={(e) => onChange(e.target.value)}
        placeholder='例如 2026-04-20T10:00:00.000Z'
      />
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        与账号一起提交时，若留空将使用当前时间排队，由后台 Worker 发布。
      </p>
    </div>
  );
}

"use client";

export function PostEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label" htmlFor="content">
        Content
      </label>
      <textarea
        id="content"
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write something…"
      />
    </div>
  );
}

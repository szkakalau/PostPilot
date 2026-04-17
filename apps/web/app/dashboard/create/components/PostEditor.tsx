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
        正文
      </label>
      <textarea
        id="content"
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="写点什么…"
      />
    </div>
  );
}

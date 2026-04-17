"use client";

export type SocialAccount = {
  id: string;
  platform: string;
  account_name: string | null;
};

export function PlatformSelector({
  accounts,
  selected,
  onChange,
}: {
  accounts: SocialAccount[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  }

  if (!accounts.length) {
    return <p className="muted">No accounts connected. Go to Accounts to connect Twitter / LinkedIn / Reddit.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {accounts.map((a) => {
        const checked = selected.includes(a.id);
        return (
          <label
            key={a.id}
            className="card"
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              cursor: "pointer",
              padding: 12,
              borderColor: checked ? "rgba(91,140,255,0.45)" : undefined,
            }}
          >
            <input type="checkbox" checked={checked} onChange={() => toggle(a.id)} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 650 }}>{a.platform}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {a.account_name || a.id}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

import { useState } from "react";

interface MultiEntityLinkSelectProps {
  items: { id: bigint; name: string }[];
  values: bigint[];
  onChange: (ids: bigint[]) => void;
  label: string;
  ocid?: string;
}

/** Multi-select using a scrollable checkbox list for mobile friendliness. */
export default function MultiEntityLinkSelect({
  items,
  values,
  onChange,
  label,
  ocid,
}: MultiEntityLinkSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (id: bigint) => {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id));
    } else {
      onChange([...values, id]);
    }
  };

  const selectedNames = items
    .filter((i) => values.includes(i.id))
    .map((i) => i.name);

  return (
    <div style={{ marginBottom: 0 }}>
      <div className="ds-label" style={{ marginBottom: 4 }}>
        {label}
      </div>

      {/* Summary row / toggle */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "7px 10px",
          background: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 6,
          cursor: "pointer",
          color: "var(--ds-text)",
          fontSize: 13,
          textAlign: "left",
          gap: 8,
        }}
        data-ocid={ocid}
        aria-expanded={open}
      >
        <span
          style={{
            flex: 1,
            color: values.length ? "var(--ds-text)" : "var(--ds-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {values.length === 0
            ? "None selected"
            : selectedNames.length <= 2
              ? selectedNames.join(", ")
              : `${selectedNames.slice(0, 2).join(", ")} +${values.length - 2} more`}
        </span>
        <span style={{ color: "var(--ds-muted)", fontSize: 11, flexShrink: 0 }}>
          {values.length > 0 && `(${values.length}) `}
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          style={{
            border: "1px solid var(--ds-border)",
            borderTop: "none",
            borderRadius: "0 0 6px 6px",
            background: "var(--ds-surface)",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                padding: "10px 12px",
                fontSize: 12,
                color: "var(--ds-muted)",
              }}
            >
              (No entries created yet)
            </div>
          ) : (
            items.map((item) => {
              const checked = values.includes(item.id);
              return (
                <label
                  key={String(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--ds-border)",
                    background: checked ? "var(--ds-surface2)" : "transparent",
                    fontSize: 13,
                    color: "var(--ds-text)",
                    minHeight: 40,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.id)}
                    style={{
                      accentColor: "var(--ds-maroon)",
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.name}</span>
                </label>
              );
            })
          )}
        </div>
      )}

      {/* Selected tags */}
      {values.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}
        >
          {selectedNames.map((name) => (
            <span
              key={name}
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 10,
                background: "var(--ds-surface2)",
                border: "1px solid var(--ds-border)",
                color: "var(--ds-gold)",
              }}
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

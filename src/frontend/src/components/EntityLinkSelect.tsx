interface EntityLinkSelectProps {
  items: { id: bigint; name: string }[];
  value: bigint | null;
  onChange: (id: bigint | null) => void;
  label: string;
  placeholder?: string;
  ocid?: string;
}

/** Single-select dropdown for linking one entity to another. */
export default function EntityLinkSelect({
  items,
  value,
  onChange,
  label,
  placeholder = "— None —",
  ocid,
}: EntityLinkSelectProps) {
  return (
    <div style={{ marginBottom: 0 }}>
      <div className="ds-label" style={{ marginBottom: 4 }}>
        {label}
      </div>
      <select
        className="ds-input"
        value={value !== null ? String(value) : ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v ? BigInt(v) : null);
        }}
        data-ocid={ocid}
        style={{ width: "100%" }}
      >
        <option value="">{placeholder}</option>
        {items.length === 0 ? (
          <option value="" disabled>
            (No entries created yet)
          </option>
        ) : (
          items.map((item) => (
            <option key={String(item.id)} value={String(item.id)}>
              {item.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

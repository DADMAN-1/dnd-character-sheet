import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { ArmyLootEntry, DndBackend } from "../../../types";

interface Props {
  actor: DndBackend;
  armyId: string;
}

const LOOT_TYPES = ["Gold", "Item", "Supplies", "Equipment", "Magic", "Other"];

const LOOT_COLORS: Record<string, string> = {
  Gold: "var(--ds-gold)",
  Item: "#2980b9",
  Supplies: "#27ae60",
  Equipment: "#e67e22",
  Magic: "#8e44ad",
  Other: "var(--ds-muted)",
};

const blank = (armyId: string): ArmyLootEntry => ({
  id: `new-${Date.now()}`,
  armyId,
  name: "",
  quantity: 1n,
  lootType: "Gold",
  source: "",
  dateAcquired: "",
  value: 0n,
  distributed: false,
  notes: "",
  owner: Principal.anonymous(),
});

export default function ArmyLootPanel({ actor, armyId }: Props) {
  const [items, setItems] = useState<ArmyLootEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ArmyLootEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getArmyLoot(armyId));
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addArmyLootEntry(armyId, editing);
      else await actor.updateArmyLootEntry(String(editing.id), editing);
      await load();
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert(`Failed to save loot entry: ${String(e)}`);
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this loot entry?")) return;
    try {
      await actor.deleteArmyLootEntry(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof ArmyLootEntry, v: unknown) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const totalValue = items.reduce(
    (s, i) => s + Number(i.value) * Number(i.quantity),
    0,
  );
  const undistributed = items.filter((i) => !i.distributed);

  return (
    <div>
      {items.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 20,
            background: "var(--ds-surface)",
            border: "1px solid var(--ds-border)",
            borderRadius: 8,
            padding: "12px 18px",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <SummaryChip label="Items" value={String(items.length)} />
          <SummaryChip
            label="Total Value"
            value={`${totalValue}g`}
            color="var(--ds-gold)"
          />
          <SummaryChip
            label="Undistributed"
            value={String(undistributed.length)}
            color={undistributed.length > 0 ? "#e67e22" : "var(--ds-muted)"}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15 }}
        >
          Army Loot
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blank(armyId));
            setIsNew(true);
          }}
          data-ocid="army.loot.add_button"
        >
          + Add Loot
        </button>
      </div>

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.loot.loading_state"
        >
          Loading…
        </p>
      ) : items.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            padding: "24px 0",
          }}
          data-ocid="army.loot.empty_state"
        >
          No loot tracked yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="ds-card"
              style={{
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
              data-ocid={`army.loot.item.${idx + 1}`}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 2,
                  }}
                >
                  <span
                    className="font-cinzel"
                    style={{ color: "var(--ds-text)", fontSize: 13 }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 4,
                      color: LOOT_COLORS[item.lootType] ?? "var(--ds-muted)",
                      border: `1px solid ${LOOT_COLORS[item.lootType] ?? "var(--ds-border)"}`,
                      background: `${LOOT_COLORS[item.lootType] ?? "transparent"}18`,
                    }}
                  >
                    {item.lootType}
                  </span>
                  {item.distributed && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--ds-muted)",
                        border: "1px solid var(--ds-border)",
                        padding: "1px 6px",
                        borderRadius: 4,
                      }}
                    >
                      Distributed
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                  Qty: {String(item.quantity)}
                  {item.value > 0n
                    ? ` · Value: ${item.value * item.quantity}g`
                    : ""}
                  {item.source ? ` · ${item.source}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={() => {
                    setEditing({ ...item });
                    setIsNew(false);
                  }}
                  data-ocid={`army.loot.edit_button.${idx + 1}`}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={() => del(item.id)}
                  data-ocid={`army.loot.delete_button.${idx + 1}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
          onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
          role="presentation"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 500,
              padding: 24,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 16 }}
              >
                {isNew ? "Add Loot" : "Edit Loot"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.loot.close_button"
              >
                ✕
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ds-label">Name *</div>
                  <input
                    className="ds-input"
                    value={editing.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Item name"
                    data-ocid="army.loot.name.input"
                  />
                </div>
                <div>
                  <div className="ds-label">Type</div>
                  <select
                    className="ds-input"
                    value={editing.lootType}
                    onChange={(e) => set("lootType", e.target.value)}
                    data-ocid="army.loot.type.select"
                  >
                    {LOOT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ds-label">Quantity</div>
                  <input
                    className="ds-input"
                    type="number"
                    min="1"
                    value={Number(editing.quantity)}
                    onChange={(e) =>
                      set("quantity", BigInt(e.target.value || "0"))
                    }
                  />
                </div>
                <div>
                  <div className="ds-label">Value (gp each)</div>
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.value)}
                    onChange={(e) =>
                      set("value", BigInt(e.target.value || "0"))
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--ds-muted)",
                      paddingBottom: 2,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editing.distributed}
                      onChange={(e) => set("distributed", e.target.checked)}
                    />
                    Distributed
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ds-label">Source</div>
                  <input
                    className="ds-input"
                    value={editing.source}
                    onChange={(e) => set("source", e.target.value)}
                    placeholder="Battle, trade, etc."
                  />
                </div>
                <div>
                  <div className="ds-label">Date Acquired</div>
                  <input
                    className="ds-input"
                    value={editing.dateAcquired}
                    onChange={(e) => set("dateAcquired", e.target.value)}
                    placeholder="In-game date"
                  />
                </div>
              </div>
              <div>
                <div className="ds-label">Notes</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  style={{ resize: "vertical" }}
                  data-ocid="army.loot.notes.textarea"
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.loot.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="army.loot.save_button"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryChip({
  label,
  value,
  color,
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 10,
          color: "var(--ds-muted)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: color ?? "var(--ds-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

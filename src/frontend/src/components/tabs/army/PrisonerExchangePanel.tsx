import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { DndBackend, PrisonerExchangeEntry } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const STATUSES = [
  "Held",
  "Released",
  "Exchanged",
  "Ransomed",
  "Escaped",
  "Executed",
];

const STATUS_COLORS: Record<
  string,
  { text: string; border: string; bg: string }
> = {
  Held: { text: "#e67e22", border: "#e67e2255", bg: "#e67e2218" },
  Released: {
    text: "var(--ds-muted)",
    border: "var(--ds-border)",
    bg: "var(--ds-surface)",
  },
  Exchanged: { text: "#2980b9", border: "#2980b955", bg: "#2980b918" },
  Ransomed: { text: "#27ae60", border: "#27ae6055", bg: "#27ae6018" },
  Escaped: {
    text: "var(--ds-gold)",
    border: "var(--ds-gold)",
    bg: "#c9a35a18",
  },
  Executed: { text: "#e74c3c", border: "#e74c3c55", bg: "#e74c3c18" },
};

const blank = (armyId: string): PrisonerExchangeEntry => ({
  id: `new-${Date.now()}`,
  armyId,
  prisonerName: "",
  prisonerFaction: "",
  prisonerRank: "",
  capturedDate: "",
  capturedFrom: "",
  status: "Held",
  exchangeDetails: "",
  ransomAmount: 0n,
  notes: "",
  owner: Principal.anonymous(),
});

export default function PrisonerExchangePanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [items, setItems] = useState<PrisonerExchangeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<PrisonerExchangeEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getPrisonerExchanges(armyId));
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
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
      if (isNew) await actor.addPrisonerExchange(armyId, editing);
      else await actor.updatePrisonerExchange(String(editing.id), editing);
      await load();
      setEditing(null);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setSaving(false);
        return;
      }
      console.error(e);
      alert(`Failed to save prisoner exchange: ${String(e)}`);
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this prisoner record?")) return;
    try {
      await actor.deletePrisonerExchange(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof PrisonerExchangeEntry, v: unknown) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const held = items.filter((i) => i.status === "Held").length;

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

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
          <SummaryChip label="Total" value={String(items.length)} />
          <SummaryChip
            label="Currently Held"
            value={String(held)}
            color={held > 0 ? "#e67e22" : "var(--ds-muted)"}
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
          Prisoner Exchange Log
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blank(armyId));
            setIsNew(true);
          }}
          data-ocid="army.prisoners.add_button"
        >
          + Add Prisoner
        </button>
      </div>

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.prisoners.loading_state"
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
          data-ocid="army.prisoners.empty_state"
        >
          No prisoners recorded yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, idx) => {
            const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.Held;
            return (
              <div
                key={item.id}
                className="ds-card"
                style={{
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
                data-ocid={`army.prisoners.item.${idx + 1}`}
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
                      {item.prisonerName}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 4,
                        color: sc.text,
                        border: `1px solid ${sc.border}`,
                        background: sc.bg,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                    {[item.prisonerRank, item.prisonerFaction]
                      .filter(Boolean)
                      .join(" · ")}
                    {item.capturedDate
                      ? ` · Captured: ${item.capturedDate}`
                      : ""}
                  </div>
                  {item.ransomAmount > 0n && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--ds-gold)",
                        margin: "2px 0 0",
                      }}
                    >
                      Ransom: {item.ransomAmount}g
                    </p>
                  )}
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
                    data-ocid={`army.prisoners.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => del(item.id)}
                    data-ocid={`army.prisoners.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
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
              maxWidth: 520,
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
                {isNew ? "Add Prisoner" : "Edit Prisoner"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.prisoners.close_button"
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
                    value={editing.prisonerName}
                    onChange={(e) => set("prisonerName", e.target.value)}
                    placeholder="Prisoner's name"
                    data-ocid="army.prisoners.name.input"
                  />
                </div>
                <div>
                  <div className="ds-label">Status</div>
                  <select
                    className="ds-input"
                    value={editing.status}
                    onChange={(e) => set("status", e.target.value)}
                    data-ocid="army.prisoners.status.select"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
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
                  <div className="ds-label">Faction</div>
                  <input
                    className="ds-input"
                    value={editing.prisonerFaction}
                    onChange={(e) => set("prisonerFaction", e.target.value)}
                    placeholder="Army or faction"
                  />
                </div>
                <div>
                  <div className="ds-label">Rank</div>
                  <input
                    className="ds-input"
                    value={editing.prisonerRank}
                    onChange={(e) => set("prisonerRank", e.target.value)}
                    placeholder="Military rank"
                  />
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
                  <div className="ds-label">Captured Date</div>
                  <input
                    className="ds-input"
                    value={editing.capturedDate}
                    onChange={(e) => set("capturedDate", e.target.value)}
                    placeholder="In-game date"
                  />
                </div>
                <div>
                  <div className="ds-label">Captured From</div>
                  <input
                    className="ds-input"
                    value={editing.capturedFrom}
                    onChange={(e) => set("capturedFrom", e.target.value)}
                    placeholder="Battle or engagement"
                  />
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
                  <div className="ds-label">Ransom Amount (gp)</div>
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.ransomAmount)}
                    onChange={(e) =>
                      set("ransomAmount", BigInt(e.target.value || "0"))
                    }
                  />
                </div>
                <div>
                  <div className="ds-label">Exchange Details</div>
                  <input
                    className="ds-input"
                    value={editing.exchangeDetails}
                    onChange={(e) => set("exchangeDetails", e.target.value)}
                    placeholder="Who for, when, terms"
                  />
                </div>
              </div>
              <div>
                <div className="ds-label">Notes</div>
                <textarea
                  className="ds-input"
                  rows={3}
                  value={editing.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  style={{ resize: "vertical" }}
                  data-ocid="army.prisoners.notes.textarea"
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
                data-ocid="army.prisoners.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="army.prisoners.save_button"
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

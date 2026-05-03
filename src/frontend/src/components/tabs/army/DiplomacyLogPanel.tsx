import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { DiplomacyEntry, DndBackend } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const RELATIONSHIP_TYPES = [
  "Alliance",
  "Treaty",
  "Ceasefire",
  "Rivalry",
  "War",
  "Betrayal",
  "Negotiation",
  "Other",
];
const ENTRY_STATUSES = ["Active", "Expired", "Broken", "Fulfilled"];

const REL_COLORS: Record<string, { text: string; border: string; bg: string }> =
  {
    Alliance: { text: "#27ae60", border: "#27ae6055", bg: "#27ae6018" },
    Treaty: { text: "#2980b9", border: "#2980b955", bg: "#2980b918" },
    Ceasefire: {
      text: "var(--ds-gold)",
      border: "var(--ds-gold)",
      bg: "#c9a35a18",
    },
    Rivalry: { text: "#e67e22", border: "#e67e2255", bg: "#e67e2218" },
    War: { text: "#e74c3c", border: "#e74c3c55", bg: "#e74c3c18" },
    Betrayal: { text: "#c0392b", border: "#c0392b55", bg: "#c0392b18" },
    Negotiation: { text: "#8e44ad", border: "#8e44ad55", bg: "#8e44ad18" },
    Other: {
      text: "var(--ds-muted)",
      border: "var(--ds-border)",
      bg: "var(--ds-surface)",
    },
  };

const STATUS_COLORS: Record<string, string> = {
  Active: "#27ae60",
  Expired: "var(--ds-muted)",
  Broken: "#e74c3c",
  Fulfilled: "#2980b9",
};

const blank = (armyId: string): DiplomacyEntry => ({
  id: `new-${Date.now()}`,
  armyId,
  otherArmyName: "",
  otherFaction: "",
  relationshipType: "Treaty",
  date: "",
  terms: "",
  status: "Active",
  keyPersons: "",
  notes: "",
  owner: Principal.anonymous(),
});

export default function DiplomacyLogPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [items, setItems] = useState<DiplomacyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<DiplomacyEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getDiplomacyLog(armyId));
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
      if (isNew) await actor.addDiplomacyEntry(armyId, editing);
      else await actor.updateDiplomacyEntry(String(editing.id), editing);
      await load();
      setEditing(null);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setSaving(false);
        return;
      }
      console.error(e);
      alert(`Failed to save diplomacy entry: ${String(e)}`);
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this diplomacy entry?")) return;
    try {
      await actor.deleteDiplomacyEntry(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof DiplomacyEntry, v: unknown) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const active = items.filter((i) => i.status === "Active").length;

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
          <SummaryChip label="Active" value={String(active)} color="#27ae60" />
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
          Diplomacy Log
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blank(armyId));
            setIsNew(true);
          }}
          data-ocid="army.diplomacy.add_button"
        >
          + Add Entry
        </button>
      </div>

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.diplomacy.loading_state"
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
          data-ocid="army.diplomacy.empty_state"
        >
          No diplomacy entries yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, idx) => {
            const rc = REL_COLORS[item.relationshipType] ?? REL_COLORS.Other;
            return (
              <div
                key={item.id}
                className="ds-card"
                style={{
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
                data-ocid={`army.diplomacy.item.${idx + 1}`}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      className="font-cinzel"
                      style={{ color: "var(--ds-text)", fontSize: 13 }}
                    >
                      with {item.otherArmyName}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 4,
                        color: rc.text,
                        border: `1px solid ${rc.border}`,
                        background: rc.bg,
                      }}
                    >
                      {item.relationshipType}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: STATUS_COLORS[item.status] ?? "var(--ds-muted)",
                      }}
                    >
                      ● {item.status}
                    </span>
                  </div>
                  {item.otherFaction && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--ds-muted)",
                        margin: "0 0 2px",
                      }}
                    >
                      {item.otherFaction}
                    </p>
                  )}
                  {item.terms && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ds-text)",
                        margin: "0 0 2px",
                      }}
                    >
                      Terms: {item.terms}
                    </p>
                  )}
                  {item.keyPersons && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--ds-muted)",
                        margin: 0,
                      }}
                    >
                      Key persons: {item.keyPersons}
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
                    data-ocid={`army.diplomacy.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => del(item.id)}
                    data-ocid={`army.diplomacy.delete_button.${idx + 1}`}
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
                {isNew ? "Add Entry" : "Edit Entry"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.diplomacy.close_button"
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
                  <div className="ds-label">Other Army *</div>
                  <input
                    className="ds-input"
                    value={editing.otherArmyName}
                    onChange={(e) => set("otherArmyName", e.target.value)}
                    placeholder="Name of other army"
                    data-ocid="army.diplomacy.army.input"
                  />
                </div>
                <div>
                  <div className="ds-label">Faction</div>
                  <input
                    className="ds-input"
                    value={editing.otherFaction}
                    onChange={(e) => set("otherFaction", e.target.value)}
                    placeholder="Kingdom, guild, etc."
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
                  <div className="ds-label">Relationship Type</div>
                  <select
                    className="ds-input"
                    value={editing.relationshipType}
                    onChange={(e) => set("relationshipType", e.target.value)}
                    data-ocid="army.diplomacy.type.select"
                  >
                    {RELATIONSHIP_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="ds-label">Status</div>
                  <select
                    className="ds-input"
                    value={editing.status}
                    onChange={(e) => set("status", e.target.value)}
                    data-ocid="army.diplomacy.status.select"
                  >
                    {ENTRY_STATUSES.map((s) => (
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
                  <div className="ds-label">Date Established</div>
                  <input
                    className="ds-input"
                    value={editing.date}
                    onChange={(e) => set("date", e.target.value)}
                    placeholder="In-game date"
                  />
                </div>
                <div>
                  <div className="ds-label">Key Persons</div>
                  <input
                    className="ds-input"
                    value={editing.keyPersons}
                    onChange={(e) => set("keyPersons", e.target.value)}
                    placeholder="Signatories, negotiators"
                  />
                </div>
              </div>
              <div>
                <div className="ds-label">Terms / Agreement</div>
                <textarea
                  className="ds-input"
                  rows={3}
                  value={editing.terms}
                  onChange={(e) => set("terms", e.target.value)}
                  style={{ resize: "vertical" }}
                  placeholder="What was agreed upon"
                  data-ocid="army.diplomacy.terms.textarea"
                />
              </div>
              <div>
                <div className="ds-label">Notes</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  style={{ resize: "vertical" }}
                  data-ocid="army.diplomacy.notes.textarea"
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
                data-ocid="army.diplomacy.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="army.diplomacy.save_button"
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

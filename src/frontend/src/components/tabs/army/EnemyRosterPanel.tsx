import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { DndBackend, EnemyProfile } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const ENEMY_TYPES = ["Army", "Individual", "Monster", "Organization", "Other"];

const TYPE_COLORS: Record<string, string> = {
  Army: "#c0392b",
  Individual: "#e67e22",
  Monster: "#8e44ad",
  Organization: "#2980b9",
  Other: "var(--ds-muted)",
};

const blank = (armyId: string): EnemyProfile => ({
  id: `new-${Date.now()}`,
  armyId,
  name: "",
  faction: "",
  enemyType: "Army",
  description: "",
  knownStrengths: "",
  knownWeaknesses: "",
  notes: "",
  wins: 0n,
  losses: 0n,
  draws: 0n,
  owner: Principal.anonymous(),
});

export default function EnemyRosterPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [items, setItems] = useState<EnemyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<EnemyProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getEnemyRoster(armyId));
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
      if (isNew) await actor.addEnemyProfile(armyId, editing);
      else await actor.updateEnemyProfile(String(editing.id), editing);
      await load();
      setEditing(null);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setSaving(false);
        return;
      }
      console.error(e);
      alert(`Failed to save enemy profile: ${String(e)}`);
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this enemy profile?")) return;
    try {
      await actor.deleteEnemyProfile(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof EnemyProfile, v: unknown) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div>
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
          Enemy Roster
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blank(armyId));
            setIsNew(true);
          }}
          data-ocid="army.enemies.add_button"
        >
          + Add Enemy
        </button>
      </div>

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.enemies.loading_state"
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
          data-ocid="army.enemies.empty_state"
        >
          No enemies tracked yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="ds-card"
              style={{
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
              data-ocid={`army.enemies.item.${idx + 1}`}
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
                    style={{ color: "var(--ds-text)", fontSize: 14 }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      color: TYPE_COLORS[item.enemyType] ?? "var(--ds-muted)",
                      border: `1px solid ${TYPE_COLORS[item.enemyType] ?? "var(--ds-border)"}`,
                      background: `${TYPE_COLORS[item.enemyType] ?? "transparent"}18`,
                    }}
                  >
                    {item.enemyType}
                  </span>
                  {item.faction && (
                    <span style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                      {item.faction}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: item.description ? 4 : 0,
                  }}
                >
                  <RecordBadge
                    label="W"
                    value={Number(item.wins)}
                    color="#27ae60"
                  />
                  <RecordBadge
                    label="L"
                    value={Number(item.losses)}
                    color="#e74c3c"
                  />
                  <RecordBadge
                    label="D"
                    value={Number(item.draws)}
                    color="var(--ds-gold)"
                  />
                </div>
                {item.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ds-muted)",
                      margin: 0,
                    }}
                  >
                    {item.description}
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
                  data-ocid={`army.enemies.edit_button.${idx + 1}`}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={() => del(item.id)}
                  data-ocid={`army.enemies.delete_button.${idx + 1}`}
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
                {isNew ? "Add Enemy" : "Edit Enemy"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.enemies.close_button"
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
                    placeholder="Enemy name"
                    data-ocid="army.enemies.name.input"
                  />
                </div>
                <div>
                  <div className="ds-label">Type</div>
                  <select
                    className="ds-input"
                    value={editing.enemyType}
                    onChange={(e) => set("enemyType", e.target.value)}
                    data-ocid="army.enemies.type.select"
                  >
                    {ENEMY_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="ds-label">Faction</div>
                <input
                  className="ds-input"
                  value={editing.faction}
                  onChange={(e) => set("faction", e.target.value)}
                  placeholder="Faction or group"
                />
              </div>
              <div>
                <div className="ds-label">Description</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.description}
                  onChange={(e) => set("description", e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ds-label">Known Strengths</div>
                  <input
                    className="ds-input"
                    value={editing.knownStrengths}
                    onChange={(e) => set("knownStrengths", e.target.value)}
                    placeholder="Heavy cavalry, magic users"
                  />
                </div>
                <div>
                  <div className="ds-label">Known Weaknesses</div>
                  <input
                    className="ds-input"
                    value={editing.knownWeaknesses}
                    onChange={(e) => set("knownWeaknesses", e.target.value)}
                    placeholder="Slow, fear of fire"
                  />
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
                  <div className="ds-label">Wins</div>
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.wins)}
                    onChange={(e) => set("wins", BigInt(e.target.value || "0"))}
                  />
                </div>
                <div>
                  <div className="ds-label">Losses</div>
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.losses)}
                    onChange={(e) =>
                      set("losses", BigInt(e.target.value || "0"))
                    }
                  />
                </div>
                <div>
                  <div className="ds-label">Draws</div>
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.draws)}
                    onChange={(e) =>
                      set("draws", BigInt(e.target.value || "0"))
                    }
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
                  data-ocid="army.enemies.notes.textarea"
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
                data-ocid="army.enemies.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="army.enemies.save_button"
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

function RecordBadge({
  label,
  value,
  color,
}: { label: string; value: number; color: string }) {
  return (
    <span style={{ fontSize: 11, color }}>
      <strong>{label}</strong>: {value}
    </span>
  );
}

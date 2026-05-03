import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { CapturedEnemy, DndBackend } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Imprisoned: "#e74c3c",
  Released: "#27ae60",
  Executed: "#8e44ad",
  Escaped: "var(--ds-gold)",
};

export default function ArmyCapturedEnemiesPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [items, setItems] = useState<CapturedEnemy[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<CapturedEnemy | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getCapturedEnemies(armyId));
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

  const blank = (): CapturedEnemy => ({
    id: BigInt(Date.now()),
    armyId,
    name: "",
    rank: "",
    faction: "",
    background: "",
    status: "Imprisoned",
    notes: "",
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addCapturedEnemy(editing);
      else await actor.updateCapturedEnemy(editing);
      await load();
      setEditing(null);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setSaving(false);
        return;
      }
      console.error(e);
      alert(`Failed to save prisoner record: ${String(e)}`);
    }
    setSaving(false);
  };

  const del = async (id: bigint) => {
    if (!confirm("Delete this prisoner record?")) return;
    try {
      await actor.deleteCapturedEnemy(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof CapturedEnemy, v: string) =>
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
          Prisoners & Captured Enemies
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blank());
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
          No prisoners logged.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((p, idx) => (
            <div
              key={p.id}
              className="ds-card"
              style={{
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
              data-ocid={`army.prisoners.item.${idx + 1}`}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    className="font-cinzel"
                    style={{ color: "var(--ds-text)", fontSize: 14 }}
                  >
                    {p.name || "Unknown"}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 7px",
                      borderRadius: 4,
                      border: `1px solid ${STATUS_COLORS[p.status] ?? "var(--ds-muted)"}`,
                      color: STATUS_COLORS[p.status] ?? "var(--ds-muted)",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                {p.rank && (
                  <p style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                    Rank: {p.rank}
                    {p.faction ? ` · Faction: ${p.faction}` : ""}
                  </p>
                )}
                {p.background && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ds-text)",
                      marginTop: 4,
                    }}
                  >
                    {p.background}
                  </p>
                )}
                {p.notes && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--ds-muted)",
                      marginTop: 2,
                    }}
                  >
                    {p.notes}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={() => {
                    setEditing({ ...p });
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
                  onClick={() => del(p.id)}
                  data-ocid={`army.prisoners.delete_button.${idx + 1}`}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ds-label">Name</div>
                  <input
                    className="ds-input"
                    value={editing.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Prisoner name"
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
                    {["Imprisoned", "Released", "Executed", "Escaped"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
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
                  <div className="ds-label">Rank</div>
                  <input
                    className="ds-input"
                    value={editing.rank}
                    onChange={(e) => set("rank", e.target.value)}
                    placeholder="e.g. General"
                    data-ocid="army.prisoners.rank.input"
                  />
                </div>
                <div>
                  <div className="ds-label">Faction</div>
                  <input
                    className="ds-input"
                    value={editing.faction}
                    onChange={(e) => set("faction", e.target.value)}
                    placeholder="Enemy faction"
                    data-ocid="army.prisoners.faction.input"
                  />
                </div>
              </div>
              <div>
                <div className="ds-label">Background</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.background}
                  onChange={(e) => set("background", e.target.value)}
                  placeholder="Who are they, why captured"
                  data-ocid="army.prisoners.background.textarea"
                />
              </div>
              <div>
                <div className="ds-label">Notes</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.notes}
                  onChange={(e) => set("notes", e.target.value)}
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

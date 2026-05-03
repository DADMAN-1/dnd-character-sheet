import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { BattleOutcome, DndBackend } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

export default function ArmyBattleOutcomesPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [items, setItems] = useState<BattleOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<BattleOutcome | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getBattleOutcomes(armyId));
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

  const blank = (): BattleOutcome => ({
    id: BigInt(Date.now()),
    armyId,
    result: "Win",
    opponent: "",
    date: "",
    casualties: "",
    notes: "",
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addBattleOutcome(editing);
      else await actor.updateBattleOutcome(editing);
      await load();
      setEditing(null);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setSaving(false);
        return;
      }
      console.error(e);
      alert(`Failed to save battle outcome: ${String(e)}`);
    }
    setSaving(false);
  };

  const del = async (id: bigint) => {
    if (!confirm("Delete this battle outcome?")) return;
    try {
      await actor.deleteBattleOutcome(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof BattleOutcome, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const wins = items.filter((i) => i.result === "Win").length;
  const losses = items.filter((i) => i.result === "Loss").length;
  const draws = items.filter((i) => i.result === "Draw").length;

  const RESULT_COLORS: Record<string, string> = {
    Win: "#27ae60",
    Loss: "#e74c3c",
    Draw: "var(--ds-gold)",
  };

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div>
      {/* Summary */}
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
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--ds-muted)",
                textTransform: "uppercase",
              }}
            >
              Battles
            </div>
            <div
              style={{ fontSize: 22, fontWeight: 700, color: "var(--ds-text)" }}
            >
              {items.length}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--ds-muted)",
                textTransform: "uppercase",
              }}
            >
              Wins
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#27ae60" }}>
              {wins}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--ds-muted)",
                textTransform: "uppercase",
              }}
            >
              Losses
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#e74c3c" }}>
              {losses}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--ds-muted)",
                textTransform: "uppercase",
              }}
            >
              Draws
            </div>
            <div
              style={{ fontSize: 22, fontWeight: 700, color: "var(--ds-gold)" }}
            >
              {draws}
            </div>
          </div>
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
          Battle Outcomes
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blank());
            setIsNew(true);
          }}
          data-ocid="army.battles.add_button"
        >
          + Log Battle
        </button>
      </div>
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.battles.loading_state"
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
          data-ocid="army.battles.empty_state"
        >
          No battles logged yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((b, idx) => (
            <div
              key={b.id}
              className="ds-card"
              style={{
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
              data-ocid={`army.battles.item.${idx + 1}`}
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
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: `1px solid ${RESULT_COLORS[b.result] ?? "var(--ds-muted)"}`,
                      color: RESULT_COLORS[b.result] ?? "var(--ds-muted)",
                    }}
                  >
                    {b.result}
                  </span>
                  <span
                    className="font-cinzel"
                    style={{ color: "var(--ds-text)", fontSize: 14 }}
                  >
                    vs {b.opponent || "Unknown"}
                  </span>
                </div>
                {b.date && (
                  <p style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                    {b.date}
                  </p>
                )}
                {b.casualties && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ds-text)",
                      marginTop: 4,
                    }}
                  >
                    Casualties: {b.casualties}
                  </p>
                )}
                {b.notes && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ds-muted)",
                      marginTop: 2,
                    }}
                  >
                    {b.notes}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={() => {
                    setEditing({ ...b });
                    setIsNew(false);
                  }}
                  data-ocid={`army.battles.edit_button.${idx + 1}`}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={() => del(b.id)}
                  data-ocid={`army.battles.delete_button.${idx + 1}`}
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
                {isNew ? "Log Battle" : "Edit Battle"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.battles.close_button"
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
                  <div className="ds-label">Opponent</div>
                  <input
                    className="ds-input"
                    value={editing.opponent}
                    onChange={(e) => set("opponent", e.target.value)}
                    placeholder="Enemy army/faction"
                    data-ocid="army.battles.opponent.input"
                  />
                </div>
                <div>
                  <div className="ds-label">Result</div>
                  <select
                    className="ds-input"
                    value={editing.result}
                    onChange={(e) => set("result", e.target.value)}
                    data-ocid="army.battles.result.select"
                  >
                    {["Win", "Loss", "Draw"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="ds-label">Date</div>
                <input
                  className="ds-input"
                  value={editing.date}
                  onChange={(e) => set("date", e.target.value)}
                  placeholder="In-game date"
                  data-ocid="army.battles.date.input"
                />
              </div>
              <div>
                <div className="ds-label">Casualties</div>
                <input
                  className="ds-input"
                  value={editing.casualties}
                  onChange={(e) => set("casualties", e.target.value)}
                  placeholder="Troop losses, wounded officers"
                  data-ocid="army.battles.casualties.input"
                />
              </div>
              <div>
                <div className="ds-label">Notes</div>
                <textarea
                  className="ds-input"
                  rows={3}
                  value={editing.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  data-ocid="army.battles.notes.textarea"
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
                data-ocid="army.battles.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="army.battles.save_button"
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

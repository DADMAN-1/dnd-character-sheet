import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../../../components/ErrorBoundary";
import type { BattleEngagement, DndBackend } from "../../../types";
import { uid } from "./armyHelpers";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const OUTCOMES = ["Victory", "Defeat", "Draw", "Retreat"];

const OUTCOME_COLORS: Record<string, string> = {
  Victory: "#27ae60",
  Defeat: "#c0392b",
  Draw: "#e67e22",
  Retreat: "#8e44ad",
};

const emptyForm = (): Omit<BattleEngagement, "id"> => ({
  name: "",
  date: "",
  outcome: "Victory",
  losses: "",
  notes: "",
});

export default function ArmyBattleNotesPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [engagements, setEngagements] = useState<BattleEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getBattleEngagements(armyId);
      const sorted = [...data].sort((a, b) =>
        (b.date ?? "").localeCompare(a.date ?? ""),
      );
      setEngagements(sorted);
    } catch (e) {
      console.error(e);
      if (isCanisterStopped(e)) setCanisterStopped(true);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await actor.addBattleEngagement(armyId, { ...form, id: uid() });
      setForm(emptyForm());
      setAdding(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await actor.deleteBattleEngagement(armyId, id);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <p
        style={{ color: "var(--ds-muted)", fontSize: 13 }}
        data-ocid="army.battle_log.loading_state"
      >
        Loading battle log…
      </p>
    );
  }

  if (canisterStopped) {
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15 }}
        >
          Battle Engagements
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setAdding(true)}
          data-ocid="army.battle_log.open_modal_button"
        >
          + Log Battle
        </button>
      </div>

      {adding && (
        <div
          className="ds-card2"
          style={{
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <div>
              <label htmlFor="bl-name" className="ds-label">
                Battle Name *
              </label>
              <input
                id="bl-name"
                className="ds-input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Battle of Redmoor"
                style={{ fontSize: 13 }}
                data-ocid="army.battle_log.name.input"
              />
            </div>
            <div>
              <label htmlFor="bl-date" className="ds-label">
                Date
              </label>
              <input
                id="bl-date"
                className="ds-input"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Year / campaign day"
                style={{ fontSize: 13 }}
                data-ocid="army.battle_log.date.input"
              />
            </div>
            <div>
              <label htmlFor="bl-outcome" className="ds-label">
                Outcome
              </label>
              <select
                id="bl-outcome"
                className="ds-input"
                value={form.outcome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, outcome: e.target.value }))
                }
                style={{ fontSize: 13 }}
                data-ocid="army.battle_log.outcome.select"
              >
                {OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <input
            className="ds-input"
            value={form.losses}
            onChange={(e) => setForm((f) => ({ ...f, losses: e.target.value }))}
            placeholder="Losses (e.g. 200 infantry, 1 officer)"
            style={{ fontSize: 13 }}
            data-ocid="army.battle_log.losses.input"
          />
          <textarea
            className="ds-input"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Battle notes, tactics used, key moments…"
            style={{ fontSize: 13, resize: "vertical" }}
            data-ocid="army.battle_log.notes.textarea"
          />
          {error && (
            <span
              style={{ color: "#c0392b", fontSize: 12 }}
              data-ocid="army.battle_log.error_state"
            >
              {error}
            </span>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={handleAdd}
              disabled={saving}
              data-ocid="army.battle_log.submit_button"
            >
              {saving ? "Saving…" : "Log Battle"}
            </button>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={() => {
                setAdding(false);
                setForm(emptyForm());
                setError(null);
              }}
              data-ocid="army.battle_log.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {engagements.length === 0 && !adding && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--ds-muted)",
            fontSize: 13,
          }}
          data-ocid="army.battle_log.empty_state"
        >
          No battles logged yet. Click &ldquo;Log Battle&rdquo; to record your
          first engagement.
        </div>
      )}

      {/* Timeline-style list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {engagements.map((eng, idx) => (
          <div
            key={eng.id}
            style={{ display: "flex", gap: 12, paddingBottom: 12 }}
            data-ocid={`army.battle_log.item.${idx + 1}`}
          >
            {/* Timeline connector */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 20,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: OUTCOME_COLORS[eng.outcome] ?? "var(--ds-border)",
                  border: "2px solid var(--ds-bg)",
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
              {idx < engagements.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    background: "var(--ds-border)",
                    minHeight: 20,
                    marginTop: 2,
                  }}
                />
              )}
            </div>

            <div
              className="ds-card2"
              style={{ padding: "10px 12px", flex: 1, minWidth: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--ds-text)",
                        fontSize: 13,
                        fontFamily: "Cinzel, serif",
                      }}
                    >
                      {eng.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "1px 7px",
                        borderRadius: 10,
                        background: `${OUTCOME_COLORS[eng.outcome] ?? "#555"}22`,
                        color: OUTCOME_COLORS[eng.outcome] ?? "var(--ds-muted)",
                        border: `1px solid ${OUTCOME_COLORS[eng.outcome] ?? "var(--ds-border)"}55`,
                        fontWeight: 600,
                      }}
                    >
                      {eng.outcome}
                    </span>
                    {eng.date && (
                      <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                        {eng.date}
                      </span>
                    )}
                  </div>
                  {eng.losses && (
                    <div
                      style={{ color: "#e74c3c", fontSize: 12, marginTop: 3 }}
                    >
                      ⚔ Losses: {eng.losses}
                    </div>
                  )}
                  {eng.notes && (
                    <div
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        marginTop: 4,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {eng.notes}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{
                    fontSize: 11,
                    padding: "2px 6px",
                    color: "#c0392b",
                    flexShrink: 0,
                  }}
                  onClick={() => handleDelete(eng.id)}
                  data-ocid={`army.battle_log.delete_button.${idx + 1}`}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

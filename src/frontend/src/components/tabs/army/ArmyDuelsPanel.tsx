import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../../../components/ErrorBoundary";
import type { DndBackend, OfficerDuel } from "../../../types";
import { uid } from "./armyHelpers";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const OUTCOMES = ["Victory", "Defeat", "Draw"];

const OUTCOME_COLORS: Record<string, string> = {
  Victory: "#27ae60",
  Defeat: "#c0392b",
  Draw: "#e67e22",
};

const emptyForm = (): Omit<OfficerDuel, "id"> => ({
  officer1: "",
  officer2: "",
  outcome: "Victory",
  date: "",
  notes: "",
});

export default function ArmyDuelsPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [duels, setDuels] = useState<OfficerDuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getOfficerDuels(armyId);
      setDuels(
        [...(data ?? [])].sort((a, b) =>
          (b.date ?? "").localeCompare(a.date ?? ""),
        ),
      );
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
    if (!form.officer1.trim() || !form.officer2.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await actor.addOfficerDuel(armyId, { ...form, id: uid() });
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
      await actor.deleteOfficerDuel(armyId, id);
      await load();
    } catch (e) {
      console.error(e);
      alert(`Failed to delete duel entry: ${String(e)}`);
    }
  };

  if (loading) {
    return (
      <p
        style={{ color: "var(--ds-muted)", fontSize: 13 }}
        data-ocid="army.duels.loading_state"
      >
        Loading duel log…
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
          Officer Duel Log
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setAdding(true)}
          data-ocid="army.duels.open_modal_button"
        >
          + Record Duel
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
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <div>
              <label htmlFor="duel-o1" className="ds-label">
                Officer 1 *
              </label>
              <input
                id="duel-o1"
                className="ds-input"
                value={form.officer1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, officer1: e.target.value }))
                }
                placeholder="Officer name"
                style={{ fontSize: 13 }}
                data-ocid="army.duels.officer1.input"
              />
            </div>
            <div>
              <label htmlFor="duel-o2" className="ds-label">
                Officer 2 *
              </label>
              <input
                id="duel-o2"
                className="ds-input"
                value={form.officer2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, officer2: e.target.value }))
                }
                placeholder="Officer name"
                style={{ fontSize: 13 }}
                data-ocid="army.duels.officer2.input"
              />
            </div>
            <div>
              <label htmlFor="duel-outcome" className="ds-label">
                Outcome
              </label>
              <select
                id="duel-outcome"
                className="ds-input"
                value={form.outcome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, outcome: e.target.value }))
                }
                style={{ fontSize: 13 }}
                data-ocid="army.duels.outcome.select"
              >
                {OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duel-date" className="ds-label">
                Date
              </label>
              <input
                id="duel-date"
                className="ds-input"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date / campaign day"
                style={{ fontSize: 13 }}
                data-ocid="army.duels.date.input"
              />
            </div>
          </div>
          <textarea
            className="ds-input"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes on the duel, circumstances, aftermath…"
            style={{ fontSize: 13, resize: "vertical" }}
            data-ocid="army.duels.notes.textarea"
          />
          {error && (
            <span
              style={{ color: "#c0392b", fontSize: 12 }}
              data-ocid="army.duels.error_state"
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
              data-ocid="army.duels.submit_button"
            >
              {saving ? "Saving…" : "Record Duel"}
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
              data-ocid="army.duels.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {duels.length === 0 && !adding && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--ds-muted)",
            fontSize: 13,
          }}
          data-ocid="army.duels.empty_state"
        >
          No duels recorded yet. Track officer honour duels and their outcomes.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {duels.map((duel, idx) => {
          const outcomeColor =
            OUTCOME_COLORS[duel.outcome] ?? "var(--ds-muted)";
          return (
            <div
              key={duel.id}
              className="ds-card2"
              style={{
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
              data-ocid={`army.duels.item.${idx + 1}`}
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
                    }}
                  >
                    {duel.officer1}
                  </span>
                  <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                    vs
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--ds-text)",
                      fontSize: 13,
                    }}
                  >
                    {duel.officer2}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "1px 7px",
                      borderRadius: 10,
                      background: `${outcomeColor}22`,
                      color: outcomeColor,
                      border: `1px solid ${outcomeColor}55`,
                      fontWeight: 600,
                    }}
                  >
                    {duel.outcome}
                  </span>
                  {duel.date && (
                    <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                      {duel.date}
                    </span>
                  )}
                </div>
                {duel.notes && (
                  <p
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 12,
                      margin: "4px 0 0",
                    }}
                  >
                    {duel.notes}
                  </p>
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
                onClick={() => handleDelete(duel.id)}
                data-ocid={`army.duels.delete_button.${idx + 1}`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import type { ArmyMoraleHistoryEntry, DndBackend } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  baseMorale: bigint;
  onRestartConnection?: () => void;
}

export default function ArmyMoraleHistoryPanel({
  actor,
  armyId,
  baseMorale,
  onRestartConnection,
}: Props) {
  const [history, setHistory] = useState<ArmyMoraleHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    eventType: "Custom",
    modifier: 0,
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHistory(await actor.getArmyMoraleHistory(armyId));
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setHistory([]);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalModifier = history.reduce((sum, e) => sum + Number(e.modifier), 0);
  const currentMorale = Math.min(
    100,
    Math.max(0, Number(baseMorale) + totalModifier),
  );

  const logEvent = async () => {
    setAdding(true);
    try {
      const entry: ArmyMoraleHistoryEntry = {
        timestamp: new Date().toISOString(),
        eventType: form.eventType,
        modifier: BigInt(form.modifier),
        notes: form.notes,
      };
      await actor.addArmyMoraleEvent(armyId, entry);
      setForm({ eventType: "Custom", modifier: 0, notes: "" });
      await load();
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setAdding(false);
        return;
      }
      console.error("Failed to log morale event:", e);
      alert(`Failed to log morale event: ${String(e)}`);
    }
    setAdding(false);
  };

  const moraleColor =
    currentMorale >= 70
      ? "#27ae60"
      : currentMorale >= 40
        ? "var(--ds-gold)"
        : "#e74c3c";

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div>
      {/* Current morale display */}
      <div
        style={{
          background: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 8,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 10,
              color: "var(--ds-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current Morale
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: moraleColor,
              fontFamily: "Cinzel, serif",
            }}
          >
            {currentMorale}
          </div>
          <div style={{ fontSize: 11, color: "var(--ds-muted)" }}>/ 100</div>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 12,
              background: "var(--ds-surface2)",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${currentMorale}%`,
                background: moraleColor,
                borderRadius: 6,
                transition: "width 0.3s",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--ds-muted)" }}>
              Base: {baseMorale.toString()}
            </span>
            <span
              style={{
                fontSize: 11,
                color: totalModifier >= 0 ? "#27ae60" : "#e74c3c",
              }}
            >
              Modifiers: {totalModifier >= 0 ? "+" : ""}
              {totalModifier}
            </span>
          </div>
        </div>
      </div>

      {/* Log event form */}
      <div
        style={{
          background: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15, marginBottom: 12 }}
        >
          Log Morale Event
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <select
            className="ds-input"
            value={form.eventType}
            onChange={(e) =>
              setForm((f) => ({ ...f, eventType: e.target.value }))
            }
            data-ocid="army.morale.event_type.select"
          >
            {[
              "Victory",
              "Defeat",
              "Casualty",
              "Recruitment",
              "Desertion",
              "Resupply",
              "Promotion",
              "Betrayal",
              "Custom",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label
              htmlFor="morale-modifier"
              className="ds-label"
              style={{ whiteSpace: "nowrap", fontSize: 11 }}
            >
              Modifier
            </label>
            <input
              id="morale-modifier"
              type="number"
              className="ds-input"
              style={{ width: 80 }}
              value={form.modifier}
              onChange={(e) =>
                setForm((f) => ({ ...f, modifier: Number(e.target.value) }))
              }
              data-ocid="army.morale.modifier.input"
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="ds-input"
            style={{ flex: 1 }}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes about this event…"
            data-ocid="army.morale.notes.input"
          />
          <button
            type="button"
            className="ds-btn-primary"
            onClick={logEvent}
            disabled={adding}
            data-ocid="army.morale.log_button"
          >
            {adding ? "Saving…" : "Log Event"}
          </button>
        </div>
      </div>

      {/* History */}
      <h3
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 15, marginBottom: 12 }}
      >
        Event History
      </h3>
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.morale.loading_state"
        >
          Loading history…
        </p>
      ) : history.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            padding: "24px 0",
          }}
          data-ocid="army.morale.empty_state"
        >
          No morale events logged yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...history].reverse().map((e, idx) => (
            <div
              key={`${e.timestamp}-${idx}`}
              className="ds-card"
              style={{
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              data-ocid={`army.morale.event.${idx + 1}`}
            >
              <div>
                <span
                  className="font-cinzel"
                  style={{ color: "var(--ds-text)", fontSize: 13 }}
                >
                  {e.eventType}
                </span>
                {e.notes && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ds-muted)",
                      marginTop: 2,
                    }}
                  >
                    {e.notes}
                  </p>
                )}
                <p style={{ fontSize: 10, color: "var(--ds-muted)" }}>
                  {new Date(e.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: e.modifier >= 0 ? "#27ae60" : "#e74c3c",
                  fontFamily: "Cinzel, serif",
                }}
              >
                {e.modifier >= 0 ? "+" : ""}
                {e.modifier}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import type { Army, BattleSimResult, DndBackend } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

export default function BattleSimulatorPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [armies, setArmies] = useState<Army[]>([]);
  const [enemyArmyId, setEnemyArmyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<BattleSimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await actor.getArmies();
      const others = (all ?? []).filter((a) => a.id !== armyId);
      setArmies(others);
      if (others.length > 0) setEnemyArmyId(others[0].id);
    } catch (e) {
      if (isCanisterStopped(e)) setCanisterStopped(true);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSimulate = async () => {
    if (!enemyArmyId) {
      setError("Select an enemy army to simulate against.");
      return;
    }
    setSimulating(true);
    setError(null);
    setResult(null);
    try {
      const res = await actor.simulateBattle(
        BigInt(armyId),
        BigInt(enemyArmyId),
      );
      setResult(res);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
      } else {
        setError(e instanceof Error ? e.message : "Simulation failed");
      }
    }
    setSimulating(false);
  };

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15, margin: 0 }}
        >
          ⚔️ Battle Simulator
        </h3>
      </div>

      <p style={{ color: "var(--ds-muted)", fontSize: 13, margin: 0 }}>
        Select an enemy army and simulate the battle outcome based on troop
        counts, morale, training level, and power ratings. Results are narrative
        estimates — not dice rolls.
      </p>

      <div
        className="ds-card"
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {/* Your army indicator */}
          <div>
            <div className="ds-label">Your Army</div>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid var(--ds-border)",
                background: "var(--ds-surface)",
                fontSize: 13,
                color: "var(--ds-gold)",
                fontFamily: "Cinzel, serif",
              }}
              data-ocid="army.battlesim.your_army"
            >
              (current army)
            </div>
          </div>

          {/* Enemy army selector */}
          <div>
            <label htmlFor="sim-enemy" className="ds-label">
              Enemy Army *
            </label>
            {loading ? (
              <div
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--ds-muted)",
                }}
                data-ocid="army.battlesim.loading_state"
              >
                Loading armies…
              </div>
            ) : armies.length === 0 ? (
              <div
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--ds-muted)",
                  fontStyle: "italic",
                }}
                data-ocid="army.battlesim.no_enemy_state"
              >
                No other armies available. Create another army first.
              </div>
            ) : (
              <select
                id="sim-enemy"
                className="ds-input"
                value={enemyArmyId}
                onChange={(e) => {
                  setEnemyArmyId(e.target.value);
                  setResult(null);
                  setError(null);
                }}
                style={{ fontSize: 13 }}
                data-ocid="army.battlesim.enemy.select"
              >
                {armies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.size.toString()} troops, Morale{" "}
                    {a.moraleRating.toString()})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {error && (
          <span
            style={{ color: "#c0392b", fontSize: 12 }}
            data-ocid="army.battlesim.error_state"
          >
            {error}
          </span>
        )}

        <div>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={handleSimulate}
            disabled={simulating || loading || armies.length === 0}
            data-ocid="army.battlesim.simulate_button"
          >
            {simulating ? "Simulating…" : "⚔️ Simulate Battle"}
          </button>
        </div>
      </div>

      {/* Result narrative */}
      {result && (
        <div
          className="ds-card"
          style={{
            padding: 20,
            border: "1px solid var(--ds-gold)",
            background:
              "linear-gradient(135deg, rgba(212,175,55,0.07) 0%, var(--ds-surface) 100%)",
          }}
          data-ocid="army.battlesim.result_card"
        >
          <div
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--ds-gold)",
              marginBottom: 14,
              lineHeight: 1.3,
            }}
          >
            📜 {result.outcome}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid #27ae6055",
                background: "rgba(39,174,96,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#27ae60",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}
              >
                ⚔️ Victor
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#27ae60",
                  fontFamily: "Cinzel, serif",
                }}
                data-ocid="army.battlesim.winner_label"
              >
                {result.winnerName || "—"}
              </div>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid #c0392b55",
                background: "rgba(192,57,43,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#c0392b",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}
              >
                🛡️ Defeated
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#c0392b",
                  fontFamily: "Cinzel, serif",
                }}
                data-ocid="army.battlesim.loser_label"
              >
                {result.loserName || "—"}
              </div>
            </div>
          </div>

          {result.estimatedCasualties && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid var(--ds-border)",
                background: "var(--ds-surface)",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "var(--ds-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}
              >
                Estimated Casualties
              </div>
              <div
                style={{ fontSize: 13, color: "var(--ds-text)" }}
                data-ocid="army.battlesim.casualties_text"
              >
                {result.estimatedCasualties}
              </div>
            </div>
          )}

          {result.notes && (
            <div
              style={{
                fontSize: 13,
                color: "var(--ds-muted)",
                fontStyle: "italic",
                borderTop: "1px solid var(--ds-border)",
                paddingTop: 12,
                lineHeight: 1.5,
              }}
              data-ocid="army.battlesim.notes_text"
            >
              {result.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import { buildArmyInput, newArmy } from "../components/tabs/army/armyHelpers";
import type { Army, Character, DndBackend } from "../types";

interface Props {
  actor: DndBackend;
  onSelectArmy: (armyId: string) => void;
  onRestartConnection?: () => void;
}

type CharWithId = { id: bigint } & Character;

function normalizeArmyBasic(a: Army): Army {
  return {
    ...a,
    branches: a.branches ?? [],
    officers: a.officers ?? [],
    commanders: a.commanders ?? [],
    ranks: a.ranks ?? [],
    specOpsGroups: a.specOpsGroups ?? [],
    armyAbilities: a.armyAbilities ?? [],
    officerAbilities: a.officerAbilities ?? [],
    commanderAbilities: a.commanderAbilities ?? [],
    machinery: a.machinery ?? [],
    alliedArmies: a.alliedArmies ?? [],
    specialties: a.specialties ?? [],
    logistics: a.logistics ?? {
      food: 0n,
      ammunition: 0n,
      goldReserves: 0n,
      supplyLines: [],
      casualtiesLog: [],
      injuryNotes: "",
    },
    commandStructure: a.commandStructure ?? {
      chainOfCommand: [],
      ordersLog: [],
    },
    intelligence: a.intelligence ?? { enemyIntelLog: [], scoutReports: [] },
    moraleData: a.moraleData ?? { moraleEventsLog: [], loyaltyTracker: [] },
    armyNotes: a.armyNotes ?? {
      campaignLog: [],
      battlePlannerNotes: [],
      generalNotes: "",
    },
  };
}

export default function ArmyListPage({
  actor,
  onSelectArmy,
  onRestartConnection,
}: Props) {
  const [armies, setArmies] = useState<Army[]>([]);
  const [characters, setCharacters] = useState<CharWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [armyList, charList] = await Promise.all([
        actor.getArmies().catch(() => [] as Army[]),
        actor.getAllCharacters().catch(() => [] as [bigint, Character][]),
      ]);
      // Fix 6: defensive defaults — never assume backend response is an array
      const safeArmyList = Array.isArray(armyList) ? armyList : [];
      const safeCharList = Array.isArray(charList) ? charList : [];
      setArmies(safeArmyList.map(normalizeArmyBasic));
      setCharacters(
        (safeCharList as [bigint, Character][]).map(([id, char]) => ({
          id,
          ...char,
        })),
      );
    } catch (e) {
      setArmies([]);
      if (isCanisterStopped(e)) setCanisterStopped(true);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      // Create with characterId=0n as placeholder — armies are now top-level
      const dummy = newArmy(0n);
      await actor.addArmy(buildArmyInput(dummy));
      const list = await actor.getArmies();
      const normalized = (Array.isArray(list) ? list : []).map(
        normalizeArmyBasic,
      );
      setArmies(normalized);
      const last = normalized[normalized.length - 1];
      if (last) onSelectArmy(last.id);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
      } else {
        setError(e instanceof Error ? e.message : "Failed to create army");
      }
    }
    setCreating(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this army? This cannot be undone.")) return;
    try {
      await actor.deleteArmy(id);
      setArmies((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      if (isCanisterStopped(err)) {
        setCanisterStopped(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to delete army");
      }
    }
  };

  const getCommanderName = (army: Army) => {
    if (!army.commandingCharacterId) return null;
    const char = characters.find(
      (c) => c.id.toString() === army.commandingCharacterId,
    );
    return char?.name ?? null;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#27ae60";
      case "Resting":
        return "#3498db";
      case "Disbanded":
        return "#c0392b";
      default:
        return "var(--ds-muted)";
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h1
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 28 }}
        >
          My Armies
        </h1>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={handleCreate}
          disabled={creating}
          style={{ fontFamily: "Cinzel, serif" }}
          data-ocid="armies.primary_button"
        >
          {creating ? "Creating…" : "+ New Army"}
        </button>
      </div>

      {canisterStopped && (
        <CanisterErrorUI onRestartConnection={onRestartConnection} />
      )}

      {!canisterStopped && error && (
        <div
          style={{
            color: "#c0392b",
            fontSize: 13,
            marginBottom: 16,
            padding: "8px 12px",
            background: "rgba(192,57,43,0.1)",
            borderRadius: 6,
          }}
          data-ocid="armies.error_state"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 48,
          }}
          data-ocid="armies.loading_state"
        >
          Loading armies...
        </p>
      ) : armies.length === 0 ? (
        <div
          style={{ textAlign: "center", marginTop: 64 }}
          data-ocid="armies.empty_state"
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
          <p
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 20, marginBottom: 8 }}
          >
            No Armies Yet
          </p>
          <p style={{ color: "var(--ds-muted)", marginBottom: 24 }}>
            Create your first army to start commanding forces.
          </p>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={handleCreate}
            disabled={creating}
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Create Army
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {armies.map((army, idx) => {
            const commanderName = getCommanderName(army);
            return (
              <div
                key={army.id}
                style={{ position: "relative" }}
                data-ocid={`armies.item.${idx + 1}`}
              >
                <button
                  type="button"
                  className="ds-card clickable"
                  style={{
                    padding: 20,
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "block",
                    paddingBottom: 54,
                  }}
                  onClick={() => onSelectArmy(army.id)}
                  data-ocid={`armies.open_button.${idx + 1}`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <h2
                      className="font-cinzel"
                      style={{
                        color: "var(--ds-gold)",
                        fontSize: 17,
                        marginBottom: 2,
                        paddingRight: 8,
                      }}
                    >
                      {army.name}
                    </h2>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 4,
                        background:
                          army.status === "Active"
                            ? "rgba(39,174,96,0.15)"
                            : "rgba(150,150,150,0.12)",
                        color: statusColor(army.status),
                        border: "1px solid currentColor",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {army.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <ArmyStat label="Troops" value={army.size.toString()} />
                    <ArmyStat
                      label="Morale"
                      value={`${army.moraleRating}/100`}
                    />
                    <ArmyStat label="Training" value={army.trainingLevel} />
                    <ArmyStat label="Condition" value={army.condition} />
                  </div>

                  {commanderName && (
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      ⚔️ Commander: {commanderName}
                    </p>
                  )}
                  {army.faction && (
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      🏰 {army.faction}
                    </p>
                  )}
                </button>

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    gap: 4,
                    padding: "8px 12px",
                    borderTop: "1px solid var(--ds-border)",
                    backgroundColor: "var(--ds-surface)",
                    borderRadius: "0 0 8px 8px",
                  }}
                >
                  <button
                    type="button"
                    className="ds-btn-primary"
                    style={{ flex: 1, fontSize: 12 }}
                    onClick={() => onSelectArmy(army.id)}
                    data-ocid={`armies.manage_button.${idx + 1}`}
                  >
                    Manage
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(army.id, e)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      padding: "4px 8px",
                      fontSize: 15,
                    }}
                    title="Delete army"
                    data-ocid={`armies.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ArmyStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
      <span
        style={{
          color: "var(--ds-muted)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}
      >
        {label}:
      </span>
      <span style={{ color: "var(--ds-text)", fontSize: 12, fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

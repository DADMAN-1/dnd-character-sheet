import { useCallback, useEffect, useState } from "react";
import type { Army, ArmyAbility, ArmyInput, DndBackend } from "../../types";
import ArmyAbilityList from "./army/ArmyAbilityList";
import ArmyBranchesPanel from "./army/ArmyBranchesPanel";
import ArmyCommandPanel from "./army/ArmyCommandPanel";
import ArmyCommandersPanel from "./army/ArmyCommandersPanel";
import { ArmyIntelPanel, ArmyMoralePanel } from "./army/ArmyIntelPanel";
import ArmyLogisticsPanel from "./army/ArmyLogisticsPanel";
import ArmyMachineryPanel from "./army/ArmyMachineryPanel";
import { AlliedArmiesPanel, ArmyNotesPanel } from "./army/ArmyNotesPanel";
import ArmyOfficersPanel from "./army/ArmyOfficersPanel";
import ArmyOverviewPanel from "./army/ArmyOverviewPanel";
import ArmyRanksPanel from "./army/ArmyRanksPanel";
import ArmySpecOpsPanel from "./army/ArmySpecOpsPanel";
import {
  buildArmyInput,
  emptyCommandStructure,
  emptyIntelligence,
  emptyLogistics,
  emptyMoraleData,
  emptyNotes,
  newArmy,
} from "./army/armyHelpers";

/** Apply defensive defaults to a raw Army from the backend.
 * Armies saved before schema fields were added may have undefined nested objects/arrays. */
function normalizeArmy(a: Army): Army {
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
    logistics: a.logistics
      ? {
          ...emptyLogistics(),
          ...a.logistics,
          supplyLines: a.logistics.supplyLines ?? [],
          casualtiesLog: a.logistics.casualtiesLog ?? [],
        }
      : emptyLogistics(),
    commandStructure: a.commandStructure
      ? {
          ...emptyCommandStructure(),
          ...a.commandStructure,
          chainOfCommand: a.commandStructure.chainOfCommand ?? [],
          ordersLog: a.commandStructure.ordersLog ?? [],
        }
      : emptyCommandStructure(),
    intelligence: a.intelligence
      ? {
          ...emptyIntelligence(),
          ...a.intelligence,
          enemyIntelLog: a.intelligence.enemyIntelLog ?? [],
          scoutReports: a.intelligence.scoutReports ?? [],
        }
      : emptyIntelligence(),
    moraleData: a.moraleData
      ? {
          ...emptyMoraleData(),
          ...a.moraleData,
          moraleEventsLog: a.moraleData.moraleEventsLog ?? [],
          loyaltyTracker: a.moraleData.loyaltyTracker ?? [],
        }
      : emptyMoraleData(),
    armyNotes: a.armyNotes
      ? {
          ...emptyNotes(),
          ...a.armyNotes,
          campaignLog: a.armyNotes.campaignLog ?? [],
          battlePlannerNotes: a.armyNotes.battlePlannerNotes ?? [],
        }
      : emptyNotes(),
  };
}

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

type ArmySubTab =
  | "overview"
  | "ranks"
  | "branches"
  | "specops"
  | "machinery"
  | "officers"
  | "commanders"
  | "abilities"
  | "logistics"
  | "intel"
  | "command"
  | "morale"
  | "allies"
  | "notes";

const SUB_TABS: { id: ArmySubTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "ranks", label: "Ranks" },
  { id: "branches", label: "Branches" },
  { id: "specops", label: "Spec Ops" },
  { id: "machinery", label: "Machinery" },
  { id: "officers", label: "Officers" },
  { id: "commanders", label: "Commanders" },
  { id: "abilities", label: "Abilities" },
  { id: "logistics", label: "Logistics" },
  { id: "intel", label: "Intel" },
  { id: "command", label: "Command" },
  { id: "morale", label: "Morale" },
  { id: "allies", label: "Allies" },
  { id: "notes", label: "Notes" },
];

export default function ArmyTab({ actor, characterId }: Props) {
  const [armies, setArmies] = useState<Army[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<ArmySubTab>("overview");
  const [draft, setDraft] = useState<Army | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await actor.getArmiesByCharacter(characterId);
      setArmies(list.map(normalizeArmy));
    } catch {
      setArmies([]);
    }
    setLoading(false);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedArmy = armies.find((a) => a.id === selectedId) ?? null;

  const selectArmy = (id: string) => {
    const army = armies.find((a) => a.id === id);
    if (!army) return;
    setSelectedId(id);
    setDraft({ ...army });
    setSaveError(null);
    setSaveSuccess(false);
    setSubTab("overview");
  };

  const createArmy = async () => {
    const a = newArmy(characterId);
    setSaving(true);
    setSaveError(null);
    try {
      await actor.addArmy(buildArmyInput(a));
    } catch (e) {
      setSaving(false);
      setSaveError(e instanceof Error ? e.message : "Failed to create army");
      return;
    }
    setSaving(false);
    try {
      const list = await actor.getArmiesByCharacter(characterId);
      const normalized = list.map(normalizeArmy);
      setArmies(normalized);
      const last = normalized[normalized.length - 1];
      if (last) selectArmy(last.id);
    } catch {
      await load();
    }
  };

  const saveArmy = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    const input: ArmyInput = buildArmyInput(draft);
    try {
      if (draft.id) {
        await actor.updateArmy(draft.id, input);
      } else {
        await actor.addArmy(input);
      }
    } catch (e) {
      setSaving(false);
      setSaveError(e instanceof Error ? e.message : "Failed to save");
      return;
    }
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    await load();
  };

  const deleteArmy = async (id: string) => {
    if (!confirm("Delete this army? This cannot be undone.")) return;
    setSaveError(null);
    try {
      await actor.deleteArmy(id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to delete army");
      return;
    }
    if (selectedId === id) {
      setSelectedId(null);
      setDraft(null);
    }
    await load();
  };

  const updateDraft = (updates: Partial<Army>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  if (loading) {
    return (
      <div
        style={{ padding: 24, color: "var(--ds-muted)", textAlign: "center" }}
        data-ocid="army.loading_state"
      >
        Loading armies…
      </div>
    );
  }

  if (!draft || !selectedArmy) {
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
          <h2
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 20 }}
          >
            Armies
          </h2>
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontSize: 13 }}
            onClick={createArmy}
            disabled={saving}
            data-ocid="army.create_button"
          >
            {saving ? "Creating…" : "+ New Army"}
          </button>
        </div>

        {saveError && (
          <div
            style={{
              color: "#c0392b",
              fontSize: 13,
              marginBottom: 12,
              padding: "8px 12px",
              background: "rgba(192,57,43,0.1)",
              borderRadius: 6,
            }}
            data-ocid="army.error_state"
          >
            {saveError}
          </div>
        )}

        {armies.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--ds-muted)",
            }}
            data-ocid="army.empty_state"
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚔️</div>
            <p
              style={{
                fontSize: 16,
                fontFamily: "Cinzel, serif",
                color: "var(--ds-gold)",
                marginBottom: 8,
              }}
            >
              No Armies Yet
            </p>
            <p style={{ fontSize: 13 }}>
              Create your first army to start commanding forces.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {armies.map((a, idx) => (
            <div
              key={a.id}
              className="ds-card2"
              style={{
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              data-ocid={`army.list.item.${idx + 1}`}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--ds-text)",
                    fontSize: 15,
                    fontFamily: "Cinzel, serif",
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {a.size.toString()} troops · {a.trainingLevel} · {a.status} ·
                  Morale {a.moraleRating.toString()}
                  {a.faction && ` · ${a.faction}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ fontSize: 12 }}
                  onClick={() => selectArmy(a.id)}
                  data-ocid={`army.open_button.${idx + 1}`}
                >
                  Manage
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 12, color: "#c0392b" }}
                  onClick={() => deleteArmy(a.id)}
                  data-ocid={`army.delete_button.${idx + 1}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Army header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 13 }}
            onClick={() => {
              setSelectedId(null);
              setDraft(null);
            }}
            data-ocid="army.back_button"
          >
            ← Armies
          </button>
          <h2
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 18 }}
          >
            {draft.name}
          </h2>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 4,
              background:
                draft.status === "Active"
                  ? "rgba(39,174,96,0.15)"
                  : "rgba(150,150,150,0.15)",
              color: draft.status === "Active" ? "#27ae60" : "var(--ds-muted)",
              border: "1px solid currentColor",
            }}
          >
            {draft.status}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {saveError && (
            <span
              style={{ color: "#c0392b", fontSize: 12 }}
              data-ocid="army.save.error_state"
            >
              {saveError}
            </span>
          )}
          {saveSuccess && (
            <span
              style={{ color: "#27ae60", fontSize: 12 }}
              data-ocid="army.save.success_state"
            >
              Saved!
            </span>
          )}
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontSize: 13 }}
            onClick={saveArmy}
            disabled={saving}
            data-ocid="army.save_button"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Army stats bar */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          backgroundColor: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 14,
        }}
      >
        <StatChip label="Troops" value={draft.size.toString()} />
        <StatChip label="Morale" value={`${draft.moraleRating}/100`} />
        <StatChip label="Power" value={`${draft.powerLevel}/100`} />
        <StatChip label="Training" value={draft.trainingLevel} />
        <StatChip label="Condition" value={draft.condition} />
        {draft.warChest > 0n && (
          <StatChip
            label="War Chest"
            value={`${draft.warChest}g`}
            color="var(--ds-gold)"
          />
        )}
      </div>

      {/* Sub-tab navigation */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--ds-border)",
          marginBottom: 16,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {SUB_TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setSubTab(t.id)}
            data-ocid={`army.${t.id}.tab`}
            style={{
              background: "transparent",
              border: "none",
              borderBottom:
                subTab === t.id
                  ? "2px solid var(--ds-gold)"
                  : "2px solid transparent",
              color: subTab === t.id ? "var(--ds-gold)" : "var(--ds-muted)",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "Cinzel, serif",
              whiteSpace: "nowrap",
              marginBottom: -1,
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      <div>
        {subTab === "overview" && (
          <ArmyOverviewPanel army={draft} onChange={updateDraft} />
        )}
        {subTab === "ranks" && (
          <ArmyRanksPanel
            ranks={draft.ranks ?? []}
            onChange={(ranks) => updateDraft({ ranks })}
          />
        )}
        {subTab === "branches" && (
          <ArmyBranchesPanel
            branches={draft.branches ?? []}
            officers={draft.officers ?? []}
            ranks={draft.ranks ?? []}
            armySize={draft.size}
            onChange={(branches) => updateDraft({ branches })}
            onRanksChange={(ranks) => updateDraft({ ranks })}
          />
        )}
        {subTab === "specops" && (
          <ArmySpecOpsPanel
            groups={draft.specOpsGroups ?? []}
            officers={draft.officers ?? []}
            onChange={(specOpsGroups) => updateDraft({ specOpsGroups })}
          />
        )}
        {subTab === "machinery" && (
          <ArmyMachineryPanel
            machinery={draft.machinery ?? []}
            onChange={(machinery) => updateDraft({ machinery })}
          />
        )}
        {subTab === "officers" && (
          <ArmyOfficersPanel
            officers={draft.officers ?? []}
            ranks={draft.ranks ?? []}
            factions={[]}
            onChange={(officers) => updateDraft({ officers })}
          />
        )}
        {subTab === "commanders" && (
          <ArmyCommandersPanel
            commanders={draft.commanders ?? []}
            ranks={draft.ranks ?? []}
            factions={[]}
            onChange={(commanders) => updateDraft({ commanders })}
          />
        )}
        {subTab === "abilities" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <ArmyAbilityList
              abilities={draft.armyAbilities ?? []}
              onChange={(armyAbilities: ArmyAbility[]) =>
                updateDraft({ armyAbilities })
              }
              title="Army Abilities"
              ocidPrefix="army.army_ability"
            />
            <ArmyAbilityList
              abilities={draft.officerAbilities ?? []}
              onChange={(officerAbilities: ArmyAbility[]) =>
                updateDraft({ officerAbilities })
              }
              title="Officer Ability Library"
              ocidPrefix="army.officer_ability"
            />
            <ArmyAbilityList
              abilities={draft.commanderAbilities ?? []}
              onChange={(commanderAbilities: ArmyAbility[]) =>
                updateDraft({ commanderAbilities })
              }
              title="Commander Ability Library"
              ocidPrefix="army.commander_ability_lib"
            />
          </div>
        )}
        {subTab === "logistics" && (
          <ArmyLogisticsPanel
            logistics={
              draft.logistics ?? {
                food: 0n,
                ammunition: 0n,
                goldReserves: 0n,
                supplyLines: [],
                casualtiesLog: [],
                injuryNotes: "",
              }
            }
            onChange={(logistics) => updateDraft({ logistics })}
          />
        )}
        {subTab === "intel" && (
          <ArmyIntelPanel
            intelligence={
              draft.intelligence ?? {
                enemyIntelLog: [],
                scoutReports: [],
              }
            }
            onChange={(intelligence) => updateDraft({ intelligence })}
          />
        )}
        {subTab === "command" && (
          <ArmyCommandPanel
            commandStructure={
              draft.commandStructure ?? { chainOfCommand: [], ordersLog: [] }
            }
            officers={draft.officers ?? []}
            onChange={(commandStructure) => updateDraft({ commandStructure })}
          />
        )}
        {subTab === "morale" && (
          <ArmyMoralePanel
            moraleData={
              draft.moraleData ?? {
                moraleEventsLog: [],
                loyaltyTracker: [],
              }
            }
            onChange={(moraleData) => updateDraft({ moraleData })}
          />
        )}
        {subTab === "allies" && (
          <AlliedArmiesPanel
            alliedArmies={draft.alliedArmies ?? []}
            onChange={(alliedArmies) => updateDraft({ alliedArmies })}
          />
        )}
        {subTab === "notes" && (
          <ArmyNotesPanel
            notes={
              draft.armyNotes ?? {
                campaignLog: [],
                battlePlannerNotes: [],
                generalNotes: "",
              }
            }
            onChange={(armyNotes) => updateDraft({ armyNotes })}
          />
        )}
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div
        style={{
          color: "var(--ds-muted)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: color ?? "var(--ds-text)",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

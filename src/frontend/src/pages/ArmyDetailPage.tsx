import { useCallback, useEffect, useRef, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import ArmyAbilityList from "../components/tabs/army/ArmyAbilityList";
import ArmyBattleNotesPanel from "../components/tabs/army/ArmyBattleNotesPanel";
import ArmyBattleOutcomesPanel from "../components/tabs/army/ArmyBattleOutcomesPanel";
import ArmyBranchesPanel from "../components/tabs/army/ArmyBranchesPanel";
import ArmyCapturedEnemiesPanel from "../components/tabs/army/ArmyCapturedEnemiesPanel";
import ArmyCommandPanel from "../components/tabs/army/ArmyCommandPanel";
import ArmyCommandersPanel from "../components/tabs/army/ArmyCommandersPanel";
import ArmyDuelsPanel from "../components/tabs/army/ArmyDuelsPanel";
import {
  ArmyIntelPanel,
  ArmyMoralePanel,
} from "../components/tabs/army/ArmyIntelPanel";
import ArmyLogisticsPanel from "../components/tabs/army/ArmyLogisticsPanel";
import ArmyLootPanel from "../components/tabs/army/ArmyLootPanel";
import ArmyMachineryPanel from "../components/tabs/army/ArmyMachineryPanel";
import ArmyMoraleHistoryPanel from "../components/tabs/army/ArmyMoraleHistoryPanel";
import {
  AlliedArmiesPanel,
  ArmyNotesPanel,
} from "../components/tabs/army/ArmyNotesPanel";
import ArmyOfficersPanel from "../components/tabs/army/ArmyOfficersPanel";
import ArmyOverviewPanel from "../components/tabs/army/ArmyOverviewPanel";
import ArmyRanksPanel from "../components/tabs/army/ArmyRanksPanel";
import ArmyRecruitmentPanel from "../components/tabs/army/ArmyRecruitmentPanel";
import ArmyRelationshipsPanel from "../components/tabs/army/ArmyRelationshipsPanel";
import ArmySpecOpsPanel from "../components/tabs/army/ArmySpecOpsPanel";
import ArmySupplyConsumptionPanel from "../components/tabs/army/ArmySupplyConsumptionPanel";
import BattleSimulatorPanel from "../components/tabs/army/BattleSimulatorPanel";
import BattleTimelinePanel from "../components/tabs/army/BattleTimelinePanel";
import BountyObjectivesPanel from "../components/tabs/army/BountyObjectivesPanel";
import DeploymentMapPanel from "../components/tabs/army/DeploymentMapPanel";
import DiplomacyLogPanel from "../components/tabs/army/DiplomacyLogPanel";
import EnemyRosterPanel from "../components/tabs/army/EnemyRosterPanel";
import GainLossPanel from "../components/tabs/army/GainLossPanel";
import OfficerSkillsPanel from "../components/tabs/army/OfficerSkillsPanel";
import PrisonerExchangePanel from "../components/tabs/army/PrisonerExchangePanel";
import SupplyRoutesPanel from "../components/tabs/army/SupplyRoutesPanel";
import {
  buildArmyInput,
  emptyCommandStructure,
  emptyIntelligence,
  emptyLogistics,
  emptyMoraleData,
  emptyNotes,
} from "../components/tabs/army/armyHelpers";
import type { Faction } from "../types";
import type {
  Army,
  ArmyAbility,
  ArmyInput,
  Character,
  DndBackend,
} from "../types";

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
  | "notes"
  | "battle_log"
  | "relationships"
  | "recruitment"
  | "duels"
  | "supply_log"
  | "battle_outcomes"
  | "prisoners"
  | "morale_history"
  | "battle_timeline"
  | "interactions"
  | "enemies"
  | "loot"
  | "objectives"
  | "prisoner_exchange"
  | "deployment"
  | "diplomacy"
  | "battlesimulator"
  | "supplyroutes"
  | "officerskills";

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
  { id: "battle_log", label: "Battle Log" },
  { id: "relationships", label: "Relationships" },
  { id: "recruitment", label: "Recruitment" },
  { id: "duels", label: "Duels" },
  { id: "supply_log", label: "Supply Log" },
  { id: "battle_outcomes", label: "Battles" },
  { id: "prisoners", label: "Captured" },
  { id: "morale_history", label: "Morale Log" },
  { id: "battle_timeline", label: "Battle Timeline" },
  { id: "interactions", label: "Interactions" },
  { id: "enemies", label: "Enemies" },
  { id: "loot", label: "Loot" },
  { id: "objectives", label: "Objectives" },
  { id: "prisoner_exchange", label: "Prisoners" },
  { id: "deployment", label: "Deployment" },
  { id: "diplomacy", label: "Diplomacy" },
  { id: "battlesimulator", label: "Battle Sim" },
  { id: "supplyroutes", label: "Supply Routes" },
  { id: "officerskills", label: "Officer Skills" },
];

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
  armyId: string;
  onBack: () => void;
  onRestartConnection?: () => void;
}

type CharWithId = { id: bigint } & Character;

export default function ArmyDetailPage({
  actor,
  armyId,
  onBack,
  onRestartConnection,
}: Props) {
  const [army, setArmy] = useState<Army | null>(null);
  const [draft, setDraft] = useState<Army | null>(null);
  const [characters, setCharacters] = useState<CharWithId[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [subTab, setSubTab] = useState<ArmySubTab>("overview");

  // Banner upload
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Siege mode (local state, saved via updateArmy through terrainNotes field since
  // Army type doesn't have dedicated siege fields — we encode it in a special prefix)
  const [siegeMode, setSiegeMode] = useState(false);
  const [siegeNotes, setSiegeNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [armies, charList, facs] = await Promise.all([
        actor.getArmies().catch(() => [] as Army[]),
        actor.getAllCharacters().catch(() => [] as [bigint, Character][]),
        actor.getFactions().catch(() => [] as Faction[]),
      ]);
      setFactions(facs);
      // Fix 4 + Fix 6: normalize on EVERY load path; guard arrays from backend
      const safeArmies = Array.isArray(armies) ? armies : [];
      const safeCharList = Array.isArray(charList) ? charList : [];
      const found = safeArmies.find((a) => a.id === armyId);
      if (found) {
        const normalized = normalizeArmy(found);
        setArmy(normalized);
        setDraft({ ...normalized });
        // Seed banner URL from saved army data
        setBannerUrl(normalized.banner ?? "");
        // Parse siege mode from terrainNotes if present
        const tn = normalized.terrainNotes ?? "";
        if (tn.startsWith("[SIEGE]")) {
          setSiegeMode(true);
          setSiegeNotes(tn.replace("[SIEGE]", "").trimStart());
        } else {
          setSiegeMode(false);
          setSiegeNotes(tn);
        }
      }
      setCharacters(
        safeCharList.map(([id, char]) => ({
          id,
          ...char,
        })),
      );
    } catch (e) {
      console.error("Failed to load army:", e);
      if (isCanisterStopped(e)) setCanisterStopped(true);
    } finally {
      setLoading(false);
    }
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateDraft = (updates: Partial<Army>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const saveArmy = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    // Encode siege mode into terrainNotes
    const terrainNotes = siegeMode
      ? `[SIEGE] ${siegeNotes}`.trim()
      : siegeNotes;
    const input: ArmyInput = buildArmyInput({ ...draft, terrainNotes });
    try {
      await actor.updateArmy(draft.id, input);
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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    setBannerUploading(true);
    setBannerError(null);
    try {
      // Convert to base64 data URL for storage (object-storage not available in this env;
      // use a simple URL input fallback)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const url = reader.result as string;
        try {
          await actor.updateArmyBanner(draft.id, url);
          // Also persist via updateArmy so army.banner round-trips correctly
          await actor.updateArmy(
            draft.id,
            buildArmyInput({ ...draft, banner: url }),
          );
          setBannerUrl(url);
          updateDraft({ banner: url });
        } catch (err) {
          setBannerError(
            err instanceof Error ? err.message : "Failed to save banner",
          );
        }
        setBannerUploading(false);
      };
      reader.onerror = () => {
        setBannerError("Failed to read image file");
        setBannerUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : "Failed to upload banner",
      );
      setBannerUploading(false);
    }
  };

  const handleBannerUrlSave = async () => {
    if (!draft || !bannerUrl.trim()) return;
    setBannerUploading(true);
    setBannerError(null);
    try {
      await actor.updateArmyBanner(draft.id, bannerUrl.trim());
      // Also persist via updateArmy so army.banner round-trips correctly
      await actor.updateArmy(
        draft.id,
        buildArmyInput({ ...draft, banner: bannerUrl.trim() }),
      );
      updateDraft({ banner: bannerUrl.trim() });
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : "Failed to save banner URL",
      );
    }
    setBannerUploading(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
        data-ocid="army.loading_state"
      >
        <p style={{ color: "var(--ds-muted)" }}>Loading army...</p>
      </div>
    );
  }

  if (canisterStopped) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 13, marginBottom: 16 }}
          onClick={onBack}
          data-ocid="army.back_button"
        >
          ← All Armies
        </button>
        <CanisterErrorUI onRestartConnection={onRestartConnection} />
      </div>
    );
  }

  if (!draft || !army) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
        }}
      >
        <p style={{ color: "var(--ds-muted)" }}>Army not found.</p>
        <button type="button" className="ds-btn-ghost" onClick={onBack}>
          ← Back to Armies
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Army banner image */}
      {bannerUrl && (
        <div
          style={{
            width: "100%",
            maxHeight: 200,
            overflow: "hidden",
            borderRadius: 8,
            marginBottom: 12,
            border: "1px solid var(--ds-border)",
          }}
        >
          <img
            src={bannerUrl}
            alt={`${draft.name} banner`}
            style={{ width: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {/* Siege mode banner */}
      {siegeMode && (
        <div
          style={{
            background: "rgba(192,57,43,0.15)",
            border: "2px solid #c0392b",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
          data-ocid="army.siege_mode.banner"
        >
          <span style={{ fontSize: 18 }}>🏰</span>
          <span
            style={{
              color: "#e74c3c",
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.1em",
            }}
          >
            SIEGE MODE ACTIVE
          </span>
        </div>
      )}

      {/* Page header */}
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
            onClick={onBack}
            data-ocid="army.back_button"
          >
            ← All Armies
          </button>
          <h1
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 22 }}
          >
            {draft.name}
          </h1>
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

      {/* Commanding character selector */}
      <div
        style={{
          backgroundColor: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="army-commanding-char"
          style={{
            fontSize: 12,
            color: "var(--ds-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          Commanding Character
        </label>
        <select
          id="army-commanding-char"
          className="ds-input"
          value={draft.commandingCharacterId ?? ""}
          onChange={(e) =>
            updateDraft({
              commandingCharacterId: e.target.value || undefined,
            })
          }
          style={{ fontSize: 13, minWidth: 180, flex: 1, maxWidth: 320 }}
          data-ocid="army.commanding_character.select"
        >
          <option value="">— None —</option>
          {characters.map((c) => (
            <option key={c.id.toString()} value={c.id.toString()}>
              {c.name} ({c.race} · {c.characterClass} · Lv
              {c.level.toString()})
            </option>
          ))}
        </select>
        {draft.commandingCharacterId &&
          characters.find(
            (c) => c.id.toString() === draft.commandingCharacterId,
          ) && (
            <span
              style={{
                fontSize: 12,
                color: "var(--ds-gold)",
                fontFamily: "Cinzel, serif",
              }}
            >
              ⚔️{" "}
              {
                characters.find(
                  (c) => c.id.toString() === draft.commandingCharacterId,
                )!.name
              }
            </span>
          )}

        {/* Siege mode toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: "auto",
          }}
        >
          <label
            htmlFor="army-siege-toggle"
            style={{
              fontSize: 12,
              color: siegeMode ? "#e74c3c" : "var(--ds-muted)",
              fontFamily: "Cinzel, serif",
              cursor: "pointer",
            }}
          >
            🏰 Siege Mode
          </label>
          <input
            id="army-siege-toggle"
            type="checkbox"
            checked={siegeMode}
            onChange={(e) => setSiegeMode(e.target.checked)}
            data-ocid="army.siege_mode.toggle"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Siege notes (only when siege mode is on) */}
      {siegeMode && (
        <div
          style={{
            backgroundColor: "rgba(192,57,43,0.08)",
            border: "1px solid #c0392b55",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 12,
          }}
        >
          <label
            htmlFor="army-siege-notes"
            className="ds-label"
            style={{ color: "#e74c3c" }}
          >
            Siege Notes
          </label>
          <textarea
            id="army-siege-notes"
            className="ds-input"
            rows={2}
            value={siegeNotes}
            onChange={(e) => setSiegeNotes(e.target.value)}
            placeholder="Siege objectives, defenses breached, current status…"
            style={{ resize: "vertical", fontSize: 13 }}
            data-ocid="army.siege_mode.notes.textarea"
          />
        </div>
      )}

      {/* Banner upload */}
      <div
        style={{
          backgroundColor: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "var(--ds-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Army Banner
        </span>
        <input
          type="text"
          className="ds-input"
          value={bannerUrl}
          onChange={(e) => setBannerUrl(e.target.value)}
          placeholder="Paste image URL…"
          style={{ fontSize: 12, flex: 1, maxWidth: 360 }}
          data-ocid="army.banner.url.input"
        />
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={handleBannerUrlSave}
          disabled={bannerUploading || !bannerUrl.trim()}
          data-ocid="army.banner.save_button"
        >
          {bannerUploading ? "Saving…" : "Set Banner"}
        </button>
        <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>or</span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => bannerInputRef.current?.click()}
          disabled={bannerUploading}
          data-ocid="army.banner.upload_button"
        >
          Upload Image
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleBannerUpload}
        />
        {bannerError && (
          <span
            style={{ color: "#e74c3c", fontSize: 11, width: "100%" }}
            data-ocid="army.banner.error_state"
          >
            {bannerError}
          </span>
        )}
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
          <ArmyOverviewPanel
            army={draft}
            onChange={updateDraft}
            characters={characters.map((c) => ({
              id: c.id.toString(),
              name: c.name,
            }))}
          />
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
            factions={factions}
            onChange={(officers) => updateDraft({ officers })}
          />
        )}
        {subTab === "commanders" && (
          <ArmyCommandersPanel
            commanders={draft.commanders ?? []}
            ranks={draft.ranks ?? []}
            factions={factions}
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
              draft.commandStructure ?? {
                chainOfCommand: [],
                ordersLog: [],
              }
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
        {subTab === "battle_log" && (
          <ArmyBattleNotesPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "relationships" && (
          <ArmyRelationshipsPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "recruitment" && (
          <ArmyRecruitmentPanel
            actor={actor}
            armyId={armyId}
            branches={draft.branches ?? []}
            onBranchesUpdate={(branches) => updateDraft({ branches })}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "duels" && (
          <ArmyDuelsPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "supply_log" && (
          <ArmySupplyConsumptionPanel
            actor={actor}
            armyId={armyId}
            troopCount={draft.size}
            siegeMode={siegeMode}
            logistics={draft.logistics}
            onLogisticsUpdate={(logistics) => updateDraft({ logistics })}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "battle_outcomes" && (
          <ArmyBattleOutcomesPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "prisoners" && (
          <ArmyCapturedEnemiesPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "morale_history" && (
          <ArmyMoraleHistoryPanel
            actor={actor}
            armyId={armyId}
            baseMorale={draft.moraleRating}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "battle_timeline" && (
          <BattleTimelinePanel
            actor={actor}
            armyId={armyId}
            baseMorale={draft.moraleRating}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "interactions" && (
          <GainLossPanel
            actor={actor}
            armyId={armyId}
            army={draft}
            factions={factions}
            onArmyUpdate={updateDraft}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "enemies" && (
          <EnemyRosterPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "loot" && <ArmyLootPanel actor={actor} armyId={armyId} />}
        {subTab === "objectives" && (
          <BountyObjectivesPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "prisoner_exchange" && (
          <PrisonerExchangePanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "deployment" && (
          <DeploymentMapPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "diplomacy" && (
          <DiplomacyLogPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "battlesimulator" && (
          <BattleSimulatorPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "supplyroutes" && (
          <SupplyRoutesPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
          />
        )}
        {subTab === "officerskills" && (
          <OfficerSkillsPanel
            actor={actor}
            armyId={armyId}
            onRestartConnection={onRestartConnection}
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
}: {
  label: string;
  value: string;
  color?: string;
}) {
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

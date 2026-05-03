import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import { useDarkMode } from "../context/DarkModeContext";
import type { ThemePreset } from "../context/DarkModeContext";
import type {
  Abilities,
  CustomAbility,
  CustomClass,
  CustomFeat,
  CustomItem,
  CustomPhysicalAttack,
  CustomRace,
  CustomSkill,
  CustomSpell,
  CustomSpellSchool,
  CustomStat,
  DndBackend,
  RaceLinkedContent,
  Trait,
} from "../types";

interface Props {
  actor: DndBackend;
  onBack: () => void;
  onRestartConnection?: () => void;
}

type RaceWithId = { id: bigint } & CustomRace;
type ClassWithId = { id: bigint } & CustomClass;
type SpellWithId = { id: bigint } & CustomSpell;
type ItemWithId = { id: bigint } & CustomItem;
type AbilityWithId = { id: bigint } & CustomAbility;
type AttackWithId = { id: bigint } & CustomPhysicalAttack;
type SchoolWithId = { id: bigint } & CustomSpellSchool;

interface RaceFormState {
  name: string;
  description: string;
  speed: number;
  ab_str: number;
  ab_dex: number;
  ab_con: number;
  ab_int: number;
  ab_wis: number;
  ab_cha: number;
  traitsText: string;
  linkedSpellIds: bigint[];
  linkedAbilityIds: bigint[];
  linkedAttackIds: bigint[];
}

interface ClassFormState {
  name: string;
  hitDie: number;
  description: string;
  proficienciesText: string;
  featuresText: string;
}

const EMPTY_RACE: RaceFormState = {
  name: "",
  description: "",
  speed: 30,
  ab_str: 0,
  ab_dex: 0,
  ab_con: 0,
  ab_int: 0,
  ab_wis: 0,
  ab_cha: 0,
  traitsText: "",
  linkedSpellIds: [],
  linkedAbilityIds: [],
  linkedAttackIds: [],
};

const EMPTY_CLASS: ClassFormState = {
  name: "",
  hitDie: 8,
  description: "",
  proficienciesText: "",
  featuresText: "",
};

const EMPTY_SPELL = {
  name: "",
  level: 0,
  school: "Evocation",
  castingTime: "1 action",
  range: "",
  components: "",
  duration: "",
  damageEffect: "",
  description: "",
};

const EMPTY_ITEM = {
  name: "",
  description: "",
  weight: "",
  value: "",
  itemType: "Other",
  rarity: "Common",
};

const SPELL_SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
];

const ITEM_TYPES = [
  "Weapon",
  "Armor",
  "Potion",
  "Tool",
  "Wondrous Item",
  "Ring",
  "Rod",
  "Scroll",
  "Staff",
  "Wand",
  "Other",
];

const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
];

const ABILITY_TYPES = ["Passive", "Active", "Reaction"];
const RECHARGE_OPTIONS = ["", "Short Rest", "Long Rest", "Daily"];

const EMPTY_ABILITY = {
  name: "",
  description: "",
  abilityType: "Active",
  uses: 0,
  rechargeOn: "",
};

const EMPTY_ATTACK = {
  name: "",
  description: "",
  damageDice: "",
  attackBonus: 0,
  damageType: "Bludgeoning",
  range: "",
  properties: "",
};

const EMPTY_SCHOOL = { name: "" };

const EMPTY_CUSTOM_SKILL = { name: "", statBased: "STR", description: "" };
const EMPTY_CUSTOM_FEAT = { name: "", description: "", prerequisites: "" };
const EMPTY_CUSTOM_STAT = { name: "", description: "", defaultValue: "" };
const STAT_OPTIONS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

type Section =
  | "general"
  | "appearance"
  | "races"
  | "classes"
  | "spells"
  | "items"
  | "abilities"
  | "attacks"
  | "schools"
  | "skills"
  | "feats"
  | "stats"
  | "shortcuts"
  | "backup";

function abilitiesToForm(ab: Abilities) {
  return {
    ab_str: Number(ab.str),
    ab_dex: Number(ab.dex),
    ab_con: Number(ab.con),
    ab_int: Number(ab.int),
    ab_wis: Number(ab.wis),
    ab_cha: Number(ab.cha),
  };
}

function formToAbilities(f: RaceFormState): Abilities {
  return {
    str: BigInt(f.ab_str),
    dex: BigInt(f.ab_dex),
    con: BigInt(f.ab_con),
    int: BigInt(f.ab_int),
    wis: BigInt(f.ab_wis),
    cha: BigInt(f.ab_cha),
  };
}

function traitArrayToText(traits: Trait[]): string {
  return traits
    .map((t) => (t.description ? `${t.name}: ${t.description}` : t.name))
    .join("\n");
}

function textToTraitArray(text: string, source: string): Trait[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colonIdx = line.indexOf(":");
      if (colonIdx > -1) {
        return {
          name: line.slice(0, colonIdx).trim(),
          description: line.slice(colonIdx + 1).trim(),
          source,
          characterId: 0n,
        };
      }
      return { name: line, description: "", source, characterId: 0n };
    });
}

function formatAbilityBonuses(ab: Abilities): string {
  const parts: string[] = [];
  const map: [keyof Abilities, string][] = [
    ["str", "STR"],
    ["dex", "DEX"],
    ["con", "CON"],
    ["int", "INT"],
    ["wis", "WIS"],
    ["cha", "CHA"],
  ];
  for (const [key, label] of map) {
    const val = Number(ab[key]);
    if (val !== 0) parts.push(`${val > 0 ? "+" : ""}${val} ${label}`);
  }
  return parts.join(", ") || "None";
}

// ── Backup & Restore Section ──────────────────────────────────────────────────────────────

function BackupRestoreSection({
  actor,
}: { actor: import("../types").DndBackend }) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportBackup = async () => {
    setExporting(true);
    try {
      const [
        characters,
        spells,
        items,
        abilities,
        attacks,
        races,
        classes,
        schools,
        skills,
        feats,
        stats,
      ] = await Promise.allSettled([
        actor.getAllCharacters().catch(() => []),
        actor.getAllCustomSpells().catch(() => []),
        actor.getAllCustomItems().catch(() => []),
        actor.getAllCustomAbilities().catch(() => []),
        actor.getAllCustomPhysicalAttacks().catch(() => []),
        actor.getAllRaces().catch(() => []),
        actor.getAllClasses().catch(() => []),
        actor.getAllCustomSpellSchools().catch(() => []),
        actor.getAllCustomSkills().catch(() => []),
        actor.getAllCustomFeats().catch(() => []),
        actor.getAllCustomStats().catch(() => []),
      ]);

      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        characters: characters.status === "fulfilled" ? characters.value : [],
        customSpells: spells.status === "fulfilled" ? spells.value : [],
        customItems: items.status === "fulfilled" ? items.value : [],
        customAbilities:
          abilities.status === "fulfilled" ? abilities.value : [],
        customAttacks: attacks.status === "fulfilled" ? attacks.value : [],
        races: races.status === "fulfilled" ? races.value : [],
        classes: classes.status === "fulfilled" ? classes.value : [],
        spellSchools: schools.status === "fulfilled" ? schools.value : [],
        customSkills: skills.status === "fulfilled" ? skills.value : [],
        customFeats: feats.status === "fulfilled" ? feats.value : [],
        customStats: stats.status === "fulfilled" ? stats.value : [],
      };

      const blob = new Blob(
        [
          JSON.stringify(
            backup,
            (_, v) => (typeof v === "bigint" ? v.toString() : v),
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `dungeonscribe-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      alert(`Export failed: ${String(e)}`);
    }
    setExporting(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      setImporting(true);
      setImportResult(null);
      setImportError(null);
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.version) throw new Error("Invalid backup file format");
        let imported = 0;
        // Import custom content only (safe — does not overwrite)
        for (const [, spell] of data.customSpells ?? []) {
          try {
            await actor.addCustomSpell(spell);
            imported++;
          } catch {
            /* skip */
          }
        }
        for (const [, item] of data.customItems ?? []) {
          try {
            await actor.addCustomItem(item);
            imported++;
          } catch {
            /* skip */
          }
        }
        for (const [, ability] of data.customAbilities ?? []) {
          try {
            await actor.addCustomAbility(ability);
            imported++;
          } catch {
            /* skip */
          }
        }
        setImportResult(`Import complete: ${imported} items added.`);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Import failed");
      }
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <p style={{ color: "var(--ds-muted)", fontSize: 14, marginBottom: 20 }}>
        Export all your data as a JSON backup file. Import to safely add data
        from a previous backup (does not overwrite existing data).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ds-card" style={{ padding: 20 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 12 }}
          >
            EXPORT BACKUP
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--ds-muted)", marginBottom: 14 }}
          >
            Downloads a complete backup of all your characters, custom content,
            and settings as a JSON file.
          </p>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={exportBackup}
            disabled={exporting}
            style={{ fontFamily: "Cinzel, serif" }}
            data-ocid="settings.backup.export_button"
          >
            {exporting ? "Exporting…" : "📥 Export Backup"}
          </button>
        </div>
        <div className="ds-card" style={{ padding: 20 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 12 }}
          >
            IMPORT BACKUP
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--ds-muted)", marginBottom: 14 }}
          >
            Import a previously exported backup file. Custom content will be
            added as new entries without overwriting existing data.
          </p>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            data-ocid="settings.backup.import_button"
          >
            {importing ? "Importing…" : "📤 Import Backup"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: "none" }}
          />
          {importResult && (
            <p
              style={{ marginTop: 12, fontSize: 13, color: "#27ae60" }}
              data-ocid="settings.backup.success_state"
            >
              {importResult}
            </p>
          )}
          {importError && (
            <p
              style={{ marginTop: 12, fontSize: 13, color: "#e74c3c" }}
              data-ocid="settings.backup.error_state"
            >
              {importError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Appearance & Theme Section ──────────────────────────────────────────────

const PRESET_SWATCHES: { id: ThemePreset; label: string; color: string }[] = [
  { id: "dark", label: "Dark", color: "#1a1a2e" },
  { id: "light", label: "Light", color: "#f8f5f0" },
  { id: "midnight", label: "Midnight", color: "#0d0d1a" },
  { id: "forest", label: "Forest", color: "#0f1f12" },
];

const ACCENT_PRESETS = [
  { hex: "#c9a35a", label: "Gold" },
  { hex: "#4fc3f7", label: "Cyan" },
  { hex: "#9c59d9", label: "Purple" },
  { hex: "#e85252", label: "Red" },
  { hex: "#4caf50", label: "Green" },
];

function AppearanceSection({ actor }: { actor: DndBackend }) {
  const { accentColor, setAccentColor, themePreset, setThemePreset } =
    useDarkMode();
  const [localAccent, setLocalAccent] = useState(accentColor);
  const [localPreset, setLocalPreset] = useState<ThemePreset>(themePreset);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync live preview
  const applyPreset = (p: ThemePreset) => {
    setLocalPreset(p);
    setThemePreset(p);
  };

  const applyAccent = (hex: string) => {
    setLocalAccent(hex);
    setAccentColor(hex);
  };

  const saveTheme = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await actor.updateThemeSettings({
        accentColor: localAccent,
        themePreset: localPreset,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(`Failed to save theme: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
        Customize the look and feel of DungeonScribe. Changes apply instantly as
        a live preview.
      </p>

      {/* Theme presets */}
      <div className="ds-card" style={{ padding: 20 }}>
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 16 }}
        >
          THEME PRESET
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 10,
          }}
        >
          {PRESET_SWATCHES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              style={{
                padding: "12px 8px",
                borderRadius: 8,
                border: `2px solid ${localPreset === p.id ? "var(--ds-gold)" : "var(--ds-border)"}`,
                background: p.color,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
              data-ocid={`settings.theme.preset.${p.id}`}
            >
              <span
                style={{
                  fontSize: 11,
                  color: localPreset === p.id ? "var(--ds-gold)" : "#ccc",
                  fontWeight: localPreset === p.id ? 700 : 400,
                }}
              >
                {p.label}
              </span>
              {localPreset === p.id && (
                <span style={{ fontSize: 9, color: "var(--ds-gold)" }}>
                  ✔ Active
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div className="ds-card" style={{ padding: 20 }}>
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 16 }}
        >
          ACCENT COLOR
        </h3>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {ACCENT_PRESETS.map((a) => (
            <button
              key={a.hex}
              type="button"
              onClick={() => applyAccent(a.hex)}
              title={a.label}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: a.hex,
                border: `2px solid ${localAccent.toLowerCase() === a.hex.toLowerCase() ? "var(--ds-text)" : "transparent"}`,
                cursor: "pointer",
                flexShrink: 0,
              }}
              data-ocid={`settings.theme.accent.${a.label.toLowerCase()}`}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="color"
            value={localAccent}
            onChange={(e) => applyAccent(e.target.value)}
            style={{
              width: 44,
              height: 36,
              padding: 2,
              border: "1px solid var(--ds-border)",
              borderRadius: 4,
              background: "transparent",
              cursor: "pointer",
            }}
            data-ocid="settings.theme.accent_color.input"
          />
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: localAccent,
              border: "1px solid var(--ds-border)",
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: "var(--ds-muted)",
              fontFamily: "monospace",
            }}
          >
            {localAccent}
          </span>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={saveTheme}
          disabled={saving}
          data-ocid="settings.theme.save_button"
        >
          {saving ? "Saving…" : "Save Theme"}
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: "#27ae60" }}>✔ Theme saved!</span>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage({
  actor,
  onBack,
  onRestartConnection,
}: Props) {
  const { identity } = useInternetIdentity();
  const { setAccentColor, setThemePreset } = useDarkMode();
  const [maxLevel, setMaxLevel] = useState(20);
  const [savedMaxLevel, setSavedMaxLevel] = useState(20);
  const [savingLevel, setSavingLevel] = useState(false);
  const [races, setRaces] = useState<RaceWithId[]>([]);
  const [classes, setClasses] = useState<ClassWithId[]>([]);
  const [customSpells, setCustomSpells] = useState<SpellWithId[]>([]);
  const [customItems, setCustomItems] = useState<ItemWithId[]>([]);
  const [customAbilities, setCustomAbilities] = useState<AbilityWithId[]>([]);
  const [customAttacks, setCustomAttacks] = useState<AttackWithId[]>([]);
  const [customSchools, setCustomSchools] = useState<SchoolWithId[]>([]);
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([]);
  const [customFeats, setCustomFeats] = useState<CustomFeat[]>([]);
  const [customStats, setCustomStats] = useState<CustomStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [section, setSection] = useState<Section>("general");

  // Race form
  const [showRaceForm, setShowRaceForm] = useState(false);
  const [editingRace, setEditingRace] = useState<RaceWithId | null>(null);
  const [raceForm, setRaceForm] = useState<RaceFormState>({ ...EMPTY_RACE });
  const [savingRace, setSavingRace] = useState(false);
  const [raceLinkedContentMap, setRaceLinkedContentMap] = useState<
    Map<bigint, RaceLinkedContent>
  >(new Map());

  // Class form
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithId | null>(null);
  const [classForm, setClassForm] = useState<ClassFormState>({
    ...EMPTY_CLASS,
  });
  const [savingClass, setSavingClass] = useState(false);

  // Custom spell form
  const [showSpellForm, setShowSpellForm] = useState(false);
  const [editingSpell, setEditingSpell] = useState<SpellWithId | null>(null);
  const [spellForm, setSpellForm] = useState({ ...EMPTY_SPELL });
  const [savingSpell, setSavingSpell] = useState(false);
  const [loadingSrd, setLoadingSrd] = useState(false);
  const [srdLoadResult, setSrdLoadResult] = useState<string | null>(null);

  // Custom item form
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemWithId | null>(null);
  const [itemForm, setItemForm] = useState({ ...EMPTY_ITEM });
  const [savingItem, setSavingItem] = useState(false);

  // Custom ability form
  const [showAbilityForm, setShowAbilityForm] = useState(false);
  const [editingAbility, setEditingAbility] = useState<AbilityWithId | null>(
    null,
  );
  const [abilityForm, setAbilityForm] = useState({ ...EMPTY_ABILITY });
  const [savingAbility, setSavingAbility] = useState(false);

  // Custom attack form
  const [showAttackForm, setShowAttackForm] = useState(false);
  const [editingAttack, setEditingAttack] = useState<AttackWithId | null>(null);
  const [attackForm, setAttackForm] = useState({ ...EMPTY_ATTACK });
  const [savingAttack, setSavingAttack] = useState(false);

  // School form
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolWithId | null>(null);
  const [schoolForm, setSchoolForm] = useState({ ...EMPTY_SCHOOL });
  const [savingSchool, setSavingSchool] = useState(false);

  // Custom skill form
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CustomSkill | null>(null);
  const [skillForm, setSkillForm] = useState({ ...EMPTY_CUSTOM_SKILL });
  const [savingSkill, setSavingSkill] = useState(false);

  // Custom feat form
  const [showFeatForm, setShowFeatForm] = useState(false);
  const [editingFeat, setEditingFeat] = useState<CustomFeat | null>(null);
  const [featForm, setFeatForm] = useState({ ...EMPTY_CUSTOM_FEAT });
  const [savingFeat, setSavingFeat] = useState(false);

  // Custom stat form
  const [showStatForm, setShowStatForm] = useState(false);
  const [editingStat, setEditingStat] = useState<CustomStat | null>(null);
  const [statForm, setStatForm] = useState({ ...EMPTY_CUSTOM_STAT });
  const [savingStat, setSavingStat] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    actor
      .getThemeSettings()
      .then((result) => {
        const settings = Array.isArray(result) ? result[0] : undefined;
        if (settings) {
          setAccentColor(settings.accentColor);
          setThemePreset(settings.themePreset as ThemePreset);
        }
      })
      .catch(() => {});
  }, [actor, setAccentColor, setThemePreset]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [
        settings,
        raceData,
        classData,
        spellData,
        itemData,
        abilityData,
        attackData,
        schoolData,
        linkedContentData,
        skillData,
        featData,
        statData,
      ] = await Promise.all([
        actor.getSettings(),
        actor.getAllRaces() as unknown as Promise<[bigint, CustomRace][]>,
        actor.getAllClasses() as unknown as Promise<[bigint, CustomClass][]>,
        actor.getAllCustomSpells() as unknown as Promise<
          [bigint, CustomSpell][]
        >,
        actor.getAllCustomItems() as unknown as Promise<[bigint, CustomItem][]>,
        actor.getAllCustomAbilities() as unknown as Promise<
          [bigint, CustomAbility][]
        >,
        actor.getAllCustomPhysicalAttacks() as unknown as Promise<
          [bigint, CustomPhysicalAttack][]
        >,
        actor.getAllCustomSpellSchools() as unknown as Promise<
          [bigint, CustomSpellSchool][]
        >,
        actor.getAllRaceLinkedContent() as unknown as Promise<
          [bigint, RaceLinkedContent][]
        >,
        actor.getAllCustomSkills(),
        actor.getAllCustomFeats(),
        actor.getAllCustomStats(),
      ]);
      setMaxLevel(Number(settings.maxLevel));
      setSavedMaxLevel(Number(settings.maxLevel));
      setRaces(raceData.map(([id, r]) => ({ id, ...r })));
      setClasses(classData.map(([id, c]) => ({ id, ...c })));
      setCustomSpells(spellData.map(([id, s]) => ({ id, ...s })));
      setCustomItems(itemData.map(([id, i]) => ({ id, ...i })));
      setCustomAbilities(abilityData.map(([id, a]) => ({ id, ...a })));
      setCustomAttacks(attackData.map(([id, a]) => ({ id, ...a })));
      setCustomSchools(schoolData.map(([id, s]) => ({ id, ...s })));
      const linkedMap = new Map<bigint, RaceLinkedContent>();
      for (const [id, lc] of linkedContentData) linkedMap.set(id, lc);
      setRaceLinkedContentMap(linkedMap);
      setCustomSkills(skillData);
      setCustomFeats(featData);
      setCustomStats(statData);
    } catch (err) {
      if (isCanisterStopped(err)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      console.error("Failed to load settings data:", err);
      alert(`Failed to load settings: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const saveMaxLevel = async () => {
    setSavingLevel(true);
    try {
      await actor.updateSettings({ maxLevel: BigInt(maxLevel) });
      setSavedMaxLevel(maxLevel);
    } catch (err) {
      console.error("Failed to save max level:", err);
      alert(`Failed to save max level: ${String(err)}`);
    } finally {
      setSavingLevel(false);
    }
  };

  // Race CRUD
  const openNewRace = () => {
    setEditingRace(null);
    setRaceForm({ ...EMPTY_RACE });
    setShowRaceForm(true);
  };
  const openEditRace = (r: RaceWithId) => {
    setEditingRace(r);
    setRaceForm({
      name: r.name,
      description: r.description,
      speed: Number(r.speed),
      ...abilitiesToForm(r.abilityBonuses),
      traitsText: traitArrayToText(r.traits),
      linkedSpellIds: raceLinkedContentMap.get(r.id)?.linkedSpellIds ?? [],
      linkedAbilityIds: raceLinkedContentMap.get(r.id)?.linkedAbilityIds ?? [],
      linkedAttackIds: raceLinkedContentMap.get(r.id)?.linkedAttackIds ?? [],
    });
    setShowRaceForm(true);
  };
  const saveRace = async () => {
    setSavingRace(true);
    try {
      const race: CustomRace = {
        name: raceForm.name,
        description: raceForm.description,
        speed: BigInt(raceForm.speed),
        abilityBonuses: formToAbilities(raceForm),
        traits: textToTraitArray(raceForm.traitsText, raceForm.name),
      };
      const content: RaceLinkedContent = {
        linkedSpellIds: raceForm.linkedSpellIds,
        linkedAbilityIds: raceForm.linkedAbilityIds,
        linkedAttackIds: raceForm.linkedAttackIds,
      };
      let raceId: bigint;
      if (editingRace) {
        await actor.updateRace(editingRace.id, race);
        raceId = editingRace.id;
      } else {
        raceId = await actor.addRace(race);
      }
      await actor.updateRaceLinkedContent(raceId, content);
      setShowRaceForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save race: ${String(err)}`);
    } finally {
      setSavingRace(false);
    }
  };
  const deleteRace = async (id: bigint) => {
    if (!confirm("Delete this custom race?")) return;
    try {
      await actor.deleteRace(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete race: ${String(err)}`);
    }
  };

  // Class CRUD
  const openNewClass = () => {
    setEditingClass(null);
    setClassForm({ ...EMPTY_CLASS });
    setShowClassForm(true);
  };
  const openEditClass = (c: ClassWithId) => {
    setEditingClass(c);
    setClassForm({
      name: c.name,
      hitDie: Number(c.hitDie),
      description: c.description,
      proficienciesText: c.proficiencies.join("\n"),
      featuresText: traitArrayToText(c.features),
    });
    setShowClassForm(true);
  };
  const saveClass = async () => {
    setSavingClass(true);
    try {
      const proficiencies = classForm.proficienciesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const features = textToTraitArray(classForm.featuresText, classForm.name);
      const cls: CustomClass = {
        name: classForm.name,
        hitDie: BigInt(classForm.hitDie),
        description: classForm.description,
        proficiencies,
        features,
      };
      if (editingClass) await actor.updateClass(editingClass.id, cls);
      else await actor.addClass(cls);
      setShowClassForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save class: ${String(err)}`);
    } finally {
      setSavingClass(false);
    }
  };
  const deleteClass = async (id: bigint) => {
    if (!confirm("Delete this custom class?")) return;
    try {
      await actor.deleteClass(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete class: ${String(err)}`);
    }
  };

  // Custom Spell CRUD
  const openNewSpell = () => {
    setEditingSpell(null);
    setSpellForm({ ...EMPTY_SPELL });
    setShowSpellForm(true);
  };
  const openEditSpell = (s: SpellWithId) => {
    setEditingSpell(s);
    setSpellForm({
      name: s.name,
      level: Number(s.level),
      school: s.school,
      castingTime: s.castingTime,
      range: s.range,
      components: s.components,
      duration: s.duration,
      damageEffect: s.damageEffect,
      description: s.description,
    });
    setShowSpellForm(true);
  };
  const saveSpell = async () => {
    setSavingSpell(true);
    try {
      const spell: CustomSpell = {
        name: spellForm.name,
        level: BigInt(spellForm.level),
        school: spellForm.school,
        castingTime: spellForm.castingTime,
        range: spellForm.range,
        components: spellForm.components,
        duration: spellForm.duration,
        damageEffect: spellForm.damageEffect,
        description: spellForm.description,
        owner: identity!.getPrincipal(),
      };
      if (editingSpell) await actor.updateCustomSpell(editingSpell.id, spell);
      else await actor.addCustomSpell(spell);
      setShowSpellForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save spell: ${String(err)}`);
    } finally {
      setSavingSpell(false);
    }
  };
  const deleteSpell = async (id: bigint) => {
    if (!confirm("Delete this custom spell?")) return;
    try {
      await actor.deleteCustomSpell(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete spell: ${String(err)}`);
    }
  };

  // Custom Item CRUD
  const openNewItem = () => {
    setEditingItem(null);
    setItemForm({ ...EMPTY_ITEM });
    setShowItemForm(true);
  };
  const openEditItem = (item: ItemWithId) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      weight: item.weight,
      value: item.value,
      itemType: item.itemType,
      rarity: item.rarity,
    });
    setShowItemForm(true);
  };
  const saveItem = async () => {
    setSavingItem(true);
    try {
      const item: CustomItem = {
        name: itemForm.name,
        description: itemForm.description,
        weight: itemForm.weight,
        value: itemForm.value,
        itemType: itemForm.itemType,
        rarity: itemForm.rarity,
        owner: identity!.getPrincipal(),
      };
      if (editingItem) await actor.updateCustomItem(editingItem.id, item);
      else await actor.addCustomItem(item);
      setShowItemForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save item: ${String(err)}`);
    } finally {
      setSavingItem(false);
    }
  };
  const deleteItem = async (id: bigint) => {
    if (!confirm("Delete this custom item?")) return;
    try {
      await actor.deleteCustomItem(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete item: ${String(err)}`);
    }
  };

  // Custom Ability CRUD
  const openNewAbility = () => {
    setEditingAbility(null);
    setAbilityForm({ ...EMPTY_ABILITY });
    setShowAbilityForm(true);
  };
  const openEditAbility = (a: AbilityWithId) => {
    setEditingAbility(a);
    setAbilityForm({
      name: a.name,
      description: a.description,
      abilityType: a.abilityType,
      uses: Number(a.uses),
      rechargeOn: a.rechargeOn,
    });
    setShowAbilityForm(true);
  };
  const saveAbility = async () => {
    setSavingAbility(true);
    try {
      const ability: CustomAbility = {
        name: abilityForm.name,
        description: abilityForm.description,
        abilityType: abilityForm.abilityType,
        uses: BigInt(abilityForm.uses),
        rechargeOn: abilityForm.rechargeOn,
        owner: identity!.getPrincipal(),
      };
      if (editingAbility)
        await actor.updateCustomAbility(editingAbility.id, ability);
      else await actor.addCustomAbility(ability);
      setShowAbilityForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save ability: ${String(err)}`);
    } finally {
      setSavingAbility(false);
    }
  };
  const deleteAbility = async (id: bigint) => {
    if (!confirm("Delete this custom ability?")) return;
    try {
      await actor.deleteCustomAbility(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete ability: ${String(err)}`);
    }
  };

  // Custom Attack CRUD
  const openNewAttack = () => {
    setEditingAttack(null);
    setAttackForm({ ...EMPTY_ATTACK });
    setShowAttackForm(true);
  };
  const openEditAttack = (a: AttackWithId) => {
    setEditingAttack(a);
    setAttackForm({
      name: a.name,
      description: a.description,
      damageDice: a.damageDice,
      attackBonus: Number(a.attackBonus),
      damageType: a.damageType,
      range: a.range,
      properties: a.properties,
    });
    setShowAttackForm(true);
  };
  const saveAttack = async () => {
    setSavingAttack(true);
    try {
      const attack: CustomPhysicalAttack = {
        name: attackForm.name,
        description: attackForm.description,
        damageDice: attackForm.damageDice,
        attackBonus: BigInt(attackForm.attackBonus),
        damageType: attackForm.damageType,
        range: attackForm.range,
        properties: attackForm.properties,
        owner: identity!.getPrincipal(),
      };
      if (editingAttack)
        await actor.updateCustomPhysicalAttack(editingAttack.id, attack);
      else await actor.addCustomPhysicalAttack(attack);
      setShowAttackForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save attack: ${String(err)}`);
    } finally {
      setSavingAttack(false);
    }
  };
  const deleteAttack = async (id: bigint) => {
    if (!confirm("Delete this custom attack?")) return;
    try {
      await actor.deleteCustomPhysicalAttack(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete attack: ${String(err)}`);
    }
  };

  // Custom School CRUD
  const openNewSchool = () => {
    setEditingSchool(null);
    setSchoolForm({ ...EMPTY_SCHOOL });
    setShowSchoolForm(true);
  };
  const openEditSchool = (s: SchoolWithId) => {
    setEditingSchool(s);
    setSchoolForm({ name: s.name });
    setShowSchoolForm(true);
  };
  const saveSchool = async () => {
    setSavingSchool(true);
    try {
      const school: CustomSpellSchool = {
        name: schoolForm.name,
        owner: identity!.getPrincipal(),
      };
      if (editingSchool)
        await actor.updateCustomSpellSchool(editingSchool.id, school);
      else await actor.addCustomSpellSchool(school);
      setShowSchoolForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save school: ${String(err)}`);
    } finally {
      setSavingSchool(false);
    }
  };
  const deleteSchool = async (id: bigint) => {
    if (!confirm("Delete this custom school?")) return;
    try {
      await actor.deleteCustomSpellSchool(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete school: ${String(err)}`);
    }
  };

  // Custom Skill CRUD
  const openNewSkill = () => {
    setEditingSkill(null);
    setSkillForm({ ...EMPTY_CUSTOM_SKILL });
    setShowSkillForm(true);
  };
  const openEditSkill = (s: CustomSkill) => {
    setEditingSkill(s);
    setSkillForm({
      name: s.name,
      statBased: s.statBased,
      description: s.description,
    });
    setShowSkillForm(true);
  };
  const saveSkill = async () => {
    setSavingSkill(true);
    try {
      if (editingSkill) {
        await actor.updateCustomSkill(
          editingSkill.id,
          skillForm.name,
          skillForm.statBased,
          skillForm.description,
        );
      } else {
        await actor.addCustomSkill(
          skillForm.name,
          skillForm.statBased,
          skillForm.description,
        );
      }
      setShowSkillForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save skill: ${String(err)}`);
    } finally {
      setSavingSkill(false);
    }
  };
  const deleteSkill = async (id: bigint) => {
    if (!confirm("Delete this custom skill?")) return;
    try {
      await actor.deleteCustomSkill(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete skill: ${String(err)}`);
    }
  };

  // Custom Feat CRUD
  const openNewFeat = () => {
    setEditingFeat(null);
    setFeatForm({ ...EMPTY_CUSTOM_FEAT });
    setShowFeatForm(true);
  };
  const openEditFeat = (f: CustomFeat) => {
    setEditingFeat(f);
    setFeatForm({
      name: f.name,
      description: f.description,
      prerequisites: f.prerequisites,
    });
    setShowFeatForm(true);
  };
  const saveFeat = async () => {
    setSavingFeat(true);
    try {
      if (editingFeat) {
        await actor.updateCustomFeat(
          editingFeat.id,
          featForm.name,
          featForm.description,
          featForm.prerequisites,
        );
      } else {
        await actor.addCustomFeat(
          featForm.name,
          featForm.description,
          featForm.prerequisites,
        );
      }
      setShowFeatForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save feat: ${String(err)}`);
    } finally {
      setSavingFeat(false);
    }
  };
  const deleteFeat = async (id: bigint) => {
    if (!confirm("Delete this custom feat?")) return;
    try {
      await actor.deleteCustomFeat(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete feat: ${String(err)}`);
    }
  };

  // Custom Stat CRUD
  const openNewStat = () => {
    setEditingStat(null);
    setStatForm({ ...EMPTY_CUSTOM_STAT });
    setShowStatForm(true);
  };
  const openEditStat = (s: CustomStat) => {
    setEditingStat(s);
    setStatForm({
      name: s.name,
      description: s.description,
      defaultValue: s.defaultValue,
    });
    setShowStatForm(true);
  };
  const saveStat = async () => {
    setSavingStat(true);
    try {
      if (editingStat) {
        await actor.updateCustomStat(
          editingStat.id,
          statForm.name,
          statForm.description,
          statForm.defaultValue,
        );
      } else {
        await actor.addCustomStat(
          statForm.name,
          statForm.description,
          statForm.defaultValue,
        );
      }
      setShowStatForm(false);
      await load();
    } catch (err) {
      alert(`Failed to save stat: ${String(err)}`);
    } finally {
      setSavingStat(false);
    }
  };
  const deleteStat = async (id: bigint) => {
    if (!confirm("Delete this custom stat?")) return;
    try {
      await actor.deleteCustomStat(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete stat: ${String(err)}`);
    }
  };

  const tabs: { id: Section; label: string }[] = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Appearance" },
    { id: "races", label: `Custom Races (${races.length})` },
    { id: "classes", label: `Custom Classes (${classes.length})` },
    { id: "spells", label: `Custom Spells (${customSpells.length})` },
    { id: "items", label: `Custom Items (${customItems.length})` },
    { id: "abilities", label: `Custom Abilities (${customAbilities.length})` },
    { id: "attacks", label: `Custom Attacks (${customAttacks.length})` },
    { id: "schools", label: `Custom Schools (${customSchools.length})` },
    { id: "skills", label: `Custom Skills (${customSkills.length})` },
    { id: "feats", label: `Custom Feats (${customFeats.length})` },
    { id: "stats", label: `Custom Stats (${customStats.length})` },
    { id: "shortcuts", label: "Keyboard Shortcuts" },
    { id: "backup", label: "Backup & Restore" },
  ];

  const tabStyle = (id: Section) => ({
    background: "transparent",
    border: "none",
    borderBottom:
      section === id ? "2px solid var(--ds-gold)" : "2px solid transparent",
    color: section === id ? "var(--ds-gold)" : "var(--ds-muted)",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "Cinzel, serif",
    marginBottom: -1,
    whiteSpace: "nowrap" as const,
  });

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          className="ds-btn-ghost"
          onClick={onBack}
          style={{ fontSize: 13, marginBottom: 8 }}
        >
          ← Back
        </button>
        <h1
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 28 }}
        >
          Settings
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--ds-border)",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setSection(t.id)}
            style={tabStyle(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--ds-muted)" }}>Loading settings...</p>
      ) : (
        <>
          {/* General */}
          {section === "general" && (
            <div className="ds-card" style={{ padding: 24, maxWidth: 400 }}>
              <h3
                className="font-cinzel"
                style={{
                  color: "var(--ds-gold)",
                  fontSize: 16,
                  marginBottom: 16,
                }}
              >
                LEVEL SETTINGS
              </h3>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                <span className="ds-label">Maximum Character Level</span>
                <input
                  className="ds-input"
                  type="number"
                  min={1}
                  max={10000}
                  value={maxLevel}
                  onChange={(e) =>
                    setMaxLevel(
                      Math.min(
                        10000,
                        Math.max(1, Number.parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  style={{ width: 100 }}
                  data-ocid="settings.input"
                />
              </label>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveMaxLevel}
                disabled={savingLevel || maxLevel === savedMaxLevel}
                style={{ fontFamily: "Cinzel, serif" }}
                data-ocid="settings.save_button"
              >
                {savingLevel ? "Saving..." : "Save"}
              </button>
              <p
                style={{ color: "var(--ds-muted)", fontSize: 13, marginTop: 8 }}
              >
                Current: {savedMaxLevel}. Range: 1–10,000.
              </p>
            </div>
          )}

          {/* Appearance & Theme */}
          {section === "appearance" && <AppearanceSection actor={actor} />}

          {/* Custom Races */}
          {section === "races" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Custom races appear in the character creation form.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewRace}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="races.primary_button"
                >
                  + Add Race
                </button>
              </div>
              {races.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="races.empty_state"
                >
                  No custom races. Add your homebrew races here!
                </p>
              ) : (
                races.map((r, i) => (
                  <div
                    key={r.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`races.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "var(--ds-text)",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {r.name}
                        </div>
                        <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                          Speed: {r.speed.toString()} ft
                        </div>
                        <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                          Bonuses: {formatAbilityBonuses(r.abilityBonuses)}
                        </div>
                        {r.traits.length > 0 && (
                          <div
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            Traits: {r.traits.map((t) => t.name).join(", ")}
                          </div>
                        )}
                        {r.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 6,
                            }}
                          >
                            {r.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditRace(r)}
                          data-ocid={`races.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRace(r.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`races.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Classes */}
          {section === "classes" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Custom classes appear in the character creation form.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewClass}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="classes.primary_button"
                >
                  + Add Class
                </button>
              </div>
              {classes.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="classes.empty_state"
                >
                  No custom classes. Add your homebrew classes here!
                </p>
              ) : (
                classes.map((c, i) => (
                  <div
                    key={c.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`classes.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "var(--ds-text)",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {c.name}
                        </div>
                        <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                          Hit Die: d{c.hitDie.toString()}
                        </div>
                        {c.proficiencies.length > 0 && (
                          <div
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            Proficiencies: {c.proficiencies.join(", ")}
                          </div>
                        )}
                        {c.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 6,
                            }}
                          >
                            {c.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditClass(c)}
                          data-ocid={`classes.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteClass(c.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`classes.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Spells Library */}
          {section === "spells" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div>
                  <p
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    Your homebrew spell library. Use "Load D&D 5e Standard
                    Spells" to copy all official SRD spells into your library.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 12, padding: "6px 14px" }}
                      disabled={loadingSrd}
                      data-ocid="spells.load_srd_button"
                      onClick={async () => {
                        setSrdLoadResult(null);
                        if (
                          !confirm(
                            "This will add all D&D 5e SRD spells to your custom spell library. Existing spells will not be changed. Continue?",
                          )
                        )
                          return;
                        setLoadingSrd(true);
                        try {
                          const count = await actor.initializeSrdSpells();
                          await load();
                          setSrdLoadResult(
                            `✓ Loaded ${count} D&D 5e SRD spells into your library.`,
                          );
                        } catch (_e) {
                          setSrdLoadResult(
                            "✗ Failed to load SRD spells. Please try again.",
                          );
                        }
                        setLoadingSrd(false);
                      }}
                    >
                      {loadingSrd
                        ? "Loading SRD Spells..."
                        : "📖 Load D&D 5e Standard Spells"}
                    </button>
                    <button
                      type="button"
                      className="ds-btn-primary"
                      onClick={openNewSpell}
                      style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                      data-ocid="spells.primary_button"
                    >
                      + Add Spell
                    </button>
                  </div>
                  {srdLoadResult && (
                    <p
                      style={{
                        fontSize: 12,
                        marginTop: 8,
                        color: srdLoadResult.startsWith("✓")
                          ? "#27ae60"
                          : "#e74c3c",
                      }}
                      data-ocid="spells.srd.success_state"
                    >
                      {srdLoadResult}
                    </p>
                  )}
                </div>
              </div>
              {customSpells.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="spells.empty_state"
                >
                  No custom spells yet. Create your homebrew spells here!
                </p>
              ) : (
                customSpells.map((s, i) => (
                  <div
                    key={s.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`spells.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {s.name}
                          </span>
                          <span
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 11,
                              backgroundColor: "rgba(201,163,90,0.1)",
                              padding: "2px 6px",
                              borderRadius: 10,
                            }}
                          >
                            {s.school}
                          </span>
                          <span
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            {Number(s.level) === 0
                              ? "Cantrip"
                              : `Level ${s.level}`}
                          </span>
                        </div>
                        {s.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            {s.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditSpell(s)}
                          data-ocid={`spells.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSpell(s.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`spells.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Items Library */}
          {section === "items" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Your homebrew item library.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewItem}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="items.primary_button"
                >
                  + Add Item
                </button>
              </div>
              {customItems.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="items.empty_state"
                >
                  No custom items yet. Create your homebrew items here!
                </p>
              ) : (
                customItems.map((item, i) => (
                  <div
                    key={item.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`items.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {item.name}
                          </span>
                          <span
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 11,
                              backgroundColor: "rgba(201,163,90,0.1)",
                              padding: "2px 6px",
                              borderRadius: 10,
                            }}
                          >
                            {item.itemType}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 10,
                              color:
                                item.rarity === "Legendary" ||
                                item.rarity === "Artifact"
                                  ? "#ff9900"
                                  : item.rarity === "Very Rare"
                                    ? "#c040fb"
                                    : item.rarity === "Rare"
                                      ? "#4488ff"
                                      : item.rarity === "Uncommon"
                                        ? "#44cc44"
                                        : "var(--ds-muted)",
                              backgroundColor: "rgba(255,255,255,0.05)",
                            }}
                          >
                            {item.rarity}
                          </span>
                        </div>
                        {item.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditItem(item)}
                          data-ocid={`items.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`items.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Abilities */}
          {section === "abilities" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Your homebrew ability library.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewAbility}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="abilities.primary_button"
                >
                  + Add Ability
                </button>
              </div>
              {customAbilities.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="abilities.empty_state"
                >
                  No custom abilities yet. Create your homebrew abilities here!
                </p>
              ) : (
                customAbilities.map((ability, i) => (
                  <div
                    key={ability.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`abilities.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {ability.name}
                          </span>
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 10,
                              backgroundColor:
                                ability.abilityType === "Active"
                                  ? "#c97d3a"
                                  : ability.abilityType === "Reaction"
                                    ? "#7c5cbf"
                                    : "#4a9eca",
                              padding: "2px 7px",
                              borderRadius: 10,
                              textTransform: "uppercase",
                              fontWeight: 700,
                            }}
                          >
                            {ability.abilityType}
                          </span>
                          {ability.uses > 0n && (
                            <span
                              style={{
                                color: "var(--ds-gold)",
                                fontSize: 11,
                                backgroundColor: "rgba(201,163,90,0.1)",
                                padding: "2px 6px",
                                borderRadius: 10,
                              }}
                            >
                              {ability.uses.toString()} uses
                            </span>
                          )}
                        </div>
                        {ability.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 13,
                              margin: 0,
                              lineHeight: 1.4,
                            }}
                          >
                            {ability.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12 }}
                          onClick={() => openEditAbility(ability)}
                          data-ocid={`abilities.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, color: "#c0392b" }}
                          onClick={() => deleteAbility(ability.id)}
                          data-ocid={`abilities.delete_button.${i + 1}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Attacks */}
          {section === "attacks" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Your homebrew physical attack library.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewAttack}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="attacks.primary_button"
                >
                  + Add Attack
                </button>
              </div>
              {customAttacks.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="attacks.empty_state"
                >
                  No custom physical attacks yet. Create your homebrew attacks
                  here!
                </p>
              ) : (
                customAttacks.map((attack, i) => (
                  <div
                    key={attack.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`attacks.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {attack.name}
                          </span>
                          {attack.damageDice && (
                            <span
                              style={{
                                color: "var(--ds-gold)",
                                fontSize: 11,
                                backgroundColor: "rgba(201,163,90,0.1)",
                                padding: "2px 6px",
                                borderRadius: 10,
                              }}
                            >
                              {attack.damageDice} {attack.damageType}
                            </span>
                          )}
                          <span
                            style={{
                              color:
                                Number(attack.attackBonus) >= 0
                                  ? "#4CAF50"
                                  : "#e57373",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {Number(attack.attackBonus) >= 0 ? "+" : ""}
                            {Number(attack.attackBonus)} to hit
                          </span>
                        </div>
                        {attack.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 13,
                              margin: 0,
                              lineHeight: 1.4,
                            }}
                          >
                            {attack.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12 }}
                          onClick={() => openEditAttack(attack)}
                          data-ocid={`attacks.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, color: "#c0392b" }}
                          onClick={() => deleteAttack(attack.id)}
                          data-ocid={`attacks.delete_button.${i + 1}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Schools */}
          {section === "schools" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Define custom spell schools. These appear alongside standard
                  schools when creating spells.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewSchool}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="schools.primary_button"
                >
                  + Add School
                </button>
              </div>
              {customSchools.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="schools.empty_state"
                >
                  No custom schools yet. Create your homebrew spell schools
                  here!
                </p>
              ) : (
                customSchools.map((school, i) => (
                  <div
                    key={school.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`schools.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{ color: "var(--ds-text)", fontWeight: 600 }}
                      >
                        {school.name}
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12 }}
                          onClick={() => openEditSchool(school)}
                          data-ocid={`schools.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, color: "#c0392b" }}
                          onClick={() => deleteSchool(school.id)}
                          data-ocid={`schools.delete_button.${i + 1}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Skills */}
          {section === "skills" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Create homebrew skills. Add them to characters from the Skills
                  tab on the character sheet.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewSkill}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="skills.primary_button"
                >
                  + Add Skill
                </button>
              </div>
              {customSkills.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="skills.empty_state"
                >
                  No custom skills yet. Create homebrew skills to add to your
                  characters!
                </p>
              ) : (
                customSkills.map((skill, i) => (
                  <div
                    key={skill.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`skills.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {skill.name}
                          </span>
                          <span
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 11,
                              backgroundColor: "rgba(201,163,90,0.1)",
                              padding: "2px 6px",
                              borderRadius: 10,
                              fontWeight: 700,
                            }}
                          >
                            {skill.statBased}
                          </span>
                        </div>
                        {skill.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 13,
                              margin: 0,
                              lineHeight: 1.4,
                            }}
                          >
                            {skill.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12 }}
                          onClick={() => openEditSkill(skill)}
                          data-ocid={`skills.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, color: "#c0392b" }}
                          onClick={() => deleteSkill(skill.id)}
                          data-ocid={`skills.delete_button.${i + 1}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Feats */}
          {section === "feats" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Create homebrew feats. Characters can reference these from the
                  Feats tab.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewFeat}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="feats.primary_button"
                >
                  + Add Feat
                </button>
              </div>
              {customFeats.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="feats.empty_state"
                >
                  No custom feats yet. Create homebrew feats for your campaign!
                </p>
              ) : (
                customFeats.map((feat, i) => (
                  <div
                    key={feat.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`feats.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "var(--ds-text)",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {feat.name}
                        </div>
                        {feat.prerequisites && (
                          <div
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 12,
                              marginBottom: 4,
                            }}
                          >
                            Prerequisite: {feat.prerequisites}
                          </div>
                        )}
                        {feat.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 13,
                              margin: 0,
                              lineHeight: 1.4,
                            }}
                          >
                            {feat.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12 }}
                          onClick={() => openEditFeat(feat)}
                          data-ocid={`feats.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, color: "#c0392b" }}
                          onClick={() => deleteFeat(feat.id)}
                          data-ocid={`feats.delete_button.${i + 1}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Stats */}
          {section === "stats" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Create custom stat fields. Add them to characters from the
                  Custom Stats tab.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewStat}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="stats.primary_button"
                >
                  + Add Stat
                </button>
              </div>
              {customStats.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="stats.empty_state"
                >
                  No custom stats yet. Add custom stats for your campaign!
                </p>
              ) : (
                customStats.map((stat, i) => (
                  <div
                    key={stat.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`stats.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "var(--ds-text)",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {stat.name}
                        </div>
                        {stat.defaultValue && (
                          <div
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 12,
                              marginBottom: 4,
                            }}
                          >
                            Default: {stat.defaultValue}
                          </div>
                        )}
                        {stat.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 13,
                              margin: 0,
                              lineHeight: 1.4,
                            }}
                          >
                            {stat.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12 }}
                          onClick={() => openEditStat(stat)}
                          data-ocid={`stats.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, color: "#c0392b" }}
                          onClick={() => deleteStat(stat.id)}
                          data-ocid={`stats.delete_button.${i + 1}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Keyboard Shortcuts */}
          {section === "shortcuts" && (
            <div>
              <p
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                Keyboard shortcuts for quick navigation. Shortcuts are disabled
                when an input field is focused.
              </p>
              <div
                className="ds-card"
                style={{ padding: 16, marginBottom: 16 }}
              >
                <h3
                  className="font-cinzel"
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 14,
                    marginBottom: 14,
                  }}
                >
                  CHARACTER SHEET TABS
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    ["Alt + 1", "Stats tab"],
                    ["Alt + 2", "Spells tab"],
                    ["Alt + 3", "Inventory tab"],
                    ["Alt + 4", "Abilities tab"],
                    ["Alt + 5", "Attacks tab"],
                  ].map(([key, desc]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: "1px solid var(--ds-border)",
                      }}
                    >
                      <code
                        style={{
                          background: "var(--ds-surface2)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          color: "var(--ds-gold)",
                        }}
                      >
                        {key}
                      </code>
                      <span style={{ fontSize: 13, color: "var(--ds-text)" }}>
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ds-card" style={{ padding: 16 }}>
                <h3
                  className="font-cinzel"
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 14,
                    marginBottom: 14,
                  }}
                >
                  NAVIGATION
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    ["Alt + N", "New character (on character list)"],
                    ["Alt + S", "Open Settings"],
                    ["Escape", "Close modals and dialogs"],
                  ].map(([key, desc]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: "1px solid var(--ds-border)",
                      }}
                    >
                      <code
                        style={{
                          background: "var(--ds-surface2)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          color: "var(--ds-gold)",
                        }}
                      >
                        {key}
                      </code>
                      <span style={{ fontSize: 13, color: "var(--ds-text)" }}>
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Backup & Restore */}
          {section === "backup" && <BackupRestoreSection actor={actor} />}
        </>
      )}

      {/* Race Form Modal */}
      {showRaceForm && (
        <Modal
          onClose={() => setShowRaceForm(false)}
          title={editingRace ? "Edit Race" : "New Custom Race"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Race Name *">
              <input
                className="ds-input"
                value={raceForm.name}
                onChange={(e) =>
                  setRaceForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Speed (ft)">
              <input
                className="ds-input"
                type="number"
                min={0}
                value={raceForm.speed}
                onChange={(e) =>
                  setRaceForm((p) => ({
                    ...p,
                    speed: Number.parseInt(e.target.value) || 30,
                  }))
                }
              />
            </Field>
            <div>
              <span
                className="ds-label"
                style={{ display: "block", marginBottom: 6 }}
              >
                Ability Bonuses
              </span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}
              >
                {(
                  [
                    "ab_str",
                    "ab_dex",
                    "ab_con",
                    "ab_int",
                    "ab_wis",
                    "ab_cha",
                  ] as const
                ).map((key) => (
                  <label
                    key={key}
                    style={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <span
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                      }}
                    >
                      {key.replace("ab_", "")}
                    </span>
                    <input
                      className="ds-input"
                      type="number"
                      value={raceForm[key]}
                      onChange={(e) =>
                        setRaceForm((p) => ({
                          ...p,
                          [key]: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
            <Field label="Racial Traits (one per line, optionally: Name: Description)">
              <textarea
                className="ds-input"
                value={raceForm.traitsText}
                onChange={(e) =>
                  setRaceForm((p) => ({ ...p, traitsText: e.target.value }))
                }
                rows={3}
                placeholder="Darkvision: Can see in dim light up to 60 ft.\nFey Ancestry"
                style={{ resize: "vertical" }}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="ds-input"
                value={raceForm.description}
                onChange={(e) =>
                  setRaceForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                style={{ resize: "vertical" }}
              />
            </Field>
          </div>
          {customSpells.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span
                className="ds-label"
                style={{ display: "block", marginBottom: 6 }}
              >
                Linked Spells (auto-added on race selection)
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 120,
                  overflowY: "auto",
                  border: "1px solid var(--ds-border)",
                  borderRadius: 4,
                  padding: 8,
                }}
              >
                {customSpells.map((s) => (
                  <label
                    key={s.id.toString()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={raceForm.linkedSpellIds.some(
                        (id) => id === s.id,
                      )}
                      onChange={(e) =>
                        setRaceForm((p) => ({
                          ...p,
                          linkedSpellIds: e.target.checked
                            ? [...p.linkedSpellIds, s.id]
                            : p.linkedSpellIds.filter((id) => id !== s.id),
                        }))
                      }
                    />
                    <span style={{ color: "var(--ds-text)", fontSize: 13 }}>
                      {s.name}
                    </span>
                    <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                      {s.school} Lv{Number(s.level)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {customAbilities.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span
                className="ds-label"
                style={{ display: "block", marginBottom: 6 }}
              >
                Linked Abilities
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 120,
                  overflowY: "auto",
                  border: "1px solid var(--ds-border)",
                  borderRadius: 4,
                  padding: 8,
                }}
              >
                {customAbilities.map((a) => (
                  <label
                    key={a.id.toString()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={raceForm.linkedAbilityIds.some(
                        (id) => id === a.id,
                      )}
                      onChange={(e) =>
                        setRaceForm((p) => ({
                          ...p,
                          linkedAbilityIds: e.target.checked
                            ? [...p.linkedAbilityIds, a.id]
                            : p.linkedAbilityIds.filter((id) => id !== a.id),
                        }))
                      }
                    />
                    <span style={{ color: "var(--ds-text)", fontSize: 13 }}>
                      {a.name}
                    </span>
                    <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                      {a.abilityType}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {customAttacks.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span
                className="ds-label"
                style={{ display: "block", marginBottom: 6 }}
              >
                Linked Attacks
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 120,
                  overflowY: "auto",
                  border: "1px solid var(--ds-border)",
                  borderRadius: 4,
                  padding: 8,
                }}
              >
                {customAttacks.map((a) => (
                  <label
                    key={a.id.toString()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={raceForm.linkedAttackIds.some(
                        (id) => id === a.id,
                      )}
                      onChange={(e) =>
                        setRaceForm((p) => ({
                          ...p,
                          linkedAttackIds: e.target.checked
                            ? [...p.linkedAttackIds, a.id]
                            : p.linkedAttackIds.filter((id) => id !== a.id),
                        }))
                      }
                    />
                    <span style={{ color: "var(--ds-text)", fontSize: 13 }}>
                      {a.name}
                    </span>
                    <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                      {a.damageDice} {a.damageType}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <ModalFooter
            onClose={() => setShowRaceForm(false)}
            onSave={saveRace}
            saving={savingRace}
            disabled={!raceForm.name.trim()}
            label={editingRace ? "Save Changes" : "Add Race"}
          />
        </Modal>
      )}

      {/* Class Form Modal */}
      {showClassForm && (
        <Modal
          onClose={() => setShowClassForm(false)}
          title={editingClass ? "Edit Class" : "New Custom Class"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Class Name *">
              <input
                className="ds-input"
                value={classForm.name}
                onChange={(e) =>
                  setClassForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Hit Die (e.g. 8 for d8)">
              <input
                className="ds-input"
                type="number"
                min={4}
                max={20}
                value={classForm.hitDie}
                onChange={(e) =>
                  setClassForm((p) => ({
                    ...p,
                    hitDie: Number.parseInt(e.target.value) || 8,
                  }))
                }
              />
            </Field>
            <Field label="Proficiencies (one per line)">
              <textarea
                className="ds-input"
                value={classForm.proficienciesText}
                onChange={(e) =>
                  setClassForm((p) => ({
                    ...p,
                    proficienciesText: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Light Armor\nSimple Weapons"
                style={{ resize: "vertical" }}
              />
            </Field>
            <Field label="Class Features (one per line, optionally: Name: Description)">
              <textarea
                className="ds-input"
                value={classForm.featuresText}
                onChange={(e) =>
                  setClassForm((p) => ({ ...p, featuresText: e.target.value }))
                }
                rows={4}
                placeholder="Sneak Attack: Extra damage when you have advantage\nCunning Action"
                style={{ resize: "vertical" }}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="ds-input"
                value={classForm.description}
                onChange={(e) =>
                  setClassForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                style={{ resize: "vertical" }}
              />
            </Field>
          </div>
          <ModalFooter
            onClose={() => setShowClassForm(false)}
            onSave={saveClass}
            saving={savingClass}
            disabled={!classForm.name.trim()}
            label={editingClass ? "Save Changes" : "Add Class"}
          />
        </Modal>
      )}

      {/* Custom Spell Form Modal */}
      {showSpellForm && (
        <Modal
          onClose={() => setShowSpellForm(false)}
          title={editingSpell ? "Edit Custom Spell" : "New Custom Spell"}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Spell Name *">
                <input
                  className="ds-input"
                  value={spellForm.name}
                  onChange={(e) =>
                    setSpellForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Arcane Bolt"
                />
              </Field>
            </div>
            <Field label="Level (0 = Cantrip)">
              <input
                className="ds-input"
                type="number"
                min={0}
                max={9}
                value={spellForm.level}
                onChange={(e) =>
                  setSpellForm((p) => ({
                    ...p,
                    level: Number.parseInt(e.target.value) || 0,
                  }))
                }
              />
            </Field>
            <Field label="School">
              <select
                className="ds-input"
                value={spellForm.school}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, school: e.target.value }))
                }
              >
                {[...SPELL_SCHOOLS, ...customSchools.map((cs) => cs.name)].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Casting Time">
              <input
                className="ds-input"
                value={spellForm.castingTime}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, castingTime: e.target.value }))
                }
              />
            </Field>
            <Field label="Range">
              <input
                className="ds-input"
                value={spellForm.range}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, range: e.target.value }))
                }
              />
            </Field>
            <Field label="Components">
              <input
                className="ds-input"
                value={spellForm.components}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, components: e.target.value }))
                }
              />
            </Field>
            <Field label="Duration">
              <input
                className="ds-input"
                value={spellForm.duration}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, duration: e.target.value }))
                }
              />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Damage / Effect">
                <input
                  className="ds-input"
                  value={spellForm.damageEffect}
                  onChange={(e) =>
                    setSpellForm((p) => ({
                      ...p,
                      damageEffect: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description">
                <textarea
                  className="ds-input"
                  value={spellForm.description}
                  onChange={(e) =>
                    setSpellForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </Field>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowSpellForm(false)}
            onSave={saveSpell}
            saving={savingSpell}
            disabled={!spellForm.name.trim()}
            label={editingSpell ? "Save Changes" : "Add Spell"}
          />
        </Modal>
      )}

      {/* Custom Item Form Modal */}
      {showItemForm && (
        <Modal
          onClose={() => setShowItemForm(false)}
          title={editingItem ? "Edit Custom Item" : "New Custom Item"}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Item Name *">
                <input
                  className="ds-input"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Vorpal Sword"
                />
              </Field>
            </div>
            <Field label="Item Type">
              <select
                className="ds-input"
                value={itemForm.itemType}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, itemType: e.target.value }))
                }
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rarity">
              <select
                className="ds-input"
                value={itemForm.rarity}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, rarity: e.target.value }))
                }
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Weight">
              <input
                className="ds-input"
                value={itemForm.weight}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, weight: e.target.value }))
                }
                placeholder="e.g. 3 lbs"
              />
            </Field>
            <Field label="Value">
              <input
                className="ds-input"
                value={itemForm.value}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, value: e.target.value }))
                }
                placeholder="e.g. 1500 gp"
              />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description">
                <textarea
                  className="ds-input"
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </Field>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowItemForm(false)}
            onSave={saveItem}
            saving={savingItem}
            disabled={!itemForm.name.trim()}
            label={editingItem ? "Save Changes" : "Add Item"}
          />
        </Modal>
      )}

      {/* Custom Ability Form Modal */}
      {showAbilityForm && (
        <Modal
          onClose={() => setShowAbilityForm(false)}
          title={editingAbility ? "Edit Custom Ability" : "New Custom Ability"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Ability Name *">
              <input
                className="ds-input"
                value={abilityForm.name}
                onChange={(e) =>
                  setAbilityForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Second Wind"
              />
            </Field>
            <Field label="Type">
              <select
                className="ds-input"
                value={abilityForm.abilityType}
                onChange={(e) =>
                  setAbilityForm((p) => ({ ...p, abilityType: e.target.value }))
                }
              >
                {ABILITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Uses (0 = unlimited)">
              <input
                className="ds-input"
                type="number"
                min={0}
                value={abilityForm.uses}
                onChange={(e) =>
                  setAbilityForm((p) => ({
                    ...p,
                    uses: Math.max(0, Number.parseInt(e.target.value) || 0),
                  }))
                }
              />
            </Field>
            <Field label="Recharge On">
              <select
                className="ds-input"
                value={abilityForm.rechargeOn}
                onChange={(e) =>
                  setAbilityForm((p) => ({ ...p, rechargeOn: e.target.value }))
                }
              >
                {RECHARGE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r || "None"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <textarea
                className="ds-input"
                value={abilityForm.description}
                onChange={(e) =>
                  setAbilityForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                style={{ resize: "vertical" }}
                placeholder="Describe what this ability does..."
              />
            </Field>
          </div>
          <ModalFooter
            onClose={() => setShowAbilityForm(false)}
            onSave={saveAbility}
            saving={savingAbility}
            disabled={!abilityForm.name.trim()}
            label={editingAbility ? "Save Changes" : "Add Ability"}
          />
        </Modal>
      )}

      {/* Custom Attack Form Modal */}
      {showAttackForm && (
        <Modal
          onClose={() => setShowAttackForm(false)}
          title={editingAttack ? "Edit Custom Attack" : "New Custom Attack"}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Attack Name *">
                <input
                  className="ds-input"
                  value={attackForm.name}
                  onChange={(e) =>
                    setAttackForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Haymaker, Grapple, Headbutt"
                  data-ocid="attacks.input"
                />
              </Field>
            </div>
            <Field label="Damage Dice">
              <input
                className="ds-input"
                value={attackForm.damageDice}
                onChange={(e) =>
                  setAttackForm((p) => ({ ...p, damageDice: e.target.value }))
                }
                placeholder="1d6"
              />
            </Field>
            <Field label="Attack Bonus">
              <input
                className="ds-input"
                type="number"
                value={attackForm.attackBonus}
                onChange={(e) =>
                  setAttackForm((p) => ({
                    ...p,
                    attackBonus: Number.parseInt(e.target.value) || 0,
                  }))
                }
              />
            </Field>
            <Field label="Damage Type">
              <select
                className="ds-input"
                value={attackForm.damageType}
                onChange={(e) =>
                  setAttackForm((p) => ({ ...p, damageType: e.target.value }))
                }
              >
                {[
                  "Bludgeoning",
                  "Piercing",
                  "Slashing",
                  "Fire",
                  "Cold",
                  "Lightning",
                  "Poison",
                  "Acid",
                  "Necrotic",
                  "Radiant",
                  "Force",
                  "Psychic",
                  "Thunder",
                  "Other",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Range">
              <input
                className="ds-input"
                value={attackForm.range}
                onChange={(e) =>
                  setAttackForm((p) => ({ ...p, range: e.target.value }))
                }
                placeholder="5 ft (Melee)"
              />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Properties">
                <input
                  className="ds-input"
                  value={attackForm.properties}
                  onChange={(e) =>
                    setAttackForm((p) => ({ ...p, properties: e.target.value }))
                  }
                  placeholder="Finesse, Light"
                />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description">
                <textarea
                  className="ds-input"
                  value={attackForm.description}
                  onChange={(e) =>
                    setAttackForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="Describe the attack..."
                />
              </Field>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowAttackForm(false)}
            onSave={saveAttack}
            saving={savingAttack}
            disabled={!attackForm.name.trim()}
            label={editingAttack ? "Save Changes" : "Add Attack"}
          />
        </Modal>
      )}

      {/* Custom School Form Modal */}
      {showSchoolForm && (
        <Modal
          onClose={() => setShowSchoolForm(false)}
          title={editingSchool ? "Edit Custom School" : "New Custom School"}
        >
          <Field label="School Name *">
            <input
              className="ds-input"
              value={schoolForm.name}
              onChange={(e) =>
                setSchoolForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g. Chronomancy, Blood Magic"
              data-ocid="schools.input"
            />
          </Field>
          <ModalFooter
            onClose={() => setShowSchoolForm(false)}
            onSave={saveSchool}
            saving={savingSchool}
            disabled={!schoolForm.name.trim()}
            label={editingSchool ? "Save Changes" : "Add School"}
          />
        </Modal>
      )}

      {/* Custom Skill Form Modal */}
      {showSkillForm && (
        <Modal
          onClose={() => setShowSkillForm(false)}
          title={editingSkill ? "Edit Custom Skill" : "New Custom Skill"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Skill Name *">
              <input
                className="ds-input"
                value={skillForm.name}
                onChange={(e) =>
                  setSkillForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Arcane Lore, Herbalism"
                data-ocid="skills.input"
              />
            </Field>
            <Field label="Based on Stat">
              <select
                className="ds-input"
                value={skillForm.statBased}
                onChange={(e) =>
                  setSkillForm((p) => ({ ...p, statBased: e.target.value }))
                }
                data-ocid="skills.select"
              >
                {STAT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <textarea
                className="ds-input"
                value={skillForm.description}
                onChange={(e) =>
                  setSkillForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                style={{ resize: "vertical" }}
                placeholder="What this skill covers..."
                data-ocid="skills.textarea"
              />
            </Field>
          </div>
          <ModalFooter
            onClose={() => setShowSkillForm(false)}
            onSave={saveSkill}
            saving={savingSkill}
            disabled={!skillForm.name.trim()}
            label={editingSkill ? "Save Changes" : "Add Skill"}
          />
        </Modal>
      )}

      {/* Custom Feat Form Modal */}
      {showFeatForm && (
        <Modal
          onClose={() => setShowFeatForm(false)}
          title={editingFeat ? "Edit Custom Feat" : "New Custom Feat"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Feat Name *">
              <input
                className="ds-input"
                value={featForm.name}
                onChange={(e) =>
                  setFeatForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. War Caster, Lucky"
                data-ocid="feats.input"
              />
            </Field>
            <Field label="Prerequisites (optional)">
              <input
                className="ds-input"
                value={featForm.prerequisites}
                onChange={(e) =>
                  setFeatForm((p) => ({ ...p, prerequisites: e.target.value }))
                }
                placeholder="e.g. Spellcasting, STR 13+"
              />
            </Field>
            <Field label="Description">
              <textarea
                className="ds-input"
                value={featForm.description}
                onChange={(e) =>
                  setFeatForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                style={{ resize: "vertical" }}
                placeholder="What this feat does..."
                data-ocid="feats.textarea"
              />
            </Field>
          </div>
          <ModalFooter
            onClose={() => setShowFeatForm(false)}
            onSave={saveFeat}
            saving={savingFeat}
            disabled={!featForm.name.trim()}
            label={editingFeat ? "Save Changes" : "Add Feat"}
          />
        </Modal>
      )}

      {/* Custom Stat Form Modal */}
      {showStatForm && (
        <Modal
          onClose={() => setShowStatForm(false)}
          title={editingStat ? "Edit Custom Stat" : "New Custom Stat"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Stat Name *">
              <input
                className="ds-input"
                value={statForm.name}
                onChange={(e) =>
                  setStatForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Command Rating, Reputation..."
                data-ocid="stats.input"
              />
            </Field>
            <Field label="Default Value">
              <input
                className="ds-input"
                value={statForm.defaultValue}
                onChange={(e) =>
                  setStatForm((p) => ({ ...p, defaultValue: e.target.value }))
                }
                placeholder="e.g. 0, Neutral, Unknown..."
                data-ocid="stats.default_input"
              />
            </Field>
            <Field label="Description">
              <textarea
                className="ds-input"
                value={statForm.description}
                onChange={(e) =>
                  setStatForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                style={{ resize: "vertical" }}
                placeholder="What this stat represents..."
                data-ocid="stats.textarea"
              />
            </Field>
          </div>
          <ModalFooter
            onClose={() => setShowStatForm(false)}
            onSave={saveStat}
            saving={savingStat}
            disabled={!statForm.name.trim()}
            label={editingStat ? "Save Changes" : "Add Stat"}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="ds-card"
        style={{
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflow: "auto",
          padding: 24,
        }}
      >
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
            style={{ color: "var(--ds-gold)", fontSize: 18 }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--ds-muted)",
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="ds-label">{label}</span>
      {children}
    </div>
  );
}

function ModalFooter({
  onClose,
  onSave,
  saving,
  disabled,
  label,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginTop: 20,
        justifyContent: "flex-end",
      }}
    >
      <button type="button" className="ds-btn-ghost" onClick={onClose}>
        Cancel
      </button>
      <button
        type="button"
        className="ds-btn-primary"
        onClick={onSave}
        disabled={saving || disabled}
        style={{ fontFamily: "Cinzel, serif" }}
      >
        {saving ? "Saving..." : label}
      </button>
    </div>
  );
}

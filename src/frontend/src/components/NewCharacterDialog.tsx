import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import type { Character, CustomClass, CustomRace, DndBackend } from "../types";

interface Props {
  actor: DndBackend;
  onClose: () => void;
  onCreated: (id: bigint) => void;
  existing?: { id: bigint; char: Character };
}

const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
];
const STANDARD_RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
  "Dragonborn",
];
const STANDARD_CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
  "Artificer",
];

const DEFAULT_SKILLS = {
  acrobatics: false,
  animalHandling: false,
  arcana: false,
  athletics: false,
  deception: false,
  history: false,
  insight: false,
  intimidation: false,
  investigation: false,
  medicine: false,
  nature: false,
  perception: false,
  performance: false,
  persuasion: false,
  religion: false,
  sleightOfHand: false,
  stealth: false,
  survival: false,
  description: "",
};

// D&D 5e full caster spell slot table (level 1-20, 9 levels)
const SPELL_SLOT_TABLE: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];

function getProficiencyBonus(level: number): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

export default function NewCharacterDialog({
  actor,
  onClose,
  onCreated,
  existing,
}: Props) {
  const { identity } = useInternetIdentity();
  const [saving, setSaving] = useState(false);
  const [customRaces, setCustomRaces] = useState<[bigint, CustomRace][]>([]);
  const [customClasses, setCustomClasses] = useState<[bigint, CustomClass][]>(
    [],
  );
  const [settings, setSettings] = useState<{ maxLevel: bigint }>({
    maxLevel: 20n,
  });

  const c = existing?.char;
  const [form, setForm] = useState({
    name: c?.name ?? "",
    race: c?.race ?? "Human",
    characterClass: c?.characterClass ?? "Fighter",
    level: c ? Number(c.level) : 1,
    background: c?.background ?? "",
    alignment: c?.alignment ?? "True Neutral",
    gender: c?.gender ?? "",
    str: c ? Number(c.str) : 10,
    dex: c ? Number(c.dex) : 10,
    con: c ? Number(c.con) : 10,
    int: c ? Number(c.int) : 10,
    wis: c ? Number(c.wis) : 10,
    cha: c ? Number(c.cha) : 10,
    hpMax: c ? Number(c.hpMax) : 10,
    hpCurrent: c ? Number(c.hpCurrent) : 10,
    ac: c ? Number(c.ac) : 10,
    speed: c ? Number(c.speed) : 30,
    initiative: c ? Number(c.initiative) : 0,
    proficiencyBonus: c ? Number(c.proficiencyBonus) : 2,
    gold: c ? Number(c.gold) : 0,
  });

  useEffect(() => {
    actor
      .getAllRaces()
      .then((r) => setCustomRaces(r as unknown as [bigint, CustomRace][]));
    actor
      .getAllClasses()
      .then((r) => setCustomClasses(r as unknown as [bigint, CustomClass][]));
    actor.getSettings().then((s) => setSettings({ maxLevel: s.maxLevel }));
  }, [actor]);

  const allRaces = [...STANDARD_RACES, ...customRaces.map(([, r]) => r.name)];
  const allClasses = [
    ...STANDARD_CLASSES,
    ...customClasses.map(([, cl]) => cl.name),
  ];
  const maxLvl = Number(settings.maxLevel);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const principal = identity!.getPrincipal();
      const char: Character = {
        owner: principal,
        name: form.name,
        race: form.race,
        characterClass: form.characterClass,
        level: BigInt(form.level),
        background: form.background,
        alignment: form.alignment,
        gender: form.gender,
        str: BigInt(form.str),
        dex: BigInt(form.dex),
        con: BigInt(form.con),
        int: BigInt(form.int),
        wis: BigInt(form.wis),
        cha: BigInt(form.cha),
        hpCurrent: BigInt(form.hpCurrent),
        hpMax: BigInt(form.hpMax),
        ac: BigInt(form.ac),
        speed: BigInt(form.speed),
        initiative: BigInt(form.initiative),
        proficiencyBonus: BigInt(form.proficiencyBonus),
        notes: c?.notes ?? "",
        portraitUrl: c?.portraitUrl ?? "",
        gold: BigInt(form.gold),
        skills: c?.skills ?? DEFAULT_SKILLS,
        spellSlots: c?.spellSlots ?? Array(10).fill(0n),
      };
      let savedCharacterId: bigint;
      if (existing) {
        await actor.updateCharacter(existing.id, char);
        savedCharacterId = existing.id;
        // Auto-update spell slot maximums based on new level (for full-caster table)
        const tableIndex = Math.min(form.level, 20) - 1;
        const slotMaxes = SPELL_SLOT_TABLE[tableIndex];
        if (slotMaxes) {
          const existingSlots = await actor
            .getSpellSlotsByCharacter(existing.id)
            .catch(() => []);
          if (existingSlots.length > 0) {
            const updatedSlots = existingSlots.map((s) => {
              const lvlIdx = Number(s.spellLevel) - 1;
              const newTotal = slotMaxes[lvlIdx] ?? 0;
              return { ...s, total: BigInt(newTotal) };
            });
            await actor
              .updateSpellSlots(existing.id, updatedSlots)
              .catch(console.error);
          }
        }
      } else {
        savedCharacterId = await actor.createCharacter(char);
      }

      // Apply race grants if the selected race is a custom race
      const matchedRace = customRaces.find(([, r]) => r.name === form.race);
      if (matchedRace) {
        try {
          await actor.applyRaceGrantsToCharacter(
            savedCharacterId,
            matchedRace[0],
          );
        } catch (e) {
          console.error("Failed to apply race grants:", e);
        }
      }

      onCreated(savedCharacterId);
    } catch (e) {
      console.error(e);
      alert(
        `Failed to ${existing ? "save" : "create"} character: ${String(e)}`,
      );
    }
    setSaving(false);
  };

  const f = (field: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [field]: val }));

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
          maxWidth: 600,
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
            marginBottom: 20,
          }}
        >
          <h2
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 20 }}
          >
            {existing ? "Edit Character" : "New Character"}
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

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span className="ds-label">Character Name *</span>
            <input
              className="ds-input"
              value={form.name}
              onChange={(e) => f("name", e.target.value)}
              placeholder="Enter name..."
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">Race</span>
            <select
              className="ds-input"
              value={form.race}
              onChange={(e) => f("race", e.target.value)}
            >
              {allRaces.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">Class</span>
            <select
              className="ds-input"
              value={form.characterClass}
              onChange={(e) => f("characterClass", e.target.value)}
            >
              {allClasses.map((cl) => (
                <option key={cl} value={cl}>
                  {cl}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">Level (1–{maxLvl})</span>
            <input
              className="ds-input"
              type="number"
              min={1}
              max={maxLvl}
              value={form.level}
              onChange={(e) => {
                const newLevel = Math.min(
                  maxLvl,
                  Math.max(1, Number.parseInt(e.target.value) || 1),
                );
                const newProf = getProficiencyBonus(newLevel);
                setForm((prev) => ({
                  ...prev,
                  level: newLevel,
                  proficiencyBonus: newProf,
                }));
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">Alignment</span>
            <select
              className="ds-input"
              value={form.alignment}
              onChange={(e) => f("alignment", e.target.value)}
            >
              {ALIGNMENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">Background</span>
            <input
              className="ds-input"
              value={form.background}
              onChange={(e) => f("background", e.target.value)}
              placeholder="e.g. Soldier"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">Gender</span>
            <input
              className="ds-input"
              value={form.gender}
              onChange={(e) => f("gender", e.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>

        <h3
          className="font-cinzel"
          style={{
            color: "var(--ds-gold)",
            fontSize: 14,
            marginTop: 20,
            marginBottom: 12,
          }}
        >
          ABILITY SCORES
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 8,
          }}
        >
          {(["str", "dex", "con", "int", "wis", "cha"] as const).map((stat) => (
            <label
              key={stat}
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span className="ds-label" style={{ textAlign: "center" }}>
                {stat.toUpperCase()}
              </span>
              <input
                className="ds-input"
                type="number"
                min={1}
                max={30}
                value={form[stat]}
                onChange={(e) =>
                  f(
                    stat,
                    Math.min(
                      30,
                      Math.max(1, Number.parseInt(e.target.value) || 10),
                    ),
                  )
                }
                style={{ textAlign: "center", padding: "8px 4px" }}
              />
            </label>
          ))}
        </div>

        <h3
          className="font-cinzel"
          style={{
            color: "var(--ds-gold)",
            fontSize: 14,
            marginTop: 20,
            marginBottom: 12,
          }}
        >
          COMBAT STATS
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {[
            { label: "Max HP", key: "hpMax" },
            { label: "Current HP", key: "hpCurrent" },
            { label: "Armor Class", key: "ac" },
            { label: "Speed (ft)", key: "speed" },
            { label: "Initiative", key: "initiative" },
            { label: "Proficiency Bonus", key: "proficiencyBonus" },
            { label: "Gold (cp)", key: "gold" },
          ].map(({ label, key }) => (
            <label
              key={key}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <span className="ds-label">{label}</span>
              <input
                className="ds-input"
                type="number"
                min={0}
                value={form[key as keyof typeof form] as number}
                onChange={(e) => f(key, Number.parseInt(e.target.value) || 0)}
              />
            </label>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 24,
            justifyContent: "flex-end",
          }}
        >
          <button type="button" className="ds-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {saving
              ? "Saving..."
              : existing
                ? "Save Changes"
                : "Create Character"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterAppearance } from "../../types";
import type {
  Character,
  DeathSaveState,
  DndBackend,
  HPState,
  SaveThrowState,
  TabNote,
} from "../../types";
import XpTrackerPanel from "../XpTrackerPanel";

interface Props {
  actor: DndBackend;
  character: Character;
  characterId: bigint;
  onUpdate: () => void;
}

const SKILLS = [
  { key: "acrobatics", label: "Acrobatics", stat: "dex" },
  { key: "animalHandling", label: "Animal Handling", stat: "wis" },
  { key: "arcana", label: "Arcana", stat: "int" },
  { key: "athletics", label: "Athletics", stat: "str" },
  { key: "deception", label: "Deception", stat: "cha" },
  { key: "history", label: "History", stat: "int" },
  { key: "insight", label: "Insight", stat: "wis" },
  { key: "intimidation", label: "Intimidation", stat: "cha" },
  { key: "investigation", label: "Investigation", stat: "int" },
  { key: "medicine", label: "Medicine", stat: "wis" },
  { key: "nature", label: "Nature", stat: "int" },
  { key: "perception", label: "Perception", stat: "wis" },
  { key: "performance", label: "Performance", stat: "cha" },
  { key: "persuasion", label: "Persuasion", stat: "cha" },
  { key: "religion", label: "Religion", stat: "int" },
  { key: "sleightOfHand", label: "Sleight of Hand", stat: "dex" },
  { key: "stealth", label: "Stealth", stat: "dex" },
  { key: "survival", label: "Survival", stat: "wis" },
] as const;

const SAVES = [
  { key: "str", profKey: "strProf" },
  { key: "dex", profKey: "dexProf" },
  { key: "con", profKey: "conProf" },
  { key: "int", profKey: "intProf" },
  { key: "wis", profKey: "wisProf" },
  { key: "cha", profKey: "chaProf" },
] as const;

function mod(score: bigint): number {
  return Math.floor((Number(score) - 10) / 2);
}
function modStr(score: bigint): string {
  const m = mod(score);
  return m >= 0 ? `+${m}` : `${m}`;
}

const DEFAULT_HP: HPState = {
  characterId: 0n,
  hpCurrent: 0n,
  hpMax: 0n,
  hpTemp: 0n,
};
const DEFAULT_SAVE: SaveThrowState = {
  characterId: 0n,
  strProf: false,
  dexProf: false,
  conProf: false,
  intProf: false,
  wisProf: false,
  chaProf: false,
};
const DEFAULT_DEATH: DeathSaveState = {
  characterId: 0n,
  successes: 0n,
  failures: 0n,
};

// ── Spell Damage Calculator ─────────────────────────────────────────────────

function SpellDamageCalculator({
  character,
}: { character: import("../../types").Character }) {
  const [open, setOpen] = useState(false);
  const [spellcastingAbility, setSpellcastingAbility] = useState<
    "str" | "dex" | "con" | "int" | "wis" | "cha"
  >("int");

  const profBonus = Number(character.proficiencyBonus);
  const abilityScore = Number(character[spellcastingAbility]);
  const abilityMod = Math.floor((abilityScore - 10) / 2);
  const spellAttackBonus = abilityMod + profBonus;
  const spellSaveDC = 8 + abilityMod + profBonus;

  return (
    <div className="ds-card" style={{ padding: 16 }}>
      <button
        type="button"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={() => setOpen((o) => !o)}
        data-ocid="stats.spell_calculator.toggle"
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 14 }}
        >
          SPELL DAMAGE CALCULATOR
        </h3>
        <span style={{ color: "var(--ds-muted)" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div className="ds-label" style={{ marginBottom: 4 }}>
                Spellcasting Ability
              </div>
              <select
                className="ds-input"
                value={spellcastingAbility}
                onChange={(e) =>
                  setSpellcastingAbility(
                    e.target.value as typeof spellcastingAbility,
                  )
                }
                data-ocid="stats.spell_calculator.ability.select"
              >
                {(["str", "dex", "con", "int", "wis", "cha"] as const).map(
                  (a) => (
                    <option key={a} value={a}>
                      {a.toUpperCase()} ({character[a].toString()} →{" "}
                      {modStr(character[a])})
                    </option>
                  ),
                )}
              </select>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "var(--ds-surface2)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Spell Attack Bonus
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--ds-gold)",
                    fontFamily: "Cinzel, serif",
                  }}
                >
                  {spellAttackBonus >= 0 ? "+" : ""}
                  {spellAttackBonus}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    marginTop: 4,
                  }}
                >
                  Mod ({abilityMod >= 0 ? "+" : ""}
                  {abilityMod}) + Prof (+{profBonus})
                </div>
              </div>
              <div
                style={{
                  background: "var(--ds-surface2)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Spell Save DC
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#3498db",
                    fontFamily: "Cinzel, serif",
                  }}
                >
                  {spellSaveDC}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    marginTop: 4,
                  }}
                >
                  8 + Mod ({abilityMod >= 0 ? "+" : ""}
                  {abilityMod}) + Prof (+{profBonus})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatsTab({
  actor,
  character,
  characterId,
  onUpdate,
}: Props) {
  const [hp, setHp] = useState<HPState>(DEFAULT_HP);
  const [hpLoaded, setHpLoaded] = useState(false);
  const [editMaxHp, setEditMaxHp] = useState(false);
  const [maxHpInput, setMaxHpInput] = useState(0);
  // Inline direct-edit state for current/temp HP
  const [editingHpField, setEditingHpField] = useState<
    "current" | "temp" | null
  >(null);
  const [hpDirectInput, setHpDirectInput] = useState("");

  const [saveThrows, setSaveThrows] = useState<SaveThrowState>(DEFAULT_SAVE);
  const [death, setDeath] = useState<DeathSaveState>(DEFAULT_DEATH);

  const [tabNote, setTabNote] = useState("");
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Appearance
  const [appearance, setAppearance] = useState<CharacterAppearance>({
    age: "",
    height: "",
    weight: "",
    hairColor: "",
    eyeColor: "",
    distinguishingMarks: "",
  });
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);

  // Background field editing
  const [editingBackground, setEditingBackground] = useState(false);
  const [backgroundInput, setBackgroundInput] = useState("");
  const [savingBackground, setSavingBackground] = useState(false);
  const bgRef = useRef<HTMLTextAreaElement>(null);

  const skills = character.skills;
  const prof = Number(character.proficiencyBonus);

  const load = useCallback(async () => {
    const [hpRes, saveRes, deathRes, noteRes, appearanceRes] =
      await Promise.allSettled([
        actor.getHPState(characterId),
        actor.getSaveThrowState(characterId),
        actor.getDeathSaveState(characterId),
        actor.getTabNote(characterId, "stats"),
        actor.getCharacterAppearance(characterId),
      ]);

    if (hpRes.status === "fulfilled" && hpRes.value) {
      setHp(hpRes.value);
    } else {
      const init: HPState = {
        characterId,
        hpCurrent: character.hpCurrent,
        hpMax: character.hpMax,
        hpTemp: 0n,
      };
      setHp(init);
    }
    setHpLoaded(true);

    if (saveRes.status === "fulfilled" && saveRes.value) {
      setSaveThrows(saveRes.value);
    } else {
      setSaveThrows({ ...DEFAULT_SAVE, characterId });
    }

    if (deathRes.status === "fulfilled" && deathRes.value) {
      setDeath(deathRes.value);
    } else {
      setDeath({ ...DEFAULT_DEATH, characterId });
    }

    if (noteRes.status === "fulfilled" && noteRes.value) {
      setTabNote((noteRes.value as TabNote).content);
    }
    setNoteLoaded(true);

    if (appearanceRes.status === "fulfilled" && appearanceRes.value) {
      const val = appearanceRes.value;
      // Candid optional returns [] | [T]
      const record = Array.isArray(val) && val.length > 0 ? val[0] : null;
      if (record) setAppearance(record as CharacterAppearance);
    }
    setAppearanceLoaded(true);
  }, [actor, characterId, character.hpCurrent, character.hpMax]);

  useEffect(() => {
    load();
  }, [load]);

  // HP helpers
  const adjustCurrent = async (delta: number) => {
    const next = { ...hp, hpCurrent: hp.hpCurrent + BigInt(delta) };
    setHp(next);
    await actor.updateHPState(characterId, next);
  };
  const adjustTemp = async (delta: number) => {
    const raw = hp.hpTemp + BigInt(delta);
    const next = { ...hp, hpTemp: raw < 0n ? 0n : raw };
    setHp(next);
    await actor.updateHPState(characterId, next);
  };
  const saveMaxHp = async () => {
    const next = { ...hp, hpMax: BigInt(maxHpInput) };
    setHp(next);
    await actor.updateHPState(characterId, next);
    setEditMaxHp(false);
  };
  const commitHpDirect = async (field: "current" | "temp") => {
    const val = Number(hpDirectInput);
    const safe = Number.isNaN(val) ? 0 : val;
    const next =
      field === "current"
        ? { ...hp, hpCurrent: BigInt(safe) }
        : { ...hp, hpTemp: BigInt(Math.max(0, safe)) };
    setHp(next);
    setEditingHpField(null);
    setHpDirectInput("");
    await actor.updateHPState(characterId, next);
  };

  const hpPct = Math.min(
    100,
    (Number(hp.hpCurrent) / Math.max(1, Number(hp.hpMax))) * 100,
  );
  const hpColor = hpPct > 50 ? "#4caf50" : hpPct > 25 ? "#ff9800" : "#e53935";

  // Saving throws
  const toggleSaveProf = async (profKey: keyof SaveThrowState) => {
    if (profKey === "characterId") return;
    const updated = { ...saveThrows, [profKey]: !saveThrows[profKey] };
    setSaveThrows(updated);
    await actor.updateSaveThrowState(characterId, updated);
  };

  // Death saves
  const setDeathVal = async (field: "successes" | "failures", val: bigint) => {
    const clamped = val < 0n ? 0n : val > 3n ? 3n : val;
    const updated = { ...death, [field]: clamped };
    setDeath(updated);
    await actor.updateDeathSaveState(characterId, updated);
  };

  // Skills
  const toggleSkill = async (key: string) => {
    const updated = {
      ...character,
      skills: { ...skills, [key]: !skills[key as keyof typeof skills] },
    };
    await actor.updateCharacter(characterId, updated);
    await onUpdate();
  };

  // Background
  const startEditBackground = () => {
    setBackgroundInput(character.background ?? "");
    setEditingBackground(true);
    setTimeout(() => bgRef.current?.focus(), 50);
  };
  const saveBackground = async () => {
    setSavingBackground(true);
    await actor.updateCharacter(characterId, {
      ...character,
      background: backgroundInput,
    });
    await onUpdate();
    setEditingBackground(false);
    setSavingBackground(false);
  };

  const [appearanceError, setAppearanceError] = useState<string | null>(null);

  const saveAppearance = async (next: CharacterAppearance) => {
    setSavingAppearance(true);
    setAppearanceError(null);
    try {
      await actor.updateCharacterAppearance(characterId, next);
    } catch (e) {
      setAppearanceError(
        `Failed to save appearance: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setSavingAppearance(false);
    }
  };

  const patchAppearance = <K extends keyof CharacterAppearance>(
    key: K,
    value: CharacterAppearance[K],
  ) => {
    const next = { ...appearance, [key]: value };
    setAppearance(next);
    saveAppearance(next);
  };

  // Tab note
  const saveNote = async () => {
    setSavingNote(true);
    await actor.saveTabNote(characterId, "stats", tabNote);
    setSavingNote(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* XP Tracker */}
      <XpTrackerPanel
        actor={actor}
        characterId={characterId}
        characterLevel={character.level}
        onUpdate={async () => {
          onUpdate();
        }}
        character={character}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* HP Tracker */}
          {hpLoaded && (
            <div className="ds-card" style={{ padding: 16 }}>
              <h3
                className="font-cinzel"
                style={{
                  color: "var(--ds-gold)",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                HIT POINTS
              </h3>

              {/* HP bar */}
              <div
                style={{
                  height: 8,
                  backgroundColor: "var(--ds-surface2)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max(0, hpPct)}%`,
                    backgroundColor: hpColor,
                    borderRadius: 4,
                    transition: "width 0.3s, background-color 0.3s",
                  }}
                />
              </div>

              {/* Current HP */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Current HP
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ width: 32, padding: 0, fontWeight: 700 }}
                    onClick={() => adjustCurrent(-1)}
                    data-ocid="stats.hp_current_minus"
                  >
                    −
                  </button>
                  {editingHpField === "current" ? (
                    <input
                      type="number"
                      value={hpDirectInput}
                      onChange={(e) => setHpDirectInput(e.target.value)}
                      onBlur={() => commitHpDirect("current")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitHpDirect("current");
                        if (e.key === "Escape") {
                          setEditingHpField(null);
                          setHpDirectInput("");
                        }
                      }}
                      style={{
                        width: 60,
                        textAlign: "center",
                        fontSize: 20,
                        fontWeight: 700,
                        color: hpColor,
                        backgroundColor: "var(--ds-surface2)",
                        border: `1px solid ${hpColor}`,
                        borderRadius: 4,
                        padding: "2px 4px",
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setHpDirectInput(hp.hpCurrent.toString());
                        setEditingHpField("current");
                      }}
                      title="Click to set value directly"
                      style={{
                        color: hpColor,
                        fontSize: 22,
                        fontWeight: 700,
                        minWidth: 48,
                        textAlign: "center",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        borderBottom: `1px dashed ${hpColor}`,
                        paddingBottom: 1,
                      }}
                      data-ocid="stats.hp_current_value"
                    >
                      {hp.hpCurrent.toString()}
                    </button>
                  )}
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ width: 32, padding: 0, fontWeight: 700 }}
                    onClick={() => adjustCurrent(1)}
                    data-ocid="stats.hp_current_plus"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Max HP */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Max HP
                </div>
                {editMaxHp ? (
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <input
                      className="ds-input"
                      type="number"
                      value={maxHpInput}
                      onChange={(e) =>
                        setMaxHpInput(Number(e.target.value) || 0)
                      }
                      style={{ width: 70 }}
                      min={0}
                      data-ocid="stats.hp_max_input"
                    />
                    <button
                      type="button"
                      className="ds-btn-primary"
                      style={{ fontSize: 12 }}
                      onClick={saveMaxHp}
                      data-ocid="stats.hp_max_save"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 12 }}
                      onClick={() => setEditMaxHp(false)}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <span
                      style={{
                        color: "var(--ds-text)",
                        fontSize: 18,
                        fontWeight: 600,
                      }}
                    >
                      {hp.hpMax.toString()}
                    </span>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 11, padding: "2px 8px" }}
                      onClick={() => {
                        setMaxHpInput(Number(hp.hpMax));
                        setEditMaxHp(true);
                      }}
                      data-ocid="stats.hp_max_edit"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Temp HP */}
              <div>
                <div
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Temp HP
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ width: 32, padding: 0, fontWeight: 700 }}
                    onClick={() => adjustTemp(-1)}
                    data-ocid="stats.hp_temp_minus"
                  >
                    −
                  </button>
                  {editingHpField === "temp" ? (
                    <input
                      type="number"
                      min={0}
                      value={hpDirectInput}
                      onChange={(e) => setHpDirectInput(e.target.value)}
                      onBlur={() => commitHpDirect("temp")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitHpDirect("temp");
                        if (e.key === "Escape") {
                          setEditingHpField(null);
                          setHpDirectInput("");
                        }
                      }}
                      style={{
                        width: 54,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#4a9eca",
                        backgroundColor: "var(--ds-surface2)",
                        border: "1px solid #4a9eca",
                        borderRadius: 4,
                        padding: "2px 4px",
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setHpDirectInput(hp.hpTemp.toString());
                        setEditingHpField("temp");
                      }}
                      title="Click to set value directly"
                      style={{
                        color: "#4a9eca",
                        fontSize: 18,
                        fontWeight: 700,
                        minWidth: 40,
                        textAlign: "center",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        borderBottom: "1px dashed #4a9eca",
                        paddingBottom: 1,
                      }}
                      data-ocid="stats.hp_temp_value"
                    >
                      {hp.hpTemp.toString()}
                    </button>
                  )}
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ width: 32, padding: 0, fontWeight: 700 }}
                    onClick={() => adjustTemp(1)}
                    data-ocid="stats.hp_temp_plus"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ability Scores */}
          <div className="ds-card" style={{ padding: 16 }}>
            <h3
              className="font-cinzel"
              style={{
                color: "var(--ds-gold)",
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              ABILITY SCORES
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {(["str", "dex", "con", "int", "wis", "cha"] as const).map(
                (stat) => (
                  <div key={stat} className="ability-box">
                    <div
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 2,
                      }}
                    >
                      {stat}
                    </div>
                    <div
                      style={{
                        color: "var(--ds-text)",
                        fontSize: 24,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {character[stat].toString()}
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        backgroundColor: "var(--ds-bg)",
                        border: "1px solid var(--ds-border)",
                        borderRadius: 10,
                        padding: "2px 6px",
                        fontSize: 11,
                        color: "var(--ds-gold)",
                        marginTop: 4,
                      }}
                    >
                      {modStr(character[stat])}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Saving Throws */}
          <div className="ds-card" style={{ padding: 16 }}>
            <h3
              className="font-cinzel"
              style={{
                color: "var(--ds-gold)",
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              SAVING THROWS
            </h3>
            {SAVES.map(({ key, profKey }) => {
              const baseMod = mod(character[key]);
              const isProficient = saveThrows[profKey] as boolean;
              const total = isProficient ? baseMod + prof : baseMod;
              const display = total >= 0 ? `+${total}` : `${total}`;
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 0",
                    borderBottom: "1px solid var(--ds-border)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSaveProf(profKey)}
                      title={isProficient ? "Proficient" : "Not proficient"}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid var(--ds-gold)",
                        backgroundColor: isProficient
                          ? "var(--ds-gold)"
                          : "transparent",
                        cursor: "pointer",
                        padding: 0,
                        flexShrink: 0,
                      }}
                      data-ocid={`stats.save_prof.${key}`}
                    />
                    <span style={{ color: "var(--ds-text)", fontSize: 13 }}>
                      {key.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ color: "var(--ds-gold)", fontSize: 13 }}>
                    {display}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Death Saves — show alert when HP=0 */}
          {hpLoaded && hp.hpCurrent <= 0n && (
            <div
              style={{
                background: "rgba(229,57,53,0.15)",
                border: "2px solid #e53935",
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              data-ocid="stats.death_saves.prompt"
            >
              <span style={{ fontSize: 18 }}>☠️</span>
              <span
                style={{
                  color: "#e53935",
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                }}
              >
                HP AT 0 — MAKE DEATH SAVING THROWS
              </span>
            </div>
          )}
          {/* Death Saves */}
          <div className="ds-card" style={{ padding: 16 }}>
            <h3
              className="font-cinzel"
              style={{
                color: "var(--ds-gold)",
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              DEATH SAVES
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["successes", "failures"] as const).map((field) => {
                const count = Number(death[field]);
                const color = field === "successes" ? "#4caf50" : "#e53935";
                return (
                  <div
                    key={field}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        width: 68,
                        textTransform: "capitalize",
                      }}
                    >
                      {field}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() =>
                            setDeathVal(
                              field,
                              n <= count ? BigInt(n - 1) : BigInt(n),
                            )
                          }
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: `2px solid ${color}`,
                            backgroundColor: n <= count ? color : "transparent",
                            cursor: "pointer",
                            padding: 0,
                            transition: "background 0.15s",
                          }}
                          data-ocid={`stats.death_${field}.${n}`}
                        />
                      ))}
                    </div>
                    <span style={{ color, fontSize: 12 }}>{count}/3</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Background Field */}
          <div className="ds-card" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <h3
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 14 }}
              >
                BACKGROUND
              </h3>
              {!editingBackground && (
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 12, padding: "4px 8px" }}
                  onClick={startEditBackground}
                  data-ocid="stats.background_edit"
                >
                  Edit
                </button>
              )}
            </div>
            {editingBackground ? (
              <div>
                <textarea
                  ref={bgRef}
                  className="ds-input"
                  value={backgroundInput}
                  onChange={(e) => setBackgroundInput(e.target.value)}
                  rows={5}
                  style={{ width: "100%", resize: "vertical", marginBottom: 8 }}
                  placeholder="Describe your character's background, history, and origins..."
                  data-ocid="stats.background_textarea"
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => setEditingBackground(false)}
                    data-ocid="stats.background_cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ds-btn-primary"
                    style={{ fontSize: 12 }}
                    onClick={saveBackground}
                    disabled={savingBackground}
                    data-ocid="stats.background_save"
                  >
                    {savingBackground ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : character.background ? (
              <p
                style={{
                  color: "var(--ds-text)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {character.background}
              </p>
            ) : (
              <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
                No background set. Click Edit to add character backstory.
              </p>
            )}
          </div>

          {/* Bio & Appearance */}
          {appearanceLoaded && (
            <div className="ds-card" style={{ padding: 16 }}>
              <h3
                className="font-cinzel"
                style={{
                  color: "var(--ds-gold)",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                BIO & APPEARANCE
                {savingAppearance && (
                  <span
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 11,
                      fontFamily: "inherit",
                      marginLeft: 8,
                    }}
                  >
                    Saving...
                  </span>
                )}
              </h3>
              {appearanceError && (
                <p
                  style={{ color: "#e74c3c", fontSize: 12, marginBottom: 8 }}
                  data-ocid="stats.appearance.error_state"
                >
                  {appearanceError}
                </p>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  {
                    key: "age" as const,
                    label: "Age",
                    placeholder: "e.g. 27, unknown...",
                  },
                  {
                    key: "height" as const,
                    label: "Height",
                    placeholder: "e.g. 5'10\"",
                  },
                  {
                    key: "weight" as const,
                    label: "Weight",
                    placeholder: "e.g. 160 lbs",
                  },
                  {
                    key: "hairColor" as const,
                    label: "Hair Color",
                    placeholder: "e.g. Black",
                  },
                  {
                    key: "eyeColor" as const,
                    label: "Eye Color",
                    placeholder: "e.g. Amber",
                  },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <div className="ds-label" style={{ marginBottom: 4 }}>
                      {label}
                    </div>
                    <input
                      className="ds-input"
                      value={appearance[key]}
                      onChange={(e) => patchAppearance(key, e.target.value)}
                      placeholder={placeholder}
                      data-ocid={`stats.appearance_${key}.input`}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="ds-label" style={{ marginBottom: 4 }}>
                  Distinguishing Marks
                </div>
                <textarea
                  className="ds-input"
                  value={appearance.distinguishingMarks}
                  onChange={(e) =>
                    patchAppearance("distinguishingMarks", e.target.value)
                  }
                  rows={2}
                  style={{ width: "100%", resize: "vertical" }}
                  placeholder="Scars, tattoos, unusual features..."
                  data-ocid="stats.appearance_marks.textarea"
                />
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="ds-card" style={{ padding: 16 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 12 }}
          >
            SKILLS
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {SKILLS.map(({ key, label, stat }) => {
              const isProficient = skills[
                key as keyof typeof skills
              ] as boolean;
              const base = mod(character[stat as "str"]);
              const bonus = isProficient ? base + prof : base;
              const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
              return (
                <button
                  type="button"
                  key={key}
                  className="skill-btn"
                  onClick={() => toggleSkill(key)}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      border: "2px solid var(--ds-gold)",
                      backgroundColor: isProficient
                        ? "var(--ds-gold)"
                        : "transparent",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{ color: "var(--ds-text)", fontSize: 13, flex: 1 }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 11,
                      textTransform: "uppercase",
                    }}
                  >
                    {stat}
                  </span>
                  <span
                    style={{
                      color: "var(--ds-gold)",
                      fontSize: 13,
                      minWidth: 28,
                      textAlign: "right",
                    }}
                  >
                    {bonusStr}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spell Damage Calculator */}
      <SpellDamageCalculator character={character} />

      {/* Tab Note */}
      {noteLoaded && (
        <div className="ds-card" style={{ padding: 16 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 13, marginBottom: 8 }}
          >
            STATS NOTES
          </h3>
          <textarea
            className="ds-input"
            value={tabNote}
            onChange={(e) => setTabNote(e.target.value)}
            placeholder="Notes for this tab..."
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
            data-ocid="stats.textarea"
          />
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={saveNote}
              disabled={savingNote}
              data-ocid="stats.save_button"
            >
              {savingNote ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

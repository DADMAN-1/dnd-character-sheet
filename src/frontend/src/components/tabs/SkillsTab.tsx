import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterSkill, CustomSkill, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const STANDARD_SKILLS: { name: string; stat: string }[] = [
  { name: "Acrobatics", stat: "DEX" },
  { name: "Animal Handling", stat: "WIS" },
  { name: "Arcana", stat: "INT" },
  { name: "Athletics", stat: "STR" },
  { name: "Deception", stat: "CHA" },
  { name: "History", stat: "INT" },
  { name: "Insight", stat: "WIS" },
  { name: "Intimidation", stat: "CHA" },
  { name: "Investigation", stat: "INT" },
  { name: "Medicine", stat: "WIS" },
  { name: "Nature", stat: "INT" },
  { name: "Perception", stat: "WIS" },
  { name: "Performance", stat: "CHA" },
  { name: "Persuasion", stat: "CHA" },
  { name: "Religion", stat: "INT" },
  { name: "Sleight of Hand", stat: "DEX" },
  { name: "Stealth", stat: "DEX" },
  { name: "Survival", stat: "WIS" },
];

const STANDARD_NAMES = new Set(STANDARD_SKILLS.map((s) => s.name));

export default function SkillsTab({ actor, characterId }: Props) {
  const [charSkills, setCharSkills] = useState<CharacterSkill[]>([]);
  const [customSkillLibrary, setCustomSkillLibrary] = useState<CustomSkill[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedCustomSkillId, setSelectedCustomSkillId] =
    useState<string>("");
  const [addingCustom, setAddingCustom] = useState(false);

  // Tab note
  const [noteContent, setNoteContent] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [skills, lib] = await Promise.all([
        actor.getCharacterSkillsByCharacter(characterId),
        actor.getAllCustomSkills(),
      ]);
      setCharSkills(skills);
      setCustomSkillLibrary(lib);
    } catch (e) {
      console.error("Failed to load skills:", e);
      setCharSkills([]);
      setCustomSkillLibrary([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
    actor.getTabNote(characterId, "skills").then((note) => {
      if (note) setNoteContent(note.content);
    });
  }, [load, actor, characterId]);

  const getSkillRecord = (skillName: string): CharacterSkill | undefined =>
    charSkills.find((s) => s.skillName === skillName);

  const toggleSkillField = async (
    skillName: string,
    field: "proficient" | "expertise",
    currentVal: boolean,
  ) => {
    setSaving(skillName);
    const existing = getSkillRecord(skillName);
    try {
      if (existing) {
        const proficient =
          field === "proficient" ? !currentVal : existing.proficient;
        const expertise =
          field === "expertise" ? !currentVal : existing.expertise;
        await actor.updateCharacterSkill(
          existing.id,
          skillName,
          proficient,
          expertise,
        );
      } else {
        const proficient = field === "proficient";
        const expertise = field === "expertise";
        await actor.addCharacterSkill(
          characterId,
          skillName,
          proficient,
          expertise,
        );
      }
      await load();
    } catch (err) {
      alert(`Failed to update skill: ${String(err)}`);
    } finally {
      setSaving(null);
    }
  };

  const handleAddCustomSkill = async () => {
    if (!selectedCustomSkillId) return;
    const lib = customSkillLibrary.find(
      (s) => s.id.toString() === selectedCustomSkillId,
    );
    if (!lib) return;
    setAddingCustom(true);
    try {
      await actor.addCharacterSkill(characterId, lib.name, false, false);
      await load();
      setSelectedCustomSkillId("");
    } catch (err) {
      alert(`Failed to add skill: ${String(err)}`);
    } finally {
      setAddingCustom(false);
    }
  };

  const handleDeleteCustomSkill = async (skill: CharacterSkill) => {
    if (!confirm(`Remove "${skill.skillName}" from this character?`)) return;
    await actor.deleteCharacterSkill(skill.id);
    await load();
  };

  const handleNoteChange = (content: string) => {
    setNoteContent(content);
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(async () => {
      setNoteSaving(true);
      await actor.saveTabNote(characterId, "skills", content);
      setNoteSaving(false);
    }, 800);
  };

  const customCharSkills = charSkills.filter(
    (s) => !STANDARD_NAMES.has(s.skillName),
  );
  const availableToAdd = customSkillLibrary.filter(
    (lib) => !charSkills.some((s) => s.skillName === lib.name),
  );

  if (loading) {
    return (
      <div
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="skills.loading_state"
      >
        Loading skills...
      </div>
    );
  }

  return (
    <div data-ocid="skills.section">
      <h2
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 18, marginBottom: 16 }}
      >
        Skills
      </h2>

      {/* Standard Skills */}
      <div className="ds-card" style={{ padding: 16, marginBottom: 20 }}>
        <h3
          className="font-cinzel"
          style={{
            color: "var(--ds-gold)",
            fontSize: 14,
            marginBottom: 12,
            borderBottom: "1px solid var(--ds-border)",
            paddingBottom: 8,
          }}
        >
          STANDARD SKILLS
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STANDARD_SKILLS.map((skill, idx) => {
            const record = getSkillRecord(skill.name);
            const proficient = record?.proficient ?? false;
            const expertise = record?.expertise ?? false;
            const isSaving = saving === skill.name;
            return (
              <div
                key={skill.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "5px 6px",
                  borderRadius: 5,
                  backgroundColor:
                    idx % 2 === 0 ? "transparent" : "var(--ds-surface2)",
                }}
                data-ocid={`skills.item.${idx + 1}`}
              >
                <span
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 30,
                    letterSpacing: "0.04em",
                  }}
                >
                  {skill.stat}
                </span>
                <span
                  style={{ flex: 1, color: "var(--ds-text)", fontSize: 14 }}
                >
                  {skill.name}
                </span>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={proficient}
                    onChange={() =>
                      toggleSkillField(skill.name, "proficient", proficient)
                    }
                    disabled={isSaving}
                    style={{ accentColor: "var(--ds-gold)" }}
                    data-ocid={`skills.checkbox.${idx + 1}`}
                  />
                  <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                    Prof
                  </span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={expertise}
                    onChange={() =>
                      toggleSkillField(skill.name, "expertise", expertise)
                    }
                    disabled={isSaving}
                    style={{ accentColor: "var(--ds-gold)" }}
                    data-ocid={`skills.checkbox.exp.${idx + 1}`}
                  />
                  <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                    Exp
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Skills */}
      <div className="ds-card" style={{ padding: 16, marginBottom: 20 }}>
        <h3
          className="font-cinzel"
          style={{
            color: "var(--ds-gold)",
            fontSize: 14,
            marginBottom: 12,
            borderBottom: "1px solid var(--ds-border)",
            paddingBottom: 8,
          }}
        >
          CUSTOM SKILLS
        </h3>

        {/* Add custom skill from library */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <select
            className="ds-input"
            value={selectedCustomSkillId}
            onChange={(e) => setSelectedCustomSkillId(e.target.value)}
            style={{ flex: 1, minWidth: 140 }}
            data-ocid="skills.select"
          >
            <option value="">— Select from library —</option>
            {availableToAdd.map((lib) => (
              <option key={lib.id.toString()} value={lib.id.toString()}>
                {lib.name} ({lib.statBased})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={handleAddCustomSkill}
            disabled={!selectedCustomSkillId || addingCustom}
            style={{ flexShrink: 0 }}
            data-ocid="skills.primary_button"
          >
            {addingCustom ? "Adding..." : "Add"}
          </button>
        </div>

        {customCharSkills.length === 0 ? (
          <p
            style={{
              color: "var(--ds-muted)",
              fontSize: 13,
              textAlign: "center",
              padding: "12px 0",
            }}
            data-ocid="skills.empty_state"
          >
            No custom skills added yet. Create custom skills in Settings, then
            add them here.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {customCharSkills.map((skill, idx) => {
              const libEntry = customSkillLibrary.find(
                (l) => l.name === skill.skillName,
              );
              const isSaving = saving === skill.skillName;
              return (
                <div
                  key={skill.id.toString()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "5px 6px",
                    borderRadius: 5,
                    backgroundColor:
                      idx % 2 === 0 ? "transparent" : "var(--ds-surface2)",
                  }}
                  data-ocid={`skills.custom.item.${idx + 1}`}
                >
                  {libEntry && (
                    <span
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 10,
                        fontWeight: 700,
                        minWidth: 30,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {libEntry.statBased}
                    </span>
                  )}
                  <span
                    style={{ flex: 1, color: "var(--ds-text)", fontSize: 14 }}
                  >
                    {skill.skillName}
                  </span>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={skill.proficient}
                      onChange={() =>
                        toggleSkillField(
                          skill.skillName,
                          "proficient",
                          skill.proficient,
                        )
                      }
                      disabled={isSaving}
                      style={{ accentColor: "var(--ds-gold)" }}
                    />
                    <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                      Prof
                    </span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={skill.expertise}
                      onChange={() =>
                        toggleSkillField(
                          skill.skillName,
                          "expertise",
                          skill.expertise,
                        )
                      }
                      disabled={isSaving}
                      style={{ accentColor: "var(--ds-gold)" }}
                    />
                    <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                      Exp
                    </span>
                  </label>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      color: "#c0392b",
                    }}
                    onClick={() => handleDeleteCustomSkill(skill)}
                    data-ocid={`skills.delete_button.${idx + 1}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Note */}
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12, padding: "4px 8px", marginBottom: 8 }}
          onClick={() => setNoteOpen((o) => !o)}
          data-ocid="skills.toggle"
        >
          {noteOpen ? "▾" : "▸"} Tab Notes{" "}
          {noteSaving && (
            <span
              style={{ color: "var(--ds-gold)", marginLeft: 6, fontSize: 11 }}
            >
              Saving...
            </span>
          )}
        </button>
        {noteOpen && (
          <textarea
            className="ds-input"
            value={noteContent}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Notes for this tab..."
            rows={4}
            style={{ resize: "vertical" }}
            data-ocid="skills.textarea"
          />
        )}
      </div>
    </div>
  );
}

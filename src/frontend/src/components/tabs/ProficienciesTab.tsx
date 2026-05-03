import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterProficiency, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const PROF_TYPES = [
  "skill",
  "weapon",
  "armor",
  "tool",
  "language",
  "other",
] as const;
type ProfType = (typeof PROF_TYPES)[number];

const PROF_TYPE_LABELS: Record<ProfType, string> = {
  skill: "Skills",
  weapon: "Weapons",
  armor: "Armor",
  tool: "Tools",
  language: "Languages",
  other: "Other",
};

const PROF_TYPE_COLORS: Record<ProfType, string> = {
  skill: "#4a9eca",
  weapon: "#c97d3a",
  armor: "#5cbf7c",
  tool: "#bf9c4a",
  language: "#7c5cbf",
  other: "#9ca3af",
};

export default function ProficienciesTab({ actor, characterId }: Props) {
  const [proficiencies, setProficiencies] = useState<CharacterProficiency[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ profType: "skill" as ProfType, name: "" });
  const [adding, setAdding] = useState(false);

  // Tab note
  const [noteContent, setNoteContent] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        await actor.getCharacterProficienciesByCharacter(characterId);
      setProficiencies(result);
    } catch (e) {
      console.error("Failed to load proficiencies:", e);
      setProficiencies([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
    actor.getTabNote(characterId, "proficiencies").then((note) => {
      if (note) setNoteContent(note.content);
    });
  }, [load, actor, characterId]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setAdding(true);
    try {
      await actor.addCharacterProficiency(
        characterId,
        form.profType,
        form.name.trim(),
      );
      await load();
      setForm((p) => ({ ...p, name: "" }));
    } catch (err) {
      alert(`Failed to add proficiency: ${String(err)}`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Remove this proficiency?")) return;
    await actor.deleteCharacterProficiency(id);
    await load();
  };

  const handleNoteChange = (content: string) => {
    setNoteContent(content);
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(async () => {
      setNoteSaving(true);
      await actor.saveTabNote(characterId, "proficiencies", content);
      setNoteSaving(false);
    }, 800);
  };

  const grouped = PROF_TYPES.map((type) => ({
    type,
    items: proficiencies.filter((p) => p.profType === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div data-ocid="proficiencies.section">
      <h2
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 18, marginBottom: 16 }}
      >
        Proficiencies
      </h2>

      {/* Add proficiency form */}
      <div className="ds-card" style={{ padding: 16, marginBottom: 20 }}>
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 13, marginBottom: 12 }}
        >
          ADD PROFICIENCY
        </h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            className="ds-input"
            value={form.profType}
            onChange={(e) =>
              setForm((p) => ({ ...p, profType: e.target.value as ProfType }))
            }
            style={{ flex: "0 0 140px" }}
            data-ocid="proficiencies.select"
          >
            {PROF_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROF_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            className="ds-input"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="Proficiency name..."
            style={{ flex: 1, minWidth: 140 }}
            data-ocid="proficiencies.input"
          />
          <button
            type="button"
            className="ds-btn-primary"
            onClick={handleAdd}
            disabled={adding || !form.name.trim()}
            style={{ flexShrink: 0 }}
            data-ocid="proficiencies.submit_button"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* Grouped list */}
      {loading ? (
        <div
          style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
          data-ocid="proficiencies.loading_state"
        >
          Loading proficiencies...
        </div>
      ) : proficiencies.length === 0 ? (
        <div
          className="ds-card"
          style={{ padding: 32, textAlign: "center" }}
          data-ocid="proficiencies.empty_state"
        >
          <p style={{ color: "var(--ds-muted)" }}>
            No proficiencies recorded yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {grouped.map(({ type, items }) => (
            <div
              key={type}
              className="ds-card"
              style={{ padding: 14 }}
              data-ocid="proficiencies.panel"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    backgroundColor: PROF_TYPE_COLORS[type],
                    color: "#fff",
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 10,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  {PROF_TYPE_LABELS[type]}
                </span>
                <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  {items.length} {items.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {items.map((prof, idx) => (
                  <div
                    key={prof.id.toString()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "var(--ds-surface2)",
                      border: "1px solid var(--ds-border)",
                      borderRadius: 16,
                      padding: "4px 10px",
                      fontSize: 13,
                    }}
                    data-ocid={`proficiencies.item.${idx + 1}`}
                  >
                    <span style={{ color: "var(--ds-text)" }}>{prof.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(prof.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--ds-muted)",
                        cursor: "pointer",
                        fontSize: 13,
                        lineHeight: 1,
                        padding: "0 0 0 4px",
                      }}
                      title="Remove"
                      data-ocid={`proficiencies.delete_button.${idx + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Note */}
      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12, padding: "4px 8px", marginBottom: 8 }}
          onClick={() => setNoteOpen((o) => !o)}
          data-ocid="proficiencies.toggle"
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
            data-ocid="proficiencies.textarea"
          />
        )}
      </div>
    </div>
  );
}

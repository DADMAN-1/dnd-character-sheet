import { useCallback, useEffect, useRef, useState } from "react";
import type { DndBackend, Language } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const COMMON_LANGUAGES = [
  "Common",
  "Elvish",
  "Dwarvish",
  "Orcish",
  "Draconic",
  "Giant",
  "Gnomish",
  "Halfling",
  "Infernal",
  "Celestial",
  "Abyssal",
  "Deep Speech",
  "Undercommon",
  "Primordial",
  "Sylvan",
];

export default function LanguagesTab({ actor, characterId }: Props) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editValue, setEditValue] = useState("");

  // Tab note
  const [noteContent, setNoteContent] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await actor.getLanguagesByCharacter(characterId);
      setLanguages(result);
    } catch (e) {
      console.error("Failed to load languages:", e);
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
    actor.getTabNote(characterId, "languages").then((note) => {
      if (note) setNoteContent(note.content);
    });
  }, [load, actor, characterId]);

  const handleAdd = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await actor.addLanguage(characterId, trimmed);
      await load();
      setNewName("");
    } catch (err) {
      alert(`Failed to add language: ${String(err)}`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Remove this language?")) return;
    await actor.deleteLanguage(id);
    await load();
  };

  const startEdit = (lang: Language) => {
    setEditingId(lang.id);
    setEditValue(lang.name);
  };

  const saveEdit = async (id: bigint) => {
    if (!editValue.trim()) return;
    await actor.updateLanguage(id, editValue.trim());
    await load();
    setEditingId(null);
  };

  const knownNames = new Set(languages.map((l) => l.name.toLowerCase()));
  const quickAddOptions = COMMON_LANGUAGES.filter(
    (l) => !knownNames.has(l.toLowerCase()),
  );

  const handleNoteChange = (content: string) => {
    setNoteContent(content);
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(async () => {
      setNoteSaving(true);
      await actor.saveTabNote(characterId, "languages", content);
      setNoteSaving(false);
    }, 800);
  };

  return (
    <div data-ocid="languages.section">
      <h2
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 18, marginBottom: 16 }}
      >
        Languages
      </h2>

      {/* Add language */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          className="ds-input"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd(newName);
          }}
          placeholder="Add a language..."
          data-ocid="languages.input"
        />
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => handleAdd(newName)}
          disabled={adding || !newName.trim()}
          style={{ flexShrink: 0 }}
          data-ocid="languages.primary_button"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Quick-add chips */}
      {quickAddOptions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span className="ds-label" style={{ marginBottom: 8 }}>
            Quick Add
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {quickAddOptions.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleAdd(lang)}
                disabled={adding}
                style={{
                  background: "var(--ds-surface2)",
                  border: "1px solid var(--ds-border)",
                  color: "var(--ds-muted)",
                  borderRadius: 12,
                  padding: "3px 10px",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor =
                    "var(--ds-gold)";
                  (e.target as HTMLButtonElement).style.color =
                    "var(--ds-gold)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor =
                    "var(--ds-border)";
                  (e.target as HTMLButtonElement).style.color =
                    "var(--ds-muted)";
                }}
                data-ocid="languages.secondary_button"
              >
                + {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Language list */}
      {loading ? (
        <div
          style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
          data-ocid="languages.loading_state"
        >
          Loading languages...
        </div>
      ) : languages.length === 0 ? (
        <div
          className="ds-card"
          style={{ padding: 32, textAlign: "center" }}
          data-ocid="languages.empty_state"
        >
          <p style={{ color: "var(--ds-muted)" }}>No languages added yet.</p>
        </div>
      ) : (
        <div className="ds-card" style={{ padding: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {languages.map((lang, idx) => (
              <div
                key={lang.id.toString()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 6px",
                  borderRadius: 5,
                }}
                data-ocid={`languages.item.${idx + 1}`}
              >
                {editingId === lang.id ? (
                  <>
                    <input
                      className="ds-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(lang.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      style={{ flex: 1 }}
                      ref={(el) => {
                        if (el) el.focus();
                      }}
                      data-ocid="languages.input"
                    />
                    <button
                      type="button"
                      className="ds-btn-primary"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => saveEdit(lang.id)}
                      data-ocid={`languages.save_button.${idx + 1}`}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 12, padding: "4px 8px" }}
                      onClick={() => setEditingId(null)}
                      data-ocid={`languages.cancel_button.${idx + 1}`}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      style={{ flex: 1, color: "var(--ds-text)", fontSize: 14 }}
                    >
                      {lang.name}
                    </span>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 11, padding: "3px 8px" }}
                      onClick={() => startEdit(lang)}
                      data-ocid={`languages.edit_button.${idx + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        color: "#c0392b",
                      }}
                      onClick={() => handleDelete(lang.id)}
                      data-ocid={`languages.delete_button.${idx + 1}`}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Note */}
      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12, padding: "4px 8px", marginBottom: 8 }}
          onClick={() => setNoteOpen((o) => !o)}
          data-ocid="languages.toggle"
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
            data-ocid="languages.textarea"
          />
        )}
      </div>
    </div>
  );
}

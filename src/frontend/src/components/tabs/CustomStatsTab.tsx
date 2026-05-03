import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterCustomStat, CustomStat, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

export default function CustomStatsTab({ actor, characterId }: Props) {
  const [charStats, setCharStats] = useState<CharacterCustomStat[]>([]);
  const [library, setLibrary] = useState<CustomStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatId, setSelectedStatId] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Tab note
  const [noteContent, setNoteContent] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, lib] = await Promise.all([
        actor.getCharacterCustomStatsByCharacter(characterId),
        actor.getAllCustomStats(),
      ]);
      setCharStats(stats);
      setLibrary(lib);
    } catch (e) {
      console.error("Failed to load custom stats:", e);
      setCharStats([]);
      setLibrary([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
    actor.getTabNote(characterId, "customstats").then((note) => {
      if (note) setNoteContent(note.content);
    });
  }, [load, actor, characterId]);

  const availableToAdd = library.filter(
    (lib) => !charStats.some((s) => s.statId === lib.id),
  );

  const getLibEntry = (statId: bigint) => library.find((l) => l.id === statId);

  const handleAdd = async () => {
    if (!selectedStatId) return;
    const lib = library.find((l) => l.id.toString() === selectedStatId);
    if (!lib) return;
    setAdding(true);
    try {
      await actor.addCharacterCustomStat(
        characterId,
        lib.id,
        lib.name,
        lib.defaultValue,
      );
      await load();
      setSelectedStatId("");
    } catch (err) {
      alert(`Failed to add stat: ${String(err)}`);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (stat: CharacterCustomStat) => {
    setEditingId(stat.id);
    setEditValue(stat.value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async (id: bigint) => {
    setSaving(true);
    try {
      await actor.updateCharacterCustomStat(id, editValue);
      await load();
      setEditingId(null);
    } catch (err) {
      alert(`Failed to update stat: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (stat: CharacterCustomStat) => {
    if (!confirm(`Remove "${stat.statName}" from this character?`)) return;
    try {
      await actor.deleteCharacterCustomStat(stat.id);
      await load();
    } catch (err) {
      alert(`Failed to remove stat: ${String(err)}`);
    }
  };

  const handleNoteChange = (content: string) => {
    setNoteContent(content);
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(async () => {
      setNoteSaving(true);
      await actor.saveTabNote(characterId, "customstats", content);
      setNoteSaving(false);
    }, 800);
  };

  if (loading) {
    return (
      <div
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="customstats.loading_state"
      >
        Loading custom stats...
      </div>
    );
  }

  return (
    <div data-ocid="customstats.section">
      <h2
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 18, marginBottom: 16 }}
      >
        Custom Stats
      </h2>

      {/* Add from library */}
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
          ADD FROM LIBRARY
        </h3>
        {library.length === 0 ? (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No custom stats defined yet. Create them in Settings → Custom Stats.
          </p>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              className="ds-input"
              value={selectedStatId}
              onChange={(e) => setSelectedStatId(e.target.value)}
              style={{ flex: 1, minWidth: 140 }}
              data-ocid="customstats.select"
            >
              <option value="">— Select a stat —</option>
              {availableToAdd.map((lib) => (
                <option key={lib.id.toString()} value={lib.id.toString()}>
                  {lib.name}
                  {lib.defaultValue ? ` (default: ${lib.defaultValue})` : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={handleAdd}
              disabled={!selectedStatId || adding}
              style={{ flexShrink: 0 }}
              data-ocid="customstats.primary_button"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        )}
      </div>

      {/* Stat list */}
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
          CHARACTER STATS
        </h3>

        {charStats.length === 0 ? (
          <p
            style={{
              color: "var(--ds-muted)",
              fontSize: 13,
              textAlign: "center",
              padding: "12px 0",
            }}
            data-ocid="customstats.empty_state"
          >
            No custom stats added yet. Create them in Settings, then add them
            here.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {charStats.map((stat, idx) => {
              const libEntry = getLibEntry(stat.statId);
              const isEditing = editingId === stat.id;
              return (
                <div
                  key={stat.id.toString()}
                  className="ds-card2"
                  style={{ padding: "10px 14px" }}
                  data-ocid={`customstats.item.${idx + 1}`}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "var(--ds-text)",
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 2,
                        }}
                      >
                        {stat.statName}
                      </div>
                      {libEntry?.description && (
                        <div
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 12,
                            marginBottom: 6,
                          }}
                        >
                          {libEntry.description}
                        </div>
                      )}
                      {isEditing ? (
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          <input
                            className="ds-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{ flex: 1, minWidth: 120, fontSize: 13 }}
                            placeholder="Enter value..."
                            data-ocid={`customstats.input.${idx + 1}`}
                          />
                          <button
                            type="button"
                            className="ds-btn-primary"
                            onClick={() => handleSaveEdit(stat.id)}
                            disabled={saving}
                            style={{ fontSize: 12, padding: "4px 10px" }}
                            data-ocid={`customstats.save_button.${idx + 1}`}
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            className="ds-btn-ghost"
                            onClick={cancelEdit}
                            style={{ fontSize: 12, padding: "4px 10px" }}
                            data-ocid={`customstats.cancel_button.${idx + 1}`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 15,
                              fontWeight: 700,
                              backgroundColor: "rgba(201,163,90,0.1)",
                              padding: "2px 10px",
                              borderRadius: 8,
                              minWidth: 40,
                              textAlign: "center",
                            }}
                          >
                            {stat.value || "—"}
                          </span>
                        </div>
                      )}
                    </div>
                    {!isEditing && (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={() => startEdit(stat)}
                          data-ocid={`customstats.edit_button.${idx + 1}`}
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
                          onClick={() => handleDelete(stat)}
                          data-ocid={`customstats.delete_button.${idx + 1}`}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
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
          data-ocid="customstats.toggle"
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
            data-ocid="customstats.textarea"
          />
        )}
      </div>
    </div>
  );
}

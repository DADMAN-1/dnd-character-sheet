import { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "../../hooks/useSearch";
import type { CharacterFeat, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const EMPTY_FORM = { name: "", description: "" };

export default function FeatsTab({ actor, characterId }: Props) {
  const [feats, setFeats] = useState<CharacterFeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CharacterFeat | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Tab note
  const [noteContent, setNoteContent] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await actor.getCharacterFeatsByCharacter(characterId);
      setFeats(result);
    } catch (e) {
      console.error("Failed to load feats:", e);
      setFeats([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
    actor.getTabNote(characterId, "feats").then((note) => {
      if (note) setNoteContent(note.content);
    });
  }, [load, actor, characterId]);

  const filteredFeats = useSearch(feats, searchQuery, ["name", "description"]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (feat: CharacterFeat) => {
    setEditing(feat);
    setForm({ name: feat.name, description: feat.description });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await actor.updateCharacterFeat(
          editing.id,
          form.name,
          form.description,
        );
      } else {
        await actor.addCharacterFeat(characterId, form.name, form.description);
      }
      await load();
      setShowForm(false);
    } catch (err) {
      alert(`Failed to save feat: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this feat?")) return;
    await actor.deleteCharacterFeat(id);
    await load();
  };

  const handleNoteChange = (content: string) => {
    setNoteContent(content);
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(async () => {
      setNoteSaving(true);
      await actor.saveTabNote(characterId, "feats", content);
      setNoteSaving(false);
    }, 800);
  };

  return (
    <div data-ocid="feats.section">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 18 }}
        >
          Feats
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={openNew}
          data-ocid="feats.primary_button"
        >
          + Add Feat
        </button>
      </div>

      {/* Search */}
      <input
        className="ds-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search feats..."
        style={{ marginBottom: 14 }}
        data-ocid="feats.search_input"
      />

      {/* List */}
      {loading ? (
        <div
          style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
          data-ocid="feats.loading_state"
        >
          Loading feats...
        </div>
      ) : filteredFeats.length === 0 ? (
        <div
          className="ds-card"
          style={{ padding: 32, textAlign: "center" }}
          data-ocid="feats.empty_state"
        >
          <p style={{ color: "var(--ds-muted)", marginBottom: 12 }}>
            {feats.length === 0
              ? "No feats yet. Add your first feat!"
              : "No feats match your search."}
          </p>
          {feats.length === 0 && (
            <button type="button" className="ds-btn-ghost" onClick={openNew}>
              + Add Your First Feat
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredFeats.map((feat, idx) => (
            <div
              key={feat.id.toString()}
              className="ds-card"
              style={{ padding: 14, borderLeft: "3px solid var(--ds-gold)" }}
              data-ocid={`feats.item.${idx + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    className="font-cinzel"
                    style={{
                      color: "var(--ds-text)",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {feat.name}
                  </span>
                  {feat.description && (
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 13,
                        marginTop: 6,
                        lineHeight: 1.5,
                        margin: "6px 0 0",
                      }}
                    >
                      {feat.description}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11, padding: "3px 8px" }}
                    onClick={() => openEdit(feat)}
                    data-ocid={`feats.edit_button.${idx + 1}`}
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
                    onClick={() => handleDelete(feat.id)}
                    data-ocid={`feats.delete_button.${idx + 1}`}
                  >
                    Delete
                  </button>
                </div>
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
          data-ocid="feats.toggle"
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
            data-ocid="feats.textarea"
          />
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          data-ocid="feats.modal"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 480,
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
              <h3
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 18 }}
              >
                {editing ? "Edit Feat" : "Add Feat"}
              </h3>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ds-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
                onClick={() => setShowForm(false)}
                data-ocid="feats.close_button"
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Feat Name *</span>
                <input
                  className="ds-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. War Caster"
                  data-ocid="feats.input"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Description</span>
                <textarea
                  className="ds-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Describe this feat..."
                  rows={4}
                  style={{ resize: "vertical" }}
                  data-ocid="feats.editor"
                />
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setShowForm(false)}
                data-ocid="feats.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                data-ocid="feats.submit_button"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Feat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

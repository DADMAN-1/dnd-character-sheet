import { useCallback, useEffect, useRef, useState } from "react";
import type { Ally, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const EMPTY_FORM = { name: "", relationship: "", notes: "" };

export default function AlliesTab({ actor, characterId }: Props) {
  const [allies, setAllies] = useState<Ally[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ally | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<bigint | null>(null);

  // Tab note
  const [noteContent, setNoteContent] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await actor.getAlliesByCharacter(characterId);
      setAllies(result);
    } catch (e) {
      console.error("Failed to load allies:", e);
      setAllies([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
    actor.getTabNote(characterId, "allies").then((note) => {
      if (note) setNoteContent(note.content);
    });
  }, [load, actor, characterId]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (ally: Ally) => {
    setEditing(ally);
    setForm({
      name: ally.name,
      relationship: ally.relationship,
      notes: ally.notes,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await actor.updateAlly(
          editing.id,
          form.name,
          form.relationship,
          form.notes,
        );
      } else {
        await actor.addAlly(
          characterId,
          form.name,
          form.relationship,
          form.notes,
        );
      }
      await load();
      setShowForm(false);
    } catch (err) {
      alert(`Failed to save ally: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Remove this ally/organization?")) return;
    await actor.deleteAlly(id);
    await load();
  };

  const handleNoteChange = (content: string) => {
    setNoteContent(content);
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(async () => {
      setNoteSaving(true);
      await actor.saveTabNote(characterId, "allies", content);
      setNoteSaving(false);
    }, 800);
  };

  const f = (field: keyof typeof EMPTY_FORM, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  return (
    <div data-ocid="allies.section">
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
          Allies & Organizations
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={openNew}
          data-ocid="allies.primary_button"
        >
          + Add Ally
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div
          style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
          data-ocid="allies.loading_state"
        >
          Loading allies...
        </div>
      ) : allies.length === 0 ? (
        <div
          className="ds-card"
          style={{ padding: 32, textAlign: "center" }}
          data-ocid="allies.empty_state"
        >
          <p style={{ color: "var(--ds-muted)", marginBottom: 12 }}>
            No allies or organizations recorded yet.
          </p>
          <button type="button" className="ds-btn-ghost" onClick={openNew}>
            + Add Your First Ally
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {allies.map((ally, idx) => {
            const isExpanded = expandedId === ally.id;
            return (
              <div
                key={ally.id.toString()}
                className="ds-card"
                style={{ padding: 14 }}
                data-ocid={`allies.item.${idx + 1}`}
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        className="font-cinzel"
                        style={{
                          color: "var(--ds-text)",
                          fontSize: 15,
                          fontWeight: 600,
                        }}
                      >
                        {ally.name}
                      </span>
                      {ally.relationship && (
                        <span
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 12,
                            border: "1px solid var(--ds-border)",
                            borderRadius: 6,
                            padding: "1px 7px",
                          }}
                        >
                          {ally.relationship}
                        </span>
                      )}
                    </div>
                    {ally.notes && (
                      <div style={{ marginTop: 6 }}>
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--ds-gold)",
                            fontSize: 12,
                            cursor: "pointer",
                            padding: 0,
                          }}
                          onClick={() =>
                            setExpandedId(isExpanded ? null : ally.id)
                          }
                          data-ocid={`allies.toggle.${idx + 1}`}
                        >
                          {isExpanded ? "▾ Hide notes" : "▸ Show notes"}
                        </button>
                        {isExpanded && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 13,
                              marginTop: 6,
                              lineHeight: 1.5,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {ally.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 11, padding: "3px 8px" }}
                      onClick={() => openEdit(ally)}
                      data-ocid={`allies.edit_button.${idx + 1}`}
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
                      onClick={() => handleDelete(ally.id)}
                      data-ocid={`allies.delete_button.${idx + 1}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Note */}
      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12, padding: "4px 8px", marginBottom: 8 }}
          onClick={() => setNoteOpen((o) => !o)}
          data-ocid="allies.toggle"
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
            data-ocid="allies.textarea"
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
          data-ocid="allies.modal"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 500,
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
                {editing ? "Edit Ally" : "Add Ally"}
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
                data-ocid="allies.close_button"
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Name *</span>
                <input
                  className="ds-input"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  placeholder="e.g. Gandalf, Order of the Gauntlet"
                  data-ocid="allies.input"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Relationship</span>
                <input
                  className="ds-input"
                  value={form.relationship}
                  onChange={(e) => f("relationship", e.target.value)}
                  placeholder="e.g. Mentor, Rival, Ally, Enemy"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Notes</span>
                <textarea
                  className="ds-input"
                  value={form.notes}
                  onChange={(e) => f("notes", e.target.value)}
                  placeholder="Background, history, location..."
                  rows={4}
                  style={{ resize: "vertical" }}
                  data-ocid="allies.editor"
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
                data-ocid="allies.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                data-ocid="allies.submit_button"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Ally"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

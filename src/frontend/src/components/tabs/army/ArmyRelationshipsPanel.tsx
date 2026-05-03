import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../../../components/ErrorBoundary";
import type { ArmyRelationship, DndBackend } from "../../../types";
import { uid } from "./armyHelpers";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const RELATIONSHIP_TYPES = [
  "Allied",
  "Neutral",
  "Hostile",
  "At War",
  "Vassal",
  "Overlord",
];

const REL_COLORS: Record<string, { bg: string; text: string; border: string }> =
  {
    Allied: { bg: "#27ae6022", text: "#27ae60", border: "#27ae6055" },
    Neutral: {
      bg: "var(--ds-surface2)",
      text: "var(--ds-muted)",
      border: "var(--ds-border)",
    },
    Hostile: { bg: "#e67e2222", text: "#e67e22", border: "#e67e2255" },
    "At War": { bg: "#c0392b22", text: "#c0392b", border: "#c0392b55" },
    Vassal: { bg: "#8e44ad22", text: "#8e44ad", border: "#8e44ad55" },
    Overlord: {
      bg: "#c9a35a22",
      text: "var(--ds-gold)",
      border: "var(--ds-gold)",
    },
  };

const emptyForm = (): Omit<ArmyRelationship, "id"> => ({
  armyName: "",
  relationship: "Neutral",
  notes: "",
});

export default function ArmyRelationshipsPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [relationships, setRelationships] = useState<ArmyRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getArmyRelationships(armyId);
      setRelationships(data ?? []);
    } catch (e) {
      console.error(e);
      if (isCanisterStopped(e)) setCanisterStopped(true);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (updated: ArmyRelationship[]) => {
    setSaving(true);
    setError(null);
    try {
      await actor.updateArmyRelationships(armyId, updated);
      setRelationships(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
    setSaving(false);
  };

  const handleAdd = async () => {
    if (!form.armyName.trim()) return;
    const updated = [...relationships, { ...form, id: uid() }];
    await save(updated);
    if (!error) {
      setForm(emptyForm());
      setAdding(false);
    }
  };

  const handleEdit = (rel: ArmyRelationship) => {
    setEditingId(rel.id);
    setForm({
      armyName: rel.armyName,
      relationship: rel.relationship,
      notes: rel.notes,
    });
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const updated = relationships.map((r) =>
      r.id === editingId ? { ...r, ...form } : r,
    );
    await save(updated);
    if (!error) {
      setEditingId(null);
      setForm(emptyForm());
    }
  };

  const handleDelete = async (id: string) => {
    const updated = relationships.filter((r) => r.id !== id);
    await save(updated);
  };

  if (loading) {
    return (
      <p
        style={{ color: "var(--ds-muted)", fontSize: 13 }}
        data-ocid="army.relationships.loading_state"
      >
        Loading relationships…
      </p>
    );
  }

  if (canisterStopped) {
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15 }}
        >
          Army Relationships
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => {
            setAdding(true);
            setEditingId(null);
          }}
          data-ocid="army.relationships.open_modal_button"
        >
          + Add Relationship
        </button>
      </div>

      {saving && (
        <p style={{ color: "var(--ds-muted)", fontSize: 12 }}>Saving…</p>
      )}
      {error && (
        <p
          style={{ color: "#c0392b", fontSize: 12 }}
          data-ocid="army.relationships.error_state"
        >
          {error}
        </p>
      )}

      {(adding || editingId) && (
        <div
          className="ds-card2"
          style={{
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <div>
              <label htmlFor="rel-name" className="ds-label">
                Army Name *
              </label>
              <input
                id="rel-name"
                className="ds-input"
                value={form.armyName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, armyName: e.target.value }))
                }
                placeholder="Name of the other army"
                style={{ fontSize: 13 }}
                data-ocid="army.relationships.name.input"
              />
            </div>
            <div>
              <label htmlFor="rel-type" className="ds-label">
                Relationship
              </label>
              <select
                id="rel-type"
                className="ds-input"
                value={form.relationship}
                onChange={(e) =>
                  setForm((f) => ({ ...f, relationship: e.target.value }))
                }
                style={{ fontSize: 13 }}
                data-ocid="army.relationships.type.select"
              >
                {RELATIONSHIP_TYPES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            className="ds-input"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Context, treaties, history…"
            style={{ fontSize: 13, resize: "vertical" }}
            data-ocid="army.relationships.notes.textarea"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={editingId ? handleEditSave : handleAdd}
              data-ocid="army.relationships.submit_button"
            >
              {editingId ? "Save Changes" : "Add"}
            </button>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={() => {
                setAdding(false);
                setEditingId(null);
                setForm(emptyForm());
                setError(null);
              }}
              data-ocid="army.relationships.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {relationships.length === 0 && !adding && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--ds-muted)",
            fontSize: 13,
          }}
          data-ocid="army.relationships.empty_state"
        >
          No relationships tracked. Add one to record ally, neutral, or hostile
          armies.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {relationships.map((rel, idx) => {
          const style = REL_COLORS[rel.relationship] ?? REL_COLORS.Neutral;
          return (
            <div
              key={rel.id}
              className="ds-card2"
              style={{
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
              }}
              data-ocid={`army.relationships.item.${idx + 1}`}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: rel.notes ? 4 : 0,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--ds-text)",
                      fontSize: 13,
                    }}
                  >
                    {rel.armyName}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: style.bg,
                      color: style.text,
                      border: `1px solid ${style.border}`,
                      fontWeight: 600,
                    }}
                  >
                    {rel.relationship}
                  </span>
                </div>
                {rel.notes && (
                  <p
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 12,
                      margin: 0,
                    }}
                  >
                    {rel.notes}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 11, padding: "2px 6px" }}
                  onClick={() => handleEdit(rel)}
                  data-ocid={`army.relationships.edit_button.${idx + 1}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
                  onClick={() => handleDelete(rel.id)}
                  data-ocid={`army.relationships.delete_button.${idx + 1}`}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

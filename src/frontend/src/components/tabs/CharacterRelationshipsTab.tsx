import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { CharacterRelationship, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const REL_TYPES = [
  "Bond",
  "Ideal",
  "Flaw",
  "Ally",
  "Rival",
  "Enemy",
  "Mentor",
  "Protégé",
  "Romantic",
  "Family",
  "Other",
];

const REL_COLORS: Record<string, string> = {
  Bond: "#3498db",
  Ideal: "#27ae60",
  Flaw: "#e74c3c",
  Ally: "#27ae60",
  Rival: "var(--ds-gold)",
  Enemy: "#e74c3c",
  Mentor: "#9b59b6",
  Protégé: "#2ecc71",
  Romantic: "#e91e63",
  Family: "#3498db",
  Other: "var(--ds-muted)",
};

export default function CharacterRelationshipsTab({
  actor,
  characterId,
}: Props) {
  const [items, setItems] = useState<CharacterRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CharacterRelationship | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getCharacterRelationships(characterId.toString()));
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = (): CharacterRelationship => ({
    id: BigInt(Date.now()),
    characterId: characterId.toString(),
    relatedCharacterName: "",
    relationshipType: "Bond",
    notes: "",
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    if (!editing.relatedCharacterName.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isNew) await actor.addCharacterRelationship(editing);
      else await actor.updateCharacterRelationship(editing);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
    setSaving(false);
  };

  const del = async (id: bigint) => {
    if (!confirm("Delete this relationship?")) return;
    try {
      await actor.deleteCharacterRelationship(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof CharacterRelationship, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  return (
    <div>
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
          💞 Character Relationships
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => {
            setEditing(blank());
            setIsNew(true);
            setError(null);
          }}
          data-ocid="character.relationships.add_button"
        >
          + Add Relationship
        </button>
      </div>

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="character.relationships.loading_state"
        >
          Loading…
        </p>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="character.relationships.empty_state"
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>💞</div>
          <p>
            No relationships recorded. Document your character's bonds, rivals,
            and connections.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((rel, idx) => (
            <div
              key={rel.id}
              className="ds-card"
              style={{ padding: 16 }}
              data-ocid={`character.relationships.item.${idx + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div>
                  <p
                    className="font-cinzel"
                    style={{
                      color: "var(--ds-text)",
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                  >
                    {rel.relatedCharacterName}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: `1px solid ${REL_COLORS[rel.relationshipType] ?? "var(--ds-muted)"}`,
                      color:
                        REL_COLORS[rel.relationshipType] ?? "var(--ds-muted)",
                    }}
                  >
                    {rel.relationshipType}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => {
                      setEditing({ ...rel });
                      setIsNew(false);
                      setError(null);
                    }}
                    data-ocid={`character.relationships.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => del(rel.id)}
                    data-ocid={`character.relationships.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {rel.notes && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ds-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {rel.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
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
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
          onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
          role="presentation"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 480,
              padding: 24,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 16 }}
              >
                {isNew ? "Add Relationship" : "Edit Relationship"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="character.relationships.close_button"
              >
                ✕
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="ds-label">Person's Name *</div>
                <input
                  className="ds-input"
                  value={editing.relatedCharacterName}
                  onChange={(e) => set("relatedCharacterName", e.target.value)}
                  placeholder="NPC, character, or creature name"
                  data-ocid="character.relationships.name.input"
                />
              </div>
              <div>
                <div className="ds-label">Relationship Type</div>
                <select
                  className="ds-input"
                  value={editing.relationshipType}
                  onChange={(e) => set("relationshipType", e.target.value)}
                  data-ocid="character.relationships.type.select"
                >
                  {REL_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="ds-label">Notes</div>
                <textarea
                  className="ds-input"
                  rows={4}
                  value={editing.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="How do you know them? What's the history?"
                  data-ocid="character.relationships.notes.textarea"
                />
              </div>
              {error && (
                <p
                  style={{ color: "#e74c3c", fontSize: 12 }}
                  data-ocid="character.relationships.error_state"
                >
                  {error}
                </p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="character.relationships.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="character.relationships.save_button"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

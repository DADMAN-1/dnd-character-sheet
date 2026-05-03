import { useState } from "react";
import type { ArmyAbility } from "../../../types";

interface Props {
  abilities: ArmyAbility[];
  onChange: (abilities: ArmyAbility[]) => void;
  title?: string;
  ocidPrefix: string;
}

const genId = () =>
  `${Date.now().toString()}-${Math.random().toString(36).slice(2)}`;

const emptyAbility = (): ArmyAbility => ({
  id: genId(),
  name: "",
  description: "",
  cost: "",
  effect: "",
});

export default function ArmyAbilityList({
  abilities,
  onChange,
  title = "Abilities",
  ocidPrefix,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ArmyAbility>(emptyAbility());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ArmyAbility>(emptyAbility());

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onChange([...abilities, { ...form, id: genId() }]);
    setForm(emptyAbility());
    setAdding(false);
  };

  const startEdit = (a: ArmyAbility) => {
    setEditingId(a.id);
    setEditForm({ ...a });
  };

  const saveEdit = () => {
    onChange(abilities.map((a) => (a.id === editingId ? editForm : a)));
    setEditingId(null);
  };

  const remove = (id: string) => {
    if (!confirm("Remove this ability?")) return;
    onChange(abilities.filter((a) => a.id !== id));
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 13 }}
        >
          {title}
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 11, padding: "2px 8px" }}
          onClick={() => setAdding(true)}
          data-ocid={`${ocidPrefix}.open_modal_button`}
        >
          + Add
        </button>
      </div>

      {abilities.length === 0 && (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 12 }}
          data-ocid={`${ocidPrefix}.empty_state`}
        >
          No abilities yet.
        </p>
      )}

      {abilities.map((a, idx) => (
        <div
          key={a.id}
          className="ds-card2"
          style={{ padding: "8px 12px", marginBottom: 6 }}
          data-ocid={`${ocidPrefix}.item.${idx + 1}`}
        >
          {editingId === a.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input
                className="ds-input"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ability name"
                style={{ fontSize: 13 }}
              />
              <textarea
                className="ds-input"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                rows={2}
                style={{ fontSize: 12, resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="ds-input"
                  value={editForm.cost}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, cost: e.target.value }))
                  }
                  placeholder="Cost/Cooldown"
                  style={{ fontSize: 12 }}
                />
                <input
                  className="ds-input"
                  value={editForm.effect}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, effect: e.target.value }))
                  }
                  placeholder="Effect"
                  style={{ fontSize: 12 }}
                />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={saveEdit}
                  data-ocid={`${ocidPrefix}.save_button.${idx + 1}`}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => setEditingId(null)}
                  data-ocid={`${ocidPrefix}.cancel_button.${idx + 1}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "var(--ds-text)",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {a.name}
                  {a.cost && (
                    <span
                      style={{
                        color: "var(--ds-gold)",
                        fontSize: 11,
                        marginLeft: 6,
                      }}
                    >
                      [{a.cost}]
                    </span>
                  )}
                </div>
                {a.description && (
                  <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                    {a.description}
                  </div>
                )}
                {a.effect && (
                  <div style={{ color: "var(--ds-text)", fontSize: 12 }}>
                    <strong>Effect:</strong> {a.effect}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 11, padding: "2px 6px" }}
                  onClick={() => startEdit(a)}
                  data-ocid={`${ocidPrefix}.edit_button.${idx + 1}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
                  onClick={() => remove(a.id)}
                  data-ocid={`${ocidPrefix}.delete_button.${idx + 1}`}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding && (
        <div
          className="ds-card2"
          style={{
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <input
            className="ds-input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ability name *"
            style={{ fontSize: 13 }}
          />
          <textarea
            className="ds-input"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Description"
            rows={2}
            style={{ fontSize: 12, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="ds-input"
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              placeholder="Cost/Cooldown"
              style={{ fontSize: 12 }}
            />
            <input
              className="ds-input"
              value={form.effect}
              onChange={(e) =>
                setForm((f) => ({ ...f, effect: e.target.value }))
              }
              placeholder="Effect"
              style={{ fontSize: 12 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12, padding: "4px 10px" }}
              onClick={handleAdd}
              data-ocid={`${ocidPrefix}.submit_button`}
            >
              Add Ability
            </button>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12, padding: "4px 10px" }}
              onClick={() => setAdding(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

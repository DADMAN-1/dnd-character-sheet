import { useState } from "react";
import type { ArmyMachinery } from "../../../types";
import { uid } from "./armyHelpers";

interface Props {
  machinery: ArmyMachinery[];
  onChange: (machinery: ArmyMachinery[]) => void;
}

const CONDITION_OPTIONS = [
  "Operational",
  "Damaged",
  "Under Repair",
  "Destroyed",
];

const empty = (): Omit<ArmyMachinery, "id"> => ({
  name: "",
  machineryType: "",
  condition: "Operational",
  crewSize: 0n,
  damageEffect: "",
  notes: "",
});

export default function ArmyMachineryPanel({ machinery, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<ArmyMachinery, "id">>(empty());
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ArmyMachinery>({
    id: "",
    ...empty(),
  });

  const add = () => {
    if (!form.name.trim()) return;
    onChange([...machinery, { ...form, id: uid() }]);
    setForm(empty());
    setAdding(false);
  };

  const saveEdit = () => {
    onChange(machinery.map((m) => (m.id === editId ? editForm : m)));
    setEditId(null);
  };

  const remove = (id: string) => {
    if (!confirm("Remove this machinery?")) return;
    onChange(machinery.filter((m) => m.id !== id));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 14 }}
        >
          Machinery & Equipment
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setAdding(true)}
          data-ocid="army.machinery.open_modal_button"
        >
          + Add
        </button>
      </div>

      {machinery.length === 0 && !adding && (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 13 }}
          data-ocid="army.machinery.empty_state"
        >
          No machinery yet. Add catapults, war wagons, golems, etc.
        </p>
      )}

      {machinery.map((m, idx) => (
        <div
          key={m.id}
          className="ds-card2"
          style={{ padding: "8px 12px", marginBottom: 6 }}
          data-ocid={`army.machinery.item.${idx + 1}`}
        >
          {editId === m.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 6,
                }}
              >
                <input
                  className="ds-input"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Name"
                  style={{ fontSize: 13 }}
                />
                <input
                  className="ds-input"
                  value={editForm.machineryType}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      machineryType: e.target.value,
                    }))
                  }
                  placeholder="Type (e.g. Catapult)"
                  style={{ fontSize: 13 }}
                />
                <select
                  className="ds-input"
                  value={editForm.condition}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, condition: e.target.value }))
                  }
                  style={{ fontSize: 13 }}
                >
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  className="ds-input"
                  type="number"
                  value={editForm.crewSize.toString()}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      crewSize: BigInt(e.target.value || 0),
                    }))
                  }
                  placeholder="Crew size"
                  style={{ fontSize: 13 }}
                />
                <input
                  className="ds-input"
                  value={editForm.damageEffect}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, damageEffect: e.target.value }))
                  }
                  placeholder="Damage / effect"
                  style={{ fontSize: 13, gridColumn: "span 2" }}
                />
              </div>
              <input
                className="ds-input"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Notes"
                style={{ fontSize: 12 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ fontSize: 12 }}
                  onClick={saveEdit}
                  data-ocid={`army.machinery.save_button.${idx + 1}`}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 12 }}
                  onClick={() => setEditId(null)}
                  data-ocid={`army.machinery.cancel_button.${idx + 1}`}
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
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--ds-text)",
                    fontSize: 13,
                  }}
                >
                  {m.name}
                </span>
                {m.machineryType && (
                  <span
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 12,
                      marginLeft: 6,
                    }}
                  >
                    ({m.machineryType})
                  </span>
                )}
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color:
                      m.condition === "Destroyed"
                        ? "#c0392b"
                        : "var(--ds-muted)",
                  }}
                >
                  · {m.condition}
                </span>
                {m.crewSize > 0n && (
                  <span
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 12,
                      marginLeft: 6,
                    }}
                  >
                    · Crew: {m.crewSize.toString()}
                  </span>
                )}
                {m.damageEffect && (
                  <div
                    style={{
                      color: "var(--ds-text)",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {m.damageEffect}
                  </div>
                )}
                {m.notes && (
                  <div
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {m.notes}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 11, padding: "2px 6px" }}
                  onClick={() => {
                    setEditId(m.id);
                    setEditForm({ ...m });
                  }}
                  data-ocid={`army.machinery.edit_button.${idx + 1}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
                  onClick={() => remove(m.id)}
                  data-ocid={`army.machinery.delete_button.${idx + 1}`}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
            }}
          >
            <input
              className="ds-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Name *"
              style={{ fontSize: 13 }}
              data-ocid="army.machinery.name.input"
            />
            <input
              className="ds-input"
              value={form.machineryType}
              onChange={(e) =>
                setForm((f) => ({ ...f, machineryType: e.target.value }))
              }
              placeholder="Type (Catapult, Golem…)"
              style={{ fontSize: 13 }}
            />
            <select
              className="ds-input"
              value={form.condition}
              onChange={(e) =>
                setForm((f) => ({ ...f, condition: e.target.value }))
              }
              style={{ fontSize: 13 }}
            >
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className="ds-input"
              type="number"
              value={form.crewSize.toString()}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  crewSize: BigInt(e.target.value || 0),
                }))
              }
              placeholder="Crew size"
              style={{ fontSize: 13 }}
            />
            <input
              className="ds-input"
              value={form.damageEffect}
              onChange={(e) =>
                setForm((f) => ({ ...f, damageEffect: e.target.value }))
              }
              placeholder="Damage / effect"
              style={{ fontSize: 13, gridColumn: "span 2" }}
            />
          </div>
          <input
            className="ds-input"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes"
            style={{ fontSize: 12 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={add}
              data-ocid="army.machinery.submit_button"
            >
              Add
            </button>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
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

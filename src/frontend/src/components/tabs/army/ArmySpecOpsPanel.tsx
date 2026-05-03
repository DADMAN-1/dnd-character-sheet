import { useState } from "react";
import type { ArmyAbility, ArmyOfficer, SpecOpsGroup } from "../../../types";
import ArmyAbilityList from "./ArmyAbilityList";
import { uid } from "./armyHelpers";

interface Props {
  groups: SpecOpsGroup[];
  officers: ArmyOfficer[];
  onChange: (groups: SpecOpsGroup[]) => void;
}

const CONDITION_OPTIONS = [
  "Rested",
  "Fatigued",
  "Battered",
  "Compromised",
  "Disbanded",
];

const emptyGroup = (): Omit<SpecOpsGroup, "id"> => ({
  name: "",
  missionType: "",
  headcount: 0n,
  condition: "Rested",
  officerIds: [],
  abilities: [],
  equipmentNotes: "",
  notes: "",
});

export default function ArmySpecOpsPanel({
  groups,
  officers,
  onChange,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const addGroup = () => {
    if (!newName.trim()) return;
    const g: SpecOpsGroup = {
      ...emptyGroup(),
      id: uid(),
      name: newName.trim(),
    };
    onChange([...groups, g]);
    setNewName("");
    setAdding(false);
    setExpandedId(g.id);
  };

  const update = (id: string, updates: Partial<SpecOpsGroup>) => {
    onChange(groups.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const remove = (id: string) => {
    if (!confirm("Delete this spec ops group?")) return;
    onChange(groups.filter((g) => g.id !== id));
  };

  const toggleOfficer = (groupId: string, officerId: string) => {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    const ids = g.officerIds.includes(officerId)
      ? g.officerIds.filter((id) => id !== officerId)
      : [...g.officerIds, officerId];
    update(groupId, { officerIds: ids });
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
          Spec Ops Groups
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setAdding(true)}
          data-ocid="army.specops.open_modal_button"
        >
          + Add Group
        </button>
      </div>

      {groups.length === 0 && !adding && (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 13 }}
          data-ocid="army.specops.empty_state"
        >
          No spec ops groups. Create elite units for special missions.
        </p>
      )}

      {groups.map((g, idx) => (
        <div
          key={g.id}
          className="ds-card2"
          style={{ marginBottom: 8 }}
          data-ocid={`army.specops.item.${idx + 1}`}
        >
          <button
            type="button"
            style={{
              padding: "10px 14px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "none",
              border: "none",
              width: "100%",
              textAlign: "left",
            }}
            onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
          >
            <div>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--ds-gold)",
                  fontSize: 14,
                }}
              >
                ⚡ {g.name}
              </span>
              <span
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 12,
                  marginLeft: 8,
                }}
              >
                {g.missionType && `${g.missionType} · `}
                {g.headcount.toString()} operatives · {g.condition}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(g.id);
                }}
                data-ocid={`army.specops.delete_button.${idx + 1}`}
              >
                ✕
              </button>
              <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                {expandedId === g.id ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {expandedId === g.id && (
            <div
              style={{
                padding: "0 14px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                <div>
                  <label htmlFor={`spec-name-${g.id}`} className="ds-label">
                    Group Name
                  </label>
                  <input
                    id={`spec-name-${g.id}`}
                    className="ds-input"
                    value={g.name}
                    onChange={(e) => update(g.id, { name: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor={`spec-mission-${g.id}`} className="ds-label">
                    Mission Type
                  </label>
                  <input
                    id={`spec-mission-${g.id}`}
                    className="ds-input"
                    value={g.missionType}
                    onChange={(e) =>
                      update(g.id, { missionType: e.target.value })
                    }
                    placeholder="e.g. Assassination, Recon"
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor={`spec-hc-${g.id}`} className="ds-label">
                    Operatives
                  </label>
                  <input
                    id={`spec-hc-${g.id}`}
                    className="ds-input"
                    type="number"
                    value={g.headcount.toString()}
                    onChange={(e) =>
                      update(g.id, { headcount: BigInt(e.target.value || 0) })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor={`spec-cond-${g.id}`} className="ds-label">
                    Condition
                  </label>
                  <select
                    id={`spec-cond-${g.id}`}
                    className="ds-input"
                    value={g.condition}
                    onChange={(e) =>
                      update(g.id, { condition: e.target.value })
                    }
                    style={{ fontSize: 13 }}
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label htmlFor={`spec-equip-${g.id}`} className="ds-label">
                    Equipment Notes
                  </label>
                  <input
                    id={`spec-equip-${g.id}`}
                    className="ds-input"
                    value={g.equipmentNotes}
                    onChange={(e) =>
                      update(g.id, { equipmentNotes: e.target.value })
                    }
                    placeholder="Specialized gear, weapons…"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`spec-notes-${g.id}`} className="ds-label">
                  Notes
                </label>
                <textarea
                  id={`spec-notes-${g.id}`}
                  className="ds-input"
                  rows={2}
                  value={g.notes}
                  onChange={(e) => update(g.id, { notes: e.target.value })}
                  placeholder="Mission history, tactics…"
                  style={{ resize: "vertical", fontSize: 12 }}
                />
              </div>

              {officers.length > 0 && (
                <div>
                  <p className="ds-label" style={{ marginBottom: 6 }}>
                    Assigned Officers
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {officers.map((o) => (
                      <label
                        key={o.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          cursor: "pointer",
                          color: "var(--ds-text)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={g.officerIds.includes(o.id)}
                          onChange={() => toggleOfficer(g.id, o.id)}
                        />
                        {o.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <ArmyAbilityList
                abilities={g.abilities}
                onChange={(abilities: ArmyAbility[]) =>
                  update(g.id, { abilities })
                }
                title="Group Abilities"
                ocidPrefix={`army.specops_ability.${idx + 1}`}
              />
            </div>
          )}
        </div>
      ))}

      {adding && (
        <div
          className="ds-card2"
          style={{ padding: 10, display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            className="ds-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addGroup();
              }
            }}
            placeholder="Group name (e.g. Shadow Company)"
            style={{ flex: 1, fontSize: 13 }}
            data-ocid="army.specops.name.input"
          />
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontSize: 12 }}
            onClick={addGroup}
            data-ocid="army.specops.submit_button"
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
      )}
    </div>
  );
}

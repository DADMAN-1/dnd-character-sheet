import { useState } from "react";
import type { Faction } from "../../../types";
import type { ArmyAbility, ArmyCommander, ArmyRank } from "../../../types";
import EntityLinkSelect from "../../EntityLinkSelect";
import ArmyAbilityList from "./ArmyAbilityList";
import { uid } from "./armyHelpers";

interface Props {
  commanders: ArmyCommander[];
  ranks: ArmyRank[];
  factions: Faction[];
  onChange: (commanders: ArmyCommander[]) => void;
}

const sorted = (ranks: ArmyRank[]) =>
  [...ranks].sort((a, b) => (a.tier < b.tier ? -1 : a.tier > b.tier ? 1 : 0));

const emptyCommander = (): Omit<ArmyCommander, "id"> => ({
  name: "",
  rankId: "",
  background: "",
  commandSkills: [],
  signatureAbility: "",
  historyNotes: "",
  abilities: [],
  factionId: undefined,
});

export default function ArmyCommandersPanel({
  commanders,
  ranks,
  factions,
  onChange,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<ArmyCommander, "id">>(emptyCommander());
  const [newSkill, setNewSkill] = useState<Record<string, string>>({});

  const rankName = (id: string) => ranks.find((r) => r.id === id)?.name ?? "—";
  const factionName = (id: bigint | undefined) =>
    id !== undefined ? factions.find((f) => f.id === id)?.name : undefined;
  const factionItems = factions.map((f) => ({ id: f.id, name: f.name }));

  const addCommander = () => {
    if (!form.name.trim()) return;
    onChange([...commanders, { ...form, id: uid() }]);
    setForm(emptyCommander());
    setAdding(false);
  };

  const updateCommander = (id: string, updates: Partial<ArmyCommander>) => {
    onChange(commanders.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCommander = (id: string) => {
    if (!confirm("Remove this commander?")) return;
    onChange(commanders.filter((c) => c.id !== id));
  };

  const addSkill = (cmdId: string) => {
    const s = (newSkill[cmdId] ?? "").trim();
    if (!s) return;
    const cmd = commanders.find((c) => c.id === cmdId);
    if (!cmd || cmd.commandSkills.includes(s)) return;
    updateCommander(cmdId, { commandSkills: [...cmd.commandSkills, s] });
    setNewSkill((prev) => ({ ...prev, [cmdId]: "" }));
  };

  const removeSkill = (cmdId: string, skill: string) => {
    const cmd = commanders.find((c) => c.id === cmdId);
    if (!cmd) return;
    updateCommander(cmdId, {
      commandSkills: cmd.commandSkills.filter((s) => s !== skill),
    });
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
          Commanders
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setAdding(true)}
          data-ocid="army.commanders.open_modal_button"
        >
          + Add Commander
        </button>
      </div>

      {commanders.length === 0 && !adding && (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 13 }}
          data-ocid="army.commanders.empty_state"
        >
          No commanders yet.
        </p>
      )}

      {commanders.map((c, idx) => (
        <div
          key={c.id}
          className="ds-card2"
          style={{ marginBottom: 8 }}
          data-ocid={`army.commander.item.${idx + 1}`}
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
            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
          >
            <div>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--ds-text)",
                  fontSize: 14,
                }}
              >
                {c.name}
              </span>
              <span
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 12,
                  marginLeft: 8,
                }}
              >
                {rankName(c.rankId)}
                {factionName(c.factionId)
                  ? ` · ⚜️ ${factionName(c.factionId)}`
                  : ""}
              </span>
              {c.signatureAbility && (
                <span
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 12,
                    marginLeft: 8,
                  }}
                >
                  ✦ {c.signatureAbility}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeCommander(c.id);
                }}
                data-ocid={`army.commander.delete_button.${idx + 1}`}
              >
                ✕
              </button>
              <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                {expandedId === c.id ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {expandedId === c.id && (
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
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <div>
                  <label htmlFor={`cmd-name-${c.id}`} className="ds-label">
                    Name
                  </label>
                  <input
                    id={`cmd-name-${c.id}`}
                    className="ds-input"
                    value={c.name}
                    onChange={(e) =>
                      updateCommander(c.id, { name: e.target.value })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor={`cmd-rank-${c.id}`} className="ds-label">
                    Rank
                  </label>
                  <select
                    id={`cmd-rank-${c.id}`}
                    className="ds-input"
                    value={c.rankId}
                    onChange={(e) =>
                      updateCommander(c.id, { rankId: e.target.value })
                    }
                    style={{ fontSize: 13 }}
                  >
                    <option value="">— Select rank —</option>
                    {sorted(ranks).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label htmlFor={`cmd-sig-${c.id}`} className="ds-label">
                    Signature Ability
                  </label>
                  <input
                    id={`cmd-sig-${c.id}`}
                    className="ds-input"
                    value={c.signatureAbility}
                    onChange={(e) =>
                      updateCommander(c.id, {
                        signatureAbility: e.target.value,
                      })
                    }
                    placeholder="e.g. Rally the Troops"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`cmd-bg-${c.id}`} className="ds-label">
                  Background
                </label>
                <textarea
                  id={`cmd-bg-${c.id}`}
                  className="ds-input"
                  rows={2}
                  value={c.background}
                  onChange={(e) =>
                    updateCommander(c.id, { background: e.target.value })
                  }
                  placeholder="Commander background…"
                  style={{ resize: "vertical", fontSize: 12 }}
                />
              </div>

              <div>
                <label htmlFor={`cmd-hist-${c.id}`} className="ds-label">
                  History / Lore Notes
                </label>
                <textarea
                  id={`cmd-hist-${c.id}`}
                  className="ds-input"
                  rows={2}
                  value={c.historyNotes}
                  onChange={(e) =>
                    updateCommander(c.id, { historyNotes: e.target.value })
                  }
                  placeholder="Notable battles, history, lore…"
                  style={{ resize: "vertical", fontSize: 12 }}
                />
              </div>

              <div>
                <p className="ds-label" style={{ marginBottom: 4 }}>
                  Faction Affiliation
                </p>
                <EntityLinkSelect
                  items={factionItems}
                  value={c.factionId ?? null}
                  onChange={(id) =>
                    updateCommander(c.id, { factionId: id ?? undefined })
                  }
                  label=""
                  placeholder="— None —"
                  ocid="army.commander.faction.select"
                />
              </div>

              <div>
                <p className="ds-label" style={{ marginBottom: 6 }}>
                  Command Skills
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    marginBottom: 6,
                  }}
                >
                  {c.commandSkills.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "var(--ds-surface)",
                        border: "1px solid var(--ds-border)",
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontSize: 12,
                        color: "var(--ds-gold)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--ds-muted)",
                          fontSize: 10,
                          padding: 0,
                        }}
                        onClick={() => removeSkill(c.id, s)}
                        aria-label={`Remove ${s}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="ds-input"
                    value={newSkill[c.id] ?? ""}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        [c.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(c.id);
                      }
                    }}
                    placeholder="Add command skill"
                    style={{ fontSize: 12 }}
                  />
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => addSkill(c.id)}
                  >
                    Add
                  </button>
                </div>
              </div>

              <ArmyAbilityList
                abilities={c.abilities}
                onChange={(abilities: ArmyAbility[]) =>
                  updateCommander(c.id, { abilities })
                }
                title="Personal Abilities"
                ocidPrefix={`army.commander_ability.${idx + 1}`}
              />
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
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="ds-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Commander name *"
              style={{ flex: 2, fontSize: 13 }}
              data-ocid="army.commanders.name.input"
            />
            <select
              className="ds-input"
              value={form.rankId}
              onChange={(e) =>
                setForm((f) => ({ ...f, rankId: e.target.value }))
              }
              style={{ flex: 1, fontSize: 13 }}
            >
              <option value="">— Rank —</option>
              {sorted(ranks).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={addCommander}
              data-ocid="army.commanders.submit_button"
            >
              Add Commander
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

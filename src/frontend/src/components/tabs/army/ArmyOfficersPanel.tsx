import { useState } from "react";
import type { Faction } from "../../../types";
import type { ArmyOfficer, ArmyRank, OfficerPromotion } from "../../../types";
import EntityLinkSelect from "../../EntityLinkSelect";
import { uid } from "./armyHelpers";

interface Props {
  officers: ArmyOfficer[];
  ranks: ArmyRank[];
  factions: Faction[];
  onChange: (officers: ArmyOfficer[]) => void;
}

const sorted = (ranks: ArmyRank[]) =>
  [...ranks].sort((a, b) => (a.tier < b.tier ? -1 : a.tier > b.tier ? 1 : 0));

const emptyOfficer = (): Omit<ArmyOfficer, "id"> => ({
  name: "",
  rankId: "",
  race: "",
  background: "",
  skills: [],
  notes: "",
  loyalty: 50n,
  combatAbility: 50n,
  leadership: 50n,
  promotionLog: [],
  factionId: undefined,
});

export default function ArmyOfficersPanel({
  officers,
  ranks,
  factions,
  onChange,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<ArmyOfficer, "id">>(emptyOfficer());
  const [newSkill, setNewSkill] = useState<Record<string, string>>({});
  const [addingPromo, setAddingPromo] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState<Omit<OfficerPromotion, "id">>({
    fromRank: "",
    toRank: "",
    date: "",
    notes: "",
  });

  const rankName = (id: string) => ranks.find((r) => r.id === id)?.name ?? "—";
  const factionName = (id: bigint | undefined) =>
    id !== undefined ? factions.find((f) => f.id === id)?.name : undefined;
  const factionItems = factions.map((f) => ({ id: f.id, name: f.name }));

  const addOfficer = () => {
    if (!form.name.trim()) return;
    onChange([...officers, { ...form, id: uid() }]);
    setForm(emptyOfficer());
    setAdding(false);
  };

  const updateOfficer = (id: string, updates: Partial<ArmyOfficer>) => {
    // If rank changed, auto-append to promotion log
    if (updates.rankId !== undefined) {
      const officer = officers.find((o) => o.id === id);
      if (
        officer &&
        officer.rankId !== updates.rankId &&
        officer.rankId &&
        updates.rankId
      ) {
        const fromRankName =
          ranks.find((r) => r.id === officer.rankId)?.name ?? officer.rankId;
        const toRankName =
          ranks.find((r) => r.id === updates.rankId)?.name ?? updates.rankId;
        const promoEntry: OfficerPromotion = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          fromRank: fromRankName,
          toRank: toRankName,
          date: new Date().toISOString().split("T")[0] ?? "",
          notes: "Auto-logged rank change",
        };
        const newLog = [...officer.promotionLog, promoEntry];
        onChange(
          officers.map((o) =>
            o.id === id ? { ...o, ...updates, promotionLog: newLog } : o,
          ),
        );
        return;
      }
    }
    onChange(officers.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const removeOfficer = (id: string) => {
    if (!confirm("Remove this officer?")) return;
    onChange(officers.filter((o) => o.id !== id));
  };

  const addSkill = (officerId: string) => {
    const s = (newSkill[officerId] ?? "").trim();
    if (!s) return;
    const officer = officers.find((o) => o.id === officerId);
    if (!officer || officer.skills.includes(s)) return;
    updateOfficer(officerId, { skills: [...officer.skills, s] });
    setNewSkill((prev) => ({ ...prev, [officerId]: "" }));
  };

  const removeSkill = (officerId: string, skill: string) => {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;
    updateOfficer(officerId, {
      skills: officer.skills.filter((s) => s !== skill),
    });
  };

  const addPromotion = (officerId: string) => {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer || !promoForm.fromRank || !promoForm.toRank) return;
    updateOfficer(officerId, {
      promotionLog: [...officer.promotionLog, { ...promoForm, id: uid() }],
    });
    setPromoForm({ fromRank: "", toRank: "", date: "", notes: "" });
    setAddingPromo(null);
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
          Officers
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setAdding(true)}
          data-ocid="army.officers.open_modal_button"
        >
          + Add Officer
        </button>
      </div>

      {officers.length === 0 && !adding && (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 13 }}
          data-ocid="army.officers.empty_state"
        >
          No officers yet. Only named key personnel are tracked here.
        </p>
      )}

      {officers.map((o, idx) => (
        <div
          key={o.id}
          className="ds-card2"
          style={{ marginBottom: 8 }}
          data-ocid={`army.officer.item.${idx + 1}`}
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
            onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
          >
            <div>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--ds-text)",
                  fontSize: 14,
                }}
              >
                {o.name}
              </span>
              <span
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 12,
                  marginLeft: 8,
                }}
              >
                {rankName(o.rankId)}
                {o.race ? ` · ${o.race}` : ""}
                {factionName(o.factionId)
                  ? ` · ⚜️ ${factionName(o.factionId)}`
                  : ""}
              </span>
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  color: "var(--ds-muted)",
                }}
              >
                Loyalty {o.loyalty.toString()} · Combat{" "}
                {o.combatAbility.toString()} · Lead {o.leadership.toString()}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeOfficer(o.id);
                }}
                data-ocid={`army.officer.delete_button.${idx + 1}`}
              >
                ✕
              </button>
              <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                {expandedId === o.id ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {expandedId === o.id && (
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
                  <label htmlFor={`off-name-${o.id}`} className="ds-label">
                    Name
                  </label>
                  <input
                    id={`off-name-${o.id}`}
                    className="ds-input"
                    value={o.name}
                    onChange={(e) =>
                      updateOfficer(o.id, { name: e.target.value })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor={`off-rank-${o.id}`} className="ds-label">
                    Rank
                  </label>
                  <select
                    id={`off-rank-${o.id}`}
                    className="ds-input"
                    value={o.rankId}
                    onChange={(e) =>
                      updateOfficer(o.id, { rankId: e.target.value })
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
                <div>
                  <label htmlFor={`off-race-${o.id}`} className="ds-label">
                    Race
                  </label>
                  <input
                    id={`off-race-${o.id}`}
                    className="ds-input"
                    value={o.race}
                    onChange={(e) =>
                      updateOfficer(o.id, { race: e.target.value })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor={`off-loyal-${o.id}`} className="ds-label">
                    Loyalty (0–100)
                  </label>
                  <input
                    id={`off-loyal-${o.id}`}
                    className="ds-input"
                    type="number"
                    min={0}
                    max={100}
                    value={o.loyalty.toString()}
                    onChange={(e) =>
                      updateOfficer(o.id, {
                        loyalty: BigInt(
                          Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0),
                          ),
                        ),
                      })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor={`off-combat-${o.id}`} className="ds-label">
                    Combat Ability (0–100)
                  </label>
                  <input
                    id={`off-combat-${o.id}`}
                    className="ds-input"
                    type="number"
                    min={0}
                    max={100}
                    value={o.combatAbility.toString()}
                    onChange={(e) =>
                      updateOfficer(o.id, {
                        combatAbility: BigInt(
                          Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0),
                          ),
                        ),
                      })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor={`off-lead-${o.id}`} className="ds-label">
                    Leadership (0–100)
                  </label>
                  <input
                    id={`off-lead-${o.id}`}
                    className="ds-input"
                    type="number"
                    min={0}
                    max={100}
                    value={o.leadership.toString()}
                    onChange={(e) =>
                      updateOfficer(o.id, {
                        leadership: BigInt(
                          Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0),
                          ),
                        ),
                      })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`off-bg-${o.id}`} className="ds-label">
                  Background
                </label>
                <textarea
                  id={`off-bg-${o.id}`}
                  className="ds-input"
                  rows={2}
                  value={o.background}
                  onChange={(e) =>
                    updateOfficer(o.id, { background: e.target.value })
                  }
                  placeholder="Officer background, history…"
                  style={{ resize: "vertical", fontSize: 12 }}
                />
              </div>

              <div>
                <label htmlFor={`off-notes-${o.id}`} className="ds-label">
                  Notes
                </label>
                <textarea
                  id={`off-notes-${o.id}`}
                  className="ds-input"
                  rows={2}
                  value={o.notes}
                  onChange={(e) =>
                    updateOfficer(o.id, { notes: e.target.value })
                  }
                  placeholder="Personality, notable actions…"
                  style={{ resize: "vertical", fontSize: 12 }}
                />
              </div>

              <div>
                <p className="ds-label" style={{ marginBottom: 4 }}>
                  Faction Affiliation
                </p>
                <EntityLinkSelect
                  items={factionItems}
                  value={o.factionId ?? null}
                  onChange={(id) =>
                    updateOfficer(o.id, { factionId: id ?? undefined })
                  }
                  label=""
                  placeholder="— None —"
                  ocid="army.officer.faction.select"
                />
              </div>

              <div>
                <p className="ds-label" style={{ marginBottom: 6 }}>
                  Skills
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    marginBottom: 6,
                  }}
                >
                  {o.skills.map((s) => (
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
                        onClick={() => removeSkill(o.id, s)}
                        aria-label={`Remove skill ${s}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="ds-input"
                    value={newSkill[o.id] ?? ""}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        [o.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(o.id);
                      }
                    }}
                    placeholder="Add skill"
                    style={{ fontSize: 12 }}
                  />
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => addSkill(o.id)}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <p className="ds-label">Promotion Log</p>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => setAddingPromo(o.id)}
                  >
                    + Add
                  </button>
                </div>
                {o.promotionLog.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      fontSize: 12,
                      color: "var(--ds-muted)",
                      marginBottom: 4,
                    }}
                  >
                    <strong style={{ color: "var(--ds-text)" }}>
                      {p.fromRank} → {p.toRank}
                    </strong>
                    {p.date && ` (${p.date})`}
                    {p.notes && ` — ${p.notes}`}
                  </div>
                ))}
                {addingPromo === o.id && (
                  <div
                    className="ds-card2"
                    style={{
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        className="ds-input"
                        value={promoForm.fromRank}
                        onChange={(e) =>
                          setPromoForm((f) => ({
                            ...f,
                            fromRank: e.target.value,
                          }))
                        }
                        placeholder="From rank *"
                        style={{ flex: 1, fontSize: 12 }}
                      />
                      <input
                        className="ds-input"
                        value={promoForm.toRank}
                        onChange={(e) =>
                          setPromoForm((f) => ({
                            ...f,
                            toRank: e.target.value,
                          }))
                        }
                        placeholder="To rank *"
                        style={{ flex: 1, fontSize: 12 }}
                      />
                      <input
                        className="ds-input"
                        value={promoForm.date}
                        onChange={(e) =>
                          setPromoForm((f) => ({ ...f, date: e.target.value }))
                        }
                        placeholder="Date"
                        style={{ flex: 1, fontSize: 12 }}
                      />
                    </div>
                    <input
                      className="ds-input"
                      value={promoForm.notes}
                      onChange={(e) =>
                        setPromoForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      placeholder="Notes"
                      style={{ fontSize: 12 }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="ds-btn-primary"
                        style={{ fontSize: 12 }}
                        onClick={() => addPromotion(o.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ fontSize: 12 }}
                        onClick={() => setAddingPromo(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
            gap: 8,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <input
              className="ds-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Officer name *"
              style={{ fontSize: 13 }}
              data-ocid="army.officers.name.input"
            />
            <select
              className="ds-input"
              value={form.rankId}
              onChange={(e) =>
                setForm((f) => ({ ...f, rankId: e.target.value }))
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
            <input
              className="ds-input"
              value={form.race}
              onChange={(e) => setForm((f) => ({ ...f, race: e.target.value }))}
              placeholder="Race"
              style={{ fontSize: 13 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={addOfficer}
              data-ocid="army.officers.submit_button"
            >
              Add Officer
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

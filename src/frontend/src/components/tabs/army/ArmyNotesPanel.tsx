import { useState } from "react";
import type {
  AlliedArmy,
  ArmyNotes,
  BattlePlanEntry,
  CampaignLogEntry,
} from "../../../types";
import { uid } from "./armyHelpers";

interface NotesProps {
  notes: ArmyNotes;
  onChange: (notes: ArmyNotes) => void;
}

export function ArmyNotesPanel({ notes, onChange }: NotesProps) {
  // Defensive: ensure nested arrays exist even if backend returned partial object
  const safeNotes: ArmyNotes = {
    ...notes,
    campaignLog: notes.campaignLog ?? [],
    battlePlannerNotes: notes.battlePlannerNotes ?? [],
    generalNotes: notes.generalNotes ?? "",
  };
  const [addingCampaign, setAddingCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState<
    Omit<CampaignLogEntry, "id">
  >({ entry: "", date: "" });
  const [addingBattle, setAddingBattle] = useState(false);
  const [battleForm, setBattleForm] = useState<Omit<BattlePlanEntry, "id">>({
    objective: "",
    notes: "",
    date: "",
  });

  const addCampaign = () => {
    if (!campaignForm.entry.trim()) return;
    onChange({
      ...safeNotes,
      campaignLog: [...safeNotes.campaignLog, { ...campaignForm, id: uid() }],
    });
    setCampaignForm({ entry: "", date: "" });
    setAddingCampaign(false);
  };

  const addBattle = () => {
    if (!battleForm.objective.trim()) return;
    onChange({
      ...safeNotes,
      battlePlannerNotes: [
        ...safeNotes.battlePlannerNotes,
        { ...battleForm, id: uid() },
      ],
    });
    setBattleForm({ objective: "", notes: "", date: "" });
    setAddingBattle(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label htmlFor="army-general-notes" className="ds-label">
          General Notes
        </label>
        <textarea
          id="army-general-notes"
          className="ds-input"
          rows={4}
          value={safeNotes.generalNotes}
          onChange={(e) =>
            onChange({ ...safeNotes, generalNotes: e.target.value })
          }
          placeholder="Army-wide notes, observations, context…"
          style={{ resize: "vertical" }}
          data-ocid="army.notes.textarea"
        />
      </div>

      <div>
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
            style={{ color: "var(--ds-gold)", fontSize: 14 }}
          >
            Campaign Log
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingCampaign(true)}
            data-ocid="army.campaign_log.open_modal_button"
          >
            + Add Entry
          </button>
        </div>
        {safeNotes.campaignLog.length === 0 && !addingCampaign && (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No campaign entries yet.
          </p>
        )}
        {safeNotes.campaignLog.map((c, idx) => (
          <div
            key={c.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
            data-ocid={`army.campaign_log.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {c.date && (
                <div
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 11,
                    marginBottom: 2,
                  }}
                >
                  {c.date}
                </div>
              )}
              <div style={{ color: "var(--ds-text)", fontSize: 13 }}>
                {c.entry}
              </div>
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
              onClick={() =>
                onChange({
                  ...safeNotes,
                  campaignLog: safeNotes.campaignLog.filter(
                    (x) => x.id !== c.id,
                  ),
                })
              }
              data-ocid={`army.campaign_log.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {addingCampaign && (
          <div
            className="ds-card2"
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <textarea
                className="ds-input"
                rows={2}
                value={campaignForm.entry}
                onChange={(e) =>
                  setCampaignForm((f) => ({ ...f, entry: e.target.value }))
                }
                placeholder="Campaign entry *"
                style={{ flex: 2, resize: "vertical", fontSize: 13 }}
              />
              <input
                className="ds-input"
                value={campaignForm.date}
                onChange={(e) =>
                  setCampaignForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date"
                style={{ flex: 1, fontSize: 13 }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addCampaign}
                data-ocid="army.campaign_log.submit_button"
              >
                Add
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => setAddingCampaign(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
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
            style={{ color: "var(--ds-gold)", fontSize: 14 }}
          >
            Battle Planner
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingBattle(true)}
            data-ocid="army.battle_plan.open_modal_button"
          >
            + Add Plan
          </button>
        </div>
        {safeNotes.battlePlannerNotes.length === 0 && !addingBattle && (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No battle plans yet.
          </p>
        )}
        {safeNotes.battlePlannerNotes.map((b, idx) => (
          <div
            key={b.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
            data-ocid={`army.battle_plan.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ds-text)",
                  fontSize: 13,
                }}
              >
                {b.objective} {b.date && `· ${b.date}`}
              </div>
              {b.notes && (
                <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  {b.notes}
                </div>
              )}
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
              onClick={() =>
                onChange({
                  ...safeNotes,
                  battlePlannerNotes: safeNotes.battlePlannerNotes.filter(
                    (x) => x.id !== b.id,
                  ),
                })
              }
              data-ocid={`army.battle_plan.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {addingBattle && (
          <div
            className="ds-card2"
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="ds-input"
                value={battleForm.objective}
                onChange={(e) =>
                  setBattleForm((f) => ({ ...f, objective: e.target.value }))
                }
                placeholder="Objective *"
                style={{ flex: 2, fontSize: 13 }}
              />
              <input
                className="ds-input"
                value={battleForm.date}
                onChange={(e) =>
                  setBattleForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date"
                style={{ flex: 1, fontSize: 13 }}
              />
            </div>
            <textarea
              className="ds-input"
              rows={2}
              value={battleForm.notes}
              onChange={(e) =>
                setBattleForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Tactical notes, terrain, plan…"
              style={{ resize: "vertical", fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addBattle}
                data-ocid="army.battle_plan.submit_button"
              >
                Add
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => setAddingBattle(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface AlliedProps {
  alliedArmies: AlliedArmy[];
  onChange: (armies: AlliedArmy[]) => void;
}

export function AlliedArmiesPanel({ alliedArmies, onChange }: AlliedProps) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<AlliedArmy, "id">>({
    name: "",
    size: 0n,
    commander: "",
    allegiance: "",
    notes: "",
  });

  const add = () => {
    if (!form.name.trim()) return;
    onChange([...alliedArmies, { ...form, id: uid() }]);
    setForm({ name: "", size: 0n, commander: "", allegiance: "", notes: "" });
    setAdding(false);
  };

  return (
    <div>
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
          style={{ color: "var(--ds-gold)", fontSize: 14 }}
        >
          Allied Armies
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setAdding(true)}
          data-ocid="army.allies.open_modal_button"
        >
          + Add Ally
        </button>
      </div>
      {alliedArmies.length === 0 && !adding && (
        <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
          No allied armies tracked.
        </p>
      )}
      {alliedArmies.map((a, idx) => (
        <div
          key={a.id}
          className="ds-card2"
          style={{
            padding: "8px 12px",
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
          data-ocid={`army.ally.item.${idx + 1}`}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontWeight: 600, color: "var(--ds-text)", fontSize: 13 }}
            >
              {a.name}
            </div>
            <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
              Size: {a.size.toString()}
              {a.commander && ` · Cmd: ${a.commander}`}
              {a.allegiance && ` · ${a.allegiance}`}
            </div>
            {a.notes && (
              <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                {a.notes}
              </div>
            )}
          </div>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
            onClick={() => onChange(alliedArmies.filter((x) => x.id !== a.id))}
            data-ocid={`army.ally.delete_button.${idx + 1}`}
          >
            ✕
          </button>
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
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 6,
            }}
          >
            <input
              className="ds-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Army name *"
              style={{ fontSize: 13 }}
              data-ocid="army.ally.name.input"
            />
            <input
              className="ds-input"
              type="number"
              value={form.size.toString()}
              onChange={(e) =>
                setForm((f) => ({ ...f, size: BigInt(e.target.value || 0) }))
              }
              placeholder="Size"
              style={{ fontSize: 13 }}
            />
            <input
              className="ds-input"
              value={form.commander}
              onChange={(e) =>
                setForm((f) => ({ ...f, commander: e.target.value }))
              }
              placeholder="Commander"
              style={{ fontSize: 13 }}
            />
            <input
              className="ds-input"
              value={form.allegiance}
              onChange={(e) =>
                setForm((f) => ({ ...f, allegiance: e.target.value }))
              }
              placeholder="Allegiance"
              style={{ fontSize: 13 }}
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
              data-ocid="army.ally.submit_button"
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

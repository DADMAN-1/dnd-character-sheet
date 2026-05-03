import { useState } from "react";
import type { ArmyRank } from "../../../types";
import { RANK_PRESETS, uid } from "./armyHelpers";

interface Props {
  ranks: ArmyRank[];
  onChange: (ranks: ArmyRank[]) => void;
}

export default function ArmyRanksPanel({ ranks, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<ArmyRank, "id">>({
    name: "",
    tier: 1n,
    description: "",
    troopCount: 0n,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ArmyRank>({
    id: "",
    name: "",
    tier: 1n,
    description: "",
    troopCount: 0n,
  });
  const [preset, setPreset] = useState("");

  const applyPreset = () => {
    if (!preset || !RANK_PRESETS[preset]) return;
    if (!confirm(`Replace current ranks with ${preset} preset?`)) return;
    onChange(RANK_PRESETS[preset].map((r) => ({ ...r, troopCount: 0n })));
    setPreset("");
  };

  const sorted = [...ranks].sort((a, b) =>
    a.tier < b.tier ? -1 : a.tier > b.tier ? 1 : 0,
  );

  const addRank = () => {
    if (!form.name.trim()) return;
    onChange([
      ...ranks,
      { ...form, id: uid(), troopCount: form.troopCount ?? 0n },
    ]);
    setForm({
      name: "",
      tier: BigInt(ranks.length + 1),
      description: "",
      troopCount: 0n,
    });
    setAdding(false);
  };

  const saveEdit = () => {
    onChange(ranks.map((r) => (r.id === editId ? editForm : r)));
    setEditId(null);
  };

  const removeRank = (id: string) => {
    if (!confirm("Remove this rank?")) return;
    onChange(ranks.filter((r) => r.id !== id));
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
          Rank System
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <select
            className="ds-input"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            style={{ fontSize: 12, padding: "4px 8px" }}
            data-ocid="army.ranks.preset.select"
          >
            <option value="">Load preset…</option>
            {Object.keys(RANK_PRESETS).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          {preset && (
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={applyPreset}
              data-ocid="army.ranks.preset.submit_button"
            >
              Apply
            </button>
          )}
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAdding(true)}
            data-ocid="army.ranks.open_modal_button"
          >
            + Add Rank
          </button>
        </div>
      </div>

      {sorted.length === 0 && !adding && (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 13 }}
          data-ocid="army.ranks.empty_state"
        >
          No ranks defined. Use a preset or add manually.
        </p>
      )}

      {sorted.map((rank, idx) => (
        <div
          key={rank.id}
          className="ds-card2"
          style={{ padding: "8px 12px", marginBottom: 6 }}
          data-ocid={`army.rank.item.${idx + 1}`}
        >
          {editId === rank.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="ds-input"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Rank name"
                  style={{ flex: 2, fontSize: 13 }}
                />
                <input
                  className="ds-input"
                  type="number"
                  value={editForm.tier.toString()}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      tier: BigInt(e.target.value || 1),
                    }))
                  }
                  placeholder="Tier"
                  style={{ flex: 1, fontSize: 13 }}
                />
              </div>
              <input
                className="ds-input"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                style={{ fontSize: 12 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={saveEdit}
                  data-ocid={`army.rank.save_button.${idx + 1}`}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => setEditId(null)}
                  data-ocid={`army.rank.cancel_button.${idx + 1}`}
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
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--ds-text)",
                    fontSize: 13,
                  }}
                >
                  Tier {rank.tier.toString()} — {rank.name}
                </span>
                {rank.description && (
                  <span
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 12,
                      marginLeft: 8,
                    }}
                  >
                    {rank.description}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 11, padding: "2px 6px" }}
                  onClick={() => {
                    setEditId(rank.id);
                    setEditForm({ ...rank });
                  }}
                  data-ocid={`army.rank.edit_button.${idx + 1}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
                  onClick={() => removeRank(rank.id)}
                  data-ocid={`army.rank.delete_button.${idx + 1}`}
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
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="ds-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Rank name *"
              style={{ flex: 2, fontSize: 13 }}
            />
            <input
              className="ds-input"
              type="number"
              value={form.tier.toString()}
              onChange={(e) =>
                setForm((f) => ({ ...f, tier: BigInt(e.target.value || 1) }))
              }
              placeholder="Tier"
              style={{ flex: 1, fontSize: 13 }}
            />
          </div>
          <input
            className="ds-input"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Description (optional)"
            style={{ fontSize: 12 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12, padding: "4px 10px" }}
              onClick={addRank}
              data-ocid="army.ranks.submit_button"
            >
              Add Rank
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

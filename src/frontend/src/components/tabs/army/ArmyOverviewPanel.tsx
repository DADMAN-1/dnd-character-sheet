import { useState } from "react";
import type { Army } from "../../../types";

interface Props {
  army: Army;
  onChange: (updates: Partial<Army>) => void;
  // characters is accepted for compatibility but commanding character is handled at page level
  characters?: { id: string; name: string }[];
}

const STATUS_OPTIONS = [
  "Active",
  "Resting",
  "Marching",
  "Besieging",
  "Retreating",
  "Disbanded",
  "Garrisoned",
];
const TRAINING_OPTIONS = [
  "Untrained",
  "Militia",
  "Regular",
  "Veteran",
  "Elite",
];
const CONDITION_OPTIONS = [
  "Rested",
  "Fatigued",
  "Battered",
  "Routed",
  "Besieged",
  "Critical",
];

export default function ArmyOverviewPanel({ army, onChange }: Props) {
  const [newSpecialty, setNewSpecialty] = useState("");

  const addSpecialty = () => {
    const s = newSpecialty.trim();
    if (!s || (army.specialties ?? []).includes(s)) return;
    onChange({ specialties: [...(army.specialties ?? []), s] });
    setNewSpecialty("");
  };

  const removeSpecialty = (s: string) => {
    onChange({ specialties: (army.specialties ?? []).filter((x) => x !== s) });
  };

  const handleSpecialtyKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSpecialty();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label htmlFor="army-name" className="ds-label">
            Army Name
          </label>
          <input
            id="army-name"
            className="ds-input"
            value={army.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Army name"
            data-ocid="army.name.input"
          />
        </div>
        <div>
          <label htmlFor="army-race" className="ds-label">
            Race / Composition
          </label>
          <input
            id="army-race"
            className="ds-input"
            value={army.race}
            onChange={(e) => onChange({ race: e.target.value })}
            placeholder="e.g. Human, Mixed, Orcish"
          />
        </div>
        <div>
          <label htmlFor="army-size" className="ds-label">
            Size (Troops)
          </label>
          <input
            id="army-size"
            className="ds-input"
            type="number"
            value={army.size.toString()}
            onChange={(e) => onChange({ size: BigInt(e.target.value || 0) })}
            placeholder="0"
            data-ocid="army.size.input"
          />
        </div>
        <div>
          <label htmlFor="army-warchest" className="ds-label">
            War Chest (Gold)
          </label>
          <input
            id="army-warchest"
            className="ds-input"
            type="number"
            value={army.warChest.toString()}
            onChange={(e) =>
              onChange({ warChest: BigInt(e.target.value || 0) })
            }
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="army-morale" className="ds-label">
            Morale Rating (0–100)
          </label>
          <input
            id="army-morale"
            className="ds-input"
            type="number"
            min={0}
            max={100}
            value={army.moraleRating.toString()}
            onChange={(e) =>
              onChange({
                moraleRating: BigInt(
                  Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                ),
              })
            }
          />
        </div>
        <div>
          <label htmlFor="army-power" className="ds-label">
            Power Level (0–100)
          </label>
          <input
            id="army-power"
            className="ds-input"
            type="number"
            min={0}
            max={100}
            value={army.powerLevel.toString()}
            onChange={(e) =>
              onChange({
                powerLevel: BigInt(
                  Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                ),
              })
            }
          />
        </div>
        <div>
          <label htmlFor="army-status" className="ds-label">
            Status
          </label>
          <select
            id="army-status"
            className="ds-input"
            value={army.status}
            onChange={(e) => onChange({ status: e.target.value })}
            data-ocid="army.status.select"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="army-training" className="ds-label">
            Training Level
          </label>
          <select
            id="army-training"
            className="ds-input"
            value={army.trainingLevel}
            onChange={(e) => onChange({ trainingLevel: e.target.value })}
          >
            {TRAINING_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="army-condition" className="ds-label">
            Condition
          </label>
          <select
            id="army-condition"
            className="ds-input"
            value={army.condition}
            onChange={(e) => onChange({ condition: e.target.value })}
          >
            {CONDITION_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="army-faction" className="ds-label">
            Faction / Allegiance
          </label>
          <input
            id="army-faction"
            className="ds-input"
            value={army.faction}
            onChange={(e) => onChange({ faction: e.target.value })}
            placeholder="Kingdom, guild, faction…"
          />
        </div>
        <div>
          <label htmlFor="army-banner" className="ds-label">
            Army Banner / Symbol
          </label>
          <input
            id="army-banner"
            className="ds-input"
            value={army.banner}
            onChange={(e) => onChange({ banner: e.target.value })}
            placeholder="Describe emblem or motto"
          />
        </div>
        <div>
          <label htmlFor="army-founding" className="ds-label">
            Founding Date
          </label>
          <input
            id="army-founding"
            className="ds-input"
            value={army.foundingDate}
            onChange={(e) => onChange({ foundingDate: e.target.value })}
            placeholder="Year / era / campaign day"
          />
        </div>
      </div>

      <div>
        <label htmlFor="army-terrain" className="ds-label">
          Terrain / Environment Notes
        </label>
        <textarea
          id="army-terrain"
          className="ds-input"
          rows={2}
          value={army.terrainNotes}
          onChange={(e) => onChange({ terrainNotes: e.target.value })}
          placeholder="Current terrain and any advantages or penalties"
          style={{ resize: "vertical" }}
        />
      </div>

      <div>
        <p className="ds-label" style={{ marginBottom: 6 }}>
          Specialties
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
        >
          {(army.specialties ?? []).map((s) => (
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
                onClick={() => removeSpecialty(s)}
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
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            onKeyDown={handleSpecialtyKey}
            placeholder="Add specialty (e.g. Siege, Cavalry)"
            style={{ fontSize: 12 }}
            data-ocid="army.specialty.input"
          />
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12, whiteSpace: "nowrap" }}
            onClick={addSpecialty}
            data-ocid="army.specialty.add_button"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

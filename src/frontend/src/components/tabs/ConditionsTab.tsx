import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterCondition, DndBackend } from "../../types";
import { CanisterErrorUI, isCanisterStopped } from "../ErrorBoundary";

interface Props {
  actor: DndBackend;
  characterId: number;
  onRestartConnection?: () => void;
}

const DND_CONDITIONS = [
  {
    name: "Blinded",
    description:
      "Can't see. Attack rolls against you have advantage, your attack rolls have disadvantage.",
  },
  {
    name: "Charmed",
    description:
      "Can't attack the charmer or target them with harmful abilities or magical effects. The charmer has advantage on Charisma checks against you.",
  },
  {
    name: "Deafened",
    description:
      "Can't hear. Automatically fails any check that requires hearing.",
  },
  {
    name: "Exhaustion",
    description:
      "Exhaustion has 6 levels, each imposing cumulative debuffs to ability checks, speed, attack rolls, saving throws, and maximum HP.",
  },
  {
    name: "Frightened",
    description:
      "Has disadvantage on ability checks and attack rolls while the source of fear is within line of sight. Can't willingly move closer to the source.",
  },
  {
    name: "Grappled",
    description:
      "Speed becomes 0. Ends if the grappler becomes incapacitated, or if you're moved out of reach.",
  },
  { name: "Incapacitated", description: "Can't take actions or reactions." },
  {
    name: "Invisible",
    description:
      "Can't be seen without special senses. Heavily obscured. Attack rolls against you have disadvantage, your attack rolls have advantage.",
  },
  {
    name: "Paralyzed",
    description:
      "Is incapacitated and can't move or speak. Auto-fails STR and DEX saves. Attack rolls against you have advantage. Melee attacks that hit are automatic critical hits.",
  },
  {
    name: "Petrified",
    description:
      "Transformed into solid inanimate substance. Incapacitated and can't move, speak, or be aware of surroundings.",
  },
  {
    name: "Poisoned",
    description: "Has disadvantage on attack rolls and ability checks.",
  },
  {
    name: "Prone",
    description:
      "Disadvantage on attack rolls. Attackers have advantage on melee attacks against you, disadvantage on ranged attacks.",
  },
  {
    name: "Restrained",
    description:
      "Speed becomes 0. Attack rolls against you have advantage, your attack rolls have disadvantage. Disadvantage on DEX saving throws.",
  },
  {
    name: "Stunned",
    description:
      "Incapacitated, can't move, can only speak falteringly. Automatically fails STR and DEX saves. Attack rolls against you have advantage.",
  },
  {
    name: "Unconscious",
    description:
      "Incapacitated, can't move or speak, and is unaware of surroundings. Drops anything held, falls prone. Auto-fails STR and DEX saves.",
  },
  { name: "Custom", description: "" },
];

const CONDITION_COLORS: Record<string, string> = {
  Blinded: "#90a4ae",
  Charmed: "#f48fb1",
  Deafened: "#78909c",
  Exhaustion: "#ef9a9a",
  Frightened: "#ce93d8",
  Grappled: "#a5d6a7",
  Incapacitated: "#e57373",
  Invisible: "#b0bec5",
  Paralyzed: "#ff8a65",
  Petrified: "#80cbc4",
  Poisoned: "#aed581",
  Prone: "#ffd54f",
  Restrained: "#ffb74d",
  Stunned: "#ff7043",
  Unconscious: "#e53935",
};

function getConditionColor(name: string): string {
  return CONDITION_COLORS[name] ?? "var(--ds-gold)";
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type FormState = Omit<CharacterCondition, "id">;

const emptyForm = (): FormState => ({
  name: "",
  description: "",
  duration: "",
  autoRemoveOnRest: false,
});

export default function ConditionsTab({
  actor,
  characterId,
  onRestartConnection,
}: Props) {
  const [conditions, setConditions] = useState<CharacterCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [selectedPreset, setSelectedPreset] = useState("Blinded");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getCharacterConditions(BigInt(characterId));
      setConditions(data ?? []);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      console.error("Failed to load conditions:", e);
      setConditions([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (next: CharacterCondition[]) => {
    setSaving(true);
    try {
      await actor.updateCharacterConditions(BigInt(characterId), next);
    } catch (e) {
      if (isCanisterStopped(e)) setCanisterStopped(true);
      else console.error("Failed to save conditions:", e);
    } finally {
      setSaving(false);
    }
  };

  const openForm = () => {
    setForm(emptyForm());
    setSelectedPreset("Blinded");
    setShowForm(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const applyPreset = (name: string) => {
    setSelectedPreset(name);
    const preset = DND_CONDITIONS.find((c) => c.name === name);
    if (!preset) return;
    if (name === "Custom") {
      setForm((f) => ({ ...f, name: "", description: "" }));
    } else {
      setForm((f) => ({
        ...f,
        name: preset.name,
        description: preset.description,
      }));
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const entry: CharacterCondition = { id: makeId(), ...form };
    const next = [...conditions, entry];
    setConditions(next);
    setShowForm(false);
    await persist(next);
  };

  const removeCondition = async (id: string) => {
    const next = conditions.filter((c) => c.id !== id);
    setConditions(next);
    await persist(next);
  };

  const patchCondition = async (
    id: string,
    key: keyof FormState,
    value: string | boolean,
  ) => {
    const next = conditions.map((c) =>
      c.id === id ? { ...c, [key]: value } : c,
    );
    setConditions(next);
    await persist(next);
  };

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 16 }}
          >
            CONDITIONS
          </h2>
          {conditions.length > 0 && (
            <span
              style={{
                fontSize: 12,
                padding: "2px 10px",
                borderRadius: 10,
                backgroundColor: "rgba(229,57,53,0.2)",
                color: "#e53935",
                border: "1px solid rgba(229,57,53,0.4)",
              }}
              data-ocid="conditions.count_badge"
            >
              {conditions.length} active
            </span>
          )}
          {saving && (
            <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
              Saving...
            </span>
          )}
        </div>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={openForm}
          style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
          data-ocid="conditions.primary_button"
        >
          + Add Condition
        </button>
      </div>

      {/* Condition list */}
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)" }}
          data-ocid="conditions.loading_state"
        >
          Loading conditions...
        </p>
      ) : conditions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="conditions.empty_state"
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          <p>No active conditions. Your character is in peak condition!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {conditions.map((cond, i) => {
            const color = getConditionColor(cond.name);
            const isExpanded = expandedId === cond.id;
            return (
              <div
                key={cond.id}
                className="ds-card2"
                style={{ overflow: "hidden" }}
                data-ocid={`conditions.item.${i + 1}`}
              >
                <button
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    cursor: "pointer",
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    gap: 8,
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : cond.id)}
                  aria-expanded={isExpanded}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      minWidth: 0,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        color: "var(--ds-text)",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {cond.name}
                    </span>
                    {cond.duration && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "1px 7px",
                          borderRadius: 8,
                          backgroundColor: `${color}22`,
                          color,
                          border: `1px solid ${color}44`,
                        }}
                      >
                        {cond.duration}
                      </span>
                    )}
                    {cond.autoRemoveOnRest && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--ds-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        clears on rest
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCondition(cond.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(229,57,53,0.3)",
                        color: "#e53935",
                        cursor: "pointer",
                        padding: "3px 8px",
                        fontSize: 12,
                        borderRadius: 4,
                      }}
                      data-ocid={`conditions.delete_button.${i + 1}`}
                    >
                      Remove
                    </button>
                    <span
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        transition: "transform 0.2s",
                        display: "inline-block",
                        transform: isExpanded ? "rotate(180deg)" : "none",
                      }}
                    >
                      ▾
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div
                    style={{
                      padding: "0 14px 14px",
                      borderTop: "1px solid var(--ds-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {cond.description && (
                      <p
                        style={{
                          color: "var(--ds-text)",
                          fontSize: 13,
                          lineHeight: 1.6,
                          marginTop: 10,
                          fontStyle: "italic",
                        }}
                      >
                        {cond.description}
                      </p>
                    )}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 10,
                        alignItems: "end",
                      }}
                    >
                      <div>
                        <div className="ds-label" style={{ marginBottom: 4 }}>
                          Duration
                        </div>
                        <input
                          className="ds-input"
                          value={cond.duration}
                          onChange={(e) =>
                            patchCondition(cond.id, "duration", e.target.value)
                          }
                          placeholder="e.g. Until short rest, 1 minute..."
                          data-ocid={`conditions.duration_input.${i + 1}`}
                        />
                      </div>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          color: "var(--ds-muted)",
                          whiteSpace: "nowrap",
                          paddingBottom: 6,
                        }}
                        data-ocid={`conditions.auto_remove_toggle.${i + 1}`}
                      >
                        <input
                          type="checkbox"
                          checked={cond.autoRemoveOnRest}
                          onChange={(e) =>
                            patchCondition(
                              cond.id,
                              "autoRemoveOnRest",
                              e.target.checked,
                            )
                          }
                          style={{ accentColor: "var(--ds-gold)" }}
                        />
                        Remove on rest
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add condition modal */}
      {showForm && (
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
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowForm(false)}
          role="presentation"
          data-ocid="conditions.dialog"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 18 }}
              >
                Add Condition
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ds-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
                data-ocid="conditions.close_button"
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Preset selector */}
              <div>
                <div className="ds-label" style={{ marginBottom: 4 }}>
                  Condition Type
                </div>
                <select
                  className="ds-input"
                  value={selectedPreset}
                  onChange={(e) => applyPreset(e.target.value)}
                  data-ocid="conditions.preset.select"
                >
                  {DND_CONDITIONS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name (auto-filled, editable) */}
              <div>
                <div className="ds-label" style={{ marginBottom: 4 }}>
                  Name *
                </div>
                <input
                  ref={nameRef}
                  className="ds-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Condition name"
                  data-ocid="conditions.name_input"
                />
              </div>

              {/* Description */}
              <div>
                <div className="ds-label" style={{ marginBottom: 4 }}>
                  Description
                </div>
                <textarea
                  className="ds-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={4}
                  style={{ resize: "vertical" }}
                  placeholder="What does this condition do?"
                  data-ocid="conditions.description_textarea"
                />
              </div>

              {/* Duration */}
              <div>
                <div className="ds-label" style={{ marginBottom: 4 }}>
                  Duration
                </div>
                <input
                  className="ds-input"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  placeholder="e.g. 1 minute, until long rest..."
                  data-ocid="conditions.duration_input"
                />
              </div>

              {/* Auto-remove on rest */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--ds-text)",
                }}
                data-ocid="conditions.auto_remove_checkbox"
              >
                <input
                  type="checkbox"
                  checked={form.autoRemoveOnRest}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      autoRemoveOnRest: e.target.checked,
                    }))
                  }
                  style={{ accentColor: "var(--ds-gold)" }}
                />
                Automatically remove on rest
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setShowForm(false)}
                data-ocid="conditions.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleAdd}
                disabled={!form.name.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
                data-ocid="conditions.submit_button"
              >
                Add Condition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

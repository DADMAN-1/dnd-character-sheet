import { useCallback, useEffect, useRef, useState } from "react";
import type { DndBackend, MulticlassEntry } from "../../types";
import { CanisterErrorUI, isCanisterStopped } from "../ErrorBoundary";

interface Props {
  actor: DndBackend;
  characterId: number;
  onRestartConnection?: () => void;
}

// D&D 5e multiclass spell slot table (total caster level → slots per spell level)
// rows = caster level 1-20, cols = spell levels 1-9
const MULTICLASS_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];

function getCasterLevel(entries: MulticlassEntry[]): number {
  // Half-casters (Paladin, Ranger) count at half; full-casters at full; simplified: use class name
  const HALF_CASTERS = ["paladin", "ranger", "artificer"];
  const THIRD_CASTERS = ["arcane trickster", "eldritch knight"];
  let total = 0;
  for (const e of entries) {
    if (!e.isSpellcaster || e.level <= 0) continue;
    const lower = e.className.toLowerCase();
    if (THIRD_CASTERS.some((t) => lower.includes(t))) {
      total += Math.floor(e.level / 3);
    } else if (HALF_CASTERS.some((t) => lower.includes(t))) {
      total += Math.floor(e.level / 2);
    } else {
      total += e.level;
    }
  }
  return Math.min(20, total);
}

function getSpellSlots(casterLevel: number): number[] {
  if (casterLevel <= 0) return [];
  const row = MULTICLASS_SLOTS[Math.min(casterLevel, 20) - 1];
  return row;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function MulticlassTab({
  actor,
  characterId,
  onRestartConnection,
}: Props) {
  const [entries, setEntries] = useState<MulticlassEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [levelInput, setLevelInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getCharacterMulticlass(BigInt(characterId));
      setEntries(data ?? []);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      console.error("Failed to load multiclass:", e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveEntries = useCallback(
    (next: MulticlassEntry[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await actor.updateCharacterMulticlass(BigInt(characterId), next);
        } catch (e) {
          if (isCanisterStopped(e)) setCanisterStopped(true);
          else console.error("Failed to save multiclass:", e);
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [actor, characterId],
  );

  const update = (next: MulticlassEntry[]) => {
    setEntries(next);
    saveEntries(next);
  };

  const addEntry = () => {
    const entry: MulticlassEntry = {
      id: makeId(),
      className: "New Class",
      level: 1,
      spellcastingMod: "none",
      isSpellcaster: false,
    };
    update([...entries, entry]);
  };

  const removeEntry = (id: string) => {
    update(entries.filter((e) => e.id !== id));
  };

  const patch = <K extends keyof MulticlassEntry>(
    id: string,
    key: K,
    value: MulticlassEntry[K],
  ) => {
    update(entries.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
  };

  const commitLevel = (id: string) => {
    const val = Number(levelInput);
    const safe = Number.isNaN(val) || val < 1 ? 1 : Math.floor(val);
    patch(id, "level", safe);
    setEditingLevel(null);
    setLevelInput("");
  };

  const totalLevel = entries.reduce((s, e) => s + e.level, 0);
  const casterLevel = getCasterLevel(entries);
  const spellSlots = getSpellSlots(casterLevel);
  const spellcasters = entries.filter((e) => e.isSpellcaster && e.level > 0);

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
            MULTICLASS
          </h2>
          <span
            style={{
              fontSize: 12,
              padding: "2px 10px",
              borderRadius: 10,
              backgroundColor: "var(--ds-maroon)",
              color: "#F2E9DB",
            }}
          >
            Total Level: {totalLevel}
          </span>
          {saving && (
            <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
              Saving...
            </span>
          )}
        </div>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={addEntry}
          style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
          data-ocid="multiclass.add_button"
        >
          + Add Class
        </button>
      </div>

      {/* Class entries */}
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)" }}
          data-ocid="multiclass.loading_state"
        >
          Loading...
        </p>
      ) : entries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="multiclass.empty_state"
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚔️</div>
          <p>No classes added. Click "+ Add Class" to start multiclassing.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="ds-card2"
              style={{ padding: "14px 16px" }}
              data-ocid={`multiclass.item.${i + 1}`}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto auto",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* Class name */}
                <input
                  className="ds-input"
                  value={entry.className}
                  onChange={(e) => patch(entry.id, "className", e.target.value)}
                  placeholder="Class name"
                  style={{ fontWeight: 600 }}
                  data-ocid={`multiclass.class_name.${i + 1}`}
                />

                {/* Level */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    minWidth: 90,
                  }}
                >
                  <span
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 11,
                      whiteSpace: "nowrap",
                    }}
                  >
                    LVL
                  </span>
                  {editingLevel === entry.id ? (
                    <input
                      type="number"
                      min={1}
                      value={levelInput}
                      onChange={(e) => setLevelInput(e.target.value)}
                      onBlur={() => commitLevel(entry.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitLevel(entry.id);
                        if (e.key === "Escape") {
                          setEditingLevel(null);
                          setLevelInput("");
                        }
                      }}
                      style={{
                        width: 52,
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--ds-gold)",
                        backgroundColor: "var(--ds-surface2)",
                        border: "1px solid var(--ds-gold)",
                        borderRadius: 4,
                        padding: "2px 4px",
                      }}
                      // biome-ignore lint/a11y/noAutofocus: intentional focus on direct edit
                      autoFocus
                      data-ocid={`multiclass.level_input.${i + 1}`}
                    />
                  ) : (
                    <button
                      type="button"
                      title="Click to set level directly"
                      onClick={() => {
                        setLevelInput(String(entry.level));
                        setEditingLevel(entry.id);
                      }}
                      style={{
                        color: "var(--ds-gold)",
                        fontSize: 16,
                        fontWeight: 700,
                        minWidth: 32,
                        textAlign: "center",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        borderBottom: "1px dashed var(--ds-gold)",
                        paddingBottom: 1,
                      }}
                      data-ocid={`multiclass.level_value.${i + 1}`}
                    >
                      {entry.level}
                    </button>
                  )}
                </div>

                {/* Spellcasting mod */}
                <select
                  className="ds-input"
                  value={entry.spellcastingMod}
                  onChange={(e) =>
                    patch(entry.id, "spellcastingMod", e.target.value)
                  }
                  style={{ fontSize: 12, minWidth: 80 }}
                  data-ocid={`multiclass.casting_mod.${i + 1}`}
                >
                  <option value="none">No Mod</option>
                  <option value="INT">INT</option>
                  <option value="WIS">WIS</option>
                  <option value="CHA">CHA</option>
                </select>

                {/* Spellcaster toggle */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                    color: "var(--ds-muted)",
                  }}
                  data-ocid={`multiclass.spellcaster_toggle.${i + 1}`}
                >
                  <input
                    type="checkbox"
                    checked={entry.isSpellcaster}
                    onChange={(e) =>
                      patch(entry.id, "isSpellcaster", e.target.checked)
                    }
                    style={{ accentColor: "var(--ds-gold)" }}
                  />
                  Spellcaster
                </label>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#999",
                    cursor: "pointer",
                    padding: 4,
                    fontSize: 16,
                  }}
                  aria-label={`Remove ${entry.className}`}
                  data-ocid={`multiclass.delete_button.${i + 1}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spell Slots from multiclassing */}
      {spellcasters.length > 0 && (
        <div className="ds-card" style={{ padding: 16 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 12 }}
          >
            MULTICLASS SPELL SLOTS
          </h3>
          <div
            style={{
              fontSize: 12,
              color: "var(--ds-muted)",
              marginBottom: 10,
            }}
          >
            Combined caster level: {casterLevel}
            {" | "}
            Spellcasting classes:{" "}
            {spellcasters.map((e) => `${e.className} (${e.level})`).join(", ")}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {spellSlots.map((slots, idx) =>
              slots > 0 ? (
                <div
                  key={`slot-level-${idx + 1}`}
                  style={{
                    textAlign: "center",
                    minWidth: 52,
                    padding: "8px 12px",
                    backgroundColor: "var(--ds-surface2)",
                    borderRadius: 8,
                    border: "1px solid var(--ds-border)",
                  }}
                >
                  <div
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    Level {idx + 1}
                  </div>
                  <div
                    style={{
                      color: "var(--ds-gold)",
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {slots}
                  </div>
                  <div style={{ color: "var(--ds-muted)", fontSize: 10 }}>
                    slots
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

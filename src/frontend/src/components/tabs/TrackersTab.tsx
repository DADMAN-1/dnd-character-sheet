import { useCallback, useEffect, useState } from "react";
import type {
  AttunedItem,
  DndBackend,
  InspirationState,
  RestState,
  SpellSlotState,
} from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const DEFAULT_REST: RestState = {
  shortRestsUsed: 0n,
  longRestsUsed: 0n,
  lastLongRestDate: undefined,
};
const DEFAULT_INSP: InspirationState = {
  points: 0n,
  labelText: "Inspiration",
};

export default function TrackersTab({ actor, characterId }: Props) {
  // Rest state
  const [rest, setRest] = useState<RestState>(DEFAULT_REST);
  const [restLoaded, setRestLoaded] = useState(false);

  // Inspiration
  const [inspiration, setInspiration] =
    useState<InspirationState>(DEFAULT_INSP);
  const [inspLoaded, setInspLoaded] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState("Inspiration");
  // Inline direct-edit for inspiration points
  const [editingInspValue, setEditingInspValue] = useState(false);
  const [inspDirectInput, setInspDirectInput] = useState("");

  // Attuned items
  const [attunedItems, setAttunedItems] = useState<AttunedItem[]>([]);
  const [attunedLoaded, setAttunedLoaded] = useState(false);
  const [showAttunedForm, setShowAttunedForm] = useState(false);
  const [attunedForm, setAttunedForm] = useState({ itemName: "", notes: "" });
  const [savingAttuned, setSavingAttuned] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [attunedRefreshMsg, setAttunedRefreshMsg] = useState(false);

  const load = useCallback(async () => {
    const [restRes, inspRes, attunedRes] = await Promise.allSettled([
      actor.getRestState(characterId),
      actor.getInspirationState(characterId),
      actor.getAttunedItems(characterId),
    ]);

    if (restRes.status === "fulfilled" && restRes.value) {
      setRest(restRes.value);
    } else {
      setRest({ ...DEFAULT_REST });
    }
    setRestLoaded(true);

    if (inspRes.status === "fulfilled" && inspRes.value) {
      setInspiration(inspRes.value);
      setLabelInput(inspRes.value.labelText || "Inspiration");
    } else {
      setInspiration({ ...DEFAULT_INSP });
      setLabelInput("Inspiration");
    }
    setInspLoaded(true);

    if (attunedRes.status === "fulfilled") {
      setAttunedItems(attunedRes.value);
    } else {
      setAttunedItems([]);
    }
    setAttunedLoaded(true);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  // --- Rest handlers ---
  const doShortRest = async () => {
    const next: RestState = {
      ...rest,
      shortRestsUsed: rest.shortRestsUsed + 1n,
    };
    setRest(next);
    await actor.updateRestState(characterId, next);

    // Short rest: reset inspiration to 0
    const inspNext: InspirationState = { ...inspiration, points: 0n };
    setInspiration(inspNext);
    await actor.updateInspirationState(characterId, inspNext);
  };

  const doLongRest = async () => {
    const next: RestState = {
      ...rest,
      longRestsUsed: rest.longRestsUsed + 1n,
      lastLongRestDate: new Date().toISOString().split("T")[0],
    };
    setRest(next);
    await actor.updateRestState(characterId, next);

    // Long rest: reset HP, spell slots, inspiration, clear temp HP
    const [hpRes, slotsRes] = await Promise.allSettled([
      actor.getHPState(characterId),
      actor.getSpellSlotsByCharacter(characterId),
    ]);
    if (hpRes.status === "fulfilled" && hpRes.value) {
      await actor.updateHPState(characterId, {
        ...hpRes.value,
        hpCurrent: hpRes.value.hpMax,
        hpTemp: 0n,
      });
    }
    if (slotsRes.status === "fulfilled") {
      const resetSlots: SpellSlotState[] = slotsRes.value.map((s) => ({
        ...s,
        used: 0n,
      }));
      if (resetSlots.length > 0)
        await actor.updateSpellSlots(characterId, resetSlots);
    }
    // Reset inspiration to 0 on long rest
    const inspNext: InspirationState = { ...inspiration, points: 0n };
    setInspiration(inspNext);
    await actor.updateInspirationState(characterId, inspNext);
    // Show attunement refresh note
    setAttunedRefreshMsg(true);
    setTimeout(() => setAttunedRefreshMsg(false), 5000);
  };

  // --- Inspiration handlers ---
  const adjustInspiration = async (delta: number) => {
    const raw = Number(inspiration.points) + delta;
    const next: InspirationState = {
      ...inspiration,
      points: BigInt(Math.max(0, raw)),
    };
    setInspiration(next);
    await actor.updateInspirationState(characterId, next);
  };
  const commitInspirationDirect = async () => {
    const val = Number(inspDirectInput);
    const safe = Number.isNaN(val) ? 0 : Math.max(0, val);
    const next: InspirationState = { ...inspiration, points: BigInt(safe) };
    setInspiration(next);
    setEditingInspValue(false);
    setInspDirectInput("");
    await actor.updateInspirationState(characterId, next);
  };
  const saveLabel = async () => {
    const next: InspirationState = { ...inspiration, labelText: labelInput };
    setInspiration(next);
    await actor.updateInspirationState(characterId, next);
    setEditingLabel(false);
  };

  // --- Attuned item handlers ---
  const addAttunedItem = async () => {
    if (!attunedForm.itemName.trim()) return;
    setSavingAttuned(true);
    const item: AttunedItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      itemName: attunedForm.itemName.trim(),
      notes: attunedForm.notes,
    };
    await actor.addAttunedItem(characterId, item);
    setAttunedItems((prev) => [...prev, item]);
    setAttunedForm({ itemName: "", notes: "" });
    setShowAttunedForm(false);
    setSavingAttuned(false);
  };
  const removeAttunedItem = async (id: string) => {
    if (!confirm("Remove this attuned item?")) return;
    setRemovingId(id);
    await actor.removeAttunedItem(characterId, id);
    setAttunedItems((prev) => prev.filter((i) => i.id !== id));
    setRemovingId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Rest Tracker */}
      {restLoaded && (
        <div className="ds-card" style={{ padding: 16 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 14 }}
          >
            REST TRACKER
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {/* Short Rest */}
            <div
              style={{
                backgroundColor: "var(--ds-surface2)",
                border: "1px solid var(--ds-border)",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                Short Rests
              </div>
              <div
                style={{
                  color: "var(--ds-text)",
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {rest.shortRestsUsed.toString()}
              </div>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12, width: "100%" }}
                onClick={doShortRest}
                data-ocid="trackers.short_rest_button"
              >
                Take Short Rest
              </button>
              <p
                style={{ color: "var(--ds-muted)", fontSize: 11, marginTop: 6 }}
              >
                Recover Hit Dice, some abilities
              </p>
            </div>
            {/* Long Rest */}
            <div
              style={{
                backgroundColor: "var(--ds-surface2)",
                border: "1px solid var(--ds-border)",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                Long Rests
              </div>
              <div
                style={{
                  color: "var(--ds-text)",
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {rest.longRestsUsed.toString()}
              </div>
              <button
                type="button"
                className="ds-btn-primary"
                style={{
                  fontSize: 12,
                  width: "100%",
                  fontFamily: "Cinzel, serif",
                }}
                onClick={doLongRest}
                data-ocid="trackers.long_rest_button"
              >
                Take Long Rest
              </button>
              <p
                style={{ color: "var(--ds-muted)", fontSize: 11, marginTop: 6 }}
              >
                Restores HP, spell slots, resets abilities
              </p>
            </div>
          </div>
          {rest.lastLongRestDate && (
            <p
              style={{ color: "var(--ds-muted)", fontSize: 12, marginTop: 10 }}
            >
              Last long rest: {rest.lastLongRestDate}
            </p>
          )}
        </div>
      )}

      {/* Inspiration Tracker */}
      {inspLoaded && (
        <div className="ds-card" style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            {editingLabel ? (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <input
                  className="ds-input"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  style={{ maxWidth: 200, fontSize: 12 }}
                  data-ocid="trackers.inspiration_label_input"
                />
                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ fontSize: 12 }}
                  onClick={saveLabel}
                  data-ocid="trackers.inspiration_label_save"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 12 }}
                  onClick={() => setEditingLabel(false)}
                >
                  ×
                </button>
              </div>
            ) : (
              <h3
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 14 }}
              >
                {inspiration.labelText?.toUpperCase() || "INSPIRATION"}
              </h3>
            )}
            {!editingLabel && (
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 11, padding: "2px 8px" }}
                onClick={() => setEditingLabel(true)}
                data-ocid="trackers.inspiration_label_edit"
              >
                Rename
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                fontSize: 18,
                fontWeight: 700,
              }}
              onClick={() => adjustInspiration(-1)}
              disabled={Number(inspiration.points) <= 0}
              data-ocid="trackers.inspiration_minus"
            >
              −
            </button>
            <div style={{ textAlign: "center" }}>
              {editingInspValue ? (
                <input
                  type="number"
                  min={0}
                  value={inspDirectInput}
                  onChange={(e) => setInspDirectInput(e.target.value)}
                  onBlur={commitInspirationDirect}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitInspirationDirect();
                    if (e.key === "Escape") {
                      setEditingInspValue(false);
                      setInspDirectInput("");
                    }
                  }}
                  style={{
                    width: 72,
                    textAlign: "center",
                    fontSize: 36,
                    fontWeight: 700,
                    fontFamily: "Cinzel, serif",
                    color: "var(--ds-gold)",
                    backgroundColor: "var(--ds-surface2)",
                    border: "1px solid var(--ds-gold)",
                    borderRadius: 4,
                    padding: "2px 4px",
                    lineHeight: 1,
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setInspDirectInput(inspiration.points.toString());
                    setEditingInspValue(true);
                  }}
                  title="Click to set value directly"
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 40,
                    fontWeight: 700,
                    fontFamily: "Cinzel, serif",
                    lineHeight: 1,
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                    borderBottom: "1px dashed var(--ds-gold)",
                    display: "inline-block",
                    paddingBottom: 1,
                  }}
                  data-ocid="trackers.inspiration_value"
                >
                  {inspiration.points.toString()}
                </button>
              )}
              <div
                style={{ color: "var(--ds-muted)", fontSize: 12, marginTop: 4 }}
              >
                {inspiration.labelText || "Inspiration"} Points
              </div>
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                fontSize: 18,
                fontWeight: 700,
              }}
              onClick={() => adjustInspiration(1)}
              data-ocid="trackers.inspiration_plus"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Attunement Tracker */}
      {attunedLoaded && (
        <div className="ds-card" style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h3
              className="font-cinzel"
              style={{ color: "var(--ds-gold)", fontSize: 14 }}
            >
              ATTUNED ITEMS ({attunedItems.length})
            </h3>
            {attunedRefreshMsg && (
              <span style={{ fontSize: 11, color: "#27ae60", marginLeft: 8 }}>
                ✓ Charges refreshed on long rest
              </span>
            )}
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12, padding: "4px 10px" }}
              onClick={() => setShowAttunedForm((v) => !v)}
              data-ocid="trackers.attunement.primary_button"
            >
              + Attune Item
            </button>
          </div>

          {showAttunedForm && (
            <div className="ds-card2" style={{ padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  className="ds-input"
                  placeholder="Item name *"
                  value={attunedForm.itemName}
                  onChange={(e) =>
                    setAttunedForm((f) => ({ ...f, itemName: e.target.value }))
                  }
                  data-ocid="trackers.attunement.input"
                />
                <input
                  className="ds-input"
                  placeholder="Notes (optional)"
                  value={attunedForm.notes}
                  onChange={(e) =>
                    setAttunedForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => setShowAttunedForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ds-btn-primary"
                    style={{ fontSize: 12 }}
                    onClick={addAttunedItem}
                    disabled={savingAttuned || !attunedForm.itemName.trim()}
                    data-ocid="trackers.attunement.submit_button"
                  >
                    {savingAttuned ? "Adding..." : "Attune"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {attunedItems.length === 0 ? (
            <p
              style={{
                color: "var(--ds-muted)",
                fontSize: 13,
                textAlign: "center",
                padding: "16px 0",
              }}
              data-ocid="trackers.attunement.empty_state"
            >
              No attuned items. Attune to magical items to track them here.
            </p>
          ) : (
            attunedItems.map((item, i) => (
              <div
                key={item.id}
                className="ds-card2"
                style={{
                  padding: 12,
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
                data-ocid={`trackers.attunement.item.${i + 1}`}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "var(--ds-text)",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    ✨ {item.itemName}
                  </div>
                  {item.notes && (
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {item.notes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAttunedItem(item.id)}
                  disabled={removingId === item.id}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    padding: 4,
                    fontSize: 16,
                  }}
                  data-ocid={`trackers.attunement.delete_button.${i + 1}`}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

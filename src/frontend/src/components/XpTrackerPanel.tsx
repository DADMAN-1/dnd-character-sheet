import { useCallback, useEffect, useState } from "react";
import type { Character, DndBackend, XpState } from "../types";
import { XP_THRESHOLDS } from "../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
  characterLevel: bigint;
  character: Character;
  onUpdate: () => Promise<void>;
}

const DEFAULT_XP: XpState = {
  characterId: 0n,
  xp: 0n,
  totalXpEarned: 0n,
  milestoneMode: false,
  milestoneNotes: "",
};

function getXpForLevel(level: number): bigint {
  if (level <= 0) return 0n;
  if (level - 1 < XP_THRESHOLDS.length) return XP_THRESHOLDS[level - 1];
  // Beyond level 20 — extrapolate at 50k per level
  return (
    XP_THRESHOLDS[XP_THRESHOLDS.length - 1] +
    BigInt((level - XP_THRESHOLDS.length) * 50000)
  );
}

/** Compute what level corresponds to totalXpEarned (client-side mirror of backend logic). */
function computeLevelFromXp(totalXp: bigint): number {
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (totalXp >= XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  // Beyond level 20: +50k per level
  if (level >= 20) {
    const base = XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
    if (totalXp >= base) {
      const extra = Number(totalXp - base);
      level = 20 + Math.floor(extra / 50000);
    }
  }
  return level;
}

export default function XpTrackerPanel({
  actor,
  characterId,
  characterLevel,
  character,
  onUpdate,
}: Props) {
  const [xpState, setXpState] = useState<XpState>(DEFAULT_XP);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [xpInput, setXpInput] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null);
  const [manualLevelInput, setManualLevelInput] = useState("");
  const [manualLevelError, setManualLevelError] = useState<string | null>(null);
  const [savingManualLevel, setSavingManualLevel] = useState(false);

  const load = useCallback(async () => {
    try {
      const state = await actor.getXpState(characterId);
      if (state) {
        setXpState(state);
        setXpInput(state.xp.toString());
      } else {
        const def = { ...DEFAULT_XP, characterId };
        setXpState(def);
        setXpInput("0");
      }
    } catch {
      const def = { ...DEFAULT_XP, characterId };
      setXpState(def);
      setXpInput("0");
    }
    setLoaded(true);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveAndApplyLevel = async (updated: XpState) => {
    setSaving(true);
    const oldLevel = Number(characterLevel);
    try {
      await actor.updateXpState(characterId, updated);
      setXpState(updated);
      const newCalcLevel = computeLevelFromXp(updated.totalXpEarned);
      if (newCalcLevel > oldLevel) {
        setLevelUpMsg(
          `\uD83C\uDF89 Level Up! You are now level ${newCalcLevel}!`,
        );
        setTimeout(() => setLevelUpMsg(null), 4000);
      }
      await onUpdate();
    } catch {
      // silent
    }
    setSaving(false);
  };

  const toggleMode = () => {
    const updated = { ...xpState, milestoneMode: !xpState.milestoneMode };
    saveAndApplyLevel(updated);
  };

  const handleXpSet = () => {
    const val = BigInt(xpInput || "0");
    const updated = {
      ...xpState,
      xp: val,
      totalXpEarned: val > xpState.totalXpEarned ? val : xpState.totalXpEarned,
    };
    saveAndApplyLevel(updated);
  };

  const handleAddXp = async () => {
    const amount = BigInt(addAmount || "0");
    if (amount <= 0n) {
      setAddMode(false);
      setAddAmount("");
      return;
    }
    const updated = {
      ...xpState,
      xp: xpState.xp + amount,
      totalXpEarned: xpState.totalXpEarned + amount,
    };
    const oldLevel = characterLevel;
    setSaving(true);
    try {
      await actor.updateXpState(characterId, updated);
      setXpState(updated);
      setXpInput(updated.xp.toString());
      await onUpdate();
      // After onUpdate the parent re-renders; characterLevel prop is stale here
      // but React will re-render with new value. We flash level-up if it changed.
      // Use a small delay to let the parent state settle
      setTimeout(() => {
        // At this point characterLevel in closure is the OLD value;
        // if parent re-rendered, new renders will have new level.
        // We show the banner unconditionally for 3s based on whether xp crossed a threshold.
        const newCalcLevel = computeLevelFromXp(updated.totalXpEarned);
        if (newCalcLevel > Number(oldLevel)) {
          setLevelUpMsg(`🎉 Level Up! You are now level ${newCalcLevel}!`);
          setTimeout(() => setLevelUpMsg(null), 4000);
        }
      }, 300);
    } catch {
      // silent
    }
    setSaving(false);
    setAddMode(false);
    setAddAmount("");
  };

  const handleSetLevelManually = async () => {
    const parsed = Number(manualLevelInput);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10000) {
      setManualLevelError("Level must be a whole number between 1 and 10,000.");
      return;
    }
    setManualLevelError(null);
    setSavingManualLevel(true);
    try {
      const newLevel = BigInt(parsed);
      const newProfBonus = BigInt(Math.floor((parsed - 1) / 4) + 2);
      const updated: Character = {
        ...character,
        level: newLevel,
        proficiencyBonus: newProfBonus,
      };
      await actor.updateCharacter(characterId, updated);
      setLevelUpMsg(
        `⚔️ Level set to ${parsed}! Proficiency bonus: +${newProfBonus}`,
      );
      setTimeout(() => setLevelUpMsg(null), 4000);
      setManualLevelInput("");
      await onUpdate();
    } catch {
      setManualLevelError("Failed to save. Please try again.");
    }
    setSavingManualLevel(false);
  };

  const handleMilestoneNotes = async (notes: string) => {
    const updated = { ...xpState, milestoneNotes: notes };
    setXpState(updated);
    await actor.updateXpState(characterId, updated);
  };

  if (!loaded) return null;

  const level = Number(characterLevel);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpForRange = nextLevelXp - currentLevelXp;
  const xpInRange =
    xpState.xp >= currentLevelXp ? xpState.xp - currentLevelXp : 0n;
  const progressPct =
    xpForRange > 0n
      ? Math.min(100, Math.round(Number((xpInRange * 100n) / xpForRange)))
      : 100;

  return (
    <div
      className="ds-card"
      style={{ padding: "16px 18px", marginBottom: 20 }}
      data-ocid="character.xp.panel"
    >
      {/* Manual Level Override section — always visible above the banner */}
      <div
        style={{
          marginBottom: 14,
          padding: "10px 14px",
          borderRadius: 6,
          background: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
        }}
        data-ocid="character.xp.manual_level_section"
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ds-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ⚔️ Manual Level Override
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            className="ds-input"
            type="number"
            min="1"
            max="10000"
            value={manualLevelInput}
            onChange={(e) => {
              setManualLevelInput(e.target.value);
              setManualLevelError(null);
            }}
            placeholder={`Current: ${Number(characterLevel)}`}
            style={{ width: 140, fontSize: 13 }}
            data-ocid="character.xp.manual_level_input"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSetLevelManually();
            }}
          />
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontSize: 12, padding: "5px 12px" }}
            onClick={handleSetLevelManually}
            disabled={savingManualLevel || manualLevelInput === ""}
            data-ocid="character.xp.set_level_button"
          >
            {savingManualLevel ? "Saving…" : "Set Level"}
          </button>
          <span style={{ fontSize: 12, color: "var(--ds-muted)" }}>
            Level 1–10,000
          </span>
        </div>
        {manualLevelError && (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--ds-danger, #e05252)",
            }}
            data-ocid="character.xp.manual_level.error_state"
          >
            {manualLevelError}
          </div>
        )}
      </div>
      {/* Level-up banner */}
      {levelUpMsg && (
        <div
          style={{
            background: "linear-gradient(90deg, var(--ds-gold), #f0c060)",
            color: "#1a1200",
            padding: "10px 16px",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 12,
            textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          }}
          data-ocid="character.xp.levelup_banner"
        >
          {levelUpMsg}
        </div>
      )}

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 16 }}
        >
          ✨ XP & Leveling
        </h3>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12, padding: "4px 10px" }}
          onClick={toggleMode}
          data-ocid="character.xp.mode_toggle"
        >
          {xpState.milestoneMode ? "📍 Milestone Mode" : "📊 XP Mode"}
        </button>
      </div>

      {!xpState.milestoneMode ? (
        <div>
          {/* XP display */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                className="ds-label"
                style={{ fontSize: 11, marginBottom: 2 }}
              >
                Current XP
              </div>
              <div
                style={{
                  color: "var(--ds-text)",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {xpState.xp.toLocaleString()}
              </div>
            </div>
            <div>
              <div
                className="ds-label"
                style={{ fontSize: 11, marginBottom: 2 }}
              >
                Total Earned
              </div>
              <div style={{ color: "var(--ds-muted)", fontSize: 16 }}>
                {xpState.totalXpEarned.toLocaleString()}
              </div>
            </div>
            <div>
              <div
                className="ds-label"
                style={{ fontSize: 11, marginBottom: 2 }}
              >
                Next Level
              </div>
              <div style={{ color: "var(--ds-muted)", fontSize: 16 }}>
                {level < 20 ? nextLevelXp.toLocaleString() : "Max"}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {level < 20 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                  fontSize: 12,
                  color: "var(--ds-muted)",
                }}
              >
                <span>
                  Level {level} → {level + 1}
                </span>
                <span>
                  {progressPct}% ({xpInRange.toLocaleString()} /{" "}
                  {xpForRange.toLocaleString()} XP)
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  backgroundColor: "var(--ds-surface)",
                  borderRadius: 4,
                  border: "1px solid var(--ds-border)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPct}%`,
                    background:
                      "linear-gradient(90deg, var(--ds-gold), #f0c060)",
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {addMode ? (
              <>
                <input
                  className="ds-input"
                  type="number"
                  min="0"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="XP to add"
                  style={{ width: 120, fontSize: 13 }}
                  data-ocid="character.xp.add_input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddXp();
                    if (e.key === "Escape") {
                      setAddMode(false);
                      setAddAmount("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ fontSize: 12, padding: "5px 12px" }}
                  onClick={handleAddXp}
                  disabled={saving}
                  data-ocid="character.xp.confirm_add_button"
                >
                  + Add XP
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    setAddMode(false);
                    setAddAmount("");
                  }}
                  data-ocid="character.xp.cancel_button"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ fontSize: 12, padding: "5px 12px" }}
                  onClick={() => setAddMode(true)}
                  data-ocid="character.xp.add_button"
                >
                  + Add XP
                </button>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={xpInput}
                    onChange={(e) => setXpInput(e.target.value)}
                    style={{ width: 110, fontSize: 13 }}
                    data-ocid="character.xp.set_input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleXpSet();
                    }}
                  />
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "5px 10px" }}
                    onClick={handleXpSet}
                    disabled={saving}
                    data-ocid="character.xp.set_button"
                  >
                    Set XP
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p
            style={{ fontSize: 13, color: "var(--ds-muted)", marginBottom: 10 }}
          >
            Milestone mode: track progress by narrative milestones instead of
            XP.
          </p>
          <div className="ds-label" style={{ marginBottom: 4 }}>
            Milestones & Notes
          </div>
          <textarea
            className="ds-input"
            rows={4}
            value={xpState.milestoneNotes}
            onChange={(e) =>
              setXpState((s) => ({ ...s, milestoneNotes: e.target.value }))
            }
            onBlur={(e) => handleMilestoneNotes(e.target.value)}
            placeholder="e.g. ✓ Completed Goblin Cave, ✓ Spoke to the Dragon, ☐ Reach the capital..."
            data-ocid="character.xp.milestone_notes.textarea"
          />
        </div>
      )}
    </div>
  );
}

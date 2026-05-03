import { useCallback, useEffect, useState } from "react";
import type {
  DndBackend,
  OfficerSkill,
  OfficerSkillEntry,
} from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

function computeBonusSummary(entries: OfficerSkillEntry[]): string[] {
  const bonuses: string[] = [];
  let totalRating = 0;
  let skillCount = 0;
  for (const entry of entries) {
    for (const skill of entry.skills) {
      totalRating += skill.rating;
      skillCount++;
      if (skill.effect) bonuses.push(skill.effect);
    }
  }
  if (skillCount === 0) return [];
  const avgRating = (totalRating / skillCount).toFixed(1);
  return [
    `${skillCount} officer skill${skillCount !== 1 ? "s" : ""} active — avg rating ${avgRating}/10`,
    ...bonuses,
  ];
}

export default function OfficerSkillsPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [entries, setEntries] = useState<OfficerSkillEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [newOfficerName, setNewOfficerName] = useState("");
  const [showAddOfficer, setShowAddOfficer] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getArmyOfficerSkills(BigInt(armyId));
      setEntries(data ?? []);
    } catch (e) {
      if (isCanisterStopped(e)) setCanisterStopped(true);
      else setEntries([]);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    async (updated: OfficerSkillEntry[]) => {
      setSaving(true);
      setError(null);
      try {
        await actor.updateArmyOfficerSkills(BigInt(armyId), updated);
        setEntries(updated);
      } catch (e) {
        if (isCanisterStopped(e)) setCanisterStopped(true);
        else setError(e instanceof Error ? e.message : "Failed to save");
      }
      setSaving(false);
    },
    [actor, armyId],
  );

  const handleAddOfficer = async () => {
    if (!newOfficerName.trim()) return;
    const newEntry: OfficerSkillEntry = {
      officerId: newOfficerName.trim(),
      armyId: Number(armyId),
      skills: [{ skillName: "", rating: 5, effect: "" }],
    };
    await persist([...entries, newEntry]);
    setNewOfficerName("");
    setShowAddOfficer(false);
  };

  const handleAddSkill = async (officerId: string) => {
    const updated = entries.map((e) =>
      e.officerId === officerId
        ? {
            ...e,
            skills: [
              ...e.skills,
              { skillName: "", rating: 5, effect: "" } satisfies OfficerSkill,
            ],
          }
        : e,
    );
    await persist(updated);
  };

  const handleSkillChange = (
    officerId: string,
    skillIdx: number,
    field: keyof OfficerSkill,
    value: string | number,
  ) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.officerId === officerId
          ? {
              ...e,
              skills: e.skills.map((s, i) =>
                i === skillIdx ? { ...s, [field]: value } : s,
              ),
            }
          : e,
      ),
    );
  };

  const handleSkillBlur = async () => {
    await persist(entries);
  };

  const handleDeleteSkill = async (officerId: string, skillIdx: number) => {
    const updated = entries.map((e) =>
      e.officerId === officerId
        ? { ...e, skills: e.skills.filter((_, i) => i !== skillIdx) }
        : e,
    );
    await persist(updated);
  };

  const handleDeleteOfficer = async (officerId: string) => {
    if (!confirm(`Remove all skills for ${officerId}?`)) return;
    await persist(entries.filter((e) => e.officerId !== officerId));
  };

  const bonusSummary = computeBonusSummary(entries);

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
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15, margin: 0 }}
        >
          🎖️ Officer Skills
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setShowAddOfficer(true);
            setError(null);
          }}
          data-ocid="army.officerskills.add_officer_button"
        >
          + Add Officer
        </button>
      </div>

      {saving && (
        <p style={{ color: "var(--ds-muted)", fontSize: 12 }}>Saving…</p>
      )}
      {error && (
        <span
          style={{ color: "#c0392b", fontSize: 12 }}
          data-ocid="army.officerskills.error_state"
        >
          {error}
        </span>
      )}

      {/* Passive bonus summary */}
      {bonusSummary.length > 0 && (
        <div
          style={{
            background: "rgba(212,175,55,0.07)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
          }}
          data-ocid="army.officerskills.bonus_summary"
        >
          <div
            className="ds-label"
            style={{ color: "var(--ds-gold)", marginBottom: 6 }}
          >
            ✨ Passive Army Bonuses
          </div>
          {bonusSummary.map((b, i) => (
            <div
              key={`${typeof b === "string" ? b : ((b as { skill?: string; name?: string }).skill ?? (b as { skill?: string; name?: string }).name ?? i)}-${i}`}
              style={{
                fontSize: 12,
                color: i === 0 ? "var(--ds-text)" : "var(--ds-muted)",
                marginBottom: 2,
              }}
            >
              {i === 0 ? b : `• ${b}`}
            </div>
          ))}
        </div>
      )}

      {/* Add officer name input */}
      {showAddOfficer && (
        <div
          className="ds-card2"
          style={{
            padding: 12,
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1 }}>
            <label htmlFor="new-officer-name" className="ds-label">
              Officer Name / ID *
            </label>
            <input
              id="new-officer-name"
              className="ds-input"
              value={newOfficerName}
              onChange={(e) => setNewOfficerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddOfficer()}
              placeholder="e.g. Captain Aldric"
              style={{ fontSize: 13 }}
              data-ocid="army.officerskills.officer_name.input"
            />
          </div>
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontSize: 12, whiteSpace: "nowrap" }}
            onClick={handleAddOfficer}
            disabled={saving || !newOfficerName.trim()}
            data-ocid="army.officerskills.confirm_officer_button"
          >
            Add Officer
          </button>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => {
              setShowAddOfficer(false);
              setNewOfficerName("");
            }}
            data-ocid="army.officerskills.cancel_officer_button"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Officer blocks */}
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 13 }}
          data-ocid="army.officerskills.loading_state"
        >
          Loading officer skills…
        </p>
      ) : entries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--ds-muted)",
            fontSize: 13,
          }}
          data-ocid="army.officerskills.empty_state"
        >
          No officer skills tracked yet. Add an officer to assign skills that
          passively benefit the army.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {entries.map((entry, entryIdx) => (
            <div
              key={entry.officerId}
              className="ds-card"
              style={{ padding: 14 }}
              data-ocid={`army.officerskills.officer.${entryIdx + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div
                  className="font-cinzel"
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {entry.officerId}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => handleAddSkill(entry.officerId)}
                    data-ocid={`army.officerskills.add_skill_button.${entryIdx + 1}`}
                  >
                    + Add Skill
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11, color: "#c0392b" }}
                    onClick={() => handleDeleteOfficer(entry.officerId)}
                    data-ocid={`army.officerskills.delete_officer_button.${entryIdx + 1}`}
                  >
                    Remove Officer
                  </button>
                </div>
              </div>

              {entry.skills.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 12,
                    fontStyle: "italic",
                  }}
                >
                  No skills yet — click "+ Add Skill" to add one.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {entry.skills.map((skill, skillIdx) => (
                    <div
                      key={`${entry.officerId}-${skillIdx}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 110px 1fr auto",
                        gap: 8,
                        alignItems: "flex-end",
                      }}
                      data-ocid={`army.officerskills.skill.${entryIdx + 1}.${skillIdx + 1}`}
                    >
                      <div>
                        {skillIdx === 0 && (
                          <div className="ds-label">Skill Name</div>
                        )}
                        <input
                          className="ds-input"
                          value={skill.skillName}
                          onChange={(e) =>
                            handleSkillChange(
                              entry.officerId,
                              skillIdx,
                              "skillName",
                              e.target.value,
                            )
                          }
                          onBlur={handleSkillBlur}
                          placeholder="e.g. Battlefield Medicine"
                          style={{ fontSize: 13 }}
                        />
                      </div>

                      <div>
                        {skillIdx === 0 && (
                          <div className="ds-label">Rating (1–10)</div>
                        )}
                        <input
                          type="number"
                          min={1}
                          max={10}
                          className="ds-input"
                          value={skill.rating}
                          onChange={(e) =>
                            handleSkillChange(
                              entry.officerId,
                              skillIdx,
                              "rating",
                              Math.min(
                                10,
                                Math.max(1, Number(e.target.value) || 1),
                              ),
                            )
                          }
                          onBlur={handleSkillBlur}
                          style={{ fontSize: 13, textAlign: "center" }}
                          data-ocid={`army.officerskills.rating.${entryIdx + 1}.${skillIdx + 1}`}
                        />
                      </div>

                      <div>
                        {skillIdx === 0 && (
                          <div className="ds-label">Passive Effect</div>
                        )}
                        <input
                          className="ds-input"
                          value={skill.effect}
                          onChange={(e) =>
                            handleSkillChange(
                              entry.officerId,
                              skillIdx,
                              "effect",
                              e.target.value,
                            )
                          }
                          onBlur={handleSkillBlur}
                          placeholder="e.g. Reduces casualty rate by 5%"
                          style={{ fontSize: 13 }}
                        />
                      </div>

                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{
                          fontSize: 11,
                          padding: "4px 6px",
                          color: "#c0392b",
                          marginTop: skillIdx === 0 ? 18 : 0,
                        }}
                        onClick={() =>
                          handleDeleteSkill(entry.officerId, skillIdx)
                        }
                        data-ocid={`army.officerskills.delete_skill_button.${entryIdx + 1}.${skillIdx + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

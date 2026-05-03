import { useEffect, useMemo, useState } from "react";
import type {
  ArmyAbility,
  ArmyBranch,
  ArmyLoadout,
  ArmyOfficer,
  ArmyRank,
} from "../../../types";
import ArmyAbilityList from "./ArmyAbilityList";
import {
  HMC_PRESET_BRANCHES,
  distributeTroopsAcrossRanks,
  uid,
} from "./armyHelpers";

interface Props {
  branches: ArmyBranch[];
  officers: ArmyOfficer[];
  ranks?: ArmyRank[];
  armySize?: bigint;
  onChange: (branches: ArmyBranch[]) => void;
  onRanksChange?: (ranks: ArmyRank[]) => void;
}

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
// ─── Distribution helpers ────────────────────────────────────────────────────

const HMC_DEFAULT_WEIGHTS: Record<string, number> = {
  "standard infantry": 35,
  "naval branch": 12,
  "cavalry branch": 10,
  "h.m.c. guard division": 10,
  "officer corps": 8,
  "logistics & supply": 8,
  "high command": 6,
  "intelligence division": 6,
  "spec ops / special operations": 5,
};

function buildDefaultWeights(branches: ArmyBranch[]): Record<string, number> {
  const weights: Record<string, number> = {};
  const even = branches.length > 0 ? Math.floor(100 / branches.length) : 0;
  branches.forEach((b, i) => {
    const key = b.name.toLowerCase();
    const hmcMatch = HMC_DEFAULT_WEIGHTS[key];
    weights[b.id] = hmcMatch !== undefined ? hmcMatch : even;
    // last branch absorbs rounding remainder for even distribution
    if (hmcMatch === undefined && i === branches.length - 1) {
      const sum = Object.values(weights).reduce((a, v) => a + v, 0);
      weights[b.id] = Math.max(0, weights[b.id] + (100 - sum));
    }
  });
  return weights;
}

function calculateDistribution(
  totalSoldiers: number,
  branches: ArmyBranch[],
  weights: Record<string, number>,
): Record<string, bigint> {
  const result: Record<string, bigint> = {};
  let remaining = totalSoldiers;
  let largestId = branches[0]?.id ?? "";
  let largestCount = 0;

  for (const b of branches) {
    const w = weights[b.id] ?? 0;
    const count = Math.round((totalSoldiers * w) / 100);
    result[b.id] = BigInt(count);
    remaining -= count;
    if (count > largestCount) {
      largestCount = count;
      largestId = b.id;
    }
  }

  // Add rounding remainder to largest branch
  if (largestId && remaining !== 0) {
    result[largestId] = BigInt(
      Math.max(0, Number(result[largestId]) + remaining),
    );
  }
  return result;
}

const emptyBranch = (): Omit<ArmyBranch, "id"> => ({
  name: "",
  headcount: 0n,
  trainingLevel: "Regular",
  condition: "Rested",
  abilities: [],
  loadouts: [],
  specialties: [],
  officerIds: [],
  deploymentLocation: "",
  interBranchNotes: "",
  veteranFlag: false,
  machineryIds: [],
});

/** Extract rank code from a rank name, e.g. "E-1 H.M.C Recruit" → "E-1", "E5-1 Head..." → "E5-1" */
function getRankCode(rank: ArmyRank): string {
  return rank.name.split(" ")[0];
}

export default function ArmyBranchesPanel({
  branches,
  officers,
  ranks = [],
  armySize,
  onChange,
  onRanksChange,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  // ── Distribution state ────────────────────────────────────────────────────
  const [distOpen, setDistOpen] = useState(false);
  const [totalSoldiers, setTotalSoldiers] = useState(
    armySize !== undefined ? Number(armySize) : 0,
  );
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Sync totalSoldiers when armySize prop changes
  useEffect(() => {
    if (armySize !== undefined) {
      setTotalSoldiers(Number(armySize));
    }
  }, [armySize]);

  // Rebuild weights when branches change (new branch added, etc.)
  const effectiveWeights = useMemo(() => {
    const defaults = buildDefaultWeights(branches);
    const merged: Record<string, number> = {};
    for (const b of branches) {
      merged[b.id] =
        weights[b.id] !== undefined ? weights[b.id] : defaults[b.id];
    }
    return merged;
  }, [branches, weights]);

  const weightTotal = useMemo(
    () => branches.reduce((sum, b) => sum + (effectiveWeights[b.id] ?? 0), 0),
    [branches, effectiveWeights],
  );

  const preview = useMemo(
    () => calculateDistribution(totalSoldiers, branches, effectiveWeights),
    [totalSoldiers, branches, effectiveWeights],
  );

  const resetWeightsToDefaults = () => {
    setWeights({});
  };

  const handleWeightChange = (branchId: string, val: number) => {
    setWeights((prev) => ({ ...prev, [branchId]: val }));
  };

  const handleDistribute = () => {
    // 1) Apply branch headcounts (existing behaviour)
    const updatedBranches = branches.map((b) => ({
      ...b,
      headcount: preview[b.id] ?? b.headcount,
    }));
    onChange(updatedBranches);

    // 2) Distribute across normal ranks when available
    if (ranks.length > 0 && onRanksChange) {
      const rankCodes = ranks.map(getRankCode);
      const rankDist = distributeTroopsAcrossRanks(rankCodes, totalSoldiers);
      const updatedRanks = ranks.map((r) => ({
        ...r,
        troopCount: BigInt(rankDist[getRankCode(r)] ?? 0),
      }));
      onRanksChange(updatedRanks);
    }

    setConfirmOpen(false);
  };

  const isHmcPreset =
    ranks.length >= 60 ||
    ranks.some((r) => r.name.includes("H.M.C") || r.name.startsWith("E-1 "));

  const loadHmcBranches = () => {
    if (
      !confirm(
        "This will replace all current branches with the 9 H.M.C. Military preset branches. Continue?",
      )
    )
      return;
    onChange(HMC_PRESET_BRANCHES.map((b) => ({ ...b, id: uid() })));
  };

  const addBranch = () => {
    if (!newName.trim()) return;
    const branch: ArmyBranch = {
      ...emptyBranch(),
      id: uid(),
      name: newName.trim(),
    };
    onChange([...branches, branch]);
    setNewName("");
    setAdding(false);
    setExpandedId(branch.id);
  };

  const updateBranch = (id: string, updates: Partial<ArmyBranch>) => {
    onChange(branches.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const removeBranch = (id: string) => {
    if (!confirm("Delete this branch?")) return;
    onChange(branches.filter((b) => b.id !== id));
  };

  const addLoadout = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return;
    const loadout: ArmyLoadout = {
      id: uid(),
      name: "New Loadout",
      weaponType: "",
      armorType: "",
      notes: "",
    };
    updateBranch(branchId, { loadouts: [...branch.loadouts, loadout] });
  };

  const updateLoadout = (
    branchId: string,
    loadoutId: string,
    updates: Partial<ArmyLoadout>,
  ) => {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return;
    updateBranch(branchId, {
      loadouts: branch.loadouts.map((l) =>
        l.id === loadoutId ? { ...l, ...updates } : l,
      ),
    });
  };

  const removeLoadout = (branchId: string, loadoutId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return;
    updateBranch(branchId, {
      loadouts: branch.loadouts.filter((l) => l.id !== loadoutId),
    });
  };

  const toggleOfficer = (branchId: string, officerId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return;
    const ids = branch.officerIds.includes(officerId)
      ? branch.officerIds.filter((id) => id !== officerId)
      : [...branch.officerIds, officerId];
    updateBranch(branchId, { officerIds: ids });
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
          Branches
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isHmcPreset && (
            <button
              type="button"
              className="ds-btn-ghost"
              style={{
                fontSize: 11,
                color: "var(--ds-gold)",
                border: "1px solid var(--ds-gold)",
                padding: "3px 8px",
                borderRadius: 4,
              }}
              onClick={loadHmcBranches}
              data-ocid="army.branches.load_hmc_preset_button"
            >
              ⚔ Load H.M.C. Branches
            </button>
          )}
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAdding(true)}
            data-ocid="army.branches.open_modal_button"
          >
            + Add Branch
          </button>
        </div>
      </div>

      {branches.length === 0 && !adding && (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 13 }}
          data-ocid="army.branches.empty_state"
        >
          No branches yet. Add an Infantry, Cavalry, or other division.
        </p>
      )}

      {branches.map((branch, idx) => (
        <div
          key={branch.id}
          className="ds-card2"
          style={{ marginBottom: 8 }}
          data-ocid={`army.branch.item.${idx + 1}`}
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
            onClick={() =>
              setExpandedId(expandedId === branch.id ? null : branch.id)
            }
          >
            <div>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--ds-text)",
                  fontSize: 14,
                }}
              >
                {branch.name}
              </span>
              {branch.veteranFlag && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: "var(--ds-gold)",
                    background: "rgba(180,140,60,0.15)",
                    padding: "1px 6px",
                    borderRadius: 3,
                  }}
                >
                  ★ Veteran
                </span>
              )}
              <span
                style={{
                  marginLeft: 10,
                  color: "var(--ds-muted)",
                  fontSize: 12,
                }}
              >
                {branch.headcount.toString()} troops · {branch.trainingLevel} ·{" "}
                {branch.condition}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeBranch(branch.id);
                }}
                data-ocid={`army.branch.delete_button.${idx + 1}`}
              >
                ✕
              </button>
              <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                {expandedId === branch.id ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {expandedId === branch.id && (
            <div
              style={{
                padding: "0 14px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
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
                  <label
                    htmlFor={`branch-name-${branch.id}`}
                    className="ds-label"
                  >
                    Name
                  </label>
                  <input
                    id={`branch-name-${branch.id}`}
                    className="ds-input"
                    value={branch.name}
                    onChange={(e) =>
                      updateBranch(branch.id, { name: e.target.value })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`branch-hc-${branch.id}`}
                    className="ds-label"
                  >
                    Headcount
                  </label>
                  <input
                    id={`branch-hc-${branch.id}`}
                    className="ds-input"
                    type="number"
                    value={branch.headcount.toString()}
                    onChange={(e) =>
                      updateBranch(branch.id, {
                        headcount: BigInt(e.target.value || 0),
                      })
                    }
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`branch-deploy-${branch.id}`}
                    className="ds-label"
                  >
                    Deployment
                  </label>
                  <input
                    id={`branch-deploy-${branch.id}`}
                    className="ds-input"
                    value={branch.deploymentLocation}
                    onChange={(e) =>
                      updateBranch(branch.id, {
                        deploymentLocation: e.target.value,
                      })
                    }
                    placeholder="Location"
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`branch-train-${branch.id}`}
                    className="ds-label"
                  >
                    Training
                  </label>
                  <select
                    id={`branch-train-${branch.id}`}
                    className="ds-input"
                    value={branch.trainingLevel}
                    onChange={(e) =>
                      updateBranch(branch.id, { trainingLevel: e.target.value })
                    }
                    style={{ fontSize: 13 }}
                  >
                    {TRAINING_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`branch-cond-${branch.id}`}
                    className="ds-label"
                  >
                    Condition
                  </label>
                  <select
                    id={`branch-cond-${branch.id}`}
                    className="ds-input"
                    value={branch.condition}
                    onChange={(e) =>
                      updateBranch(branch.id, { condition: e.target.value })
                    }
                    style={{ fontSize: 13 }}
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      color: "var(--ds-text)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={branch.veteranFlag}
                      onChange={(e) =>
                        updateBranch(branch.id, {
                          veteranFlag: e.target.checked,
                        })
                      }
                      data-ocid={`army.branch.veteran.${idx + 1}`}
                    />
                    Veteran Unit
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`branch-notes-${branch.id}`}
                  className="ds-label"
                >
                  Notes
                </label>
                <textarea
                  id={`branch-notes-${branch.id}`}
                  className="ds-input"
                  rows={2}
                  value={branch.interBranchNotes}
                  onChange={(e) =>
                    updateBranch(branch.id, {
                      interBranchNotes: e.target.value,
                    })
                  }
                  placeholder="Inter-branch relationships, dependencies, notes"
                  style={{ resize: "vertical", fontSize: 12 }}
                />
              </div>

              {officers.length > 0 && (
                <div>
                  <p className="ds-label" style={{ marginBottom: 6 }}>
                    Assigned Officers
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {officers.map((o) => (
                      <label
                        key={o.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          cursor: "pointer",
                          color: "var(--ds-text)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={branch.officerIds.includes(o.id)}
                          onChange={() => toggleOfficer(branch.id, o.id)}
                        />
                        {o.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <ArmyAbilityList
                abilities={branch.abilities}
                onChange={(abilities: ArmyAbility[]) =>
                  updateBranch(branch.id, { abilities })
                }
                title="Branch Abilities"
                ocidPrefix={`army.branch_ability.${idx + 1}`}
              />

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span className="ds-label">Loadouts</span>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11, padding: "2px 8px" }}
                    onClick={() => addLoadout(branch.id)}
                    data-ocid={`army.branch.loadout.add_button.${idx + 1}`}
                  >
                    + Loadout
                  </button>
                </div>
                {branch.loadouts.map((lo, li) => (
                  <div
                    key={lo.id}
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 6,
                      alignItems: "center",
                    }}
                  >
                    <input
                      className="ds-input"
                      value={lo.name}
                      onChange={(e) =>
                        updateLoadout(branch.id, lo.id, {
                          name: e.target.value,
                        })
                      }
                      placeholder="Loadout name"
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    <input
                      className="ds-input"
                      value={lo.weaponType}
                      onChange={(e) =>
                        updateLoadout(branch.id, lo.id, {
                          weaponType: e.target.value,
                        })
                      }
                      placeholder="Weapon type"
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    <input
                      className="ds-input"
                      value={lo.armorType}
                      onChange={(e) =>
                        updateLoadout(branch.id, lo.id, {
                          armorType: e.target.value,
                        })
                      }
                      placeholder="Armor type"
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 11, color: "#c0392b" }}
                      onClick={() => removeLoadout(branch.id, lo.id)}
                      data-ocid={`army.branch.loadout.delete_button.${li + 1}`}
                      aria-label="Remove loadout"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ─── Distribute Soldiers ─────────────────────────────────────── */}
      <div
        className="ds-card2"
        style={{ marginTop: 12 }}
        data-ocid="army.branches.distribute.section"
      >
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
          onClick={() => setDistOpen((o) => !o)}
          data-ocid="army.branches.distribute.toggle"
        >
          <span
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 13 }}
          >
            ⚖ Distribute Soldiers
          </span>
          <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
            {distOpen ? "▲" : "▼"}
          </span>
        </button>

        {distOpen && (
          <div
            style={{
              padding: "0 14px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {branches.length === 0 ? (
              <p
                style={{ color: "var(--ds-muted)", fontSize: 13, margin: 0 }}
                data-ocid="army.branches.distribute.empty_state"
              >
                Add branches first to use distribution.
              </p>
            ) : (
              <>
                {/* Total soldiers input */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label
                    htmlFor="dist-total"
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Total Soldiers
                  </label>
                  <input
                    id="dist-total"
                    className="ds-input"
                    type="number"
                    min={0}
                    value={totalSoldiers}
                    onChange={(e) =>
                      setTotalSoldiers(Math.max(0, Number(e.target.value) || 0))
                    }
                    style={{ width: 120, fontSize: 13 }}
                    data-ocid="army.branches.distribute.total.input"
                  />
                </div>

                {/* Weight editor */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                      Branch Weights — Total:{" "}
                      <span
                        style={{
                          color: weightTotal === 100 ? "#4ade80" : "#f87171",
                          fontWeight: 600,
                        }}
                      >
                        {weightTotal}%
                      </span>
                    </span>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 11, padding: "2px 8px" }}
                      onClick={resetWeightsToDefaults}
                      data-ocid="army.branches.distribute.reset_button"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {branches.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            fontSize: 12,
                            color: "var(--ds-text)",
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {b.name}
                        </span>
                        <input
                          className="ds-input"
                          type="number"
                          min={0}
                          max={100}
                          value={effectiveWeights[b.id] ?? 0}
                          onChange={(e) =>
                            handleWeightChange(
                              b.id,
                              Number(e.target.value) || 0,
                            )
                          }
                          style={{
                            width: 64,
                            fontSize: 12,
                            textAlign: "right",
                          }}
                        />
                        <span
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 12,
                            width: 14,
                          }}
                        >
                          %
                        </span>
                        <span
                          style={{
                            color: "var(--ds-gold)",
                            fontSize: 12,
                            width: 52,
                            textAlign: "right",
                          }}
                        >
                          {Number(preview[b.id] ?? 0n).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {weightTotal !== 100 && (
                  <p
                    style={{ color: "#f87171", fontSize: 12, margin: 0 }}
                    data-ocid="army.branches.distribute.error_state"
                  >
                    Weights must total 100% before distributing.
                  </p>
                )}

                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ fontSize: 13, alignSelf: "flex-start" }}
                  disabled={weightTotal !== 100 || branches.length === 0}
                  onClick={() => setConfirmOpen(true)}
                  data-ocid="army.branches.distribute.primary_button"
                >
                  Distribute {totalSoldiers.toLocaleString()} Soldiers
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── Confirmation modal ──────────────────────────────────────────── */}
      {confirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setConfirmOpen(false);
          }}
          data-ocid="army.branches.distribute.dialog"
        >
          <div
            style={{
              background: "var(--ds-surface)",
              border: "1px solid var(--ds-border)",
              borderRadius: 10,
              padding: 24,
              maxWidth: 420,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <h3
                className="font-cinzel"
                style={{
                  color: "var(--ds-gold)",
                  fontSize: 16,
                  margin: "0 0 6px",
                }}
              >
                Overwrite Branch Headcounts?
              </h3>
              <p style={{ color: "var(--ds-muted)", fontSize: 13, margin: 0 }}>
                <p
                  style={{ color: "var(--ds-muted)", fontSize: 13, margin: 0 }}
                >
                  This will overwrite the current headcount for all branches
                  {ranks.length > 0 && onRanksChange
                    ? " and distribute troops across all ranks"
                    : ""}
                  . This cannot be undone.
                </p>
                cannot be undone.
              </p>
            </div>

            {/* Preview list */}
            <div
              style={{
                background: "var(--ds-bg)",
                border: "1px solid var(--ds-border)",
                borderRadius: 6,
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {branches.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      color: "var(--ds-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginRight: 8,
                    }}
                  >
                    {b.name}
                  </span>
                  <span
                    style={{
                      color: "var(--ds-gold)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {Number(preview[b.id] ?? 0n).toLocaleString()} troops
                  </span>
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid var(--ds-border)",
                  marginTop: 4,
                  paddingTop: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: "var(--ds-muted)" }}>Total</span>
                <span style={{ color: "var(--ds-gold)" }}>
                  {totalSoldiers.toLocaleString()} troops
                </span>
              </div>
            </div>

            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 13 }}
                onClick={() => setConfirmOpen(false)}
                data-ocid="army.branches.distribute.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 13 }}
                onClick={handleDistribute}
                data-ocid="army.branches.distribute.confirm_button"
              >
                Confirm &amp; Distribute
              </button>
            </div>
          </div>
        </div>
      )}

      {adding && (
        <div
          className="ds-card2"
          style={{ padding: 10, display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            className="ds-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBranch();
              }
            }}
            placeholder="Branch name (e.g. Infantry, Cavalry)"
            style={{ flex: 1, fontSize: 13 }}
            data-ocid="army.branches.name.input"
          />
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontSize: 12 }}
            onClick={addBranch}
            data-ocid="army.branches.submit_button"
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
      )}
    </div>
  );
}

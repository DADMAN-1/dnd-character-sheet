import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import ArmyRankPurposesPanel from "../components/tabs/army/ArmyRankPurposesPanel";
import {
  HMC_BRANCH_SPECIAL_RANKS,
  RANK_PRESETS,
  distributeTroopsAcrossRanks,
} from "../components/tabs/army/armyHelpers";
import type { Army, DndBackend } from "../types";

const HMC_RANKS = (RANK_PRESETS["H.M.C. Military"] ?? []).map((r) => ({
  ...r,
  troopCount: 0n,
}));

interface Props {
  actor: DndBackend;
  onRestartConnection?: () => void;
}

export default function RankReferencePage({
  actor,
  onRestartConnection,
}: Props) {
  const [showCounts, setShowCounts] = useState(false);
  const [armies, setArmies] = useState<Army[]>([]);
  const [selectedArmyId, setSelectedArmyId] = useState<string>("");
  const [countsLoading, setCountsLoading] = useState(false);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);

  const loadArmies = useCallback(async () => {
    setCountsLoading(true);
    setCountsError(null);
    try {
      const fetched: Army[] = await actor.getArmies().catch(() => []);
      setArmies(fetched);
      if (fetched.length > 0 && !selectedArmyId) {
        setSelectedArmyId(fetched[0].id);
      }
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setCountsLoading(false);
        return;
      }
      setCountsError("Could not load armies");
    } finally {
      setCountsLoading(false);
    }
  }, [actor, selectedArmyId]);

  useEffect(() => {
    if (showCounts) {
      void loadArmies();
    }
  }, [showCounts, loadArmies]);

  const selectedArmy = armies.find((a) => a.id === selectedArmyId);

  // HMC default branch weight percentages used across multiple calculations below
  const HMC_DEFAULT_WEIGHTS_LOOKUP: Record<string, number> = {
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

  // Helper: build effective per-branch headcounts falling back to army.size
  function getEffectiveBranchHeadcounts(
    army: typeof selectedArmy,
  ): Map<string, number> {
    if (!army) return new Map();
    const rawBranches = army.branches ?? [];
    const branchTotal = rawBranches.reduce(
      (sum, b) => sum + Number(b.headcount ?? 0n),
      0,
    );
    const armySizeNum = Number(army.size ?? 0n);
    const map: Map<string, number> = new Map();
    if (branchTotal > 0) {
      for (const b of rawBranches) map.set(b.name, Number(b.headcount ?? 0n));
    } else if (armySizeNum > 0) {
      let weightSum = 0;
      for (const b of rawBranches) {
        weightSum += HMC_DEFAULT_WEIGHTS_LOOKUP[b.name.toLowerCase()] ?? 0;
      }
      if (weightSum === 0) weightSum = 100;
      let remaining = armySizeNum;
      let biggestBranch = rawBranches[0]?.name ?? "";
      let biggestCount = 0;
      for (const b of rawBranches) {
        const w = HMC_DEFAULT_WEIGHTS_LOOKUP[b.name.toLowerCase()] ?? 0;
        const count = Math.round((armySizeNum * w) / weightSum);
        map.set(b.name, count);
        remaining -= count;
        if (count > biggestCount) {
          biggestCount = count;
          biggestBranch = b.name;
        }
      }
      if (biggestBranch && remaining !== 0) {
        map.set(
          biggestBranch,
          Math.max(0, (map.get(biggestBranch) ?? 0) + remaining),
        );
      }
    } else {
      for (const b of rawBranches) map.set(b.name, 0);
    }
    return map;
  }

  // Branch troop counts: key by lowercase branch name for panel lookup.
  // Falls back to army.size with HMC weight distribution when headcounts are all zero.
  const troopCountsByBranch: Record<string, number> | undefined =
    showCounts && selectedArmy
      ? (() => {
          const effectiveMap = getEffectiveBranchHeadcounts(selectedArmy);
          const out: Record<string, number> = {};
          for (const [name, count] of effectiveMap.entries()) {
            out[name.toLowerCase()] = count;
          }
          return out;
        })()
      : undefined;

  // Branch special rank troop counts: distribute each branch's effective headcount
  // across its branch-specific special ranks using a military pyramid.
  // Reuses getEffectiveBranchHeadcounts() which falls back to army.size when needed.
  const troopCountsByRank: Record<string, number> | undefined =
    showCounts && selectedArmy
      ? (() => {
          const out: Record<string, number> = {};
          const effectiveHeadcounts =
            getEffectiveBranchHeadcounts(selectedArmy);
          for (const [branchName, headcount] of effectiveHeadcounts.entries()) {
            if (headcount <= 0) continue;
            let branchRanks: { code: string }[] | undefined;
            for (const key of Object.keys(HMC_BRANCH_SPECIAL_RANKS)) {
              if (
                key.toLowerCase().includes(branchName.toLowerCase()) ||
                branchName.toLowerCase().includes(key.toLowerCase())
              ) {
                branchRanks = HMC_BRANCH_SPECIAL_RANKS[key];
                break;
              }
            }
            if (!branchRanks || branchRanks.length === 0) continue;
            const codes = branchRanks.map((r) => r.code);
            const dist = distributeTroopsAcrossRanks(codes, headcount);
            for (const code of codes) out[code] = dist[code] ?? 0;
          }
          return out;
        })()
      : undefined;

  // Main class rank troop counts.
  // PRIMARY PATH: Read stored rank.troopCount values directly from army.ranks.
  //   Build a lookup map: { [rankCode]: number } where rankCode is the part
  //   before the first space in rank.name (e.g. "E-1" from "E-1 H.M.C Recruit").
  // FALLBACK PATH: If all stored troopCounts are 0 but army.size > 0, fall back
  //   to the per-class pyramid calculation (55%/25%/15%/5%) so the toggle
  //   still shows something useful before Distribute Soldiers has been run.
  const troopCountsByMainRank: Record<string, number> | undefined =
    showCounts && selectedArmy
      ? (() => {
          const armyRanks = selectedArmy.ranks ?? [];

          // Build lookup from stored troopCount values
          const storedMap: Record<string, number> = {};
          let anyStored = false;
          for (const r of armyRanks) {
            const spaceIdx = r.name.indexOf(" ");
            const code = spaceIdx > -1 ? r.name.slice(0, spaceIdx) : r.name;
            const count = Number(r.troopCount ?? 0n);
            storedMap[code] = count;
            if (count > 0) anyStored = true;
          }

          // If any stored values exist, use them as-is — distribution was run
          if (anyStored) return storedMap;

          // FALLBACK: no distribution run yet — compute from army total
          const branchTotal = (selectedArmy.branches ?? []).reduce(
            (sum, b) => sum + Number(b.headcount ?? 0n),
            0,
          );
          const totalHeadcount =
            branchTotal > 0 ? branchTotal : Number(selectedArmy.size ?? 0n);
          if (totalHeadcount === 0) return {};

          // Split the 72 H.M.C. ranks into their 4 classes by code prefix.
          const enlistedCodes: string[] = [];
          const officerCodes: string[] = [];
          const guardCodes: string[] = [];
          const leadingCodes: string[] = [];

          for (const r of HMC_RANKS) {
            const spaceIdx = r.name.indexOf(" ");
            const code = spaceIdx > -1 ? r.name.slice(0, spaceIdx) : r.name;
            if (code.startsWith("GC") || code === "GC7-1") {
              guardCodes.push(code);
            } else if (code.startsWith("G") && !code.startsWith("GC")) {
              leadingCodes.push(code);
            } else if (code.startsWith("O")) {
              officerCodes.push(code);
            } else {
              enlistedCodes.push(code);
            }
          }

          const classWeights = {
            enlisted: 0.55,
            officer: 0.25,
            guard: 0.15,
            leading: 0.05,
          };
          const enlistedTotal = Math.round(
            totalHeadcount * classWeights.enlisted,
          );
          const officerTotal = Math.round(
            totalHeadcount * classWeights.officer,
          );
          const guardTotal = Math.round(totalHeadcount * classWeights.guard);
          const leadingTotal =
            totalHeadcount - enlistedTotal - officerTotal - guardTotal;

          const out: Record<string, number> = {};
          const merge = (dist: Record<string, number>) => {
            for (const [k, v] of Object.entries(dist)) out[k] = v;
          };

          merge(distributeTroopsAcrossRanks(enlistedCodes, enlistedTotal));
          merge(distributeTroopsAcrossRanks(officerCodes, officerTotal));
          merge(distributeTroopsAcrossRanks(guardCodes, guardTotal));
          merge(
            distributeTroopsAcrossRanks(
              leadingCodes,
              Math.max(0, leadingTotal),
            ),
          );

          return out;
        })()
      : undefined;

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px 16px 64px",
      }}
      data-ocid="rank_reference.page"
    >
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🎖️</span>
            <h1
              className="font-cinzel"
              style={{
                color: "var(--ds-gold)",
                fontSize: 26,
                margin: 0,
                letterSpacing: "0.04em",
              }}
            >
              Rank Reference
            </h1>
          </div>

          {/* Troop count toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {countsLoading && (
              <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                Loading…
              </span>
            )}
            {countsError && !countsLoading && (
              <span style={{ color: "#f87171", fontSize: 12 }}>
                {countsError}
              </span>
            )}
            {showCounts && armies.length > 0 && (
              <select
                className="ds-input"
                style={{ fontSize: 13, padding: "4px 10px", minWidth: 160 }}
                value={selectedArmyId}
                onChange={(e) => setSelectedArmyId(e.target.value)}
                data-ocid="rank_reference.army.select"
              >
                {armies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setShowCounts((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                border: `1px solid ${showCounts ? "var(--ds-gold)" : "var(--ds-border)"}`,
                background: showCounts
                  ? "rgba(180,140,60,0.15)"
                  : "var(--ds-surface)",
                color: showCounts ? "var(--ds-gold)" : "var(--ds-muted)",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: showCounts ? 600 : 400,
                transition: "all 0.15s",
              }}
              data-ocid="rank_reference.troop_count.toggle"
            >
              <span>👥</span>
              <span>
                {showCounts ? "Hide Troop Counts" : "Show Troop Counts"}
              </span>
            </button>
          </div>
        </div>

        <p
          style={{
            color: "var(--ds-muted)",
            fontSize: 14,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          H.M.C. Military rank structure — 72 ranks across 4 soldier classes
          with branch-specific special ranks.
        </p>
        <div
          style={{
            marginTop: 12,
            height: 2,
            background:
              "linear-gradient(to right, var(--ds-gold), transparent)",
            borderRadius: 1,
            opacity: 0.6,
          }}
        />
      </div>

      {/* Rank purposes panel */}
      <ArmyRankPurposesPanel
        ranks={HMC_RANKS}
        troopCountsByBranch={troopCountsByBranch}
        troopCountsByRank={troopCountsByRank}
        troopCountsByMainRank={troopCountsByMainRank}
      />
    </div>
  );
}

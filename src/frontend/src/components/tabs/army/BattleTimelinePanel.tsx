import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ArmyMoraleHistoryEntry,
  DndBackend,
  GainLossEntry,
} from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  baseMorale: bigint;
  onRestartConnection?: () => void;
}

type TimelineItem =
  | { kind: "battle"; entry: GainLossEntry; ts: string }
  | { kind: "morale"; entry: ArmyMoraleHistoryEntry; ts: string };

const OUTCOME_COLOR: Record<string, { bg: string; fg: string }> = {
  Victory: { bg: "rgba(39,174,96,0.15)", fg: "#27ae60" },
  Defeat: { bg: "rgba(192,57,43,0.15)", fg: "#c0392b" },
  Draw: { bg: "rgba(150,150,150,0.12)", fg: "#7f8c8d" },
  Retreat: { bg: "rgba(243,156,18,0.12)", fg: "#f39c12" },
  Surrender: { bg: "rgba(230,126,34,0.12)", fg: "#e67e22" },
};

const INTERACTION_ICON: Record<string, string> = {
  Battle: "⚔️",
  Skirmish: "🗡️",
  Raid: "🔥",
  Ambush: "🎯",
  Siege: "🏰",
  Negotiation: "🤝",
};

function OutcomeBadge({ outcome }: { outcome: string }) {
  const c = OUTCOME_COLOR[outcome] ?? {
    bg: "rgba(150,150,150,0.12)",
    fg: "var(--ds-muted)",
  };
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 4,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.fg}`,
        whiteSpace: "nowrap",
      }}
    >
      {outcome}
    </span>
  );
}

function Delta({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  if (value === 0) return null;
  const positive = value > 0;
  return (
    <span
      style={{
        fontSize: 11,
        color: positive ? "#27ae60" : "#c0392b",
        whiteSpace: "nowrap",
      }}
    >
      {label}: {positive ? "+" : ""}
      {value}
    </span>
  );
}

function monthLabel(ts: string): string {
  if (!ts) return "Unknown date";
  // Try to parse ISO date or just show first 7 chars
  const parts = ts.split("-");
  if (parts.length >= 2) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = Number.parseInt(parts[1], 10);
    const year = parts[0];
    if (month >= 1 && month <= 12) return `${months[month - 1]} ${year}`;
  }
  return ts.slice(0, 10);
}

export default function BattleTimelinePanel({
  actor,
  armyId,
  baseMorale,
  onRestartConnection,
}: Props) {
  const [gainLossEntries, setGainLossEntries] = useState<GainLossEntry[]>([]);
  const [moraleHistory, setMoraleHistory] = useState<ArmyMoraleHistoryEntry[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gl, mh] = await Promise.all([
        actor.getGainLossEntries(armyId).catch(() => [] as GainLossEntry[]),
        actor
          .getArmyMoraleHistory(armyId)
          .catch(() => [] as ArmyMoraleHistoryEntry[]),
      ]);
      setGainLossEntries(gl);
      setMoraleHistory(mh);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  // Merge and sort chronologically
  const timeline = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = [
      ...gainLossEntries.map((e) => ({
        kind: "battle" as const,
        entry: e,
        ts:
          (e as unknown as { timestamp?: string; date?: string }).timestamp ||
          (e as unknown as { date?: string }).date ||
          "",
      })),
      ...moraleHistory.map((e) => ({
        kind: "morale" as const,
        entry: e,
        ts: e.timestamp,
      })),
    ];
    return items.sort((a, b) => {
      if (!a.ts && !b.ts) return 0;
      if (!a.ts) return 1;
      if (!b.ts) return -1;
      return b.ts.localeCompare(a.ts);
    });
  }, [gainLossEntries, moraleHistory]);

  // Compute running morale going backwards (from most recent to oldest)
  const moraleValues = useMemo((): number[] => {
    const base = Number(baseMorale);
    const result: number[] = new Array(timeline.length).fill(base);
    let running = base;
    for (let i = 0; i < timeline.length; i++) {
      result[i] = Math.max(0, Math.min(100, running));
      const item = timeline[i];
      if (item.kind === "morale") {
        running -= Number(item.entry.modifier);
      } else if (item.kind === "battle") {
        running -= Number(item.entry.moraleImpact);
      }
    }
    return result;
  }, [timeline, baseMorale]);

  // Group by month header
  const grouped = useMemo(() => {
    const groups: {
      month: string;
      items: { item: TimelineItem; morale: number; idx: number }[];
    }[] = [];
    let currentMonth = "";
    for (let i = 0; i < timeline.length; i++) {
      const item = timeline[i];
      const month = monthLabel(item.ts);
      if (month !== currentMonth) {
        currentMonth = month;
        groups.push({ month, items: [] });
      }
      groups[groups.length - 1].items.push({
        item,
        morale: moraleValues[i],
        idx: i,
      });
    }
    return groups;
  }, [timeline, moraleValues]);

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading) {
    return (
      <p
        style={{
          color: "var(--ds-muted)",
          textAlign: "center",
          padding: 32,
        }}
        data-ocid="army.battle_timeline.loading_state"
      >
        Loading timeline…
      </p>
    );
  }

  if (timeline.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          color: "var(--ds-muted)",
        }}
        data-ocid="army.battle_timeline.empty_state"
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚔️</div>
        <p style={{ marginBottom: 8 }}>
          No battles or morale events logged yet.
        </p>
        <p style={{ fontSize: 12 }}>
          Log interactions in the Interactions tab and morale events in the
          Morale Log tab to see them here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 20 }}
        >
          ⚔️ Battle &amp; Morale Timeline
        </h2>
        <span style={{ fontSize: 12, color: "var(--ds-muted)" }}>
          Read-only · {timeline.length} event{timeline.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
          fontSize: 12,
          color: "var(--ds-muted)",
        }}
      >
        <span>⚔️ Battle/Skirmish</span>
        <span>📈 Morale boost</span>
        <span>📉 Morale drop</span>
        <span style={{ color: "#27ae60" }}>● Net troop gain</span>
        <span style={{ color: "#c0392b" }}>● Net troop loss</span>
      </div>

      {grouped.map((group) => (
        <div key={group.month}>
          {/* Month header */}
          <div
            style={{
              fontSize: 11,
              color: "var(--ds-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "6px 0 10px",
              borderBottom: "1px solid var(--ds-border)",
              marginBottom: 12,
            }}
          >
            {group.month}
          </div>

          {/* Timeline items */}
          <div
            style={{
              position: "relative",
              paddingLeft: 36,
              marginBottom: 12,
            }}
          >
            {/* Vertical line */}
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: "var(--ds-border)",
              }}
            />

            {group.items.map(({ item, morale, idx }) => {
              if (item.kind === "battle") {
                const e = item.entry;
                const netTroops =
                  Number(e.gains?.troops ?? 0n) -
                  Number(e.losses?.troops ?? 0n);
                const netGold =
                  Number(e.gains?.gold ?? 0n) - Number(e.losses?.gold ?? 0n);
                const icon =
                  INTERACTION_ICON[e.interactionType] ||
                  INTERACTION_ICON.Battle;

                return (
                  <div
                    key={`battle-${e.id}-${idx}`}
                    style={{
                      position: "relative",
                      marginBottom: 14,
                    }}
                    data-ocid={`army.battle_timeline.item.${idx + 1}`}
                  >
                    {/* Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: -28,
                        top: 12,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background:
                          e.outcome === "Victory"
                            ? "#27ae60"
                            : e.outcome === "Defeat"
                              ? "#c0392b"
                              : "var(--ds-muted)",
                        border: "2px solid var(--ds-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        zIndex: 1,
                      }}
                    />

                    <div
                      className="ds-card"
                      style={{
                        padding: "12px 14px",
                        borderLeft: `3px solid ${
                          e.outcome === "Victory"
                            ? "#27ae60"
                            : e.outcome === "Defeat"
                              ? "#c0392b"
                              : "var(--ds-border)"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{icon}</span>
                          <span
                            className="font-cinzel"
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 14,
                            }}
                          >
                            {e.interactionType} vs {e.enemyName || "Unknown"}
                          </span>
                          <OutcomeBadge outcome={e.outcome} />
                        </div>
                        {item.ts && (
                          <span
                            style={{ fontSize: 11, color: "var(--ds-muted)" }}
                          >
                            {item.ts.slice(0, 10)}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          flexWrap: "wrap",
                          marginBottom: 6,
                        }}
                      >
                        <Delta value={netTroops} label="Troops" />
                        <Delta value={netGold} label="Gold" />
                        {e.moraleImpact !== 0n && (
                          <span
                            style={{
                              fontSize: 11,
                              color:
                                e.moraleImpact > 0n ? "#27ae60" : "#c0392b",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Morale: {e.moraleImpact > 0n ? "↑" : "↓"}{" "}
                            {e.moraleImpact > 0n ? "+" : ""}
                            {e.moraleImpact}
                          </span>
                        )}
                      </div>

                      {/* Morale progress bar */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--ds-muted)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Morale {morale}/100
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            background: "var(--ds-border)",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${morale}%`,
                              height: "100%",
                              background:
                                morale >= 60
                                  ? "#27ae60"
                                  : morale >= 30
                                    ? "#f39c12"
                                    : "#c0392b",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>

                      {e.notes && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--ds-muted)",
                            marginTop: 6,
                            lineHeight: 1.4,
                          }}
                        >
                          {e.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              // Morale event
              const m = item.entry;
              const positive = m.modifier > 0;
              return (
                <div
                  key={`morale-${idx}`}
                  style={{ position: "relative", marginBottom: 14 }}
                  data-ocid={`army.battle_timeline.item.${idx + 1}`}
                >
                  {/* Dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: -28,
                      top: 12,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: positive ? "#27ae60" : "#c0392b",
                      border: "2px solid var(--ds-bg)",
                      zIndex: 1,
                    }}
                  />

                  <div
                    className="ds-card"
                    style={{
                      padding: "10px 14px",
                      borderLeft: `3px solid ${
                        positive ? "#27ae60" : "#c0392b"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>
                          {positive ? "📈" : "📉"}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--ds-text)",
                            fontWeight: 500,
                          }}
                        >
                          {m.eventType || "Morale Event"}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: positive ? "#27ae60" : "#c0392b",
                            fontWeight: 600,
                          }}
                        >
                          {positive ? "+" : ""}
                          {m.modifier}
                        </span>
                      </div>
                      {item.ts && (
                        <span
                          style={{ fontSize: 11, color: "var(--ds-muted)" }}
                        >
                          {item.ts.slice(0, 10)}
                        </span>
                      )}
                    </div>

                    {/* Morale progress bar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--ds-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Morale {morale}/100
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: "var(--ds-border)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${morale}%`,
                            height: "100%",
                            background:
                              morale >= 60
                                ? "#27ae60"
                                : morale >= 30
                                  ? "#f39c12"
                                  : "#c0392b",
                          }}
                        />
                      </div>
                    </div>

                    {m.notes && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--ds-muted)",
                          marginTop: 4,
                          lineHeight: 1.4,
                        }}
                      >
                        {m.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

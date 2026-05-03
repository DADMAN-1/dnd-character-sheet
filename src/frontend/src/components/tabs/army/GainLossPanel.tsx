import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { Faction } from "../../../types";
import type { Army, DndBackend, GainLossEntry } from "../../../types";
import EntityLinkSelect from "../../EntityLinkSelect";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  army?: Army;
  factions?: Faction[];
  onArmyUpdate?: (updates: Partial<Army>) => void;
  onRestartConnection?: () => void;
}

const INTERACTION_TYPES = [
  "Battle",
  "Skirmish",
  "Raid",
  "Ambush",
  "Siege",
  "Negotiation",
  "Other",
];
const OUTCOMES = ["Victory", "Defeat", "Draw", "Retreat", "Surrender"];

const OUTCOME_COLORS: Record<
  string,
  { text: string; border: string; bg: string }
> = {
  Victory: { text: "#27ae60", border: "#27ae6055", bg: "#27ae6018" },
  Defeat: { text: "#e74c3c", border: "#e74c3c55", bg: "#e74c3c18" },
  Draw: { text: "var(--ds-gold)", border: "var(--ds-gold)", bg: "#c9a35a18" },
  Retreat: { text: "#e67e22", border: "#e67e2255", bg: "#e67e2218" },
  Surrender: { text: "#8e44ad", border: "#8e44ad55", bg: "#8e44ad18" },
};

// Auto-suggested morale changes per outcome
const OUTCOME_MORALE: Record<string, number> = {
  Victory: 5,
  Defeat: -10,
  Draw: 0,
  Retreat: -5,
  Surrender: -15,
};

const emptyDetails = () => ({
  troops: 0n,
  gold: 0n,
  prisoners: 0n,
  supplies: 0n,
  territory: "",
  intel: "",
  officersCasualties: "",
  equipmentNotes: "",
  other: "",
});

const blankEntry = (armyId: string): GainLossEntry => ({
  id: "",
  armyId,
  timestamp: "",
  interactionType: "Battle",
  enemyName: "",
  outcome: "Victory",
  gains: emptyDetails(),
  losses: emptyDetails(),
  moraleImpact: 0n,
  moraleApplied: false,
  notes: "",
  linkedFactionId: undefined,
  owner: Principal.anonymous(),
});

interface PostSaveAction {
  type: "morale" | "war_chest" | "headcount" | "defeat_note";
  label: string;
  description: string;
  confirmed: boolean;
  // context data
  moraleChange?: number;
  goldDelta?: number;
  troopDelta?: number;
  branchName?: string;
  noteText?: string;
}

export default function GainLossPanel({
  actor,
  armyId,
  army,
  factions = [],
  onArmyUpdate,
  onRestartConnection,
}: Props) {
  const [items, setItems] = useState<GainLossEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<GainLossEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // Post-save actions (one-click confirmations)
  const [postSaveActions, setPostSaveActions] = useState<PostSaveAction[]>([]);
  const [applyingAction, setApplyingAction] = useState<string | null>(null);
  // Defeat campaign note modal
  const [defeatNoteModal, setDefeatNoteModal] = useState<{
    text: string;
    open: boolean;
  }>({ text: "", open: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getGainLossEntries(armyId));
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setItems([]);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const buildPostSaveActions = (entry: GainLossEntry): PostSaveAction[] => {
    const actions: PostSaveAction[] = [];

    // Morale impact action
    const suggestedMorale =
      OUTCOME_MORALE[entry.outcome] ?? Number(entry.moraleImpact);
    const actualMorale =
      entry.moraleImpact !== 0n ? Number(entry.moraleImpact) : suggestedMorale;
    if (actualMorale !== 0 && !entry.moraleApplied) {
      actions.push({
        type: "morale",
        label: "Apply Morale Change",
        description: `${actualMorale > 0 ? "+" : ""}${actualMorale} morale from ${entry.outcome}`,
        confirmed: false,
        moraleChange: actualMorale,
      });
    }

    // War chest gold action
    const goldNet = Number(entry.gains.gold) - Number(entry.losses.gold);
    if (goldNet !== 0) {
      actions.push({
        type: "war_chest",
        label: "Update War Chest",
        description: `${goldNet > 0 ? "+" : ""}${goldNet} gold to war chest`,
        confirmed: false,
        goldDelta: goldNet,
      });
    }

    // Troop/headcount action
    const troopDelta = Number(entry.gains.troops) - Number(entry.losses.troops);
    if (troopDelta !== 0 && army?.branches?.length) {
      actions.push({
        type: "headcount",
        label: "Update Branch Headcount",
        description: `${troopDelta > 0 ? "+" : ""}${troopDelta} troops in army overall`,
        confirmed: false,
        troopDelta,
      });
    }

    // Defeat campaign note action
    const isMajorLoss =
      entry.outcome === "Defeat" &&
      (Number(entry.losses.troops) > 50 ||
        Number(entry.losses.gold) > 100 ||
        entry.notes.toLowerCase().includes("major"));
    if (isMajorLoss) {
      const noteText =
        `⚔️ Major Defeat — ${army?.name ?? "Army"} vs ${entry.enemyName || "Unknown"}\n📅 Date: ${entry.timestamp || "unknown"}\nCasualties: ${entry.losses.troops} troops, ${entry.losses.gold} gold\n${entry.notes ? `Notes: ${entry.notes}` : ""}`.trim();
      actions.push({
        type: "defeat_note",
        label: "Log Campaign Note",
        description: "Create a campaign note for this major defeat",
        confirmed: false,
        noteText,
      });
    }

    return actions;
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      // Auto-fill morale impact from outcome if not manually set
      const entryToSave: GainLossEntry = {
        ...editing,
        moraleImpact:
          editing.moraleImpact !== 0n
            ? editing.moraleImpact
            : BigInt(OUTCOME_MORALE[editing.outcome] ?? 0),
      };
      if (isNew) await actor.addGainLossEntry(armyId, entryToSave);
      else await actor.updateGainLossEntry(String(entryToSave.id), entryToSave);
      await load();
      // Build post-save actions
      const actions = buildPostSaveActions(entryToSave);
      setPostSaveActions(actions);
      setEditing(null);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setSaving(false);
        return;
      }
      console.error(e);
      alert(`Failed to save interaction: ${String(e)}`);
    }
    setSaving(false);
  };

  const applyAction = async (action: PostSaveAction) => {
    setApplyingAction(action.type);
    try {
      if (action.type === "morale" && army && onArmyUpdate) {
        const newMorale = Math.max(
          0,
          Math.min(100, Number(army.moraleRating) + (action.moraleChange ?? 0)),
        );
        onArmyUpdate({ moraleRating: BigInt(newMorale) });
        // Also add a morale history event
        await actor.addArmyMoraleEvent(armyId, {
          timestamp: new Date().toISOString().split("T")[0] ?? "",
          eventType: "Battle Outcome",
          modifier: BigInt(action.moraleChange ?? 0),
          notes: action.description,
        });
        // Mark all unconfirmed morale entries as applied in the list
        setItems((prev) =>
          prev.map((i) =>
            !i.moraleApplied ? { ...i, moraleApplied: true } : i,
          ),
        );
      } else if (action.type === "war_chest" && army && onArmyUpdate) {
        const newChest = Math.max(
          0,
          Number(army.warChest) + (action.goldDelta ?? 0),
        );
        onArmyUpdate({ warChest: BigInt(newChest) });
      } else if (action.type === "headcount" && army && onArmyUpdate) {
        // Update army overall size
        const newSize = Math.max(
          0,
          Number(army.size) + (action.troopDelta ?? 0),
        );
        onArmyUpdate({ size: BigInt(newSize) });
      } else if (action.type === "defeat_note") {
        setDefeatNoteModal({ text: action.noteText ?? "", open: true });
      }
      setPostSaveActions((prev) =>
        prev.map((a) =>
          a.type === action.type ? { ...a, confirmed: true } : a,
        ),
      );
    } catch (e) {
      console.error(e);
      alert(`Failed to apply action: ${String(e)}`);
    }
    setApplyingAction(null);
  };

  const saveCampaignNote = async () => {
    try {
      const { Principal: Prin } = await import("@dfinity/principal");
      await actor.addPartyNote({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Major Defeat — ${defeatNoteModal.text.split("\n")[0]?.replace("⚔️ ", "") ?? "Battle Note"}`,
        content: defeatNoteModal.text,
        createdAt: new Date().toISOString().split("T")[0] ?? "",
        owner: Prin.anonymous(),
      });
    } catch (e) {
      console.error(e);
      alert(`Failed to save campaign note: ${String(e)}`);
    }
    setDefeatNoteModal({ text: "", open: false });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this interaction?")) return;
    try {
      await actor.deleteGainLossEntry(String(id));
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const toggleExpand = (id: string) =>
    setExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const setField = (k: keyof GainLossEntry, v: unknown) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const setGain = (
    k: keyof ReturnType<typeof emptyDetails>,
    v: string | bigint,
  ) => setEditing((e) => (e ? { ...e, gains: { ...e.gains, [k]: v } } : e));

  const factionItems = factions.map((f) => ({ id: f.id, name: f.name }));
  const factionName = (id: bigint | undefined) =>
    id !== undefined ? factions.find((f) => f.id === id)?.name : undefined;

  const setLoss = (
    k: keyof ReturnType<typeof emptyDetails>,
    v: string | bigint,
  ) => setEditing((e) => (e ? { ...e, losses: { ...e.losses, [k]: v } } : e));

  // Net summary
  const netTroops = items.reduce(
    (s, i) => s + (Number(i.gains.troops) - Number(i.losses.troops)),
    0,
  );
  const netGold = items.reduce(
    (s, i) => s + (Number(i.gains.gold) - Number(i.losses.gold)),
    0,
  );
  const totalPrisoners = items.reduce(
    (s, i) => s + Number(i.gains.prisoners),
    0,
  );

  const DetailRow = ({
    label,
    g,
    l,
  }: {
    label: string;
    g: number | string | bigint;
    l: number | string | bigint;
  }) =>
    g || l ? (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 1fr",
          gap: 4,
          fontSize: 11,
          marginBottom: 2,
        }}
      >
        <span style={{ color: "var(--ds-muted)" }}>{label}</span>
        <span style={{ color: "#27ae60" }}>+{g}</span>
        <span style={{ color: "#e74c3c" }}>-{l}</span>
      </div>
    ) : null;

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div>
      {items.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 20,
            background: "var(--ds-surface)",
            border: "1px solid var(--ds-border)",
            borderRadius: 8,
            padding: "12px 18px",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <SummaryChip label="Interactions" value={String(items.length)} />
          <SummaryChip
            label="Net Troops"
            value={netTroops >= 0 ? `+${netTroops}` : String(netTroops)}
            color={netTroops >= 0 ? "#27ae60" : "#e74c3c"}
          />
          <SummaryChip
            label="Net Gold"
            value={netGold >= 0 ? `+${netGold}` : String(netGold)}
            color={netGold >= 0 ? "#27ae60" : "#e74c3c"}
          />
          <SummaryChip
            label="Prisoners"
            value={String(totalPrisoners)}
            color="var(--ds-gold)"
          />
        </div>
      )}

      {/* Post-save action confirmations */}
      {postSaveActions.length > 0 && (
        <div
          style={{
            background: "rgba(201,163,90,0.08)",
            border: "1px solid var(--ds-gold)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
          }}
          data-ocid="army.gainloss.post_save_actions"
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--ds-gold)",
              fontFamily: "Cinzel, serif",
              marginBottom: 8,
            }}
          >
            SUGGESTED UPDATES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {postSaveActions.map((action) => (
              <div
                key={action.type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 13,
                      color: action.confirmed ? "#27ae60" : "var(--ds-text)",
                    }}
                  >
                    {action.confirmed ? "✓ " : ""}
                    {action.label}:
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--ds-muted)",
                      marginLeft: 6,
                    }}
                  >
                    {action.description}
                  </span>
                </div>
                {!action.confirmed && (
                  <button
                    type="button"
                    className="ds-btn-primary"
                    style={{ fontSize: 11, padding: "3px 10px" }}
                    disabled={applyingAction === action.type}
                    onClick={() => applyAction(action)}
                    data-ocid={`army.gainloss.action.${action.type}.confirm_button`}
                  >
                    {applyingAction === action.type ? "Applying…" : "Apply"}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 11, marginTop: 8 }}
            onClick={() => setPostSaveActions([])}
          >
            Dismiss all
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15 }}
        >
          Gain / Loss Interactions
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blankEntry(armyId));
            setIsNew(true);
          }}
          data-ocid="army.gainloss.add_button"
        >
          + Log Interaction
        </button>
      </div>

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.gainloss.loading_state"
        >
          Loading…
        </p>
      ) : items.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            padding: "24px 0",
          }}
          data-ocid="army.gainloss.empty_state"
        >
          No interactions logged yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, idx) => {
            const oc = OUTCOME_COLORS[item.outcome] ?? OUTCOME_COLORS.Draw;
            const open = expanded.has(item.id);
            return (
              <div
                key={item.id}
                className="ds-card"
                style={{ padding: 14 }}
                data-ocid={`army.gainloss.item.${idx + 1}`}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: `1px solid ${oc.border}`,
                          color: oc.text,
                          background: oc.bg,
                        }}
                      >
                        {item.outcome}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "var(--ds-surface)",
                          color: "var(--ds-muted)",
                          border: "1px solid var(--ds-border)",
                        }}
                      >
                        {item.interactionType}
                      </span>
                      <span
                        className="font-cinzel"
                        style={{ color: "var(--ds-text)", fontSize: 13 }}
                      >
                        vs {item.enemyName || "Unknown"}
                      </span>
                      {factionName(item.linkedFactionId) && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--ds-gold)",
                            background: "var(--ds-surface2)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            border: "1px solid var(--ds-border)",
                          }}
                        >
                          ⚜️ {factionName(item.linkedFactionId)}
                        </span>
                      )}
                    </div>
                    {item.timestamp && (
                      <p style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                        {item.timestamp}
                      </p>
                    )}
                    {item.moraleImpact !== 0n && (
                      <p
                        style={{
                          fontSize: 11,
                          color: item.moraleImpact > 0n ? "#27ae60" : "#e74c3c",
                        }}
                      >
                        Morale: {item.moraleImpact > 0n ? "+" : ""}
                        {String(item.moraleImpact)}
                        {item.moraleApplied && (
                          <span style={{ color: "#27ae60", marginLeft: 4 }}>
                            ✓ applied
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 11, padding: "2px 8px" }}
                      onClick={() => toggleExpand(String(item.id))}
                    >
                      {open ? "▲" : "▼"}
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                      onClick={() => {
                        setEditing({ ...item });
                        setIsNew(false);
                      }}
                      data-ocid={`army.gainloss.edit_button.${idx + 1}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                      onClick={() => del(item.id)}
                      data-ocid={`army.gainloss.delete_button.${idx + 1}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {open && (
                  <div
                    style={{
                      marginTop: 10,
                      borderTop: "1px solid var(--ds-border)",
                      paddingTop: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr 1fr",
                        gap: 4,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--ds-muted)",
                          textTransform: "uppercase",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          color: "#27ae60",
                          textTransform: "uppercase",
                        }}
                      >
                        Gained
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#e74c3c",
                          textTransform: "uppercase",
                        }}
                      >
                        Lost
                      </span>
                    </div>
                    <DetailRow
                      label="Troops"
                      g={Number(item.gains.troops)}
                      l={Number(item.losses.troops)}
                    />
                    <DetailRow
                      label="Gold"
                      g={Number(item.gains.gold)}
                      l={Number(item.losses.gold)}
                    />
                    <DetailRow
                      label="Prisoners"
                      g={Number(item.gains.prisoners)}
                      l={Number(item.losses.prisoners)}
                    />
                    <DetailRow
                      label="Supplies"
                      g={Number(item.gains.supplies)}
                      l={Number(item.losses.supplies)}
                    />
                    <DetailRow
                      label="Territory"
                      g={item.gains.territory}
                      l={item.losses.territory}
                    />
                    <DetailRow
                      label="Intel"
                      g={item.gains.intel}
                      l={item.losses.intel}
                    />
                    <DetailRow
                      label="Officers"
                      g={item.gains.officersCasualties}
                      l={item.losses.officersCasualties}
                    />
                    <DetailRow
                      label="Equipment"
                      g={item.gains.equipmentNotes}
                      l={item.losses.equipmentNotes}
                    />
                    {item.notes && (
                      <p
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "var(--ds-muted)",
                        }}
                      >
                        {item.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
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
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
          onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
          role="presentation"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 600,
              padding: 24,
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 16 }}
              >
                {isNew ? "Log Interaction" : "Edit Interaction"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.gainloss.close_button"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <Field label="Type">
                  <select
                    className="ds-input"
                    value={editing.interactionType}
                    onChange={(e) =>
                      setField("interactionType", e.target.value)
                    }
                    data-ocid="army.gainloss.type.select"
                  >
                    {INTERACTION_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Outcome">
                  <select
                    className="ds-input"
                    value={editing.outcome}
                    onChange={(e) => {
                      setField("outcome", e.target.value);
                      // Auto-fill morale impact when outcome changes
                      if (editing.moraleImpact === 0n) {
                        setField(
                          "moraleImpact",
                          OUTCOME_MORALE[e.target.value] ?? 0,
                        );
                      }
                    }}
                    data-ocid="army.gainloss.outcome.select"
                  >
                    {OUTCOMES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <Field label="Enemy/Opponent">
                  <input
                    className="ds-input"
                    value={editing.enemyName}
                    onChange={(e) => setField("enemyName", e.target.value)}
                    placeholder="Name of enemy force"
                    data-ocid="army.gainloss.enemy.input"
                  />
                </Field>
                <Field label="Date">
                  <input
                    className="ds-input"
                    value={editing.timestamp}
                    onChange={(e) => setField("timestamp", e.target.value)}
                    placeholder="In-game date"
                    data-ocid="army.gainloss.date.input"
                  />
                </Field>
              </div>
              <Field label="Enemy Faction">
                <EntityLinkSelect
                  items={factionItems}
                  value={editing.linkedFactionId ?? null}
                  onChange={(id) =>
                    setEditing((e) =>
                      e ? { ...e, linkedFactionId: id ?? undefined } : e,
                    )
                  }
                  label=""
                  placeholder="— None —"
                  ocid="army.gainloss.faction.select"
                />
              </Field>

              <SectionHeader>Gains</SectionHeader>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                <Field label="Troops">
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.gains.troops)}
                    onChange={(e) =>
                      setGain("troops", BigInt(e.target.value || "0"))
                    }
                  />
                </Field>
                <Field label="Gold">
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.gains.gold)}
                    onChange={(e) =>
                      setGain("gold", BigInt(e.target.value || "0"))
                    }
                  />
                </Field>
                <Field label="Prisoners">
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.gains.prisoners)}
                    onChange={(e) =>
                      setGain("prisoners", BigInt(e.target.value || "0"))
                    }
                  />
                </Field>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <Field label="Supplies Gained">
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.gains.supplies)}
                    onChange={(e) =>
                      setGain("supplies", BigInt(e.target.value || "0"))
                    }
                  />
                </Field>
                <Field label="Territory Gained">
                  <input
                    className="ds-input"
                    value={editing.gains.territory}
                    onChange={(e) => setGain("territory", e.target.value)}
                    placeholder="e.g. Northern Keep"
                  />
                </Field>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <Field label="Intel Gathered">
                  <input
                    className="ds-input"
                    value={editing.gains.intel}
                    onChange={(e) => setGain("intel", e.target.value)}
                    placeholder="Scout reports, spy info"
                  />
                </Field>
                <Field label="Equipment Gained">
                  <input
                    className="ds-input"
                    value={editing.gains.equipmentNotes}
                    onChange={(e) => setGain("equipmentNotes", e.target.value)}
                    placeholder="Weapons, siege engines"
                  />
                </Field>
              </div>
              <Field label="Other Gains">
                <input
                  className="ds-input"
                  value={editing.gains.other}
                  onChange={(e) => setGain("other", e.target.value)}
                  placeholder="Morale boosts, alliances, etc."
                />
              </Field>

              <SectionHeader>Losses</SectionHeader>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                <Field label="Troops Lost">
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.losses.troops)}
                    onChange={(e) =>
                      setLoss("troops", BigInt(e.target.value || "0"))
                    }
                  />
                </Field>
                <Field label="Gold Lost">
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.losses.gold)}
                    onChange={(e) =>
                      setLoss("gold", BigInt(e.target.value || "0"))
                    }
                  />
                </Field>
                <Field label="Prisoners Taken">
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.losses.prisoners)}
                    onChange={(e) =>
                      setLoss("prisoners", BigInt(e.target.value || "0"))
                    }
                  />
                </Field>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <Field label="Supplies Lost">
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    value={Number(editing.losses.supplies)}
                    onChange={(e) =>
                      setLoss("supplies", BigInt(e.target.value || "0"))
                    }
                  />
                </Field>
                <Field label="Territory Lost">
                  <input
                    className="ds-input"
                    value={editing.losses.territory}
                    onChange={(e) => setLoss("territory", e.target.value)}
                    placeholder="e.g. Southern Fort"
                  />
                </Field>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <Field label="Officer Casualties">
                  <input
                    className="ds-input"
                    value={editing.losses.officersCasualties}
                    onChange={(e) =>
                      setLoss("officersCasualties", e.target.value)
                    }
                    placeholder="Named officers lost"
                  />
                </Field>
                <Field label="Equipment Destroyed">
                  <input
                    className="ds-input"
                    value={editing.losses.equipmentNotes}
                    onChange={(e) => setLoss("equipmentNotes", e.target.value)}
                    placeholder="Siege engines, wagons"
                  />
                </Field>
              </div>
              <Field label="Other Losses">
                <input
                  className="ds-input"
                  value={editing.losses.other}
                  onChange={(e) => setLoss("other", e.target.value)}
                  placeholder="Morale hits, broken alliances"
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 10,
                }}
              >
                <Field label="Morale Impact (auto-calculated; override as needed)">
                  <input
                    className="ds-input"
                    type="number"
                    value={Number(editing.moraleImpact)}
                    onChange={(e) =>
                      setField("moraleImpact", BigInt(e.target.value || "0"))
                    }
                    data-ocid="army.gainloss.morale.input"
                  />
                </Field>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    marginTop: -6,
                  }}
                >
                  Suggested: Victory +5, Defeat -10, Draw 0, Retreat -5,
                  Surrender -15
                </p>
              </div>
              <Field label="Notes">
                <textarea
                  className="ds-input"
                  rows={3}
                  value={editing.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Battle context, notable moments…"
                  style={{ resize: "vertical" }}
                  data-ocid="army.gainloss.notes.textarea"
                />
              </Field>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.gainloss.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="army.gainloss.save_button"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defeat campaign note modal */}
      {defeatNoteModal.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 210,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          role="presentation"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setDefeatNoteModal({ text: "", open: false })
          }
          onKeyDown={(e) =>
            e.key === "Escape" && setDefeatNoteModal({ text: "", open: false })
          }
          data-ocid="army.gainloss.defeat_note.dialog"
        >
          <div
            className="ds-card"
            style={{ width: "100%", maxWidth: 500, padding: 24 }}
          >
            <h3
              className="font-cinzel"
              style={{
                color: "var(--ds-gold)",
                marginBottom: 12,
                fontSize: 16,
              }}
            >
              Campaign Note — Major Defeat
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "var(--ds-muted)",
                marginBottom: 12,
              }}
            >
              Review and edit this note before saving to campaign notes.
            </p>
            <textarea
              className="ds-input"
              rows={6}
              value={defeatNoteModal.text}
              onChange={(e) =>
                setDefeatNoteModal((m) => ({ ...m, text: e.target.value }))
              }
              style={{ resize: "vertical", width: "100%" }}
              data-ocid="army.gainloss.defeat_note.textarea"
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setDefeatNoteModal({ text: "", open: false })}
                data-ocid="army.gainloss.defeat_note.cancel_button"
              >
                Skip
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveCampaignNote}
                data-ocid="army.gainloss.defeat_note.confirm_button"
              >
                Save Campaign Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryChip({
  label,
  value,
  color,
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 10,
          color: "var(--ds-muted)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: color ?? "var(--ds-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="ds-label">{label}</div>
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "var(--ds-gold)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontFamily: "Cinzel, serif",
        borderBottom: "1px solid var(--ds-border)",
        paddingBottom: 4,
        marginTop: 4,
      }}
    >
      {children}
    </div>
  );
}

import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import EntityLinkSelect from "../components/EntityLinkSelect";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import MultiEntityLinkSelect from "../components/MultiEntityLinkSelect";
import type { Faction, Location } from "../types";
import type {
  AppReminder,
  CalendarEvent,
  Campaign,
  CampaignEnemy,
  DndBackend,
  EncounterEntry,
  InitiativeEntry,
  InitiativeTracker,
  NPC,
  PartyXpEntry,
  SessionEntry,
} from "../types";

interface Props {
  actor: DndBackend;
  onRestartConnection?: () => void;
}

type CampaignTab =
  | "campaigns"
  | "sessions"
  | "encounters"
  | "npcs"
  | "timeline"
  | "calendar"
  | "enemies"
  | "partyxp"
  | "initiative";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── shared ────────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  emoji,
  onAdd,
  adding,
}: { title: string; emoji: string; onAdd: () => void; adding: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <h2
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 22 }}
      >
        {emoji} {title}
      </h2>
      <button
        type="button"
        className="ds-btn-primary"
        onClick={onAdd}
        disabled={adding}
        data-ocid={`campaign.${title.toLowerCase().replace(/ /g, "_")}.add_button`}
      >
        {adding ? "Saving…" : "+ Add"}
      </button>
    </div>
  );
}

function EmptyState({ emoji, message }: { emoji: string; message: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 0",
        color: "var(--ds-muted)",
      }}
      data-ocid="campaign.empty_state"
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
      <p>{message}</p>
    </div>
  );
}

function ModalOverlay({
  title,
  onClose,
  children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      data-ocid="campaign.dialog"
    >
      <div
        className="ds-card"
        style={{
          width: "100%",
          maxWidth: 540,
          padding: 24,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 17 }}
          >
            {title}
          </h3>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={onClose}
            data-ocid="campaign.close_button"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="ds-label" style={{ marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    Active: { bg: "rgba(39,174,96,0.15)", fg: "#27ae60" },
    Completed: { bg: "rgba(52,152,219,0.15)", fg: "#3498db" },
    Paused: { bg: "rgba(243,156,18,0.15)", fg: "#f39c12" },
  };
  const c = colors[status] ?? {
    bg: "rgba(150,150,150,0.1)",
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
      {status}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    Easy: "#27ae60",
    Medium: "#f39c12",
    Hard: "#e67e22",
    Deadly: "#c0392b",
    Legendary: "#9b59b6",
  };
  const c = colors[difficulty] ?? "var(--ds-muted)";
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 4,
        background: `${c}22`,
        color: c,
        border: `1px solid ${c}`,
        whiteSpace: "nowrap",
      }}
    >
      {difficulty}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const colors: Record<string, string> = {
    Victory: "#27ae60",
    Defeat: "#c0392b",
    Escaped: "#f39c12",
    Negotiated: "#3498db",
  };
  const c = colors[outcome] ?? "var(--ds-muted)";
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 4,
        background: `${c}22`,
        color: c,
        border: `1px solid ${c}`,
        whiteSpace: "nowrap",
      }}
    >
      {outcome}
    </span>
  );
}

function RelBadge({ rel }: { rel: string }) {
  const colors: Record<string, string> = {
    Friend: "#27ae60",
    Ally: "#3498db",
    Neutral: "var(--ds-muted)",
    Enemy: "#c0392b",
    Unknown: "#7f8c8d",
  };
  const c = colors[rel] ?? "var(--ds-muted)";
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 4,
        background: `${c}22`,
        color: c,
        border: `1px solid ${c}`,
        whiteSpace: "nowrap",
      }}
    >
      {rel}
    </span>
  );
}

// ── Campaigns Tab ─────────────────────────────────────────────────────────────

function CampaignsTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getCampaigns());
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = (): Campaign => ({
    id: uid(),
    name: "",
    description: "",
    characterIds: [],
    armyIds: [],
    notes: "",
    status: "Active",
    startDate: "",
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addCampaign(editing);
      else await actor.updateCampaign(editing);
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save campaign:", err);
      alert(
        `Failed to save campaign: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await actor.deleteCampaign(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof Campaign, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="campaign.campaigns.loading_state"
      >
        Loading campaigns…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="Campaigns"
        emoji="🏰"
        onAdd={() => {
          setEditing(blank());
          setIsNew(true);
        }}
        adding={saving}
      />
      {items.length === 0 ? (
        <EmptyState
          emoji="🗡️"
          message="No campaigns yet. Create your first campaign."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((c, idx) => (
            <div
              key={c.id}
              className="ds-card"
              style={{ padding: 18 }}
              data-ocid={`campaign.campaigns.item.${idx + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <p
                  className="font-cinzel"
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 16,
                    flex: 1,
                    paddingRight: 8,
                  }}
                >
                  {c.name || "Untitled"}
                </p>
                <StatusBadge status={c.status} />
              </div>
              {c.startDate && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 6,
                  }}
                >
                  📅 Started: {c.startDate}
                </p>
              )}
              {c.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ds-text)",
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                >
                  {c.description}
                </p>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <button
                  type="button"
                  className="ds-btn-primary"
                  style={{ flex: 1, fontSize: 12 }}
                  onClick={() => {
                    setEditing({ ...c });
                    setIsNew(false);
                  }}
                  data-ocid={`campaign.campaigns.edit_button.${idx + 1}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 13 }}
                  onClick={() => del(c.id)}
                  data-ocid={`campaign.campaigns.delete_button.${idx + 1}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ModalOverlay
          title={isNew ? "New Campaign" : "Edit Campaign"}
          onClose={() => setEditing(null)}
        >
          <Field label="Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Curse of Strahd"
              data-ocid="campaign.campaigns.name.input"
            />
          </Field>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Status">
              <select
                className="ds-input"
                value={editing.status}
                onChange={(e) => set("status", e.target.value)}
                data-ocid="campaign.campaigns.status.select"
              >
                {["Active", "Completed", "Paused"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Start Date">
              <input
                className="ds-input"
                value={editing.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                placeholder="e.g. Year 1492 DR"
                data-ocid="campaign.campaigns.startdate.input"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="ds-input"
              rows={3}
              value={editing.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Campaign summary…"
              data-ocid="campaign.campaigns.description.textarea"
            />
          </Field>
          <Field label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="DM notes…"
              data-ocid="campaign.campaigns.notes.textarea"
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setEditing(null)}
              data-ocid="campaign.campaigns.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="campaign.campaigns.save_button"
            >
              {saving ? "Saving…" : "Save Campaign"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Sessions Tab ──────────────────────────────────────────────────────────────

function SessionsTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<SessionEntry[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [encounters, setEncounters] = useState<EncounterEntry[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<SessionEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, e, n] = await Promise.all([
        actor.getSessionLog(),
        actor.getCampaigns(),
        actor.getEncounterLog().catch(() => [] as EncounterEntry[]),
        actor.getNPCs().catch(() => [] as NPC[]),
      ]);
      setItems([...s].sort((a, b) => b.date.localeCompare(a.date)));
      setCampaigns(c);
      setEncounters(e);
      setNpcs(n);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = (): SessionEntry => ({
    id: uid(),
    campaignId: undefined,
    title: "",
    date: "",
    summary: "",
    xpGained: 0n,
    loot: "",
    notes: "",
    linkedEncounterIds: [],
    linkedNpcIds: [],
    linkedQuestIds: [],
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor.addSessionEntry(editing);
        await actor
          .addTimelineEvent({
            id: uid(),
            title: editing.title || "Session",
            date: editing.date,
            category: "Session",
            description: editing.summary,
            characters: [],
            armies: [],
            owner: Principal.anonymous(),
          })
          .catch(console.error);
      } else {
        await actor.updateSessionEntry(editing);
      }
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save session:", err);
      alert(
        `Failed to save session: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this session log?")) return;
    try {
      await actor.deleteSessionEntry(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof SessionEntry, v: string | bigint | undefined) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  const getCampaignName = (id: string | undefined) =>
    id ? (campaigns.find((c) => c.id === id)?.name ?? "Unknown") : null;

  const encounterSelectItems = encounters.map((e, i) => ({
    id: BigInt(i + 1),
    name: e.name || `Encounter ${i + 1}`,
  }));
  const npcSelectItems = npcs.map((n, i) => ({
    id: BigInt(i + 1),
    name: n.name || `NPC ${i + 1}`,
  }));

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="campaign.sessions.loading_state"
      >
        Loading sessions…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="Session Log"
        emoji="📖"
        onAdd={() => {
          setEditing(blank());
          setIsNew(true);
        }}
        adding={saving}
      />
      {items.length === 0 ? (
        <EmptyState
          emoji="📝"
          message="No sessions logged yet. Record your first session."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((s, idx) => (
            <div
              key={s.id}
              className="ds-card"
              style={{ padding: 18 }}
              data-ocid={`campaign.sessions.item.${idx + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div>
                  <p
                    className="font-cinzel"
                    style={{ color: "var(--ds-gold)", fontSize: 15 }}
                  >
                    {s.title || "Untitled Session"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    {s.date && (
                      <span style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                        📅 {s.date}
                      </span>
                    )}
                    {getCampaignName(s.campaignId) && (
                      <span style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                        🏰 {getCampaignName(s.campaignId)}
                      </span>
                    )}
                    {s.xpGained > 0n && (
                      <span style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                        ✨ {s.xpGained.toString()} XP
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => {
                      setEditing({ ...s });
                      setIsNew(false);
                    }}
                    data-ocid={`campaign.sessions.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => del(s.id)}
                    data-ocid={`campaign.sessions.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {s.summary && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ds-text)",
                    lineHeight: 1.5,
                  }}
                >
                  {s.summary}
                </p>
              )}
              {s.loot && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginTop: 6,
                  }}
                >
                  💰 Loot: {s.loot}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ModalOverlay
          title={isNew ? "Log Session" : "Edit Session"}
          onClose={() => setEditing(null)}
        >
          <Field label="Title">
            <input
              className="ds-input"
              value={editing.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Session 1 — Into the Underdark"
              data-ocid="campaign.sessions.title.input"
            />
          </Field>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Date">
              <input
                className="ds-input"
                value={editing.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="e.g. 2024-01-15"
                data-ocid="campaign.sessions.date.input"
              />
            </Field>
            <Field label="XP Gained">
              <input
                className="ds-input"
                type="number"
                value={editing.xpGained.toString()}
                onChange={(e) => set("xpGained", BigInt(e.target.value || "0"))}
                placeholder="0"
                data-ocid="campaign.sessions.xp.input"
              />
            </Field>
          </div>
          <Field label="Campaign (optional)">
            <select
              className="ds-input"
              value={editing.campaignId ?? ""}
              onChange={(e) => set("campaignId", e.target.value || undefined)}
              data-ocid="campaign.sessions.campaign.select"
            >
              <option value="">— None —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Linked Encounters">
            <MultiEntityLinkSelect
              items={encounterSelectItems}
              values={editing.linkedEncounterIds ?? []}
              onChange={(ids) =>
                setEditing((e) => (e ? { ...e, linkedEncounterIds: ids } : e))
              }
              label=""
              ocid="campaign.sessions.linked_encounters"
            />
          </Field>
          <Field label="Linked NPCs">
            <MultiEntityLinkSelect
              items={npcSelectItems}
              values={editing.linkedNpcIds ?? []}
              onChange={(ids) =>
                setEditing((e) => (e ? { ...e, linkedNpcIds: ids } : e))
              }
              label=""
              ocid="campaign.sessions.linked_npcs"
            />
          </Field>
          <Field label="Summary">
            <textarea
              className="ds-input"
              rows={4}
              value={editing.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="What happened this session…"
              data-ocid="campaign.sessions.summary.textarea"
            />
          </Field>
          <Field label="Loot">
            <input
              className="ds-input"
              value={editing.loot}
              onChange={(e) => set("loot", e.target.value)}
              placeholder="Items and gold gained"
              data-ocid="campaign.sessions.loot.input"
            />
          </Field>
          <Field label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Extra notes…"
              data-ocid="campaign.sessions.notes.textarea"
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setEditing(null)}
              data-ocid="campaign.sessions.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="campaign.sessions.save_button"
            >
              {saving ? "Saving…" : "Save Session"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Encounters Tab ────────────────────────────────────────────────────────────

function EncountersTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<EncounterEntry[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [locationsList, setLocationsList] = useState<Location[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<EncounterEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [armies, setArmies] = useState<{ id: string; name: string }[]>([]);
  const [pushToArmy, setPushToArmy] = useState<{
    encounter: EncounterEntry;
    armyId: string;
  } | null>(null);
  const [pushing, setPushing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, c, a, locs, npcList] = await Promise.all([
        actor.getEncounterLog(),
        actor.getCampaigns(),
        actor.getArmies().catch(() => []),
        actor.getLocations().catch(() => [] as Location[]),
        actor.getNPCs().catch(() => [] as NPC[]),
      ]);
      setItems(e);
      setCampaigns(c);
      setArmies(
        (a as { id: string; name: string }[]).map((ar) => ({
          id: ar.id,
          name: ar.name,
        })),
      );
      setLocationsList(locs);
      setNpcs(npcList);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = (): EncounterEntry => ({
    id: uid(),
    campaignId: undefined,
    name: "",
    date: "",
    difficulty: "Medium",
    outcome: "Victory",
    xpAwarded: 0n,
    notes: "",
    locationId: undefined,
    linkedNpcIds: [],
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addEncounterEntry(editing);
      else await actor.updateEncounterEntry(editing);
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save encounter:", err);
      alert(
        `Failed to save encounter: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this encounter?")) return;
    try {
      await actor.deleteEncounterEntry(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const pushEncounterToEnemyRoster = async () => {
    if (!pushToArmy) return;
    setPushing(true);
    try {
      await actor.addEnemyProfile(pushToArmy.armyId, {
        id: `enc-${Date.now()}`,
        armyId: pushToArmy.armyId,
        name: pushToArmy.encounter.name,
        faction: "",
        enemyType: "Encounter",
        description: pushToArmy.encounter.notes,
        knownStrengths: "",
        knownWeaknesses: "",
        notes: `Difficulty: ${pushToArmy.encounter.difficulty} | Outcome: ${pushToArmy.encounter.outcome}`,
        wins: pushToArmy.encounter.outcome === "Victory" ? 1n : 0n,
        losses: pushToArmy.encounter.outcome === "Defeat" ? 1n : 0n,
        draws: pushToArmy.encounter.outcome === "Draw" ? 1n : 0n,
        owner: Principal.anonymous(),
      });
      setPushToArmy(null);
    } catch (e) {
      console.error(e);
    }
    setPushing(false);
  };

  const set = (k: keyof EncounterEntry, v: string | bigint | undefined) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  const getCampaignName = (id: string | undefined) =>
    id ? (campaigns.find((c) => c.id === id)?.name ?? null) : null;

  const locationSelectItems = locationsList.map((l, i) => ({
    id: BigInt(i + 1),
    name: l.name,
  }));
  const npcSelectItems = npcs.map((n, i) => ({
    id: BigInt(i + 1),
    name: n.name || `NPC ${i + 1}`,
  }));
  const locationName = (id: bigint | undefined) =>
    id !== undefined
      ? locationSelectItems.find((l) => l.id === id)?.name
      : undefined;
  const linkedNpcNames = (ids: bigint[] | undefined) =>
    (ids ?? [])
      .map((id) => npcSelectItems.find((n) => n.id === id)?.name)
      .filter(Boolean) as string[];

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="campaign.encounters.loading_state"
      >
        Loading encounters…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="Encounter Log"
        emoji="⚔️"
        onAdd={() => {
          setEditing(blank());
          setIsNew(true);
        }}
        adding={saving}
      />
      {items.length === 0 ? (
        <EmptyState
          emoji="🐉"
          message="No encounters logged yet. Record your first battle."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((en, idx) => (
            <div
              key={en.id}
              className="ds-card"
              style={{ padding: 18 }}
              data-ocid={`campaign.encounters.item.${idx + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <p
                  className="font-cinzel"
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 15,
                    flex: 1,
                    paddingRight: 8,
                  }}
                >
                  {en.name || "Unnamed"}
                </p>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() =>
                      setPushToArmy({
                        encounter: en,
                        armyId: armies[0]?.id ?? "",
                      })
                    }
                    title="Push to Army Enemy Roster"
                    data-ocid={`campaign.encounters.push_army.${idx + 1}`}
                  >
                    ⚔️ Push
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => {
                      setEditing({ ...en });
                      setIsNew(false);
                    }}
                    data-ocid={`campaign.encounters.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => del(en.id)}
                    data-ocid={`campaign.encounters.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                <DifficultyBadge difficulty={en.difficulty} />
                <OutcomeBadge outcome={en.outcome} />
                {locationName(en.locationId) && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#5ac97a",
                      background: "var(--ds-surface2)",
                      padding: "2px 7px",
                      borderRadius: 4,
                      border: "1px solid var(--ds-border)",
                    }}
                  >
                    📍 {locationName(en.locationId)}
                  </span>
                )}
              </div>
              {linkedNpcNames(en.linkedNpcIds).length > 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 4,
                  }}
                >
                  👥 {linkedNpcNames(en.linkedNpcIds).join(", ")}
                </p>
              )}
              {en.date && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 4,
                  }}
                >
                  📅 {en.date}
                </p>
              )}
              {getCampaignName(en.campaignId) && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 4,
                  }}
                >
                  🏰 {getCampaignName(en.campaignId)}
                </p>
              )}
              {en.xpAwarded > 0n && (
                <p style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                  ✨ {en.xpAwarded.toString()} XP awarded
                </p>
              )}
              {en.notes && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ds-text)",
                    marginTop: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {en.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ModalOverlay
          title={isNew ? "Log Encounter" : "Edit Encounter"}
          onClose={() => setEditing(null)}
        >
          <Field label="Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Goblin Ambush"
              data-ocid="campaign.encounters.name.input"
            />
          </Field>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Date">
              <input
                className="ds-input"
                value={editing.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="e.g. 2024-01-15"
                data-ocid="campaign.encounters.date.input"
              />
            </Field>
            <Field label="XP Awarded">
              <input
                className="ds-input"
                type="number"
                value={editing.xpAwarded.toString()}
                onChange={(e) =>
                  set("xpAwarded", BigInt(e.target.value || "0"))
                }
                data-ocid="campaign.encounters.xp.input"
              />
            </Field>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Difficulty">
              <select
                className="ds-input"
                value={editing.difficulty}
                onChange={(e) => set("difficulty", e.target.value)}
                data-ocid="campaign.encounters.difficulty.select"
              >
                {["Easy", "Medium", "Hard", "Deadly", "Legendary"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Outcome">
              <select
                className="ds-input"
                value={editing.outcome}
                onChange={(e) => set("outcome", e.target.value)}
                data-ocid="campaign.encounters.outcome.select"
              >
                {["Victory", "Defeat", "Escaped", "Negotiated"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Location">
            <EntityLinkSelect
              items={locationSelectItems}
              value={editing.locationId ?? null}
              onChange={(id) =>
                setEditing((e) =>
                  e ? { ...e, locationId: id ?? undefined } : e,
                )
              }
              label=""
              placeholder="— None —"
              ocid="campaign.encounters.location.select"
            />
          </Field>
          <Field label="Linked NPCs">
            <MultiEntityLinkSelect
              items={npcSelectItems}
              values={editing.linkedNpcIds ?? []}
              onChange={(ids) =>
                setEditing((e) => (e ? { ...e, linkedNpcIds: ids } : e))
              }
              label=""
              ocid="campaign.encounters.linked_npcs"
            />
          </Field>
          <Field label="Campaign (optional)">
            <select
              className="ds-input"
              value={editing.campaignId ?? ""}
              onChange={(e) => set("campaignId", e.target.value || undefined)}
              data-ocid="campaign.encounters.campaign.select"
            >
              <option value="">— None —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea
              className="ds-input"
              rows={3}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Notes about the encounter…"
              data-ocid="campaign.encounters.notes.textarea"
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setEditing(null)}
              data-ocid="campaign.encounters.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="campaign.encounters.save_button"
            >
              {saving ? "Saving…" : "Save Encounter"}
            </button>
          </div>
        </ModalOverlay>
      )}
      {pushToArmy && (
        <ModalOverlay
          title="Push to Army Enemy Roster"
          onClose={() => setPushToArmy(null)}
        >
          <p
            style={{ fontSize: 13, color: "var(--ds-text)", marginBottom: 12 }}
          >
            Push <strong>{pushToArmy.encounter.name}</strong> to which army's
            enemy roster?
          </p>
          <Field label="Select Army">
            <select
              className="ds-input"
              value={pushToArmy.armyId}
              onChange={(e) =>
                setPushToArmy((p) => (p ? { ...p, armyId: e.target.value } : p))
              }
              data-ocid="campaign.encounters.push_army.select"
            >
              <option value="">— Select army —</option>
              {armies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setPushToArmy(null)}
              data-ocid="campaign.encounters.push_army.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={pushEncounterToEnemyRoster}
              disabled={pushing || !pushToArmy.armyId}
              data-ocid="campaign.encounters.push_army.confirm_button"
            >
              {pushing ? "Pushing…" : "Push to Roster"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── NPCs Tab ──────────────────────────────────────────────────────────────────

function NPCsTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<NPC[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [locationsList, setLocationsList] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<NPC | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [npcs, facs, locs] = await Promise.all([
        actor.getNPCs(),
        actor.getFactions().catch(() => [] as Faction[]),
        actor.getLocations().catch(() => [] as Location[]),
      ]);
      setItems(npcs);
      setFactions(facs);
      setLocationsList(locs);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = (): NPC => ({
    id: uid(),
    name: "",
    race: "",
    location: "",
    relationship: "Unknown",
    description: "",
    notes: "",
    factionId: undefined,
    locationId: undefined,
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addNPC(editing);
      else await actor.updateNPC(editing);
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save NPC:", err);
      alert(
        `Failed to save NPC: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this NPC?")) return;
    try {
      await actor.deleteNPC(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof NPC, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const factionItems = factions.map((f) => ({ id: f.id, name: f.name }));
  const locationItems = locationsList.map((l, i) => ({
    id: BigInt(i + 1),
    name: l.name,
  }));
  const factionName = (id: bigint | undefined) =>
    id !== undefined ? factions.find((f) => f.id === id)?.name : undefined;
  const locationName = (id: bigint | undefined) =>
    id !== undefined ? locationItems.find((l) => l.id === id)?.name : undefined;

  const filtered = items.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="campaign.npcs.loading_state"
      >
        Loading NPCs…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="NPC Tracker"
        emoji="👥"
        onAdd={() => {
          setEditing(blank());
          setIsNew(true);
        }}
        adding={saving}
      />
      <div style={{ marginBottom: 16 }}>
        <input
          className="ds-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search NPCs by name…"
          style={{ maxWidth: 340 }}
          data-ocid="campaign.npcs.search_input"
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🧑‍🤝‍🧑"
          message={
            search
              ? "No NPCs match your search."
              : "No NPCs tracked yet. Add your first NPC."
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((npc, idx) => (
            <div
              key={npc.id}
              className="ds-card"
              style={{ padding: 16 }}
              data-ocid={`campaign.npcs.item.${idx + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 6,
                }}
              >
                <div>
                  <p
                    className="font-cinzel"
                    style={{
                      color: "var(--ds-gold)",
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                  >
                    {npc.name || "Unnamed"}
                  </p>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <RelBadge rel={npc.relationship} />
                    {factionName(npc.factionId) && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--ds-gold)",
                          background: "var(--ds-surface2)",
                          padding: "2px 7px",
                          borderRadius: 4,
                          border: "1px solid var(--ds-border)",
                        }}
                      >
                        ⚜️ {factionName(npc.factionId)}
                      </span>
                    )}
                    {locationName(npc.locationId) && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#5ac97a",
                          background: "var(--ds-surface2)",
                          padding: "2px 7px",
                          borderRadius: 4,
                          border: "1px solid var(--ds-border)",
                        }}
                      >
                        📍 {locationName(npc.locationId)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => {
                      setEditing({ ...npc });
                      setIsNew(false);
                    }}
                    data-ocid={`campaign.npcs.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => del(npc.id)}
                    data-ocid={`campaign.npcs.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {npc.race && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 3,
                  }}
                >
                  🧬 {npc.race}
                </p>
              )}
              {npc.location && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 6,
                  }}
                >
                  📍 {npc.location}
                </p>
              )}
              {npc.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ds-text)",
                    lineHeight: 1.5,
                  }}
                >
                  {npc.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ModalOverlay
          title={isNew ? "Add NPC" : "Edit NPC"}
          onClose={() => setEditing(null)}
        >
          <Field label="Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Barkeep Thorin"
              data-ocid="campaign.npcs.name.input"
            />
          </Field>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Race">
              <input
                className="ds-input"
                value={editing.race}
                onChange={(e) => set("race", e.target.value)}
                placeholder="e.g. Dwarf"
                data-ocid="campaign.npcs.race.input"
              />
            </Field>
            <Field label="Relationship">
              <select
                className="ds-input"
                value={editing.relationship}
                onChange={(e) => set("relationship", e.target.value)}
                data-ocid="campaign.npcs.relationship.select"
              >
                {["Friend", "Ally", "Neutral", "Enemy", "Unknown"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Faction">
            <EntityLinkSelect
              items={factionItems}
              value={editing.factionId ?? null}
              onChange={(id) =>
                setEditing((e) =>
                  e ? { ...e, factionId: id ?? undefined } : e,
                )
              }
              label=""
              placeholder="— None —"
              ocid="campaign.npcs.faction.select"
            />
          </Field>
          <Field label="Location (linked)">
            <EntityLinkSelect
              items={locationItems}
              value={editing.locationId ?? null}
              onChange={(id) =>
                setEditing((e) =>
                  e ? { ...e, locationId: id ?? undefined } : e,
                )
              }
              label=""
              placeholder="— None —"
              ocid="campaign.npcs.location_link.select"
            />
          </Field>
          <Field label="Location (text)">
            <input
              className="ds-input"
              value={editing.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Where they can be found"
              data-ocid="campaign.npcs.location.input"
            />
          </Field>
          <Field label="Description">
            <textarea
              className="ds-input"
              rows={3}
              value={editing.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Physical appearance, personality…"
              data-ocid="campaign.npcs.description.textarea"
            />
          </Field>
          <Field label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Quest hooks, secrets…"
              data-ocid="campaign.npcs.notes.textarea"
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setEditing(null)}
              data-ocid="campaign.npcs.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="campaign.npcs.save_button"
            >
              {saving ? "Saving…" : "Save NPC"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Timeline Tab ──────────────────────────────────────────────────────────────

type TimelineEntryType = "session" | "encounter" | "npc";

interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  title: string;
  date: string;
  description: string;
  outcome?: string;
  linkedNPCs: string[];
  xp?: bigint;
  difficulty?: string;
  relationship?: string;
}

const TYPE_META: Record<
  TimelineEntryType,
  { icon: string; color: string; bg: string; label: string }
> = {
  session: {
    icon: "📖",
    color: "#3498db",
    bg: "rgba(52,152,219,0.12)",
    label: "Session",
  },
  encounter: {
    icon: "⚔️",
    color: "#e74c3c",
    bg: "rgba(231,76,60,0.12)",
    label: "Encounter",
  },
  npc: {
    icon: "👤",
    color: "#27ae60",
    bg: "rgba(39,174,96,0.12)",
    label: "NPC",
  },
};

function TypeBadge({ type }: { type: TimelineEntryType }) {
  const m = TYPE_META[type];
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 4,
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.color}`,
        whiteSpace: "nowrap",
      }}
    >
      {m.icon} {m.label}
    </span>
  );
}

function TimelineTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<TimelineEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local storage key for timeline entries (no backend method needed yet —
  // we synthesise from existing sessions/encounters/npcs plus custom entries)
  const STORAGE_KEY = "ds_timeline_entries";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sessions, encounters, npcList] = await Promise.all([
        actor.getSessionLog(),
        actor.getEncounterLog(),
        actor.getNPCs(),
      ]);
      setNpcs(npcList);

      // Load custom timeline entries from localStorage
      let custom: TimelineEntry[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) custom = JSON.parse(raw) as TimelineEntry[];
      } catch {
        custom = [];
      }

      // Synthesise entries from sessions and encounters
      const sessionEntries: TimelineEntry[] = sessions.map((s) => ({
        id: `session-${s.id}`,
        type: "session",
        title: s.title || "Untitled Session",
        date: s.date || "",
        description: s.summary || "",
        xp: s.xpGained,
        linkedNPCs: [],
      }));

      const encounterEntries: TimelineEntry[] = encounters.map((e) => ({
        id: `encounter-${e.id}`,
        type: "encounter",
        title: e.name || "Unnamed Encounter",
        date: e.date || "",
        description: e.notes || "",
        outcome: e.outcome,
        xp: e.xpAwarded,
        difficulty: e.difficulty,
        linkedNPCs: [],
      }));

      // Combine all and sort by date desc
      const all: TimelineEntry[] = [
        ...custom,
        ...sessionEntries,
        ...encounterEntries,
      ].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });

      setEntries(all);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const saveCustomEntries = (list: TimelineEntry[]) => {
    const custom = list.filter(
      (e) => !e.id.startsWith("session-") && !e.id.startsWith("encounter-"),
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  };

  const blank = (): TimelineEntry => ({
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "session",
    title: "",
    date: "",
    description: "",
    outcome: "",
    linkedNPCs: [],
  });

  const saveEntry = () => {
    if (!editing) return;
    setSaving(true);
    try {
      let updated: TimelineEntry[];
      if (isNew) {
        updated = [editing, ...entries];
      } else {
        updated = entries.map((e) => (e.id === editing.id ? editing : e));
      }
      // Resort
      updated = updated.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });
      setEntries(updated);
      saveCustomEntries(updated);
      setEditing(null);
    } catch {
      /* ignore */
    }
    setSaving(false);
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Remove this timeline entry?")) return;
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveCustomEntries(updated);
  };

  const setField = <K extends keyof TimelineEntry>(
    k: K,
    v: TimelineEntry[K],
  ) => {
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  };

  const isCustom = (id: string) =>
    !id.startsWith("session-") && !id.startsWith("encounter-");

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading) {
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="campaign.timeline.loading_state"
      >
        Building timeline…
      </p>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Campaign Timeline"
        emoji="🕰️"
        onAdd={() => {
          setEditing(blank());
          setIsNew(true);
        }}
        adding={saving}
      />

      {/* Filter legend */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {(["session", "encounter", "npc"] as TimelineEntryType[]).map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
        <span
          style={{
            fontSize: 12,
            color: "var(--ds-muted)",
            alignSelf: "center",
          }}
        >
          Sorted by date, newest first
        </span>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          emoji="🕰️"
          message="No timeline entries yet. Sessions and encounters appear here automatically, or add custom events."
        />
      ) : (
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: "var(--ds-border)",
              zIndex: 0,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              paddingLeft: 44,
            }}
          >
            {entries.map((entry, idx) => {
              const meta = TYPE_META[entry.type];
              const isExpanded = expanded === entry.id;
              return (
                <div
                  key={entry.id}
                  style={{ position: "relative", marginBottom: 16 }}
                  data-ocid={`campaign.timeline.item.${idx + 1}`}
                >
                  {/* Timeline dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: -32,
                      top: 16,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: meta.color,
                      border: "2px solid var(--ds-bg)",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                    }}
                  />

                  <button
                    type="button"
                    className="ds-card"
                    style={{
                      padding: "14px 16px",
                      borderLeft: `3px solid ${meta.color}`,
                      cursor: "pointer",
                      transition: "opacity 0.2s",
                      width: "100%",
                      textAlign: "left",
                      background: "var(--ds-card)",
                    }}
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    aria-expanded={isExpanded}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <TypeBadge type={entry.type} />
                          {entry.date && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--ds-muted)",
                              }}
                            >
                              📅 {entry.date}
                            </span>
                          )}
                        </div>
                        <p
                          className="font-cinzel"
                          style={{
                            color: "var(--ds-gold)",
                            fontSize: 15,
                            marginBottom: 4,
                          }}
                        >
                          {entry.title}
                        </p>
                        {!isExpanded && entry.description && (
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--ds-muted)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {entry.description}
                          </p>
                        )}
                      </div>

                      {/* Actions — only show for custom entries */}
                      {isCustom(entry.id) && (
                        <div
                          style={{ display: "flex", gap: 4, flexShrink: 0 }}
                          role="presentation"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="ds-btn-ghost"
                            style={{ padding: "3px 7px", fontSize: 13 }}
                            onClick={() => {
                              setEditing({ ...entry });
                              setIsNew(false);
                            }}
                            data-ocid={`campaign.timeline.edit_button.${idx + 1}`}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="ds-btn-ghost"
                            style={{ padding: "3px 7px", fontSize: 13 }}
                            onClick={() => deleteEntry(entry.id)}
                            data-ocid={`campaign.timeline.delete_button.${idx + 1}`}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: "1px solid var(--ds-border)",
                        }}
                      >
                        {entry.description && (
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--ds-text)",
                              lineHeight: 1.6,
                              marginBottom: 8,
                            }}
                          >
                            {entry.description}
                          </p>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          {entry.outcome && (
                            <OutcomeBadge outcome={entry.outcome} />
                          )}
                          {entry.difficulty && (
                            <DifficultyBadge difficulty={entry.difficulty} />
                          )}
                          {entry.xp !== undefined && entry.xp > 0n && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--ds-muted)",
                              }}
                            >
                              ✨ {entry.xp.toString()} XP
                            </span>
                          )}
                          {entry.linkedNPCs.length > 0 && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--ds-muted)",
                              }}
                            >
                              👥{" "}
                              {entry.linkedNPCs
                                .map(
                                  (nid) =>
                                    npcs.find((n) => n.id === nid)?.name ?? nid,
                                )
                                .join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editing && (
        <ModalOverlay
          title={isNew ? "Add Timeline Event" : "Edit Timeline Event"}
          onClose={() => setEditing(null)}
        >
          <Field label="Type">
            <select
              className="ds-input"
              value={editing.type}
              onChange={(e) =>
                setField("type", e.target.value as TimelineEntryType)
              }
              data-ocid="campaign.timeline.type.select"
            >
              <option value="session">📖 Session</option>
              <option value="encounter">⚔️ Encounter</option>
              <option value="npc">👤 NPC Appearance</option>
            </select>
          </Field>
          <Field label="Title">
            <input
              className="ds-input"
              value={editing.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. The Battle of Ironforge"
              data-ocid="campaign.timeline.title.input"
            />
          </Field>
          <Field label="Date / Session Number">
            <input
              className="ds-input"
              value={editing.date}
              onChange={(e) => setField("date", e.target.value)}
              placeholder="e.g. 2024-05-10 or Session 3"
              data-ocid="campaign.timeline.date.input"
            />
          </Field>
          <Field label="Description">
            <textarea
              className="ds-input"
              rows={4}
              value={editing.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="What happened…"
              data-ocid="campaign.timeline.description.textarea"
            />
          </Field>
          {(editing.type === "encounter" || editing.type === "session") && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field label="Outcome">
                <input
                  className="ds-input"
                  value={editing.outcome ?? ""}
                  onChange={(e) => setField("outcome", e.target.value)}
                  placeholder="e.g. Victory, Escaped…"
                  data-ocid="campaign.timeline.outcome.input"
                />
              </Field>
              {editing.type === "encounter" && (
                <Field label="Difficulty">
                  <select
                    className="ds-input"
                    value={editing.difficulty ?? "Medium"}
                    onChange={(e) => setField("difficulty", e.target.value)}
                    data-ocid="campaign.timeline.difficulty.select"
                  >
                    {["Easy", "Medium", "Hard", "Deadly", "Legendary"].map(
                      (d) => (
                        <option key={d}>{d}</option>
                      ),
                    )}
                  </select>
                </Field>
              )}
            </div>
          )}

          {/* Linked NPCs */}
          {npcs.length > 0 && (
            <Field label="Linked NPCs">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {npcs.map((npc) => {
                  const linked = editing.linkedNPCs.includes(npc.id);
                  return (
                    <button
                      key={npc.id}
                      type="button"
                      style={{
                        padding: "4px 10px",
                        fontSize: 12,
                        borderRadius: 4,
                        border: linked
                          ? "1px solid var(--ds-gold)"
                          : "1px solid var(--ds-border)",
                        background: linked
                          ? "rgba(212,175,55,0.1)"
                          : "transparent",
                        color: linked ? "var(--ds-gold)" : "var(--ds-muted)",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const current = editing.linkedNPCs;
                        setField(
                          "linkedNPCs",
                          linked
                            ? current.filter((id) => id !== npc.id)
                            : [...current, npc.id],
                        );
                      }}
                    >
                      {npc.name}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setEditing(null)}
              data-ocid="campaign.timeline.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={saveEntry}
              disabled={saving}
              data-ocid="campaign.timeline.save_button"
            >
              {saving ? "Saving…" : "Save Event"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Campaign Enemies Tab ──────────────────────────────────────────────────────

const ENEMY_TYPE_COLORS: Record<string, string> = {
  Army: "#e74c3c",
  Individual: "#9b59b6",
  Monster: "#27ae60",
  Organization: "#3498db",
  Other: "var(--ds-muted)",
};

const ENEMY_STATUS_COLORS: Record<string, string> = {
  Active: "#e74c3c",
  Defeated: "#27ae60",
  Unknown: "#7f8c8d",
  Escaped: "#f39c12",
};

function EnemyTypeBadge({ enemyType }: { enemyType: string }) {
  const c = ENEMY_TYPE_COLORS[enemyType] ?? "var(--ds-muted)";
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 4,
        background: `${c}22`,
        color: c,
        border: `1px solid ${c}`,
        whiteSpace: "nowrap",
      }}
    >
      {enemyType}
    </span>
  );
}

function EnemyStatusBadge({ status }: { status: string }) {
  const c = ENEMY_STATUS_COLORS[status] ?? "var(--ds-muted)";
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 4,
        background: `${c}22`,
        color: c,
        border: `1px solid ${c}`,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function CampaignEnemiesTab({
  actor,
  campaigns,
  onRestartConnection,
}: {
  actor: DndBackend;
  campaigns: Campaign[];
  onRestartConnection?: () => void;
}) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id ?? "",
  );
  const [items, setItems] = useState<CampaignEnemy[]>([]);
  const [loading, setLoading] = useState(false);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<CampaignEnemy | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(
    async (campaignId: string) => {
      if (!campaignId) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const result = await actor.getCampaignEnemies(campaignId);
        setItems(result);
      } catch (e) {
        if (isCanisterStopped(e)) {
          setCanisterStopped(true);
          setLoading(false);
          return;
        }
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [actor],
  );

  useEffect(() => {
    load(selectedCampaignId);
  }, [load, selectedCampaignId]);

  const blank = (): CampaignEnemy => ({
    id: "",
    campaignId: selectedCampaignId,
    name: "",
    enemyType: "Individual",
    faction: "",
    description: "",
    knownStrengths: "",
    knownWeaknesses: "",
    status: "Active",
    wins: 0n,
    losses: 0n,
    draws: 0n,
    notes: "",
    linkedArmyEnemyIds: [],
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing || !selectedCampaignId) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor.addCampaignEnemy(selectedCampaignId, editing);
      } else {
        await actor.updateCampaignEnemy(editing.id, editing);
      }
      await load(selectedCampaignId);
      setEditing(null);
    } catch (err) {
      alert(`Failed to save: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    setConfirmDelete(null);
    try {
      await actor.deleteCampaignEnemy(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const setField = <K extends keyof CampaignEnemy>(k: K, v: CampaignEnemy[K]) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 22 }}
        >
          ⚔️ Campaign Enemies
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {campaigns.length > 1 && (
            <select
              className="ds-input"
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              style={{ fontSize: 13 }}
              data-ocid="campaign.enemies.campaign.select"
            >
              <option value="">— Select Campaign —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="ds-btn-primary"
            onClick={() => {
              setEditing(blank());
              setIsNew(true);
            }}
            disabled={!selectedCampaignId}
            data-ocid="campaign.enemies.add_button"
          >
            + Add Enemy
          </button>
        </div>
      </div>

      {!selectedCampaignId ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="campaign.enemies.no_campaign"
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏰</div>
          <p>Select a campaign to view its enemies.</p>
          {campaigns.length === 0 && (
            <p style={{ marginTop: 8, fontSize: 13 }}>
              Create a campaign in the Campaigns tab first.
            </p>
          )}
        </div>
      ) : loading ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            padding: 32,
          }}
          data-ocid="campaign.enemies.loading_state"
        >
          Loading enemies…
        </p>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="campaign.enemies.empty_state"
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🐹</div>
          <p>No campaign enemies tracked yet.</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>
            Add enemies that appear across multiple armies or characters in this
            campaign.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((enemy, idx) => {
            const isExpanded = expanded === enemy.id;
            return (
              <div
                key={enemy.id}
                className="ds-card"
                style={{ padding: 16 }}
                data-ocid={`campaign.enemies.item.${idx + 1}`}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="font-cinzel"
                      style={{
                        color: "var(--ds-gold)",
                        fontSize: 16,
                        marginBottom: 6,
                      }}
                    >
                      {enemy.name || "Unnamed"}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <EnemyTypeBadge enemyType={enemy.enemyType} />
                      <EnemyStatusBadge status={enemy.status} />
                      {enemy.faction && (
                        <span
                          style={{ fontSize: 12, color: "var(--ds-muted)" }}
                        >
                          {enemy.faction}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => setExpanded(isExpanded ? null : enemy.id)}
                      data-ocid={`campaign.enemies.expand_button.${idx + 1}`}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => {
                        setEditing({ ...enemy });
                        setIsNew(false);
                      }}
                      data-ocid={`campaign.enemies.edit_button.${idx + 1}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => setConfirmDelete(enemy.id)}
                      data-ocid={`campaign.enemies.delete_button.${idx + 1}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* W/L/D record */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    fontSize: 12,
                    marginBottom: isExpanded ? 12 : 0,
                  }}
                >
                  <span style={{ color: "#27ae60" }}>W: {enemy.wins}</span>
                  <span style={{ color: "#c0392b" }}>L: {enemy.losses}</span>
                  <span style={{ color: "var(--ds-muted)" }}>
                    D: {enemy.draws}
                  </span>
                  {enemy.linkedArmyEnemyIds.length > 0 && (
                    <span style={{ color: "var(--ds-muted)" }}>
                      🔗 {enemy.linkedArmyEnemyIds.length} army link
                      {enemy.linkedArmyEnemyIds.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    style={{
                      paddingTop: 12,
                      borderTop: "1px solid var(--ds-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {enemy.description && (
                      <div>
                        <span
                          className="ds-label"
                          style={{ display: "block", marginBottom: 2 }}
                        >
                          Description
                        </span>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--ds-text)",
                            lineHeight: 1.5,
                          }}
                        >
                          {enemy.description}
                        </p>
                      </div>
                    )}
                    {enemy.knownStrengths && (
                      <div>
                        <span
                          className="ds-label"
                          style={{
                            display: "block",
                            marginBottom: 2,
                            color: "#e74c3c",
                          }}
                        >
                          Known Strengths
                        </span>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--ds-text)",
                            lineHeight: 1.5,
                          }}
                        >
                          {enemy.knownStrengths}
                        </p>
                      </div>
                    )}
                    {enemy.knownWeaknesses && (
                      <div>
                        <span
                          className="ds-label"
                          style={{
                            display: "block",
                            marginBottom: 2,
                            color: "#27ae60",
                          }}
                        >
                          Known Weaknesses
                        </span>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--ds-text)",
                            lineHeight: 1.5,
                          }}
                        >
                          {enemy.knownWeaknesses}
                        </p>
                      </div>
                    )}
                    {enemy.notes && (
                      <div>
                        <span
                          className="ds-label"
                          style={{ display: "block", marginBottom: 2 }}
                        >
                          Notes
                        </span>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--ds-text)",
                            lineHeight: 1.5,
                          }}
                        >
                          {enemy.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) =>
            e.target === e.currentTarget && setConfirmDelete(null)
          }
          onKeyDown={(e) => e.key === "Escape" && setConfirmDelete(null)}
          data-ocid="campaign.enemies.confirm_dialog"
        >
          <div
            className="ds-card"
            style={{ maxWidth: 360, padding: 24, textAlign: "center" }}
          >
            <p style={{ marginBottom: 16 }}>Delete this enemy?</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setConfirmDelete(null)}
                data-ocid="campaign.enemies.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={() => del(confirmDelete)}
                data-ocid="campaign.enemies.confirm_button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {editing && (
        <ModalOverlay
          title={isNew ? "Add Campaign Enemy" : "Edit Campaign Enemy"}
          onClose={() => setEditing(null)}
        >
          <Field label="Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. The Crimson Hand"
              data-ocid="campaign.enemies.name.input"
            />
          </Field>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Type">
              <select
                className="ds-input"
                value={editing.enemyType}
                onChange={(e) => setField("enemyType", e.target.value)}
                data-ocid="campaign.enemies.type.select"
              >
                {["Army", "Individual", "Monster", "Organization", "Other"].map(
                  (t) => (
                    <option key={t}>{t}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Status">
              <select
                className="ds-input"
                value={editing.status}
                onChange={(e) => setField("status", e.target.value)}
                data-ocid="campaign.enemies.status.select"
              >
                {["Active", "Defeated", "Unknown", "Escaped"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Faction">
            <input
              className="ds-input"
              value={editing.faction}
              onChange={(e) => setField("faction", e.target.value)}
              placeholder="e.g. Shadow Brotherhood"
              data-ocid="campaign.enemies.faction.input"
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <Field label="Wins">
              <input
                className="ds-input"
                type="number"
                value={Number(editing.wins)}
                onChange={(e) =>
                  setField("wins", BigInt(e.target.value || "0"))
                }
                data-ocid="campaign.enemies.wins.input"
              />
            </Field>
            <Field label="Losses">
              <input
                className="ds-input"
                type="number"
                value={Number(editing.losses)}
                onChange={(e) =>
                  setField("losses", BigInt(e.target.value || "0"))
                }
                data-ocid="campaign.enemies.losses.input"
              />
            </Field>
            <Field label="Draws">
              <input
                className="ds-input"
                type="number"
                value={Number(editing.draws)}
                onChange={(e) =>
                  setField("draws", BigInt(e.target.value || "0"))
                }
                data-ocid="campaign.enemies.draws.input"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="ds-input"
              rows={3}
              value={editing.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Who or what is this enemy?"
              data-ocid="campaign.enemies.description.textarea"
            />
          </Field>
          <Field label="Known Strengths">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.knownStrengths}
              onChange={(e) => setField("knownStrengths", e.target.value)}
              placeholder="Abilities, tactics, advantages…"
              data-ocid="campaign.enemies.strengths.textarea"
            />
          </Field>
          <Field label="Known Weaknesses">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.knownWeaknesses}
              onChange={(e) => setField("knownWeaknesses", e.target.value)}
              placeholder="Vulnerabilities, blind spots…"
              data-ocid="campaign.enemies.weaknesses.textarea"
            />
          </Field>
          <Field label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Extra intel, history…"
              data-ocid="campaign.enemies.notes.textarea"
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setEditing(null)}
              data-ocid="campaign.enemies.modal.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="campaign.enemies.modal.save_button"
            >
              {saving ? "Saving…" : "Save Enemy"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Party XP Tab ─────────────────────────────────────────────────────────────

function PartyXpTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [entries, setEntries] = useState<PartyXpEntry[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [partySize, setPartySize] = useState(4);
  const [form, setForm] = useState({ sessionId: "", xpEarned: 0, notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [xp, sess] = await Promise.all([
        actor.getPartyXpEntries().catch(() => [] as PartyXpEntry[]),
        actor.getSessionLog().catch(() => [] as SessionEntry[]),
      ]);
      setEntries([...xp].sort((a, b) => b.timestamp - a.timestamp));
      setSessions(sess);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = async () => {
    if (!form.xpEarned) return;
    setSaving(true);
    try {
      const entry: PartyXpEntry = {
        id: uid(),
        sessionId: form.sessionId,
        xpEarned: form.xpEarned,
        notes: form.notes,
        timestamp: Date.now(),
      };
      await actor.addPartyXpEntry(entry);
      setForm({ sessionId: "", xpEarned: 0, notes: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      if (isCanisterStopped(err)) {
        setCanisterStopped(true);
        return;
      }
      alert(`Failed to log XP: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    try {
      await actor.deletePartyXpEntry(id);
      setEntries((p) => p.filter((e) => e.id !== id));
    } catch (err) {
      if (isCanisterStopped(err)) setCanisterStopped(true);
    }
  };

  const totalXp = entries.reduce((acc, e) => acc + e.xpEarned, 0);
  const shareXp = partySize > 0 ? Math.floor(totalXp / partySize) : 0;
  const sessionName = (id: string) =>
    sessions.find((s) => s.id === id)?.title || id || "—";

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;
  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="campaign.partyxp.loading_state"
      >
        Loading XP log…
      </p>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 22 }}
        >
          ✨ Party XP Tracker
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => setShowForm(true)}
          data-ocid="campaign.partyxp.add_button"
        >
          + Log XP
        </button>
      </div>

      {/* Stats bar */}
      <div
        className="ds-card"
        style={{
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              color: "var(--ds-muted)",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Total Party XP
          </p>
          <p
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 22, fontWeight: 700 }}
          >
            {totalXp.toLocaleString()}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <p
              style={{
                fontSize: 11,
                color: "var(--ds-muted)",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Party Size
            </p>
            <input
              type="number"
              min={1}
              max={20}
              className="ds-input"
              style={{ width: 64, textAlign: "center" }}
              value={partySize}
              onChange={(e) =>
                setPartySize(Math.max(1, Number(e.target.value) || 1))
              }
              data-ocid="campaign.partyxp.party_size.input"
            />
          </div>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "var(--ds-muted)",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Per Character
          </p>
          <p
            className="font-cinzel"
            style={{ color: "#5ac97a", fontSize: 22, fontWeight: 700 }}
          >
            {shareXp.toLocaleString()}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          emoji="✨"
          message="No XP logged yet. Click '+ Log XP' to record a session's experience."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map((e, idx) => (
            <div
              key={e.id}
              className="ds-card"
              style={{
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
              data-ocid={`campaign.partyxp.item.${idx + 1}`}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "baseline",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="font-cinzel"
                    style={{ color: "var(--ds-gold)", fontSize: 15 }}
                  >
                    +{e.xpEarned.toLocaleString()} XP
                  </span>
                  {e.sessionId && (
                    <span style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                      📖 {sessionName(e.sessionId)}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                    🕐 {new Date(e.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {e.notes && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ds-muted)",
                      marginTop: 4,
                    }}
                  >
                    {e.notes}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 13, padding: "4px 8px", flexShrink: 0 }}
                onClick={() => del(e.id)}
                data-ocid={`campaign.partyxp.delete_button.${idx + 1}`}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ModalOverlay title="Log XP" onClose={() => setShowForm(false)}>
          <Field label="XP Earned">
            <input
              type="number"
              className="ds-input"
              min={0}
              value={form.xpEarned || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  xpEarned: Number(e.target.value) || 0,
                }))
              }
              placeholder="e.g. 350"
              data-ocid="campaign.partyxp.xp.input"
            />
          </Field>
          <Field label="Session (optional)">
            <select
              className="ds-input"
              value={form.sessionId}
              onChange={(e) =>
                setForm((f) => ({ ...f, sessionId: e.target.value }))
              }
              data-ocid="campaign.partyxp.session.select"
            >
              <option value="">— None —</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title || "Untitled Session"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="e.g. Defeated the goblin king"
              data-ocid="campaign.partyxp.notes.textarea"
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setShowForm(false)}
              data-ocid="campaign.partyxp.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={addEntry}
              disabled={saving || !form.xpEarned}
              data-ocid="campaign.partyxp.save_button"
            >
              {saving ? "Saving…" : "Log XP"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Initiative Tracker Tab ────────────────────────────────────────────────────

function InitiativeTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [trackers, setTrackers] = useState<InitiativeTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addCombatantForm, setAddCombatantForm] = useState<{
    name: string;
    dexModifier: number;
    currentHp: number;
    maxHp: number;
    isPlayer: boolean;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await actor
        .getInitiativeTrackers()
        .catch(() => [] as InitiativeTracker[]);
      setTrackers(list);
      if (list.length > 0 && !activeId) setActiveId(list[0].id);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setTrackers([]);
    } finally {
      setLoading(false);
    }
  }, [actor, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const autoSave = async (t: InitiativeTracker) => {
    try {
      await actor.saveInitiativeTracker(t);
    } catch {
      /* ignore */
    }
  };

  const updateTracker = (updated: InitiativeTracker) => {
    setTrackers((p) => p.map((t) => (t.id === updated.id ? updated : t)));
    autoSave(updated);
  };

  const newEncounter = async () => {
    const t: InitiativeTracker = {
      id: uid(),
      encounterId: `encounter-${Date.now()}`,
      entries: [],
      currentTurnIndex: 0,
      roundNumber: 1,
    };
    const updated = [...trackers, t];
    setTrackers(updated);
    setActiveId(t.id);
    try {
      await actor.saveInitiativeTracker(t);
    } catch {
      /* ignore */
    }
  };

  const deleteTracker = async (id: string) => {
    if (!confirm("Delete this encounter tracker?")) return;
    try {
      await actor.deleteInitiativeTracker(id);
      setTrackers((p) => {
        const next = p.filter((t) => t.id !== id);
        if (activeId === id) setActiveId(next[0]?.id ?? null);
        return next;
      });
    } catch (err) {
      if (isCanisterStopped(err)) setCanisterStopped(true);
    }
  };

  const rollInitiative = (tracker: InitiativeTracker) => {
    const rolled = tracker.entries
      .map((e) => ({
        ...e,
        initiativeRoll: Math.floor(Math.random() * 20) + 1 + e.dexModifier,
      }))
      .sort((a, b) => b.initiativeRoll - a.initiativeRoll);
    updateTracker({
      ...tracker,
      entries: rolled,
      currentTurnIndex: 0,
      roundNumber: 1,
    });
  };

  const nextTurn = (tracker: InitiativeTracker) => {
    const nextIdx =
      (tracker.currentTurnIndex + 1) % Math.max(tracker.entries.length, 1);
    const nextRound =
      nextIdx === 0 && tracker.entries.length > 0
        ? tracker.roundNumber + 1
        : tracker.roundNumber;
    updateTracker({
      ...tracker,
      currentTurnIndex: nextIdx,
      roundNumber: nextRound,
    });
  };

  const moveUp = (tracker: InitiativeTracker, idx: number) => {
    if (idx === 0) return;
    const entries = [...tracker.entries];
    [entries[idx - 1], entries[idx]] = [entries[idx], entries[idx - 1]];
    updateTracker({ ...tracker, entries });
  };

  const moveDown = (tracker: InitiativeTracker, idx: number) => {
    if (idx >= tracker.entries.length - 1) return;
    const entries = [...tracker.entries];
    [entries[idx], entries[idx + 1]] = [entries[idx + 1], entries[idx]];
    updateTracker({ ...tracker, entries });
  };

  const addCombatant = (tracker: InitiativeTracker) => {
    if (!addCombatantForm) return;
    const entry: InitiativeEntry = {
      id: uid(),
      name: addCombatantForm.name || "Unnamed",
      dexModifier: addCombatantForm.dexModifier,
      initiativeRoll: 0,
      currentHp: addCombatantForm.currentHp,
      maxHp: addCombatantForm.maxHp,
      isPlayer: addCombatantForm.isPlayer,
      conditions: [],
    };
    const updated = { ...tracker, entries: [...tracker.entries, entry] };
    updateTracker(updated);
    setAddCombatantForm(null);
  };

  const removeCombatant = (tracker: InitiativeTracker, entryId: string) => {
    updateTracker({
      ...tracker,
      entries: tracker.entries.filter((e) => e.id !== entryId),
    });
  };

  const updateHp = (
    tracker: InitiativeTracker,
    entryId: string,
    hp: number,
  ) => {
    updateTracker({
      ...tracker,
      entries: tracker.entries.map((e) =>
        e.id === entryId ? { ...e, currentHp: hp } : e,
      ),
    });
  };

  const addCondition = (
    tracker: InitiativeTracker,
    entryId: string,
    cond: string,
  ) => {
    if (!cond.trim()) return;
    updateTracker({
      ...tracker,
      entries: tracker.entries.map((e) =>
        e.id === entryId
          ? { ...e, conditions: [...e.conditions, cond.trim()] }
          : e,
      ),
    });
  };

  const removeCondition = (
    tracker: InitiativeTracker,
    entryId: string,
    cond: string,
  ) => {
    updateTracker({
      ...tracker,
      entries: tracker.entries.map((e) =>
        e.id === entryId
          ? { ...e, conditions: e.conditions.filter((c) => c !== cond) }
          : e,
      ),
    });
  };

  const active = trackers.find((t) => t.id === activeId) ?? null;

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;
  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="campaign.initiative.loading_state"
      >
        Loading trackers…
      </p>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 22 }}
        >
          ⚔️ Initiative Tracker
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={newEncounter}
          data-ocid="campaign.initiative.new_button"
        >
          + New Encounter
        </button>
      </div>

      {trackers.length === 0 ? (
        <EmptyState
          emoji="⚔️"
          message="No encounter trackers yet. Click '+ New Encounter' to begin tracking initiative."
        />
      ) : (
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          {/* Tracker list */}
          <div style={{ width: 180, flexShrink: 0 }}>
            <p
              style={{
                fontSize: 11,
                color: "var(--ds-muted)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Encounters
            </p>
            {trackers.map((t, idx) => (
              <div
                key={t.id}
                style={{ display: "flex", gap: 4, marginBottom: 4 }}
                data-ocid={`campaign.initiative.tracker.${idx + 1}`}
              >
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    fontSize: 12,
                    background:
                      activeId === t.id
                        ? "rgba(201,163,90,0.15)"
                        : "var(--ds-surface2)",
                    border: `1px solid ${activeId === t.id ? "var(--ds-gold)" : "var(--ds-border)"}`,
                    borderRadius: 4,
                    color:
                      activeId === t.id ? "var(--ds-gold)" : "var(--ds-text)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onClick={() => setActiveId(t.id)}
                >
                  Round {t.roundNumber}
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 6px", fontSize: 12 }}
                  onClick={() => deleteTracker(t.id)}
                  data-ocid={`campaign.initiative.delete_button.${idx + 1}`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Active tracker */}
          {active && (
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="ds-card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    <span
                      className="font-cinzel"
                      style={{ color: "var(--ds-gold)", fontSize: 16 }}
                    >
                      Round {active.roundNumber}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                      {active.entries.length} combatants
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => rollInitiative(active)}
                      data-ocid="campaign.initiative.roll_button"
                    >
                      🎲 Roll All
                    </button>
                    <button
                      type="button"
                      className="ds-btn-primary"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => nextTurn(active)}
                      disabled={active.entries.length === 0}
                      data-ocid="campaign.initiative.next_turn_button"
                    >
                      Next Turn ▶
                    </button>
                  </div>
                </div>

                {active.entries.length === 0 ? (
                  <p
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 13,
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                  >
                    No combatants. Add some below.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      marginBottom: 14,
                    }}
                  >
                    {active.entries.map((entry, idx) => {
                      const isCurrentTurn = idx === active.currentTurnIndex;
                      return (
                        <div
                          key={entry.id}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 6,
                            border: `1px solid ${isCurrentTurn ? "var(--ds-gold)" : "var(--ds-border)"}`,
                            background: isCurrentTurn
                              ? "rgba(201,163,90,0.08)"
                              : "var(--ds-surface2)",
                            position: "relative",
                          }}
                          data-ocid={`campaign.initiative.combatant.${idx + 1}`}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                marginRight: 4,
                              }}
                            >
                              <button
                                type="button"
                                className="ds-btn-ghost"
                                style={{
                                  padding: "1px 5px",
                                  fontSize: 10,
                                  lineHeight: 1,
                                }}
                                onClick={() => moveUp(active, idx)}
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                className="ds-btn-ghost"
                                style={{
                                  padding: "1px 5px",
                                  fontSize: 10,
                                  lineHeight: 1,
                                }}
                                onClick={() => moveDown(active, idx)}
                              >
                                ▼
                              </button>
                            </div>
                            <span
                              style={{
                                minWidth: 30,
                                textAlign: "right",
                                color: "var(--ds-gold)",
                                fontWeight: 700,
                                fontSize: 14,
                              }}
                            >
                              {entry.initiativeRoll || "—"}
                            </span>
                            <span
                              style={{
                                flex: 1,
                                fontSize: 13,
                                fontWeight: 600,
                                color: isCurrentTurn
                                  ? "var(--ds-gold)"
                                  : "var(--ds-text)",
                              }}
                            >
                              {isCurrentTurn && (
                                <span style={{ marginRight: 4 }}>▶</span>
                              )}
                              {entry.name}
                              {entry.isPlayer && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    fontSize: 10,
                                    color: "#4fc3f7",
                                    background: "rgba(79,195,247,0.1)",
                                    border: "1px solid #4fc3f7",
                                    padding: "1px 5px",
                                    borderRadius: 3,
                                  }}
                                >
                                  PC
                                </span>
                              )}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <input
                                type="number"
                                className="ds-input"
                                style={{
                                  width: 54,
                                  fontSize: 12,
                                  padding: "3px 6px",
                                  textAlign: "center",
                                }}
                                value={entry.currentHp}
                                onChange={(e) =>
                                  updateHp(
                                    active,
                                    entry.id,
                                    Number(e.target.value),
                                  )
                                }
                                data-ocid={`campaign.initiative.hp.${idx + 1}`}
                              />
                              <span
                                style={{
                                  color: "var(--ds-muted)",
                                  fontSize: 11,
                                }}
                              >
                                /{entry.maxHp}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="ds-btn-ghost"
                              style={{
                                fontSize: 12,
                                padding: "3px 6px",
                                color: "#e57373",
                              }}
                              onClick={() => removeCombatant(active, entry.id)}
                            >
                              ✕
                            </button>
                          </div>
                          {entry.conditions.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                flexWrap: "wrap",
                                marginTop: 6,
                              }}
                            >
                              {entry.conditions.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 3,
                                    background: "rgba(231,76,60,0.15)",
                                    color: "#e74c3c",
                                    border: "1px solid #e74c3c",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    removeCondition(active, entry.id, c)
                                  }
                                  title="Click to remove"
                                >
                                  ✕ {c}
                                </button>
                              ))}
                            </div>
                          )}
                          <ConditionInput
                            onAdd={(cond) =>
                              addCondition(active, entry.id, cond)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add combatant */}
                {addCombatantForm ? (
                  <div
                    className="ds-card"
                    style={{ padding: 12, marginTop: 4 }}
                  >
                    <p className="ds-label" style={{ marginBottom: 10 }}>
                      Add Combatant
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <div style={{ gridColumn: "1 / -1" }}>
                        <input
                          className="ds-input"
                          placeholder="Name"
                          value={addCombatantForm.name}
                          onChange={(e) =>
                            setAddCombatantForm((f) =>
                              f ? { ...f, name: e.target.value } : f,
                            )
                          }
                          data-ocid="campaign.initiative.combatant_name.input"
                        />
                      </div>
                      <div>
                        <p
                          className="ds-label"
                          style={{ marginBottom: 3, fontSize: 11 }}
                        >
                          DEX Mod
                        </p>
                        <input
                          type="number"
                          className="ds-input"
                          value={addCombatantForm.dexModifier}
                          onChange={(e) =>
                            setAddCombatantForm((f) =>
                              f
                                ? { ...f, dexModifier: Number(e.target.value) }
                                : f,
                            )
                          }
                          data-ocid="campaign.initiative.dex.input"
                        />
                      </div>
                      <div>
                        <p
                          className="ds-label"
                          style={{ marginBottom: 3, fontSize: 11 }}
                        >
                          Max HP
                        </p>
                        <input
                          type="number"
                          className="ds-input"
                          value={addCombatantForm.maxHp}
                          onChange={(e) =>
                            setAddCombatantForm((f) =>
                              f
                                ? {
                                    ...f,
                                    maxHp: Number(e.target.value),
                                    currentHp: Number(e.target.value),
                                  }
                                : f,
                            )
                          }
                          data-ocid="campaign.initiative.maxhp.input"
                        />
                      </div>
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={addCombatantForm.isPlayer}
                        onChange={(e) =>
                          setAddCombatantForm((f) =>
                            f ? { ...f, isPlayer: e.target.checked } : f,
                          )
                        }
                      />
                      <span style={{ fontSize: 13, color: "var(--ds-text)" }}>
                        Player Character
                      </span>
                    </label>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ fontSize: 12 }}
                        onClick={() => setAddCombatantForm(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="ds-btn-primary"
                        style={{ fontSize: 12 }}
                        onClick={() => addCombatant(active)}
                        data-ocid="campaign.initiative.add_combatant_button"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={() =>
                      setAddCombatantForm({
                        name: "",
                        dexModifier: 0,
                        currentHp: 10,
                        maxHp: 10,
                        isPlayer: false,
                      })
                    }
                    data-ocid="campaign.initiative.open_add_combatant_button"
                  >
                    + Add Combatant
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConditionInput({ onAdd }: { onAdd: (cond: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
      <input
        className="ds-input"
        style={{ flex: 1, fontSize: 11, padding: "2px 6px" }}
        placeholder="+ condition (e.g. Poisoned)"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) {
            onAdd(val);
            setVal("");
          }
        }}
      />
      <button
        type="button"
        className="ds-btn-ghost"
        style={{ fontSize: 11, padding: "2px 6px" }}
        onClick={() => {
          if (val.trim()) {
            onAdd(val);
            setVal("");
          }
        }}
      >
        +
      </button>
    </div>
  );
}

// ── Calendar Tab ───────────────────────────────────────────────────────────────

function CalendarTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getCalendarEvents());
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = (): CalendarEvent => ({
    id: BigInt(Date.now()),
    title: "",
    date: "",
    category: "Event",
    description: "",
    linkedSessionId: "",
    linkedEncounterId: "",
    notes: "",
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addCalendarEvent(editing);
      else await actor.updateCalendarEvent(editing);
      await load();
      setEditing(null);
    } catch (err) {
      alert(`Failed to save: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: bigint) => {
    if (!confirm("Delete this event?")) return;
    try {
      await actor.deleteCalendarEvent(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof CalendarEvent, v: string | number) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  // Reminders
  const [reminders, setReminders] = useState<AppReminder[]>([]);
  const [remindersBanner, setRemindersBanner] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: "",
    eventDate: "",
    reminderNote: "",
  });
  const [savingReminder, setSavingReminder] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);

  const loadReminders = useCallback(async () => {
    try {
      const list = await actor
        .getAppReminders()
        .catch(() => [] as AppReminder[]);
      setReminders(list);
      const threeDays = Date.now() + 3 * 24 * 60 * 60 * 1000;
      setRemindersBanner(
        list.some(
          (r) =>
            !r.isDismissed &&
            r.eventDate <= threeDays &&
            r.eventDate >= Date.now(),
        ),
      );
    } catch {
      /* ignore */
    }
  }, [actor]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const addReminder = async () => {
    if (!reminderForm.title) return;
    setSavingReminder(true);
    setReminderError(null);
    try {
      const r: AppReminder = {
        id: uid(),
        title: reminderForm.title,
        eventDate: reminderForm.eventDate
          ? new Date(reminderForm.eventDate).getTime()
          : Date.now(),
        reminderNote: reminderForm.reminderNote,
        isDismissed: false,
      };
      await actor.saveAppReminder(r);
      setReminderForm({ title: "", eventDate: "", reminderNote: "" });
      setShowReminderForm(false);
      await loadReminders();
    } catch (err) {
      setReminderError(
        `Failed to save reminder: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSavingReminder(false);
    }
  };

  const dismissReminder = async (r: AppReminder) => {
    setReminderError(null);
    try {
      await actor.saveAppReminder({ ...r, isDismissed: true });
      await loadReminders();
    } catch (err) {
      setReminderError(
        `Failed to dismiss reminder: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const clearDismissed = async () => {
    const dismissed = reminders.filter((r) => r.isDismissed);
    setReminderError(null);
    try {
      await Promise.all(dismissed.map((r) => actor.deleteAppReminder(r.id)));
      await loadReminders();
    } catch (err) {
      setReminderError(
        `Failed to clear dismissed reminders: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="campaign.calendar.loading_state"
      >
        Loading calendar…
      </p>
    );

  const CATEGORY_COLORS: Record<string, string> = {
    Session: "#3498db",
    Encounter: "#e74c3c",
    Event: "var(--ds-gold)",
    Holiday: "#27ae60",
    Custom: "var(--ds-muted)",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 22 }}
        >
          📅 Calendar
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => {
            setEditing(blank());
            setIsNew(true);
          }}
          data-ocid="campaign.calendar.add_button"
        >
          + Add Event
        </button>
      </div>

      {/* Upcoming reminders banner */}
      {remindersBanner && (
        <div
          style={{
            background: "rgba(201,163,90,0.15)",
            border: "1px solid var(--ds-gold)",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--ds-gold)" }}>
            🔔 You have upcoming reminders in the next 3 days!
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setRemindersBanner(false)}
          >
            Dismiss
          </button>
        </div>
      )}
      {sorted.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="campaign.calendar.empty_state"
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p>
            No calendar events yet. Log upcoming sessions, encounters, and
            in-game events.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((ev, idx) => (
            <div
              key={ev.id}
              className="ds-card"
              style={{
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
              data-ocid={`campaign.calendar.item.${idx + 1}`}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid currentColor",
                    color: CATEGORY_COLORS[ev.category] ?? "var(--ds-muted)",
                    whiteSpace: "nowrap",
                    marginTop: 2,
                  }}
                >
                  {ev.category}
                </span>
                <div>
                  <p
                    className="font-cinzel"
                    style={{ color: "var(--ds-gold)", fontSize: 14 }}
                  >
                    {ev.title}
                  </p>
                  {ev.date && (
                    <p style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                      {ev.date}
                    </p>
                  )}
                  {ev.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ds-text)",
                        marginTop: 4,
                      }}
                    >
                      {ev.description}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 13 }}
                  onClick={() => {
                    setEditing({ ...ev });
                    setIsNew(false);
                  }}
                  data-ocid={`campaign.calendar.edit_button.${idx + 1}`}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 13 }}
                  onClick={() => del(ev.id)}
                  data-ocid={`campaign.calendar.delete_button.${idx + 1}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminders section */}
      <div
        style={{
          marginTop: 32,
          borderTop: "1px solid var(--ds-border)",
          paddingTop: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 17 }}
          >
            🔔 Reminders
          </h3>
          {reminderError && (
            <p
              style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}
              data-ocid="campaign.reminders.error_state"
            >
              {reminderError}
            </p>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {reminders.some((r) => r.isDismissed) && (
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={clearDismissed}
                data-ocid="campaign.reminders.clear_button"
              >
                Clear Dismissed
              </button>
            )}
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={() => setShowReminderForm(true)}
              data-ocid="campaign.reminders.add_button"
            >
              + Add Reminder
            </button>
          </div>
        </div>
        {reminders.length === 0 ? (
          <p
            style={{
              color: "var(--ds-muted)",
              fontSize: 13,
              textAlign: "center",
              padding: "20px 0",
            }}
            data-ocid="campaign.reminders.empty_state"
          >
            No reminders set.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reminders.map((r, idx) => (
              <div
                key={r.id}
                className="ds-card"
                style={{
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                  opacity: r.isDismissed ? 0.55 : 1,
                }}
                data-ocid={`campaign.reminders.item.${idx + 1}`}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--ds-text)",
                      textDecoration: r.isDismissed ? "line-through" : "none",
                    }}
                  >
                    {r.title}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--ds-muted)",
                      marginTop: 2,
                    }}
                  >
                    📅 {new Date(r.eventDate).toLocaleDateString()}
                  </p>
                  {r.reminderNote && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ds-muted)",
                        marginTop: 4,
                      }}
                    >
                      {r.reminderNote}
                    </p>
                  )}
                </div>
                {!r.isDismissed && (
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "3px 8px", flexShrink: 0 }}
                    onClick={() => dismissReminder(r)}
                    data-ocid={`campaign.reminders.dismiss_button.${idx + 1}`}
                  >
                    Dismiss
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showReminderForm && (
        <ModalOverlay
          title="Add Reminder"
          onClose={() => setShowReminderForm(false)}
        >
          <Field label="Title">
            <input
              className="ds-input"
              value={reminderForm.title}
              onChange={(e) =>
                setReminderForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Session 5 prep"
              data-ocid="campaign.reminders.title.input"
            />
          </Field>
          <Field label="Event Date">
            <input
              type="date"
              className="ds-input"
              value={reminderForm.eventDate}
              onChange={(e) =>
                setReminderForm((f) => ({ ...f, eventDate: e.target.value }))
              }
              data-ocid="campaign.reminders.date.input"
            />
          </Field>
          <Field label="Note">
            <textarea
              className="ds-input"
              rows={2}
              value={reminderForm.reminderNote}
              onChange={(e) =>
                setReminderForm((f) => ({ ...f, reminderNote: e.target.value }))
              }
              placeholder="Optional reminder note…"
              data-ocid="campaign.reminders.note.textarea"
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setShowReminderForm(false)}
              data-ocid="campaign.reminders.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={addReminder}
              disabled={savingReminder || !reminderForm.title}
              data-ocid="campaign.reminders.save_button"
            >
              {savingReminder ? "Saving…" : "Save Reminder"}
            </button>
          </div>
        </ModalOverlay>
      )}
      {editing && (
        <ModalOverlay
          title={isNew ? "Add Event" : "Edit Event"}
          onClose={() => setEditing(null)}
        >
          <Field label="Title">
            <input
              className="ds-input"
              value={editing.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Battle of Thornwall"
              data-ocid="campaign.calendar.title.input"
            />
          </Field>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="In-Game Date">
              <input
                className="ds-input"
                value={editing.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="e.g. Year 1492, Day 3"
                data-ocid="campaign.calendar.date.input"
              />
            </Field>
            <Field label="Category">
              <select
                className="ds-input"
                value={editing.category}
                onChange={(e) => set("category", e.target.value)}
                data-ocid="campaign.calendar.category.select"
              >
                {["Session", "Encounter", "Event", "Holiday", "Custom"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  ),
                )}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.description}
              onChange={(e) => set("description", e.target.value)}
              data-ocid="campaign.calendar.description.textarea"
            />
          </Field>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Linked Session ID">
              <input
                className="ds-input"
                value={editing.linkedSessionId}
                onChange={(e) => set("linkedSessionId", e.target.value)}
                placeholder="Optional"
                data-ocid="campaign.calendar.session_id.input"
              />
            </Field>
            <Field label="Linked Encounter ID">
              <input
                className="ds-input"
                value={editing.linkedEncounterId}
                onChange={(e) => set("linkedEncounterId", e.target.value)}
                placeholder="Optional"
                data-ocid="campaign.calendar.encounter_id.input"
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              data-ocid="campaign.calendar.notes.textarea"
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setEditing(null)}
              data-ocid="campaign.calendar.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="campaign.calendar.save_button"
            >
              {saving ? "Saving…" : "Save Event"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CampaignPage({ actor, onRestartConnection }: Props) {
  const [tab, setTab] = useState<CampaignTab>("campaigns");
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);

  useEffect(() => {
    actor
      .getCampaigns()
      .then(setCampaignsList)
      .catch(() => {});
  }, [actor]);

  const tabs: { id: CampaignTab; label: string; emoji: string }[] = [
    { id: "campaigns", label: "Campaigns", emoji: "🏰" },
    { id: "sessions", label: "Sessions", emoji: "📖" },
    { id: "encounters", label: "Encounters", emoji: "⚔️" },
    { id: "npcs", label: "NPCs", emoji: "👥" },
    { id: "timeline", label: "Timeline", emoji: "🕰️" },
    { id: "calendar", label: "Calendar", emoji: "📅" },
    { id: "enemies", label: "Enemies", emoji: "🐹" },
    { id: "partyxp", label: "Party XP", emoji: "✨" },
    { id: "initiative", label: "Initiative", emoji: "⚔️" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
      <h1
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 28, marginBottom: 24 }}
      >
        🏰 Campaign Manager
      </h1>

      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--ds-border)",
          marginBottom: 28,
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              background: "transparent",
              border: "none",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "Inter,sans-serif",
              color: tab === t.id ? "var(--ds-gold)" : "var(--ds-muted)",
              borderBottom:
                tab === t.id
                  ? "2px solid var(--ds-gold)"
                  : "2px solid transparent",
              marginBottom: -1,
              whiteSpace: "nowrap",
            }}
            data-ocid={`campaign.${t.id}.tab`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === "campaigns" && (
        <CampaignsTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "sessions" && (
        <SessionsTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "encounters" && (
        <EncountersTab
          actor={actor}
          onRestartConnection={onRestartConnection}
        />
      )}
      {tab === "npcs" && (
        <NPCsTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "timeline" && (
        <TimelineTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "calendar" && (
        <CalendarTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "enemies" && (
        <CampaignEnemiesTab
          actor={actor}
          campaigns={campaignsList}
          onRestartConnection={onRestartConnection}
        />
      )}
      {tab === "partyxp" && (
        <PartyXpTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "initiative" && (
        <InitiativeTab
          actor={actor}
          onRestartConnection={onRestartConnection}
        />
      )}
    </div>
  );
}

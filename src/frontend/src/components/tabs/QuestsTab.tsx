import { useCallback, useEffect, useRef, useState } from "react";
import type { Faction, NPC } from "../../types";
import type { DndBackend, Quest } from "../../types";
import MultiEntityLinkSelect from "../MultiEntityLinkSelect";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const STATUS_OPTIONS = ["Active", "Completed", "Failed", "On Hold"];
const STATUS_COLORS: Record<string, string> = {
  Active: "#4a9eca",
  Completed: "#4caf50",
  Failed: "#e53935",
  "On Hold": "#ff9800",
};

const EMPTY_QUEST: Omit<Quest, "id"> = {
  title: "",
  status: "Active",
  description: "",
  objectives: "",
  reward: "",
  notes: "",
  linkedNpcIds: [],
  linkedFactionIds: [],
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function QuestsTab({ actor, characterId }: Props) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_QUEST });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, facs, npcList] = await Promise.all([
        actor.getQuestsByCharacter(characterId),
        actor.getFactions().catch(() => [] as Faction[]),
        actor.getNPCs().catch(() => [] as NPC[]),
      ]);
      setQuests(data ?? []);
      setFactions(facs);
      setNpcs(npcList);
    } catch (e) {
      console.error("Failed to load quests:", e);
      setQuests([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_QUEST });
    setShowForm(true);
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const openEdit = (q: Quest) => {
    setEditingId(q.id);
    setForm({
      title: q.title,
      status: q.status,
      description: q.description,
      objectives: q.objectives,
      reward: q.reward,
      notes: q.notes,
      linkedNpcIds: q.linkedNpcIds ?? [],
      linkedFactionIds: q.linkedFactionIds ?? [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const quest: Quest = { id: editingId, ...form };
        await actor.updateQuest(characterId, quest);
        setQuests((prev) => prev.map((q) => (q.id === editingId ? quest : q)));
      } else {
        const quest: Quest = { id: makeId(), ...form };
        await actor.addQuest(characterId, quest);
        setQuests((prev) => [...prev, quest]);
      }
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save quest:", err);
      alert(
        `Failed to save quest: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (questId: string) => {
    if (!confirm("Delete this quest?")) return;
    await actor.deleteQuest(characterId, questId);
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  };

  const f = (field: keyof typeof form, val: string | bigint[]) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const filtered = quests.filter((q) => {
    const matchSearch = search
      ? q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.description.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus =
      filterStatus === "All" ? true : q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const grouped = STATUS_OPTIONS.map((s) => ({
    status: s,
    quests: filtered.filter((q) => q.status === s),
  })).filter((g) =>
    filterStatus === "All"
      ? g.quests.length > 0
      : g.status === filterStatus && g.quests.length >= 0,
  );

  const factionItems = factions.map((fa) => ({ id: fa.id, name: fa.name }));
  const npcSelectItems = npcs.map((n, i) => ({
    id: BigInt(i + 1),
    name: n.name || `NPC ${i + 1}`,
  }));

  const factionNames = (ids: bigint[] | undefined) =>
    (ids ?? [])
      .map((id) => factions.find((f) => f.id === id)?.name)
      .filter(Boolean) as string[];
  const npcNames = (ids: bigint[] | undefined) =>
    (ids ?? [])
      .map((id) => npcSelectItems.find((n) => n.id === id)?.name)
      .filter(Boolean) as string[];

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid var(--ds-border)",
                backgroundColor:
                  filterStatus === s ? "var(--ds-maroon)" : "transparent",
                color:
                  filterStatus === s
                    ? "#F2E9DB"
                    : (STATUS_COLORS[s] ?? "var(--ds-muted)"),
                cursor: "pointer",
                fontSize: 12,
              }}
              data-ocid={`quests.filter.${s.toLowerCase().replace(/ /g, "_")}.tab`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={openNew}
          style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
          data-ocid="quests.primary_button"
        >
          + New Quest
        </button>
      </div>

      {/* Search */}
      <input
        className="ds-input"
        placeholder="Search quests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12, width: "100%" }}
        data-ocid="quests.search_input"
      />

      {/* Quest List */}
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)" }}
          data-ocid="quests.loading_state"
        >
          Loading quests...
        </p>
      ) : filtered.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 40,
          }}
          data-ocid="quests.empty_state"
        >
          {search || filterStatus !== "All"
            ? "No quests match your search."
            : "No quests yet. Start your adventure!"}
        </p>
      ) : (
        grouped.map(({ status, quests: statusQuests }) => (
          <div key={status} style={{ marginBottom: 20 }}>
            <h3
              className="font-cinzel"
              style={{
                color: STATUS_COLORS[status] ?? "var(--ds-gold)",
                fontSize: 13,
                marginBottom: 8,
                borderBottom: `1px solid ${STATUS_COLORS[status] ?? "var(--ds-border)"}44`,
                paddingBottom: 6,
              }}
            >
              {status.toUpperCase()} ({statusQuests.length})
            </h3>
            {statusQuests.map((quest, i) => {
              const isExpanded = expandedId === quest.id;
              return (
                <div
                  key={quest.id}
                  className="ds-card2"
                  style={{ marginBottom: 8, overflow: "hidden" }}
                  data-ocid={`quests.item.${i + 1}`}
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
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : quest.id)}
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
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor:
                            STATUS_COLORS[quest.status] ?? "var(--ds-muted)",
                          display: "inline-block",
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
                        {quest.title}
                      </span>
                      <span
                        style={{
                          color:
                            STATUS_COLORS[quest.status] ?? "var(--ds-muted)",
                          fontSize: 10,
                          backgroundColor: `${STATUS_COLORS[quest.status]}22`,
                          padding: "1px 6px",
                          borderRadius: 10,
                        }}
                      >
                        {quest.status}
                      </span>
                      {factionNames(quest.linkedFactionIds).map((name) => (
                        <span
                          key={name}
                          style={{
                            fontSize: 10,
                            color: "var(--ds-gold)",
                            background: "var(--ds-surface2)",
                            padding: "1px 6px",
                            borderRadius: 4,
                            border: "1px solid var(--ds-border)",
                          }}
                        >
                          ⚜️ {name}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ fontSize: 12, padding: "3px 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(quest);
                        }}
                        data-ocid={`quests.edit_button.${i + 1}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(quest.id);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#666",
                          cursor: "pointer",
                          padding: 4,
                          fontSize: 14,
                        }}
                        data-ocid={`quests.delete_button.${i + 1}`}
                      >
                        🗑️
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
                      }}
                    >
                      {npcNames(quest.linkedNpcIds).length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            Linked NPCs
                          </div>
                          <p style={{ color: "var(--ds-text)", fontSize: 12 }}>
                            {npcNames(quest.linkedNpcIds).join(", ")}
                          </p>
                        </div>
                      )}
                      {quest.description && (
                        <div style={{ marginTop: 10 }}>
                          <div
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            Description
                          </div>
                          <p
                            style={{
                              color: "var(--ds-text)",
                              fontSize: 13,
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {quest.description}
                          </p>
                        </div>
                      )}
                      {quest.objectives && (
                        <div style={{ marginTop: 10 }}>
                          <div
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            Objectives
                          </div>
                          <p
                            style={{
                              color: "var(--ds-text)",
                              fontSize: 13,
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {quest.objectives}
                          </p>
                        </div>
                      )}
                      {quest.reward && (
                        <div style={{ marginTop: 10 }}>
                          <div
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            Reward
                          </div>
                          <p style={{ color: "var(--ds-gold)", fontSize: 13 }}>
                            {quest.reward}
                          </p>
                        </div>
                      )}
                      {quest.notes && (
                        <div style={{ marginTop: 10 }}>
                          <div
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            Notes
                          </div>
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 13,
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {quest.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          data-ocid="quests.dialog"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflow: "auto",
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
                {editingId ? "Edit Quest" : "New Quest"}
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
                data-ocid="quests.close_button"
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Quest Title *</span>
                <input
                  ref={titleRef}
                  className="ds-input"
                  value={form.title}
                  onChange={(e) => f("title", e.target.value)}
                  placeholder="e.g. The Dragon's Lair"
                  data-ocid="quests.input"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Status</span>
                <select
                  className="ds-input"
                  value={form.status}
                  onChange={(e) => f("status", e.target.value)}
                  data-ocid="quests.select"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Description</span>
                <textarea
                  className="ds-input"
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="Quest background and context..."
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Objectives</span>
                <textarea
                  className="ds-input"
                  value={form.objectives}
                  onChange={(e) => f("objectives", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="What needs to be done..."
                  data-ocid="quests.textarea"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Reward</span>
                <input
                  className="ds-input"
                  value={form.reward}
                  onChange={(e) => f("reward", e.target.value)}
                  placeholder="e.g. 500 GP, magic sword"
                />
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="ds-label">Linked NPCs</span>
                <MultiEntityLinkSelect
                  items={npcSelectItems}
                  values={form.linkedNpcIds ?? []}
                  onChange={(ids) => f("linkedNpcIds", ids)}
                  label=""
                  ocid="quests.linked_npcs"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="ds-label">Linked Factions</span>
                <MultiEntityLinkSelect
                  items={factionItems}
                  values={form.linkedFactionIds ?? []}
                  onChange={(ids) => f("linkedFactionIds", ids)}
                  label=""
                  ocid="quests.linked_factions"
                />
              </div>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Notes</span>
                <textarea
                  className="ds-input"
                  value={form.notes}
                  onChange={(e) => f("notes", e.target.value)}
                  rows={2}
                  style={{ resize: "vertical" }}
                  placeholder="Additional notes..."
                />
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
                data-ocid="quests.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
                data-ocid="quests.submit_button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Quest"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

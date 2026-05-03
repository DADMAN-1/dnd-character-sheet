import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Faction } from "../../types";
import type { DndBackend, RivalEntry } from "../../types";
import EntityLinkSelect from "../EntityLinkSelect";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const RIVAL_TYPES = ["Rival", "Enemy", "Nemesis", "Antagonist", "Other"];
const THREAT_LEVELS = ["Low", "Medium", "High", "Extreme"];
const STATUSES = ["Active", "Defeated", "Ally", "Unknown", "Deceased"];

const THREAT_COLORS: Record<string, string> = {
  Low: "#4caf50",
  Medium: "#ff9800",
  High: "#ff5722",
  Extreme: "#e53935",
};

const STATUS_COLORS: Record<string, string> = {
  Active: "#e53935",
  Defeated: "#4caf50",
  Ally: "#3498db",
  Unknown: "#78909c",
  Deceased: "#546e7a",
};

const TYPE_COLORS: Record<string, string> = {
  Rival: "var(--ds-gold)",
  Enemy: "#e57373",
  Nemesis: "#e53935",
  Antagonist: "#ff7043",
  Other: "#90a4ae",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type FormState = Omit<RivalEntry, "id" | "characterId" | "owner">;

const emptyForm = (): FormState => ({
  name: "",
  rivalType: "Rival",
  faction: "",
  threatLevel: "Medium",
  backstory: "",
  currentLocation: "",
  personalHistory: "",
  wins: 0n,
  losses: 0n,
  status: "Active",
  notes: "",
  linkedFactionId: undefined,
});

export default function RivalsTab({ actor, characterId }: Props) {
  const [rivals, setRivals] = useState<RivalEntry[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const nameRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, facs] = await Promise.all([
        actor.getRivals(characterId),
        actor.getFactions().catch(() => [] as Faction[]),
      ]);
      setRivals(data ?? []);
      setFactions(facs);
    } catch (e) {
      console.error("Failed to load rivals:", e);
      setRivals([]);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const openEdit = (r: RivalEntry) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      rivalType: r.rivalType,
      faction: r.faction,
      threatLevel: r.threatLevel,
      backstory: r.backstory,
      currentLocation: r.currentLocation,
      personalHistory: r.personalHistory,
      wins: r.wins,
      losses: r.losses,
      status: r.status,
      notes: r.notes,
      linkedFactionId: r.linkedFactionId,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const rival: RivalEntry = {
          id: editingId,
          characterId,
          owner: Principal.anonymous(),
          ...form,
        };
        await actor.updateRivalEntry(editingId, rival);
        setRivals((prev) => prev.map((r) => (r.id === editingId ? rival : r)));
      } else {
        const rival: RivalEntry = {
          id: makeId(),
          characterId,
          owner: Principal.anonymous(),
          ...form,
        };
        await actor.addRivalEntry(characterId, rival);
        setRivals((prev) => [...prev, rival]);
      }
      setShowForm(false);
    } catch (e) {
      console.error("Failed to save rival:", e);
      alert(`Failed to save rival: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rival?")) return;
    try {
      await actor.deleteRivalEntry(id);
      setRivals((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error("Failed to delete rival:", e);
      alert(`Failed to delete rival: ${String(e)}`);
    }
  };

  const f = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const filtered =
    filterStatus === "All"
      ? rivals
      : rivals.filter((r) => r.status === filterStatus);

  const totalWins = rivals.reduce((s, r) => s + r.wins, 0n);
  const totalLosses = rivals.reduce((s, r) => s + r.losses, 0n);

  return (
    <div>
      {/* Record summary */}
      {rivals.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 16,
            padding: "10px 14px",
            backgroundColor: "var(--ds-surface)",
            border: "1px solid var(--ds-border)",
            borderRadius: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: "var(--ds-muted)",
                fontSize: 11,
                textTransform: "uppercase",
              }}
            >
              Overall Record
            </span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              <span style={{ color: "#4caf50" }}>{totalWins.toString()}W</span>
              <span style={{ color: "var(--ds-muted)", margin: "0 4px" }}>
                /
              </span>
              <span style={{ color: "#e53935" }}>
                {totalLosses.toString()}L
              </span>
            </span>
          </div>
          <div
            style={{
              width: 1,
              height: 36,
              backgroundColor: "var(--ds-border)",
            }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {STATUSES.map((s) => {
              const count = rivals.filter((r) => r.status === s).length;
              if (!count) return null;
              return (
                <span
                  key={s}
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 10,
                    backgroundColor: `${STATUS_COLORS[s]}22`,
                    color: STATUS_COLORS[s],
                    border: `1px solid ${STATUS_COLORS[s]}44`,
                  }}
                >
                  {count} {s}
                </span>
              );
            })}
          </div>
        </div>
      )}

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
          {["All", ...STATUSES].map((s) => (
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
              data-ocid={`rivals.filter.${s.toLowerCase()}.tab`}
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
          data-ocid="rivals.primary_button"
        >
          + Add Rival
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)" }}
          data-ocid="rivals.loading_state"
        >
          Loading rivals...
        </p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="rivals.empty_state"
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚔️</div>
          <p>
            {rivals.length === 0
              ? "No rivals recorded. Make some enemies!"
              : `No ${filterStatus} rivals.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((rival, i) => {
            const isExpanded = expandedId === rival.id;
            return (
              <div
                key={rival.id}
                className="ds-card2"
                style={{ overflow: "hidden" }}
                data-ocid={`rivals.item.${i + 1}`}
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
                    gap: 8,
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : rival.id)}
                  aria-expanded={isExpanded}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                      minWidth: 0,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--ds-text)",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {rival.name}
                    </span>
                    {rival.faction && (
                      <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                        ({rival.faction})
                      </span>
                    )}
                    {rival.linkedFactionId !== undefined &&
                      factions.find((f) => f.id === rival.linkedFactionId) && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "var(--ds-surface2)",
                            color: "var(--ds-gold)",
                            border: "1px solid var(--ds-border)",
                          }}
                        >
                          ⚜️{" "}
                          {
                            factions.find((f) => f.id === rival.linkedFactionId)
                              ?.name
                          }
                        </span>
                      )}
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 10,
                        backgroundColor: `${TYPE_COLORS[rival.rivalType] ?? "#90a4ae"}22`,
                        color: TYPE_COLORS[rival.rivalType] ?? "#90a4ae",
                        border: `1px solid ${TYPE_COLORS[rival.rivalType] ?? "#90a4ae"}44`,
                      }}
                    >
                      {rival.rivalType}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 10,
                        backgroundColor: `${THREAT_COLORS[rival.threatLevel] ?? "#90a4ae"}22`,
                        color: THREAT_COLORS[rival.threatLevel] ?? "#90a4ae",
                        border: `1px solid ${THREAT_COLORS[rival.threatLevel] ?? "#90a4ae"}44`,
                      }}
                    >
                      {rival.threatLevel}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 10,
                        backgroundColor: `${STATUS_COLORS[rival.status] ?? "#90a4ae"}22`,
                        color: STATUS_COLORS[rival.status] ?? "#90a4ae",
                        border: `1px solid ${STATUS_COLORS[rival.status] ?? "#90a4ae"}44`,
                      }}
                    >
                      {rival.status}
                    </span>
                    <span style={{ fontSize: 12, marginLeft: 4 }}>
                      <span style={{ color: "#4caf50" }}>
                        {rival.wins.toString()}W
                      </span>
                      <span
                        style={{ color: "var(--ds-muted)", margin: "0 2px" }}
                      >
                        /
                      </span>
                      <span style={{ color: "#e53935" }}>
                        {rival.losses.toString()}L
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
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
                        openEdit(rival);
                      }}
                      data-ocid={`rivals.edit_button.${i + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rival.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        padding: 4,
                        fontSize: 14,
                      }}
                      data-ocid={`rivals.delete_button.${i + 1}`}
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
                    {rival.currentLocation && (
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 11,
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          Current Location
                        </div>
                        <p style={{ color: "var(--ds-text)", fontSize: 13 }}>
                          {rival.currentLocation}
                        </p>
                      </div>
                    )}
                    {rival.backstory && (
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 11,
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          Backstory
                        </div>
                        <p
                          style={{
                            color: "var(--ds-text)",
                            fontSize: 13,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {rival.backstory}
                        </p>
                      </div>
                    )}
                    {rival.personalHistory && (
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 11,
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          Personal History
                        </div>
                        <p
                          style={{
                            color: "var(--ds-text)",
                            fontSize: 13,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {rival.personalHistory}
                        </p>
                      </div>
                    )}
                    {rival.notes && (
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
                          {rival.notes}
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

      {/* Form Modal */}
      {showForm && (
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
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowForm(false)}
          role="presentation"
          data-ocid="rivals.dialog"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
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
                {editingId ? "Edit Rival" : "Add Rival"}
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
                data-ocid="rivals.close_button"
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Name *</span>
                <input
                  ref={nameRef}
                  className="ds-input"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  placeholder="e.g. Valdris the Betrayer"
                  data-ocid="rivals.input"
                />
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Type</span>
                  <select
                    className="ds-input"
                    value={form.rivalType}
                    onChange={(e) => f("rivalType", e.target.value)}
                    data-ocid="rivals.type.select"
                  >
                    {RIVAL_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Threat Level</span>
                  <select
                    className="ds-input"
                    value={form.threatLevel}
                    onChange={(e) => f("threatLevel", e.target.value)}
                    data-ocid="rivals.threat.select"
                  >
                    {THREAT_LEVELS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Status</span>
                  <select
                    className="ds-input"
                    value={form.status}
                    onChange={(e) => f("status", e.target.value)}
                    data-ocid="rivals.status.select"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Faction</span>
                  <input
                    className="ds-input"
                    value={form.faction}
                    onChange={(e) => f("faction", e.target.value)}
                    placeholder="Shadow Guild, Dragon Cult..."
                  />
                </label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Associated Faction (linked)</span>
                  <EntityLinkSelect
                    items={factions.map((fa) => ({ id: fa.id, name: fa.name }))}
                    value={form.linkedFactionId ?? null}
                    onChange={(id) =>
                      setForm((prev) => ({
                        ...prev,
                        linkedFactionId: id ?? undefined,
                      }))
                    }
                    label=""
                    placeholder="— None —"
                    ocid="rivals.linked_faction.select"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Wins vs. this rival</span>
                  <input
                    className="ds-input"
                    type="number"
                    min={0}
                    value={form.wins.toString()}
                    onChange={(e) => f("wins", BigInt(e.target.value || "0"))}
                    data-ocid="rivals.wins.input"
                  />
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Losses vs. this rival</span>
                  <input
                    className="ds-input"
                    type="number"
                    min={0}
                    value={form.losses.toString()}
                    onChange={(e) => f("losses", BigInt(e.target.value || "0"))}
                    data-ocid="rivals.losses.input"
                  />
                </label>
              </div>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Current Location</span>
                <input
                  className="ds-input"
                  value={form.currentLocation}
                  onChange={(e) => f("currentLocation", e.target.value)}
                  placeholder="Last seen in Neverwinter..."
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Backstory</span>
                <textarea
                  className="ds-input"
                  value={form.backstory}
                  onChange={(e) => f("backstory", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="How did they become your rival..."
                  data-ocid="rivals.backstory.textarea"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Personal History</span>
                <textarea
                  className="ds-input"
                  value={form.personalHistory}
                  onChange={(e) => f("personalHistory", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="History of encounters and events..."
                  data-ocid="rivals.history.textarea"
                />
              </label>
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
                data-ocid="rivals.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
                data-ocid="rivals.submit_button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Rival"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

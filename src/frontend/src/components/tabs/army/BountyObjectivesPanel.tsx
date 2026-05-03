import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { BountyObjective, DndBackend } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const OBJECTIVE_TYPES = ["Bounty", "Objective", "Target", "Mission", "Other"];
const STATUSES = ["Active", "Completed", "Failed", "Abandoned"];

const STATUS_COLORS: Record<
  string,
  { text: string; border: string; bg: string }
> = {
  Active: { text: "#2980b9", border: "#2980b955", bg: "#2980b918" },
  Completed: { text: "#27ae60", border: "#27ae6055", bg: "#27ae6018" },
  Failed: { text: "#e74c3c", border: "#e74c3c55", bg: "#e74c3c18" },
  Abandoned: {
    text: "var(--ds-muted)",
    border: "var(--ds-border)",
    bg: "var(--ds-surface)",
  },
};

const blank = (armyId: string): BountyObjective => ({
  id: `new-${Date.now()}`,
  armyId,
  title: "",
  objectiveType: "Objective",
  target: "",
  description: "",
  reward: "",
  status: "Active",
  completedAt: "",
  notes: "",
  owner: Principal.anonymous(),
});

export default function BountyObjectivesPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [items, setItems] = useState<BountyObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<BountyObjective | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getBountyObjectives(armyId));
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

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addBountyObjective(armyId, editing);
      else await actor.updateBountyObjective(String(editing.id), editing);
      await load();
      setEditing(null);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setSaving(false);
        return;
      }
      console.error(e);
      alert(`Failed to save bounty/objective: ${String(e)}`);
    }
    setSaving(false);
  };

  const markComplete = async (item: BountyObjective) => {
    const updated = { ...item, status: "Completed" };
    try {
      await actor.updateBountyObjective(String(item.id), updated);
      setItems((p) => p.map((i) => (i.id === item.id ? updated : i)));
    } catch (e) {
      console.error(e);
      alert(`Failed to update objective: ${String(e)}`);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this objective?")) return;
    try {
      await actor.deleteBountyObjective(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof BountyObjective, v: unknown) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const active = items.filter((i) => i.status === "Active").length;
  const completed = items.filter((i) => i.status === "Completed").length;

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
          <SummaryChip label="Total" value={String(items.length)} />
          <SummaryChip label="Active" value={String(active)} color="#2980b9" />
          <SummaryChip
            label="Completed"
            value={String(completed)}
            color="#27ae60"
          />
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
          Bounties & Objectives
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blank(armyId));
            setIsNew(true);
          }}
          data-ocid="army.objectives.add_button"
        >
          + Add Objective
        </button>
      </div>

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.objectives.loading_state"
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
          data-ocid="army.objectives.empty_state"
        >
          No objectives tracked yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, idx) => {
            const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.Abandoned;
            return (
              <div
                key={item.id}
                className="ds-card"
                style={{
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
                data-ocid={`army.objectives.item.${idx + 1}`}
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
                      className="font-cinzel"
                      style={{ color: "var(--ds-text)", fontSize: 13 }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 4,
                        color: sc.text,
                        border: `1px solid ${sc.border}`,
                        background: sc.bg,
                      }}
                    >
                      {item.status}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 4,
                        color: "var(--ds-muted)",
                        border: "1px solid var(--ds-border)",
                      }}
                    >
                      {item.objectiveType}
                    </span>
                  </div>
                  {item.target && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--ds-muted)",
                        margin: "0 0 2px",
                      }}
                    >
                      Target: {item.target}
                    </p>
                  )}
                  {item.reward && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--ds-gold)",
                        margin: 0,
                      }}
                    >
                      Reward: {item.reward}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {item.status === "Active" && (
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{
                        padding: "4px 8px",
                        fontSize: 11,
                        color: "#27ae60",
                      }}
                      onClick={() => markComplete(item)}
                      data-ocid={`army.objectives.complete_button.${idx + 1}`}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => {
                      setEditing({ ...item });
                      setIsNew(false);
                    }}
                    data-ocid={`army.objectives.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => del(item.id)}
                    data-ocid={`army.objectives.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
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
              maxWidth: 500,
              padding: 24,
              maxHeight: "90vh",
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
                {isNew ? "Add Objective" : "Edit Objective"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.objectives.close_button"
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
                <div>
                  <div className="ds-label">Title *</div>
                  <input
                    className="ds-input"
                    value={editing.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Objective name"
                    data-ocid="army.objectives.title.input"
                  />
                </div>
                <div>
                  <div className="ds-label">Type</div>
                  <select
                    className="ds-input"
                    value={editing.objectiveType}
                    onChange={(e) => set("objectiveType", e.target.value)}
                    data-ocid="army.objectives.type.select"
                  >
                    {OBJECTIVE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ds-label">Target</div>
                  <input
                    className="ds-input"
                    value={editing.target}
                    onChange={(e) => set("target", e.target.value)}
                    placeholder="Person, place, or thing"
                  />
                </div>
                <div>
                  <div className="ds-label">Status</div>
                  <select
                    className="ds-input"
                    value={editing.status}
                    onChange={(e) => set("status", e.target.value)}
                    data-ocid="army.objectives.status.select"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="ds-label">Description</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.description}
                  onChange={(e) => set("description", e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ds-label">Reward</div>
                  <input
                    className="ds-input"
                    value={editing.reward}
                    onChange={(e) => set("reward", e.target.value)}
                    placeholder="Gold, item, territory"
                  />
                </div>
                <div>
                  <div className="ds-label">Completed At</div>
                  <input
                    className="ds-input"
                    value={editing.completedAt}
                    onChange={(e) => set("completedAt", e.target.value)}
                    placeholder="In-game date"
                  />
                </div>
              </div>
              <div>
                <div className="ds-label">Notes</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  style={{ resize: "vertical" }}
                  data-ocid="army.objectives.notes.textarea"
                />
              </div>
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
                data-ocid="army.objectives.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="army.objectives.save_button"
              >
                {saving ? "Saving…" : "Save"}
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

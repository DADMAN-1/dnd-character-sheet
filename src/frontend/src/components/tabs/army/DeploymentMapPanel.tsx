import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import type { DeploymentMapNote, DndBackend } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const DEPLOYMENT_STATUSES = [
  "Active",
  "Reserve",
  "Recalled",
  "Besieging",
  "Retreating",
];

const STATUS_COLORS: Record<
  string,
  { text: string; border: string; bg: string }
> = {
  Active: { text: "#27ae60", border: "#27ae6055", bg: "#27ae6018" },
  Reserve: { text: "#2980b9", border: "#2980b955", bg: "#2980b918" },
  Recalled: {
    text: "var(--ds-muted)",
    border: "var(--ds-border)",
    bg: "var(--ds-surface)",
  },
  Besieging: { text: "#e74c3c", border: "#e74c3c55", bg: "#e74c3c18" },
  Retreating: { text: "#e67e22", border: "#e67e2255", bg: "#e67e2218" },
};

const blank = (armyId: string): DeploymentMapNote => ({
  id: `new-${Date.now()}`,
  armyId,
  branchName: "",
  location: "",
  terrain: "",
  deploymentStatus: "Active",
  coordinatesNotes: "",
  strategicNotes: "",
  supplyLineStatus: "",
  lastUpdated: "",
  notes: "",
  owner: Principal.anonymous(),
});

export default function DeploymentMapPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [items, setItems] = useState<DeploymentMapNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<DeploymentMapNote | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getDeploymentNotes(armyId));
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
      if (isNew) await actor.addDeploymentNote(armyId, editing);
      else await actor.updateDeploymentNote(String(editing.id), editing);
      await load();
      setEditing(null);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setSaving(false);
        return;
      }
      console.error(e);
      alert(`Failed to save deployment note: ${String(e)}`);
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this deployment note?")) return;
    try {
      await actor.deleteDeploymentNote(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof DeploymentMapNote, v: unknown) =>
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
          marginBottom: 16,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15 }}
        >
          Deployment Map Notes
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditing(blank(armyId));
            setIsNew(true);
          }}
          data-ocid="army.deployment.add_button"
        >
          + Add Deployment
        </button>
      </div>

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", textAlign: "center" }}
          data-ocid="army.deployment.loading_state"
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
          data-ocid="army.deployment.empty_state"
        >
          No deployment notes yet. Add notes to track where each branch is
          deployed.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, idx) => {
            const sc =
              STATUS_COLORS[item.deploymentStatus] ?? STATUS_COLORS.Active;
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
                data-ocid={`army.deployment.item.${idx + 1}`}
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
                      {item.branchName || "Branch"}
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
                      {item.deploymentStatus}
                    </span>
                  </div>
                  {item.location && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ds-text)",
                        margin: "0 0 2px",
                      }}
                    >
                      📍 {item.location}
                    </p>
                  )}
                  <div style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                    {[
                      item.terrain,
                      item.supplyLineStatus
                        ? `Supply: ${item.supplyLineStatus}`
                        : "",
                      item.lastUpdated ? `Updated: ${item.lastUpdated}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  {item.strategicNotes && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ds-muted)",
                        marginTop: 4,
                      }}
                    >
                      {item.strategicNotes}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => {
                      setEditing({ ...item });
                      setIsNew(false);
                    }}
                    data-ocid={`army.deployment.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => del(item.id)}
                    data-ocid={`army.deployment.delete_button.${idx + 1}`}
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
                marginBottom: 16,
              }}
            >
              <h3
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 16 }}
              >
                {isNew ? "Add Deployment Note" : "Edit Deployment Note"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditing(null)}
                data-ocid="army.deployment.close_button"
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
                  <div className="ds-label">Branch Name *</div>
                  <input
                    className="ds-input"
                    value={editing.branchName}
                    onChange={(e) => set("branchName", e.target.value)}
                    placeholder="e.g. Infantry"
                    data-ocid="army.deployment.branch.input"
                  />
                </div>
                <div>
                  <div className="ds-label">Deployment Status</div>
                  <select
                    className="ds-input"
                    value={editing.deploymentStatus}
                    onChange={(e) => set("deploymentStatus", e.target.value)}
                    data-ocid="army.deployment.status.select"
                  >
                    {DEPLOYMENT_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
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
                  <div className="ds-label">Location</div>
                  <input
                    className="ds-input"
                    value={editing.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="Region or place name"
                  />
                </div>
                <div>
                  <div className="ds-label">Terrain</div>
                  <input
                    className="ds-input"
                    value={editing.terrain}
                    onChange={(e) => set("terrain", e.target.value)}
                    placeholder="Forest, plains, mountain…"
                  />
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
                  <div className="ds-label">Supply Line Status</div>
                  <input
                    className="ds-input"
                    value={editing.supplyLineStatus}
                    onChange={(e) => set("supplyLineStatus", e.target.value)}
                    placeholder="Secure, contested, cut"
                  />
                </div>
                <div>
                  <div className="ds-label">Last Updated</div>
                  <input
                    className="ds-input"
                    value={editing.lastUpdated}
                    onChange={(e) => set("lastUpdated", e.target.value)}
                    placeholder="In-game date"
                  />
                </div>
              </div>
              <div>
                <div className="ds-label">Coordinates / Map Notes</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.coordinatesNotes}
                  onChange={(e) => set("coordinatesNotes", e.target.value)}
                  style={{ resize: "vertical" }}
                  placeholder="Grid ref, landmarks, proximity to enemies"
                />
              </div>
              <div>
                <div className="ds-label">Strategic Notes</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.strategicNotes}
                  onChange={(e) => set("strategicNotes", e.target.value)}
                  style={{ resize: "vertical" }}
                  placeholder="Tactical importance, objectives"
                />
              </div>
              <div>
                <div className="ds-label">Notes</div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editing.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  style={{ resize: "vertical" }}
                  data-ocid="army.deployment.notes.textarea"
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
                data-ocid="army.deployment.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={save}
                disabled={saving}
                data-ocid="army.deployment.save_button"
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

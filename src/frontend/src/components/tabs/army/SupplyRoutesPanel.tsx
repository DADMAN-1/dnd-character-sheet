import { useCallback, useEffect, useState } from "react";
import type { DndBackend, SupplyRoute } from "../../../types";
import { CanisterErrorUI, isCanisterStopped } from "../../ErrorBoundary";

interface Props {
  actor: DndBackend;
  armyId: string;
  onRestartConnection?: () => void;
}

const STATUSES = ["active", "threatened", "cut_off"] as const;
type RouteStatus = (typeof STATUSES)[number];

const STATUS_META: Record<
  RouteStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  active: {
    label: "Active",
    color: "#27ae60",
    bg: "rgba(39,174,96,0.1)",
    border: "rgba(39,174,96,0.4)",
  },
  threatened: {
    label: "Threatened",
    color: "#e67e22",
    bg: "rgba(230,126,34,0.1)",
    border: "rgba(230,126,34,0.4)",
  },
  cut_off: {
    label: "Cut Off",
    color: "#c0392b",
    bg: "rgba(192,57,43,0.1)",
    border: "rgba(192,57,43,0.4)",
  },
};

const emptyRoute = (): Omit<SupplyRoute, "id"> => ({
  fromLocationId: "",
  toLocationId: "",
  status: "active",
  notes: "",
});

function uid() {
  return `route-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function SupplyRoutesPanel({
  actor,
  armyId,
  onRestartConnection,
}: Props) {
  const [routes, setRoutes] = useState<SupplyRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editRoute, setEditRoute] = useState<SupplyRoute | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getArmySupplyRoutes(BigInt(armyId));
      setRoutes(data ?? []);
    } catch (e) {
      if (isCanisterStopped(e)) setCanisterStopped(true);
      else setRoutes([]);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveRoutes = useCallback(
    async (updated: SupplyRoute[]) => {
      setSaving(true);
      setError(null);
      try {
        await actor.updateArmySupplyRoutes(BigInt(armyId), updated);
        setRoutes(updated);
      } catch (e) {
        if (isCanisterStopped(e)) setCanisterStopped(true);
        else setError(e instanceof Error ? e.message : "Failed to save");
      }
      setSaving(false);
    },
    [actor, armyId],
  );

  const handleSaveEdit = async () => {
    if (!editRoute) return;
    if (!editRoute.fromLocationId.trim() || !editRoute.toLocationId.trim()) {
      setError("From and To locations are required.");
      return;
    }
    const updated = isNew
      ? [...routes, { ...editRoute, id: uid() }]
      : routes.map((r) => (r.id === editRoute.id ? editRoute : r));
    await saveRoutes(updated);
    setEditRoute(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supply route?")) return;
    await saveRoutes(routes.filter((r) => r.id !== id));
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updated = routes.map((r) => (r.id === id ? { ...r, status } : r));
    await saveRoutes(updated);
  };

  const set = (k: keyof SupplyRoute, v: string) =>
    setEditRoute((r) => (r ? { ...r, [k]: v } : r));

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
          🛣️ Supply Routes
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => {
            setEditRoute({ id: "", ...emptyRoute() });
            setIsNew(true);
            setError(null);
          }}
          data-ocid="army.supplyroutes.add_button"
        >
          + Add Route
        </button>
      </div>

      {saving && (
        <p style={{ color: "var(--ds-muted)", fontSize: 12 }}>Saving…</p>
      )}

      {error && (
        <span
          style={{ color: "#c0392b", fontSize: 12 }}
          data-ocid="army.supplyroutes.error_state"
        >
          {error}
        </span>
      )}

      {/* List */}
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 13 }}
          data-ocid="army.supplyroutes.loading_state"
        >
          Loading supply routes…
        </p>
      ) : routes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--ds-muted)",
            fontSize: 13,
          }}
          data-ocid="army.supplyroutes.empty_state"
        >
          No supply routes tracked yet. Add routes to monitor logistics
          corridors.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {routes.map((route, idx) => {
            const meta =
              STATUS_META[(route.status as RouteStatus) ?? "active"] ??
              STATUS_META.active;
            return (
              <div
                key={route.id}
                className="ds-card"
                style={{
                  padding: "12px 14px",
                  borderLeft: `3px solid ${meta.color}`,
                }}
                data-ocid={`army.supplyroutes.item.${idx + 1}`}
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
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Cinzel, serif",
                          fontSize: 13,
                          color: "var(--ds-text)",
                          fontWeight: 600,
                        }}
                      >
                        {route.fromLocationId || "Unknown origin"}
                      </span>
                      <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                        →
                      </span>
                      <span
                        style={{
                          fontFamily: "Cinzel, serif",
                          fontSize: 13,
                          color: "var(--ds-text)",
                          fontWeight: 600,
                        }}
                      >
                        {route.toLocationId || "Unknown destination"}
                      </span>
                      <select
                        value={route.status}
                        onChange={(e) =>
                          handleStatusChange(route.id, e.target.value)
                        }
                        style={{
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 10,
                          border: `1px solid ${meta.border}`,
                          background: meta.bg,
                          color: meta.color,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        aria-label="Change route status"
                        data-ocid={`army.supplyroutes.status.${idx + 1}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {route.notes && (
                      <p
                        style={{
                          color: "var(--ds-muted)",
                          fontSize: 12,
                          margin: 0,
                        }}
                      >
                        {route.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 12, padding: "3px 8px" }}
                      onClick={() => {
                        setEditRoute({ ...route });
                        setIsNew(false);
                        setError(null);
                      }}
                      data-ocid={`army.supplyroutes.edit_button.${idx + 1}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{
                        fontSize: 12,
                        padding: "3px 8px",
                        color: "#c0392b",
                      }}
                      onClick={() => handleDelete(route.id)}
                      data-ocid={`army.supplyroutes.delete_button.${idx + 1}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {editRoute && (
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
          onClick={(e) => e.target === e.currentTarget && setEditRoute(null)}
          onKeyDown={(e) => e.key === "Escape" && setEditRoute(null)}
          role="presentation"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 480,
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
                style={{ color: "var(--ds-gold)", fontSize: 15 }}
              >
                {isNew ? "Add Supply Route" : "Edit Supply Route"}
              </h3>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditRoute(null)}
                data-ocid="army.supplyroutes.close_button"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label htmlFor="route-from" className="ds-label">
                    From Location *
                  </label>
                  <input
                    id="route-from"
                    className="ds-input"
                    value={editRoute.fromLocationId}
                    onChange={(e) => set("fromLocationId", e.target.value)}
                    placeholder="Origin location"
                    style={{ fontSize: 13 }}
                    data-ocid="army.supplyroutes.from.input"
                  />
                </div>
                <div>
                  <label htmlFor="route-to" className="ds-label">
                    To Location *
                  </label>
                  <input
                    id="route-to"
                    className="ds-input"
                    value={editRoute.toLocationId}
                    onChange={(e) => set("toLocationId", e.target.value)}
                    placeholder="Destination location"
                    style={{ fontSize: 13 }}
                    data-ocid="army.supplyroutes.to.input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="route-status" className="ds-label">
                  Status
                </label>
                <select
                  id="route-status"
                  className="ds-input"
                  value={editRoute.status}
                  onChange={(e) => set("status", e.target.value)}
                  style={{ fontSize: 13 }}
                  data-ocid="army.supplyroutes.modal.status.select"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="route-notes" className="ds-label">
                  Notes
                </label>
                <textarea
                  id="route-notes"
                  className="ds-input"
                  rows={3}
                  value={editRoute.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Threats, vulnerabilities, patrol schedule…"
                  style={{ resize: "vertical", fontSize: 13 }}
                  data-ocid="army.supplyroutes.notes.textarea"
                />
              </div>

              {error && (
                <span
                  style={{ color: "#c0392b", fontSize: 12 }}
                  data-ocid="army.supplyroutes.modal.error_state"
                >
                  {error}
                </span>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <button
                  type="button"
                  className="ds-btn-ghost"
                  onClick={() => setEditRoute(null)}
                  data-ocid="army.supplyroutes.cancel_button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={handleSaveEdit}
                  disabled={saving}
                  data-ocid="army.supplyroutes.submit_button"
                >
                  {saving ? "Saving…" : isNew ? "Add Route" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

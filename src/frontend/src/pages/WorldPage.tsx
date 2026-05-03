import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import EntityLinkSelect from "../components/EntityLinkSelect";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import type { DungeonRoom } from "../types";
import type {
  BestiaryCreature,
  DndBackend,
  Faction,
  Location,
  LoreEntry,
  TimelineEvent,
  WeatherEntry,
} from "../types";
import KingdomsTab from "./WorldKingdomsTab";
import ReligionsTab from "./WorldReligionsTab";

interface Props {
  actor: DndBackend;
  onRestartConnection?: () => void;
}

type WorldTab =
  | "locations"
  | "lore"
  | "timeline"
  | "factions"
  | "weather"
  | "bestiary"
  | "kingdoms"
  | "religions";

// ── shared helpers ──────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const LORE_CATEGORIES = [
  "History",
  "Religion",
  "Factions",
  "Geography",
  "Magic",
  "Culture",
  "Other",
];
const LOCATION_TYPES = [
  "City",
  "Town",
  "Village",
  "Dungeon",
  "Forest",
  "Mountain",
  "Ruin",
  "Temple",
  "Other",
];

// ── sub-components ───────────────────────────────────────────────────────────

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
        data-ocid={`world.${title.toLowerCase()}.add_button`}
      >
        {adding ? "Saving…" : `+ Add ${title.slice(0, -1)}`}
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
      data-ocid="world.empty_state"
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
      data-ocid="world.dialog"
    >
      <div
        className="ds-card"
        style={{
          width: "100%",
          maxWidth: 520,
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
            data-ocid="world.close_button"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldGroup({
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

// ── Locations Tab ────────────────────────────────────────────────────────────

function LocationsTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<Location[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dungeonRooms, setDungeonRooms] = useState<
    Record<string, DungeonRoom[]>
  >({});
  const [expandedDungeon, setExpandedDungeon] = useState<string | null>(null);
  const [roomSaving, setRoomSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [locs, facs] = await Promise.all([
        actor.getLocations(),
        actor.getFactions().catch(() => [] as Faction[]),
      ]);
      setItems(locs);
      setFactions(facs);
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

  const loadRooms = async (locationId: string) => {
    try {
      const rooms = await actor.getLocationDungeonRooms(locationId);
      setDungeonRooms((prev) => ({ ...prev, [locationId]: rooms }));
    } catch {
      setDungeonRooms((prev) => ({ ...prev, [locationId]: [] }));
    }
  };

  const toggleDungeon = (locationId: string) => {
    if (expandedDungeon === locationId) {
      setExpandedDungeon(null);
    } else {
      setExpandedDungeon(locationId);
      if (!dungeonRooms[locationId]) loadRooms(locationId);
    }
  };

  const addRoom = (locationId: string) => {
    const existing = dungeonRooms[locationId] ?? [];
    const newRoom: DungeonRoom = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: "",
      description: "",
      order: existing.length + 1,
    };
    setDungeonRooms((prev) => ({
      ...prev,
      [locationId]: [...existing, newRoom],
    }));
  };

  const updateRoom = (
    locationId: string,
    roomId: string,
    key: "name" | "description",
    value: string,
  ) => {
    setDungeonRooms((prev) => ({
      ...prev,
      [locationId]: (prev[locationId] ?? []).map((r) =>
        r.id === roomId ? { ...r, [key]: value } : r,
      ),
    }));
  };

  const moveRoom = (locationId: string, idx: number, dir: -1 | 1) => {
    setDungeonRooms((prev) => {
      const rooms = [...(prev[locationId] ?? [])];
      const target = idx + dir;
      if (target < 0 || target >= rooms.length) return prev;
      [rooms[idx], rooms[target]] = [rooms[target], rooms[idx]];
      return {
        ...prev,
        [locationId]: rooms.map((r, i) => ({ ...r, order: i + 1 })),
      };
    });
  };

  const deleteRoom = (locationId: string, roomId: string) => {
    setDungeonRooms((prev) => ({
      ...prev,
      [locationId]: (prev[locationId] ?? [])
        .filter((r) => r.id !== roomId)
        .map((r, i) => ({ ...r, order: i + 1 })),
    }));
  };

  const saveRooms = async (locationId: string) => {
    setRoomSaving(locationId);
    try {
      await actor.updateLocationDungeonRooms(
        locationId,
        dungeonRooms[locationId] ?? [],
      );
    } catch (err) {
      alert(
        `Failed to save rooms: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setRoomSaving(null);
    }
  };

  const blank = (): Location => ({
    id: uid(),
    name: "",
    locationType: "City",
    region: "",
    description: "",
    notes: "",
    visitedDate: "",
    factionId: undefined,
    owner: Principal.anonymous(),
  });

  const openNew = () => {
    setEditing(blank());
    setIsNew(true);
  };
  const openEdit = (loc: Location) => {
    setEditing({ ...loc });
    setIsNew(false);
  };
  const close = () => {
    setEditing(null);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addLocation(editing);
      else await actor.updateLocation(editing);
      await load();
      close();
    } catch (err) {
      console.error("Failed to save location:", err);
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    try {
      await actor.deleteLocation(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof Location, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const factionItems = factions.map((f) => ({ id: f.id, name: f.name }));
  const factionName = (id: bigint | undefined) =>
    id !== undefined ? factions.find((f) => f.id === id)?.name : undefined;

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="world.locations.loading_state"
      >
        Loading locations…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="Locations"
        emoji="🗺️"
        onAdd={openNew}
        adding={saving}
      />
      {items.length === 0 ? (
        <EmptyState
          emoji="🏰"
          message="No locations recorded yet. Add your first location."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((loc, idx) => (
            <div
              key={loc.id}
              className="ds-card"
              style={{ padding: 0, overflow: "hidden" }}
              data-ocid={`world.locations.item.${idx + 1}`}
            >
              <div style={{ padding: 16 }}>
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
                        marginBottom: 2,
                      }}
                    >
                      {loc.name || "Unnamed"}
                    </p>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--ds-muted)",
                        background: "var(--ds-surface2)",
                        padding: "2px 7px",
                        borderRadius: 4,
                        border: "1px solid var(--ds-border)",
                      }}
                    >
                      {loc.locationType}
                    </span>
                    {factionName(loc.factionId) && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          color: "var(--ds-gold)",
                          background: "var(--ds-surface2)",
                          padding: "2px 7px",
                          borderRadius: 4,
                          border: "1px solid var(--ds-border)",
                        }}
                      >
                        ⚜️ {factionName(loc.factionId)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => openEdit(loc)}
                      data-ocid={`world.locations.edit_button.${idx + 1}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => del(loc.id)}
                      data-ocid={`world.locations.delete_button.${idx + 1}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {loc.region && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ds-muted)",
                      marginBottom: 4,
                    }}
                  >
                    📍 {loc.region}
                  </p>
                )}
                {loc.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--ds-text)",
                      lineHeight: 1.5,
                      marginBottom: 4,
                    }}
                  >
                    {loc.description}
                  </p>
                )}
                {loc.visitedDate && (
                  <p style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                    Visited: {loc.visitedDate}
                  </p>
                )}
                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "3px 10px" }}
                    onClick={() => toggleDungeon(loc.id)}
                    data-ocid={`world.locations.dungeon_toggle.${idx + 1}`}
                  >
                    {expandedDungeon === loc.id ? "▲" : "▼"} 🗝️ Dungeon Rooms
                    {dungeonRooms[loc.id]
                      ? ` (${dungeonRooms[loc.id].length})`
                      : ""}
                  </button>
                </div>
              </div>

              {expandedDungeon === loc.id && (
                <div
                  style={{
                    borderTop: "1px solid var(--ds-border)",
                    padding: "12px 16px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <p
                      className="font-cinzel"
                      style={{ fontSize: 13, color: "var(--ds-gold)" }}
                    >
                      🗺️ Rooms
                    </p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ fontSize: 12, padding: "3px 10px" }}
                        onClick={() => addRoom(loc.id)}
                        data-ocid={`world.locations.add_room_button.${idx + 1}`}
                      >
                        + Add Room
                      </button>
                      <button
                        type="button"
                        className="ds-btn-primary"
                        style={{ fontSize: 12, padding: "3px 12px" }}
                        onClick={() => saveRooms(loc.id)}
                        disabled={roomSaving === loc.id}
                        data-ocid={`world.locations.save_rooms_button.${idx + 1}`}
                      >
                        {roomSaving === loc.id ? "Saving…" : "Save Rooms"}
                      </button>
                    </div>
                  </div>
                  {(dungeonRooms[loc.id] ?? []).length === 0 ? (
                    <p style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                      No rooms yet. Add your first room.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {(dungeonRooms[loc.id] ?? []).map((room, ri) => (
                        <div
                          key={room.id}
                          style={{
                            background: "var(--ds-surface2)",
                            border: "1px solid var(--ds-border)",
                            borderRadius: 6,
                            padding: "10px 12px",
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                          data-ocid={`world.locations.room.${idx + 1}.${ri + 1}`}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--ds-muted)",
                              minWidth: 20,
                              paddingTop: 6,
                            }}
                          >
                            {room.order}.
                          </span>
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            <input
                              className="ds-input"
                              style={{ fontSize: 13 }}
                              placeholder="Room name…"
                              value={room.name}
                              onChange={(e) =>
                                updateRoom(
                                  loc.id,
                                  room.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                              data-ocid={`world.locations.room_name.${idx + 1}.${ri + 1}`}
                            />
                            <textarea
                              className="ds-input"
                              style={{ fontSize: 12 }}
                              rows={2}
                              placeholder="Description, contents, hazards…"
                              value={room.description}
                              onChange={(e) =>
                                updateRoom(
                                  loc.id,
                                  room.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              data-ocid={`world.locations.room_desc.${idx + 1}.${ri + 1}`}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                            }}
                          >
                            <button
                              type="button"
                              className="ds-btn-ghost"
                              style={{ padding: "2px 6px", fontSize: 11 }}
                              onClick={() => moveRoom(loc.id, ri, -1)}
                              disabled={ri === 0}
                              aria-label="Move room up"
                              data-ocid={`world.locations.room_up.${idx + 1}.${ri + 1}`}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="ds-btn-ghost"
                              style={{ padding: "2px 6px", fontSize: 11 }}
                              onClick={() => moveRoom(loc.id, ri, 1)}
                              disabled={
                                ri === (dungeonRooms[loc.id] ?? []).length - 1
                              }
                              aria-label="Move room down"
                              data-ocid={`world.locations.room_down.${idx + 1}.${ri + 1}`}
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              className="ds-btn-ghost"
                              style={{
                                padding: "2px 6px",
                                fontSize: 11,
                                color: "#c0392b",
                              }}
                              onClick={() => deleteRoom(loc.id, room.id)}
                              aria-label="Delete room"
                              data-ocid={`world.locations.room_delete.${idx + 1}.${ri + 1}`}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ModalOverlay
          title={isNew ? "Add Location" : "Edit Location"}
          onClose={close}
        >
          <FieldGroup label="Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Neverwinter"
              data-ocid="world.location.name.input"
            />
          </FieldGroup>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <FieldGroup label="Type">
              <select
                className="ds-input"
                value={editing.locationType}
                onChange={(e) => set("locationType", e.target.value)}
                data-ocid="world.location.type.select"
              >
                {LOCATION_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="Region">
              <input
                className="ds-input"
                value={editing.region}
                onChange={(e) => set("region", e.target.value)}
                placeholder="e.g. Sword Coast"
                data-ocid="world.location.region.input"
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Controlling Faction">
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
              ocid="world.location.faction.select"
            />
          </FieldGroup>
          <FieldGroup label="Description">
            <textarea
              className="ds-input"
              rows={3}
              value={editing.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description…"
              data-ocid="world.location.description.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Additional notes…"
              data-ocid="world.location.notes.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Date Visited">
            <input
              className="ds-input"
              value={editing.visitedDate}
              onChange={(e) => set("visitedDate", e.target.value)}
              placeholder="e.g. Year 1492 DR"
              data-ocid="world.location.visiteddate.input"
            />
          </FieldGroup>
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
              onClick={close}
              data-ocid="world.location.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="world.location.save_button"
            >
              {saving ? "Saving…" : "Save Location"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Lore Tab ─────────────────────────────────────────────────────────────────

function LoreTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<LoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<LoreEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getLoreEntries());
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

  const blank = (): LoreEntry => ({
    id: uid(),
    title: "",
    category: "History",
    content: "",
    createdAt: new Date().toLocaleDateString(),
    owner: Principal.anonymous(),
  });
  const openNew = () => {
    setEditing(blank());
    setIsNew(true);
  };
  const openEdit = (e: LoreEntry) => {
    setEditing({ ...e });
    setIsNew(false);
  };
  const close = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addLoreEntry(editing);
      else await actor.updateLoreEntry(editing);
      await load();
      close();
    } catch (err) {
      console.error("Failed to save lore entry:", err);
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this lore entry?")) return;
    try {
      await actor.deleteLoreEntry(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof LoreEntry, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  const allCategories = ["All", ...LORE_CATEGORIES];
  const filtered =
    filter === "All" ? items : items.filter((i) => i.category === filter);

  const categoryColor: Record<string, string> = {
    History: "#c9a35a",
    Religion: "#9b6e1a",
    Factions: "#5a8ec9",
    Geography: "#5ac97a",
    Magic: "#a35ac9",
    Culture: "#c95a8e",
    Other: "var(--ds-muted)",
  };

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="world.lore.loading_state"
      >
        Loading lore…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="Lore Entries"
        emoji="📜"
        onAdd={openNew}
        adding={saving}
      />
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}
      >
        {allCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid var(--ds-border)",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "Inter,sans-serif",
              background: filter === cat ? "var(--ds-maroon)" : "transparent",
              color: filter === cat ? "#f2e9db" : "var(--ds-muted)",
            }}
            data-ocid={`world.lore.filter.${cat.toLowerCase()}.tab`}
          >
            {cat}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          emoji="📚"
          message="No lore entries yet. Start documenting the world's history."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((entry, idx) => (
            <div
              key={entry.id}
              className="ds-card"
              style={{ padding: 18 }}
              data-ocid={`world.lore.item.${idx + 1}`}
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
                    style={{
                      color: "var(--ds-gold)",
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {entry.title || "Untitled"}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: "1px solid",
                      color: categoryColor[entry.category] ?? "var(--ds-muted)",
                      borderColor:
                        categoryColor[entry.category] ?? "var(--ds-border)",
                      background: "transparent",
                    }}
                  >
                    {entry.category}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => openEdit(entry)}
                    data-ocid={`world.lore.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => del(entry.id)}
                    data-ocid={`world.lore.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ds-text)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {entry.content}
              </p>
              {entry.createdAt && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    marginTop: 8,
                  }}
                >
                  Added: {entry.createdAt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ModalOverlay
          title={isNew ? "Add Lore Entry" : "Edit Lore Entry"}
          onClose={close}
        >
          <FieldGroup label="Title">
            <input
              className="ds-input"
              value={editing.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. The Fall of the Old Empire"
              data-ocid="world.lore.title.input"
            />
          </FieldGroup>
          <FieldGroup label="Category">
            <select
              className="ds-input"
              value={editing.category}
              onChange={(e) => set("category", e.target.value)}
              data-ocid="world.lore.category.select"
            >
              {LORE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup label="Content">
            <textarea
              className="ds-input"
              rows={6}
              value={editing.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Write lore here…"
              data-ocid="world.lore.content.textarea"
            />
          </FieldGroup>
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
              onClick={close}
              data-ocid="world.lore.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="world.lore.save_button"
            >
              {saving ? "Saving…" : "Save Entry"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<TimelineEvent[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [events, facs, locs] = await Promise.all([
        actor.getTimelineEvents(),
        actor.getFactions().catch(() => [] as Faction[]),
        actor.getLocations().catch(() => [] as Location[]),
      ]);
      setItems([...events].sort((a, b) => a.date.localeCompare(b.date)));
      setFactions(facs);
      setLocations(locs);
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

  const blank = (): TimelineEvent => ({
    id: uid(),
    title: "",
    date: "",
    category: "Event",
    description: "",
    characters: [],
    armies: [],
    linkedFactionId: undefined,
    linkedLocationId: undefined,
    owner: Principal.anonymous(),
  });
  const openNew = () => {
    setEditing(blank());
    setIsNew(true);
  };
  const openEdit = (e: TimelineEvent) => {
    setEditing({ ...e, characters: [...e.characters], armies: [...e.armies] });
    setIsNew(false);
  };
  const close = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addTimelineEvent(editing);
      else await actor.updateTimelineEvent(editing);
      await load();
      close();
    } catch (err) {
      console.error("Failed to save timeline event:", err);
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await actor.deleteTimelineEvent(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof TimelineEvent, v: string | string[]) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  const setArr = (k: "characters" | "armies", raw: string) =>
    set(
      k,
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

  const factionItems = factions.map((f) => ({ id: f.id, name: f.name }));
  // For locations we need bigint ids — use index-based since Location ids are strings
  const locationItemsForSelect = locations.map((l, i) => ({
    id: BigInt(i + 1),
    name: l.name,
    strId: l.id,
  }));
  const factionName = (id: bigint | undefined) =>
    id !== undefined ? factions.find((f) => f.id === id)?.name : undefined;
  const locationName = (id: bigint | undefined) => {
    if (id === undefined) return undefined;
    return locationItemsForSelect.find((l) => l.id === id)?.name;
  };

  const catColors: Record<string, string> = {
    Event: "var(--ds-gold)",
    Battle: "#c0392b",
    Discovery: "#27ae60",
    Death: "#7f8c8d",
    Founding: "#3498db",
    Other: "var(--ds-muted)",
  };

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="world.timeline.loading_state"
      >
        Loading timeline…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="Timeline"
        emoji="⏳"
        onAdd={openNew}
        adding={saving}
      />
      {items.length === 0 ? (
        <EmptyState
          emoji="⌛"
          message="No events recorded. Start building your world's history."
        />
      ) : (
        <div style={{ position: "relative", paddingLeft: 32 }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 8,
              bottom: 8,
              width: 2,
              background: "var(--ds-border)",
            }}
          />
          {items.map((ev, idx) => (
            <div
              key={ev.id}
              style={{ position: "relative", marginBottom: 28 }}
              data-ocid={`world.timeline.item.${idx + 1}`}
            >
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: -26,
                  top: 8,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: catColors[ev.category] ?? "var(--ds-gold)",
                  border: "2px solid var(--ds-bg)",
                  zIndex: 1,
                }}
              />
              <div className="ds-card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <div>
                    {ev.date && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--ds-muted)",
                          marginBottom: 4,
                          display: "block",
                        }}
                      >
                        📅 {ev.date}
                      </span>
                    )}
                    <p
                      className="font-cinzel"
                      style={{ color: "var(--ds-gold)", fontSize: 15 }}
                    >
                      {ev.title || "Untitled Event"}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginTop: 4,
                      }}
                    >
                      {ev.category && (
                        <span
                          style={{
                            fontSize: 11,
                            color: catColors[ev.category] ?? "var(--ds-muted)",
                            background: "var(--ds-surface2)",
                            padding: "2px 7px",
                            borderRadius: 4,
                            border: "1px solid var(--ds-border)",
                            display: "inline-block",
                          }}
                        >
                          {ev.category}
                        </span>
                      )}
                      {factionName(ev.linkedFactionId) && (
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
                          ⚜️ {factionName(ev.linkedFactionId)}
                        </span>
                      )}
                      {locationName(ev.linkedLocationId) && (
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
                          📍 {locationName(ev.linkedLocationId)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => openEdit(ev)}
                      data-ocid={`world.timeline.edit_button.${idx + 1}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => del(ev.id)}
                      data-ocid={`world.timeline.delete_button.${idx + 1}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {ev.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--ds-text)",
                      lineHeight: 1.5,
                      marginTop: 6,
                    }}
                  >
                    {ev.description}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {ev.characters.length > 0 && (
                    <p style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                      👤 {ev.characters.join(", ")}
                    </p>
                  )}
                  {ev.armies.length > 0 && (
                    <p style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                      ⚔️ {ev.armies.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ModalOverlay
          title={isNew ? "Add Event" : "Edit Event"}
          onClose={close}
        >
          <FieldGroup label="Title">
            <input
              className="ds-input"
              value={editing.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Battle of the Broken Tower"
              data-ocid="world.timeline.title.input"
            />
          </FieldGroup>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <FieldGroup label="Date">
              <input
                className="ds-input"
                value={editing.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="e.g. Year 1492 DR"
                data-ocid="world.timeline.date.input"
              />
            </FieldGroup>
            <FieldGroup label="Category">
              <select
                className="ds-input"
                value={editing.category}
                onChange={(e) => set("category", e.target.value)}
                data-ocid="world.timeline.category.select"
              >
                {[
                  "Event",
                  "Battle",
                  "Discovery",
                  "Death",
                  "Founding",
                  "Other",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </FieldGroup>
          </div>
          <FieldGroup label="Linked Faction">
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
              ocid="world.timeline.faction.select"
            />
          </FieldGroup>
          <FieldGroup label="Linked Location">
            <EntityLinkSelect
              items={locationItemsForSelect}
              value={editing.linkedLocationId ?? null}
              onChange={(id) =>
                setEditing((e) =>
                  e ? { ...e, linkedLocationId: id ?? undefined } : e,
                )
              }
              label=""
              placeholder="— None —"
              ocid="world.timeline.location.select"
            />
          </FieldGroup>
          <FieldGroup label="Description">
            <textarea
              className="ds-input"
              rows={3}
              value={editing.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What happened…"
              data-ocid="world.timeline.description.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Characters (comma-separated)">
            <input
              className="ds-input"
              value={editing.characters.join(", ")}
              onChange={(e) => setArr("characters", e.target.value)}
              placeholder="e.g. Gandalf, Frodo"
              data-ocid="world.timeline.characters.input"
            />
          </FieldGroup>
          <FieldGroup label="Armies (comma-separated)">
            <input
              className="ds-input"
              value={editing.armies.join(", ")}
              onChange={(e) => setArr("armies", e.target.value)}
              placeholder="e.g. Iron Legion"
              data-ocid="world.timeline.armies.input"
            />
          </FieldGroup>
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
              onClick={close}
              data-ocid="world.timeline.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="world.timeline.save_button"
            >
              {saving ? "Saving…" : "Save Event"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Factions Tab ─────────────────────────────────────────────────────────────

function FactionsTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<Faction | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getFactions());
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

  const blank = (): Faction => ({
    id: BigInt(Date.now()),
    name: "",
    goals: "",
    alignment: "Neutral",
    description: "",
    relationships: "",
    characterAffiliations: "",
    armyAffiliations: "",
    notes: "",
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addFaction(editing);
      else await actor.updateFaction(editing);
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save faction:", err);
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: bigint) => {
    if (!confirm("Delete faction?")) return;
    try {
      await actor.deleteFaction(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof Faction, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="world.factions.loading_state"
      >
        Loading factions…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="Factions"
        emoji="⚜️"
        onAdd={() => {
          setEditing(blank());
          setIsNew(true);
        }}
        adding={saving}
      />
      {items.length === 0 ? (
        <EmptyState
          emoji="⚜️"
          message="No factions yet. Define the powers at play in your world."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((faction, idx) => (
            <div
              key={faction.id}
              className="ds-card"
              style={{ padding: 16 }}
              data-ocid={`world.factions.item.${idx + 1}`}
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
                      marginBottom: 2,
                    }}
                  >
                    {faction.name || "Unnamed"}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--ds-muted)",
                      background: "var(--ds-surface2)",
                      padding: "2px 7px",
                      borderRadius: 4,
                      border: "1px solid var(--ds-border)",
                    }}
                  >
                    {faction.alignment}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => {
                      setEditing({ ...faction });
                      setIsNew(false);
                    }}
                    data-ocid={`world.factions.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => del(faction.id)}
                    data-ocid={`world.factions.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {faction.goals && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 4,
                  }}
                >
                  <strong>Goals:</strong> {faction.goals}
                </p>
              )}
              {faction.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ds-text)",
                    lineHeight: 1.5,
                  }}
                >
                  {faction.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ModalOverlay
          title={isNew ? "Add Faction" : "Edit Faction"}
          onClose={() => setEditing(null)}
        >
          <FieldGroup label="Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. The Zhentarim"
              data-ocid="world.faction.name.input"
            />
          </FieldGroup>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <FieldGroup label="Alignment">
              <select
                className="ds-input"
                value={editing.alignment}
                onChange={(e) => set("alignment", e.target.value)}
                data-ocid="world.faction.alignment.select"
              >
                {[
                  "Lawful Good",
                  "Neutral Good",
                  "Chaotic Good",
                  "Lawful Neutral",
                  "Neutral",
                  "Chaotic Neutral",
                  "Lawful Evil",
                  "Neutral Evil",
                  "Chaotic Evil",
                ].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="Character Affiliations">
              <input
                className="ds-input"
                value={editing.characterAffiliations}
                onChange={(e) => set("characterAffiliations", e.target.value)}
                placeholder="Character names…"
                data-ocid="world.faction.character_affiliations.input"
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Goals">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.goals}
              onChange={(e) => set("goals", e.target.value)}
              placeholder="What does this faction want?"
              data-ocid="world.faction.goals.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Description">
            <textarea
              className="ds-input"
              rows={3}
              value={editing.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Background, history, methods…"
              data-ocid="world.faction.description.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Relationships with Other Factions">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.relationships}
              onChange={(e) => set("relationships", e.target.value)}
              placeholder="Allied with X, hostile to Y…"
              data-ocid="world.faction.relationships.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Army Affiliations">
            <input
              className="ds-input"
              value={editing.armyAffiliations}
              onChange={(e) => set("armyAffiliations", e.target.value)}
              placeholder="Army names…"
              data-ocid="world.faction.army_affiliations.input"
            />
          </FieldGroup>
          <FieldGroup label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              data-ocid="world.faction.notes.textarea"
            />
          </FieldGroup>
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
              data-ocid="world.faction.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="world.faction.save_button"
            >
              {saving ? "Saving…" : "Save Faction"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Weather Tab ───────────────────────────────────────────────────────────────

function WeatherTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<WeatherEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<WeatherEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getWeatherEntries());
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

  const blank = (): WeatherEntry => ({
    id: BigInt(Date.now()),
    weatherType: "Clear",
    season: "Summer",
    effects: "",
    startDate: "",
    endDate: "",
    notes: "",
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addWeatherEntry(editing);
      else await actor.updateWeatherEntry(editing);
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save weather entry:", err);
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: bigint) => {
    if (!confirm("Delete this weather entry?")) return;
    try {
      await actor.deleteWeatherEntry(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof WeatherEntry, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  const current = items[items.length - 1];

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="world.weather.loading_state"
      >
        Loading weather log…
      </p>
    );

  return (
    <div>
      {current && (
        <div
          style={{
            background: "var(--ds-surface)",
            border: "1px solid var(--ds-border)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>
            {current.weatherType === "Stormy"
              ? "⛈️"
              : current.weatherType === "Rainy"
                ? "🌧️"
                : current.weatherType === "Snowy"
                  ? "❄️"
                  : current.weatherType === "Foggy"
                    ? "🌫️"
                    : current.weatherType === "Magical"
                      ? "✨"
                      : "☀️"}
          </span>
          <div>
            <p
              className="font-cinzel"
              style={{ color: "var(--ds-gold)", fontSize: 15, marginBottom: 2 }}
            >
              Current: {current.weatherType} — {current.season}
            </p>
            {current.effects && (
              <p style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                {current.effects}
              </p>
            )}
          </div>
        </div>
      )}
      <SectionHeader
        title="Weather Log"
        emoji="🌤️"
        onAdd={() => {
          setEditing(blank());
          setIsNew(true);
        }}
        adding={saving}
      />
      {items.length === 0 ? (
        <EmptyState
          emoji="☀️"
          message="No weather entries yet. Log the current conditions."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...items].reverse().map((w, idx) => (
            <div
              key={w.id}
              className="ds-card"
              style={{
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
              data-ocid={`world.weather.item.${idx + 1}`}
            >
              <div>
                <p
                  className="font-cinzel"
                  style={{ color: "var(--ds-gold)", fontSize: 14 }}
                >
                  {w.weatherType} — {w.season}
                </p>
                {w.startDate && (
                  <p style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                    {w.startDate}
                    {w.endDate ? ` → ${w.endDate}` : ""}
                  </p>
                )}
                {w.effects && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ds-text)",
                      marginTop: 4,
                    }}
                  >
                    {w.effects}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 13 }}
                  onClick={() => {
                    setEditing({ ...w });
                    setIsNew(false);
                  }}
                  data-ocid={`world.weather.edit_button.${idx + 1}`}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ padding: "4px 8px", fontSize: 13 }}
                  onClick={() => del(w.id)}
                  data-ocid={`world.weather.delete_button.${idx + 1}`}
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
          title={isNew ? "Log Weather" : "Edit Weather"}
          onClose={() => setEditing(null)}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <FieldGroup label="Type">
              <select
                className="ds-input"
                value={editing.weatherType}
                onChange={(e) => set("weatherType", e.target.value)}
                data-ocid="world.weather.type.select"
              >
                {[
                  "Clear",
                  "Cloudy",
                  "Rainy",
                  "Stormy",
                  "Snowy",
                  "Foggy",
                  "Windy",
                  "Magical",
                  "Custom",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="Season">
              <select
                className="ds-input"
                value={editing.season}
                onChange={(e) => set("season", e.target.value)}
                data-ocid="world.weather.season.select"
              >
                {[
                  "Spring",
                  "Summer",
                  "Autumn",
                  "Winter",
                  "Dry Season",
                  "Wet Season",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FieldGroup>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <FieldGroup label="Start Date">
              <input
                className="ds-input"
                value={editing.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                placeholder="e.g. Day 1 of Spring"
                data-ocid="world.weather.start_date.input"
              />
            </FieldGroup>
            <FieldGroup label="End Date">
              <input
                className="ds-input"
                value={editing.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                placeholder="e.g. Day 7 of Spring"
                data-ocid="world.weather.end_date.input"
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Environmental Effects">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.effects}
              onChange={(e) => set("effects", e.target.value)}
              placeholder="Difficult terrain, visibility penalties…"
              data-ocid="world.weather.effects.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              data-ocid="world.weather.notes.textarea"
            />
          </FieldGroup>
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
              data-ocid="world.weather.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="world.weather.save_button"
            >
              {saving ? "Saving…" : "Log Weather"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Bestiary Tab ──────────────────────────────────────────────────────────────

function BestiaryTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<BestiaryCreature[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<BestiaryCreature | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getBestiaryCreatures());
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

  const blank = (): BestiaryCreature => ({
    id: BigInt(Date.now()),
    name: "",
    creatureType: "Beast",
    weaknesses: "",
    behaviors: "",
    immunities: "",
    notes: "",
    encounterCount: 0n,
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addBestiaryCreature(editing);
      else await actor.updateBestiaryCreature(editing);
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save creature:", err);
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: bigint) => {
    if (!confirm("Delete this creature?")) return;
    try {
      await actor.deleteBestiaryCreature(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof BestiaryCreature, v: string | bigint) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  const filtered = items.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.creatureType.toLowerCase().includes(search.toLowerCase()),
  );

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="world.bestiary.loading_state"
      >
        Loading bestiary…
      </p>
    );

  return (
    <div>
      <SectionHeader
        title="Bestiary"
        emoji="🐉"
        onAdd={() => {
          setEditing(blank());
          setIsNew(true);
        }}
        adding={saving}
      />
      <div style={{ marginBottom: 16 }}>
        <input
          className="ds-input"
          placeholder="Search creatures…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
          data-ocid="world.bestiary.search_input"
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🐉"
          message="No creatures logged yet. Document the monsters you've encountered."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((c, idx) => (
            <div
              key={c.id}
              className="ds-card"
              style={{ padding: 16 }}
              data-ocid={`world.bestiary.item.${idx + 1}`}
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
                      marginBottom: 2,
                    }}
                  >
                    {c.name || "Unknown"}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--ds-muted)",
                      background: "var(--ds-surface2)",
                      padding: "2px 7px",
                      borderRadius: 4,
                      border: "1px solid var(--ds-border)",
                    }}
                  >
                    {c.creatureType}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => {
                      setEditing({ ...c });
                      setIsNew(false);
                    }}
                    data-ocid={`world.bestiary.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => del(c.id)}
                    data-ocid={`world.bestiary.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {c.encounterCount > 0n && (
                <p style={{ fontSize: 11, color: "#27ae60" }}>
                  Encountered {c.encounterCount}×
                </p>
              )}
              {c.weaknesses && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginTop: 4,
                  }}
                >
                  <strong>Weak:</strong> {c.weaknesses}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ModalOverlay
          title={isNew ? "Add Creature" : "Edit Creature"}
          onClose={() => setEditing(null)}
        >
          <FieldGroup label="Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Ancient Red Dragon"
              data-ocid="world.bestiary.name.input"
            />
          </FieldGroup>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <FieldGroup label="Type">
              <select
                className="ds-input"
                value={editing.creatureType}
                onChange={(e) => set("creatureType", e.target.value)}
                data-ocid="world.bestiary.type.select"
              >
                {[
                  "Beast",
                  "Dragon",
                  "Undead",
                  "Fiend",
                  "Celestial",
                  "Humanoid",
                  "Aberration",
                  "Construct",
                  "Elemental",
                  "Fey",
                  "Giant",
                  "Monstrosity",
                  "Ooze",
                  "Plant",
                  "Custom",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="Encounter Count">
              <input
                className="ds-input"
                type="number"
                min={0}
                value={Number(editing.encounterCount)}
                onChange={(e) =>
                  set("encounterCount", BigInt(e.target.value || "0"))
                }
                data-ocid="world.bestiary.encounter_count.input"
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Weaknesses">
            <input
              className="ds-input"
              value={editing.weaknesses}
              onChange={(e) => set("weaknesses", e.target.value)}
              placeholder="Fire, radiant damage…"
              data-ocid="world.bestiary.weaknesses.input"
            />
          </FieldGroup>
          <FieldGroup label="Immunities">
            <input
              className="ds-input"
              value={editing.immunities}
              onChange={(e) => set("immunities", e.target.value)}
              placeholder="Poison, charm…"
              data-ocid="world.bestiary.immunities.input"
            />
          </FieldGroup>
          <FieldGroup label="Behaviors">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.behaviors}
              onChange={(e) => set("behaviors", e.target.value)}
              placeholder="How it acts, tactics, lair…"
              data-ocid="world.bestiary.behaviors.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              data-ocid="world.bestiary.notes.textarea"
            />
          </FieldGroup>
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
              data-ocid="world.bestiary.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="world.bestiary.save_button"
            >
              {saving ? "Saving…" : "Save Creature"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorldPage({ actor, onRestartConnection }: Props) {
  const [tab, setTab] = useState<WorldTab>("locations");

  const tabs: { id: WorldTab; label: string; emoji: string }[] = [
    { id: "locations", label: "Locations", emoji: "🗺️" },
    { id: "lore", label: "Lore", emoji: "📜" },
    { id: "timeline", label: "Timeline", emoji: "⏳" },
    { id: "factions", label: "Factions", emoji: "⚜️" },
    { id: "weather", label: "Weather", emoji: "🌤️" },
    { id: "bestiary", label: "Bestiary", emoji: "🐉" },
    { id: "kingdoms", label: "Kingdoms", emoji: "👑" },
    { id: "religions", label: "Religions", emoji: "🛐" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
      <h1
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 28, marginBottom: 24 }}
      >
        🌍 World Building
      </h1>

      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--ds-border)",
          marginBottom: 28,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
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
              fontSize: 13,
              fontFamily: "Inter,sans-serif",
              color: tab === t.id ? "var(--ds-gold)" : "var(--ds-muted)",
              borderBottom:
                tab === t.id
                  ? "2px solid var(--ds-gold)"
                  : "2px solid transparent",
              marginBottom: -1,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            data-ocid={`world.${t.id}.tab`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === "locations" && (
        <LocationsTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "lore" && (
        <LoreTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "timeline" && (
        <TimelineTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "factions" && (
        <FactionsTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "weather" && (
        <WeatherTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "bestiary" && (
        <BestiaryTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "kingdoms" && (
        <KingdomsTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
      {tab === "religions" && (
        <ReligionsTab actor={actor} onRestartConnection={onRestartConnection} />
      )}
    </div>
  );
}

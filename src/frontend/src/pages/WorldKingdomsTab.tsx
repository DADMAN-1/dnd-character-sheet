import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import type { DndBackend, LoreEntry } from "../types";

const KINGDOM_CATEGORY = "Kingdom";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface Kingdom {
  id: string;
  name: string;
  ruler: string;
  territory: string;
  militaryStrength: string;
  diplomaticRelations: string;
  linkedFaction: string;
  notes: string;
}

function toKingdom(entry: LoreEntry): Kingdom {
  try {
    const parsed = JSON.parse(entry.content) as Partial<Kingdom>;
    return {
      id: entry.id,
      name: entry.title,
      ruler: parsed.ruler ?? "",
      territory: parsed.territory ?? "",
      militaryStrength: parsed.militaryStrength ?? "",
      diplomaticRelations: parsed.diplomaticRelations ?? "",
      linkedFaction: parsed.linkedFaction ?? "",
      notes: parsed.notes ?? "",
    };
  } catch {
    return {
      id: entry.id,
      name: entry.title,
      ruler: "",
      territory: "",
      militaryStrength: "",
      diplomaticRelations: "",
      linkedFaction: "",
      notes: "",
    };
  }
}

function toEntry(k: Kingdom): LoreEntry {
  return {
    id: k.id,
    title: k.name,
    category: KINGDOM_CATEGORY,
    content: JSON.stringify({
      ruler: k.ruler,
      territory: k.territory,
      militaryStrength: k.militaryStrength,
      diplomaticRelations: k.diplomaticRelations,
      linkedFaction: k.linkedFaction,
      notes: k.notes,
    }),
    createdAt: new Date().toLocaleDateString(),
    owner: Principal.anonymous(),
  };
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
      data-ocid="world.kingdom.dialog"
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
            data-ocid="world.kingdom.close_button"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function KingdomsTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<Kingdom[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<Kingdom | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await actor.getLoreEntries();
      setItems(
        all.filter((e) => e.category === KINGDOM_CATEGORY).map(toKingdom),
      );
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

  const blank = (): Kingdom => ({
    id: uid(),
    name: "",
    ruler: "",
    territory: "",
    militaryStrength: "",
    diplomaticRelations: "",
    linkedFaction: "",
    notes: "",
  });

  const openNew = () => {
    setEditing(blank());
    setIsNew(true);
  };
  const openEdit = (k: Kingdom) => {
    setEditing({ ...k });
    setIsNew(false);
  };
  const close = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const entry = toEntry(editing);
      if (isNew) await actor.addLoreEntry(entry);
      else await actor.updateLoreEntry(entry);
      await load();
      close();
    } catch (err) {
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (k: Kingdom) => {
    if (!confirm(`Delete kingdom "${k.name}"?`)) return;
    try {
      await actor.deleteLoreEntry(k.id);
      setItems((p) => p.filter((i) => i.id !== k.id));
    } catch {
      /* ignore */
    }
  };

  const setField = (key: keyof Kingdom, v: string) =>
    setEditing((e) => (e ? { ...e, [key]: v } : e));

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="world.kingdoms.loading_state"
      >
        Loading kingdoms…
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
          👑 Kingdoms
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={openNew}
          disabled={saving}
          data-ocid="world.kingdoms.add_button"
        >
          {saving ? "Saving…" : "+ Add Kingdom"}
        </button>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="world.kingdoms.empty_state"
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>👑</div>
          <p>No kingdoms recorded yet. Add your first kingdom or nation.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((k, idx) => (
            <div
              key={k.id}
              className="ds-card"
              style={{ padding: 16 }}
              data-ocid={`world.kingdoms.item.${idx + 1}`}
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
                  style={{ color: "var(--ds-gold)", fontSize: 15 }}
                >
                  {k.name || "Unnamed"}
                </p>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => openEdit(k)}
                    data-ocid={`world.kingdoms.edit_button.${idx + 1}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 13 }}
                    onClick={() => del(k)}
                    data-ocid={`world.kingdoms.delete_button.${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {k.ruler && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "var(--ds-gold)" }}>👑 Ruler:</span>{" "}
                  {k.ruler}
                </p>
              )}
              {k.territory && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "var(--ds-muted)" }}>
                    📍 Territory:
                  </span>{" "}
                  {k.territory}
                </p>
              )}
              {k.militaryStrength && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-muted)",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "#c0392b" }}>⚔️ Military:</span>{" "}
                  {k.militaryStrength}
                </p>
              )}
              {k.diplomaticRelations && (
                <p style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                  <span style={{ color: "#3498db" }}>🤝 Diplomacy:</span>{" "}
                  {k.diplomaticRelations}
                </p>
              )}
              {k.linkedFaction && (
                <div style={{ marginTop: 6 }}>
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
                    ⚜️ {k.linkedFaction}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ModalOverlay
          title={isNew ? "Add Kingdom" : "Edit Kingdom"}
          onClose={close}
        >
          <FieldGroup label="Kingdom / Nation Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. The Kingdom of Aldoria"
              data-ocid="world.kingdom.name.input"
            />
          </FieldGroup>
          <FieldGroup label="Ruler">
            <input
              className="ds-input"
              value={editing.ruler}
              onChange={(e) => setField("ruler", e.target.value)}
              placeholder="e.g. Queen Elara Voss"
              data-ocid="world.kingdom.ruler.input"
            />
          </FieldGroup>
          <FieldGroup label="Territory Description">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.territory}
              onChange={(e) => setField("territory", e.target.value)}
              placeholder="Geographic extent, borders, key regions…"
              data-ocid="world.kingdom.territory.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Military Strength">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.militaryStrength}
              onChange={(e) => setField("militaryStrength", e.target.value)}
              placeholder="Army size, key forces, fortifications…"
              data-ocid="world.kingdom.military.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Diplomatic Relations">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.diplomaticRelations}
              onChange={(e) => setField("diplomaticRelations", e.target.value)}
              placeholder="Allied with X, at war with Y…"
              data-ocid="world.kingdom.diplomacy.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Linked Faction">
            <input
              className="ds-input"
              value={editing.linkedFaction}
              onChange={(e) => setField("linkedFaction", e.target.value)}
              placeholder="Faction name (if any)…"
              data-ocid="world.kingdom.faction.input"
            />
          </FieldGroup>
          <FieldGroup label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="History, secrets, current events…"
              data-ocid="world.kingdom.notes.textarea"
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
              data-ocid="world.kingdom.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="world.kingdom.save_button"
            >
              {saving ? "Saving…" : "Save Kingdom"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

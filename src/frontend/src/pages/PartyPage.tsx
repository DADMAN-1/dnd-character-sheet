import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import type { DndBackend, PartyInventoryItem, PartyNote } from "../types";

interface Props {
  actor: DndBackend;
  onRestartConnection?: () => void;
}

type PartyTab = "notes" | "inventory";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
      data-ocid="party.dialog"
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
            data-ocid="party.close_button"
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

// ── Party Notes Tab ───────────────────────────────────────────────────────────

function PartyNotesTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [notes, setNotes] = useState<PartyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<PartyNote | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setNotes(await actor.getPartyNotes());
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = (): PartyNote => ({
    id: uid(),
    title: "",
    content: "",
    createdAt: new Date().toLocaleDateString(),
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addPartyNote(editing);
      else await actor.updatePartyNote(editing);
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save party note:", err);
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this party note?")) return;
    try {
      await actor.deletePartyNote(id);
      setNotes((p) => p.filter((n) => n.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = (k: keyof PartyNote, v: string) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="party.notes.loading_state"
      >
        Loading notes…
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
        }}
      >
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 22 }}
        >
          📋 Party Notes
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => {
            setEditing(blank());
            setIsNew(true);
          }}
          data-ocid="party.notes.add_button"
        >
          + Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="party.notes.empty_state"
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>No party notes yet. Record shared knowledge, plans, and lore.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notes.map((note, idx) => {
            const isExpanded = expanded === note.id;
            const preview =
              note.content.length > 180
                ? `${note.content.slice(0, 180)}…`
                : note.content;
            return (
              <div
                key={note.id}
                className="ds-card"
                style={{ padding: 16 }}
                data-ocid={`party.notes.item.${idx + 1}`}
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
                        fontSize: 15,
                        marginBottom: 2,
                      }}
                    >
                      {note.title || "Untitled Note"}
                    </p>
                    {note.createdAt && (
                      <p style={{ fontSize: 11, color: "var(--ds-muted)" }}>
                        {note.createdAt}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => {
                        setEditing({ ...note });
                        setIsNew(false);
                      }}
                      data-ocid={`party.notes.edit_button.${idx + 1}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => del(note.id)}
                      data-ocid={`party.notes.delete_button.${idx + 1}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {note.content && (
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--ds-text)",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {isExpanded ? note.content : preview}
                    </p>
                    {note.content.length > 180 && (
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ padding: "2px 0", fontSize: 12, marginTop: 4 }}
                        onClick={() => setExpanded(isExpanded ? null : note.id)}
                      >
                        {isExpanded ? "Show less ▲" : "Show more ▼"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <ModalOverlay
          title={isNew ? "New Party Note" : "Edit Party Note"}
          onClose={() => setEditing(null)}
        >
          <Field label="Title">
            <input
              className="ds-input"
              value={editing.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Session 3 Summary"
              data-ocid="party.notes.title.input"
            />
          </Field>
          <Field label="Content">
            <textarea
              className="ds-input"
              rows={10}
              value={editing.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={
                "Write party notes here…\n\nSupports multi-line text."
              }
              style={{
                resize: "vertical",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                lineHeight: 1.6,
              }}
              data-ocid="party.notes.content.textarea"
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
              data-ocid="party.notes.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="party.notes.save_button"
            >
              {saving ? "Saving…" : "Save Note"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Party Inventory Tab ───────────────────────────────────────────────────────

function PartyInventoryTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<PartyInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editing, setEditing] = useState<PartyInventoryItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await actor.getPartyInventory());
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

  const blank = (): PartyInventoryItem => ({
    id: uid(),
    name: "",
    quantity: 1n,
    weight: "",
    value: "",
    description: "",
    notes: "",
    owner: Principal.anonymous(),
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) await actor.addPartyInventoryItem(editing);
      else await actor.updatePartyInventoryItem(editing);
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Failed to save party inventory item:", err);
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Remove this item from party inventory?")) return;
    try {
      await actor.deletePartyInventoryItem(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    }
  };

  const set = <K extends keyof PartyInventoryItem>(
    k: K,
    v: PartyInventoryItem[K],
  ) => setEditing((e) => (e ? { ...e, [k]: v } : e));

  const totalWeight = items.reduce((acc, i) => {
    const w = Number.parseFloat(i.weight || "0");
    const q = Number(i.quantity);
    return acc + (Number.isNaN(w) ? 0 : w * q);
  }, 0);

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="party.inventory.loading_state"
      >
        Loading inventory…
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
          🎒 Party Inventory
        </h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {items.length > 0 && (
            <span style={{ fontSize: 13, color: "var(--ds-muted)" }}>
              Total Weight:{" "}
              <strong style={{ color: "var(--ds-text)" }}>
                {totalWeight.toFixed(1)} lb
              </strong>
            </span>
          )}
          <button
            type="button"
            className="ds-btn-primary"
            onClick={() => {
              setEditing(blank());
              setIsNew(true);
            }}
            data-ocid="party.inventory.add_button"
          >
            + Add Item
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="party.inventory.empty_state"
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎒</div>
          <p>No items in the party stash. Add shared equipment and loot.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--ds-border)" }}>
                {["Name", "Qty", "Weight", "Value", "Description", ""].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign:
                          h === "Qty" || h === "Weight" || h === "Value"
                            ? "right"
                            : "left",
                        color: "var(--ds-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: "1px solid var(--ds-border)" }}
                  data-ocid={`party.inventory.item.${idx + 1}`}
                >
                  <td style={{ padding: "10px 12px" }}>
                    <p
                      style={{
                        color: "var(--ds-text)",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {item.name || "Unnamed"}
                    </p>
                    {item.notes && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--ds-muted)",
                          marginTop: 2,
                        }}
                      >
                        {item.notes}
                      </p>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      color: "var(--ds-text)",
                      fontSize: 14,
                    }}
                  >
                    {item.quantity.toString()}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      color: "var(--ds-muted)",
                      fontSize: 13,
                    }}
                  >
                    {item.weight || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      color: "var(--ds-muted)",
                      fontSize: 13,
                    }}
                  >
                    {item.value || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--ds-muted)",
                      fontSize: 13,
                      maxWidth: 200,
                    }}
                  >
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.description || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => {
                        setEditing({ ...item });
                        setIsNew(false);
                      }}
                      data-ocid={`party.inventory.edit_button.${idx + 1}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => del(item.id)}
                      data-ocid={`party.inventory.delete_button.${idx + 1}`}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ModalOverlay
          title={isNew ? "Add Item" : "Edit Item"}
          onClose={() => setEditing(null)}
        >
          <Field label="Name">
            <input
              className="ds-input"
              value={editing.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Rope of Climbing"
              data-ocid="party.inventory.name.input"
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <Field label="Quantity">
              <input
                className="ds-input"
                type="number"
                min={1}
                value={editing.quantity.toString()}
                onChange={(e) => set("quantity", BigInt(e.target.value || "1"))}
                data-ocid="party.inventory.quantity.input"
              />
            </Field>
            <Field label="Weight (lb)">
              <input
                className="ds-input"
                value={editing.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="e.g. 5"
                data-ocid="party.inventory.weight.input"
              />
            </Field>
            <Field label="Value">
              <input
                className="ds-input"
                value={editing.value}
                onChange={(e) => set("value", e.target.value)}
                placeholder="e.g. 50 gp"
                data-ocid="party.inventory.value.input"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="ds-input"
              rows={3}
              value={editing.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What is this item…"
              data-ocid="party.inventory.description.textarea"
            />
          </Field>
          <Field label="Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editing.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Who's carrying it, special conditions…"
              data-ocid="party.inventory.notes.textarea"
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
              data-ocid="party.inventory.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={save}
              disabled={saving}
              data-ocid="party.inventory.save_button"
            >
              {saving ? "Saving…" : "Save Item"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PartyPage({ actor, onRestartConnection }: Props) {
  const [tab, setTab] = useState<PartyTab>("notes");

  const tabs: { id: PartyTab; label: string; emoji: string }[] = [
    { id: "notes", label: "Party Notes", emoji: "📋" },
    { id: "inventory", label: "Party Inventory", emoji: "🎒" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
      <h1
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 28, marginBottom: 24 }}
      >
        🛡️ Party
      </h1>

      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--ds-border)",
          marginBottom: 28,
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
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "Inter,sans-serif",
              color: tab === t.id ? "var(--ds-gold)" : "var(--ds-muted)",
              borderBottom:
                tab === t.id
                  ? "2px solid var(--ds-gold)"
                  : "2px solid transparent",
              marginBottom: -1,
            }}
            data-ocid={`party.${t.id.replace("_", "")}.tab`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === "notes" && (
        <PartyNotesTab
          actor={actor}
          onRestartConnection={onRestartConnection}
        />
      )}
      {tab === "inventory" && (
        <PartyInventoryTab
          actor={actor}
          onRestartConnection={onRestartConnection}
        />
      )}
    </div>
  );
}

import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import type { DndBackend, LoreEntry } from "../types";

const RELIGION_CATEGORY = "Religion";
const ALIGNMENTS = ["LG", "NG", "CG", "LN", "N", "CN", "LE", "NE", "CE"];

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface Deity {
  id: string;
  name: string;
  alignment: string;
  portfolio: string;
  description: string;
}

interface Religion {
  id: string;
  name: string;
  description: string;
  domains: string;
  holySymbol: string;
  pantheonNotes: string;
  deities: Deity[];
}

function toReligion(entry: LoreEntry): Religion {
  try {
    const parsed = JSON.parse(entry.content) as Partial<Religion>;
    return {
      id: entry.id,
      name: entry.title,
      description: parsed.description ?? "",
      domains: parsed.domains ?? "",
      holySymbol: parsed.holySymbol ?? "",
      pantheonNotes: parsed.pantheonNotes ?? "",
      deities: Array.isArray(parsed.deities) ? parsed.deities : [],
    };
  } catch {
    return {
      id: entry.id,
      name: entry.title,
      description: "",
      domains: "",
      holySymbol: "",
      pantheonNotes: "",
      deities: [],
    };
  }
}

function toEntry(r: Religion): LoreEntry {
  return {
    id: r.id,
    title: r.name,
    category: RELIGION_CATEGORY,
    content: JSON.stringify({
      description: r.description,
      domains: r.domains,
      holySymbol: r.holySymbol,
      pantheonNotes: r.pantheonNotes,
      deities: r.deities,
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
  ocid,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  ocid?: string;
}) {
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
      data-ocid={ocid ?? "world.religion.dialog"}
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
            data-ocid="world.religion.close_button"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ReligionsTab({
  actor,
  onRestartConnection,
}: { actor: DndBackend; onRestartConnection?: () => void }) {
  const [items, setItems] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [editingReligion, setEditingReligion] = useState<Religion | null>(null);
  const [isNewReligion, setIsNewReligion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Deity editor: { religionId, deity | null for new }
  const [deityModal, setDeityModal] = useState<{
    religionId: string;
    deity: Deity | null;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await actor.getLoreEntries();
      setItems(
        all.filter((e) => e.category === RELIGION_CATEGORY).map(toReligion),
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

  const blankReligion = (): Religion => ({
    id: uid(),
    name: "",
    description: "",
    domains: "",
    holySymbol: "",
    pantheonNotes: "",
    deities: [],
  });

  const blankDeity = (): Deity => ({
    id: uid(),
    name: "",
    alignment: "N",
    portfolio: "",
    description: "",
  });

  const saveReligion = async () => {
    if (!editingReligion) return;
    setSaving(true);
    try {
      const entry = toEntry(editingReligion);
      if (isNewReligion) await actor.addLoreEntry(entry);
      else await actor.updateLoreEntry(entry);
      await load();
      setEditingReligion(null);
    } catch (err) {
      alert(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const delReligion = async (r: Religion) => {
    if (!confirm(`Delete religion "${r.name}"?`)) return;
    try {
      await actor.deleteLoreEntry(r.id);
      setItems((p) => p.filter((i) => i.id !== r.id));
    } catch {
      /* ignore */
    }
  };

  // Save a deity into a religion's deities array
  const saveDeity = async (deity: Deity) => {
    if (!deityModal) return;
    const religion = items.find((r) => r.id === deityModal.religionId);
    if (!religion) return;
    setSaving(true);
    try {
      const existingIdx = religion.deities.findIndex((d) => d.id === deity.id);
      const newDeities =
        existingIdx >= 0
          ? religion.deities.map((d, i) => (i === existingIdx ? deity : d))
          : [...religion.deities, deity];
      const updated: Religion = { ...religion, deities: newDeities };
      await actor.updateLoreEntry(toEntry(updated));
      await load();
      setDeityModal(null);
    } catch (err) {
      alert(
        `Failed to save deity: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const delDeity = async (religion: Religion, deityId: string) => {
    if (!confirm("Remove this deity?")) return;
    const updated: Religion = {
      ...religion,
      deities: religion.deities.filter((d) => d.id !== deityId),
    };
    try {
      await actor.updateLoreEntry(toEntry(updated));
      await load();
    } catch {
      /* ignore */
    }
  };

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <p
        style={{ color: "var(--ds-muted)", textAlign: "center", padding: 32 }}
        data-ocid="world.religions.loading_state"
      >
        Loading religions…
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
          🛐 Religions &amp; Deities
        </h2>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => {
            setEditingReligion(blankReligion());
            setIsNewReligion(true);
          }}
          disabled={saving}
          data-ocid="world.religions.add_button"
        >
          + Add Religion
        </button>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="world.religions.empty_state"
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛐</div>
          <p>No religions defined yet. Document the faiths of your world.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((rel, idx) => (
            <div
              key={rel.id}
              className="ds-card"
              style={{ padding: 0, overflow: "hidden" }}
              data-ocid={`world.religions.item.${idx + 1}`}
            >
              {/* Religion header */}
              <div style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="font-cinzel"
                      style={{
                        color: "var(--ds-gold)",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      {rel.name || "Unnamed"}
                    </p>
                    {rel.domains && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--ds-muted)",
                          marginBottom: 2,
                        }}
                      >
                        ⚡ Domains: {rel.domains}
                      </p>
                    )}
                    {rel.holySymbol && (
                      <p style={{ fontSize: 12, color: "var(--ds-muted)" }}>
                        ✨ Symbol: {rel.holySymbol}
                      </p>
                    )}
                    {rel.description && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--ds-text)",
                          lineHeight: 1.5,
                          marginTop: 6,
                        }}
                      >
                        {rel.description}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => {
                        setEditingReligion({
                          ...rel,
                          deities: [...rel.deities],
                        });
                        setIsNewReligion(false);
                      }}
                      data-ocid={`world.religions.edit_button.${idx + 1}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      onClick={() => delReligion(rel)}
                      data-ocid={`world.religions.delete_button.${idx + 1}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Deities section toggle */}
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "3px 10px" }}
                    onClick={() => toggleExpand(rel.id)}
                    data-ocid={`world.religions.deities_toggle.${idx + 1}`}
                  >
                    {expandedIds.has(rel.id) ? "▲" : "▼"} {rel.deities.length}{" "}
                    {rel.deities.length === 1 ? "Deity" : "Deities"}
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{
                      fontSize: 12,
                      padding: "3px 10px",
                      color: "var(--ds-gold)",
                    }}
                    onClick={() =>
                      setDeityModal({ religionId: rel.id, deity: null })
                    }
                    data-ocid={`world.religions.add_deity_button.${idx + 1}`}
                  >
                    + Add Deity
                  </button>
                </div>
              </div>

              {/* Expandable deities list */}
              {expandedIds.has(rel.id) && (
                <div
                  style={{
                    borderTop: "1px solid var(--ds-border)",
                    padding: "0 16px 12px",
                  }}
                >
                  {rel.deities.length === 0 ? (
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        paddingTop: 12,
                      }}
                    >
                      No deities added yet.
                    </p>
                  ) : (
                    rel.deities.map((deity, di) => (
                      <div
                        key={deity.id}
                        style={{
                          paddingTop: 12,
                          paddingBottom: 12,
                          borderBottom:
                            di < rel.deities.length - 1
                              ? "1px solid var(--ds-border)"
                              : "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 10,
                        }}
                        data-ocid={`world.religions.deity.${idx + 1}.${di + 1}`}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <p
                              className="font-cinzel"
                              style={{ color: "var(--ds-gold)", fontSize: 14 }}
                            >
                              {deity.name || "Unnamed"}
                            </p>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--ds-muted)",
                                background: "var(--ds-surface2)",
                                padding: "1px 6px",
                                borderRadius: 4,
                                border: "1px solid var(--ds-border)",
                              }}
                            >
                              {deity.alignment}
                            </span>
                          </div>
                          {deity.portfolio && (
                            <p
                              style={{ fontSize: 12, color: "var(--ds-muted)" }}
                            >
                              📖 {deity.portfolio}
                            </p>
                          )}
                          {deity.description && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--ds-text)",
                                marginTop: 3,
                              }}
                            >
                              {deity.description}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          <button
                            type="button"
                            className="ds-btn-ghost"
                            style={{ padding: "3px 7px", fontSize: 12 }}
                            onClick={() =>
                              setDeityModal({
                                religionId: rel.id,
                                deity: { ...deity },
                              })
                            }
                            data-ocid={`world.religions.deity_edit_button.${idx + 1}.${di + 1}`}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="ds-btn-ghost"
                            style={{ padding: "3px 7px", fontSize: 12 }}
                            onClick={() => delDeity(rel, deity.id)}
                            data-ocid={`world.religions.deity_delete_button.${idx + 1}.${di + 1}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Religion edit modal */}
      {editingReligion && (
        <ModalOverlay
          title={isNewReligion ? "Add Religion" : "Edit Religion"}
          onClose={() => setEditingReligion(null)}
        >
          <FieldGroup label="Religion Name">
            <input
              className="ds-input"
              value={editingReligion.name}
              onChange={(e) =>
                setEditingReligion((r) =>
                  r ? { ...r, name: e.target.value } : r,
                )
              }
              placeholder="e.g. The Church of Pelor"
              data-ocid="world.religion.name.input"
            />
          </FieldGroup>
          <FieldGroup label="Domains">
            <input
              className="ds-input"
              value={editingReligion.domains}
              onChange={(e) =>
                setEditingReligion((r) =>
                  r ? { ...r, domains: e.target.value } : r,
                )
              }
              placeholder="e.g. Sun, Healing, Light"
              data-ocid="world.religion.domains.input"
            />
          </FieldGroup>
          <FieldGroup label="Holy Symbol">
            <input
              className="ds-input"
              value={editingReligion.holySymbol}
              onChange={(e) =>
                setEditingReligion((r) =>
                  r ? { ...r, holySymbol: e.target.value } : r,
                )
              }
              placeholder="e.g. A golden sun disc"
              data-ocid="world.religion.holy_symbol.input"
            />
          </FieldGroup>
          <FieldGroup label="Description">
            <textarea
              className="ds-input"
              rows={3}
              value={editingReligion.description}
              onChange={(e) =>
                setEditingReligion((r) =>
                  r ? { ...r, description: e.target.value } : r,
                )
              }
              placeholder="Overview of the religion, its followers, practices…"
              data-ocid="world.religion.description.textarea"
            />
          </FieldGroup>
          <FieldGroup label="Pantheon Notes">
            <textarea
              className="ds-input"
              rows={2}
              value={editingReligion.pantheonNotes}
              onChange={(e) =>
                setEditingReligion((r) =>
                  r ? { ...r, pantheonNotes: e.target.value } : r,
                )
              }
              placeholder="Relationships between deities, creation myths…"
              data-ocid="world.religion.pantheon.textarea"
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
              onClick={() => setEditingReligion(null)}
              data-ocid="world.religion.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ds-btn-primary"
              onClick={saveReligion}
              disabled={saving}
              data-ocid="world.religion.save_button"
            >
              {saving ? "Saving…" : "Save Religion"}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Deity editor modal */}
      {deityModal !== null && (
        <DeityModal
          initial={deityModal.deity ?? blankDeity()}
          isNew={deityModal.deity === null}
          saving={saving}
          onSave={saveDeity}
          onClose={() => setDeityModal(null)}
        />
      )}
    </div>
  );
}

function DeityModal({
  initial,
  isNew,
  saving,
  onSave,
  onClose,
}: {
  initial: Deity;
  isNew: boolean;
  saving: boolean;
  onSave: (d: Deity) => void;
  onClose: () => void;
}) {
  const [deity, setDeity] = useState<Deity>(initial);
  const setField = (k: keyof Deity, v: string) =>
    setDeity((d) => ({ ...d, [k]: v }));
  return (
    <ModalOverlay
      title={isNew ? "Add Deity" : "Edit Deity"}
      onClose={onClose}
      ocid="world.deity.dialog"
    >
      <FieldGroup label="Deity Name">
        <input
          className="ds-input"
          value={deity.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Pelor"
          data-ocid="world.deity.name.input"
        />
      </FieldGroup>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FieldGroup label="Alignment">
          <select
            className="ds-input"
            value={deity.alignment}
            onChange={(e) => setField("alignment", e.target.value)}
            data-ocid="world.deity.alignment.select"
          >
            {ALIGNMENTS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup label="Portfolio">
          <input
            className="ds-input"
            value={deity.portfolio}
            onChange={(e) => setField("portfolio", e.target.value)}
            placeholder="e.g. Sun, Healing"
            data-ocid="world.deity.portfolio.input"
          />
        </FieldGroup>
      </div>
      <FieldGroup label="Description">
        <textarea
          className="ds-input"
          rows={3}
          value={deity.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Myths, appearance, worship practices…"
          data-ocid="world.deity.description.textarea"
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
          onClick={onClose}
          data-ocid="world.deity.cancel_button"
        >
          Cancel
        </button>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => onSave(deity)}
          disabled={saving}
          data-ocid="world.deity.save_button"
        >
          {saving ? "Saving…" : "Save Deity"}
        </button>
      </div>
    </ModalOverlay>
  );
}

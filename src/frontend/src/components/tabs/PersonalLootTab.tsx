import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DndBackend, PersonalLootEntry } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const LOOT_TYPES = [
  "Gold",
  "Item",
  "Magic",
  "Supplies",
  "Information",
  "Other",
];

const LOOT_COLORS: Record<string, string> = {
  Gold: "#FFD700",
  Item: "#4a9eca",
  Magic: "#ce93d8",
  Supplies: "#a5d6a7",
  Information: "#80cbc4",
  Other: "#90a4ae",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type FormState = Omit<PersonalLootEntry, "id" | "characterId" | "owner">;

const emptyForm = (): FormState => ({
  name: "",
  quantity: 1n,
  lootType: "Item",
  source: "",
  dateAcquired: "",
  value: 0n,
  kept: true,
  notes: "",
});

export default function PersonalLootTab({ actor, characterId }: Props) {
  const [entries, setEntries] = useState<PersonalLootEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterKept, setFilterKept] = useState("All");
  const nameRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getPersonalLoot(characterId);
      setEntries(data ?? []);
    } catch (e) {
      console.error("Failed to load personal loot:", e);
      setEntries([]);
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

  const openEdit = (entry: PersonalLootEntry) => {
    setEditingId(entry.id);
    setForm({
      name: entry.name,
      quantity: entry.quantity,
      lootType: entry.lootType,
      source: entry.source,
      dateAcquired: entry.dateAcquired,
      value: entry.value,
      kept: entry.kept,
      notes: entry.notes,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const entry: PersonalLootEntry = {
          id: editingId,
          characterId,
          owner: Principal.anonymous(),
          ...form,
        };
        await actor.updatePersonalLootEntry(editingId, entry);
        setEntries((prev) => prev.map((e) => (e.id === editingId ? entry : e)));
      } else {
        const entry: PersonalLootEntry = {
          id: makeId(),
          characterId,
          owner: Principal.anonymous(),
          ...form,
        };
        await actor.addPersonalLootEntry(characterId, entry);
        setEntries((prev) => [...prev, entry]);
      }
      setShowForm(false);
    } catch (e) {
      console.error("Failed to save loot entry:", e);
      alert(`Failed to save loot entry: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this loot entry?")) return;
    try {
      await actor.deletePersonalLootEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error("Failed to delete loot entry:", e);
      alert(`Failed to delete loot entry: ${String(e)}`);
    }
  };

  const f = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const totalValue = entries
    .filter((e) => e.kept)
    .reduce((sum, e) => sum + e.value * e.quantity, 0n);

  const filtered = entries.filter((e) => {
    const matchType = filterType === "All" || e.lootType === filterType;
    const matchKept =
      filterKept === "All" || (filterKept === "Kept" ? e.kept : !e.kept);
    return matchType && matchKept;
  });

  return (
    <div>
      {/* Summary */}
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
            Total Kept Value
          </span>
          <span
            style={{ color: "var(--ds-gold)", fontWeight: 700, fontSize: 18 }}
          >
            {totalValue.toString()} gp
          </span>
        </div>
        <div
          style={{ width: 1, height: 36, backgroundColor: "var(--ds-border)" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "var(--ds-muted)",
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            Total Entries
          </span>
          <span
            style={{ color: "var(--ds-text)", fontWeight: 600, fontSize: 16 }}
          >
            {entries.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "var(--ds-muted)",
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            Kept
          </span>
          <span style={{ color: "#4caf50", fontWeight: 600, fontSize: 16 }}>
            {entries.filter((e) => e.kept).length}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...LOOT_TYPES].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid var(--ds-border)",
                backgroundColor:
                  filterType === t ? "var(--ds-maroon)" : "transparent",
                color:
                  filterType === t
                    ? "#F2E9DB"
                    : (LOOT_COLORS[t] ?? "var(--ds-muted)"),
                cursor: "pointer",
                fontSize: 12,
              }}
              data-ocid={`loot.filter.${t.toLowerCase()}.tab`}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <select
            className="ds-input"
            value={filterKept}
            onChange={(e) => setFilterKept(e.target.value)}
            style={{ fontSize: 12, padding: "4px 8px" }}
            data-ocid="loot.kept.select"
          >
            <option value="All">All</option>
            <option value="Kept">Kept</option>
            <option value="Gone">Sold/Given</option>
          </select>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={openNew}
            style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
            data-ocid="loot.primary_button"
          >
            + Add Loot
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: "var(--ds-muted)" }} data-ocid="loot.loading_state">
          Loading loot...
        </p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="loot.empty_state"
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>💰</div>
          <p>
            {entries.length === 0
              ? "No loot recorded yet. Start looting!"
              : "No entries match your filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              className="ds-card2"
              style={{ padding: "12px 14px", opacity: entry.kept ? 1 : 0.65 }}
              data-ocid={`loot.item.${i + 1}`}
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
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--ds-text)",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {entry.name}
                    </span>
                    <span style={{ color: "var(--ds-muted)", fontSize: 13 }}>
                      ×{entry.quantity.toString()}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 10,
                        backgroundColor: `${LOOT_COLORS[entry.lootType] ?? "#90a4ae"}22`,
                        color: LOOT_COLORS[entry.lootType] ?? "#90a4ae",
                        border: `1px solid ${LOOT_COLORS[entry.lootType] ?? "#90a4ae"}44`,
                      }}
                    >
                      {entry.lootType}
                    </span>
                    {!entry.kept && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 10,
                          backgroundColor: "#78909c22",
                          color: "#78909c",
                          border: "1px solid #78909c44",
                        }}
                      >
                        Sold/Given
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {entry.source && (
                      <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                        From: {entry.source}
                      </span>
                    )}
                    {entry.value > 0n && (
                      <span style={{ color: "var(--ds-gold)", fontSize: 12 }}>
                        Value: {(entry.value * entry.quantity).toString()} gp
                      </span>
                    )}
                    {entry.dateAcquired && (
                      <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                        {entry.dateAcquired}
                      </span>
                    )}
                  </div>
                  {entry.notes && (
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {entry.notes}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "3px 8px" }}
                    onClick={() => openEdit(entry)}
                    data-ocid={`loot.edit_button.${i + 1}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      padding: 4,
                      fontSize: 14,
                    }}
                    data-ocid={`loot.delete_button.${i + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
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
          data-ocid="loot.dialog"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 520,
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
                {editingId ? "Edit Loot" : "Add Loot"}
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
                data-ocid="loot.close_button"
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
                  placeholder="e.g. Longsword +1, 50 gold coins"
                  data-ocid="loot.input"
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
                    value={form.lootType}
                    onChange={(e) => f("lootType", e.target.value)}
                    data-ocid="loot.type.select"
                  >
                    {LOOT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Quantity</span>
                  <input
                    className="ds-input"
                    type="number"
                    min={1}
                    value={form.quantity.toString()}
                    onChange={(e) =>
                      f("quantity", BigInt(e.target.value || "1"))
                    }
                  />
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
                  <span className="ds-label">Value (gp each)</span>
                  <input
                    className="ds-input"
                    type="number"
                    min={0}
                    value={form.value.toString()}
                    onChange={(e) => f("value", BigInt(e.target.value || "0"))}
                  />
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Date Acquired</span>
                  <input
                    className="ds-input"
                    value={form.dateAcquired}
                    onChange={(e) => f("dateAcquired", e.target.value)}
                    placeholder="Session 3, Day 7..."
                  />
                </label>
              </div>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Source</span>
                <input
                  className="ds-input"
                  value={form.source}
                  onChange={(e) => f("source", e.target.value)}
                  placeholder="Dragon hoard, dungeon chest, merchant..."
                />
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: "8px 12px",
                  border: "1px solid var(--ds-border)",
                  borderRadius: 6,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.kept}
                  onChange={(e) => f("kept", e.target.checked)}
                  style={{ width: 16, height: 16 }}
                  data-ocid="loot.kept.checkbox"
                />
                <span className="ds-label" style={{ margin: 0 }}>
                  Kept (uncheck if sold/given away)
                </span>
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
                  data-ocid="loot.textarea"
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
                data-ocid="loot.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
                data-ocid="loot.submit_button"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Loot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

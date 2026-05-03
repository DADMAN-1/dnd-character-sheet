import { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterInjury, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

const INJURY_TYPES = ["Wound", "Condition", "Disease", "Curse", "Other"];
const SEVERITIES = ["Minor", "Moderate", "Severe", "Critical"];
const RECOVERY_STATUSES = ["Active", "Recovering", "Healed", "Chronic"];

const SEVERITY_COLORS: Record<string, string> = {
  Minor: "#4caf50",
  Moderate: "#ff9800",
  Severe: "#ff5722",
  Critical: "#e53935",
};

const RECOVERY_COLORS: Record<string, string> = {
  Active: "#e53935",
  Recovering: "#ff9800",
  Healed: "#4caf50",
  Chronic: "#78909c",
};

const TYPE_COLORS: Record<string, string> = {
  Wound: "#e57373",
  Condition: "#7986cb",
  Disease: "#a5d6a7",
  Curse: "#ce93d8",
  Other: "#90a4ae",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type FormState = Omit<CharacterInjury, "id" | "characterId" | "owner">;

const emptyForm = (): FormState => ({
  injuryName: "",
  injuryType: "Wound",
  severity: "Minor",
  description: "",
  dateReceived: "",
  source: "",
  recoveryStatus: "Active",
  recoveryNotes: "",
  estimatedRecovery: "",
});

export default function InjuryTrackerTab({ actor, characterId }: Props) {
  const [injuries, setInjuries] = useState<CharacterInjury[]>([]);
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
      const data = await actor.getCharacterInjuries(characterId);
      setInjuries(data ?? []);
    } catch (e) {
      console.error("Failed to load injuries:", e);
      setInjuries([]);
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

  const openEdit = (inj: CharacterInjury) => {
    setEditingId(inj.id);
    setForm({
      injuryName: inj.injuryName,
      injuryType: inj.injuryType,
      severity: inj.severity,
      description: inj.description,
      dateReceived: inj.dateReceived,
      source: inj.source,
      recoveryStatus: inj.recoveryStatus,
      recoveryNotes: inj.recoveryNotes,
      estimatedRecovery: inj.estimatedRecovery,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.injuryName.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const inj: CharacterInjury = {
          id: editingId,
          characterId,
          owner: Principal.anonymous(),
          ...form,
        };
        await actor.updateCharacterInjury(editingId, inj);
        setInjuries((prev_) =>
          prev_.map((i) => (i.id === editingId ? inj : i)),
        );
      } else {
        const inj: CharacterInjury = {
          id: makeId(),
          characterId,
          owner: Principal.anonymous(),
          ...form,
        };
        await actor.addCharacterInjury(characterId, inj);
        setInjuries((prev_) => [...prev_, inj]);
      }
      setShowForm(false);
    } catch (e) {
      console.error("Failed to save injury:", e);
      alert(`Failed to save injury: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this injury?")) return;
    try {
      await actor.deleteCharacterInjury(id);
      setInjuries((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error("Failed to delete injury:", e);
      alert(`Failed to delete injury: ${String(e)}`);
    }
  };

  const f = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const active = injuries.filter((i) => i.recoveryStatus === "Active");
  const filtered =
    filterStatus === "All"
      ? injuries
      : injuries.filter((i) => i.recoveryStatus === filterStatus);

  const severityCounts = SEVERITIES.reduce(
    (acc, s) => {
      acc[s] = active.filter((i) => i.severity === s).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      {/* Summary bar */}
      {active.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 16,
            padding: "10px 14px",
            backgroundColor: "var(--ds-surface)",
            border: "1px solid var(--ds-border)",
            borderRadius: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "var(--ds-muted)",
              fontSize: 12,
              alignSelf: "center",
            }}
          >
            Active:
          </span>
          {SEVERITIES.map((s) =>
            severityCounts[s] > 0 ? (
              <span
                key={s}
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 10,
                  backgroundColor: `${SEVERITY_COLORS[s]}22`,
                  color: SEVERITY_COLORS[s],
                  border: `1px solid ${SEVERITY_COLORS[s]}44`,
                }}
              >
                {severityCounts[s]} {s}
              </span>
            ) : null,
          )}
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
          {["All", ...RECOVERY_STATUSES].map((s) => (
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
                    : (RECOVERY_COLORS[s] ?? "var(--ds-muted)"),
                cursor: "pointer",
                fontSize: 12,
              }}
              data-ocid={`injuries.filter.${s.toLowerCase()}.tab`}
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
          data-ocid="injuries.primary_button"
        >
          + Log Injury
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p
          style={{ color: "var(--ds-muted)" }}
          data-ocid="injuries.loading_state"
        >
          Loading injuries...
        </p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--ds-muted)",
          }}
          data-ocid="injuries.empty_state"
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🩹</div>
          <p>
            {filterStatus === "All"
              ? "No injuries recorded. Stay healthy!"
              : `No ${filterStatus} injuries.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((inj, i) => {
            const isExpanded = expandedId === inj.id;
            return (
              <div
                key={inj.id}
                className="ds-card2"
                style={{ overflow: "hidden" }}
                data-ocid={`injuries.item.${i + 1}`}
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
                  onClick={() => setExpandedId(isExpanded ? null : inj.id)}
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
                      {inj.injuryName}
                    </span>
                    <Badge
                      text={inj.injuryType}
                      color={TYPE_COLORS[inj.injuryType] ?? "var(--ds-muted)"}
                    />
                    <Badge
                      text={inj.severity}
                      color={SEVERITY_COLORS[inj.severity] ?? "var(--ds-muted)"}
                    />
                    <Badge
                      text={inj.recoveryStatus}
                      color={
                        RECOVERY_COLORS[inj.recoveryStatus] ?? "var(--ds-muted)"
                      }
                    />
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
                        openEdit(inj);
                      }}
                      data-ocid={`injuries.edit_button.${i + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(inj.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        padding: 4,
                        fontSize: 14,
                      }}
                      data-ocid={`injuries.delete_button.${i + 1}`}
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
                    {inj.source && (
                      <FieldRow label="Source" value={inj.source} />
                    )}
                    {inj.dateReceived && (
                      <FieldRow
                        label="Date Received"
                        value={inj.dateReceived}
                      />
                    )}
                    {inj.description && (
                      <FieldRow
                        label="Description"
                        value={inj.description}
                        multiline
                      />
                    )}
                    {inj.estimatedRecovery && (
                      <FieldRow
                        label="Estimated Recovery"
                        value={inj.estimatedRecovery}
                      />
                    )}
                    {inj.recoveryNotes && (
                      <FieldRow
                        label="Recovery Notes"
                        value={inj.recoveryNotes}
                        multiline
                      />
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
          data-ocid="injuries.dialog"
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
                {editingId ? "Edit Injury" : "Log Injury"}
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
                data-ocid="injuries.close_button"
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormField label="Injury Name *">
                <input
                  ref={nameRef}
                  className="ds-input"
                  value={form.injuryName}
                  onChange={(e) => f("injuryName", e.target.value)}
                  placeholder="e.g. Arrow wound, Poisoned"
                  data-ocid="injuries.input"
                />
              </FormField>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <FormField label="Type">
                  <select
                    className="ds-input"
                    value={form.injuryType}
                    onChange={(e) => f("injuryType", e.target.value)}
                    data-ocid="injuries.type.select"
                  >
                    {INJURY_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Severity">
                  <select
                    className="ds-input"
                    value={form.severity}
                    onChange={(e) => f("severity", e.target.value)}
                    data-ocid="injuries.severity.select"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <FormField label="Date Received">
                  <input
                    className="ds-input"
                    value={form.dateReceived}
                    onChange={(e) => f("dateReceived", e.target.value)}
                    placeholder="Session 5, Day 12..."
                  />
                </FormField>
                <FormField label="Source">
                  <input
                    className="ds-input"
                    value={form.source}
                    onChange={(e) => f("source", e.target.value)}
                    placeholder="Dragon bite, trap..."
                  />
                </FormField>
              </div>
              <FormField label="Description">
                <textarea
                  className="ds-input"
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="Describe the injury..."
                  data-ocid="injuries.textarea"
                />
              </FormField>
              <FormField label="Recovery Status">
                <select
                  className="ds-input"
                  value={form.recoveryStatus}
                  onChange={(e) => f("recoveryStatus", e.target.value)}
                  data-ocid="injuries.status.select"
                >
                  {RECOVERY_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Estimated Recovery">
                <input
                  className="ds-input"
                  value={form.estimatedRecovery}
                  onChange={(e) => f("estimatedRecovery", e.target.value)}
                  placeholder="2 days rest, after long rest..."
                />
              </FormField>
              <FormField label="Recovery Notes">
                <textarea
                  className="ds-input"
                  value={form.recoveryNotes}
                  onChange={(e) => f("recoveryNotes", e.target.value)}
                  rows={2}
                  style={{ resize: "vertical" }}
                  placeholder="Treatment notes..."
                />
              </FormField>
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
                data-ocid="injuries.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.injuryName.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
                data-ocid="injuries.submit_button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Log Injury"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 7px",
        borderRadius: 10,
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function FormField({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="ds-label">{label}</span>
      {children}
    </div>
  );
}

function FieldRow({
  label,
  value,
  multiline,
}: { label: string; value: string; multiline?: boolean }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          color: "var(--ds-muted)",
          fontSize: 11,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p
        style={{
          color: "var(--ds-text)",
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: multiline ? "pre-wrap" : "normal",
        }}
      >
        {value}
      </p>
    </div>
  );
}

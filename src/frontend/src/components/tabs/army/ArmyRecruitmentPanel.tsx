import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../../../components/ErrorBoundary";
import type { ArmyBranch, DndBackend, RecruitmentEntry } from "../../../types";
import { uid } from "./armyHelpers";

interface Props {
  actor: DndBackend;
  armyId: string;
  branches?: ArmyBranch[];
  onBranchesUpdate?: (branches: ArmyBranch[]) => void;
  onRestartConnection?: () => void;
}

const METHODS = ["Volunteer", "Conscription", "Mercenary", "Captured", "Other"];

const emptyForm = (): Omit<RecruitmentEntry, "id"> => ({
  date: "",
  location: "",
  amount: 0n,
  method: "Volunteer",
  notes: "",
});

export default function ArmyRecruitmentPanel({
  actor,
  armyId,
  branches,
  onBranchesUpdate,
  onRestartConnection,
}: Props) {
  const [log, setLog] = useState<RecruitmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [branchConfirm, setBranchConfirm] = useState<{
    branchId: string;
    amount: bigint;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getRecruitmentLog(armyId);
      setLog(data ?? []);
    } catch (e) {
      console.error(e);
      if (isCanisterStopped(e)) setCanisterStopped(true);
    }
    setLoading(false);
  }, [actor, armyId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    setSaving(true);
    setError(null);
    try {
      const entry = { ...form, id: uid() };
      await actor.addRecruitmentEntry(armyId, entry);
      setForm(emptyForm());
      setAdding(false);
      await load();
      // Prompt to update branch headcount if branches exist
      if (branches && branches.length > 0 && Number(entry.amount) > 0) {
        setBranchConfirm({ branchId: "", amount: entry.amount });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await actor.deleteRecruitmentEntry(armyId, id);
      await load();
    } catch (e) {
      console.error(e);
      alert(`Failed to delete recruitment entry: ${String(e)}`);
    }
  };

  const applyBranchHeadcount = () => {
    if (!branchConfirm || !branches || !onBranchesUpdate) return;
    const updated = branches.map((b) =>
      b.id === branchConfirm.branchId
        ? { ...b, headcount: b.headcount + branchConfirm.amount }
        : b,
    );
    onBranchesUpdate(updated);
    setBranchConfirm(null);
  };

  const totalRecruits = log.reduce((sum, e) => sum + Number(e.amount), 0);

  if (loading) {
    return (
      <p
        style={{ color: "var(--ds-muted)", fontSize: 13 }}
        data-ocid="army.recruitment.loading_state"
      >
        Loading recruitment log…
      </p>
    );
  }

  if (canisterStopped) {
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Branch headcount confirm */}
      {branchConfirm && branches && branches.length > 0 && (
        <div
          style={{
            background: "rgba(201,163,90,0.1)",
            border: "1px solid var(--ds-gold)",
            borderRadius: 8,
            padding: "12px 16px",
          }}
          data-ocid="army.recruitment.branch_confirm"
        >
          <p style={{ fontSize: 13, color: "var(--ds-text)", marginBottom: 8 }}>
            Add {Number(branchConfirm.amount)} recruits to a branch?
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              className="ds-input"
              style={{ fontSize: 12, flex: 1, maxWidth: 220 }}
              value={branchConfirm.branchId}
              onChange={(e) =>
                setBranchConfirm((b) =>
                  b ? { ...b, branchId: e.target.value } : b,
                )
              }
              data-ocid="army.recruitment.branch.select"
            >
              <option value="">— Select branch —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({Number(b.headcount).toLocaleString()} troops)
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={applyBranchHeadcount}
              disabled={!branchConfirm.branchId}
              data-ocid="army.recruitment.branch_confirm.confirm_button"
            >
              Apply
            </button>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={() => setBranchConfirm(null)}
              data-ocid="army.recruitment.branch_confirm.cancel_button"
            >
              Skip
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15 }}
        >
          Recruitment Log
        </span>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setAdding(true)}
          data-ocid="army.recruitment.open_modal_button"
        >
          + Add Entry
        </button>
      </div>

      {/* Running total */}
      {log.length > 0 && (
        <div
          className="ds-card2"
          style={{
            padding: "10px 14px",
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "var(--ds-muted)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Total Recruited
            </div>
            <div
              style={{ color: "var(--ds-gold)", fontSize: 20, fontWeight: 700 }}
            >
              {totalRecruits.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "var(--ds-muted)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Entries
            </div>
            <div
              style={{ color: "var(--ds-text)", fontSize: 20, fontWeight: 700 }}
            >
              {log.length}
            </div>
          </div>
        </div>
      )}

      {adding && (
        <div
          className="ds-card2"
          style={{
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <div>
              <label htmlFor="rec-date" className="ds-label">
                Date
              </label>
              <input
                id="rec-date"
                className="ds-input"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date / campaign day"
                style={{ fontSize: 13 }}
                data-ocid="army.recruitment.date.input"
              />
            </div>
            <div>
              <label htmlFor="rec-location" className="ds-label">
                Location
              </label>
              <input
                id="rec-location"
                className="ds-input"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="City, region…"
                style={{ fontSize: 13 }}
                data-ocid="army.recruitment.location.input"
              />
            </div>
            <div>
              <label htmlFor="rec-amount" className="ds-label">
                Recruits
              </label>
              <input
                id="rec-amount"
                className="ds-input"
                type="number"
                min={0}
                value={form.amount.toString()}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="0"
                style={{ fontSize: 13 }}
                data-ocid="army.recruitment.amount.input"
              />
            </div>
            <div>
              <label htmlFor="rec-method" className="ds-label">
                Method
              </label>
              <select
                id="rec-method"
                className="ds-input"
                value={form.method}
                onChange={(e) =>
                  setForm((f) => ({ ...f, method: e.target.value }))
                }
                style={{ fontSize: 13 }}
                data-ocid="army.recruitment.method.select"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            className="ds-input"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes on this recruitment drive…"
            style={{ fontSize: 13, resize: "vertical" }}
            data-ocid="army.recruitment.notes.textarea"
          />
          {error && (
            <span
              style={{ color: "#c0392b", fontSize: 12 }}
              data-ocid="army.recruitment.error_state"
            >
              {error}
            </span>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={handleAdd}
              disabled={saving}
              data-ocid="army.recruitment.submit_button"
            >
              {saving ? "Saving…" : "Add Entry"}
            </button>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={() => {
                setAdding(false);
                setForm(emptyForm());
                setError(null);
              }}
              data-ocid="army.recruitment.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {log.length === 0 && !adding && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--ds-muted)",
            fontSize: 13,
          }}
          data-ocid="army.recruitment.empty_state"
        >
          No recruitment entries yet. Track how and where your army was built.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {log.map((entry, idx) => (
          <div
            key={entry.id}
            className="ds-card2"
            style={{
              padding: "10px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
            }}
            data-ocid={`army.recruitment.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "var(--ds-gold)",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  +{Number(entry.amount).toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "1px 7px",
                    borderRadius: 10,
                    background: "var(--ds-surface)",
                    color: "var(--ds-muted)",
                    border: "1px solid var(--ds-border)",
                  }}
                >
                  {entry.method}
                </span>
                {entry.location && (
                  <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                    📍 {entry.location}
                  </span>
                )}
                {entry.date && (
                  <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                    {entry.date}
                  </span>
                )}
              </div>
              {entry.notes && (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 12,
                    margin: "4px 0 0",
                  }}
                >
                  {entry.notes}
                </p>
              )}
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{
                fontSize: 11,
                padding: "2px 6px",
                color: "#c0392b",
                flexShrink: 0,
              }}
              onClick={() => handleDelete(entry.id)}
              data-ocid={`army.recruitment.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

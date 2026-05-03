import { useState } from "react";
import type { ArmyLogistics, CasualtyEntry, SupplyLine } from "../../../types";
import { uid } from "./armyHelpers";

interface Props {
  logistics: ArmyLogistics;
  onChange: (logistics: ArmyLogistics) => void;
}

export default function ArmyLogisticsPanel({ logistics, onChange }: Props) {
  // Defensive: ensure nested arrays exist even if backend returned partial object
  const safeLog: ArmyLogistics = {
    ...logistics,
    supplyLines: logistics.supplyLines ?? [],
    casualtiesLog: logistics.casualtiesLog ?? [],
    injuryNotes: logistics.injuryNotes ?? "",
  };
  const [addingSupply, setAddingSupply] = useState(false);
  const [supplyForm, setSupplyForm] = useState<Omit<SupplyLine, "id">>({
    route: "",
    vulnerabilities: "",
    notes: "",
  });
  const [addingCasualty, setAddingCasualty] = useState(false);
  const [casualtyForm, setCasualtyForm] = useState<Omit<CasualtyEntry, "id">>({
    branchName: "",
    troopLosses: 0n,
    woundedOfficers: 0n,
    date: "",
    notes: "",
  });

  const update = (updates: Partial<ArmyLogistics>) =>
    onChange({ ...safeLog, ...updates });

  const addSupply = () => {
    if (!supplyForm.route.trim()) return;
    update({
      supplyLines: [...safeLog.supplyLines, { ...supplyForm, id: uid() }],
    });
    setSupplyForm({ route: "", vulnerabilities: "", notes: "" });
    setAddingSupply(false);
  };

  const removeSupply = (id: string) => {
    update({ supplyLines: safeLog.supplyLines.filter((s) => s.id !== id) });
  };

  const addCasualty = () => {
    if (!casualtyForm.branchName.trim()) return;
    update({
      casualtiesLog: [...safeLog.casualtiesLog, { ...casualtyForm, id: uid() }],
    });
    setCasualtyForm({
      branchName: "",
      troopLosses: 0n,
      woundedOfficers: 0n,
      date: "",
      notes: "",
    });
    setAddingCasualty(false);
  };

  const removeCasualty = (id: string) => {
    update({
      casualtiesLog: safeLog.casualtiesLog.filter((c) => c.id !== id),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <span
          className="font-cinzel"
          style={{
            color: "var(--ds-gold)",
            fontSize: 14,
            display: "block",
            marginBottom: 10,
          }}
        >
          Resources
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <div>
            <label htmlFor="log-food" className="ds-label">
              Food Supplies
            </label>
            <input
              id="log-food"
              className="ds-input"
              type="number"
              value={safeLog.food.toString()}
              onChange={(e) => update({ food: BigInt(e.target.value || 0) })}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="log-ammo" className="ds-label">
              Ammunition
            </label>
            <input
              id="log-ammo"
              className="ds-input"
              type="number"
              value={safeLog.ammunition.toString()}
              onChange={(e) =>
                update({ ammunition: BigInt(e.target.value || 0) })
              }
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="log-gold" className="ds-label">
              Gold Reserves
            </label>
            <input
              id="log-gold"
              className="ds-input"
              type="number"
              value={safeLog.goldReserves.toString()}
              onChange={(e) =>
                update({ goldReserves: BigInt(e.target.value || 0) })
              }
              placeholder="0"
            />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <label htmlFor="log-injury" className="ds-label">
            Injury Notes
          </label>
          <textarea
            id="log-injury"
            className="ds-input"
            rows={2}
            value={safeLog.injuryNotes}
            onChange={(e) => update({ injuryNotes: e.target.value })}
            placeholder="Notable injuries, medical status…"
            style={{ resize: "vertical" }}
          />
        </div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14 }}
          >
            Supply Lines
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingSupply(true)}
            data-ocid="army.logistics.supply.open_modal_button"
          >
            + Add
          </button>
        </div>
        {safeLog.supplyLines.length === 0 && !addingSupply && (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No supply lines tracked.
          </p>
        )}
        {safeLog.supplyLines.map((sl, idx) => (
          <div
            key={sl.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
            data-ocid={`army.supply_line.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ds-text)",
                  fontSize: 13,
                }}
              >
                {sl.route}
              </div>
              {sl.vulnerabilities && (
                <div style={{ color: "#e67e22", fontSize: 12 }}>
                  ⚠ {sl.vulnerabilities}
                </div>
              )}
              {sl.notes && (
                <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  {sl.notes}
                </div>
              )}
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
              onClick={() => removeSupply(sl.id)}
              data-ocid={`army.supply_line.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {addingSupply && (
          <div
            className="ds-card2"
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <input
              className="ds-input"
              value={supplyForm.route}
              onChange={(e) =>
                setSupplyForm((f) => ({ ...f, route: e.target.value }))
              }
              placeholder="Route description *"
              style={{ fontSize: 13 }}
              data-ocid="army.logistics.supply.route.input"
            />
            <input
              className="ds-input"
              value={supplyForm.vulnerabilities}
              onChange={(e) =>
                setSupplyForm((f) => ({
                  ...f,
                  vulnerabilities: e.target.value,
                }))
              }
              placeholder="Vulnerabilities"
              style={{ fontSize: 12 }}
            />
            <input
              className="ds-input"
              value={supplyForm.notes}
              onChange={(e) =>
                setSupplyForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Notes"
              style={{ fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addSupply}
                data-ocid="army.logistics.supply.submit_button"
              >
                Add
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => setAddingSupply(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14 }}
          >
            Casualties Log
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingCasualty(true)}
            data-ocid="army.logistics.casualty.open_modal_button"
          >
            + Add Entry
          </button>
        </div>
        {safeLog.casualtiesLog.length === 0 && !addingCasualty && (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No casualties logged.
          </p>
        )}
        {safeLog.casualtiesLog.map((c, idx) => (
          <div
            key={c.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
            data-ocid={`army.casualty.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ds-text)",
                  fontSize: 13,
                }}
              >
                {c.branchName} {c.date && `· ${c.date}`}
              </div>
              <div style={{ color: "#e74c3c", fontSize: 12 }}>
                {c.troopLosses.toString()} troops lost ·{" "}
                {c.woundedOfficers.toString()} officers wounded
              </div>
              {c.notes && (
                <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  {c.notes}
                </div>
              )}
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
              onClick={() => removeCasualty(c.id)}
              data-ocid={`army.casualty.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {addingCasualty && (
          <div
            className="ds-card2"
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 6,
              }}
            >
              <input
                className="ds-input"
                value={casualtyForm.branchName}
                onChange={(e) =>
                  setCasualtyForm((f) => ({ ...f, branchName: e.target.value }))
                }
                placeholder="Branch *"
                style={{ fontSize: 13 }}
                data-ocid="army.logistics.casualty.branch.input"
              />
              <input
                className="ds-input"
                type="number"
                value={casualtyForm.troopLosses.toString()}
                onChange={(e) =>
                  setCasualtyForm((f) => ({
                    ...f,
                    troopLosses: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="Troop losses"
                style={{ fontSize: 13 }}
              />
              <input
                className="ds-input"
                type="number"
                value={casualtyForm.woundedOfficers.toString()}
                onChange={(e) =>
                  setCasualtyForm((f) => ({
                    ...f,
                    woundedOfficers: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="Officers wounded"
                style={{ fontSize: 13 }}
              />
              <input
                className="ds-input"
                value={casualtyForm.date}
                onChange={(e) =>
                  setCasualtyForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date"
                style={{ fontSize: 13 }}
              />
            </div>
            <input
              className="ds-input"
              value={casualtyForm.notes}
              onChange={(e) =>
                setCasualtyForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Notes"
              style={{ fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addCasualty}
                data-ocid="army.logistics.casualty.submit_button"
              >
                Add
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => setAddingCasualty(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

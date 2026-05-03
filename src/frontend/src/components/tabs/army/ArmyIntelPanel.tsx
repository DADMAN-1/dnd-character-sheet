import { useState } from "react";
import type {
  ArmyIntelligence,
  ArmyMoraleData,
  EnemyIntelEntry,
  LoyaltyEntry,
  MoraleEvent,
  ScoutReport,
} from "../../../types";
import { uid } from "./armyHelpers";

interface IntelProps {
  intelligence: ArmyIntelligence;
  onChange: (intel: ArmyIntelligence) => void;
}

export function ArmyIntelPanel({ intelligence, onChange }: IntelProps) {
  // Defensive: ensure nested arrays exist even if backend returned partial object
  const intel: ArmyIntelligence = {
    ...intelligence,
    enemyIntelLog: intelligence.enemyIntelLog ?? [],
    scoutReports: intelligence.scoutReports ?? [],
  };
  const [addingEnemy, setAddingEnemy] = useState(false);
  const [enemyForm, setEnemyForm] = useState<Omit<EnemyIntelEntry, "id">>({
    enemyName: "",
    knownStrength: "",
    weaknesses: "",
    notes: "",
    date: "",
  });
  const [addingScout, setAddingScout] = useState(false);
  const [scoutForm, setScoutForm] = useState<Omit<ScoutReport, "id">>({
    area: "",
    findings: "",
    date: "",
  });

  const addEnemy = () => {
    if (!enemyForm.enemyName.trim()) return;
    onChange({
      ...intel,
      enemyIntelLog: [...intel.enemyIntelLog, { ...enemyForm, id: uid() }],
    });
    setEnemyForm({
      enemyName: "",
      knownStrength: "",
      weaknesses: "",
      notes: "",
      date: "",
    });
    setAddingEnemy(false);
  };

  const addScout = () => {
    if (!scoutForm.area.trim()) return;
    onChange({
      ...intel,
      scoutReports: [...intel.scoutReports, { ...scoutForm, id: uid() }],
    });
    setScoutForm({ area: "", findings: "", date: "" });
    setAddingScout(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
            Enemy Intel
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingEnemy(true)}
            data-ocid="army.intel.enemy.open_modal_button"
          >
            + Add
          </button>
        </div>
        {intel.enemyIntelLog.length === 0 && !addingEnemy && (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No enemy intelligence logged.
          </p>
        )}
        {intel.enemyIntelLog.map((e, idx) => (
          <div
            key={e.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
            data-ocid={`army.enemy_intel.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ds-text)",
                  fontSize: 13,
                }}
              >
                {e.enemyName} {e.date && `· ${e.date}`}
              </div>
              {e.knownStrength && (
                <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  Strength: {e.knownStrength}
                </div>
              )}
              {e.weaknesses && (
                <div style={{ color: "#e67e22", fontSize: 12 }}>
                  Weaknesses: {e.weaknesses}
                </div>
              )}
              {e.notes && (
                <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  {e.notes}
                </div>
              )}
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
              onClick={() =>
                onChange({
                  ...intel,
                  enemyIntelLog: intel.enemyIntelLog.filter(
                    (x) => x.id !== e.id,
                  ),
                })
              }
              data-ocid={`army.enemy_intel.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {addingEnemy && (
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
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 6,
              }}
            >
              <input
                className="ds-input"
                value={enemyForm.enemyName}
                onChange={(e) =>
                  setEnemyForm((f) => ({ ...f, enemyName: e.target.value }))
                }
                placeholder="Enemy name *"
                style={{ fontSize: 13 }}
              />
              <input
                className="ds-input"
                value={enemyForm.knownStrength}
                onChange={(e) =>
                  setEnemyForm((f) => ({ ...f, knownStrength: e.target.value }))
                }
                placeholder="Known strength"
                style={{ fontSize: 13 }}
              />
              <input
                className="ds-input"
                value={enemyForm.date}
                onChange={(e) =>
                  setEnemyForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date"
                style={{ fontSize: 13 }}
              />
            </div>
            <input
              className="ds-input"
              value={enemyForm.weaknesses}
              onChange={(e) =>
                setEnemyForm((f) => ({ ...f, weaknesses: e.target.value }))
              }
              placeholder="Known weaknesses"
              style={{ fontSize: 12 }}
            />
            <textarea
              className="ds-input"
              rows={2}
              value={enemyForm.notes}
              onChange={(e) =>
                setEnemyForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Intelligence notes…"
              style={{ resize: "vertical", fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addEnemy}
                data-ocid="army.intel.enemy.submit_button"
              >
                Add
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => setAddingEnemy(false)}
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
            Scout Reports
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingScout(true)}
            data-ocid="army.intel.scout.open_modal_button"
          >
            + Add
          </button>
        </div>
        {intel.scoutReports.length === 0 && !addingScout && (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No scout reports filed.
          </p>
        )}
        {intel.scoutReports.map((sr, idx) => (
          <div
            key={sr.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
            data-ocid={`army.scout_report.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ds-text)",
                  fontSize: 13,
                }}
              >
                {sr.area} {sr.date && `· ${sr.date}`}
              </div>
              {sr.findings && (
                <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  {sr.findings}
                </div>
              )}
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
              onClick={() =>
                onChange({
                  ...intel,
                  scoutReports: intel.scoutReports.filter(
                    (x) => x.id !== sr.id,
                  ),
                })
              }
              data-ocid={`army.scout_report.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {addingScout && (
          <div
            className="ds-card2"
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="ds-input"
                value={scoutForm.area}
                onChange={(e) =>
                  setScoutForm((f) => ({ ...f, area: e.target.value }))
                }
                placeholder="Area scouted *"
                style={{ flex: 2, fontSize: 13 }}
              />
              <input
                className="ds-input"
                value={scoutForm.date}
                onChange={(e) =>
                  setScoutForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date"
                style={{ flex: 1, fontSize: 13 }}
              />
            </div>
            <textarea
              className="ds-input"
              rows={2}
              value={scoutForm.findings}
              onChange={(e) =>
                setScoutForm((f) => ({ ...f, findings: e.target.value }))
              }
              placeholder="Findings and notes…"
              style={{ resize: "vertical", fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addScout}
                data-ocid="army.intel.scout.submit_button"
              >
                Add
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => setAddingScout(false)}
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

interface MoraleProps {
  moraleData: ArmyMoraleData;
  onChange: (data: ArmyMoraleData) => void;
}

export function ArmyMoralePanel({ moraleData, onChange }: MoraleProps) {
  // Defensive: ensure nested arrays exist even if backend returned partial object
  const safeData: ArmyMoraleData = {
    ...moraleData,
    moraleEventsLog: moraleData.moraleEventsLog ?? [],
    loyaltyTracker: moraleData.loyaltyTracker ?? [],
  };
  const [addingEvent, setAddingEvent] = useState(false);
  const [eventForm, setEventForm] = useState<Omit<MoraleEvent, "id">>({
    event: "",
    impact: "",
    date: "",
  });
  const [addingLoyalty, setAddingLoyalty] = useState(false);
  const [loyaltyForm, setLoyaltyForm] = useState<Omit<LoyaltyEntry, "id">>({
    entityName: "",
    loyaltyScore: 50n,
    notes: "",
  });

  const addEvent = () => {
    if (!eventForm.event.trim()) return;
    onChange({
      ...safeData,
      moraleEventsLog: [
        ...safeData.moraleEventsLog,
        { ...eventForm, id: uid() },
      ],
    });
    setEventForm({ event: "", impact: "", date: "" });
    setAddingEvent(false);
  };

  const addLoyalty = () => {
    if (!loyaltyForm.entityName.trim()) return;
    onChange({
      ...safeData,
      loyaltyTracker: [
        ...safeData.loyaltyTracker,
        { ...loyaltyForm, id: uid() },
      ],
    });
    setLoyaltyForm({ entityName: "", loyaltyScore: 50n, notes: "" });
    setAddingLoyalty(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
            Morale Events
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingEvent(true)}
            data-ocid="army.morale.event.open_modal_button"
          >
            + Add
          </button>
        </div>
        {safeData.moraleEventsLog.length === 0 && !addingEvent && (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No morale events recorded.
          </p>
        )}
        {safeData.moraleEventsLog.map((me, idx) => (
          <div
            key={me.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
            data-ocid={`army.morale_event.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ds-text)",
                  fontSize: 13,
                }}
              >
                {me.event} {me.date && `· ${me.date}`}
              </div>
              {me.impact && (
                <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  Impact: {me.impact}
                </div>
              )}
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
              onClick={() =>
                onChange({
                  ...safeData,
                  moraleEventsLog: safeData.moraleEventsLog.filter(
                    (x) => x.id !== me.id,
                  ),
                })
              }
              data-ocid={`army.morale_event.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {addingEvent && (
          <div
            className="ds-card2"
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="ds-input"
                value={eventForm.event}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, event: e.target.value }))
                }
                placeholder="Event description *"
                style={{ flex: 2, fontSize: 13 }}
              />
              <input
                className="ds-input"
                value={eventForm.date}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date"
                style={{ flex: 1, fontSize: 13 }}
              />
            </div>
            <input
              className="ds-input"
              value={eventForm.impact}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, impact: e.target.value }))
              }
              placeholder="Morale impact (positive or negative)"
              style={{ fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addEvent}
                data-ocid="army.morale.event.submit_button"
              >
                Add
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => setAddingEvent(false)}
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
            Loyalty Tracker
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingLoyalty(true)}
            data-ocid="army.loyalty.open_modal_button"
          >
            + Add
          </button>
        </div>
        {safeData.loyaltyTracker.length === 0 && !addingLoyalty && (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            No loyalty entries yet.
          </p>
        )}
        {safeData.loyaltyTracker.map((lt, idx) => (
          <div
            key={lt.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
            data-ocid={`army.loyalty.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ds-text)",
                  fontSize: 13,
                }}
              >
                {lt.entityName}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color:
                    Number(lt.loyaltyScore) >= 70
                      ? "#27ae60"
                      : Number(lt.loyaltyScore) >= 40
                        ? "#f39c12"
                        : "#c0392b",
                }}
              >
                Loyalty: {lt.loyaltyScore.toString()}/100
              </div>
              {lt.notes && (
                <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                  {lt.notes}
                </div>
              )}
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 11, padding: "2px 6px", color: "#c0392b" }}
              onClick={() =>
                onChange({
                  ...safeData,
                  loyaltyTracker: safeData.loyaltyTracker.filter(
                    (x) => x.id !== lt.id,
                  ),
                })
              }
              data-ocid={`army.loyalty.delete_button.${idx + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {addingLoyalty && (
          <div
            className="ds-card2"
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="ds-input"
                value={loyaltyForm.entityName}
                onChange={(e) =>
                  setLoyaltyForm((f) => ({ ...f, entityName: e.target.value }))
                }
                placeholder="Officer/Branch name *"
                style={{ flex: 2, fontSize: 13 }}
              />
              <input
                className="ds-input"
                type="number"
                min={0}
                max={100}
                value={loyaltyForm.loyaltyScore.toString()}
                onChange={(e) =>
                  setLoyaltyForm((f) => ({
                    ...f,
                    loyaltyScore: BigInt(
                      Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                    ),
                  }))
                }
                placeholder="Score (0–100)"
                style={{ flex: 1, fontSize: 13 }}
              />
            </div>
            <input
              className="ds-input"
              value={loyaltyForm.notes}
              onChange={(e) =>
                setLoyaltyForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Notes"
              style={{ fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addLoyalty}
                data-ocid="army.loyalty.submit_button"
              >
                Add
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => setAddingLoyalty(false)}
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

import { useCallback, useEffect, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../../../components/ErrorBoundary";
import type {
  ArmyLogistics,
  DndBackend,
  SupplyConsumptionEntry,
} from "../../../types";
import { uid } from "./armyHelpers";

interface Props {
  actor: DndBackend;
  armyId: string;
  /** Current army troop count for auto-calculation */
  troopCount: bigint;
  siegeMode?: boolean;
  logistics?: ArmyLogistics;
  onLogisticsUpdate?: (logistics: ArmyLogistics) => void;
  onRestartConnection?: () => void;
}

const emptyForm = (): Omit<SupplyConsumptionEntry, "id"> => ({
  date: "",
  foodConsumed: 0n,
  ammoConsumed: 0n,
  notes: "",
});

export default function ArmySupplyConsumptionPanel({
  actor,
  armyId,
  troopCount,
  siegeMode,
  logistics,
  onLogisticsUpdate,
  onRestartConnection,
}: Props) {
  const [log, setLog] = useState<SupplyConsumptionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canisterStopped, setCanisterStopped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actor.getSupplyConsumptionLog(armyId);
      setLog(
        [...(data ?? [])].sort((a, b) =>
          (b.date ?? "").localeCompare(a.date ?? ""),
        ),
      );
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
      await actor.logSupplyConsumption(armyId, { ...form, id: uid() });
      setForm(emptyForm());
      setAdding(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
    setSaving(false);
  };

  const autofill = () => {
    const troops = Number(troopCount);
    // Siege mode doubles consumption
    const foodDivisor = siegeMode ? 5 : 10;
    const ammoDivisor = siegeMode ? 10 : 20;
    const food = BigInt(Math.ceil(troops / foodDivisor));
    const ammo = BigInt(Math.ceil(troops / ammoDivisor));
    const today = new Date().toISOString().split("T")[0] ?? "";
    setForm((f) => ({
      ...f,
      foodConsumed: food,
      ammoConsumed: ammo,
      date: f.date || today,
      notes:
        f.notes ||
        `Auto-calculated for ${troops.toLocaleString()} troops${siegeMode ? " (siege mode)" : ""}`,
    }));
    setAdding(true);
  };

  const advanceOneDay = async () => {
    const troops = Number(troopCount);
    const foodDivisor = siegeMode ? 5 : 10;
    const ammoDivisor = siegeMode ? 10 : 20;
    const food = BigInt(Math.ceil(troops / foodDivisor));
    const ammo = BigInt(Math.ceil(troops / ammoDivisor));
    const today = new Date().toISOString().split("T")[0] ?? "";
    const entry: SupplyConsumptionEntry = {
      id: uid(),
      date: today,
      foodConsumed: food,
      ammoConsumed: ammo,
      notes: `Day advance — ${troops.toLocaleString()} troops${siegeMode ? " (siege mode)" : ""}`,
    };
    setSaving(true);
    setError(null);
    try {
      await actor.logSupplyConsumption(armyId, entry);
      await load();
      // Deduct from logistics if available
      if (logistics && onLogisticsUpdate) {
        const newFood = logistics.food - food;
        const newAmmo = logistics.ammunition - ammo;
        const updatedLogistics = {
          ...logistics,
          food: newFood < 0n ? 0n : newFood,
          ammunition: newAmmo < 0n ? 0n : newAmmo,
        };
        onLogisticsUpdate(updatedLogistics);
        // Warning threshold: < 20% of troops
        const warnThreshold = BigInt(Math.ceil(troops * 0.2));
        if (
          updatedLogistics.food < warnThreshold ||
          updatedLogistics.ammunition < warnThreshold
        ) {
          setError(
            `⚠️ Supply warning: food=${updatedLogistics.food}, ammo=${updatedLogistics.ammunition} (below 20% of troop count)`,
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to advance day");
    }
    setSaving(false);
  };

  const totalFood = log.reduce((s, e) => s + Number(e.foodConsumed), 0);
  const totalAmmo = log.reduce((s, e) => s + Number(e.ammoConsumed), 0);

  if (loading) {
    return (
      <p
        style={{ color: "var(--ds-muted)", fontSize: 13 }}
        data-ocid="army.supply_log.loading_state"
      >
        Loading supply log…
      </p>
    );
  }

  if (canisterStopped) {
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 15 }}
        >
          Supply Consumption Log
          {siegeMode && (
            <span
              style={{
                fontSize: 11,
                color: "#e74c3c",
                marginLeft: 10,
                padding: "1px 6px",
                border: "1px solid #e74c3c",
                borderRadius: 4,
              }}
            >
              🏰 Siege (2×)
            </span>
          )}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={autofill}
            data-ocid="army.supply_log.calculate_button"
          >
            ⚙ Calculate Daily
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontSize: 12 }}
            onClick={advanceOneDay}
            disabled={saving}
            data-ocid="army.supply_log.advance_day_button"
            title="Deduct 1 day of supplies from logistics"
          >
            {saving ? "Advancing…" : "⏱ Advance 1 Day"}
          </button>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAdding(true)}
            data-ocid="army.supply_log.open_modal_button"
          >
            + Log Entry
          </button>
        </div>
      </div>

      {/* Totals summary */}
      {log.length > 0 && (
        <div
          className="ds-card2"
          style={{
            padding: "10px 16px",
            display: "flex",
            gap: 32,
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
              Total Food Consumed
            </div>
            <div style={{ color: "#e67e22", fontSize: 20, fontWeight: 700 }}>
              {totalFood.toLocaleString()}
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
              Total Ammo Consumed
            </div>
            <div style={{ color: "#e74c3c", fontSize: 20, fontWeight: 700 }}>
              {totalAmmo.toLocaleString()}
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
              Log Entries
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
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <div>
              <label htmlFor="sc-date" className="ds-label">
                Date
              </label>
              <input
                id="sc-date"
                className="ds-input"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date / campaign day"
                style={{ fontSize: 13 }}
                data-ocid="army.supply_log.date.input"
              />
            </div>
            <div>
              <label htmlFor="sc-food" className="ds-label">
                Food Consumed
              </label>
              <input
                id="sc-food"
                className="ds-input"
                type="number"
                min={0}
                value={form.foodConsumed.toString()}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    foodConsumed: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="0"
                style={{ fontSize: 13 }}
                data-ocid="army.supply_log.food.input"
              />
            </div>
            <div>
              <label htmlFor="sc-ammo" className="ds-label">
                Ammo Consumed
              </label>
              <input
                id="sc-ammo"
                className="ds-input"
                type="number"
                min={0}
                value={form.ammoConsumed.toString()}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ammoConsumed: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="0"
                style={{ fontSize: 13 }}
                data-ocid="army.supply_log.ammo.input"
              />
            </div>
          </div>
          <textarea
            className="ds-input"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (campaign day, conditions, special events)…"
            style={{ fontSize: 13, resize: "vertical" }}
            data-ocid="army.supply_log.notes.textarea"
          />
          {error && (
            <span
              style={{ color: "#c0392b", fontSize: 12 }}
              data-ocid="army.supply_log.error_state"
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
              data-ocid="army.supply_log.submit_button"
            >
              {saving ? "Saving…" : "Log Entry"}
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
              data-ocid="army.supply_log.cancel_button"
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
          data-ocid="army.supply_log.empty_state"
        >
          No supply entries logged. Use &ldquo;Calculate Daily&rdquo; to
          auto-populate based on your troop count.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {log.map((entry, idx) => (
          <div
            key={entry.id}
            className="ds-card2"
            style={{
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
            }}
            data-ocid={`army.supply_log.item.${idx + 1}`}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {entry.date && (
                  <span
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 11,
                      fontFamily: "Cinzel, serif",
                    }}
                  >
                    {entry.date}
                  </span>
                )}
                <span
                  style={{ color: "#e67e22", fontSize: 13, fontWeight: 600 }}
                >
                  🍞 {Number(entry.foodConsumed).toLocaleString()} food
                </span>
                <span
                  style={{ color: "#e74c3c", fontSize: 13, fontWeight: 600 }}
                >
                  ⚔ {Number(entry.ammoConsumed).toLocaleString()} ammo
                </span>
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
          </div>
        ))}
      </div>
    </div>
  );
}

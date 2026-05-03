import { useCallback, useEffect, useState } from "react";
import type { Character, DndBackend, EquipmentSlot } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
  character?: Character;
  onUpdate?: () => void;
}

const DEFAULT_SLOTS: Omit<EquipmentSlot, "id">[] = [
  { slotName: "Head", itemName: "", notes: "", itemId: undefined },
  { slotName: "Neck / Amulet", itemName: "", notes: "", itemId: undefined },
  { slotName: "Shoulders / Cloak", itemName: "", notes: "", itemId: undefined },
  { slotName: "Chest / Armor", itemName: "", notes: "", itemId: undefined },
  { slotName: "Hands / Gloves", itemName: "", notes: "", itemId: undefined },
  { slotName: "Waist / Belt", itemName: "", notes: "", itemId: undefined },
  { slotName: "Legs", itemName: "", notes: "", itemId: undefined },
  { slotName: "Feet / Boots", itemName: "", notes: "", itemId: undefined },
  { slotName: "Main Hand", itemName: "", notes: "", itemId: undefined },
  { slotName: "Off Hand", itemName: "", notes: "", itemId: undefined },
  { slotName: "Ring (Left)", itemName: "", notes: "", itemId: undefined },
  { slotName: "Ring (Right)", itemName: "", notes: "", itemId: undefined },
];

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function EquipmentTab({
  actor,
  characterId,
  character: _character,
  onUpdate: _onUpdate,
}: Props) {
  const [slots, setSlots] = useState<EquipmentSlot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    itemName: string;
    notes: string;
  }>({ itemName: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotName, setNewSlotName] = useState("");
  const [addingSlot, setAddingSlot] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await actor.getEquipmentSlots(characterId);
      if (data && data.length > 0) {
        setSlots(data);
      } else {
        // Bootstrap with defaults
        const bootstrapped: EquipmentSlot[] = DEFAULT_SLOTS.map((s) => ({
          ...s,
          id: makeId(),
        }));
        setSlots(bootstrapped);
        try {
          await actor.updateEquipmentSlots(characterId, bootstrapped);
        } catch (saveErr) {
          setBootstrapError(
            saveErr instanceof Error
              ? saveErr.message
              : "Could not save default equipment slots. Your changes may not persist.",
          );
        }
      }
    } catch (e) {
      console.error("Failed to load equipment slots:", e);
      setSlots(DEFAULT_SLOTS.map((s) => ({ ...s, id: makeId() })));
    } finally {
      setLoaded(true);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (slot: EquipmentSlot) => {
    setEditing(slot.id);
    setEditForm({
      itemName: slot.itemName,
      notes: slot.notes,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({ itemName: "", notes: "" });
  };

  const saveSlot = async (slotId: string) => {
    setSaving(true);
    const _prevSlot = slots.find((s) => s.id === slotId);
    const updated = slots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            itemName: editForm.itemName,
            notes: editForm.notes,
          }
        : s,
    );
    setSlots(updated);
    await actor.updateEquipmentSlots(characterId, updated);
    setEditing(null);
    setSaving(false);
  };

  const clearSlot = async (slotId: string) => {
    const updated = slots.map((s) =>
      s.id === slotId ? { ...s, itemName: "", notes: "" } : s,
    );
    setSlots(updated);
    await actor.updateEquipmentSlots(characterId, updated);
  };

  const addCustomSlot = async () => {
    if (!newSlotName.trim()) return;
    setAddingSlot(true);
    const newSlot: EquipmentSlot = {
      id: makeId(),
      slotName: newSlotName.trim(),
      itemName: "",
      notes: "",
      itemId: undefined,
    };
    const updated = [...slots, newSlot];
    setSlots(updated);
    await actor.updateEquipmentSlots(characterId, updated);
    setNewSlotName("");
    setShowAddSlot(false);
    setAddingSlot(false);
  };

  const removeSlot = async (slotId: string) => {
    if (!confirm("Remove this equipment slot?")) return;
    const updated = slots.filter((s) => s.id !== slotId);
    setSlots(updated);
    await actor.updateEquipmentSlots(characterId, updated);
  };

  if (!loaded) {
    return (
      <p
        style={{ color: "var(--ds-muted)" }}
        data-ocid="equipment.loading_state"
      >
        Loading equipment...
      </p>
    );
  }

  const equipped = slots.filter((s) => s.itemName.trim());
  const empty = slots.filter((s) => !s.itemName.trim());

  return (
    <div>
      {bootstrapError && (
        <div
          style={{
            background: "rgba(231,76,60,0.1)",
            border: "1px solid #e74c3c",
            borderRadius: 6,
            padding: "8px 12px",
            marginBottom: 12,
            color: "#e74c3c",
            fontSize: 13,
          }}
          data-ocid="equipment.bootstrap.error_state"
        >
          ⚠️ {bootstrapError}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 16 }}
          >
            EQUIPMENT SLOTS
          </h3>
          <p style={{ color: "var(--ds-muted)", fontSize: 13, marginTop: 2 }}>
            {equipped.length} of {slots.length} slots filled
          </p>
        </div>
        <button
          type="button"
          className="ds-btn-ghost"
          style={{ fontSize: 12, padding: "6px 12px" }}
          onClick={() => setShowAddSlot((v) => !v)}
          data-ocid="equipment.primary_button"
        >
          + Custom Slot
        </button>
      </div>

      {showAddSlot && (
        <div className="ds-card2" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className="ds-input"
              placeholder="Slot name (e.g. Back, Bracer)"
              value={newSlotName}
              onChange={(e) => setNewSlotName(e.target.value)}
              style={{ flex: 1 }}
              data-ocid="equipment.custom_slot_input"
            />
            <button
              type="button"
              className="ds-btn-primary"
              style={{ fontSize: 12 }}
              onClick={addCustomSlot}
              disabled={addingSlot || !newSlotName.trim()}
              data-ocid="equipment.custom_slot_save"
            >
              Add
            </button>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={() => setShowAddSlot(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Equipped items section */}
      {equipped.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4
            style={{
              color: "var(--ds-muted)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Equipped
          </h4>
          {equipped.map((slot, i) => (
            <SlotRow
              key={slot.id}
              slot={slot}
              index={i}
              isEditing={editing === slot.id}
              editForm={editForm}
              saving={saving}
              onStartEdit={() => startEdit(slot)}
              onCancelEdit={cancelEdit}
              onChangeForm={setEditForm}
              onSave={() => saveSlot(slot.id)}
              onClear={() => clearSlot(slot.id)}
              onRemove={() => removeSlot(slot.id)}
              section="equipped"
            />
          ))}
        </div>
      )}

      {/* Empty slots */}
      <div>
        <h4
          style={{
            color: "var(--ds-muted)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          Empty Slots
        </h4>
        {empty.length === 0 ? (
          <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
            All slots are filled!
          </p>
        ) : (
          empty.map((slot, i) => (
            <SlotRow
              key={slot.id}
              slot={slot}
              index={i}
              isEditing={editing === slot.id}
              editForm={editForm}
              saving={saving}
              onStartEdit={() => startEdit(slot)}
              onCancelEdit={cancelEdit}
              onChangeForm={setEditForm}
              onSave={() => saveSlot(slot.id)}
              onClear={() => clearSlot(slot.id)}
              onRemove={() => removeSlot(slot.id)}
              section="empty"
            />
          ))
        )}
      </div>
    </div>
  );
}

function SlotRow({
  slot,
  index,
  isEditing,
  editForm,
  saving,
  onStartEdit,
  onCancelEdit,
  onChangeForm,
  onSave,
  onClear,
  onRemove,
  section,
}: {
  slot: EquipmentSlot;
  index: number;
  isEditing: boolean;
  editForm: {
    itemName: string;
    notes: string;
  };
  saving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onChangeForm: (f: { itemName: string; notes: string }) => void;
  onSave: () => void;
  onClear: () => void;
  onRemove: () => void;
  section: string;
}) {
  const filled = !!slot.itemName.trim();
  return (
    <div
      className="ds-card2"
      style={{ padding: 12, marginBottom: 8 }}
      data-ocid={`equipment.${section}.item.${index + 1}`}
    >
      {isEditing ? (
        <div>
          <div
            style={{
              color: "var(--ds-gold)",
              fontSize: 12,
              marginBottom: 8,
              fontFamily: "Cinzel, serif",
            }}
          >
            {slot.slotName}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              className="ds-input"
              placeholder="Item name"
              value={editForm.itemName}
              onChange={(e) =>
                onChangeForm({ ...editForm, itemName: e.target.value })
              }
              data-ocid="equipment.item_input"
            />
            <input
              className="ds-input"
              placeholder="Notes (optional)"
              value={editForm.notes}
              onChange={(e) =>
                onChangeForm({ ...editForm, notes: e.target.value })
              }
            />
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={onCancelEdit}
                data-ocid="equipment.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={onSave}
                disabled={saving}
                data-ocid="equipment.save_button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "var(--ds-muted)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 2,
              }}
            >
              {slot.slotName}
            </div>
            {filled ? (
              <div>
                <span
                  style={{
                    color: "var(--ds-text)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {slot.itemName}
                </span>
                {slot.notes && (
                  <p
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {slot.notes}
                  </p>
                )}
              </div>
            ) : (
              <span
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                Empty
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12, padding: "4px 8px" }}
              onClick={onStartEdit}
              data-ocid={`equipment.edit_button.${index + 1}`}
            >
              {filled ? "Edit" : "Equip"}
            </button>
            {filled && (
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12, padding: "4px 8px", color: "#e74c3c" }}
                onClick={onClear}
                data-ocid={`equipment.clear_button.${index + 1}`}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              style={{
                background: "transparent",
                border: "none",
                color: "#666",
                cursor: "pointer",
                padding: 4,
                fontSize: 14,
              }}
              data-ocid={`equipment.delete_button.${index + 1}`}
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

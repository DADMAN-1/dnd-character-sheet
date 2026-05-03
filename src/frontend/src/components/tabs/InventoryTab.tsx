import { useCallback, useEffect, useState } from "react";
import type {
  Character,
  CurrencyState,
  CustomItem,
  DndBackend,
  InventoryItem,
} from "../../types";

interface Props {
  actor: DndBackend;
  character?: Character;
  characterId: bigint;
  onUpdate: () => void;
}

type ItemWithId = { id: bigint } & InventoryItem;
type CustomItemWithId = { id: bigint } & CustomItem;

const EMPTY_ITEM = {
  name: "",
  quantity: 1,
  weight: 0,
  description: "",
  equipped: false,
};

const COIN_CONFIG = [
  { key: "platinum" as const, label: "PP", color: "#c0c0e0", full: "Platinum" },
  { key: "gold" as const, label: "GP", color: "#ffd700", full: "Gold" },
  { key: "electrum" as const, label: "EP", color: "#c0c0c0", full: "Electrum" },
  { key: "silver" as const, label: "SP", color: "#aaa", full: "Silver" },
  { key: "copper" as const, label: "CP", color: "#b87333", full: "Copper" },
];

const DEFAULT_CURRENCY: CurrencyState = {
  characterId: 0n,
  gold: 0n,
  silver: 0n,
  copper: 0n,
  platinum: 0n,
  electrum: 0n,
};

export default function InventoryTab({
  actor,
  characterId,
  onUpdate: _onUpdate,
}: Props) {
  const [items, setItems] = useState<ItemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ItemWithId | null>(null);
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Currency state from backend
  const [currency, setCurrency] = useState<CurrencyState>(DEFAULT_CURRENCY);
  const [currencyLoaded, setCurrencyLoaded] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(false);
  const [currencyForm, setCurrencyForm] = useState({
    platinum: 0,
    gold: 0,
    electrum: 0,
    silver: 0,
    copper: 0,
  });
  const [savingCurrency, setSavingCurrency] = useState(false);
  // Inline direct-edit for individual coin values in read-only view
  const [editingCoinKey, setEditingCoinKey] = useState<string | null>(null);
  const [coinDirectInput, setCoinDirectInput] = useState("");

  // Tab note
  const [tabNote, setTabNote] = useState("");
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Library modal state
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<CustomItemWithId[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [addingFromLib, setAddingFromLib] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [itemsRes, currRes, noteRes] = await Promise.allSettled([
      actor.getItemsByCharacter(characterId) as unknown as Promise<
        [bigint, InventoryItem][]
      >,
      actor.getCurrencyState(characterId),
      actor.getTabNote(characterId, "inventory"),
    ]);

    if (itemsRes.status === "fulfilled")
      setItems(itemsRes.value.map(([id, item]) => ({ id, ...item })));

    if (currRes.status === "fulfilled" && currRes.value) {
      setCurrency(currRes.value);
      setCurrencyForm({
        platinum: Number(currRes.value.platinum),
        gold: Number(currRes.value.gold),
        electrum: Number(currRes.value.electrum),
        silver: Number(currRes.value.silver),
        copper: Number(currRes.value.copper),
      });
    } else {
      const init = { ...DEFAULT_CURRENCY, characterId };
      setCurrency(init);
      setCurrencyForm({
        platinum: 0,
        gold: 0,
        electrum: 0,
        silver: 0,
        copper: 0,
      });
    }
    setCurrencyLoaded(true);

    if (noteRes.status === "fulfilled" && noteRes.value)
      setTabNote(noteRes.value.content);
    setNoteLoaded(true);
    setLoading(false);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  // Currency controls
  const adjustCoin = (key: keyof typeof currencyForm, delta: number) => {
    setCurrencyForm((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };
  const commitCoinDirect = async (key: string) => {
    const val = Number(coinDirectInput);
    const safe = Number.isNaN(val) ? 0 : Math.max(0, Math.floor(val));
    const next: CurrencyState = {
      ...currency,
      [key]: BigInt(safe),
    };
    setCurrency(next);
    setCurrencyForm((prev) => ({ ...prev, [key]: safe }));
    setEditingCoinKey(null);
    setCoinDirectInput("");
    await actor.updateCurrencyState(characterId, next);
  };

  const saveCurrency = async () => {
    setSavingCurrency(true);
    const next: CurrencyState = {
      characterId,
      platinum: BigInt(currencyForm.platinum),
      gold: BigInt(currencyForm.gold),
      electrum: BigInt(currencyForm.electrum),
      silver: BigInt(currencyForm.silver),
      copper: BigInt(currencyForm.copper),
    };
    await actor.updateCurrencyState(characterId, next);
    setCurrency(next);
    setEditingCurrency(false);
    setSavingCurrency(false);
  };

  // Library
  const openLibrary = async () => {
    setShowLibrary(true);
    setLibrarySearch("");
    setLibraryLoading(true);
    const result = (await actor.getAllCustomItems()) as unknown as [
      bigint,
      CustomItem,
    ][];
    setLibraryItems(result.map(([id, item]) => ({ id, ...item })));
    setLibraryLoading(false);
  };

  const addFromLibrary = async (libItem: CustomItemWithId) => {
    setAddingFromLib(libItem.id);
    const item: InventoryItem = {
      characterId,
      name: libItem.name,
      description: libItem.description,
      weight: 0n,
      quantity: 1n,
      equipped: false,
    };
    await actor.addItem(item);
    await load();
    setAddingFromLib(null);
    setShowLibrary(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_ITEM });
    setShowForm(true);
  };
  const openEdit = (item: ItemWithId) => {
    setEditing(item);
    setForm({
      name: item.name,
      quantity: Number(item.quantity),
      weight: Number(item.weight),
      description: item.description,
      equipped: item.equipped,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const item: InventoryItem = {
      characterId,
      name: form.name,
      quantity: BigInt(form.quantity),
      weight: BigInt(form.weight),
      description: form.description,
      equipped: form.equipped,
    };
    if (editing) await actor.updateItem(editing.id, item);
    else await actor.addItem(item);
    await load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Remove this item?")) return;
    await actor.deleteItem(id);
    await load();
  };

  const toggleEquipped = async (item: ItemWithId) => {
    await actor.updateItem(item.id, { ...item, equipped: !item.equipped });
    await load();
  };

  const saveNote = async () => {
    setSavingNote(true);
    await actor.saveTabNote(characterId, "inventory", tabNote);
    setSavingNote(false);
  };

  const f = (field: string, val: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const filteredLibrary = libraryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      item.itemType.toLowerCase().includes(librarySearch.toLowerCase()),
  );

  const filteredItems = search
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  return (
    <div>
      {/* Currency */}
      {currencyLoaded && (
        <div className="ds-card" style={{ padding: 16, marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <h3
              className="font-cinzel"
              style={{ color: "var(--ds-gold)", fontSize: 14 }}
            >
              CURRENCY
            </h3>
            {!editingCurrency ? (
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12, padding: "4px 8px" }}
                onClick={() => setEditingCurrency(true)}
                data-ocid="inventory.currency_edit"
              >
                Edit
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={saveCurrency}
                  disabled={savingCurrency}
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  data-ocid="inventory.currency_save"
                >
                  {savingCurrency ? "..." : "Save"}
                </button>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  onClick={() => {
                    setEditingCurrency(false);
                    setCurrencyForm({
                      platinum: Number(currency.platinum),
                      gold: Number(currency.gold),
                      electrum: Number(currency.electrum),
                      silver: Number(currency.silver),
                      copper: Number(currency.copper),
                    });
                  }}
                  style={{ fontSize: 12 }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editingCurrency ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {COIN_CONFIG.map(({ key, color, full }) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "center",
                    minWidth: 64,
                  }}
                >
                  <span style={{ color, fontSize: 11, fontWeight: 700 }}>
                    {full}
                  </span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{
                        width: 26,
                        padding: 0,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                      onClick={() => adjustCoin(key, -1)}
                      data-ocid={`inventory.${key}_minus`}
                    >
                      −
                    </button>
                    <input
                      className="ds-input"
                      type="number"
                      min={0}
                      value={currencyForm[key]}
                      onChange={(e) =>
                        setCurrencyForm((prev) => ({
                          ...prev,
                          [key]: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      style={{ width: 60, textAlign: "center" }}
                      data-ocid={`inventory.${key}_input`}
                    />
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{
                        width: 26,
                        padding: 0,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                      onClick={() => adjustCoin(key, 1)}
                      data-ocid={`inventory.${key}_plus`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {COIN_CONFIG.map(({ key, label, color }) => (
                <div key={key} style={{ textAlign: "center" }}>
                  {editingCoinKey === key ? (
                    <input
                      type="number"
                      min={0}
                      value={coinDirectInput}
                      onChange={(e) => setCoinDirectInput(e.target.value)}
                      onBlur={() => commitCoinDirect(key)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitCoinDirect(key);
                        if (e.key === "Escape") {
                          setEditingCoinKey(null);
                          setCoinDirectInput("");
                        }
                      }}
                      style={{
                        width: 58,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: 700,
                        color,
                        backgroundColor: "var(--ds-surface2)",
                        border: `1px solid ${color}`,
                        borderRadius: 4,
                        padding: "2px 4px",
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCoinDirectInput(Number(currency[key]).toString());
                        setEditingCoinKey(key);
                      }}
                      title="Click to set value directly"
                      style={{
                        color,
                        fontWeight: 700,
                        fontSize: 20,
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        borderBottom: `1px dashed ${color}`,
                        paddingBottom: 1,
                      }}
                      data-ocid={`inventory.${key}_value`}
                    >
                      {Number(currency[key])}
                    </button>
                  )}
                  <div style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inventory Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 14 }}
        >
          INVENTORY ({items.length} items)
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={openLibrary}
            style={{ fontSize: 12, padding: "4px 10px" }}
            data-ocid="inventory.secondary_button"
          >
            📚 Library
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={openNew}
            style={{ fontSize: 12, padding: "4px 10px" }}
            data-ocid="inventory.primary_button"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        className="ds-input"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12, width: "100%" }}
        data-ocid="inventory.search_input"
      />

      {loading ? (
        <p
          style={{ color: "var(--ds-muted)", fontSize: 14 }}
          data-ocid="inventory.loading_state"
        >
          Loading...
        </p>
      ) : filteredItems.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 32,
          }}
          data-ocid="inventory.empty_state"
        >
          {search
            ? "No items match your search."
            : "No items yet. Add gear or browse your homebrew library!"}
        </p>
      ) : (
        <div>
          {filteredItems.map((item, i) => (
            <div
              key={item.id.toString()}
              className="ds-card2"
              style={{
                padding: 12,
                marginBottom: 8,
                opacity: item.equipped ? 1 : 0.85,
              }}
              data-ocid={`inventory.item.${i + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleEquipped(item)}
                      title={item.equipped ? "Equipped" : "Unequipped"}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      {item.equipped ? "🛡️" : "🎒"}
                    </button>
                    <span style={{ color: "var(--ds-text)", fontWeight: 600 }}>
                      {item.name}
                    </span>
                    <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                      ×{item.quantity.toString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {Number(item.weight) > 0 && (
                      <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                        ⚖ {item.weight.toString()} lb
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        marginTop: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "4px 8px" }}
                    onClick={() => openEdit(item)}
                    data-ocid={`inventory.edit_button.${i + 1}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      padding: 4,
                    }}
                    data-ocid={`inventory.delete_button.${i + 1}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Note */}
      {noteLoaded && (
        <div className="ds-card" style={{ padding: 16, marginTop: 16 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 13, marginBottom: 8 }}
          >
            INVENTORY NOTES
          </h3>
          <textarea
            className="ds-input"
            value={tabNote}
            onChange={(e) => setTabNote(e.target.value)}
            placeholder="Notes for this tab..."
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
            data-ocid="inventory.textarea"
          />
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={saveNote}
              disabled={savingNote}
              data-ocid="inventory.save_button"
            >
              {savingNote ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Item Form Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          data-ocid="inventory.modal"
        >
          <div
            className="ds-card"
            style={{ width: "100%", maxWidth: 480, padding: 24 }}
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
                {editing ? "Edit Item" : "Add Item"}
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
                data-ocid="inventory.close_button"
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Item Name *</span>
                <input
                  className="ds-input"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  data-ocid="inventory.input"
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
                  <span className="ds-label">Quantity</span>
                  <input
                    className="ds-input"
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => f("quantity", Number(e.target.value) || 1)}
                  />
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Weight (lbs)</span>
                  <input
                    className="ds-input"
                    type="number"
                    min={0}
                    value={form.weight}
                    onChange={(e) => f("weight", Number(e.target.value) || 0)}
                  />
                </label>
              </div>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Description</span>
                <textarea
                  className="ds-input"
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.equipped}
                  onChange={(e) => f("equipped", e.target.checked)}
                />
                <span className="ds-label">Equipped</span>
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
                data-ocid="inventory.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
                data-ocid="inventory.submit_button"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {showLibrary && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          data-ocid="inventory.dialog"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 540,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
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
                Item Library
              </h2>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ds-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ×
              </button>
            </div>
            <input
              className="ds-input"
              placeholder="Search items..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              style={{ marginBottom: 12 }}
              data-ocid="inventory.library_search"
            />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {libraryLoading ? (
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Loading library...
                </p>
              ) : filteredLibrary.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 24,
                  }}
                >
                  {libraryItems.length === 0
                    ? "No items in your library. Add custom items in Settings."
                    : "No items match your search."}
                </p>
              ) : (
                filteredLibrary.map((item) => (
                  <div
                    key={item.id.toString()}
                    className="ds-card2"
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{ color: "var(--ds-text)", fontWeight: 600 }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            color: "var(--ds-gold)",
                            fontSize: 11,
                            backgroundColor: "rgba(201,163,90,0.1)",
                            padding: "2px 6px",
                            borderRadius: 10,
                          }}
                        >
                          {item.itemType}
                        </span>
                      </div>
                      {item.description && (
                        <p
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 12,
                            lineHeight: 1.4,
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="ds-btn-primary"
                      onClick={() => addFromLibrary(item)}
                      disabled={addingFromLib === item.id}
                      style={{
                        fontSize: 12,
                        padding: "4px 12px",
                        marginLeft: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {addingFromLib === item.id ? "Adding..." : "+ Add"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

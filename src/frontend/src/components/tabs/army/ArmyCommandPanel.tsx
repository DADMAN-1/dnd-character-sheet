import { useState } from "react";
import type {
  ArmyCommandStructure,
  ArmyOfficer,
  ChainEntry,
  OrderEntry,
} from "../../../types";
import { uid } from "./armyHelpers";

interface Props {
  commandStructure: ArmyCommandStructure;
  officers: ArmyOfficer[];
  onChange: (commandStructure: ArmyCommandStructure) => void;
}

const emptyChainEntry = (): Omit<ChainEntry, "id"> => ({
  officerId: "",
  reportsToId: "",
  role: "",
});

const emptyOrderEntry = (): Omit<OrderEntry, "id"> => ({
  target: "",
  order: "",
  date: "",
});

export default function ArmyCommandPanel({
  commandStructure,
  officers,
  onChange,
}: Props) {
  const [addingChain, setAddingChain] = useState(false);
  const [chainForm, setChainForm] = useState<Omit<ChainEntry, "id">>(
    emptyChainEntry(),
  );
  const [editingChainId, setEditingChainId] = useState<string | null>(null);
  const [editChainForm, setEditChainForm] = useState<ChainEntry>({
    id: "",
    ...emptyChainEntry(),
  });

  const [addingOrder, setAddingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState<Omit<OrderEntry, "id">>(
    emptyOrderEntry(),
  );
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editOrderForm, setEditOrderForm] = useState<OrderEntry>({
    id: "",
    ...emptyOrderEntry(),
  });

  const officerName = (id: string) => {
    const o = officers.find((x) => x.id === id);
    return o ? o.name : id || "—";
  };

  // Chain of Command handlers
  const addChain = () => {
    if (!chainForm.officerId.trim()) return;
    onChange({
      ...commandStructure,
      chainOfCommand: [
        ...commandStructure.chainOfCommand,
        { ...chainForm, id: uid() },
      ],
    });
    setChainForm(emptyChainEntry());
    setAddingChain(false);
  };

  const startEditChain = (entry: ChainEntry) => {
    setEditingChainId(entry.id);
    setEditChainForm({ ...entry });
  };

  const saveEditChain = () => {
    onChange({
      ...commandStructure,
      chainOfCommand: commandStructure.chainOfCommand.map((c) =>
        c.id === editingChainId ? editChainForm : c,
      ),
    });
    setEditingChainId(null);
  };

  const deleteChain = (id: string) => {
    if (!confirm("Remove this chain entry?")) return;
    onChange({
      ...commandStructure,
      chainOfCommand: commandStructure.chainOfCommand.filter(
        (c) => c.id !== id,
      ),
    });
  };

  // Orders Log handlers
  const addOrder = () => {
    if (!orderForm.order.trim()) return;
    onChange({
      ...commandStructure,
      ordersLog: [...commandStructure.ordersLog, { ...orderForm, id: uid() }],
    });
    setOrderForm(emptyOrderEntry());
    setAddingOrder(false);
  };

  const startEditOrder = (entry: OrderEntry) => {
    setEditingOrderId(entry.id);
    setEditOrderForm({ ...entry });
  };

  const saveEditOrder = () => {
    onChange({
      ...commandStructure,
      ordersLog: commandStructure.ordersLog.map((o) =>
        o.id === editingOrderId ? editOrderForm : o,
      ),
    });
    setEditingOrderId(null);
  };

  const deleteOrder = (id: string) => {
    if (!confirm("Remove this order?")) return;
    onChange({
      ...commandStructure,
      ordersLog: commandStructure.ordersLog.filter((o) => o.id !== id),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Chain of Command */}
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
            Chain of Command
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingChain(true)}
            data-ocid="army.command.chain.open_modal_button"
          >
            + Add Entry
          </button>
        </div>

        {commandStructure.chainOfCommand.length === 0 && !addingChain && (
          <p
            style={{ color: "var(--ds-muted)", fontSize: 13 }}
            data-ocid="army.command.chain.empty_state"
          >
            No chain of command entries yet.
          </p>
        )}

        {commandStructure.chainOfCommand.map((entry, idx) => (
          <div
            key={entry.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
            data-ocid={`army.command.chain.item.${idx + 1}`}
          >
            {editingChainId === entry.id ? (
              <div
                style={{
                  flex: 1,
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
                  <div>
                    <label
                      htmlFor="edit-chain-officer"
                      style={{
                        fontSize: 11,
                        color: "var(--ds-muted)",
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      Officer
                    </label>
                    <select
                      id="edit-chain-officer"
                      className="ds-input"
                      value={editChainForm.officerId}
                      onChange={(e) =>
                        setEditChainForm((f) => ({
                          ...f,
                          officerId: e.target.value,
                        }))
                      }
                      style={{ fontSize: 13, width: "100%" }}
                    >
                      <option value="">— Select Officer —</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="edit-chain-reports-to"
                      style={{
                        fontSize: 11,
                        color: "var(--ds-muted)",
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      Reports To
                    </label>
                    <select
                      id="edit-chain-reports-to"
                      className="ds-input"
                      value={editChainForm.reportsToId}
                      onChange={(e) =>
                        setEditChainForm((f) => ({
                          ...f,
                          reportsToId: e.target.value,
                        }))
                      }
                      style={{ fontSize: 13, width: "100%" }}
                    >
                      <option value="">— None / Top —</option>
                      {officers
                        .filter((o) => o.id !== editChainForm.officerId)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="edit-chain-role"
                      style={{
                        fontSize: 11,
                        color: "var(--ds-muted)",
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      Role / Note
                    </label>
                    <input
                      id="edit-chain-role"
                      className="ds-input"
                      value={editChainForm.role}
                      onChange={(e) =>
                        setEditChainForm((f) => ({
                          ...f,
                          role: e.target.value,
                        }))
                      }
                      placeholder="e.g. Field Commander"
                      style={{ fontSize: 13, width: "100%" }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="ds-btn-primary"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={saveEditChain}
                    data-ocid={`army.command.chain.save_button.${idx + 1}`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={() => setEditingChainId(null)}
                    data-ocid={`army.command.chain.cancel_button.${idx + 1}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--ds-text)",
                      fontSize: 13,
                    }}
                  >
                    {officerName(entry.officerId)}
                    {entry.role && (
                      <span
                        style={{
                          color: "var(--ds-gold)",
                          fontWeight: 400,
                          fontSize: 12,
                          marginLeft: 6,
                        }}
                      >
                        · {entry.role}
                      </span>
                    )}
                  </div>
                  {entry.reportsToId && (
                    <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                      Reports to: {officerName(entry.reportsToId)}
                    </div>
                  )}
                  {!entry.reportsToId && (
                    <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                      Top of chain
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11, padding: "2px 6px" }}
                    onClick={() => startEditChain(entry)}
                    data-ocid={`army.command.chain.edit_button.${idx + 1}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      color: "#c0392b",
                    }}
                    onClick={() => deleteChain(entry.id)}
                    data-ocid={`army.command.chain.delete_button.${idx + 1}`}
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {addingChain && (
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
              <div>
                <label
                  htmlFor="add-chain-officer"
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  Officer *
                </label>
                <select
                  id="add-chain-officer"
                  className="ds-input"
                  value={chainForm.officerId}
                  onChange={(e) =>
                    setChainForm((f) => ({ ...f, officerId: e.target.value }))
                  }
                  style={{ fontSize: 13, width: "100%" }}
                >
                  <option value="">— Select Officer —</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="add-chain-reports-to"
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  Reports To
                </label>
                <select
                  id="add-chain-reports-to"
                  className="ds-input"
                  value={chainForm.reportsToId}
                  onChange={(e) =>
                    setChainForm((f) => ({
                      ...f,
                      reportsToId: e.target.value,
                    }))
                  }
                  style={{ fontSize: 13, width: "100%" }}
                >
                  <option value="">— None / Top —</option>
                  {officers
                    .filter((o) => o.id !== chainForm.officerId)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="add-chain-role"
                  style={{
                    fontSize: 11,
                    color: "var(--ds-muted)",
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  Role / Note
                </label>
                <input
                  id="add-chain-role"
                  className="ds-input"
                  value={chainForm.role}
                  onChange={(e) =>
                    setChainForm((f) => ({ ...f, role: e.target.value }))
                  }
                  placeholder="e.g. Field Commander"
                  style={{ fontSize: 13, width: "100%" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addChain}
                data-ocid="army.command.chain.submit_button"
              >
                Add Entry
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => {
                  setAddingChain(false);
                  setChainForm(emptyChainEntry());
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Log */}
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
            Orders Log
          </span>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => setAddingOrder(true)}
            data-ocid="army.command.orders.open_modal_button"
          >
            + Add Order
          </button>
        </div>

        {commandStructure.ordersLog.length === 0 && !addingOrder && (
          <p
            style={{ color: "var(--ds-muted)", fontSize: 13 }}
            data-ocid="army.command.orders.empty_state"
          >
            No orders logged.
          </p>
        )}

        {commandStructure.ordersLog.map((entry, idx) => (
          <div
            key={entry.id}
            className="ds-card2"
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
            data-ocid={`army.command.orders.item.${idx + 1}`}
          >
            {editingOrderId === entry.id ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="ds-input"
                    value={editOrderForm.target}
                    onChange={(e) =>
                      setEditOrderForm((f) => ({
                        ...f,
                        target: e.target.value,
                      }))
                    }
                    placeholder="Target (branch, officer…)"
                    style={{ flex: 2, fontSize: 13 }}
                  />
                  <input
                    className="ds-input"
                    value={editOrderForm.date}
                    onChange={(e) =>
                      setEditOrderForm((f) => ({
                        ...f,
                        date: e.target.value,
                      }))
                    }
                    placeholder="Date"
                    style={{ flex: 1, fontSize: 13 }}
                  />
                </div>
                <textarea
                  className="ds-input"
                  rows={2}
                  value={editOrderForm.order}
                  onChange={(e) =>
                    setEditOrderForm((f) => ({ ...f, order: e.target.value }))
                  }
                  placeholder="Order details…"
                  style={{ fontSize: 12, resize: "vertical" }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="ds-btn-primary"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={saveEditOrder}
                    data-ocid={`army.command.orders.save_button.${idx + 1}`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={() => setEditingOrderId(null)}
                    data-ocid={`army.command.orders.cancel_button.${idx + 1}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--ds-text)",
                      fontSize: 13,
                    }}
                  >
                    {entry.target || "General Order"}
                    {entry.date && (
                      <span
                        style={{
                          color: "var(--ds-muted)",
                          fontWeight: 400,
                          fontSize: 11,
                          marginLeft: 6,
                        }}
                      >
                        · {entry.date}
                      </span>
                    )}
                  </div>
                  {entry.order && (
                    <div
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {entry.order}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{ fontSize: 11, padding: "2px 6px" }}
                    onClick={() => startEditOrder(entry)}
                    data-ocid={`army.command.orders.edit_button.${idx + 1}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      color: "#c0392b",
                    }}
                    onClick={() => deleteOrder(entry.id)}
                    data-ocid={`army.command.orders.delete_button.${idx + 1}`}
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {addingOrder && (
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
                value={orderForm.target}
                onChange={(e) =>
                  setOrderForm((f) => ({ ...f, target: e.target.value }))
                }
                placeholder="Target (branch, officer…)"
                style={{ flex: 2, fontSize: 13 }}
              />
              <input
                className="ds-input"
                value={orderForm.date}
                onChange={(e) =>
                  setOrderForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="Date"
                style={{ flex: 1, fontSize: 13 }}
              />
            </div>
            <textarea
              className="ds-input"
              rows={2}
              value={orderForm.order}
              onChange={(e) =>
                setOrderForm((f) => ({ ...f, order: e.target.value }))
              }
              placeholder="Order details… *"
              style={{ fontSize: 12, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ fontSize: 12 }}
                onClick={addOrder}
                data-ocid="army.command.orders.submit_button"
              >
                Add Order
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => {
                  setAddingOrder(false);
                  setOrderForm(emptyOrderEntry());
                }}
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

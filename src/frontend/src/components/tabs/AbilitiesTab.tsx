import { useCallback, useEffect, useState } from "react";
import type { CharacterAbility, CustomAbility, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

type AbilityWithId = { id: bigint } & CharacterAbility;
type CustomAbilityWithId = { id: bigint } & CustomAbility;

const ABILITY_TYPES = ["Passive", "Active", "Reaction"];
const RECHARGE_OPTIONS = ["", "Short Rest", "Long Rest", "Daily"];

const EMPTY_FORM = {
  name: "",
  description: "",
  abilityType: "Active",
  uses: 0,
  rechargeOn: "",
};

const TYPE_COLORS: Record<string, string> = {
  Passive: "#4a9eca",
  Active: "#c97d3a",
  Reaction: "#7c5cbf",
};

export default function AbilitiesTab({ actor, characterId }: Props) {
  const [abilities, setAbilities] = useState<AbilityWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AbilityWithId | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Tab note
  const [tabNote, setTabNote] = useState("");
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Library modal
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryAbilities, setLibraryAbilities] = useState<
    CustomAbilityWithId[]
  >([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [addingFromLib, setAddingFromLib] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [abilitiesRes, noteRes] = await Promise.allSettled([
        actor.getAbilitiesByCharacter(characterId) as unknown as Promise<
          [bigint, CharacterAbility][]
        >,
        actor.getTabNote(characterId, "abilities"),
      ]);
      if (abilitiesRes.status === "fulfilled")
        setAbilities(abilitiesRes.value.map(([id, a]) => ({ id, ...a })));
      if (noteRes.status === "fulfilled" && noteRes.value)
        setTabNote(noteRes.value.content);
      setNoteLoaded(true);
    } catch (e) {
      console.error("Failed to load abilities:", e);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const openLibrary = async () => {
    setShowLibrary(true);
    setLibrarySearch("");
    setLibraryLoading(true);
    const result = (await actor.getAllCustomAbilities()) as unknown as [
      bigint,
      CustomAbility,
    ][];
    setLibraryAbilities(result.map(([id, a]) => ({ id, ...a })));
    setLibraryLoading(false);
  };

  const addFromLibrary = async (lib: CustomAbilityWithId) => {
    setAddingFromLib(lib.id);
    const ability: CharacterAbility = {
      characterId,
      name: lib.name,
      description: lib.description,
      abilityType: lib.abilityType,
      uses: lib.uses,
      usesRemaining: lib.uses,
      rechargeOn: lib.rechargeOn,
    };
    await actor.addCharacterAbility(ability);
    await load();
    setAddingFromLib(null);
    setShowLibrary(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (a: AbilityWithId) => {
    setEditing(a);
    setForm({
      name: a.name,
      description: a.description,
      abilityType: a.abilityType,
      uses: Number(a.uses),
      rechargeOn: a.rechargeOn,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const ability: CharacterAbility = {
      characterId,
      name: form.name,
      description: form.description,
      abilityType: form.abilityType,
      uses: BigInt(form.uses),
      usesRemaining: editing ? editing.usesRemaining : BigInt(form.uses),
      rechargeOn: form.rechargeOn,
    };
    if (editing) await actor.updateCharacterAbility(editing.id, ability);
    else await actor.addCharacterAbility(ability);
    await load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this ability?")) return;
    await actor.deleteCharacterAbility(id);
    await load();
  };

  const handleUseAbility = async (a: AbilityWithId) => {
    if (a.usesRemaining <= 0n) return;
    await actor.updateCharacterAbility(a.id, {
      ...a,
      usesRemaining: a.usesRemaining - 1n,
    });
    await load();
  };

  const resetUses = async (a: AbilityWithId) => {
    await actor.updateCharacterAbility(a.id, { ...a, usesRemaining: a.uses });
    await load();
  };

  const saveNote = async () => {
    setSavingNote(true);
    await actor.saveTabNote(characterId, "abilities", tabNote);
    setSavingNote(false);
  };

  const filteredLib = libraryAbilities.filter(
    (a) =>
      a.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      a.description.toLowerCase().includes(librarySearch.toLowerCase()),
  );

  const filteredAbilities = search
    ? abilities.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase()) ||
          a.abilityType.toLowerCase().includes(search.toLowerCase()),
      )
    : abilities;

  const f = (field: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <div data-ocid="abilities.section">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 18 }}
        >
          Abilities
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={openLibrary}
            data-ocid="abilities.open_modal_button"
          >
            📚 Library
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={openNew}
            data-ocid="abilities.primary_button"
          >
            + Add Ability
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        className="ds-input"
        placeholder="Search abilities..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12, width: "100%" }}
        data-ocid="abilities.search_input"
      />

      {/* Abilities List */}
      {loading ? (
        <div
          style={{ color: "var(--ds-muted)", padding: 32, textAlign: "center" }}
          data-ocid="abilities.loading_state"
        >
          Loading abilities...
        </div>
      ) : filteredAbilities.length === 0 ? (
        <div
          className="ds-card"
          style={{ padding: 32, textAlign: "center" }}
          data-ocid="abilities.empty_state"
        >
          <p style={{ color: "var(--ds-muted)", marginBottom: 12 }}>
            {search
              ? "No abilities match your search."
              : "No abilities yet. Add from your library or create a new one."}
          </p>
          {!search && (
            <button type="button" className="ds-btn-ghost" onClick={openNew}>
              + Add Your First Ability
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredAbilities.map((a, idx) => (
            <div
              key={a.id.toString()}
              className="ds-card"
              style={{ padding: 14 }}
              data-ocid={`abilities.item.${idx + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="font-cinzel"
                      style={{
                        color: "var(--ds-text)",
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {a.name}
                    </span>
                    <span
                      style={{
                        backgroundColor:
                          TYPE_COLORS[a.abilityType] ?? "var(--ds-surface2)",
                        color: "#fff",
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 700,
                      }}
                    >
                      {a.abilityType}
                    </span>
                    {a.rechargeOn && (
                      <span
                        style={{
                          color: "var(--ds-muted)",
                          fontSize: 11,
                          border: "1px solid var(--ds-border)",
                          borderRadius: 6,
                          padding: "1px 6px",
                        }}
                      >
                        ↺ {a.rechargeOn}
                      </span>
                    )}
                  </div>
                  {a.description && (
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 13,
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {a.description}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  {a.uses > 0n && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          color:
                            a.usesRemaining > 0n ? "var(--ds-gold)" : "#8B1A1A",
                          fontSize: 13,
                          fontWeight: 600,
                          minWidth: 40,
                          textAlign: "right",
                        }}
                      >
                        {a.usesRemaining.toString()}/{a.uses.toString()}
                      </span>
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ fontSize: 11, padding: "3px 8px" }}
                        onClick={() => handleUseAbility(a)}
                        disabled={a.usesRemaining <= 0n}
                        title="Use ability"
                        data-ocid={`abilities.secondary_button.${idx + 1}`}
                      >
                        Use
                      </button>
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ fontSize: 11, padding: "3px 8px" }}
                        onClick={() => resetUses(a)}
                        title="Reset uses"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                  {a.uses === 0n && (
                    <span style={{ color: "var(--ds-muted)", fontSize: 11 }}>
                      Unlimited
                    </span>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 11, padding: "3px 8px" }}
                      onClick={() => openEdit(a)}
                      data-ocid={`abilities.edit_button.${idx + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        color: "#c0392b",
                      }}
                      onClick={() => handleDelete(a.id)}
                      data-ocid={`abilities.delete_button.${idx + 1}`}
                    >
                      Delete
                    </button>
                  </div>
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
            ABILITIES NOTES
          </h3>
          <textarea
            className="ds-input"
            value={tabNote}
            onChange={(e) => setTabNote(e.target.value)}
            placeholder="Notes for this tab..."
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
            data-ocid="abilities.textarea"
          />
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={saveNote}
              disabled={savingNote}
              data-ocid="abilities.save_button"
            >
              {savingNote ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
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
          data-ocid="abilities.modal"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflow: "auto",
              padding: 24,
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
                style={{ color: "var(--ds-gold)", fontSize: 18 }}
              >
                {editing ? "Edit Ability" : "New Ability"}
              </h3>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ds-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
                onClick={() => setShowForm(false)}
                data-ocid="abilities.close_button"
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
                  className="ds-input"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  placeholder="Ability name"
                  data-ocid="abilities.input"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Description</span>
                <textarea
                  className="ds-input"
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  placeholder="Describe this ability..."
                  rows={3}
                  style={{ resize: "vertical" }}
                  data-ocid="abilities.textarea"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Type</span>
                <select
                  className="ds-input"
                  value={form.abilityType}
                  onChange={(e) => f("abilityType", e.target.value)}
                  data-ocid="abilities.select"
                >
                  {ABILITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Uses (0 = unlimited)</span>
                <input
                  className="ds-input"
                  type="number"
                  min={0}
                  value={form.uses}
                  onChange={(e) =>
                    f("uses", Math.max(0, Number.parseInt(e.target.value) || 0))
                  }
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Recharge On</span>
                <select
                  className="ds-input"
                  value={form.rechargeOn}
                  onChange={(e) => f("rechargeOn", e.target.value)}
                >
                  {RECHARGE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r || "None"}
                    </option>
                  ))}
                </select>
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
                data-ocid="abilities.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                data-ocid="abilities.submit_button"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Add Ability"}
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
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          data-ocid="abilities.dialog"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 520,
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
              <h3
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 18 }}
              >
                Ability Library
              </h3>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ds-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
                onClick={() => setShowLibrary(false)}
                data-ocid="abilities.close_button"
              >
                ×
              </button>
            </div>
            <input
              className="ds-input"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Search abilities..."
              style={{ marginBottom: 12 }}
              data-ocid="abilities.search_input"
            />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {libraryLoading ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    padding: 20,
                  }}
                  data-ocid="abilities.loading_state"
                >
                  Loading library...
                </p>
              ) : filteredLib.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    padding: 20,
                  }}
                  data-ocid="abilities.empty_state"
                >
                  {libraryAbilities.length === 0
                    ? "No custom abilities in library. Add some in Settings."
                    : "No abilities match your search."}
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {filteredLib.map((a, idx) => (
                    <div
                      key={a.id.toString()}
                      className="ds-card"
                      style={{
                        padding: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                      data-ocid={`abilities.item.${idx + 1}`}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className="font-cinzel"
                            style={{ color: "var(--ds-text)", fontSize: 14 }}
                          >
                            {a.name}
                          </span>
                          <span
                            style={{
                              backgroundColor:
                                TYPE_COLORS[a.abilityType] ??
                                "var(--ds-surface2)",
                              color: "#fff",
                              fontSize: 9,
                              padding: "2px 6px",
                              borderRadius: 8,
                              textTransform: "uppercase",
                              fontWeight: 700,
                            }}
                          >
                            {a.abilityType}
                          </span>
                        </div>
                        {a.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {a.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="ds-btn-primary"
                        style={{
                          fontSize: 12,
                          padding: "5px 12px",
                          flexShrink: 0,
                        }}
                        onClick={() => addFromLibrary(a)}
                        disabled={addingFromLib === a.id}
                        data-ocid={`abilities.secondary_button.${idx + 1}`}
                      >
                        {addingFromLib === a.id ? "Adding..." : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

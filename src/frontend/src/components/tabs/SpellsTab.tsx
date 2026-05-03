import { useCallback, useEffect, useState } from "react";
import type { SrdSpell } from "../../types";
import type {
  Character,
  ConcentrationState,
  CustomSpell,
  CustomSpellSchool,
  DndBackend,
  Spell,
  SpellSlotState,
} from "../../types";

interface Props {
  actor: DndBackend;
  character?: Character;
  characterId: bigint;
  onUpdate: () => void;
}

type SpellWithId = { id: bigint } & Spell;
type CustomSpellWithId = { id: bigint } & CustomSpell;

const SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
];
const EMPTY_SPELL = {
  name: "",
  level: 0,
  school: "Evocation",
  castingTime: "1 action",
  range: "",
  components: "",
  duration: "",
  description: "",
  damageEffect: "",
};

const DEFAULT_SLOTS: SpellSlotState[] = Array.from({ length: 9 }, (_, i) => ({
  characterId: 0n,
  spellLevel: BigInt(i + 1),
  used: 0n,
  total: 0n,
}));

export default function SpellsTab({
  actor,
  characterId,
  onUpdate: _onUpdate,
}: Props) {
  const [spells, setSpells] = useState<SpellWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpellWithId | null>(null);
  const [form, setForm] = useState({ ...EMPTY_SPELL });
  const [saving, setSaving] = useState(false);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [slots, setSlots] = useState<SpellSlotState[]>(DEFAULT_SLOTS);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [editingTotals, setEditingTotals] = useState(false);
  const [totalInputs, setTotalInputs] = useState<number[]>(Array(9).fill(0));
  // Inline direct-edit for spell slot used count
  const [editingSlotIdx, setEditingSlotIdx] = useState<number | null>(null);
  const [slotDirectInput, setSlotDirectInput] = useState("");

  // Concentration tracker
  const [concentration, setConcentration] = useState<ConcentrationState>({
    concentrationSpellId: undefined,
    concentrationSpellName: undefined,
  });
  const [concLoaded, setConcLoaded] = useState(false);
  const [settingConc, setSettingConc] = useState(false);

  // Prepared spells
  const [preparedIds, setPreparedIds] = useState<Set<string>>(new Set());

  // Tab note
  const [tabNote, setTabNote] = useState("");
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Library
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySpells, setLibrarySpells] = useState<CustomSpellWithId[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [addingFromLib, setAddingFromLib] = useState<bigint | null>(null);
  const [customSchools, setCustomSchools] = useState<string[]>([]);
  const [libraryTab, setLibraryTab] = useState<"custom" | "srd">("custom");
  const [srdSpells, setSrdSpells] = useState<SrdSpell[]>([]);
  const [srdLoading, setSrdLoading] = useState(false);
  const [addingFromSrd, setAddingFromSrd] = useState<string | null>(null);
  const [srdSearch, setSrdSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [spellResult, schoolData, slotsData, noteRes, concRes, prepRes] =
        await Promise.allSettled([
          actor.getSpellsByCharacter(characterId) as unknown as Promise<
            [bigint, Spell][]
          >,
          actor.getAllCustomSpellSchools() as unknown as Promise<
            [bigint, CustomSpellSchool][]
          >,
          actor.getSpellSlotsByCharacter(characterId),
          actor.getTabNote(characterId, "spells"),
          actor.getConcentrationState(characterId),
          actor.getPreparedSpells(characterId),
        ]);

      if (spellResult.status === "fulfilled")
        setSpells(spellResult.value.map(([id, spell]) => ({ id, ...spell })));
      if (schoolData.status === "fulfilled")
        setCustomSchools(schoolData.value.map(([, s]) => s.name));

      if (slotsData.status === "fulfilled" && slotsData.value.length > 0) {
        const merged = DEFAULT_SLOTS.map((def) => {
          const found = slotsData.value.find(
            (s) => s.spellLevel === def.spellLevel,
          );
          return found ? { ...found, characterId } : { ...def, characterId };
        });
        setSlots(merged);
        setTotalInputs(merged.map((s) => Number(s.total)));
      } else {
        const base = DEFAULT_SLOTS.map((s) => ({ ...s, characterId }));
        setSlots(base);
        setTotalInputs(Array(9).fill(0));
      }
      setSlotsLoaded(true);

      if (noteRes.status === "fulfilled" && noteRes.value)
        setTabNote(noteRes.value.content);
      setNoteLoaded(true);

      if (concRes.status === "fulfilled" && concRes.value) {
        setConcentration(concRes.value);
      } else {
        setConcentration({
          concentrationSpellId: undefined,
          concentrationSpellName: undefined,
        });
      }
      setConcLoaded(true);

      if (prepRes.status === "fulfilled") {
        setPreparedIds(new Set(prepRes.value));
      }
    } catch (e) {
      console.error("Failed to load spells:", e);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const adjustUsed = async (idx: number, delta: number) => {
    const s = slots[idx];
    let next = Number(s.used) + delta;
    if (next < 0) next = 0;
    if (next > Number(s.total)) next = Number(s.total);
    const updated = slots.map((sl, i) =>
      i === idx ? { ...sl, used: BigInt(next) } : sl,
    );
    setSlots(updated);
    await actor.updateSpellSlots(characterId, updated);
  };
  const commitSlotDirect = async (idx: number) => {
    const s = slots[idx];
    const val = Number(slotDirectInput);
    const safe = Number.isNaN(val)
      ? 0
      : Math.max(0, Math.min(Number(s.total), val));
    const updated = slots.map((sl, i) =>
      i === idx ? { ...sl, used: BigInt(safe) } : sl,
    );
    setSlots(updated);
    setEditingSlotIdx(null);
    setSlotDirectInput("");
    await actor.updateSpellSlots(characterId, updated);
  };

  const saveTotals = async () => {
    const updated = slots.map((sl, i) => ({
      ...sl,
      total: BigInt(totalInputs[i]),
      used: sl.used > BigInt(totalInputs[i]) ? BigInt(totalInputs[i]) : sl.used,
    }));
    setSlots(updated);
    await actor.updateSpellSlots(characterId, updated);
    setEditingTotals(false);
  };

  const togglePrepared = async (spellIdStr: string) => {
    const next = new Set(preparedIds);
    if (next.has(spellIdStr)) next.delete(spellIdStr);
    else next.add(spellIdStr);
    setPreparedIds(next);
    await actor.setPreparedSpells(characterId, Array.from(next));
  };

  const setConcentrationSpell = async (spell: SpellWithId | null) => {
    setSettingConc(true);
    const next: ConcentrationState = spell
      ? {
          concentrationSpellId: spell.id.toString(),
          concentrationSpellName: spell.name,
        }
      : { concentrationSpellId: undefined, concentrationSpellName: undefined };
    setConcentration(next);
    await actor.updateConcentrationState(characterId, next);
    setSettingConc(false);
  };

  const openLibrary = async () => {
    setShowLibrary(true);
    setLibrarySearch("");
    setSrdSearch("");
    setLibraryTab("custom");
    setLibraryLoading(true);
    const result = (await actor.getAllCustomSpells()) as unknown as [
      bigint,
      CustomSpell,
    ][];
    setLibrarySpells(result.map(([id, s]) => ({ id, ...s })));
    setLibraryLoading(false);
  };

  const loadSrdSpells = async () => {
    if (srdSpells.length > 0) return;
    setSrdLoading(true);
    const result = await actor.getSrdSpells();
    setSrdSpells(result);
    setSrdLoading(false);
  };

  const addFromSrd = async (srdSpell: SrdSpell) => {
    const key = `${srdSpell.name}-${srdSpell.level}`;
    setAddingFromSrd(key);
    const spell: Spell = {
      characterId,
      name: srdSpell.name,
      level: srdSpell.level,
      school: srdSpell.school,
      castingTime: srdSpell.castingTime,
      range: srdSpell.range,
      components: srdSpell.components,
      duration: srdSpell.duration,
      description: srdSpell.description,
      damageEffect: srdSpell.damageEffect,
    };
    await actor.addSpell(spell);
    await load();
    setAddingFromSrd(null);
    setShowLibrary(false);
  };

  const addFromLibrary = async (libSpell: CustomSpellWithId) => {
    setAddingFromLib(libSpell.id);
    const spell: Spell = {
      characterId,
      name: libSpell.name,
      level: libSpell.level,
      school: libSpell.school,
      castingTime: libSpell.castingTime,
      range: libSpell.range,
      components: libSpell.components,
      duration: libSpell.duration,
      description: libSpell.description,
      damageEffect: libSpell.damageEffect,
    };
    await actor.addSpell(spell);
    await load();
    setAddingFromLib(null);
    setShowLibrary(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_SPELL });
    setShowForm(true);
  };
  const openEdit = (s: SpellWithId) => {
    setEditing(s);
    setForm({
      name: s.name,
      level: Number(s.level),
      school: s.school,
      castingTime: s.castingTime,
      range: s.range,
      components: s.components,
      duration: s.duration,
      description: s.description,
      damageEffect: s.damageEffect,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const spell: Spell = {
      characterId,
      name: form.name,
      level: BigInt(form.level),
      school: form.school,
      castingTime: form.castingTime,
      range: form.range,
      components: form.components,
      duration: form.duration,
      description: form.description,
      damageEffect: form.damageEffect,
    };
    if (editing) await actor.updateSpell(editing.id, spell);
    else await actor.addSpell(spell);
    await load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this spell?")) return;
    await actor.deleteSpell(id);
    await load();
  };

  const saveNote = async () => {
    setSavingNote(true);
    await actor.saveTabNote(characterId, "spells", tabNote);
    setSavingNote(false);
  };

  const f = (field: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const filtered = spells.filter((s) => {
    const matchLevel =
      filterLevel !== null ? Number(s.level) === filterLevel : true;
    const matchSearch = search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.school.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchLevel && matchSearch;
  });
  const grouped = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((lvl) => ({
      lvl,
      spells: filtered.filter((s) => Number(s.level) === lvl),
    }))
    .filter((g) =>
      filterLevel === null ? g.spells.length > 0 : g.lvl === filterLevel,
    );

  const filteredLibrary = librarySpells.filter(
    (s) =>
      s.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      s.school.toLowerCase().includes(librarySearch.toLowerCase()),
  );

  const filteredSrd = srdSpells.filter(
    (s) =>
      s.name.toLowerCase().includes(srdSearch.toLowerCase()) ||
      s.school.toLowerCase().includes(srdSearch.toLowerCase()),
  );

  return (
    <div>
      {/* Concentration Tracker */}
      {concLoaded && (
        <div className="ds-card" style={{ padding: 16, marginBottom: 16 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 10 }}
          >
            CONCENTRATION
          </h3>
          {concentration.concentrationSpellName ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#4a9eca",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "var(--ds-text)", fontWeight: 600 }}>
                  {concentration.concentrationSpellName}
                </span>
                <span
                  style={{
                    color: "#4a9eca",
                    fontSize: 11,
                    backgroundColor: "rgba(74,158,202,0.1)",
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}
                >
                  Concentrating
                </span>
              </div>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12, color: "#e74c3c" }}
                onClick={() => setConcentrationSpell(null)}
                disabled={settingConc}
                data-ocid="spells.concentration.cancel_button"
              >
                End Concentration
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--ds-muted)", fontSize: 13 }}>
                Not concentrating
              </span>
              {spells.length > 0 && (
                <select
                  className="ds-input"
                  style={{ fontSize: 12, padding: "4px 8px" }}
                  defaultValue=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const found = spells.find(
                      (s) => s.id.toString() === e.target.value,
                    );
                    if (found) setConcentrationSpell(found);
                    e.target.value = "";
                  }}
                  data-ocid="spells.concentration.select"
                >
                  <option value="">Set concentration spell...</option>
                  {spells.map((s) => (
                    <option key={s.id.toString()} value={s.id.toString()}>
                      {s.name} {Number(s.level) === 0 ? "(C)" : `(L${s.level})`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      {/* Spell Slot Tracker */}
      {slotsLoaded && (
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
              SPELL SLOTS
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              {editingTotals ? (
                <>
                  <button
                    type="button"
                    className="ds-btn-primary"
                    onClick={saveTotals}
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    data-ocid="spells.slots_save"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="ds-btn-ghost"
                    onClick={() => setEditingTotals(false)}
                    style={{ fontSize: 12 }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="ds-btn-ghost"
                  style={{ fontSize: 12, padding: "4px 8px" }}
                  onClick={() => setEditingTotals(true)}
                  data-ocid="spells.slots_edit"
                >
                  Set Totals
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {slots.map((slot, i) => {
              const used = Number(slot.used);
              const total = Number(slot.total);
              const remaining = total - used;
              return (
                <div
                  key={slot.spellLevel.toString()}
                  style={{ textAlign: "center", minWidth: 52 }}
                >
                  <div
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    LVL {i + 1}
                  </div>
                  {editingTotals ? (
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={totalInputs[i]}
                      onChange={(e) => {
                        const arr = [...totalInputs];
                        arr[i] = Number.parseInt(e.target.value) || 0;
                        setTotalInputs(arr);
                      }}
                      style={{
                        width: 44,
                        textAlign: "center",
                        backgroundColor: "var(--ds-surface2)",
                        border: "1px solid var(--ds-gold)",
                        color: "var(--ds-text)",
                        borderRadius: 4,
                        padding: "4px 0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 52,
                        backgroundColor: "var(--ds-surface2)",
                        border: "1px solid var(--ds-border)",
                        borderRadius: 6,
                        padding: "6px 4px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 4,
                          marginBottom: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        {Array.from(
                          { length: Math.max(total, 1) },
                          (_, n) => n,
                        ).map((n) => (
                          <div
                            key={`pip-${n}`}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              border: "1px solid var(--ds-gold)",
                              backgroundColor:
                                n < remaining
                                  ? "var(--ds-gold)"
                                  : "transparent",
                            }}
                          />
                        ))}
                      </div>
                      {editingSlotIdx === i ? (
                        <input
                          type="number"
                          min={0}
                          max={total}
                          value={slotDirectInput}
                          onChange={(e) => setSlotDirectInput(e.target.value)}
                          onBlur={() => commitSlotDirect(i)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitSlotDirect(i);
                            if (e.key === "Escape") {
                              setEditingSlotIdx(null);
                              setSlotDirectInput("");
                            }
                          }}
                          style={{
                            width: 36,
                            textAlign: "center",
                            fontSize: 11,
                            color: "var(--ds-gold)",
                            backgroundColor: "var(--ds-surface2)",
                            border: "1px solid var(--ds-gold)",
                            borderRadius: 4,
                            padding: "2px 0",
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSlotDirectInput(used.toString());
                            setEditingSlotIdx(i);
                          }}
                          title="Click to set used count directly"
                          style={{
                            fontSize: 11,
                            color:
                              remaining > 0
                                ? "var(--ds-gold)"
                                : "var(--ds-muted)",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            padding: 0,
                            borderBottom: `1px dashed ${remaining > 0 ? "var(--ds-gold)" : "var(--ds-muted)"}`,
                            paddingBottom: 1,
                          }}
                          data-ocid={`spells.slot_value.${i + 1}`}
                        >
                          {remaining}/{total}
                        </button>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 2,
                          justifyContent: "center",
                          marginTop: 4,
                        }}
                      >
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 10, padding: "1px 5px" }}
                          onClick={() => adjustUsed(i, 1)}
                          disabled={used >= total}
                          data-ocid={`spells.slot_use.${i + 1}`}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 10, padding: "1px 5px" }}
                          onClick={() => adjustUsed(i, -1)}
                          disabled={used <= 0}
                          data-ocid={`spells.slot_restore.${i + 1}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
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
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilterLevel(null)}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid var(--ds-border)",
              backgroundColor:
                filterLevel === null ? "var(--ds-maroon)" : "transparent",
              color: filterLevel === null ? "#F2E9DB" : "var(--ds-muted)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            All
          </button>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <button
              type="button"
              key={lvl}
              onClick={() => setFilterLevel(filterLevel === lvl ? null : lvl)}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid var(--ds-border)",
                backgroundColor:
                  filterLevel === lvl ? "var(--ds-maroon)" : "transparent",
                color: filterLevel === lvl ? "#F2E9DB" : "var(--ds-muted)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {lvl === 0 ? "Cantrip" : `L${lvl}`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={openLibrary}
            style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
            data-ocid="spells.secondary_button"
          >
            📚 Library
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={openNew}
            style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
            data-ocid="spells.primary_button"
          >
            + Add Spell
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        className="ds-input"
        placeholder="Search spells by name or school..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12, width: "100%" }}
        data-ocid="spells.search_input"
      />

      {/* Spell List */}
      {loading ? (
        <p style={{ color: "var(--ds-muted)" }}>Loading spells...</p>
      ) : grouped.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 32,
          }}
          data-ocid="spells.empty_state"
        >
          {search
            ? "No spells match your search."
            : "No spells found. Add your first spell!"}
        </p>
      ) : (
        grouped.map(({ lvl, spells: lvlSpells }) => (
          <div key={lvl} style={{ marginBottom: 20 }}>
            {(() => {
              const slotState =
                lvl > 0
                  ? slots.find((s) => Number(s.spellLevel) === lvl)
                  : null;
              const slotsExhausted = slotState
                ? slotState.total > 0n && slotState.used >= slotState.total
                : false;
              return (
                <h3
                  className="font-cinzel"
                  style={{
                    color: slotsExhausted ? "#e53935" : "var(--ds-gold)",
                    fontSize: 13,
                    marginBottom: 8,
                    borderBottom: "1px solid var(--ds-border)",
                    paddingBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {lvl === 0 ? "CANTRIPS" : `LEVEL ${lvl}`}
                  {slotsExhausted && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "#e53935",
                        background: "rgba(229,57,53,0.12)",
                        border: "1px solid #e53935",
                        borderRadius: 4,
                        padding: "1px 7px",
                      }}
                    >
                      SLOTS EXHAUSTED
                    </span>
                  )}
                </h3>
              );
            })()}
            {lvlSpells.map((spell, i) => {
              const isPrepared = preparedIds.has(spell.id.toString());
              const slotStateForLevel =
                lvl > 0
                  ? slots.find((s) => Number(s.spellLevel) === lvl)
                  : null;
              const slotsExhaustedForLevel = slotStateForLevel
                ? slotStateForLevel.total > 0n &&
                  slotStateForLevel.used >= slotStateForLevel.total
                : false;
              const isConcentrating =
                concentration.concentrationSpellId === spell.id.toString();
              return (
                <div
                  key={spell.id.toString()}
                  className="ds-card2"
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    borderLeft: isConcentrating
                      ? "3px solid #4a9eca"
                      : "3px solid transparent",
                  }}
                  data-ocid={`spells.item.${i + 1}`}
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
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Prepared toggle */}
                        <button
                          type="button"
                          onClick={() => togglePrepared(spell.id.toString())}
                          title={isPrepared ? "Prepared" : "Not prepared"}
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: "2px solid var(--ds-gold)",
                            backgroundColor: isPrepared
                              ? "var(--ds-gold)"
                              : "transparent",
                            cursor: "pointer",
                            padding: 0,
                            flexShrink: 0,
                          }}
                          data-ocid={`spells.prepared.${i + 1}`}
                        />
                        <span
                          style={{ color: "var(--ds-text)", fontWeight: 600 }}
                        >
                          {spell.name}
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
                          {spell.school}
                        </span>
                        {isPrepared && !slotsExhaustedForLevel && (
                          <span
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 10,
                              backgroundColor: "rgba(201,163,90,0.15)",
                              padding: "1px 6px",
                              borderRadius: 10,
                            }}
                          >
                            Prepared
                          </span>
                        )}
                        {isPrepared && slotsExhaustedForLevel && (
                          <span
                            style={{
                              color: "#e53935",
                              fontSize: 10,
                              backgroundColor: "rgba(229,57,53,0.12)",
                              padding: "1px 6px",
                              borderRadius: 10,
                            }}
                          >
                            Slots Exhausted
                          </span>
                        )}
                        {isConcentrating && (
                          <span
                            style={{
                              color: "#4a9eca",
                              fontSize: 10,
                              backgroundColor: "rgba(74,158,202,0.15)",
                              padding: "1px 6px",
                              borderRadius: 10,
                            }}
                          >
                            Concentrating
                          </span>
                        )}
                        {spell.components && (
                          <span
                            style={{ color: "var(--ds-muted)", fontSize: 11 }}
                          >
                            ({spell.components})
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          marginTop: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        {spell.castingTime && (
                          <span
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            ⏱ {spell.castingTime}
                          </span>
                        )}
                        {spell.range && (
                          <span
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            🞹 {spell.range}
                          </span>
                        )}
                        {spell.duration && (
                          <span
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            ⧐ {spell.duration}
                          </span>
                        )}
                        {spell.damageEffect && (
                          <span style={{ color: "#e74c3c", fontSize: 12 }}>
                            ⚔️ {spell.damageEffect}
                          </span>
                        )}
                      </div>
                      {spell.description && (
                        <p
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 12,
                            marginTop: 6,
                            lineHeight: 1.5,
                          }}
                        >
                          {spell.description}
                        </p>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginLeft: 8,
                      }}
                    >
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ fontSize: 11, padding: "3px 8px" }}
                        onClick={() =>
                          setConcentrationSpell(isConcentrating ? null : spell)
                        }
                        data-ocid={`spells.concentrate.${i + 1}`}
                      >
                        {isConcentrating ? "◉ Conc." : "○ Conc."}
                      </button>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEdit(spell)}
                          data-ocid={`spells.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(spell.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`spells.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* Tab Note */}
      {noteLoaded && (
        <div className="ds-card" style={{ padding: 16, marginTop: 8 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 13, marginBottom: 8 }}
          >
            SPELLS NOTES
          </h3>
          <textarea
            className="ds-input"
            value={tabNote}
            onChange={(e) => setTabNote(e.target.value)}
            placeholder="Notes for this tab..."
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
            data-ocid="spells.textarea"
          />
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12 }}
              onClick={saveNote}
              disabled={savingNote}
              data-ocid="spells.save_button"
            >
              {savingNote ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      )}

      {/* Spell Form Modal */}
      {showForm && (
        <SpellFormDialog
          form={form}
          schools={[...SCHOOLS, ...customSchools]}
          onField={f}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
          saving={saving}
          editing={!!editing}
        />
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
          data-ocid="spells.modal"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "85vh",
              overflow: "auto",
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
                📚 Spell Library
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
                data-ocid="spells.close_button"
              >
                ×
              </button>
            </div>
            {/* Library Tabs */}
            <div
              style={{
                display: "flex",
                gap: 0,
                marginBottom: 16,
                borderBottom: "1px solid var(--ds-border)",
              }}
            >
              <button
                type="button"
                onClick={() => setLibraryTab("custom")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontFamily: "Cinzel, serif",
                  background: "none",
                  border: "none",
                  borderBottom:
                    libraryTab === "custom"
                      ? "2px solid var(--ds-gold)"
                      : "2px solid transparent",
                  color:
                    libraryTab === "custom"
                      ? "var(--ds-gold)"
                      : "var(--ds-muted)",
                  cursor: "pointer",
                }}
                data-ocid="spells.library_custom_tab"
              >
                My Custom Spells
              </button>
              <button
                type="button"
                onClick={() => {
                  setLibraryTab("srd");
                  loadSrdSpells();
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontFamily: "Cinzel, serif",
                  background: "none",
                  border: "none",
                  borderBottom:
                    libraryTab === "srd"
                      ? "2px solid var(--ds-gold)"
                      : "2px solid transparent",
                  color:
                    libraryTab === "srd" ? "var(--ds-gold)" : "var(--ds-muted)",
                  cursor: "pointer",
                }}
                data-ocid="spells.library_srd_tab"
              >
                D&D 5e SRD Spells
              </button>
            </div>

            {/* Custom Spells Tab */}
            {libraryTab === "custom" && (
              <>
                <input
                  className="ds-input"
                  placeholder="Search custom spells..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  style={{ marginBottom: 12, width: "100%" }}
                />
                {libraryLoading ? (
                  <p
                    style={{ color: "var(--ds-muted)" }}
                    data-ocid="spells.loading_state"
                  >
                    Loading library...
                  </p>
                ) : filteredLibrary.length === 0 ? (
                  <p
                    style={{
                      color: "var(--ds-muted)",
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                    data-ocid="spells.empty_state"
                  >
                    {librarySpells.length === 0
                      ? "No custom spells yet. Add spells in Settings → Custom Spells."
                      : "No spells match your search."}
                  </p>
                ) : (
                  filteredLibrary.map((s) => (
                    <div
                      key={s.id.toString()}
                      className="ds-card2"
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {s.name}
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
                            {s.school}
                          </span>
                          <span
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            {Number(s.level) === 0
                              ? "Cantrip"
                              : `Level ${s.level}`}
                          </span>
                        </div>
                        {s.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 4,
                              lineHeight: 1.5,
                            }}
                          >
                            {s.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="ds-btn-primary"
                        onClick={() => addFromLibrary(s)}
                        disabled={addingFromLib === s.id}
                        style={{
                          fontSize: 12,
                          padding: "6px 12px",
                          fontFamily: "Cinzel, serif",
                          flexShrink: 0,
                        }}
                      >
                        {addingFromLib === s.id ? "Adding..." : "+ Add"}
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            {/* SRD Spells Tab */}
            {libraryTab === "srd" && (
              <>
                <input
                  className="ds-input"
                  placeholder="Search D&D 5e spells by name or school..."
                  value={srdSearch}
                  onChange={(e) => setSrdSearch(e.target.value)}
                  style={{ marginBottom: 12, width: "100%" }}
                />
                {srdLoading ? (
                  <p
                    style={{ color: "var(--ds-muted)" }}
                    data-ocid="spells.srd.loading_state"
                  >
                    Loading SRD spells...
                  </p>
                ) : filteredSrd.length === 0 ? (
                  <p
                    style={{
                      color: "var(--ds-muted)",
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                    data-ocid="spells.srd.empty_state"
                  >
                    {srdSpells.length === 0
                      ? "No SRD spells loaded. Use Settings → Custom Spells → Load D&D 5e Standard Spells."
                      : "No spells match your search."}
                  </p>
                ) : (
                  filteredSrd.map((s, idx) => (
                    <div
                      key={`${s.name}-${idx}`}
                      className="ds-card2"
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {s.name}
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
                            {s.school}
                          </span>
                          <span
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            {Number(s.level) === 0
                              ? "Cantrip"
                              : `Level ${s.level}`}
                          </span>
                          {s.components && (
                            <span
                              style={{ color: "var(--ds-muted)", fontSize: 11 }}
                            >
                              ({s.components})
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            marginTop: 4,
                            flexWrap: "wrap",
                          }}
                        >
                          {s.castingTime && (
                            <span
                              style={{ color: "var(--ds-muted)", fontSize: 11 }}
                            >
                              ⏱ {s.castingTime}
                            </span>
                          )}
                          {s.range && (
                            <span
                              style={{ color: "var(--ds-muted)", fontSize: 11 }}
                            >
                              🞹 {s.range}
                            </span>
                          )}
                          {s.duration && (
                            <span
                              style={{ color: "var(--ds-muted)", fontSize: 11 }}
                            >
                              ⧐ {s.duration}
                            </span>
                          )}
                        </div>
                        {s.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 4,
                              lineHeight: 1.5,
                            }}
                          >
                            {s.description.length > 200
                              ? `${s.description.slice(0, 200)}…`
                              : s.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="ds-btn-primary"
                        onClick={() => addFromSrd(s)}
                        disabled={addingFromSrd === `${s.name}-${s.level}`}
                        style={{
                          fontSize: 12,
                          padding: "6px 12px",
                          fontFamily: "Cinzel, serif",
                          flexShrink: 0,
                        }}
                        data-ocid={`spells.srd.add_button.${idx + 1}`}
                      >
                        {addingFromSrd === `${s.name}-${s.level}`
                          ? "Adding..."
                          : "+ Add"}
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SpellFormDialog({
  form,
  schools,
  onField,
  onSave,
  onClose,
  saving,
  editing,
}: {
  form: Record<string, string | number>;
  schools: string[];
  onField: (k: string, v: string | number) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  editing: boolean;
}) {
  return (
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
      data-ocid="spells.dialog"
    >
      <div
        className="ds-card"
        style={{
          width: "100%",
          maxWidth: 560,
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
            marginBottom: 16,
          }}
        >
          <h2
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 18 }}
          >
            {editing ? "Edit Spell" : "Add Spell"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--ds-muted)",
              cursor: "pointer",
              fontSize: 20,
            }}
            data-ocid="spells.close_button"
          >
            ×
          </button>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span className="ds-label">Spell Name *</span>
            <input
              className="ds-input"
              value={form.name as string}
              onChange={(e) => onField("name", e.target.value)}
              placeholder="e.g. Fireball"
              data-ocid="spells.input"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">Level (0 = Cantrip)</span>
            <input
              className="ds-input"
              type="number"
              min={0}
              max={9}
              value={form.level as number}
              onChange={(e) =>
                onField("level", Number.parseInt(e.target.value) || 0)
              }
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">School</span>
            <select
              className="ds-input"
              value={form.school as string}
              onChange={(e) => onField("school", e.target.value)}
            >
              {schools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {(
            [
              ["castingTime", "Casting Time"],
              ["range", "Range"],
              ["components", "Components"],
              ["duration", "Duration"],
              ["damageEffect", "Damage / Effect"],
            ] as [string, string][]
          ).map(([k, l]) => (
            <label
              key={k}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <span className="ds-label">{l}</span>
              <input
                className="ds-input"
                value={form[k] as string}
                onChange={(e) => onField(k, e.target.value)}
              />
            </label>
          ))}
          <label
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span className="ds-label">Description</span>
            <textarea
              className="ds-input"
              value={form.description as string}
              onChange={(e) => onField("description", e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
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
            onClick={onClose}
            data-ocid="spells.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={onSave}
            disabled={saving || !(form.name as string).trim()}
            style={{ fontFamily: "Cinzel, serif" }}
            data-ocid="spells.submit_button"
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Spell"}
          </button>
        </div>
      </div>
    </div>
  );
}

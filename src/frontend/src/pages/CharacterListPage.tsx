import { useCallback, useEffect, useRef, useState } from "react";
import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import NewCharacterDialog from "../components/NewCharacterDialog";
import type { Character, DndBackend, ImportCharacterInput } from "../types";

interface Props {
  actor: DndBackend;
  onSelectCharacter: (id: bigint) => void;
  onRestartConnection?: () => void;
}

type CharWithId = { id: bigint } & Character;

export default function CharacterListPage({
  actor,
  onSelectCharacter,
  onRestartConnection,
}: Props) {
  const [characters, setCharacters] = useState<CharWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [exportingId, setExportingId] = useState<bigint | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<bigint | null>(null);
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await actor.getAllCharacters()) as unknown as [
        bigint,
        Character,
      ][];
      // Fix 6: guard against non-array backend response
      const safeResult = Array.isArray(result) ? result : [];
      setCharacters(safeResult.map(([id, char]) => ({ id, ...char })));
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      console.error(e);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: bigint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this character?")) return;
    await actor.deleteCharacter(id);
    await load();
  };

  const handleExport = async (
    id: bigint,
    name: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setExportingId(id);
    try {
      const json = await actor.exportCharacter(id);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${String(err)}`);
    } finally {
      setExportingId(null);
    }
  };

  const handleDuplicate = async (
    id: bigint,
    name: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!confirm(`Duplicate "${name}"?`)) return;
    setDuplicatingId(id);
    try {
      const json = await actor.exportCharacter(id);
      const parsed = JSON.parse(json);
      // Map only fields required by ImportCharacterInput (omit owner and other server-managed fields)
      const input: ImportCharacterInput = {
        name: `${String(parsed.name ?? name)} (Copy)`,
        race: String(parsed.race ?? ""),
        characterClass: String(parsed.characterClass ?? ""),
        background: String(parsed.background ?? ""),
        gender: String(parsed.gender ?? ""),
        alignment: String(parsed.alignment ?? ""),
        notes: String(parsed.notes ?? ""),
        level: BigInt(parsed.level ?? 1),
        ac: BigInt(parsed.ac ?? 10),
        hpCurrent: BigInt(parsed.hpCurrent ?? 0),
        hpMax: BigInt(parsed.hpMax ?? 0),
        speed: BigInt(parsed.speed ?? 30),
        initiative: BigInt(parsed.initiative ?? 0),
        proficiencyBonus: BigInt(parsed.proficiencyBonus ?? 2),
        gold: BigInt(parsed.gold ?? 0),
        str: BigInt(parsed.str ?? 10),
        dex: BigInt(parsed.dex ?? 10),
        con: BigInt(parsed.con ?? 10),
        int: BigInt(parsed.int ?? 10),
        wis: BigInt(parsed.wis ?? 10),
        cha: BigInt(parsed.cha ?? 10),
        spellSlots: Array.isArray(parsed.spellSlots)
          ? parsed.spellSlots.map((s: unknown) => BigInt(s as number))
          : [],
        skills: parsed.skills ?? {
          acrobatics: false,
          animalHandling: false,
          arcana: false,
          athletics: false,
          deception: false,
          description: "",
          history: false,
          insight: false,
          intimidation: false,
          investigation: false,
          medicine: false,
          nature: false,
          perception: false,
          performance: false,
          persuasion: false,
          religion: false,
          sleightOfHand: false,
          stealth: false,
          survival: false,
        },
        portraitUrl: String(parsed.portraitUrl ?? ""),
      };
      await actor.importCharacter(input);
      await load();
    } catch (err) {
      alert(`Duplicate failed: ${String(err)}`);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const newId = await actor.importCharacter(parsed);
      await load();
      onSelectCharacter(newId);
    } catch (err) {
      alert(`Import failed: ${String(err)}`);
    } finally {
      setImporting(false);
      // Reset file input so same file can be re-imported
      if (importRef.current) importRef.current.value = "";
    }
  };

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h1
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 28 }}
        >
          My Characters
        </h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Import button */}
          <label
            style={{
              cursor: importing ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
            data-ocid="characters.upload_button"
          >
            <span
              className="ds-btn-ghost"
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 13,
                padding: "8px 14px",
                opacity: importing ? 0.6 : 1,
                userSelect: "none",
              }}
            >
              {importing ? "Importing..." : "⬆ Import Character"}
            </span>
            <input
              ref={importRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              disabled={importing}
              style={{ display: "none" }}
            />
          </label>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={() => setShowNew(true)}
            style={{ fontFamily: "Cinzel, serif" }}
            data-ocid="characters.primary_button"
          >
            + New Character
          </button>
        </div>
      </div>

      {loading ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 48,
          }}
          data-ocid="characters.loading_state"
        >
          Loading characters...
        </p>
      ) : characters.length === 0 ? (
        <div
          style={{ textAlign: "center", marginTop: 64 }}
          data-ocid="characters.empty_state"
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
          <p
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 20, marginBottom: 8 }}
          >
            No Characters Yet
          </p>
          <p style={{ color: "var(--ds-muted)", marginBottom: 24 }}>
            Create your first character to begin your adventure.
          </p>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={() => setShowNew(true)}
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Create Character
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {characters.map((char, idx) => (
            <div
              key={char.id.toString()}
              style={{ position: "relative" }}
              data-ocid={`characters.item.${idx + 1}`}
            >
              <button
                type="button"
                className="ds-card clickable"
                style={{
                  padding: 20,
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "block",
                  paddingBottom: 54,
                }}
                onClick={() => onSelectCharacter(char.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ paddingRight: 28 }}>
                    <h2
                      className="font-cinzel"
                      style={{
                        color: "var(--ds-gold)",
                        fontSize: 18,
                        marginBottom: 4,
                      }}
                    >
                      {char.name}
                    </h2>
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 13,
                        marginBottom: 2,
                      }}
                    >
                      {char.race} · {char.characterClass}
                    </p>
                    <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
                      Level {char.level.toString()}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {(["str", "dex", "con", "int", "wis", "cha"] as const).map(
                    (stat) => (
                      <div
                        key={stat}
                        style={{
                          backgroundColor: "var(--ds-surface2)",
                          border: "1px solid var(--ds-border)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          textAlign: "center",
                          minWidth: 36,
                        }}
                      >
                        <div
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 10,
                            textTransform: "uppercase",
                          }}
                        >
                          {stat}
                        </div>
                        <div
                          style={{
                            color: "var(--ds-text)",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {char[stat].toString()}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <span style={{ color: "#e74c3c", fontSize: 13 }}>
                    HP {char.hpCurrent.toString()}/{char.hpMax.toString()}
                  </span>
                  <span style={{ color: "var(--ds-muted)", fontSize: 13 }}>
                    AC {char.ac.toString()}
                  </span>
                </div>
              </button>

              {/* Action buttons overlay at bottom of card */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: "flex",
                  gap: 4,
                  padding: "8px 12px",
                  borderTop: "1px solid var(--ds-border)",
                  backgroundColor: "var(--ds-surface)",
                  borderRadius: "0 0 8px 8px",
                }}
              >
                <button
                  type="button"
                  onClick={(e) => handleExport(char.id, char.name, e)}
                  disabled={exportingId === char.id}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid var(--ds-border)",
                    color:
                      exportingId === char.id
                        ? "var(--ds-muted)"
                        : "var(--ds-muted)",
                    cursor: exportingId === char.id ? "wait" : "pointer",
                    padding: "4px 6px",
                    borderRadius: 5,
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                  }}
                  title="Export character as JSON"
                  data-ocid={`characters.export_button.${idx + 1}`}
                >
                  {exportingId === char.id ? "⏳" : "⬇"} Export
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDuplicate(char.id, char.name, e)}
                  disabled={duplicatingId === char.id}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid var(--ds-border)",
                    color: "var(--ds-muted)",
                    cursor: duplicatingId === char.id ? "wait" : "pointer",
                    padding: "4px 6px",
                    borderRadius: 5,
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                  }}
                  title="Duplicate this character"
                  data-ocid={`characters.duplicate_button.${idx + 1}`}
                >
                  {duplicatingId === char.id ? "⏳" : "⧉"} Duplicate
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(char.id, e)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    padding: "4px 6px",
                    fontSize: 15,
                  }}
                  title="Delete character"
                  data-ocid={`characters.delete_button.${idx + 1}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <NewCharacterDialog
          actor={actor}
          onClose={() => setShowNew(false)}
          onCreated={async (id) => {
            setShowNew(false);
            onSelectCharacter(id);
          }}
        />
      )}
    </div>
  );
}

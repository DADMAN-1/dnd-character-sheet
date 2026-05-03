import { useCallback, useEffect, useRef, useState } from "react";
import NewCharacterDialog from "../components/NewCharacterDialog";
import AbilitiesTab from "../components/tabs/AbilitiesTab";
import AlliesTab from "../components/tabs/AlliesTab";
import AttacksTab from "../components/tabs/AttacksTab";
import CharacterRelationshipsTab from "../components/tabs/CharacterRelationshipsTab";
import InjuryTrackerTab from "../components/tabs/InjuryTrackerTab";
import PersonalLootTab from "../components/tabs/PersonalLootTab";
import RivalsTab from "../components/tabs/RivalsTab";

import {
  CanisterErrorUI,
  isCanisterStopped,
} from "../components/ErrorBoundary";
import ConditionsTab from "../components/tabs/ConditionsTab";
import CustomStatsTab from "../components/tabs/CustomStatsTab";
import EquipmentTab from "../components/tabs/EquipmentTab";
import FeatsTab from "../components/tabs/FeatsTab";
import FeaturesTab from "../components/tabs/FeaturesTab";
import InventoryTab from "../components/tabs/InventoryTab";
import LanguagesTab from "../components/tabs/LanguagesTab";
import MulticlassTab from "../components/tabs/MulticlassTab";
import NotesTab from "../components/tabs/NotesTab";
import ProficienciesTab from "../components/tabs/ProficienciesTab";
import QuestsTab from "../components/tabs/QuestsTab";
import SkillsTab from "../components/tabs/SkillsTab";
import SpellsTab from "../components/tabs/SpellsTab";
import StatsTab from "../components/tabs/StatsTab";
import TrackersTab from "../components/tabs/TrackersTab";
import type { Character, DndBackend } from "../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
  onBack: () => void;
  onRestartConnection?: () => void;
}

type Tab =
  | "stats"
  | "spells"
  | "inventory"
  | "features"
  | "abilities"
  | "attacks"
  | "feats"
  | "skills"
  | "proficiencies"
  | "languages"
  | "allies"
  | "notes"
  | "customstats"
  | "trackers"
  | "equipment"
  | "quests"
  | "relationships"
  | "injuries"
  | "personalloot"
  | "rivals"
  | "multiclass"
  | "conditions";

export default function CharacterSheetPage({
  actor,
  characterId,
  onBack,
  onRestartConnection,
}: Props) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [canisterStopped, setCanisterStopped] = useState(false);
  const [tab, setTab] = useState<Tab>("stats");
  const [showEdit, setShowEdit] = useState(false);

  // Portrait
  const [portraitUploading, setPortraitUploading] = useState(false);
  const portraitRef = useRef<HTMLInputElement>(null);

  const loadCharacter = useCallback(async () => {
    setLoading(true);
    try {
      const char = await actor.getCharacter(characterId);
      setCharacter(char);
    } catch (e) {
      if (isCanisterStopped(e)) {
        setCanisterStopped(true);
        setLoading(false);
        return;
      }
      console.error("Failed to load character:", e);
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  }, [actor, characterId]);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !character) return;
    setPortraitUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const url = reader.result as string;
      try {
        await actor.updateCharacterPortrait(characterId, url);
        await loadCharacter();
      } catch (err) {
        console.error("Portrait upload failed:", err);
      } finally {
        setPortraitUploading(false);
      }
    };
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const handlePrint = () => {
    window.print();
  };

  if (canisterStopped)
    return <CanisterErrorUI onRestartConnection={onRestartConnection} />;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <p style={{ color: "var(--ds-muted)" }}>Loading character...</p>
      </div>
    );

  if (!character)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
        }}
      >
        <p style={{ color: "var(--ds-muted)" }}>Character not found.</p>
        <button type="button" className="ds-btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>
    );

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: "Stats" },
    { id: "spells", label: "Spells" },
    { id: "inventory", label: "Inventory" },
    { id: "equipment", label: "Equipment" },
    { id: "features", label: "Features" },
    { id: "abilities", label: "Abilities" },
    { id: "attacks", label: "Attacks" },
    { id: "feats", label: "Feats" },
    { id: "skills", label: "Skills" },
    { id: "proficiencies", label: "Proficiencies" },
    { id: "languages", label: "Languages" },
    { id: "allies", label: "Allies" },
    { id: "notes", label: "Notes" },
    { id: "trackers", label: "Trackers" },
    { id: "quests", label: "Quests" },
    { id: "customstats", label: "Custom Stats" },
    { id: "relationships", label: "Relationships" },
    { id: "injuries", label: "Injuries" },
    { id: "personalloot", label: "Personal Loot" },
    { id: "rivals", label: "Rivals" },
    { id: "multiclass", label: "Multiclass" },
    { id: "conditions", label: "Conditions" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
        className="no-print"
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Portrait */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              type="button"
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                border: "2px solid var(--ds-border)",
                overflow: "hidden",
                backgroundColor: "var(--ds-surface)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                position: "relative",
              }}
              onClick={() => !portraitUploading && portraitRef.current?.click()}
              aria-label="Upload character portrait"
              title="Click to upload portrait"
              data-ocid="character.portrait.upload_button"
            >
              {character.portraitUrl ? (
                <img
                  src={character.portraitUrl}
                  alt={`${character.name} portrait`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span style={{ fontSize: 28, color: "var(--ds-muted)" }}>
                  👤
                </span>
              )}
              {portraitUploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 12 }}>...</span>
                </div>
              )}
            </button>
            <input
              ref={portraitRef}
              type="file"
              accept="image/*"
              onChange={handlePortraitUpload}
              style={{ display: "none" }}
            />
          </div>

          <div>
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={onBack}
              style={{ marginBottom: 4, fontSize: 13 }}
              data-ocid="character.link"
            >
              ← All Characters
            </button>
            <h1
              className="font-cinzel"
              style={{ color: "var(--ds-gold)", fontSize: 26, lineHeight: 1.2 }}
            >
              {character.name}
            </h1>
            <p style={{ color: "var(--ds-muted)", fontSize: 14, marginTop: 4 }}>
              {character.race} · {character.characterClass} · Level{" "}
              {character.level.toString()}
              {character.background ? ` · ${character.background}` : ""}
              {character.alignment ? ` · ${character.alignment}` : ""}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={handlePrint}
            style={{ fontSize: 13 }}
            data-ocid="character.print_button"
            title="Print character sheet"
          >
            🖨 Print
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={() => setShowEdit(true)}
            style={{ fontFamily: "Cinzel, serif" }}
            data-ocid="character.edit_button"
          >
            Edit Character
          </button>
        </div>
      </div>

      {/* Quick Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          backgroundColor: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 10,
          padding: "12px 16px",
        }}
      >
        <QuickStat
          label="HP"
          value={`${character.hpCurrent}/${character.hpMax}`}
          color="#e74c3c"
        />
        <QuickStat label="AC" value={character.ac.toString()} />
        <QuickStat label="Speed" value={`${character.speed} ft`} />
        <QuickStat
          label="Initiative"
          value={
            character.initiative >= 0n
              ? `+${character.initiative}`
              : character.initiative.toString()
          }
        />
        <QuickStat
          label="Proficiency"
          value={`+${character.proficiencyBonus}`}
        />
        <QuickStat
          label="Level"
          value={character.level.toString()}
          color="var(--ds-gold)"
        />
      </div>

      {/* Scrollable tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--ds-border)",
          marginBottom: 20,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
        className="no-print"
      >
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            data-ocid={`character.${t.id}.tab`}
            style={{
              background: "transparent",
              border: "none",
              borderBottom:
                tab === t.id
                  ? "2px solid var(--ds-gold)"
                  : "2px solid transparent",
              color: tab === t.id ? "var(--ds-gold)" : "var(--ds-muted)",
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Cinzel, serif",
              whiteSpace: "nowrap",
              marginBottom: -1,
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <StatsTab
          actor={actor}
          character={character}
          characterId={characterId}
          onUpdate={loadCharacter}
        />
      )}
      {tab === "spells" && (
        <SpellsTab
          actor={actor}
          character={character}
          characterId={characterId}
          onUpdate={loadCharacter}
        />
      )}
      {tab === "inventory" && (
        <InventoryTab
          actor={actor}
          character={character}
          characterId={characterId}
          onUpdate={loadCharacter}
        />
      )}
      {tab === "equipment" && (
        <EquipmentTab
          actor={actor}
          characterId={characterId}
          character={character}
          onUpdate={loadCharacter}
        />
      )}
      {tab === "features" && (
        <FeaturesTab actor={actor} characterId={characterId} />
      )}
      {tab === "abilities" && (
        <AbilitiesTab actor={actor} characterId={characterId} />
      )}
      {tab === "attacks" && (
        <AttacksTab actor={actor} characterId={characterId} />
      )}
      {tab === "feats" && <FeatsTab actor={actor} characterId={characterId} />}
      {tab === "skills" && (
        <SkillsTab actor={actor} characterId={characterId} />
      )}
      {tab === "proficiencies" && (
        <ProficienciesTab actor={actor} characterId={characterId} />
      )}
      {tab === "languages" && (
        <LanguagesTab actor={actor} characterId={characterId} />
      )}
      {tab === "allies" && (
        <AlliesTab actor={actor} characterId={characterId} />
      )}
      {tab === "notes" && (
        <NotesTab
          actor={actor}
          character={character}
          characterId={characterId}
          onUpdate={loadCharacter}
        />
      )}
      {tab === "trackers" && (
        <TrackersTab actor={actor} characterId={characterId} />
      )}
      {tab === "quests" && (
        <QuestsTab actor={actor} characterId={characterId} />
      )}
      {tab === "customstats" && (
        <CustomStatsTab actor={actor} characterId={characterId} />
      )}
      {tab === "relationships" && (
        <CharacterRelationshipsTab actor={actor} characterId={characterId} />
      )}
      {tab === "injuries" && (
        <InjuryTrackerTab actor={actor} characterId={characterId} />
      )}
      {tab === "personalloot" && (
        <PersonalLootTab actor={actor} characterId={characterId} />
      )}
      {tab === "rivals" && (
        <RivalsTab actor={actor} characterId={characterId} />
      )}
      {tab === "multiclass" && (
        <MulticlassTab
          actor={actor}
          characterId={Number(characterId)}
          onRestartConnection={onRestartConnection}
        />
      )}
      {tab === "conditions" && (
        <ConditionsTab
          actor={actor}
          characterId={Number(characterId)}
          onRestartConnection={onRestartConnection}
        />
      )}

      {showEdit && (
        <NewCharacterDialog
          actor={actor}
          existing={{ id: characterId, char: character }}
          onClose={() => setShowEdit(false)}
          onCreated={async () => {
            setShowEdit(false);
            await loadCharacter();
          }}
        />
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .ds-card, .ds-card2 {
            border: 1px solid #ccc !important;
            background: white !important;
            color: black !important;
            break-inside: avoid;
          }
          * { color: black !important; background: transparent !important; }
        }
      `}</style>
    </div>
  );
}

function QuickStat({
  label,
  value,
  color,
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div
        style={{
          color: "var(--ds-muted)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: color ?? "var(--ds-text)",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

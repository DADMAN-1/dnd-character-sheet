import { useCallback, useEffect, useState } from "react";
import {
  emptyCommandStructure,
  emptyIntelligence,
  emptyLogistics,
  emptyMoraleData,
  emptyNotes,
} from "../components/tabs/army/armyHelpers";
import type {
  Ally,
  Army,
  CharacterAbility,
  CharacterAbilityId,
  CharacterCustomStat,
  CharacterFeat,
  CharacterId,
  CharacterPhysicalAttack,
  CharacterPhysicalAttackId,
  CharacterProficiency,
  CharacterSkill,
  CurrencyState,
  DeathSaveState,
  DndBackend,
  HPState,
  InventoryItem,
  InventoryItemId,
  Language,
  SaveThrowState,
  Spell,
  SpellId,
  SpellSlotState,
  TabNote,
  Trait,
  TraitId,
} from "../types";

interface CharacterDataState {
  // HP & Combat
  hpState: HPState | null;
  deathSaves: DeathSaveState | null;
  saveThrows: SaveThrowState | null;
  // Currency
  currency: CurrencyState | null;
  // Spell slots
  spellSlots: SpellSlotState[];
  // Spells, attacks, abilities
  spells: Array<[SpellId, Spell]>;
  attacks: Array<[CharacterPhysicalAttackId, CharacterPhysicalAttack]>;
  abilities: Array<[CharacterAbilityId, CharacterAbility]>;
  // Inventory
  items: Array<[InventoryItemId, InventoryItem]>;
  // Traits/feats
  traits: Array<[TraitId, Trait]>;
  feats: CharacterFeat[];
  // Skills & proficiencies
  skills: CharacterSkill[];
  proficiencies: CharacterProficiency[];
  // Languages & allies
  languages: Language[];
  allies: Ally[];
  // Custom stats
  customStats: CharacterCustomStat[];
  // Armies
  armies: Army[];
  // Tab notes (keyed by tab name)
  tabNotes: Record<string, TabNote>;
  // Loading
  loading: boolean;
  error: string | null;
}

const defaultState: CharacterDataState = {
  hpState: null,
  deathSaves: null,
  saveThrows: null,
  currency: null,
  spellSlots: [],
  spells: [],
  attacks: [],
  abilities: [],
  items: [],
  traits: [],
  feats: [],
  skills: [],
  proficiencies: [],
  languages: [],
  allies: [],
  customStats: [],
  armies: [],
  tabNotes: {},
  loading: false,
  error: null,
};

/**
 * Loads all per-character data for a given characterId in parallel.
 * Call `reload()` to refresh all data after mutations.
 */
export function useCharacterData(
  actor: DndBackend | null,
  characterId: CharacterId,
) {
  const [state, setState] = useState<CharacterDataState>(defaultState);

  const load = useCallback(async () => {
    if (!actor) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [
        hpState,
        deathSaves,
        saveThrows,
        currency,
        spellSlots,
        spells,
        attacks,
        abilities,
        items,
        traits,
        feats,
        skills,
        proficiencies,
        languages,
        allies,
        customStats,
        armies,
      ] = await Promise.all([
        actor.getHPState(characterId).catch(() => null),
        actor.getDeathSaveState(characterId).catch(() => null),
        actor.getSaveThrowState(characterId).catch(() => null),
        actor.getCurrencyState(characterId).catch(() => null),
        actor
          .getSpellSlotsByCharacter(characterId)
          .catch(() => [] as SpellSlotState[]),
        actor
          .getSpellsByCharacter(characterId)
          .catch(() => [] as Array<[SpellId, Spell]>),
        actor
          .getPhysicalAttacksByCharacter(characterId)
          .catch(
            () =>
              [] as Array<[CharacterPhysicalAttackId, CharacterPhysicalAttack]>,
          ),
        actor
          .getAbilitiesByCharacter(characterId)
          .catch(() => [] as Array<[CharacterAbilityId, CharacterAbility]>),
        actor
          .getItemsByCharacter(characterId)
          .catch(() => [] as Array<[InventoryItemId, InventoryItem]>),
        actor
          .getTraitsByCharacter(characterId)
          .catch(() => [] as Array<[TraitId, Trait]>),
        actor
          .getCharacterFeatsByCharacter(characterId)
          .catch(() => [] as CharacterFeat[]),
        actor
          .getCharacterSkillsByCharacter(characterId)
          .catch(() => [] as CharacterSkill[]),
        actor
          .getCharacterProficienciesByCharacter(characterId)
          .catch(() => [] as CharacterProficiency[]),
        actor
          .getLanguagesByCharacter(characterId)
          .catch(() => [] as Language[]),
        actor.getAlliesByCharacter(characterId).catch(() => [] as Ally[]),
        actor
          .getCharacterCustomStatsByCharacter(characterId)
          .catch(() => [] as CharacterCustomStat[]),
        actor.getArmiesByCharacter(characterId).catch(() => [] as Army[]),
      ]);

      // Apply defensive defaults to all army objects — backend may return missing/null fields
      // if the Army schema was updated after the army was first saved.
      const armiesArray = Array.isArray(armies) ? armies : [];
      const safArmies = armiesArray.map((a) => ({
        ...a,
        branches: a.branches ?? [],
        officers: a.officers ?? [],
        commanders: a.commanders ?? [],
        ranks: a.ranks ?? [],
        specOpsGroups: a.specOpsGroups ?? [],
        armyAbilities: a.armyAbilities ?? [],
        officerAbilities: a.officerAbilities ?? [],
        commanderAbilities: a.commanderAbilities ?? [],
        machinery: a.machinery ?? [],
        alliedArmies: a.alliedArmies ?? [],
        specialties: a.specialties ?? [],
        logistics: a.logistics
          ? {
              ...emptyLogistics(),
              ...a.logistics,
              supplyLines: a.logistics.supplyLines ?? [],
              casualtiesLog: a.logistics.casualtiesLog ?? [],
            }
          : emptyLogistics(),
        commandStructure: a.commandStructure
          ? {
              ...emptyCommandStructure(),
              ...a.commandStructure,
              chainOfCommand: a.commandStructure.chainOfCommand ?? [],
              ordersLog: a.commandStructure.ordersLog ?? [],
            }
          : emptyCommandStructure(),
        intelligence: a.intelligence
          ? {
              ...emptyIntelligence(),
              ...a.intelligence,
              enemyIntelLog: a.intelligence.enemyIntelLog ?? [],
              scoutReports: a.intelligence.scoutReports ?? [],
            }
          : emptyIntelligence(),
        moraleData: a.moraleData
          ? {
              ...emptyMoraleData(),
              ...a.moraleData,
              moraleEventsLog: a.moraleData.moraleEventsLog ?? [],
              loyaltyTracker: a.moraleData.loyaltyTracker ?? [],
            }
          : emptyMoraleData(),
        armyNotes: a.armyNotes
          ? {
              ...emptyNotes(),
              ...a.armyNotes,
              campaignLog: a.armyNotes.campaignLog ?? [],
              battlePlannerNotes: a.armyNotes.battlePlannerNotes ?? [],
            }
          : emptyNotes(),
      }));

      setState({
        hpState,
        deathSaves,
        saveThrows,
        currency,
        // Fix 3: Guard every array from the backend — never assume it is an array.
        spellSlots: Array.isArray(spellSlots) ? spellSlots : [],
        spells: Array.isArray(spells) ? spells : [],
        attacks: Array.isArray(attacks) ? attacks : [],
        abilities: Array.isArray(abilities) ? abilities : [],
        items: Array.isArray(items) ? items : [],
        traits: Array.isArray(traits) ? traits : [],
        feats: Array.isArray(feats) ? feats : [],
        skills: Array.isArray(skills) ? skills : [],
        proficiencies: Array.isArray(proficiencies) ? proficiencies : [],
        languages: Array.isArray(languages) ? languages : [],
        allies: Array.isArray(allies) ? allies : [],
        customStats: Array.isArray(customStats) ? customStats : [],
        armies: safArmies,
        tabNotes: {},
        loading: false,
        error: null,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load character data",
      }));
    } finally {
      // Guarantee loading is always cleared, even on unexpected throws
      setState((s) => (s.loading ? { ...s, loading: false } : s));
    }
  }, [actor, characterId]);

  const loadTabNote = useCallback(
    async (tabName: string) => {
      if (!actor) return;
      try {
        const note = await actor.getTabNote(characterId, tabName);
        if (note) {
          setState((s) => ({
            ...s,
            tabNotes: { ...s.tabNotes, [tabName]: note },
          }));
        }
      } catch {
        // silently ignore tab note fetch errors
      }
    },
    [actor, characterId],
  );

  useEffect(() => {
    if (actor && characterId !== undefined) {
      load();
    }
  }, [actor, characterId, load]);

  return { ...state, reload: load, loadTabNote };
}

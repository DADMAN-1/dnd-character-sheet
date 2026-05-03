import type { Principal } from "@icp-sdk/core/principal";

export type CharacterId = bigint;
export type TraitId = bigint;
export type RaceId = bigint;
export type SpellId = bigint;
export type ClassId = bigint;
export type InventoryItemId = bigint;
export type CustomSpellId = bigint;
export type CustomItemId = bigint;
export type CustomAbilityId = bigint;
export type CharacterAbilityId = bigint;
export type CustomPhysicalAttackId = bigint;
export type CharacterPhysicalAttackId = bigint;
export type CustomSpellSchoolId = bigint;

export interface Abilities {
  str: bigint;
  dex: bigint;
  con: bigint;
  int: bigint;
  wis: bigint;
  cha: bigint;
}

export interface Spell {
  duration: string;
  school: string;
  name: string;
  damageEffect: string;
  components: string;
  description: string;
  level: bigint;
  characterId: bigint;
  range: string;
  castingTime: string;
}

export interface Trait {
  source: string;
  name: string;
  description: string;
  characterId: bigint;
}

export interface CustomClass {
  name: string;
  hitDie: bigint;
  description: string;
  proficiencies: string[];
  features: Trait[];
}

export interface SkillProficiencies {
  perception: boolean;
  animalHandling: boolean;
  nature: boolean;
  investigation: boolean;
  deception: boolean;
  sleightOfHand: boolean;
  acrobatics: boolean;
  description: string;
  athletics: boolean;
  history: boolean;
  persuasion: boolean;
  medicine: boolean;
  stealth: boolean;
  survival: boolean;
  insight: boolean;
  intimidation: boolean;
  performance: boolean;
  arcana: boolean;
  religion: boolean;
}

/** Alias matching the name used in backend.d.ts */
export type Skills = SkillProficiencies;

export interface Character {
  ac: bigint;
  cha: bigint;
  con: bigint;
  dex: bigint;
  int: bigint;
  str: bigint;
  wis: bigint;
  spellSlots: Array<bigint>;
  characterClass: string;
  background: string;
  hpMax: bigint;
  owner: Principal;
  gold: bigint;
  name: string;
  race: string;
  hpCurrent: bigint;
  level: bigint;
  speed: bigint;
  gender: string;
  notes: string;
  portraitUrl: string;
  skills: SkillProficiencies;
  proficiencyBonus: bigint;
  alignment: string;
  initiative: bigint;
}

export interface InventoryItem {
  weight: bigint;
  name: string;
  description: string;
  equipped: boolean;
  quantity: bigint;
  characterId: bigint;
}

export interface Settings {
  maxLevel: bigint;
}

// Backend type - no linked content fields
export interface CustomRace {
  name: string;
  description: string;
  speed: bigint;
  abilityBonuses: Abilities;
  traits: Trait[];
}

// Separate type for race-linked content
export interface RaceLinkedContent {
  linkedSpellIds: bigint[];
  linkedAbilityIds: bigint[];
  linkedAttackIds: bigint[];
}

export interface CustomSpell {
  name: string;
  level: bigint;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  damageEffect: string;
  description: string;
  owner: Principal;
}

export interface CustomItem {
  name: string;
  description: string;
  weight: string;
  value: string;
  itemType: string;
  rarity: string;
  owner: Principal;
}

export interface CustomAbility {
  owner: Principal;
  name: string;
  description: string;
  abilityType: string;
  uses: bigint;
  rechargeOn: string;
}

export interface CharacterAbility {
  characterId: CharacterId;
  name: string;
  description: string;
  abilityType: string;
  uses: bigint;
  usesRemaining: bigint;
  rechargeOn: string;
}

export interface CustomPhysicalAttack {
  name: string;
  description: string;
  damageDice: string;
  attackBonus: bigint;
  damageType: string;
  range: string;
  properties: string;
  owner: Principal;
}

export interface CharacterPhysicalAttack {
  characterId: CharacterId;
  name: string;
  description: string;
  damageDice: string;
  attackBonus: bigint;
  damageType: string;
  range: string;
  properties: string;
  timesUsed: bigint;
}

export interface CustomSpellSchool {
  name: string;
  owner: Principal;
}

export interface UserProfile {
  name: string;
}

// --- New types for feature expansion ---

export interface HPState {
  characterId: bigint;
  hpCurrent: bigint;
  hpMax: bigint;
  hpTemp: bigint;
}

export interface SpellSlotState {
  characterId: bigint;
  spellLevel: bigint;
  used: bigint;
  total: bigint;
}

export interface DeathSaveState {
  characterId: bigint;
  successes: bigint;
  failures: bigint;
}

export interface CurrencyState {
  characterId: bigint;
  gold: bigint;
  silver: bigint;
  copper: bigint;
  platinum: bigint;
  electrum: bigint;
}

export interface Language {
  id: bigint;
  characterId: bigint;
  name: string;
}

export interface Ally {
  id: bigint;
  characterId: bigint;
  name: string;
  relationship: string;
  notes: string;
}

export interface CharacterFeat {
  id: bigint;
  characterId: bigint;
  name: string;
  description: string;
}

export interface CustomSkill {
  id: bigint;
  name: string;
  statBased: string;
  description: string;
  owner: Principal;
}

export interface CustomFeat {
  id: bigint;
  name: string;
  description: string;
  prerequisites: string;
  owner: Principal;
}

export interface CharacterSkill {
  id: bigint;
  characterId: bigint;
  skillName: string;
  proficient: boolean;
  expertise: boolean;
}

export interface TabNote {
  id: bigint;
  characterId: bigint;
  tabName: string;
  content: string;
}

export interface SaveThrowState {
  characterId: bigint;
  strProf: boolean;
  dexProf: boolean;
  conProf: boolean;
  intProf: boolean;
  wisProf: boolean;
  chaProf: boolean;
}

export interface CharacterProficiency {
  id: bigint;
  characterId: bigint;
  profType: string;
  name: string;
}

export interface CustomStat {
  id: bigint;
  name: string;
  description: string;
  defaultValue: string;
  owner: Principal;
}

export interface CharacterCustomStat {
  id: bigint;
  characterId: bigint;
  statId: bigint;
  statName: string;
  value: string;
  owner: Principal;
}

export interface ImportCharacterInput {
  ac: bigint;
  cha: bigint;
  con: bigint;
  dex: bigint;
  int: bigint;
  str: bigint;
  wis: bigint;
  spellSlots: Array<bigint>;
  characterClass: string;
  background: string;
  hpMax: bigint;
  gold: bigint;
  name: string;
  race: string;
  hpCurrent: bigint;
  level: bigint;
  speed: bigint;
  gender: string;
  notes: string;
  portraitUrl: string;
  skills: SkillProficiencies;
  proficiencyBonus: bigint;
  alignment: string;
  initiative: bigint;
}

// --- New types for additional features (from backend bindings) ---

export interface ConcentrationState {
  concentrationSpellId?: string;
  concentrationSpellName?: string;
}

export interface RestState {
  shortRestsUsed: bigint;
  longRestsUsed: bigint;
  lastLongRestDate?: string;
}

export interface InspirationState {
  points: bigint;
  labelText: string;
}

export interface AttunedItem {
  id: string;
  itemName: string;
  notes: string;
}

export interface EquipmentSlot {
  id: string;
  slotName: string;
  itemName: string;
  itemId?: string;
  notes: string;
}

export interface ArmyRelationship {
  id: string;
  armyName: string;
  relationship: string;
  notes: string;
}

export interface OfficerDuel {
  id: string;
  officer1: string;
  officer2: string;
  outcome: string;
  date: string;
  notes: string;
}

export interface RecruitmentEntry {
  id: string;
  date: string;
  location: string;
  amount: bigint;
  method: string;
  notes: string;
}

export interface BattleEngagement {
  id: string;
  name: string;
  date: string;
  outcome: string;
  notes: string;
  losses: string;
}

export interface SupplyConsumptionEntry {
  id: string;
  date: string;
  foodConsumed: bigint;
  ammoConsumed: bigint;
  notes: string;
}

export interface Location {
  id: string;
  name: string;
  locationType: string;
  region: string;
  description: string;
  notes: string;
  visitedDate: string;
  factionId?: bigint;
  owner: Principal;
}

export interface LoreEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  owner: Principal;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  characters: string[];
  armies: string[];
  linkedFactionId?: bigint;
  linkedLocationId?: bigint;
  owner: Principal;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  characterIds: string[];
  armyIds: string[];
  notes: string;
  status: string;
  startDate: string;
  owner: Principal;
}

export interface SessionEntry {
  id: string;
  campaignId?: string;
  title: string;
  date: string;
  summary: string;
  xpGained: bigint;
  loot: string;
  notes: string;
  linkedEncounterIds: Array<bigint>;
  linkedNpcIds: Array<bigint>;
  linkedQuestIds: Array<bigint>;
  owner: Principal;
}

export interface EncounterEntry {
  id: string;
  campaignId?: string;
  name: string;
  date: string;
  difficulty: string;
  outcome: string;
  xpAwarded: bigint;
  notes: string;
  locationId?: bigint;
  linkedNpcIds: Array<bigint>;
  owner: Principal;
}

export interface NPC {
  id: string;
  name: string;
  race: string;
  location: string;
  relationship: string;
  description: string;
  notes: string;
  factionId?: bigint;
  locationId?: bigint;
  owner: Principal;
}

export interface Quest {
  id: string;
  title: string;
  status: string;
  description: string;
  objectives: string;
  reward: string;
  notes: string;
  linkedNpcIds: Array<bigint>;
  linkedFactionIds: Array<bigint>;
}

export interface PartyNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  owner: Principal;
}

export interface PartyInventoryItem {
  id: string;
  name: string;
  quantity: bigint;
  weight: string;
  value: string;
  description: string;
  notes: string;
  owner: Principal;
}

export interface XpState {
  characterId: bigint;
  xp: bigint;
  totalXpEarned: bigint;
  milestoneMode: boolean;
  milestoneNotes: string;
}

// ── New types for gain/loss and army interaction panels ──────────────────────

export interface GainLossDetails {
  troops: bigint;
  gold: bigint;
  prisoners: bigint;
  supplies: bigint;
  territory: string;
  intel: string;
  officersCasualties: string;
  equipmentNotes: string;
  other: string;
}

export interface GainLossEntry {
  id: string;
  armyId: string;
  timestamp: string;
  interactionType: string;
  enemyName: string;
  outcome: string;
  gains: GainLossDetails;
  losses: GainLossDetails;
  moraleImpact: bigint;
  moraleApplied: boolean;
  notes: string;
  linkedFactionId?: bigint;
  owner: Principal;
}

export interface EnemyProfile {
  id: string;
  armyId: string;
  name: string;
  faction: string;
  enemyType: string;
  description: string;
  knownStrengths: string;
  knownWeaknesses: string;
  notes: string;
  wins: bigint;
  losses: bigint;
  draws: bigint;
  owner: Principal;
}

export interface ArmyLootEntry {
  id: string;
  armyId: string;
  name: string;
  quantity: bigint;
  lootType: string;
  source: string;
  dateAcquired: string;
  value: bigint;
  distributed: boolean;
  notes: string;
  owner: Principal;
}

export interface BountyObjective {
  id: string;
  armyId: string;
  title: string;
  objectiveType: string;
  target: string;
  description: string;
  reward: string;
  status: string;
  completedAt: string;
  notes: string;
  owner: Principal;
}

export interface PrisonerExchangeEntry {
  id: string;
  armyId: string;
  prisonerName: string;
  prisonerFaction: string;
  prisonerRank: string;
  capturedDate: string;
  capturedFrom: string;
  status: string;
  exchangeDetails: string;
  ransomAmount: bigint;
  notes: string;
  owner: Principal;
}

export interface DeploymentMapNote {
  id: string;
  armyId: string;
  branchName: string;
  location: string;
  terrain: string;
  deploymentStatus: string;
  coordinatesNotes: string;
  strategicNotes: string;
  supplyLineStatus: string;
  lastUpdated: string;
  notes: string;
  owner: Principal;
}

export interface DiplomacyEntry {
  id: string;
  armyId: string;
  otherArmyName: string;
  otherFaction: string;
  relationshipType: string;
  date: string;
  terms: string;
  status: string;
  keyPersons: string;
  notes: string;
  owner: Principal;
}

// ── New types for new backend entities ──────────────────────────────────────

export interface BattleOutcome {
  id: bigint;
  armyId: string;
  result: string;
  opponent: string;
  date: string;
  casualties: string;
  notes: string;
  owner: Principal;
}

export interface CapturedEnemy {
  id: bigint;
  armyId: string;
  name: string;
  rank: string;
  faction: string;
  background: string;
  status: string;
  notes: string;
  owner: Principal;
}

export interface Faction {
  id: bigint;
  name: string;
  goals: string;
  alignment: string;
  description: string;
  relationships: string;
  characterAffiliations: string;
  armyAffiliations: string;
  notes: string;
  owner: Principal;
}

export interface WeatherEntry {
  id: bigint;
  weatherType: string;
  season: string;
  effects: string;
  startDate: string;
  endDate: string;
  notes: string;
  owner: Principal;
}

export interface BestiaryCreature {
  id: bigint;
  name: string;
  creatureType: string;
  weaknesses: string;
  behaviors: string;
  immunities: string;
  notes: string;
  encounterCount: bigint;
  owner: Principal;
}

export interface CharacterRelationship {
  id: bigint;
  characterId: string;
  relatedCharacterName: string;
  relationshipType: string;
  notes: string;
  owner: Principal;
}

export interface CalendarEvent {
  id: bigint;
  title: string;
  date: string;
  category: string;
  description: string;
  linkedSessionId: string;
  linkedEncounterId: string;
  notes: string;
  owner: Principal;
}

export interface ArmyMoraleHistoryEntry {
  timestamp: string;
  eventType: string;
  modifier: bigint;
  notes: string;
}

export interface CampaignEnemy {
  id: string;
  campaignId: string;
  name: string;
  enemyType: string;
  faction: string;
  description: string;
  knownStrengths: string;
  knownWeaknesses: string;
  status: string;
  wins: bigint;
  losses: bigint;
  draws: bigint;
  notes: string;
  linkedArmyEnemyIds: string[];
  owner: Principal;
}

// ── New types for latest feature expansion ──────────────────────────────────

export interface MulticlassEntry {
  id: string;
  className: string;
  level: number;
  spellcastingMod: string; // 'INT' | 'WIS' | 'CHA' | 'none'
  isSpellcaster: boolean;
}

export interface CharacterCondition {
  id: string;
  name: string;
  description: string;
  duration: string;
  autoRemoveOnRest: boolean;
}

export interface CharacterAppearance {
  age: string;
  height: string;
  weight: string;
  hairColor: string;
  eyeColor: string;
  distinguishingMarks: string;
}

export interface OfficerSkill {
  skillName: string;
  rating: number;
  effect: string;
}

export interface OfficerSkillEntry {
  officerId: string;
  armyId: number;
  skills: OfficerSkill[];
}

export interface SupplyRoute {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  status: string; // 'active' | 'threatened' | 'cut_off'
  notes: string;
}

export interface BattleSimResult {
  outcome: string;
  winnerName: string;
  loserName: string;
  estimatedCasualties: string;
  notes: string;
}

export interface DungeonRoom {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface PartyXpEntry {
  id: string;
  sessionId: string;
  xpEarned: number;
  notes: string;
  timestamp: number;
}

export interface LootDistributionEntry {
  id: string;
  itemName: string;
  quantity: number;
  recipient: string;
  notes: string;
  timestamp: number;
}

export interface InitiativeEntry {
  id: string;
  name: string;
  dexModifier: number;
  initiativeRoll: number;
  currentHp: number;
  maxHp: number;
  isPlayer: boolean;
  conditions: string[];
}

export interface InitiativeTracker {
  id: string;
  encounterId: string;
  entries: InitiativeEntry[];
  currentTurnIndex: number;
  roundNumber: number;
}

export interface ThemeSettings {
  accentColor: string; // hex color string
  themePreset: string; // 'dark' | 'light' | 'midnight' | 'forest'
}

export interface AppReminder {
  id: string;
  title: string;
  eventDate: number;
  reminderNote: string;
  isDismissed: boolean;
}

// XP thresholds per level (standard D&D 5e, extended for high levels)
export const XP_THRESHOLDS: bigint[] = [
  0n, // level 1
  300n, // level 2
  900n, // level 3
  2700n, // level 4
  6500n, // level 5
  14000n, // level 6
  23000n, // level 7
  34000n, // level 8
  48000n, // level 9
  64000n, // level 10
  85000n, // level 11
  100000n, // level 12
  120000n, // level 13
  140000n, // level 14
  165000n, // level 15
  195000n, // level 16
  225000n, // level 17
  265000n, // level 18
  305000n, // level 19
  355000n, // level 20
];

// Full backend interface covering all methods
export interface DndBackend {
  // Character CRUD
  createCharacter(character: Character): Promise<CharacterId>;
  getCharacter(id: CharacterId): Promise<Character | null>;
  getAllCharacters(): Promise<Array<[CharacterId, Character]>>;
  updateCharacter(id: CharacterId, character: Character): Promise<void>;
  deleteCharacter(id: CharacterId): Promise<void>;
  exportCharacter(characterId: CharacterId): Promise<string>;
  importCharacter(input: ImportCharacterInput): Promise<CharacterId>;

  // Spells
  addSpell(spell: Spell): Promise<SpellId>;
  getSpellsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[SpellId, Spell]>>;
  updateSpell(id: SpellId, spell: Spell): Promise<void>;
  deleteSpell(id: SpellId): Promise<void>;

  // Items
  addItem(item: InventoryItem): Promise<InventoryItemId>;
  getItemsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[InventoryItemId, InventoryItem]>>;
  updateItem(id: InventoryItemId, item: InventoryItem): Promise<void>;
  deleteItem(id: InventoryItemId): Promise<void>;

  // Traits
  addTrait(trait: Trait): Promise<TraitId>;
  getTraitsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[TraitId, Trait]>>;
  updateTrait(id: TraitId, trait: Trait): Promise<void>;
  deleteTrait(id: TraitId): Promise<void>;

  // Classes
  addClass(cls: CustomClass): Promise<ClassId>;
  getAllClasses(): Promise<Array<[ClassId, CustomClass]>>;
  updateClass(id: ClassId, cls: CustomClass): Promise<void>;
  deleteClass(id: ClassId): Promise<void>;

  // Races
  addRace(race: CustomRace): Promise<RaceId>;
  getAllRaces(): Promise<Array<[RaceId, CustomRace]>>;
  updateRace(id: RaceId, race: CustomRace): Promise<void>;
  deleteRace(id: RaceId): Promise<void>;
  getAllRaceLinkedContent(): Promise<Array<[RaceId, RaceLinkedContent]>>;
  updateRaceLinkedContent(
    raceId: RaceId,
    content: RaceLinkedContent,
  ): Promise<void>;
  applyRaceGrantsToCharacter(
    characterId: CharacterId,
    raceId: RaceId,
  ): Promise<void>;

  // Custom Spells
  addCustomSpell(spell: CustomSpell): Promise<CustomSpellId>;
  getAllCustomSpells(): Promise<Array<[CustomSpellId, CustomSpell]>>;
  updateCustomSpell(id: CustomSpellId, spell: CustomSpell): Promise<void>;
  deleteCustomSpell(id: CustomSpellId): Promise<void>;

  // Custom Items
  addCustomItem(item: CustomItem): Promise<CustomItemId>;
  getAllCustomItems(): Promise<Array<[CustomItemId, CustomItem]>>;
  updateCustomItem(id: CustomItemId, item: CustomItem): Promise<void>;
  deleteCustomItem(id: CustomItemId): Promise<void>;

  // Custom Abilities
  addCustomAbility(ability: CustomAbility): Promise<CustomAbilityId>;
  getAllCustomAbilities(): Promise<Array<[CustomAbilityId, CustomAbility]>>;
  updateCustomAbility(
    id: CustomAbilityId,
    ability: CustomAbility,
  ): Promise<void>;
  deleteCustomAbility(id: CustomAbilityId): Promise<void>;

  // Character Abilities
  addCharacterAbility(ability: CharacterAbility): Promise<CharacterAbilityId>;
  getAbilitiesByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[CharacterAbilityId, CharacterAbility]>>;
  updateCharacterAbility(
    id: CharacterAbilityId,
    ability: CharacterAbility,
  ): Promise<void>;
  deleteCharacterAbility(id: CharacterAbilityId): Promise<void>;

  // Custom Physical Attacks
  addCustomPhysicalAttack(
    attack: CustomPhysicalAttack,
  ): Promise<CustomPhysicalAttackId>;
  getAllCustomPhysicalAttacks(): Promise<
    Array<[CustomPhysicalAttackId, CustomPhysicalAttack]>
  >;
  updateCustomPhysicalAttack(
    id: CustomPhysicalAttackId,
    attack: CustomPhysicalAttack,
  ): Promise<void>;
  deleteCustomPhysicalAttack(id: CustomPhysicalAttackId): Promise<void>;

  // Character Physical Attacks
  addCharacterPhysicalAttack(
    attack: CharacterPhysicalAttack,
  ): Promise<CharacterPhysicalAttackId>;
  getPhysicalAttacksByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[CharacterPhysicalAttackId, CharacterPhysicalAttack]>>;
  updateCharacterPhysicalAttack(
    id: CharacterPhysicalAttackId,
    attack: CharacterPhysicalAttack,
  ): Promise<void>;
  deleteCharacterPhysicalAttack(id: CharacterPhysicalAttackId): Promise<void>;

  // Custom Spell Schools
  addCustomSpellSchool(school: CustomSpellSchool): Promise<CustomSpellSchoolId>;
  getAllCustomSpellSchools(): Promise<
    Array<[CustomSpellSchoolId, CustomSpellSchool]>
  >;
  updateCustomSpellSchool(
    id: CustomSpellSchoolId,
    school: CustomSpellSchool,
  ): Promise<void>;
  deleteCustomSpellSchool(id: CustomSpellSchoolId): Promise<void>;

  // HP State
  getHPState(characterId: CharacterId): Promise<HPState | null>;
  updateHPState(characterId: CharacterId, state: HPState): Promise<void>;

  // Spell Slots
  getSpellSlotsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<SpellSlotState>>;
  updateSpellSlots(
    characterId: CharacterId,
    slots: Array<SpellSlotState>,
  ): Promise<void>;

  // Death Saves
  getDeathSaveState(characterId: CharacterId): Promise<DeathSaveState | null>;
  updateDeathSaveState(
    characterId: CharacterId,
    state: DeathSaveState,
  ): Promise<void>;

  // Currency
  getCurrencyState(characterId: CharacterId): Promise<CurrencyState | null>;
  updateCurrencyState(
    characterId: CharacterId,
    state: CurrencyState,
  ): Promise<void>;

  // Save Throws
  getSaveThrowState(characterId: CharacterId): Promise<SaveThrowState | null>;
  updateSaveThrowState(
    characterId: CharacterId,
    state: SaveThrowState,
  ): Promise<void>;

  // Languages
  addLanguage(characterId: CharacterId, name: string): Promise<bigint>;
  getLanguagesByCharacter(characterId: CharacterId): Promise<Array<Language>>;
  updateLanguage(id: bigint, name: string): Promise<void>;
  deleteLanguage(id: bigint): Promise<void>;

  // Allies
  addAlly(
    characterId: CharacterId,
    name: string,
    relationship: string,
    notes: string,
  ): Promise<bigint>;
  getAlliesByCharacter(characterId: CharacterId): Promise<Array<Ally>>;
  updateAlly(
    id: bigint,
    name: string,
    relationship: string,
    notes: string,
  ): Promise<void>;
  deleteAlly(id: bigint): Promise<void>;

  // Character Feats
  addCharacterFeat(
    characterId: CharacterId,
    name: string,
    description: string,
  ): Promise<bigint>;
  getCharacterFeatsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<CharacterFeat>>;
  updateCharacterFeat(
    id: bigint,
    name: string,
    description: string,
  ): Promise<void>;
  deleteCharacterFeat(id: bigint): Promise<void>;

  // Custom Skills
  addCustomSkill(
    name: string,
    statBased: string,
    description: string,
  ): Promise<bigint>;
  getAllCustomSkills(): Promise<Array<CustomSkill>>;
  updateCustomSkill(
    id: bigint,
    name: string,
    statBased: string,
    description: string,
  ): Promise<void>;
  deleteCustomSkill(id: bigint): Promise<void>;

  // Custom Feats
  addCustomFeat(
    name: string,
    description: string,
    prerequisites: string,
  ): Promise<bigint>;
  getAllCustomFeats(): Promise<Array<CustomFeat>>;
  updateCustomFeat(
    id: bigint,
    name: string,
    description: string,
    prerequisites: string,
  ): Promise<void>;
  deleteCustomFeat(id: bigint): Promise<void>;

  // Character Skills
  addCharacterSkill(
    characterId: CharacterId,
    skillName: string,
    proficient: boolean,
    expertise: boolean,
  ): Promise<bigint>;
  getCharacterSkillsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<CharacterSkill>>;
  updateCharacterSkill(
    id: bigint,
    skillName: string,
    proficient: boolean,
    expertise: boolean,
  ): Promise<void>;
  deleteCharacterSkill(id: bigint): Promise<void>;

  // Character Proficiencies
  addCharacterProficiency(
    characterId: CharacterId,
    profType: string,
    name: string,
  ): Promise<bigint>;
  getCharacterProficienciesByCharacter(
    characterId: CharacterId,
  ): Promise<Array<CharacterProficiency>>;
  deleteCharacterProficiency(id: bigint): Promise<void>;

  // Tab Notes
  saveTabNote(
    characterId: CharacterId,
    tabName: string,
    content: string,
  ): Promise<void>;
  getTabNote(
    characterId: CharacterId,
    tabName: string,
  ): Promise<TabNote | null>;
  deleteTabNote(characterId: CharacterId, tabName: string): Promise<void>;

  // Custom Stats (global library)
  addCustomStat(
    name: string,
    description: string,
    defaultValue: string,
  ): Promise<bigint>;
  getAllCustomStats(): Promise<Array<CustomStat>>;
  updateCustomStat(
    id: bigint,
    name: string,
    description: string,
    defaultValue: string,
  ): Promise<void>;
  deleteCustomStat(id: bigint): Promise<void>;

  // Character Custom Stats (per-character tracking)
  addCharacterCustomStat(
    characterId: CharacterId,
    statId: bigint,
    statName: string,
    value: string,
  ): Promise<bigint>;
  getCharacterCustomStatsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<CharacterCustomStat>>;
  updateCharacterCustomStat(id: bigint, value: string): Promise<void>;
  deleteCharacterCustomStat(id: bigint): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(newSettings: Settings): Promise<void>;

  // User Profile
  getCallerUserProfile(): Promise<UserProfile | null>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  isCallerAdmin(): Promise<boolean>;

  // Army
  addArmy(input: ArmyInput): Promise<string>;
  getArmies(): Promise<Array<Army>>;
  getArmiesByCharacter(characterId: CharacterId): Promise<Array<Army>>;
  updateArmy(id: string, input: ArmyInput): Promise<void>;
  deleteArmy(id: string): Promise<void>;

  // Prepared Spells
  setPreparedSpells(
    characterId: CharacterId,
    spellIds: string[],
  ): Promise<void>;
  getPreparedSpells(characterId: CharacterId): Promise<string[]>;

  // Concentration
  getConcentrationState(
    characterId: CharacterId,
  ): Promise<ConcentrationState | null>;
  updateConcentrationState(
    characterId: CharacterId,
    state: ConcentrationState,
  ): Promise<void>;

  // Rest State
  getRestState(characterId: CharacterId): Promise<RestState | null>;
  updateRestState(characterId: CharacterId, state: RestState): Promise<void>;

  // Inspiration
  getInspirationState(
    characterId: CharacterId,
  ): Promise<InspirationState | null>;
  updateInspirationState(
    characterId: CharacterId,
    state: InspirationState,
  ): Promise<void>;

  // Attuned Items
  getAttunedItems(characterId: CharacterId): Promise<AttunedItem[]>;
  addAttunedItem(characterId: CharacterId, item: AttunedItem): Promise<void>;
  removeAttunedItem(characterId: CharacterId, itemId: string): Promise<void>;

  // Equipment Slots
  getEquipmentSlots(characterId: CharacterId): Promise<EquipmentSlot[]>;
  updateEquipmentSlots(
    characterId: CharacterId,
    slots: EquipmentSlot[],
  ): Promise<void>;

  // Character Portrait
  updateCharacterPortrait(characterId: CharacterId, url: string): Promise<void>;

  // Army Relationships
  getArmyRelationships(armyId: string): Promise<ArmyRelationship[]>;
  updateArmyRelationships(
    armyId: string,
    relationships: ArmyRelationship[],
  ): Promise<void>;

  // Army Banner
  updateArmyBanner(armyId: string, url: string): Promise<void>;

  // Officer Duels
  getOfficerDuels(armyId: string): Promise<OfficerDuel[]>;
  addOfficerDuel(armyId: string, duel: OfficerDuel): Promise<void>;
  deleteOfficerDuel(armyId: string, duelId: string): Promise<void>;

  // Recruitment Log
  getRecruitmentLog(armyId: string): Promise<RecruitmentEntry[]>;
  addRecruitmentEntry(armyId: string, entry: RecruitmentEntry): Promise<void>;
  deleteRecruitmentEntry(armyId: string, entryId: string): Promise<void>;

  // Battle Engagements
  getBattleEngagements(armyId: string): Promise<BattleEngagement[]>;
  addBattleEngagement(
    armyId: string,
    engagement: BattleEngagement,
  ): Promise<void>;
  deleteBattleEngagement(armyId: string, engagementId: string): Promise<void>;

  // Supply Consumption
  getSupplyConsumptionLog(armyId: string): Promise<SupplyConsumptionEntry[]>;
  logSupplyConsumption(
    armyId: string,
    entry: SupplyConsumptionEntry,
  ): Promise<void>;

  // Locations
  addLocation(loc: Location): Promise<void>;
  getLocations(): Promise<Location[]>;
  updateLocation(loc: Location): Promise<void>;
  deleteLocation(id: string): Promise<void>;

  // Lore Entries
  addLoreEntry(entry: LoreEntry): Promise<void>;
  getLoreEntries(): Promise<LoreEntry[]>;
  updateLoreEntry(entry: LoreEntry): Promise<void>;
  deleteLoreEntry(id: string): Promise<void>;

  // Timeline Events
  addTimelineEvent(event: TimelineEvent): Promise<void>;
  getTimelineEvents(): Promise<TimelineEvent[]>;
  updateTimelineEvent(event: TimelineEvent): Promise<void>;
  deleteTimelineEvent(id: string): Promise<void>;

  // Campaigns
  addCampaign(campaign: Campaign): Promise<void>;
  getCampaigns(): Promise<Campaign[]>;
  updateCampaign(campaign: Campaign): Promise<void>;
  deleteCampaign(id: string): Promise<void>;

  // Session Log
  addSessionEntry(entry: SessionEntry): Promise<void>;
  getSessionLog(): Promise<SessionEntry[]>;
  updateSessionEntry(entry: SessionEntry): Promise<void>;
  deleteSessionEntry(id: string): Promise<void>;

  // Encounter Log
  addEncounterEntry(entry: EncounterEntry): Promise<void>;
  getEncounterLog(): Promise<EncounterEntry[]>;
  updateEncounterEntry(entry: EncounterEntry): Promise<void>;
  deleteEncounterEntry(id: string): Promise<void>;

  // NPCs
  addNPC(npc: NPC): Promise<void>;
  getNPCs(): Promise<NPC[]>;
  updateNPC(npc: NPC): Promise<void>;
  deleteNPC(id: string): Promise<void>;

  // Quests
  addQuest(characterId: CharacterId, quest: Quest): Promise<void>;
  getQuestsByCharacter(characterId: CharacterId): Promise<Quest[]>;
  updateQuest(characterId: CharacterId, quest: Quest): Promise<void>;
  deleteQuest(characterId: CharacterId, questId: string): Promise<void>;

  // Party Notes
  addPartyNote(note: PartyNote): Promise<void>;
  getPartyNotes(): Promise<PartyNote[]>;
  updatePartyNote(note: PartyNote): Promise<void>;
  deletePartyNote(id: string): Promise<void>;

  // Party Inventory
  addPartyInventoryItem(item: PartyInventoryItem): Promise<void>;
  getPartyInventory(): Promise<PartyInventoryItem[]>;
  updatePartyInventoryItem(item: PartyInventoryItem): Promise<void>;
  deletePartyInventoryItem(id: string): Promise<void>;

  // XP & Milestone Tracking
  getXpState(characterId: CharacterId): Promise<XpState | null>;
  updateXpState(characterId: CharacterId, state: XpState): Promise<void>;
  applyCharacterLevelFromXp(characterId: CharacterId): Promise<void>;

  // Battle Outcomes — real backend: addBattleOutcome(outcome): bigint, delete takes bigint
  addBattleOutcome(outcome: BattleOutcome): Promise<bigint>;
  getBattleOutcomes(armyId: string): Promise<BattleOutcome[]>;
  updateBattleOutcome(entry: BattleOutcome): Promise<boolean>;
  deleteBattleOutcome(id: bigint): Promise<boolean>;

  // Captured Enemies — real backend: addCapturedEnemy(enemy): bigint, delete takes bigint
  addCapturedEnemy(enemy: CapturedEnemy): Promise<bigint>;
  getCapturedEnemies(armyId: string): Promise<CapturedEnemy[]>;
  updateCapturedEnemy(entry: CapturedEnemy): Promise<boolean>;
  deleteCapturedEnemy(id: bigint): Promise<boolean>;

  // Factions — real backend: addFaction(entry): bigint, delete takes bigint
  addFaction(faction: Faction): Promise<bigint>;
  getFactions(): Promise<Faction[]>;
  updateFaction(entry: Faction): Promise<boolean>;
  deleteFaction(id: bigint): Promise<boolean>;

  // Weather Entries — real backend: addWeatherEntry(entry): bigint, delete takes bigint
  addWeatherEntry(entry: WeatherEntry): Promise<bigint>;
  getWeatherEntries(): Promise<WeatherEntry[]>;
  updateWeatherEntry(entry: WeatherEntry): Promise<boolean>;
  deleteWeatherEntry(id: bigint): Promise<boolean>;

  // Bestiary — real backend: addBestiaryCreature(creature): bigint, delete takes bigint
  addBestiaryCreature(creature: BestiaryCreature): Promise<bigint>;
  getBestiaryCreatures(): Promise<BestiaryCreature[]>;
  updateBestiaryCreature(entry: BestiaryCreature): Promise<boolean>;
  deleteBestiaryCreature(id: bigint): Promise<boolean>;

  // Character Relationships — real backend: addCharacterRelationship uses string id, delete takes bigint
  addCharacterRelationship(rel: CharacterRelationship): Promise<bigint>;
  getCharacterRelationships(
    characterId: string,
  ): Promise<CharacterRelationship[]>;
  updateCharacterRelationship(entry: CharacterRelationship): Promise<boolean>;
  deleteCharacterRelationship(id: bigint): Promise<boolean>;

  // Calendar Events — real backend: addCalendarEvent(event): bigint, delete takes bigint
  addCalendarEvent(event: CalendarEvent): Promise<bigint>;
  getCalendarEvents(): Promise<CalendarEvent[]>;
  updateCalendarEvent(entry: CalendarEvent): Promise<boolean>;
  deleteCalendarEvent(id: bigint): Promise<boolean>;

  // Character Injuries — real backend: addCharacterInjury(characterId, injury): string
  // update takes (id: string, injury), delete takes (id: string)
  addCharacterInjury(
    characterId: CharacterId,
    injury: CharacterInjury,
  ): Promise<string>;
  getCharacterInjuries(characterId: CharacterId): Promise<CharacterInjury[]>;
  updateCharacterInjury(id: string, injury: CharacterInjury): Promise<boolean>;
  deleteCharacterInjury(id: string): Promise<boolean>;

  // Personal Loot — real backend: addPersonalLootEntry(characterId, entry): string
  // update takes (id: string, entry), delete takes (id: string)
  addPersonalLootEntry(
    characterId: CharacterId,
    entry: PersonalLootEntry,
  ): Promise<string>;
  getPersonalLoot(characterId: CharacterId): Promise<PersonalLootEntry[]>;
  updatePersonalLootEntry(
    id: string,
    entry: PersonalLootEntry,
  ): Promise<boolean>;
  deletePersonalLootEntry(id: string): Promise<boolean>;

  // Rivals — real backend: addRivalEntry(characterId, entry): string
  // update takes (id: string, entry), delete takes (id: string)
  addRivalEntry(characterId: CharacterId, rival: RivalEntry): Promise<string>;
  getRivals(characterId: CharacterId): Promise<RivalEntry[]>;
  updateRivalEntry(id: string, entry: RivalEntry): Promise<boolean>;
  deleteRivalEntry(id: string): Promise<boolean>;

  // Army Morale History — real backend: addArmyMoraleEvent(armyId, event): boolean
  addArmyMoraleEvent(
    armyId: string,
    event: ArmyMoraleHistoryEntry,
  ): Promise<boolean>;
  getArmyMoraleHistory(armyId: string): Promise<ArmyMoraleHistoryEntry[]>;

  // Gain/Loss Entries — real backend: addGainLossEntry(armyId, entry): string
  // update takes (id: string, entry), delete takes (id: string)
  addGainLossEntry(armyId: string, entry: GainLossEntry): Promise<string>;
  getGainLossEntries(armyId: string): Promise<GainLossEntry[]>;
  updateGainLossEntry(id: string, entry: GainLossEntry): Promise<boolean>;
  deleteGainLossEntry(id: string): Promise<boolean>;

  // Enemy Roster — real backend: addEnemyProfile(armyId, profile): string
  // update takes (id: string, profile), delete takes (id: string)
  addEnemyProfile(armyId: string, profile: EnemyProfile): Promise<string>;
  getEnemyRoster(armyId: string): Promise<EnemyProfile[]>;
  updateEnemyProfile(id: string, profile: EnemyProfile): Promise<boolean>;
  deleteEnemyProfile(id: string): Promise<boolean>;

  // Army Loot — real backend: addArmyLootEntry(armyId, entry): string
  // update takes (id: string, entry), delete takes (id: string)
  addArmyLootEntry(armyId: string, entry: ArmyLootEntry): Promise<string>;
  getArmyLoot(armyId: string): Promise<ArmyLootEntry[]>;
  updateArmyLootEntry(id: string, entry: ArmyLootEntry): Promise<boolean>;
  deleteArmyLootEntry(id: string): Promise<boolean>;

  // Bounty Objectives — real backend: addBountyObjective(armyId, obj): string
  // update takes (id: string, obj), delete takes (id: string)
  addBountyObjective(armyId: string, obj: BountyObjective): Promise<string>;
  getBountyObjectives(armyId: string): Promise<BountyObjective[]>;
  updateBountyObjective(id: string, obj: BountyObjective): Promise<boolean>;
  deleteBountyObjective(id: string): Promise<boolean>;

  // Prisoner Exchanges — real backend: addPrisonerExchange(armyId, entry): string
  // update takes (id: string, entry), delete takes (id: string)
  addPrisonerExchange(
    armyId: string,
    entry: PrisonerExchangeEntry,
  ): Promise<string>;
  getPrisonerExchanges(armyId: string): Promise<PrisonerExchangeEntry[]>;
  updatePrisonerExchange(
    id: string,
    entry: PrisonerExchangeEntry,
  ): Promise<boolean>;
  deletePrisonerExchange(id: string): Promise<boolean>;

  // Deployment Map Notes — real backend: addDeploymentNote(armyId, note): string
  // update takes (id: string, note), delete takes (id: string)
  addDeploymentNote(armyId: string, note: DeploymentMapNote): Promise<string>;
  getDeploymentNotes(armyId: string): Promise<DeploymentMapNote[]>;
  updateDeploymentNote(id: string, note: DeploymentMapNote): Promise<boolean>;
  deleteDeploymentNote(id: string): Promise<boolean>;

  // Diplomacy Log — real backend: addDiplomacyEntry(armyId, entry): string
  // update takes (id: string, entry), delete takes (id: string)
  addDiplomacyEntry(armyId: string, entry: DiplomacyEntry): Promise<string>;
  getDiplomacyLog(armyId: string): Promise<DiplomacyEntry[]>;
  updateDiplomacyEntry(id: string, entry: DiplomacyEntry): Promise<boolean>;
  deleteDiplomacyEntry(id: string): Promise<boolean>;

  // Campaign Enemies
  addCampaignEnemy(campaignId: string, enemy: CampaignEnemy): Promise<string>;
  getCampaignEnemies(campaignId: string): Promise<CampaignEnemy[]>;
  updateCampaignEnemy(id: string, enemy: CampaignEnemy): Promise<boolean>;
  deleteCampaignEnemy(id: string): Promise<boolean>;

  // Multiclass
  getCharacterMulticlass: (charId: bigint) => Promise<MulticlassEntry[]>;
  updateCharacterMulticlass: (
    charId: bigint,
    entries: MulticlassEntry[],
  ) => Promise<boolean>;

  // Character Conditions
  getCharacterConditions: (charId: bigint) => Promise<CharacterCondition[]>;
  updateCharacterConditions: (
    charId: bigint,
    conditions: CharacterCondition[],
  ) => Promise<boolean>;

  // Character Appearance
  getCharacterAppearance: (
    charId: bigint,
  ) => Promise<[] | [CharacterAppearance]>;
  updateCharacterAppearance: (
    charId: bigint,
    appearance: CharacterAppearance,
  ) => Promise<boolean>;

  // Army Supply Routes
  getArmySupplyRoutes: (armyId: bigint) => Promise<SupplyRoute[]>;
  updateArmySupplyRoutes: (
    armyId: bigint,
    routes: SupplyRoute[],
  ) => Promise<boolean>;

  // Army Officer Skills
  getArmyOfficerSkills: (armyId: bigint) => Promise<OfficerSkillEntry[]>;
  updateArmyOfficerSkills: (
    armyId: bigint,
    skills: OfficerSkillEntry[],
  ) => Promise<boolean>;

  // Battle Simulator
  simulateBattle: (
    armyId1: bigint,
    armyId2: bigint,
  ) => Promise<BattleSimResult>;

  // Dungeon Rooms (per location)
  getLocationDungeonRooms: (locationId: string) => Promise<DungeonRoom[]>;
  updateLocationDungeonRooms: (
    locationId: string,
    rooms: DungeonRoom[],
  ) => Promise<boolean>;

  // Party XP
  getPartyXpEntries: () => Promise<PartyXpEntry[]>;
  addPartyXpEntry: (entry: PartyXpEntry) => Promise<boolean>;
  deletePartyXpEntry: (id: string) => Promise<boolean>;

  // Loot Distribution Log
  getLootDistributionLog: () => Promise<LootDistributionEntry[]>;
  addLootDistributionEntry: (entry: LootDistributionEntry) => Promise<boolean>;
  deleteLootDistributionEntry: (id: string) => Promise<boolean>;

  // Initiative Trackers
  getInitiativeTrackers: () => Promise<InitiativeTracker[]>;
  saveInitiativeTracker: (tracker: InitiativeTracker) => Promise<boolean>;
  deleteInitiativeTracker: (id: string) => Promise<boolean>;

  // Theme Settings
  getThemeSettings: () => Promise<[] | [ThemeSettings]>;
  updateThemeSettings: (settings: ThemeSettings) => Promise<boolean>;

  // App Reminders
  getAppReminders: () => Promise<AppReminder[]>;
  saveAppReminder: (reminder: AppReminder) => Promise<boolean>;
  deleteAppReminder: (id: string) => Promise<boolean>;

  // Export / Import all data
  exportAllData: () => Promise<string>;
  importAllData: (jsonData: string) => Promise<boolean>;

  // SRD Spells
  initializeSrdSpells(): Promise<bigint>;
  getSrdSpells(): Promise<SrdSpell[]>;
}

export interface SrdSpell {
  name: string;
  level: bigint;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  damageEffect: string;
  description: string;
}

// ---- Character Injury, Personal Loot, Rivals ----

export interface CharacterInjury {
  id: string;
  characterId: CharacterId;
  injuryName: string;
  injuryType: string;
  severity: string;
  description: string;
  dateReceived: string;
  source: string;
  recoveryStatus: string;
  recoveryNotes: string;
  estimatedRecovery: string;
  owner: Principal;
}

export interface PersonalLootEntry {
  id: string;
  characterId: CharacterId;
  name: string;
  quantity: bigint;
  lootType: string;
  source: string;
  dateAcquired: string;
  value: bigint;
  kept: boolean;
  notes: string;
  owner: Principal;
}

export interface RivalEntry {
  id: string;
  characterId: CharacterId;
  name: string;
  rivalType: string;
  faction: string;
  threatLevel: string;
  backstory: string;
  currentLocation: string;
  personalHistory: string;
  wins: bigint;
  losses: bigint;
  status: string;
  notes: string;
  linkedFactionId?: bigint;
  owner: Principal;
}

// ---- Army Tab Types ----

export interface ArmyAbility {
  id: string;
  name: string;
  description: string;
  cost: string;
  effect: string;
}

export interface ArmyLoadout {
  id: string;
  name: string;
  weaponType: string;
  armorType: string;
  notes: string;
}

export interface ArmyRank {
  id: string;
  name: string;
  tier: bigint;
  description: string;
  troopCount: bigint;
}

export interface OfficerPromotion {
  id: string;
  fromRank: string;
  toRank: string;
  date: string;
  notes: string;
}

export interface ArmyOfficer {
  id: string;
  name: string;
  rankId: string;
  race: string;
  background: string;
  skills: string[];
  notes: string;
  loyalty: bigint;
  combatAbility: bigint;
  leadership: bigint;
  promotionLog: OfficerPromotion[];
  factionId?: bigint;
}

export interface ArmyCommander {
  id: string;
  name: string;
  rankId: string;
  background: string;
  commandSkills: string[];
  signatureAbility: string;
  historyNotes: string;
  abilities: ArmyAbility[];
  factionId?: bigint;
}

export interface ArmyBranch {
  id: string;
  name: string;
  headcount: bigint;
  trainingLevel: string;
  condition: string;
  abilities: ArmyAbility[];
  loadouts: ArmyLoadout[];
  specialties: string[];
  officerIds: string[];
  deploymentLocation: string;
  interBranchNotes: string;
  veteranFlag: boolean;
  machineryIds: string[];
}

export interface SpecOpsGroup {
  id: string;
  name: string;
  missionType: string;
  headcount: bigint;
  condition: string;
  officerIds: string[];
  abilities: ArmyAbility[];
  equipmentNotes: string;
  notes: string;
}

export interface ArmyMachinery {
  id: string;
  name: string;
  machineryType: string;
  condition: string;
  crewSize: bigint;
  damageEffect: string;
  notes: string;
}

export interface SupplyLine {
  id: string;
  route: string;
  vulnerabilities: string;
  notes: string;
}

export interface CasualtyEntry {
  id: string;
  branchName: string;
  troopLosses: bigint;
  woundedOfficers: bigint;
  date: string;
  notes: string;
}

export interface ArmyLogistics {
  food: bigint;
  ammunition: bigint;
  goldReserves: bigint;
  supplyLines: SupplyLine[];
  casualtiesLog: CasualtyEntry[];
  injuryNotes: string;
}

export interface ChainEntry {
  id: string;
  officerId: string;
  reportsToId: string;
  role: string;
}

export interface OrderEntry {
  id: string;
  target: string;
  order: string;
  date: string;
}

export interface ArmyCommandStructure {
  chainOfCommand: ChainEntry[];
  ordersLog: OrderEntry[];
}

export interface EnemyIntelEntry {
  id: string;
  enemyName: string;
  knownStrength: string;
  weaknesses: string;
  notes: string;
  date: string;
}

export interface ScoutReport {
  id: string;
  area: string;
  findings: string;
  date: string;
}

export interface ArmyIntelligence {
  enemyIntelLog: EnemyIntelEntry[];
  scoutReports: ScoutReport[];
}

export interface MoraleEvent {
  id: string;
  event: string;
  impact: string;
  date: string;
}

export interface LoyaltyEntry {
  id: string;
  entityName: string;
  loyaltyScore: bigint;
  notes: string;
}

export interface ArmyMoraleData {
  moraleEventsLog: MoraleEvent[];
  loyaltyTracker: LoyaltyEntry[];
}

export interface AlliedArmy {
  id: string;
  name: string;
  size: bigint;
  commander: string;
  allegiance: string;
  notes: string;
}

export interface CampaignLogEntry {
  id: string;
  entry: string;
  date: string;
}

export interface BattlePlanEntry {
  id: string;
  objective: string;
  notes: string;
  date: string;
}

export interface ArmyNotes {
  campaignLog: CampaignLogEntry[];
  battlePlannerNotes: BattlePlanEntry[];
  generalNotes: string;
}

export interface Army {
  id: string;
  characterId: CharacterId;
  commandingCharacterId?: string;
  owner: Principal;
  name: string;
  size: bigint;
  moraleRating: bigint;
  powerLevel: bigint;
  status: string;
  race: string;
  specialties: string[];
  faction: string;
  banner: string;
  trainingLevel: string;
  condition: string;
  foundingDate: string;
  terrainNotes: string;
  warChest: bigint;
  ranks: ArmyRank[];
  branches: ArmyBranch[];
  specOpsGroups: SpecOpsGroup[];
  machinery: ArmyMachinery[];
  officers: ArmyOfficer[];
  commanders: ArmyCommander[];
  armyAbilities: ArmyAbility[];
  officerAbilities: ArmyAbility[];
  commanderAbilities: ArmyAbility[];
  logistics: ArmyLogistics;
  commandStructure: ArmyCommandStructure;
  intelligence: ArmyIntelligence;
  moraleData: ArmyMoraleData;
  alliedArmies: AlliedArmy[];
  armyNotes: ArmyNotes;
}

export interface ArmyInput {
  characterId: CharacterId;
  commandingCharacterId?: string;
  name: string;
  size: bigint;
  moraleRating: bigint;
  powerLevel: bigint;
  status: string;
  race: string;
  specialties: string[];
  faction: string;
  banner: string;
  trainingLevel: string;
  condition: string;
  foundingDate: string;
  terrainNotes: string;
  warChest: bigint;
  ranks: ArmyRank[];
  branches: ArmyBranch[];
  specOpsGroups: SpecOpsGroup[];
  machinery: ArmyMachinery[];
  officers: ArmyOfficer[];
  commanders: ArmyCommander[];
  armyAbilities: ArmyAbility[];
  officerAbilities: ArmyAbility[];
  commanderAbilities: ArmyAbility[];
  logistics: ArmyLogistics;
  commandStructure: ArmyCommandStructure;
  intelligence: ArmyIntelligence;
  moraleData: ArmyMoraleData;
  alliedArmies: AlliedArmy[];
  armyNotes: ArmyNotes;
}

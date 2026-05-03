import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GainLossDetails {
    territory: string;
    other: string;
    supplies: bigint;
    gold: bigint;
    troops: bigint;
    equipmentNotes: string;
    intel: string;
    officersCasualties: string;
    prisoners: bigint;
}
export interface RaceLinkedContent {
    linkedAttackIds: Array<CustomPhysicalAttackId>;
    linkedSpellIds: Array<CustomSpellId>;
    linkedAbilityIds: Array<CustomAbilityId>;
}
export interface SummoningLogEntry {
    id: string;
    status: string;
    owner: Principal;
    date: string;
    notes: string;
    armyId: string;
    entityName: string;
    purpose: string;
    binder: string;
}
export interface ArmyOfficer {
    id: string;
    background: string;
    promotionLog: Array<OfficerPromotion>;
    name: string;
    combatAbility: bigint;
    race: string;
    leadership: bigint;
    notes: string;
    rankId: string;
    loyalty: bigint;
    skills: Array<string>;
    factionId?: bigint;
}
export type TraitId = bigint;
export interface SinCorruptionEntry {
    id: string;
    owner: Principal;
    date: string;
    level: bigint;
    exposureType: string;
    notes: string;
    armyId: string;
    soldierName: string;
}
export interface DungeonRoom {
    id: string;
    order: bigint;
    name: string;
    description: string;
}
export interface ScpObjectEntry {
    id: string;
    status: string;
    owner: Principal;
    designation: string;
    notes: string;
    armyId: string;
    objectClass: string;
    location: string;
}
export interface PortalEntry {
    id: string;
    portalName: string;
    portalType: string;
    owner: Principal;
    toLocation: string;
    campaignId?: string;
    fromLocation: string;
    notes: string;
    condition: string;
}
export interface InterPresetWarEntry {
    id: string;
    endDate: string;
    owner: Principal;
    preset1: string;
    preset2: string;
    army2Name: string;
    notes: string;
    conflictName: string;
    outcome: string;
    army1Name: string;
    startDate: string;
}
export interface SoldierBio {
    id: string;
    bio: string;
    branch: string;
    owner: Principal;
    rank: string;
    armyId: string;
    backstory: string;
    soldierId: string;
    notableHistory: string;
    soldierName: string;
}
export interface PersonalLootEntry {
    id: string;
    value: bigint;
    source: string;
    owner: Principal;
    kept: boolean;
    name: string;
    dateAcquired: string;
    lootType: string;
    notes: string;
    quantity: bigint;
    characterId: CharacterId;
}
export interface DivineMandateEntry {
    id: string;
    status: string;
    mandate: string;
    owner: Principal;
    date: string;
    notes: string;
    authority: string;
    armyId: string;
}
export interface CasualtyEntry {
    id: string;
    troopLosses: bigint;
    woundedOfficers: bigint;
    date: string;
    notes: string;
    branchName: string;
}
export interface InventoryItem {
    weight: bigint;
    name: string;
    description: string;
    equipped: boolean;
    quantity: bigint;
    characterId: CharacterId;
}
export interface AttunedItem {
    id: string;
    notes: string;
    itemName: string;
}
export interface CapturedEnemy {
    id: bigint;
    status: string;
    background: string;
    owner: Principal;
    name: string;
    rank: string;
    notes: string;
    faction: string;
    armyId: string;
}
export interface LostKnowledgeEntry {
    id: string;
    title: string;
    owner: Principal;
    description: string;
    notes: string;
    category: string;
    discoveredBy: string;
    discoveredDate: string;
    condition: string;
}
export interface CustomSpell {
    duration: string;
    owner: Principal;
    school: string;
    name: string;
    damageEffect: string;
    components: string;
    description: string;
    level: bigint;
    range: string;
    castingTime: string;
}
export interface BattlePlanEntry {
    id: string;
    date: string;
    objective: string;
    notes: string;
}
export interface ArmyRivalEntry {
    id: string;
    rivalryNote: string;
    owner: Principal;
    rivalArmyId: string;
    notes: string;
    armyId: string;
    rivalArmyName: string;
    winsAgainst: bigint;
    startDate: string;
    lossesAgainst: bigint;
}
export interface TabNote {
    id: bigint;
    content: string;
    tabName: string;
    characterId: CharacterId;
}
export interface PsychEvalEntry {
    id: string;
    result: string;
    owner: Principal;
    date: string;
    notes: string;
    armyId: string;
    reviewer: string;
    personnelName: string;
}
export type ClassId = bigint;
export interface ArmyAbility {
    id: string;
    cost: string;
    name: string;
    description: string;
    effect: string;
}
export interface CustomAbility {
    owner: Principal;
    name: string;
    uses: bigint;
    description: string;
    abilityType: string;
    rechargeOn: string;
}
export interface PactContractEntry {
    id: string;
    status: string;
    terms: string;
    owner: Principal;
    date: string;
    notes: string;
    signed: boolean;
    armyId: string;
    parties: string;
}
export interface SiegeEntry {
    id: string;
    endDate: string;
    owner: Principal;
    resourcesConsumed: string;
    target: string;
    notes: string;
    armyId: string;
    outcome: string;
    breaches: string;
    startDate: string;
}
export interface NPC {
    id: string;
    relationship: string;
    owner: Principal;
    name: string;
    race: string;
    description: string;
    locationId?: bigint;
    notes: string;
    location: string;
    factionId?: bigint;
}
export interface DeploymentMapNote {
    id: string;
    terrain: string;
    owner: Principal;
    lastUpdated: string;
    deploymentStatus: string;
    strategicNotes: string;
    notes: string;
    coordinatesNotes: string;
    armyId: string;
    supplyLineStatus: string;
    branchName: string;
    location: string;
}
export interface CustomStat {
    id: bigint;
    owner: Principal;
    name: string;
    description: string;
    defaultValue: string;
}
export interface Skills {
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
export interface AngelClassEntry {
    id: string;
    angelType: string;
    owner: Principal;
    notes: string;
    armyId: string;
    soldierName: string;
}
export interface PartyNote {
    id: string;
    title: string;
    content: string;
    owner: Principal;
    createdAt: string;
}
export interface DemonClassEntry {
    id: string;
    owner: Principal;
    demonType: string;
    notes: string;
    armyId: string;
    abilities: string;
    soldierName: string;
}
export interface EspionageEntry {
    id: string;
    owner: Principal;
    date: string;
    operationType: string;
    agentName: string;
    target: string;
    notes: string;
    armyId: string;
    outcome: string;
}
export interface AmnesticLogEntry {
    id: string;
    owner: Principal;
    date: string;
    recipient: string;
    notes: string;
    armyId: string;
    amnesticClass: string;
    reason: string;
}
export interface PlaneRealmEntry {
    id: string;
    owner: Principal;
    planesOrRealms: Array<PlaneRealm>;
}
export interface OfficerPromotion {
    id: string;
    date: string;
    toRank: string;
    notes: string;
    fromRank: string;
}
export interface SpellSlotState {
    total: bigint;
    used: bigint;
    characterId: CharacterId;
    spellLevel: bigint;
}
export interface CorruptionLogEntry {
    id: string;
    source: string;
    owner: Principal;
    date: string;
    corruptionPoints: bigint;
    notes: string;
    armyId: string;
    soldierName: string;
}
export interface FallenSoldierEntry {
    id: string;
    owner: Principal;
    cause: string;
    date: string;
    name: string;
    rank: string;
    notes: string;
    armyId: string;
}
export interface BountyObjective {
    id: string;
    status: string;
    completedAt: string;
    reward: string;
    title: string;
    owner: Principal;
    description: string;
    target: string;
    notes: string;
    armyId: string;
    objectiveType: string;
}
export type CustomSpellId = bigint;
export interface PlaneRealm {
    traits: string;
    name: string;
    description: string;
    linkedLocations: string;
    planeType: string;
    notes: string;
}
export interface SaveThrowState {
    conProf: boolean;
    intProf: boolean;
    chaProf: boolean;
    wisProf: boolean;
    characterId: CharacterId;
    strProf: boolean;
    dexProf: boolean;
}
export interface OfficerSkillEntry {
    officerId: string;
    armyId: bigint;
    skills: Array<OfficerSkill>;
}
export interface ClearanceLevelEntry {
    id: string;
    owner: Principal;
    level: bigint;
    notes: string;
    armyId: string;
    rankCode: string;
}
export interface BloodlineEntry {
    id: string;
    era: string;
    relation: string;
    owner: Principal;
    name: string;
    notableAncestors: string;
    description: string;
    notes: string;
    characterId: string;
}
export interface PartyXpEntry {
    id: string;
    notes: string;
    timestamp: bigint;
    sessionId: string;
    xpEarned: bigint;
}
export interface AppReminder {
    id: string;
    title: string;
    reminderNote: string;
    isDismissed: boolean;
    eventDate: bigint;
}
export interface WhistleblowerEntry {
    id: string;
    source: string;
    owner: Principal;
    date: string;
    notes: string;
    incident: string;
    armyId: string;
    contained: boolean;
}
export interface PrayerLogEntry {
    id: string;
    owner: Principal;
    date: string;
    answered: boolean;
    notes: string;
    prayer: string;
    armyId: string;
}
export interface GainLossEntry {
    id: string;
    interactionType: string;
    moraleApplied: boolean;
    moraleImpact: bigint;
    owner: Principal;
    losses: GainLossDetails;
    gains: GainLossDetails;
    notes: string;
    timestamp: string;
    enemyName: string;
    linkedFactionId?: bigint;
    armyId: string;
    outcome: string;
}
export interface Language {
    id: bigint;
    name: string;
    characterId: CharacterId;
}
export interface BestiaryCreature {
    id: bigint;
    weaknesses: string;
    behaviors: string;
    owner: Principal;
    name: string;
    encounterCount: bigint;
    creatureType: string;
    notes: string;
    immunities: string;
}
export interface ScoutReport {
    id: string;
    area: string;
    date: string;
    findings: string;
}
export interface DiplomacyEntry {
    id: string;
    status: string;
    terms: string;
    otherFaction: string;
    owner: Principal;
    date: string;
    notes: string;
    otherArmyName: string;
    armyId: string;
    keyPersons: string;
    relationshipType: string;
}
export interface CustomSpellSchool {
    owner: Principal;
    name: string;
}
export interface CourtMartialEntry {
    id: string;
    owner: Principal;
    date: string;
    punishment: string;
    verdict: string;
    notes: string;
    armyId: string;
    charge: string;
    soldierId: string;
    soldierName: string;
}
export interface ArmyLootEntry {
    id: string;
    distributed: boolean;
    value: bigint;
    source: string;
    owner: Principal;
    name: string;
    dateAcquired: string;
    lootType: string;
    notes: string;
    quantity: bigint;
    armyId: string;
}
export interface AllianceTreaty {
    id: string;
    status: string;
    terms: string;
    breakDate: string;
    owner: Principal;
    notes: string;
    armyId: string;
    signedDate: string;
    partyA: string;
    partyB: string;
}
export interface CustomItem {
    weight: string;
    value: string;
    owner: Principal;
    name: string;
    description: string;
    itemType: string;
    rarity: string;
}
export interface CustomFeat {
    id: bigint;
    prerequisites: string;
    owner: Principal;
    name: string;
    description: string;
}
export interface HolyWarEntry {
    id: string;
    status: string;
    justification: string;
    owner: Principal;
    date: string;
    notes: string;
    armyId: string;
    warName: string;
}
export interface ConcentrationState {
    concentrationSpellId?: string;
    concentrationSpellName?: string;
}
export type CustomAbilityId = bigint;
export type CharacterAbilityId = bigint;
export interface ArmyMachinery {
    id: string;
    name: string;
    damageEffect: string;
    machineryType: string;
    notes: string;
    crewSize: bigint;
    condition: string;
}
export interface RestState {
    lastLongRestDate?: string;
    longRestsUsed: bigint;
    shortRestsUsed: bigint;
}
export interface RivalEntry {
    id: string;
    status: string;
    threatLevel: string;
    owner: Principal;
    name: string;
    wins: bigint;
    personalHistory: string;
    losses: bigint;
    notes: string;
    faction: string;
    linkedFactionId?: bigint;
    currentLocation: string;
    characterId: CharacterId;
    rivalType: string;
    backstory: string;
}
export interface ProtocolLogEntry {
    id: string;
    protocol: string;
    status: string;
    owner: Principal;
    date: string;
    invokedBy: string;
    notes: string;
    armyId: string;
    reason: string;
}
export interface PartyInventoryItem {
    id: string;
    weight: string;
    value: string;
    owner: Principal;
    name: string;
    description: string;
    notes: string;
    quantity: bigint;
}
export interface CharacterAbility {
    usesRemaining: bigint;
    name: string;
    uses: bigint;
    description: string;
    abilityType: string;
    rechargeOn: string;
    characterId: CharacterId;
}
export interface VeteranUnit {
    id: string;
    owner: Principal;
    designation: string;
    battleCount: bigint;
    notes: string;
    armyId: string;
    branchId: string;
    unitName: string;
    reason: string;
}
export interface AlliedArmy {
    id: string;
    allegiance: string;
    name: string;
    size: bigint;
    notes: string;
    commander: string;
}
export interface InfernalDebtEntry {
    id: string;
    status: string;
    terms: string;
    owner: Principal;
    date: string;
    debtor: string;
    notes: string;
    armyId: string;
    creditor: string;
}
export interface Abilities {
    cha: bigint;
    con: bigint;
    dex: bigint;
    int: bigint;
    str: bigint;
    wis: bigint;
}
export interface EnemyProfile {
    id: string;
    knownWeaknesses: string;
    knownStrengths: string;
    owner: Principal;
    name: string;
    wins: bigint;
    description: string;
    losses: bigint;
    notes: string;
    faction: string;
    enemyType: string;
    armyId: string;
    draws: bigint;
}
export interface EthicsReviewEntry {
    id: string;
    action: string;
    owner: Principal;
    date: string;
    notes: string;
    armyId: string;
    recommendation: string;
    reviewer: string;
}
export interface CharacterCondition {
    id: string;
    duration: string;
    autoRemoveOnRest: boolean;
    name: string;
    description: string;
}
export interface Spell {
    duration: string;
    school: string;
    name: string;
    damageEffect: string;
    components: string;
    description: string;
    level: bigint;
    characterId: CharacterId;
    range: string;
    castingTime: string;
}
export interface CampaignLogEntry {
    id: string;
    date: string;
    entry: string;
}
export interface RecruitmentEntry {
    id: string;
    method: string;
    date: string;
    notes: string;
    amount: bigint;
    location: string;
}
export interface Settings {
    maxLevel: bigint;
}
export interface ArmyBranch {
    id: string;
    deploymentLocation: string;
    veteranFlag: boolean;
    name: string;
    headcount: bigint;
    officerIds: Array<string>;
    machineryIds: Array<string>;
    specialties: Array<string>;
    trainingLevel: string;
    loadouts: Array<ArmyLoadout>;
    abilities: Array<ArmyAbility>;
    interBranchNotes: string;
    condition: string;
}
export type SpellId = bigint;
export interface RealmTerritoryEntry {
    id: string;
    status: string;
    contested: boolean;
    owner: Principal;
    date: string;
    notes: string;
    armyId: string;
    realm: string;
}
export interface Commendation {
    id: string;
    owner: Principal;
    date: string;
    awardedBy: string;
    armyId: string;
    medalName: string;
    soldierId: string;
    soldierName: string;
    reason: string;
}
export interface CalendarEvent {
    id: bigint;
    title: string;
    owner: Principal;
    date: string;
    linkedEncounterId: string;
    description: string;
    linkedSessionId: string;
    notes: string;
    category: string;
}
export type CustomPhysicalAttackId = bigint;
export interface Quest {
    id: string;
    status: string;
    reward: string;
    title: string;
    linkedNpcIds: Array<bigint>;
    description: string;
    notes: string;
    objectives: string;
    linkedFactionIds: Array<bigint>;
}
export interface OrderEntry {
    id: string;
    order: string;
    date: string;
    target: string;
}
export interface ArmyLogistics {
    goldReserves: bigint;
    supplyLines: Array<SupplyLine>;
    injuryNotes: string;
    food: bigint;
    ammunition: bigint;
    casualtiesLog: Array<CasualtyEntry>;
}
export interface ChainEntry {
    id: string;
    officerId: string;
    role: string;
    reportsToId: string;
}
export interface OfficerDuel {
    id: string;
    date: string;
    notes: string;
    outcome: string;
    officer1: string;
    officer2: string;
}
export interface MIAEntry {
    id: string;
    status: string;
    lastKnownLocation: string;
    owner: Principal;
    resolvedDate: string;
    dateLastSeen: string;
    notes: string;
    circumstances: string;
    armyId: string;
    soldierId: string;
    soldierName: string;
}
export interface BattleOutcome {
    id: bigint;
    result: string;
    owner: Principal;
    casualties: string;
    date: string;
    notes: string;
    armyId: string;
    opponent: string;
}
export interface CharacterAppearance {
    age: string;
    weight: string;
    height: string;
    eyeColor: string;
    distinguishingMarks: string;
    hairColor: string;
}
export interface SoulBountyEntry {
    id: string;
    status: string;
    value: string;
    owner: Principal;
    date: string;
    bountyType: string;
    notes: string;
    targetName: string;
    armyId: string;
}
export interface BlackBudgetEntry {
    id: string;
    owner: Principal;
    date: string;
    notes: string;
    armyId: string;
    allocation: string;
    amount: string;
    purpose: string;
}
export interface ArmyAlignmentEntry {
    id: string;
    owner: Principal;
    moralAxis: string;
    lastUpdated: string;
    ethicalAxis: string;
    notes: string;
    armyId: string;
}
export interface InitiativeEntry {
    id: string;
    maxHp: bigint;
    dexModifier: bigint;
    currentHp: bigint;
    name: string;
    initiativeRoll: bigint;
    isPlayer: boolean;
    conditions: Array<string>;
}
export interface ArmyRank {
    id: string;
    name: string;
    tier: bigint;
    description: string;
    troopCount: bigint;
}
export interface SrdSpell {
    duration: string;
    school: string;
    name: string;
    damageEffect: string;
    components: string;
    description: string;
    level: bigint;
    range: string;
    castingTime: string;
}
export type RaceId = bigint;
export interface SpecOpsGroup {
    id: string;
    missionType: string;
    name: string;
    headcount: bigint;
    officerIds: Array<string>;
    equipmentNotes: string;
    notes: string;
    abilities: Array<ArmyAbility>;
    condition: string;
}
export interface CustomPhysicalAttack {
    owner: Principal;
    name: string;
    attackBonus: bigint;
    description: string;
    properties: string;
    damageDice: string;
    damageType: string;
    range: string;
}
export type CharacterPhysicalAttackId = bigint;
export interface SecretMissionLog {
    id: string;
    title: string;
    participants: string;
    owner: Principal;
    date: string;
    objective: string;
    notes: string;
    armyId: string;
    outcome: string;
    classification: string;
}
export interface ArmyLoadout {
    id: string;
    name: string;
    armorType: string;
    weaponType: string;
    notes: string;
}
export interface Trait {
    source: string;
    name: string;
    description: string;
    characterId: CharacterId;
}
export interface MoraleEvent {
    id: string;
    impact: string;
    date: string;
    event: string;
}
export interface TimelineEvent {
    id: string;
    title: string;
    owner: Principal;
    date: string;
    characters: Array<string>;
    description: string;
    linkedFactionId?: bigint;
    category: string;
    armies: Array<string>;
    linkedLocationId?: bigint;
}
export interface CharacterProficiency {
    id: bigint;
    name: string;
    characterId: CharacterId;
    profType: string;
}
export interface SessionEntry {
    id: string;
    title: string;
    linkedQuestIds: Array<bigint>;
    linkedNpcIds: Array<bigint>;
    linkedEncounterIds: Array<bigint>;
    owner: Principal;
    date: string;
    loot: string;
    campaignId?: string;
    summary: string;
    xpGained: bigint;
    notes: string;
}
export interface Faction {
    id: bigint;
    characterAffiliations: string;
    owner: Principal;
    name: string;
    description: string;
    goals: string;
    notes: string;
    relationships: string;
    armyAffiliations: string;
    alignment: string;
}
export interface ArmyDoctrine {
    id: string;
    title: string;
    combatDoctrine: string;
    owner: Principal;
    lastUpdated: string;
    notes: string;
    armyId: string;
    standingOrders: string;
    rulesOfEngagement: string;
}
export interface DeathSaveState {
    failures: bigint;
    successes: bigint;
    characterId: CharacterId;
}
export interface CharacterInjury {
    id: string;
    recoveryNotes: string;
    source: string;
    owner: Principal;
    estimatedRecovery: string;
    description: string;
    dateReceived: string;
    injuryName: string;
    injuryType: string;
    recoveryStatus: string;
    severity: string;
    characterId: CharacterId;
}
export interface CharacterLegacy {
    id: string;
    title: string;
    owner: Principal;
    date: string;
    affectedEntities: string;
    impactDescription: string;
    notes: string;
    characterId: string;
}
export interface ArmyCommandStructure {
    chainOfCommand: Array<ChainEntry>;
    ordersLog: Array<OrderEntry>;
}
export interface ArmyMoraleData {
    loyaltyTracker: Array<LoyaltyEntry>;
    moraleEventsLog: Array<MoraleEvent>;
}
export interface EnemyIntelEntry {
    id: string;
    weaknesses: string;
    date: string;
    notes: string;
    enemyName: string;
    knownStrength: string;
}
export interface ArmyNotes {
    battlePlannerNotes: Array<BattlePlanEntry>;
    generalNotes: string;
    campaignLog: Array<CampaignLogEntry>;
}
export interface CursedItemEntry {
    id: string;
    acquiredDate: string;
    effects: string;
    owner: Principal;
    cured: boolean;
    curse: string;
    notes: string;
    itemName: string;
    characterId: string;
    cureCondition: string;
}
export interface TrainingCertification {
    id: string;
    expiresDate: string;
    certName: string;
    completionDate: string;
    owner: Principal;
    trainer: string;
    notes: string;
    armyId: string;
    soldierId: string;
    soldierName: string;
}
export interface CelestialBlessingEntry {
    id: string;
    owner: Principal;
    date: string;
    description: string;
    blessingType: string;
    armyId: string;
    soldierName: string;
}
export interface WeatherEntry {
    id: bigint;
    endDate: string;
    effects: string;
    owner: Principal;
    season: string;
    notes: string;
    weatherType: string;
    startDate: string;
}
export interface ThemeSettings {
    themePreset: string;
    accentColor: string;
}
export interface XpState {
    xp: bigint;
    milestoneNotes: string;
    characterId: CharacterId;
    milestoneMode: boolean;
    totalXpEarned: bigint;
}
export interface CharacterCustomStat {
    id: bigint;
    statId: bigint;
    value: string;
    owner: Principal;
    statName: string;
    characterId: CharacterId;
}
export interface ArmyMetadata {
    id: string;
    ageDescription: string;
    doctrine: string;
    reputationScore: bigint;
    owner: Principal;
    reputationNotes: string;
    foundingDate: string;
    moraleWarningEnabled: boolean;
    armyId: string;
    moraleWarningThreshold: bigint;
}
export interface DarkRitualEntry {
    id: string;
    participants: string;
    owner: Principal;
    ritualName: string;
    date: string;
    notes: string;
    armyId: string;
    outcome: string;
    purpose: string;
}
export interface Ally {
    id: bigint;
    relationship: string;
    name: string;
    notes: string;
    characterId: CharacterId;
}
export interface EquipmentSlot {
    id: string;
    itemId?: string;
    slotName: string;
    notes: string;
    itemName: string;
}
export interface ArmyRelationship {
    id: string;
    relationship: string;
    notes: string;
    armyName: string;
}
export interface MulticlassEntry {
    id: string;
    spellcastingMod: string;
    level: bigint;
    isSpellcaster: boolean;
    className: string;
}
export interface AnomalyExposureEntry {
    id: string;
    anomalyType: string;
    effects: string;
    owner: Principal;
    date: string;
    notes: string;
    armyId: string;
    personnelName: string;
}
export interface BloodOathEntry {
    id: string;
    oathText: string;
    broken: boolean;
    owner: Principal;
    date: string;
    swornTo: string;
    conditions: string;
    armyId: string;
    soldierId: string;
    breakNotes: string;
    soldierName: string;
}
export interface AscensionLogEntry {
    id: string;
    owner: Principal;
    date: string;
    toRank: string;
    notes: string;
    fromRank: string;
    armyId: string;
    soldierName: string;
    reason: string;
}
export interface OfficerSkill {
    skillName: string;
    effect: string;
    rating: bigint;
}
export interface TrophyEntry {
    id: string;
    owner: Principal;
    date: string;
    name: string;
    battle: string;
    description: string;
    takenFrom: string;
    notes: string;
    armyId: string;
}
export interface SupplyRoute {
    id: string;
    status: string;
    toLocationId: string;
    fromLocationId: string;
    notes: string;
}
export interface CustomRace {
    abilityBonuses: Abilities;
    traits: Array<Trait>;
    name: string;
    description: string;
    speed: bigint;
}
export interface ContainmentBreachEntry {
    id: string;
    resolved: boolean;
    breach: string;
    owner: Principal;
    casualties: bigint;
    date: string;
    scpDesignation: string;
    notes: string;
    armyId: string;
}
export interface CampaignEnemy {
    id: string;
    status: string;
    knownWeaknesses: string;
    knownStrengths: string;
    owner: Principal;
    name: string;
    wins: bigint;
    campaignId: string;
    description: string;
    losses: bigint;
    notes: string;
    faction: string;
    enemyType: string;
    linkedArmyEnemyIds: Array<string>;
    draws: bigint;
}
export interface UserProfile {
    name: string;
}
export interface CharacterRelationship {
    id: bigint;
    owner: Principal;
    relatedCharacterName: string;
    notes: string;
    characterId: string;
    relationshipType: string;
}
export interface Location {
    id: string;
    region: string;
    owner: Principal;
    name: string;
    description: string;
    visitedDate: string;
    notes: string;
    locationType: string;
    factionId?: bigint;
}
export type CharacterId = bigint;
export interface Army {
    id: string;
    logistics: ArmyLogistics;
    status: string;
    moraleData: ArmyMoraleData;
    terrainNotes: string;
    powerLevel: bigint;
    owner: Principal;
    officerAbilities: Array<ArmyAbility>;
    commanders: Array<ArmyCommander>;
    name: string;
    race: string;
    size: bigint;
    banner: string;
    specOpsGroups: Array<SpecOpsGroup>;
    foundingDate: string;
    commanderAbilities: Array<ArmyAbility>;
    commandStructure: ArmyCommandStructure;
    alliedArmies: Array<AlliedArmy>;
    faction: string;
    armyNotes: ArmyNotes;
    specialties: Array<string>;
    characterId: CharacterId;
    trainingLevel: string;
    warChest: bigint;
    branches: Array<ArmyBranch>;
    officers: Array<ArmyOfficer>;
    ranks: Array<ArmyRank>;
    machinery: Array<ArmyMachinery>;
    commandingCharacterId?: string;
    moraleRating: bigint;
    armyAbilities: Array<ArmyAbility>;
    intelligence: ArmyIntelligence;
    condition: string;
}
export interface AncientHistoryEntry {
    id: string;
    era: string;
    affectedFactions: string;
    owner: Principal;
    affectedLocations: string;
    date: string;
    description: string;
    eventTitle: string;
    notes: string;
}
export interface SupplyConsumptionEntry {
    id: string;
    date: string;
    foodConsumed: bigint;
    ammoConsumed: bigint;
    notes: string;
}
export interface CharacterFeat {
    id: bigint;
    name: string;
    description: string;
    characterId: CharacterId;
}
export interface HolyRelicEntry {
    id: string;
    owner: Principal;
    name: string;
    origin: string;
    description: string;
    notes: string;
    armyId: string;
    holder: string;
}
export interface InspirationState {
    labelText: string;
    points: bigint;
}
export interface ProphecyEntry {
    id: string;
    relatedFactions: string;
    source: string;
    owner: Principal;
    fulfilled: boolean;
    date: string;
    text: string;
    notes: string;
    fulfillmentNotes: string;
    relatedCharacters: string;
}
export interface HPState {
    hpMax: bigint;
    hpTemp: bigint;
    hpCurrent: bigint;
    characterId: CharacterId;
}
export interface LoyaltyEntry {
    id: string;
    notes: string;
    entityName: string;
    loyaltyScore: bigint;
}
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
    skills: Skills;
    proficiencyBonus: bigint;
    alignment: string;
    initiative: bigint;
}
export interface MythologicalFigure {
    id: string;
    powers: string;
    figureType: string;
    domain: string;
    owner: Principal;
    name: string;
    mythology: string;
    notes: string;
    relationships: string;
}
export interface EncounterEntry {
    id: string;
    linkedNpcIds: Array<bigint>;
    xpAwarded: bigint;
    owner: Principal;
    date: string;
    difficulty: string;
    name: string;
    campaignId?: string;
    locationId?: bigint;
    notes: string;
    outcome: string;
}
export interface SupplyLine {
    id: string;
    vulnerabilities: string;
    notes: string;
    route: string;
}
export interface LootDistributionEntry {
    id: string;
    recipient: string;
    notes: string;
    timestamp: bigint;
    itemName: string;
    quantity: bigint;
}
export interface Campaign {
    id: string;
    status: string;
    characterIds: Array<string>;
    owner: Principal;
    name: string;
    description: string;
    armyIds: Array<string>;
    notes: string;
    startDate: string;
}
export interface ArmyIntelligence {
    enemyIntelLog: Array<EnemyIntelEntry>;
    scoutReports: Array<ScoutReport>;
}
export interface CharacterPhysicalAttack {
    name: string;
    attackBonus: bigint;
    description: string;
    properties: string;
    timesUsed: bigint;
    damageDice: string;
    damageType: string;
    characterId: CharacterId;
    range: string;
}
export interface WarCrimeEntry {
    id: string;
    owner: Principal;
    date: string;
    event: string;
    notes: string;
    perpetrators: string;
    armyId: string;
    consequence: string;
    location: string;
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
    skills: Skills;
    proficiencyBonus: bigint;
    alignment: string;
    initiative: bigint;
}
export type CustomSpellSchoolId = bigint;
export interface SiteAssignmentEntry {
    id: string;
    owner: Principal;
    site: string;
    notes: string;
    armyId: string;
    assignedDate: string;
    personnelName: string;
}
export interface InitiativeTracker {
    id: string;
    entries: Array<InitiativeEntry>;
    currentTurnIndex: bigint;
    roundNumber: bigint;
    encounterId: string;
}
export interface LoreEntry {
    id: string;
    title: string;
    content: string;
    owner: Principal;
    createdAt: string;
    category: string;
}
export interface DreamVisionEntry {
    id: string;
    title: string;
    content: string;
    owner: Principal;
    date: string;
    relatedEntities: string;
    notes: string;
    prophetic: boolean;
    characterId: string;
    visionType: string;
}
export interface CustomSkill {
    id: bigint;
    statBased: string;
    owner: Principal;
    name: string;
    description: string;
}
export interface DefectionEntry {
    id: string;
    owner: Principal;
    date: string;
    rank: string;
    notes: string;
    toArmyId: string;
    soldierName: string;
    fromArmyId: string;
    reason: string;
}
export type InventoryItemId = bigint;
export interface CustomClass {
    features: Array<Trait>;
    name: string;
    hitDie: bigint;
    description: string;
    proficiencies: Array<string>;
}
export interface ArmyInput {
    logistics: ArmyLogistics;
    status: string;
    moraleData: ArmyMoraleData;
    terrainNotes: string;
    powerLevel: bigint;
    officerAbilities: Array<ArmyAbility>;
    commanders: Array<ArmyCommander>;
    name: string;
    race: string;
    size: bigint;
    banner: string;
    specOpsGroups: Array<SpecOpsGroup>;
    foundingDate: string;
    commanderAbilities: Array<ArmyAbility>;
    commandStructure: ArmyCommandStructure;
    alliedArmies: Array<AlliedArmy>;
    faction: string;
    armyNotes: ArmyNotes;
    specialties: Array<string>;
    characterId: CharacterId;
    trainingLevel: string;
    warChest: bigint;
    branches: Array<ArmyBranch>;
    officers: Array<ArmyOfficer>;
    ranks: Array<ArmyRank>;
    machinery: Array<ArmyMachinery>;
    commandingCharacterId?: string;
    moraleRating: bigint;
    armyAbilities: Array<ArmyAbility>;
    intelligence: ArmyIntelligence;
    condition: string;
}
export interface ArmyMoraleHistoryEntry {
    modifier: bigint;
    notes: string;
    timestamp: string;
    eventType: string;
}
export interface ReclassificationEntry {
    id: string;
    toClass: string;
    subject: string;
    owner: Principal;
    date: string;
    notes: string;
    armyId: string;
    reason: string;
    fromClass: string;
}
export interface CurrencyState {
    gold: bigint;
    platinum: bigint;
    silver: bigint;
    characterId: CharacterId;
    copper: bigint;
    electrum: bigint;
}
export interface ArmyCommander {
    id: string;
    commandSkills: Array<string>;
    signatureAbility: string;
    background: string;
    name: string;
    historyNotes: string;
    rankId: string;
    abilities: Array<ArmyAbility>;
    factionId?: bigint;
}
export interface CharacterSkill {
    id: bigint;
    skillName: string;
    expertise: boolean;
    proficient: boolean;
    characterId: CharacterId;
}
export interface PrisonerExchangeEntry {
    id: string;
    status: string;
    ransomAmount: bigint;
    exchangeDetails: string;
    owner: Principal;
    notes: string;
    prisonerFaction: string;
    prisonerName: string;
    prisonerRank: string;
    armyId: string;
    capturedDate: string;
    capturedFrom: string;
}
export interface BetrayalLogEntry {
    id: string;
    owner: Principal;
    date: string;
    punishment: string;
    traitorName: string;
    notes: string;
    armyId: string;
    offense: string;
}
export type CustomItemId = bigint;
export interface BattleSimResult {
    winnerName: string;
    estimatedCasualties: string;
    notes: string;
    loserName: string;
    outcome: string;
}
export interface BattleEngagement {
    id: string;
    date: string;
    name: string;
    losses: string;
    notes: string;
    outcome: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAllianceTreaty(entry: AllianceTreaty): Promise<string>;
    addAlly(characterId: CharacterId, name: string, relationship: string, notes: string): Promise<bigint>;
    addAmnesticLogEntry(entry: AmnesticLogEntry): Promise<string>;
    addAncientHistoryEntry(entry: AncientHistoryEntry): Promise<string>;
    addAngelClassEntry(entry: AngelClassEntry): Promise<string>;
    addAnomalyExposureEntry(entry: AnomalyExposureEntry): Promise<string>;
    addArmy(input: ArmyInput): Promise<string>;
    addArmyDoctrine(entry: ArmyDoctrine): Promise<string>;
    addArmyLootEntry(armyId: string, entry: ArmyLootEntry): Promise<string>;
    addArmyMoraleEvent(armyId: string, event: ArmyMoraleHistoryEntry): Promise<boolean>;
    addArmyRivalEntry(entry: ArmyRivalEntry): Promise<string>;
    addAscensionLogEntry(entry: AscensionLogEntry): Promise<string>;
    addAttunedItem(characterId: CharacterId, item: AttunedItem): Promise<void>;
    addBattleEngagement(armyId: string, engagement: BattleEngagement): Promise<void>;
    addBattleOutcome(entry: BattleOutcome): Promise<bigint>;
    addBestiaryCreature(entry: BestiaryCreature): Promise<bigint>;
    addBetrayalLogEntry(entry: BetrayalLogEntry): Promise<string>;
    addBlackBudgetEntry(entry: BlackBudgetEntry): Promise<string>;
    addBloodOathEntry(entry: BloodOathEntry): Promise<string>;
    addBloodlineEntry(entry: BloodlineEntry): Promise<string>;
    addBountyObjective(armyId: string, obj: BountyObjective): Promise<string>;
    addCalendarEvent(entry: CalendarEvent): Promise<bigint>;
    addCampaign(campaign: Campaign): Promise<void>;
    addCampaignEnemy(campaignId: string, enemy: CampaignEnemy): Promise<string>;
    addCapturedEnemy(entry: CapturedEnemy): Promise<bigint>;
    addCelestialBlessing(entry: CelestialBlessingEntry): Promise<string>;
    addCharacterAbility(ability: CharacterAbility): Promise<CharacterAbilityId>;
    addCharacterCustomStat(characterId: CharacterId, statId: bigint, statName: string, value: string): Promise<bigint>;
    addCharacterFeat(characterId: CharacterId, name: string, description: string): Promise<bigint>;
    addCharacterInjury(characterId: CharacterId, injury: CharacterInjury): Promise<string>;
    addCharacterLegacy(entry: CharacterLegacy): Promise<string>;
    addCharacterPhysicalAttack(attack: CharacterPhysicalAttack): Promise<CharacterPhysicalAttackId>;
    addCharacterProficiency(characterId: CharacterId, profType: string, name: string): Promise<bigint>;
    addCharacterRelationship(entry: CharacterRelationship): Promise<bigint>;
    addCharacterSkill(characterId: CharacterId, skillName: string, proficient: boolean, expertise: boolean): Promise<bigint>;
    addClass(cls: CustomClass): Promise<ClassId>;
    addClearanceLevelEntry(entry: ClearanceLevelEntry): Promise<string>;
    addCommendation(entry: Commendation): Promise<string>;
    addContainmentBreachEntry(entry: ContainmentBreachEntry): Promise<string>;
    addCorruptionLogEntry(entry: CorruptionLogEntry): Promise<string>;
    addCourtMartialEntry(entry: CourtMartialEntry): Promise<string>;
    addCursedItemEntry(entry: CursedItemEntry): Promise<string>;
    addCustomAbility(ability: CustomAbility): Promise<CustomAbilityId>;
    addCustomFeat(name: string, description: string, prerequisites: string): Promise<bigint>;
    addCustomItem(item: CustomItem): Promise<CustomItemId>;
    addCustomPhysicalAttack(attack: CustomPhysicalAttack): Promise<CustomPhysicalAttackId>;
    addCustomSkill(name: string, statBased: string, description: string): Promise<bigint>;
    addCustomSpell(spell: CustomSpell): Promise<CustomSpellId>;
    addCustomSpellSchool(school: CustomSpellSchool): Promise<CustomSpellSchoolId>;
    addCustomStat(name: string, description: string, defaultValue: string): Promise<bigint>;
    addDarkRitualEntry(entry: DarkRitualEntry): Promise<string>;
    addDefectionEntry(entry: DefectionEntry): Promise<string>;
    addDemonClassEntry(entry: DemonClassEntry): Promise<string>;
    addDeploymentNote(armyId: string, note: DeploymentMapNote): Promise<string>;
    addDiplomacyEntry(armyId: string, entry: DiplomacyEntry): Promise<string>;
    addDivineMandate(entry: DivineMandateEntry): Promise<string>;
    addDreamVisionEntry(entry: DreamVisionEntry): Promise<string>;
    addEncounterEntry(entry: EncounterEntry): Promise<void>;
    addEnemyProfile(armyId: string, profile: EnemyProfile): Promise<string>;
    addEspionageEntry(entry: EspionageEntry): Promise<string>;
    addEthicsReviewEntry(entry: EthicsReviewEntry): Promise<string>;
    addFaction(entry: Faction): Promise<bigint>;
    addFallenSoldier(entry: FallenSoldierEntry): Promise<string>;
    addGainLossEntry(armyId: string, entry: GainLossEntry): Promise<string>;
    addHolyRelic(entry: HolyRelicEntry): Promise<string>;
    addHolyWarEntry(entry: HolyWarEntry): Promise<string>;
    addInfernalDebtEntry(entry: InfernalDebtEntry): Promise<string>;
    addInterPresetWarEntry(entry: InterPresetWarEntry): Promise<string>;
    addItem(item: InventoryItem): Promise<InventoryItemId>;
    addLanguage(characterId: CharacterId, name: string): Promise<bigint>;
    addLocation(loc: Location): Promise<void>;
    addLootDistributionEntry(entry: LootDistributionEntry): Promise<boolean>;
    addLoreEntry(entry: LoreEntry): Promise<void>;
    addLostKnowledgeEntry(entry: LostKnowledgeEntry): Promise<string>;
    addMIAEntry(entry: MIAEntry): Promise<string>;
    addMythologicalFigure(entry: MythologicalFigure): Promise<string>;
    addNPC(npc: NPC): Promise<void>;
    addOfficerDuel(armyId: string, duel: OfficerDuel): Promise<void>;
    addPactContractEntry(entry: PactContractEntry): Promise<string>;
    addPartyInventoryItem(item: PartyInventoryItem): Promise<void>;
    addPartyNote(note: PartyNote): Promise<void>;
    addPartyXpEntry(entry: PartyXpEntry): Promise<boolean>;
    addPersonalLootEntry(characterId: CharacterId, entry: PersonalLootEntry): Promise<string>;
    addPortalEntry(entry: PortalEntry): Promise<string>;
    addPrayerLogEntry(entry: PrayerLogEntry): Promise<string>;
    addPrisonerExchange(armyId: string, entry: PrisonerExchangeEntry): Promise<string>;
    addProphecyEntry(entry: ProphecyEntry): Promise<string>;
    addProtocolLogEntry(entry: ProtocolLogEntry): Promise<string>;
    addPsychEvalEntry(entry: PsychEvalEntry): Promise<string>;
    addQuest(characterId: CharacterId, quest: Quest): Promise<void>;
    addRace(race: CustomRace): Promise<RaceId>;
    addRealmTerritoryEntry(entry: RealmTerritoryEntry): Promise<string>;
    addReclassificationEntry(entry: ReclassificationEntry): Promise<string>;
    addRecruitmentEntry(armyId: string, entry: RecruitmentEntry): Promise<void>;
    addRivalEntry(characterId: CharacterId, entry: RivalEntry): Promise<string>;
    addScpObjectEntry(entry: ScpObjectEntry): Promise<string>;
    addSecretMissionLog(entry: SecretMissionLog): Promise<string>;
    addSessionEntry(entry: SessionEntry): Promise<void>;
    addSiegeEntry(entry: SiegeEntry): Promise<string>;
    addSinCorruptionEntry(entry: SinCorruptionEntry): Promise<string>;
    addSiteAssignmentEntry(entry: SiteAssignmentEntry): Promise<string>;
    addSoldierBio(entry: SoldierBio): Promise<string>;
    addSoulBountyEntry(entry: SoulBountyEntry): Promise<string>;
    addSpell(spell: Spell): Promise<SpellId>;
    addSummoningLogEntry(entry: SummoningLogEntry): Promise<string>;
    addTimelineEvent(event: TimelineEvent): Promise<void>;
    addTrainingCertification(entry: TrainingCertification): Promise<string>;
    addTrait(trait: Trait): Promise<TraitId>;
    addTrophyEntry(entry: TrophyEntry): Promise<string>;
    addVeteranUnit(entry: VeteranUnit): Promise<string>;
    addWarCrimeEntry(entry: WarCrimeEntry): Promise<string>;
    addWeatherEntry(entry: WeatherEntry): Promise<bigint>;
    addWhistleblowerEntry(entry: WhistleblowerEntry): Promise<string>;
    applyCharacterLevelFromXp(characterId: CharacterId): Promise<void>;
    applyRaceGrantsToCharacter(characterId: CharacterId, raceId: RaceId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCharacter(char: Character): Promise<CharacterId>;
    deleteAllianceTreaty(id: string): Promise<boolean>;
    deleteAlly(id: bigint): Promise<void>;
    deleteAmnesticLogEntry(id: string): Promise<boolean>;
    deleteAncientHistoryEntry(id: string): Promise<boolean>;
    deleteAngelClassEntry(id: string): Promise<boolean>;
    deleteAnomalyExposureEntry(id: string): Promise<boolean>;
    deleteAppReminder(id: string): Promise<boolean>;
    deleteArmy(id: string): Promise<void>;
    deleteArmyDoctrine(id: string): Promise<boolean>;
    deleteArmyLootEntry(id: string): Promise<boolean>;
    deleteArmyRivalEntry(id: string): Promise<boolean>;
    deleteAscensionLogEntry(id: string): Promise<boolean>;
    deleteBattleEngagement(armyId: string, engagementId: string): Promise<void>;
    deleteBattleOutcome(id: bigint): Promise<boolean>;
    deleteBestiaryCreature(id: bigint): Promise<boolean>;
    deleteBetrayalLogEntry(id: string): Promise<boolean>;
    deleteBlackBudgetEntry(id: string): Promise<boolean>;
    deleteBloodOathEntry(id: string): Promise<boolean>;
    deleteBloodlineEntry(id: string): Promise<boolean>;
    deleteBountyObjective(id: string): Promise<boolean>;
    deleteCalendarEvent(id: bigint): Promise<boolean>;
    deleteCampaign(id: string): Promise<void>;
    deleteCampaignEnemy(id: string): Promise<boolean>;
    deleteCapturedEnemy(id: bigint): Promise<boolean>;
    deleteCelestialBlessing(id: string): Promise<boolean>;
    deleteCharacter(id: CharacterId): Promise<void>;
    deleteCharacterAbility(id: CharacterAbilityId): Promise<void>;
    deleteCharacterCustomStat(id: bigint): Promise<void>;
    deleteCharacterFeat(id: bigint): Promise<void>;
    deleteCharacterInjury(id: string): Promise<boolean>;
    deleteCharacterLegacy(id: string): Promise<boolean>;
    deleteCharacterPhysicalAttack(id: CharacterPhysicalAttackId): Promise<void>;
    deleteCharacterProficiency(id: bigint): Promise<void>;
    deleteCharacterRelationship(id: bigint): Promise<boolean>;
    deleteCharacterSkill(id: bigint): Promise<void>;
    deleteClass(id: ClassId): Promise<void>;
    deleteClearanceLevelEntry(id: string): Promise<boolean>;
    deleteCommendation(id: string): Promise<boolean>;
    deleteContainmentBreachEntry(id: string): Promise<boolean>;
    deleteCorruptionLogEntry(id: string): Promise<boolean>;
    deleteCourtMartialEntry(id: string): Promise<boolean>;
    deleteCursedItemEntry(id: string): Promise<boolean>;
    deleteCustomAbility(id: CustomAbilityId): Promise<void>;
    deleteCustomFeat(id: bigint): Promise<void>;
    deleteCustomItem(id: CustomItemId): Promise<void>;
    deleteCustomPhysicalAttack(id: CustomPhysicalAttackId): Promise<void>;
    deleteCustomSkill(id: bigint): Promise<void>;
    deleteCustomSpell(id: CustomSpellId): Promise<void>;
    deleteCustomSpellSchool(id: CustomSpellSchoolId): Promise<void>;
    deleteCustomStat(id: bigint): Promise<void>;
    deleteDarkRitualEntry(id: string): Promise<boolean>;
    deleteDefectionEntry(id: string): Promise<boolean>;
    deleteDemonClassEntry(id: string): Promise<boolean>;
    deleteDeploymentNote(id: string): Promise<boolean>;
    deleteDiplomacyEntry(id: string): Promise<boolean>;
    deleteDivineMandate(id: string): Promise<boolean>;
    deleteDreamVisionEntry(id: string): Promise<boolean>;
    deleteEncounterEntry(id: string): Promise<void>;
    deleteEnemyProfile(id: string): Promise<boolean>;
    deleteEspionageEntry(id: string): Promise<boolean>;
    deleteEthicsReviewEntry(id: string): Promise<boolean>;
    deleteFaction(id: bigint): Promise<boolean>;
    deleteFallenSoldier(id: string): Promise<boolean>;
    deleteGainLossEntry(id: string): Promise<boolean>;
    deleteHolyRelic(id: string): Promise<boolean>;
    deleteHolyWarEntry(id: string): Promise<boolean>;
    deleteInfernalDebtEntry(id: string): Promise<boolean>;
    deleteInitiativeTracker(id: string): Promise<boolean>;
    deleteInterPresetWarEntry(id: string): Promise<boolean>;
    deleteItem(id: InventoryItemId): Promise<void>;
    deleteLanguage(id: bigint): Promise<void>;
    deleteLocation(id: string): Promise<void>;
    deleteLootDistributionEntry(id: string): Promise<boolean>;
    deleteLoreEntry(id: string): Promise<void>;
    deleteLostKnowledgeEntry(id: string): Promise<boolean>;
    deleteMIAEntry(id: string): Promise<boolean>;
    deleteMythologicalFigure(id: string): Promise<boolean>;
    deleteNPC(id: string): Promise<void>;
    deleteOfficerDuel(armyId: string, duelId: string): Promise<void>;
    deletePactContractEntry(id: string): Promise<boolean>;
    deletePartyInventoryItem(id: string): Promise<void>;
    deletePartyNote(id: string): Promise<void>;
    deletePartyXpEntry(id: string): Promise<boolean>;
    deletePersonalLootEntry(id: string): Promise<boolean>;
    deletePortalEntry(id: string): Promise<boolean>;
    deletePrayerLogEntry(id: string): Promise<boolean>;
    deletePrisonerExchange(id: string): Promise<boolean>;
    deleteProphecyEntry(id: string): Promise<boolean>;
    deleteProtocolLogEntry(id: string): Promise<boolean>;
    deletePsychEvalEntry(id: string): Promise<boolean>;
    deleteQuest(characterId: CharacterId, questId: string): Promise<void>;
    deleteRace(id: RaceId): Promise<void>;
    deleteRealmTerritoryEntry(id: string): Promise<boolean>;
    deleteReclassificationEntry(id: string): Promise<boolean>;
    deleteRecruitmentEntry(armyId: string, entryId: string): Promise<void>;
    deleteRivalEntry(id: string): Promise<boolean>;
    deleteScpObjectEntry(id: string): Promise<boolean>;
    deleteSecretMissionLog(id: string): Promise<boolean>;
    deleteSessionEntry(id: string): Promise<void>;
    deleteSiegeEntry(id: string): Promise<boolean>;
    deleteSinCorruptionEntry(id: string): Promise<boolean>;
    deleteSiteAssignmentEntry(id: string): Promise<boolean>;
    deleteSoldierBio(id: string): Promise<boolean>;
    deleteSoulBountyEntry(id: string): Promise<boolean>;
    deleteSpell(id: SpellId): Promise<void>;
    deleteSummoningLogEntry(id: string): Promise<boolean>;
    deleteTabNote(characterId: CharacterId, tabName: string): Promise<void>;
    deleteTimelineEvent(id: string): Promise<void>;
    deleteTrainingCertification(id: string): Promise<boolean>;
    deleteTrait(id: TraitId): Promise<void>;
    deleteTrophyEntry(id: string): Promise<boolean>;
    deleteVeteranUnit(id: string): Promise<boolean>;
    deleteWarCrimeEntry(id: string): Promise<boolean>;
    deleteWeatherEntry(id: bigint): Promise<boolean>;
    deleteWhistleblowerEntry(id: string): Promise<boolean>;
    exportAllData(): Promise<string>;
    exportCharacter(characterId: CharacterId): Promise<string>;
    getAbilitiesByCharacter(characterId: CharacterId): Promise<Array<[CharacterAbilityId, CharacterAbility]>>;
    getAllCharacters(): Promise<Array<[CharacterId, Character]>>;
    getAllCharactersCount(arg0: {
    }): Promise<bigint>;
    getAllClasses(): Promise<Array<[ClassId, CustomClass]>>;
    getAllCustomAbilities(): Promise<Array<[CustomAbilityId, CustomAbility]>>;
    getAllCustomFeats(): Promise<Array<CustomFeat>>;
    getAllCustomItems(): Promise<Array<[CustomItemId, CustomItem]>>;
    getAllCustomPhysicalAttacks(): Promise<Array<[CustomPhysicalAttackId, CustomPhysicalAttack]>>;
    getAllCustomSkills(): Promise<Array<CustomSkill>>;
    getAllCustomSpellSchools(): Promise<Array<[CustomSpellSchoolId, CustomSpellSchool]>>;
    getAllCustomSpells(): Promise<Array<[CustomSpellId, CustomSpell]>>;
    getAllCustomStats(): Promise<Array<CustomStat>>;
    getAllRaceLinkedContent(): Promise<Array<[RaceId, RaceLinkedContent]>>;
    getAllRaces(): Promise<Array<[RaceId, CustomRace]>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getAllianceTreaties(armyId: string): Promise<Array<AllianceTreaty>>;
    getAlliesByCharacter(characterId: CharacterId): Promise<Array<Ally>>;
    getAmnesticLog(armyId: string): Promise<Array<AmnesticLogEntry>>;
    getAncientHistoryEntries(): Promise<Array<AncientHistoryEntry>>;
    getAngelClassLog(armyId: string): Promise<Array<AngelClassEntry>>;
    getAnomalyExposureLog(armyId: string): Promise<Array<AnomalyExposureEntry>>;
    getAppReminders(): Promise<Array<AppReminder>>;
    getArmies(): Promise<Array<Army>>;
    getArmiesByCharacter(characterId: CharacterId): Promise<Array<Army>>;
    getArmyAlignment(armyId: string): Promise<ArmyAlignmentEntry | null>;
    getArmyDoctrines(armyId: string): Promise<Array<ArmyDoctrine>>;
    getArmyLoot(armyId: string): Promise<Array<ArmyLootEntry>>;
    getArmyMetadata(armyId: string): Promise<ArmyMetadata | null>;
    getArmyMoraleHistory(armyId: string): Promise<Array<ArmyMoraleHistoryEntry>>;
    getArmyOfficerSkills(armyId: bigint): Promise<Array<OfficerSkillEntry>>;
    getArmyRelationships(armyId: string): Promise<Array<ArmyRelationship>>;
    getArmyRivalEntries(armyId: string): Promise<Array<ArmyRivalEntry>>;
    getArmySupplyRoutes(armyId: bigint): Promise<Array<SupplyRoute>>;
    getAscensionLog(armyId: string): Promise<Array<AscensionLogEntry>>;
    getAttunedItems(characterId: CharacterId): Promise<Array<AttunedItem>>;
    getBattleEngagements(armyId: string): Promise<Array<BattleEngagement>>;
    getBattleOutcomes(armyId: string): Promise<Array<BattleOutcome>>;
    getBestiaryCreatures(): Promise<Array<BestiaryCreature>>;
    getBetrayalLog(armyId: string): Promise<Array<BetrayalLogEntry>>;
    getBlackBudgetLog(armyId: string): Promise<Array<BlackBudgetEntry>>;
    getBloodOathEntries(armyId: string): Promise<Array<BloodOathEntry>>;
    getBloodlineEntries(characterId: string): Promise<Array<BloodlineEntry>>;
    getBountyObjectives(armyId: string): Promise<Array<BountyObjective>>;
    getCalendarEvents(): Promise<Array<CalendarEvent>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCampaignEnemies(campaignId: string): Promise<Array<CampaignEnemy>>;
    getCampaigns(): Promise<Array<Campaign>>;
    getCapturedEnemies(armyId: string): Promise<Array<CapturedEnemy>>;
    getCelestialBlessings(armyId: string): Promise<Array<CelestialBlessingEntry>>;
    getCharacter(id: CharacterId): Promise<Character | null>;
    getCharacterAppearance(charId: CharacterId): Promise<CharacterAppearance | null>;
    getCharacterConditions(charId: CharacterId): Promise<Array<CharacterCondition>>;
    getCharacterCustomStatsByCharacter(characterId: CharacterId): Promise<Array<CharacterCustomStat>>;
    getCharacterFeatsByCharacter(characterId: CharacterId): Promise<Array<CharacterFeat>>;
    getCharacterInjuries(characterId: CharacterId): Promise<Array<CharacterInjury>>;
    getCharacterLegacies(characterId: string): Promise<Array<CharacterLegacy>>;
    getCharacterMulticlass(charId: CharacterId): Promise<Array<MulticlassEntry>>;
    getCharacterProficienciesByCharacter(characterId: CharacterId): Promise<Array<CharacterProficiency>>;
    getCharacterRelationships(characterId: string): Promise<Array<CharacterRelationship>>;
    getCharacterSkillsByCharacter(characterId: CharacterId): Promise<Array<CharacterSkill>>;
    getClearanceLevels(armyId: string): Promise<Array<ClearanceLevelEntry>>;
    getCommendations(armyId: string): Promise<Array<Commendation>>;
    getConcentrationState(characterId: CharacterId): Promise<ConcentrationState | null>;
    getContainmentBreachLog(armyId: string): Promise<Array<ContainmentBreachEntry>>;
    getCorruptionLog(armyId: string): Promise<Array<CorruptionLogEntry>>;
    getCourtMartialEntries(armyId: string): Promise<Array<CourtMartialEntry>>;
    getCurrencyState(characterId: CharacterId): Promise<CurrencyState | null>;
    getCursedItemEntries(characterId: string): Promise<Array<CursedItemEntry>>;
    getDarkRitualLog(armyId: string): Promise<Array<DarkRitualEntry>>;
    getDeathSaveState(characterId: CharacterId): Promise<DeathSaveState | null>;
    getDefectionEntries(): Promise<Array<DefectionEntry>>;
    getDemonClassLog(armyId: string): Promise<Array<DemonClassEntry>>;
    getDeploymentNotes(armyId: string): Promise<Array<DeploymentMapNote>>;
    getDiplomacyLog(armyId: string): Promise<Array<DiplomacyEntry>>;
    getDivineMandates(armyId: string): Promise<Array<DivineMandateEntry>>;
    getDreamVisionEntries(characterId: string): Promise<Array<DreamVisionEntry>>;
    getEncounterLog(): Promise<Array<EncounterEntry>>;
    getEnemyRoster(armyId: string): Promise<Array<EnemyProfile>>;
    getEquipmentSlots(characterId: CharacterId): Promise<Array<EquipmentSlot>>;
    getEspionageEntries(armyId: string): Promise<Array<EspionageEntry>>;
    getEthicsReviewLog(armyId: string): Promise<Array<EthicsReviewEntry>>;
    getFactions(): Promise<Array<Faction>>;
    getFallenSoldiers(armyId: string): Promise<Array<FallenSoldierEntry>>;
    getGainLossEntries(armyId: string): Promise<Array<GainLossEntry>>;
    getHPState(characterId: CharacterId): Promise<HPState | null>;
    getHolyRelics(armyId: string): Promise<Array<HolyRelicEntry>>;
    getHolyWarLog(armyId: string): Promise<Array<HolyWarEntry>>;
    getInfernalDebtLog(armyId: string): Promise<Array<InfernalDebtEntry>>;
    getInitiativeTrackers(): Promise<Array<InitiativeTracker>>;
    getInspirationState(characterId: CharacterId): Promise<InspirationState | null>;
    getInterPresetWarEntries(): Promise<Array<InterPresetWarEntry>>;
    getItemsByCharacter(characterId: CharacterId): Promise<Array<[InventoryItemId, InventoryItem]>>;
    getLanguagesByCharacter(characterId: CharacterId): Promise<Array<Language>>;
    getLocationDungeonRooms(locationId: string): Promise<Array<DungeonRoom>>;
    getLocations(): Promise<Array<Location>>;
    getLootDistributionLog(): Promise<Array<LootDistributionEntry>>;
    getLoreEntries(): Promise<Array<LoreEntry>>;
    getLostKnowledgeEntries(): Promise<Array<LostKnowledgeEntry>>;
    getMIAEntries(armyId: string): Promise<Array<MIAEntry>>;
    getMythologicalFigures(): Promise<Array<MythologicalFigure>>;
    getNPCs(): Promise<Array<NPC>>;
    getOfficerDuels(armyId: string): Promise<Array<OfficerDuel>>;
    getPactContractLog(armyId: string): Promise<Array<PactContractEntry>>;
    getPartyInventory(): Promise<Array<PartyInventoryItem>>;
    getPartyNotes(): Promise<Array<PartyNote>>;
    getPartyXpEntries(): Promise<Array<PartyXpEntry>>;
    getPersonalLoot(characterId: CharacterId): Promise<Array<PersonalLootEntry>>;
    getPhysicalAttacksByCharacter(characterId: CharacterId): Promise<Array<[CharacterPhysicalAttackId, CharacterPhysicalAttack]>>;
    getPlaneRealmEntry(): Promise<PlaneRealmEntry | null>;
    getPortalEntries(): Promise<Array<PortalEntry>>;
    getPrayerLog(armyId: string): Promise<Array<PrayerLogEntry>>;
    getPreparedSpells(characterId: CharacterId): Promise<Array<string>>;
    getPrisonerExchanges(armyId: string): Promise<Array<PrisonerExchangeEntry>>;
    getProphecyEntries(): Promise<Array<ProphecyEntry>>;
    getProtocolLog(armyId: string): Promise<Array<ProtocolLogEntry>>;
    getPsychEvalLog(armyId: string): Promise<Array<PsychEvalEntry>>;
    getQuestsByCharacter(characterId: CharacterId): Promise<Array<Quest>>;
    getRealmTerritoryLog(armyId: string): Promise<Array<RealmTerritoryEntry>>;
    getReclassificationLog(armyId: string): Promise<Array<ReclassificationEntry>>;
    getRecruitmentLog(armyId: string): Promise<Array<RecruitmentEntry>>;
    getRestState(characterId: CharacterId): Promise<RestState | null>;
    getRivals(characterId: CharacterId): Promise<Array<RivalEntry>>;
    getSaveThrowState(characterId: CharacterId): Promise<SaveThrowState | null>;
    getScpObjectLog(armyId: string): Promise<Array<ScpObjectEntry>>;
    getSecretMissionLogs(armyId: string): Promise<Array<SecretMissionLog>>;
    getSessionLog(): Promise<Array<SessionEntry>>;
    getSettings(): Promise<Settings>;
    getSiegeEntries(armyId: string): Promise<Array<SiegeEntry>>;
    getSinCorruptionLog(armyId: string): Promise<Array<SinCorruptionEntry>>;
    getSiteAssignmentLog(armyId: string): Promise<Array<SiteAssignmentEntry>>;
    getSoldierBios(armyId: string): Promise<Array<SoldierBio>>;
    getSoulBountyLog(armyId: string): Promise<Array<SoulBountyEntry>>;
    getSpellSlotsByCharacter(characterId: CharacterId): Promise<Array<SpellSlotState>>;
    getSpellsByCharacter(characterId: CharacterId): Promise<Array<[SpellId, Spell]>>;
    getSrdSpells(): Promise<Array<SrdSpell>>;
    getSummoningLog(armyId: string): Promise<Array<SummoningLogEntry>>;
    getSupplyConsumptionLog(armyId: string): Promise<Array<SupplyConsumptionEntry>>;
    getTabNote(characterId: CharacterId, tabName: string): Promise<TabNote | null>;
    getThemeSettings(): Promise<ThemeSettings | null>;
    getTimelineEvents(): Promise<Array<TimelineEvent>>;
    getTrainingCertifications(armyId: string): Promise<Array<TrainingCertification>>;
    getTraitsByCharacter(characterId: CharacterId): Promise<Array<[TraitId, Trait]>>;
    getTrophyEntries(armyId: string): Promise<Array<TrophyEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVeteranUnits(armyId: string): Promise<Array<VeteranUnit>>;
    getWarCrimeEntries(armyId: string): Promise<Array<WarCrimeEntry>>;
    getWeatherEntries(): Promise<Array<WeatherEntry>>;
    getWhistleblowerLog(armyId: string): Promise<Array<WhistleblowerEntry>>;
    getXpState(characterId: CharacterId): Promise<XpState | null>;
    importAllData(jsonData: string): Promise<boolean>;
    importCharacter(input: ImportCharacterInput): Promise<CharacterId>;
    initializeSrdSpells(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    logSupplyConsumption(armyId: string, entry: SupplyConsumptionEntry): Promise<void>;
    removeAttunedItem(characterId: CharacterId, itemId: string): Promise<void>;
    saveAppReminder(reminder: AppReminder): Promise<boolean>;
    saveArmyAlignment(entry: ArmyAlignmentEntry): Promise<boolean>;
    saveArmyMetadata(entry: ArmyMetadata): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveInitiativeTracker(tracker: InitiativeTracker): Promise<boolean>;
    savePlaneRealmEntry(entry: PlaneRealmEntry): Promise<boolean>;
    saveTabNote(characterId: CharacterId, tabName: string, content: string): Promise<void>;
    setPreparedSpells(characterId: CharacterId, spellIds: Array<string>): Promise<void>;
    simulateBattle(armyId1: bigint, armyId2: bigint): Promise<BattleSimResult>;
    updateAllianceTreaty(entry: AllianceTreaty): Promise<boolean>;
    updateAlly(id: bigint, name: string, relationship: string, notes: string): Promise<void>;
    updateAmnesticLogEntry(entry: AmnesticLogEntry): Promise<boolean>;
    updateAncientHistoryEntry(entry: AncientHistoryEntry): Promise<boolean>;
    updateAngelClassEntry(entry: AngelClassEntry): Promise<boolean>;
    updateAnomalyExposureEntry(entry: AnomalyExposureEntry): Promise<boolean>;
    updateArmy(id: string, input: ArmyInput): Promise<void>;
    updateArmyBanner(armyId: string, url: string): Promise<void>;
    updateArmyDoctrine(entry: ArmyDoctrine): Promise<boolean>;
    updateArmyLootEntry(id: string, entry: ArmyLootEntry): Promise<boolean>;
    updateArmyOfficerSkills(armyId: bigint, skills: Array<OfficerSkillEntry>): Promise<boolean>;
    updateArmyRelationships(armyId: string, relationships: Array<ArmyRelationship>): Promise<void>;
    updateArmyRivalEntry(entry: ArmyRivalEntry): Promise<boolean>;
    updateArmySupplyRoutes(armyId: bigint, routes: Array<SupplyRoute>): Promise<boolean>;
    updateAscensionLogEntry(entry: AscensionLogEntry): Promise<boolean>;
    updateBattleOutcome(entry: BattleOutcome): Promise<boolean>;
    updateBestiaryCreature(entry: BestiaryCreature): Promise<boolean>;
    updateBetrayalLogEntry(entry: BetrayalLogEntry): Promise<boolean>;
    updateBlackBudgetEntry(entry: BlackBudgetEntry): Promise<boolean>;
    updateBloodOathEntry(entry: BloodOathEntry): Promise<boolean>;
    updateBloodlineEntry(entry: BloodlineEntry): Promise<boolean>;
    updateBountyObjective(id: string, obj: BountyObjective): Promise<boolean>;
    updateCalendarEvent(entry: CalendarEvent): Promise<boolean>;
    updateCampaign(campaign: Campaign): Promise<void>;
    updateCampaignEnemy(id: string, enemy: CampaignEnemy): Promise<boolean>;
    updateCapturedEnemy(entry: CapturedEnemy): Promise<boolean>;
    updateCelestialBlessing(entry: CelestialBlessingEntry): Promise<boolean>;
    updateCharacter(id: CharacterId, char: Character): Promise<void>;
    updateCharacterAbility(id: CharacterAbilityId, ability: CharacterAbility): Promise<void>;
    updateCharacterAppearance(charId: CharacterId, appearance: CharacterAppearance): Promise<boolean>;
    updateCharacterConditions(charId: CharacterId, conditions: Array<CharacterCondition>): Promise<boolean>;
    updateCharacterCustomStat(id: bigint, value: string): Promise<void>;
    updateCharacterFeat(id: bigint, name: string, description: string): Promise<void>;
    updateCharacterInjury(id: string, injury: CharacterInjury): Promise<boolean>;
    updateCharacterLegacy(entry: CharacterLegacy): Promise<boolean>;
    updateCharacterMulticlass(charId: CharacterId, entries: Array<MulticlassEntry>): Promise<boolean>;
    updateCharacterPhysicalAttack(id: CharacterPhysicalAttackId, attack: CharacterPhysicalAttack): Promise<void>;
    updateCharacterPortrait(characterId: CharacterId, url: string): Promise<void>;
    updateCharacterRelationship(entry: CharacterRelationship): Promise<boolean>;
    updateCharacterSkill(id: bigint, skillName: string, proficient: boolean, expertise: boolean): Promise<void>;
    updateClass(id: ClassId, cls: CustomClass): Promise<void>;
    updateClearanceLevelEntry(entry: ClearanceLevelEntry): Promise<boolean>;
    updateCommendation(entry: Commendation): Promise<boolean>;
    updateConcentrationState(characterId: CharacterId, state: ConcentrationState): Promise<void>;
    updateContainmentBreachEntry(entry: ContainmentBreachEntry): Promise<boolean>;
    updateCorruptionLogEntry(entry: CorruptionLogEntry): Promise<boolean>;
    updateCourtMartialEntry(entry: CourtMartialEntry): Promise<boolean>;
    updateCurrencyState(characterId: CharacterId, state: CurrencyState): Promise<void>;
    updateCursedItemEntry(entry: CursedItemEntry): Promise<boolean>;
    updateCustomAbility(id: CustomAbilityId, ability: CustomAbility): Promise<void>;
    updateCustomFeat(id: bigint, name: string, description: string, prerequisites: string): Promise<void>;
    updateCustomItem(id: CustomItemId, item: CustomItem): Promise<void>;
    updateCustomPhysicalAttack(id: CustomPhysicalAttackId, attack: CustomPhysicalAttack): Promise<void>;
    updateCustomSkill(id: bigint, name: string, statBased: string, description: string): Promise<void>;
    updateCustomSpell(id: CustomSpellId, spell: CustomSpell): Promise<void>;
    updateCustomSpellSchool(id: CustomSpellSchoolId, school: CustomSpellSchool): Promise<void>;
    updateCustomStat(id: bigint, name: string, description: string, defaultValue: string): Promise<void>;
    updateDarkRitualEntry(entry: DarkRitualEntry): Promise<boolean>;
    updateDeathSaveState(characterId: CharacterId, state: DeathSaveState): Promise<void>;
    updateDefectionEntry(entry: DefectionEntry): Promise<boolean>;
    updateDemonClassEntry(entry: DemonClassEntry): Promise<boolean>;
    updateDeploymentNote(id: string, note: DeploymentMapNote): Promise<boolean>;
    updateDiplomacyEntry(id: string, entry: DiplomacyEntry): Promise<boolean>;
    updateDivineMandate(entry: DivineMandateEntry): Promise<boolean>;
    updateDreamVisionEntry(entry: DreamVisionEntry): Promise<boolean>;
    updateEncounterEntry(entry: EncounterEntry): Promise<void>;
    updateEnemyProfile(id: string, profile: EnemyProfile): Promise<boolean>;
    updateEquipmentSlots(characterId: CharacterId, slots: Array<EquipmentSlot>): Promise<void>;
    updateEspionageEntry(entry: EspionageEntry): Promise<boolean>;
    updateEthicsReviewEntry(entry: EthicsReviewEntry): Promise<boolean>;
    updateFaction(entry: Faction): Promise<boolean>;
    updateFallenSoldier(entry: FallenSoldierEntry): Promise<boolean>;
    updateGainLossEntry(id: string, entry: GainLossEntry): Promise<boolean>;
    updateHPState(characterId: CharacterId, state: HPState): Promise<void>;
    updateHolyRelic(entry: HolyRelicEntry): Promise<boolean>;
    updateHolyWarEntry(entry: HolyWarEntry): Promise<boolean>;
    updateInfernalDebtEntry(entry: InfernalDebtEntry): Promise<boolean>;
    updateInspirationState(characterId: CharacterId, state: InspirationState): Promise<void>;
    updateInterPresetWarEntry(entry: InterPresetWarEntry): Promise<boolean>;
    updateItem(id: InventoryItemId, item: InventoryItem): Promise<void>;
    updateLanguage(id: bigint, name: string): Promise<void>;
    updateLocation(loc: Location): Promise<void>;
    updateLocationDungeonRooms(locationId: string, rooms: Array<DungeonRoom>): Promise<boolean>;
    updateLoreEntry(entry: LoreEntry): Promise<void>;
    updateLostKnowledgeEntry(entry: LostKnowledgeEntry): Promise<boolean>;
    updateMIAEntry(entry: MIAEntry): Promise<boolean>;
    updateMythologicalFigure(entry: MythologicalFigure): Promise<boolean>;
    updateNPC(npc: NPC): Promise<void>;
    updatePactContractEntry(entry: PactContractEntry): Promise<boolean>;
    updatePartyInventoryItem(item: PartyInventoryItem): Promise<void>;
    updatePartyNote(note: PartyNote): Promise<void>;
    updatePersonalLootEntry(id: string, entry: PersonalLootEntry): Promise<boolean>;
    updatePortalEntry(entry: PortalEntry): Promise<boolean>;
    updatePrayerLogEntry(entry: PrayerLogEntry): Promise<boolean>;
    updatePrisonerExchange(id: string, entry: PrisonerExchangeEntry): Promise<boolean>;
    updateProphecyEntry(entry: ProphecyEntry): Promise<boolean>;
    updateProtocolLogEntry(entry: ProtocolLogEntry): Promise<boolean>;
    updatePsychEvalEntry(entry: PsychEvalEntry): Promise<boolean>;
    updateQuest(characterId: CharacterId, quest: Quest): Promise<void>;
    updateRace(id: RaceId, race: CustomRace): Promise<void>;
    updateRaceLinkedContent(raceId: RaceId, content: RaceLinkedContent): Promise<void>;
    updateRealmTerritoryEntry(entry: RealmTerritoryEntry): Promise<boolean>;
    updateReclassificationEntry(entry: ReclassificationEntry): Promise<boolean>;
    updateRestState(characterId: CharacterId, state: RestState): Promise<void>;
    updateRivalEntry(id: string, entry: RivalEntry): Promise<boolean>;
    updateSaveThrowState(characterId: CharacterId, state: SaveThrowState): Promise<void>;
    updateScpObjectEntry(entry: ScpObjectEntry): Promise<boolean>;
    updateSecretMissionLog(entry: SecretMissionLog): Promise<boolean>;
    updateSessionEntry(entry: SessionEntry): Promise<void>;
    updateSettings(newSettings: Settings): Promise<void>;
    updateSiegeEntry(entry: SiegeEntry): Promise<boolean>;
    updateSinCorruptionEntry(entry: SinCorruptionEntry): Promise<boolean>;
    updateSiteAssignmentEntry(entry: SiteAssignmentEntry): Promise<boolean>;
    updateSoldierBio(entry: SoldierBio): Promise<boolean>;
    updateSoulBountyEntry(entry: SoulBountyEntry): Promise<boolean>;
    updateSpell(id: SpellId, spell: Spell): Promise<void>;
    updateSpellSlots(characterId: CharacterId, slots: Array<SpellSlotState>): Promise<void>;
    updateSummoningLogEntry(entry: SummoningLogEntry): Promise<boolean>;
    updateThemeSettings(settings: ThemeSettings): Promise<boolean>;
    updateTimelineEvent(event: TimelineEvent): Promise<void>;
    updateTrainingCertification(entry: TrainingCertification): Promise<boolean>;
    updateTrait(id: TraitId, trait: Trait): Promise<void>;
    updateTrophyEntry(entry: TrophyEntry): Promise<boolean>;
    updateVeteranUnit(entry: VeteranUnit): Promise<boolean>;
    updateWarCrimeEntry(entry: WarCrimeEntry): Promise<boolean>;
    updateWeatherEntry(entry: WeatherEntry): Promise<boolean>;
    updateWhistleblowerEntry(entry: WhistleblowerEntry): Promise<boolean>;
    updateXpState(characterId: CharacterId, state: XpState): Promise<void>;
}

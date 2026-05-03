import type {
  Army,
  ArmyBranch,
  ArmyCommandStructure,
  ArmyInput,
  ArmyIntelligence,
  ArmyLogistics,
  ArmyMoraleData,
  ArmyNotes,
  ArmyRank,
} from "../../../types";

export function buildArmyInput(army: Army): ArmyInput {
  return {
    characterId: army.characterId,
    commandingCharacterId: army.commandingCharacterId,
    name: army.name,
    size: army.size,
    moraleRating: army.moraleRating,
    powerLevel: army.powerLevel,
    status: army.status,
    race: army.race,
    specialties: army.specialties,
    faction: army.faction,
    banner: army.banner,
    trainingLevel: army.trainingLevel,
    condition: army.condition,
    foundingDate: army.foundingDate,
    terrainNotes: army.terrainNotes,
    warChest: army.warChest,
    ranks: army.ranks,
    branches: army.branches,
    specOpsGroups: army.specOpsGroups,
    machinery: army.machinery,
    officers: army.officers,
    commanders: army.commanders,
    armyAbilities: army.armyAbilities,
    officerAbilities: army.officerAbilities,
    commanderAbilities: army.commanderAbilities,
    logistics: army.logistics,
    commandStructure: army.commandStructure,
    intelligence: army.intelligence,
    moraleData: army.moraleData,
    alliedArmies: army.alliedArmies,
    armyNotes: army.armyNotes,
  };
}

export const emptyLogistics = (): ArmyLogistics => ({
  food: 0n,
  ammunition: 0n,
  goldReserves: 0n,
  supplyLines: [],
  casualtiesLog: [],
  injuryNotes: "",
});

export const emptyCommandStructure = (): ArmyCommandStructure => ({
  chainOfCommand: [],
  ordersLog: [],
});

export const emptyIntelligence = (): ArmyIntelligence => ({
  enemyIntelLog: [],
  scoutReports: [],
});

export const emptyMoraleData = (): ArmyMoraleData => ({
  moraleEventsLog: [],
  loyaltyTracker: [],
});

export const emptyNotes = (): ArmyNotes => ({
  campaignLog: [],
  battlePlannerNotes: [],
  generalNotes: "",
});

export function newArmy(characterId: bigint): Army {
  return {
    id: "",
    characterId,
    owner: {} as Army["owner"],
    name: "New Army",
    size: 0n,
    moraleRating: 50n,
    powerLevel: 50n,
    status: "Active",
    race: "",
    specialties: [],
    faction: "",
    banner: "",
    trainingLevel: "Regular",
    condition: "Rested",
    foundingDate: "",
    terrainNotes: "",
    warChest: 0n,
    ranks: [],
    branches: [],
    specOpsGroups: [],
    machinery: [],
    officers: [],
    commanders: [],
    armyAbilities: [],
    officerAbilities: [],
    commanderAbilities: [],
    logistics: emptyLogistics(),
    commandStructure: emptyCommandStructure(),
    intelligence: emptyIntelligence(),
    moraleData: emptyMoraleData(),
    alliedArmies: [],
    armyNotes: emptyNotes(),
  };
}

export const RANK_PRESETS: Record<string, Omit<ArmyRank, "troopCount">[]> = {
  "US Army": [
    { id: "preset-usarmy-1", name: "Private", tier: 1n, description: "" },
    {
      id: "preset-usarmy-2",
      name: "Private First Class",
      tier: 2n,
      description: "",
    },
    { id: "preset-usarmy-3", name: "Corporal", tier: 3n, description: "" },
    { id: "preset-usarmy-4", name: "Sergeant", tier: 4n, description: "" },
    {
      id: "preset-usarmy-5",
      name: "Staff Sergeant",
      tier: 5n,
      description: "",
    },
    { id: "preset-usarmy-6", name: "Lieutenant", tier: 6n, description: "" },
    { id: "preset-usarmy-7", name: "Captain", tier: 7n, description: "" },
    { id: "preset-usarmy-8", name: "Major", tier: 8n, description: "" },
    {
      id: "preset-usarmy-9",
      name: "Lieutenant Colonel",
      tier: 9n,
      description: "",
    },
    { id: "preset-usarmy-10", name: "Colonel", tier: 10n, description: "" },
    {
      id: "preset-usarmy-11",
      name: "Brigadier General",
      tier: 11n,
      description: "",
    },
    {
      id: "preset-usarmy-12",
      name: "Major General",
      tier: 12n,
      description: "",
    },
    { id: "preset-usarmy-13", name: "General", tier: 13n, description: "" },
  ],
  "British Army": [
    { id: "preset-british-1", name: "Private", tier: 1n, description: "" },
    {
      id: "preset-british-2",
      name: "Lance Corporal",
      tier: 2n,
      description: "",
    },
    { id: "preset-british-3", name: "Corporal", tier: 3n, description: "" },
    { id: "preset-british-4", name: "Sergeant", tier: 4n, description: "" },
    {
      id: "preset-british-5",
      name: "Staff Sergeant",
      tier: 5n,
      description: "",
    },
    {
      id: "preset-british-6",
      name: "Warrant Officer",
      tier: 6n,
      description: "",
    },
    {
      id: "preset-british-7",
      name: "Second Lieutenant",
      tier: 7n,
      description: "",
    },
    { id: "preset-british-8", name: "Lieutenant", tier: 8n, description: "" },
    { id: "preset-british-9", name: "Captain", tier: 9n, description: "" },
    { id: "preset-british-10", name: "Major", tier: 10n, description: "" },
    {
      id: "preset-british-11",
      name: "Lieutenant Colonel",
      tier: 11n,
      description: "",
    },
    { id: "preset-british-12", name: "Colonel", tier: 12n, description: "" },
    { id: "preset-british-13", name: "Brigadier", tier: 13n, description: "" },
    {
      id: "preset-british-14",
      name: "Major General",
      tier: 14n,
      description: "",
    },
    { id: "preset-british-15", name: "General", tier: 15n, description: "" },
  ],
  "Roman Legion": [
    {
      id: "preset-roman-1",
      name: "Miles",
      tier: 1n,
      description: "Basic legionary",
    },
    {
      id: "preset-roman-2",
      name: "Discens",
      tier: 2n,
      description: "Trainee specialist",
    },
    {
      id: "preset-roman-3",
      name: "Immunes",
      tier: 3n,
      description: "Specialist soldier",
    },
    {
      id: "preset-roman-4",
      name: "Tesserarius",
      tier: 4n,
      description: "Watch officer",
    },
    {
      id: "preset-roman-5",
      name: "Decanus",
      tier: 5n,
      description: "Squad leader",
    },
    {
      id: "preset-roman-6",
      name: "Optio",
      tier: 6n,
      description: "Second-in-command",
    },
    {
      id: "preset-roman-7",
      name: "Centurion",
      tier: 7n,
      description: "Century commander",
    },
    {
      id: "preset-roman-8",
      name: "Primus Pilus",
      tier: 8n,
      description: "Senior centurion",
    },
    {
      id: "preset-roman-9",
      name: "Legate",
      tier: 9n,
      description: "Legion commander",
    },
  ],
  Medieval: [
    {
      id: "preset-medieval-1",
      name: "Peasant Levy",
      tier: 1n,
      description: "",
    },
    { id: "preset-medieval-2", name: "Man-at-Arms", tier: 2n, description: "" },
    { id: "preset-medieval-3", name: "Sergeant", tier: 3n, description: "" },
    { id: "preset-medieval-4", name: "Knight", tier: 4n, description: "" },
    { id: "preset-medieval-5", name: "Baron", tier: 5n, description: "" },
    { id: "preset-medieval-6", name: "Lord", tier: 6n, description: "" },
    { id: "preset-medieval-7", name: "Duke", tier: 7n, description: "" },
    { id: "preset-medieval-8", name: "King", tier: 8n, description: "" },
  ],
  "H.M.C. Military": [
    // ── Enlisted Class ──────────────────────────────────────────────────────
    {
      id: "preset-hmc-e1",
      name: "E-1 H.M.C Recruit",
      tier: 1n,
      description:
        "Limited rank - 1 person only. Newly inducted member not yet through basic training.",
    },
    {
      id: "preset-hmc-e2",
      name: "E-2 Private",
      tier: 2n,
      description: "PVT — Entry-level soldier, completed basic orientation.",
    },
    {
      id: "preset-hmc-e3",
      name: "E-3 Private Third Class",
      tier: 3n,
      description: "PV3 — Consistent performer developing core competencies.",
    },
    {
      id: "preset-hmc-e4",
      name: "E-4 Private Second Class",
      tier: 4n,
      description: "PV2 — Reliable soldier with notable service time.",
    },
    {
      id: "preset-hmc-e5",
      name: "E-5 Private First Class",
      tier: 5n,
      description:
        "PV1 — Experienced frontline soldier trusted with greater responsibilities.",
    },
    {
      id: "preset-hmc-e6",
      name: "E-6 Lance Corporal",
      tier: 6n,
      description: "LCpl — First step toward leadership; assists team leaders.",
    },
    {
      id: "preset-hmc-e7",
      name: "E-7 Corporal",
      tier: 7n,
      description:
        "CPL — Junior NCO responsible for direct leadership of a fireteam.",
    },
    {
      id: "preset-hmc-e8",
      name: "E-8 Sergeant",
      tier: 8n,
      description:
        "SGT — NCO serving as primary leadership layer between command and common soldier.",
    },
    {
      id: "preset-hmc-e9",
      name: "E-9 Staff Sergeant",
      tier: 9n,
      description: "SSG — Senior squad leader overseeing multiple fireteams.",
    },
    {
      id: "preset-hmc-e10",
      name: "E-10 Gunnery Sergeant",
      tier: 10n,
      description:
        "GySgt — Specialist in weapons, tactics, and unit readiness.",
    },
    {
      id: "preset-hmc-e11",
      name: "E-11 Sergeant Second Class",
      tier: 11n,
      description:
        "SSC — Senior NCO managing operations across multiple squads.",
    },
    {
      id: "preset-hmc-e12",
      name: "E-12 Sergeant First Class",
      tier: 12n,
      description:
        "SFC — Highly experienced NCO, primary advisor to platoon-level officers.",
    },
    {
      id: "preset-hmc-e13",
      name: "E-13 Master Sergeant",
      tier: 13n,
      description:
        "MSG — Among the most senior NCOs; oversees long-term training programs.",
    },
    {
      id: "preset-hmc-e14",
      name: "E-14 Second Sergeant",
      tier: 14n,
      description:
        "2SG — Senior advisory NCO specialising in inter-unit coordination.",
    },
    {
      id: "preset-hmc-e15",
      name: "E-15 First Sergeant",
      tier: 15n,
      description: "1SG — Top enlisted advisor to a company-level unit.",
    },
    {
      id: "preset-hmc-e16",
      name: "E-16 Master Gunnery Sergeant",
      tier: 16n,
      description:
        "MGySg — Elite technical specialist combining Master Sergeant authority with advanced weapons expertise.",
    },
    {
      id: "preset-hmc-e17",
      name: "E-17 Sergeant Major",
      tier: 17n,
      description:
        "SGM — Senior enlisted leader operating at battalion level or above.",
    },
    {
      id: "preset-hmc-e18",
      name: "E-18 Sergeant Major Of The HMC",
      tier: 18n,
      description:
        "SGTMotHMC — Most distinguished Sergeant Major rank in the H.M.C. Military.",
    },
    {
      id: "preset-hmc-e19",
      name: "E-19 High Sergeant",
      tier: 19n,
      description:
        "HSG — Prestige rank for Sergeant Majors with exceptional long-term leadership.",
    },
    {
      id: "preset-hmc-e20",
      name: "E-20 High Sergeant Of The HMC",
      tier: 20n,
      description:
        "HSGoHMC — One of the highest enlisted ranks; advises the highest levels of military command.",
    },
    {
      id: "preset-hmc-e21",
      name: "E-21 High Commanding Sergeant Of The HMC",
      tier: 21n,
      description:
        "HCSGoHMC — Supreme NCO rank in the Enlisted Class; sets standards across the entire enlisted corps.",
    },
    {
      id: "preset-hmc-e5-1",
      name: "E5-1 Head of Enlisted Class",
      tier: 22n,
      description:
        "HoEC — Limited rank, 1 person only. Commands the entire Enlisted Class and represents all enlisted soldiers in the highest councils of HMC command.",
    },
    // ── Officer Class ────────────────────────────────────────────────────────
    {
      id: "preset-hmc-o1",
      name: "O-1 Junior Lieutenant",
      tier: 23n,
      description:
        "JLT — Entry rank for Officer Class; commands small units under supervision.",
    },
    {
      id: "preset-hmc-o2",
      name: "O-2 Third Lieutenant",
      tier: 24n,
      description:
        "3LT — Officer developing core command competencies in support or staff roles.",
    },
    {
      id: "preset-hmc-o3",
      name: "O-3 Second Lieutenant",
      tier: 25n,
      description: "2LT — Officer ready for independent platoon command.",
    },
    {
      id: "preset-hmc-o4",
      name: "O-4 First Lieutenant",
      tier: 26n,
      description:
        "1LT — Experienced platoon commander; second-in-command at company level.",
    },
    {
      id: "preset-hmc-o5",
      name: "O-5 Commanding Lieutenant",
      tier: 27n,
      description:
        "CMDLT — Senior lieutenant with independent command authority.",
    },
    {
      id: "preset-hmc-o6",
      name: "O-6 Commander",
      tier: 28n,
      description: "CDR — Full authority over a company-level element.",
    },
    {
      id: "preset-hmc-o7",
      name: "O-7 Commanding Captain",
      tier: 29n,
      description: "CDCPT — Senior captain directing multi-company operations.",
    },
    {
      id: "preset-hmc-o8",
      name: "O-8 Captain",
      tier: 30n,
      description:
        "CAPT — Versatile company-grade officer; cornerstone of the HMC officer corps.",
    },
    {
      id: "preset-hmc-o9",
      name: "O-9 Lieutenant Major",
      tier: 31n,
      description:
        "LTMAJ — Bridges company-grade and field-grade command; executive officer at battalion level.",
    },
    {
      id: "preset-hmc-o10",
      name: "O-10 Major",
      tier: 32n,
      description: "MAJ — Field-grade officer commanding at battalion level.",
    },
    {
      id: "preset-hmc-o11",
      name: "O-11 Lieutenant Colonel",
      tier: 33n,
      description:
        "LTC — Senior field-grade officer commanding brigade elements.",
    },
    {
      id: "preset-hmc-o12",
      name: "O-12 Colonel",
      tier: 34n,
      description:
        "COL — Senior officer commanding brigade or regimental-level forces.",
    },
    {
      id: "preset-hmc-o13",
      name: "O-13 Brigadier General",
      tier: 35n,
      description:
        "BG — First general officer rank; commands at brigade level.",
    },
    {
      id: "preset-hmc-o14",
      name: "O-14 Major General",
      tier: 36n,
      description:
        "MG — Two-star general commanding divisions or equivalent large formations.",
    },
    {
      id: "preset-hmc-o15",
      name: "O-15 Lieutenant General",
      tier: 37n,
      description:
        "LTG — Three-star general commanding corps or multi-division formations.",
    },
    {
      id: "preset-hmc-o16",
      name: "O-16 General",
      tier: 38n,
      description:
        "GEN — Four-star general commanding entire field army. Personnel at this rank are cleared for aerial operations.",
    },
    {
      id: "preset-hmc-o17",
      name: "O-17 Coming Soon",
      tier: 39n,
      description:
        "CS — Reserved for future expansion of the Officer Class structure.",
    },
    {
      id: "preset-hmc-o18",
      name: "O-18 Coming Soon",
      tier: 40n,
      description:
        "CS — Reserved for future expansion of the Officer Class structure.",
    },
    {
      id: "preset-hmc-o9-1",
      name: "O9-1 Head of Officer Class",
      tier: 41n,
      description:
        "HoOC — Limited rank, 1 person only. Commands every officer in the H.M.C. Military; awarded only to a General with an extraordinary record of service.",
    },
    // ── Guard Class ──────────────────────────────────────────────────────────
    {
      id: "preset-hmc-gc1",
      name: "GC-1 Enlisted Guard",
      tier: 42n,
      description:
        "EG — Entry rank; assigned to fixed posts, perimeter patrol, and access control.",
    },
    {
      id: "preset-hmc-gc2",
      name: "GC-2 Basic Guard",
      tier: 43n,
      description:
        "BG — Completed initial security training; assigned to standard protection details.",
    },
    {
      id: "preset-hmc-gc3",
      name: "GC-3 1st Generation Guard",
      tier: 44n,
      description:
        "1GG — Completed first full tour; assigned to more demanding inner-perimeter duties.",
    },
    {
      id: "preset-hmc-gc4",
      name: "GC-4 2nd Generation Guard",
      tier: 45n,
      description:
        "2GG — Experienced guard with multiple tours; supervises junior guards.",
    },
    {
      id: "preset-hmc-gc5",
      name: "GC-5 3rd Generation Guard",
      tier: 46n,
      description:
        "3GG — Mid-tier guard with expertise in close-protection and facility security.",
    },
    {
      id: "preset-hmc-gc6",
      name: "GC-6 4th Generation Guard",
      tier: 47n,
      description:
        "4GG — Senior guard; mentors lower-ranked members and may lead small security details.",
    },
    {
      id: "preset-hmc-gc7",
      name: "GC-7 5th Generation Guard",
      tier: 48n,
      description:
        "5GG — Elite guard completing five full tours; assigned to high-value protection roles.",
    },
    {
      id: "preset-hmc-gc8",
      name: "GC-8 Advanced Guard",
      tier: 49n,
      description:
        "ADG — Completed advanced security training; operates in dynamic, high-risk environments.",
    },
    {
      id: "preset-hmc-gc9",
      name: "GC-9 Advanced High Guard",
      tier: 50n,
      description:
        "ADHG — Highly trained protection specialist assigned to senior officers and critical command infrastructure.",
    },
    {
      id: "preset-hmc-gc10",
      name: "GC-10 Officer Guard",
      tier: 51n,
      description:
        "OG — Guard Class officer combining combat leadership with specialised security expertise.",
    },
    {
      id: "preset-hmc-gc11",
      name: "GC-11 Advanced Officer Guard",
      tier: 52n,
      description:
        "ADOG — Senior Guard Class officer with command authority over multiple guard units.",
    },
    {
      id: "preset-hmc-gc12",
      name: "GC-12 Basic Security Unit Guard",
      tier: 53n,
      description:
        "BSUG — Qualified for dedicated Security Units; provides layered protection for key installations.",
    },
    {
      id: "preset-hmc-gc13",
      name: "GC-13 High Security Unit Guard",
      tier: 54n,
      description:
        "HSUG — Experienced Security Unit Guard protecting the most critical HMC assets.",
    },
    {
      id: "preset-hmc-gc14",
      name: "GC-14 Advanced Security Unit Guard",
      tier: 55n,
      description:
        "ASUG — Senior guard within standard Security Units; leads teams during highest-threat situations.",
    },
    {
      id: "preset-hmc-gc15",
      name: "GC-15 Basic Command Unit Guard",
      tier: 56n,
      description:
        "BCUG — Assigned to protection of command-level personnel and headquarters.",
    },
    {
      id: "preset-hmc-gc16",
      name: "GC-16 High Command Unit Guard",
      tier: 57n,
      description:
        "HCUG — Primary protective detail for senior command personnel.",
    },
    {
      id: "preset-hmc-gc17",
      name: "GC-17 Advanced Command Unit Guard",
      tier: 58n,
      description:
        "ACUG — Elite guard leading protection details for the most senior command officers.",
    },
    {
      id: "preset-hmc-gc18",
      name: "GC-18 Overseeing Guard",
      tier: 59n,
      description:
        "OVG — Oversees operations of multiple guard units across an installation or region.",
    },
    {
      id: "preset-hmc-gc19",
      name: "GC-19 Advanced Overseeing Guard",
      tier: 60n,
      description:
        "AOVG — Elite oversight guard with authority over the entire guard contingent at a major installation.",
    },
    {
      id: "preset-hmc-gc20",
      name: "GC-20 High Command Guard",
      tier: 61n,
      description:
        "HCG — Most senior non-leadership rank in the Guard Class; personal security chief for the highest-ranking HMC officers.",
    },
    {
      id: "preset-hmc-gc7-1",
      name: "GC7-1 Head of Guard Class",
      tier: 62n,
      description:
        "HoGC — Limited rank, 1 person only. Supreme command over all Guard Class soldiers and security operations within the H.M.C. Military.",
    },
    // ── Leading Class ────────────────────────────────────────────────────────
    {
      id: "preset-hmc-g1",
      name: "G-1 General Of The HMC",
      tier: 63n,
      description:
        "GotHMC — Entry rank of the Leading Class; supreme operational authority over large formations.",
    },
    {
      id: "preset-hmc-g2",
      name: "G-2 Private General Of The HMC",
      tier: 64n,
      description:
        "PGotHMC — General newly elevated to the Leading Class; orienting to elevated responsibilities.",
    },
    {
      id: "preset-hmc-g3",
      name: "G-3 Chief General Of The HMC",
      tier: 65n,
      description:
        "CGotHMC — Senior officer overseeing specific branches or departments within the HMC.",
    },
    {
      id: "preset-hmc-g4",
      name: "G-4 Low General Of The HMC",
      tier: 66n,
      description:
        "LGotHMC — Holds authority over a major operational region or strategic asset group.",
    },
    {
      id: "preset-hmc-g5",
      name: "G-5 High General Of The HMC",
      tier: 67n,
      description:
        "HGotHMC — Senior strategic leader directing theater-level or multi-domain operations.",
    },
    {
      id: "preset-hmc-g6",
      name: "G-6 Sergeant General Of The HMC",
      tier: 68n,
      description:
        "SGGotHMC — Unique hybrid rank bridging the enlisted corps and highest command echelons.",
    },
    {
      id: "preset-hmc-g7",
      name: "G-7 Head General Of The NMC",
      tier: 69n,
      description:
        "HGNotHMC — Authority extending across allied forces and joint commands; coordinates inter-organizational operations.",
    },
    {
      id: "preset-hmc-g8",
      name: "G-8 Lead General Of The HMC",
      tier: 70n,
      description:
        "LGotHMC — One of the most senior generals; directs the strategic posture of the entire organisation.",
    },
    {
      id: "preset-hmc-g9",
      name: "G-9 Commanding General Of The HMC",
      tier: 71n,
      description:
        "CMDGotHMC — Supreme active command authority of the H.M.C. Military. Only the Head of Leading Class ranks above this position.",
    },
    {
      id: "preset-hmc-g2-1",
      name: "G2-1 Head of Leading Class",
      tier: 72n,
      description:
        "HoLC — Limited rank, 1 person only. Absolute supreme authority of the entire H.M.C. Military. All military decisions and strategic directions ultimately rest with this individual.",
    },
  ],
  Naval: [
    { id: "preset-naval-1", name: "Seaman", tier: 1n, description: "" },
    { id: "preset-naval-2", name: "Petty Officer", tier: 2n, description: "" },
    { id: "preset-naval-3", name: "Ensign", tier: 3n, description: "" },
    { id: "preset-naval-4", name: "Lieutenant", tier: 4n, description: "" },
    {
      id: "preset-naval-5",
      name: "Lieutenant Commander",
      tier: 5n,
      description: "",
    },
    { id: "preset-naval-6", name: "Commander", tier: 6n, description: "" },
    { id: "preset-naval-7", name: "Captain", tier: 7n, description: "" },
    { id: "preset-naval-8", name: "Commodore", tier: 8n, description: "" },
    { id: "preset-naval-9", name: "Rear Admiral", tier: 9n, description: "" },
    { id: "preset-naval-10", name: "Vice Admiral", tier: 10n, description: "" },
    { id: "preset-naval-11", name: "Admiral", tier: 11n, description: "" },
  ],
};

export const uid = () =>
  Date.now().toString() + Math.random().toString(36).slice(2, 7);

// ─── Branch Special Ranks (H.M.C. Military) ───────────────────────────────────

export type BranchRankEntry = {
  code: string;
  name: string;
  abbr: string;
  purpose: string;
};

export const HMC_BRANCH_SPECIAL_RANKS: Record<string, BranchRankEntry[]> = {
  "Standard Infantry": [
    {
      code: "SI-1",
      name: "Infantry Initiate",
      abbr: "INFINI",
      purpose:
        "Newly assigned infantry soldier still undergoing field integration. Follows orders without question and learns from senior soldiers.",
    },
    {
      code: "SI-2",
      name: "Line Soldier",
      abbr: "LNSLD",
      purpose:
        "The standard fighting soldier of the Standard Infantry. Trained in formation combat and standard H.M.C. doctrine.",
    },
    {
      code: "SI-3",
      name: "Combat Specialist",
      abbr: "CMBSPC",
      purpose:
        "A soldier who has demonstrated advanced proficiency in a specific combat skill, such as heavy weapons, fortification breach, or close-quarters fighting.",
    },
    {
      code: "SI-4",
      name: "Infantry Lance Corporal",
      abbr: "INFLCPL",
      purpose:
        "A junior non-commissioned leader. Leads a fireteam of 3-4 soldiers and coordinates small-unit tactics.",
    },
    {
      code: "SI-5",
      name: "Infantry Sergeant",
      abbr: "INFSGT",
      purpose:
        "Commands a squad. Responsible for the welfare, discipline, and combat effectiveness of 8-12 soldiers under their charge.",
    },
    {
      code: "SI-6",
      name: "Infantry Staff Sergeant",
      abbr: "INFSSG",
      purpose:
        "Leads a platoon section. Manages multiple squads and coordinates their combined combat actions.",
    },
    {
      code: "SI-7",
      name: "Infantry Gunnery Sergeant",
      abbr: "INFGySgt",
      purpose:
        "The senior combat NCO of a company-sized infantry unit. Expert in coordinated fire, suppression tactics, and combined arms maneuver.",
    },
    {
      code: "SI-8",
      name: "Infantry First Sergeant",
      abbr: "INF1SG",
      purpose:
        "Company senior sergeant. Acts as the primary advisor to the Infantry Captain and maintains unit readiness and morale.",
    },
    {
      code: "SI-9",
      name: "Infantry Sergeant Major",
      abbr: "INFSGM",
      purpose:
        "The senior enlisted leader of an entire infantry battalion. Sets standards, enforces doctrine, and ensures all Infantry NCOs are performing at peak effectiveness.",
    },
    {
      code: "SI-O1",
      name: "Infantry Lieutenant",
      abbr: "INFLT",
      purpose:
        "The primary commissioned officer leading an infantry platoon. Bridges enlisted soldiers and higher command.",
    },
    {
      code: "SI-O2",
      name: "Infantry Captain",
      abbr: "INFCPT",
      purpose:
        "Commands an infantry company of 100-200 soldiers. Responsible for the tactical employment of their full company in the field.",
    },
    {
      code: "SI-O3",
      name: "Infantry Commander",
      abbr: "INFCDR",
      purpose:
        "Commands an infantry battalion. Coordinates multiple companies across an operational front and plans large-scale infantry engagements.",
    },
  ],
  "Officer Corps": [
    {
      code: "OC-1",
      name: "Corps Candidate",
      abbr: "CRPCND",
      purpose:
        "An individual being evaluated for full officer status. Undergoes intensive leadership assessment and command doctrine training.",
    },
    {
      code: "OC-2",
      name: "Junior Corps Officer",
      abbr: "JRCO",
      purpose:
        "A newly commissioned officer of the Officer Corps. Assigned to a training or administrative role while building command experience.",
    },
    {
      code: "OC-3",
      name: "Corps Officer",
      abbr: "CO",
      purpose:
        "A full officer with demonstrated competence in leading soldiers and executing assigned missions under limited supervision.",
    },
    {
      code: "OC-4",
      name: "Senior Corps Officer",
      abbr: "SRCO",
      purpose:
        "A seasoned officer trusted with independent command of a unit or specialized function within a larger formation.",
    },
    {
      code: "OC-5",
      name: "Corps Staff Officer",
      abbr: "CRSTFO",
      purpose:
        "An officer serving on a command staff. Manages planning, intelligence, or logistics functions in support of senior commanders.",
    },
    {
      code: "OC-6",
      name: "Corps Executive Officer",
      abbr: "CREXO",
      purpose:
        "Second-in-command of an Officer Corps division. Manages daily operations and serves as acting commander in the division commander's absence.",
    },
    {
      code: "OC-7",
      name: "Corps Division Commander",
      abbr: "CRDIVCDR",
      purpose:
        "Commands a full division of the Officer Corps. Responsible for the readiness, training, and performance of all officers assigned under them.",
    },
    {
      code: "OC-8",
      name: "Corps Senior Commander",
      abbr: "CRSRCDR",
      purpose:
        "A senior commander overseeing multiple Officer Corps divisions. Advises the High Command on officer strength, promotions, and command doctrine.",
    },
    {
      code: "OC-9",
      name: "Corps Director",
      abbr: "CRDIR",
      purpose:
        "The highest permanent Officer Corps rank below the Head of Officer Class. Oversees all Officer Corps operations, evaluations, and inter-branch officer assignments.",
    },
  ],
  "H.M.C. Guard Division": [
    {
      code: "GD-1",
      name: "Division Guard Initiate",
      abbr: "DGINI",
      purpose:
        "Entry-level Guard Division member. Completes mandatory close-protection and security protocols before being assigned to active duty.",
    },
    {
      code: "GD-2",
      name: "Division Guard",
      abbr: "DG",
      purpose:
        "A fully qualified protective guard deployed to active duty. Assigned to fixed posts or rotating details protecting H.M.C. assets.",
    },
    {
      code: "GD-3",
      name: "Division Patrol Guard",
      abbr: "DPG",
      purpose:
        "Performs active patrol duties around secured installations. Responsible for detecting and reporting threats before they reach protected personnel.",
    },
    {
      code: "GD-4",
      name: "Division Security Specialist",
      abbr: "DVSECSP",
      purpose:
        "Trained in advanced threat assessment and counter-intrusion techniques. Assigned to high-risk installations or critical infrastructure.",
    },
    {
      code: "GD-5",
      name: "Division Close-Protection Guard",
      abbr: "DCPG",
      purpose:
        "Directly assigned to the personal protection of a Leading Class officer. Shadows the assigned officer at all times when on base or in the field.",
    },
    {
      code: "GD-6",
      name: "Division Security Sergeant",
      abbr: "DVSECSG",
      purpose:
        "Supervises a security team of 4-6 guards. Coordinates post assignments, patrol schedules, and response protocols.",
    },
    {
      code: "GD-7",
      name: "Division Security Staff Sergeant",
      abbr: "DVSECSSG",
      purpose:
        "Senior NCO of a guard section. Manages multiple security teams and evaluates team-level security performance.",
    },
    {
      code: "GD-8",
      name: "Division Security Gunnery Sergeant",
      abbr: "DVSECGySgt",
      purpose:
        "Specialist in high-threat security environments. Trains division guards in advanced close-quarters response and protective formations.",
    },
    {
      code: "GD-9",
      name: "Division Security First Sergeant",
      abbr: "DVSEC1SG",
      purpose:
        "Company-level senior guard NCO. Ensures all Division Guard Company soldiers are properly trained, equipped, and mission-ready.",
    },
    {
      code: "GD-O1",
      name: "Guard Division Lieutenant",
      abbr: "GDLT",
      purpose:
        "Junior officer commanding a platoon-sized guard element. Oversees daily security operations and briefings.",
    },
    {
      code: "GD-O2",
      name: "Guard Division Captain",
      abbr: "GDCPT",
      purpose:
        "Commands a Guard Division company. Responsible for the security posture of an entire installation or VIP protective detail.",
    },
    {
      code: "GD-O3",
      name: "Guard Division Commander",
      abbr: "GDCDR",
      purpose:
        "Commands the full H.M.C. Guard Division. Reports directly to the Head of Guard Class and coordinates all division-wide security operations.",
    },
  ],
  "High Command": [
    {
      code: "HC-1",
      name: "Command Advisor",
      abbr: "CMDADV",
      purpose:
        "A senior officer elevated to High Command staff as an advisor. Provides specialized expertise on military, logistical, or intelligence matters to High Command principals.",
    },
    {
      code: "HC-2",
      name: "Command Director",
      abbr: "CMDDIR",
      purpose:
        "Oversees a specific strategic function within High Command — such as operations, planning, or inter-branch coordination — and reports directly to the High Command Council.",
    },
    {
      code: "HC-3",
      name: "High Command Council Member",
      abbr: "HCCM",
      purpose:
        "A full member of the H.M.C. High Command Council. Participates in all major strategic decisions and votes on theater-level military doctrine.",
    },
    {
      code: "HC-4",
      name: "High Command Senior Council Member",
      abbr: "HCSCM",
      purpose:
        "A senior and highly experienced council member with elevated voting authority. Acts as a primary voice in all major policy and operational decisions.",
    },
    {
      code: "HC-5",
      name: "High Command Executive",
      abbr: "HCEXEC",
      purpose:
        "The chief executive officer of High Command's day-to-day operations. Ensures all strategic directives are translated into actionable orders for branch commanders.",
    },
    {
      code: "HC-6",
      name: "Supreme High Commander",
      abbr: "SUPRMHC",
      purpose:
        "The most senior High Command officer below the Head of Leading Class. Commands all H.M.C. Military operations at the theater level and speaks with near-absolute authority on all matters of war and strategy.",
    },
  ],
  "Spec Ops / Special Operations": [
    {
      code: "SO-1",
      name: "Spec Ops Candidate",
      abbr: "SOCND",
      purpose:
        "An applicant who has passed initial selection and is undergoing the grueling H.M.C. Spec Ops qualification pipeline. Not yet a full operator.",
    },
    {
      code: "SO-2",
      name: "Spec Ops Operator",
      abbr: "SOOP",
      purpose:
        "A fully qualified special operations soldier. Has completed all selection phases and is deployed on active covert operations.",
    },
    {
      code: "SO-3",
      name: "Spec Ops Senior Operator",
      abbr: "SOSROP",
      purpose:
        "An experienced operator with multiple successful missions. Trusted with more complex assignments and mentors junior operators.",
    },
    {
      code: "SO-4",
      name: "Spec Ops Specialist",
      abbr: "SOSP",
      purpose:
        "An operator with a specific advanced skill — demolitions, signals intelligence, combat diving, etc. — that makes them invaluable on specialized missions.",
    },
    {
      code: "SO-5",
      name: "Spec Ops Team Leader",
      abbr: "SOTL",
      purpose:
        "Commands a 4-6 person Spec Ops team. Responsible for mission planning, team safety, and tactical execution in the field.",
    },
    {
      code: "SO-6",
      name: "Spec Ops Senior Team Leader",
      abbr: "SOSTL",
      purpose:
        "A veteran team leader with an established track record. May oversee multiple simultaneous Spec Ops teams during large operations.",
    },
    {
      code: "SO-7",
      name: "Spec Ops Warrant Officer",
      abbr: "SOWO",
      purpose:
        "A highly specialized technical expert within Spec Ops who serves in an advisory and technical-lead capacity rather than a command role. Supports mission planning with deep subject-matter expertise.",
    },
    {
      code: "SO-8",
      name: "Spec Ops Captain",
      abbr: "SOCPT",
      purpose:
        "Commands a Spec Ops company-equivalent grouping of teams. Coordinates mission packages across multiple teams and liaises with conventional branch commanders.",
    },
    {
      code: "SO-9",
      name: "Spec Ops Commander",
      abbr: "SOCDR",
      purpose:
        "Commands the entire Spec Ops branch. Maintains direct access to High Command and briefs the Supreme High Commander on all covert operations.",
    },
  ],
  "Logistics & Supply": [
    {
      code: "LS-1",
      name: "Supply Initiate",
      abbr: "SUPINI",
      purpose:
        "Entry-level logistics soldier assigned to basic supply handling — inventory counts, loading, unloading, and basic equipment maintenance.",
    },
    {
      code: "LS-2",
      name: "Supply Specialist",
      abbr: "SUPSP",
      purpose:
        "Trained in specialized supply handling — ammunition safety, ration distribution, or equipment cataloguing — and manages a specific supply function.",
    },
    {
      code: "LS-3",
      name: "Supply Corporal",
      abbr: "SUPCPL",
      purpose:
        "Supervises a small logistics team. Responsible for daily supply distribution and maintaining accurate records of branch inventories.",
    },
    {
      code: "LS-4",
      name: "Supply Sergeant",
      abbr: "SUPSG",
      purpose:
        "Manages a supply platoon. Coordinates resupply operations between the rear depot and forward-deployed units.",
    },
    {
      code: "LS-5",
      name: "Field Logistics Sergeant",
      abbr: "FLDSGT",
      purpose:
        "Deployed alongside fighting branches. Ensures continuous supply delivery under field conditions, including under fire.",
    },
    {
      code: "LS-6",
      name: "Senior Logistics Sergeant",
      abbr: "SLGSGT",
      purpose:
        "Senior NCO of a logistics company. Oversees all logistics operations within an assigned operational zone.",
    },
    {
      code: "LS-7",
      name: "Logistics Staff Sergeant",
      abbr: "LGSSSG",
      purpose:
        "Coordinates logistics planning at the battalion level. Manages supply schedules, identifies shortfalls, and ensures on-time delivery across all assigned units.",
    },
    {
      code: "LS-8",
      name: "Logistics Gunnery Sergeant",
      abbr: "LGSGySgt",
      purpose:
        "Expert logistics NCO responsible for training all supply soldiers and developing logistics doctrine for the branch.",
    },
    {
      code: "LS-9",
      name: "Logistics First Sergeant",
      abbr: "LGS1SG",
      purpose:
        "Senior enlisted logistics leader. Acts as primary advisor to the Logistics Captain and ensures the branch meets all operational supply obligations.",
    },
    {
      code: "LS-O1",
      name: "Logistics Lieutenant",
      abbr: "LGSLT",
      purpose:
        "Junior logistics officer. Commands a supply platoon and liaises with field units to forecast and fulfill their supply needs.",
    },
    {
      code: "LS-O2",
      name: "Logistics Captain",
      abbr: "LGSCPT",
      purpose:
        "Commands a logistics company. Oversees supply distribution across a full operational sector and ensures zero-deficiency resupply to front-line branches.",
    },
    {
      code: "LS-O3",
      name: "Chief Logistics Commander",
      abbr: "CLGSCDR",
      purpose:
        "Commander of the entire Logistics & Supply branch. Advises High Command on resource status, supply chain vulnerabilities, and logistical feasibility of planned operations.",
    },
  ],
  "Intelligence Division": [
    {
      code: "ID-1",
      name: "Intelligence Recruit",
      abbr: "INTREC",
      purpose:
        "A new member of the Intelligence Division undergoing basic tradecraft training — surveillance, coding, report writing, and counter-detection.",
    },
    {
      code: "ID-2",
      name: "Intelligence Analyst",
      abbr: "INTANL",
      purpose:
        "Processes and interprets raw intelligence data. Identifies patterns, enemy movements, and emerging threats from field reports.",
    },
    {
      code: "ID-3",
      name: "Intelligence Specialist",
      abbr: "INTSP",
      purpose:
        "Skilled in a specific intelligence discipline — signals, human intelligence, or imagery analysis — and assigned to specialized collection tasks.",
    },
    {
      code: "ID-4",
      name: "Intelligence Corporal",
      abbr: "INTCPL",
      purpose:
        "Leads a small analytical team. Synthesizes inputs from multiple intelligence streams and produces consolidated threat assessments.",
    },
    {
      code: "ID-5",
      name: "Field Intelligence Agent",
      abbr: "FINTAG",
      purpose:
        "Deployed directly into the field to gather intelligence through observation, source handling, or technical means. Operates with minimal direct support.",
    },
    {
      code: "ID-6",
      name: "Senior Field Agent",
      abbr: "SFINTAG",
      purpose:
        "An experienced field agent with multiple successful intelligence operations. Manages their own source network and mentors junior agents.",
    },
    {
      code: "ID-7",
      name: "Intelligence Sergeant",
      abbr: "INTSG",
      purpose:
        "Supervises a field intelligence team. Responsible for mission planning, agent safety, and timely delivery of intelligence product to branch commanders.",
    },
    {
      code: "ID-8",
      name: "Intelligence Staff Sergeant",
      abbr: "INTSSG",
      purpose:
        "Senior intelligence NCO. Manages multiple intelligence teams and coordinates cross-team intelligence gathering across an operational area.",
    },
    {
      code: "ID-9",
      name: "Intelligence Gunnery Sergeant",
      abbr: "INTGySgt",
      purpose:
        "Master intelligence operator. Trains all division personnel in advanced tradecraft and ensures intelligence collection standards are upheld across the division.",
    },
    {
      code: "ID-O1",
      name: "Intelligence Lieutenant",
      abbr: "INTLT",
      purpose:
        "Junior intelligence officer. Commands a field intelligence team and serves as the primary intelligence liaison to a branch commander.",
    },
    {
      code: "ID-O2",
      name: "Intelligence Captain",
      abbr: "INTCPT",
      purpose:
        "Commands an intelligence company. Manages all intelligence operations across an assigned sector and briefs senior commanders.",
    },
    {
      code: "ID-O3",
      name: "Chief Intelligence Commander",
      abbr: "CINTCDR",
      purpose:
        "Commander of the entire Intelligence Division. Has direct access to High Command and is responsible for the strategic intelligence picture of all known threats to the H.M.C. Military.",
    },
  ],
  "Naval Branch": [
    {
      code: "NB-1",
      name: "Naval Recruit",
      abbr: "NVREC",
      purpose:
        "A new enlistee to the Naval Branch undergoing basic seamanship training — navigation, vessel maintenance, and standard naval safety procedures.",
    },
    {
      code: "NB-2",
      name: "Seaman",
      abbr: "SEAM",
      purpose:
        "A qualified naval soldier assigned to active vessel duty. Performs standard crew functions aboard H.M.C. naval vessels.",
    },
    {
      code: "NB-3",
      name: "Able Seaman",
      abbr: "ABSEAM",
      purpose:
        "An experienced seaman with advanced vessel skills. Takes on greater responsibility for crew functions and assists in junior sailor training.",
    },
    {
      code: "NB-4",
      name: "Naval Specialist",
      abbr: "NVSP",
      purpose:
        "Trained in a specialized naval role — gunnery, navigation, engineering, or communications — and serves as a subject-matter expert aboard their vessel.",
    },
    {
      code: "NB-5",
      name: "Naval Petty Officer",
      abbr: "NVPO",
      purpose:
        "A junior non-commissioned officer of the Naval Branch. Leads a small crew section and is responsible for their welfare and performance.",
    },
    {
      code: "NB-6",
      name: "Naval Senior Petty Officer",
      abbr: "NVSPO",
      purpose:
        "Manages an entire crew department aboard a vessel — engineering, gunnery, or navigation. Ensures that department runs at peak efficiency.",
    },
    {
      code: "NB-7",
      name: "Naval Chief Petty Officer",
      abbr: "NVCPO",
      purpose:
        "The senior enlisted sailor aboard a vessel. Acts as the primary advisor to the vessel's commanding officer on all crew matters.",
    },
    {
      code: "NB-8",
      name: "Naval Master Chief",
      abbr: "NVMCH",
      purpose:
        "The most senior enlisted rank of the Naval Branch. Oversees all NCO performance across the fleet and advises the Naval Commander on enlisted readiness.",
    },
    {
      code: "NB-O1",
      name: "Ensign",
      abbr: "ENS",
      purpose:
        "The most junior commissioned officer of the Naval Branch. Assigned to a vessel in a leadership role and learns under senior naval officers.",
    },
    {
      code: "NB-O2",
      name: "Naval Lieutenant",
      abbr: "NVLT",
      purpose:
        "Commands a small river patrol craft or serves as executive officer of a larger vessel. Responsible for tactical navigation and crew safety.",
    },
    {
      code: "NB-O3",
      name: "Naval Captain",
      abbr: "NVCPT",
      purpose:
        "Commands a full naval vessel. Bears complete responsibility for the vessel, its crew, and its assigned mission.",
    },
    {
      code: "NB-O4",
      name: "Naval Commodore",
      abbr: "NVCMDR",
      purpose:
        "Commands a squadron of naval vessels. Coordinates fleet tactical operations and amphibious assault planning.",
    },
    {
      code: "NB-O5",
      name: "Fleet Admiral",
      abbr: "FLADM",
      purpose:
        "The supreme commander of the entire H.M.C. Naval Branch. Commands all naval assets, sets fleet doctrine, and reports directly to High Command.",
    },
  ],
  "Cavalry Branch": [
    {
      code: "CV-1",
      name: "Cavalry Recruit",
      abbr: "CVREC",
      purpose:
        "A new Cavalry Branch member undergoing basic horsemanship and mounted combat training. Must demonstrate proficiency in mount handling before field assignment.",
    },
    {
      code: "CV-2",
      name: "Trooper",
      abbr: "TRPR",
      purpose:
        "A qualified cavalry soldier assigned to an active mounted unit. Performs standard cavalry duties including patrol, scouting, and formation riding.",
    },
    {
      code: "CV-3",
      name: "Senior Trooper",
      abbr: "SRTRPR",
      purpose:
        "An experienced trooper who has demonstrated above-average mounted combat ability. Takes on additional responsibilities within their unit.",
    },
    {
      code: "CV-4",
      name: "Cavalry Specialist",
      abbr: "CVSP",
      purpose:
        "Trained in a specific cavalry skill — lance combat, mounted archery, or war beast handling — and acts as a subject-matter expert in their mounted unit.",
    },
    {
      code: "CV-5",
      name: "Cavalry Corporal",
      abbr: "CVCPL",
      purpose:
        "A junior cavalry NCO commanding a lance (4-6 mounted soldiers). Responsible for their small unit's welfare, mounts, and effectiveness in the field.",
    },
    {
      code: "CV-6",
      name: "Cavalry Sergeant",
      abbr: "CVSG",
      purpose:
        "Commands a cavalry section of 2-3 lances. Coordinates small-unit mounted maneuvers and ensures all mounts are battle-ready.",
    },
    {
      code: "CV-7",
      name: "Cavalry Staff Sergeant",
      abbr: "CVSSG",
      purpose:
        "Senior NCO of a cavalry troop. Manages the day-to-day operations of 40-80 mounted soldiers and advises the Cavalry Captain.",
    },
    {
      code: "CV-8",
      name: "Cavalry Gunnery Sergeant",
      abbr: "CVGySgt",
      purpose:
        "Master cavalry trainer. Responsible for all mounted combat training doctrine across the Cavalry Branch and ensures troopers maintain peak readiness.",
    },
    {
      code: "CV-9",
      name: "Cavalry First Sergeant",
      abbr: "CV1SG",
      purpose:
        "Senior enlisted leader of a cavalry regiment. Acts as the primary senior NCO advisor and ensures regiment-wide discipline and horse care standards.",
    },
    {
      code: "CV-O1",
      name: "Cavalry Lieutenant",
      abbr: "CVLT",
      purpose:
        "Junior cavalry officer commanding a troop of 40-80 mounted soldiers. Plans and leads mounted combat patrols and light engagements.",
    },
    {
      code: "CV-O2",
      name: "Cavalry Captain",
      abbr: "CVCPT",
      purpose:
        "Commands a cavalry squadron of 2-4 troops. Responsible for tactical employment of several hundred mounted soldiers in the field.",
    },
    {
      code: "CV-O3",
      name: "Cavalry Commander",
      abbr: "CVCDR",
      purpose:
        "Commands the entire Cavalry Branch. Advises High Command on mounted warfare doctrine, plans all major cavalry operations, and coordinates rapid-strike assets across the theater.",
    },
  ],
};

// ─── H.M.C. Preset Branches ────────────────────────────────────────────────────

// ─── Per-rank troop distribution (military pyramid) ────────────────────────────
// Limited class-leader rank codes that are always capped at 1 person.
const LIMITED_RANK_CODES_SET = new Set(["E5-1", "O9-1", "GC7-1", "G2-1"]);

/**
 * Distribute `totalHeadcount` troops across `rankCodes` using an exponential
 * military pyramid (bottom rank = most troops, each step up is progressively
 * fewer). Limited class-leader ranks are always capped at exactly 1.
 *
 * Returns a Record<rankCode, number> with integer counts summing to
 * at most `totalHeadcount`.
 */
export function distributeTroopsAcrossRanks(
  rankCodes: string[],
  totalHeadcount: number,
): Record<string, number> {
  if (rankCodes.length === 0 || totalHeadcount <= 0) {
    const out: Record<string, number> = {};
    for (const code of rankCodes) {
      out[code] = 0;
    }
    return out;
  }

  // Separate limited vs regular ranks.
  const limited: string[] = [];
  const regular: string[] = [];
  for (const code of rankCodes) {
    if (LIMITED_RANK_CODES_SET.has(code)) {
      limited.push(code);
    } else {
      regular.push(code);
    }
  }

  // Reserve 1 troop per limited rank (only if we actually have troops).
  const reservedForLimited = Math.min(limited.length, totalHeadcount);
  const available = totalHeadcount - reservedForLimited;

  // Build exponential weights for regular ranks (index 0 = lowest = most troops).
  // weight[i] = decay ^ i  (decay = 0.65 gives a plausible pyramid).
  const DECAY = 0.65;
  const weights: number[] = [];
  for (let i = 0; i < regular.length; i++) {
    weights.push(DECAY ** i);
  }
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  // Allocate integer counts (floor then distribute remainder to lowest ranks).
  const counts: number[] = weights.map((w) =>
    totalWeight > 0 ? Math.floor((w / totalWeight) * available) : 0,
  );
  let distributed = counts.reduce((s, c) => s + c, 0);
  let remainder = available - distributed;
  for (let i = 0; i < counts.length && remainder > 0; i++) {
    counts[i]++;
    remainder--;
  }

  const result: Record<string, number> = {};
  for (let i = 0; i < regular.length; i++) {
    result[regular[i]] = counts[i];
  }
  for (const code of limited) {
    result[code] = reservedForLimited > 0 ? 1 : 0;
  }
  return result;
}

export const HMC_PRESET_BRANCHES: Omit<ArmyBranch, "id">[] = [
  {
    name: "Standard Infantry",
    headcount: 0n,
    trainingLevel: "Regular",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Ground Combat",
      "Territory Control",
      "Formation Fighting",
      "Front-Line Assault",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The core fighting force of the H.M.C. Military. Primarily composed of Enlisted Class soldiers. Handles all ground combat operations, holds territory, and forms the backbone of every H.M.C. engagement.",
    veteranFlag: false,
    machineryIds: [],
  },
  {
    name: "Officer Corps",
    headcount: 0n,
    trainingLevel: "Regular",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Command Authority",
      "Operational Planning",
      "Officer Training",
      "Inter-Branch Coordination",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The command and coordination branch of the H.M.C. Military. Officer Class soldiers lead, plan, and direct all operations. The Officer Corps trains, promotes, and evaluates all commissioned officers across every branch.",
    veteranFlag: false,
    machineryIds: [],
  },
  {
    name: "H.M.C. Guard Division",
    headcount: 0n,
    trainingLevel: "Regular",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Personal Protection",
      "Asset Security",
      "Installation Defense",
      "Close Protection",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The dedicated protective branch of the H.M.C. Military, drawn entirely from Guard Class ranks. Tasked with the personal protection of Leading Class soldiers and the security of all H.M.C. high-value assets and installations.",
    veteranFlag: false,
    machineryIds: [],
  },
  {
    name: "High Command",
    headcount: 0n,
    trainingLevel: "Elite",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Strategic Command",
      "Military Doctrine",
      "Theater Operations",
      "Diplomatic Authority",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The strategic leadership branch of the H.M.C. Military. Composed of the most senior Leading Class soldiers. Responsible for setting military doctrine, directing theater-level operations, and making all final decisions for the H.M.C. Military.",
    veteranFlag: false,
    machineryIds: [],
  },
  {
    name: "Spec Ops / Special Operations",
    headcount: 0n,
    trainingLevel: "Elite",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Covert Operations",
      "Infiltration",
      "Sabotage",
      "Hostage Rescue",
      "Deep Reconnaissance",
      "Targeted Elimination",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The elite covert operations branch of the H.M.C. Military. Recruits from across all soldier classes. Conducts high-risk, high-reward missions that conventional forces cannot or should not attempt.",
    veteranFlag: false,
    machineryIds: [],
  },
  {
    name: "Logistics & Supply",
    headcount: 0n,
    trainingLevel: "Regular",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Supply Chain Management",
      "Ammunition Distribution",
      "Food & Water Supply",
      "Equipment Maintenance",
      "Field Logistics",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The operational backbone of the H.M.C. Military. Manages all food, ammunition, equipment, gold, and supply lines that keep every branch in the field. Without Logistics & Supply, no branch can sustain operations.",
    veteranFlag: false,
    machineryIds: [],
  },
  {
    name: "Intelligence Division",
    headcount: 0n,
    trainingLevel: "Veteran",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Reconnaissance",
      "Enemy Intelligence",
      "Threat Analysis",
      "Counter-Intelligence",
      "Signal Intelligence",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The eyes and ears of the H.M.C. Military. Conducts reconnaissance, gathers enemy intelligence, analyzes threats, and provides actionable intelligence to all branch commanders and High Command.",
    veteranFlag: false,
    machineryIds: [],
  },
  {
    name: "Naval Branch",
    headcount: 0n,
    trainingLevel: "Regular",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Naval Combat",
      "River Operations",
      "Amphibious Assault",
      "Naval Fire Support",
      "Maritime Control",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The maritime arm of the H.M.C. Military. Commands all naval vessels, river operations, and amphibious assaults. Controls waterways, projects force across bodies of water, and provides naval fire support to ground branches.",
    veteranFlag: false,
    machineryIds: [],
  },
  {
    name: "Cavalry Branch",
    headcount: 0n,
    trainingLevel: "Regular",
    condition: "Rested",
    abilities: [],
    loadouts: [],
    specialties: [
      "Mounted Combat",
      "Rapid Strike",
      "Flanking Maneuvers",
      "Scouting",
      "Pursuit Operations",
      "Breach Exploitation",
    ],
    officerIds: [],
    deploymentLocation: "",
    interBranchNotes:
      "The rapid-strike mounted arm of the H.M.C. Military. Employs horses, war beasts, and mounted soldiers to deliver fast, powerful blows against enemy formations. Excels in pursuit, flanking maneuvers, scouting, and exploiting breakthroughs.",
    veteranFlag: false,
    machineryIds: [],
  },
];

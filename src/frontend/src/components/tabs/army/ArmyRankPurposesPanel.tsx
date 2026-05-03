import { useState } from "react";
import type { ArmyRank } from "../../../types";
import { HMC_BRANCH_SPECIAL_RANKS } from "./armyHelpers";

// ─── HMC detection ────────────────────────────────────────────────────────────
// Returns true if the army's rank array appears to contain H.M.C. Military ranks
export function hasHmcRanks(ranks: ArmyRank[]): boolean {
  if (!ranks || ranks.length === 0) return false;
  return ranks.some(
    (r) =>
      r.name.startsWith("E-1 ") ||
      r.name.startsWith("O-1 ") ||
      r.name.startsWith("GC-1 ") ||
      r.name.startsWith("G-1 ") ||
      r.name.includes("H.M.C"),
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type RankEntry = { code: string; name: string; abbr: string; purpose: string };

const ENLISTED: RankEntry[] = [
  {
    code: "E-1",
    name: "H.M.C Recruit",
    abbr: "HMCRC",
    purpose:
      "Newly inducted members of the H.M.C. Military who have not yet completed basic training. Recruits are assigned to orientation units, learning the foundations of discipline, protocol, and military conduct.",
  },
  {
    code: "E-2",
    name: "Private",
    abbr: "PVT",
    purpose:
      "Entry-level soldiers who have completed basic orientation. Privates carry out assigned duties under direct supervision and are responsible for maintaining personal equipment and following orders.",
  },
  {
    code: "E-3",
    name: "Private Third Class",
    abbr: "PV3",
    purpose:
      "Privates who have demonstrated consistent performance and are beginning to develop core combat and support competencies. Expected to take initiative within their assigned squad.",
  },
  {
    code: "E-4",
    name: "Private Second Class",
    abbr: "PV2",
    purpose:
      "Soldiers with notable service time and demonstrated reliability. Private Second Class personnel often serve as point-of-contact for new recruits and assist in daily operations.",
  },
  {
    code: "E-5",
    name: "Private First Class",
    abbr: "PV1",
    purpose:
      "Experienced frontline soldiers trusted with greater responsibilities. Private First Class members may lead small fireteams and are expected to mentor lower-ranked enlisted personnel.",
  },
  {
    code: "E-6",
    name: "Lance Corporal",
    abbr: "LCpl",
    purpose:
      "The first step toward a leadership role within the Enlisted Class. Lance Corporals assist team leaders, manage small groups of soldiers, and are entrusted with relay of commands in the field.",
  },
  {
    code: "E-7",
    name: "Corporal",
    abbr: "CPL",
    purpose:
      "Junior non-commissioned officers responsible for the direct leadership of a fireteam. Corporals enforce standards, issue orders from above, and are accountable for the readiness and conduct of their assigned soldiers.",
  },
  {
    code: "E-8",
    name: "Sergeant",
    abbr: "SGT",
    purpose:
      "Non-commissioned officers who serve as the primary leadership layer between the command staff and the common soldier. Sergeants manage a full squad, coordinate tactical movements, and maintain unit discipline.",
  },
  {
    code: "E-9",
    name: "Staff Sergeant",
    abbr: "SSG",
    purpose:
      "Senior squad leaders responsible for overseeing multiple fireteams or a full section. Staff Sergeants coordinate operations between squads and act as a primary point of escalation for discipline and logistics issues.",
  },
  {
    code: "E-10",
    name: "Gunnery Sergeant",
    abbr: "GySgt",
    purpose:
      "Specialists in weapons, tactics, and unit readiness. Gunnery Sergeants provide advanced combat expertise to their units, oversee weapons maintenance and training, and mentor junior NCOs.",
  },
  {
    code: "E-11",
    name: "Sergeant Second Class",
    abbr: "SSC",
    purpose:
      "Senior NCOs who manage operations across multiple squads or a platoon element. Sergeant Second Class personnel bridge communication between lower enlisted and the senior NCO corps.",
  },
  {
    code: "E-12",
    name: "Sergeant First Class",
    abbr: "SFC",
    purpose:
      "Highly experienced NCOs who serve as the primary advisors to platoon-level officers. Sergeant First Class members handle complex logistics, personnel management, and cross-squad coordination.",
  },
  {
    code: "E-13",
    name: "Master Sergeant",
    abbr: "MSG",
    purpose:
      "Among the most senior NCOs in the Enlisted Class. Master Sergeants provide subject matter expertise to their unit, take responsibility for long-term training programs, and advise officers on the capabilities of their soldiers.",
  },
  {
    code: "E-14",
    name: "Second Sergeant",
    abbr: "2SG",
    purpose:
      "Senior advisory NCOs who specialise in inter-unit coordination and operational planning. Second Sergeants are trusted with sensitive mission briefs and serve as liaison between the enlisted corps and the command staff.",
  },
  {
    code: "E-15",
    name: "First Sergeant",
    abbr: "1SG",
    purpose:
      "The top enlisted advisor to a company or equivalent unit. First Sergeants are the authoritative voice of the enlisted corps, managing personnel welfare, discipline, and readiness at the company level.",
  },
  {
    code: "E-16",
    name: "Master Gunnery Sergeant",
    abbr: "MGySg",
    purpose:
      "Elite technical specialists who combine the authority of a Master Sergeant with advanced weapons and field expertise. Master Gunnery Sergeants oversee specialised training and serve as the final authority on tactical readiness within their domain.",
  },
  {
    code: "E-17",
    name: "Sergeant Major",
    abbr: "SGM",
    purpose:
      "Senior enlisted leaders who operate at the battalion level or above. Sergeant Majors advise high-ranking officers, oversee large-scale enlisted operations, and represent the interests of the enlisted corps to command leadership.",
  },
  {
    code: "E-18",
    name: "Sergeant Major Of The HMC",
    abbr: "SGTMotHMC",
    purpose:
      "The most distinguished Sergeant Major rank in the H.M.C. Military. This role carries authority across multiple units and serves as the senior enlisted representative to the broader command structure of the HMC.",
  },
  {
    code: "E-19",
    name: "High Sergeant",
    abbr: "HSG",
    purpose:
      "A prestige rank reserved for Sergeant Majors who have demonstrated exceptional leadership over a long career. High Sergeants coordinate across entire garrison structures and are consulted on major operational decisions.",
  },
  {
    code: "E-20",
    name: "High Sergeant Of The HMC",
    abbr: "HSGoHMC",
    purpose:
      "One of the highest enlisted ranks in the HMC. The High Sergeant Of The HMC advises the highest levels of military command on all matters pertaining to enlisted welfare, operations, and standards.",
  },
  {
    code: "E-21",
    name: "High Commanding Sergeant Of The HMC",
    abbr: "HCSGoHMC",
    purpose:
      "The supreme NCO rank in the Enlisted Class. The High Commanding Sergeant Of The HMC holds unmatched authority over all enlisted personnel, setting standards for conduct, training, and performance across the entire enlisted corps.",
  },
  {
    code: "E5-1",
    name: "Head of Enlisted Class",
    abbr: "HoEC",
    purpose:
      "A singular, limited position — only one person holds this rank at any time. The Head of Enlisted Class commands the entire Enlisted Class, serves as its ultimate authority, and represents all enlisted soldiers in the highest councils of HMC command. This rank is a mark of lifetime achievement and unparalleled leadership.",
  },
];

const OFFICER: RankEntry[] = [
  {
    code: "O-1",
    name: "Junior Lieutenant",
    abbr: "JLT",
    purpose:
      "The entry rank for Officer Class soldiers. Junior Lieutenants command small units under the supervision of senior officers, learning the art of leadership, planning, and decision-making in active operations.",
  },
  {
    code: "O-2",
    name: "Third Lieutenant",
    abbr: "3LT",
    purpose:
      "Officers developing core command competencies. Third Lieutenants are assigned to support platoons or staff roles, gaining experience in logistics, personnel management, and officer-level protocol.",
  },
  {
    code: "O-3",
    name: "Second Lieutenant",
    abbr: "2LT",
    purpose:
      "Officers who have demonstrated readiness for independent command. Second Lieutenants lead platoon-sized elements, manage junior officer subordinates, and execute orders from company commanders.",
  },
  {
    code: "O-4",
    name: "First Lieutenant",
    abbr: "1LT",
    purpose:
      "Experienced platoon commanders who serve as second-in-command at the company level. First Lieutenants coordinate between platoon and company command, manage administrative functions, and stand ready to assume company command.",
  },
  {
    code: "O-5",
    name: "Commanding Lieutenant",
    abbr: "CMDLT",
    purpose:
      "Senior lieutenants who hold independent command authority. Commanding Lieutenants oversee specialised platoons or lead detachments on independent missions, reporting directly to company-grade commanders.",
  },
  {
    code: "O-6",
    name: "Commander",
    abbr: "CDR",
    purpose:
      "Officers with full authority over a company-level element. Commanders are responsible for the operational readiness, discipline, mission success, and welfare of all soldiers under their charge.",
  },
  {
    code: "O-7",
    name: "Commanding Captain",
    abbr: "CDCPT",
    purpose:
      "Senior captains entrusted with directing multi-company operations or acting as the senior officer for a forward operating base. Commanding Captains coordinate between company and battalion-level command structures.",
  },
  {
    code: "O-8",
    name: "Captain",
    abbr: "CAPT",
    purpose:
      "Versatile company-grade officers who may command in any operational context. Captains are the cornerstone of the HMC officer corps — experienced, capable, and trusted to carry out complex missions with minimal oversight.",
  },
  {
    code: "O-9",
    name: "Lieutenant Major",
    abbr: "LTMAJ",
    purpose:
      "Officers bridging the gap between company-grade and field-grade command. Lieutenant Majors serve as executive officers at the battalion level, overseeing daily battalion operations and deputising for the commanding major.",
  },
  {
    code: "O-10",
    name: "Major",
    abbr: "MAJ",
    purpose:
      "Field-grade officers who command at the battalion level. Majors direct combined arms operations, coordinate with multiple company commanders, and serve as primary staff advisors to colonels and generals.",
  },
  {
    code: "O-11",
    name: "Lieutenant Colonel",
    abbr: "LTC",
    purpose:
      "Senior field-grade officers commanding brigade elements or serving as deputy commanders of large formations. Lieutenant Colonels manage complex, multi-unit operations and serve in key planning and strategy roles.",
  },
  {
    code: "O-12",
    name: "Colonel",
    abbr: "COL",
    purpose:
      "Senior officers commanding brigade or regimental-level forces. Colonels are responsible for the strategic direction of large formations, maintaining operational effectiveness, and advising general officers on combat and logistics.",
  },
  {
    code: "O-13",
    name: "Brigadier General",
    abbr: "BG",
    purpose:
      "The first general officer rank. Brigadier Generals command at the brigade level or serve as senior staff officers in large headquarters. They translate strategic guidance from higher command into operational plans for their formations.",
  },
  {
    code: "O-14",
    name: "Major General",
    abbr: "MG",
    purpose:
      "Two-star general officers commanding divisions or equivalent large formations. Major Generals oversee multiple brigade-level units, direct large-scale operations, and serve as senior advisors to the highest levels of HMC leadership.",
  },
  {
    code: "O-15",
    name: "Lieutenant General",
    abbr: "LTG",
    purpose:
      "Three-star general officers commanding corps or multi-division formations. Lieutenant Generals operate at the strategic level, coordinating entire theaters of operation and representing HMC command to allied forces.",
  },
  {
    code: "O-16",
    name: "General",
    abbr: "GEN",
    purpose:
      "Four-star general officers commanding the entire field army or theater of operations. The General rank represents the pinnacle of operational military leadership. Personnel of this rank are also cleared for aerial operations and command authority extends across all formations in theater.",
  },
  {
    code: "O-17",
    name: "Coming Soon",
    abbr: "CS",
    purpose:
      "This rank designation is reserved for future expansion of the Officer Class structure. Details will be announced when the rank is formally established.",
  },
  {
    code: "O-18",
    name: "Coming Soon",
    abbr: "CS",
    purpose:
      "This rank designation is reserved for future expansion of the Officer Class structure. Details will be announced when the rank is formally established.",
  },
  {
    code: "O9-1",
    name: "Head of Officer Class",
    abbr: "HoOC",
    purpose:
      "A singular, limited position — only one person holds this rank at any time. The Head of Officer Class commands every officer in the H.M.C. Military, sets the standards of conduct and excellence for the entire Officer Class, and is the supreme military authority below the Leading Class. This rank is awarded only to a General with an extraordinary record of service and leadership.",
  },
];

const GUARD: RankEntry[] = [
  {
    code: "GC-1",
    name: "Enlisted Guard",
    abbr: "EG",
    purpose:
      "The entry rank for Guard Class soldiers. Enlisted Guards are assigned to fixed security posts, perimeter patrol, and access control. They operate under constant supervision while learning the protocols and procedures of the Guard Corps.",
  },
  {
    code: "GC-2",
    name: "Basic Guard",
    abbr: "BG",
    purpose:
      "Guards who have completed initial security training. Basic Guards are assigned to standard protection details and checkpoint duties, demonstrating proficiency in identifying threats and following security protocols.",
  },
  {
    code: "GC-3",
    name: "1st Generation Guard",
    abbr: "1GG",
    purpose:
      "Guards who have completed their first full tour of duty. 1st Generation Guards have proven reliable in a live security environment and are assigned to more demanding posts, including inner perimeter duties at key installations.",
  },
  {
    code: "GC-4",
    name: "2nd Generation Guard",
    abbr: "2GG",
    purpose:
      "Experienced guards with multiple tours of security service. 2nd Generation Guards supervise junior guards on duty shifts and are entrusted with the protection of mid-priority assets and personnel.",
  },
  {
    code: "GC-5",
    name: "3rd Generation Guard",
    abbr: "3GG",
    purpose:
      "Mid-tier guards with demonstrated expertise in close-protection and facility security. 3rd Generation Guards begin training in advanced threat assessment and are rotated through high-security assignments.",
  },
  {
    code: "GC-6",
    name: "4th Generation Guard",
    abbr: "4GG",
    purpose:
      "Senior guards who have served with distinction across multiple security assignments. 4th Generation Guards mentor lower-ranked members of the Guard Class and may lead small security details.",
  },
  {
    code: "GC-7",
    name: "5th Generation Guard",
    abbr: "5GG",
    purpose:
      "Elite guards who have completed five full tours of guard service. 5th Generation Guards are assigned to high-value protection roles and serve as the senior authority on security matters at the squad level.",
  },
  {
    code: "GC-8",
    name: "Advanced Guard",
    abbr: "ADG",
    purpose:
      "Guards who have undergone advanced security and close-protection training. Advanced Guards are capable of responding to direct threats against command personnel and operate in dynamic, high-risk environments.",
  },
  {
    code: "GC-9",
    name: "Advanced High Guard",
    abbr: "ADHG",
    purpose:
      "Highly trained protection specialists assigned to the security of senior officers and critical command infrastructure. Advanced High Guards conduct threat analysis, plan protective details, and coordinate multi-guard security operations.",
  },
  {
    code: "GC-10",
    name: "Officer Guard",
    abbr: "OG",
    purpose:
      "Guard Class officers who combine combat leadership with specialised security expertise. Officer Guards command guard platoons, manage security rotations, and are responsible for the safety of designated high-value areas and personnel.",
  },
  {
    code: "GC-11",
    name: "Advanced Officer Guard",
    abbr: "ADOG",
    purpose:
      "Senior Guard Class officers with command authority over multiple guard units. Advanced Officer Guards design and implement large-scale security operations, oversee protective detail planning, and advise command on security vulnerabilities.",
  },
  {
    code: "GC-12",
    name: "Basic Security Unit Guard",
    abbr: "BSUG",
    purpose:
      "Guards who have qualified for assignment to dedicated Security Units. Basic Security Unit Guards operate in structured teams, providing layered protection for key installations and coordinating responses to security breaches.",
  },
  {
    code: "GC-13",
    name: "High Security Unit Guard",
    abbr: "HSUG",
    purpose:
      "Experienced Security Unit Guards assigned to the protection of the most critical assets in the HMC. High Security Unit Guards are specialists in counter-infiltration, threat neutralisation, and rapid response.",
  },
  {
    code: "GC-14",
    name: "Advanced Security Unit Guard",
    abbr: "ASUG",
    purpose:
      "The senior guard rank within standard Security Units. Advanced Security Unit Guards lead teams, design security protocols, and are personally responsible for the safety of protected assets during the highest-threat situations.",
  },
  {
    code: "GC-15",
    name: "Basic Command Unit Guard",
    abbr: "BCUG",
    purpose:
      "Guards assigned to the protection of command-level personnel and headquarters. Basic Command Unit Guards are cleared for proximity to senior officers and are trained in both static defence and mobile escort operations.",
  },
  {
    code: "GC-16",
    name: "High Command Unit Guard",
    abbr: "HCUG",
    purpose:
      "Experienced Command Unit Guards who serve as the primary protective detail for senior command personnel. High Command Unit Guards coordinate with command staff on movement, security, and threat response procedures.",
  },
  {
    code: "GC-17",
    name: "Advanced Command Unit Guard",
    abbr: "ACUG",
    purpose:
      "Elite Command Unit Guards who lead the protection details of the most senior command officers. Advanced Command Unit Guards have full authority over all security decisions regarding their assigned protected personnel.",
  },
  {
    code: "GC-18",
    name: "Overseeing Guard",
    abbr: "OVG",
    purpose:
      "Senior guards who oversee the operations of multiple guard units across an installation or region. Overseeing Guards conduct security audits, review guard performance, and ensure standards are maintained at all protection levels.",
  },
  {
    code: "GC-19",
    name: "Advanced Overseeing Guard",
    abbr: "AOVG",
    purpose:
      "Elite oversight guards with authority over the entire guard contingent at a major installation or command headquarters. Advanced Overseeing Guards report directly to the Head of Guard Class and implement security policy across all guard elements.",
  },
  {
    code: "GC-20",
    name: "High Command Guard",
    abbr: "HCG",
    purpose:
      "The most senior non-leadership rank in the Guard Class. High Command Guards serve as the personal security chief for the highest-ranking officers in the HMC, coordinating all protective operations at the command level and advising on all matters of security policy.",
  },
  {
    code: "GC7-1",
    name: "Head of Guard Class",
    abbr: "HoGC",
    purpose:
      "A singular, limited position — only one person holds this rank at any time. The Head of Guard Class holds supreme command over all Guard Class soldiers and security operations within the H.M.C. Military. This individual is responsible for the safety of the entire Leading Class and defines the security doctrine of the HMC Guard Corps.",
  },
];

const LEADING: RankEntry[] = [
  {
    code: "G-1",
    name: "General Of The HMC",
    abbr: "GotHMC",
    purpose:
      "The entry rank of the Leading Class and one of the most distinguished positions in the H.M.C. Military. The General Of The HMC holds supreme operational authority over large formations and serves as a direct representative of HMC command authority.",
  },
  {
    code: "G-2",
    name: "Private General Of The HMC",
    abbr: "PGotHMC",
    purpose:
      "A General Officer newly elevated to the Leading Class. The Private General Of The HMC is undergoing orientation to the elevated responsibilities of the Leading Class while maintaining full authority over their assigned command domain.",
  },
  {
    code: "G-3",
    name: "Chief General Of The HMC",
    abbr: "CGotHMC",
    purpose:
      "A senior Leading Class officer responsible for overseeing specific branches or departments within the HMC. The Chief General Of The HMC sets policy, ensures compliance with HMC standards, and advises higher command on domain-specific operations.",
  },
  {
    code: "G-4",
    name: "Low General Of The HMC",
    abbr: "LGotHMC",
    purpose:
      "A Leading Class officer holding authority over a major operational region or strategic asset group. The Low General Of The HMC coordinates large-scale operations across multiple formations and reports to the higher generals of the Leading Class.",
  },
  {
    code: "G-5",
    name: "High General Of The HMC",
    abbr: "HGotHMC",
    purpose:
      "A senior strategic leader within the Leading Class. The High General Of The HMC directs theater-level or multi-domain operations, sets strategic objectives for subordinate commands, and participates in the highest-level planning processes of the HMC.",
  },
  {
    code: "G-6",
    name: "Sergeant General Of The HMC",
    abbr: "SGGotHMC",
    purpose:
      "A unique hybrid rank combining senior NCO experience with General-level authority. The Sergeant General Of The HMC bridges the gap between the enlisted corps and the highest command echelons, ensuring that the needs and perspectives of all soldiers are represented at the strategic level.",
  },
  {
    code: "G-7",
    name: "Head General Of The NMC",
    abbr: "HGNotHMC",
    purpose:
      "A general officer with authority extending across organisations aligned with but not exclusively under the HMC — including allied forces and joint commands. The Head General Of The NMC coordinates inter-organisational operations and ensures cohesive action across all affiliated military structures.",
  },
  {
    code: "G-8",
    name: "Lead General Of The HMC",
    abbr: "LGotHMC",
    purpose:
      "One of the most senior generals in the H.M.C. Military. The Lead General Of The HMC directs the strategic posture of the entire organisation, assigns mission priorities to subordinate generals, and serves as the primary military advisor to the Head of Leading Class.",
  },
  {
    code: "G-9",
    name: "Commanding General Of The HMC",
    abbr: "CMDGotHMC",
    purpose:
      "The supreme active command authority of the H.M.C. Military. The Commanding General Of The HMC holds absolute authority over all military operations, all formations, and all branches of the HMC. Only the Head of Leading Class ranks above this position.",
  },
  {
    code: "G2-1",
    name: "Head of Leading Class",
    abbr: "HoLC",
    purpose:
      "A singular, limited position — only one person holds this rank at any time. The Head of Leading Class is the absolute supreme authority of the entire H.M.C. Military. All military decisions, strategic directions, and organisational policies ultimately rest with this individual. This rank represents the pinnacle of leadership within the HMC and is held only by one person of extraordinary distinction and command legacy.",
  },
];

type ClassConfig = {
  label: string;
  description: string;
  accentColor: string;
  bgColor: string;
  badgeBg: string;
  badgeColor: string;
  entries: RankEntry[];
};

const CLASSES: ClassConfig[] = [
  {
    label: "Enlisted Class",
    description:
      "The foundational fighting force of the H.M.C. Military. Enlisted soldiers carry out direct orders, form the bulk of combat and support operations, and are the backbone of all military activity.",
    accentColor: "#3b82f6",
    bgColor: "rgba(59,130,246,0.07)",
    badgeBg: "rgba(59,130,246,0.15)",
    badgeColor: "#60a5fa",
    entries: ENLISTED,
  },
  {
    label: "Officer Class",
    description:
      "Officer Class soldiers are held to a higher standard of conduct and bear greater responsibilities than their Enlisted counterparts. They lead, plan, and direct operations at all levels.",
    accentColor: "#d97706",
    bgColor: "rgba(217,119,6,0.07)",
    badgeBg: "rgba(217,119,6,0.15)",
    badgeColor: "#fbbf24",
    entries: OFFICER,
  },
  {
    label: "Guard Class",
    description:
      "Guard Class soldiers are tasked with protecting any members of the Leading Class or higher when on base. Protection can be declined by the person being guarded.",
    accentColor: "#16a34a",
    bgColor: "rgba(22,163,74,0.07)",
    badgeBg: "rgba(22,163,74,0.15)",
    badgeColor: "#4ade80",
    entries: GUARD,
  },
  {
    label: "Leading Class",
    description:
      "The highest authority commanding officers of the H.M.C. Military. Leading Class officers hold supreme command and are responsible for the overall strategic direction and welfare of the entire organisation.",
    accentColor: "#7c3aed",
    bgColor: "rgba(124,58,237,0.07)",
    badgeBg: "rgba(124,58,237,0.15)",
    badgeColor: "#a78bfa",
    entries: LEADING,
  },
];

// ─── Branch configs ──────────────────────────────────────────────────────────

type BranchConfig = {
  name: string;
  description: string;
  accentColor: string;
  bgColor: string;
  badgeBg: string;
  badgeColor: string;
};

const BRANCH_CONFIGS: BranchConfig[] = [
  {
    name: "Standard Infantry",
    description:
      "The core fighting force of the H.M.C. Military. Primarily composed of Enlisted Class soldiers. Handles all ground combat operations, holds territory, and forms the backbone of every H.M.C. engagement.",
    accentColor: "#dc2626",
    bgColor: "rgba(220,38,38,0.07)",
    badgeBg: "rgba(220,38,38,0.15)",
    badgeColor: "#f87171",
  },
  {
    name: "Officer Corps",
    description:
      "The command and coordination branch of the H.M.C. Military. Officer Class soldiers lead, plan, and direct all operations. The Officer Corps trains, promotes, and evaluates all commissioned officers across every branch.",
    accentColor: "#d97706",
    bgColor: "rgba(217,119,6,0.07)",
    badgeBg: "rgba(217,119,6,0.15)",
    badgeColor: "#fbbf24",
  },
  {
    name: "H.M.C. Guard Division",
    description:
      "The dedicated protective branch of the H.M.C. Military, drawn entirely from Guard Class ranks. Tasked with the personal protection of Leading Class soldiers and the security of all H.M.C. high-value assets and installations.",
    accentColor: "#16a34a",
    bgColor: "rgba(22,163,74,0.07)",
    badgeBg: "rgba(22,163,74,0.15)",
    badgeColor: "#4ade80",
  },
  {
    name: "High Command",
    description:
      "The strategic leadership branch of the H.M.C. Military. Composed of the most senior Leading Class soldiers. Responsible for setting military doctrine, directing theater-level operations, and making all final decisions.",
    accentColor: "#7c3aed",
    bgColor: "rgba(124,58,237,0.07)",
    badgeBg: "rgba(124,58,237,0.15)",
    badgeColor: "#a78bfa",
  },
  {
    name: "Spec Ops / Special Operations",
    description:
      "The elite covert operations branch of the H.M.C. Military. Recruits from across all soldier classes. Conducts high-risk, high-reward missions including infiltration, sabotage, hostage rescue, and deep reconnaissance.",
    accentColor: "#475569",
    bgColor: "rgba(71,85,105,0.07)",
    badgeBg: "rgba(71,85,105,0.15)",
    badgeColor: "#94a3b8",
  },
  {
    name: "Logistics & Supply",
    description:
      "The operational backbone of the H.M.C. Military. Manages all food, ammunition, equipment, gold, and supply lines that keep every branch in the field.",
    accentColor: "#ea580c",
    bgColor: "rgba(234,88,12,0.07)",
    badgeBg: "rgba(234,88,12,0.15)",
    badgeColor: "#fb923c",
  },
  {
    name: "Intelligence Division",
    description:
      "The eyes and ears of the H.M.C. Military. Conducts reconnaissance, gathers enemy intelligence, analyzes threats, and manages counter-intelligence operations.",
    accentColor: "#0891b2",
    bgColor: "rgba(8,145,178,0.07)",
    badgeBg: "rgba(8,145,178,0.15)",
    badgeColor: "#22d3ee",
  },
  {
    name: "Naval Branch",
    description:
      "The maritime arm of the H.M.C. Military. Commands all naval vessels, river operations, and amphibious assaults. Controls waterways and provides naval fire support to ground branches.",
    accentColor: "#1d4ed8",
    bgColor: "rgba(29,78,216,0.07)",
    badgeBg: "rgba(29,78,216,0.15)",
    badgeColor: "#60a5fa",
  },
  {
    name: "Cavalry Branch",
    description:
      "The rapid-strike mounted arm of the H.M.C. Military. Employs horses, war beasts, and mounted soldiers. Excels in pursuit, flanking maneuvers, scouting, and exploiting breakthroughs in enemy lines.",
    accentColor: "#92400e",
    bgColor: "rgba(146,64,14,0.07)",
    badgeBg: "rgba(146,64,14,0.15)",
    badgeColor: "#d97706",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  ranks: ArmyRank[];
  troopCountsByBranch?: Record<string, number>;
  /** Branch special rank codes → troop count */
  troopCountsByRank?: Record<string, number>;
  /** Main H.M.C. class rank codes (E-1, O-1, GC-1, G-1 etc.) → troop count */
  troopCountsByMainRank?: Record<string, number>;
}

export default function ArmyRankPurposesPanel({
  ranks,
  troopCountsByBranch,
  troopCountsByRank,
  troopCountsByMainRank,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Enlisted Class": true,
    "Officer Class": false,
    "Guard Class": false,
    "Leading Class": false,
  });
  const [branchExpanded, setBranchExpanded] = useState<Record<string, boolean>>(
    {},
  );

  const toggle = (label: string) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const toggleBranch = (name: string) =>
    setBranchExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  if (!hasHmcRanks(ranks)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          gap: 12,
          textAlign: "center",
        }}
        data-ocid="army.rank_purposes.empty_state"
      >
        <div style={{ fontSize: 32 }}>📋</div>
        <p
          style={{
            color: "var(--ds-muted)",
            fontSize: 14,
            maxWidth: 360,
            lineHeight: 1.6,
          }}
        >
          Apply the{" "}
          <strong style={{ color: "var(--ds-text)" }}>H.M.C. Military</strong>{" "}
          preset in the{" "}
          <strong style={{ color: "var(--ds-text)" }}>Ranks</strong> tab to view
          the full rank reference guide.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
      data-ocid="army.rank_purposes.panel"
    >
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 18, marginBottom: 4 }}
        >
          H.M.C. Military — Rank Reference
        </h2>
        <p style={{ color: "var(--ds-muted)", fontSize: 12, lineHeight: 1.5 }}>
          72 ranks across 4 soldier classes. All ranks are fully editable in the
          Ranks tab. This guide is a read-only reference.
        </p>
      </div>

      {/* Soldier class sections */}
      {CLASSES.map((cls) => {
        // Class-level troop total from main rank counts
        const classTroopTotal =
          troopCountsByMainRank !== undefined
            ? cls.entries.reduce(
                (sum, e) => sum + (troopCountsByMainRank[e.code] ?? 0),
                0,
              )
            : undefined;
        return (
          <div
            key={cls.label}
            style={{
              border: `1px solid ${cls.accentColor}40`,
              borderRadius: 8,
              overflow: "hidden",
            }}
            data-ocid={`army.rank_purposes.${cls.label.toLowerCase().replace(/ /g, "_")}.section`}
          >
            <button
              type="button"
              onClick={() => toggle(cls.label)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 16px",
                background: cls.bgColor,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
              data-ocid={`army.rank_purposes.${cls.label.toLowerCase().replace(/ /g, "_")}.toggle`}
            >
              <span
                style={{
                  color: cls.accentColor,
                  fontSize: 14,
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                {expanded[cls.label] ? "▾" : "▸"}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  className="font-cinzel"
                  style={{
                    color: cls.accentColor,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    marginBottom: 3,
                  }}
                >
                  {cls.label}
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      background: cls.badgeBg,
                      color: cls.badgeColor,
                      border: `1px solid ${cls.accentColor}40`,
                      borderRadius: 4,
                      padding: "1px 6px",
                      fontFamily: "inherit",
                      verticalAlign: "middle",
                    }}
                  >
                    {cls.entries.length} ranks
                  </span>
                  {classTroopTotal !== undefined && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--ds-muted)",
                        border: "1px solid var(--ds-border)",
                        borderRadius: 4,
                        padding: "1px 6px",
                        fontFamily: "inherit",
                        verticalAlign: "middle",
                      }}
                    >
                      👥 {classTroopTotal.toLocaleString()} troops
                    </span>
                  )}
                </div>
                <p
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 12,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {cls.description}
                </p>
              </div>
            </button>

            {expanded[cls.label] && (
              <div style={{ borderTop: `1px solid ${cls.accentColor}25` }}>
                {cls.entries.map((entry, idx) => {
                  const LIMITED_RANK_CODES = ["E5-1", "O9-1", "GC7-1", "G2-1"];
                  const isLimited =
                    LIMITED_RANK_CODES.includes(entry.code) ||
                    entry.purpose.startsWith("A singular, limited");
                  const rankTroopCount =
                    troopCountsByMainRank !== undefined
                      ? (troopCountsByMainRank[entry.code] ?? 0)
                      : undefined;
                  return (
                    <div
                      key={entry.code}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "10px 16px",
                        borderBottom:
                          idx < cls.entries.length - 1
                            ? `1px solid ${cls.accentColor}15`
                            : "none",
                        background: isLimited
                          ? `${cls.accentColor}12`
                          : "transparent",
                        alignItems: "flex-start",
                      }}
                      data-ocid={`army.rank_purposes.rank.${entry.code.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                    >
                      <div
                        style={{
                          minWidth: 52,
                          flexShrink: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          paddingTop: 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "monospace",
                            color: cls.accentColor,
                            fontWeight: 700,
                            textAlign: "center",
                          }}
                        >
                          {entry.code}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            background: cls.badgeBg,
                            color: cls.badgeColor,
                            border: `1px solid ${cls.accentColor}30`,
                            borderRadius: 3,
                            padding: "1px 4px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {entry.abbr}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 4,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--ds-text)",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {entry.name}
                          </span>
                          {isLimited && (
                            <span
                              style={{
                                fontSize: 9,
                                background: `${cls.accentColor}25`,
                                color: cls.accentColor,
                                border: `1px solid ${cls.accentColor}50`,
                                borderRadius: 3,
                                padding: "1px 5px",
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                              }}
                            >
                              LIMITED · 1 PERSON
                            </span>
                          )}
                          {rankTroopCount !== undefined && (
                            <span
                              style={{
                                fontSize: 10,
                                background: "rgba(255,255,255,0.06)",
                                color: "var(--ds-muted)",
                                border: "1px solid var(--ds-border)",
                                borderRadius: 4,
                                padding: "1px 5px",
                                fontFamily: "inherit",
                                verticalAlign: "middle",
                              }}
                            >
                              👥 {rankTroopCount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 12,
                            lineHeight: 1.55,
                            margin: 0,
                          }}
                        >
                          {entry.purpose}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Branch Special Ranks */}
      <div style={{ marginTop: 8 }}>
        <div style={{ marginBottom: 10 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 15, marginBottom: 4 }}
          >
            Branch Special Ranks
          </h3>
          <p
            style={{ color: "var(--ds-muted)", fontSize: 12, lineHeight: 1.5 }}
          >
            Each H.M.C. branch has its own special rank ladder tailored to its
            role. These ranks are used within the branch alongside the standard
            class ranks.
          </p>
        </div>
        {BRANCH_CONFIGS.map((cfg) => {
          const branchRanks = HMC_BRANCH_SPECIAL_RANKS[cfg.name] ?? [];
          const isOpen = !!branchExpanded[cfg.name];
          return (
            <div
              key={cfg.name}
              style={{
                border: `1px solid ${cfg.accentColor}40`,
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 8,
              }}
              data-ocid={`army.rank_purposes.branch.${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.section`}
            >
              <button
                type="button"
                onClick={() => toggleBranch(cfg.name)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 16px",
                  background: cfg.bgColor,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                data-ocid={`army.rank_purposes.branch.${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.toggle`}
              >
                <span
                  style={{
                    color: cfg.accentColor,
                    fontSize: 14,
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                >
                  {isOpen ? "▾" : "▸"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    className="font-cinzel"
                    style={{
                      color: cfg.accentColor,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      marginBottom: 3,
                    }}
                  >
                    {cfg.name}
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        background: cfg.badgeBg,
                        color: cfg.badgeColor,
                        border: `1px solid ${cfg.accentColor}40`,
                        borderRadius: 4,
                        padding: "1px 6px",
                        fontFamily: "inherit",
                        verticalAlign: "middle",
                      }}
                    >
                      {branchRanks.length} ranks
                    </span>
                    {troopCountsByBranch !== undefined && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--ds-muted)",
                          border: "1px solid var(--ds-border)",
                          borderRadius: 4,
                          padding: "1px 6px",
                          fontFamily: "inherit",
                          verticalAlign: "middle",
                        }}
                      >
                        👥{" "}
                        {(
                          troopCountsByBranch[cfg.name.toLowerCase()] ?? 0
                        ).toLocaleString()}{" "}
                        troops
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 12,
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {cfg.description}
                  </p>
                </div>
              </button>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${cfg.accentColor}25` }}>
                  {branchRanks.map((entry, idx) => (
                    <div
                      key={entry.code}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "10px 16px",
                        borderBottom:
                          idx < branchRanks.length - 1
                            ? `1px solid ${cfg.accentColor}15`
                            : "none",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 64,
                          flexShrink: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          paddingTop: 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "monospace",
                            color: cfg.accentColor,
                            fontWeight: 700,
                            textAlign: "center",
                          }}
                        >
                          {entry.code}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            background: cfg.badgeBg,
                            color: cfg.badgeColor,
                            border: `1px solid ${cfg.accentColor}30`,
                            borderRadius: 3,
                            padding: "1px 4px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {entry.abbr}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: 4 }}>
                          <span
                            style={{
                              color: "var(--ds-text)",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {entry.name}
                          </span>
                          {troopCountsByRank !== undefined && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 10,
                                background: "rgba(255,255,255,0.06)",
                                color: "var(--ds-muted)",
                                border: "1px solid var(--ds-border)",
                                borderRadius: 4,
                                padding: "1px 5px",
                                fontFamily: "inherit",
                                verticalAlign: "middle",
                              }}
                            >
                              {"\u{1F465}"}{" "}
                              {(
                                troopCountsByRank[entry.code] ?? 0
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 12,
                            lineHeight: 1.55,
                            margin: 0,
                          }}
                        >
                          {entry.purpose}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

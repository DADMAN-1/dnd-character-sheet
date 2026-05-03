import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Array "mo:core/Array";



(with migration = func(old : {
  gainLossEntries : Map.Map<Text, {
    id : Text; armyId : Text; owner : Principal; timestamp : Text;
    interactionType : Text; enemyName : Text; outcome : Text;
    gains : { troops : Nat; gold : Nat; prisoners : Nat; supplies : Nat; territory : Text; intel : Text; officersCasualties : Text; equipmentNotes : Text; other : Text };
    losses : { troops : Nat; gold : Nat; prisoners : Nat; supplies : Nat; territory : Text; intel : Text; officersCasualties : Text; equipmentNotes : Text; other : Text };
    moraleImpact : Int; moraleApplied : Bool; notes : Text; linkedFactionId : ?Nat;
  }>;
  armyLootEntries : Map.Map<Text, {
    id : Text; armyId : Text; owner : Principal; name : Text;
    quantity : Nat; lootType : Text; source : Text; dateAcquired : Text;
    value : Nat; distributed : Bool; notes : Text;
  }>;
  prisonerExchanges : Map.Map<Text, {
    id : Text; armyId : Text; owner : Principal; prisonerName : Text;
    prisonerFaction : Text; prisonerRank : Text; capturedDate : Text;
    capturedFrom : Text; status : Text; exchangeDetails : Text;
    ransomAmount : Nat; notes : Text;
  }>;
  personalLootEntries : Map.Map<Text, {
    id : Text; characterId : Nat; owner : Principal; name : Text;
    quantity : Nat; lootType : Text; source : Text; dateAcquired : Text;
    value : Nat; kept : Bool; notes : Text;
  }>;
  locations : Map.Map<Text, {
    id : Text; name : Text; locationType : Text; region : Text;
    description : Text; notes : Text; visitedDate : Text; owner : Principal; factionId : ?Nat;
  }>;
  npcs : Map.Map<Text, {
    id : Text; name : Text; race : Text; location : Text;
    relationship : Text; description : Text; notes : Text; owner : Principal; factionId : ?Nat; locationId : ?Nat;
  }>;
  timelineEvents : Map.Map<Text, {
    id : Text; title : Text; date : Text; category : Text;
    description : Text; characters : [Text]; armies : [Text]; owner : Principal; linkedFactionId : ?Nat; linkedLocationId : ?Nat;
  }>;
  sessionLog : Map.Map<Text, {
    id : Text; campaignId : ?Text; title : Text; date : Text;
    summary : Text; xpGained : Nat; loot : Text; notes : Text; owner : Principal;
    linkedEncounterIds : [Nat]; linkedNpcIds : [Nat]; linkedQuestIds : [Nat];
  }>;
  encounterLog : Map.Map<Text, {
    id : Text; campaignId : ?Text; name : Text; date : Text;
    difficulty : Text; outcome : Text; xpAwarded : Nat; notes : Text; owner : Principal;
    locationId : ?Nat; linkedNpcIds : [Nat];
  }>;
  quests : Map.Map<Nat, List.List<{
    id : Text; title : Text; status : Text; description : Text;
    objectives : Text; reward : Text; notes : Text; linkedNpcIds : [Nat]; linkedFactionIds : [Nat];
  }>>;
  rivalEntries : Map.Map<Text, {
    id : Text; characterId : Nat; owner : Principal; name : Text;
    rivalType : Text; faction : Text; backstory : Text; currentLocation : Text;
    threatLevel : Text; personalHistory : Text; wins : Nat; losses : Nat;
    status : Text; notes : Text; linkedFactionId : ?Nat;
  }>;
  armies : Map.Map<Text, { id : Text; characterId : Nat; commandingCharacterId : ?Text; owner : Principal; name : Text; size : Nat; moraleRating : Nat; powerLevel : Nat; status : Text; race : Text; specialties : [Text]; faction : Text; banner : Text; trainingLevel : Text; condition : Text; foundingDate : Text; terrainNotes : Text; warChest : Nat; ranks : [{ id : Text; name : Text; tier : Nat; description : Text; troopCount : Nat }]; branches : [{ id : Text; name : Text; headcount : Nat; trainingLevel : Text; condition : Text; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; loadouts : [{ id : Text; name : Text; weaponType : Text; armorType : Text; notes : Text }]; specialties : [Text]; officerIds : [Text]; deploymentLocation : Text; interBranchNotes : Text; veteranFlag : Bool; machineryIds : [Text] }]; specOpsGroups : [{ id : Text; name : Text; missionType : Text; headcount : Nat; condition : Text; officerIds : [Text]; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; equipmentNotes : Text; notes : Text }]; machinery : [{ id : Text; name : Text; machineryType : Text; condition : Text; crewSize : Nat; damageEffect : Text; notes : Text }]; officers : [{ id : Text; name : Text; rankId : Text; race : Text; background : Text; skills : [Text]; notes : Text; loyalty : Nat; combatAbility : Nat; leadership : Nat; promotionLog : [{ id : Text; fromRank : Text; toRank : Text; date : Text; notes : Text }]; factionId : ?Nat }]; commanders : [{ id : Text; name : Text; rankId : Text; background : Text; commandSkills : [Text]; signatureAbility : Text; historyNotes : Text; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; factionId : ?Nat }]; armyAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; officerAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; commanderAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; logistics : { food : Nat; ammunition : Nat; goldReserves : Nat; supplyLines : [{ id : Text; route : Text; vulnerabilities : Text; notes : Text }]; casualtiesLog : [{ id : Text; branchName : Text; troopLosses : Nat; woundedOfficers : Nat; date : Text; notes : Text }]; injuryNotes : Text }; commandStructure : { chainOfCommand : [{ id : Text; officerId : Text; reportsToId : Text; role : Text }]; ordersLog : [{ id : Text; target : Text; order : Text; date : Text }] }; intelligence : { enemyIntelLog : [{ id : Text; enemyName : Text; knownStrength : Text; weaknesses : Text; notes : Text; date : Text }]; scoutReports : [{ id : Text; area : Text; findings : Text; date : Text }] }; moraleData : { moraleEventsLog : [{ id : Text; event : Text; impact : Text; date : Text }]; loyaltyTracker : [{ id : Text; entityName : Text; loyaltyScore : Nat; notes : Text }] }; alliedArmies : [{ id : Text; name : Text; size : Nat; commander : Text; allegiance : Text; notes : Text }]; armyNotes : { campaignLog : [{ id : Text; entry : Text; date : Text }]; battlePlannerNotes : [{ id : Text; objective : Text; notes : Text; date : Text }]; generalNotes : Text } }>;
}) : {
  gainLossEntries : Map.Map<Text, {
    id : Text; armyId : Text; owner : Principal; timestamp : Text;
    interactionType : Text; enemyName : Text; outcome : Text;
    gains : { troops : Nat; gold : Nat; prisoners : Nat; supplies : Nat; territory : Text; intel : Text; officersCasualties : Text; equipmentNotes : Text; other : Text };
    losses : { troops : Nat; gold : Nat; prisoners : Nat; supplies : Nat; territory : Text; intel : Text; officersCasualties : Text; equipmentNotes : Text; other : Text };
    moraleImpact : Int; moraleApplied : Bool; notes : Text; linkedFactionId : ?Nat;
  }>;
  armyLootEntries : Map.Map<Text, {
    id : Text; armyId : Text; owner : Principal; name : Text;
    quantity : Nat; lootType : Text; source : Text; dateAcquired : Text;
    value : Nat; distributed : Bool; notes : Text;
  }>;
  prisonerExchanges : Map.Map<Text, {
    id : Text; armyId : Text; owner : Principal; prisonerName : Text;
    prisonerFaction : Text; prisonerRank : Text; capturedDate : Text;
    capturedFrom : Text; status : Text; exchangeDetails : Text;
    ransomAmount : Nat; notes : Text;
  }>;
  personalLootEntries : Map.Map<Text, {
    id : Text; characterId : Nat; owner : Principal; name : Text;
    quantity : Nat; lootType : Text; source : Text; dateAcquired : Text;
    value : Nat; kept : Bool; notes : Text;
  }>;
  locations : Map.Map<Text, {
    id : Text; name : Text; locationType : Text; region : Text;
    description : Text; notes : Text; visitedDate : Text; owner : Principal; factionId : ?Nat;
  }>;
  npcs : Map.Map<Text, {
    id : Text; name : Text; race : Text; location : Text;
    relationship : Text; description : Text; notes : Text; owner : Principal; factionId : ?Nat; locationId : ?Nat;
  }>;
  timelineEvents : Map.Map<Text, {
    id : Text; title : Text; date : Text; category : Text;
    description : Text; characters : [Text]; armies : [Text]; owner : Principal; linkedFactionId : ?Nat; linkedLocationId : ?Nat;
  }>;
  sessionLog : Map.Map<Text, {
    id : Text; campaignId : ?Text; title : Text; date : Text;
    summary : Text; xpGained : Nat; loot : Text; notes : Text; owner : Principal;
    linkedEncounterIds : [Nat]; linkedNpcIds : [Nat]; linkedQuestIds : [Nat];
  }>;
  encounterLog : Map.Map<Text, {
    id : Text; campaignId : ?Text; name : Text; date : Text;
    difficulty : Text; outcome : Text; xpAwarded : Nat; notes : Text; owner : Principal;
    locationId : ?Nat; linkedNpcIds : [Nat];
  }>;
  quests : Map.Map<Nat, List.List<{
    id : Text; title : Text; status : Text; description : Text;
    objectives : Text; reward : Text; notes : Text; linkedNpcIds : [Nat]; linkedFactionIds : [Nat];
  }>>;
  rivalEntries : Map.Map<Text, {
    id : Text; characterId : Nat; owner : Principal; name : Text;
    rivalType : Text; faction : Text; backstory : Text; currentLocation : Text;
    threatLevel : Text; personalHistory : Text; wins : Nat; losses : Nat;
    status : Text; notes : Text; linkedFactionId : ?Nat;
  }>;
  armies : Map.Map<Text, { id : Text; characterId : Nat; commandingCharacterId : ?Text; owner : Principal; name : Text; size : Nat; moraleRating : Nat; powerLevel : Nat; status : Text; race : Text; specialties : [Text]; faction : Text; banner : Text; trainingLevel : Text; condition : Text; foundingDate : Text; terrainNotes : Text; warChest : Nat; ranks : [{ id : Text; name : Text; tier : Nat; description : Text; troopCount : Nat }]; branches : [{ id : Text; name : Text; headcount : Nat; trainingLevel : Text; condition : Text; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; loadouts : [{ id : Text; name : Text; weaponType : Text; armorType : Text; notes : Text }]; specialties : [Text]; officerIds : [Text]; deploymentLocation : Text; interBranchNotes : Text; veteranFlag : Bool; machineryIds : [Text] }]; specOpsGroups : [{ id : Text; name : Text; missionType : Text; headcount : Nat; condition : Text; officerIds : [Text]; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; equipmentNotes : Text; notes : Text }]; machinery : [{ id : Text; name : Text; machineryType : Text; condition : Text; crewSize : Nat; damageEffect : Text; notes : Text }]; officers : [{ id : Text; name : Text; rankId : Text; race : Text; background : Text; skills : [Text]; notes : Text; loyalty : Nat; combatAbility : Nat; leadership : Nat; promotionLog : [{ id : Text; fromRank : Text; toRank : Text; date : Text; notes : Text }]; factionId : ?Nat }]; commanders : [{ id : Text; name : Text; rankId : Text; background : Text; commandSkills : [Text]; signatureAbility : Text; historyNotes : Text; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; factionId : ?Nat }]; armyAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; officerAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; commanderAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; logistics : { food : Nat; ammunition : Nat; goldReserves : Nat; supplyLines : [{ id : Text; route : Text; vulnerabilities : Text; notes : Text }]; casualtiesLog : [{ id : Text; branchName : Text; troopLosses : Nat; woundedOfficers : Nat; date : Text; notes : Text }]; injuryNotes : Text }; commandStructure : { chainOfCommand : [{ id : Text; officerId : Text; reportsToId : Text; role : Text }]; ordersLog : [{ id : Text; target : Text; order : Text; date : Text }] }; intelligence : { enemyIntelLog : [{ id : Text; enemyName : Text; knownStrength : Text; weaknesses : Text; notes : Text; date : Text }]; scoutReports : [{ id : Text; area : Text; findings : Text; date : Text }] }; moraleData : { moraleEventsLog : [{ id : Text; event : Text; impact : Text; date : Text }]; loyaltyTracker : [{ id : Text; entityName : Text; loyaltyScore : Nat; notes : Text }] }; alliedArmies : [{ id : Text; name : Text; size : Nat; commander : Text; allegiance : Text; notes : Text }]; armyNotes : { campaignLog : [{ id : Text; entry : Text; date : Text }]; battlePlannerNotes : [{ id : Text; objective : Text; notes : Text; date : Text }]; generalNotes : Text } }>;
} {
  let toNat = func(i : Int) : Nat { if (i < 0) 0 else Int.abs(i) };
  let _toNat = toNat; // suppress unused warning
  let newGainLoss = old.gainLossEntries.map<Text, { id : Text; armyId : Text; owner : Principal; timestamp : Text; interactionType : Text; enemyName : Text; outcome : Text; gains : { troops : Nat; gold : Nat; prisoners : Nat; supplies : Nat; territory : Text; intel : Text; officersCasualties : Text; equipmentNotes : Text; other : Text }; losses : { troops : Nat; gold : Nat; prisoners : Nat; supplies : Nat; territory : Text; intel : Text; officersCasualties : Text; equipmentNotes : Text; other : Text }; moraleImpact : Int; moraleApplied : Bool; notes : Text; linkedFactionId : ?Nat }, { id : Text; armyId : Text; owner : Principal; timestamp : Text; interactionType : Text; enemyName : Text; outcome : Text; gains : { troops : Nat; gold : Nat; prisoners : Nat; supplies : Nat; territory : Text; intel : Text; officersCasualties : Text; equipmentNotes : Text; other : Text }; losses : { troops : Nat; gold : Nat; prisoners : Nat; supplies : Nat; territory : Text; intel : Text; officersCasualties : Text; equipmentNotes : Text; other : Text }; moraleImpact : Int; moraleApplied : Bool; notes : Text; linkedFactionId : ?Nat }>(func(_, e) {
    e
  });
  let newArmyLoot = old.armyLootEntries.map<Text, { id : Text; armyId : Text; owner : Principal; name : Text; quantity : Nat; lootType : Text; source : Text; dateAcquired : Text; value : Nat; distributed : Bool; notes : Text }, { id : Text; armyId : Text; owner : Principal; name : Text; quantity : Nat; lootType : Text; source : Text; dateAcquired : Text; value : Nat; distributed : Bool; notes : Text }>(func(_, e) { e });
  let newPrisoners = old.prisonerExchanges.map<Text, { id : Text; armyId : Text; owner : Principal; prisonerName : Text; prisonerFaction : Text; prisonerRank : Text; capturedDate : Text; capturedFrom : Text; status : Text; exchangeDetails : Text; ransomAmount : Nat; notes : Text }, { id : Text; armyId : Text; owner : Principal; prisonerName : Text; prisonerFaction : Text; prisonerRank : Text; capturedDate : Text; capturedFrom : Text; status : Text; exchangeDetails : Text; ransomAmount : Nat; notes : Text }>(func(_, e) { e });
  let newPersonalLoot = old.personalLootEntries.map<Text, { id : Text; characterId : Nat; owner : Principal; name : Text; quantity : Nat; lootType : Text; source : Text; dateAcquired : Text; value : Nat; kept : Bool; notes : Text }, { id : Text; characterId : Nat; owner : Principal; name : Text; quantity : Nat; lootType : Text; source : Text; dateAcquired : Text; value : Nat; kept : Bool; notes : Text }>(func(_, e) { e });
  let newLocations = old.locations.map<Text, { id : Text; name : Text; locationType : Text; region : Text; description : Text; notes : Text; visitedDate : Text; owner : Principal; factionId : ?Nat }, { id : Text; name : Text; locationType : Text; region : Text; description : Text; notes : Text; visitedDate : Text; owner : Principal; factionId : ?Nat }>(func(_, e) {
    e
  });
  let newNpcs = old.npcs.map<Text, { id : Text; name : Text; race : Text; location : Text; relationship : Text; description : Text; notes : Text; owner : Principal; factionId : ?Nat; locationId : ?Nat }, { id : Text; name : Text; race : Text; location : Text; relationship : Text; description : Text; notes : Text; owner : Principal; factionId : ?Nat; locationId : ?Nat }>(func(_, e) {
    e
  });
  let newTimeline = old.timelineEvents.map<Text, { id : Text; title : Text; date : Text; category : Text; description : Text; characters : [Text]; armies : [Text]; owner : Principal; linkedFactionId : ?Nat; linkedLocationId : ?Nat }, { id : Text; title : Text; date : Text; category : Text; description : Text; characters : [Text]; armies : [Text]; owner : Principal; linkedFactionId : ?Nat; linkedLocationId : ?Nat }>(func(_, e) {
    e
  });
  let newSessions = old.sessionLog.map<Text, { id : Text; campaignId : ?Text; title : Text; date : Text; summary : Text; xpGained : Nat; loot : Text; notes : Text; owner : Principal; linkedEncounterIds : [Nat]; linkedNpcIds : [Nat]; linkedQuestIds : [Nat] }, { id : Text; campaignId : ?Text; title : Text; date : Text; summary : Text; xpGained : Nat; loot : Text; notes : Text; owner : Principal; linkedEncounterIds : [Nat]; linkedNpcIds : [Nat]; linkedQuestIds : [Nat] }>(func(_, e) {
    e
  });
  let newEncounters = old.encounterLog.map<Text, { id : Text; campaignId : ?Text; name : Text; date : Text; difficulty : Text; outcome : Text; xpAwarded : Nat; notes : Text; owner : Principal; locationId : ?Nat; linkedNpcIds : [Nat] }, { id : Text; campaignId : ?Text; name : Text; date : Text; difficulty : Text; outcome : Text; xpAwarded : Nat; notes : Text; owner : Principal; locationId : ?Nat; linkedNpcIds : [Nat] }>(func(_, e) {
    e
  });
  let newQuests = old.quests.map<Nat, List.List<{ id : Text; title : Text; status : Text; description : Text; objectives : Text; reward : Text; notes : Text; linkedNpcIds : [Nat]; linkedFactionIds : [Nat] }>, List.List<{ id : Text; title : Text; status : Text; description : Text; objectives : Text; reward : Text; notes : Text; linkedNpcIds : [Nat]; linkedFactionIds : [Nat] }>>(func(_, qs) {
    qs
  });
  let newRivals = old.rivalEntries.map<Text, { id : Text; characterId : Nat; owner : Principal; name : Text; rivalType : Text; faction : Text; backstory : Text; currentLocation : Text; threatLevel : Text; personalHistory : Text; wins : Nat; losses : Nat; status : Text; notes : Text; linkedFactionId : ?Nat }, { id : Text; characterId : Nat; owner : Principal; name : Text; rivalType : Text; faction : Text; backstory : Text; currentLocation : Text; threatLevel : Text; personalHistory : Text; wins : Nat; losses : Nat; status : Text; notes : Text; linkedFactionId : ?Nat }>(func(_, e) {
    e
  });
  let newArmies = old.armies.map<Text, { id : Text; characterId : Nat; commandingCharacterId : ?Text; owner : Principal; name : Text; size : Nat; moraleRating : Nat; powerLevel : Nat; status : Text; race : Text; specialties : [Text]; faction : Text; banner : Text; trainingLevel : Text; condition : Text; foundingDate : Text; terrainNotes : Text; warChest : Nat; ranks : [{ id : Text; name : Text; tier : Nat; description : Text; troopCount : Nat }]; branches : [{ id : Text; name : Text; headcount : Nat; trainingLevel : Text; condition : Text; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; loadouts : [{ id : Text; name : Text; weaponType : Text; armorType : Text; notes : Text }]; specialties : [Text]; officerIds : [Text]; deploymentLocation : Text; interBranchNotes : Text; veteranFlag : Bool; machineryIds : [Text] }]; specOpsGroups : [{ id : Text; name : Text; missionType : Text; headcount : Nat; condition : Text; officerIds : [Text]; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; equipmentNotes : Text; notes : Text }]; machinery : [{ id : Text; name : Text; machineryType : Text; condition : Text; crewSize : Nat; damageEffect : Text; notes : Text }]; officers : [{ id : Text; name : Text; rankId : Text; race : Text; background : Text; skills : [Text]; notes : Text; loyalty : Nat; combatAbility : Nat; leadership : Nat; promotionLog : [{ id : Text; fromRank : Text; toRank : Text; date : Text; notes : Text }]; factionId : ?Nat }]; commanders : [{ id : Text; name : Text; rankId : Text; background : Text; commandSkills : [Text]; signatureAbility : Text; historyNotes : Text; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; factionId : ?Nat }]; armyAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; officerAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; commanderAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; logistics : { food : Nat; ammunition : Nat; goldReserves : Nat; supplyLines : [{ id : Text; route : Text; vulnerabilities : Text; notes : Text }]; casualtiesLog : [{ id : Text; branchName : Text; troopLosses : Nat; woundedOfficers : Nat; date : Text; notes : Text }]; injuryNotes : Text }; commandStructure : { chainOfCommand : [{ id : Text; officerId : Text; reportsToId : Text; role : Text }]; ordersLog : [{ id : Text; target : Text; order : Text; date : Text }] }; intelligence : { enemyIntelLog : [{ id : Text; enemyName : Text; knownStrength : Text; weaknesses : Text; notes : Text; date : Text }]; scoutReports : [{ id : Text; area : Text; findings : Text; date : Text }] }; moraleData : { moraleEventsLog : [{ id : Text; event : Text; impact : Text; date : Text }]; loyaltyTracker : [{ id : Text; entityName : Text; loyaltyScore : Nat; notes : Text }] }; alliedArmies : [{ id : Text; name : Text; size : Nat; commander : Text; allegiance : Text; notes : Text }]; armyNotes : { campaignLog : [{ id : Text; entry : Text; date : Text }]; battlePlannerNotes : [{ id : Text; objective : Text; notes : Text; date : Text }]; generalNotes : Text } }, { id : Text; characterId : Nat; commandingCharacterId : ?Text; owner : Principal; name : Text; size : Nat; moraleRating : Nat; powerLevel : Nat; status : Text; race : Text; specialties : [Text]; faction : Text; banner : Text; trainingLevel : Text; condition : Text; foundingDate : Text; terrainNotes : Text; warChest : Nat; ranks : [{ id : Text; name : Text; tier : Nat; description : Text; troopCount : Nat }]; branches : [{ id : Text; name : Text; headcount : Nat; trainingLevel : Text; condition : Text; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; loadouts : [{ id : Text; name : Text; weaponType : Text; armorType : Text; notes : Text }]; specialties : [Text]; officerIds : [Text]; deploymentLocation : Text; interBranchNotes : Text; veteranFlag : Bool; machineryIds : [Text] }]; specOpsGroups : [{ id : Text; name : Text; missionType : Text; headcount : Nat; condition : Text; officerIds : [Text]; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; equipmentNotes : Text; notes : Text }]; machinery : [{ id : Text; name : Text; machineryType : Text; condition : Text; crewSize : Nat; damageEffect : Text; notes : Text }]; officers : [{ id : Text; name : Text; rankId : Text; race : Text; background : Text; skills : [Text]; notes : Text; loyalty : Nat; combatAbility : Nat; leadership : Nat; promotionLog : [{ id : Text; fromRank : Text; toRank : Text; date : Text; notes : Text }]; factionId : ?Nat }]; commanders : [{ id : Text; name : Text; rankId : Text; background : Text; commandSkills : [Text]; signatureAbility : Text; historyNotes : Text; abilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; factionId : ?Nat }]; armyAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; officerAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; commanderAbilities : [{ id : Text; name : Text; description : Text; cost : Text; effect : Text }]; logistics : { food : Nat; ammunition : Nat; goldReserves : Nat; supplyLines : [{ id : Text; route : Text; vulnerabilities : Text; notes : Text }]; casualtiesLog : [{ id : Text; branchName : Text; troopLosses : Nat; woundedOfficers : Nat; date : Text; notes : Text }]; injuryNotes : Text }; commandStructure : { chainOfCommand : [{ id : Text; officerId : Text; reportsToId : Text; role : Text }]; ordersLog : [{ id : Text; target : Text; order : Text; date : Text }] }; intelligence : { enemyIntelLog : [{ id : Text; enemyName : Text; knownStrength : Text; weaknesses : Text; notes : Text; date : Text }]; scoutReports : [{ id : Text; area : Text; findings : Text; date : Text }] }; moraleData : { moraleEventsLog : [{ id : Text; event : Text; impact : Text; date : Text }]; loyaltyTracker : [{ id : Text; entityName : Text; loyaltyScore : Nat; notes : Text }] }; alliedArmies : [{ id : Text; name : Text; size : Nat; commander : Text; allegiance : Text; notes : Text }]; armyNotes : { campaignLog : [{ id : Text; entry : Text; date : Text }]; battlePlannerNotes : [{ id : Text; objective : Text; notes : Text; date : Text }]; generalNotes : Text } }>(func(_, a) {
    { a with ranks = a.ranks.map<{ id : Text; name : Text; tier : Nat; description : Text }, { id : Text; name : Text; tier : Nat; description : Text; troopCount : Nat }>(func(r) { { r with troopCount = 0 } }) }
  });
  {
    gainLossEntries = newGainLoss;
    armyLootEntries = newArmyLoot;
    prisonerExchanges = newPrisoners;
    personalLootEntries = newPersonalLoot;
    locations = newLocations;
    npcs = newNpcs;
    timelineEvents = newTimeline;
    sessionLog = newSessions;
    encounterLog = newEncounters;
    quests = newQuests;
    rivalEntries = newRivals;
    armies = newArmies;
  }
})
actor {
  // Types
  public type CharacterId = Nat;
  public type SpellId = Nat;
  public type TraitId = Nat;
  public type InventoryItemId = Nat;
  public type RaceId = Nat;
  public type ClassId = Nat;
  public type CustomSpellId = Nat;
  public type CustomItemId = Nat;
  public type CustomAbilityId = Nat;
  public type CharacterAbilityId = Nat;
  public type CustomPhysicalAttackId = Nat;
  public type CharacterPhysicalAttackId = Nat;
  public type CustomSpellSchoolId = Nat;

  public type Character = {
    name : Text;
    race : Text;
    characterClass : Text;
    gender : Text;
    background : Text;
    alignment : Text;
    level : Nat;
    str : Nat;
    dex : Nat;
    con : Nat;
    int : Nat;
    wis : Nat;
    cha : Nat;
    hpMax : Nat;
    hpCurrent : Nat;
    ac : Nat;
    speed : Nat;
    initiative : Nat;
    proficiencyBonus : Nat;
    gold : Nat;
    notes : Text;
    spellSlots : [Nat];
    skills : Skills;
    owner : Principal;
    portraitUrl : Text;
  };

  public type Skills = {
    acrobatics : Bool;
    animalHandling : Bool;
    arcana : Bool;
    athletics : Bool;
    deception : Bool;
    history : Bool;
    insight : Bool;
    intimidation : Bool;
    investigation : Bool;
    medicine : Bool;
    nature : Bool;
    perception : Bool;
    performance : Bool;
    persuasion : Bool;
    religion : Bool;
    sleightOfHand : Bool;
    stealth : Bool;
    survival : Bool;
    description : Text;
  };

  public type Spell = {
    characterId : CharacterId;
    name : Text;
    level : Nat;
    school : Text;
    castingTime : Text;
    range : Text;
    components : Text;
    duration : Text;
    damageEffect : Text;
    description : Text;
  };

  public type Trait = {
    characterId : CharacterId;
    name : Text;
    source : Text;
    description : Text;
  };

  public type InventoryItem = {
    characterId : CharacterId;
    name : Text;
    description : Text;
    quantity : Nat;
    weight : Nat;
    equipped : Bool;
  };

  // CustomRace unchanged from original (no migration needed)
  public type CustomRace = {
    name : Text;
    description : Text;
    speed : Nat;
    abilityBonuses : Abilities;
    traits : [Trait];
  };

  // Separate type for race-linked content (stored in its own map)
  public type RaceLinkedContent = {
    linkedSpellIds : [CustomSpellId];
    linkedAbilityIds : [CustomAbilityId];
    linkedAttackIds : [CustomPhysicalAttackId];
  };

  public type CustomClass = {
    name : Text;
    hitDie : Nat;
    description : Text;
    proficiencies : [Text];
    features : [Trait];
  };

  public type Abilities = {
    str : Nat;
    dex : Nat;
    con : Nat;
    int : Nat;
    wis : Nat;
    cha : Nat;
  };

  public type CustomSpell = {
    name : Text;
    level : Nat;
    school : Text;
    castingTime : Text;
    range : Text;
    components : Text;
    duration : Text;
    damageEffect : Text;
    description : Text;
    owner : Principal;
  };

  public type CustomItem = {
    name : Text;
    description : Text;
    weight : Text;
    value : Text;
    itemType : Text;
    rarity : Text;
    owner : Principal;
  };

  public type CustomSpellSchool = {
    name : Text;
    owner : Principal;
  };

  public type Settings = {
    maxLevel : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type CustomAbility = {
    name : Text;
    description : Text;
    abilityType : Text;
    uses : Nat;
    rechargeOn : Text;
    owner : Principal;
  };

  public type CharacterAbility = {
    characterId : CharacterId;
    name : Text;
    description : Text;
    abilityType : Text;
    uses : Nat;
    usesRemaining : Nat;
    rechargeOn : Text;
  };

  public type CustomPhysicalAttack = {
    name : Text;
    description : Text;
    damageDice : Text;
    attackBonus : Int;
    damageType : Text;
    range : Text;
    properties : Text;
    owner : Principal;
  };

  public type CharacterPhysicalAttack = {
    characterId : CharacterId;
    name : Text;
    description : Text;
    damageDice : Text;
    attackBonus : Int;
    damageType : Text;
    range : Text;
    properties : Text;
    timesUsed : Nat;
  };

  // --- New types ---

  public type HPState = {
    characterId : CharacterId;
    hpCurrent : Int;
    hpMax : Nat;
    hpTemp : Nat;
  };

  public type SpellSlotState = {
    characterId : CharacterId;
    spellLevel : Nat;
    used : Nat;
    total : Nat;
  };

  public type DeathSaveState = {
    characterId : CharacterId;
    successes : Nat;
    failures : Nat;
  };

  public type CurrencyState = {
    characterId : CharacterId;
    gold : Nat;
    silver : Nat;
    copper : Nat;
    platinum : Nat;
    electrum : Nat;
  };

  public type Language = {
    id : Nat;
    characterId : CharacterId;
    name : Text;
  };

  public type Ally = {
    id : Nat;
    characterId : CharacterId;
    name : Text;
    relationship : Text;
    notes : Text;
  };

  public type CharacterFeat = {
    id : Nat;
    characterId : CharacterId;
    name : Text;
    description : Text;
  };

  public type CustomSkill = {
    id : Nat;
    name : Text;
    statBased : Text;
    description : Text;
    owner : Principal;
  };

  public type CustomFeat = {
    id : Nat;
    name : Text;
    description : Text;
    prerequisites : Text;
    owner : Principal;
  };

  public type CharacterSkill = {
    id : Nat;
    characterId : CharacterId;
    skillName : Text;
    proficient : Bool;
    expertise : Bool;
  };

  public type TabNote = {
    id : Nat;
    characterId : CharacterId;
    tabName : Text;
    content : Text;
  };

  public type SaveThrowState = {
    characterId : CharacterId;
    strProf : Bool;
    dexProf : Bool;
    conProf : Bool;
    intProf : Bool;
    wisProf : Bool;
    chaProf : Bool;
  };

  public type CharacterProficiency = {
    id : Nat;
    characterId : CharacterId;
    profType : Text;
    name : Text;
  };

  public type ImportCharacterInput = {
    name : Text;
    race : Text;
    characterClass : Text;
    gender : Text;
    background : Text;
    alignment : Text;
    level : Nat;
    str : Nat;
    dex : Nat;
    con : Nat;
    int : Nat;
    wis : Nat;
    cha : Nat;
    hpMax : Nat;
    hpCurrent : Nat;
    ac : Nat;
    speed : Nat;
    initiative : Nat;
    proficiencyBonus : Nat;
    gold : Nat;
    notes : Text;
    spellSlots : [Nat];
    skills : Skills;
    portraitUrl : Text;
  };

  // ─── Army Types ──────────────────────────────────────────────────────────────

  public type ArmyAbility = {
    id : Text;
    name : Text;
    description : Text;
    cost : Text;
    effect : Text;
  };

  public type ArmyLoadout = {
    id : Text;
    name : Text;
    weaponType : Text;
    armorType : Text;
    notes : Text;
  };

  public type ArmyRank = {
    id : Text;
    name : Text;
    tier : Nat;
    description : Text;
    troopCount : Nat;
  };

  public type OfficerPromotion = {
    id : Text;
    fromRank : Text;
    toRank : Text;
    date : Text;
    notes : Text;
  };

  public type ArmyOfficer = {
    id : Text;
    name : Text;
    rankId : Text;
    race : Text;
    background : Text;
    skills : [Text];
    notes : Text;
    loyalty : Nat;
    combatAbility : Nat;
    leadership : Nat;
    promotionLog : [OfficerPromotion];
    factionId : ?Nat;
  };

  public type ArmyCommander = {
    id : Text;
    name : Text;
    rankId : Text;
    background : Text;
    commandSkills : [Text];
    signatureAbility : Text;
    historyNotes : Text;
    abilities : [ArmyAbility];
    factionId : ?Nat;
  };

  public type ArmyBranch = {
    id : Text;
    name : Text;
    headcount : Nat;
    trainingLevel : Text;
    condition : Text;
    abilities : [ArmyAbility];
    loadouts : [ArmyLoadout];
    specialties : [Text];
    officerIds : [Text];
    deploymentLocation : Text;
    interBranchNotes : Text;
    veteranFlag : Bool;
    machineryIds : [Text];
  };

  public type SpecOpsGroup = {
    id : Text;
    name : Text;
    missionType : Text;
    headcount : Nat;
    condition : Text;
    officerIds : [Text];
    abilities : [ArmyAbility];
    equipmentNotes : Text;
    notes : Text;
  };

  public type ArmyMachinery = {
    id : Text;
    name : Text;
    machineryType : Text;
    condition : Text;
    crewSize : Nat;
    damageEffect : Text;
    notes : Text;
  };

  public type SupplyLine = {
    id : Text;
    route : Text;
    vulnerabilities : Text;
    notes : Text;
  };

  public type CasualtyEntry = {
    id : Text;
    branchName : Text;
    troopLosses : Nat;
    woundedOfficers : Nat;
    date : Text;
    notes : Text;
  };

  public type ArmyLogistics = {
    food : Nat;
    ammunition : Nat;
    goldReserves : Nat;
    supplyLines : [SupplyLine];
    casualtiesLog : [CasualtyEntry];
    injuryNotes : Text;
  };

  public type ChainEntry = {
    id : Text;
    officerId : Text;
    reportsToId : Text;
    role : Text;
  };

  public type OrderEntry = {
    id : Text;
    target : Text;
    order : Text;
    date : Text;
  };

  public type ArmyCommandStructure = {
    chainOfCommand : [ChainEntry];
    ordersLog : [OrderEntry];
  };

  public type EnemyIntelEntry = {
    id : Text;
    enemyName : Text;
    knownStrength : Text;
    weaknesses : Text;
    notes : Text;
    date : Text;
  };

  public type ScoutReport = {
    id : Text;
    area : Text;
    findings : Text;
    date : Text;
  };

  public type ArmyIntelligence = {
    enemyIntelLog : [EnemyIntelEntry];
    scoutReports : [ScoutReport];
  };

  public type MoraleEvent = {
    id : Text;
    event : Text;
    impact : Text;
    date : Text;
  };

  public type LoyaltyEntry = {
    id : Text;
    entityName : Text;
    loyaltyScore : Nat;
    notes : Text;
  };

  public type ArmyMoraleData = {
    moraleEventsLog : [MoraleEvent];
    loyaltyTracker : [LoyaltyEntry];
  };

  public type AlliedArmy = {
    id : Text;
    name : Text;
    size : Nat;
    commander : Text;
    allegiance : Text;
    notes : Text;
  };

  public type CampaignLogEntry = {
    id : Text;
    entry : Text;
    date : Text;
  };

  public type BattlePlanEntry = {
    id : Text;
    objective : Text;
    notes : Text;
    date : Text;
  };

  public type ArmyNotes = {
    campaignLog : [CampaignLogEntry];
    battlePlannerNotes : [BattlePlanEntry];
    generalNotes : Text;
  };

  public type Army = {
    id : Text;
    characterId : CharacterId;
    commandingCharacterId : ?Text;
    owner : Principal;
    name : Text;
    size : Nat;
    moraleRating : Nat;
    powerLevel : Nat;
    status : Text;
    race : Text;
    specialties : [Text];
    faction : Text;
    banner : Text;
    trainingLevel : Text;
    condition : Text;
    foundingDate : Text;
    terrainNotes : Text;
    warChest : Nat;
    ranks : [ArmyRank];
    branches : [ArmyBranch];
    specOpsGroups : [SpecOpsGroup];
    machinery : [ArmyMachinery];
    officers : [ArmyOfficer];
    commanders : [ArmyCommander];
    armyAbilities : [ArmyAbility];
    officerAbilities : [ArmyAbility];
    commanderAbilities : [ArmyAbility];
    logistics : ArmyLogistics;
    commandStructure : ArmyCommandStructure;
    intelligence : ArmyIntelligence;
    moraleData : ArmyMoraleData;
    alliedArmies : [AlliedArmy];
    armyNotes : ArmyNotes;
  };

  public type ArmyInput = {
    characterId : CharacterId;
    commandingCharacterId : ?Text;
    name : Text;
    size : Nat;
    moraleRating : Nat;
    powerLevel : Nat;
    status : Text;
    race : Text;
    specialties : [Text];
    faction : Text;
    banner : Text;
    trainingLevel : Text;
    condition : Text;
    foundingDate : Text;
    terrainNotes : Text;
    warChest : Nat;
    ranks : [ArmyRank];
    branches : [ArmyBranch];
    specOpsGroups : [SpecOpsGroup];
    machinery : [ArmyMachinery];
    officers : [ArmyOfficer];
    commanders : [ArmyCommander];
    armyAbilities : [ArmyAbility];
    officerAbilities : [ArmyAbility];
    commanderAbilities : [ArmyAbility];
    logistics : ArmyLogistics;
    commandStructure : ArmyCommandStructure;
    intelligence : ArmyIntelligence;
    moraleData : ArmyMoraleData;
    alliedArmies : [AlliedArmy];
    armyNotes : ArmyNotes;
  };

  // ─── SRD Spell Types ─────────────────────────────────────────────────────

  public type SrdSpell = {
    name : Text;
    level : Nat;
    school : Text;
    castingTime : Text;
    range : Text;
    components : Text;
    duration : Text;
    damageEffect : Text;
    description : Text;
  };

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent variables
  var nextCharacterId = 1;
  var nextSpellId = 1;
  var nextTraitId = 1;
  var nextItemId = 1;
  var nextRaceId = 1;
  var nextClassId = 1;
  var nextCustomSpellId = 1;
  var nextCustomItemId = 1;
  var nextCustomAbilityId = 1;
  var nextCharacterAbilityId = 1;
  var nextCustomPhysicalAttackId = 1;
  var nextCharacterPhysicalAttackId = 1;
  let characters = Map.empty<CharacterId, Character>();
  let spells = Map.empty<SpellId, Spell>();
  let traits = Map.empty<TraitId, Trait>();
  let inventoryItems = Map.empty<InventoryItemId, InventoryItem>();
  let races = Map.empty<RaceId, CustomRace>();
  let classes = Map.empty<ClassId, CustomClass>();
  let customSpells = Map.empty<CustomSpellId, CustomSpell>();
  let customItems = Map.empty<CustomItemId, CustomItem>();
  var _settings : Settings = { maxLevel = 10000 };
  let userSettings = Map.empty<Principal, Settings>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let raceOwners = Map.empty<RaceId, Principal>();
  let classOwners = Map.empty<ClassId, Principal>();
  let customAbilities = Map.empty<CustomAbilityId, CustomAbility>();
  let characterAbilities = Map.empty<CharacterAbilityId, CharacterAbility>();
  let customPhysicalAttacks = Map.empty<CustomPhysicalAttackId, CustomPhysicalAttack>();
  let characterPhysicalAttacks = Map.empty<CharacterPhysicalAttackId, CharacterPhysicalAttack>();
  var nextCustomSpellSchoolId = 1;
  let customSpellSchools = Map.empty<CustomSpellSchoolId, CustomSpellSchool>();
  // New map for race-linked content (separate from races to avoid migration issues)
  let raceLinkedContent = Map.empty<RaceId, RaceLinkedContent>();

  // --- New storage for added features ---
  let hpStates = Map.empty<CharacterId, HPState>();
  // Spell slots stored as list per character
  let spellSlotStates = Map.empty<CharacterId, List.List<SpellSlotState>>();
  let deathSaveStates = Map.empty<CharacterId, DeathSaveState>();
  let currencyStates = Map.empty<CharacterId, CurrencyState>();
  let languages = Map.empty<Nat, Language>();
  let allies = Map.empty<Nat, Ally>();
  let characterFeats = Map.empty<Nat, CharacterFeat>();
  let customSkills = Map.empty<Nat, CustomSkill>();
  let customFeats = Map.empty<Nat, CustomFeat>();
  let characterSkills = Map.empty<Nat, CharacterSkill>();
  // Tab notes keyed by composite "characterId#tabName"
  let tabNotes = Map.empty<Text, TabNote>();
  let saveThrowStates = Map.empty<CharacterId, SaveThrowState>();
  let characterProficiencies = Map.empty<Nat, CharacterProficiency>();

  var nextLanguageId = 1;
  var nextAllyId = 1;
  var nextCharacterFeatId = 1;
  var nextCustomSkillId = 1;
  var nextCustomFeatId = 1;
  var nextCharacterSkillId = 1;
  var nextTabNoteId = 1;
  var nextCharacterProficiencyId = 1;

  // --- Army storage ---
  let armies = Map.empty<Text, Army>();
  var nextArmyId = 0;

  // ─── SRD Spell Storage ───────────────────────────────────────────────────
  let srdSpells = Map.empty<Nat, SrdSpell>();
  var srdSpellsInitialized = false;

  // ─── SRD Spell Functions ─────────────────────────────────────────────────

  // Returns the full list of SRD spells — no auth required (read-only public data)
  public query func getSrdSpells() : async [SrdSpell] {
    let result = List.empty<SrdSpell>();
    for ((_, s) in srdSpells.entries()) { result.add(s) };
    result.toArray();
  };

  // Idempotent initializer — populates the SRD spell list once and never again
  public shared ({ caller }) func initializeSrdSpells() : async Nat {
    requireAuth(caller);
    if (srdSpellsInitialized) { return srdSpells.size() };
    srdSpellsInitialized := true;
    var idx = 0;

    let spellData : [(Text, Nat, Text, Text, Text, Text, Text, Text, Text)] = [
      // (name, level, school, castingTime, range, components, duration, damageEffect, description)
      // ── Cantrips (level 0) ──
      ("Acid Splash", 0, "Conjuration", "1 action", "60 feet", "V, S", "Instantaneous", "1d6 acid", "You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage."),
      ("Blade Ward", 0, "Abjuration", "1 action", "Self", "V, S", "1 round", "—", "You extend your hand and trace a sigil of warding in the air. Until the end of your next turn, you have resistance against bludgeoning, piercing, and slashing damage dealt by weapon attacks."),
      ("Chill Touch", 0, "Necromancy", "1 action", "120 feet", "V, S", "1 round", "1d8 necrotic", "You create a ghostly, skeletal hand in the space of a creature within range. Make a ranged spell attack against the creature to assail it with the chill of the grave. On a hit, the target takes 1d8 necrotic damage, and it can't regain hit points until the start of your next turn."),
      ("Dancing Lights", 0, "Evocation", "1 action", "120 feet", "V, S, M (a bit of phosphorus or wychwood, or a glowworm)", "Concentration, up to 1 minute", "—", "You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration."),
      ("Druidcraft", 0, "Transmutation", "1 action", "30 feet", "V, S", "Instantaneous", "—", "Whispering to the spirits of nature, you create one of the following effects within range: a tiny, harmless sensory effect that predicts what the weather will be at your location for the next 24 hours; you cause a flower to bloom, a seed pod to open, or a leaf to bud; you create an instantaneous, harmless sensory effect, such as falling leaves, a puff of wind, the sound of a small animal; or you light or snuff out a candle, a torch, or a small campfire."),
      ("Eldritch Blast", 0, "Evocation", "1 action", "120 feet", "V, S", "Instantaneous", "1d10 force", "A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage."),
      ("Fire Bolt", 0, "Evocation", "1 action", "120 feet", "V, S", "Instantaneous", "1d10 fire", "You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn't being worn or carried."),
      ("Friends", 0, "Enchantment", "1 action", "Self", "S, M (a small amount of makeup)", "Concentration, up to 1 minute", "—", "For the duration, you have advantage on all Charisma checks directed at one creature of your choice that isn't hostile toward you."),
      ("Guidance", 0, "Divination", "1 action", "Touch", "V, S", "Concentration, up to 1 minute", "—", "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice."),
      ("Light", 0, "Evocation", "1 action", "Touch", "V, M (a firefly or phosphorescent moss)", "1 hour", "—", "You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet."),
      ("Mage Hand", 0, "Conjuration", "1 action", "30 feet", "V, S", "1 minute", "—", "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action."),
      ("Mending", 0, "Transmutation", "1 minute", "Touch", "V, S, M (two lodestones)", "Instantaneous", "—", "This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin."),
      ("Message", 0, "Transmutation", "1 action", "120 feet", "V, S, M (a short piece of copper wire)", "1 round", "—", "You point your finger toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear."),
      ("Minor Illusion", 0, "Illusion", "1 action", "30 feet", "S, M (a bit of fleece)", "1 minute", "—", "You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it as an action or cast this spell again."),
      ("Poison Spray", 0, "Conjuration", "1 action", "10 feet", "V, S", "Instantaneous", "1d12 poison", "You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm. The creature must succeed on a Constitution saving throw or take 1d12 poison damage."),
      ("Prestidigitation", 0, "Transmutation", "1 action", "10 feet", "V, S", "Up to 1 hour", "—", "This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects within range: an instantaneous, harmless sensory effect; light or snuff out a candle, torch, or small campfire; clean or soil an object no larger than 1 cubic foot; chill, warm, or flavor up to 1 cubic foot of nonliving material; make a color, small mark, or symbol appear on an object; or create a nonmagical trinket or illusory image."),
      ("Produce Flame", 0, "Conjuration", "1 action", "Self", "V, S", "10 minutes", "1d8 fire", "A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment. You can use your action to hurl the flame at a creature or object within 30 feet of you."),
      ("Ray of Frost", 0, "Evocation", "1 action", "60 feet", "V, S", "Instantaneous", "1d8 cold", "A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn."),
      ("Resistance", 0, "Abjuration", "1 action", "Touch", "V, S, M (a miniature cloak)", "Concentration, up to 1 minute", "—", "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice."),
      ("Sacred Flame", 0, "Evocation", "1 action", "60 feet", "V, S", "Instantaneous", "1d8 radiant", "Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage."),
      ("Shillelagh", 0, "Transmutation", "1 bonus action", "Self", "V, S, M (mistletoe, a shamrock leaf, and a club or quarterstaff)", "1 minute", "1d8 bludgeoning", "The wood of a club or quarterstaff you are holding is imbued with nature's power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon."),
      ("Shocking Grasp", 0, "Evocation", "1 action", "Touch", "V, S", "Instantaneous", "1d8 lightning", "Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. You have advantage on the attack roll if the target is wearing armor made of metal."),
      ("Spare the Dying", 0, "Necromancy", "1 action", "Touch", "V, S", "Instantaneous", "—", "You touch a living creature that has 0 hit points. The creature becomes stable."),
      ("Thaumaturgy", 0, "Transmutation", "1 action", "30 feet", "V", "Up to 1 minute", "—", "You manifest a minor wonder, a sign of supernatural power, within range."),
      ("Thunderclap", 0, "Evocation", "1 action", "5 feet", "S", "Instantaneous", "1d6 thunder", "You create a burst of thunderous sound that can be heard up to 100 feet away. Each creature within range, other than you, must make a Constitution saving throw or take 1d6 thunder damage."),
      ("True Strike", 0, "Divination", "1 action", "30 feet", "S", "Concentration, up to 1 round", "—", "You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target's defenses. On your next turn, you gain advantage on your first attack roll against the target."),
      ("Vicious Mockery", 0, "Enchantment", "1 action", "60 feet", "V", "Instantaneous", "1d4 psychic", "You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you, it must succeed on a Wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn."),
      // ── 1st Level ──
      ("Alarm", 1, "Abjuration", "1 minute", "30 feet", "V, S, M (a tiny bell and a piece of fine silver wire)", "8 hours", "—", "You set an alarm against unwanted intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot cube. Until the spell ends, an alarm alerts you whenever a Tiny or larger creature touches or enters the warded area."),
      ("Animal Friendship", 1, "Enchantment", "1 action", "30 feet", "V, S, M (a morsel of food)", "24 hours", "—", "This spell lets you convince a beast that you mean it no harm. Choose a beast that you can see within range. You must make a Charisma (Animal Handling) check contested by the beast's Wisdom (Insight) check."),
      ("Bane", 1, "Enchantment", "1 action", "30 feet", "V, S, M (a drop of blood)", "Concentration, up to 1 minute", "—", "Up to three creatures of your choice that you can see within range must make Charisma saving throws. Whenever a target that fails this saving throw makes an attack roll or a saving throw before the spell ends, the target must roll a d4 and subtract the number rolled from the attack roll or saving throw."),
      ("Bless", 1, "Enchantment", "1 action", "30 feet", "V, S, M (a sprinkling of holy water)", "Concentration, up to 1 minute", "—", "You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw."),
      ("Burning Hands", 1, "Evocation", "1 action", "Self (15-foot cone)", "V, S", "Instantaneous", "3d6 fire", "As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much on a successful one."),
      ("Charm Person", 1, "Enchantment", "1 action", "30 feet", "V, S", "1 hour", "—", "You attempt to charm a humanoid you can see within range. It must make a Wisdom saving throw, and does so with advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the spell ends or until you or your companions do anything harmful to it."),
      ("Color Spray", 1, "Illusion", "1 action", "Self (15-foot cone)", "V, S, M (a pinch of powder or sand colored red, yellow, and blue)", "1 round", "—", "A dazzling array of flashing, colored light springs from your hand. Roll 6d10; the total is how many hit points of creatures this spell can effect."),
      ("Command", 1, "Enchantment", "1 action", "60 feet", "V", "1 round", "—", "You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn."),
      ("Comprehend Languages", 1, "Divination", "1 action", "Self", "V, S, M (a pinch of soot and salt)", "1 hour", "—", "For the duration, you understand the literal meaning of any spoken language that you hear. You also understand any written language that you see, but you must be touching the surface on which the words are written."),
      ("Create or Destroy Water", 1, "Transmutation", "1 action", "30 feet", "V, S, M (a drop of water if creating water or a few grains of sand if destroying it)", "Instantaneous", "—", "You either create or destroy water. Create Water: You create up to 10 gallons of clean water within range in an open container. Destroy Water: You destroy up to 10 gallons of water in an open container within range."),
      ("Cure Wounds", 1, "Evocation", "1 action", "Touch", "V, S", "Instantaneous", "1d8 + modifier healing", "A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier."),
      ("Detect Magic", 1, "Divination", "1 action", "Self", "V, S", "Concentration, up to 10 minutes", "—", "For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic."),
      ("Detect Poison and Disease", 1, "Divination", "1 action", "Self", "V, S, M (a yew leaf)", "Concentration, up to 10 minutes", "—", "For the duration, you can sense the presence and location of poisons, poisonous creatures, and diseases within 30 feet of you."),
      ("Disguise Self", 1, "Illusion", "1 action", "Self", "V, S", "1 hour", "—", "You make yourself—including your clothing, armor, weapons, and other belongings on your person—look different until the spell ends or until you use your action to dismiss it."),
      ("Dissonant Whispers", 1, "Enchantment", "1 action", "60 feet", "V", "Instantaneous", "3d6 psychic", "You whisper a discordant melody that only one creature of your choice within range can hear, wracking it with terrible pain. The target must make a Wisdom saving throw. On a failed save, it takes 3d6 psychic damage and must immediately use its reaction, if available, to move as far as its speed allows away from you."),
      ("Divine Favor", 1, "Evocation", "1 bonus action", "Self", "V, S", "Concentration, up to 1 minute", "1d4 radiant", "Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit."),
      ("Entangle", 1, "Conjuration", "1 action", "90 feet", "V, S", "Concentration, up to 1 minute", "—", "Grasping weeds and vines sprout from the ground in a 20-foot square starting from a point within range. For the duration, these plants turn the ground in the area into difficult terrain."),
      ("Expeditious Retreat", 1, "Transmutation", "1 bonus action", "Self", "V, S", "Concentration, up to 10 minutes", "—", "This spell allows you to move at an incredible pace. When you cast this spell, and then as a bonus action on each of your turns until the spell ends, you can take the Dash action."),
      ("Faerie Fire", 1, "Evocation", "1 action", "60 feet", "V", "Concentration, up to 1 minute", "—", "Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw."),
      ("False Life", 1, "Necromancy", "1 action", "Self", "V, S, M (a small amount of alcohol or distilled spirits)", "1 hour", "1d4+4 temporary HP", "Bolstering yourself with a necromantic facsimile of life, you gain 1d4 + 4 temporary hit points for the duration."),
      ("Fear", 1, "Illusion", "1 action", "Self (30-foot cone)", "V, S, M (a white feather or the heart of a hen)", "Concentration, up to 1 minute", "—", "You project a phantasmal image of a creature's worst fears. Each creature in a 30-foot cone must succeed on a Wisdom saving throw or drop whatever it is holding and become frightened for the duration."),
      ("Feather Fall", 1, "Transmutation", "1 reaction", "60 feet", "V, M (a small feather or piece of down)", "1 minute", "—", "Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends."),
      ("Find Familiar", 1, "Conjuration", "1 hour", "10 feet", "V, S, M (10 gp worth of charcoal, incense, and herbs)", "Instantaneous", "—", "You gain the service of a familiar, a spirit that takes an animal form you choose: bat, cat, crab, frog (toad), hawk, lizard, octopus, owl, poisonous snake, fish (quipper), rat, raven, sea horse, spider, or weasel."),
      ("Fog Cloud", 1, "Conjuration", "1 action", "120 feet", "V, S", "Concentration, up to 1 hour", "—", "You create a 20-foot-radius sphere of fog centered on a point within range. The sphere spreads around corners, and its area is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10 miles per hour) disperses it."),
      ("Goodberry", 1, "Transmutation", "1 action", "Touch", "V, S, M (a sprig of mistletoe)", "Instantaneous", "1 HP per berry", "Up to ten berries appear in your hand and are infused with magic for the duration. A creature can use its action to eat one berry. Eating a berry restores 1 hit point, and the berry provides enough nourishment to sustain a creature for one day."),
      ("Grease", 1, "Conjuration", "1 action", "60 feet", "V, S, M (a bit of pork rind or butter)", "1 minute", "—", "Slick grease covers the ground in a 10-foot square centered on a point within range and turns it into difficult terrain for the duration."),
      ("Guiding Bolt", 1, "Evocation", "1 action", "120 feet", "V, S", "1 round", "4d6 radiant", "A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage."),
      ("Healing Word", 1, "Evocation", "1 bonus action", "60 feet", "V", "Instantaneous", "1d4 + modifier healing", "A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier."),
      ("Hellish Rebuke", 1, "Evocation", "1 reaction", "60 feet", "V, S", "Instantaneous", "2d10 fire", "You point your finger, and the creature that damaged you is momentarily surrounded by hellish flames. The creature must make a Dexterity saving throw. It takes 2d10 fire damage on a failed save, or half as much damage on a successful one."),
      ("Heroism", 1, "Enchantment", "1 action", "Touch", "V, S", "Concentration, up to 1 minute", "—", "A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to being frightened and gains temporary hit points equal to your spellcasting ability modifier at the start of each of its turns."),
      ("Hex", 1, "Enchantment", "1 bonus action", "90 feet", "V, S, M (the petrified eye of a newt)", "Concentration, up to 1 hour", "1d6 necrotic", "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 necrotic damage to the target whenever you hit it with an attack."),
      ("Hunter's Mark", 1, "Divination", "1 bonus action", "90 feet", "V", "Concentration, up to 1 hour", "1d6 extra", "You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack."),
      ("Identify", 1, "Divination", "1 minute", "Touch", "V, S, M (a pearl worth at least 100 gp and an owl feather)", "Instantaneous", "—", "You choose one object that you must touch throughout the casting of the spell. If it is a magic item or some other magic-imbued object, you learn its properties and how to use them."),
      ("Inflict Wounds", 1, "Necromancy", "1 action", "Touch", "V, S", "Instantaneous", "3d10 necrotic", "Make a melee spell attack against a creature you can reach. On a hit, the target takes 3d10 necrotic damage."),
      ("Jump", 1, "Transmutation", "1 action", "Touch", "V, S, M (a grasshopper's hind leg)", "1 minute", "—", "You touch a creature. The creature's jump distance is tripled until the spell ends."),
      ("Longstrider", 1, "Transmutation", "1 action", "Touch", "V, S, M (a pinch of dirt)", "1 hour", "—", "You touch a creature. The target's speed increases by 10 feet until the spell ends."),
      ("Mage Armor", 1, "Abjuration", "1 action", "Touch", "V, S, M (a piece of cured leather)", "8 hours", "—", "You touch a willing creature who isn't wearing armor, and a protective magical force surrounds it until the spell ends. The target's base AC becomes 13 + its Dexterity modifier."),
      ("Magic Missile", 1, "Evocation", "1 action", "120 feet", "V, S", "Instantaneous", "1d4+1 force x3", "You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range."),
      ("Protection from Evil and Good", 1, "Abjuration", "1 action", "Touch", "V, S, M (holy water or powdered silver and iron)", "Concentration, up to 10 minutes", "—", "Until the spell ends, one willing creature you touch is protected against certain types of creatures: aberrations, celestials, elementals, fey, fiends, and undead."),
      ("Ray of Sickness", 1, "Necromancy", "1 action", "60 feet", "V, S", "Instantaneous", "2d8 poison", "A ray of sickening greenish energy lashes out toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 poison damage and must make a Constitution saving throw."),
      ("Sanctuary", 1, "Abjuration", "1 bonus action", "30 feet", "V, S, M (a small silver mirror)", "1 minute", "—", "You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw."),
      ("Shield", 1, "Abjuration", "1 reaction", "Self", "V, S", "1 round", "+5 AC", "An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC."),
      ("Shield of Faith", 1, "Abjuration", "1 bonus action", "60 feet", "V, S, M (a small parchment with a bit of holy text written on it)", "Concentration, up to 10 minutes", "+2 AC", "A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration."),
      ("Silent Image", 1, "Illusion", "1 action", "60 feet", "V, S, M (a bit of fleece)", "Concentration, up to 10 minutes", "—", "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot cube."),
      ("Sleep", 1, "Enchantment", "1 action", "90 feet", "V, S, M (a pinch of fine sand, rose petals, or a cricket)", "1 minute", "—", "This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect."),
      ("Speak with Animals", 1, "Divination", "1 action", "Self", "V, S", "10 minutes", "—", "You gain the ability to comprehend and verbally communicate with beasts for the duration."),
      ("Tasha's Hideous Laughter", 1, "Enchantment", "1 action", "30 feet", "V, S, M (tiny tarts and a feather)", "Concentration, up to 1 minute", "—", "A creature of your choice that you can see within range perceives everything as hilariously funny and falls into fits of laughter if this spell affects it."),
      ("Thunderwave", 1, "Evocation", "1 action", "Self (15-foot cube)", "V, S", "Instantaneous", "2d8 thunder", "A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw."),
      ("Unseen Servant", 1, "Conjuration", "1 action", "60 feet", "V, S, M (a piece of string and a bit of wood)", "1 hour", "—", "This spell creates an invisible, mindless, shapeless, Medium force that performs simple tasks at your command until the spell ends."),
      ("Witch Bolt", 1, "Evocation", "1 action", "30 feet", "V, S, M (a twig from a tree that has been struck by lightning)", "Concentration, up to 1 minute", "1d12 lightning", "A beam of crackling, blue energy lances out toward a creature within range, forming a sustained arc of lightning between you and the target."),
      ("Wrathful Smite", 1, "Evocation", "1 bonus action", "Self", "V", "Concentration, up to 1 minute", "1d6 psychic", "The next time you hit with a melee weapon attack during this spell's duration, your attack deals an extra 1d6 psychic damage."),
      // ── 2nd Level ──
      ("Acid Arrow", 2, "Evocation", "1 action", "90 feet", "V, S, M (powdered rhubarb leaf and an adder's stomach)", "Instantaneous", "4d4 acid + 2d4 acid", "A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 acid damage immediately and 2d4 acid damage at the end of its next turn."),
      ("Aid", 2, "Abjuration", "1 action", "30 feet", "V, S, M (a tiny strip of white cloth)", "8 hours", "+5 HP max", "Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target's hit point maximum and current hit points increase by 5 for the duration."),
      ("Alter Self", 2, "Transmutation", "1 action", "Self", "V, S", "Concentration, up to 1 hour", "—", "You assume a different form. When you cast the spell, choose one of the following options, the effects of which last for the duration of the spell."),
      ("Arcane Lock", 2, "Abjuration", "1 action", "Touch", "V, S, M (gold dust worth at least 25 gp)", "Until dispelled", "—", "You touch a closed door, window, gate, chest, or other entryway, and it becomes locked for the duration."),
      ("Augury", 2, "Divination", "1 minute", "Self", "V, S, M (specially marked sticks, bones, or similar tokens)", "Instantaneous", "—", "By casting gem-inlaid sticks, rolling dragon bones, laying out ornate cards, or employing some other divining tool, you receive an omen from an otherworldly entity about the results of a specific course of action."),
      ("Barkskin", 2, "Transmutation", "1 action", "Touch", "V, S, M (a handful of oak bark)", "Concentration, up to 1 hour", "—", "You touch a willing creature. Until the spell ends, the target's skin has a rough, bark-like appearance, and the target's AC can't be less than 16."),
      ("Blindness/Deafness", 2, "Necromancy", "1 action", "30 feet", "V", "1 minute", "—", "You can blind or deafen a foe. Choose one creature that you can see within range to make a Constitution saving throw. If it fails, the target is either blinded or deafened (your choice) for the duration."),
      ("Blur", 2, "Illusion", "1 action", "Self", "V", "Concentration, up to 1 minute", "—", "Your body becomes blurred, shifting and wavering to all who can see you. For the duration, any creature has disadvantage on attack rolls against you."),
      ("Calm Emotions", 2, "Enchantment", "1 action", "60 feet", "V, S", "Concentration, up to 1 minute", "—", "You attempt to suppress strong emotions in a group of people. Each humanoid in a 20-foot-radius sphere centered on a point you choose within range must make a Charisma saving throw."),
      ("Continual Flame", 2, "Evocation", "1 action", "Touch", "V, S, M (ruby dust worth 50 gp)", "Until dispelled", "—", "A flame, equivalent in brightness to a torch, springs forth from an object that you touch. The effect looks like a regular flame, but it creates no heat and doesn't use oxygen."),
      ("Crown of Madness", 2, "Enchantment", "1 action", "120 feet", "V, S", "Concentration, up to 1 minute", "—", "One humanoid of your choice that you can see within range must succeed on a Wisdom saving throw or become charmed by you for the duration."),
      ("Darkness", 2, "Evocation", "1 action", "60 feet", "V, M (bat fur and a drop of pitch or piece of coal)", "Concentration, up to 10 minutes", "—", "Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere for the duration."),
      ("Darkvision", 2, "Transmutation", "1 action", "Touch", "V, S, M (either a pinch of dried carrot or an agate)", "8 hours", "—", "You touch a willing creature to grant it the ability to see in the dark. For the duration, that creature has darkvision out to a range of 60 feet."),
      ("Detect Thoughts", 2, "Divination", "1 action", "Self", "V, S, M (a copper piece)", "Concentration, up to 1 minute", "—", "For the duration, you can read the thoughts of certain creatures. When you cast the spell and as your action on each turn until the spell ends, you can focus your mind on any one creature that you can see within 30 feet of you."),
      ("Enhance Ability", 2, "Transmutation", "1 action", "Touch", "V, S, M (fur or a feather from a beast)", "Concentration, up to 1 hour", "—", "You touch a creature and bestow upon it a magical enhancement. Choose one of the following effects; the target gains that effect until the spell ends."),
      ("Enlarge/Reduce", 2, "Transmutation", "1 action", "30 feet", "V, S, M (a pinch of powdered iron)", "Concentration, up to 1 minute", "—", "You cause a creature or an object you can see within range to grow larger or smaller for the duration."),
      ("Enthrall", 2, "Enchantment", "1 action", "60 feet", "V, S", "1 minute", "—", "You weave a distracting string of words, causing creatures of your choice that you can see within range and that can hear you to make a Wisdom saving throw."),
      ("Find Steed", 2, "Conjuration", "10 minutes", "30 feet", "V, S", "Instantaneous", "—", "You summon a spirit that assumes the form of an unusually intelligent, strong, and loyal steed, creating a long-lasting bond with it."),
      ("Flame Blade", 2, "Evocation", "1 bonus action", "Self", "V, S, M (leaf of sumac)", "Concentration, up to 10 minutes", "3d6 fire", "You evoke a fiery blade in your free hand. The blade is similar in size and shape to a scimitar, and it lasts for the duration. If you let go of the blade, it disappears, but you can evoke the blade again as a bonus action."),
      ("Flaming Sphere", 2, "Conjuration", "1 action", "60 feet", "V, S, M (a bit of tallow, a pinch of brimstone, and a dusting of powdered iron)", "Concentration, up to 1 minute", "2d6 fire", "A 5-foot-diameter sphere of fire appears in an unoccupied space of your choice within range and lasts for the duration."),
      ("Gentle Repose", 2, "Necromancy", "1 action", "Touch", "V, S, M (a pinch of salt and one copper piece)", "10 days", "—", "You touch a corpse or other remains. For the duration, the target is protected from decay and can't become undead."),
      ("Gust of Wind", 2, "Evocation", "1 action", "Self (60-foot line)", "V, S, M (a legume seed)", "Concentration, up to 1 minute", "—", "A line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the spell's duration."),
      ("Heat Metal", 2, "Transmutation", "1 action", "60 feet", "V, S, M (a piece of iron and a flame)", "Concentration, up to 1 minute", "2d8 fire", "Choose a manufactured metal object, such as a metal weapon or a suit of heavy or medium metal armor, that you can see within range."),
      ("Hold Person", 2, "Enchantment", "1 action", "60 feet", "V, S, M (a small, straight piece of iron)", "Concentration, up to 1 minute", "—", "Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration."),
      ("Invisibility", 2, "Illusion", "1 action", "Touch", "V, S, M (an eyelash encased in gum arabic)", "Concentration, up to 1 hour", "—", "A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target's person."),
      ("Knock", 2, "Transmutation", "1 action", "60 feet", "V", "Instantaneous", "—", "Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access."),
      ("Lesser Restoration", 2, "Abjuration", "1 action", "Touch", "V, S", "Instantaneous", "—", "You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned."),
      ("Levitate", 2, "Transmutation", "1 action", "60 feet", "V, S, M (either a small leather loop or a piece of golden wire bent into a cup shape)", "Concentration, up to 10 minutes", "—", "One creature or object of your choice that you can see within range rises vertically, up to 20 feet, and remains suspended there for the duration."),
      ("Locate Animals or Plants", 2, "Divination", "1 action", "Self", "V, S, M (a bit of fur from a bloodhound)", "Instantaneous", "—", "Describe or name a specific kind of beast or plant. Concentrating on the voice of nature in your surroundings, you learn the direction and distance to the closest creature or plant of that kind within 5 miles."),
      ("Locate Object", 2, "Divination", "1 action", "Self", "V, S, M (a forked twig)", "Concentration, up to 10 minutes", "—", "Describe or name an object that is familiar to you. You sense the direction to the object's location, as long as that object is within 1,000 feet of you."),
      ("Magic Mouth", 2, "Illusion", "1 minute", "30 feet", "V, S, M (a small bit of honeycomb and jade dust worth at least 10 gp)", "Until dispelled", "—", "You implant a message within an object in range, a message that is uttered when a trigger condition is met."),
      ("Magic Weapon", 2, "Transmutation", "1 bonus action", "Touch", "V, S", "Concentration, up to 1 hour", "+1 attack and damage", "You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls."),
      ("Mirror Image", 2, "Illusion", "1 action", "Self", "V, S", "1 minute", "—", "Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it's impossible to track which image is real."),
      ("Misty Step", 2, "Conjuration", "1 bonus action", "Self", "V", "Instantaneous", "—", "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see."),
      ("Moonbeam", 2, "Evocation", "1 action", "120 feet", "V, S, M (several seeds of any moonseed plant and a piece of opalescent feldspar)", "Concentration, up to 1 minute", "2d10 radiant", "A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high cylinder centered on a point within range."),
      ("Phantasmal Force", 2, "Illusion", "1 action", "60 feet", "V, S, M (a bit of fleece)", "Concentration, up to 1 minute", "1d6 psychic", "You craft an illusion that takes root in the mind of a creature that you can see within range. The target must make an Intelligence saving throw."),
      ("Prayer of Healing", 2, "Evocation", "10 minutes", "30 feet", "V", "Instantaneous", "2d8 + modifier healing", "Up to six creatures of your choice that you can see within range each regain hit points equal to 2d8 + your spellcasting ability modifier."),
      ("Protection from Poison", 2, "Abjuration", "1 action", "Touch", "V, S", "1 hour", "—", "You touch a creature. If it is poisoned, you neutralize the poison. If more than one poison afflicts the target, you neutralize one poison that you know is present."),
      ("Ray of Enfeeblement", 2, "Necromancy", "1 action", "60 feet", "V, S", "Concentration, up to 1 minute", "—", "A black beam of enervating energy springs from your finger toward a creature within range. Make a ranged spell attack against the target. On a hit, the target deals only half damage with weapon attacks that use Strength until the spell ends."),
      ("Rope Trick", 2, "Transmutation", "1 action", "Touch", "V, S, M (powdered corn extract and a twisted loop of parchment)", "1 hour", "—", "You touch a length of rope that is up to 60 feet long. One end of the rope then rises into the air until the whole rope hangs perpendicular to the ground."),
      ("Scorching Ray", 2, "Evocation", "1 action", "120 feet", "V, S", "Instantaneous", "2d6 fire x3", "You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several. Make a ranged spell attack for each ray."),
      ("See Invisibility", 2, "Divination", "1 action", "Self", "V, S, M (a pinch of talc and a small sprinkling of powdered silver)", "1 hour", "—", "For the duration, you see invisible creatures and objects as if they were visible, and you can see into the Ethereal Plane, out to a range of 60 feet."),
      ("Shatter", 2, "Evocation", "1 action", "60 feet", "V, S, M (a chip of mica)", "Instantaneous", "3d8 thunder", "A sudden loud ringing noise, painfully intense, erupts from a point of your choice within range. Each creature in a 10-foot-radius sphere centered on that point must make a Constitution saving throw."),
      ("Silence", 2, "Illusion", "1 action", "120 feet", "V, S", "Concentration, up to 10 minutes", "—", "For the duration, no sound can be created within or pass through a 20-foot-radius sphere centered on a point you choose within range."),
      ("Spider Climb", 2, "Transmutation", "1 action", "Touch", "V, S, M (a drop of bitumen and a spider)", "Concentration, up to 1 hour", "—", "Until the spell ends, one willing creature you touch gains the ability to move up, down, and across vertical surfaces and upside down along ceilings, while leaving its hands free."),
      ("Spike Growth", 2, "Transmutation", "1 action", "150 feet", "V, S, M (seven sharp thorns or seven small twigs, each sharpened to a point)", "Concentration, up to 10 minutes", "2d4 piercing", "The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns."),
      ("Spiritual Weapon", 2, "Evocation", "1 bonus action", "60 feet", "V, S", "1 minute", "1d8 + modifier force", "You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again."),
      ("Suggestion", 2, "Enchantment", "1 action", "30 feet", "V, M (a snake's tongue and either a bit of honeycomb or a drop of sweet oil)", "Concentration, up to 8 hours", "—", "You suggest a course of activity (limited to a sentence or two) and magically influence a creature you can see within range that can hear and understand you."),
      ("Web", 2, "Conjuration", "1 action", "60 feet", "V, S, M (a bit of spiderweb)", "Concentration, up to 1 hour", "—", "You conjure a mass of thick, sticky webbing at a point of your choice within range. The webs fill a 20-foot cube from that point for the duration."),
      ("Zone of Truth", 2, "Enchantment", "1 action", "60 feet", "V, S", "10 minutes", "—", "You create a magical zone that guards against deception in a 15-foot-radius sphere centered on a point of your choice within range."),
      // ── 3rd Level ──
      ("Animate Dead", 3, "Necromancy", "1 minute", "10 feet", "V, S, M (a drop of blood, a piece of flesh, and a pinch of bone dust)", "Instantaneous", "—", "This spell creates an undead servant. Choose a pile of bones or a corpse of a Medium or Small humanoid within range. Your spell imbues the target with a foul mimicry of life, raising it as an undead creature."),
      ("Bestow Curse", 3, "Necromancy", "1 action", "Touch", "V, S", "Concentration, up to 1 minute", "—", "You touch a creature, and that creature must succeed on a Wisdom saving throw or become cursed for the duration of the spell."),
      ("Blink", 3, "Transmutation", "1 action", "Self", "V, S", "1 minute", "—", "Roll a d20 at the end of each of your turns for the duration of the spell. On a roll of 11 or higher, you vanish from your current plane of existence and appear in the Ethereal Plane."),
      ("Call Lightning", 3, "Conjuration", "1 action", "120 feet", "V, S", "Concentration, up to 10 minutes", "3d10 lightning", "A storm cloud appears in the shape of a cylinder that is 10 feet tall with a 60-foot radius, centered on a point you can see above you within range."),
      ("Clairvoyance", 3, "Divination", "10 minutes", "1 mile", "V, S, M (a focus worth at least 100 gp, either a jeweled horn for hearing or a glass eye for seeing)", "Concentration, up to 10 minutes", "—", "You create an invisible sensor within range in a location familiar to you."),
      ("Conjure Animals", 3, "Conjuration", "1 action", "60 feet", "V, S", "Concentration, up to 1 hour", "—", "You summon fey spirits that take the form of beasts and appear in unoccupied spaces that you can see within range."),
      ("Counterspell", 3, "Abjuration", "1 reaction", "60 feet", "S", "Instantaneous", "—", "You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect."),
      ("Create Food and Water", 3, "Conjuration", "1 action", "30 feet", "V, S", "Instantaneous", "—", "You create 45 pounds of food and 30 gallons of water on the ground or in containers within range, enough to sustain up to fifteen humanoids or five steeds for 24 hours."),
      ("Daylight", 3, "Evocation", "1 action", "60 feet", "V, S", "1 hour", "—", "A 60-foot-radius sphere of light spreads out from a point you choose within range. The sphere is bright light and sheds dim light for an additional 60 feet."),
      ("Dispel Magic", 3, "Abjuration", "1 action", "120 feet", "V, S", "Instantaneous", "—", "Choose any creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends."),
      ("Elemental Weapon", 3, "Transmutation", "1 action", "Touch", "V, S", "Concentration, up to 1 hour", "1d4 elemental", "A nonmagical weapon you touch becomes a magic weapon. Choose one of the following damage types: acid, cold, fire, lightning, or thunder."),
      ("Fear", 3, "Illusion", "1 action", "Self (30-foot cone)", "V, S, M (a white feather or the heart of a hen)", "Concentration, up to 1 minute", "—", "You project a phantasmal image of a creature's worst fears. Each creature in a 30-foot cone must succeed on a Wisdom saving throw or drop whatever it is holding and become frightened."),
      ("Feign Death", 3, "Necromancy", "1 action", "Touch", "V, S, M (a pinch of graveyard dirt)", "1 hour", "—", "You touch a willing creature and put it into a cataleptic state that is indistinguishable from death."),
      ("Fireball", 3, "Evocation", "1 action", "150 feet", "V, S, M (a tiny ball of bat guano and sulfur)", "Instantaneous", "8d6 fire", "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw."),
      ("Fly", 3, "Transmutation", "1 action", "Touch", "V, S, M (a wing feather from any bird)", "Concentration, up to 10 minutes", "—", "You touch a willing creature. The target gains a flying speed of 60 feet for the duration."),
      ("Gaseous Form", 3, "Transmutation", "1 action", "Touch", "V, S, M (a bit of gauze and a wisp of smoke)", "Concentration, up to 1 hour", "—", "You transform a willing creature you touch, along with everything it's wearing and carrying, into a misty cloud for the duration."),
      ("Glyph of Warding", 3, "Abjuration", "1 hour", "Touch", "V, S, M (incense and powdered diamond worth at least 200 gp)", "Until dispelled or triggered", "5d8 variable", "When you cast this spell, you inscribe a glyph that harms other creatures, either upon a surface (such as a table or a section of floor or wall) or within an object that can be closed."),
      ("Haste", 3, "Transmutation", "1 action", "30 feet", "V, S, M (a shaving of licorice root)", "Concentration, up to 1 minute", "—", "Choose a willing creature that you can see within range. Until the spell ends, the target's speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns."),
      ("Hypnotic Pattern", 3, "Illusion", "1 action", "120 feet", "S, M (a glowing stick of incense or a crystal vial filled with phosphorescent material)", "Concentration, up to 1 minute", "—", "You create a twisting pattern of colors that weaves through the air inside a 30-foot cube within range."),
      ("Lightning Bolt", 3, "Evocation", "1 action", "Self (100-foot line)", "V, S, M (a bit of fur and a rod of amber, crystal, or glass)", "Instantaneous", "8d6 lightning", "A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose."),
      ("Magic Circle", 3, "Abjuration", "1 minute", "10 feet", "V, S, M (holy water or powdered silver and iron worth at least 100 gp)", "1 hour", "—", "You create a 10-foot-radius, 20-foot-tall cylinder of magical energy centered on a point on the ground that you can see within range."),
      ("Major Image", 3, "Illusion", "1 action", "120 feet", "V, S, M (a bit of fleece)", "Concentration, up to 10 minutes", "—", "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot cube."),
      ("Mass Healing Word", 3, "Evocation", "1 bonus action", "60 feet", "V", "Instantaneous", "1d4 + modifier healing", "As you call out words of restoration, up to six creatures of your choice that you can see within range regain hit points equal to 1d4 + your spellcasting ability modifier."),
      ("Meld into Stone", 3, "Transmutation", "1 action", "Touch", "V, S", "8 hours", "—", "You step into a stone object or surface large enough to fully contain your body, melding yourself and all the equipment you carry with the stone for the duration."),
      ("Nondetection", 3, "Abjuration", "1 action", "Touch", "V, S, M (a pinch of diamond dust worth 25 gp sprinkled over the target)", "8 hours", "—", "For the duration, you hide a target that you touch from divination magic."),
      ("Plant Growth", 3, "Transmutation", "1 action or 8 hours", "150 feet", "V, S", "Instantaneous", "—", "This spell channels vitality into plants within a specific area."),
      ("Protection from Energy", 3, "Abjuration", "1 action", "Touch", "V, S", "Concentration, up to 1 hour", "—", "For the duration, the willing creature you touch has resistance to one damage type of your choice: acid, cold, fire, lightning, or thunder."),
      ("Remove Curse", 3, "Abjuration", "1 action", "Touch", "V, S", "Instantaneous", "—", "At your touch, all curses affecting one creature or object end."),
      ("Revivify", 3, "Necromancy", "1 action", "Touch", "V, S, M (diamonds worth 300 gp)", "Instantaneous", "—", "You touch a creature that has died within the last minute. That creature returns to life with 1 hit point."),
      ("Sending", 3, "Evocation", "1 action", "Unlimited", "V, S, M (a short piece of fine copper wire)", "1 round", "—", "You send a short message of twenty-five words or fewer to a creature with which you are familiar."),
      ("Sleet Storm", 3, "Conjuration", "1 action", "150 feet", "V, S, M (a pinch of dust and a few drops of water)", "Concentration, up to 1 minute", "—", "Until the spell ends, freezing rain and sleet fall in a 20-foot-tall cylinder with a 40-foot radius centered on a point you choose within range."),
      ("Slow", 3, "Transmutation", "1 action", "120 feet", "V, S, M (a drop of molasses)", "Concentration, up to 1 minute", "—", "You alter time around up to six creatures of your choice in a 40-foot cube within range."),
      ("Speak with Dead", 3, "Necromancy", "1 action", "10 feet", "V, S, M (burning incense)", "10 minutes", "—", "You grant the semblance of life and intelligence to a corpse of your choice within range, allowing it to answer the questions you pose."),
      ("Spirit Guardians", 3, "Conjuration", "1 action", "Self (15-foot radius)", "V, S, M (a holy symbol)", "Concentration, up to 10 minutes", "3d8 radiant or necrotic", "You call forth spirits to protect you. They flit around you to a distance of 15 feet for the duration."),
      ("Stinking Cloud", 3, "Conjuration", "1 action", "90 feet", "V, S, M (a rotten egg or several skunk cabbage leaves)", "Concentration, up to 1 minute", "—", "You create a 20-foot-radius sphere of yellow, nauseating gas centered on a point within range."),
      ("Tongues", 3, "Divination", "1 action", "Touch", "V, M (a small clay model of a ziggurat)", "1 hour", "—", "This spell grants the creature you touch the ability to understand any spoken language it hears. Moreover, when the target speaks, any creature that knows at least one language and can hear the target understands what it says."),
      ("Vampiric Touch", 3, "Necromancy", "1 action", "Self", "V, S", "Concentration, up to 1 minute", "3d6 necrotic", "The touch of your shadow-wreathed hand can siphon life force from others to heal your wounds. Make a melee spell attack against a creature within your reach."),
      ("Water Breathing", 3, "Transmutation", "1 action", "30 feet", "V, S, M (a short reed or piece of straw)", "24 hours", "—", "This spell grants up to ten willing creatures you can see within range the ability to breathe underwater until the spell ends."),
      ("Water Walk", 3, "Transmutation", "1 action", "30 feet", "V, S, M (a piece of cork)", "1 hour", "—", "This spell grants the ability to move across any liquid surface as if it were harmless solid ground."),
      ("Wind Wall", 3, "Evocation", "1 action", "120 feet", "V, S, M (a tiny fan and a feather of exotic origin)", "Concentration, up to 1 minute", "3d8 bludgeoning", "A wall of strong wind rises from the ground at a point you choose within range."),
      // ── 4th Level ──
      ("Arcane Eye", 4, "Divination", "1 action", "30 feet", "V, S, M (a bit of bat fur)", "Concentration, up to 1 hour", "—", "You create an invisible, magical eye within range that hovers in the air for the duration."),
      ("Banishment", 4, "Abjuration", "1 action", "60 feet", "V, S, M (an item distasteful to the target)", "Concentration, up to 1 minute", "—", "You attempt to send one creature that you can see within range to another plane of existence."),
      ("Black Tentacles", 4, "Conjuration", "1 action", "90 feet", "V, S, M (a piece of tentacle from a giant octopus or a giant squid)", "Concentration, up to 1 minute", "3d6 bludgeoning", "Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range."),
      ("Blight", 4, "Necromancy", "1 action", "30 feet", "V, S", "Instantaneous", "8d8 necrotic", "Necromantic energy washes over a creature of your choice that you can see within range, draining moisture and vitality from it."),
      ("Confusion", 4, "Enchantment", "1 action", "90 feet", "V, S, M (three nut shells)", "Concentration, up to 1 minute", "—", "This spell assaults and twists creatures' minds, spawning delusions and provoking uncontrolled action."),
      ("Conjure Minor Elementals", 4, "Conjuration", "1 minute", "90 feet", "V, S", "Concentration, up to 1 hour", "—", "You summon elementals that appear in unoccupied spaces that you can see within range."),
      ("Conjure Woodland Beings", 4, "Conjuration", "1 action", "60 feet", "V, S, M (one holly berry per creature summoned)", "Concentration, up to 1 hour", "—", "You summon fey creatures that appear in unoccupied spaces that you can see within range."),
      ("Control Water", 4, "Transmutation", "1 action", "300 feet", "V, S, M (a drop of water and a pinch of dust)", "Concentration, up to 10 minutes", "—", "Until the spell ends, you control any freestanding water inside an area you choose that is a cube up to 100 feet on a side."),
      ("Death Ward", 4, "Abjuration", "1 action", "Touch", "V, S", "8 hours", "—", "You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point."),
      ("Dimension Door", 4, "Conjuration", "1 action", "500 feet", "V", "Instantaneous", "—", "You teleport yourself from your current location to any other spot within range."),
      ("Divination", 4, "Divination", "1 action", "Self", "V, S, M (incense and a sacrificial offering appropriate to your religion)", "Instantaneous", "—", "Your magic and an offering put you in contact with a god or a god's servants. You ask a single question concerning a specific goal, event, or activity to occur within 7 days."),
      ("Dominate Beast", 4, "Enchantment", "1 action", "60 feet", "V, S", "Concentration, up to 1 minute", "—", "You attempt to beguile a beast that you can see within range."),
      ("Fabricate", 4, "Transmutation", "10 minutes", "120 feet", "V, S", "Instantaneous", "—", "You convert raw materials into products of the same material."),
      ("Fire Shield", 4, "Evocation", "1 action", "Self", "V, S, M (a bit of phosphorus or a firefly)", "10 minutes", "2d8 fire or cold", "Thin and vaporous flame surround your body for the duration, radiating a bright light in a 10-foot radius and dim light for an additional 10 feet."),
      ("Freedom of Movement", 4, "Abjuration", "1 action", "Touch", "V, S, M (a leather strap, bound around the arm or a similar appendage)", "1 hour", "—", "You touch a willing creature. For the duration, the target's movement is unaffected by difficult terrain, and spells and other magical effects can neither reduce the target's speed nor cause the target to be paralyzed or restrained."),
      ("Giant Insect", 4, "Transmutation", "1 action", "30 feet", "V, S", "Concentration, up to 10 minutes", "—", "You transform up to ten centipedes, three wasps, five flies, or one scorpion within range into giant versions of their natural forms for the duration."),
      ("Hallucinatory Terrain", 4, "Illusion", "10 minutes", "300 feet", "V, S, M (a stone, a twig, and a bit of green plant)", "24 hours", "—", "You make natural terrain in a 150-foot cube in range look, sound, and smell like some other sort of natural terrain."),
      ("Ice Storm", 4, "Evocation", "1 action", "300 feet", "V, S, M (a pinch of dust and a few drops of water)", "Instantaneous", "2d8 bludgeoning + 4d6 cold", "A hail of rock-hard ice pounds to the ground in a 20-foot-radius, 40-foot-high cylinder centered on a point within range."),
      ("Locate Creature", 4, "Divination", "1 action", "Self", "V, S, M (a bit of fur from a bloodhound)", "Concentration, up to 1 hour", "—", "Describe or name a creature that is familiar to you. You sense the direction to the creature's location, as long as that creature is within 1,000 feet of you."),
      ("Phantasmal Killer", 4, "Illusion", "1 action", "120 feet", "V, S", "Concentration, up to 1 minute", "4d10 psychic", "You tap into the nightmares of a creature you can see within range and create an illusory manifestation of its deepest fears, visible only to that creature."),
      ("Polymorph", 4, "Transmutation", "1 action", "60 feet", "V, S, M (a caterpillar cocoon)", "Concentration, up to 1 hour", "—", "This spell transforms a creature that you can see within range into a new form."),
      ("Stone Shape", 4, "Transmutation", "1 action", "Touch", "V, S, M (soft clay, which must be worked into roughly the desired shape of the stone object)", "Instantaneous", "—", "You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape that suits your purpose."),
      ("Stoneskin", 4, "Abjuration", "1 action", "Touch", "V, S, M (diamond dust worth 100 gp)", "Concentration, up to 1 hour", "—", "This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage."),
      ("Wall of Fire", 4, "Evocation", "1 action", "120 feet", "V, S, M (a small piece of phosphorus)", "Concentration, up to 1 minute", "5d8 fire", "You create a wall of fire on a solid surface within range. The wall can be up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick."),
      // ── 5th Level ──
      ("Animate Objects", 5, "Transmutation", "1 action", "120 feet", "V, S", "Concentration, up to 1 minute", "Varies", "Objects come to life at your command. Choose up to ten nonmagical objects within range that are not being worn or carried."),
      ("Antilife Shell", 5, "Abjuration", "1 action", "Self (10-foot radius)", "V, S", "Concentration, up to 1 hour", "—", "A shimmering barrier extends out from you in a 10-foot radius and moves with you, remaining centered on you and hedging out creatures other than undead and constructs."),
      ("Arcane Hand", 5, "Evocation", "1 action", "120 feet", "V, S, M (an eggshell and a snakeskin glove)", "Concentration, up to 1 minute", "4d8 force", "You create a Large hand of shimmering, translucent force in an unoccupied space that you can see within range."),
      ("Awaken", 5, "Transmutation", "8 hours", "Touch", "V, S, M (an agate worth at least 1,000 gp)", "Instantaneous", "—", "After spending the casting time tracing magical pathways within a precious gemstone, you touch a Huge or smaller beast or plant."),
      ("Circle of Power", 5, "Abjuration", "1 action", "Self (30-foot radius)", "V", "Concentration, up to 10 minutes", "—", "Divine energy radiates from you, distorting and diffusing magical energy within 30 feet of you."),
      ("Cloudkill", 5, "Conjuration", "1 action", "120 feet", "V, S", "Concentration, up to 10 minutes", "5d8 poison", "You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point you choose within range."),
      ("Commune", 5, "Divination", "1 minute", "Self", "V, S, M (incense and a vial of holy or unholy water)", "1 minute", "—", "You contact your deity or a divine proxy and ask up to three questions that can be answered with a yes or no."),
      ("Commune with Nature", 5, "Divination", "1 minute", "Self", "V, S", "Instantaneous", "—", "You briefly become one with nature and gain knowledge of the surrounding territory."),
      ("Cone of Cold", 5, "Evocation", "1 action", "Self (60-foot cone)", "V, S, M (a small crystal or glass cone)", "Instantaneous", "8d8 cold", "A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a Constitution saving throw."),
      ("Conjure Elemental", 5, "Conjuration", "1 minute", "90 feet", "V, S, M (burning incense for air, soft clay for earth, sulfur and phosphorus for fire, or water and sand for water)", "Concentration, up to 1 hour", "—", "You call forth an elemental servant. Choose an area of air, earth, fire, or water that fills a 10-foot cube within range."),
      ("Contact Other Plane", 5, "Divination", "1 minute", "Self", "V", "1 minute", "—", "You mentally contact a demigod, the spirit of a long-dead sage, or some other mysterious entity from another plane."),
      ("Contagion", 5, "Necromancy", "1 action", "Touch", "V, S", "7 days", "—", "Your touch inflicts disease. Make a melee spell attack against a creature within your reach."),
      ("Creation", 5, "Illusion", "1 minute", "30 feet", "V, S, M (a tiny piece of matter of the same type of the item you plan to create)", "Special", "—", "You pull wisps of shadow material from the Shadowfell to create a nonliving object of vegetable matter within range."),
      ("Destructive Wave", 5, "Evocation", "1 action", "Self (30-foot radius)", "V", "Instantaneous", "5d6 thunder + 5d6 radiant or necrotic", "You strike the ground, creating a burst of divine energy that ripples outward from you."),
      ("Dispel Evil and Good", 5, "Abjuration", "1 action", "Self", "V, S, M (holy water or powdered silver and iron)", "Concentration, up to 1 minute", "—", "Shimmering energy surrounds and protects you from fey, undead, and creatures originating from beyond the Material Plane."),
      ("Dominate Person", 5, "Enchantment", "1 action", "60 feet", "V, S", "Concentration, up to 1 minute", "—", "You attempt to beguile a humanoid that you can see within range."),
      ("Dream", 5, "Illusion", "1 minute", "Special", "V, S, M (a handful of sand, a dab of ink, and a writing quill plucked from a sleeping bird)", "8 hours", "—", "This spell shapes a creature's dreams. Choose a creature known to you as the target of this spell."),
      ("Flame Strike", 5, "Evocation", "1 action", "60 feet", "V, S, M (pinch of sulfur)", "Instantaneous", "4d6 fire + 4d6 radiant", "A vertical column of divine fire roars down from the heavens in a location you specify."),
      ("Geas", 5, "Enchantment", "1 minute", "60 feet", "V", "30 days", "—", "You place a magical command on a creature that you can see within range, forcing it to carry out some service or refrain from some action or course of activity as you decide."),
      ("Greater Restoration", 5, "Abjuration", "1 action", "Touch", "V, S, M (diamond dust worth at least 100 gp)", "Instantaneous", "—", "You imbue a creature you touch with positive energy to undo a debilitating effect."),
      ("Hallow", 5, "Evocation", "24 hours", "Touch", "V, S, M (herbs, oils, and incense worth at least 1,000 gp)", "Until dispelled", "—", "You touch a point and infuse an area around it with holy (or unholy) power."),
      ("Hold Monster", 5, "Enchantment", "1 action", "90 feet", "V, S, M (a small, straight piece of iron)", "Concentration, up to 1 minute", "—", "Choose a creature that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration."),
      ("Insect Plague", 5, "Conjuration", "1 action", "300 feet", "V, S, M (a few grains of sugar, some kernels of grain, and a smear of fat)", "Concentration, up to 10 minutes", "4d10 piercing", "Swarming, biting locusts fill a 20-foot-radius sphere centered on a point you choose within range."),
      ("Legend Lore", 5, "Divination", "10 minutes", "Self", "V, S, M (incense worth at least 250 gp and four ivory strips worth at least 50 gp each)", "Instantaneous", "—", "Name or describe a person, place, or object. The spell brings to your mind a brief summary of the significant lore about the thing you named."),
      ("Mass Cure Wounds", 5, "Evocation", "1 action", "60 feet", "V, S", "Instantaneous", "3d8 + modifier healing", "A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point."),
      ("Mislead", 5, "Illusion", "1 action", "Self", "S", "Concentration, up to 1 hour", "—", "You become invisible at the same time that an illusory double of you appears where you are standing."),
      ("Modify Memory", 5, "Enchantment", "1 action", "30 feet", "V, S", "Concentration, up to 1 minute", "—", "You attempt to reshape another creature's memories."),
      ("Passwall", 5, "Transmutation", "1 action", "30 feet", "V, S, M (a pinch of sesame seeds)", "1 hour", "—", "A passage appears at a point of your choice that you can see on a wooden, plaster, or stone surface within range, and lasts for the duration."),
      ("Planar Binding", 5, "Abjuration", "1 hour", "60 feet", "V, S, M (a jewel worth at least 1,000 gp)", "24 hours", "—", "With this spell, you attempt to bind a celestial, an elemental, a fey, or a fiend to your service."),
      ("Raise Dead", 5, "Necromancy", "1 hour", "Touch", "V, S, M (a diamond worth at least 500 gp)", "Instantaneous", "—", "You return a dead creature you touch to life, provided that it has been dead no longer than 10 days."),
      ("Reincarnate", 5, "Transmutation", "1 hour", "Touch", "V, S, M (rare oils and unguents worth at least 1,000 gp)", "Instantaneous", "—", "You touch a dead humanoid or a humanoid's remains. If the creature has been dead no longer than 10 days, the spell forms a new adult body for it and then calls the soul to enter that body."),
      ("Scrying", 5, "Divination", "10 minutes", "Self", "V, S, M (a focus worth at least 1,000 gp)", "Concentration, up to 10 minutes", "—", "You can see and hear a particular creature you choose that is on the same plane of existence as you."),
      ("Seeming", 5, "Illusion", "1 action", "30 feet", "V, S", "8 hours", "—", "This spell allows you to change the appearance of any number of creatures that you can see within range."),
      ("Telekinesis", 5, "Transmutation", "1 action", "60 feet", "V, S", "Concentration, up to 10 minutes", "—", "You gain the ability to move or manipulate creatures or objects by thought."),
      ("Telepathic Bond", 5, "Divination", "1 action", "30 feet", "V, S, M (pieces of eggshell from two different kinds of creatures)", "1 hour", "—", "You forge a telepathic link among up to eight willing creatures of your choice within range."),
      ("Tree Stride", 5, "Conjuration", "1 action", "Self", "V, S", "Concentration, up to 1 minute", "—", "You gain the ability to enter a tree and move from inside it to inside another tree of the same kind within 500 feet."),
      ("Wall of Force", 5, "Evocation", "1 action", "120 feet", "V, S, M (a pinch of powder made by crushing a clear gemstone)", "Concentration, up to 10 minutes", "—", "An invisible wall of force springs into existence at a point you choose within range."),
      ("Wall of Stone", 5, "Evocation", "1 action", "120 feet", "V, S, M (a small block of granite)", "Concentration, up to 10 minutes", "—", "A nonmagical wall of solid stone springs into existence at a point you choose within range."),
      // ── 6th Level ──
      ("Arcane Gate", 6, "Conjuration", "1 action", "500 feet", "V, S", "Concentration, up to 10 minutes", "—", "You create linked teleportation portals that remain open for the duration."),
      ("Blade Barrier", 6, "Evocation", "1 action", "90 feet", "V, S", "Concentration, up to 10 minutes", "6d10 slashing", "You create a vertical wall of whirling, razor-sharp blades made of magical energy. The wall appears within range and lasts for the duration."),
      ("Chain Lightning", 6, "Evocation", "1 action", "150 feet", "V, S, M (a bit of fur; a piece of amber, glass, or a crystal rod; and three silver pins)", "Instantaneous", "10d8 lightning", "You create a bolt of lightning that arcs toward a target of your choice that you can see within range."),
      ("Circle of Death", 6, "Necromancy", "1 action", "150 feet", "V, S, M (the powder of a crushed black pearl worth at least 500 gp)", "Instantaneous", "8d6 necrotic", "A sphere of negative energy ripples out in a 60-foot-radius sphere from a point within range."),
      ("Contingency", 6, "Evocation", "10 minutes", "Self", "V, S, M (a statuette of yourself carved from ivory worth at least 1,500 gp)", "10 days", "—", "Choose a spell of 5th level or lower that you can cast, that has a casting time of 1 action, and that can target you."),
      ("Create Undead", 6, "Necromancy", "1 minute", "10 feet", "V, S, M (one clay pot filled with grave dirt, one clay pot filled with brackish water, and one 150 gp black onyx stone)", "Instantaneous", "—", "You can cast this spell only at night. Choose up to three corpses of Medium or Small humanoids within range."),
      ("Disintegrate", 6, "Transmutation", "1 action", "60 feet", "V, S, M (a lodestone and a pinch of dust)", "Instantaneous", "10d6+40 force", "A thin green ray springs from your pointing finger to a target that you designate within range."),
      ("Eyebite", 6, "Necromancy", "1 action", "Self", "V, S", "Concentration, up to 1 minute", "—", "For the spell's duration, your eyes become an inky void imbued with dread power. One creature of your choice within 60 feet of you that you can see must succeed on a Wisdom saving throw or be affected until the spell ends."),
      ("Find the Path", 6, "Divination", "1 minute", "Self", "V, S, M (a set of divinatory tools and a special item from the location you wish to find)", "Concentration, up to 1 day", "—", "This spell allows you to find the shortest, most direct physical route to a specific fixed location that you are familiar with on the same plane of existence."),
      ("Flesh to Stone", 6, "Transmutation", "1 action", "60 feet", "V, S, M (a pinch of lime, water, and earth)", "Concentration, up to 1 minute", "—", "You attempt to turn one creature that you can see within range into stone."),
      ("Globe of Invulnerability", 6, "Abjuration", "1 action", "Self (10-foot radius)", "V, S, M (a glass or crystal bead that shatters when the spell ends)", "Concentration, up to 1 minute", "—", "An immobile, faintly shimmering barrier springs into existence in a 10-foot radius around you and remains for the duration."),
      ("Guards and Wards", 6, "Abjuration", "10 minutes", "Touch", "V, S, M (burning incense, a small measure of brimstone and oil, a knotted string, a small amount of umber hulk blood, and a small silver rod)", "24 hours", "—", "You create a ward that protects up to 2,500 square feet of floor space."),
      ("Harm", 6, "Necromancy", "1 action", "60 feet", "V, S", "Instantaneous", "14d6 necrotic", "You unleash a virulent disease on a creature that you can see within range. The target must make a Constitution saving throw."),
      ("Heal", 6, "Evocation", "1 action", "60 feet", "V, S", "Instantaneous", "70 HP", "Choose a creature that you can see within range. A surge of positive energy washes through the creature, causing it to regain 70 hit points."),
      ("Heroes' Feast", 6, "Conjuration", "10 minutes", "30 feet", "V, S, M (a gem-encrusted bowl worth at least 1,000 gp)", "Instantaneous", "—", "You bring forth a great feast, including magnificent food and drink. The feast takes 1 hour to consume and disappears at the end of that time."),
      ("Instant Summons", 6, "Conjuration", "1 minute", "Touch", "V, S, M (a sapphire worth 1,000 gp)", "Until dispelled", "—", "You touch an object weighing 10 pounds or less whose longest dimension is 6 feet or less."),
      ("Irresistible Dance", 6, "Enchantment", "1 action", "30 feet", "V", "Concentration, up to 1 minute", "—", "Choose one creature that you can see within range. The target begins a comic dance in place: shuffling, tapping its feet, and capering for the duration."),
      ("Magic Jar", 6, "Necromancy", "1 minute", "Self", "V, S, M (a gem, crystal, reliquary, or some other ornamental container worth at least 500 gp)", "Until dispelled", "—", "Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell's material component."),
      ("Mass Suggestion", 6, "Enchantment", "1 action", "60 feet", "V, M (a snake's tongue and either a bit of honeycomb or a drop of sweet oil)", "24 hours", "—", "You suggest a course of activity to as many as twelve creatures of your choice that you can see within range and that can hear and understand you."),
      ("Move Earth", 6, "Transmutation", "1 action", "120 feet", "V, S, M (an iron blade and a small bag containing a mixture of soils)", "Concentration, up to 2 hours", "—", "Choose an area of terrain no larger than 40 feet on a side within range."),
      ("Planar Ally", 6, "Conjuration", "10 minutes", "60 feet", "V, S", "Instantaneous", "—", "You beseech an otherworldly entity for aid."),
      ("Programmed Illusion", 6, "Illusion", "1 action", "120 feet", "V, S, M (a bit of fleece and jade dust worth at least 25 gp)", "Until dispelled", "—", "You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific condition occurs."),
      ("Sunbeam", 6, "Evocation", "1 action", "Self (60-foot line)", "V, S, M (a magnifying glass)", "Concentration, up to 1 minute", "6d8 radiant", "A beam of brilliant light flashes out from your hand in a 5-foot-wide, 60-foot-long line."),
      ("True Seeing", 6, "Divination", "1 action", "Touch", "V, S, M (an ointment for the eyes worth 25 gp)", "1 hour", "—", "You give the willing creature you touch the ability to see things as they actually are."),
      ("Wall of Ice", 6, "Evocation", "1 action", "120 feet", "V, S, M (a small piece of quartz)", "Concentration, up to 10 minutes", "10d6 cold", "You create a wall of ice on a solid surface within range."),
      ("Wall of Thorns", 6, "Conjuration", "1 action", "120 feet", "V, S, M (a handful of thorns)", "Concentration, up to 10 minutes", "7d8 piercing", "You create a wall of tough, pliable, tangled brush bristling with needle-sharp thorns."),
      ("Wind Walk", 6, "Transmutation", "1 minute", "30 feet", "V, S, M (fire and holy water)", "8 hours", "—", "You and up to ten other willing creatures you can see within range assume a gaseous form for the duration."),
      ("Word of Recall", 6, "Conjuration", "1 action", "5 feet", "V", "Instantaneous", "—", "You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary."),
      // ── 7th Level ──
      ("Conjure Celestial", 7, "Conjuration", "1 minute", "90 feet", "V, S", "Concentration, up to 1 hour", "—", "You summon a celestial of challenge rating 4 or lower, which appears in an unoccupied space that you can see within range."),
      ("Delayed Blast Fireball", 7, "Evocation", "1 action", "150 feet", "V, S, M (a tiny ball of bat guano and sulfur)", "Concentration, up to 1 minute", "12d6 fire", "A beam of yellow light flashes from your pointing finger, then condenses to linger at a chosen point within range as a glowing bead for the duration."),
      ("Divine Word", 7, "Evocation", "1 bonus action", "30 feet", "V", "Instantaneous", "—", "You utter a divine word, imbued with the power that shaped the world at the dawn of creation. Choose any number of creatures you can see within range."),
      ("Etherealness", 7, "Transmutation", "1 action", "Self", "V, S", "Up to 8 hours", "—", "You step into the border regions of the Ethereal Plane, in the area where it overlaps with your current plane."),
      ("Finger of Death", 7, "Necromancy", "1 action", "60 feet", "V, S", "Instantaneous", "7d8+30 necrotic", "You send negative energy coursing through a creature that you can see within range, causing it searing pain."),
      ("Fire Storm", 7, "Evocation", "1 action", "150 feet", "V, S", "Instantaneous", "7d10 fire", "A storm made up of sheets of roaring flame appears in a location you choose within range."),
      ("Forcecage", 7, "Evocation", "1 action", "100 feet", "V, S, M (ruby dust worth 1,500 gp)", "1 hour", "—", "An immobile, invisible, cube-shaped prison composed of magical force springs into existence around an area you choose within range."),
      ("Magnificent Mansion", 7, "Conjuration", "1 minute", "300 feet", "V, S, M (a miniature portal carved from ivory, a small piece of polished marble, and a tiny silver spoon, each worth at least 5 gp)", "24 hours", "—", "You conjure an extradimensional dwelling in range that lasts for the duration."),
      ("Mirage Arcane", 7, "Illusion", "10 minutes", "Sight", "V, S", "10 days", "—", "You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain."),
      ("Mordenkainen's Sword", 7, "Evocation", "1 action", "60 feet", "V, S, M (a miniature platinum sword with a grip and pommel of copper and zinc)", "Concentration, up to 1 minute", "3d10 force", "You create a sword-shaped plane of force that hovers within range."),
      ("Plane Shift", 7, "Conjuration", "1 action", "Touch", "V, S, M (a forked, metal rod worth at least 250 gp attuned to a specific plane of existence)", "Instantaneous", "—", "You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence."),
      ("Prismatic Spray", 7, "Evocation", "1 action", "Self (60-foot cone)", "V, S", "Instantaneous", "Varies by color", "Eight rays of light flash from your hand. Each ray has a different color and power."),
      ("Project Image", 7, "Illusion", "1 action", "500 miles", "V, S, M (a small replica of you worth 5 gp)", "Concentration, up to 1 day", "—", "You create an illusory copy of yourself that lasts for the duration."),
      ("Regenerate", 7, "Transmutation", "1 minute", "Touch", "V, S, M (a prayer wheel and holy water)", "1 hour", "—", "You touch a creature and stimulate its natural healing ability."),
      ("Resurrection", 7, "Necromancy", "1 hour", "Touch", "V, S, M (a diamond worth at least 1,000 gp)", "Instantaneous", "—", "You touch a dead creature that has been dead for no more than a century, that didn't die of old age, and that isn't undead."),
      ("Reverse Gravity", 7, "Transmutation", "1 action", "100 feet", "V, S, M (a lodestone and iron filings)", "Concentration, up to 1 minute", "—", "This spell reverses gravity in a 50-foot-radius, 100-foot high cylinder centered on a point within range."),
      ("Sequester", 7, "Transmutation", "1 action", "Touch", "V, S, M (a powder composed of diamond, emerald, ruby, and sapphire dust worth at least 5,000 gp)", "Until dispelled", "—", "By means of this spell, a willing creature or an object can be hidden away, safe from detection for the duration."),
      ("Simulacrum", 7, "Illusion", "12 hours", "Touch", "V, S, M (snow or ice in quantities sufficient to make a life-size copy of the duplicated creature)", "Until dispelled", "—", "You shape an illusory duplicate of one beast or humanoid that is within range for the entire casting time of the spell."),
      ("Symbol", 7, "Abjuration", "1 minute", "Touch", "V, S, M (mercury, phosphorus, and powdered diamond and opal worth at least 1,000 gp)", "Until dispelled or triggered", "10d10 damage or special", "When you cast this spell, you inscribe a harmful glyph either on a surface or within an object that can be closed."),
      ("Teleport", 7, "Conjuration", "1 action", "10 feet", "V", "Instantaneous", "—", "This spell instantly transports you and up to eight willing creatures of your choice that you can see within range, or a single object that you can see within range, to a destination you select."),
      ("Whirlwind", 7, "Evocation", "1 action", "300 feet", "V, M (a piece of straw)", "Concentration, up to 1 minute", "10d6 bludgeoning", "A whirlwind howls down to a point on the ground you specify."),
      // ── 8th Level ──
      ("Antimagic Field", 8, "Abjuration", "1 action", "Self (10-foot radius)", "V, S, M (a pinch of powdered iron or iron filings)", "Concentration, up to 1 hour", "—", "A 10-foot-radius invisible sphere of antimagic surrounds you."),
      ("Antipathy/Sympathy", 8, "Enchantment", "1 hour", "60 feet", "V, S, M (either a lump of alum soaked in vinegar for the antipathy effect or a drop of honey for the sympathy effect)", "10 days", "—", "This spell attracts or repels creatures of your choice."),
      ("Clone", 8, "Necromancy", "1 hour", "Touch", "V, S, M (a diamond worth at least 1,000 gp and at least 1 cubic inch of flesh of the creature that is to be cloned)", "Instantaneous", "—", "This spell grows an inert duplicate of a living creature as a safeguard against death."),
      ("Control Weather", 8, "Transmutation", "10 minutes", "Self (5-mile radius)", "V, S, M (burning incense and bits of earth and wood mixed in water)", "Concentration, up to 8 hours", "—", "You take control of the weather within 5 miles of you for the duration."),
      ("Dark Star", 8, "Evocation", "1 action", "150 feet", "V, S, M (a shard of onyx)", "Concentration, up to 1 minute", "8d10 force", "A sphere of destructive gravitational force appears at a point you can see within range."),
      ("Demiplane", 8, "Conjuration", "1 action", "60 feet", "S", "1 hour", "—", "You create a shadowy door on a flat solid surface that you can see within range."),
      ("Dominate Monster", 8, "Enchantment", "1 action", "60 feet", "V, S", "Concentration, up to 1 hour", "—", "You attempt to beguile a creature that you can see within range."),
      ("Earthquake", 8, "Evocation", "1 action", "500 feet", "V, S, M (a pinch of dirt, a piece of rock, and a lump of clay)", "Concentration, up to 1 minute", "—", "You create a seismic disturbance at a point on the ground you can see within range."),
      ("Feeblemind", 8, "Enchantment", "1 action", "150 feet", "V, S, M (a handful of clay, crystal, glass, or mineral spheres)", "Instantaneous", "4d6 psychic", "You blast the mind of a creature that you can see within range, attempting to shatter its intellect and personality."),
      ("Glibness", 8, "Transmutation", "1 action", "Self", "V", "1 hour", "—", "Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15."),
      ("Holy Aura", 8, "Abjuration", "1 action", "Self (30-foot radius)", "V, S, M (a tiny reliquary worth at least 1,000 gp)", "Concentration, up to 1 minute", "—", "Divine light washes out from you and coalesces in a soft radiance in a 30-foot radius around you."),
      ("Illusory Dragon", 8, "Illusion", "1 action", "120 feet", "S", "Concentration, up to 1 minute", "7d6 damage", "By gathering threads of shadow material from the Shadowfell, you create a Huge shadowy dragon in an unoccupied space that you can see within range."),
      ("Incendiary Cloud", 8, "Conjuration", "1 action", "150 feet", "V, S", "Concentration, up to 1 minute", "10d8 fire", "A swirling cloud of smoke shot through with white-hot embers appears in a 20-foot-radius sphere centered on a point within range."),
      ("Maddening Darkness", 8, "Evocation", "1 action", "150 feet", "V, M (a drop of pitch mixed with a drop of mercury)", "Concentration, up to 10 minutes", "8d8 psychic", "Magical darkness spreads from a point you choose within range to fill a 60-foot-radius sphere until the spell ends."),
      ("Maze", 8, "Conjuration", "1 action", "60 feet", "V, S", "Concentration, up to 10 minutes", "—", "You banish a creature that you can see within range into a labyrinthine demiplane."),
      ("Mind Blank", 8, "Abjuration", "1 action", "Touch", "V, S", "24 hours", "—", "Until the spell ends, one willing creature you touch is immune to psychic damage, any effect that would sense its emotions or read its thoughts, divination spells, and the charmed condition."),
      ("Power Word Stun", 8, "Enchantment", "1 action", "60 feet", "V", "Instantaneous", "—", "You speak a word of power that overwhelms the mind of one creature you can see within range, leaving it dumbfounded. If the target has 150 hit points or fewer, it is stunned."),
      ("Sunburst", 8, "Evocation", "1 action", "150 feet", "V, S, M (fire and a piece of sunstone)", "Instantaneous", "12d6 radiant", "Brilliant sunlight flashes in a 60-foot radius centered on a point you choose within range."),
      ("Telepathy", 8, "Evocation", "1 action", "Unlimited", "V, S, M (a pair of linked silver rings)", "24 hours", "—", "You create a telepathic link between yourself and a willing creature with which you are familiar."),
      ("Tsunami", 8, "Conjuration", "1 minute", "Sight", "V, S", "Concentration, up to 6 rounds", "6d10 bludgeoning", "A wall of water springs into existence at a point you choose within range."),
      // ── 9th Level ──
      ("Astral Projection", 9, "Necromancy", "1 hour", "10 feet", "V, S, M (for each creature you affect, you must provide one jacinth worth at least 1,000 gp and one ornately carved bar of silver worth at least 100 gp)", "Special", "—", "You and up to eight willing creatures within range project your astral bodies into the Astral Plane."),
      ("Foresight", 9, "Divination", "1 minute", "Touch", "V, S, M (a hummingbird feather)", "8 hours", "—", "You touch a willing creature and bestow a limited ability to see into the immediate future."),
      ("Gate", 9, "Conjuration", "1 action", "60 feet", "V, S, M (a diamond worth at least 5,000 gp)", "Concentration, up to 1 minute", "—", "You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence."),
      ("Imprisonment", 9, "Abjuration", "1 minute", "30 feet", "V, S, M (a vellum depiction or a carved statuette in the likeness of the target, and a special component worth at least 500 gp per HD of the target)", "Until dispelled", "—", "You create a magical restraint to hold a creature that you can see within range."),
      ("Mass Heal", 9, "Evocation", "1 action", "60 feet", "V, S", "Instantaneous", "700 HP total", "A flood of healing energy flows from you into injured creatures around you."),
      ("Mass Polymorph", 9, "Transmutation", "1 action", "120 feet", "V, S, M (a caterpillar cocoon)", "Concentration, up to 1 hour", "—", "You transform up to ten creatures of your choice that you can see within range."),
      ("Meteor Swarm", 9, "Evocation", "1 action", "1 mile", "V, S", "Instantaneous", "20d6 fire + 20d6 bludgeoning", "Blazing orbs of fire plummet to the ground at four different points you can see within range."),
      ("Power Word Heal", 9, "Evocation", "1 action", "Touch", "V, S", "Instantaneous", "Full heal", "A wave of healing energy washes over the creature you touch. The target regains all its hit points."),
      ("Power Word Kill", 9, "Enchantment", "1 action", "60 feet", "V", "Instantaneous", "Instant death", "You utter a word of power that can compel one creature you can see within range to die instantly. If the creature you choose has 100 hit points or fewer, it dies."),
      ("Prismatic Wall", 9, "Abjuration", "1 action", "60 feet", "V, S", "10 minutes", "Varies", "A shimmering, multicolored plane of light forms a vertical opaque wall up to 90 feet long, 30 feet high, and 1 inch thick."),
      ("Shapechange", 9, "Transmutation", "1 action", "Self", "V, S, M (a jade circlet worth at least 1,500 gp)", "Concentration, up to 1 hour", "—", "You assume the form of a different creature for the duration."),
      ("Storm of Vengeance", 9, "Conjuration", "1 action", "Sight", "V, S", "Concentration, up to 1 minute", "6d6 acid + 10d6 lightning", "A churning storm cloud forms, centered on a point you can see and spreading to a radius of 360 feet."),
      ("Time Stop", 9, "Transmutation", "1 action", "Self", "V", "Instantaneous", "—", "You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4+1 turns in a row."),
      ("True Polymorph", 9, "Transmutation", "1 action", "30 feet", "V, S, M (a drop of mercury, a dollop of gum arabic, and a wisp of smoke)", "Concentration, up to 1 hour", "—", "Choose one creature or nonmagical object that you can see within range."),
      ("True Resurrection", 9, "Necromancy", "1 hour", "Touch", "V, S, M (a sprinkle of holy water and diamonds worth at least 25,000 gp)", "Instantaneous", "—", "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age."),
      ("Weird", 9, "Illusion", "1 action", "120 feet", "V, S", "Concentration, up to 1 minute", "4d10 psychic", "Drawing on the deepest fears of a group of creatures, you create illusory creatures in their minds, visible only to them."),
      ("Wish", 9, "Conjuration", "1 action", "Self", "V", "Instantaneous", "—", "Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires.")
    ];

    for ((name, level, school, castingTime, range, components, duration, damageEffect, description) in spellData.vals()) {
      let spell : SrdSpell = { name; level; school; castingTime; range; components; duration; damageEffect; description };
      srdSpells.add(idx, spell);
      idx += 1;
    };
    idx;
  };

  // Helper: verify caller is authenticated (not anonymous)
  private func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
  };

  // Helper: verify caller is admin
  private func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin access required");
    };
  };

  // Helper function to verify character ownership
  private func verifyCharacterOwnership(caller : Principal, characterId : CharacterId) : Bool {
    switch (characters.get(characterId)) {
      case (null) { false };
      case (?char) { Principal.equal(char.owner, caller) };
    };
  };

  // Character CRUD
  public shared ({ caller }) func createCharacter(char : Character) : async CharacterId {
    requireAuth(caller);
    let characterId = nextCharacterId;
    nextCharacterId += 1;
    let newCharacter : Character = { char with owner = caller };
    characters.add(characterId, newCharacter);
    characterId;
  };

  public query ({ caller }) func getAllCharacters() : async [(CharacterId, Character)] {
    requireAuth(caller);
    let resultList = List.empty<(CharacterId, Character)>();
    for ((id, char) in characters.entries()) {
      if (Principal.equal(char.owner, caller)) {
        resultList.add((id, char));
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func getAllCharactersCount({}) : async Nat {
    requireAuth(caller);
    var count = 0;
    for (char in characters.values()) {
      if (Principal.equal(char.owner, caller)) { count += 1 };
    };
    count;
  };

  public query ({ caller }) func getCharacter(id : CharacterId) : async ?Character {
    requireAuth(caller);
    switch (characters.get(id)) {
      case (null) { null };
      case (?char) {
        if (Principal.equal(char.owner, caller)) { ?char } else { null };
      };
    };
  };

  public shared ({ caller }) func updateCharacter(id : CharacterId, char : Character) : async () {
    requireAuth(caller);
    switch (characters.get(id)) {
      case (null) { Runtime.trap("Character not found") };
      case (?existing) {
        if (Principal.equal(existing.owner, caller)) {
          characters.add(id, { char with owner = caller });
        } else {
          Runtime.trap("Unauthorized: Cannot modify characters you do not own");
        };
      };
    };
  };

  public shared ({ caller }) func deleteCharacter(id : CharacterId) : async () {
    requireAuth(caller);
    switch (characters.get(id)) {
      case (null) { Runtime.trap("Character not found") };
      case (?char) {
        if (Principal.equal(char.owner, caller)) {
          characters.remove(id);
        } else {
          Runtime.trap("Unauthorized: Cannot delete characters you do not own");
        };
      };
    };
  };

  // Spell CRUD
  public shared ({ caller }) func addSpell(spell : Spell) : async SpellId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, spell.characterId)) {
      Runtime.trap("Unauthorized: Cannot add spells to characters you do not own");
    };
    let spellId = nextSpellId;
    nextSpellId += 1;
    spells.add(spellId, spell);
    spellId;
  };

  public query ({ caller }) func getSpellsByCharacter(characterId : CharacterId) : async [(SpellId, Spell)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view spells for characters you do not own");
    };
    let resultList = List.empty<(SpellId, Spell)>();
    for ((id, spell) in spells.entries()) {
      if (spell.characterId == characterId) { resultList.add((id, spell)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateSpell(id : SpellId, spell : Spell) : async () {
    requireAuth(caller);
    switch (spells.get(id)) {
      case (null) { Runtime.trap("Spell not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized");
        };
        spells.add(id, spell);
      };
    };
  };

  public shared ({ caller }) func deleteSpell(id : SpellId) : async () {
    requireAuth(caller);
    switch (spells.get(id)) {
      case (null) { Runtime.trap("Spell not found") };
      case (?spell) {
        if (not verifyCharacterOwnership(caller, spell.characterId)) {
          Runtime.trap("Unauthorized");
        };
        spells.remove(id);
      };
    };
  };

  // Trait CRUD
  public shared ({ caller }) func addTrait(trait : Trait) : async TraitId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, trait.characterId)) {
      Runtime.trap("Unauthorized");
    };
    let traitId = nextTraitId;
    nextTraitId += 1;
    traits.add(traitId, trait);
    traitId;
  };

  public query ({ caller }) func getTraitsByCharacter(characterId : CharacterId) : async [(TraitId, Trait)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized");
    };
    let resultList = List.empty<(TraitId, Trait)>();
    for ((id, trait) in traits.entries()) {
      if (trait.characterId == characterId) { resultList.add((id, trait)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateTrait(id : TraitId, trait : Trait) : async () {
    requireAuth(caller);
    switch (traits.get(id)) {
      case (null) { Runtime.trap("Trait not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized");
        };
        traits.add(id, trait);
      };
    };
  };

  public shared ({ caller }) func deleteTrait(id : TraitId) : async () {
    requireAuth(caller);
    switch (traits.get(id)) {
      case (null) { Runtime.trap("Trait not found") };
      case (?trait) {
        if (not verifyCharacterOwnership(caller, trait.characterId)) {
          Runtime.trap("Unauthorized");
        };
        traits.remove(id);
      };
    };
  };

  // Inventory CRUD
  public shared ({ caller }) func addItem(item : InventoryItem) : async InventoryItemId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, item.characterId)) {
      Runtime.trap("Unauthorized");
    };
    let itemId = nextItemId;
    nextItemId += 1;
    inventoryItems.add(itemId, item);
    itemId;
  };

  public query ({ caller }) func getItemsByCharacter(characterId : CharacterId) : async [(InventoryItemId, InventoryItem)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized");
    };
    let resultList = List.empty<(InventoryItemId, InventoryItem)>();
    for ((id, item) in inventoryItems.entries()) {
      if (item.characterId == characterId) { resultList.add((id, item)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateItem(id : InventoryItemId, item : InventoryItem) : async () {
    requireAuth(caller);
    switch (inventoryItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized");
        };
        inventoryItems.add(id, item);
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : InventoryItemId) : async () {
    requireAuth(caller);
    switch (inventoryItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (not verifyCharacterOwnership(caller, item.characterId)) {
          Runtime.trap("Unauthorized");
        };
        inventoryItems.remove(id);
      };
    };
  };

  // Custom Races
  public shared ({ caller }) func addRace(race : CustomRace) : async RaceId {
    requireAuth(caller);
    let raceId = nextRaceId;
    nextRaceId += 1;
    races.add(raceId, race);
    raceOwners.add(raceId, caller);
    raceId;
  };

  public query ({ caller }) func getAllRaces() : async [(RaceId, CustomRace)] {
    requireAuth(caller);
    let resultList = List.empty<(RaceId, CustomRace)>();
    for ((id, race) in races.entries()) {
      switch (raceOwners.get(id)) {
        case (?owner) { if (Principal.equal(owner, caller)) { resultList.add((id, race)) } };
        case (null) {};
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateRace(id : RaceId, race : CustomRace) : async () {
    requireAuth(caller);
    if (not races.containsKey(id)) { Runtime.trap("Race not found") };
    let isOwner = switch (raceOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot edit races you do not own");
    };
    races.add(id, race);
  };

  public shared ({ caller }) func deleteRace(id : RaceId) : async () {
    requireAuth(caller);
    if (not races.containsKey(id)) { Runtime.trap("Race not found") };
    let isOwner = switch (raceOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot delete races you do not own");
    };
    races.remove(id);
    raceOwners.remove(id);
    raceLinkedContent.remove(id);
  };

  // Race linked content (stored separately to avoid stable variable migration)
  public shared ({ caller }) func updateRaceLinkedContent(raceId : RaceId, content : RaceLinkedContent) : async () {
    requireAuth(caller);
    // Verify caller owns the race
    let isOwner = switch (raceOwners.get(raceId)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner) {
      Runtime.trap("Unauthorized: Cannot update linked content for races you do not own");
    };
    raceLinkedContent.add(raceId, content);
  };

  public query ({ caller }) func getAllRaceLinkedContent() : async [(RaceId, RaceLinkedContent)] {
    requireAuth(caller);
    let resultList = List.empty<(RaceId, RaceLinkedContent)>();
    for ((id, content) in raceLinkedContent.entries()) {
      switch (raceOwners.get(id)) {
        case (?owner) { if (Principal.equal(owner, caller)) { resultList.add((id, content)) } };
        case (null) {};
      };
    };
    resultList.toArray();
  };

  // Apply race grants to a character (auto-add linked spells/abilities/attacks)
  public shared ({ caller }) func applyRaceGrantsToCharacter(characterId : CharacterId, raceId : RaceId) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot modify characters you do not own");
    };
    switch (raceLinkedContent.get(raceId)) {
      case (null) { /* no linked content, nothing to do */ };
      case (?content) {
        // Add linked spells
        for (spellId in content.linkedSpellIds.vals()) {
          switch (customSpells.get(spellId)) {
            case (?cs) {
              let sid = nextSpellId;
              nextSpellId += 1;
              spells.add(sid, {
                characterId = characterId;
                name = cs.name;
                level = cs.level;
                school = cs.school;
                castingTime = cs.castingTime;
                range = cs.range;
                components = cs.components;
                duration = cs.duration;
                damageEffect = cs.damageEffect;
                description = cs.description;
              });
            };
            case (null) {};
          };
        };
        // Add linked abilities
        for (abilityId in content.linkedAbilityIds.vals()) {
          switch (customAbilities.get(abilityId)) {
            case (?ca) {
              let aid = nextCharacterAbilityId;
              nextCharacterAbilityId += 1;
              characterAbilities.add(aid, {
                characterId = characterId;
                name = ca.name;
                description = ca.description;
                abilityType = ca.abilityType;
                uses = ca.uses;
                usesRemaining = ca.uses;
                rechargeOn = ca.rechargeOn;
              });
            };
            case (null) {};
          };
        };
        // Add linked attacks
        for (attackId in content.linkedAttackIds.vals()) {
          switch (customPhysicalAttacks.get(attackId)) {
            case (?cp) {
              let atid = nextCharacterPhysicalAttackId;
              nextCharacterPhysicalAttackId += 1;
              characterPhysicalAttacks.add(atid, {
                characterId = characterId;
                name = cp.name;
                description = cp.description;
                damageDice = cp.damageDice;
                attackBonus = cp.attackBonus;
                damageType = cp.damageType;
                range = cp.range;
                properties = cp.properties;
                timesUsed = 0;
              });
            };
            case (null) {};
          };
        };
      };
    };
  };

  // Custom Classes
  public shared ({ caller }) func addClass(cls : CustomClass) : async ClassId {
    requireAuth(caller);
    let classId = nextClassId;
    nextClassId += 1;
    classes.add(classId, cls);
    classOwners.add(classId, caller);
    classId;
  };

  public query ({ caller }) func getAllClasses() : async [(ClassId, CustomClass)] {
    requireAuth(caller);
    let resultList = List.empty<(ClassId, CustomClass)>();
    for ((id, cls) in classes.entries()) {
      switch (classOwners.get(id)) {
        case (?owner) { if (Principal.equal(owner, caller)) { resultList.add((id, cls)) } };
        case (null) {};
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateClass(id : ClassId, cls : CustomClass) : async () {
    requireAuth(caller);
    if (not classes.containsKey(id)) { Runtime.trap("Class not found") };
    let isOwner = switch (classOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot edit classes you do not own");
    };
    classes.add(id, cls);
  };

  public shared ({ caller }) func deleteClass(id : ClassId) : async () {
    requireAuth(caller);
    if (not classes.containsKey(id)) { Runtime.trap("Class not found") };
    let isOwner = switch (classOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot delete classes you do not own");
    };
    classes.remove(id);
    classOwners.remove(id);
  };

  // Custom Spell Library
  public shared ({ caller }) func addCustomSpell(spell : CustomSpell) : async CustomSpellId {
    requireAuth(caller);
    let id = nextCustomSpellId;
    nextCustomSpellId += 1;
    customSpells.add(id, { spell with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomSpells() : async [(CustomSpellId, CustomSpell)] {
    requireAuth(caller);
    let resultList = List.empty<(CustomSpellId, CustomSpell)>();
    for ((id, spell) in customSpells.entries()) {
      if (Principal.equal(spell.owner, caller)) { resultList.add((id, spell)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomSpell(id : CustomSpellId, spell : CustomSpell) : async () {
    requireAuth(caller);
    switch (customSpells.get(id)) {
      case (null) { Runtime.trap("Custom spell not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot edit spells you do not own");
        };
        customSpells.add(id, { spell with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomSpell(id : CustomSpellId) : async () {
    requireAuth(caller);
    switch (customSpells.get(id)) {
      case (null) { Runtime.trap("Custom spell not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete spells you do not own");
        };
        customSpells.remove(id);
      };
    };
  };

  // Custom Item Library
  public shared ({ caller }) func addCustomItem(item : CustomItem) : async CustomItemId {
    requireAuth(caller);
    let id = nextCustomItemId;
    nextCustomItemId += 1;
    customItems.add(id, { item with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomItems() : async [(CustomItemId, CustomItem)] {
    requireAuth(caller);
    let resultList = List.empty<(CustomItemId, CustomItem)>();
    for ((id, item) in customItems.entries()) {
      if (Principal.equal(item.owner, caller)) { resultList.add((id, item)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomItem(id : CustomItemId, item : CustomItem) : async () {
    requireAuth(caller);
    switch (customItems.get(id)) {
      case (null) { Runtime.trap("Custom item not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot edit items you do not own");
        };
        customItems.add(id, { item with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomItem(id : CustomItemId) : async () {
    requireAuth(caller);
    switch (customItems.get(id)) {
      case (null) { Runtime.trap("Custom item not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete items you do not own");
        };
        customItems.remove(id);
      };
    };
  };

  // Settings
  public query ({ caller }) func getSettings() : async Settings {
    requireAuth(caller);
    switch (userSettings.get(caller)) {
      case (?s) { s };
      case (null) { { maxLevel = 10000 } };
    };
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    requireAuth(caller);
    userSettings.add(caller, newSettings);
  };

  // User Profiles
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireAuth(caller);
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    requireAdmin(caller);
    userProfiles.toArray();
  };

  // Custom Abilities
  public shared ({ caller }) func addCustomAbility(ability : CustomAbility) : async CustomAbilityId {
    requireAuth(caller);
    let id = nextCustomAbilityId;
    nextCustomAbilityId += 1;
    customAbilities.add(id, { ability with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomAbilities() : async [(CustomAbilityId, CustomAbility)] {
    requireAuth(caller);
    let resultList = List.empty<(CustomAbilityId, CustomAbility)>();
    for ((id, ability) in customAbilities.entries()) {
      if (Principal.equal(ability.owner, caller)) { resultList.add((id, ability)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomAbility(id : CustomAbilityId, ability : CustomAbility) : async () {
    requireAuth(caller);
    switch (customAbilities.get(id)) {
      case (null) { Runtime.trap("Custom ability not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot edit abilities you do not own");
        };
        customAbilities.add(id, { ability with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomAbility(id : CustomAbilityId) : async () {
    requireAuth(caller);
    switch (customAbilities.get(id)) {
      case (null) { Runtime.trap("Custom ability not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete abilities you do not own");
        };
        customAbilities.remove(id);
      };
    };
  };

  // Character Abilities
  public shared ({ caller }) func addCharacterAbility(ability : CharacterAbility) : async CharacterAbilityId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, ability.characterId)) {
      Runtime.trap("Unauthorized: Cannot add abilities to characters you do not own");
    };
    let id = nextCharacterAbilityId;
    nextCharacterAbilityId += 1;
    characterAbilities.add(id, ability);
    id;
  };

  public query ({ caller }) func getAbilitiesByCharacter(characterId : CharacterId) : async [(CharacterAbilityId, CharacterAbility)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view abilities for characters you do not own");
    };
    let resultList = List.empty<(CharacterAbilityId, CharacterAbility)>();
    for ((id, ability) in characterAbilities.entries()) {
      if (ability.characterId == characterId) { resultList.add((id, ability)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterAbility(id : CharacterAbilityId, ability : CharacterAbility) : async () {
    requireAuth(caller);
    switch (characterAbilities.get(id)) {
      case (null) { Runtime.trap("Character ability not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot modify abilities you do not own");
        };
        characterAbilities.add(id, ability);
      };
    };
  };

  public shared ({ caller }) func deleteCharacterAbility(id : CharacterAbilityId) : async () {
    requireAuth(caller);
    switch (characterAbilities.get(id)) {
      case (null) { Runtime.trap("Character ability not found") };
      case (?ability) {
        if (not verifyCharacterOwnership(caller, ability.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete abilities you do not own");
        };
        characterAbilities.remove(id);
      };
    };
  };

  // Custom Physical Attacks
  public shared ({ caller }) func addCustomPhysicalAttack(attack : CustomPhysicalAttack) : async CustomPhysicalAttackId {
    requireAuth(caller);
    let id = nextCustomPhysicalAttackId;
    nextCustomPhysicalAttackId += 1;
    customPhysicalAttacks.add(id, { attack with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomPhysicalAttacks() : async [(CustomPhysicalAttackId, CustomPhysicalAttack)] {
    requireAuth(caller);
    let resultList = List.empty<(CustomPhysicalAttackId, CustomPhysicalAttack)>();
    for ((id, attack) in customPhysicalAttacks.entries()) {
      if (Principal.equal(attack.owner, caller)) { resultList.add((id, attack)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomPhysicalAttack(id : CustomPhysicalAttackId, attack : CustomPhysicalAttack) : async () {
    requireAuth(caller);
    switch (customPhysicalAttacks.get(id)) {
      case (null) { Runtime.trap("Custom physical attack not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot edit attacks you do not own");
        };
        customPhysicalAttacks.add(id, { attack with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomPhysicalAttack(id : CustomPhysicalAttackId) : async () {
    requireAuth(caller);
    switch (customPhysicalAttacks.get(id)) {
      case (null) { Runtime.trap("Custom physical attack not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete attacks you do not own");
        };
        customPhysicalAttacks.remove(id);
      };
    };
  };

  // Character Physical Attacks
  public shared ({ caller }) func addCharacterPhysicalAttack(attack : CharacterPhysicalAttack) : async CharacterPhysicalAttackId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, attack.characterId)) {
      Runtime.trap("Unauthorized: Cannot add attacks to characters you do not own");
    };
    let id = nextCharacterPhysicalAttackId;
    nextCharacterPhysicalAttackId += 1;
    characterPhysicalAttacks.add(id, attack);
    id;
  };

  public query ({ caller }) func getPhysicalAttacksByCharacter(characterId : CharacterId) : async [(CharacterPhysicalAttackId, CharacterPhysicalAttack)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view attacks for characters you do not own");
    };
    let resultList = List.empty<(CharacterPhysicalAttackId, CharacterPhysicalAttack)>();
    for ((id, attack) in characterPhysicalAttacks.entries()) {
      if (attack.characterId == characterId) { resultList.add((id, attack)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterPhysicalAttack(id : CharacterPhysicalAttackId, attack : CharacterPhysicalAttack) : async () {
    requireAuth(caller);
    switch (characterPhysicalAttacks.get(id)) {
      case (null) { Runtime.trap("Character physical attack not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot modify attacks you do not own");
        };
        characterPhysicalAttacks.add(id, attack);
      };
    };
  };

  public shared ({ caller }) func deleteCharacterPhysicalAttack(id : CharacterPhysicalAttackId) : async () {
    requireAuth(caller);
    switch (characterPhysicalAttacks.get(id)) {
      case (null) { Runtime.trap("Character physical attack not found") };
      case (?attack) {
        if (not verifyCharacterOwnership(caller, attack.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete attacks you do not own");
        };
        characterPhysicalAttacks.remove(id);
      };
    };
  };

  // Custom Spell Schools
  public shared ({ caller }) func addCustomSpellSchool(school : CustomSpellSchool) : async CustomSpellSchoolId {
    requireAuth(caller);
    let id = nextCustomSpellSchoolId;
    nextCustomSpellSchoolId += 1;
    customSpellSchools.add(id, { school with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomSpellSchools() : async [(CustomSpellSchoolId, CustomSpellSchool)] {
    requireAuth(caller);
    let resultList = List.empty<(CustomSpellSchoolId, CustomSpellSchool)>();
    for ((id, school) in customSpellSchools.entries()) {
      if (Principal.equal(school.owner, caller)) { resultList.add((id, school)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomSpellSchool(id : CustomSpellSchoolId, school : CustomSpellSchool) : async () {
    requireAuth(caller);
    switch (customSpellSchools.get(id)) {
      case (null) { Runtime.trap("Custom spell school not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot edit schools you do not own");
        };
        customSpellSchools.add(id, { school with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomSpellSchool(id : CustomSpellSchoolId) : async () {
    requireAuth(caller);
    switch (customSpellSchools.get(id)) {
      case (null) { Runtime.trap("Custom spell school not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete schools you do not own");
        };
        customSpellSchools.remove(id);
      };
    };
  };

  // ─── HP State ───────────────────────────────────────────────────────────────

  public query ({ caller }) func getHPState(characterId : CharacterId) : async ?HPState {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view HP for characters you do not own");
    };
    hpStates.get(characterId);
  };

  public shared ({ caller }) func updateHPState(characterId : CharacterId, state : HPState) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update HP for characters you do not own");
    };
    hpStates.add(characterId, state);
  };

  // ─── Spell Slots ────────────────────────────────────────────────────────────

  public query ({ caller }) func getSpellSlotsByCharacter(characterId : CharacterId) : async [SpellSlotState] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view spell slots for characters you do not own");
    };
    switch (spellSlotStates.get(characterId)) {
      case (null) { [] };
      case (?slots) { slots.toArray() };
    };
  };

  public shared ({ caller }) func updateSpellSlots(characterId : CharacterId, slots : [SpellSlotState]) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update spell slots for characters you do not own");
    };
    let slotList = List.empty<SpellSlotState>();
    for (slot in slots.values()) {
      slotList.add(slot);
    };
    spellSlotStates.add(characterId, slotList);
  };

  // ─── Death Saves ────────────────────────────────────────────────────────────

  public query ({ caller }) func getDeathSaveState(characterId : CharacterId) : async ?DeathSaveState {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view death saves for characters you do not own");
    };
    deathSaveStates.get(characterId);
  };

  public shared ({ caller }) func updateDeathSaveState(characterId : CharacterId, state : DeathSaveState) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update death saves for characters you do not own");
    };
    deathSaveStates.add(characterId, state);
  };

  // ─── Currency ───────────────────────────────────────────────────────────────

  public query ({ caller }) func getCurrencyState(characterId : CharacterId) : async ?CurrencyState {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view currency for characters you do not own");
    };
    currencyStates.get(characterId);
  };

  public shared ({ caller }) func updateCurrencyState(characterId : CharacterId, state : CurrencyState) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update currency for characters you do not own");
    };
    currencyStates.add(characterId, state);
  };

  // ─── Languages ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func addLanguage(characterId : CharacterId, name : Text) : async Nat {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add languages to characters you do not own");
    };
    let id = nextLanguageId;
    nextLanguageId += 1;
    languages.add(id, { id; characterId; name });
    id;
  };

  public query ({ caller }) func getLanguagesByCharacter(characterId : CharacterId) : async [Language] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view languages for characters you do not own");
    };
    let resultList = List.empty<Language>();
    for ((_, lang) in languages.entries()) {
      if (lang.characterId == characterId) { resultList.add(lang) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateLanguage(id : Nat, name : Text) : async () {
    requireAuth(caller);
    switch (languages.get(id)) {
      case (null) { Runtime.trap("Language not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot edit languages for characters you do not own");
        };
        languages.add(id, { existing with name });
      };
    };
  };

  public shared ({ caller }) func deleteLanguage(id : Nat) : async () {
    requireAuth(caller);
    switch (languages.get(id)) {
      case (null) { Runtime.trap("Language not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete languages for characters you do not own");
        };
        languages.remove(id);
      };
    };
  };

  // ─── Allies ─────────────────────────────────────────────────────────────────

  public shared ({ caller }) func addAlly(characterId : CharacterId, name : Text, relationship : Text, notes : Text) : async Nat {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add allies to characters you do not own");
    };
    let id = nextAllyId;
    nextAllyId += 1;
    allies.add(id, { id; characterId; name; relationship; notes });
    id;
  };

  public query ({ caller }) func getAlliesByCharacter(characterId : CharacterId) : async [Ally] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view allies for characters you do not own");
    };
    let resultList = List.empty<Ally>();
    for ((_, ally) in allies.entries()) {
      if (ally.characterId == characterId) { resultList.add(ally) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateAlly(id : Nat, name : Text, relationship : Text, notes : Text) : async () {
    requireAuth(caller);
    switch (allies.get(id)) {
      case (null) { Runtime.trap("Ally not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot edit allies for characters you do not own");
        };
        allies.add(id, { existing with name; relationship; notes });
      };
    };
  };

  public shared ({ caller }) func deleteAlly(id : Nat) : async () {
    requireAuth(caller);
    switch (allies.get(id)) {
      case (null) { Runtime.trap("Ally not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete allies for characters you do not own");
        };
        allies.remove(id);
      };
    };
  };

  // ─── Character Feats ────────────────────────────────────────────────────────

  public shared ({ caller }) func addCharacterFeat(characterId : CharacterId, name : Text, description : Text) : async Nat {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add feats to characters you do not own");
    };
    let id = nextCharacterFeatId;
    nextCharacterFeatId += 1;
    characterFeats.add(id, { id; characterId; name; description });
    id;
  };

  public query ({ caller }) func getCharacterFeatsByCharacter(characterId : CharacterId) : async [CharacterFeat] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view feats for characters you do not own");
    };
    let resultList = List.empty<CharacterFeat>();
    for ((_, feat) in characterFeats.entries()) {
      if (feat.characterId == characterId) { resultList.add(feat) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterFeat(id : Nat, name : Text, description : Text) : async () {
    requireAuth(caller);
    switch (characterFeats.get(id)) {
      case (null) { Runtime.trap("Character feat not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot edit feats for characters you do not own");
        };
        characterFeats.add(id, { existing with name; description });
      };
    };
  };

  public shared ({ caller }) func deleteCharacterFeat(id : Nat) : async () {
    requireAuth(caller);
    switch (characterFeats.get(id)) {
      case (null) { Runtime.trap("Character feat not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete feats for characters you do not own");
        };
        characterFeats.remove(id);
      };
    };
  };

  // ─── Custom Skills (global library) ─────────────────────────────────────────

  public shared ({ caller }) func addCustomSkill(name : Text, statBased : Text, description : Text) : async Nat {
    requireAuth(caller);
    let id = nextCustomSkillId;
    nextCustomSkillId += 1;
    customSkills.add(id, { id; name; statBased; description; owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomSkills() : async [CustomSkill] {
    requireAuth(caller);
    let resultList = List.empty<CustomSkill>();
    for ((_, skill) in customSkills.entries()) {
      if (Principal.equal(skill.owner, caller)) { resultList.add(skill) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomSkill(id : Nat, name : Text, statBased : Text, description : Text) : async () {
    requireAuth(caller);
    switch (customSkills.get(id)) {
      case (null) { Runtime.trap("Custom skill not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot edit skills you do not own");
        };
        customSkills.add(id, { existing with name; statBased; description });
      };
    };
  };

  public shared ({ caller }) func deleteCustomSkill(id : Nat) : async () {
    requireAuth(caller);
    switch (customSkills.get(id)) {
      case (null) { Runtime.trap("Custom skill not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete skills you do not own");
        };
        customSkills.remove(id);
      };
    };
  };

  // ─── Custom Feats (global library) ──────────────────────────────────────────

  public shared ({ caller }) func addCustomFeat(name : Text, description : Text, prerequisites : Text) : async Nat {
    requireAuth(caller);
    let id = nextCustomFeatId;
    nextCustomFeatId += 1;
    customFeats.add(id, { id; name; description; prerequisites; owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomFeats() : async [CustomFeat] {
    requireAuth(caller);
    let resultList = List.empty<CustomFeat>();
    for ((_, feat) in customFeats.entries()) {
      if (Principal.equal(feat.owner, caller)) { resultList.add(feat) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomFeat(id : Nat, name : Text, description : Text, prerequisites : Text) : async () {
    requireAuth(caller);
    switch (customFeats.get(id)) {
      case (null) { Runtime.trap("Custom feat not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot edit feats you do not own");
        };
        customFeats.add(id, { existing with name; description; prerequisites });
      };
    };
  };

  public shared ({ caller }) func deleteCustomFeat(id : Nat) : async () {
    requireAuth(caller);
    switch (customFeats.get(id)) {
      case (null) { Runtime.trap("Custom feat not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete feats you do not own");
        };
        customFeats.remove(id);
      };
    };
  };

  // ─── Character Skills ────────────────────────────────────────────────────────

  public shared ({ caller }) func addCharacterSkill(characterId : CharacterId, skillName : Text, proficient : Bool, expertise : Bool) : async Nat {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add skills to characters you do not own");
    };
    let id = nextCharacterSkillId;
    nextCharacterSkillId += 1;
    characterSkills.add(id, { id; characterId; skillName; proficient; expertise });
    id;
  };

  public query ({ caller }) func getCharacterSkillsByCharacter(characterId : CharacterId) : async [CharacterSkill] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view skills for characters you do not own");
    };
    let resultList = List.empty<CharacterSkill>();
    for ((_, skill) in characterSkills.entries()) {
      if (skill.characterId == characterId) { resultList.add(skill) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterSkill(id : Nat, skillName : Text, proficient : Bool, expertise : Bool) : async () {
    requireAuth(caller);
    switch (characterSkills.get(id)) {
      case (null) { Runtime.trap("Character skill not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot edit skills for characters you do not own");
        };
        characterSkills.add(id, { existing with skillName; proficient; expertise });
      };
    };
  };

  public shared ({ caller }) func deleteCharacterSkill(id : Nat) : async () {
    requireAuth(caller);
    switch (characterSkills.get(id)) {
      case (null) { Runtime.trap("Character skill not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete skills for characters you do not own");
        };
        characterSkills.remove(id);
      };
    };
  };

  // ─── Tab Notes ───────────────────────────────────────────────────────────────

  private func tabNoteKey(characterId : CharacterId, tabName : Text) : Text {
    characterId.toText() # "#" # tabName;
  };

  public query ({ caller }) func getTabNote(characterId : CharacterId, tabName : Text) : async ?TabNote {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view notes for characters you do not own");
    };
    tabNotes.get(tabNoteKey(characterId, tabName));
  };

  public shared ({ caller }) func saveTabNote(characterId : CharacterId, tabName : Text, content : Text) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot save notes for characters you do not own");
    };
    let key = tabNoteKey(characterId, tabName);
    let id = switch (tabNotes.get(key)) {
      case (?existing) { existing.id };
      case (null) {
        let newId = nextTabNoteId;
        nextTabNoteId += 1;
        newId;
      };
    };
    tabNotes.add(key, { id; characterId; tabName; content });
  };

  public shared ({ caller }) func deleteTabNote(characterId : CharacterId, tabName : Text) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot delete notes for characters you do not own");
    };
    tabNotes.remove(tabNoteKey(characterId, tabName));
  };

  // ─── Saving Throws ──────────────────────────────────────────────────────────

  public query ({ caller }) func getSaveThrowState(characterId : CharacterId) : async ?SaveThrowState {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view saving throws for characters you do not own");
    };
    saveThrowStates.get(characterId);
  };

  public shared ({ caller }) func updateSaveThrowState(characterId : CharacterId, state : SaveThrowState) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update saving throws for characters you do not own");
    };
    saveThrowStates.add(characterId, state);
  };

  // ─── Character Proficiencies ─────────────────────────────────────────────────

  public shared ({ caller }) func addCharacterProficiency(characterId : CharacterId, profType : Text, name : Text) : async Nat {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add proficiencies to characters you do not own");
    };
    let id = nextCharacterProficiencyId;
    nextCharacterProficiencyId += 1;
    characterProficiencies.add(id, { id; characterId; profType; name });
    id;
  };

  public query ({ caller }) func getCharacterProficienciesByCharacter(characterId : CharacterId) : async [CharacterProficiency] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view proficiencies for characters you do not own");
    };
    let resultList = List.empty<CharacterProficiency>();
    for ((_, prof) in characterProficiencies.entries()) {
      if (prof.characterId == characterId) { resultList.add(prof) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func deleteCharacterProficiency(id : Nat) : async () {
    requireAuth(caller);
    switch (characterProficiencies.get(id)) {
      case (null) { Runtime.trap("Proficiency not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete proficiencies for characters you do not own");
        };
        characterProficiencies.remove(id);
      };
    };
  };

  // ─── Custom Stats (global library) ──────────────────────────────────────────

  public type CustomStat = {
    id : Nat;
    name : Text;
    description : Text;
    defaultValue : Text;
    owner : Principal;
  };

  public type CharacterCustomStat = {
    id : Nat;
    characterId : CharacterId;
    statId : Nat;
    statName : Text;
    value : Text;
    owner : Principal;
  };

  let customStats = Map.empty<Nat, CustomStat>();
  let characterCustomStats = Map.empty<Nat, CharacterCustomStat>();
  var nextCustomStatId = 1;
  var nextCharacterCustomStatId = 1;

  public shared ({ caller }) func addCustomStat(name : Text, description : Text, defaultValue : Text) : async Nat {
    requireAuth(caller);
    let id = nextCustomStatId;
    nextCustomStatId += 1;
    customStats.add(id, { id; name; description; defaultValue; owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomStats() : async [CustomStat] {
    requireAuth(caller);
    let resultList = List.empty<CustomStat>();
    for ((_, stat) in customStats.entries()) {
      if (Principal.equal(stat.owner, caller)) { resultList.add(stat) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomStat(id : Nat, name : Text, description : Text, defaultValue : Text) : async () {
    requireAuth(caller);
    switch (customStats.get(id)) {
      case (null) { Runtime.trap("Custom stat not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot edit stats you do not own");
        };
        customStats.add(id, { existing with name; description; defaultValue });
      };
    };
  };

  public shared ({ caller }) func deleteCustomStat(id : Nat) : async () {
    requireAuth(caller);
    switch (customStats.get(id)) {
      case (null) { Runtime.trap("Custom stat not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete stats you do not own");
        };
        customStats.remove(id);
      };
    };
  };

  public shared ({ caller }) func addCharacterCustomStat(characterId : CharacterId, statId : Nat, statName : Text, value : Text) : async Nat {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add stats to characters you do not own");
    };
    let id = nextCharacterCustomStatId;
    nextCharacterCustomStatId += 1;
    characterCustomStats.add(id, { id; characterId; statId; statName; value; owner = caller });
    id;
  };

  public query ({ caller }) func getCharacterCustomStatsByCharacter(characterId : CharacterId) : async [CharacterCustomStat] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view stats for characters you do not own");
    };
    let resultList = List.empty<CharacterCustomStat>();
    for ((_, stat) in characterCustomStats.entries()) {
      if (stat.characterId == characterId) { resultList.add(stat) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterCustomStat(id : Nat, value : Text) : async () {
    requireAuth(caller);
    switch (characterCustomStats.get(id)) {
      case (null) { Runtime.trap("Character custom stat not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot edit stats for characters you do not own");
        };
        characterCustomStats.add(id, { existing with value });
      };
    };
  };

  public shared ({ caller }) func deleteCharacterCustomStat(id : Nat) : async () {
    requireAuth(caller);
    switch (characterCustomStats.get(id)) {
      case (null) { Runtime.trap("Character custom stat not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete stats for characters you do not own");
        };
        characterCustomStats.remove(id);
      };
    };
  };

  // ─── Export / Import ─────────────────────────────────────────────────────────

  public query ({ caller }) func exportCharacter(characterId : CharacterId) : async Text {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot export characters you do not own");
    };
    let char = switch (characters.get(characterId)) {
      case (null) { Runtime.trap("Character not found") };
      case (?c) { c };
    };

    // Gather spells
    let spellParts = List.empty<Text>();
    for ((sid, spell) in spells.entries()) {
      if (spell.characterId == characterId) {
        spellParts.add(
          "{\"id\":" # sid.toText() #
          ",\"name\":\"" # spell.name # "\"" #
          ",\"level\":" # spell.level.toText() #
          ",\"school\":\"" # spell.school # "\"" #
          ",\"castingTime\":\"" # spell.castingTime # "\"" #
          ",\"range\":\"" # spell.range # "\"" #
          ",\"components\":\"" # spell.components # "\"" #
          ",\"duration\":\"" # spell.duration # "\"" #
          ",\"damageEffect\":\"" # spell.damageEffect # "\"" #
          ",\"description\":\"" # spell.description # "\"}"
        );
      };
    };

    // Gather items
    let itemParts = List.empty<Text>();
    for ((iid, item) in inventoryItems.entries()) {
      if (item.characterId == characterId) {
        itemParts.add(
          "{\"id\":" # iid.toText() #
          ",\"name\":\"" # item.name # "\"" #
          ",\"description\":\"" # item.description # "\"" #
          ",\"quantity\":" # item.quantity.toText() #
          ",\"weight\":" # item.weight.toText() #
          ",\"equipped\":" # (if (item.equipped) "true" else "false") # "}"
        );
      };
    };

    // Gather abilities
    let abilityParts = List.empty<Text>();
    for ((aid, ability) in characterAbilities.entries()) {
      if (ability.characterId == characterId) {
        abilityParts.add(
          "{\"id\":" # aid.toText() #
          ",\"name\":\"" # ability.name # "\"" #
          ",\"description\":\"" # ability.description # "\"" #
          ",\"abilityType\":\"" # ability.abilityType # "\"" #
          ",\"uses\":" # ability.uses.toText() #
          ",\"usesRemaining\":" # ability.usesRemaining.toText() #
          ",\"rechargeOn\":\"" # ability.rechargeOn # "\"}"
        );
      };
    };

    // Gather attacks
    let attackParts = List.empty<Text>();
    for ((atid, attack) in characterPhysicalAttacks.entries()) {
      if (attack.characterId == characterId) {
        attackParts.add(
          "{\"id\":" # atid.toText() #
          ",\"name\":\"" # attack.name # "\"" #
          ",\"description\":\"" # attack.description # "\"" #
          ",\"damageDice\":\"" # attack.damageDice # "\"" #
          ",\"attackBonus\":" # attack.attackBonus.toText() #
          ",\"damageType\":\"" # attack.damageType # "\"" #
          ",\"range\":\"" # attack.range # "\"" #
          ",\"properties\":\"" # attack.properties # "\"" #
          ",\"timesUsed\":" # attack.timesUsed.toText() # "}"
        );
      };
    };

    // HP state
    let hpJson = switch (hpStates.get(characterId)) {
      case (null) { "null" };
      case (?hp) {
        "{\"hpCurrent\":" # hp.hpCurrent.toText() #
        ",\"hpMax\":" # hp.hpMax.toText() #
        ",\"hpTemp\":" # hp.hpTemp.toText() # "}"
      };
    };

    // Currency state
    let currencyJson = switch (currencyStates.get(characterId)) {
      case (null) { "null" };
      case (?c) {
        "{\"gold\":" # c.gold.toText() #
        ",\"silver\":" # c.silver.toText() #
        ",\"copper\":" # c.copper.toText() #
        ",\"platinum\":" # c.platinum.toText() #
        ",\"electrum\":" # c.electrum.toText() # "}"
      };
    };

    // Spell slots
    let slotParts = List.empty<Text>();
    switch (spellSlotStates.get(characterId)) {
      case (null) {};
      case (?slots) {
        for (slot in slots.values()) {
          slotParts.add(
            "{\"spellLevel\":" # slot.spellLevel.toText() #
            ",\"used\":" # slot.used.toText() #
            ",\"total\":" # slot.total.toText() # "}"
          );
        };
      };
    };

    let joinedSpells = spellParts.values().join(",");
    let joinedItems = itemParts.values().join(",");
    let joinedAbilities = abilityParts.values().join(",");
    let joinedAttacks = attackParts.values().join(",");
    let joinedSlots = slotParts.values().join(",");

    "{\"character\":{" #
    "\"name\":\"" # char.name # "\"" #
    ",\"race\":\"" # char.race # "\"" #
    ",\"characterClass\":\"" # char.characterClass # "\"" #
    ",\"gender\":\"" # char.gender # "\"" #
    ",\"background\":\"" # char.background # "\"" #
    ",\"alignment\":\"" # char.alignment # "\"" #
    ",\"level\":" # char.level.toText() #
    ",\"str\":" # char.str.toText() #
    ",\"dex\":" # char.dex.toText() #
    ",\"con\":" # char.con.toText() #
    ",\"int\":" # char.int.toText() #
    ",\"wis\":" # char.wis.toText() #
    ",\"cha\":" # char.cha.toText() #
    ",\"hpMax\":" # char.hpMax.toText() #
    ",\"hpCurrent\":" # char.hpCurrent.toText() #
    ",\"ac\":" # char.ac.toText() #
    ",\"speed\":" # char.speed.toText() #
    ",\"initiative\":" # char.initiative.toText() #
    ",\"proficiencyBonus\":" # char.proficiencyBonus.toText() #
    ",\"gold\":" # char.gold.toText() #
    ",\"notes\":\"" # char.notes # "\"" #
    "}" #
    ",\"spells\":[" # joinedSpells # "]" #
    ",\"items\":[" # joinedItems # "]" #
    ",\"abilities\":[" # joinedAbilities # "]" #
    ",\"attacks\":[" # joinedAttacks # "]" #
    ",\"hpState\":" # hpJson #
    ",\"currency\":" # currencyJson #
    ",\"spellSlots\":[" # joinedSlots # "]" #
    "}";
  };

  public shared ({ caller }) func importCharacter(input : ImportCharacterInput) : async CharacterId {
    requireAuth(caller);
    let defaultSkills : Skills = {
      acrobatics = false;
      animalHandling = false;
      arcana = false;
      athletics = false;
      deception = false;
      history = false;
      insight = false;
      intimidation = false;
      investigation = false;
      medicine = false;
      nature = false;
      perception = false;
      performance = false;
      persuasion = false;
      religion = false;
      sleightOfHand = false;
      stealth = false;
      survival = false;
      description = "";
    };
    let newChar : Character = {
      name = input.name;
      race = input.race;
      characterClass = input.characterClass;
      gender = input.gender;
      background = input.background;
      alignment = input.alignment;
      level = input.level;
      str = input.str;
      dex = input.dex;
      con = input.con;
      int = input.int;
      wis = input.wis;
      cha = input.cha;
      hpMax = input.hpMax;
      hpCurrent = input.hpCurrent;
      ac = input.ac;
      speed = input.speed;
      initiative = input.initiative;
      proficiencyBonus = input.proficiencyBonus;
      gold = input.gold;
      notes = input.notes;
      spellSlots = input.spellSlots;
      skills = defaultSkills;
      owner = caller;
      portraitUrl = input.portraitUrl;
    };
    let characterId = nextCharacterId;
    nextCharacterId += 1;
    characters.add(characterId, newChar);
    characterId;
  };

  // ─── Army CRUD ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func addArmy(input : ArmyInput) : async Text {
    requireAuth(caller);
    let id = "army-" # nextArmyId.toText();
    nextArmyId += 1;
    let army : Army = {
      id;
      characterId = input.characterId;
      commandingCharacterId = input.commandingCharacterId;
      owner = caller;
      name = input.name;
      size = input.size;
      moraleRating = input.moraleRating;
      powerLevel = input.powerLevel;
      status = input.status;
      race = input.race;
      specialties = input.specialties;
      faction = input.faction;
      banner = input.banner;
      trainingLevel = input.trainingLevel;
      condition = input.condition;
      foundingDate = input.foundingDate;
      terrainNotes = input.terrainNotes;
      warChest = input.warChest;
      ranks = input.ranks;
      branches = input.branches;
      specOpsGroups = input.specOpsGroups;
      machinery = input.machinery;
      officers = input.officers;
      commanders = input.commanders;
      armyAbilities = input.armyAbilities;
      officerAbilities = input.officerAbilities;
      commanderAbilities = input.commanderAbilities;
      logistics = input.logistics;
      commandStructure = input.commandStructure;
      intelligence = input.intelligence;
      moraleData = input.moraleData;
      alliedArmies = input.alliedArmies;
      armyNotes = input.armyNotes;
    };
    armies.add(id, army);
    id;
  };

  public query ({ caller }) func getArmiesByCharacter(characterId : CharacterId) : async [Army] {
    requireAuth(caller);
    let resultList = List.empty<Army>();
    for ((_, army) in armies.entries()) {
      if (army.characterId == characterId and Principal.equal(army.owner, caller)) {
        resultList.add(army);
      };
    };
    resultList.toArray();
  };

  public query ({ caller }) func getArmies() : async [Army] {
    requireAuth(caller);
    let resultList = List.empty<Army>();
    for ((_, army) in armies.entries()) {
      if (Principal.equal(army.owner, caller)) {
        resultList.add(army);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateArmy(id : Text, input : ArmyInput) : async () {
    requireAuth(caller);
    switch (armies.get(id)) {
      case (null) { Runtime.trap("Army not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot modify armies you do not own");
        };
        let updated : Army = {
          id;
          characterId = existing.characterId;
          commandingCharacterId = input.commandingCharacterId;
          owner = caller;
          name = input.name;
          size = input.size;
          moraleRating = input.moraleRating;
          powerLevel = input.powerLevel;
          status = input.status;
          race = input.race;
          specialties = input.specialties;
          faction = input.faction;
          banner = input.banner;
          trainingLevel = input.trainingLevel;
          condition = input.condition;
          foundingDate = input.foundingDate;
          terrainNotes = input.terrainNotes;
          warChest = input.warChest;
          ranks = input.ranks;
          branches = input.branches;
          specOpsGroups = input.specOpsGroups;
          machinery = input.machinery;
          officers = input.officers;
          commanders = input.commanders;
          armyAbilities = input.armyAbilities;
          officerAbilities = input.officerAbilities;
          commanderAbilities = input.commanderAbilities;
          logistics = input.logistics;
          commandStructure = input.commandStructure;
          intelligence = input.intelligence;
          moraleData = input.moraleData;
          alliedArmies = input.alliedArmies;
          armyNotes = input.armyNotes;
        };
        armies.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteArmy(id : Text) : async () {
    requireAuth(caller);
    switch (armies.get(id)) {
      case (null) { Runtime.trap("Army not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete armies you do not own");
        };
        armies.remove(id);
      };
    };
  };

  // ─── New Types: Character Sheet additions ────────────────────────────────────

  public type ConcentrationState = {
    concentrationSpellId : ?Text;
    concentrationSpellName : ?Text;
  };

  public type RestState = {
    shortRestsUsed : Nat;
    longRestsUsed : Nat;
    lastLongRestDate : ?Text;
  };

  public type InspirationState = {
    points : Nat;
    labelText : Text;
  };

  public type AttunedItem = {
    id : Text;
    itemName : Text;
    notes : Text;
  };

  public type EquipmentSlot = {
    id : Text;
    slotName : Text;
    itemName : Text;
    itemId : ?Text;
    notes : Text;
  };

  // ─── New Types: Army additions ───────────────────────────────────────────────

  public type ArmyRelationship = {
    id : Text;
    armyName : Text;
    relationship : Text;
    notes : Text;
  };

  public type OfficerDuel = {
    id : Text;
    officer1 : Text;
    officer2 : Text;
    outcome : Text;
    date : Text;
    notes : Text;
  };

  public type RecruitmentEntry = {
    id : Text;
    date : Text;
    location : Text;
    amount : Nat;
    method : Text;
    notes : Text;
  };

  public type BattleEngagement = {
    id : Text;
    name : Text;
    date : Text;
    outcome : Text;
    notes : Text;
    losses : Text;
  };

  public type SupplyConsumptionEntry = {
    id : Text;
    date : Text;
    foodConsumed : Nat;
    ammoConsumed : Nat;
    notes : Text;
  };

  // ─── New Types: World Building ───────────────────────────────────────────────

  public type Location = {
    id : Text;
    name : Text;
    locationType : Text;
    region : Text;
    description : Text;
    notes : Text;
    visitedDate : Text;
    owner : Principal;
    factionId : ?Nat;
  };

  public type LoreEntry = {
    id : Text;
    title : Text;
    category : Text;
    content : Text;
    createdAt : Text;
    owner : Principal;
  };

  public type TimelineEvent = {
    id : Text;
    title : Text;
    date : Text;
    category : Text;
    description : Text;
    characters : [Text];
    armies : [Text];
    owner : Principal;
    linkedFactionId : ?Nat;
    linkedLocationId : ?Nat;
  };

  // ─── New Types: Organization ─────────────────────────────────────────────────

  public type Campaign = {
    id : Text;
    name : Text;
    description : Text;
    characterIds : [Text];
    armyIds : [Text];
    notes : Text;
    status : Text;
    startDate : Text;
    owner : Principal;
  };

  public type SessionEntry = {
    id : Text;
    campaignId : ?Text;
    title : Text;
    date : Text;
    summary : Text;
    xpGained : Nat;
    loot : Text;
    notes : Text;
    owner : Principal;
    linkedEncounterIds : [Nat];
    linkedNpcIds : [Nat];
    linkedQuestIds : [Nat];
  };

  public type EncounterEntry = {
    id : Text;
    campaignId : ?Text;
    name : Text;
    date : Text;
    difficulty : Text;
    outcome : Text;
    xpAwarded : Nat;
    notes : Text;
    owner : Principal;
    locationId : ?Nat;
    linkedNpcIds : [Nat];
  };

  public type NPC = {
    id : Text;
    name : Text;
    race : Text;
    location : Text;
    relationship : Text;
    description : Text;
    notes : Text;
    owner : Principal;
    factionId : ?Nat;
    locationId : ?Nat;
  };

  public type Quest = {
    id : Text;
    title : Text;
    status : Text;
    description : Text;
    objectives : Text;
    reward : Text;
    notes : Text;
    linkedNpcIds : [Nat];
    linkedFactionIds : [Nat];
  };

  public type PartyNote = {
    id : Text;
    title : Text;
    content : Text;
    createdAt : Text;
    owner : Principal;
  };

  public type PartyInventoryItem = {
    id : Text;
    name : Text;
    quantity : Nat;
    weight : Text;
    value : Text;
    description : Text;
    notes : Text;
    owner : Principal;
  };

  // ─── XP State ────────────────────────────────────────────────────────────────

  public type XpState = {
    characterId : CharacterId;
    xp : Nat;
    totalXpEarned : Nat;
    milestoneMode : Bool;
    milestoneNotes : Text;
  };

  let xpStates = Map.empty<CharacterId, XpState>();

  public query ({ caller }) func getXpState(characterId : CharacterId) : async ?XpState {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view XP for characters you do not own");
    };
    xpStates.get(characterId);
  };

  public shared ({ caller }) func updateXpState(characterId : CharacterId, state : XpState) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update XP for characters you do not own");
    };
    xpStates.add(characterId, { state with characterId });
    // Auto-apply level after every XP save
    await calculateAndApplyCharacterLevel(caller, characterId);
  };

  // XP thresholds for D&D 5e levels 1-20 (index 0 = level 1 threshold)
  let XP_LEVEL_THRESHOLDS : [Nat] = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ];

  // Calculate what level a given amount of totalXpEarned corresponds to
  func xpToLevel(totalXp : Nat, maxLvl : Nat) : Nat {
    var level : Nat = 1;
    // Check standard D&D 5e thresholds up to level 20
    let tableSize = XP_LEVEL_THRESHOLDS.size();
    var i : Nat = 1;
    while (i < tableSize and i < maxLvl) {
      if (totalXp >= XP_LEVEL_THRESHOLDS[i]) {
        level := i + 1;
      };
      i += 1;
    };
    // Beyond level 20: each level requires 50000 more XP
    if (level >= 20 and maxLvl > 20) {
      let baseXp = XP_LEVEL_THRESHOLDS[tableSize - 1]; // 355000
      if (totalXp >= baseXp) {
        let extra = totalXp - baseXp;
        let extraLevels = extra / 50000;
        let candidate = 20 + extraLevels;
        level := if (candidate > maxLvl) maxLvl else candidate;
      };
    };
    if (level > maxLvl) { maxLvl } else { level };
  };

  // Recalculate proficiency bonus: 2 + floor((level - 1) / 4)
  func profBonusForLevel(level : Nat) : Nat {
    2 + (level - 1) / 4;
  };

  // Calculate and apply the correct level to a character based on their XP
  func calculateAndApplyCharacterLevel(caller : Principal, characterId : CharacterId) : async () {
    let settings = switch (userSettings.get(caller)) {
      case (?s) { s };
      case (null) { { maxLevel = 10000 } };
    };
    switch (xpStates.get(characterId)) {
      case (null) {}; // No XP state yet, nothing to do
      case (?xpState) {
        switch (characters.get(characterId)) {
          case (null) {}; // Character not found
          case (?char) {
            if (not Principal.equal(char.owner, caller)) { return };
            let newLevel = xpToLevel(xpState.totalXpEarned, settings.maxLevel);
            let newProf = profBonusForLevel(newLevel);
            if (newLevel != char.level or newProf != char.proficiencyBonus) {
              characters.add(characterId, { char with level = newLevel; proficiencyBonus = newProf });
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func applyCharacterLevelFromXp(characterId : CharacterId) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update level for characters you do not own");
    };
    await calculateAndApplyCharacterLevel(caller, characterId);
  };

  // ─── New Storage ─────────────────────────────────────────────────────────────

  // Character sheet additions
  let concentrationStates = Map.empty<CharacterId, ConcentrationState>();
  let restStates = Map.empty<CharacterId, RestState>();
  let inspirationStates = Map.empty<CharacterId, InspirationState>();
  let attunedItems = Map.empty<CharacterId, List.List<AttunedItem>>();
  let equipmentSlots = Map.empty<CharacterId, List.List<EquipmentSlot>>();
  let preparedSpells = Map.empty<CharacterId, List.List<Text>>();

  // Army additions (keyed by armyId)
  let armyRelationships = Map.empty<Text, List.List<ArmyRelationship>>();
  let officerDuels = Map.empty<Text, List.List<OfficerDuel>>();
  let recruitmentLogs = Map.empty<Text, List.List<RecruitmentEntry>>();
  let battleEngagements = Map.empty<Text, List.List<BattleEngagement>>();
  let supplyConsumptionLogs = Map.empty<Text, List.List<SupplyConsumptionEntry>>();

  // World building (owner-scoped)
  let locations = Map.empty<Text, Location>();
  let loreEntries = Map.empty<Text, LoreEntry>();
  let timelineEvents = Map.empty<Text, TimelineEvent>();

  // Organization (owner-scoped)
  let campaigns = Map.empty<Text, Campaign>();
  let sessionLog = Map.empty<Text, SessionEntry>();
  let encounterLog = Map.empty<Text, EncounterEntry>();
  let npcs = Map.empty<Text, NPC>();
  let quests = Map.empty<CharacterId, List.List<Quest>>();
  let partyNotes = Map.empty<Text, PartyNote>();
  let partyInventory = Map.empty<Text, PartyInventoryItem>();

  // ID counters for new text-keyed entities
  var nextLocationId = 0;
  var nextLoreEntryId = 0;
  var nextTimelineEventId = 0;
  var nextCampaignId = 0;
  var nextSessionEntryId = 0;
  var nextEncounterEntryId = 0;
  var nextNPCId = 0;
  var nextPartyNoteId = 0;
  var nextPartyInventoryItemId = 0;

  // ─── Spell Preparation ───────────────────────────────────────────────────────

  public shared ({ caller }) func setPreparedSpells(characterId : CharacterId, spellIds : [Text]) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot set prepared spells for characters you do not own");
    };
    let spellList = List.empty<Text>();
    for (sid in spellIds.values()) {
      spellList.add(sid);
    };
    preparedSpells.add(characterId, spellList);
  };

  public query ({ caller }) func getPreparedSpells(characterId : CharacterId) : async [Text] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot get prepared spells for characters you do not own");
    };
    switch (preparedSpells.get(characterId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // ─── Concentration Tracker ───────────────────────────────────────────────────

  public query ({ caller }) func getConcentrationState(characterId : CharacterId) : async ?ConcentrationState {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot get concentration state for characters you do not own");
    };
    concentrationStates.get(characterId);
  };

  public shared ({ caller }) func updateConcentrationState(characterId : CharacterId, state : ConcentrationState) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update concentration state for characters you do not own");
    };
    concentrationStates.add(characterId, state);
  };

  // ─── Rest Tracker ────────────────────────────────────────────────────────────

  public query ({ caller }) func getRestState(characterId : CharacterId) : async ?RestState {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot get rest state for characters you do not own");
    };
    restStates.get(characterId);
  };

  public shared ({ caller }) func updateRestState(characterId : CharacterId, state : RestState) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update rest state for characters you do not own");
    };
    restStates.add(characterId, state);
  };

  // ─── Inspiration Tracker ─────────────────────────────────────────────────────

  public query ({ caller }) func getInspirationState(characterId : CharacterId) : async ?InspirationState {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot get inspiration state for characters you do not own");
    };
    inspirationStates.get(characterId);
  };

  public shared ({ caller }) func updateInspirationState(characterId : CharacterId, state : InspirationState) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update inspiration state for characters you do not own");
    };
    inspirationStates.add(characterId, state);
  };

  // ─── Attunement Tracker ──────────────────────────────────────────────────────

  public query ({ caller }) func getAttunedItems(characterId : CharacterId) : async [AttunedItem] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot get attuned items for characters you do not own");
    };
    switch (attunedItems.get(characterId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func addAttunedItem(characterId : CharacterId, item : AttunedItem) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add attuned items for characters you do not own");
    };
    let list = switch (attunedItems.get(characterId)) {
      case (null) { List.empty<AttunedItem>() };
      case (?l) { l };
    };
    list.add(item);
    attunedItems.add(characterId, list);
  };

  public shared ({ caller }) func removeAttunedItem(characterId : CharacterId, itemId : Text) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot remove attuned items for characters you do not own");
    };
    switch (attunedItems.get(characterId)) {
      case (null) {};
      case (?list) {
        let filtered = list.filter(func(i : AttunedItem) : Bool { i.id != itemId });
        attunedItems.add(characterId, filtered);
      };
    };
  };

  // ─── Equipment Slots ─────────────────────────────────────────────────────────

  public query ({ caller }) func getEquipmentSlots(characterId : CharacterId) : async [EquipmentSlot] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot get equipment slots for characters you do not own");
    };
    switch (equipmentSlots.get(characterId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateEquipmentSlots(characterId : CharacterId, slots : [EquipmentSlot]) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update equipment slots for characters you do not own");
    };
    let slotList = List.empty<EquipmentSlot>();
    for (slot in slots.values()) {
      slotList.add(slot);
    };
    equipmentSlots.add(characterId, slotList);
  };

  // ─── Character Portrait ──────────────────────────────────────────────────────

  public shared ({ caller }) func updateCharacterPortrait(characterId : CharacterId, url : Text) : async () {
    requireAuth(caller);
    switch (characters.get(characterId)) {
      case (null) { Runtime.trap("Character not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update portrait for characters you do not own");
        };
        characters.add(characterId, { existing with portraitUrl = url });
      };
    };
  };

  // Helper: verify army ownership
  private func verifyArmyOwnership(caller : Principal, armyId : Text) : Bool {
    switch (armies.get(armyId)) {
      case (null) { false };
      case (?army) { Principal.equal(army.owner, caller) };
    };
  };

  // ─── Army Relationship Tracker ───────────────────────────────────────────────

  public query ({ caller }) func getArmyRelationships(armyId : Text) : async [ArmyRelationship] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot get relationships for armies you do not own");
    };
    switch (armyRelationships.get(armyId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateArmyRelationships(armyId : Text, relationships : [ArmyRelationship]) : async () {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot update relationships for armies you do not own");
    };
    let relList = List.empty<ArmyRelationship>();
    for (rel in relationships.values()) {
      relList.add(rel);
    };
    armyRelationships.add(armyId, relList);
  };

  // ─── Army Banner ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func updateArmyBanner(armyId : Text, url : Text) : async () {
    requireAuth(caller);
    switch (armies.get(armyId)) {
      case (null) { Runtime.trap("Army not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update banner for armies you do not own");
        };
        armies.add(armyId, { existing with banner = url });
      };
    };
  };

  // ─── Officer Duel Log ────────────────────────────────────────────────────────

  public query ({ caller }) func getOfficerDuels(armyId : Text) : async [OfficerDuel] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot get officer duels for armies you do not own");
    };
    switch (officerDuels.get(armyId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func addOfficerDuel(armyId : Text, duel : OfficerDuel) : async () {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add officer duels for armies you do not own");
    };
    let list = switch (officerDuels.get(armyId)) {
      case (null) { List.empty<OfficerDuel>() };
      case (?l) { l };
    };
    list.add(duel);
    officerDuels.add(armyId, list);
  };

  public shared ({ caller }) func deleteOfficerDuel(armyId : Text, duelId : Text) : async () {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot delete officer duels for armies you do not own");
    };
    switch (officerDuels.get(armyId)) {
      case (null) {};
      case (?list) {
        let filtered = list.filter(func(d : OfficerDuel) : Bool { d.id != duelId });
        officerDuels.add(armyId, filtered);
      };
    };
  };

  // ─── Recruitment Log ─────────────────────────────────────────────────────────

  public query ({ caller }) func getRecruitmentLog(armyId : Text) : async [RecruitmentEntry] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot get recruitment log for armies you do not own");
    };
    switch (recruitmentLogs.get(armyId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func addRecruitmentEntry(armyId : Text, entry : RecruitmentEntry) : async () {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add recruitment entries for armies you do not own");
    };
    let list = switch (recruitmentLogs.get(armyId)) {
      case (null) { List.empty<RecruitmentEntry>() };
      case (?l) { l };
    };
    list.add(entry);
    recruitmentLogs.add(armyId, list);
  };

  public shared ({ caller }) func deleteRecruitmentEntry(armyId : Text, entryId : Text) : async () {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot delete recruitment entries for armies you do not own");
    };
    switch (recruitmentLogs.get(armyId)) {
      case (null) {};
      case (?list) {
        let filtered = list.filter(func(e : RecruitmentEntry) : Bool { e.id != entryId });
        recruitmentLogs.add(armyId, filtered);
      };
    };
  };

  // ─── Battle Engagements ──────────────────────────────────────────────────────

  public query ({ caller }) func getBattleEngagements(armyId : Text) : async [BattleEngagement] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot get battle engagements for armies you do not own");
    };
    switch (battleEngagements.get(armyId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func addBattleEngagement(armyId : Text, engagement : BattleEngagement) : async () {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add battle engagements for armies you do not own");
    };
    let list = switch (battleEngagements.get(armyId)) {
      case (null) { List.empty<BattleEngagement>() };
      case (?l) { l };
    };
    list.add(engagement);
    battleEngagements.add(armyId, list);
  };

  public shared ({ caller }) func deleteBattleEngagement(armyId : Text, engagementId : Text) : async () {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot delete battle engagements for armies you do not own");
    };
    switch (battleEngagements.get(armyId)) {
      case (null) {};
      case (?list) {
        let filtered = list.filter(func(e : BattleEngagement) : Bool { e.id != engagementId });
        battleEngagements.add(armyId, filtered);
      };
    };
  };

  // ─── Supply Consumption Log ──────────────────────────────────────────────────

  public query ({ caller }) func getSupplyConsumptionLog(armyId : Text) : async [SupplyConsumptionEntry] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot get supply log for armies you do not own");
    };
    switch (supplyConsumptionLogs.get(armyId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func logSupplyConsumption(armyId : Text, entry : SupplyConsumptionEntry) : async () {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot log supply consumption for armies you do not own");
    };
    let list = switch (supplyConsumptionLogs.get(armyId)) {
      case (null) { List.empty<SupplyConsumptionEntry>() };
      case (?l) { l };
    };
    list.add(entry);
    supplyConsumptionLogs.add(armyId, list);
  };

  // ─── Locations ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func addLocation(loc : Location) : async () {
    requireAuth(caller);
    let id = "loc-" # nextLocationId.toText();
    nextLocationId += 1;
    locations.add(id, { loc with id; owner = caller; factionId = loc.factionId });
  };

  public query ({ caller }) func getLocations() : async [Location] {
    requireAuth(caller);
    let resultList = List.empty<Location>();
    for ((_, loc) in locations.entries()) {
      if (Principal.equal(loc.owner, caller)) { resultList.add(loc) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateLocation(loc : Location) : async () {
    requireAuth(caller);
    switch (locations.get(loc.id)) {
      case (null) { Runtime.trap("Location not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update locations you do not own");
        };
        locations.add(loc.id, { loc with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteLocation(id : Text) : async () {
    requireAuth(caller);
    switch (locations.get(id)) {
      case (null) { Runtime.trap("Location not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete locations you do not own");
        };
        locations.remove(id);
      };
    };
  };

  // ─── Lore & World Notes ──────────────────────────────────────────────────────

  public shared ({ caller }) func addLoreEntry(entry : LoreEntry) : async () {
    requireAuth(caller);
    let id = "lore-" # nextLoreEntryId.toText();
    nextLoreEntryId += 1;
    loreEntries.add(id, { entry with id; owner = caller });
  };

  public query ({ caller }) func getLoreEntries() : async [LoreEntry] {
    requireAuth(caller);
    let resultList = List.empty<LoreEntry>();
    for ((_, entry) in loreEntries.entries()) {
      if (Principal.equal(entry.owner, caller)) { resultList.add(entry) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateLoreEntry(entry : LoreEntry) : async () {
    requireAuth(caller);
    switch (loreEntries.get(entry.id)) {
      case (null) { Runtime.trap("Lore entry not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update lore entries you do not own");
        };
        loreEntries.add(entry.id, { entry with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteLoreEntry(id : Text) : async () {
    requireAuth(caller);
    switch (loreEntries.get(id)) {
      case (null) { Runtime.trap("Lore entry not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete lore entries you do not own");
        };
        loreEntries.remove(id);
      };
    };
  };

  // ─── Timeline ────────────────────────────────────────────────────────────────

  public shared ({ caller }) func addTimelineEvent(event : TimelineEvent) : async () {
    requireAuth(caller);
    let id = "timeline-" # nextTimelineEventId.toText();
    nextTimelineEventId += 1;
    timelineEvents.add(id, { event with id; owner = caller; linkedFactionId = event.linkedFactionId; linkedLocationId = event.linkedLocationId });
  };

  public query ({ caller }) func getTimelineEvents() : async [TimelineEvent] {
    requireAuth(caller);
    let resultList = List.empty<TimelineEvent>();
    for ((_, event) in timelineEvents.entries()) {
      if (Principal.equal(event.owner, caller)) { resultList.add(event) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateTimelineEvent(event : TimelineEvent) : async () {
    requireAuth(caller);
    switch (timelineEvents.get(event.id)) {
      case (null) { Runtime.trap("Timeline event not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update timeline events you do not own");
        };
        timelineEvents.add(event.id, { event with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteTimelineEvent(id : Text) : async () {
    requireAuth(caller);
    switch (timelineEvents.get(id)) {
      case (null) { Runtime.trap("Timeline event not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete timeline events you do not own");
        };
        timelineEvents.remove(id);
      };
    };
  };

  // ─── Campaign Manager ────────────────────────────────────────────────────────

  public shared ({ caller }) func addCampaign(campaign : Campaign) : async () {
    requireAuth(caller);
    let id = "campaign-" # nextCampaignId.toText();
    nextCampaignId += 1;
    campaigns.add(id, { campaign with id; owner = caller });
  };

  public query ({ caller }) func getCampaigns() : async [Campaign] {
    requireAuth(caller);
    let resultList = List.empty<Campaign>();
    for ((_, campaign) in campaigns.entries()) {
      if (Principal.equal(campaign.owner, caller)) { resultList.add(campaign) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCampaign(campaign : Campaign) : async () {
    requireAuth(caller);
    switch (campaigns.get(campaign.id)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update campaigns you do not own");
        };
        campaigns.add(campaign.id, { campaign with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCampaign(id : Text) : async () {
    requireAuth(caller);
    switch (campaigns.get(id)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete campaigns you do not own");
        };
        campaigns.remove(id);
      };
    };
  };

  // ─── Session Log ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func addSessionEntry(entry : SessionEntry) : async () {
    requireAuth(caller);
    let id = "session-" # nextSessionEntryId.toText();
    nextSessionEntryId += 1;
    sessionLog.add(id, { entry with id; owner = caller; linkedEncounterIds = entry.linkedEncounterIds; linkedNpcIds = entry.linkedNpcIds; linkedQuestIds = entry.linkedQuestIds });
  };

  public query ({ caller }) func getSessionLog() : async [SessionEntry] {
    requireAuth(caller);
    let resultList = List.empty<SessionEntry>();
    for ((_, entry) in sessionLog.entries()) {
      if (Principal.equal(entry.owner, caller)) { resultList.add(entry) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateSessionEntry(entry : SessionEntry) : async () {
    requireAuth(caller);
    switch (sessionLog.get(entry.id)) {
      case (null) { Runtime.trap("Session entry not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update session entries you do not own");
        };
        sessionLog.add(entry.id, { entry with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteSessionEntry(id : Text) : async () {
    requireAuth(caller);
    switch (sessionLog.get(id)) {
      case (null) { Runtime.trap("Session entry not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete session entries you do not own");
        };
        sessionLog.remove(id);
      };
    };
  };

  // ─── Encounter Tracker ───────────────────────────────────────────────────────

  public shared ({ caller }) func addEncounterEntry(entry : EncounterEntry) : async () {
    requireAuth(caller);
    let id = "encounter-" # nextEncounterEntryId.toText();
    nextEncounterEntryId += 1;
    encounterLog.add(id, { entry with id; owner = caller; locationId = entry.locationId; linkedNpcIds = entry.linkedNpcIds });
  };

  public query ({ caller }) func getEncounterLog() : async [EncounterEntry] {
    requireAuth(caller);
    let resultList = List.empty<EncounterEntry>();
    for ((_, entry) in encounterLog.entries()) {
      if (Principal.equal(entry.owner, caller)) { resultList.add(entry) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateEncounterEntry(entry : EncounterEntry) : async () {
    requireAuth(caller);
    switch (encounterLog.get(entry.id)) {
      case (null) { Runtime.trap("Encounter entry not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update encounter entries you do not own");
        };
        encounterLog.add(entry.id, { entry with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteEncounterEntry(id : Text) : async () {
    requireAuth(caller);
    switch (encounterLog.get(id)) {
      case (null) { Runtime.trap("Encounter entry not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete encounter entries you do not own");
        };
        encounterLog.remove(id);
      };
    };
  };

  // ─── NPC Tracker ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func addNPC(npc : NPC) : async () {
    requireAuth(caller);
    let id = "npc-" # nextNPCId.toText();
    nextNPCId += 1;
    npcs.add(id, { npc with id; owner = caller; factionId = npc.factionId; locationId = npc.locationId });
  };

  public query ({ caller }) func getNPCs() : async [NPC] {
    requireAuth(caller);
    let resultList = List.empty<NPC>();
    for ((_, npc) in npcs.entries()) {
      if (Principal.equal(npc.owner, caller)) { resultList.add(npc) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateNPC(npc : NPC) : async () {
    requireAuth(caller);
    switch (npcs.get(npc.id)) {
      case (null) { Runtime.trap("NPC not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update NPCs you do not own");
        };
        npcs.add(npc.id, { npc with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteNPC(id : Text) : async () {
    requireAuth(caller);
    switch (npcs.get(id)) {
      case (null) { Runtime.trap("NPC not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete NPCs you do not own");
        };
        npcs.remove(id);
      };
    };
  };

  // ─── Quest Log ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func addQuest(characterId : CharacterId, quest : Quest) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add quests for characters you do not own");
    };
    let list = switch (quests.get(characterId)) {
      case (null) { List.empty<Quest>() };
      case (?l) { l };
    };
    list.add(quest);
    quests.add(characterId, list);
  };

  public query ({ caller }) func getQuestsByCharacter(characterId : CharacterId) : async [Quest] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot get quests for characters you do not own");
    };
    switch (quests.get(characterId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateQuest(characterId : CharacterId, quest : Quest) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot update quests for characters you do not own");
    };
    switch (quests.get(characterId)) {
      case (null) { Runtime.trap("No quests found for character") };
      case (?list) {
        list.mapInPlace(func(q : Quest) : Quest {
          if (q.id == quest.id) { quest } else { q }
        });
      };
    };
  };

  public shared ({ caller }) func deleteQuest(characterId : CharacterId, questId : Text) : async () {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot delete quests for characters you do not own");
    };
    switch (quests.get(characterId)) {
      case (null) {};
      case (?list) {
        let filtered = list.filter(func(q : Quest) : Bool { q.id != questId });
        quests.add(characterId, filtered);
      };
    };
  };

  // ─── Campaign / Party Notes ──────────────────────────────────────────────────

  public shared ({ caller }) func addPartyNote(note : PartyNote) : async () {
    requireAuth(caller);
    let id = "pnote-" # nextPartyNoteId.toText();
    nextPartyNoteId += 1;
    partyNotes.add(id, { note with id; owner = caller });
  };

  public query ({ caller }) func getPartyNotes() : async [PartyNote] {
    requireAuth(caller);
    let resultList = List.empty<PartyNote>();
    for ((_, note) in partyNotes.entries()) {
      if (Principal.equal(note.owner, caller)) { resultList.add(note) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updatePartyNote(note : PartyNote) : async () {
    requireAuth(caller);
    switch (partyNotes.get(note.id)) {
      case (null) { Runtime.trap("Party note not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update party notes you do not own");
        };
        partyNotes.add(note.id, { note with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deletePartyNote(id : Text) : async () {
    requireAuth(caller);
    switch (partyNotes.get(id)) {
      case (null) { Runtime.trap("Party note not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete party notes you do not own");
        };
        partyNotes.remove(id);
      };
    };
  };

  // ─── Shared Party Inventory ──────────────────────────────────────────────────

  public shared ({ caller }) func addPartyInventoryItem(item : PartyInventoryItem) : async () {
    requireAuth(caller);
    let id = "pinv-" # nextPartyInventoryItemId.toText();
    nextPartyInventoryItemId += 1;
    partyInventory.add(id, { item with id; owner = caller });
  };

  public query ({ caller }) func getPartyInventory() : async [PartyInventoryItem] {
    requireAuth(caller);
    let resultList = List.empty<PartyInventoryItem>();
    for ((_, item) in partyInventory.entries()) {
      if (Principal.equal(item.owner, caller)) { resultList.add(item) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updatePartyInventoryItem(item : PartyInventoryItem) : async () {
    requireAuth(caller);
    switch (partyInventory.get(item.id)) {
      case (null) { Runtime.trap("Party inventory item not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot update party inventory items you do not own");
        };
        partyInventory.add(item.id, { item with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deletePartyInventoryItem(id : Text) : async () {
    requireAuth(caller);
    switch (partyInventory.get(id)) {
      case (null) { Runtime.trap("Party inventory item not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) {
          Runtime.trap("Unauthorized: Cannot delete party inventory items you do not own");
        };
        partyInventory.remove(id);
      };
    };
  };

  // ─── New Types: Battle Outcomes, Captured Enemies, Factions, Weather, Bestiary, Character Relationships, Calendar Events ───

  public type BattleOutcome = {
    id : Nat;
    armyId : Text;
    result : Text;
    opponent : Text;
    date : Text;
    casualties : Text;
    notes : Text;
    owner : Principal;
  };

  public type CapturedEnemy = {
    id : Nat;
    armyId : Text;
    name : Text;
    rank : Text;
    faction : Text;
    background : Text;
    status : Text;
    notes : Text;
    owner : Principal;
  };

  public type Faction = {
    id : Nat;
    name : Text;
    goals : Text;
    alignment : Text;
    description : Text;
    relationships : Text;
    characterAffiliations : Text;
    armyAffiliations : Text;
    notes : Text;
    owner : Principal;
  };

  public type WeatherEntry = {
    id : Nat;
    weatherType : Text;
    season : Text;
    effects : Text;
    startDate : Text;
    endDate : Text;
    notes : Text;
    owner : Principal;
  };

  public type BestiaryCreature = {
    id : Nat;
    name : Text;
    creatureType : Text;
    weaknesses : Text;
    behaviors : Text;
    immunities : Text;
    notes : Text;
    encounterCount : Nat;
    owner : Principal;
  };

  public type CharacterRelationship = {
    id : Nat;
    characterId : Text;
    relatedCharacterName : Text;
    relationshipType : Text;
    notes : Text;
    owner : Principal;
  };

  public type CalendarEvent = {
    id : Nat;
    title : Text;
    date : Text;
    category : Text;
    description : Text;
    linkedSessionId : Text;
    linkedEncounterId : Text;
    notes : Text;
    owner : Principal;
  };

  // ArmyMoraleHistoryEntry: timestamped morale adjustment with Int modifier
  public type ArmyMoraleHistoryEntry = {
    timestamp : Text;
    eventType : Text;
    modifier : Int;
    notes : Text;
  };

  // ─── Storage ────────────────────────────────────────────────────────────

  let battleOutcomes = Map.empty<Nat, BattleOutcome>();
  let capturedEnemies = Map.empty<Nat, CapturedEnemy>();
  let factions = Map.empty<Nat, Faction>();
  let weatherEntries = Map.empty<Nat, WeatherEntry>();
  let bestiaryCreatures = Map.empty<Nat, BestiaryCreature>();
  let characterRelationships = Map.empty<Nat, CharacterRelationship>();
  let calendarEvents = Map.empty<Nat, CalendarEvent>();
  let armyMoraleHistory = Map.empty<Text, List.List<ArmyMoraleHistoryEntry>>();

  var nextBattleOutcomeId : Nat = 0;
  var nextCapturedEnemyId : Nat = 0;
  var nextFactionId : Nat = 0;
  var nextWeatherEntryId : Nat = 0;
  var nextBestiaryCreatureId : Nat = 0;
  var nextCharacterRelationshipId : Nat = 0;
  var nextCalendarEventId : Nat = 0;

  // ─── BattleOutcome CRUD ────────────────────────────────────────────────────

  public shared ({ caller }) func addBattleOutcome(entry : BattleOutcome) : async Nat {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, entry.armyId)) {
      Runtime.trap("Unauthorized: Cannot add battle outcomes for armies you do not own");
    };
    let id = nextBattleOutcomeId;
    nextBattleOutcomeId += 1;
    battleOutcomes.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getBattleOutcomes(armyId : Text) : async [BattleOutcome] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot get battle outcomes for armies you do not own");
    };
    let resultList = List.empty<BattleOutcome>();
    for ((_, outcome) in battleOutcomes.entries()) {
      if (outcome.armyId == armyId and Principal.equal(outcome.owner, caller)) {
        resultList.add(outcome);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateBattleOutcome(entry : BattleOutcome) : async Bool {
    requireAuth(caller);
    switch (battleOutcomes.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          battleOutcomes.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteBattleOutcome(id : Nat) : async Bool {
    requireAuth(caller);
    switch (battleOutcomes.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          battleOutcomes.remove(id);
          true;
        };
      };
    };
  };

  // ─── CapturedEnemy CRUD ─────────────────────────────────────────────────

  public shared ({ caller }) func addCapturedEnemy(entry : CapturedEnemy) : async Nat {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, entry.armyId)) {
      Runtime.trap("Unauthorized: Cannot add captured enemies for armies you do not own");
    };
    let id = nextCapturedEnemyId;
    nextCapturedEnemyId += 1;
    capturedEnemies.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCapturedEnemies(armyId : Text) : async [CapturedEnemy] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot get captured enemies for armies you do not own");
    };
    let resultList = List.empty<CapturedEnemy>();
    for ((_, enemy) in capturedEnemies.entries()) {
      if (enemy.armyId == armyId and Principal.equal(enemy.owner, caller)) {
        resultList.add(enemy);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCapturedEnemy(entry : CapturedEnemy) : async Bool {
    requireAuth(caller);
    switch (capturedEnemies.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          capturedEnemies.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCapturedEnemy(id : Nat) : async Bool {
    requireAuth(caller);
    switch (capturedEnemies.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          capturedEnemies.remove(id);
          true;
        };
      };
    };
  };

  // ─── Faction CRUD ────────────────────────────────────────────────────────

  public shared ({ caller }) func addFaction(entry : Faction) : async Nat {
    requireAuth(caller);
    let id = nextFactionId;
    nextFactionId += 1;
    factions.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getFactions() : async [Faction] {
    requireAuth(caller);
    let resultList = List.empty<Faction>();
    for ((_, f) in factions.entries()) {
      if (Principal.equal(f.owner, caller)) { resultList.add(f) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateFaction(entry : Faction) : async Bool {
    requireAuth(caller);
    switch (factions.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          factions.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteFaction(id : Nat) : async Bool {
    requireAuth(caller);
    switch (factions.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          factions.remove(id);
          true;
        };
      };
    };
  };

  // ─── WeatherEntry CRUD ─────────────────────────────────────────────────────

  public shared ({ caller }) func addWeatherEntry(entry : WeatherEntry) : async Nat {
    requireAuth(caller);
    let id = nextWeatherEntryId;
    nextWeatherEntryId += 1;
    weatherEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getWeatherEntries() : async [WeatherEntry] {
    requireAuth(caller);
    let resultList = List.empty<WeatherEntry>();
    for ((_, w) in weatherEntries.entries()) {
      if (Principal.equal(w.owner, caller)) { resultList.add(w) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateWeatherEntry(entry : WeatherEntry) : async Bool {
    requireAuth(caller);
    switch (weatherEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          weatherEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteWeatherEntry(id : Nat) : async Bool {
    requireAuth(caller);
    switch (weatherEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          weatherEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── BestiaryCreature CRUD ───────────────────────────────────────────────

  public shared ({ caller }) func addBestiaryCreature(entry : BestiaryCreature) : async Nat {
    requireAuth(caller);
    let id = nextBestiaryCreatureId;
    nextBestiaryCreatureId += 1;
    bestiaryCreatures.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getBestiaryCreatures() : async [BestiaryCreature] {
    requireAuth(caller);
    let resultList = List.empty<BestiaryCreature>();
    for ((_, c) in bestiaryCreatures.entries()) {
      if (Principal.equal(c.owner, caller)) { resultList.add(c) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateBestiaryCreature(entry : BestiaryCreature) : async Bool {
    requireAuth(caller);
    switch (bestiaryCreatures.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          bestiaryCreatures.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteBestiaryCreature(id : Nat) : async Bool {
    requireAuth(caller);
    switch (bestiaryCreatures.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          bestiaryCreatures.remove(id);
          true;
        };
      };
    };
  };

  // ─── CharacterRelationship CRUD ─────────────────────────────────────────

  public shared ({ caller }) func addCharacterRelationship(entry : CharacterRelationship) : async Nat {
    requireAuth(caller);
    let id = nextCharacterRelationshipId;
    nextCharacterRelationshipId += 1;
    characterRelationships.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCharacterRelationships(characterId : Text) : async [CharacterRelationship] {
    requireAuth(caller);
    let resultList = List.empty<CharacterRelationship>();
    for ((_, r) in characterRelationships.entries()) {
      if (r.characterId == characterId and Principal.equal(r.owner, caller)) {
        resultList.add(r);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterRelationship(entry : CharacterRelationship) : async Bool {
    requireAuth(caller);
    switch (characterRelationships.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          characterRelationships.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCharacterRelationship(id : Nat) : async Bool {
    requireAuth(caller);
    switch (characterRelationships.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          characterRelationships.remove(id);
          true;
        };
      };
    };
  };

  // ─── CalendarEvent CRUD ─────────────────────────────────────────────────

  public shared ({ caller }) func addCalendarEvent(entry : CalendarEvent) : async Nat {
    requireAuth(caller);
    let id = nextCalendarEventId;
    nextCalendarEventId += 1;
    calendarEvents.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCalendarEvents() : async [CalendarEvent] {
    requireAuth(caller);
    let resultList = List.empty<CalendarEvent>();
    for ((_, e) in calendarEvents.entries()) {
      if (Principal.equal(e.owner, caller)) { resultList.add(e) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCalendarEvent(entry : CalendarEvent) : async Bool {
    requireAuth(caller);
    switch (calendarEvents.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          calendarEvents.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCalendarEvent(id : Nat) : async Bool {
    requireAuth(caller);
    switch (calendarEvents.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          calendarEvents.remove(id);
          true;
        };
      };
    };
  };

  // ─── Gain/Loss Interaction Tracker ──────────────────────────────────────

  public type GainLossDetails = {
    troops : Nat;
    gold : Nat;
    prisoners : Nat;
    supplies : Nat;
    territory : Text;
    intel : Text;
    officersCasualties : Text;
    equipmentNotes : Text;
    other : Text;
  };

  public type GainLossEntry = {
    id : Text;
    armyId : Text;
    owner : Principal;
    timestamp : Text;
    interactionType : Text;
    enemyName : Text;
    outcome : Text;
    gains : GainLossDetails;
    losses : GainLossDetails;
    moraleImpact : Int;
    moraleApplied : Bool;
    notes : Text;
    linkedFactionId : ?Nat;
  };

  // ─── Enemy Roster ─────────────────────────────────────────────────────────

  public type EnemyProfile = {
    id : Text;
    armyId : Text;
    owner : Principal;
    name : Text;
    faction : Text;
    enemyType : Text;
    description : Text;
    knownStrengths : Text;
    knownWeaknesses : Text;
    notes : Text;
    wins : Nat;
    losses : Nat;
    draws : Nat;
  };

  // ─── Army Loot Tracker ─────────────────────────────────────────────────────

  public type ArmyLootEntry = {
    id : Text;
    armyId : Text;
    owner : Principal;
    name : Text;
    quantity : Nat;
    lootType : Text;
    source : Text;
    dateAcquired : Text;
    value : Nat;
    distributed : Bool;
    notes : Text;
  };

  // ─── Bounty/Objective Tracker ──────────────────────────────────────────────

  public type BountyObjective = {
    id : Text;
    armyId : Text;
    owner : Principal;
    title : Text;
    objectiveType : Text;
    target : Text;
    description : Text;
    reward : Text;
    status : Text;
    completedAt : Text;
    notes : Text;
  };

  // ─── Prisoner Exchange Log ─────────────────────────────────────────────────

  public type PrisonerExchangeEntry = {
    id : Text;
    armyId : Text;
    owner : Principal;
    prisonerName : Text;
    prisonerFaction : Text;
    prisonerRank : Text;
    capturedDate : Text;
    capturedFrom : Text;
    status : Text;
    exchangeDetails : Text;
    ransomAmount : Nat;
    notes : Text;
  };

  // ─── Deployment Map Notes ──────────────────────────────────────────────────

  public type DeploymentMapNote = {
    id : Text;
    armyId : Text;
    owner : Principal;
    branchName : Text;
    location : Text;
    terrain : Text;
    deploymentStatus : Text;
    coordinatesNotes : Text;
    strategicNotes : Text;
    supplyLineStatus : Text;
    lastUpdated : Text;
    notes : Text;
  };

  // ─── Inter-Army Diplomacy Log ──────────────────────────────────────────────

  public type DiplomacyEntry = {
    id : Text;
    armyId : Text;
    owner : Principal;
    otherArmyName : Text;
    otherFaction : Text;
    relationshipType : Text;
    date : Text;
    terms : Text;
    status : Text;
    keyPersons : Text;
    notes : Text;
  };

  // ─── Character Injury Tracker ─────────────────────────────────────────────

  public type CharacterInjury = {
    id : Text;
    characterId : CharacterId;
    owner : Principal;
    injuryName : Text;
    injuryType : Text;
    severity : Text;
    description : Text;
    dateReceived : Text;
    source : Text;
    recoveryStatus : Text;
    recoveryNotes : Text;
    estimatedRecovery : Text;
  };

  // ─── Personal Loot Log ─────────────────────────────────────────────────────

  public type PersonalLootEntry = {
    id : Text;
    characterId : CharacterId;
    owner : Principal;
    name : Text;
    quantity : Nat;
    lootType : Text;
    source : Text;
    dateAcquired : Text;
    value : Nat;
    kept : Bool;
    notes : Text;
  };

  // ─── Rival/Enemy Tracker ───────────────────────────────────────────────────

  public type RivalEntry = {
    id : Text;
    characterId : CharacterId;
    owner : Principal;
    name : Text;
    rivalType : Text;
    faction : Text;
    backstory : Text;
    currentLocation : Text;
    threatLevel : Text;
    personalHistory : Text;
    wins : Nat;
    losses : Nat;
    status : Text;
    notes : Text;
    linkedFactionId : ?Nat;
  };

  // ─── Storage: new entity maps ──────────────────────────────────────────────

  let gainLossEntries = Map.empty<Text, GainLossEntry>();
  let enemyProfiles = Map.empty<Text, EnemyProfile>();
  let armyLootEntries = Map.empty<Text, ArmyLootEntry>();
  let bountyObjectives = Map.empty<Text, BountyObjective>();
  let prisonerExchanges = Map.empty<Text, PrisonerExchangeEntry>();
  let deploymentMapNotes = Map.empty<Text, DeploymentMapNote>();
  let diplomacyLog = Map.empty<Text, DiplomacyEntry>();
  let characterInjuries = Map.empty<Text, CharacterInjury>();
  let personalLootEntries = Map.empty<Text, PersonalLootEntry>();
  let rivalEntries = Map.empty<Text, RivalEntry>();

  var nextGainLossId : Nat = 0;
  var nextEnemyProfileId : Nat = 0;
  var nextArmyLootId : Nat = 0;
  var nextBountyObjectiveId : Nat = 0;
  var nextPrisonerExchangeId : Nat = 0;
  var nextDeploymentNoteId : Nat = 0;
  var nextDiplomacyEntryId : Nat = 0;
  var nextCharacterInjuryId : Nat = 0;
  var nextPersonalLootId : Nat = 0;
  var nextRivalEntryId : Nat = 0;

  // ─── Gain/Loss Interaction CRUD ────────────────────────────────────────────

  public shared ({ caller }) func addGainLossEntry(armyId : Text, entry : GainLossEntry) : async Text {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add gain/loss entries for armies you do not own");
    };
    let id = "gl-" # nextGainLossId.toText();
    nextGainLossId += 1;
    gainLossEntries.add(id, { entry with id; armyId; owner = caller; linkedFactionId = entry.linkedFactionId });
    id;
  };

  public query ({ caller }) func getGainLossEntries(armyId : Text) : async [GainLossEntry] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot view gain/loss entries for armies you do not own");
    };
    let resultList = List.empty<GainLossEntry>();
    for ((_, e) in gainLossEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) {
        resultList.add(e);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateGainLossEntry(id : Text, entry : GainLossEntry) : async Bool {
    requireAuth(caller);
    switch (gainLossEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          gainLossEntries.add(id, { entry with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteGainLossEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (gainLossEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          gainLossEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── Enemy Roster CRUD ─────────────────────────────────────────────────────

  public shared ({ caller }) func addEnemyProfile(armyId : Text, profile : EnemyProfile) : async Text {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add enemy profiles for armies you do not own");
    };
    let id = "ep-" # nextEnemyProfileId.toText();
    nextEnemyProfileId += 1;
    enemyProfiles.add(id, { profile with id; armyId; owner = caller });
    id;
  };

  public query ({ caller }) func getEnemyRoster(armyId : Text) : async [EnemyProfile] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot view enemy roster for armies you do not own");
    };
    let resultList = List.empty<EnemyProfile>();
    for ((_, p) in enemyProfiles.entries()) {
      if (p.armyId == armyId and Principal.equal(p.owner, caller)) {
        resultList.add(p);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateEnemyProfile(id : Text, profile : EnemyProfile) : async Bool {
    requireAuth(caller);
    switch (enemyProfiles.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          enemyProfiles.add(id, { profile with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteEnemyProfile(id : Text) : async Bool {
    requireAuth(caller);
    switch (enemyProfiles.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          enemyProfiles.remove(id);
          true;
        };
      };
    };
  };

  // ─── Army Loot CRUD ────────────────────────────────────────────────────────

  public shared ({ caller }) func addArmyLootEntry(armyId : Text, entry : ArmyLootEntry) : async Text {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add loot for armies you do not own");
    };
    let id = "al-" # nextArmyLootId.toText();
    nextArmyLootId += 1;
    armyLootEntries.add(id, { entry with id; armyId; owner = caller });
    id;
  };

  public query ({ caller }) func getArmyLoot(armyId : Text) : async [ArmyLootEntry] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot view loot for armies you do not own");
    };
    let resultList = List.empty<ArmyLootEntry>();
    for ((_, e) in armyLootEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) {
        resultList.add(e);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateArmyLootEntry(id : Text, entry : ArmyLootEntry) : async Bool {
    requireAuth(caller);
    switch (armyLootEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          armyLootEntries.add(id, { entry with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteArmyLootEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (armyLootEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          armyLootEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── Bounty/Objective CRUD ─────────────────────────────────────────────────

  public shared ({ caller }) func addBountyObjective(armyId : Text, obj : BountyObjective) : async Text {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add bounties for armies you do not own");
    };
    let id = "bo-" # nextBountyObjectiveId.toText();
    nextBountyObjectiveId += 1;
    bountyObjectives.add(id, { obj with id; armyId; owner = caller });
    id;
  };

  public query ({ caller }) func getBountyObjectives(armyId : Text) : async [BountyObjective] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot view bounties for armies you do not own");
    };
    let resultList = List.empty<BountyObjective>();
    for ((_, o) in bountyObjectives.entries()) {
      if (o.armyId == armyId and Principal.equal(o.owner, caller)) {
        resultList.add(o);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateBountyObjective(id : Text, obj : BountyObjective) : async Bool {
    requireAuth(caller);
    switch (bountyObjectives.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          bountyObjectives.add(id, { obj with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteBountyObjective(id : Text) : async Bool {
    requireAuth(caller);
    switch (bountyObjectives.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          bountyObjectives.remove(id);
          true;
        };
      };
    };
  };

  // ─── Prisoner Exchange CRUD ────────────────────────────────────────────────

  public shared ({ caller }) func addPrisonerExchange(armyId : Text, entry : PrisonerExchangeEntry) : async Text {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add prisoner exchanges for armies you do not own");
    };
    let id = "pe-" # nextPrisonerExchangeId.toText();
    nextPrisonerExchangeId += 1;
    prisonerExchanges.add(id, { entry with id; armyId; owner = caller });
    id;
  };

  public query ({ caller }) func getPrisonerExchanges(armyId : Text) : async [PrisonerExchangeEntry] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot view prisoner exchanges for armies you do not own");
    };
    let resultList = List.empty<PrisonerExchangeEntry>();
    for ((_, e) in prisonerExchanges.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) {
        resultList.add(e);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updatePrisonerExchange(id : Text, entry : PrisonerExchangeEntry) : async Bool {
    requireAuth(caller);
    switch (prisonerExchanges.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          prisonerExchanges.add(id, { entry with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deletePrisonerExchange(id : Text) : async Bool {
    requireAuth(caller);
    switch (prisonerExchanges.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          prisonerExchanges.remove(id);
          true;
        };
      };
    };
  };

  // ─── Deployment Map Notes CRUD ─────────────────────────────────────────────

  public shared ({ caller }) func addDeploymentNote(armyId : Text, note : DeploymentMapNote) : async Text {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add deployment notes for armies you do not own");
    };
    let id = "dn-" # nextDeploymentNoteId.toText();
    nextDeploymentNoteId += 1;
    deploymentMapNotes.add(id, { note with id; armyId; owner = caller });
    id;
  };

  public query ({ caller }) func getDeploymentNotes(armyId : Text) : async [DeploymentMapNote] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot view deployment notes for armies you do not own");
    };
    let resultList = List.empty<DeploymentMapNote>();
    for ((_, n) in deploymentMapNotes.entries()) {
      if (n.armyId == armyId and Principal.equal(n.owner, caller)) {
        resultList.add(n);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateDeploymentNote(id : Text, note : DeploymentMapNote) : async Bool {
    requireAuth(caller);
    switch (deploymentMapNotes.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          deploymentMapNotes.add(id, { note with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteDeploymentNote(id : Text) : async Bool {
    requireAuth(caller);
    switch (deploymentMapNotes.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          deploymentMapNotes.remove(id);
          true;
        };
      };
    };
  };

  // ─── Diplomacy Log CRUD ────────────────────────────────────────────────────

  public shared ({ caller }) func addDiplomacyEntry(armyId : Text, entry : DiplomacyEntry) : async Text {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add diplomacy entries for armies you do not own");
    };
    let id = "de-" # nextDiplomacyEntryId.toText();
    nextDiplomacyEntryId += 1;
    diplomacyLog.add(id, { entry with id; armyId; owner = caller });
    id;
  };

  public query ({ caller }) func getDiplomacyLog(armyId : Text) : async [DiplomacyEntry] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot view diplomacy log for armies you do not own");
    };
    let resultList = List.empty<DiplomacyEntry>();
    for ((_, e) in diplomacyLog.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) {
        resultList.add(e);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateDiplomacyEntry(id : Text, entry : DiplomacyEntry) : async Bool {
    requireAuth(caller);
    switch (diplomacyLog.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          diplomacyLog.add(id, { entry with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteDiplomacyEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (diplomacyLog.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          diplomacyLog.remove(id);
          true;
        };
      };
    };
  };

  // ─── Character Injury CRUD ─────────────────────────────────────────────────

  public shared ({ caller }) func addCharacterInjury(characterId : CharacterId, injury : CharacterInjury) : async Text {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add injuries for characters you do not own");
    };
    let id = "ci-" # nextCharacterInjuryId.toText();
    nextCharacterInjuryId += 1;
    characterInjuries.add(id, { injury with id; characterId; owner = caller });
    id;
  };

  public query ({ caller }) func getCharacterInjuries(characterId : CharacterId) : async [CharacterInjury] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view injuries for characters you do not own");
    };
    let resultList = List.empty<CharacterInjury>();
    for ((_, inj) in characterInjuries.entries()) {
      if (inj.characterId == characterId and Principal.equal(inj.owner, caller)) {
        resultList.add(inj);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterInjury(id : Text, injury : CharacterInjury) : async Bool {
    requireAuth(caller);
    switch (characterInjuries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          characterInjuries.add(id, { injury with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCharacterInjury(id : Text) : async Bool {
    requireAuth(caller);
    switch (characterInjuries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          characterInjuries.remove(id);
          true;
        };
      };
    };
  };

  // ─── Personal Loot Log CRUD ────────────────────────────────────────────────

  public shared ({ caller }) func addPersonalLootEntry(characterId : CharacterId, entry : PersonalLootEntry) : async Text {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add loot for characters you do not own");
    };
    let id = "pl-" # nextPersonalLootId.toText();
    nextPersonalLootId += 1;
    personalLootEntries.add(id, { entry with id; characterId; owner = caller });
    id;
  };

  public query ({ caller }) func getPersonalLoot(characterId : CharacterId) : async [PersonalLootEntry] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view loot for characters you do not own");
    };
    let resultList = List.empty<PersonalLootEntry>();
    for ((_, e) in personalLootEntries.entries()) {
      if (e.characterId == characterId and Principal.equal(e.owner, caller)) {
        resultList.add(e);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updatePersonalLootEntry(id : Text, entry : PersonalLootEntry) : async Bool {
    requireAuth(caller);
    switch (personalLootEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          personalLootEntries.add(id, { entry with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deletePersonalLootEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (personalLootEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          personalLootEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── Rival/Enemy Tracker CRUD ──────────────────────────────────────────────

  public shared ({ caller }) func addRivalEntry(characterId : CharacterId, entry : RivalEntry) : async Text {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot add rivals for characters you do not own");
    };
    let id = "re-" # nextRivalEntryId.toText();
    nextRivalEntryId += 1;
    rivalEntries.add(id, { entry with id; characterId; owner = caller });
    id;
  };

  public query ({ caller }) func getRivals(characterId : CharacterId) : async [RivalEntry] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view rivals for characters you do not own");
    };
    let resultList = List.empty<RivalEntry>();
    for ((_, r) in rivalEntries.entries()) {
      if (r.characterId == characterId and Principal.equal(r.owner, caller)) {
        resultList.add(r);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateRivalEntry(id : Text, entry : RivalEntry) : async Bool {
    requireAuth(caller);
    switch (rivalEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          rivalEntries.add(id, { entry with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteRivalEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (rivalEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          rivalEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CampaignEnemy Type ─────────────────────────────────────────────────

  public type CampaignEnemy = {
    id : Text;
    campaignId : Text;
    owner : Principal;
    name : Text;
    enemyType : Text;
    faction : Text;
    description : Text;
    knownStrengths : Text;
    knownWeaknesses : Text;
    status : Text;
    wins : Nat;
    losses : Nat;
    draws : Nat;
    notes : Text;
    linkedArmyEnemyIds : [Text];
  };

  let campaignEnemies = Map.empty<Text, CampaignEnemy>();
  var nextCampaignEnemyId : Nat = 0;

  // ─── Campaign Enemy CRUD ─────────────────────────────────────────────────

  public shared ({ caller }) func addCampaignEnemy(campaignId : Text, enemy : CampaignEnemy) : async Text {
    requireAuth(caller);
    let id = "ce-" # nextCampaignEnemyId.toText();
    nextCampaignEnemyId += 1;
    campaignEnemies.add(id, { enemy with id; campaignId; owner = caller });
    id;
  };

  public query ({ caller }) func getCampaignEnemies(campaignId : Text) : async [CampaignEnemy] {
    requireAuth(caller);
    let resultList = List.empty<CampaignEnemy>();
    for ((_, e) in campaignEnemies.entries()) {
      if (e.campaignId == campaignId and Principal.equal(e.owner, caller)) {
        resultList.add(e);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCampaignEnemy(id : Text, enemy : CampaignEnemy) : async Bool {
    requireAuth(caller);
    switch (campaignEnemies.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          campaignEnemies.add(id, { enemy with id; owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCampaignEnemy(id : Text) : async Bool {
    requireAuth(caller);
    switch (campaignEnemies.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          campaignEnemies.remove(id);
          true;
        };
      };
    };
  };

  // ─── New Feature Types ──────────────────────────────────────────────────

  public type MulticlassEntry = {
    id : Text;
    className : Text;
    level : Nat;
    spellcastingMod : Text;
    isSpellcaster : Bool;
  };

  public type CharacterCondition = {
    id : Text;
    name : Text;
    description : Text;
    duration : Text;
    autoRemoveOnRest : Bool;
  };

  public type CharacterAppearance = {
    age : Text;
    height : Text;
    weight : Text;
    hairColor : Text;
    eyeColor : Text;
    distinguishingMarks : Text;
  };

  public type OfficerSkill = {
    skillName : Text;
    rating : Nat;
    effect : Text;
  };

  public type OfficerSkillEntry = {
    officerId : Text;
    armyId : Nat;
    skills : [OfficerSkill];
  };

  public type SupplyRoute = {
    id : Text;
    fromLocationId : Text;
    toLocationId : Text;
    status : Text;
    notes : Text;
  };

  public type BattleSimResult = {
    outcome : Text;
    winnerName : Text;
    loserName : Text;
    estimatedCasualties : Text;
    notes : Text;
  };

  public type DungeonRoom = {
    id : Text;
    name : Text;
    description : Text;
    order : Nat;
  };

  public type PartyXpEntry = {
    id : Text;
    sessionId : Text;
    xpEarned : Nat;
    notes : Text;
    timestamp : Int;
  };

  public type LootDistributionEntry = {
    id : Text;
    itemName : Text;
    quantity : Nat;
    recipient : Text;
    notes : Text;
    timestamp : Int;
  };

  public type InitiativeEntry = {
    id : Text;
    name : Text;
    dexModifier : Int;
    initiativeRoll : Int;
    currentHp : Nat;
    maxHp : Nat;
    isPlayer : Bool;
    conditions : [Text];
  };

  public type InitiativeTracker = {
    id : Text;
    encounterId : Text;
    entries : [InitiativeEntry];
    currentTurnIndex : Nat;
    roundNumber : Nat;
  };

  public type ThemeSettings = {
    accentColor : Text;
    themePreset : Text;
  };

  public type AppReminder = {
    id : Text;
    title : Text;
    eventDate : Int;
    reminderNote : Text;
    isDismissed : Bool;
  };

  // ─── New Feature State ────────────────────────────────────────────────────

  let characterMulticlass = Map.empty<CharacterId, List.List<MulticlassEntry>>();
  let characterConditions = Map.empty<CharacterId, List.List<CharacterCondition>>();
  let characterAppearances = Map.empty<CharacterId, CharacterAppearance>();
  let armySupplyRoutes = Map.empty<Text, List.List<SupplyRoute>>();
  let armyOfficerSkills = Map.empty<Text, List.List<OfficerSkillEntry>>();
  let locationDungeonRooms = Map.empty<Text, List.List<DungeonRoom>>();
  let partyXpEntries = Map.empty<Text, PartyXpEntry>();
  let lootDistributionLog = Map.empty<Text, LootDistributionEntry>();
  let initiativeTrackers = Map.empty<Text, InitiativeTracker>();
  let themeSettings = Map.empty<Principal, ThemeSettings>();
  let appReminders = Map.empty<Text, AppReminder>();

  // ─── Multiclass Functions ─────────────────────────────────────────────────

  public query ({ caller }) func getCharacterMulticlass(charId : CharacterId) : async [MulticlassEntry] {
    requireAuth(caller);
    switch (characterMulticlass.get(charId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateCharacterMulticlass(charId : CharacterId, entries : [MulticlassEntry]) : async Bool {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, charId)) {
      return false;
    };
    let list = List.empty<MulticlassEntry>();
    for (e in entries.vals()) { list.add(e) };
    characterMulticlass.add(charId, list);
    true;
  };

  // ─── Character Condition Functions ────────────────────────────────────────

  public query ({ caller }) func getCharacterConditions(charId : CharacterId) : async [CharacterCondition] {
    requireAuth(caller);
    switch (characterConditions.get(charId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateCharacterConditions(charId : CharacterId, conditions : [CharacterCondition]) : async Bool {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, charId)) {
      return false;
    };
    let list = List.empty<CharacterCondition>();
    for (c in conditions.vals()) { list.add(c) };
    characterConditions.add(charId, list);
    true;
  };

  // ─── Character Appearance Functions ───────────────────────────────────────

  public query ({ caller }) func getCharacterAppearance(charId : CharacterId) : async ?CharacterAppearance {
    requireAuth(caller);
    characterAppearances.get(charId);
  };

  public shared ({ caller }) func updateCharacterAppearance(charId : CharacterId, appearance : CharacterAppearance) : async Bool {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, charId)) {
      return false;
    };
    characterAppearances.add(charId, appearance);
    true;
  };

  // ─── Army Supply Route Functions ──────────────────────────────────────────

  public query ({ caller }) func getArmySupplyRoutes(armyId : Nat) : async [SupplyRoute] {
    requireAuth(caller);
    let key = armyId.toText();
    switch (armySupplyRoutes.get(key)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateArmySupplyRoutes(armyId : Nat, routes : [SupplyRoute]) : async Bool {
    requireAuth(caller);
    let key = armyId.toText();
    let list = List.empty<SupplyRoute>();
    for (r in routes.vals()) { list.add(r) };
    armySupplyRoutes.add(key, list);
    true;
  };

  // ─── Army Officer Skill Functions ─────────────────────────────────────────

  public query ({ caller }) func getArmyOfficerSkills(armyId : Nat) : async [OfficerSkillEntry] {
    requireAuth(caller);
    let key = armyId.toText();
    switch (armyOfficerSkills.get(key)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateArmyOfficerSkills(armyId : Nat, skills : [OfficerSkillEntry]) : async Bool {
    requireAuth(caller);
    let key = armyId.toText();
    let list = List.empty<OfficerSkillEntry>();
    for (s in skills.vals()) { list.add(s) };
    armyOfficerSkills.add(key, list);
    true;
  };

  // ─── Battle Simulator Function ────────────────────────────────────────────

  public query ({ caller }) func simulateBattle(armyId1 : Nat, armyId2 : Nat) : async BattleSimResult {
    requireAuth(caller);
    let key1 = armyId1.toText();
    let key2 = armyId2.toText();
    let army1Opt = armies.get(key1);
    let army2Opt = armies.get(key2);
    switch (army1Opt, army2Opt) {
      case (null, _) {
        { outcome = "error"; winnerName = ""; loserName = ""; estimatedCasualties = ""; notes = "Army 1 not found" };
      };
      case (_, null) {
        { outcome = "error"; winnerName = ""; loserName = ""; estimatedCasualties = ""; notes = "Army 2 not found" };
      };
      case (?a1, ?a2) {
        let morale1 : Nat = if (a1.moraleRating == 0) 1 else a1.moraleRating;
        let morale2 : Nat = if (a2.moraleRating == 0) 1 else a2.moraleRating;
        let score1 : Nat = (a1.size * morale1 / 50) + (a1.officers.size() * 10) + (a1.specOpsGroups.size() * 20);
        let score2 : Nat = (a2.size * morale2 / 50) + (a2.officers.size() * 10) + (a2.specOpsGroups.size() * 20);
        let cas1 = (a1.size * 15 / 100).toText();
        let cas2 = (a2.size * 15 / 100).toText();
        if (score1 == 0 and score2 == 0) {
          {
            outcome = "draw";
            winnerName = "";
            loserName = "";
            estimatedCasualties = "Both forces too small to determine outcome";
            notes = "Neither army has sufficient strength to gain an advantage";
          };
        } else if (score1 > score2 * 130 / 100) {
          {
            outcome = "decisive_victory";
            winnerName = a1.name;
            loserName = a2.name;
            estimatedCasualties = a1.name # " ~" # cas1 # " casualties; " # a2.name # " ~" # (a2.size * 40 / 100).toText() # " casualties";
            notes = "Decisive victory for " # a1.name # " — overwhelming strength and morale advantage. " # a2.name # " forces routed.";
          };
        } else if (score1 > score2) {
          {
            outcome = "victory";
            winnerName = a1.name;
            loserName = a2.name;
            estimatedCasualties = a1.name # " ~" # cas1 # " casualties; " # a2.name # " ~" # (a2.size * 25 / 100).toText() # " casualties";
            notes = a1.name # " likely wins with moderate casualties. " # a2.name # " is outmatched but puts up a fight.";
          };
        } else if (score2 > score1 * 130 / 100) {
          {
            outcome = "decisive_victory";
            winnerName = a2.name;
            loserName = a1.name;
            estimatedCasualties = a2.name # " ~" # cas2 # " casualties; " # a1.name # " ~" # (a1.size * 40 / 100).toText() # " casualties";
            notes = "Decisive victory for " # a2.name # " — overwhelming strength and morale advantage. " # a1.name # " forces routed.";
          };
        } else if (score2 > score1) {
          {
            outcome = "victory";
            winnerName = a2.name;
            loserName = a1.name;
            estimatedCasualties = a2.name # " ~" # cas2 # " casualties; " # a1.name # " ~" # (a1.size * 25 / 100).toText() # " casualties";
            notes = a2.name # " likely wins with moderate casualties. " # a1.name # " is outmatched but puts up a fight.";
          };
        } else {
          {
            outcome = "uncertain";
            winnerName = "";
            loserName = "";
            estimatedCasualties = a1.name # " ~" # cas1 # " casualties; " # a2.name # " ~" # cas2 # " casualties";
            notes = "Close battle — outcome uncertain. Both armies are evenly matched. Victory will depend on tactics and terrain.";
          };
        };
      };
    };
  };

  // ─── Dungeon Room Functions ───────────────────────────────────────────────

  public query ({ caller }) func getLocationDungeonRooms(locationId : Text) : async [DungeonRoom] {
    requireAuth(caller);
    switch (locationDungeonRooms.get(locationId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateLocationDungeonRooms(locationId : Text, rooms : [DungeonRoom]) : async Bool {
    requireAuth(caller);
    let list = List.empty<DungeonRoom>();
    for (r in rooms.vals()) { list.add(r) };
    locationDungeonRooms.add(locationId, list);
    true;
  };

  // ─── Party XP Entry Functions ─────────────────────────────────────────────

  public query ({ caller }) func getPartyXpEntries() : async [PartyXpEntry] {
    requireAuth(caller);
    let prefix = caller.toText() # ":";
    let result = List.empty<PartyXpEntry>();
    for ((k, e) in partyXpEntries.entries()) {
      if (k.startsWith(#text prefix)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func addPartyXpEntry(entry : PartyXpEntry) : async Bool {
    requireAuth(caller);
    let key = caller.toText() # ":" # entry.id;
    partyXpEntries.add(key, entry);
    true;
  };

  public shared ({ caller }) func deletePartyXpEntry(id : Text) : async Bool {
    requireAuth(caller);
    let key = caller.toText() # ":" # id;
    if (partyXpEntries.containsKey(key)) {
      partyXpEntries.remove(key);
      true;
    } else {
      false;
    };
  };

  // ─── Loot Distribution Functions ──────────────────────────────────────────

  public query ({ caller }) func getLootDistributionLog() : async [LootDistributionEntry] {
    requireAuth(caller);
    let prefix = caller.toText() # ":";
    let result = List.empty<LootDistributionEntry>();
    for ((k, e) in lootDistributionLog.entries()) {
      if (k.startsWith(#text prefix)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func addLootDistributionEntry(entry : LootDistributionEntry) : async Bool {
    requireAuth(caller);
    let key = caller.toText() # ":" # entry.id;
    lootDistributionLog.add(key, entry);
    true;
  };

  public shared ({ caller }) func deleteLootDistributionEntry(id : Text) : async Bool {
    requireAuth(caller);
    let key = caller.toText() # ":" # id;
    if (lootDistributionLog.containsKey(key)) {
      lootDistributionLog.remove(key);
      true;
    } else {
      false;
    };
  };

  // ─── Initiative Tracker Functions ─────────────────────────────────────────

  public query ({ caller }) func getInitiativeTrackers() : async [InitiativeTracker] {
    requireAuth(caller);
    let prefix = caller.toText() # ":";
    let result = List.empty<InitiativeTracker>();
    for ((k, t) in initiativeTrackers.entries()) {
      if (k.startsWith(#text prefix)) { result.add(t) };
    };
    result.toArray();
  };

  public shared ({ caller }) func saveInitiativeTracker(tracker : InitiativeTracker) : async Bool {
    requireAuth(caller);
    let key = caller.toText() # ":" # tracker.id;
    initiativeTrackers.add(key, tracker);
    true;
  };

  public shared ({ caller }) func deleteInitiativeTracker(id : Text) : async Bool {
    requireAuth(caller);
    let key = caller.toText() # ":" # id;
    if (initiativeTrackers.containsKey(key)) {
      initiativeTrackers.remove(key);
      true;
    } else {
      false;
    };
  };

  // ─── Theme Settings Functions ─────────────────────────────────────────────

  public query ({ caller }) func getThemeSettings() : async ?ThemeSettings {
    requireAuth(caller);
    themeSettings.get(caller);
  };

  public shared ({ caller }) func updateThemeSettings(settings : ThemeSettings) : async Bool {
    requireAuth(caller);
    themeSettings.add(caller, settings);
    true;
  };

  // ─── App Reminder Functions ───────────────────────────────────────────────

  public query ({ caller }) func getAppReminders() : async [AppReminder] {
    requireAuth(caller);
    let prefix = caller.toText() # ":";
    let result = List.empty<AppReminder>();
    for ((k, r) in appReminders.entries()) {
      if (k.startsWith(#text prefix)) { result.add(r) };
    };
    result.toArray();
  };

  public shared ({ caller }) func saveAppReminder(reminder : AppReminder) : async Bool {
    requireAuth(caller);
    let key = caller.toText() # ":" # reminder.id;
    appReminders.add(key, reminder);
    true;
  };

  public shared ({ caller }) func deleteAppReminder(id : Text) : async Bool {
    requireAuth(caller);
    let key = caller.toText() # ":" # id;
    if (appReminders.containsKey(key)) {
      appReminders.remove(key);
      true;
    } else {
      false;
    };
  };

  // ─── Export / Import Functions ────────────────────────────────────────────

  public query ({ caller }) func exportAllData() : async Text {
    requireAuth(caller);
    let callerText = caller.toText();
    var out = "{";
    // Characters
    out #= "\"characters\":[";
    var first = true;
    for ((id, c) in characters.entries()) {
      if (Principal.equal(c.owner, caller)) {
        if (not first) { out #= "," };
        out #= "{\"id\":" # id.toText() # ",\"name\":\"" # c.name # "\",\"level\":" # c.level.toText() # ",\"race\":\"" # c.race # "\",\"class\":\"" # c.characterClass # "\"}";
        first := false;
      };
    };
    out #= "]";
    // Armies
    out #= ",\"armies\":[";
    first := true;
    for ((id, a) in armies.entries()) {
      if (Principal.equal(a.owner, caller)) {
        if (not first) { out #= "," };
        out #= "{\"id\":\"" # id # "\",\"name\":\"" # a.name # "\",\"size\":" # a.size.toText() # ",\"moraleRating\":" # a.moraleRating.toText() # "}";
        first := false;
      };
    };
    out #= "]";
    // NPCs
    out #= ",\"npcs\":[";
    first := true;
    for ((_, n) in npcs.entries()) {
      if (Principal.equal(n.owner, caller)) {
        if (not first) { out #= "," };
        out #= "{\"id\":\"" # n.id # "\",\"name\":\"" # n.name # "\",\"race\":\"" # n.race # "\"}";
        first := false;
      };
    };
    out #= "]";
    // Locations
    out #= ",\"locations\":[";
    first := true;
    for ((_, l) in locations.entries()) {
      if (Principal.equal(l.owner, caller)) {
        if (not first) { out #= "," };
        out #= "{\"id\":\"" # l.id # "\",\"name\":\"" # l.name # "\",\"type\":\"" # l.locationType # "\"}";
        first := false;
      };
    };
    out #= "]";
    // Factions
    out #= ",\"factions\":[";
    first := true;
    for ((_, f) in factions.entries()) {
      if (Principal.equal(f.owner, caller)) {
        if (not first) { out #= "," };
        out #= "{\"id\":" # f.id.toText() # ",\"name\":\"" # f.name # "\"}";
        first := false;
      };
    };
    out #= "]";
    // Party XP entries
    out #= ",\"partyXp\":[";
    first := true;
    let xpPrefix = callerText # ":";
    for ((k, e) in partyXpEntries.entries()) {
      if (k.startsWith(#text xpPrefix)) {
        if (not first) { out #= "," };
        out #= "{\"id\":\"" # e.id # "\",\"xpEarned\":" # e.xpEarned.toText() # ",\"notes\":\"" # e.notes # "\"}";
        first := false;
      };
    };
    out #= "]";
    // Theme settings
    out #= ",\"themeSettings\":";
    switch (themeSettings.get(caller)) {
      case (null) { out #= "null" };
      case (?ts) { out #= "{\"accentColor\":\"" # ts.accentColor # "\",\"themePreset\":\"" # ts.themePreset # "\"}" };
    };
    out #= "}";
    out;
  };

  public shared ({ caller }) func importAllData(jsonData : Text) : async Bool {
    requireAuth(caller);
    ignore jsonData;
    true;
  };

  // ─── New Entity Types: Rank System Enhancements ───────────────────────────

  public type Commendation = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierId : Text;
    soldierName : Text;
    medalName : Text;
    reason : Text;
    date : Text;
    awardedBy : Text;
  };

  public type CourtMartialEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierId : Text;
    soldierName : Text;
    charge : Text;
    verdict : Text;
    punishment : Text;
    date : Text;
    notes : Text;
  };

  public type TrainingCertification = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierId : Text;
    soldierName : Text;
    certName : Text;
    completionDate : Text;
    trainer : Text;
    expiresDate : Text;
    notes : Text;
  };

  public type VeteranUnit = {
    id : Text;
    owner : Principal;
    armyId : Text;
    branchId : Text;
    unitName : Text;
    reason : Text;
    battleCount : Nat;
    designation : Text;
    notes : Text;
  };

  // ─── New Entity Types: Personnel ───────────────────────────────────────────

  public type SoldierBio = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierId : Text;
    soldierName : Text;
    bio : Text;
    backstory : Text;
    notableHistory : Text;
    rank : Text;
    branch : Text;
  };

  public type BloodOathEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierId : Text;
    soldierName : Text;
    oathText : Text;
    swornTo : Text;
    conditions : Text;
    date : Text;
    broken : Bool;
    breakNotes : Text;
  };

  public type MIAEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierId : Text;
    soldierName : Text;
    lastKnownLocation : Text;
    dateLastSeen : Text;
    circumstances : Text;
    status : Text;
    resolvedDate : Text;
    notes : Text;
  };

  // ─── New Entity Types: Army Management ────────────────────────────────────

  public type ArmyRivalEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    rivalArmyId : Text;
    rivalArmyName : Text;
    rivalryNote : Text;
    winsAgainst : Nat;
    lossesAgainst : Nat;
    startDate : Text;
    notes : Text;
  };

  public type SecretMissionLog = {
    id : Text;
    owner : Principal;
    armyId : Text;
    title : Text;
    objective : Text;
    participants : Text;
    outcome : Text;
    date : Text;
    classification : Text;
    notes : Text;
  };

  public type ArmyDoctrine = {
    id : Text;
    owner : Principal;
    armyId : Text;
    title : Text;
    rulesOfEngagement : Text;
    combatDoctrine : Text;
    standingOrders : Text;
    lastUpdated : Text;
    notes : Text;
  };

  public type WarCrimeEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    event : Text;
    date : Text;
    location : Text;
    perpetrators : Text;
    consequence : Text;
    notes : Text;
  };

  public type TrophyEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    name : Text;
    takenFrom : Text;
    battle : Text;
    date : Text;
    description : Text;
    notes : Text;
  };

  public type AllianceTreaty = {
    id : Text;
    owner : Principal;
    armyId : Text;
    partyA : Text;
    partyB : Text;
    terms : Text;
    signedDate : Text;
    status : Text;
    breakDate : Text;
    notes : Text;
  };

  public type EspionageEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    target : Text;
    operationType : Text;
    agentName : Text;
    date : Text;
    outcome : Text;
    notes : Text;
  };

  public type SiegeEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    target : Text;
    startDate : Text;
    endDate : Text;
    resourcesConsumed : Text;
    breaches : Text;
    outcome : Text;
    notes : Text;
  };

  public type ArmyMetadata = {
    id : Text;
    owner : Principal;
    armyId : Text;
    foundingDate : Text;
    ageDescription : Text;
    reputationScore : Nat;
    reputationNotes : Text;
    doctrine : Text;
    moraleWarningThreshold : Nat;
    moraleWarningEnabled : Bool;
  };

  // ─── New Entity Types: World Building ────────────────────────────────────

  public type PlaneRealm = {
    name : Text;
    planeType : Text;
    description : Text;
    traits : Text;
    linkedLocations : Text;
    notes : Text;
  };

  public type PlaneRealmEntry = {
    id : Text;
    owner : Principal;
    planesOrRealms : [PlaneRealm];
  };

  public type PortalEntry = {
    id : Text;
    owner : Principal;
    portalName : Text;
    fromLocation : Text;
    toLocation : Text;
    portalType : Text;
    condition : Text;
    notes : Text;
    campaignId : ?Text;
  };

  public type ProphecyEntry = {
    id : Text;
    owner : Principal;
    text : Text;
    source : Text;
    fulfilled : Bool;
    fulfillmentNotes : Text;
    relatedCharacters : Text;
    relatedFactions : Text;
    date : Text;
    notes : Text;
  };

  public type AncientHistoryEntry = {
    id : Text;
    owner : Principal;
    era : Text;
    eventTitle : Text;
    description : Text;
    affectedFactions : Text;
    affectedLocations : Text;
    date : Text;
    notes : Text;
  };

  public type MythologicalFigure = {
    id : Text;
    owner : Principal;
    name : Text;
    figureType : Text;
    domain : Text;
    mythology : Text;
    powers : Text;
    relationships : Text;
    notes : Text;
  };

  public type LostKnowledgeEntry = {
    id : Text;
    owner : Principal;
    title : Text;
    category : Text;
    description : Text;
    discoveredBy : Text;
    discoveredDate : Text;
    condition : Text;
    notes : Text;
  };

  // ─── New Entity Types: Character Enhancements ────────────────────────────

  public type CharacterLegacy = {
    id : Text;
    owner : Principal;
    characterId : Text;
    title : Text;
    impactDescription : Text;
    affectedEntities : Text;
    date : Text;
    notes : Text;
  };

  public type BloodlineEntry = {
    id : Text;
    owner : Principal;
    characterId : Text;
    name : Text;
    relation : Text;
    era : Text;
    description : Text;
    notableAncestors : Text;
    notes : Text;
  };

  public type CursedItemEntry = {
    id : Text;
    owner : Principal;
    characterId : Text;
    itemName : Text;
    curse : Text;
    acquiredDate : Text;
    effects : Text;
    cureCondition : Text;
    cured : Bool;
    notes : Text;
  };

  public type DreamVisionEntry = {
    id : Text;
    owner : Principal;
    characterId : Text;
    title : Text;
    content : Text;
    visionType : Text;
    prophetic : Bool;
    relatedEntities : Text;
    date : Text;
    notes : Text;
  };

  // ─── New Entity Types: Cross-Preset Features ────────────────────────────

  public type InterPresetWarEntry = {
    id : Text;
    owner : Principal;
    preset1 : Text;
    army1Name : Text;
    preset2 : Text;
    army2Name : Text;
    conflictName : Text;
    startDate : Text;
    endDate : Text;
    outcome : Text;
    notes : Text;
  };

  public type DefectionEntry = {
    id : Text;
    owner : Principal;
    fromArmyId : Text;
    toArmyId : Text;
    soldierName : Text;
    rank : Text;
    reason : Text;
    date : Text;
    notes : Text;
  };

  public type ArmyAlignmentEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    moralAxis : Text;
    ethicalAxis : Text;
    notes : Text;
    lastUpdated : Text;
  };

  // ─── New Entity Types: Celestial Host Trackers ───────────────────────────

  public type CelestialBlessingEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierName : Text;
    blessingType : Text;
    description : Text;
    date : Text;
  };

  public type FallenSoldierEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    name : Text;
    rank : Text;
    cause : Text;
    date : Text;
    notes : Text;
  };

  public type HolyRelicEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    name : Text;
    description : Text;
    origin : Text;
    holder : Text;
    notes : Text;
  };

  public type DivineMandateEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    mandate : Text;
    authority : Text;
    status : Text;
    date : Text;
    notes : Text;
  };

  public type AscensionLogEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierName : Text;
    fromRank : Text;
    toRank : Text;
    date : Text;
    reason : Text;
    notes : Text;
  };

  public type SinCorruptionEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierName : Text;
    exposureType : Text;
    level : Nat;
    date : Text;
    notes : Text;
  };

  public type PrayerLogEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    prayer : Text;
    answered : Bool;
    date : Text;
    notes : Text;
  };

  public type HolyWarEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    warName : Text;
    justification : Text;
    status : Text;
    date : Text;
    notes : Text;
  };

  public type AngelClassEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierName : Text;
    angelType : Text;
    notes : Text;
  };

  // ─── New Entity Types: Infernal Legion Trackers ───────────────────────────

  public type CorruptionLogEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierName : Text;
    corruptionPoints : Nat;
    source : Text;
    date : Text;
    notes : Text;
  };

  public type SoulBountyEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    targetName : Text;
    bountyType : Text;
    status : Text;
    date : Text;
    value : Text;
    notes : Text;
  };

  public type PactContractEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    parties : Text;
    terms : Text;
    signed : Bool;
    status : Text;
    date : Text;
    notes : Text;
  };

  public type RealmTerritoryEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    realm : Text;
    status : Text;
    contested : Bool;
    date : Text;
    notes : Text;
  };

  public type BetrayalLogEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    traitorName : Text;
    offense : Text;
    punishment : Text;
    date : Text;
    notes : Text;
  };

  public type SummoningLogEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    entityName : Text;
    binder : Text;
    purpose : Text;
    status : Text;
    date : Text;
    notes : Text;
  };

  public type DemonClassEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    soldierName : Text;
    demonType : Text;
    abilities : Text;
    notes : Text;
  };

  public type DarkRitualEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    ritualName : Text;
    purpose : Text;
    outcome : Text;
    participants : Text;
    date : Text;
    notes : Text;
  };

  public type InfernalDebtEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    debtor : Text;
    creditor : Text;
    terms : Text;
    status : Text;
    date : Text;
    notes : Text;
  };

  // ─── New Entity Types: SCP Foundation Trackers ───────────────────────────

  public type ClearanceLevelEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    rankCode : Text;
    level : Nat;
    notes : Text;
  };

  public type ContainmentBreachEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    scpDesignation : Text;
    breach : Text;
    resolved : Bool;
    date : Text;
    casualties : Nat;
    notes : Text;
  };

  public type AnomalyExposureEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    personnelName : Text;
    anomalyType : Text;
    effects : Text;
    date : Text;
    notes : Text;
  };

  public type ScpObjectEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    designation : Text;
    objectClass : Text;
    status : Text;
    location : Text;
    notes : Text;
  };

  public type ProtocolLogEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    protocol : Text;
    invokedBy : Text;
    reason : Text;
    status : Text;
    date : Text;
    notes : Text;
  };

  public type AmnesticLogEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    recipient : Text;
    amnesticClass : Text;
    reason : Text;
    date : Text;
    notes : Text;
  };

  public type PsychEvalEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    personnelName : Text;
    result : Text;
    reviewer : Text;
    date : Text;
    notes : Text;
  };

  public type ReclassificationEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    subject : Text;
    fromClass : Text;
    toClass : Text;
    reason : Text;
    date : Text;
    notes : Text;
  };

  public type SiteAssignmentEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    personnelName : Text;
    site : Text;
    assignedDate : Text;
    notes : Text;
  };

  public type BlackBudgetEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    allocation : Text;
    purpose : Text;
    amount : Text;
    date : Text;
    notes : Text;
  };

  public type WhistleblowerEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    incident : Text;
    source : Text;
    contained : Bool;
    date : Text;
    notes : Text;
  };

  public type EthicsReviewEntry = {
    id : Text;
    owner : Principal;
    armyId : Text;
    action : Text;
    reviewer : Text;
    recommendation : Text;
    date : Text;
    notes : Text;
  };

  // ─── New State: Rank Enhancements ────────────────────────────────────────

  let commendations = Map.empty<Text, Commendation>();
  let courtMartialEntries = Map.empty<Text, CourtMartialEntry>();
  let trainingCertifications = Map.empty<Text, TrainingCertification>();
  let veteranUnits = Map.empty<Text, VeteranUnit>();
  let soldierBios = Map.empty<Text, SoldierBio>();
  let bloodOathEntries = Map.empty<Text, BloodOathEntry>();
  let miaEntries = Map.empty<Text, MIAEntry>();
  let armyRivalEntries = Map.empty<Text, ArmyRivalEntry>();
  let secretMissionLogs = Map.empty<Text, SecretMissionLog>();
  let armyDoctrines = Map.empty<Text, ArmyDoctrine>();
  let warCrimeEntries = Map.empty<Text, WarCrimeEntry>();
  let trophyEntries = Map.empty<Text, TrophyEntry>();
  let allianceTreaties = Map.empty<Text, AllianceTreaty>();
  let espionageEntries = Map.empty<Text, EspionageEntry>();
  let siegeEntries = Map.empty<Text, SiegeEntry>();
  let armyMetadataMap = Map.empty<Text, ArmyMetadata>();
  let planeRealmEntries = Map.empty<Text, PlaneRealmEntry>();
  let portalEntries = Map.empty<Text, PortalEntry>();
  let prophecyEntries = Map.empty<Text, ProphecyEntry>();
  let ancientHistoryEntries = Map.empty<Text, AncientHistoryEntry>();
  let mythologicalFigures = Map.empty<Text, MythologicalFigure>();
  let lostKnowledgeEntries = Map.empty<Text, LostKnowledgeEntry>();
  let characterLegacies = Map.empty<Text, CharacterLegacy>();
  let bloodlineEntries = Map.empty<Text, BloodlineEntry>();
  let cursedItemEntries = Map.empty<Text, CursedItemEntry>();
  let dreamVisionEntries = Map.empty<Text, DreamVisionEntry>();
  let interPresetWarEntries = Map.empty<Text, InterPresetWarEntry>();
  let defectionEntries = Map.empty<Text, DefectionEntry>();
  let armyAlignmentEntries = Map.empty<Text, ArmyAlignmentEntry>();

  // Celestial Host tracker state
  let celestialBlessings = Map.empty<Text, CelestialBlessingEntry>();
  let fallenSoldierEntries = Map.empty<Text, FallenSoldierEntry>();
  let holyRelicEntries = Map.empty<Text, HolyRelicEntry>();
  let divineMandateEntries = Map.empty<Text, DivineMandateEntry>();
  let ascensionLogEntries = Map.empty<Text, AscensionLogEntry>();
  let sinCorruptionEntries = Map.empty<Text, SinCorruptionEntry>();
  let prayerLogEntries = Map.empty<Text, PrayerLogEntry>();
  let holyWarEntries = Map.empty<Text, HolyWarEntry>();
  let angelClassEntries = Map.empty<Text, AngelClassEntry>();

  // Infernal Legion tracker state
  let corruptionLogEntries = Map.empty<Text, CorruptionLogEntry>();
  let soulBountyEntries = Map.empty<Text, SoulBountyEntry>();
  let pactContractEntries = Map.empty<Text, PactContractEntry>();
  let realmTerritoryEntries = Map.empty<Text, RealmTerritoryEntry>();
  let betrayalLogEntries = Map.empty<Text, BetrayalLogEntry>();
  let summoningLogEntries = Map.empty<Text, SummoningLogEntry>();
  let demonClassEntries = Map.empty<Text, DemonClassEntry>();
  let darkRitualEntries = Map.empty<Text, DarkRitualEntry>();
  let infernalDebtEntries = Map.empty<Text, InfernalDebtEntry>();

  // SCP Foundation tracker state
  let clearanceLevelEntries = Map.empty<Text, ClearanceLevelEntry>();
  let containmentBreachEntries = Map.empty<Text, ContainmentBreachEntry>();
  let anomalyExposureEntries = Map.empty<Text, AnomalyExposureEntry>();
  let scpObjectEntries = Map.empty<Text, ScpObjectEntry>();
  let protocolLogEntries = Map.empty<Text, ProtocolLogEntry>();
  let amnesticLogEntries = Map.empty<Text, AmnesticLogEntry>();
  let psychEvalEntries = Map.empty<Text, PsychEvalEntry>();
  let reclassificationEntries = Map.empty<Text, ReclassificationEntry>();
  let siteAssignmentEntries = Map.empty<Text, SiteAssignmentEntry>();
  let blackBudgetEntries = Map.empty<Text, BlackBudgetEntry>();
  let whistleblowerEntries = Map.empty<Text, WhistleblowerEntry>();
  let ethicsReviewEntries = Map.empty<Text, EthicsReviewEntry>();

  // ID counters for new trackers
  var nextCelestialBlessingId : Nat = 0;
  var nextFallenSoldierId : Nat = 0;
  var nextHolyRelicId : Nat = 0;
  var nextDivineMandateId : Nat = 0;
  var nextAscensionLogId : Nat = 0;
  var nextSinCorruptionId : Nat = 0;
  var nextPrayerLogId : Nat = 0;
  var nextHolyWarId : Nat = 0;
  var nextAngelClassId : Nat = 0;
  var nextCorruptionLogId : Nat = 0;
  var nextSoulBountyId : Nat = 0;
  var nextPactContractId : Nat = 0;
  var nextRealmTerritoryId : Nat = 0;
  var nextBetrayalLogId : Nat = 0;
  var nextSummoningLogId : Nat = 0;
  var nextDemonClassId : Nat = 0;
  var nextDarkRitualId : Nat = 0;
  var nextInfernalDebtId : Nat = 0;
  var nextClearanceLevelId : Nat = 0;
  var nextContainmentBreachId : Nat = 0;
  var nextAnomalyExposureId : Nat = 0;
  var nextScpObjectId : Nat = 0;
  var nextProtocolLogId : Nat = 0;
  var nextAmnesticLogId : Nat = 0;
  var nextPsychEvalId : Nat = 0;
  var nextReclassificationId : Nat = 0;
  var nextSiteAssignmentId : Nat = 0;
  var nextBlackBudgetId : Nat = 0;
  var nextWhistleblowerId : Nat = 0;
  var nextEthicsReviewId : Nat = 0;

  var nextCommendationId : Nat = 0;
  var nextCourtMartialId : Nat = 0;
  var nextTrainingCertId : Nat = 0;
  var nextVeteranUnitId : Nat = 0;
  var nextSoldierBioId : Nat = 0;
  var nextBloodOathId : Nat = 0;
  var nextMIAEntryId : Nat = 0;
  var nextArmyRivalId : Nat = 0;
  var nextSecretMissionId : Nat = 0;
  var nextArmyDoctrineId : Nat = 0;
  var nextWarCrimeId : Nat = 0;
  var nextTrophyEntryId : Nat = 0;
  var nextAllianceTreatyId : Nat = 0;
  var nextEspionageEntryId : Nat = 0;
  var nextSiegeEntryId : Nat = 0;
  var nextPortalEntryId : Nat = 0;
  var nextProphecyEntryId : Nat = 0;
  var nextAncientHistoryId : Nat = 0;
  var nextMythologicalFigureId : Nat = 0;
  var nextLostKnowledgeId : Nat = 0;
  var nextCharacterLegacyId : Nat = 0;
  var nextBloodlineEntryId : Nat = 0;
  var nextCursedItemEntryId : Nat = 0;
  var nextDreamVisionEntryId : Nat = 0;
  var nextInterPresetWarId : Nat = 0;
  var nextDefectionEntryId : Nat = 0;

  // ─── CRUD: Commendations ──────────────────────────────────────────────────

  public shared ({ caller }) func addCommendation(entry : Commendation) : async Text {
    requireAuth(caller);
    let id = "cmnd-" # nextCommendationId.toText();
    nextCommendationId += 1;
    commendations.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCommendations(armyId : Text) : async [Commendation] {
    requireAuth(caller);
    let result = List.empty<Commendation>();
    for ((_, e) in commendations.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateCommendation(entry : Commendation) : async Bool {
    requireAuth(caller);
    switch (commendations.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          commendations.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCommendation(id : Text) : async Bool {
    requireAuth(caller);
    switch (commendations.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          commendations.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Court Martial Entries ──────────────────────────────────────────

  public shared ({ caller }) func addCourtMartialEntry(entry : CourtMartialEntry) : async Text {
    requireAuth(caller);
    let id = "cm-" # nextCourtMartialId.toText();
    nextCourtMartialId += 1;
    courtMartialEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCourtMartialEntries(armyId : Text) : async [CourtMartialEntry] {
    requireAuth(caller);
    let result = List.empty<CourtMartialEntry>();
    for ((_, e) in courtMartialEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateCourtMartialEntry(entry : CourtMartialEntry) : async Bool {
    requireAuth(caller);
    switch (courtMartialEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          courtMartialEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCourtMartialEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (courtMartialEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          courtMartialEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Training Certifications ───────────────────────────────────────

  public shared ({ caller }) func addTrainingCertification(entry : TrainingCertification) : async Text {
    requireAuth(caller);
    let id = "tc-" # nextTrainingCertId.toText();
    nextTrainingCertId += 1;
    trainingCertifications.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getTrainingCertifications(armyId : Text) : async [TrainingCertification] {
    requireAuth(caller);
    let result = List.empty<TrainingCertification>();
    for ((_, e) in trainingCertifications.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateTrainingCertification(entry : TrainingCertification) : async Bool {
    requireAuth(caller);
    switch (trainingCertifications.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          trainingCertifications.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteTrainingCertification(id : Text) : async Bool {
    requireAuth(caller);
    switch (trainingCertifications.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          trainingCertifications.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Veteran Units ──────────────────────────────────────────────────

  public shared ({ caller }) func addVeteranUnit(entry : VeteranUnit) : async Text {
    requireAuth(caller);
    let id = "vu-" # nextVeteranUnitId.toText();
    nextVeteranUnitId += 1;
    veteranUnits.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getVeteranUnits(armyId : Text) : async [VeteranUnit] {
    requireAuth(caller);
    let result = List.empty<VeteranUnit>();
    for ((_, e) in veteranUnits.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateVeteranUnit(entry : VeteranUnit) : async Bool {
    requireAuth(caller);
    switch (veteranUnits.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          veteranUnits.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteVeteranUnit(id : Text) : async Bool {
    requireAuth(caller);
    switch (veteranUnits.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          veteranUnits.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Soldier Bios ───────────────────────────────────────────────────

  public shared ({ caller }) func addSoldierBio(entry : SoldierBio) : async Text {
    requireAuth(caller);
    let id = "sb-" # nextSoldierBioId.toText();
    nextSoldierBioId += 1;
    soldierBios.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getSoldierBios(armyId : Text) : async [SoldierBio] {
    requireAuth(caller);
    let result = List.empty<SoldierBio>();
    for ((_, e) in soldierBios.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateSoldierBio(entry : SoldierBio) : async Bool {
    requireAuth(caller);
    switch (soldierBios.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          soldierBios.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteSoldierBio(id : Text) : async Bool {
    requireAuth(caller);
    switch (soldierBios.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          soldierBios.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Blood Oath Entries ─────────────────────────────────────────────

  public shared ({ caller }) func addBloodOathEntry(entry : BloodOathEntry) : async Text {
    requireAuth(caller);
    let id = "bo-" # nextBloodOathId.toText();
    nextBloodOathId += 1;
    bloodOathEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getBloodOathEntries(armyId : Text) : async [BloodOathEntry] {
    requireAuth(caller);
    let result = List.empty<BloodOathEntry>();
    for ((_, e) in bloodOathEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateBloodOathEntry(entry : BloodOathEntry) : async Bool {
    requireAuth(caller);
    switch (bloodOathEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          bloodOathEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteBloodOathEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (bloodOathEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          bloodOathEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: MIA Entries ────────────────────────────────────────────────────

  public shared ({ caller }) func addMIAEntry(entry : MIAEntry) : async Text {
    requireAuth(caller);
    let id = "mia-" # nextMIAEntryId.toText();
    nextMIAEntryId += 1;
    miaEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getMIAEntries(armyId : Text) : async [MIAEntry] {
    requireAuth(caller);
    let result = List.empty<MIAEntry>();
    for ((_, e) in miaEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateMIAEntry(entry : MIAEntry) : async Bool {
    requireAuth(caller);
    switch (miaEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          miaEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteMIAEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (miaEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          miaEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Army Rival Entries ─────────────────────────────────────────────

  public shared ({ caller }) func addArmyRivalEntry(entry : ArmyRivalEntry) : async Text {
    requireAuth(caller);
    let id = "ar-" # nextArmyRivalId.toText();
    nextArmyRivalId += 1;
    armyRivalEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getArmyRivalEntries(armyId : Text) : async [ArmyRivalEntry] {
    requireAuth(caller);
    let result = List.empty<ArmyRivalEntry>();
    for ((_, e) in armyRivalEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateArmyRivalEntry(entry : ArmyRivalEntry) : async Bool {
    requireAuth(caller);
    switch (armyRivalEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          armyRivalEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteArmyRivalEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (armyRivalEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          armyRivalEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Secret Mission Logs ────────────────────────────────────────────

  public shared ({ caller }) func addSecretMissionLog(entry : SecretMissionLog) : async Text {
    requireAuth(caller);
    let id = "sm-" # nextSecretMissionId.toText();
    nextSecretMissionId += 1;
    secretMissionLogs.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getSecretMissionLogs(armyId : Text) : async [SecretMissionLog] {
    requireAuth(caller);
    let result = List.empty<SecretMissionLog>();
    for ((_, e) in secretMissionLogs.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateSecretMissionLog(entry : SecretMissionLog) : async Bool {
    requireAuth(caller);
    switch (secretMissionLogs.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          secretMissionLogs.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteSecretMissionLog(id : Text) : async Bool {
    requireAuth(caller);
    switch (secretMissionLogs.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          secretMissionLogs.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Army Doctrines ─────────────────────────────────────────────────

  public shared ({ caller }) func addArmyDoctrine(entry : ArmyDoctrine) : async Text {
    requireAuth(caller);
    let id = "ad-" # nextArmyDoctrineId.toText();
    nextArmyDoctrineId += 1;
    armyDoctrines.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getArmyDoctrines(armyId : Text) : async [ArmyDoctrine] {
    requireAuth(caller);
    let result = List.empty<ArmyDoctrine>();
    for ((_, e) in armyDoctrines.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateArmyDoctrine(entry : ArmyDoctrine) : async Bool {
    requireAuth(caller);
    switch (armyDoctrines.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          armyDoctrines.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteArmyDoctrine(id : Text) : async Bool {
    requireAuth(caller);
    switch (armyDoctrines.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          armyDoctrines.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: War Crime Entries ──────────────────────────────────────────────

  public shared ({ caller }) func addWarCrimeEntry(entry : WarCrimeEntry) : async Text {
    requireAuth(caller);
    let id = "wc-" # nextWarCrimeId.toText();
    nextWarCrimeId += 1;
    warCrimeEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getWarCrimeEntries(armyId : Text) : async [WarCrimeEntry] {
    requireAuth(caller);
    let result = List.empty<WarCrimeEntry>();
    for ((_, e) in warCrimeEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateWarCrimeEntry(entry : WarCrimeEntry) : async Bool {
    requireAuth(caller);
    switch (warCrimeEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          warCrimeEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteWarCrimeEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (warCrimeEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          warCrimeEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Trophy Entries ─────────────────────────────────────────────────

  public shared ({ caller }) func addTrophyEntry(entry : TrophyEntry) : async Text {
    requireAuth(caller);
    let id = "tr-" # nextTrophyEntryId.toText();
    nextTrophyEntryId += 1;
    trophyEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getTrophyEntries(armyId : Text) : async [TrophyEntry] {
    requireAuth(caller);
    let result = List.empty<TrophyEntry>();
    for ((_, e) in trophyEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateTrophyEntry(entry : TrophyEntry) : async Bool {
    requireAuth(caller);
    switch (trophyEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          trophyEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteTrophyEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (trophyEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          trophyEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Alliance Treaties ──────────────────────────────────────────────

  public shared ({ caller }) func addAllianceTreaty(entry : AllianceTreaty) : async Text {
    requireAuth(caller);
    let id = "at-" # nextAllianceTreatyId.toText();
    nextAllianceTreatyId += 1;
    allianceTreaties.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getAllianceTreaties(armyId : Text) : async [AllianceTreaty] {
    requireAuth(caller);
    let result = List.empty<AllianceTreaty>();
    for ((_, e) in allianceTreaties.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateAllianceTreaty(entry : AllianceTreaty) : async Bool {
    requireAuth(caller);
    switch (allianceTreaties.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          allianceTreaties.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteAllianceTreaty(id : Text) : async Bool {
    requireAuth(caller);
    switch (allianceTreaties.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          allianceTreaties.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Espionage Entries ──────────────────────────────────────────────

  public shared ({ caller }) func addEspionageEntry(entry : EspionageEntry) : async Text {
    requireAuth(caller);
    let id = "esp-" # nextEspionageEntryId.toText();
    nextEspionageEntryId += 1;
    espionageEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getEspionageEntries(armyId : Text) : async [EspionageEntry] {
    requireAuth(caller);
    let result = List.empty<EspionageEntry>();
    for ((_, e) in espionageEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateEspionageEntry(entry : EspionageEntry) : async Bool {
    requireAuth(caller);
    switch (espionageEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          espionageEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteEspionageEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (espionageEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          espionageEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Siege Entries ──────────────────────────────────────────────────

  public shared ({ caller }) func addSiegeEntry(entry : SiegeEntry) : async Text {
    requireAuth(caller);
    let id = "siege-" # nextSiegeEntryId.toText();
    nextSiegeEntryId += 1;
    siegeEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getSiegeEntries(armyId : Text) : async [SiegeEntry] {
    requireAuth(caller);
    let result = List.empty<SiegeEntry>();
    for ((_, e) in siegeEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateSiegeEntry(entry : SiegeEntry) : async Bool {
    requireAuth(caller);
    switch (siegeEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          siegeEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteSiegeEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (siegeEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          siegeEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Army Metadata ──────────────────────────────────────────────────

  public shared ({ caller }) func saveArmyMetadata(entry : ArmyMetadata) : async Bool {
    requireAuth(caller);
    switch (armyMetadataMap.get(entry.armyId)) {
      case (null) {
        armyMetadataMap.add(entry.armyId, { entry with owner = caller });
        true;
      };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          armyMetadataMap.add(entry.armyId, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public query ({ caller }) func getArmyMetadata(armyId : Text) : async ?ArmyMetadata {
    requireAuth(caller);
    switch (armyMetadataMap.get(armyId)) {
      case (null) { null };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { null } else { ?existing };
      };
    };
  };

  // ─── CRUD: Plane/Realm Entries ────────────────────────────────────────────

  public shared ({ caller }) func savePlaneRealmEntry(entry : PlaneRealmEntry) : async Bool {
    requireAuth(caller);
    let key = caller.toText();
    planeRealmEntries.add(key, { entry with owner = caller });
    true;
  };

  public query ({ caller }) func getPlaneRealmEntry() : async ?PlaneRealmEntry {
    requireAuth(caller);
    planeRealmEntries.get(caller.toText());
  };

  // ─── CRUD: Portal Entries ─────────────────────────────────────────────────

  public shared ({ caller }) func addPortalEntry(entry : PortalEntry) : async Text {
    requireAuth(caller);
    let id = "portal-" # nextPortalEntryId.toText();
    nextPortalEntryId += 1;
    portalEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getPortalEntries() : async [PortalEntry] {
    requireAuth(caller);
    let result = List.empty<PortalEntry>();
    for ((_, e) in portalEntries.entries()) {
      if (Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updatePortalEntry(entry : PortalEntry) : async Bool {
    requireAuth(caller);
    switch (portalEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          portalEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deletePortalEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (portalEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          portalEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Prophecy Entries ───────────────────────────────────────────────

  public shared ({ caller }) func addProphecyEntry(entry : ProphecyEntry) : async Text {
    requireAuth(caller);
    let id = "proph-" # nextProphecyEntryId.toText();
    nextProphecyEntryId += 1;
    prophecyEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getProphecyEntries() : async [ProphecyEntry] {
    requireAuth(caller);
    let result = List.empty<ProphecyEntry>();
    for ((_, e) in prophecyEntries.entries()) {
      if (Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateProphecyEntry(entry : ProphecyEntry) : async Bool {
    requireAuth(caller);
    switch (prophecyEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          prophecyEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteProphecyEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (prophecyEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          prophecyEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Ancient History Entries ───────────────────────────────────────

  public shared ({ caller }) func addAncientHistoryEntry(entry : AncientHistoryEntry) : async Text {
    requireAuth(caller);
    let id = "ah-" # nextAncientHistoryId.toText();
    nextAncientHistoryId += 1;
    ancientHistoryEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getAncientHistoryEntries() : async [AncientHistoryEntry] {
    requireAuth(caller);
    let result = List.empty<AncientHistoryEntry>();
    for ((_, e) in ancientHistoryEntries.entries()) {
      if (Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateAncientHistoryEntry(entry : AncientHistoryEntry) : async Bool {
    requireAuth(caller);
    switch (ancientHistoryEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          ancientHistoryEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteAncientHistoryEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (ancientHistoryEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          ancientHistoryEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Mythological Figures ───────────────────────────────────────────

  public shared ({ caller }) func addMythologicalFigure(entry : MythologicalFigure) : async Text {
    requireAuth(caller);
    let id = "myth-" # nextMythologicalFigureId.toText();
    nextMythologicalFigureId += 1;
    mythologicalFigures.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getMythologicalFigures() : async [MythologicalFigure] {
    requireAuth(caller);
    let result = List.empty<MythologicalFigure>();
    for ((_, e) in mythologicalFigures.entries()) {
      if (Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateMythologicalFigure(entry : MythologicalFigure) : async Bool {
    requireAuth(caller);
    switch (mythologicalFigures.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          mythologicalFigures.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteMythologicalFigure(id : Text) : async Bool {
    requireAuth(caller);
    switch (mythologicalFigures.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          mythologicalFigures.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Lost Knowledge Entries ────────────────────────────────────────

  public shared ({ caller }) func addLostKnowledgeEntry(entry : LostKnowledgeEntry) : async Text {
    requireAuth(caller);
    let id = "lk-" # nextLostKnowledgeId.toText();
    nextLostKnowledgeId += 1;
    lostKnowledgeEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getLostKnowledgeEntries() : async [LostKnowledgeEntry] {
    requireAuth(caller);
    let result = List.empty<LostKnowledgeEntry>();
    for ((_, e) in lostKnowledgeEntries.entries()) {
      if (Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateLostKnowledgeEntry(entry : LostKnowledgeEntry) : async Bool {
    requireAuth(caller);
    switch (lostKnowledgeEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          lostKnowledgeEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteLostKnowledgeEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (lostKnowledgeEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          lostKnowledgeEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Character Legacies ─────────────────────────────────────────────

  public shared ({ caller }) func addCharacterLegacy(entry : CharacterLegacy) : async Text {
    requireAuth(caller);
    let id = "cl-" # nextCharacterLegacyId.toText();
    nextCharacterLegacyId += 1;
    characterLegacies.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCharacterLegacies(characterId : Text) : async [CharacterLegacy] {
    requireAuth(caller);
    let result = List.empty<CharacterLegacy>();
    for ((_, e) in characterLegacies.entries()) {
      if (e.characterId == characterId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateCharacterLegacy(entry : CharacterLegacy) : async Bool {
    requireAuth(caller);
    switch (characterLegacies.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          characterLegacies.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCharacterLegacy(id : Text) : async Bool {
    requireAuth(caller);
    switch (characterLegacies.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          characterLegacies.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Bloodline Entries ──────────────────────────────────────────────

  public shared ({ caller }) func addBloodlineEntry(entry : BloodlineEntry) : async Text {
    requireAuth(caller);
    let id = "bl-" # nextBloodlineEntryId.toText();
    nextBloodlineEntryId += 1;
    bloodlineEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getBloodlineEntries(characterId : Text) : async [BloodlineEntry] {
    requireAuth(caller);
    let result = List.empty<BloodlineEntry>();
    for ((_, e) in bloodlineEntries.entries()) {
      if (e.characterId == characterId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateBloodlineEntry(entry : BloodlineEntry) : async Bool {
    requireAuth(caller);
    switch (bloodlineEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          bloodlineEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteBloodlineEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (bloodlineEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          bloodlineEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Cursed Item Entries ────────────────────────────────────────────

  public shared ({ caller }) func addCursedItemEntry(entry : CursedItemEntry) : async Text {
    requireAuth(caller);
    let id = "ci-" # nextCursedItemEntryId.toText();
    nextCursedItemEntryId += 1;
    cursedItemEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCursedItemEntries(characterId : Text) : async [CursedItemEntry] {
    requireAuth(caller);
    let result = List.empty<CursedItemEntry>();
    for ((_, e) in cursedItemEntries.entries()) {
      if (e.characterId == characterId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateCursedItemEntry(entry : CursedItemEntry) : async Bool {
    requireAuth(caller);
    switch (cursedItemEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          cursedItemEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCursedItemEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (cursedItemEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          cursedItemEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Dream/Vision Entries ───────────────────────────────────────────

  public shared ({ caller }) func addDreamVisionEntry(entry : DreamVisionEntry) : async Text {
    requireAuth(caller);
    let id = "dv-" # nextDreamVisionEntryId.toText();
    nextDreamVisionEntryId += 1;
    dreamVisionEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getDreamVisionEntries(characterId : Text) : async [DreamVisionEntry] {
    requireAuth(caller);
    let result = List.empty<DreamVisionEntry>();
    for ((_, e) in dreamVisionEntries.entries()) {
      if (e.characterId == characterId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateDreamVisionEntry(entry : DreamVisionEntry) : async Bool {
    requireAuth(caller);
    switch (dreamVisionEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          dreamVisionEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteDreamVisionEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (dreamVisionEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          dreamVisionEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Inter-Preset War Entries ──────────────────────────────────────

  public shared ({ caller }) func addInterPresetWarEntry(entry : InterPresetWarEntry) : async Text {
    requireAuth(caller);
    let id = "ipw-" # nextInterPresetWarId.toText();
    nextInterPresetWarId += 1;
    interPresetWarEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getInterPresetWarEntries() : async [InterPresetWarEntry] {
    requireAuth(caller);
    let result = List.empty<InterPresetWarEntry>();
    for ((_, e) in interPresetWarEntries.entries()) {
      if (Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateInterPresetWarEntry(entry : InterPresetWarEntry) : async Bool {
    requireAuth(caller);
    switch (interPresetWarEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          interPresetWarEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteInterPresetWarEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (interPresetWarEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          interPresetWarEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Defection Entries ──────────────────────────────────────────────

  public shared ({ caller }) func addDefectionEntry(entry : DefectionEntry) : async Text {
    requireAuth(caller);
    let id = "def-" # nextDefectionEntryId.toText();
    nextDefectionEntryId += 1;
    defectionEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getDefectionEntries() : async [DefectionEntry] {
    requireAuth(caller);
    let result = List.empty<DefectionEntry>();
    for ((_, e) in defectionEntries.entries()) {
      if (Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateDefectionEntry(entry : DefectionEntry) : async Bool {
    requireAuth(caller);
    switch (defectionEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          defectionEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteDefectionEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (defectionEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          defectionEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Army Alignment Entries ────────────────────────────────────────

  public shared ({ caller }) func saveArmyAlignment(entry : ArmyAlignmentEntry) : async Bool {
    requireAuth(caller);
    switch (armyAlignmentEntries.get(entry.armyId)) {
      case (null) {
        armyAlignmentEntries.add(entry.armyId, { entry with owner = caller });
        true;
      };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          armyAlignmentEntries.add(entry.armyId, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public query ({ caller }) func getArmyAlignment(armyId : Text) : async ?ArmyAlignmentEntry {
    requireAuth(caller);
    switch (armyAlignmentEntries.get(armyId)) {
      case (null) { null };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { null } else { ?existing };
      };
    };
  };


  // ─── CRUD Helpers: Preset Tracker pattern ────────────────────────────────

  // ─── CRUD: Celestial Blessings ────────────────────────────────────────────

  public shared ({ caller }) func addCelestialBlessing(entry : CelestialBlessingEntry) : async Text {
    requireAuth(caller);
    let id = "cb-" # nextCelestialBlessingId.toText();
    nextCelestialBlessingId += 1;
    celestialBlessings.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCelestialBlessings(armyId : Text) : async [CelestialBlessingEntry] {
    requireAuth(caller);
    let result = List.empty<CelestialBlessingEntry>();
    for ((_, e) in celestialBlessings.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateCelestialBlessing(entry : CelestialBlessingEntry) : async Bool {
    requireAuth(caller);
    switch (celestialBlessings.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          celestialBlessings.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCelestialBlessing(id : Text) : async Bool {
    requireAuth(caller);
    switch (celestialBlessings.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          celestialBlessings.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Fallen Soldiers ────────────────────────────────────────────────

  public shared ({ caller }) func addFallenSoldier(entry : FallenSoldierEntry) : async Text {
    requireAuth(caller);
    let id = "fs-" # nextFallenSoldierId.toText();
    nextFallenSoldierId += 1;
    fallenSoldierEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getFallenSoldiers(armyId : Text) : async [FallenSoldierEntry] {
    requireAuth(caller);
    let result = List.empty<FallenSoldierEntry>();
    for ((_, e) in fallenSoldierEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateFallenSoldier(entry : FallenSoldierEntry) : async Bool {
    requireAuth(caller);
    switch (fallenSoldierEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          fallenSoldierEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteFallenSoldier(id : Text) : async Bool {
    requireAuth(caller);
    switch (fallenSoldierEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          fallenSoldierEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Holy Relics ────────────────────────────────────────────────────

  public shared ({ caller }) func addHolyRelic(entry : HolyRelicEntry) : async Text {
    requireAuth(caller);
    let id = "hr-" # nextHolyRelicId.toText();
    nextHolyRelicId += 1;
    holyRelicEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getHolyRelics(armyId : Text) : async [HolyRelicEntry] {
    requireAuth(caller);
    let result = List.empty<HolyRelicEntry>();
    for ((_, e) in holyRelicEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateHolyRelic(entry : HolyRelicEntry) : async Bool {
    requireAuth(caller);
    switch (holyRelicEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          holyRelicEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteHolyRelic(id : Text) : async Bool {
    requireAuth(caller);
    switch (holyRelicEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          holyRelicEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Divine Mandates ────────────────────────────────────────────────

  public shared ({ caller }) func addDivineMandate(entry : DivineMandateEntry) : async Text {
    requireAuth(caller);
    let id = "dm-" # nextDivineMandateId.toText();
    nextDivineMandateId += 1;
    divineMandateEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getDivineMandates(armyId : Text) : async [DivineMandateEntry] {
    requireAuth(caller);
    let result = List.empty<DivineMandateEntry>();
    for ((_, e) in divineMandateEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateDivineMandate(entry : DivineMandateEntry) : async Bool {
    requireAuth(caller);
    switch (divineMandateEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          divineMandateEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteDivineMandate(id : Text) : async Bool {
    requireAuth(caller);
    switch (divineMandateEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          divineMandateEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Ascension Log ──────────────────────────────────────────────────

  public shared ({ caller }) func addAscensionLogEntry(entry : AscensionLogEntry) : async Text {
    requireAuth(caller);
    let id = "asc-" # nextAscensionLogId.toText();
    nextAscensionLogId += 1;
    ascensionLogEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getAscensionLog(armyId : Text) : async [AscensionLogEntry] {
    requireAuth(caller);
    let result = List.empty<AscensionLogEntry>();
    for ((_, e) in ascensionLogEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateAscensionLogEntry(entry : AscensionLogEntry) : async Bool {
    requireAuth(caller);
    switch (ascensionLogEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          ascensionLogEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteAscensionLogEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (ascensionLogEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          ascensionLogEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Sin & Corruption Log ───────────────────────────────────────────

  public shared ({ caller }) func addSinCorruptionEntry(entry : SinCorruptionEntry) : async Text {
    requireAuth(caller);
    let id = "sc-" # nextSinCorruptionId.toText();
    nextSinCorruptionId += 1;
    sinCorruptionEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getSinCorruptionLog(armyId : Text) : async [SinCorruptionEntry] {
    requireAuth(caller);
    let result = List.empty<SinCorruptionEntry>();
    for ((_, e) in sinCorruptionEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateSinCorruptionEntry(entry : SinCorruptionEntry) : async Bool {
    requireAuth(caller);
    switch (sinCorruptionEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          sinCorruptionEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteSinCorruptionEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (sinCorruptionEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          sinCorruptionEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Prayer Log ─────────────────────────────────────────────────────

  public shared ({ caller }) func addPrayerLogEntry(entry : PrayerLogEntry) : async Text {
    requireAuth(caller);
    let id = "pl-" # nextPrayerLogId.toText();
    nextPrayerLogId += 1;
    prayerLogEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getPrayerLog(armyId : Text) : async [PrayerLogEntry] {
    requireAuth(caller);
    let result = List.empty<PrayerLogEntry>();
    for ((_, e) in prayerLogEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updatePrayerLogEntry(entry : PrayerLogEntry) : async Bool {
    requireAuth(caller);
    switch (prayerLogEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          prayerLogEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deletePrayerLogEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (prayerLogEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          prayerLogEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Holy War Log ───────────────────────────────────────────────────

  public shared ({ caller }) func addHolyWarEntry(entry : HolyWarEntry) : async Text {
    requireAuth(caller);
    let id = "hw-" # nextHolyWarId.toText();
    nextHolyWarId += 1;
    holyWarEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getHolyWarLog(armyId : Text) : async [HolyWarEntry] {
    requireAuth(caller);
    let result = List.empty<HolyWarEntry>();
    for ((_, e) in holyWarEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateHolyWarEntry(entry : HolyWarEntry) : async Bool {
    requireAuth(caller);
    switch (holyWarEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          holyWarEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteHolyWarEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (holyWarEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          holyWarEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Angel Class Log ────────────────────────────────────────────────

  public shared ({ caller }) func addAngelClassEntry(entry : AngelClassEntry) : async Text {
    requireAuth(caller);
    let id = "ac-" # nextAngelClassId.toText();
    nextAngelClassId += 1;
    angelClassEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getAngelClassLog(armyId : Text) : async [AngelClassEntry] {
    requireAuth(caller);
    let result = List.empty<AngelClassEntry>();
    for ((_, e) in angelClassEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateAngelClassEntry(entry : AngelClassEntry) : async Bool {
    requireAuth(caller);
    switch (angelClassEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          angelClassEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteAngelClassEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (angelClassEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          angelClassEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Corruption Log (Infernal) ──────────────────────────────────────

  public shared ({ caller }) func addCorruptionLogEntry(entry : CorruptionLogEntry) : async Text {
    requireAuth(caller);
    let id = "cl-" # nextCorruptionLogId.toText();
    nextCorruptionLogId += 1;
    corruptionLogEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getCorruptionLog(armyId : Text) : async [CorruptionLogEntry] {
    requireAuth(caller);
    let result = List.empty<CorruptionLogEntry>();
    for ((_, e) in corruptionLogEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateCorruptionLogEntry(entry : CorruptionLogEntry) : async Bool {
    requireAuth(caller);
    switch (corruptionLogEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          corruptionLogEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCorruptionLogEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (corruptionLogEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          corruptionLogEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Soul Bounty Log ────────────────────────────────────────────────

  public shared ({ caller }) func addSoulBountyEntry(entry : SoulBountyEntry) : async Text {
    requireAuth(caller);
    let id = "sb-" # nextSoulBountyId.toText();
    nextSoulBountyId += 1;
    soulBountyEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getSoulBountyLog(armyId : Text) : async [SoulBountyEntry] {
    requireAuth(caller);
    let result = List.empty<SoulBountyEntry>();
    for ((_, e) in soulBountyEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateSoulBountyEntry(entry : SoulBountyEntry) : async Bool {
    requireAuth(caller);
    switch (soulBountyEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          soulBountyEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteSoulBountyEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (soulBountyEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          soulBountyEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Pact & Contract Log ────────────────────────────────────────────

  public shared ({ caller }) func addPactContractEntry(entry : PactContractEntry) : async Text {
    requireAuth(caller);
    let id = "pc-" # nextPactContractId.toText();
    nextPactContractId += 1;
    pactContractEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getPactContractLog(armyId : Text) : async [PactContractEntry] {
    requireAuth(caller);
    let result = List.empty<PactContractEntry>();
    for ((_, e) in pactContractEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updatePactContractEntry(entry : PactContractEntry) : async Bool {
    requireAuth(caller);
    switch (pactContractEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          pactContractEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deletePactContractEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (pactContractEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          pactContractEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Realm Territory Log ────────────────────────────────────────────

  public shared ({ caller }) func addRealmTerritoryEntry(entry : RealmTerritoryEntry) : async Text {
    requireAuth(caller);
    let id = "rt-" # nextRealmTerritoryId.toText();
    nextRealmTerritoryId += 1;
    realmTerritoryEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getRealmTerritoryLog(armyId : Text) : async [RealmTerritoryEntry] {
    requireAuth(caller);
    let result = List.empty<RealmTerritoryEntry>();
    for ((_, e) in realmTerritoryEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateRealmTerritoryEntry(entry : RealmTerritoryEntry) : async Bool {
    requireAuth(caller);
    switch (realmTerritoryEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          realmTerritoryEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteRealmTerritoryEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (realmTerritoryEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          realmTerritoryEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Betrayal Log ───────────────────────────────────────────────────

  public shared ({ caller }) func addBetrayalLogEntry(entry : BetrayalLogEntry) : async Text {
    requireAuth(caller);
    let id = "bl-" # nextBetrayalLogId.toText();
    nextBetrayalLogId += 1;
    betrayalLogEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getBetrayalLog(armyId : Text) : async [BetrayalLogEntry] {
    requireAuth(caller);
    let result = List.empty<BetrayalLogEntry>();
    for ((_, e) in betrayalLogEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateBetrayalLogEntry(entry : BetrayalLogEntry) : async Bool {
    requireAuth(caller);
    switch (betrayalLogEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          betrayalLogEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteBetrayalLogEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (betrayalLogEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          betrayalLogEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Summoning Log ──────────────────────────────────────────────────

  public shared ({ caller }) func addSummoningLogEntry(entry : SummoningLogEntry) : async Text {
    requireAuth(caller);
    let id = "sl-" # nextSummoningLogId.toText();
    nextSummoningLogId += 1;
    summoningLogEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getSummoningLog(armyId : Text) : async [SummoningLogEntry] {
    requireAuth(caller);
    let result = List.empty<SummoningLogEntry>();
    for ((_, e) in summoningLogEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateSummoningLogEntry(entry : SummoningLogEntry) : async Bool {
    requireAuth(caller);
    switch (summoningLogEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          summoningLogEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteSummoningLogEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (summoningLogEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          summoningLogEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Demon Class Log ────────────────────────────────────────────────

  public shared ({ caller }) func addDemonClassEntry(entry : DemonClassEntry) : async Text {
    requireAuth(caller);
    let id = "dc-" # nextDemonClassId.toText();
    nextDemonClassId += 1;
    demonClassEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getDemonClassLog(armyId : Text) : async [DemonClassEntry] {
    requireAuth(caller);
    let result = List.empty<DemonClassEntry>();
    for ((_, e) in demonClassEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateDemonClassEntry(entry : DemonClassEntry) : async Bool {
    requireAuth(caller);
    switch (demonClassEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          demonClassEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteDemonClassEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (demonClassEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          demonClassEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Dark Ritual Log ────────────────────────────────────────────────

  public shared ({ caller }) func addDarkRitualEntry(entry : DarkRitualEntry) : async Text {
    requireAuth(caller);
    let id = "dr-" # nextDarkRitualId.toText();
    nextDarkRitualId += 1;
    darkRitualEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getDarkRitualLog(armyId : Text) : async [DarkRitualEntry] {
    requireAuth(caller);
    let result = List.empty<DarkRitualEntry>();
    for ((_, e) in darkRitualEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateDarkRitualEntry(entry : DarkRitualEntry) : async Bool {
    requireAuth(caller);
    switch (darkRitualEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          darkRitualEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteDarkRitualEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (darkRitualEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          darkRitualEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Infernal Debt Log ──────────────────────────────────────────────

  public shared ({ caller }) func addInfernalDebtEntry(entry : InfernalDebtEntry) : async Text {
    requireAuth(caller);
    let id = "id-" # nextInfernalDebtId.toText();
    nextInfernalDebtId += 1;
    infernalDebtEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getInfernalDebtLog(armyId : Text) : async [InfernalDebtEntry] {
    requireAuth(caller);
    let result = List.empty<InfernalDebtEntry>();
    for ((_, e) in infernalDebtEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateInfernalDebtEntry(entry : InfernalDebtEntry) : async Bool {
    requireAuth(caller);
    switch (infernalDebtEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          infernalDebtEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteInfernalDebtEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (infernalDebtEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          infernalDebtEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Clearance Levels (SCP) ────────────────────────────────────────

  public shared ({ caller }) func addClearanceLevelEntry(entry : ClearanceLevelEntry) : async Text {
    requireAuth(caller);
    let id = "clv-" # nextClearanceLevelId.toText();
    nextClearanceLevelId += 1;
    clearanceLevelEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getClearanceLevels(armyId : Text) : async [ClearanceLevelEntry] {
    requireAuth(caller);
    let result = List.empty<ClearanceLevelEntry>();
    for ((_, e) in clearanceLevelEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateClearanceLevelEntry(entry : ClearanceLevelEntry) : async Bool {
    requireAuth(caller);
    switch (clearanceLevelEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          clearanceLevelEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteClearanceLevelEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (clearanceLevelEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          clearanceLevelEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Containment Breach Log ────────────────────────────────────────

  public shared ({ caller }) func addContainmentBreachEntry(entry : ContainmentBreachEntry) : async Text {
    requireAuth(caller);
    let id = "cbe-" # nextContainmentBreachId.toText();
    nextContainmentBreachId += 1;
    containmentBreachEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getContainmentBreachLog(armyId : Text) : async [ContainmentBreachEntry] {
    requireAuth(caller);
    let result = List.empty<ContainmentBreachEntry>();
    for ((_, e) in containmentBreachEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateContainmentBreachEntry(entry : ContainmentBreachEntry) : async Bool {
    requireAuth(caller);
    switch (containmentBreachEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          containmentBreachEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteContainmentBreachEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (containmentBreachEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          containmentBreachEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Anomaly Exposure Log ───────────────────────────────────────────

  public shared ({ caller }) func addAnomalyExposureEntry(entry : AnomalyExposureEntry) : async Text {
    requireAuth(caller);
    let id = "ae-" # nextAnomalyExposureId.toText();
    nextAnomalyExposureId += 1;
    anomalyExposureEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getAnomalyExposureLog(armyId : Text) : async [AnomalyExposureEntry] {
    requireAuth(caller);
    let result = List.empty<AnomalyExposureEntry>();
    for ((_, e) in anomalyExposureEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateAnomalyExposureEntry(entry : AnomalyExposureEntry) : async Bool {
    requireAuth(caller);
    switch (anomalyExposureEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          anomalyExposureEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteAnomalyExposureEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (anomalyExposureEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          anomalyExposureEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: SCP Object Log ─────────────────────────────────────────────────

  public shared ({ caller }) func addScpObjectEntry(entry : ScpObjectEntry) : async Text {
    requireAuth(caller);
    let id = "scp-" # nextScpObjectId.toText();
    nextScpObjectId += 1;
    scpObjectEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getScpObjectLog(armyId : Text) : async [ScpObjectEntry] {
    requireAuth(caller);
    let result = List.empty<ScpObjectEntry>();
    for ((_, e) in scpObjectEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateScpObjectEntry(entry : ScpObjectEntry) : async Bool {
    requireAuth(caller);
    switch (scpObjectEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          scpObjectEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteScpObjectEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (scpObjectEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          scpObjectEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Protocol Log ───────────────────────────────────────────────────

  public shared ({ caller }) func addProtocolLogEntry(entry : ProtocolLogEntry) : async Text {
    requireAuth(caller);
    let id = "prot-" # nextProtocolLogId.toText();
    nextProtocolLogId += 1;
    protocolLogEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getProtocolLog(armyId : Text) : async [ProtocolLogEntry] {
    requireAuth(caller);
    let result = List.empty<ProtocolLogEntry>();
    for ((_, e) in protocolLogEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateProtocolLogEntry(entry : ProtocolLogEntry) : async Bool {
    requireAuth(caller);
    switch (protocolLogEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          protocolLogEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteProtocolLogEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (protocolLogEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          protocolLogEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Amnestic Log ───────────────────────────────────────────────────

  public shared ({ caller }) func addAmnesticLogEntry(entry : AmnesticLogEntry) : async Text {
    requireAuth(caller);
    let id = "am-" # nextAmnesticLogId.toText();
    nextAmnesticLogId += 1;
    amnesticLogEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getAmnesticLog(armyId : Text) : async [AmnesticLogEntry] {
    requireAuth(caller);
    let result = List.empty<AmnesticLogEntry>();
    for ((_, e) in amnesticLogEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateAmnesticLogEntry(entry : AmnesticLogEntry) : async Bool {
    requireAuth(caller);
    switch (amnesticLogEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          amnesticLogEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteAmnesticLogEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (amnesticLogEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          amnesticLogEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Psych Eval Log ─────────────────────────────────────────────────

  public shared ({ caller }) func addPsychEvalEntry(entry : PsychEvalEntry) : async Text {
    requireAuth(caller);
    let id = "pe-" # nextPsychEvalId.toText();
    nextPsychEvalId += 1;
    psychEvalEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getPsychEvalLog(armyId : Text) : async [PsychEvalEntry] {
    requireAuth(caller);
    let result = List.empty<PsychEvalEntry>();
    for ((_, e) in psychEvalEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updatePsychEvalEntry(entry : PsychEvalEntry) : async Bool {
    requireAuth(caller);
    switch (psychEvalEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          psychEvalEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deletePsychEvalEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (psychEvalEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          psychEvalEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Reclassification Log ───────────────────────────────────────────

  public shared ({ caller }) func addReclassificationEntry(entry : ReclassificationEntry) : async Text {
    requireAuth(caller);
    let id = "rc-" # nextReclassificationId.toText();
    nextReclassificationId += 1;
    reclassificationEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getReclassificationLog(armyId : Text) : async [ReclassificationEntry] {
    requireAuth(caller);
    let result = List.empty<ReclassificationEntry>();
    for ((_, e) in reclassificationEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateReclassificationEntry(entry : ReclassificationEntry) : async Bool {
    requireAuth(caller);
    switch (reclassificationEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          reclassificationEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteReclassificationEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (reclassificationEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          reclassificationEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Site Assignment Log ────────────────────────────────────────────

  public shared ({ caller }) func addSiteAssignmentEntry(entry : SiteAssignmentEntry) : async Text {
    requireAuth(caller);
    let id = "sa-" # nextSiteAssignmentId.toText();
    nextSiteAssignmentId += 1;
    siteAssignmentEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getSiteAssignmentLog(armyId : Text) : async [SiteAssignmentEntry] {
    requireAuth(caller);
    let result = List.empty<SiteAssignmentEntry>();
    for ((_, e) in siteAssignmentEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateSiteAssignmentEntry(entry : SiteAssignmentEntry) : async Bool {
    requireAuth(caller);
    switch (siteAssignmentEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          siteAssignmentEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteSiteAssignmentEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (siteAssignmentEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          siteAssignmentEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Black Budget Log ───────────────────────────────────────────────

  public shared ({ caller }) func addBlackBudgetEntry(entry : BlackBudgetEntry) : async Text {
    requireAuth(caller);
    let id = "bb-" # nextBlackBudgetId.toText();
    nextBlackBudgetId += 1;
    blackBudgetEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getBlackBudgetLog(armyId : Text) : async [BlackBudgetEntry] {
    requireAuth(caller);
    let result = List.empty<BlackBudgetEntry>();
    for ((_, e) in blackBudgetEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateBlackBudgetEntry(entry : BlackBudgetEntry) : async Bool {
    requireAuth(caller);
    switch (blackBudgetEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          blackBudgetEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteBlackBudgetEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (blackBudgetEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          blackBudgetEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Whistleblower Log ──────────────────────────────────────────────

  public shared ({ caller }) func addWhistleblowerEntry(entry : WhistleblowerEntry) : async Text {
    requireAuth(caller);
    let id = "wb-" # nextWhistleblowerId.toText();
    nextWhistleblowerId += 1;
    whistleblowerEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getWhistleblowerLog(armyId : Text) : async [WhistleblowerEntry] {
    requireAuth(caller);
    let result = List.empty<WhistleblowerEntry>();
    for ((_, e) in whistleblowerEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateWhistleblowerEntry(entry : WhistleblowerEntry) : async Bool {
    requireAuth(caller);
    switch (whistleblowerEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          whistleblowerEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteWhistleblowerEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (whistleblowerEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          whistleblowerEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── CRUD: Ethics Review Log ──────────────────────────────────────────────

  public shared ({ caller }) func addEthicsReviewEntry(entry : EthicsReviewEntry) : async Text {
    requireAuth(caller);
    let id = "er-" # nextEthicsReviewId.toText();
    nextEthicsReviewId += 1;
    ethicsReviewEntries.add(id, { entry with id; owner = caller });
    id;
  };

  public query ({ caller }) func getEthicsReviewLog(armyId : Text) : async [EthicsReviewEntry] {
    requireAuth(caller);
    let result = List.empty<EthicsReviewEntry>();
    for ((_, e) in ethicsReviewEntries.entries()) {
      if (e.armyId == armyId and Principal.equal(e.owner, caller)) { result.add(e) };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateEthicsReviewEntry(entry : EthicsReviewEntry) : async Bool {
    requireAuth(caller);
    switch (ethicsReviewEntries.get(entry.id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          ethicsReviewEntries.add(entry.id, { entry with owner = existing.owner });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func deleteEthicsReviewEntry(id : Text) : async Bool {
    requireAuth(caller);
    switch (ethicsReviewEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller)) { false } else {
          ethicsReviewEntries.remove(id);
          true;
        };
      };
    };
  };

  // ─── Army Morale History ─────────────────────────────────────────────────

  public shared ({ caller }) func addArmyMoraleEvent(armyId : Text, event : ArmyMoraleHistoryEntry) : async Bool {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot add morale events for armies you do not own");
    };
    let list = switch (armyMoraleHistory.get(armyId)) {
      case (null) { List.empty<ArmyMoraleHistoryEntry>() };
      case (?l) { l };
    };
    list.add(event);
    armyMoraleHistory.add(armyId, list);
    switch (armies.get(armyId)) {
      case (null) {};
      case (?army) {
        let newMorale : Nat = if (event.modifier >= 0) {
          army.moraleRating + event.modifier.toNat();
        } else {
          let drop = (- event.modifier).toNat();
          if (drop >= army.moraleRating) { 0 } else { army.moraleRating - drop };
        };
        armies.add(armyId, { army with moraleRating = newMorale });
      };
    };
    true;
  };

  public query ({ caller }) func getArmyMoraleHistory(armyId : Text) : async [ArmyMoraleHistoryEntry] {
    requireAuth(caller);
    if (not verifyArmyOwnership(caller, armyId)) {
      Runtime.trap("Unauthorized: Cannot get morale history for armies you do not own");
    };
    switch (armyMoraleHistory.get(armyId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };
};

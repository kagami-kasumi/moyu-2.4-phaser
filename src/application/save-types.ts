import type {BellFusionState} from '../domain/bell-fusion.ts';
import type {WarehouseState} from '../domain/warehouse.ts';
import type {ShopUpgradeState} from '../domain/shop-upgrades.ts';
import type {ConsumableState} from '../domain/character-consumables.ts';
import type {Profession,characterStart} from '../content/character-entry.ts';
import type {MapId} from '../domain/journey.ts';
import type {Item,PetRecord,Drop} from '../domain/npc-reward.ts';
import type {EquipmentSlot} from '../domain/inventory.ts';
import type {Vitals} from '../domain/hud.ts';

/** Design: only data and owned inventory containers cross the persistence port. */
export interface GameProgress {
 abyssField?:import('../domain/black-abyss-field.ts').AbyssFieldState;abyssBattle?:import('../domain/black-abyss-battle.ts').AbyssBattleState;frostBattle?:import('../domain/ice-palace-battle.ts').FrostBattleState;iceBattle?:import('../domain/ice-battle.ts').IceBattleState;borderField?:import('../domain/border-field.ts').BorderFieldState;southField?:import('../domain/south-field.ts').SouthFieldState;southBattle?:import('../domain/south-battle.ts').SouthBattleState;
 swampBattle?:import('../domain/swamp-battle.ts').SwampBattleState;
 gobiBattle?:import('../domain/gobi-battle.ts').GobiBattleState;
 banditWarning?:number;
 marshalQuests?:import('../domain/marshal-quests.ts').MarshalState;
 firstQuest?:import('../domain/first-combat-quest.ts').FirstQuestState;
 combatLedger?:import('../domain/first-combat.ts').CombatLedger;
 combat?:import('../domain/first-combat.ts').FirstCombatSave;
 royalChests?:import('../domain/royal-chests.ts').RoyalChestState;
 royalVisits?:import('../content/map-layout.ts').RoyalVisits;
 name:string;profession:Profession;initialState:ReturnType<typeof characterStart>;
 map:MapId;x:number;y:number;complete:boolean;transitions:number;facing:'left'|'right';
 petTitles?:(number|null)[];petProgression?:{maxBattleNum:number;slots:(number|null)[];bells?:(Item|null)[];reserved?:number[]};vitals:Vitals;petVitals:Vitals;
 reward:{petCollectionEdited?:boolean;upLevelPrize?:number;bag:(Item|null)[];pets:PetRecord[];drops:Drop[];ms:number;res:number;credit:number;titleLevel:number;cmd:number;nextCmd:number;claimedPack:number|null};
 inventory:{militaryRank?:number;militaryRankFire?:number;nobilityRank?:number;maxLevel?:number;skills?:Record<string,number>;xpEnabled?:boolean;consumables?:ConsumableState;equipment:Record<EquipmentSlot,Item|null>;bravery:number;exploit:number;militaryExploit:number};
 rescue?:import('../domain/south-rescue.ts').RescueState;cityVisit?:{homeCity:string;mirageGranted:boolean;shuxinMirageGranted?:boolean;gobiMirageGranted?:boolean;icePalaceMirageGranted?:boolean;borderMirageGranted?:boolean;southMirageGranted?:boolean;southPrisonRescued?:boolean;swampMirageGranted?:boolean;gobiPetShopOpenNumber?:number};
 recycle?:{item:Item|null};
 warehouse?:WarehouseState;
 bellFusion?:BellFusionState;
 fusion?:{stone1:Item|null;stone2:Item|null};
 outskirtsProperty?:boolean;
 petShop?:{openNumber:number;upgrades?:ShopUpgradeState};
 pharmacy?:{openNumber:number};
 shop?:{openNumber:number;upgrades?:ShopUpgradeState};
 splitStone?:{item:Item|null;stone1:Item|null;stone2:Item|null;stone3:Item|null};
 crafting:{item:Item|null;stone:Item|null};
}

import type {Profession,characterStart} from '../content/character-entry.ts';
import type {MapId} from '../domain/journey.ts';
import type {Item,PetRecord,Drop} from '../domain/npc-reward.ts';
import type {EquipmentSlot} from '../domain/inventory.ts';
import type {Vitals} from '../domain/hud.ts';

/** Design: only data and owned inventory containers cross the persistence port. */
export interface GameProgress {
 name:string;profession:Profession;initialState:ReturnType<typeof characterStart>;
 map:MapId;x:number;y:number;complete:boolean;transitions:number;facing:'left'|'right';
 vitals:Vitals;petVitals:Vitals;
 reward:{bag:(Item|null)[];pets:PetRecord[];drops:Drop[];ms:number;res:number;credit:number;titleLevel:number;cmd:number;nextCmd:number;claimedPack:number|null};
 inventory:{equipment:Record<EquipmentSlot,Item|null>;bravery:number;exploit:number;militaryExploit:number};
 crafting:{item:Item|null;stone:Item|null};
}

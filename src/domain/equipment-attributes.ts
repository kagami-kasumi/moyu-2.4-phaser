import {refreshItemNumbers} from '../content/item-numeric-rules.ts';
import type {Item} from './npc-reward.ts';
import {EQUIPMENT_RULES as rules} from '../content/equipment-rules.ts';
import {contentOfKind} from '../content/registry.ts';
const names=contentOfKind('equipment');
/** Source upDataWeapon's four normalized equipment branches. */
export function refreshEquipmentAttributes(item:Item){
 const level=Number(item.levels??1),profession=item.vocational==='战士'?'战士':'法师';
 const family=rules.names.family[item.type as keyof typeof rules.names.family];
 if(family){const index=Math.floor(Math.min(level,rules.names.maximumNameLevel)/rules.names.levelStep);const definition=names.find(n=>n.data.profession===profession&&n.data.family===family&&n.data.sourceNameIndex===index);if(definition)item.name=definition.name;}
 refreshItemNumbers(item);
}


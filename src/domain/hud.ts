import {petDetails} from './pet-details.ts';
/** Initial values verified from RoleMC constructor/flashAttribute and map frame 1. */
import {WARRIOR_RATES} from '../content/implemented-gameplay-rules.ts';
import {ITEM_PETS} from '../content/item-pets.ts';
import {CHARACTERS,type Profession} from '../content/character-entry.ts';
export interface Vitals {level:number;life:number;maxLife:number;mp:number;maxMp:number;exp:number;maxExp:number}
export const initialWarriorVitals=():Vitals=>{const life=Math.round(WARRIOR_RATES.rateLife*6),mp=Math.round(WARRIOR_RATES.rateMp*6);return {level:1,life,maxLife:life,mp,maxMp:mp,exp:0,maxExp:9};};
export const initialCharacterVitals=(profession:Profession,name:string):Vitals=>{const r=CHARACTERS[profession].rates,life=Math.round(r.rateLife*6),mp=Math.round(r.rateMp*6);return {level:name.toLowerCase()==='debug'?100:1,life,maxLife:life,mp,maxMp:mp,exp:0,maxExp:9};};
export const initialKainVitals=():Vitals=>{const pet=ITEM_PETS['凯恩']!,life=petDetails({...pet,battle:true})!.maxLife;return {level:pet.levels,life,maxLife:life,mp:0,maxMp:0,exp:0,maxExp:Math.floor(pet.levels*9)};};
export function fraction(value:number,max:number){return max>0?Math.max(0,Math.min(1,value/max)):0;}

import {ITEM_PETS,type PetSeed} from '../content/item-pets.ts';
import {miracleDragonSeed} from '../content/miracle-dragon-rules.ts';
import {PET_SPECIES} from '../content/pet-species-data.ts';
import type {PetRecord} from './npc-reward.ts';
export const isPetEgg=(type:string)=>type==='奇迹龙'||Object.hasOwn(ITEM_PETS,type);
function draw(random:()=>number){const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('无效随机输入');return value;}
/** Source seed generation precedes capacity check; constructor randomness follows it. */
export function hatchPet(type:string,capacityAvailable:boolean,random:()=>number=Math.random):PetRecord|null {
 let seed:PetSeed&{rareFen?:number};
 if(type==='奇迹龙')seed=miracleDragonSeed(Math.floor(draw(random)*4),Array.from({length:4},()=>draw(random)));
 else{const fixed=ITEM_PETS[type];if(!fixed)return null;seed=fixed;}
 if(!capacityAvailable)return null;
 return {...seed,battle:false,nowLifeLv:0,nowExp:0,maxExp:Math.floor(seed.levels*9),oldLevels:1,oldNowExp:0,oldMaxExp:Math.floor(seed.levels*9),sd:0,qyg:0,isGod:false,nextLvRate:Math.floor(draw(random)*3)*0.1+1.3,rareFen:Math.max(PET_SPECIES[seed.type]!.rareFen!,seed.rareFen??0)};
}

import type {FirstCombatMonster} from './first-combat-spawn.ts';
import {gobiDrops} from './gobi-battle.ts';

export const SOUTH_REGIONS=['southLeft','southUp','southCenter','southDown','southRight'] as const;
export type SouthRegion=typeof SOUTH_REGIONS[number];
export type SouthFlag='leftRegion'|'upRegion'|'centerRegion'|'downRegion'|'rightRegion';
export interface SouthBattleState {leftRegion:boolean;upRegion:boolean;centerRegion:boolean;downRegion:boolean;rightRegion:boolean;oldCity:string;warningTicks:number}
export const initialSouthBattle=():SouthBattleState=>({leftRegion:false,upRegion:false,centerRegion:false,downRegion:false,rightRegion:false,oldCity:'卡萨诺城二',warningTicks:0});
export const isSouthRegion=(map:string):map is SouthRegion=>(SOUTH_REGIONS as readonly string[]).includes(map);
export const southFlag=(region:SouthRegion):SouthFlag=>({southLeft:'leftRegion',southUp:'upRegion',southCenter:'centerRegion',southDown:'downRegion',southRight:'rightRegion'} as const)[region];
export function spawnSouthBattle(region:SouthRegion,random:(limit:number)=>number):FirstCombatMonster[]{
 const right=region==='southRight',level=60;
 const create=(index:number,x:number,y:number,boss:boolean):FirstCombatMonster=>{
  const scale=boss?(right?70:67):level,attack=(.65+.8+.65*(boss&&right?3:2))*(boss?1.5:1),life=51*(boss?(right?15:12):3)*scale;
  return {id:'monster'+(index+1),x,y,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:boss?150:90,guardLength:600,guardHeight:500,
   attackLength:(boss?200:150)+random(20)-10,attackHeight:(boss&&right?45:30)+random(10)-5,facing:random(2)!==1?'right':'left',speedX:boss?8:4,speedY:boss?4:2,
   minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:(.6+.75+.6*(boss&&right?3:2))*scale,ranged:false,attackTypeNum:boss?1:2,
   name:boss?(right?'魔军主将':'魔军副将'):'魔军士兵',species:boss?(right?'魔军主将':'魔军副将'):'魔军士兵',textColor:boss?16711680:16777215,
   level:boss?(right?65:62):level,life,maxLife:life,attackFire:boss?(right?200:186):150,burst:5,jook:boss?(right?35:25):5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:boss&&right?8:9,runFrames:12};
 };
 const monsters=[[60,300],[155,380],[320,400],[220,305]].map(([x,y],index)=>create(index,x!,y!,false));
 monsters[0]=create(0,300,250,true);return monsters;
}
/** Both legions use the same source monsterDeath/dropItem branches. */
export const southDrops=gobiDrops;
export function southDefeated(state:SouthBattleState,region:SouthRegion,name:string){
 if(name==='魔军副将')state[southFlag(region)]=false;
 if(name==='魔军主将')for(const area of SOUTH_REGIONS)state[southFlag(area)]=false;
}

import type {FirstCombatMonster} from './first-combat-spawn.ts';
import {gobiDrops} from './gobi-battle.ts';

export const FROST_REGIONS=['frostLeft','frostUp','frostCenter','frostDown','frostRight'] as const;
export type FrostRegion=typeof FROST_REGIONS[number];
export type FrostFlag='leftRegion'|'upRegion'|'centerRegion'|'downRegion'|'rightRegion';
export interface FrostBattleState {leftRegion:boolean;upRegion:boolean;centerRegion:boolean;downRegion:boolean;rightRegion:boolean;oldCity:string;warningTicks:number}
export const initialFrostBattle=():FrostBattleState=>({leftRegion:false,upRegion:false,centerRegion:false,downRegion:false,rightRegion:false,oldCity:'卡萨诺城二',warningTicks:0});
export const isFrostRegion=(map:string):map is FrostRegion=>(FROST_REGIONS as readonly string[]).includes(map);
export const frostFlag=(region:FrostRegion):FrostFlag=>({frostLeft:'leftRegion',frostUp:'upRegion',frostCenter:'centerRegion',frostDown:'downRegion',frostRight:'rightRegion'} as const)[region];
export function spawnFrostBattle(region:FrostRegion,random:(limit:number)=>number):FirstCombatMonster[]{
 const right=region==='frostRight',level=80;
 const create=(index:number,x:number,y:number,boss:boolean):FirstCombatMonster=>{
  const scale=boss?(right?90:87):level,attack=boss&&region==='frostCenter'?(.65+.8*1.3+.65*3*1.3):(.65+.8+.65*(3))*(boss?(right?1.8:1.5):1),life=51*(boss?15:3)*scale;
  return {id:'monster'+(index+1),x,y,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:boss?150:90,guardLength:600,guardHeight:500,
   attackLength:(boss?200:150)+random(20)-10,attackHeight:(boss&&right?45:30)+random(10)-5,facing:random(2)!==1?'right':'left',speedX:boss?8:4,speedY:boss?4:2,
   minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:(.6+.75*(boss?1.3:1)+.6*(3)*(boss?1.3:1))*scale,ranged:false,attackTypeNum:boss?1:2,
   name:boss?(right?'魔军主将':'魔军副将'):'魔军士兵',species:boss?(right?'魔军主将':'魔军副将'):'魔军士兵',textColor:boss?16711680:16777215,
   level:boss?(right?85:82):level,life,maxLife:life,attackFire:boss?(right?300:246):200,burst:5,jook:boss?(right?35:region==='frostCenter'?5:25):5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:boss&&right?8:9,runFrames:12};
 };
 const monsters=[[60,300],[155,380],[320,400],[220,305]].map(([x,y],index)=>create(index,x!,y!,false));
 monsters[0]=create(0,300,250,true);return monsters;
}
/** Both legions use the same source monsterDeath/dropItem branches. */
export const frostDrops=gobiDrops;
export function frostDefeated(state:FrostBattleState,region:FrostRegion,name:string){
 if(name==='魔军副将')state[frostFlag(region)]=false;
 if(name==='魔军主将')for(const area of FROST_REGIONS)state[frostFlag(area)]=false;
}


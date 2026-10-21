import type {FirstCombatMonster} from './first-combat-spawn.ts';
import {gobiDrops} from './gobi-battle.ts';

export const ABYSS_REGIONS=['abyssLeft','abyssUp','abyssCenter','abyssDown','abyssRight'] as const;
export type AbyssRegion=typeof ABYSS_REGIONS[number];
export type AbyssFlag='leftRegion'|'upRegion'|'centerRegion'|'downRegion'|'rightRegion';
export interface AbyssBattleState {leftRegion:boolean;upRegion:boolean;centerRegion:boolean;downRegion:boolean;rightRegion:boolean;oldCity:string;warningTicks:number}
export const initialAbyssBattle=():AbyssBattleState=>({leftRegion:false,upRegion:false,centerRegion:false,downRegion:false,rightRegion:false,oldCity:'卡萨诺城二',warningTicks:0});
export const isAbyssRegion=(map:string):map is AbyssRegion=>(ABYSS_REGIONS as readonly string[]).includes(map);
export const abyssFlag=(region:AbyssRegion):AbyssFlag=>({abyssLeft:'leftRegion',abyssUp:'upRegion',abyssCenter:'centerRegion',abyssDown:'downRegion',abyssRight:'rightRegion'} as const)[region];
export function spawnAbyssBattle(region:AbyssRegion,random:(limit:number)=>number):FirstCombatMonster[]{
 const right=region==='abyssRight',left=region==='abyssLeft',level=90;
 const create=(index:number,x:number,y:number,boss:boolean):FirstCombatMonster=>{
  const scale=boss?(right?100:97):level,attack=boss&&right?(.65+.8*1.4+.65*3*1.4):(.65+.8+.65*3)*(boss?(left?1.5:1.8):1),life=51*(boss?(left?18:15):3)*scale;
  return {id:'monster'+(index+1),x,y,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:boss?150:90,guardLength:600,guardHeight:500,
   attackLength:(boss?200:150)+random(20)-10,attackHeight:30+random(10)-5,facing:random(2)!==1?'right':'left',speedX:boss?8:4,speedY:boss?4:2,
   minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:(.6+.75*(boss?1.4:1)+.6*(3)*(boss?1.4:1))*scale,ranged:false,attackTypeNum:boss?1:2,
   name:boss?(right?'魔军主将':'魔军副将'):'魔军士兵',species:boss?(right?'魔军主将':'魔军副将'):'魔军士兵',textColor:boss?16711680:16777215,
   level:boss?(right?95:92):level,life,maxLife:life,attackFire:boss?(right?350:276):225,burst:5,jook:boss?(right?5:left?35:25):5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:boss&&right?8:9,runFrames:12};
 };
 const monsters=[[60,300],[155,380],[320,400],[220,305]].map(([x,y],index)=>create(index,x!,y!,false));
 monsters[0]=create(0,300,250,true);return monsters;
}
/** Both legions use the same source monsterDeath/dropItem branches. */
export const abyssDrops=gobiDrops;
export function abyssDefeated(state:AbyssBattleState,region:AbyssRegion,name:string){
 if(name==='魔军副将')state[abyssFlag(region)]=false;
 if(name==='魔军主将')for(const area of ABYSS_REGIONS)state[abyssFlag(area)]=false;
}


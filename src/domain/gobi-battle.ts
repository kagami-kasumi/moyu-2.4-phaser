import type {FirstCombatMonster} from './first-combat-spawn.ts';
import {firstCombatDrops,firstBossDrops,type FirstBossReward} from './first-combat-drops.ts';

export const GOBI_REGIONS=['gobiLeft','gobiUp','gobiCenter','gobiDown','gobiRight'] as const;
export type GobiRegion=typeof GOBI_REGIONS[number];
export type GobiFlag='leftRegion'|'upRegion'|'centerRegion'|'downRegion'|'rightRegion';
export interface GobiBattleState {leftRegion:boolean;upRegion:boolean;centerRegion:boolean;downRegion:boolean;rightRegion:boolean;oldCity:string;warningTicks:number}
export const initialGobiBattle=():GobiBattleState=>({leftRegion:false,upRegion:false,centerRegion:false,downRegion:false,rightRegion:false,oldCity:'卡萨诺城二',warningTicks:0});
export const isGobiRegion=(map:string):map is GobiRegion=>(GOBI_REGIONS as readonly string[]).includes(map);
export const gobiFlag=(region:GobiRegion):GobiFlag=>({gobiLeft:'leftRegion',gobiUp:'upRegion',gobiCenter:'centerRegion',gobiDown:'downRegion',gobiRight:'rightRegion'} as const)[region];
export function spawnGobiBattle(region:GobiRegion,random:(limit:number)=>number):FirstCombatMonster[]{
 const right=region==='gobiRight',level=right?30:35;
 const create=(index:number,x:number,y:number,boss:boolean):FirstCombatMonster=>{
  const scale=boss?40:level,attack=boss?.65+.8*1.5+.65*2*1.5:.65+.8+.65*2,life=51*(boss?12:3)*scale;
  return {id:'monster'+(index+1),x,y,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:boss?150:60,guardLength:600,guardHeight:500,
   attackLength:(boss?(right?200:180):150)+random(20)-10,attackHeight:(boss&&right?45:30)+random(10)-5,facing:random(2)!==1?'right':'left',speedX:boss?8:4,speedY:boss?4:2,
   minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:(.6+.75+.6*2)*scale,ranged:false,attackTypeNum:boss?1:2,
   name:boss?(right?'魔军主将':'魔军副将'):'魔军士兵',species:boss?(right?'魔军主将':'魔军副将'):'魔军士兵',textColor:boss?(right?16763955:16711680):16777215,
   level:boss?35:level,life,maxLife:life,attackFire:boss?(right?75:70):level*2,burst:5,jook:boss?(right?35:25):5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:boss&&right?8:9,runFrames:12};
 };
 const monsters=[[60,300],[155,380],[320,400],[220,305]].map(([x,y],index)=>create(index,x!,y!,false));
 monsters[0]=create(0,300,250,true);return monsters;
}
export function gobiDrops(name:string,level:number,profession:string,random:(limit:number)=>number,fraction:()=>number,emit:(event:FirstBossReward)=>void){
 if(name==='魔军士兵')firstCombatDrops(level,profession,true,random,emit,'魔军士兵');
 else firstBossDrops(level,profession,random,fraction,emit,name,false,{credit:name==='魔军主将',soul:name==='魔军主将'});
}
export function gobiDefeated(state:GobiBattleState,region:GobiRegion,name:string){
 if(name==='魔军副将')state[gobiFlag(region)]=false;
 if(name==='魔军主将')for(const area of GOBI_REGIONS)state[gobiFlag(area)]=false;
}

import type {FirstCombatMonster} from './first-combat-spawn.ts';
import type {FirstBossReward} from './first-combat-drops.ts';
import {firstBossDrops,advanceFirstBoss} from './first-combat-drops.ts';
export interface SouthFieldState {level:number;moreFire:number}
export type SouthBossKind='initial'|'random'|'guard'|'king';
export const initialSouthField=():SouthFieldState=>({level:70,moreFire:0});
export const isSouthField=(map:string)=>['southWildOne','southWildTwo','southWildThree','southWildFour','southWildFive'].includes(map);
export function advanceSouthField(state:SouthFieldState){const next=advanceFirstBoss(state.level,state.moreFire);state.level=next.level;state.moreFire=next.moreFire;}
/** frame63 is deliberately separate from flashBoss's random head formula. */
export function spawnSouthBoss(kind:SouthBossKind,level:number,moreFire:number,random:(n:number)=>number):FirstCombatMonster[]{
 const initial=kind==='initial',guard=kind==='guard',scale=level+5;
 const attack=initial?.65+.8*1.5+.65*2*1.5:(.65+.8*1.2+.65*(guard||kind==='king'?3:2)*1.2)*1.5;
 const defense=.6+.75*1.2+.6*(guard||kind==='king'?3:2)*1.2,life=51*12*scale;
 return [{id:'monster1',x:240,y:370,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:150,guardLength:400,guardHeight:150,attackLength:150+random(20)-10,attackHeight:30+random(10)-5,facing:random(2)!==1?'right':'left',speedX:8,speedY:4,minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:defense*scale,ranged:false,attackTypeNum:guard?2:1,name:guard?'恐兽护卫':kind==='king'?'妖王':'炎女头目',species:guard?'恐兽':'炎女',textColor:kind==='king'?16763955:16711680,level,life,maxLife:life,attackFire:Math.floor(moreFire+level*2+(guard?10:kind==='king'?20:0)),burst:5,jook:initial?5:15,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:guard?8:9,skillFrames:guard?8:9,runFrames:guard?12:10}];
}
export function southBossDrops(name:string,level:number,profession:string,finale:boolean,random:(n:number)=>number,fraction:()=>number,emit:(event:FirstBossReward)=>void){firstBossDrops(level,profession,random,fraction,emit,name,finale);}

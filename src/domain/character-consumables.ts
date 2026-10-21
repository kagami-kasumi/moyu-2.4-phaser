import type {Item} from './npc-reward.ts';
import type {Vitals} from './hud.ts';
import {XP_ENERGY_RULES} from '../content/xp-energy-rules.ts';

export const initialConsumables=()=>({expBallNum:0,moreExpFire:0,moreExpLife:0,moreExpMp:0,moreExpAttack:0,moreExpDefense:0,lifeSourseLevels:1,mpSourseLevels:1,lifeSourse:0,mpSourse:0,maxPower:XP_ENERGY_RULES.initial.maxPower as number,isFull:false});
export type ConsumableState=ReturnType<typeof initialConsumables>;
export interface HealingTarget {life:number;maxLife:number}
export interface HealingPanel {label?:string;isOpen:boolean;huanShou:HealingTarget;body:HealingTarget}
export const isConsumable=(i:Item)=>['药品','生命之源','魔力源泉','超级经验球','能量药水'].includes(i.type);
const write=(value:number,maximum:number,previous:number)=>Number.isNaN(value)?previous:value>maximum?maximum:value<0?0:value;
/** Root useItem selects by pet data but writes to the battle body, in slot order. */
export function applyMedicine(v:Vitals,item:Item,panels:readonly HealingPanel[]=[]){
 if(Number(item.mpVal)>0){if(v.life<=0)return false;v.mp=write(v.mp+Number(item.mpVal),v.maxMp,v.mp);}
 let target:HealingTarget=v,missing=v.maxLife-v.life;
 for(const p of panels.slice(0,3))if(p.isOpen&&p.huanShou.life>0&&p.huanShou.maxLife-p.huanShou.life>missing){target=p.body;missing=p.huanShou.maxLife-p.huanShou.life;}
 if(target.life<=0)return false;
 target.life=write(target.life+Number(item.hpVal),target.maxLife,target.life);return true;
}
export function useReserve(v:Vitals,s:ConsumableState,type:string,panels:readonly HealingPanel[]=[]){
 const heal=(target:HealingTarget)=>{if(target.life<=0)return;const gap=target.maxLife-target.life;if(s.lifeSourse>=gap){s.lifeSourse-=gap;target.life=target.maxLife;}else{target.life=write(target.life+s.lifeSourse,target.maxLife,target.life);s.lifeSourse=0;}};
 if(type==='生命之源'){heal(v);for(const p of panels.slice(0,3))heal(p.body);}
 else if(v.life>0){const gap=v.maxMp-v.mp;if(s.mpSourse>=gap){s.mpSourse-=gap;v.mp=v.maxMp;}else{v.mp=write(v.mp+s.mpSourse,v.maxMp,v.mp);s.mpSourse=0;}}
}
/** accountThing/useThing match type and either the requested name or an unnamed slot. */
export function spendMedicine(bag:(Item|null)[],item:Item){
 const match=(x:Item|null)=>x&&x.type===item.type&&(x.name===item.name||x.name===undefined);
 if(bag.reduce((n,x)=>n+(match(x)?Number(x!.number)||1:0),0)<1)return false;
 const index=bag.findIndex(x=>match(x));if(index<0)return false;
 const x=bag[index]!;if(Number(x.number)>1)x.number=Number(x.number)-1;else bag[index]=null;return true;
}

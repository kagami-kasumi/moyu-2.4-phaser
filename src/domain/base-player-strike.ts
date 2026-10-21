import {lockPlayerTarget,type PlayerTargeting} from './combat-targeting.ts';
import type {CombatTarget} from './monster-behavior.ts';
export interface BaseStrikeRole extends PlayerTargeting {profession:'战士'|'法师';level:number;minAttack:number;maxAttack:number;anger:boolean;fly:boolean;life:number;maxLife:number;heavyHit:number;frost:number;heavyDamage:number;nonDefense:number}
export type AuxiliaryStrike={type:'frost';duration:3}|{type:'heavy';attack:number;duration:5}|{type:'nonDefense';duration:5};
/** Base action effect only. Callbacks run synchronously in source order so a
 * death/reward can consume randomness before renewal. Renewal has its own owner. */
export function basePlayerStrike(p:BaseStrikeRole,enemies:readonly CombatTarget[],random:(n:number)=>number,auxiliary:(target:string,event:AuxiliaryStrike)=>void,hit:(target:string,attack:number,isMax:boolean)=>number|false,renew:(attack:number|false)=>void){
 const warrior=p.profession==='战士';if(!lockPlayerTarget(p,enemies,warrior?150:400,warrior?30:40))return false;
 const multiplier=(warrior?p.anger:p.fly)?1.5:1;
 if(warrior&&p.anger&&p.life>250)p.life=Math.max(0,p.life-Math.round(p.maxLife/25));
 const attack=warrior&&random(100)<p.heavyHit?p.maxAttack:p.minAttack+random(p.maxAttack-p.minAttack+1);
 if(random(100)<p.frost)auxiliary(p.target!,{type:'frost',duration:3});
 if(random(100)<p.heavyDamage)auxiliary(p.target!,{type:'heavy',attack:p.minAttack,duration:5});
 if(random(100)<p.nonDefense)auxiliary(p.target!,{type:'nonDefense',duration:5});
 const damage=warrior?Math.round(attack*multiplier+p.level*.5):attack*multiplier;
 renew(hit(p.target!,damage,attack===p.maxAttack));return true;
}

import {incomingDamage} from './incoming-damage-rules.ts';
export interface CombatantNumbers {attackFire:number;burst:number;jook:number;reduceDamage:number;defense:number;wind:number;fire:number;water:number;soil:number}
export type IncomingEffect={type:'reflect';attack:number}|{type:'frost';duration:number};
/** Optional live port preserves synchronous reflection/level-up writes between damage fields. */
export interface IncomingHitPort {readLife:()=>number;writeLife:(life:number)=>void;effect:(effect:IncomingEffect)=>void}
export interface WorldHit {
 kind:'pet'|'monster'; alive:boolean; attack:number; life:number; maxLife:number;
 defender:CombatantNumbers; from:CombatantNumbers; roleFire:number;
 nonDefense:boolean; bellSkill:number;
}
/** Pure, ordered numeric outcome. random is AS random(count), 0..count-1.
 * Reflection is emitted, not recursively executed: the original can call
 * enemy.byAttack with a null enemy and has no recursion/target safety guard. */
export function worldIncomingHit(x:WorldHit,random:(count:number)=>number,port?:IncomingHitPort){
 const writes:number[]=[],effects:({type:'reflect';attack:number}|{type:'frost';duration:number})[]=[];
 let life=x.life;
 const write=(value:number)=>{writes.push(value);if(!Number.isNaN(value)){if(port){port.writeLife(value);life=port.readLife();}else life=value>x.maxLife?x.maxLife:value<0?0:value;}};
 const effect=(event:IncomingEffect)=>{effects.push(event);port?.effect(event);if(port)life=port.readLife();};
 if(!x.alive||Number.isNaN(x.attack))return {returnedAttack:false as number|false,life,writes,effects,miss:false,critical:false,xpCharges:0};
 // Monster compares against the role even when a pet delivers the attack.
 // Pet uses role fire as its defender, rather than the pet's own fire.
 const defenderFire=x.kind==='pet'?x.roleFire:x.defender.attackFire;
 const attackerFire=x.kind==='pet'?x.from.attackFire:x.roleFire;
 const dodgeRoll=random(100),difference=defenderFire-attackerFire;
 const dodge=difference<0?x.defender.jook:Math.min(95,x.defender.jook+difference);
 const burstRoll=dodgeRoll<dodge?0:random(100);
 const result=incomingDamage({attack:x.attack,defense:x.defender.defense,defenderFire,attackerFire,burst:x.from.burst,jook:x.defender.jook,reduceDamage:x.defender.reduceDamage,fly:false,nonDefense:x.nonDefense,dodgeRoll,burstRoll},x.kind==='monster'?life:undefined);
 if(!result.miss&&result.positive){
  write(life-result.returnedAttack);
  if(x.kind==='pet'&&random(100)<5){
   if(x.bellSkill===1)effect({type:'reflect',attack:result.returnedAttack});
   else if(x.bellSkill===2)effect({type:'frost',duration:3});
  }
 }
 for(const field of ['wind','fire','water','soil'] as const){const value=x.from[field];if(!Number.isNaN(value)&&value>0)write(life-value);}
 if(x.kind==='monster'&&life<=0)write(0);
 return {returnedAttack:result.returnedAttack as number|false,life,writes,effects,miss:result.miss,critical:result.critical,xpCharges:x.kind==='monster'&&!result.miss?1:0};
}
export function petPanelNumbers(pet:{minAttack:number;maxAttack:number;defense:number;allFen:number},bell:{type?:string;grade:number}){
 return {minAttack:pet.minAttack,maxAttack:pet.maxAttack,defense:pet.defense,attackFire:Math.floor(pet.allFen/100)+(bell.type!=='空格'?bell.grade+1:0)};
}
export const MONSTER_DEATH_NUMBERS={experienceRate:3,baseExperience:15,equipmentSpirit:1} as const;

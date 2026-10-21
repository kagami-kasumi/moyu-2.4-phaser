import {incomingDamage} from '../content/incoming-damage-rules.ts';
import type {CombatantNumbers,IncomingHitPort,IncomingEffect} from '../content/pet-world-combat-rules.ts';
export interface DamageReceiver {id:string;life:number;maxLife:number;open:boolean;merged:boolean;bellSkill:number}
/** RoleMC.byAttack selects the first living merged slot, then uses the ROLE's
 * defense and elemental policy while writing all damage to that receiver. */
export function partyIncomingHit(x:{alive:boolean;attack:number;role:CombatantNumbers;from:CombatantNumbers;life:number;maxLife:number;fly:boolean;nonDefense:boolean;slots:readonly DamageReceiver[]},random:(n:number)=>number,port?:IncomingHitPort){
 const receiver=x.slots.find(s=>s.open&&s.life>0&&s.merged),id=receiver?.id??'role';let life=receiver?.life??x.life;
 const maxLife=receiver?.maxLife??x.maxLife,writes:number[]=[],effects:({type:'reflect';attack:number}|{type:'frost';duration:number})[]=[];
 if(!x.alive||Number.isNaN(x.attack))return {id,life,writes,effects,returnedAttack:false as number|false,dead:false};
 const write=(v:number)=>{writes.push(v);if(!Number.isNaN(v)){if(port){port.writeLife(v);life=port.readLife();}else life=Math.max(0,Math.min(maxLife,v));}};
 const effect=(event:IncomingEffect)=>{effects.push(event);port?.effect(event);if(port)life=port.readLife();};
 const diff=x.role.attackFire-x.from.attackFire,dodge=diff<0?x.role.jook:Math.min(95,x.role.jook+diff),dodgeRoll=random(100),burstRoll=dodgeRoll<dodge?0:random(100);
 const result=incomingDamage({attack:x.attack,defense:x.role.defense,defenderFire:x.role.attackFire,attackerFire:x.from.attackFire,burst:x.from.burst,jook:x.role.jook,reduceDamage:x.role.reduceDamage,fly:x.fly,nonDefense:x.nonDefense,dodgeRoll,burstRoll});
 if(!result.miss&&result.positive){write(life-result.returnedAttack);if(random(100)<5){if(receiver?.bellSkill===1)effect({type:'reflect',attack:result.returnedAttack});else if(receiver?.bellSkill===2)effect({type:'frost',duration:3});}}
 for(const k of ['wind','fire','water','soil'] as const)if(!Number.isNaN(x.from[k])&&x.from[k]>0)write(life-x.from[k]);
 return {id,life,writes,effects,returnedAttack:result.returnedAttack as number|false,dead:life<=0};
}

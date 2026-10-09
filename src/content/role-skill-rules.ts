/** Source numbers only: no skill activation, targeting or combat loop is enabled. */
export const ROLE_SKILL_RULES={
 斩魂:{mp:1,requiresPayment:false,range:[150,30],multiplier:1,anger:true},
 旋风斩:{mp:10,requiresPayment:true,range:[150,40],multiplier:1,anger:true},
 刀光斩:{mp:50,requiresPayment:true,range:[320,60],multiplier:1,anger:true},
 飞天连斩:{mp:100,requiresPayment:true,range:[220,40],multiplier:1,anger:true,stopTime:10},
 狂暴:{mp:50,requiresPayment:true,duration:30,burst:5},
 震:{xp:true,multiplier:5,anger:true},
 火球术:{mp:1,requiresPayment:false,range:[400,40],multiplier:1,fly:true},
 电击术:{mp:15,requiresPayment:true,range:[360,30],multiplier:1,fly:true},
 光辉光环:{mp:60,requiresPayment:true,range:[210,70],multiplier:1,fly:true},
 爆雷术:{mp:120,requiresPayment:true,range:[400,40],multiplier:2,fly:true},
 雷霆万钧:{mp:50,requiresPayment:true,duration:30,jook:5},
 怒:{xp:true,multiplier:5,fly:true},
} as const;
export const PASSIVE_SKILL_RULES={重伤:['heavyDamage',1],寒冰:['frost',1],神圣:['skillAttack',2],重击:['heavyHit',2],破防:['nonDefense',2],金刚:['skillDefense',8],强健之术:['skillLife',10,'rateLife'],智慧之术:['skillMp',10,'rateMp'],英勇:['skillAddFire',5]} as const;
export function passiveSkillValue(name:keyof typeof PASSIVE_SKILL_RULES,level:number,rates:{rateLife:number;rateMp:number}){
 const rule=PASSIVE_SKILL_RULES[name];return {field:rule[0],value:level*rule[1]*(rule.length===3?rates[rule[2]]:1)};
}
/** AS random(100) returns integer 0..99; threshold is strict and is not clamped. */
export function roleChance(threshold:number,roll:number){return roll<threshold;}
export function roleAttackRoll(min:number,max:number,offset:number,heavyHit=false){return heavyHit?max:min+offset;}
export function roleSkillDamage(skill:'斩魂'|'旋风斩'|'刀光斩'|'飞天连斩'|'震'|'火球术'|'电击术'|'光辉光环'|'爆雷术'|'怒',attack:number,levels:number,boosted:boolean){
 const multiplier=ROLE_SKILL_RULES[skill].multiplier*(boosted?1.5:1);
 return skill==='斩魂'?Math.round(attack*multiplier+levels*.5):attack*multiplier;
}
export function angerLifeCost(life:number,maxLife:number,anger:boolean){return anger&&life>250?Math.round(maxLife/25):0;}
export function renewalShare(attack:number,alive:boolean,openPanels:readonly boolean[]){return Math.round(attack/(Number(alive)+openPanels.slice(0,3).filter(Boolean).length));}
export type {IncomingNumbers} from './incoming-damage-rules.ts';
import {incomingDamage, type IncomingNumbers} from './incoming-damage-rules.ts';
/** Role policy uses optional flying half-defense; pet/monster select their own
 * fire inputs and life cap in pet-world-combat-rules. */
export function incomingRoleDamage(x:IncomingNumbers){
 const {positive,...result}=incomingDamage(x);return result;
}

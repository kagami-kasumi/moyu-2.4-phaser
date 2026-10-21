import {supportedBell} from './pet-bells.ts';
import type {Item} from './npc-reward.ts';
import type {NpcReward,PetRecord} from './npc-reward.ts';
import {petDetails} from './pet-details.ts';
import {PET_EXPERIENCE_RULES} from '../content/pet-experience-rules.ts';

export const petLife=(p:PetRecord)=>p.life??petDetails(p)?.maxLife??0;
export function grantPetExperience(p:PetRecord,amount:number,roleLevel:number,bell?:Item|null){
 if(!p.battle||petLife(p)<=0||p.levels>=roleLevel+10||!petDetails(p))return false;
 let level=p.levels,exp=p.nowExp??0,max=p.maxExp??Math.floor(level*9),up=false;
 if(![amount,exp,max,roleLevel].every(Number.isFinite)||amount<0||exp<0||max<=0||level<1||!Number.isInteger(level)||!Number.isFinite(exp+amount))return false;
 exp+=Math.round(amount);
 while(exp>=max){if(level<roleLevel+10){level++;exp-=max;}else exp=max-1;up=true;const b=PET_EXPERIENCE_RULES.thresholds.find(b=>level<b.below)!;max='fixed'in b?b.fixed:Math.floor(level*b.multiplier);}
 if(up&&level>=30&&(p.oldLevels??0)>level){level=p.oldLevels!;exp=p.oldNowExp??0;max=p.oldMaxExp??9;}
 if(![level,exp,max].every(Number.isFinite)||max<=0||exp<0)return false;
 const next={...p,levels:level,nowExp:exp,maxExp:max},details=petDetails(next,bell);if(!details)return false;
 Object.assign(p,next);if(up)p.life=details.maxLife;return true;
}

/** Slots own object references. Coordinates and silhouettes are a modern projection. */
export class PetProgression {
 bells:(Item|null)[]=[null,null,null];reserved:number[]=[];slots:(PetRecord|null)[]=[null,null,null];maxBattleNum=2;feedback='';
 constructor(readonly owner:NpcReward,readonly roleLevel:()=>number,saved?:{maxBattleNum:number;slots:(number|null)[];bells?:(Item|null)[];reserved?:number[]}){
  if(saved){this.bells=saved.bells??[null,null,null];this.reserved=saved.reserved??[];this.maxBattleNum=saved.maxBattleNum;this.slots=saved.slots.map(i=>i===null?null:owner.pets[i]??null);}
  else owner.pets.filter(p=>p.battle).slice(0,3).forEach((p,i)=>this.slots[i]=p);
 }
 merge(p:PetRecord){
  if(!this.valid()||!this.owner.pets.includes(p)||!this.slots.includes(p)||!this.details(p)||!Number.isFinite(petLife(p))){this.feedback="合体目标未出征或槽位属性不明确，原数据已保留";return false;}
  p.inOne=petLife(p)<=0?false:!p.inOne;this.feedback=(p.inOne?"合体 ":"分离 ")+p.type;return true;
 }
 death(p:PetRecord){if(!this.valid()||!this.slots.includes(p)||petLife(p)>0)return false;if(p.inOne&&!this.merge(p))return false;return true;}
 get mergeBonus(){const bonus={minAttack:0,maxAttack:0,defense:0};if(!this.valid())return bonus;for(const p of this.slots){if(!p?.inOne)continue;const d=this.details(p);if(d)for(const k of ["minAttack","maxAttack","defense"] as const)bonus[k]+=d[k];}return bonus;}
 valid(){return new Set(this.slots.filter(Boolean)).size===this.slots.filter(Boolean).length&&[2,3].includes(this.maxBattleNum)&&this.slots.filter(Boolean).length<=this.maxBattleNum&&this.owner.pets.every(p=>p.battle===this.slots.includes(p));}
 toggle(p:PetRecord){
  if(!this.owner.pets.includes(p)||!this.valid()){this.feedback='出征记录或槽位不明确，原数据已保留';return false;}
  const index=this.slots.indexOf(p);
  if(index>=0){this.slots[index]=null;p.battle=false;p.inOne=false;this.feedback='召回 '+p.type;return true;}
  if(!petDetails(p)){this.feedback='幻兽属性无效，不能出征';return false;}
  const empty=this.slots.findIndex((v,i)=>!v&&i<this.maxBattleNum);if(empty<0){this.feedback='出征数量已达到上限 '+this.maxBattleNum;return false;}
  if(this.reserved.includes(empty)||this.bells[empty]&&!supportedBell(this.bells[empty]!)){this.feedback='该槽铃铛数据未知，请先处理装备';return false;}p.battle=true;this.slots[empty]=p;this.feedback='出征 '+p.type;return true;
 }
 selectForExperience(p:PetRecord){
  if(!this.owner.pets.includes(p)||!this.valid()||!petDetails(p))return false;
  if(!p.battle){const first=this.slots[0];if(first&&!this.toggle(first))return false;if(!this.toggle(p))return false;}
  return this.slots.includes(p);
 }
 get fire(){return this.slots.reduce((n,p,i)=>n+(p?Math.floor((this.details(p)?.allFen??0)/100)+(this.bells[i]&&supportedBell(this.bells[i]!)?Number(this.bells[i]!.grade)+1:0):0),0);}
 details(p:PetRecord){return petDetails(p,this.bells[this.slots.indexOf(p)]);}
 equip(slot:number,index:number,expected:Item,position={x:0,y:0},contains:(x:number,y:number)=>boolean=()=>true){if(!Number.isInteger(slot)||slot<0||slot>2||this.reserved.includes(slot)||this.owner.bag[index]!==expected||!supportedBell(expected))return false;const pet=this.slots[slot];if(pet){if(!this.details(pet))return false;pet.life=petLife(pet);}const old=this.bells[slot];if(old)this.owner.store(old,position,contains);this.bells[slot]={...expected};this.owner.bag[index]=null;return true;}
 unequip(slot:number,expected:Item,position={x:0,y:0},contains:(x:number,y:number)=>boolean=()=>true){if(this.bells[slot]!==expected||this.reserved.includes(slot))return false;this.owner.store(expected,position,contains);this.bells[slot]=null;const pet=this.slots[slot];if(pet)pet.life=Math.min(petLife(pet),this.details(pet)?.maxLife??petLife(pet));return true;}
 snapshot(){return {bells:this.bells,reserved:this.reserved,maxBattleNum:this.maxBattleNum,slots:this.slots.map(p=>p?this.owner.pets.indexOf(p):null)};}
}

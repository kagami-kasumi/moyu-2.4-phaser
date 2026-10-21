import {PetProgression,grantPetExperience} from './pet-progression.ts';
import type {PetRecord} from './npc-reward.ts';
import {ROLE_EXPERIENCE_RULES} from '../content/role-experience-rules.ts';
import type {Inventory} from './inventory.ts';
import type {Item} from './npc-reward.ts';

/** RoleMC.expUp: the setter rejects excess levels, but the loop still spends XP. */
export function grantExperience(inventory:Inventory,amount:number){
 const v=inventory.vitals;let upgraded=false;
 if(!Number.isFinite(amount)||amount<0||!Number.isFinite(v.maxExp)||v.maxExp<=0)return false;
 v.exp+=amount;
 while(v.exp>=v.maxExp){
  v.exp-=v.maxExp;
  if(v.level<inventory.maxLevel)v.level++;
  upgraded=true;
  const band=ROLE_EXPERIENCE_RULES.thresholds.find(b=>v.level<b.below);
  if(band)v.maxExp='fixed'in band?band.fixed:Math.floor(v.level*band.multiplier);
  // The source keeps subtracting the retained threshold at the cap. Batch that
  // identical operation so a very large imported finite value cannot hang UI.
  if(v.level>=inventory.maxLevel&&v.exp>=v.maxExp)v.exp%=v.maxExp;
 }
 if(upgraded){inventory.refresh();v.life=v.maxLife;v.mp=v.maxMp;}
 return upgraded;
}

export class PlayerExperience {
 open=false;revision=0;feedback='';target?:PetRecord;
 constructor(readonly inventory:Inventory,readonly pets?:PetProgression){}
 choose(p?:PetRecord,revision=this.revision){if(!this.open||revision!==this.revision)return false;this.revision++;if(p&&!this.pets?.selectForExperience(p)){this.feedback=this.pets?.feedback||'请先把幻兽出征';return false;}this.target=p;this.feedback='';return true;}
 private matches(item:Item|null):item is Item{return item?.type==='经验球'&&item.name===undefined;}
 count(){return this.inventory.reward.bag.reduce((n,item)=>n+(this.matches(item)?item.number||1:0),0);}
 show(){this.target=undefined;this.open=true;this.revision++;this.feedback='';}
 close(){this.open=false;this.revision++;}
 confirm(revision:number){
  if(!this.open||revision!==this.revision)return false;
  this.revision++;
  const v=this.inventory.vitals;
  if(this.target){
   const pet=this.target;
   if(!this.pets?.selectForExperience(pet)||this.count()<1||!grantPetExperience(pet,2000,v.level,this.pets.bells[this.pets.slots.indexOf(pet)])){this.feedback='幻兽未出征、死亡、等级已高于人物10级、数据无效或经验球不足';return false;}
   const bag=this.inventory.reward.bag,index=bag.findIndex(item=>this.matches(item)),item=bag[index]!;
   if((item.number??0)>1)item.number!--;else bag[index]=null;
   this.feedback=pet.type+'获得 2000 经验；消耗经验球 ×1';this.inventory.reward.messages.push(this.feedback);return true;
  }
  if(this.count()<1){this.feedback='你的物品栏里没有足够的经验球';return false;}
  if(v.life===0){this.feedback='死亡状态，不能使用经验球';return false;}
  if(v.level>=this.inventory.maxLevel){this.feedback='人物已经达到最高等级了，不能获得经验和使用经验球';return false;}
  if(!Number.isFinite(v.maxExp)||v.maxExp<=0||!Number.isFinite(v.exp+2000)){this.feedback='人物经验数据无效，未消耗经验球';return false;}
  const before=v.level;grantExperience(this.inventory,2000);
  const bag=this.inventory.reward.bag,index=bag.findIndex(item=>this.matches(item));
  const item=bag[index]!;if((item.number??0)>1)item.number=(item.number??0)-1;else bag[index]=null;
  this.feedback=`人物获得 2000 经验${v.level>before?`，等级 ${before} → ${v.level}`:''}；消耗经验球 ×1`;
  this.inventory.reward.messages.push(this.feedback);return true;
 }
}

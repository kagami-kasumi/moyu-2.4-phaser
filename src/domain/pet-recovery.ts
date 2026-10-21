import type {Inventory} from './inventory.ts';
import type {Item,PetRecord} from './npc-reward.ts';
import {petDetails} from './pet-details.ts';
import {PetProgression,petLife} from './pet-progression.ts';

export function healPet(inventory:Inventory,slots:PetProgression,pet:PetRecord,index:number,expected:Item){
 const d=slots.details(pet),item=inventory.reward.bag[index];
 if(!slots.valid()||!slots.slots.includes(pet)||!d||petLife(pet)<=0||item!==expected)return false;
 if(item.type==='药品'&&Number.isFinite(item.hpVal)&&Number(item.hpVal)>0){pet.life=Math.min(d.maxLife,petLife(pet)+Number(item.hpVal));inventory.reward.bag[index]=null;return true;}
 if(item.type==='生命之源'){
  const reserve=inventory.consumables.lifeSourse;if(!Number.isFinite(reserve)||reserve<0)return false;
  const used=Math.min(reserve,Math.max(0,d.maxLife-petLife(pet)));inventory.consumables.lifeSourse-=used;pet.life=Math.min(d.maxLife,petLife(pet)+used);return true;
 }
 return false;
}
export function reviveParty(inventory:Inventory,slots:PetProgression){
 if(!slots.valid()||slots.slots.some(p=>p&&!slots.details(p)))return false;
 const v=inventory.vitals;v.life=v.maxLife;v.mp=v.maxMp;
 for(const pet of slots.slots)if(pet)pet.life=slots.details(pet)!.maxLife;
 return true;
}

import type {NpcReward,PetRecord} from './npc-reward.ts';
import {petDetails} from './pet-details.ts';
/** Stable projection: raw save order and object identity never change on sorting. */
export function orderedPets(pets:readonly PetRecord[]){return pets.map((pet,index)=>({pet,index,score:petDetails(pet)?.allFen??-Infinity})).sort((a,b)=>Number(b.pet.battle)-Number(a.pet.battle)||(a.score===b.score?0:b.score-a.score)||b.pet.levels-a.pet.levels||a.index-b.index).map(v=>v.pet);}
export class PetCollection {
 open=false;revision=0;page=1;selected?:PetRecord;pending?:PetRecord;feedback='';
 constructor(readonly owner:NpcReward){}
 get pages(){return Math.max(1,Math.ceil(this.owner.pets.length/4));}
 visible(){return orderedPets(this.owner.pets).slice((this.page-1)*4,this.page*4);}
 sync(open:boolean){if(open!==this.open){this.open=open;this.pending=undefined;this.revision++;}this.page=Math.min(this.page,this.pages);if(!this.selected||!this.owner.pets.includes(this.selected))this.selected=this.visible()[0];}
 private valid(revision:number){return this.open&&revision===this.revision;}
 choose(pet:PetRecord,revision=this.revision){if(!this.valid(revision)||!this.visible().includes(pet))return false;this.selected=pet;this.pending=undefined;this.feedback='';this.revision++;return true;}
 turn(delta:number,revision=this.revision){if(!this.valid(revision)||![-1,1].includes(delta)||this.page+delta<1||this.page+delta>this.pages)return false;this.page+=delta;this.selected=this.visible()[0];this.pending=undefined;this.feedback='';this.revision++;return true;}
 request(revision=this.revision){if(!this.valid(revision)||!this.selected||!this.owner.pets.includes(this.selected))return false;this.revision++;if(this.selected.battle){this.feedback='该幻兽正在出征，请先召回再释放。';return false;}this.pending=this.selected;return true;}
 cancel(revision=this.revision){if(!this.valid(revision))return false;this.pending=undefined;this.revision++;return true;}
 confirm(revision=this.revision){const pet=this.pending;if(!this.valid(revision)||!pet||pet.battle||!this.owner.pets.includes(pet))return false;this.owner.pets.splice(this.owner.pets.indexOf(pet),1);this.owner.petCollectionEdited=true;this.pending=undefined;this.selected=undefined;this.revision++;this.feedback='已释放 '+pet.type+'，空余容量 '+(40-this.owner.pets.length);this.owner.messages.push(this.feedback);this.sync(true);return true;}
}

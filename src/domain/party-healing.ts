import type {HealingPanel} from './character-consumables.ts';
import {petLife,type PetProgression} from './pet-progression.ts';

/** A body and its huanShou refer to the same saved pet, including while merged. */
export function partyHealingPanels(pets:PetProgression):HealingPanel[]|null {
 if(!pets.valid())return null;
 const panels:HealingPanel[]=[];
 for(const [slot,p] of pets.slots.entries()){
  if(!p)continue;
  const d=pets.details(p),life=petLife(p);
  if(!d||!Number.isFinite(life)||life<0||!Number.isFinite(d.maxLife)||d.maxLife<0)return null;
  const target={get life(){return petLife(p);},set life(value:number){p.life=value;},maxLife:d.maxLife};
  panels.push({label:p.type+"（槽"+(slot+1)+"）",isOpen:true,huanShou:target,body:target});
 }
 return panels;
}

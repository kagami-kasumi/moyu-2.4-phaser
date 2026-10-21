import type {Inventory} from './inventory.ts';
import {petLife,type PetProgression} from './pet-progression.ts';

/** Map.dangerous(false), on entry only. Loading a snapshot does not replay entry. */
export function recoverSafeArea(inventory:Inventory,pets:PetProgression){
 const v=inventory.vitals,c=inventory.consumables;
 const targets=pets.slots.filter(p=>p!==null).map(p=>({pet:p,life:petLife(p),max:pets.details(p)?.maxLife}));
 const lifeReserve=v.maxLife*c.lifeSourseLevels,mpReserve=v.maxMp*c.mpSourseLevels;
 if(!pets.valid()||![v.life,v.mp,v.maxLife,v.maxMp,lifeReserve,mpReserve,...targets.flatMap(t=>[t.life,t.max])].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0))return false;
 if(v.life>0)v.life=v.maxLife;
 for(const t of targets)if(t.life>0)t.pet.life=t.max!;
 v.mp=v.maxMp;c.lifeSourse=lifeReserve;c.mpSourse=mpReserve;
 return true;
}

import {contentOfKind} from './registry.ts';

export interface PetSeed {
 type:string; levels:number; zs:number; maxZs:number; element:number; titleNum:number;
 rateLife:number; rateMinAttack:number; rateMaxAttack:number; rateDefense:number;
}
/** Source useItem branches select an initialization variant, not a new species. */
export const ITEM_PETS:Record<string,PetSeed>={};
for(const pet of contentOfKind('pet')){
 const variants=pet.data.initializations;
 if(!Array.isArray(variants))throw Error('Missing pet initialization records: '+pet.id);
 for(const variant of variants){
  if(!variant||typeof variant!=='object'||Array.isArray(variant)||!('itemTrigger' in variant))continue;
  const trigger=variant.itemTrigger,seed=variant.definition;
  if(typeof trigger!=='string'||!seed||typeof seed!=='object'||Array.isArray(seed)||!('type' in seed))throw Error('Invalid pet item initialization');
  if(ITEM_PETS[trigger])throw Error('Ambiguous pet item: '+trigger);
  const keys=['levels','zs','maxZs','element','titleNum','rateLife','rateMinAttack','rateMaxAttack','rateDefense'];
  // Randomized seeds remain registered; their generator is not an implemented inventory action.
  if(keys.some(k=>k in seed&&typeof (seed as Record<string,unknown>)[k]==='object'))continue;
  if(typeof seed.type!=='string'||keys.some(k=>!(k in seed)||typeof (seed as Record<string,unknown>)[k]!=='number'))throw Error('Nonliteral pet item: '+trigger);
  ITEM_PETS[trigger]=structuredClone(seed) as unknown as PetSeed;
 }
}

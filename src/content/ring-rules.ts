import {contentNamed} from './registry.ts';

/** Source frame9 ringMainValue and upDataWeapon ring branch (5227–5269). */
export const RING_RULES={
 mainPool:['moreAttack','moreDefense','moreLife','moreMp'],
 pairPool:['attack','defense','maxLife','maxMp','otherFire','reduceDamage','burst','jook'],
 mainValue:{moreAttack:[5,10,15,20,25],moreDefense:[15,20,25,30,35],moreLife:[5,10,15,20,25],moreMp:[10,15,20,25,30]},
 starterDivisor:5,
 salePrice:10,
} as const;

/** Numeric seed from the registered source instance; only named selectors are generated. */
export function starterRingSeed():{type:string;[key:string]:string|number}{
 const variants=contentNamed('item','新手戒指')[0]?.data.variants;
 if(!Array.isArray(variants)||variants.length!==1)throw Error('Ambiguous starter ring template');
 const variant=variants[0];
 if(!variant||typeof variant!=='object'||Array.isArray(variant)||!('definition' in variant))throw Error('Missing starter ring definition');
 const definition=variant.definition;
 if(!definition||typeof definition!=='object'||Array.isArray(definition))throw Error('Invalid starter ring definition');
 const result:{type:string;[key:string]:string|number}={type:'戒指'};
 for(const [key,value] of Object.entries(definition)){
  if(/^(mainType[12]|pairType[1-4])$/.test(key))continue;
  if(typeof value!=='string'&&typeof value!=='number')throw Error('Unresolved starter ring field '+key);
  result[key]=value;
 }
 return result;
}

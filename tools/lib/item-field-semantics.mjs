import {functionRange} from './as2-data.mjs';

/** Reviewed ThingMC codec pattern. Reject drift instead of inferring arbitrary getters. */
export function itemFieldSemantics(thingSource,codecSource){
 const codec=functionRange(codecSource,'function getSecreteCode(val)');
 const compact=codec.text.replace(/\s+/g,'');
 if(compact!=='{if(isNaN(val)){return0;}return(val-SecreteCodeMC.BASE)/this.SECRETECODE;}')throw Error('Unreviewed item decoder');
 const result=[];
 for(const match of thingSource.matchAll(/function get (\w+)\(\)/g)){
  const property=match[1],getter=functionRange(thingSource,match[0]);
  const storage=getter.text.match(/^\{\s*return this\.getSecreteCode\(this\.([\p{L}\p{N}_]+)\);\s*\}$/u)?.[1];
  if(!storage)continue;
  const setter=functionRange(thingSource,`function set ${property}(val)`);
  if(!setter.text.includes(`this.${storage} = this.setSecreteCode(val);`))throw Error('Mismatched item codec '+property);
  const invalid=setter.text.match(/if\(isNaN\(val\)\)\s*\{\s*(return;|val = 0;)\s*\}/)?.[1];
  if(!invalid)throw Error('Unreviewed invalid-value branch '+property);
  if(property!=='number'){
   const expected=`{if(isNaN(val)){${invalid==='return;'?'return;':'val=0;'}}this.${storage}=this.setSecreteCode(val);}`;
   if(setter.text.replace(/\s+/g,'')!==expected)throw Error('Unreviewed item setter side effect '+property);
  }
  const declaration=new RegExp('var '+storage+';');
  if(!declaration.test(thingSource))throw Error('Unreviewed storage initialization '+storage);
  result.push({property,type:'number',evidence:'verified',freshInstanceRead:0,
   missingOrNaNWrite:invalid==='return;'?'preserve-previous-value':'write-zero',
   assignment:'numeric coercion through multiplication; serialized reads are numbers',
   source:[{file:'__Packages/ThingMC.as',line:getter.line},{file:'__Packages/ThingMC.as',line:setter.line},{file:'__Packages/SecreteCodeMC.as',line:codec.line}]});
 }
 return result;
}

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {functionRange} from './as2-data.mjs';
export function verifyLiteralPetRegistrations(definitions){
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction.as','utf8');
 const use=vm.runInNewContext('(function(item)'+functionRange(source,'this.useItem =').text+')');
 const verified=[];let literalVariants=0;
 for(const pet of definitions.filter(d=>d.kind==='pet')){
  let complete=true;
  assert.ok(Array.isArray(pet.data.initializations)&&pet.data.initializations.length,'Missing pet templates '+pet.id);
  for(const variant of pet.data.initializations){
   if(Object.values(variant.definition).some(v=>v&&typeof v==='object')){complete=false;continue;}
   assert.equal(typeof variant.itemTrigger,'string','Unmapped pet template '+pet.id);
   let observed,calls=0;
   const item={type:variant.itemTrigger,number:1,hitTest:()=>true,setThing(v){Object.assign(this,v);}};
   use.call({backPack:{},fastKey:{},huanShou:{addHuanShou(seed){calls++;observed=seed;return true;}}},item);
   assert.equal(calls,1,'Pet trigger did not create exactly one seed '+variant.itemTrigger);
   assert.deepEqual(JSON.parse(JSON.stringify(observed)),variant.definition,'Pet template differs '+variant.itemTrigger);
   assert.equal(observed.type,pet.name,'Pet seed species mismatch '+pet.id);literalVariants++;
  }
  if(complete)verified.push(pet.id);
 }
 return {verified,literalVariants};
}

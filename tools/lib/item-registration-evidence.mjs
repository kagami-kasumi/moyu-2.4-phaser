import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {functionRange} from './as2-data.mjs';
/** Literal defaults only; effects, generators and source defects are separate contracts. */
export function verifyLiteralItemRegistrations(definitions){
 const frozen=JSON.parse(fs.readFileSync('docs/reverse-engineering/inventory/source-functions.json','utf8')).functions.createThing;
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction.as','utf8');
 assert.equal(frozen.trim(),functionRange(source,'this.createThing =').text.trim(),'Frozen factory differs from current original source');
 const factory=vm.runInNewContext('(function(tThing,isDrop,fX,fY)'+frozen+')',{Math});
 const verified=[];
 for(const d of definitions.filter(d=>d.kind==='item')){
  if(Object.values(d.data).some(v=>typeof v!=='string'&&typeof v!=='number'))continue;
  assert.ok(d.aliases.length,'No factory aliases '+d.id);
  for(const alias of d.aliases){
   let value,calls=0;const receiver={backPack:{setThing(v){calls++;value=v;}}};
   assert.equal(factory.call(receiver,{type:alias}),true,'Factory rejects alias '+alias);
   assert.equal(calls,1,'Factory output count '+alias);
   assert.deepEqual(d.data,JSON.parse(JSON.stringify(value)),'Literal item differs '+d.id+' / '+alias);
  }
  verified.push(d.id);
 }
 return verified;
}

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {functionRange} from './as2-data.mjs';
const root='local-resources/moyu/source-index/as/scripts/';
const references=[['月光礼包','DefineSprite_4536/frame_30/DoAction.as',13],['月光宝盒','DefineSprite_4536/frame_1/DoAction.as',81],['30点声望','DefineSprite_4312/frame_1/DoAction.as',4849]];
/** Certifies the observed missing factory cases, never invents an item implementation. */
export function verifyMissingFactoryItems(definitions){
 const body=functionRange(fs.readFileSync(root+'frame_9/DoAction.as','utf8'),'this.createThing =').text;
 const factory=vm.runInNewContext('(function(tThing,isDrop,fX,fY)'+body+')',{Math});
 for(const [name,file,line] of references){
  const record=definitions.find(d=>d.id==='item:'+name);assert.ok(record);
  assert.deepEqual(record.source,[{file,line}]);
  assert.deepEqual(record.data,{type:name,definitionStatus:'referenced-without-factory-case',instances:[{type:name}]});
  const source=fs.readFileSync(root+file,'utf8').split(/\r?\n/)[line-1];
  assert.ok(source.includes('createThing({type:"'+name+'"}'),'Missing original factory call '+name);
  assert.ok(!body.includes('case "'+name+'":'),'Factory case now exists '+name);
  let calls=0;
  const receiver={backPack:{setThing(){calls++;}},map:{dropThing(){calls++;}}};
  assert.equal(factory.call(receiver,{type:name}),false,'Factory rejection '+name);
  assert.equal(factory.call(receiver,{type:name},true,10,20),false,'Drop factory rejection '+name);
  assert.equal(calls,0,'Rejected item must not be emitted');
 }
 return references.map(([name])=>'item:'+name);
}

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {functionRange} from './as2-data.mjs';
const names=['高级攻击宝石','高级减伤害宝石','高级经验宝石','高级战斗力宝石','魔之魂'];
export function verifyParameterItems(definitions){
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction.as','utf8');
 const body=functionRange(source,'this.createThing =').text;
 const factory=vm.runInNewContext('(function(tThing,isDrop,fX,fY)'+body+')',{Math});
 for(const name of names){
  const record=definitions.find(d=>d.id==='item:'+name);assert.ok(record,'Missing parameter item '+name);
  assert.deepEqual(record.aliases,[name]);
  for(const val1 of [undefined,null,0,-1,1,15,100000,NaN])for(const val2 of [undefined,null,0,-2,3,NaN])for(const direct of [false,true]){
   const input=direct?{type:name,val1,val2}:{type:'宝石',name,val1,val2};
   let output,count=0;
   assert.equal(factory.call({backPack:{setThing(v){output=v;count++;}}},input),true);
   assert.equal(count,1);
   const scope={_loc4_:direct||val1==null?0:val1,_loc5_:direct||val2==null?0:val2};
   const expected=Object.fromEntries(Object.entries(record.data).map(([key,value])=>{
    if(value&&typeof value==='object'){
     assert.deepEqual(Object.keys(value),['expression']);
     assert.ok(body.includes(value.expression),'Unrecognized parameter expression '+name);
     return [key,vm.runInNewContext('('+value.expression+')',scope)];
    }return [key,value];
   }));
   assert.deepEqual({...output},expected,'Parameter factory output '+name);
  }
 }
 return names.map(n=>'item:'+n);
}

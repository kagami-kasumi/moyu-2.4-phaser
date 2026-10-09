import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
export function verifyRingRegistrations(definitions){
 const root='local-resources/moyu/source-index/as/scripts/';
 const files=['DefineSprite_4312/frame_1/DoAction.as','DefineSprite_4536/frame_2/DoAction.as'];
 const ids=[];
 for(const name of ['新手戒指','结婚戒指']){
  const expected=[];
  for(const file of files){
   const text=fs.readFileSync(root+file,'utf8');
   for(const row of text.matchAll(/\{[^{}]*\}/g))if(row[0].includes('name:"'+name+'"'))expected.push({source:{file,line:text.slice(0,row.index).split('\n').length},text:row[0]});
  }
  const record=definitions.find(d=>d.id==='item:'+name);assert.ok(record);assert.ok(expected.length);
  assert.deepEqual(record.source,expected.map(r=>r.source));assert.equal(record.data.variants.length,expected.length);
  for(const [i,row] of expected.entries()){
   const actual=record.data.variants[i];assert.deepEqual(actual.source,row.source);
   for(const upper of [false,true]){
    const context={random:n=>upper?n-1:0};
    for(const variable of new Set(row.text.match(/_loc\d+_/g)))context[variable]='symbol:'+variable;
    const expectedValue=JSON.parse(JSON.stringify(vm.runInNewContext('('+row.text+')',context)));
    const actualValue=Object.fromEntries(Object.entries(actual.definition).map(([k,v])=>{
     if(v&&typeof v==='object'){
      assert.deepEqual(Object.keys(v),['expression']);assert.ok(row.text.includes(v.expression),'Ring expression differs');
      return [k,vm.runInNewContext('('+v.expression+')',context)];
     }return [k,v];
    }));
    assert.deepEqual(actualValue,expectedValue,'Ring seed differs '+name);
   }
  }
  ids.push(record.id);
 }
 return ids;
}

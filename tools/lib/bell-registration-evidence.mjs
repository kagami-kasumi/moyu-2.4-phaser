import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const file='DefineSprite_4536/frame_1/DoAction.as';
const names=['庇护铃铛','凤翼铃铛','翡翠铃铛'];
export function verifyBellRegistrations(definitions){
 const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
 for(const name of names){
  const record=definitions.find(d=>d.id==='item:'+name);assert.ok(record);
  const rows=[...text.matchAll(/\{[^{}]*\}/g)].filter(m=>m[0].includes('name:"'+name+'"'));
  assert.equal(rows.length,3,'Bell source variant count');
  assert.equal(record.data.variants.length,rows.length);
  assert.deepEqual(record.source,rows.map(m=>({file,line:text.slice(0,m.index).split('\n').length})));
  for(const [index,row] of rows.entries()){
   const variant=record.data.variants[index];assert.deepEqual(variant.source,record.source[index]);
   // Exhaust every outcome of the only source random draw, not merely its endpoints.
   for(let draw=0;draw<10;draw++){
    let calls=0;const context={random:n=>{assert.equal(n,10);calls++;return draw;}};
    const expected=JSON.parse(JSON.stringify(vm.runInNewContext('('+row[0]+')',context)));
    assert.equal(calls,1);
    const actual=Object.fromEntries(Object.entries(variant.definition).map(([k,v])=>{
     if(v&&typeof v==='object'){
      assert.deepEqual(Object.keys(v),['expression']);assert.ok(row[0].includes(v.expression));
      return [k,vm.runInNewContext('('+v.expression+')',context)];
     }return [k,v];
    }));
    assert.deepEqual(actual,expected,'Bell seed differs '+name+' at '+variant.source.line);
   }
  }
 }
 return names.map(name=>'item:'+name);
}

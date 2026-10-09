import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const file='DefineSprite_4312/frame_1/DoAction.as';
export function verifyLuckyCharms(definitions){
 const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
 const rows=[...text.matchAll(/\{[^{}]*\}/g)].filter(m=>m[0].includes('"永恒幸运符"')&&m[0].includes('"真理幸运符"'));
 assert.equal(rows.length,4);
 const ids=['item:永恒幸运符','item:真理幸运符'];
 for(const id of ids){
  const record=definitions.find(d=>d.id===id);assert.ok(record);assert.equal(record.data.variants.length,4);
  assert.deepEqual(record.source,rows.map(m=>({file,line:text.slice(0,m.index).split('\n').length})));
  for(const [i,row] of rows.entries()){
   const variant=record.data.variants[i];assert.deepEqual(variant.source,record.source[i]);
   for(const sex of ['女','男',undefined])for(const first of [true,false]){
    const context={myID:{sex,name:'dialog-person'},_parent:{_parent:{friend:{lover:{sex,name:'saved-lover'},isFirstLove:first}}}};
    const expected=JSON.parse(JSON.stringify(vm.runInNewContext('('+row[0]+')',context)));
    const actual=Object.fromEntries(Object.entries(variant.definition).map(([k,v])=>{
     if(v&&typeof v==='object'){
      assert.deepEqual(Object.keys(v),['expression']);assert.ok(row[0].includes(v.expression));
      return [k,vm.runInNewContext('('+v.expression+')',context)];
     }return [k,v];
    }));
    assert.deepEqual(actual,expected,'Charm seed differs '+id);
    assert.equal(expected.name,sex==='女'?'永恒幸运符':'真理幸运符');
   }
  }
 }
 return ids;
}

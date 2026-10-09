import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root='local-resources/moyu/source-index/as/scripts';
const names=['魔石','资源','军功','功勋','声望','接荣誉任务','出征3个幻兽'];
/** Independent flat reward declarations, including the one friend-level expression. */
export function verifyRewardRegistrations(definitions){
 const expected=new Map(names.map(n=>[n,[]]));
 function visit(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
   const absolute=path.join(directory,entry.name);
   if(entry.isDirectory()){visit(absolute);continue;}
   if(!entry.name.endsWith('.as'))continue;
   const text=fs.readFileSync(absolute,'utf8'),file=path.relative(root,absolute).replaceAll('\\','/');
   for(const match of text.matchAll(/\{[^{}]*\}/g)){
    const name=match[0].match(/\btype\s*:\s*"([^"]+)"/)?.[1];if(!expected.has(name))continue;
    const source={file,line:text.slice(0,match.index).split('\n').length};
    expected.get(name).push({source,text:match[0]});
   }
  }
 }
 visit(root);
 const actual=definitions.filter(d=>d.kind==='reward');assert.equal(actual.length,names.length);
 const key=r=>JSON.stringify(r.source);
 for(const [name,rows] of expected){
  const record=actual.find(d=>d.id==='reward:'+name);assert.ok(record,'Missing reward '+name);
  assert.equal(record.name,name);assert.equal(record.data.discriminator,name);assert.deepEqual(record.aliases,[name]);
  assert.deepEqual(record.source.map(JSON.stringify).sort(),rows.map(key).sort());
  assert.equal(record.data.records.length,rows.length,'Reward declaration count '+name);
  for(const row of rows){
   const candidate=record.data.records.find(r=>key(r)===key(row));assert.ok(candidate,'Missing reward declaration '+key(row));
   for(const level of [0,7,49]){
    const context={_loc6_:level};
    const resolve=v=>{
     if(v&&typeof v==='object'){
      assert.deepEqual(Object.keys(v),['expression']);assert.ok(row.text.includes(v.expression),'Reward expression changed');
      return vm.runInNewContext('('+v.expression+')',context,{timeout:1000});
     }return v;
    };
    const sourceValue=JSON.parse(JSON.stringify(vm.runInNewContext('('+row.text+')',context,{timeout:1000})));
    assert.deepEqual(Object.fromEntries(Object.entries(candidate.definition).map(([k,v])=>[k,resolve(v)])),sourceValue,'Reward value '+name);
   }
  }
 }
 return names.map(n=>'reward:'+n);
}

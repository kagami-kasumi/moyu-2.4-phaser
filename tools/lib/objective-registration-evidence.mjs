import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root='local-resources/moyu/source-index/as/scripts';
export function verifyObjectiveRegistrations(definitions){
 const expected=new Map();
 function visit(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
   const absolute=path.join(directory,entry.name);
   if(entry.isDirectory()){visit(absolute);continue;}
   if(!entry.name.endsWith('.as'))continue;
   const text=fs.readFileSync(absolute,'utf8'),file=path.relative(root,absolute).replaceAll('\\','/');
   let found=0;
   for(const match of text.matchAll(/\{[^{}]*\bneedNumber\s*:[^{}]*\}/g)){
    found++;
    // Dynamic names belong to quest generator contracts, not literal objective identities.
    if(!/\bname\s*:\s*"/.test(match[0]))continue;
    const data=JSON.parse(JSON.stringify(vm.runInNewContext('('+match[0]+')',{}, {timeout:1000})));
    assert.equal(typeof data.name,'string');assert.equal(typeof data.needNumber,'number');
    const row={source:{file,line:text.slice(0,match.index).split('\n').length},definition:data};
    if(!expected.has(data.name))expected.set(data.name,[]);
    expected.get(data.name).push(row);
   }
   assert.equal(found,[...text.matchAll(/\bneedNumber\s*:/g)].length,'Unreviewed objective shape '+file);
  }
 }
 visit(root);
 const actual=definitions.filter(d=>d.kind==='objective');assert.equal(actual.length,expected.size,'Objective identity count');
 const canonical=rows=>rows.map(r=>JSON.stringify(r)).sort();
 for(const [name,rows] of expected){
  const record=actual.find(d=>d.id==='objective:'+name);assert.ok(record,'Missing objective '+name);
  assert.equal(record.name,name);assert.deepEqual(record.aliases,[name]);
  assert.deepEqual(canonical(record.data.requirements),canonical(rows),'Objective declarations '+name);
  assert.deepEqual(canonical(record.source),canonical(rows.map(r=>r.source)),'Objective anchors '+name);
 }
 return [...expected.keys()].map(name=>'objective:'+name);
}

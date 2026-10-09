import assert from 'node:assert/strict';
/** Independent lexical scan for this source's flat SharedObject key syntax. */
export function checkPersistenceCoverage(text,fields){
 const saveStart=text.indexOf('saveGame = function('),readStart=text.indexOf('readGame = function('),readEnd=text.indexOf('this.upToParade = function()',readStart);
 assert.ok(saveStart>=0&&readStart>saveStart&&readEnd>readStart,'Save/load source boundaries changed');
 const canonical=key=>typeof key==='string'?'literal:'+key:'template:'+key.expression.replace(/\s+/g,'');
 const scan=(start,end)=>{
  const rows=[],block=text.slice(start,end);
  const pattern=/\bmoyu_so\s*\.\s*data\s*(?:\.\s*([\p{L}\p{N}_]+)|\[([^\]]+)\])/gu;
  for(const match of block.matchAll(pattern)){
   const key=match[1]??{expression:match[2]};
   const access=/^\s*=(?!=)/.test(block.slice(match.index+match[0].length))?'write':'read';
   rows.push({key:canonical(key),line:text.slice(0,start+match.index).split('\n').length,access});
  }
  return rows;
 };
 const save=scan(saveStart,readStart),load=scan(readStart,readEnd);
 assert.equal(new Set(fields.map(f=>canonical(f.key))).size,fields.length,'Duplicate dictionary key');
 assert.deepEqual([...new Set(save.map(r=>r.key))].sort(),fields.map(f=>canonical(f.key)).sort(),'Save key set differs from dictionary');
 for(const [kind,accesses] of [['save',save.filter(r=>r.access==='write')],['saveReads',save.filter(r=>r.access==='read')],['load',load]]){
  const actual=accesses.map(({key,line})=>({key,line}));
  const expected=fields.flatMap(f=>(f[kind]??[]).map(a=>({key:canonical(f.key),line:a.source.line})));
  const order=(a,b)=>a.line-b.line||a.key.localeCompare(b.key);
  assert.deepEqual(actual.sort(order),expected.sort(order),kind+' access positions differ');
 }
 return {templates:fields.length,saveAccesses:save.length,loadAccesses:load.length};
}

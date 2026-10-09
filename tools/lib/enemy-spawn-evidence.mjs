import fs from 'node:fs';
import assert from 'node:assert/strict';
import {tokens,matching,value,controlScopes} from './as2-data.mjs';
const cache=new Map();
export function enemySpawnEvidence(row){
 const file=row.source.file;
 if(!cache.has(file)){
  const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
  cache.set(file,{text,ts:tokens(text),scopes:controlScopes(text)});
 }
 const {text,ts,scopes}=cache.get(file);
 const calls=ts.flatMap((t,i)=>t.kind==='identifier'&&t.value==='initMonster'&&t.line===row.source.line&&ts[i+1]?.value==='('? [i]:[]);
 assert.equal(calls.length,1,'Ambiguous spawn line '+file+':'+row.source.line);
 const i=calls[0],end=matching(ts,i+1),args=[];let begin=i+2;
 for(let p=begin;p<end;p++){
  if(['(','[','{'].includes(ts[p].value)&&ts[p].kind==='punctuation'){p=matching(ts,p);continue;}
  if(ts[p].value===','&&ts[p].kind==='punctuation'){args.push(value(text,ts,begin,p));begin=p+1;}
 }
 args.push(value(text,ts,begin,end));assert.equal(args.length,3,'Unexpected initMonster arguments');
 assert.deepEqual(args[2],row.data,'Spawn object/source mismatch');
 return {beginNum:args[0],endNum:args[1],range:'inclusive; initMonster additionally stops at slot 7',conditions:scopes.filter(s=>s.start<ts[i].start&&s.end>ts[i].end).map(s=>({header:s.header,source:{file,line:s.line}})),source:row.source,initializer:{file:'DefineSprite_4536/frame_1/DoAction.as',line:491},scope:'call-site arguments and syntactic guards; runtime reachability and dynamic inputs not yet evaluated'};
}

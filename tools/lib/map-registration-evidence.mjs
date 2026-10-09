import fs from 'node:fs';
import assert from 'node:assert/strict';
import {source,timeline} from './first-slice.mjs';
/** Verifies static map fields, not access conditions or playable implementation. */
export function verifyMapRegistrations(maps){
 const labels=timeline(source(),4536).flatMap((frame,i)=>frame.label?[{name:frame.label,frame:i+1}]:[]);
 assert.equal(maps.length,labels.length,'Map cardinality differs from SWF labels');
 const seen=new Set();
 for(const map of maps){
  assert.ok(!seen.has(map.name),'Duplicate map name '+map.name);seen.add(map.name);
  assert.ok(labels.some(l=>l.name===map.name&&l.frame===map.frame),'Wrong map label/frame '+map.name);
  assert.equal(map.source.file,`DefineSprite_4536/frame_${map.frame}/DoAction.as`);
  const lines=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+map.source.file,'utf8').split(/\r?\n/);
  assert.ok(lines[map.source.line-1]?.includes(`allowJumpMap("${map.name}")`),'Wrong map source anchor '+map.name);
  const destinations=[],npcs=[];
  for(const line of lines){
   const assignment=line.trim().match(/^(?:this\.)?(entry\d+)\.toMap\s*=\s*"([^"]+)";$/);
   if(assignment)destinations.push({entry:assignment[1],map:assignment[2]});
   for(const call of line.matchAll(/\bgetNpc\("([^"]+)"\)/g))npcs.push(call[1]);
  }
  assert.deepEqual(map.destinations,destinations,'Static exit assignments differ '+map.name);
  assert.deepEqual(map.npcs,npcs,'Static NPC references differ '+map.name);
 }
 return {verified:['identity','original SWF label/frame','literal exit assignments','literal NPC references'],notClaimed:['access conditions','dynamic destinations','map gameplay','NPC behavior']};
}

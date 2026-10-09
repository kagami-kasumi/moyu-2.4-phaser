import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verifyMapRegistrations} from './lib/map-registration-evidence.mjs';
const {maps}=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/source-survey.json','utf8'));
test('map evidence checks field contents and source anchors, not only cardinality',()=>{
 assert.equal(maps.length,165);assert.ok(verifyMapRegistrations(maps).notClaimed.includes('access conditions'));
 const wrongFrame=structuredClone(maps);wrongFrame[0].frame++;
 assert.throws(()=>verifyMapRegistrations(wrongFrame),/Wrong map label\/frame/);
 const wrongExit=structuredClone(maps),withExit=wrongExit.find(m=>m.destinations.length);
 withExit.destinations[0].map='incorrect destination';assert.throws(()=>verifyMapRegistrations(wrongExit),/Static exit assignments differ/);
 const wrongNpc=structuredClone(maps),withNpc=wrongNpc.find(m=>m.npcs.length);
 withNpc.npcs[0]='incorrect NPC';assert.throws(()=>verifyMapRegistrations(wrongNpc),/Static NPC references differ/);
});

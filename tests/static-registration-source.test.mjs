import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyStaticDeclarations} from '../tools/lib/static-registration-evidence.mjs';
test('252 static records match independently executed source table declarations',()=>{
 assert.equal(verifyStaticDeclarations(registryData.definitions).length,252);
 const wrong=structuredClone(registryData.definitions);wrong.find(d=>d.kind==='npc').data.cmd=-999;
 assert.throws(()=>verifyStaticDeclarations(wrong),/Static data differs/);
 const missing=registryData.definitions.filter(d=>d.id!=='building:住房');assert.throws(()=>verifyStaticDeclarations(missing),/Static table count/);
});
test('same-title profession quests retain distinct identity and reward arrays',()=>{
 const warrior=registryData.definitions.find(d=>d.id==='quest:mainTask:0'),mage=registryData.definitions.find(d=>d.id==='quest:mainTask:1');
 assert.equal(warrior.name,mage.name);assert.notDeepEqual(warrior.data.prize,mage.data.prize);
 const wrong=structuredClone(registryData.definitions);wrong.find(d=>d.id===mage.id).data.prize=structuredClone(warrior.data.prize);
 assert.throws(()=>verifyStaticDeclarations(wrong),/Static data differs quest:mainTask:1/);
});

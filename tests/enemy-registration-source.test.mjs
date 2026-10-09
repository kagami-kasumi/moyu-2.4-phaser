import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyEnemyRegistrations} from '../tools/lib/enemy-registration-evidence.mjs';
test('227 enemy call declarations retain constants, expressions and slot ranges',()=>{
 assert.equal(verifyEnemyRegistrations(registryData.definitions).length,227);
 const wrong=structuredClone(registryData.definitions);wrong.find(d=>d.kind==='enemy').data.speedX=999;
 assert.throws(()=>verifyEnemyRegistrations(wrong),/Enemy declaration differs/);
});

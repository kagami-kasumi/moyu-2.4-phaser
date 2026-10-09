import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {enemySpawnEvidence} from './lib/enemy-spawn-evidence.mjs';
const {enemies}=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/source-survey.json','utf8'));
test('every enemy definition retains spawn range and enclosing conditions',()=>{
 const results=enemies.map(enemySpawnEvidence);assert.equal(results.length,227);
 const first=results[0];assert.equal(first.beginNum,1);assert.equal(first.endNum,1);
 assert.ok(first.conditions.some(c=>c.header==='case "龙怪头目":'));
 assert.ok(results.some(r=>typeof r.beginNum==='number'&&typeof r.endNum==='number'&&r.endNum>r.beginNum));
 const changed=structuredClone(enemies[0]);changed.data.speedX=999;
 assert.throws(()=>enemySpawnEvidence(changed),/Spawn object\/source mismatch/);
});

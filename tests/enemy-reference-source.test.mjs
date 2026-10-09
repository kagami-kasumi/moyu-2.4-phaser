import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registryData} from '../src/content/registry-data.ts';
import {enemyDeclarationTarget} from '../tools/lib/enemy-reference-evidence.mjs';
test('all enemy declarations resolve uniquely across maps and same-map spawn branches',()=>{
 const survey=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/source-survey.json','utf8'));
 assert.equal(survey.enemies.length,227);
 const ids=survey.enemies.flatMap(c=>enemyDeclarationTarget(registryData.definitions,c));assert.equal(new Set(ids).size,227);
 const repeated=survey.enemies.filter(c=>c.data.myName==='龙怪头目');assert.ok(repeated.length>1);
 assert.equal(new Set(repeated.flatMap(c=>enemyDeclarationTarget(registryData.definitions,c))).size,repeated.length);
 const wrong=structuredClone(repeated[0]);wrong.source.line=1;
 assert.throws(()=>enemyDeclarationTarget(registryData.definitions,wrong),/resolve uniquely/);
});

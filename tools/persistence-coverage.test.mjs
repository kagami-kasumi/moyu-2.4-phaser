import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {checkPersistenceCoverage} from './lib/persistence-coverage.mjs';
const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction_2.as','utf8');
const {fields}=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/persistence-survey.json','utf8'));
test('independent save/load scan matches every stored key template and access location',()=>{
 const result=checkPersistenceCoverage(text,fields);assert.equal(result.templates,653);assert.ok(result.loadAccesses>647);
 assert.throws(()=>checkPersistenceCoverage(text,fields.slice(1)),/Save key set differs/);
 const wrong=structuredClone(fields);wrong.find(f=>f.load.length).load[0].source.line++;
 assert.throws(()=>checkPersistenceCoverage(text,wrong),/load access positions differ/);
});

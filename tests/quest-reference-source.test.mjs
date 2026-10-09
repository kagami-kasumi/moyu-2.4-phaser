import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registryData} from '../src/content/registry-data.ts';
import {questDeclarationTarget} from '../tools/lib/quest-reference-evidence.mjs';
test('all quest declaration references resolve to their own source branch despite duplicate titles',()=>{
 const census=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/object-census.json','utf8'));
 const quests=census.objects.filter(d=>d.data.need&&d.data.prize);
 assert.equal(quests.length,80);
 const ids=quests.flatMap(c=>questDeclarationTarget(registryData.definitions,c));assert.equal(new Set(ids).size,80);
 const duplicate=quests.filter(c=>c.data.name==='新手训练一');assert.equal(duplicate.length,2);
 assert.notDeepEqual(questDeclarationTarget(registryData.definitions,duplicate[0]),questDeclarationTarget(registryData.definitions,duplicate[1]));
 const changed=structuredClone(duplicate[0]);changed.source.line=1;
 assert.throws(()=>questDeclarationTarget(registryData.definitions,changed),/resolve uniquely/);
});

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {PET_COMBAT_DATA} from '../src/content/pet-combat-data.ts';import {PET_SPECIES} from '../src/content/pet-species-data.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/HuanShouClass.as','utf8'),initialize=vm.runInNewContext('(function()'+functionRange(source,'function initialize()').text+')');
test('every supported species movement and attack ranges match full independent initialize',()=>{
 assert.deepEqual(Object.keys(PET_COMBAT_DATA).sort(),Object.keys(PET_SPECIES).sort());
 for(const [type,expected]of Object.entries(PET_COMBAT_DATA)){
  const p={type,nowLifeLv:0,nextLvMain:1.5,nextLvRate:1.3};initialize.call(p);
  assert.deepEqual(Object.fromEntries(Object.keys(expected).map(k=>[k,p[k]])),expected);
  for(const k of ['burst','jook','reduceDamage','wind','fire','water','soil'])assert.equal(p[k],0);
 }
 assert.match(source,/var attackStopTime = 8;/);
});

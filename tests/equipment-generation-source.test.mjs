import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {generateEquipmentNumbers} from '../src/content/equipment-generation-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_4536/frame_1/DoAction.as','utf8');
test('all five equipment generators match source outputs and random-call ordering at endpoints and thresholds',()=>{
 for(const [family,name]of Object.entries({normal:'dropNormalItem',boss:'dropBossItem',superBoss:'dropSuperBossItem',reiBoss:'dropReiBossItem',reiSuperBoss:'dropReiSuperBossItem'}))for(const level of [0,14,15,29,30,49,50,89,90,91,150])for(const seed of [0,1,9,10,49,50,99,100,199,200,249,250,698,699,700,999,1999,2000,4999,9999]){
  const traceA=[],traceB=[];const rand=trace=>n=>{trace.push(n);return seed%n};let expected;
  const original=vm.runInNewContext('(function(fX,fY,level)'+functionRange(source,`this.${name} =`).text+')',{random:rand(traceA)});
  original.call({role:{vocational:'法师'},goods:{throwGoods(x,y,item){expected=JSON.parse(JSON.stringify(item))}},_parent:{createThing(){}}},1,2,level);
  const actual=generateEquipmentNumbers(family,level,'法师',rand(traceB));assert.deepEqual(actual,expected,`${family}/${level}/${seed}`);assert.deepEqual(traceB,traceA);
 }
});

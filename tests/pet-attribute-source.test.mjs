import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {PET_ATTRIBUTE_RULES as rules} from '../src/content/pet-attribute-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
const compile=name=>vm.runInNewContext('(function()'+functionRange(source,'function '+name+'()').text+')',{Math});
test('empty or undefined bell types do not add bonuses; unknown element resets stale bonuses',()=>{
 for(const type of [undefined,'空格']){
  const pet={element:999,battle:true,item:{bell:{type,grade:2,attributeType1:3,attributeVal1:100}},moreLife:999,moreMinAttack:999,moreMaxAttack:999,moreDefense:999};
  compile('moreAttribute').call(pet);assert.deepEqual(rules.bonusOrder.map(k=>pet[k]),[0,0,0,0]);
 }
});
test('element bonuses and bell slots combine only while deployed, with grade controlling active slots',()=>{
 for(let element=0;element<6;element++)for(const grade of [-1,0,1,2,3])for(const battle of [false,true]){
  const pet={element,battle,item:{bell:{type:'庇护铃铛',grade,attributeType1:1,attributeVal1:5,attributeType2:2,attributeVal2:7,attributeType3:3,attributeVal3:9}},moreLife:999};
  compile('moreAttribute').call(pet);const expected=[...rules.elementBonuses[element]];
  if(battle&&grade>=0)expected[3]+=5;
  if(battle&&grade>=1){expected[1]+=7;expected[2]+=7;}
  if(battle&&grade>=2)expected[0]+=9;
  assert.deepEqual(rules.bonusOrder.map(k=>pet[k]),expected);
 }
});
test('attribute refresh recalculates bonuses before multiplying growth by level plus five',()=>{
 const pet={levels:7,element:5,battle:false,rateLife:1.25,rateMinAttack:2.5,rateMaxAttack:3.75,rateDefense:4.125,moreAttribute:compile('moreAttribute'),moreLife:999};
 compile('flashAttribute').call(pet);
 assert.deepEqual([pet.maxLife,pet.minAttack,pet.maxAttack,pet.defense],[23,45,68,74]);
});

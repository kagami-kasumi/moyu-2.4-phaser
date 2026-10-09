import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {PET_SCORE_RULES as rules} from '../src/content/pet-score-rules.ts';
const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
const fn=vm.runInNewContext('(function()'+functionRange(text,'function checkUp()').text+')');
test('total score and level writes update sorting mirrors before encoding, but NaN changes neither',()=>{
 for(const [field,mirror] of [['allFen','sortFen'],['levels','sortLevels']]){
  const events=[],pet={getSecreteCode:v=>v,setSecreteCode(v){events.push([this[mirror],v]);return v;}};
  const context={isNaN};
  Object.defineProperty(pet,field,{get:vm.runInNewContext('(function()'+functionRange(text,`function get ${field}()`).text+')',context),set:vm.runInNewContext('(function(val)'+functionRange(text,`function set ${field}(val)`).text+')',context)});
  pet[field]=12.5;assert.equal(pet[mirror],12.5);assert.equal(pet[field],12.5);assert.deepEqual(events,[[12.5,12.5]]);
  pet[field]=NaN;assert.equal(pet[mirror],12.5);assert.equal(pet[field],12.5);assert.equal(events.length,1);
 }
});
test('score accessors retain prior values on NaN and preserve negative fractional writes',()=>{
 for(const field of ['mainFen','lifeFen','minAttackFen','maxAttackFen','defenseFen','rareFen','zsFen','elementFen','titleFen']){
  const context={isNaN},pet={setSecreteCode:v=>v,getSecreteCode:v=>v};
  const get=vm.runInNewContext('(function()'+functionRange(text,`function get ${field}()`).text+')',context);
  const set=vm.runInNewContext('(function(val)'+functionRange(text,`function set ${field}(val)`).text+')',context);
  Object.defineProperty(pet,field,{get,set});pet[field]=3;pet[field]=NaN;assert.equal(pet[field],3);
  pet[field]=-1.25;assert.equal(pet[field],-1.25);
 }
});
function seed(){const pet={zs:7,rareFen:200,flashAttribute(){}};for(const axis of ['Life','MinAttack','MaxAttack','Defense']){pet['max'+axis+'Fen']=1000;pet['maxRate'+axis]=10;pet['rate'+axis]=7.5;}return pet;}
test('pet score composes growth, rarity, turns, all elements and title values',()=>{
 for(let element=0;element<6;element++)for(const titleNum of [0,1,2,3,4,5,99]){
  const pet={...seed(),element,titleNum};const total=fn.call(pet),title=rules.titles[titleNum];
  assert.equal(pet.mainFen,2000);assert.equal(pet.zsFen,70);assert.equal(pet.elementFen,rules.elements[element].score);
  assert.equal(pet.titleFen,title?.score??0);assert.equal(pet.titleName,title?.name??'无');
  assert.equal(total,2270+rules.elements[element].score+(title?.score??0));
 }
});
test('unknown element retains prior score while unknown title clears it',()=>{
 const pet={...seed(),element:99,titleNum:99,elementFen:123,elementName:'retained',titleFen:999};fn.call(pet);
 assert.equal(pet.elementFen,123);assert.equal(pet.elementName,'retained');assert.equal(pet.titleFen,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {PET_NUMERIC_ACCESSOR_RULES as rules} from '../src/content/pet-numeric-accessor-rules.ts';
const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
test('all growth and progress accessors delegate accepted values and retain state on NaN',()=>{
 for(const field of rules.fields){
  const calls=[],pet={setSecreteCode:v=>{calls.push(v);return {encoded:v};},getSecreteCode:v=>v?.encoded};
  Object.defineProperty(pet,field,{get:vm.runInNewContext('(function()'+functionRange(text,`function get ${field}()`).text+')',{isNaN}),set:vm.runInNewContext('(function(val)'+functionRange(text,`function set ${field}(val)`).text+')',{isNaN})});
  for(const value of [0,-1.25,2.5,100000]){pet[field]=value;assert.equal(pet[field],value);}
  pet[field]=NaN;pet[field]=undefined;assert.equal(pet[field],100000);assert.deepEqual(calls,[0,-1.25,2.5,100000]);
 }
});

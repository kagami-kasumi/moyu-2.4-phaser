import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {RESOURCE_CONSUMPTION_RULES as rules} from '../src/content/resource-consumption-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
const compile=name=>vm.runInNewContext('(function(val)'+functionRange(source,'function '+name+'(val)').text+')',{isNaN,_global:{sysMsg:{addMsg(){}}}});
test('resource consumers preserve insufficient, exact, zero, negative and invalid input behavior',()=>{
 for(const rule of rules.methods){
  const fn=compile(rule.name);
  for(const [val,result,balance] of [[11,false,10],[10,true,0],[0,true,10],[-2,true,12],[2.5,true,7.5],[NaN,rule.invalidReturn==='false'?false:undefined,10]]){
   const role={[rule.field]:10};assert.equal(fn.call(role,val),result);assert.equal(role[rule.field],balance);
  }
 }
});
test('creditUp defaults absent input to one, preserves fractions and skips NaN',()=>{
 const fn=compile('creditUp'),role={xxx_credit:10};
 assert.equal(fn.call(role),undefined);assert.equal(role.xxx_credit,11);
 fn.call(role,2.5);assert.equal(role.xxx_credit,13.5);
 fn.call(role,-3);assert.equal(role.xxx_credit,10.5);
 fn.call(role,NaN);assert.equal(role.xxx_credit,10.5);
});

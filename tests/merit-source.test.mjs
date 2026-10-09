import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {MERIT_RULES as rules} from '../src/content/merit-rules.ts';
const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
for(const rule of [rules.military,rules.nobility])test(rule.function+' uses cumulative thresholds, rounding, monotonic rank and pre-award cap',()=>{
 const fn=vm.runInNewContext('(function(val)'+functionRange(text,'function '+rule.function+'(val)').text+')',{Math,_global:{sysMsg:{addMsg(){}}}});
 for(const [index,threshold] of rule.thresholds.entries())for(const delta of [-1,0,1]){
  const role={[rule.balance]:0,[rule.rank]:0};fn.call(role,threshold+delta);
  const rank=rule.thresholds.filter(t=>t<=threshold+delta).length;
  assert.equal(role[rule.writeRank]??0,rank);assert.equal(role[rule.balance],Math.min(threshold+delta,rule.cap));
 }
 const rounded={[rule.balance]:999,[rule.rank]:0};assert.equal(fn.call(rounded,.5),true);assert.equal(rounded[rule.writeRank],1);
 const high={[rule.balance]:1000,[rule.rank]:rule.thresholds.length};fn.call(high,-1000);assert.equal(high[rule.balance],0);assert.equal(high[rule.writeRank],undefined);
 const capped={[rule.balance]:rule.cap,[rule.rank]:rule.thresholds.length};assert.equal(fn.call(capped,-1),false);assert.equal(capped[rule.balance],rule.cap);
});

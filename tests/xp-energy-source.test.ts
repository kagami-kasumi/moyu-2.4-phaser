import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {XP_ENERGY_RULES as rules} from '../src/content/xp-energy-rules.ts';

const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source.file,'utf8');
function original(){
  const context: Record<string, any> = {};
  for(let i=1;i<=rules.cells.count;i++)context['能量格'+i]={};
  vm.createContext(context);vm.runInContext(source,context,{timeout:1000});
  return context;
}
test('XP catalog constants and charging cycle match independently executed original module',()=>{
  assert.equal(createHash('sha256').update(source).digest('hex'),rules.source.sha256);
  const x=original();
  for(const [key,value] of Object.entries(rules.initial))assert.equal(x[key],value,key);
  for(let i=1;i<=6;i++)assert.equal(x['能量格'+i]._visible,false);
  x.addExp();assert.equal(x.nowExp,0);
  x.isUsed=true;
  for(let n=0;n<53;n++)x.addExp();
  assert.equal(x.nowPower,2);assert.equal(x.nowExp,17);assert.equal(x.isFull,false);
  x.addExp();assert.equal(x.nowPower,3);assert.equal(x.nowExp,0);assert.equal(x.isFull,true);
  x.addExp();assert.equal(x.nowExp,0);
  assert.equal(x.usePower(),true);assert.equal(x.nowPower,2);assert.equal(x.isFull,false);assert.equal(x['能量格3']._visible,false);
});
test('XP direct-call overflow and consume preserve source ordering, not inferred clamps',()=>{
  const x=original();x.nowPower=3;x.isFull=true;
  assert.equal(x.powerUp(),false);assert.equal(x.nowPower,4);assert.equal(x.isFull,true);assert.equal(x['能量格4']._visible,false);
  x.nowPower=0;x.nowExp=7;
  assert.equal(x.usePower(),false);assert.equal(x.nowExp,7);assert.equal(x.isFull,true);
  x.nowPower=1;
  assert.equal(x.usePower(),true);assert.equal(x.nowExp,7);assert.equal(x.nowPower,0);
  x.isUsed=true;x.nowExp=100;x.addExp();assert.equal(x.nowExp,0);assert.equal(x.nowPower,1);
});

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {spawnFirstCombat,spawnFinaleBoss} from '../src/domain/first-combat-spawn.ts';
const root='local-resources/moyu/source-index/as/scripts/DefineSprite_4536/',source=fs.readFileSync(root+'frame_1/DoAction.as','utf8'),map=fs.readFileSync(root+'frame_7/DoAction.as','utf8'),setup=fs.readFileSync(root+'frame_2/DoAction.as','utf8');
const init=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')'),boss=new vm.Script('(function(mName)'+functionRange(source,'this.flashBoss =').text+')');
test('finale elites, initial boss thresholds, guard and king match original initialization',()=>{
 for(const region of ['wildFour','initial','guard','king'])for(const level of [1,5,29,30,135])for(const moreFire of [0,5,270])for(const roll of [0,1,4,9,19]){
  let i=0,j=0;const expectedCalls=[],actualCalls=[],rng=(n,index)=>(roll+index)%n;
  const o={role:{attackFire:20},entry1:{},entry2:{},allowJumpMap(){},dangerous(){}};for(let slot=1;slot<=6;slot++)o['monster'+slot]={monsterName:{},monsterFire:{}};
  const context=vm.createContext({random:n=>{expectedCalls.push(n);return rng(n,i++)},role:o.role,bossLevels:[{levels:level,moreFire}],_global:{},卡萨诺城产权:false});
  vm.runInContext(setup.slice(setup.indexOf('var bLife =')),context);o.initMonster=init.runInContext(context);context.initMonster=o.initMonster.bind(o);
  if(region==='wildFour'||region==='initial')vm.runInContext('(function(){'+fs.readFileSync(root+'frame_'+(region==='wildFour'?4:3)+'/DoAction.as','utf8')+'}).call(map)',vm.createContext({...context,map:o}));else boss.runInContext(context).call(o,region==='guard'?'鹿角护卫':'龙王');
  const random=n=>{actualCalls.push(n);return rng(n,j++)},actual=region==='wildFour'?spawnFirstCombat(random,undefined,region):spawnFinaleBoss(random,region,level,moreFire);assert.equal(actual.length,region==='wildFour'?4:1);assert.deepEqual(actualCalls,expectedCalls);
  actual.forEach((m,i)=>{const e=o['monster'+(i+1)];for(const key of ['minAttack','maxAttack','defense','life','maxLife','attackFire','burst','jook','reduceDamage','wind','fire','water','soil','attackLength','attackHeight','speedX','speedY','stopTime','stopRate','guardLength','guardHeight','attackStopTime','attackTypeNum'])assert.equal(m[key],e[key],key);assert.equal(m.x,e._x);assert.equal(m.y,e._y);assert.equal(m.level,e.levels);assert.equal(m.species,e.type);assert.equal(m.name,e.myName);assert.equal(m.textColor,e.monsterName.textColor);assert.equal(m.facing,e.faceTo==='左'?'left':'right');assert.equal(m.alive,e.isAlive);});
 }
});

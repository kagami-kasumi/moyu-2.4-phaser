import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {spawnFirstCombat} from '../src/domain/first-combat-spawn.ts';
const root='local-resources/moyu/source-index/as/scripts/DefineSprite_4536/',source=fs.readFileSync(root+'frame_1/DoAction.as','utf8'),map=fs.readFileSync(root+'frame_7/DoAction.as','utf8'),setup=fs.readFileSync(root+'frame_2/DoAction.as','utf8');
const init=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')'),boss=new vm.Script('(function(mName)'+functionRange(source,'this.flashBoss =').text+')');
test('wild two and three initialization equals original frames including label color and random order',()=>{
 for(const region of ['wildTwo','wildThree'])for(const roll of [0,1,4,9,19]){
  let i=0,j=0;const expectedCalls=[],actualCalls=[],rng=(n,index)=>(roll+index)%n;
  const o={role:{attackFire:20},entry1:{},entry2:{},allowJumpMap(){},dangerous(){}};for(let slot=1;slot<=6;slot++)o['monster'+slot]={monsterName:{},monsterFire:{}};
  const context=vm.createContext({random:n=>{expectedCalls.push(n);return rng(n,i++)},role:o.role,bossLevels:[{levels:1}],_global:{},卡萨诺城产权:false});
  vm.runInContext(setup.slice(setup.indexOf('var bLife =')),context);o.initMonster=init.runInContext(context);context.initMonster=o.initMonster.bind(o);
  vm.runInContext('(function(){'+fs.readFileSync(root+'frame_'+(region==='wildTwo'?6:5)+'/DoAction.as','utf8')+'}).call(map)',vm.createContext({...context,map:o}));
  const actual=spawnFirstCombat(n=>{actualCalls.push(n);return rng(n,j++)},undefined,region);assert.equal(actual.length,region==='wildTwo'?4:6);assert.deepEqual(actualCalls,expectedCalls);
  actual.forEach((m,i)=>{const e=o['monster'+(i+1)];for(const key of ['minAttack','maxAttack','defense','life','maxLife','attackFire','burst','jook','reduceDamage','wind','fire','water','soil','attackLength','attackHeight','speedX','speedY','stopTime','stopRate','guardLength','guardHeight','attackStopTime','attackTypeNum'])assert.equal(m[key],e[key],key);assert.equal(m.x,e._x);assert.equal(m.y,e._y);assert.equal(m.level,e.levels);assert.equal(m.species,e.type);assert.equal(m.name,e.myName);assert.equal(m.textColor,e.monsterName.textColor);assert.equal(m.facing,e.faceTo==='左'?'left':'right');assert.equal(m.alive,e.isAlive);});
 }
});

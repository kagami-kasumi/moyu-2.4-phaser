import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {spawnAbyssFieldBoss,ABYSS_FIELDS,spawnAbyssField} from '../src/domain/black-abyss-field.ts';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/black-abyss-field/source-fixture.json')),source=f.sources['DefineSprite_4536/frame_1/DoAction'];
test('all three abyss field populations match original initializer and random call order',()=>{
 for(let index=0;index<3;index++)for(const draw of [0,1,9,19]){
 const ec=[],ac=[],random=calls=>n=>{calls.push(n);return draw%Math.trunc(n);},o={role:{attackFire:1},entry1:{},entry2:{},allowJumpMap(){},dangerous(){}};
 for(let n=1;n<=6;n++)o['monster'+n]={monsterName:{},monsterFire:{}};
 const c=vm.createContext({...o,bossLevels:Array.from({length:9},()=>({levels:130,moreFire:0})),_global:{},冰宫产权:false,random:random(ec)}),init=f.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),c);o.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(c);c.initMonster=o.initMonster.bind(o);
 new vm.Script('(function(){'+f.sources['DefineSprite_4536/frame_'+(96+index)+'/DoAction']+'})').runInContext(c).call(o);
 const actual=index===2?[...spawnAbyssFieldBoss('initial',130,0,random(ac)),...spawnAbyssField(ABYSS_FIELDS[index],random(ac),130)]:spawnAbyssField(ABYSS_FIELDS[index],random(ac));assert.equal(actual.length,index===2?5:index?4:6);assert.deepEqual(ac,ec);
 for(const m of actual){const e=o[m.id];for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(m[key],e[key],index+' '+key);assert.equal(m.name,e.myName);assert.equal(m.species,e.type);assert.equal(m.x,e._x);assert.equal(m.y,e._y);assert.equal(m.textColor,e.monsterName.textColor);assert.equal(m.facing,e.faceTo==='右'?'right':'left');}
 }
});

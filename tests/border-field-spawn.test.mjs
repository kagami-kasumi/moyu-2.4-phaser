import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {BORDER_FIELDS,spawnBorderField} from '../src/domain/border-field.ts';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/border-field/source-fixture.json')),source=f.sources['DefineSprite_4536/frame_1/DoAction'];
test('all four border field populations match original initializer and random call order',()=>{
 for(let index=0;index<4;index++)for(const draw of [0,1,9,19]){
 const ec=[],ac=[],random=calls=>n=>{calls.push(n);return draw%Math.trunc(n);},o={role:{attackFire:1},entry1:{},entry2:{},allowJumpMap(){},dangerous(){}};
 for(let n=1;n<=6;n++)o['monster'+n]={monsterName:{},monsterFire:{}};
 const c=vm.createContext({...o,_global:{},边关产权:false,random:random(ec)}),init=f.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),c);o.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(c);c.initMonster=o.initMonster.bind(o);
 new vm.Script('(function(){'+f.sources['DefineSprite_4536/frame_'+(69+index)+'/DoAction']+'})').runInContext(c).call(o);
 const actual=spawnBorderField(BORDER_FIELDS[index],random(ac));assert.equal(actual.length,index%2?4:6);assert.deepEqual(ac,ec);
 for(const m of actual){const e=o[m.id];for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(m[key],e[key],index+' '+key);assert.equal(m.name,e.myName);assert.equal(m.species,e.type);assert.equal(m.x,e._x);assert.equal(m.y,e._y);assert.equal(m.textColor,e.monsterName.textColor);assert.equal(m.facing,e.faceTo==='右'?'right':'left');}
 }
});

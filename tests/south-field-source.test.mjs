import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {spawnSouthBoss,advanceSouthField} from '../src/domain/south-field.ts';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/south-field/source-fixture.json')),source=f.sources['DefineSprite_4536/frame_1/DoAction'];
test('initial frame63 and three flashBoss forms preserve all fields, frame selection and ordered RNG',()=>{
 for(const kind of ['initial','random','guard','king'])for(const level of [1,70,75,130,135])for(const fire of [0,5,270])for(const draw of [0,1,9,19]){
  const ec=[],ac=[],random=calls=>n=>{calls.push(n);return draw%Math.trunc(n);},bossLevels=Array.from({length:5},()=>({levels:level,moreFire:fire})),o={role:{attackFire:1},entry2:{},monster1:{monsterName:{},monsterFire:{}},allowJumpMap(){},dangerous(){}};
  const c=vm.createContext({...o,bossLevels,_global:{},南城产权:false,random:random(ec)}),init=f.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),c);o.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(c);c.initMonster=o.initMonster.bind(o);
  if(kind==='initial')new vm.Script('(function(){'+f.sources['DefineSprite_4536/frame_63/DoAction']+'})').runInContext(c).call(o);else new vm.Script('(function(mName)'+functionRange(source,'this.flashBoss =').text+')').runInContext(c).call(o,kind==='random'?'炎女头目':kind==='guard'?'恐兽护卫':'妖王');
  const m=spawnSouthBoss(kind,level,fire,random(ac))[0],e=o.monster1;assert.deepEqual(ac,ec);for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(m[key],e[key],kind+' '+key);assert.equal(m.name,e.myName);assert.equal(m.species,e.type);assert.equal(m.x,e._x);assert.equal(m.y,e._y);assert.equal(m.textColor,e.monsterName.textColor);assert.equal(m.facing,e.faceTo==='右'?'right':'left');if(kind==='initial'){assert.equal(o.entry2.toMap,'南城野外四');assert.equal(o.entry2.toEntry,'entry1');}
 }
});
test('independent bossLevels[4] increments level before successors and caps moreFire exactly like original',()=>{
 for(const level of [1,5,70,75,130,135])for(const moreFire of [0,5,265,270]){
  const state={level,moreFire},bossLevels=Array.from({length:5},(_,n)=>({name:n===4?'炎女头目':'other'+n,levels:level,maxLevels:135,moreFire})),before=JSON.stringify(bossLevels.slice(0,4));new vm.Script('(function(tName)'+functionRange(source,'this.bossLevelsUp =').text+')').runInNewContext({bossLevels})('炎女头目');advanceSouthField(state);assert.deepEqual(state,{level:bossLevels[4].levels,moreFire:bossLevels[4].moreFire});assert.equal(JSON.stringify(bossLevels.slice(0,4)),before);
 }
});
test('original tracking chooses entry2 before deducting quantity and refuses its own map',()=>{
 const fn=new vm.Script('(function(item)'+functionRange(f.sources['frame_9/DoAction'],'this.useItem =').text+')');
 for(const same of [false,true])for(const number of [0,1,2,99]){
  const events=[],item={type:'炎女头目行踪',number,hitTest:()=>true,setThing:value=>events.push(['clear',value.type])},original={map:{nowMap:same?'南城野外五':'南城二',gotoAndStop(name){events.push(['map',name,this.nextEntry,item.number]);}},backPack:{},fastKey:{}};
  fn.runInNewContext({_global:{sysMsg:{addMsg:message=>events.push(['message',message])}}}).call(original,item);
  if(same){assert.equal(item.number,number);assert.equal(events[0][0],'message');}else{assert.deepEqual(events[0],['map','南城野外五','entry2',number]);assert.equal(item.number,number-1);assert.equal(events.length,number<=1?2:1);if(number<=1)assert.deepEqual(events[1],['clear','空格']);}
 }
});

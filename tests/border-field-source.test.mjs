import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {spawnBorderBoss,advanceBorderField} from '../src/domain/border-field.ts';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/border-field/source-fixture.json')),source=f.sources['DefineSprite_4536/frame_1/DoAction'];
test('initial frame73 and three flashBoss forms preserve all fields, frame selection and ordered RNG',()=>{
 for(const kind of ['initial','random','guard','king'])for(const level of [1,90,95,130,135])for(const fire of [0,5,270])for(const draw of [0,1,9,19]){
  const ec=[],ac=[],random=calls=>n=>{calls.push(n);return draw%Math.trunc(n);},bossLevels=Array.from({length:6},()=>({levels:level,moreFire:fire})),o={role:{attackFire:1},entry2:{},monster1:{monsterName:{},monsterFire:{}},allowJumpMap(){},dangerous(){}};
  const c=vm.createContext({...o,bossLevels,_global:{},边关产权:false,random:random(ec)}),init=f.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),c);o.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(c);c.initMonster=o.initMonster.bind(o);
  if(kind==='initial')new vm.Script('(function(){'+f.sources['DefineSprite_4536/frame_73/DoAction']+'})').runInContext(c).call(o);else new vm.Script('(function(mName)'+functionRange(source,'this.flashBoss =').text+')').runInContext(c).call(o,kind==='random'?'刺虫人头目':kind==='guard'?'提风护卫':'剌虫王');
  const m=spawnBorderBoss(kind,level,fire,random(ac))[0],e=o.monster1;assert.deepEqual(ac,ec);for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(m[key],e[key],kind+' '+key);assert.equal(m.name,e.myName);assert.equal(m.species,e.type);assert.equal(m.x,e._x);assert.equal(m.y,e._y);assert.equal(m.textColor,e.monsterName.textColor);assert.equal(m.facing,e.faceTo==='右'?'right':'left');if(kind==='initial'){assert.equal(o.entry2.toMap,'边关野外四');assert.equal(o.entry2.toEntry,'entry1');}
 }
});
test('independent bossLevels[5] increments level before successors and caps moreFire exactly like original',()=>{
 for(const level of [1,5,90,95,130,135])for(const moreFire of [0,5,265,270]){
  const state={level,moreFire},bossLevels=Array.from({length:6},(_,n)=>({name:n===5?'刺虫人头目':'other'+n,levels:level,maxLevels:135,moreFire})),before=JSON.stringify(bossLevels.slice(0,5));new vm.Script('(function(tName)'+functionRange(source,'this.bossLevelsUp =').text+')').runInNewContext({bossLevels})('刺虫人头目');advanceBorderField(state);assert.deepEqual(state,{level:bossLevels[5].levels,moreFire:bossLevels[5].moreFire});assert.equal(JSON.stringify(bossLevels.slice(0,5)),before);
 }
});
test('original tracking chooses entry2 before deducting quantity and refuses its own map',()=>{
 const fn=new vm.Script('(function(item)'+functionRange(f.sources['frame_9/DoAction'],'this.useItem =').text+')');
 for(const same of [false,true])for(const number of [0,1,2,99]){
  const events=[],item={type:'剌虫人头目行踪',number,hitTest:()=>true,setThing:value=>events.push(['clear',value.type])},original={map:{nowMap:same?'边关野外五':'边关',gotoAndStop(name){events.push(['map',name,this.nextEntry,item.number]);}},backPack:{},fastKey:{}};
  fn.runInNewContext({_global:{sysMsg:{addMsg:message=>events.push(['message',message])}}}).call(original,item);
  if(same){assert.equal(item.number,number);assert.equal(events[0][0],'message');}else{assert.deepEqual(events[0],['map','边关野外五','entry2',number]);assert.equal(item.number,number-1);assert.equal(events.length,number<=1?2:1);if(number<=1)assert.deepEqual(events[1],['clear','空格']);}
 }
});

import {CombatSession} from '../src/domain/combat-session.ts';
import {spawnBorderField} from '../src/domain/border-field.ts';
test('both facing directions select original nine-frame Tifeng skill and damage only after its end marker',()=>{
 const family=f.families['提风'],selectors=f.timelines[family.selector].frames;
 for(const facing of ['left','right']){
  const selector=selectors[facing==='left'?6:7][0],frames=f.timelines[selector.characterId].frames;
  assert.equal(frames.length,9);assert(f.actions.some(a=>a.timeline===Number(selector.characterId)&&a.frame===9));
  const m=spawnBorderField('borderWildOne',()=>0)[0],role={id:'role',x:m.x+(facing==='right'?10:-10),y:m.y,alive:true,motion:'idle',animationFrame:1},hits=[];
  m.target='role';const session=new CombatSession([m],{role,pets:()=>[],roleActivity(){},hitMonster(){},hitParty:(monster,hit)=>hits.push(hit),random:n=>n===2?1:n-1});
  session.step();assert.equal(m.effect,'skill');assert.equal(m.facing,facing);assert.equal(m.animationFrame,1);
  for(let n=2;n<=9;n++){session.step();assert.equal(m.animationFrame,n);assert.equal(hits.length,0);}
  assert.equal(m.motion,'finished');session.paused=true;session.advance(1000);assert.equal(hits.length,0);session.paused=false;session.step();assert.equal(hits.length,1);session.close();session.advance(1000);assert.equal(hits.length,1);
 }
});

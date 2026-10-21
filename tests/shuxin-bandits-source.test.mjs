import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {spawnBandits} from '../src/domain/shuxin-bandits.ts';
import {CombatSession} from '../src/domain/combat-session.ts';
import {NPCS} from '../src/content/journey-content.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/shuxin-bandits/source-fixture.json'));
const mapSource=fixture.sources['DefineSprite_4536/frame_1/DoAction'];
test('suburb administrator position, shared picture and revive menu come from original frame and command',()=>{
 const appeared=[];
 const context={nowMap:'树心城郊区',entry1:{},entry2:{},entry3:{},entry4:{},npc01:{appear:(...args)=>appeared.push(args)},allowJumpMap(){},dangerous(){},getNpc:name=>name,getTimer:()=>0,_root:{tempTaskTime:0,tempTaskWait:1000}};
 vm.runInNewContext(fixture.sources['DefineSprite_4536/frame_21/DoAction'],context);
 assert.deepEqual(appeared,NPCS.shuxinOutskirts.map(npc=>[npc.title,npc.x,npc.y]));
 const selector=fixture.timelines['4308'];const frame=Number(Object.entries(selector.labels).find(([,label])=>label==='树心城郊区管理员')[0]);
 assert.equal(NPCS.shuxinOutskirts[0].shape,Number(selector.frames[frame-1][0].characterId));
 const menu=fixture.sources['DefineSprite_4312/frame_1/DoAction'];const branch=menu.slice(menu.indexOf('      case 3021:')+16,menu.indexOf('      case 3031:')).replace(/break;\s*$/,'');
 const npcContext={_parent:{role:{myName:'玩家'},树心城产权:true},answer:[],words:''};
 vm.runInNewContext('(function(){'+branch+'})()',npcContext);assert.equal(npcContext.answer[0].cmd,3000);
});
test('both mirrored attack and skill timelines finish on source frame nine before the next activity hits',()=>{
 for(const effect of ['attack','skill'])for(const facing of ['left','right']){
  const identity=effect==='attack'?3752:3761,source=fixture.sources[`DefineSprite_${identity}/frame_9/DoAction`];
  const actor={motion:'acting'};vm.runInNewContext(source,{_parent:{_parent:actor}});assert.equal(actor.motion,'使用技能结束');
  const monster=spawnBandits(1,()=>0)[0];Object.assign(monster,{effect,facing,motion:'acting',target:'role'});
  const role={id:'role',x:monster.x+10,y:monster.y,alive:true,motion:'idle',animationFrame:1};const hits=[];
  const session=new CombatSession([monster],{role,pets:()=>[],roleActivity(){},hitMonster(){},hitParty:(enemy,hit)=>hits.push(hit),random:()=>0});
  session.paused=true;session.advance(10000);assert.equal(monster.animationFrame,1);session.paused=false;
  for(let frame=2;frame<=9;frame++){session.step();assert.equal(monster.animationFrame,frame);assert.equal(hits.length,0);}
  assert.equal(monster.motion,'finished');session.step();assert.equal(hits.length,1);assert.equal(hits[0].target,'role');assert.equal(monster.effect,'none');
 }
});
test('all three waves match original initMonster fields and random order',()=>{
 for(const wave of [1,2,3])for(const draw of [0,1,9,19,49,999]){
  const expectedCalls=[],actualCalls=[];
  const random=calls=>limit=>{calls.push(limit);return draw%Math.trunc(limit);};
  const original={role:{attackFire:50},entry1:{},allowJumpMap(){},dangerous(){}};
  for(let number=1;number<=3;number++)original['monster'+number]={monsterName:{},monsterFire:{}};
  const context=vm.createContext({...original,random:random(expectedCalls)});
  const constants=fixture.sources['DefineSprite_4536/frame_2/DoAction'];
  vm.runInContext(constants.slice(constants.indexOf('var bLife =')),context);
  original.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(mapSource,'this.initMonster =').text+')').runInContext(context);
  context.initMonster=original.initMonster.bind(original);
  if(wave===1)new vm.Script('(function(){'+fixture.sources['DefineSprite_4536/frame_157/DoAction']+'})').runInContext(context).call(original);
  else new vm.Script('(function(place)'+functionRange(mapSource,'this.encounter =').text+')').runInContext(context)(wave===2?'第二批强盗':'强盗首领');
  const actual=spawnBandits(wave,random(actualCalls));
  assert.deepEqual(actualCalls,expectedCalls);
  assert.equal(actual.length,wave===3?1:3);
  actual.forEach((monster,index)=>{
   const expected=original['monster'+(index+1)];
   for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum'])assert.equal(monster[key],expected[key],`wave ${wave} ${key}`);
   assert.equal(monster.name,expected.myName);assert.equal(monster.species,expected.type);assert.equal(monster.x,expected._x);assert.equal(monster.y,expected._y);
  });
 }
});
test('original road checks doing and completion, with five-second warning and no level test',()=>{
 for(const isDoing of [false,true])for(const isComplete of [false,true]){
  const calls=[];
  const context={nowMap:'树心路',entry1:{},entry2:{},allowJumpMap(){},dangerous(){},encounter(){},_parent:{task:{getTask:()=>({isDoing,isComplete})},warning:{open:(...args)=>calls.push(args)}}};
  vm.runInNewContext(fixture.sources['DefineSprite_4536/frame_28/DoAction'],context);
  assert.equal(calls.length,isDoing&&!isComplete?1:0);
  assert.equal(context.entry2._visible,isDoing&&!isComplete?false:undefined);
  if(calls.length){assert.equal(calls[0][1],'树心路');assert.equal(calls[0][2],5);}
 }
});
test('original encounter has initial travel, second wave exit and final leader',()=>{
 const spawned=[],visited=[];
 const context=vm.createContext({entry1:{},gotoAndStop:name=>visited.push(name),initMonster:(...args)=>spawned.push(args),bLife:51,bAttack:.65,bItemAttack:.8,bHuanShouAttack:.65,bDefense:.6,bItemDefense:.75,bHuanShouDefense:.6,bBurst:5,bJook:5});
 const encounter=new vm.Script('(function(place)'+functionRange(mapSource,'this.encounter =').text+')').runInContext(context);
 encounter('树心路');assert.deepEqual(visited,['树平']);assert.equal(context.nextEntry,'entry1');assert.equal(context.encounterNext,'第二批强盗');
 encounter('第二批强盗');assert.equal(context.entry1._visible,true);assert.equal(context.encounterNext,'强盗首领');
 assert.equal(spawned[0][1],3);assert.equal(spawned[0][2].levels,20);assert.equal(spawned[0][2].jook,15);
 encounter('强盗首领');assert.equal(context.encounterNext,'');assert.equal(spawned[1][1],1);assert.equal(spawned[1][2].baseLevels,5);assert.equal(spawned[1][2].life,408);
});
test('original task definition preserves text/rule mismatch and prize order',()=>{
 const source=fixture.sources['DefineSprite_2210_任务系统/frame_1/DoAction_2'];
 const line=source.split('\n').find(value=>value.includes('name:"消灭强盗"'));
 const tasks=[];vm.runInNewContext(line,{mainTask:{push:value=>tasks.push(value)}});
 const task=tasks[0];assert.equal(task.levels,1);assert.match(task.explain,/20级以上/);assert.equal(task.need[0].name,'强盗首领');assert.equal(task.need[0].needNumber,1);
 assert.deepEqual(Array.from(task.prize,prize=>prize.type).reverse(),['功勋','军功','英雄令']);
});

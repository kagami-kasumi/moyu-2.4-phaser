import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {spawnShuxinMirage,shuxinMirageDrops} from '../src/domain/shuxin-city.ts';
import {CombatSession} from '../src/domain/combat-session.ts';
import {NPCS} from '../src/content/journey-content.ts';
import {mirageIntrusion} from '../src/domain/kasano-mirage.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/shuxin-city/source-fixture.json'));
const source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];

test('four ice swordsmen match original frame32 and initMonster with all numeric fields and RNG order',()=>{
 for(const draw of [0,1,9,19,49,999]){
  const expectedCalls=[],actualCalls=[],random=calls=>limit=>{calls.push(limit);return draw%Math.trunc(limit);};
  const original={role:{attackFire:50},entry6:{},allowJumpMap(){},dangerous(){}};
  for(let index=1;index<=4;index++)original['monster'+index]={monsterName:{},monsterFire:{}};
  const context=vm.createContext({...original,random:random(expectedCalls)});
  const initialization=fixture.sources['DefineSprite_4536/frame_2/DoAction'];
  vm.runInContext(initialization.slice(initialization.indexOf('var bLife =')),context);
  original.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(context);
  context.initMonster=original.initMonster.bind(original);
  new vm.Script('(function(){'+fixture.sources['DefineSprite_4536/frame_32/DoAction']+'})').runInContext(context).call(original);
  const actual=spawnShuxinMirage(random(actualCalls));assert.deepEqual(actualCalls,expectedCalls);assert.equal(actual.length,4);
  actual.forEach((monster,index)=>{
   const expected=original['monster'+(index+1)];
   for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum'])assert.equal(monster[key],expected[key],key);
   assert.equal(monster.name,expected.myName);assert.equal(monster.species,expected.type);assert.equal(monster.x,expected._x);assert.equal(monster.y,expected._y);
  });
  assert.equal(original.entry6.toMap,'树心城');assert.equal(original.entry6.toEntry,'backPoint');assert.equal(original.entry6._visible,false);
 }
});

test('all six ordinary reward branches and SuperHS thresholds preserve original death and factory RNG order',()=>{
 for(const remaining of [true,false])for(let branch=0;branch<6;branch++)for(const chance of [0,19,20,99])for(let egg=0;egg<4;egg++){
  const expected=[],actual=[],expectedCalls=[],actualCalls=[];
  const random=calls=>limit=>{calls.push(limit);return limit===6?branch:limit===100?chance:limit===4?egg:0;};
  const expectedRandom=random(expectedCalls),actualRandom=random(actualCalls);
  const parent={task:{catchThing:(name,count)=>expected.push({kind:'catch',name,count})},map:{goods:{throwGoods(x,y,item){
   expected.push({kind:'create',name:item.name??item.type,atRole:x===undefined&&y===undefined});expectedRandom(150);expectedRandom(50);
  }}}};
  parent.createThing=new vm.Script('(function(tThing,isDrop,fX,fY)'+functionRange(fixture.sources['frame_9/DoAction'],'this.createThing =').text+')').runInNewContext().bind(parent);
  const context=vm.createContext({_parent:parent,role:{creditUp:amount=>expected.push({kind:'credit',amount})},random:expectedRandom,maxArr:[4,6,8,10,11,12,13],fX:undefined,fY:undefined,haveMonst:()=>remaining,entry1:{}});
  for(const [name,args]of [['dropItemX','prizeLevel,fX,fY'],['SuperHS','rand']])context[name]=new vm.Script('(function('+args+')'+functionRange(source,'function '+name).text+')').runInContext(context);
  new vm.Script('(function(mName,fX,fY,level)'+functionRange(source,'this.monsterDeath =').text+')').runInContext(context).call({_parent:parent},'幻影冰妖剑士',100,200,25);
  shuxinMirageDrops(remaining,actualRandom,(event,atRole=false)=>{actual.push(event.kind==='create'?{...event,atRole}:event);if(event.kind==='create'){actualRandom(150);actualRandom(50);}});
  assert.deepEqual(actual,expected);assert.deepEqual(actualCalls,expectedCalls);assert.equal(context.entry1._visible,remaining?undefined:true);
 }
});

test('city source raises pharmacy floor, grants once and uses shared strict intrusion timer',()=>{
 const frame=fixture.sources['DefineSprite_4536/frame_31/DoAction'];
 for(const elapsed of [0,300000,300001,1e7])for(const chance of [.05,.5])for(const draw of [0,.049999,.05,.499999,.5,.999])for(const granted of [false,true])for(const openNumber of [2,4,7]){
  let jumped=false,draws=0;const gifts=[];
  const context={nowMap:'树心城',树心城获得幻境:granted,Math:{random:()=>{draws++;return draw;}},getTimer:()=>elapsed,_root:{intoV:chance,intoTime:0,intoWait:300000},_parent:{drugShop:{openNumber},createThing:item=>gifts.push(item.type)},_global:{playBackSound(){}},allowJumpMap(){},dangerous(){},getNpc:title=>title,gotoAndStop(){jumped=true;}};
  for(let index=1;index<=5;index++){context['entry'+index]={};context['npc0'+index]={appear(){}};}
  vm.runInNewContext(frame,context);assert.equal(jumped,mirageIntrusion(elapsed,chance,draw));assert.equal(draws,1);assert.equal(context._root.intoTime,jumped?elapsed:0);
  assert.equal(context.homeCity,'树心城');assert.equal(context._parent.drugShop.openNumber,Math.max(4,openNumber));assert.deepEqual(gifts,granted?[]:['树心幻境']);assert.equal(context.树心城获得幻境,true);
 }
 assert(!fixture.maps['32'].some(layer=>layer.name==='entry1'));assert(fixture.maps['32'].some(layer=>layer.name==='entry6'));
 assert(fixture.maps['31'].some(layer=>layer.name==='backPoint'&&layer.depth===24));
});

test('all five NPC positions and selector pictures match source frame31',()=>{
 const appeared=[],context={nowMap:'树心城',树心城获得幻境:true,Math:{random:()=>1},getTimer:()=>0,_root:{intoV:0,intoTime:0,intoWait:300000},_parent:{drugShop:{openNumber:2}},_global:{playBackSound(){}},allowJumpMap(){},dangerous(){},getNpc:title=>title};
 for(let index=1;index<=5;index++){context['entry'+index]={};context['npc0'+index]={appear:(...args)=>appeared.push(args)};}
 vm.runInNewContext(fixture.sources['DefineSprite_4536/frame_31/DoAction'],context);
 assert.deepEqual(appeared,NPCS.shuxinCity.map(npc=>[npc.title,npc.x,npc.y]));
 const selector=fixture.timelines['4308'];
 for(const npc of NPCS.shuxinCity){const frame=Number(Object.entries(selector.labels).find(([,label])=>label===npc.title)[0]);assert.equal(npc.shape,Number(selector.frames[frame-1][0].characterId));}
});

test('both attack selectors use eight-frame completion, no seventh skill selector, pause prevents a hit',()=>{
 assert.equal(fixture.timelines['3239'].frames.length,6);assert.equal(fixture.timelines['3229'].frames.length,1);
 const actor={};vm.runInNewContext(fixture.sources['DefineSprite_3238/frame_8/DoAction'],{_parent:{_parent:actor}});assert.equal(actor.motion,'使用技能结束');
 for(const facing of ['left','right']){
  const monster=spawnShuxinMirage(()=>0)[0];Object.assign(monster,{effect:'attack',facing,motion:'acting',target:'role'});
  const role={id:'role',x:monster.x+10,y:monster.y,alive:true,motion:'idle',animationFrame:1},hits=[];
  const session=new CombatSession([monster],{role,pets:()=>[],roleActivity(){},hitMonster(){},hitParty:(enemy,hit)=>hits.push(hit),random:()=>0});
  session.paused=true;session.advance(10000);assert.equal(monster.animationFrame,1);session.paused=false;
  for(let frame=2;frame<=8;frame++){session.step();assert.equal(monster.animationFrame,frame);assert.equal(hits.length,0);}
  assert.equal(monster.motion,'finished');session.step();assert.equal(hits.length,1);assert.equal(monster.effect,'none');
 }
});

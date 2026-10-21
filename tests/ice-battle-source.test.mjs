import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {spawnIceBattle,ICE_REGIONS,iceFlag,iceDefeated,initialIceBattle} from '../src/domain/ice-battle.ts';
import {CombatSession} from '../src/domain/combat-session.ts';
import {MAP_LINKS} from '../src/content/map-layout.ts';
import {NPCS} from '../src/content/journey-content.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/ice-battle/source-fixture.json')),source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];
test('five original field spawns overwrite monster1, preserve 15 random calls and all numeric fields',()=>{
 for(const [region,frame]of [['iceLeft',138],['iceUp',132],['iceCenter',134],['iceDown',136],['iceRight',140]])for(const draw of [0,1,9,19,99]){
  const expectedCalls=[],actualCalls=[],random=calls=>limit=>{calls.push(limit);return draw%Math.trunc(limit);};
  const original={role:{attackFire:151},allowJumpMap(){},dangerous(){},npc01:{appear(){}},getNpc:title=>title};
  for(let index=1;index<=4;index++){original['entry'+index]={};original['monster'+index]={monsterName:{},monsterFire:{}};}
  const context=vm.createContext({...original,random:random(expectedCalls),nowMap:'战场',homeCity:'树心城',[iceFlag(region)]:true});
  const init=fixture.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),context);
  original.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(context);context.initMonster=original.initMonster.bind(original);
  new vm.Script('(function(){'+fixture.sources[`DefineSprite_4536/frame_${frame}/DoAction`]+'})').runInContext(context).call(original);
  const actual=spawnIceBattle(region,random(actualCalls));assert.deepEqual(actualCalls,expectedCalls);assert.equal(actual.length,4);assert.equal(actualCalls.length,15);
  actual.forEach((monster,index)=>{const expected=original['monster'+(index+1)];for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(monster[key],expected[key],region+' '+key);assert.equal(monster.level,expected.levels);assert.equal(monster.textColor,expected.monsterName.textColor);assert.equal(monster.name,expected.myName);assert.equal(monster.species,expected.type);assert.equal(monster.x,expected._x);assert.equal(monster.y,expected._y);});
 }
});
test('source vice clears only current region, commander clears all, soldier clears none',()=>{
 for(const region of ICE_REGIONS)for(const name of ['魔军士兵','魔军副将','魔军主将']){
  const actual=initialIceBattle();for(const area of ICE_REGIONS)actual[iceFlag(area)]=true;
  const context=vm.createContext({...actual,nowRegion:iceFlag(region),role:{creditUp(){}},dropSoul(){},_parent:{task:{catchThing(){}}}}),owner={...actual,_parent:context._parent,dropItem(){}};
  new vm.Script('(function(mName,fX,fY,level)'+functionRange(source,'this.monsterDeath =').text+')').runInContext(context).call(owner,name,0,0,35);
  iceDefeated(actual,region,name);for(const area of ICE_REGIONS)assert.equal(actual[iceFlag(area)],name==='魔军副将'?owner[iceFlag(area)]:context[iceFlag(area)]);
 }
});

test('all 20 selectors and 7 animated timelines retain original completion and facing',()=>{
 for(const [region,index,selector,animations]of [['iceCenter',1,3860,[3841,3850,3859]],['iceCenter',0,3886,[3876,3885]],['iceRight',0,3912,[3902,3911]]]){
  const sourceFrames=fixture.timelines[selector].frames;assert.equal(sourceFrames.length,index===1?8:6);
  assert.equal(fixture.timelines[animations[0]].frames.length,12);
  for(const facing of ['left','right'])for(const effect of index===1?['attack','skill']:['attack']){
   const monster=spawnIceBattle(region,()=>0)[index],animation=animations[effect==='skill'?2:1],length=fixture.timelines[animation].frames.length,actor={};
   vm.runInNewContext(fixture.sources[`DefineSprite_${animation}/frame_${length}/DoAction`],{_parent:{_parent:actor}});assert.equal(actor.motion,'使用技能结束');
   Object.assign(monster,{effect,facing,motion:'acting',target:'role'});const hits=[],role={id:'role',x:monster.x+10,y:monster.y,alive:true,motion:'idle',animationFrame:1};
   const session=new CombatSession([monster],{role,pets:()=>[],roleActivity(){},hitMonster(){},hitParty:(enemy,hit)=>hits.push(hit),random:()=>0});session.paused=true;session.advance(10000);assert.equal(monster.animationFrame,1);session.paused=false;
   for(let frame=2;frame<=length;frame++){session.step();assert.equal(monster.animationFrame,frame);assert.equal(hits.length,0);}assert.equal(monster.motion,'finished');session.step();assert.equal(hits.length,1);
  }
 }
});



test('five graph links, quartermaster placement and home reassignment match original map scripts',()=>{
 const names={iceLeft:'冰域战场左',iceUp:'冰域战场上',iceCenter:'冰域战场中',iceDown:'冰域战场下',iceRight:'冰域战场右'};
 for(const [region,frame]of [['iceLeft',138],['iceUp',132],['iceCenter',134],['iceDown',136],['iceRight',140]]){
  const appeared=[],context={nowMap:names[region],homeCity:'树心城',oldCity:'卡萨诺城二',getNpc:title=>title,allowJumpMap(){},dangerous(){},npc01:{appear:(...args)=>appeared.push(args)},[iceFlag(region)]:false};for(let index=1;index<=4;index++)context['entry'+index]={};vm.runInNewContext(fixture.sources[`DefineSprite_4536/frame_${frame}/DoAction`],context);
  for(const [entry,link]of Object.entries(MAP_LINKS[region])){assert.equal(names[link.toMap],context[entry].toMap);assert.equal(link.toEntry,context[entry].toEntry);}
  assert.equal(context.nowRegion,iceFlag(region));if(region==='iceLeft'){assert.equal(context.homeCity,names[region]);assert.equal(context.oldCity,'树心城');assert.deepEqual(appeared,NPCS.iceLeft.map(npc=>[npc.title,npc.x,npc.y]));assert.equal(NPCS.iceLeft[0].shape,Number(fixture.timelines[4308].frames[7][0].characterId));}
 }
 for(const doing of [false,true])for(const complete of [false,true]){
  const warnings=[],context={nowMap:'冰封走廊',getTimer:()=>0,_root:{tempTaskTime:0,tempTaskWait:9999},_parent:{task:{getTask:()=>({isDoing:doing,isComplete:complete})}},allowJumpMap(){},getNpc:title=>title,npc01:{appear(){}},dangerous(){},entry1:{},entry2:{},entry3:{}};context._parent.warning={open:(callback,place,seconds)=>warnings.push([place,seconds])};vm.runInNewContext(fixture.sources['DefineSprite_4536/frame_78/DoAction'],context);assert.deepEqual(warnings,doing&&!complete?[['冰封走廊',5]]:[]);assert.equal(context.entry3._visible,complete?true:false);
 }
});


test('original ice encounter commits map before flags; left starts empty on natural entry',()=>{
 const events=[],context=vm.createContext({leftRegion:true,upRegion:false,centerRegion:false,downRegion:false,rightRegion:false});
 context.gotoAndStop=map=>events.push([map,context.leftRegion,context.upRegion]);const owner={_parent:{}};
 new vm.Script('(function(place)'+functionRange(source,'this.encounter =').text+')').runInContext(context).call(owner,'冰封走廊');
 assert.equal(context.nextMap,'冰域战场左');assert.equal(context.nextEntry,'entry2');assert.equal(context.leftRegion,false);for(const flag of ['upRegion','centerRegion','downRegion','rightRegion'])assert.equal(context[flag],true);
 assert.deepEqual(events,[['冰域战场左',true,false]]);
});

test('source jumpToMap enforces 70 independently of the descriptive quest level',()=>{
 const script=new vm.Script('(function(entry)'+functionRange(source,'this.jumpToMap =').text+')');
 for(const level of [1,69,70,74,75,150]){const events=[],role={levels:level},o={role,huanShou1:{},huanShou2:{},huanShou3:{},gotoAndStop:name=>events.push(name)},context={role,_global:{msg:{open:text=>events.push(text)}}};for(let i=1;i<=6;i++)context['entry'+i]={};const actual=script.runInNewContext(context).call(o,{_alpha:100,toMap:'冰封走廊',toEntry:'entry1'});assert.equal(actual,level>=70);if(level<70){assert.match(events[0],/70级/);assert.equal(o.nextMap,undefined);}else{assert.deepEqual(events,['冰封走廊']);assert.equal(o.nextEntry,'entry1');}}
});

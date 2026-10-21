import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {spawnAbyssFieldBoss,advanceAbyssField} from '../src/domain/black-abyss-field.ts';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/black-abyss-field/source-fixture.json')),source=f.sources['DefineSprite_4536/frame_1/DoAction'];
test('initial frame98 and three flashBoss forms preserve all fields, frame selection and ordered RNG',()=>{
 for(const kind of ['initial','random','guard','king'])for(const level of [1,130,135])for(const fire of [0,5,270])for(const draw of [0,1,9,19]){
  const ec=[],ac=[],random=calls=>n=>{calls.push(n);return draw%Math.trunc(n);},bossLevels=Array.from({length:9},()=>({levels:level,moreFire:fire})),o={role:{attackFire:1},entry1:{},monster1:{monsterName:{},monsterFire:{}},allowJumpMap(){},dangerous(){}};
  for(let n=2;n<=5;n++)o['monster'+n]={monsterName:{},monsterFire:{}};const c=vm.createContext({...o,bossLevels,_global:{},冰宫产权:false,random:random(ec)}),init=f.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),c);o.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(c);c.initMonster=o.initMonster.bind(o);
  if(kind==='initial')new vm.Script('(function(){'+f.sources['DefineSprite_4536/frame_98/DoAction']+'})').runInContext(c).call(o);else new vm.Script('(function(mName)'+functionRange(source,'this.flashBoss =').text+')').runInContext(c).call(o,kind==='random'?'暗黑格拉斯头目':kind==='guard'?'巨杰士护卫':'暗黑之王');
  const m=spawnAbyssFieldBoss(kind,level,fire,random(ac))[0],e=o.monster1;assert.deepEqual(ac,kind==='initial'?ec.slice(0,3):ec);for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(m[key],e[key],kind+' '+key);assert.equal(m.name,e.myName);assert.equal(m.species,e.type);assert.equal(m.x,e._x);assert.equal(m.y,e._y);assert.equal(m.textColor,e.monsterName.textColor);assert.equal(m.facing,e.faceTo==='右'?'right':'left');if(kind==='initial'){assert.equal(o.entry1.toMap,'黑渊二');assert.equal(o.entry1.toEntry,'entry2');}
 }
});
test('independent bossLevels[8] increments level before successors and caps moreFire exactly like original',()=>{
 for(const level of [1,5,90,95,130,135])for(const moreFire of [0,5,265,270]){
  const state={level,moreFire},bossLevels=Array.from({length:9},(_,n)=>({name:n===8?'暗黑格拉斯头目':'other'+n,levels:level,maxLevels:135,moreFire})),before=JSON.stringify(bossLevels.slice(0,8));new vm.Script('(function(tName)'+functionRange(source,'this.bossLevelsUp =').text+')').runInNewContext({bossLevels})('暗黑格拉斯头目');advanceAbyssField(state);assert.deepEqual(state,{level:bossLevels[8].levels,moreFire:bossLevels[8].moreFire});assert.equal(JSON.stringify(bossLevels.slice(0,8)),before);
 }
});
test('original tracking chooses entry1 before deducting quantity and refuses its own map',()=>{
 const fn=new vm.Script('(function(item)'+functionRange(f.sources['frame_9/DoAction'],'this.useItem =').text+')');
 for(const same of [false,true])for(const number of [0,1,2,99]){
  const events=[],item={type:'暗黑格拉斯头目行踪',number,hitTest:()=>true,setThing:value=>events.push(['clear',value.type])},original={map:{nowMap:same?'黑渊三':'冰宫',gotoAndStop(name){events.push(['map',name,this.nextEntry,item.number]);}},backPack:{},fastKey:{}};
  fn.runInNewContext({_global:{sysMsg:{addMsg:message=>events.push(['message',message])}}}).call(original,item);
  if(same){assert.equal(item.number,number);assert.equal(events[0][0],'message');}else{assert.deepEqual(events[0],['map','黑渊三','entry1',number]);assert.equal(item.number,number-1);assert.equal(events.length,number<=1?2:1);if(number<=1)assert.deepEqual(events[1],['clear','空格']);}
 }
});

import {CombatSession} from '../src/domain/combat-session.ts';
import {spawnAbyssField} from '../src/domain/black-abyss-field.ts';
test('both families and directions finish their independent skill timeline before damage',()=>{
 for(const [name,total,monster]of [['巨杰士',9,()=>spawnAbyssField('abyssWildOne',()=>0)[0]],['暗黑格拉斯',10,()=>spawnAbyssFieldBoss('initial',130,0,()=>0)[0]]])for(const facing of ['left','right']){
  const family=f.families[name],selectors=f.timelines[family.selector].frames,selector=selectors[facing==='left'?6:7][0],frames=f.timelines[selector.characterId].frames;assert.equal(frames.length,total);assert(f.actions.some(a=>a.timeline===Number(selector.characterId)&&a.frame===total));
  const m=monster(),role={id:'role',x:m.x+(facing==='right'?10:-10),y:m.y,alive:true,motion:'idle',animationFrame:1},hits=[];m.target='role';const session=new CombatSession([m],{role,pets:()=>[],roleActivity(){},hitMonster(){},hitParty:(monster,hit)=>hits.push(hit),random:n=>n===2?1:n-1});
  session.step();assert.equal(m.effect,'skill');assert.equal(m.facing,facing);for(let n=2;n<=total;n++){session.step();assert.equal(m.animationFrame,n);assert.equal(hits.length,0);}assert.equal(m.motion,'finished');session.paused=true;session.advance(1000);assert.equal(hits.length,0);session.paused=false;session.step();assert.equal(hits.length,1);session.close();session.advance(1000);assert.equal(hits.length,1);
 }
});

test('original warning replacement and unguarded callback preserve live escorts during first-slot flash',()=>{
 const text=f.sources['DefineSprite_4581/frame_1/DoAction'],events=[],o={info:{}},c=vm.createContext({intervalID:undefined,isNaN,clearInterval:id=>events.push(['clear',id]),setInterval:()=>17});
 for(const [name,args]of [['open','funName,reParam,time'],['timesUp',''],['close','']])o[name]=new vm.Script('(function('+args+')'+functionRange(text,'this.'+name+' =').text+')').runInContext(c);
 o.open(x=>events.push(['callback',x]),'巨杰士护卫',10);o.open(x=>events.push(['callback',x]),'暗黑格拉斯头目',5);o.timesUp();assert.equal(events.filter(e=>e[0]==='callback').length,1);assert.deepEqual(events.find(e=>e[0]==='callback'),['callback','暗黑格拉斯头目']);
 const live={life:123},calls=[],map={monster2:live,initMonster(begin,end,definition){calls.push([begin,end,definition.myName]);}};new vm.Script('(function(mName)'+functionRange(source,'this.flashBoss =').text+')').runInNewContext({initMonster:map.initMonster.bind(map),bossLevels:Array.from({length:9},()=>({levels:135,moreFire:0})),bLife:51,bAttack:.65,bItemAttack:.8,bHuanShouAttack:.65,bDefense:.6,bItemDefense:.75,bHuanShouDefense:.6,bBurst:5,bJook:5}).call(map,'巨杰士护卫');assert.deepEqual(calls,[[1,1,'巨杰士护卫']]);assert.equal(map.monster2,live);assert.equal(live.life,123);
});

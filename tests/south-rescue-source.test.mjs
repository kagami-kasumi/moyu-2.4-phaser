import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {spawnRescue,rescueDrops,RESCUE_FIELDS,SouthRescue,initialRescue} from '../src/domain/south-rescue.ts';
import {NpcReward} from '../src/domain/npc-reward.ts';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/south-rescue/source-fixture.json')),source=f.sources['DefineSprite_4536/frame_1/DoAction'];
test('source four fields and all three prison waves: every spawn field and ordered RNG',()=>{
 for(const [region,frame,wave,target]of [...RESCUE_FIELDS.map((r,n)=>[r,59+n,1]),['southPrison',156,1],['southPrison',0,2,'监狱守卫'],['southPrison',0,3,'监狱长']])for(const draw of [0,1,9,19,999]){
  const ec=[],ac=[],random=calls=>n=>{calls.push(n);return draw%Math.trunc(n);},o={role:{attackFire:1},allowJumpMap(){},dangerous(){},entry1:{},entry2:{}};
  for(let n=1;n<=6;n++)o['monster'+n]={monsterName:{},monsterFire:{}};
  const c=vm.createContext({...o,_global:{},南城产权:false,random:random(ec)}),init=f.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),c);o.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(c);c.initMonster=o.initMonster.bind(o);
  if(frame)new vm.Script('(function(){'+f.sources[`DefineSprite_4536/frame_${frame}/DoAction`]+'})').runInContext(c).call(o);
  else new vm.Script('(function(mName)'+functionRange(source,'this.flashBoss =').text+')').runInContext(c).call(o,target);
  const actual=spawnRescue(region,random(ac),wave);assert.deepEqual(ac,ec);assert.equal(actual.length,Object.values(o).filter(v=>v?.isAlive).length);
  actual.forEach((m,n)=>{const e=o['monster'+(n+1)];for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(m[key],e[key],region+' wave'+wave+' '+key);assert.equal(m.name,e.myName);assert.equal(m.species,e.type);assert.equal(m.x,e._x);assert.equal(m.y,e._y);assert.equal(m.textColor,e.monsterName.textColor);assert.equal(m.facing,e.faceTo==='右'?'right':'left');});
 }
});
test('original prison monsterDeath gates and ordered rescue events, with ordinary/boss factories independently covered by shared drop oracles',()=>{
 for(const name of ['监狱卫兵','监狱守卫','监狱长'])for(const remaining of [true,false])for(const active of [true,false]){
  const expected=[],o={npc01:{appear(){expected.push('son npc');}},npc02:{appear(){expected.push('daughter npc');}}},parent={task:{catchThing:(name,count)=>expected.push(['catch',name,count]),getTask:()=>({isDoing:active,isComplete:false})},warning:{open:(cb,name,seconds)=>expected.push(['warning',name,seconds])}},c=vm.createContext({_parent:parent,role:{},haveMonst:()=>remaining,getNpc:n=>n,dropSoul:(...args)=>expected.push(['soul',args[0]])});o._parent=parent;o.dropItem=kind=>expected.push(['drop',kind]);new vm.Script('(function(mName,fX,fY,level)'+functionRange(source,'this.monsterDeath =').text+')').runInContext(c).call(o,name,100,200,80);
  const events=[];rescueDrops(name,80,'战士',remaining,active,n=>n-1,()=>.5,e=>events.push(e));const markers=events.filter(e=>e.kind==='warning'||e.kind==='catch').map(e=>e.kind==='warning'?['warning',e.name,e.seconds]:['catch',e.name,e.count]);assert.deepEqual(markers,expected.filter(e=>Array.isArray(e)&&['warning','catch'].includes(e[0])));assert.equal(o.npc01.nextCmd,name==='监狱长'?5010:undefined);assert.equal(o.npc02.nextCmd,name==='监狱长'?5011:undefined);
 }
});
test('duke chest nine prize intervals match original luckyDraw1 over all 10000 draws',()=>{
 const helpers=f.sources['DefineSprite_4312/frame_1/DoAction_2'],body=functionRange(helpers,'function luckyDraw1').text;
 for(let value=0;value<10000;value++){
  let expected;new vm.Script('(function()'+body+')').runInNewContext({random:()=>value,_parent:{_parent:{createThing:item=>{expected=item.type;}}},_global:{sysMsg:{addMsg(){}}}})();
  const r=new NpcReward('宝箱'),s={...initialRescue(),isComplete:true,son:1,daughter:1,chestCmd:4022},service=new SouthRescue(s,r,()=>true,()=>({x:200,y:300}),()=>true,()=>300001,()=>value);r.bag[0]={type:'勇士勋章',number:0};service.show('chest');assert(service.chest());assert.equal(service.feedback,'获得 '+expected);
 }
});
test('source task catch priority, minimum level, completion and reverse claim reward order',()=>{
 const script=f.sources['DefineSprite_2210_任务系统/frame_1/DoAction'];
 for(const profession of ['战士','法师'])for(const level of [0,1,134])for(const active of [false,true]){
  const task={type:'支线任务',name:'劫狱',isDoing:active,isComplete:false,levels:1,need:[{name:'公爵儿子',number:0,needNumber:1},{name:'公爵女儿',number:0,needNumber:1}],prize:[{type:profession==='战士'?'金刚':'神圣'},{type:'生命之源'},{type:'魔力源泉'}]},expected=[];
  const c=vm.createContext({allTask:[[],[task]],_parent:{map:{role:{levels:level}},createThing:item=>expected.push(item.type)},_global:{sysMsg:{addMsg(){}}},showTask(){},taskDetail(){},nowTaskType:'branchTask',nowTask:task});
  c.taskComplete=new vm.Script('(function(task)'+functionRange(script,'this.taskComplete =').text+')').runInContext(c);
  const catchOriginal=new vm.Script('(function(thing,num)'+functionRange(script,'this.catchThing =').text+')').runInContext(c),r=new NpcReward('任务',()=>0,profession,undefined,undefined,false),state={...initialRescue(),isDoing:active},service=new SouthRescue(state,r,()=>true,()=>({x:100,y:200}),()=>true,()=>1e7);
  for(const name of ['公爵女儿','公爵女儿','公爵儿子','公爵儿子']){assert.equal(service.catchThing(name,1,level),catchOriginal(name,1)===true);assert.equal(state.isComplete,task.isComplete);assert.deepEqual([state.son,state.daughter],task.need.map(n=>n.number));}
  new vm.Script('(function()'+functionRange(script,'this.getPrize =').text+')').runInContext(c).call({});service.claim();assert.deepEqual(r.bag.filter(Boolean).map(i=>i.name??i.type),expected);assert.equal(state.isDoing,task.isDoing);
 }
});
test('duke original accept/refuse and exchange consumers: exact command gate and useThing query',()=>{
 const script=f.sources['DefineSprite_4312/frame_1/DoAction'],menu=script.slice(script.indexOf('      case 9361:'),script.indexOf('      case 9400:',script.indexOf('      case 9361:'))),accept=script.slice(script.indexOf('      case 9363:'),script.indexOf('      case 9401:',script.indexOf('      case 9363:')));
 for(const complete of [false,true])for(const ownsBox of [false,true]){
  const task={isDoing:false,isComplete:complete},events=[],query=[],parent={task:{getTask:()=>task,showTask(){}},backPack:{useThing:(item,n)=>{query.push([JSON.parse(JSON.stringify(item)),n]);return ownsBox;}},createThing:item=>events.push(item.type)},myID={cmd:9361},c=vm.createContext({_parent:{_parent:parent},myID,closeDialog(){},_global:{sysMsg:{addMsg(){}}}}),run=new vm.Script('(function(cmd){switch(cmd){'+menu+accept+'}})').runInContext(c);
  run(9361);assert.deepEqual(Array.from(c.answer,a=>a.cmd),[9362]);run(9362);assert.deepEqual(Array.from(c.answer,a=>a.cmd),[9363,-1]);run(9363);assert(task.isDoing);assert.equal(myID.cmd,9365);run(9365);assert.equal(myID.cmd,complete?9366:9365);
  run(9367);assert.deepEqual(query,[[{type:'宝石',name:'初级月光宝盒'},1]]);assert.deepEqual(events,ownsBox?['幻魔之心','幻魔之心']:[]);
 }
});


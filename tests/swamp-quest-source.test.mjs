import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {SwampQuest} from '../src/domain/swamp-quest.ts';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';

const json=path=>JSON.parse(fs.readFileSync(path));
const sources=json('docs/reverse-engineering/swamp-battle/source-fixture.json').sources;
const taskSource=sources['DefineSprite_2210_任务系统/frame_1/DoAction'],roleSource=sources['__Packages/RoleMC'];
const maps=json('public/assets/first-slice/manifest.json'),actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function oracle(profession,level){
 const main=[];
 const definitions=sources['DefineSprite_2210_任务系统/frame_1/DoAction_2'].split('\n').filter(line=>line.trim().startsWith('mainTask.push(')).slice(0,11).join('\n');
 vm.runInNewContext(definitions,{mainTask:main});
 for(let index=0;index<9;index++)main[index].isComplete=true;
 main[9].isDoing=true;
 const events=[],role={levels:level,vocational:profession,res:0,exploit:0,militaryExploit:0,chaw:0,militaryRank:0};
 const context=vm.createContext({mainTask:main,allTask:[[],main,[],[]],_parent:{map:{role},createThing:item=>events.push([item.type,role.exploit,role.militaryExploit])},_global:{msg:{open(){}},sysMsg:{addMsg(){}},numberToString:String},showTask(){},taskDetail(){},nowTask:main[9],nowTaskType:'mainTask',isNaN});
 for(const [name,args]of [['taskComplete','task'],['catchThing','thing,num'],['getPrize',''],['nextMainTask','']])context[name]=new vm.Script('(function('+args+')'+functionRange(taskSource,'this.'+name+' =').text+')').runInContext(context);
 for(const name of ['exploitUp','militaryExploitUp'])role[name]=new vm.Script('(function(val)'+functionRange(roleSource,'function '+name+'(val)').text+')').runInContext(context);
 const setter=new vm.Script('(function(val)'+functionRange(roleSource,'function set xxx_res(val)').text+')').runInContext(context);role.setSecreteCode=value=>value;role.资源=0;Object.defineProperty(role,'xxx_res',{get(){return this.资源;},set(value){setter.call(this,value);}});
 return {context,main,role,events};
}
test('level gate, catch saturation, next-main activation and reverse prizes match original functions',()=>{
 for(const profession of ['战士','法师'])for(const level of [0,1,44,45])for(const balance of [0,500,999,3499,35999,36000,38499,38500])for(const full of [false,true])for(const resource of [0,99950000,100000000]){
  const journey=new Journey(maps,new Actor(actors[profession]),actors);journey.start('奖励测试',profession);
  const state={number:0,secondActive:false,swampActive:true},quest=new SwampQuest(state,journey.inventory),source=oracle(profession,level);
  for(const name of ['魔军士兵','怪物','魔军主将'])assert.equal(quest.catchThing(name,3,level),Boolean(source.context.catchThing(name,3)),`${profession} ${level} ${name}`);
  assert.equal(quest.task.number,source.main[9].need[0].number);assert.equal(quest.task.isComplete,source.main[9].isComplete);assert.equal(state.southActive??false,source.main[10].isDoing);
  journey.reward.res=source.role.xxx_res=resource;journey.inventory.exploit=source.role.exploit=balance;journey.inventory.militaryExploit=source.role.militaryExploit=balance;
  journey.inventory.nobilityRank=source.role.chaw=5;journey.inventory.militaryRank=source.role.militaryRank=10;
  const calls=[];journey.reward.random=limit=>{calls.push([limit,journey.inventory.exploit,journey.inventory.militaryExploit]);return 0;};
  journey.reward.bag=Array.from({length:40},()=>full?{type:'英雄令',number:99}:null);
  source.context.getPrize();assert.equal(quest.claim({x:300,y:300},()=>true),level>=1);
  assert.equal(journey.inventory.exploit,source.role.exploit);assert.equal(journey.inventory.militaryExploit,source.role.militaryExploit);
  assert.equal(journey.inventory.chaw,5);assert.equal(journey.inventory.currentMilitaryRank,10);
  assert.equal(quest.task.isDoing,source.main[9].isDoing);assert.equal(journey.reward.res,source.role.xxx_res);assert.equal(state.honorPrompt??false,false);
  assert.deepEqual(calls,full&&level>=1?[[150,balance,balance],[50,balance,balance]]:[]);
  assert.deepEqual(source.events,level>=1?[['超级经验球',balance,balance]]:[]);
  assert.equal(quest.claim({x:300,y:300},()=>true),false);
 }
});


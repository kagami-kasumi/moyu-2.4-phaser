import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {BanditQuest} from '../src/domain/bandit-quest.ts';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';

const json=path=>JSON.parse(fs.readFileSync(path));
const sources=json('docs/reverse-engineering/shuxin-bandits/source-fixture.json').sources;
const taskSource=sources['DefineSprite_2210_任务系统/frame_1/DoAction'],roleSource=sources['__Packages/RoleMC'];
const maps=json('public/assets/first-slice/manifest.json'),actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
test('hero token consumption follows original branch and credit setter including cap and retained title',()=>{
 const root=sources['frame_9/DoAction'];
 const branch=root.slice(root.indexOf('      case "英雄令":')+19,root.indexOf('      case "卡萨诺幻境":')).replace(/break;\s*$/,'');
 for(const credit of [0,39,40,490,499,500,501])for(const titleLevel of [0,10,15])for(const number of [1,2,99]){
  const journey=new Journey(maps,new Actor(actors.战士),actors);journey.start('英雄令');journey.reward.credit=credit;journey.reward.titleLevel=titleLevel;
  const item={type:'英雄令',number};journey.reward.bag[0]=item;
  const role={maxRredit:500,titleLevel,setSecreteCode:value=>value,getSecreteCode:value=>value,不要作弊457:credit};
  const context=vm.createContext({_global:{sysMsg:{addMsg(){}}},isNaN,Math});
  const setter=new vm.Script('(function(val)'+functionRange(roleSource,'function set xxx_credit(val)').text+')').runInContext(context);
  Object.defineProperty(role,'xxx_credit',{get(){return this.不要作弊457;},set(value){setter.call(this,value);}});
  role.creditUp=new vm.Script('(function(val)'+functionRange(roleSource,'function creditUp(val)').text+')').runInContext(context);
  let emptied=false;const original={number,setThing(){emptied=true;}};
  new vm.Script('(function(item){'+branch+'})').runInContext(context).call({map:{role}},original);
  assert(journey.inventory.use(0,item));assert.equal(journey.reward.credit,role.xxx_credit);assert.equal(journey.reward.titleLevel,role.titleLevel);assert.equal(item.number,original.number);assert.equal(journey.reward.bag[0]===null,emptied);
 }
});
function oracle(profession,level){
 const main=[];
 const definitions=sources['DefineSprite_2210_任务系统/frame_1/DoAction_2'].split('\n').filter(line=>line.trim().startsWith('mainTask.push(')).slice(0,9).join('\n');
 vm.runInNewContext(definitions,{mainTask:main});
 for(let index=0;index<7;index++)main[index].isComplete=true;
 main[7].isDoing=true;
 const events=[],role={levels:level,vocational:profession,exploit:0,militaryExploit:0,chaw:0,militaryRank:0};
 const context=vm.createContext({mainTask:main,allTask:[[],main,[],[]],_parent:{map:{role},createThing:item=>events.push([item.type,role.exploit,role.militaryExploit])},_global:{sysMsg:{addMsg(){}},numberToString:String},showTask(){},taskDetail(){},nowTask:main[7],nowTaskType:'mainTask',isNaN});
 for(const [name,args]of [['taskComplete','task'],['catchThing','thing,num'],['getPrize',''],['nextMainTask','']])context[name]=new vm.Script('(function('+args+')'+functionRange(taskSource,'this.'+name+' =').text+')').runInContext(context);
 for(const name of ['exploitUp','militaryExploitUp'])role[name]=new vm.Script('(function(val)'+functionRange(roleSource,'function '+name+'(val)').text+')').runInContext(context);
 return {context,main,role,events};
}
test('level gate, catch saturation, next-main activation and reverse prizes match original functions',()=>{
 for(const profession of ['战士','法师'])for(const level of [0,1,19,20])for(const balance of [0,500,999,3499,35999,36000,38499,38500])for(const full of [false,true]){
  const journey=new Journey(maps,new Actor(actors[profession]),actors);journey.start('奖励测试',profession);
  const state={number:0,secondActive:false,nextActive:true},quest=new BanditQuest(state,journey.inventory),source=oracle(profession,level);
  for(const name of ['强盗','怪物','强盗首领','强盗首领'])assert.equal(quest.catchThing(name,3,level),Boolean(source.context.catchThing(name,3)),`${profession} ${level} ${name}`);
  assert.equal(quest.task.number,source.main[7].need[0].number);assert.equal(quest.task.isComplete,source.main[7].isComplete);assert.equal(state.kingActive??false,source.main[8].isDoing);
  journey.inventory.exploit=source.role.exploit=balance;journey.inventory.militaryExploit=source.role.militaryExploit=balance;
  journey.inventory.nobilityRank=source.role.chaw=5;journey.inventory.militaryRank=source.role.militaryRank=10;
  const calls=[];journey.reward.random=limit=>{calls.push([limit,journey.inventory.exploit,journey.inventory.militaryExploit]);return 0;};
  journey.reward.bag=Array.from({length:40},()=>full?{type:'英雄令',number:99}:null);
  source.context.getPrize();assert.equal(quest.claim({x:300,y:300},()=>true),level>=1);
  assert.equal(journey.inventory.exploit,source.role.exploit);assert.equal(journey.inventory.militaryExploit,source.role.militaryExploit);
  assert.equal(journey.inventory.chaw,5);assert.equal(journey.inventory.currentMilitaryRank,10);
  assert.equal(quest.task.isDoing,source.main[7].isDoing);
  assert.deepEqual(calls,full&&level>=1?[[150,source.role.exploit,source.role.militaryExploit],[50,source.role.exploit,source.role.militaryExploit]]:[]);
  assert.deepEqual(source.events,level>=1?[['英雄令',journey.inventory.exploit,journey.inventory.militaryExploit]]:[]);
  assert.equal(quest.claim({x:300,y:300},()=>true),false);
 }
});

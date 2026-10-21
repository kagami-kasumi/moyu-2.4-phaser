import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
import {KingHonor} from '../src/domain/king-honor.ts';import {KingQuest} from '../src/domain/king-quest.ts';import {NpcReward} from '../src/domain/npc-reward.ts';
import {Journey} from '../src/domain/journey.ts';import {Actor} from '../src/domain/actor.ts';import {captureSave} from '../src/application/save-game.ts';import {encodeSave,decodeSave,savedProgress} from '../src/application/save-codec.ts';
import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';
const json=p=>JSON.parse(fs.readFileSync(p)),f=json('docs/reverse-engineering/king-honor/source-fixture.json');
function oracle(doing,number,credit,balance,title=0){
 const daily=[];vm.runInNewContext(f.taskSeed,{dailyTask:daily});const task=daily[0];Object.assign(task,{isDoing:doing,isComplete:number===100});task.need[0].number=number;
 const events=[],role={levels:1,titleLevel:title,maxRredit:Number(f.maxCredit),setSecreteCode:v=>v,getSecreteCode:v=>v},context=vm.createContext({_global:{numberToString:String,sysMsg:{addMsg:m=>events.push(m)}},_parent:{map:{role}},getTask:()=>task,allTask:[[task]],nowTask:task,nowTaskType:'dailyTask',showTask(){},taskDetail(){}});
 for(const [name,args]of [['setHonorTask','todo'],['catchThing','thing,num'],['taskComplete','task']])context[name]=vm.runInContext('(function('+args+')'+f.functions[name]+')',context);
 for(const [name,field]of [['ms','魔石'],['res','资源'],['credit','不要作弊457']]){const setter=vm.runInContext('(function(val)'+f.setters[name]+')',context);Object.defineProperty(role,'xxx_'+name,{get(){return this[field];},set(value){setter.call(this,value);}});role['xxx_'+name]=name==='credit'?credit:balance;}
 context._parent={role,_parent:{task:{getTask:()=>task,setHonorTask:context.setHonorTask}}};context.myID={cmd:9511};context.closeDialog=()=>events.push('close');const cmd=vm.runInContext('(function(cmd){switch(cmd){'+f.menu+f.commands+'}})',context);
 return {task,role,context,cmd,events};
}
test('independent original three menus, all three rewards, current credit and currency/title caps',()=>{
 for(const p of f.provenance)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(p.path)).digest('hex'),p.sha256);
 for(const career of ['战士','法师'])for(const credit of [0,29,49,480,499,500])for(const balance of [0,99999000,100000000])for(const title of [0,10])for(const [index,prize]of ['ms','res','credit'].entries()){
  const source=oracle(true,100,credit,balance,title),r=new NpcReward('荣誉',()=>0,career,undefined,undefined,false);Object.assign(r,{credit,ms:balance,res:balance,titleLevel:source.role.titleLevel});
  const state={number:0,secondActive:false,king:{number:1,isDoing:false,isComplete:true},honor:{number:100,isDoing:true,isComplete:true}},service=new KingHonor(state,r,()=>true);assert(service.interact());source.cmd(9511);assert.deepEqual(Array.from(source.context.answer,a=>a.cmd),[9513,9514,9515]);
  // Change after opening: reward must use current credit, not captured preview.
  r.credit=source.role.xxx_credit=Math.min(500,credit+1);r.titleLevel=source.role.titleLevel;const rev=service.revision;assert(service.claim(prize,rev));source.cmd(9513+index);
  assert.deepEqual([r.ms,r.res,r.credit,r.titleLevel],[source.role.xxx_ms,source.role.xxx_res,source.role.xxx_credit,source.role.titleLevel]);assert.equal(state.honor.isDoing,source.task.isDoing);assert.equal(state.honor.isComplete,true);assert.equal(state.honor.number,100);assert.equal(service.claim(prize,rev),false);assert.equal(service.open,false);
  service.interact();source.cmd(9511);assert.equal(source.context.answer[0].cmd,9512);assert(service.accept());source.cmd(9512);assert.deepEqual(state.honor,{number:source.task.need[0].number,isDoing:source.task.isDoing,isComplete:source.task.isComplete});
 }
});
test('original level gate and saturated kills; incomplete/locked/dead/closed/stale sessions cannot award',()=>{
 for(const level of [0,1,134])for(const number of [0,4,99,100])for(const count of [1,2,150]){
  const source=oracle(true,number,50,0),r=new NpcReward('计数',()=>0,undefined,undefined,undefined,false),state={number:0,secondActive:false,honor:{number,isDoing:true,isComplete:number===100}};
  source.context._parent={map:{role:{levels:level}}};const quest=new KingQuest(state,{reward:r});assert.equal(quest.catchThing('怪物',count,level),!!source.context.catchThing('怪物',count));assert.equal(state.honor.number,source.task.need[0].number);assert.equal(state.honor.isComplete,source.task.isComplete);
 }
 const r=new NpcReward('边界'),state={number:0,secondActive:false,king:{number:0,isDoing:true,isComplete:false},honor:{number:4,isDoing:true,isComplete:false}};let allowed=true;const s=new KingHonor(state,r,()=>allowed);assert.equal(s.interact(),false);state.king.isComplete=true;assert(s.interact());assert.equal(s.mode,'progress');assert.equal(s.claim('ms'),false);assert.equal(s.accept(),false);s.close();assert.equal(s.claim('res'),false);s.interact();state.honor={number:100,isDoing:true,isComplete:true};allowed=false;assert.equal(s.claim('credit'),false);
});
test('partial, complete, claimed, renewed saves preserve original counters and invalidate map/restore callbacks',()=>{
 const actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')},maps=json('public/assets/first-slice/manifest.json');
 for(const career of ['战士','法师'])for(const [number,doing]of [[47,true],[100,true],[100,false],[0,true]]){
  const j=new Journey(maps,new Actor(actors[career]),actors);j.start('荣誉保存',career);j.map='palace';j.x=300;j.y=300;j.firstQuest.king={number:1,isDoing:false,isComplete:true};j.firstQuest.honor={number,isDoing:doing,isComplete:number===100};const expected=structuredClone(j.firstQuest.honor),old=j.kingHonor;old.interact();
  const saved=captureSave(j.progress()),p=savedProgress(decodeSave(encodeSave(saved)));j.restore(p);assert.deepEqual(j.firstQuest.honor,expected);assert.equal(old.claim('ms'),false);assert.equal(old.accept(),false);const current=j.kingHonor;assert(current.interact());const rev=current.revision;assert(j.arrive('citySecond','entry3','citySecond'));assert.equal(current.claim('ms',rev),false);assert.equal(current.accept(rev),false);
 }
});
test('legacy raw completed and claimed tasks promote without reopening rewards; malformed counters reject',()=>{
 const maps=json('public/assets/first-slice/manifest.json'),actor=json('public/assets/first-actor/manifest.json');
 for(const doing of [false,true]){
  const j=new Journey(maps,new Actor(actor));j.start('旧荣誉');const state=captureSave(j.progress()),raw=restorePreservedValue(state.source),extension=restorePreservedValue(state.extensions);
  delete extension.game.firstQuest.honor;raw.dailyTask11isDoing=doing;raw.dailyTask11isComplete=true;raw.dailyTask11need_number=73;raw.unrelatedHonorExtension={kept:'原样'};state.source=preserveValue(raw);state.extensions=preserveValue(extension);
  const decoded=decodeSave(encodeSave(state)),progress=savedProgress(decoded);assert.deepEqual(progress.firstQuest.honor,{number:100,isDoing:doing,isComplete:true});j.restore(progress);assert.deepEqual(restorePreservedValue(captureSave(j.progress(),decoded).source).unrelatedHonorExtension,{kept:'原样'});
  const bad=j.progress();bad.firstQuest.honor.number=99;assert.throws(()=>captureSave(bad));
 }
});

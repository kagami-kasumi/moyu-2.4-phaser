import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {QUEST_GENERATOR_RULES as rules} from '../src/content/quest-generator-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';
const source=fs.readFileSync(root+rules.source,'utf8');
const plain=v=>JSON.parse(JSON.stringify(v));
test('all commander generator inputs and daily counts match original code',()=>{
 const dialog=fs.readFileSync(root+rules.commanderSource,'utf8');
 for(const row of rules.commanders)for(let draw=0;draw<row.bosses.length;draw++){
  const start=dialog.indexOf('case '+row.command+':'),end=dialog.indexOf('case ',start+5);
  const ctx={random:n=>{assert.equal(n,2);return draw;},setCommand:n=>assert.equal(n,3209)};
  vm.runInNewContext('(function(){'+dialog.slice(start,end).replace(/^case \d+:/,'')+'})()',ctx);
  assert.equal(ctx.lvName,row.tier);assert.equal(ctx.needMilitaryRank,row.rank);
  assert.deepEqual([ctx.monstName1,ctx.monstName2],row.monsters);assert.equal(ctx.bossName1,row.bosses[draw]);
  for(const [kind,rule] of Object.entries(rules.daily)){
   const task={name:row.tier+kind,isComplete:true};
   const c={dailyTask:[task],showTask(){},nowTaskType:0};
   const fn=vm.runInNewContext('(function(taskName,monstName1,monstName2)'+functionRange(source,'this.setDailyTask =').text+')',c);
   const names=kind==='悬赏'?[ctx.bossName1]:row.monsters.map(n=>n+rule.suffix);
   assert.equal(fn(task.name,...names),true);
   assert.deepEqual(plain(task.need),names.map(name=>({name,number:0,needNumber:rule.count})));
   assert.equal(task.isDoing,true);assert.equal(task.isComplete,true);
  }
 }
});
test('friend generator covers all random branches and home-city mappings',()=>{
 for(const [city,monster] of Object.entries({unknown:rules.friend.defaultMonster,...rules.friend.byHomeCity}))for(let draw=0;draw<4;draw++){
  const task={name:'好友委托',isDoing:false,isComplete:true},npc={name:'fixture',nTitle:'fixture'};
  const ctx={dailyTask:[task],_parent:{map:{homeCity:city}},random:n=>{assert.equal(n,4);return draw;},showTask(){},nowTaskType:0,_global:{sysMsg:{addMsg(){}}}};
  const fn=vm.runInNewContext('(function(taskNpc)'+functionRange(source,'this.setFriendTask =').text+')',ctx);
  assert.equal(fn(npc),true);
  const expected=draw<3?[{name:rules.friend.collect[draw].name,number:0,needNumber:rules.friend.collect[draw].count}]:[{name:monster,number:0,needNumber:4},{name:monster+'精英',number:0,needNumber:2}];
  assert.deepEqual(plain(task.need),expected);assert.equal(task.isComplete,true);assert.equal(npc.isTask,true);
  assert.equal(fn(npc),false);
 }
});

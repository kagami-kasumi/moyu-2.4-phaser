import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {FRIEND_RELATION_RULES as rules} from '../src/content/friend-relation-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
test('gift task offer has a 2500 of 10000 draw and spouse quest priority after active-quest guard',()=>{
 const r=rules.giftTaskOffer,text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+r.source,'utf8');
 for(const active of [false,true])for(const level of [4,5,6])for(const spouseActive of [false,true])for(const roll of [0,2499,2500,9999]){
  const events=[],npc={name:'npc',levels:level},callback=()=>{};
  const task={setFriendTask:callback,getTask:name=>{events.push(['get',name]);return {isDoing:name==='好友委托'?active:spouseActive};}};
  const ctx=vm.createContext({_parent:{_parent:{task}},myID:npc,random:n=>{assert.equal(n,r.randomBound);events.push(['random',n]);return roll;},setCommand:n=>events.push(['command',n]),_global:{msg:{open:(message,fn,target)=>{assert.equal(fn,callback);assert.equal(target,npc);events.push(['prompt']);}}}});
  const fn=vm.runInContext('(function()'+functionRange(text,'this.setFriendTask = function()').text+')',ctx);
  const result=fn.call({myID:npc});
  if(active){assert.equal(result,false);assert.deepEqual(events,[['get','好友委托']]);continue;}
  const expected=[['get','好友委托'],['random',10000]];
  if(roll<r.threshold){
   if(level>=r.spouseLevel)expected.push(['get',r.spouseQuest]);
   expected.push(level>=5&&!spouseActive?['command',r.spouseCommand]:['prompt']);
  }
  assert.deepEqual(events,expected);assert.equal(result,roll<2500&&level>=5&&!spouseActive?true:undefined);
 }
});
test('six social gifts consume before relation gain and still refresh task on rejected gain',()=>{
 const dialog=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.confession.source,'utf8');
 for(const gift of rules.gifts)for(const available of [false,true])for(const accepted of [false,true]){
  const start=dialog.indexOf(`      case ${gift.command}:`,dialog.indexOf('this.command2 = function()'));
  assert.ok(start>=0);const end=dialog.indexOf('      case ',start+10),body=dialog.slice(start,end);
  const events=[],myID={name:'recipient'},ctx=vm.createContext({myID,prevCmd:123,
   _parent:{_parent:{backPack:{useThing:(item,n)=>{events.push(['consume',item.type,n]);return available;}},friend:{addRelation:(npc,n)=>{assert.equal(npc,myID);events.push(['relation',n]);return accepted;}}}},
   _global:{sysMsg:{addMsg:msg=>events.push(['message',msg])}},setFriendTask:()=>events.push(['task'])});
  vm.runInContext('(function(){switch('+gift.command+'){'+body+'}})()',ctx);
  assert.deepEqual(events[0],['consume',gift.item,gift.quantity]);assert.equal(ctx.nextCmd,123);
  if(available){assert.deepEqual(events[1],['relation',gift.relation]);assert.ok(events[2][1].includes(`提高了${accepted?gift.relation:0}点`));assert.deepEqual(events[3],['task']);assert.equal(events.length,4);}
  else {assert.ok(events[1][1].includes('没有 '+gift.item));assert.equal(events.length,2);}
 }
});
test('confession command applies both penalties before separation and prioritizes existing lover',()=>{
 const dialog=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.confession.source,'utf8');
 const body=dialog.slice(dialog.indexOf('      case 8100:',dialog.indexOf('this.command2 = function()')),dialog.indexOf('      case 8112:',dialog.indexOf('this.command2 = function()')));
 assert.ok(body.startsWith('      case 8100:'));
 for(const hasLover of [false,true])for(const rejects of [0,2]){
  const events=[],myID={name:'target',cmd:8100,rejectTimes:rejects},lover=hasLover?{name:'lover',levels:5,relation:920}:undefined;
  const friend={lover,addRelation:(npc,val)=>{events.push([npc===myID?'target':'lover',val]);},divestLover:()=>events.push('separate'),upToLover:npc=>{assert.equal(npc,myID);events.push('promote');}};
  const ctx=vm.createContext({_parent:{_parent:{friend}},myID,_global:{msg:{open:()=>{}},sysMsg:{addMsg:()=>{}}},closeDialog:()=>events.push('close')});
  vm.runInContext('(function(){switch(8100){'+body+'}})()',ctx);
  if(hasLover){assert.deepEqual(events,[['target',rules.confession.targetPenalty],['lover',rules.confession.existingLoverPenalty],'separate','close']);assert.equal(myID.rejectTimes,rejects);}
  else if(rejects>0){assert.deepEqual(events,[['target',-15],'close']);assert.equal(myID.rejectTimes,rejects-1);}
  else {assert.deepEqual(events,['promote','close']);assert.equal(myID.oldCmd,8100);assert.equal(myID.cmd,rules.confession.acceptedCommand);}
  assert.equal(ctx.nextCmd,myID.cmd);
 }
});
test('friend initialization clears the same list but does not reset page state',()=>{
 const list=[{name:'old'}],ctx=vm.createContext({allFriends:list,friendNumber:9,maxFriendNumber:14,lover:{},isFirstLove:false,nowPage:3,maxPage:4,upData:()=>{ctx.updated=true;}});
 vm.runInContext('(function()'+functionRange(source,'this.initData = function()').text+')()',ctx);
 assert.equal(ctx.allFriends,list);assert.equal(list.length,0);
 for(const key of ['friendNumber','maxFriendNumber','isFirstLove'])assert.equal(ctx[key],rules.initialization[key]);
 assert.equal(ctx.lover,undefined);assert.equal(ctx.nowPage,3);assert.equal(ctx.maxPage,4);assert.equal(ctx.updated,true);
});
test('ordinary lover separation respects 450 boundary and removes charm before downgrading',()=>{
 assert.equal(Number(source.match(/var loverMinRation = (\d+)/)[1]),rules.separation.loverMinimum);
 assert.equal(Number(source.match(/var spouserMinRation = (\d+)/)[1]),rules.separation.spouseMinimum);
 for(const relation of [449,450,451])for(const equipped of [false,true]){
  const events=[],lover={levels:4,relation,isLover:true,maxRelation:1000,name:'npc'};
  const charm={type:equipped?'幸运符':'空格',setThing:value=>{events.push('charm');charm.type=value.type;}};
  const panel={lover,isFirstLove:true,relationLevel:[...rules.thresholds],sortFriend:()=>events.push('sort'),showFriends:()=>events.push('show')};
  const ctx=vm.createContext({lover,loverMinRation:450,spouserMinRation:900,_parent:{equipment:{幸运符:charm}},_global:{sysMsg:{addMsg:()=>{}}},setRelationName:npc=>{events.push('name');npc.relationName=rules.names[npc.levels];}});
  const fn=vm.runInContext('(function()'+functionRange(source,'this.divestLover = function()').text+')',ctx);
  assert.equal(fn.call(panel),relation<450);
  if(relation>=450){assert.deepEqual(events,[]);assert.equal(panel.lover,lover);continue;}
  assert.equal(lover.levels,rules.separation.fallbackLevel);assert.equal(lover.rejectTimes,rules.separation.rejectTimes);
  assert.equal(lover.relation,relation);assert.equal(lover.maxRelation,500);assert.equal(lover.isLover,false);
  assert.equal(panel.isFirstLove,false);assert.equal(panel.lover,undefined);assert.equal(charm.type,'空格');
  assert.deepEqual(events,[...(equipped?['charm']:[]),'name','sort','show']);
 }
});
function setup(){
 const events=[];
 const ctx=vm.createContext({_global:{sysMsg:{addMsg:()=>events.push('message')}}});
 const compile=(marker,args)=>vm.runInContext('(function('+args+')'+functionRange(source,marker).text+')',ctx);
 const setName=compile('this.setRelationName = function(npc)','npc');ctx.setRelationName=setName;
 const panel={relationLevel:[...rules.thresholds],showFriends:()=>events.push('show'),sortFriend:()=>events.push('sort')};
 return {panel,events,setName,add:compile('this.addRelation = function(npc, val)','npc,val'),promote:compile('this.upToLover = function(NPC)','NPC')};
}
test('friend relation thresholds and names match source and gain advances only one level',()=>{
 const literal=source.match(/var relationLevel = new Array\(([^)]+)\)/)[1].split(',').map(Number);
 assert.deepEqual(literal,[...rules.thresholds]);
 for(let level=0;level<=6;level++){
  const {setName}=setup(),npc={levels:level};setName(npc);assert.equal(npc.relationName,rules.names[level]??'');
 }
 for(const level of [0,1,2,3,4,5]){
  const {panel,add,events}=setup(),npc={levels:level,relation:0,maxRelation:rules.thresholds[level]};
  assert.equal(add.call(panel,npc,10000),true);
  assert.equal(npc.relation,rules.thresholds[level]);
  assert.equal(npc.levels,level<rules.automaticLevelLimit?level+1:level);
  assert.equal(npc.maxRelation,rules.thresholds[npc.levels]);
  assert.equal(events.at(-1),'show');
 }
});
test('friend relation gain guard is exact equality; negative values do not demote or clamp at zero',()=>{
 const {panel,add,events}=setup();
 assert.equal(add.call(panel,undefined,10),false);
 const npc={levels:3,relation:500,maxRelation:500};
 assert.equal(add.call(panel,npc,1),false);assert.deepEqual(events,[]);
 assert.equal(add.call(panel,npc,0),true);
 assert.equal(add.call(panel,npc,-1000),true);assert.equal(npc.relation,-500);assert.equal(npc.levels,3);
 npc.relation=501;assert.equal(add.call(panel,npc,1),true);assert.equal(npc.relation,500);
});
test('lover promotion has no internal eligibility guard and refreshes after field changes',()=>{
 for(const level of [3,4]){
  const {panel,promote,events}=setup(),npc={levels:level,relation:123,isLover:false};
  promote.call(panel,npc);assert.equal(npc.levels,level+1);assert.equal(npc.relation,123);
  assert.equal(npc.maxRelation,rules.thresholds[level+1]);assert.equal(npc.relationName,rules.names[level+1]);
  assert.equal(npc.isLover,true);assert.equal(panel.lover,npc);assert.deepEqual(events,['sort','show']);
 }
});
test('friend membership uses object identity for add and reverse name matching for delete',()=>{
 const events=[];
 const ctx=vm.createContext({_global:{sysMsg:{addMsg:()=>events.push('capacity')}}});
 const compile=(name,args)=>vm.runInContext('(function('+args+')'+functionRange(source,`this.${name} = function(${args})`).text+')',ctx);
 const add=compile('addFriend','NPC'),remove=compile('delFriend','tname');
 const a={name:'same',levels:3},b={name:'same',levels:4,isLover:true};
 const panel={allFriends:[],friendNumber:0,maxFriendNumber:5,nowPage:3,
  addRelation:(npc,val)=>{events.push(['relation',npc,val]);return false;},
  page:{setPage:()=>events.push('page')},upData:()=>events.push('count'),sortFriend:()=>events.push('sort'),showFriends:()=>events.push('show')};
 assert.equal(add.call(panel,a),true);assert.equal(panel.friendNumber,1);assert.equal(panel.maxPage,1);
 assert.deepEqual(events,[['relation',a,0],'page','count']);events.length=0;
 assert.equal(add.call(panel,a),false);assert.deepEqual(events,[]);
 assert.equal(add.call(panel,b),true);assert.equal(panel.friendNumber,2);
 events.length=0;assert.equal(remove.call(panel,'same'),true);assert.deepEqual(panel.allFriends,[a]);
 assert.equal(b.isLover,true);assert.equal(b.levels,4);assert.deepEqual(events,['page','sort','show']);
 assert.equal(remove.call(panel,'same'),true);assert.equal(panel.maxPage,0);assert.equal(panel.nowPage,3);
 assert.equal(remove.call(panel,'absent'),false);
 panel.allFriends=[a];panel.friendNumber=5;events.length=0;
 assert.equal(add.call(panel,a),false);assert.deepEqual(events,['capacity']);
 panel.friendNumber=4;assert.equal(add.call(panel,b),true);assert.equal(panel.friendNumber,2);
 panel.friendNumber=5;assert.equal(remove.call(panel,'same'),true);assert.equal(panel.friendNumber,4);
 assert.equal(panel.maxPage,Math.floor((panel.friendNumber+3)/rules.membership.pageSize));
});

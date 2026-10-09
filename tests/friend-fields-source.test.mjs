import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {FRIEND_FIELD_RULES as rules} from '../src/content/friend-field-rules.ts';
import {FRIEND_CAPACITY_RULES as capacity} from '../src/content/friend-capacity-rules.ts';
const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
test('friend capacity follows level boundaries and god override',()=>{
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+capacity.source,'utf8');
 const context=vm.createContext({_parent:{map:{role:{levels:31,roleGod:false}}},Math,upData:()=>{context.refreshes++;},refreshes:0});
 const fn=vm.runInContext('(function(lv)'+functionRange(source,'this.levelsUp = function(lv)').text+')',context);
 for(const [lv,expected] of [[0,1],[1,2],[10,2],[11,3],[120,13],[121,14],[150,14],[-20,-1],[undefined,5],[NaN,NaN]]){
  const before=context.refreshes;fn(lv);assert.equal(context.maxFriendNumber,expected);assert.equal(context.refreshes,before+1);
 }
 context._parent.map.role.roleGod=true;fn(1);assert.equal(context.maxFriendNumber,capacity.capacity.godCapacity);
 fn(NaN);assert.equal(context.maxFriendNumber,14);
 assert.deepEqual(capacity.capacity,{levelDivisor:10,extraSlots:1,maximum:14,godCapacity:14});
});
test('friend reward level total includes every entry without relationship filtering',()=>{
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+capacity.source,'utf8');
 const fn=vm.runInNewContext('(function()'+functionRange(source,'this.getAllLevels = function()').text+')');
 assert.equal(fn.call({allFriends:[]}),0);
 assert.equal(fn.call({allFriends:[{levels:2,isFriend:false},{levels:5,isLover:true},{levels:3,isIntimate:false}]}),10);
 const order=[];const friends=[1,2,3].map((level,index)=>({get levels(){order.push(index);return level;}}));
 assert.equal(fn.call({allFriends:friends}),6);assert.deepEqual(order,[2,1,0]);
});
test('friend constructor defaults preserve missing jobLevels and derive oldCmd from cmd',()=>{
 for(const [key,value] of Object.entries(rules.classFlags))assert.ok(text.includes(`var ${key} = ${value};`));
 const body=functionRange(text,'function FriendClass(target)').text.replace('super();','');
 const ctor=vm.runInNewContext('(function(target)'+body+')');
 const empty={};ctor.call(empty,{});for(const [key,val] of Object.entries(rules.defaults))assert.equal(empty[key],val);
 assert.equal(empty.jobLevels,undefined);assert.equal(empty.oldCmd,-1);
 const reused={jobLevels:4};ctor.call(reused,{cmd:7,jobLevels:undefined,levels:0,isFriend:false});assert.equal(reused.jobLevels,4);assert.equal(reused.oldCmd,7);
 const explicit={};ctor.call(explicit,{cmd:7,oldCmd:0,jobLevels:0});assert.equal(explicit.oldCmd,0);assert.equal(explicit.jobLevels,0);
 const flags={...rules.classFlags};ctor.call(flags,{isTask:true,isBest:true});assert.equal(flags.isTask,false);assert.equal(flags.isBest,false);
});
test('relation accessors impose no maximum clamp or implicit friendship change',()=>{
 const p={isFriend:false,setSecreteCode:v=>v,getSecreteCode:v=>v};
 for(const field of rules.encodedFields)Object.defineProperty(p,field,{get:vm.runInNewContext('(function()'+functionRange(text,`function get ${field}()`).text+')',{isNaN}),set:vm.runInNewContext('(function(val)'+functionRange(text,`function set ${field}(val)`).text+')',{isNaN})});
 p.maxRelation=10;p.relation=20;assert.equal(p.relation,20);assert.equal(p.isFriend,false);
 p.relation=NaN;assert.equal(p.relation,20);p.relation=-1.5;assert.equal(p.relation,-1.5);
});

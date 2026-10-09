import test from 'node:test';
import assert from 'node:assert/strict';
import {NpcReward,newRing} from '../src/domain/npc-reward.ts';
import {rewardOracle} from './source-reward-oracle.mjs';
const random=(seed:number)=>{let state=seed;return (n:number)=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);};};
for(const cmd of [3,4,5])test(`pack ${cmd-2}: cold inventory and every attribute vs frozen source`,()=>{
 for(const seed of [0,1,73,99999]){const modern=new NpcReward('玩家',random(seed)),source=rewardOracle(random(seed));assert.deepEqual(modern.bag,source.bag());assert.deepEqual(modern.pets,source.pets);
  modern.interact();source.interact();assert.equal(modern.words,source.scope.words);modern.choose(2);source.choose(2);assert.equal(modern.words,source.scope.words);assert.deepEqual(modern.answers,JSON.parse(JSON.stringify(source.scope.answer)));modern.choose(cmd);source.choose(cmd);
  assert.deepEqual(modern.bag,source.bag());assert.equal(modern.words,source.scope.words);assert.equal(modern.cmd,source.scope.myID.cmd);assert.equal(modern.nextCmd,source.scope.nextCmd);assert.deepEqual(modern.pets,source.pets);
 }
});
test('close/reopen at each stage and repeated/stale answers',()=>{
 const a=new NpcReward('玩家',()=>0),s=rewardOracle();for(const stage of [1,2]){a.interact();s.interact();if(stage===2){a.choose(2);s.choose(2);}a.close();s.close();a.interact();s.interact();assert.equal(a.words,s.scope.words);assert.equal(a.nextCmd,s.scope.nextCmd);}
 a.choose(2);const revision=a.revision;a.choose(3,revision);const before=a.snapshot();assert.equal(a.choose(3,revision),false);assert.equal(a.choose(4),false);assert.deepEqual(a.snapshot(),before);a.choose(-1);a.interact();assert.equal(a.cmd,6);assert.deepEqual(a.answers.map(a=>a.cmd),[7,-1]);assert.equal(a.choose(2),false);assert.equal(a.choose(3),false);
});
test('all packs with 0/1/2/4 free slots: ordered partial delivery, drops, consumed flag',()=>{
 for(const cmd of [3,4,5])for(const free of [0,1,2,4]){const a=new NpcReward('玩家',()=>0),s=rewardOracle();for(let i=4;i<40;i++){a.bag[i]=null;s.root.backPack['包格'+(i+1)].setThing({type:'空格'});}for(let i=4;i<40-free;i++){a.bag[i]={type:'测试占位',number:1,salePrice:0};s.root.backPack['包格'+(i+1)].setThing(a.bag[i]);}
 a.interact();s.interact();a.choose(2);s.choose(2);a.choose(cmd,a.revision,{x:277.8,y:421.6});s.choose(cmd);assert.deepEqual(a.bag,s.bag());assert.deepEqual(a.drops,JSON.parse(JSON.stringify(s.drops)));assert.deepEqual(a.messages,s.messages);assert.equal(a.cmd,6);assert(a.drops.every(d=>d.x===352.8&&d.y===446.6));a.interact();assert.equal(a.choose(cmd),false);}
});
test('stacking at 98/99, different names, first empty slot, full pet capacity does not block eggs',()=>{
 for(const count of [98,99]){const a=new NpcReward('玩家',()=>0),s=rewardOracle();const existing={type:'莎菲',number:count,salePrice:500};a.bag[4]=existing;s.root.backPack.包格5.setThing(existing);a.pets=Array.from({length:40},()=>({...a.pets[0]!}));for(let i=1;i<40;i++)s.pets.push({...s.pets[0]});a.interact();s.interact();a.choose(2);s.choose(2);a.choose(3);s.choose(3);assert.deepEqual(a.bag,s.bag());assert.equal(a.pets.length,40);}
 const a=new NpcReward('玩家',()=>0),s=rewardOracle();for(const item of [{type:'测试',name:'甲',number:98,salePrice:1},{type:'测试',name:'乙',number:5,salePrice:1},{type:'测试',name:'甲',number:3,salePrice:1}]){a.store(item);s.root.backPack.setThing({...item});}assert.deepEqual(a.bag,s.bag());
});
test('drop outside ground falls back to player, and map departure clears drops',()=>{const a=new NpcReward('玩家',()=>0);a.bag.fill({type:'占位',number:99,salePrice:0});a.store({type:'莎菲',number:1,salePrice:500},{x:10,y:20},()=>false);assert.deepEqual(a.drops[0],{x:10,y:20,item:{type:'莎菲',number:1,salePrice:500}});a.leaveMap();assert.deepEqual(a.drops,[]);assert.equal(a.open,false);});
test('ring selection stays unique and matches independent init function for many seeds',()=>{for(let seed=0;seed<120;seed++){const ring=newRing(random(seed)),s=rewardOracle(random(seed));assert.deepEqual({...ring,number:0},s.bag()[3]);assert.notEqual(ring.mainType1,ring.mainType2);assert.equal(new Set([ring.pairType1,ring.pairType2,ring.pairType3,ring.pairType4]).size,4);}});

test('one-time marker changes before the first delivery, matching source order',()=>{
 for(const cmd of [3,4,5]){const a=new NpcReward('玩家',()=>0),s=rewardOracle(),modern:number[]=[],original:number[]=[];const store=a.store.bind(a),sourceStore=s.root.backPack.setThing.bind(s.root.backPack);a.store=(item,...args)=>{modern.push(a.cmd);return store(item,...args);};s.root.backPack.setThing=(item:unknown)=>{original.push(s.scope.myID.cmd);return sourceStore(item);};a.interact();s.interact();a.choose(2);s.choose(2);a.choose(cmd);s.choose(cmd);assert.deepEqual(modern,original);assert(modern.length>0&&modern.every(value=>value===6));}
});

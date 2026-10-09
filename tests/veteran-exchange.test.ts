import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {NpcReward,type Item} from '../src/domain/npc-reward.ts';
import {pickUp} from '../src/domain/ground-items.ts';
import {rewardOracle} from './source-reward-oracle.mjs';
const source=JSON.parse(fs.readFileSync('docs/reverse-engineering/veteran-exchange/source-functions.json','utf8'));
const medal=(number?:number):Item=>({type:'勇士勋章',...(number===undefined?{}:{number}),salePrice:500});
function pair(bag:(Item|null)[]){
 const r=new NpcReward('玩家',()=>0);r.cmd=r.nextCmd=6;r.bag=structuredClone(bag);
 const o=rewardOracle(()=>0,source.functions);o.npc.myID.cmd=o.scope.nextCmd=6;
 for(let i=0;i<40;i++)o.root.backPack['包格'+(i+1)].setThing(bag[i]??{type:'空格'});
 // Source slots normalize missing number to zero.
 r.bag=r.bag.map(item=>item?{...item,number:item.number??0}:null);
 return {r,o};
}
test('exchange frozen AS/P-code provenance',()=>{for(const h of source.hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);});
test('source oracle exchange: insufficient, exact, repeated, cross-slot order, named mismatch and full capacity',()=>{
 const cases:(Item|null)[][]=[];
 for(const n of [0,1,2,3,4,8,99])for(const full of [false,true]){
  const bag:(Item|null)[]=Array.from({length:40},()=>full?{type:'英雄令',number:99}:null);bag[7]=n?medal(n):null;cases.push(bag);
 }
 for(const counts of [[1,1,5],[0,1,3],[undefined,1,2]]){const bag:(Item|null)[]=Array.from({length:40},()=>null);counts.forEach((n,i)=>bag[i*7]=medal(n));bag[2]={...medal(99),name:'不匹配'};cases.push(bag);}
 for(const boxCount of [98,99]){const bag:(Item|null)[]=Array.from({length:40},()=>({type:'英雄令',number:99}));bag[0]=medal(5);bag[4]={type:'宝石',name:'初级月光宝盒',number:boxCount,salePrice:500};cases.push(bag);}
 for(const bag of cases){const {r,o}=pair(bag);for(let repeat=0;repeat<3;repeat++){
  r.interact();o.interact();assert.equal(r.words,o.scope.words);assert.deepEqual(r.answers,JSON.parse(JSON.stringify(o.scope.answer)).filter((a:any)=>a.cmd!==8));
  const revision=r.revision;r.choose(7,revision,{x:277.8,y:421.6});o.choose(7);
  assert.deepEqual(r.bag,o.bag());assert.deepEqual(r.drops,o.drops);assert.deepEqual(r.messages,o.messages);assert.equal(r.open,o.scope.open);assert.equal(r.nextCmd,o.scope.nextCmd);
  if(r.open){assert.equal(r.words,o.scope.words);assert.deepEqual(r.answers,JSON.parse(JSON.stringify(o.scope.answer)));}
  const state=r.snapshot();assert.equal(r.choose(7,revision),false);assert.deepEqual(r.snapshot(),state);r.close();o.close();
 }}
});
test('first claim, reopen, stale answers, map cleanup and fresh state',()=>{
 const r=new NpcReward('玩家',()=>0);r.interact();assert.equal(r.choose(7),false);r.choose(2);r.choose(4);r.choose(-1);r.interact();const rev=r.revision;r.close();assert.equal(r.choose(7,rev),false);r.interact();r.choose(7);assert.equal(r.cmd,6);assert.equal(r.open,false);assert.equal(r.messages.at(-1),'获得初级月光宝盒');
 r.interact();const before=r.snapshot();r.leaveMap();assert.equal(r.choose(7),false);assert.deepEqual(r.bag,before.bag);r.interact();assert.ok(r.answers.some(a=>a.cmd===7));const fresh=new NpcReward('玩家',()=>0);fresh.interact();assert.equal(fresh.cmd,1);assert.equal(fresh.bag.filter(i=>i?.name==='初级月光宝盒').length,4);
});
test('full-bag reward drop can be recovered exactly once after freeing a slot',()=>{
 const bag:(Item|null)[]=Array.from({length:40},()=>({type:'英雄令',number:99}));bag[0]=medal(3);const {r}=pair(bag);r.interact();r.choose(7);assert.equal(r.bag[0]!.number,1);assert.equal(r.drops.length,1);const d=r.drops[0]!;assert.equal(pickUp(r,d),false);r.bag[9]=null;assert.equal(pickUp(r,d),true);assert.deepEqual(r.bag[9],{type:'宝石',name:'初级月光宝盒',number:1,salePrice:500});assert.equal(pickUp(r,d),false);
});

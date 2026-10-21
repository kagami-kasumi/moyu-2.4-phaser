import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SwampArtisan,ARTISAN_RECIPES} from '../src/domain/swamp-artisan.ts';import {NpcReward} from '../src/domain/npc-reward.ts';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/swamp-artisan/source-fixture.json'));
const account=vm.runInNewContext('(function(tThing)'+f.functions.accountThing+')'),use=vm.runInNewContext('(function(tThing,tNumber)'+f.functions.useThing+')');
const names=['灵魂晶石','魔魂晶石','幻魔晶石','魔魂之心','幻魔之心','小元素石','初级月光宝盒','灵魂王'];
function compare(command,bag,level,credit){
 const pack={number:40,accountThing:account,useThing:use},expected=[];
 for(let i=0;i<40;i++){const cell=structuredClone(bag[i]??{type:'空格'});cell.setThing=function(value){for(const key of Object.keys(this))if(key!=='setThing')delete this[key];Object.assign(this,value);};pack['包格'+(i+1)]=cell;}
 const parent={backPack:pack,map:{goods:{throwGoods(x,y,item){expected.push(JSON.parse(JSON.stringify(item)));}}}};pack.setThing=item=>{expected.push(JSON.parse(JSON.stringify(item)));return true;};
 parent.createThing=vm.runInNewContext('(function(tThing,isDrop,fX,fY)'+f.factory+')').bind(parent);
 const messages=[],role={levels:level,xxx_credit:credit,myName:'合成'},context=vm.createContext({_parent:{role,_parent:parent},myID:{cmd:10100},_global:{sysMsg:{addMsg:message=>messages.push(message)}}});
 vm.runInContext('(function(cmd){switch(cmd){'+f.commands[command]+'}})',context).call(context,command);
 const r=new NpcReward('合成',()=>0,'战士',undefined,undefined,false);r.bag=structuredClone(bag);r.credit=credit;const actual=[];r.store=item=>{actual.push(JSON.parse(JSON.stringify(item)));};
 const s=new SwampArtisan(r,()=>level,()=>true,()=>({x:100,y:200}),()=>true);s.interact();const revision=s.revision;s.craft(command);assert.equal(s.craft(command,revision),false);
 assert.deepEqual(actual,expected,'factory '+command);assert.equal(r.credit,role.xxx_credit);
 const expectedBag=Array.from({length:40},(_,i)=>{const cell=pack['包格'+(i+1)];return cell.type==='空格'?null:JSON.parse(JSON.stringify(cell));});assert.deepEqual(r.bag,expectedBag,'materials '+command);
 const expectedMessage=messages.at(-1)??context.words?.trim();assert.equal(s.feedback,expectedMessage,'message '+command);return actual;
}
test('all seven recipes execute independently frozen source, including level/credit/material precedence and factory fields',()=>{
 for(let command=10101;command<=10107;command++)for(const level of [99,100])for(const credit of [0,1])for(const count of [0,1,2,3,4,5,10,11,99]){
  const bag=Array(40).fill(null);if(count)names.forEach((name,i)=>bag[i]={type:'宝石',name,number:count});compare(command,bag,level,credit);
 }
 const context=vm.createContext({_parent:{role:{myName:'合成'}}});vm.runInContext('(function(){switch(10100){'+f.commands[10100]+'}})',context)();assert.deepEqual(Array.from(context.answer,a=>a.cmd),[...ARTISAN_RECIPES.map(r=>r.cmd),-1]);
});
test('source slot order, zero/missing counts and unnamed legacy overlapping materials remain exact',()=>{
 for(let command=10101;command<=10107;command++)for(const count of [undefined,0,1,4,10,99]){
  const bag=Array(40).fill(null);bag[0]={type:'宝石',...(count===undefined?{}:{number:count})};names.forEach((name,i)=>bag[i+1]={type:'宝石',name,number:i%2?5:2});compare(command,bag,100,5);
 }
});

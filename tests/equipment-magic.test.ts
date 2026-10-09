import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {EquipmentSockets} from '../src/domain/equipment-sockets.ts';
import {NpcReward,rewardEquipment,newRing,type Item} from '../src/domain/npc-reward.ts';
import {Inventory} from '../src/domain/inventory.ts';
import {initialWarriorVitals} from '../src/domain/hud.ts';
import {pickUp} from '../src/domain/ground-items.ts';
import {rewardOracle} from './source-reward-oracle.mjs';
const source=JSON.parse(fs.readFileSync('docs/reverse-engineering/equipment-magic/source-functions.json','utf8'));
const inventorySource=JSON.parse(fs.readFileSync('docs/reverse-engineering/inventory/source-functions.json','utf8'));
const clean=(v:any)=>JSON.parse(JSON.stringify(v));
const gem=(name='魔魂之心',number=1):Item=>({type:'宝石',name,number,salePrice:name==='魔魂之心'?150:10});
function oracle(item:Item,stone:Item){
 const r=rewardOracle(()=>0),scope={Math,isNaN,_global:{playSound(){},sysMsg:{addMsg:(s:string)=>r.messages.push(s)}}};
 const fn=(key:string,args='')=>vm.runInNewContext('(function('+args+')'+source.functions[key]+')',scope);
 const slot=(v:Item)=>({...v,setThing(next:Item){for(const k of Object.keys(this))if(typeof (this as any)[k]!=='function')delete (this as any)[k];Object.assign(this,next);}});
 const forge:any={_parent:r.root,item:slot(item),stone:slot(stone),makeItem:fn('makeItem'),useGem:fn('useGem','useNme'),flashInfo(){}};
 forge.item.upData=()=>r.root.upDataWeapon(forge.item);
 return {r,forge,normalize:(v:Item)=>{r.root.upDataWeapon(v);return v;},yes:()=>fn('yes').call({_parent:forge}),item:()=>clean(forge.item),stone:()=>forge.stone.type==='空格'?null:clean(forge.stone)};
}
test('magic frozen AS/P-code hashes and source branch expectations',()=>{
 for(const h of source.hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);
});
test('four types × grades 2/5/6 × 0/18/19/37/38/49/50 × both materials × counts match independent full source',()=>{
 let count=0;
 for(const gear of rewardEquipment())for(const grade of [2,5,6])for(const mhdj of [0,18,19,37,38,49,50])for(const name of ['魔魂晶石','魔魂之心'])for(const number of [0,1,(mhdj+1)*2-1,(mhdj+1)*2,150]){
  const item={...gear,grade,mhdj,holes:2,hole1:'高级攻击宝石',gem1:12,element:5,wind:900,additional:2,spirit:1,spiritVal:7},stone=gem(name,number),o=oracle(item,stone);o.normalize(item);Object.assign(o.forge.item,item);
  const r=new NpcReward('玩家'),s=new EquipmentSockets(r);s.item={...item};s.stone={...stone};s.show();o.yes();
  const success=o.item().mhdj!==mhdj;assert.equal(s.forgeMagic(),success,`${gear.type}/${grade}/${mhdj}/${name}/${number}`);assert.deepEqual(s.item,o.item());assert.deepEqual(s.stone,o.stone());assert.deepEqual(r.messages,o.r.messages);count++;
 }
 assert.equal(count,840);
});
test('invalid targets/materials, absent slots and stale or closed operations preserve ownership',()=>{
 for(const item of [newRing(()=>0),{type:'幸运符',grade:0,luckLevels:0},{type:'英雄令'},null]){
  const s=new EquipmentSockets(new NpcReward('玩家'));s.item=item;s.stone=gem();s.show();const before=clean([s.item,s.stone]);assert.equal(s.forgeMagic(),false);assert.deepEqual([s.item,s.stone],before);
 }
 const s=new EquipmentSockets(new NpcReward('玩家'));s.item=rewardEquipment()[0]!;s.show();for(const stone of [null,gem('灵魂晶石'),{...gem(),type:'英雄令'}]){s.stone=stone;const before=clean([s.item,s.stone]);assert.equal(s.forgeMagic(),false);assert.deepEqual([s.item,s.stone],before);}
 s.stone=gem('魔魂之心',2);const rev=s.revision;assert.ok(s.forgeMagic(rev));const after=s.snapshot();assert.equal(s.forgeMagic(rev),false);assert.deepEqual(s.snapshot(),after);s.close();const held=s.snapshot();assert.equal(s.forgeMagic(),false);assert.deepEqual(s.snapshot(),held);s.show();assert.ok(s.forgeMagic());assert.equal(s.stone,null);
});
test('replacement, stale selections/takes, closed holding and full bag recovery preserve strengthened item/material exactly once',()=>{
 const r=new NpcReward('玩家'),s=new EquipmentSockets(r);r.bag=Array(40).fill(null);r.bag[0]=rewardEquipment()[0]!;r.bag[1]=gem('魔魂之心',10);r.bag[2]=gem('魔魂晶石',30);s.show();s.select(0,r.bag[0]!);const rev=s.revision;s.select(1,r.bag[1]!);assert.equal(s.select(2,r.bag[2]!,rev),false);assert.ok(s.forgeMagic());s.select(2,r.bag[2]!);assert.equal(r.bag.find(i=>i?.name==='魔魂之心')!.number,9);assert.ok(s.forgeMagic());const held=clean(s.item);assert.equal(held.mhdj,11);assert.equal(s.stone!.number,8);
 s.close();assert.equal(s.take('item'),false);s.show();assert.deepEqual(s.item,held);r.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));const takeRev=s.revision;assert.ok(s.take('item',takeRev,{x:200,y:300},()=>false));assert.equal(s.take('item',takeRev),false);assert.equal(r.drops.length,1);assert.deepEqual(r.drops[0]!.item,{...held,number:0});r.bag[8]=null;assert.ok(pickUp(r,r.drops[0]!));assert.deepEqual(r.bag[8],{...held,number:0});assert.ok(s.take('stone'));assert.equal(s.stone,null);assert.equal(r.drops[0]!.item.number,8);
});
test('source equipment attribute aggregation after taking and equipping all four magic-enhanced kinds',()=>{
 const r=new NpcReward('玩家'),inv=new Inventory(r,initialWarriorVitals()),s=new EquipmentSockets(r);r.bag=Array(40).fill(null);s.show();
 const sourceFn=(name:string)=>vm.runInNewContext('(function()'+inventorySource.functions[name]+')',{Math});
 const eq:any={init:sourceFn('equipmentInit'),role:{flashAttribute(){}},flashPic(){}};for(const type of ['武器','衣服','头盔','鞋','戒指','幸运符'])eq[type]={type:'空格'};
 for(const gear of rewardEquipment()){
  r.bag[0]=gear;s.select(0,gear);s.stone=gem('魔魂之心',20);assert.ok(s.forgeMagic());s.take('item');assert.ok(inv.use(0,r.bag[0]!));eq[gear.type]=inv.equipment[gear.type as keyof typeof inv.equipment];
 }
 eq.allItem=['头盔','衣服','武器','鞋'].map(k=>eq[k]);sourceFn('equipmentStats').call(eq);
 assert.equal(inv.stats().equipmentFire,eq.attackFire);assert.equal(inv.stats().equipmentFire,13);assert.equal(inv.stats().roleFire,34);
 const role:any={levels:1,rateLife:15,rateMp:5,rateMinAttack:.2,rateMaxAttack:1.8,rateDefense:.3,skillLife:0,skillMp:0,init(){for(const k of ['burst','jook','moreMinAttack','moreMaxAttack','moreDefense','reduceDamage','moreExp','moreLife','moreMp','wind','soil','fire','water','renew','attackFire'])this[k]=0;},get maxLife(){return this.xxx_maxLife;},_parent:{_parent:{equipment:{...eq,flashView(){}},roleAtrribute:{flashView(){}},fireDetail:{flashView(){}},battleHuanShouPanel1:{},battleHuanShouPanel2:{},battleHuanShouPanel3:{}}}};
 const formula=inventorySource.functions.roleStats.slice(0,inventorySource.functions.roleStats.indexOf('      var _loc3_;'))+'}';vm.runInNewContext('(function()'+formula+')',{Math}).call(role);
 for(const key of ['minAttack','maxAttack','defense','maxLife','maxMp'] as const)assert.equal(inv.stats()[key],role[key]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {EquipmentSockets,SOCKET_BOXES} from '../src/domain/equipment-sockets.ts';
import {NpcReward,rewardEquipment,newRing,type Item} from '../src/domain/npc-reward.ts';
import {Inventory} from '../src/domain/inventory.ts';
import {initialWarriorVitals} from '../src/domain/hud.ts';
import {pickUp} from '../src/domain/ground-items.ts';
import {rewardOracle} from './source-reward-oracle.mjs';
const source=JSON.parse(fs.readFileSync('docs/reverse-engineering/equipment-sockets/source-functions.json','utf8'));
const clean=(value:any)=>JSON.parse(JSON.stringify(value));
function oracle(item:Item,stone:Item){
 const r=rewardOracle(()=>0),scope={Math,isNaN,_global:{playSound(){},sysMsg:{addMsg:(s:string)=>r.messages.push(s)}}};
 const fn=(key:string,args='')=>vm.runInNewContext('(function('+args+')'+source.functions[key]+')',scope);
 const slot=(v:Item)=>{const s:any={...v,setThing(next:Item){for(const k of Object.keys(this))if(typeof this[k]!=='function')delete this[k];Object.assign(this,next);}};return s;};
 const forge:any={_parent:r.root,item:slot(item),stone:slot(stone),makeItem:fn('makeItem'),useGem:fn('useGem','useNme'),setThing:fn('setThing','target'),flashInfo(){},closePanel:fn('closePanel')};
 forge.item.upData=()=>r.root.upDataWeapon(forge.item);
 return {r,forge,yes:()=>fn('yes').call({_parent:forge}),item:()=>clean(forge.item),stone:()=>forge.stone.type==='空格'?null:clean(forge.stone)};
}
const box=(name:string,number=1):Item=>({type:'宝石',name,number,salePrice:500});
test('sockets AS/P-code hashes stay tied to original evidence',()=>{for(const h of source.hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);});
test('four armor kinds × three boxes × hole preconditions × material counts match full source make/update',()=>{
 for(const gear of rewardEquipment())for(const name of SOCKET_BOXES)for(const holes of [0,1,2,3])for(const count of [0,1,2,99]){
  const item={...gear,holes},stone=box(name,count),o=oracle(item,stone),r=new NpcReward('玩家'),s=new EquipmentSockets(r);s.item={...item};s.stone={...stone};s.show();o.yes();const expectedSuccess=o.item().holes!==holes;assert.equal(s.forge(),expectedSuccess);assert.deepEqual(s.item,o.item());assert.deepEqual(s.stone,o.stone());assert.deepEqual(r.messages,o.r.messages);
 }
});
test('ring, charm, unsupported material, empty slots and stale forge cannot consume or mutate',()=>{
 for(const item of [newRing(()=>0),{type:'幸运符',grade:0,luckLevels:0,holes:0}])for(const name of SOCKET_BOXES){const o=oracle(item,box(name));o.yes();assert.deepEqual(o.item(),item);assert.deepEqual(o.stone(),box(name));const s=new EquipmentSockets(new NpcReward('玩家'));s.item={...item};s.stone=box(name);s.show();assert.equal(s.forge(),false);assert.deepEqual(s.item,item);assert.deepEqual(s.stone,box(name));}
 const r=new NpcReward('玩家'),s=new EquipmentSockets(r);s.show();assert.equal(s.forge(),false);s.item=rewardEquipment()[0]!;s.stone=box('灵魂晶石');const before=clean(s.item);assert.equal(s.forge(),false);assert.deepEqual(s.item,before);s.stone=box(SOCKET_BOXES[0]);const revision=s.revision;assert.ok(s.forge(revision));const after=s.snapshot();assert.equal(s.forge(revision),false);assert.deepEqual(s.snapshot(),after);
});
test('selection ownership, replacement, close/reopen, take and full drop recovery preserve items once',()=>{
 const r=new NpcReward('玩家',()=>0),s=new EquipmentSockets(r);r.bag=Array(40).fill(null);const [first,second]=rewardEquipment();r.bag[0]=first!;r.bag[1]=second!;r.bag[2]=box(SOCKET_BOXES[0],2);s.show();let rev=s.revision;assert.ok(s.select(0,first!,rev));assert.equal(r.bag[0],null);assert.equal(s.select(1,second!,rev),false);assert.ok(s.select(1,second!));assert.deepEqual(r.bag[0],{...first,number:0});assert.deepEqual(s.item,second);assert.ok(s.select(2,r.bag[2]!));
 const oldStone={...s.stone!};r.bag[3]=box(SOCKET_BOXES[1]);assert.ok(s.select(3,r.bag[3]!));assert.deepEqual(r.bag[1],oldStone);s.close();const held=s.snapshot();assert.equal(s.take('item'),false);assert.equal(s.forge(),false);s.show();assert.deepEqual(s.item,held.item);assert.deepEqual(s.stone,held.stone);
 r.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));rev=s.revision;assert.ok(s.take('item',rev,{x:200,y:300},()=>false));assert.equal(s.take('item',rev),false);assert.equal(s.item,null);assert.equal(r.drops.length,1);assert.deepEqual(r.drops[0],{item:{...second,number:0},x:200,y:300});r.bag[8]=null;assert.ok(pickUp(r,r.drops[0]!));assert.deepEqual(r.bag[8],{...second,number:0});
 const o=oracle(second!,box(SOCKET_BOXES[0]));o.forge.closePanel();assert.equal(o.forge.isOpen,false);assert.deepEqual(o.item(),second);assert.deepEqual(o.stone(),box(SOCKET_BOXES[0]));
});
test('three sockets preserve combat attributes, re-equipped holes add source battle power',()=>{
 const r=new NpcReward('玩家'),inv=new Inventory(r,initialWarriorVitals()),s=new EquipmentSockets(r),gear=rewardEquipment()[0]!;r.bag=Array(40).fill(null);r.bag[0]=gear;inv.use(0,gear);const base=inv.stats();inv.unequip('武器',inv.equipment.武器);s.show();s.select(0,r.bag[0]!);
 for(const name of SOCKET_BOXES){s.stone=box(name);assert.ok(s.forge());}
 assert.equal(s.item!.salePrice,10734);assert.equal(s.item!.holes,3);assert.equal(s.item!.hole3,0);assert.equal(s.item!.minAttack,gear.minAttack);s.take('item');inv.use(0,r.bag[0]!);assert.equal(inv.stats().roleFire,base.roleFire+3);assert.equal(inv.stats().minAttack,base.minAttack);assert.equal(inv.stats().maxLife,base.maxLife);
});
test('source setThing replacement and notice return the original slot before assigning the replacement',()=>{
 const r=new NpcReward('玩家',()=>0),s=new EquipmentSockets(r),gear=rewardEquipment(),o=oracle(gear[0]!,box(SOCKET_BOXES[0],3));r.bag=Array(40).fill(null);s.item={...gear[0]!};s.stone=box(SOCKET_BOXES[0],3);s.show();
 for(let i=1;i<=40;i++)o.r.root.backPack['包格'+i].setThing({type:'空格'});
 for(const item of [gear[1]!,box(SOCKET_BOXES[1],2)]){r.bag[9]={...item};assert.ok(s.select(9,r.bag[9]!));o.forge.setThing(item);assert.deepEqual(r.bag,o.r.bag());assert.deepEqual(s.item,o.item());assert.deepEqual(s.stone,o.stone());}
 const notice=vm.runInNewContext('(function(child)'+source.functions.notice+')');o.r.root.backPack.setThing(o.forge.item);notice.call(o.forge,o.forge.item);s.take('item');assert.deepEqual(r.bag,o.r.bag());assert.equal(o.forge.item.type,'空格');assert.equal(s.item,null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {NpcReward,rewardEquipment,type Item,type Drop} from '../src/domain/npc-reward.ts';
import {pickUp,autoPickUp,groundItemName} from '../src/domain/ground-items.ts';
import {Inventory} from '../src/domain/inventory.ts';
import {initialWarriorVitals} from '../src/domain/hud.ts';
const source=JSON.parse(fs.readFileSync('docs/reverse-engineering/ground-items/source-functions.json','utf8'));
// Independent source execution with only display/property adapters substituted.
function oracle(items:(Item|null)[],drops:Drop[]){
 const messages:string[]=[],scope:any={Math,isNaN,_global:{gradeName:['','良品','上品','精品','极品','神品','上神品'],sysMsg:{addMsg:(m:string)=>messages.push(m)}},removeMovieClip:(d:any)=>d._visible=false};
 const fn=(name:string,args='')=>vm.runInNewContext('(function('+args+')'+source.functions[name]+')',scope);
 const bag:any={number:40,setThing:fn('setThing','target'),accountThing:fn('accountThing','tThing')};
 const data=(s:any)=>Object.fromEntries(Object.entries(s).filter(([k,v])=>!['maxNum','room'].includes(k)&&typeof v!=='function'));
 for(let i=0;i<40;i++){const slot:any={maxNum:99,get room(){return this.number>0?this.maxNum-this.number:0;},addNumber:fn('addNumber','val'),setThing(t:Item){for(const k of Object.keys(this))if(!['maxNum','room','addNumber','setThing'].includes(k))delete this[k];Object.assign(this,Object.fromEntries(Object.entries(t).filter(([k,v])=>!k.startsWith('_')&&['string','number'].includes(typeof v))));this.number=t.number??0;}};slot.setThing(items[i]??{type:'空格'});bag['包格'+(i+1)]=slot;}
 const goods:any={allGoods:[],autoPickUp:fn('autoPickUp','toX,toY'),clearGoods:fn('clearGoods')};
 goods.allGoods=drops.map(d=>{const obj:any={...d.item,_x:d.x,_y:d.y,_visible:true,thingName:{text:''},_parent:{_parent:{_parent:{backPack:bag}}},pickUp:fn('pickUp'),onRelease:fn('onRelease'),removeMovieClip(){this._visible=false;}};fn('flashPic').call(obj);return obj;});
 return {goods,messages,bag:()=>Array.from({length:40},(_,i)=>{const s=bag['包格'+(i+1)];return s.type==='空格'?null:data(s);}),remaining:()=>goods.allGoods.filter((d:any)=>d._visible).map((d:any)=>d.thingName.text)};
}
const make=()=>{const r=new NpcReward('玩家',()=>0);r.bag=Array.from({length:40},()=>null);return r;};
test('ground AS/P-code hashes and root space branch are independently frozen',()=>{for(const h of source.hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);assert.match(source.spaceKey,/autoPickUp\(this.map.role._x,this.map.role._y\)/);});
test('click source oracle: full-but-stackable gate, partial stacks, first empty, distant gear attributes and repeated click',()=>{
 for(const full of [false,true])for(const number of [1,5,110]){
  const r=make();r.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));r.bag[0]={type:'宝石',name:'灵魂晶石',number:97};if(!full)r.bag[7]=null;
  const d:Drop={item:{type:'宝石',name:'灵魂晶石',number,salePrice:100},x:900,y:900};r.drops=[d];const o=oracle(r.bag,r.drops);o.goods.allGoods[0].onRelease();assert.equal(pickUp(r,d),!full);assert.deepEqual(r.bag,o.bag());assert.deepEqual(r.messages,o.messages);assert.equal(r.drops.length,o.remaining().length);if(!full)assert.equal(pickUp(r,d),false);
 }
 const r=make(),d={item:rewardEquipment()[0]!,x:10000,y:-10000};r.drops=[d];const o=oracle(r.bag,r.drops);o.goods.allGoods[0].onRelease();pickUp(r,d);assert.deepEqual(r.bag,o.bag());assert.deepEqual(r.messages,o.messages);assert.deepEqual(r.bag[0],{...d.item,number:0});
});
test('shortcut source oracle: strict signed boundaries, newest first, capacity failure continues, repeated presses',()=>{
 for(const free of [1,2,40]){
  const r=make();for(let i=free;i<40;i++)r.bag[i]={type:'英雄令',number:99};
  r.drops=[[0,0],[100,0],[-100,0],[0,50],[0,-50],[99.99,49.99],[-99.99,-49.99],[0,0]].map(([x,y],i)=>({item:{type:'戒指',name:'戒指'+i,attack:i},x:x!,y:y!}));
  const o=oracle(r.bag,r.drops);o.goods.autoPickUp(0,0);assert.equal(autoPickUp(r,0,0),Math.min(free,4));assert.deepEqual(r.bag,o.bag());assert.deepEqual(r.messages,o.messages);assert.deepEqual(r.drops.map(d=>groundItemName(d.item)),o.remaining());
  o.goods.autoPickUp(0,0);autoPickUp(r,0,0);assert.deepEqual(r.bag,o.bag());assert.deepEqual(r.messages,o.messages);
 }
});
test('invalid, cloned and cleared drop identities cannot mutate inventory; source clear removes all',()=>{
 const r=make(),d:Drop={item:{type:'英雄令',number:1},x:0,y:0};r.drops=[d];const o=oracle(r.bag,r.drops);
 assert.equal(pickUp(r,{...d}),false);for(const type of ['', '空格','技能图标']){const bad={...d,item:{type}};r.drops.push(bad);assert.equal(pickUp(r,bad),false);}
 o.goods.clearGoods();r.leaveMap();assert.equal(pickUp(r,d),false);assert.deepEqual(o.remaining(),[]);assert.deepEqual(r.drops,[]);assert.ok(r.bag.every(s=>s===null));
});
test('pickup names match source flashPic for all label branches',()=>{
 for(const type of ['头盔','衣服','武器','鞋','幸运符','庇护铃铛','翡翠铃铛','凤翼铃铛','戒指','技能书','药品','宝石','英雄令'])for(let grade=0;grade<7;grade++){
  const d={item:{type,grade,name:'名称'},x:0,y:0};const o=oracle(make().bag,[d]);assert.equal(groundItemName(d.item),o.remaining()[0]);
 }
});
test('full-bag replacement drops the old gear and pickup preserves every attribute once',()=>{
 const r=make(),inv=new Inventory(r,initialWarriorVitals()),old=rewardEquipment()[0]!,fresh={...old,name:'替换武器',holes:2,gem1:3};
 r.bag[0]=old;inv.use(0,old);r.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));r.bag[5]=fresh;inv.use(5,fresh,{x:100,y:200});
 assert.deepEqual(inv.equipment.武器,fresh);assert.equal(r.bag[5],null);const d=r.drops[0]!;assert.deepEqual(d.item,{...old,number:0});assert.ok(pickUp(r,d));assert.deepEqual(r.bag[5],{...old,number:0});assert.equal(pickUp(r,d),false);assert.equal(r.drops.length,0);
});

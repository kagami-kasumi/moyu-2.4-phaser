import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {itemSaleValue} from '../src/content/item-numeric-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';const source=fs.readFileSync(root+'frame_9/DoAction.as','utf8');
const compile=(text,marker,args='',globals={})=>vm.runInNewContext('(function('+args+')'+functionRange(text,marker).text+')',globals);
const slot=data=>({...data,setThing(next){for(const k of Object.keys(this))if(k!=='setThing')delete this[k];Object.assign(this,next)}});
test('bell grade two/four, purity equality and random endpoints have independent source expectations',()=>{
 for(const type of ['凤翼铃铛','翡翠铃铛','庇护铃铛'])for(const roll of [0,1]){
  const make=compile(source,'this.makeBell.makeItem =','',{random:()=>roll});
  const x={item1:slot({type,grade:1,pure:2,skill:0}),item2:slot({type,grade:1,pure:2})};
  assert.equal(make.call(x),true);assert.equal(x.item1.grade,2);assert.equal(x.item1.pure,4);assert.equal(x.item2.type,'空格');
  const choices={'凤翼铃铛':[3,1],'翡翠铃铛':[2,1],'庇护铃铛':[3,2]};assert.equal(x.item1.attributeType2,choices[type][roll]);
  x.item1.grade=3;x.item1.pure=8;x.item2=slot({type,grade:3,pure:8});assert.equal(make.call(x),true);
  assert.equal(x.item1.skill,roll+1);assert.equal(x.item1.pure,16);assert.notEqual(x.item1.attributeType3,x.item1.attributeType2);
  x.item2=slot({type,grade:4,pure:16});assert.equal(make.call(x),false);
 }
 const make=compile(source,'this.makeBell.makeItem =','',{random:()=>1});const x={item1:slot({type:'凤翼铃铛',grade:3,pure:9,skill:0}),item2:slot({type:'凤翼铃铛',grade:3,pure:8})};make.call(x);assert.equal(x.item1.skill,0,'17 is not 16');
});
test('gem fusion uses pre-increment bounds and exact credit charge; split fees depend on occupied slot index',()=>{
 const role={xxx_credit:10};const fuse=compile(source,'this.castleStone.beginRefine =','',{_root:{map:{role}},_global:{sysMsg:{addMsg(){}}}});
 for(const [name,value,expected]of [['高级攻击宝石',24,26],['高级经验宝石',34,36],['高级减伤害宝石',12,13],['高级战斗力宝石',8,9]]){
  const x={stone1:slot({type:'宝石',name,val1:value}),stone2:slot({type:'宝石',name,val1:5})};assert.equal(fuse.call(x),true);assert.equal(x.stone1.val1,expected);assert.equal(x.stone2.type,'空格');
 }
 assert.equal(role.xxx_credit,8);role.xxx_credit=7;const x={stone1:slot({type:'宝石',name:'高级战斗力宝石',val1:14}),stone2:slot({type:'宝石',name:'高级战斗力宝石',val1:5})};assert.equal(fuse.call(x),false);assert.equal(x.stone2.type,'宝石');
 const info=compile(source,'this.splitStone.flashInfo =');for(let mask=1;mask<8;mask++){const item={type:'武器',holes:3,hole1:mask&1?1:0,hole2:mask&2?1:0,hole3:mask&4?1:0};const p={item,needPrice:{}};info.call(p);assert.equal(p.price,(mask&1?10:0)+(mask&2?100:0)+(mask&4?1000:0));}
});
test('sale rounding and nonpositive quantity agree with source rather than UI text alone',()=>{
 const text=fs.readFileSync(root+'DefineSprite_2089_幻兽商店/frame_1/DoAction.as','utf8');const sell=compile(text,'this.setThing =','target',{_global:{playSound(){}}});
 for(const price of [1,3,10,11])for(const number of [-1,0,1,2,99]){const role={xxx_ms:0};const target=slot({type:'宝石',salePrice:price,number});assert.equal(sell.call({_parent:{map:{role}}},target),true);assert.equal(role.xxx_ms,itemSaleValue(price,number));}
});
test('super experience ball at cap still consumes; energy potion at cap does not',()=>{
 const text=fs.readFileSync(root+'DefineSprite_4591/frame_1/DoAction.as','utf8');const xp={maxPower:5,maxTopPower:5};const use=compile(text,'this.setThing =','target',{_root:{XPPower:xp},_global:{sysMsg:{addMsg(){}}}});
 const role={expBallNum:10,levels:10,moreExpFire:0,moreExpLife:0,moreExpMp:0,moreExpAttack:0,moreExpDefense:0,flashAttribute(){}};
 let item={type:'超级经验球',number:2};assert.equal(use.call({role},item),false);assert.equal(item.number,1);assert.equal(role.moreExpFire,0);
 role.levels=11;assert.equal(use.call({role},item),true);assert.equal(role.expBallNum,11);for(const f of ['moreExpFire','moreExpLife','moreExpMp','moreExpAttack','moreExpDefense'])assert.equal(role[f],2);
 item={type:'能量药水',number:2};assert.equal(use.call({role},item),false);assert.equal(item.number,2);
});
test('equipment source anomaly stays visible and normal aggregation preserves rings and matching elements',()=>{
 const pcode=fs.readFileSync('local-resources/moyu/source-index/pcode/scripts/frame_9/DoAction.pcode','utf8');assert.match(pcode,/Push "thisallItem"\r?\nGetVariable/);
 const init=compile(source,'this.equipment.init =');const refresh=compile(source,'this.equipment.flashAttribute =');
 const allItem=Array.from({length:4},()=>({type:'武器',additional:0,spirit:0,wind:0,fire:0,water:0,soil:0,holes:0,grade:0,element:5,mhdj:3,minAttack:10,maxAttack:20}));
 const x={init,allItem,头盔:allItem[0],衣服:allItem[1],武器:allItem[2],鞋:allItem[3],幸运符:{type:'空格'},戒指:{type:'戒指',grade:0,mainType1:'moreAttack',mainType2:'moreDefense',moreAttack:5,moreDefense:15},role:{flashAttribute(){}},flashPic(){}};
 refresh.call(x);assert.equal(x.attackFire,16);assert.equal(x.moreMinAttack,30);assert.equal(x.moreDefense,55);assert.equal(x.minAttack,40);
 allItem[0].additional=1;assert.throws(()=>refresh.call(x),/thisallItem/,'JS oracle cannot decide AVM1 missing-path outcome; it must not silently fix source');
});

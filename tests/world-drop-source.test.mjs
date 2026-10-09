import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {dispatchWorldDrops,WORLD_DROP_CATEGORIES} from '../src/content/world-drop-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_4536/frame_1/DoAction.as','utf8');
const body=functionRange(source,'this.dropItem =').text;
test('every source category has an explicit dispatch policy; unknown category remains an error request',()=>{
 assert.deepEqual([...body.matchAll(/case "([^"]+)":/g)].map(m=>m[1]),[...WORLD_DROP_CATEGORIES]);
});
test('all dispatch calls, strict threshold endpoints and nested generator random ordering match source',()=>{
 for(const name of [...WORLD_DROP_CATEGORIES,'unknown'])for(const vocational of ['法师','战士','unknown'])for(const level of [undefined,null,0,150])for(const endpoint of [0,49,50,499,500,999,1000,1499,1500,1999,2000,2499,2500,3999,4000,4999,5000,5001,5999,6000,6999,7000,7499,7500,9999]){
  const role={levels:20,vocational};let a=0,b=0;const actual=[],expected=[];
  const rng=i=>((endpoint+i*17)%10000);const ar=n=>rng(a++)%n,br=n=>rng(b++)%n;
  dispatchWorldDrops(name,level,role,ar,event=>{actual.push(event);if(event.kind==='generator')ar(1000)});
  const map={role,_parent:{createThing(item,dropped,x,y){assert.equal(dropped,true);assert.equal(x,10);assert.equal(y,20);expected.push({kind:'item',name:item.type})}},goods:{throwGoods(x,y,item){expected.push({kind:'bell',name:item.name,grade:item.grade})}}};
  for(const g of ['dropNormalItem','dropStone','dropFlower','dropHSItem','dropMsBag','dropBossItem','dropBossStone','dropSuperBossItem'])map[g]=(x,y,level)=>{assert.equal(x,10);assert.equal(y,20);expected.push({kind:'generator',name:g,level});br(1000)};
  vm.runInNewContext('(function(mName,fX,fY,level)'+body+')',{role,random:br,trace(){},_global:{msg:{open(){expected.push({kind:'unknown-category'})}}}}).call(map,name,10,20,level);
  assert.deepEqual(actual,expected,JSON.stringify({name,vocational,level,endpoint}));assert.equal(a,b);
 }
});

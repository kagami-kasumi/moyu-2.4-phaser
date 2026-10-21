import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {functionRange} from '../tools/lib/as2-data.mjs';import {finaleChestDrops} from '../src/domain/finale-chest.ts';import {literalItem} from '../src/content/registry.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_4312/frame_1/DoAction_2.as','utf8'),script=new vm.Script('(function()'+functionRange(source,'function luckyBoss').text+')');
test('complete luckyBoss chest source dispatch: all branch slots, boundaries, override and synchronous placement RNG',()=>{
 const seen=new Set();
 for(const first of [0,1,2])for(const second of [0,1])for(const gate of [0,49,50,249,250,999])for(const slot of [0,1,2,3,4])for(const consume of [false,true]){
  const expected=[],actual=[],ec=[],ac=[];let ep=0,ap=0;const draw=(n,i)=>n===3?first:n===2?second:n===1000?gate:n===5?slot:i%n;
  const er=n=>{ec.push(n);return draw(n,ep++)},ar=n=>{ac.push(n);return draw(n,ap++)};
  script.runInNewContext({random:er,_X:123,_Y:321,_parent:{_parent:{createThing(item,drop,x,y){assert.equal(drop,true);assert.equal(x,123);assert.equal(y,321);expected.push(item.type==='宝石'?JSON.parse(JSON.stringify(item)):literalItem(item.type));if(consume)er(17);}}}})();
  finaleChestDrops(ar,item=>{seen.add(item.name??item.type);actual.push(item);if(consume)ar(17);});assert.deepEqual(actual,expected);assert.deepEqual(ac,ec);
 }
 assert.equal(seen.size,20);
});

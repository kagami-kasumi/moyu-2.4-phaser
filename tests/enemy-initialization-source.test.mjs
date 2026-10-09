import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {ENEMY_INITIALIZATION_RULES as rules} from '../src/content/enemy-initialization-rules.ts';
const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source.file,'utf8');
const body=functionRange(text,'this.initMonster =').text;
function run(begin,end,maximum=false,attackFire=0){
 const draws=[],root={};for(let i=1;i<=6;i++)root['monster'+i]={monsterName:{},monsterFire:{}};
 const fn=vm.runInNewContext('(function(beginNum,endNum,monster)'+body+')',{role:{attackFire:10},random:n=>{draws.push(n);return maximum?n-1:0;}});
 const seed={type:'fixture',myName:'fixture',xy:{x1:101,y1:201,x2:102,y2:202},levels:5,baseLevels:3,attack:2.5,defense:1.25,life:30,attackFire,attackLength:150,attackHeight:30};
 const result=fn.call(root,begin,end,seed);return {root,draws,result};
}
test('spawn slot boundaries retain relative coordinates and inclusive end limit',()=>{
 const {root,draws,result}=run(5,9);assert.equal(result,true);assert.equal(root.monster4.type,undefined);
 assert.equal(root.monster5._x,101);assert.equal(root.monster6._x,102);assert.equal(root.monster6._y,202);
 assert.deepEqual(draws,[20,10,2,20,10,2]);
 const empty=run(7,9);assert.equal(empty.result,true);assert.deepEqual(empty.draws,[]);
 assert.deepEqual(run(4,3).draws,[]);
});
test('initializer write formulas, random endpoints and display thresholds match source',()=>{
 for(const maximum of [false,true]){
  const m=run(1,1,maximum).root.monster1;
  assert.equal(m.minAttack,16);assert.equal(m.maxAttack,24);assert.equal(m.defense,10);assert.equal(m.maxLife,240);assert.equal(m.life,240);
  assert.equal(m.attackFire,10);assert.equal(m.attackLength,maximum?159:140);assert.equal(m.attackHeight,maximum?34:25);assert.equal(m.faceTo,maximum?'左':'右');
  assert.equal(m.monsterFire.textColor,rules.color.otherwise);assert.equal(m.isAlive,true);assert.equal(m.myTarget,undefined);
 }
 assert.equal(run(1,1,false,-5).root.monster1.monsterFire.textColor,rules.color.atLeastFiveLower);
 assert.equal(run(1,1,false,4).root.monster1.monsterFire.textColor,rules.color.otherwise);
 assert.equal(run(1,1,false,5).root.monster1.monsterFire.textColor,rules.color.atLeastFiveHigher);
});

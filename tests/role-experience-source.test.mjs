import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {ROLE_EXPERIENCE_RULES as rules} from '../src/content/role-experience-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source.file,'utf8');
test('crossing the cap consumes further thresholds despite rejected level increments',()=>{
 const scope={Math,isNaN,_global:{playSound(){}}};
 const compile=(name,args)=>vm.runInNewContext('(function('+args+')'+functionRange(source,name).text+')',scope);
 const role={xxx_maxLevels:150,xxx_nowExp:0,maxExp:50000,不要作弊468:149,roleGod:false,setSecreteCode:v=>v,getSecreteCode:v=>v,flashAttribute(){},升级光环:{gotoAndPlay(){}},_parent:{_parent:{friend:{levelsUp(){}}}}};
 Object.defineProperty(role,'levels',{get:compile('function get levels()',''),set:compile('function set levels(val)','val')});
 compile('function expUp(val)','val').call(role,150007);
 assert.equal(role.levels,150);assert.equal(role.xxx_nowExp,7);assert.equal(role.maxExp,50000);
});
test('experience threshold boundaries and god multiplier execute in post-increment order',()=>{
 const fn=vm.runInNewContext('(function(val)'+functionRange(source,'function expUp(val)').text+')',{Math,_global:{playSound(){}}});
 for(const level of [2,14,15,29,30,59,60,89,90,99,100,109,110,119,120,129,130,139,140,149,150])for(const god of [false,true]){
  let notices=0;
  const role={levels:level-1,roleGod:god,xxx_nowExp:0,maxExp:9,life:1,mp:1,maxLife:100,maxMp:50,flashAttribute(){},升级光环:{gotoAndPlay(){}},_parent:{_parent:{friend:{levelsUp:n=>{assert.equal(n,level);notices++;}}}}};
  fn.call(role,9);const band=rules.thresholds.find(b=>level<b.below);
  assert.equal(role.levels,level);assert.equal(role.maxExp,band?(band.fixed??Math.floor(level*band.multiplier))*(god?5:1):9);
  assert.equal(role.xxx_nowExp,0);assert.equal(role.life,100);assert.equal(role.mp,50);assert.equal(notices,1);
 }
});
test('dead roles still feed pets, capped overflow consumes failed ball grants, owned-map resources use rounded award',()=>{
 for(const alive of [false,true]){
  const pets=[],items=[];
  const parent={_parent:{createThing:i=>{items.push(i.type);return false;}}};for(let i=1;i<=3;i++)parent['huanShou'+i]={expUp:v=>pets.push(v)};
  const fn=vm.runInNewContext('(function(val)'+functionRange(source,'function priseExp(val)').text+')',{Math,isNaN,_global:{ownMap:true,sysMsg:{addMsg(){}}}});
  const role={isAlive:alive,levels:150,xxx_maxLevels:150,moreExp:50,overflowExp:4999,xxx_res:0,_parent:parent};
  assert.equal(fn.call(role,2),false);assert.deepEqual(pets,[3,3,3]);
  assert.equal(role.overflowExp,alive?2:4999);assert.equal(role.xxx_res,alive?60:0);assert.deepEqual(items,alive?['经验球']:[]);
  fn.call(role,NaN);assert.equal(pets.length,3);
 }
});

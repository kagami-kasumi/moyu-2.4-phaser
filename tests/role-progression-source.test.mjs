import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {ROLE_PROGRESSION_RULES as rules} from '../src/content/role-progression-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';
const source=fs.readFileSync(root+'__Packages/RoleMC.as','utf8');
const codec=fs.readFileSync(root+'__Packages/SecreteCodeMC.as','utf8');
function original(){
 const context=vm.createContext({isNaN,trace(){},SecreteCodeMC:{BASE:123456}});
 const compile=(text,marker,args='')=>vm.runInContext('(function('+args+')'+functionRange(text,marker).text+')',context);
 const x={SECRETECODE:-3,maxRredit:500,_parent:{_parent:{legion:{flashView(){}}}}};
 x.getSecreteCode=compile(codec,'function getSecreteCode(val)','val');x.setSecreteCode=compile(codec,'function setSecreteCode(val)','val');
 for(const p of ['xxx_maxLevels','levels','xxx_militaryRank','militaryRank','xxx_chaw','chaw','militaryExploit','exploit','job','xxx_credit','militaryRankFire','chawFire','jobFire','titleLevel','maxLevels','maxExp','xxx_nowExp','expBallNum'])Object.defineProperty(x,p,{get:compile(source,`function get ${p}()`),set:compile(source,`function set ${p}(val)`,'val')});
 return x;
}
test('original progression tables distinguish rank fire retention from nobility/job replacement',()=>{
 const x=original();
 for(const [i,row] of rules.nobility.entries()){x.xxx_chaw=i;assert.equal(x.chawName,row.name);assert.equal(x.chawFire+0,row.fire);}
 for(const [i,row] of rules.jobs.entries()){x.job=i;assert.equal(x.jobName,row.name);assert.equal(x.jobFire+0,row.fire);}
 x.militaryRankFire=37;
 for(let i=1;i<=10;i++){x.xxx_militaryRank=i;assert.equal(x.militaryRankName,rules.militaryRanks[i]);assert.equal(x.militaryRankFire,37);}
 x.xxx_militaryRank=11;assert.equal(x.militaryRank,11);assert.equal(x.militaryRankFire+0,0);
 x.xxx_chaw=99;assert.equal(x.chaw,99);assert.equal(x.chawFire+0,0);
 x.job=99;assert.equal(x.job,99);assert.equal(x.jobFire+0,0);
 x.militaryRank=4;assert.equal(x.militaryRank,11);
});
test('constructor progression seeds and debug-name branch are separate initialization stages',()=>{
 const x=original();
 const constructor=vm.runInNewContext('(function()'+functionRange(source,'function RoleMC()').text.replace(/\bsuper\(\);/,'')+')');
 constructor.call(x);
 for(const [field,value] of Object.entries({maxExp:9,xxx_nowExp:0,xxx_maxLevels:150,levels:1,militaryExploit:0,exploit:0,expBallNum:0}))assert.equal(x[field]+0,value,field);
 const start=fs.readFileSync(root+'DefineSprite_4536/frame_2/DoAction.as','utf8');
 const debug=vm.runInNewContext('(function()'+functionRange(start,'function debug()').text+')',{random:()=>0,_root:{upDataWeapon(){},backPack:{setThing(){}}}});
 x.myName='player';debug.call({role:x});assert.equal(x.levels,1);
 x.myName='DeBuG';debug.call({role:x});assert.equal(x.levels,100);assert.equal(x.maxExp,9);
 x.levels=120;debug.call({role:x});assert.equal(x.levels,120);
});
test('credit titles are monotonic until explicit restore; level setters reject rather than clamp current levels',()=>{
 const x=original();x.xxx_maxLevels=999;assert.equal(x.maxLevels,rules.maximumLevel);
 x.levels=150;x.levels=151;assert.equal(x.levels,150);x.xxx_maxLevels=10;assert.equal(x.levels,150);
 x.levels=-1;assert.equal(x.levels,-1);x.levels=NaN;assert.equal(x.levels,-1);
 for(const n of [49,50,99,100,499,500,999]){x.xxx_credit=n;assert.equal(x.xxx_credit,Math.min(n,500));assert.equal(x.titleLevel,Math.floor(Math.min(n,500)/50));}
 x.xxx_credit=1;assert.equal(x.titleLevel,10);x.xxx_credit=-5;assert.equal(x.xxx_credit,-5);assert.equal(x.titleLevel,10);
 x.titleLevel=2;assert.equal(x.titleLevel,2);
});
test('source restore assigns saved bonuses after rank setters, so inferred recomputation would change data',()=>{
 const saved=fs.readFileSync(root+'frame_9/DoAction_2.as','utf8');
 const lines=rules.restoreOrder.map(p=>saved.split(/\r?\n/).find(l=>l.trim().startsWith('this.map.role.'+p+' = moyu_so.data.')));
 assert.ok(lines.every(Boolean));
 const offsets=lines.map(l=>saved.indexOf(l));assert.deepEqual(offsets,[...offsets].sort((a,b)=>a-b));
 const x=original();
 x.xxx_militaryRank=0;x.xxx_chaw=1;x.job=1;x.xxx_credit=500;
 x.militaryRankFire=12;x.chawFire=17;x.jobFire=23;x.titleLevel=2;
 assert.deepEqual([x.militaryRankFire,x.chawFire,x.jobFire,x.titleLevel],[12,17,23,2]);
});

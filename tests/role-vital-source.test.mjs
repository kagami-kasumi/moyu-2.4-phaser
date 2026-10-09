import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {ROLE_VITAL_RULES as rules} from '../src/content/role-vital-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';
const source=fs.readFileSync(root+'__Packages/RoleMC.as','utf8'),codec=fs.readFileSync(root+'__Packages/SecreteCodeMC.as','utf8');
function original(){
 const c=vm.createContext({isNaN,trace(){},SecreteCodeMC:{BASE:123456}});
 const compile=(s,m,args='')=>vm.runInContext('(function('+args+')'+functionRange(s,m).text+')',c);
 const x={SECRETECODE:-3,changeHpMp(){}};
 x.getSecreteCode=compile(codec,'function getSecreteCode(val)','val');x.setSecreteCode=compile(codec,'function setSecreteCode(val)','val');
 for(const p of ['life','xxx_maxLife','maxLife','mp','maxMp','lifeSourseLevels','maxLifeSourse','lifeSourse','mpSourseLevels','maxMpSourse','mpSourse'])Object.defineProperty(x,p,{get:compile(source,`function get ${p}()`),set:compile(source,`function set ${p}(val)`,'val')});
 return x;
}
test('vital accessors recompute capacity without clamping current values on maximum changes',()=>{
 const x=original();assert.equal(x.lifeSourse,0);assert.equal(x.mpSourse,0);
 x.lifeSourseLevels=2;x.mpSourseLevels=3;x.xxx_maxLife=100;x.maxMp=50;
 assert.equal(x.maxLifeSourse,200);assert.equal(x.maxMpSourse,150);
 x.life=200;x.mp=200;assert.equal(x.life,100);assert.equal(x.mp,50);
 x.xxx_maxLife=10;x.maxMp=5;assert.equal(x.life,100);assert.equal(x.mp,50);
 x.life=-2;x.mp=-2;assert.equal(x.life+0,0);assert.equal(x.mp+0,0);
 x.lifeSourse=-7;x.mpSourse=999;assert.equal(x.lifeSourse,-7);assert.equal(x.mpSourse,999);
 x.lifeSourse=undefined;x.mpSourse=NaN;assert.equal(x.lifeSourse,-7);assert.equal(x.mpSourse,999);
 // Upper comparison precedes lower comparison; negative maxima are not sanitized.
 x.xxx_maxLife=-5;x.life=0;assert.equal(x.life,-5);
});
test('original restore order overwrites saved capacities with later maximum setter products',()=>{
 const saved=fs.readFileSync(root+'frame_9/DoAction_2.as','utf8');
 const lines=rules.restoreOrder.map(p=>saved.split(/\r?\n/).find(l=>l.trim().startsWith('this.map.role.'+p+' = moyu_so.data.')));
 assert.ok(lines.every(Boolean));const offsets=lines.map(l=>saved.indexOf(l));assert.deepEqual(offsets,[...offsets].sort((a,b)=>a-b));
 const x=original();x.lifeSourseLevels=2;x.maxLifeSourse=999;x.lifeSourse=500;x.mpSourseLevels=3;x.maxMpSourse=999;x.mpSourse=500;
 x.xxx_maxLife=100;x.life=110;x.maxMp=50;x.mp=60;
 assert.deepEqual([x.maxLifeSourse,x.maxMpSourse,x.lifeSourse,x.mpSourse,x.life,x.mp],[200,150,500,500,100,50]);
});

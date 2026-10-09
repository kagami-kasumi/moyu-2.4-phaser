import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {source as swfSource,timeline} from '../tools/lib/first-slice.mjs';
import {BUILDING_RULES as rules} from '../src/content/building-rules.ts';
import {registryData} from '../src/content/registry-data.ts';
const root='local-resources/moyu/source-index/as/scripts/';
const source=fs.readFileSync(root+rules.source.file,'utf8');
const cls=fs.readFileSync(root+rules.constructorSource.file,'utf8');
const codec=fs.readFileSync(root+'__Packages/SecreteCode.as','utf8');
test('original timeline and P-code distinguish the extra resource write from the real role debit',()=>{
 const swf=swfSource(),roots=timeline(swf,0)[8].layers;
 assert.equal(roots.find(x=>x.name==='mainCastle')?.characterId,2313);
 assert.equal(roots.find(x=>x.name==='map')?.characterId,4536);
 assert.equal(roots.find(x=>x.name==='role'),undefined);
 assert.equal(timeline(swf,4536)[0].layers.find(x=>x.name==='role')?.characterId,3106);
 const pcode=fs.readFileSync('local-resources/moyu/source-index/pcode/scripts/DefineSprite_2313_主城堡/frame_1/DoAction.pcode','utf8').replaceAll('\r','');
 assert.match(pcode,/Push "map"\nGetMember\nPush "role"\nGetMember\nPush "spendRes"\nCallMethod/);
 assert.match(pcode,/Push "res", register1, "_parent"\nGetMember\nPush "role"\nGetMember\nPush "res"\nGetMember/);
});
function original(){
 const x={SecreteCode:{BASE:123456},isNaN};vm.createContext(x);
 const compile=(text,marker,args='')=>vm.runInContext('(function('+args+')'+functionRange(text,marker).text.replace(/\bsuper\(\);/,'')+')',x);
 const ctor=compile(cls,'function BuildingClass(target)','target');
 x.BuildingClass=function(target){this.SECRETECODE=-3;ctor.call(this,target);};
 x.BuildingClass.prototype.setVal=compile(cls,'function setVal(target)','target');
 x.BuildingClass.prototype.getSecreteCode=compile(codec,'function getSecreteCode(val)','val');
 x.BuildingClass.prototype.setSecreteCode=compile(codec,'function setSecreteCode(val)','val');
 for(const prop of rules.constructor.numericFields)Object.defineProperty(x.BuildingClass.prototype,prop,{get:compile(cls,`function get ${prop}()`),set:compile(cls,`function set ${prop}(val)`,'val')});
 for(let i=0;i<6;i++)x['buildInfo'+i]={};
 vm.runInContext(source,x,{timeout:1000});
 const writes=[];const legacyRole={};Object.defineProperty(legacyRole,'res',{get:()=>1000,set:v=>writes.push(v)});
 const role={credit:50,res:1_000_000,spendRes(n){if(this.res<n)return false;this.res-=n;return true;}};
 x._parent={map:{role},role:legacyRole};x._global={sysMsg:{addMsg(){}}};
 x.flashInfo=()=>{};x.showBuildings=()=>{};
 return {x,role,writes};
}
test('all six building seeds match source constructor; missing writes and initData preserve their source semantics',()=>{
 for(const [spec,text] of [[rules.source,source],[rules.constructorSource,cls]])assert.equal(createHash('sha256').update(text).digest('hex'),spec.sha256);
 const {x}=original();const registered=registryData.definitions.filter(d=>d.kind==='building');
 assert.equal(x.building.length,6);assert.equal(registered.length,6);
 for(const b of x.building){const seed=registered.find(r=>r.name===b.name).data;for(const p of rules.constructor.numericFields)assert.equal(b[p]+0,seed[p],b.name+'.'+p);}
 const b=x.building[2];b.levels=5;b.levels=undefined;assert.equal(b.levels,5);b.prizeLv=4;b.prizeLv=NaN;assert.equal(b.prizeLv,4);
 b.needMainLevels=7;x.initData();assert.equal(b.levels+0,0);assert.equal(b.prizeLv+0,0);assert.equal(b.needMainLevels,7);
});
test('castle upgrade thresholds are checks, not credit costs; direct call has no level cap',()=>{
 const {x,role}=original();role.credit=49;assert.equal(x.upBuilding(1),false);
 role.credit=50;assert.equal(x.upBuilding(1),true);assert.equal(role.credit,50);assert.equal(role.res,1_000_000);
 assert.equal(x.building[1].levels,1);assert.equal(x.building[1].prizeLv,1);assert.equal(x.upBuilding(1),false);
 x.building[0].levels=33;x.building[1].levels=10;role.credit=100;
 assert.equal(x.upBuilding(1),true);assert.equal(x.building[1].levels,11);
});
test('other upgrades spend constant resources and increment the unsaved requirement only on success',()=>{
 const {x,role,writes}=original();assert.equal(x.upBuilding(2),false);assert.equal(role.res,1_000_000);
 x.building[1].levels=1;role.res=199999;assert.equal(x.upBuilding(2),false);assert.equal(x.building[2].needMainLevels,1);
 role.res=200000;assert.equal(x.upBuilding(2),true);assert.equal(role.res,0);
 assert.equal(x.building[2].levels,1);assert.equal(x.building[2].prizeLv,1);assert.equal(x.building[2].needMainLevels,2);
 assert.deepEqual(writes,[-199000]); // Records the separate legacy property write, not a proven second effective deduction.
 assert.equal(x.building[2].upPrice,200000);
});

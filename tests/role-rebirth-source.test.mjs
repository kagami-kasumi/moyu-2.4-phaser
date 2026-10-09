import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {ROLE_REBIRTH_RULES as rules} from '../src/content/role-rebirth-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source.file,'utf8');
function fixture(levels=100,god=false,equipped=false){
 const events=[],root={useRecord:100,equipment:{hasEquipment(){events.push('equipment-check');return equipped;}},huanShou:{reset(){events.push('pet-reset');}},map:{role:{myName:'fixture'}}};
 const context={Math,_root:root,_global:{sysMsg:{addMsg(){}},playSound(){}}};
 const compile=(marker,args)=>vm.runInNewContext('(function('+args+')'+functionRange(source,marker).text+')',context);
 const role={levels,roleGod:god,expBallNum:8,xxx_nowExp:123,maxExp:999,flashAttribute(){events.push('refresh');},升级光环:{gotoAndPlay(){}},_parent:{_parent:{friend:{levelsUp(){}}}},expUp:compile('function expUp(val)','val')};
 for(const [i,key] of rules.doubled.entries())role[key]=i+1;
 return {role,root,events,run:compile('function upGod()','')};
}
test('rebirth sets god flag before awarding initial threshold, ending at level two',()=>{
 const f=fixture();assert.equal(f.run.call(f.role),true);
 for(const [i,key] of rules.doubled.entries())assert.equal(f.role[key],2*(i+1));
 assert.equal(f.role.levels,2);assert.equal(f.role.maxExp,100);assert.equal(f.role.xxx_nowExp,0);assert.equal(f.role.expBallNum,0);
 assert.equal(f.role.godFire,300);assert.equal(f.role.roleGod,true);assert.equal(f.root.useRecord,-1400);
 assert.deepEqual(f.events,['equipment-check','pet-reset','refresh']);
});
test('each rebirth guard exits before progression writes or currency subtraction',()=>{
 for(const args of [[100,true,false],[99,false,false],[100,false,true]]){
  const f=fixture(...args);assert.equal(f.run.call(f.role),false);assert.equal(f.role.levels,args[0]);assert.equal(f.role.expBallNum,8);assert.equal(f.root.useRecord,100);assert.ok(!f.events.includes('pet-reset'));
 }
});

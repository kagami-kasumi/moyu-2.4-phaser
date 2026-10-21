import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {partyIncomingHit} from '../src/domain/party-incoming-hit.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/RoleMC.as','utf8');
const script=new vm.Script('(function(enemy,from,attack,isMax)'+functionRange(source,'function byAttack(').text+')');
const numbers={attackFire:10,burst:10,jook:8,reduceDamage:10,defense:15,wind:0,fire:0,water:0,soil:0};
const seed=()=>({alive:true,attack:35,life:90,maxLife:100,role:{...numbers},from:{...numbers},fly:false,nonDefense:false,slots:[0,1,2].map(i=>({id:'pet'+i,life:40,maxLife:50,open:true,merged:true,bellSkill:1}))});
function compare(x,rolls){let index=0;const calls=[],writes=[],effects=[],dead=[];
 const random=n=>{calls.push(n);return rolls[index++%rolls.length];},bodies=[];
 function body(id,life,maxLife,bellSkill){const b={id,huanShou:{item:{bell:{skill:bellSkill}}},toDeath(){dead.push(id)}};Object.defineProperty(b,'life',{get:()=>life,set:v=>{writes.push({id,value:v});if(!Number.isNaN(v))life=Math.max(0,Math.min(maxLife,v));}});bodies.push(b);return b;}
 const o=body('role',x.life,x.maxLife,undefined),panels={};x.slots.forEach((s,i)=>{const b=body(s.id,s.life,s.maxLife,s.bellSkill);panels['battleHuanShouPanel'+(i+1)]={isOpen:s.open,huanShou:{life:s.life,inOne:s.merged},body:b};});
 Object.assign(o,x.role,{isAlive:x.alive,flyState:x.fly,nonDefenseMC:{_visible:x.nonDefense},_parent:{_parent:panels,attachMovie(){},getNextHighestDepth(){return 1}}});
 const enemy={byAttack(a,b,attack){assert.equal(a,null);assert.equal(b,o);effects.push({type:'reflect',attack});},frostMC:{run(duration){effects.push({type:'frost',duration})}}};
 const returnedAttack=script.runInNewContext({random}).call(o,enemy,x.from,x.attack,false);
 const receiver=x.slots.find(s=>s.open&&s.life>0&&s.merged),id=receiver?.id??'role';const expected={id,life:bodies.find(b=>b.id===id).life,writes:writes.map(w=>w.value),effects,returnedAttack,dead:dead.includes(id)};
 const actualCalls=[];index=0;const actual=partyIncomingHit(x,n=>{actualCalls.push(n);return rolls[index++%rolls.length];});assert.deepEqual(actual,expected);assert.deepEqual(actualCalls,calls);assert(writes.every(w=>w.id===id));
}
test('role damage source oracle: first merged owner, role defense, all elements, random order, no spill to later slots',()=>{
 for(const mask of [0,1,2,3,4,5,6,7])for(const deadSlot of [-1,0,1,2])for(const attack of [0,1,35,999])for(const diff of [-30,0,30])for(const rolls of [[0,0,0],[99,99,4],[99,99,5]]){
  const x=seed();x.slots.forEach((s,i)=>{s.merged=Boolean(mask&(1<<i));if(i===deadSlot)s.life=0;});x.attack=attack;x.from.attackFire=x.role.attackFire-diff;compare(x,rolls);
 }
});
test('role elemental damage follows dodge and receiver bell; flying and invalid inputs keep source policy',()=>{
 for(const bellSkill of [0,1,2])for(const fly of [false,true])for(const nonDefense of [false,true])for(const alive of [false,true])for(const attack of [NaN,0,35]){
  const x=seed();Object.assign(x,{fly,nonDefense,alive,attack});x.slots[0].bellSkill=bellSkill;Object.assign(x.from,{wind:3,fire:7,water:11,soil:13});compare(x,[99,99,0]);compare(x,[0]);
 }
});

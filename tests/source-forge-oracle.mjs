import fs from 'node:fs';import vm from 'node:vm';import {rewardOracle} from './source-reward-oracle.mjs';
const json=p=>JSON.parse(fs.readFileSync(p)),source=json('docs/reverse-engineering/equipment-magic/source-functions.json'),names=json('docs/reverse-engineering/equipment-level/source-reference.json').nameTables;
export const clean=v=>JSON.parse(JSON.stringify(v));
export function forgeOracle(item,stone,credit=500,roll=0){
 const calls=[],events=[],r=rewardOracle(()=>0,undefined,{profession:item.vocational});vm.runInNewContext(names,r.scope);let balance=credit;Object.defineProperty(r.root.map.role,'xxx_credit',{get:()=>balance,set:v=>{events.push('credit');balance=v;},configurable:true});
 const scope=vm.createContext({Math,isNaN,_root:r.root,random:n=>{calls.push(n);events.push('random');return roll;},_global:{playSound(){},sysMsg:{addMsg:s=>r.messages.push(s)}}}),fn=(name,args='')=>vm.runInContext('(function('+args+')'+source.functions[name]+')',scope),slot=v=>({...v,setThing(next){for(const k of Object.keys(this))if(typeof this[k]!=='function')delete this[k];Object.assign(this,next);}}),forge={_parent:r.root,item:slot(item),stone:slot(stone),gradeSuccess:[2,4,8,16,32,64,128,256],makeItem:fn('makeItem'),flashInfo(){}};
 const consume=fn('useGem','useNme');forge.useGem=function(n){events.push('consume');return consume.call(this,n);};forge.item.upData=()=>{events.push('refresh');r.root.upDataWeapon(forge.item);};
 return {calls,events,r,forge,yes:()=>fn('yes').call({_parent:forge}),item:()=>clean(forge.item),stone:()=>forge.stone.type==='空格'?null:clean(forge.stone),credit:()=>balance};
}

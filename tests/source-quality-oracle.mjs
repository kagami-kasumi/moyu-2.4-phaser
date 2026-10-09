import fs from 'node:fs';
import vm from 'node:vm';
import {rewardOracle} from './source-reward-oracle.mjs';
export const qualitySource=JSON.parse(fs.readFileSync('docs/reverse-engineering/equipment-quality/source-functions.json','utf8'));
const clean=v=>JSON.parse(JSON.stringify(v));
export function qualityOracle(item,stone){
 const r=rewardOracle(()=>0),events=[],scope=r.scope;
 scope.isNaN=isNaN;scope._global.playSound=()=>events.push('sound');scope._global.sysMsg.addMsg=s=>{events.push(s);r.messages.push(s);};
 const fn=(key,args='')=>vm.runInNewContext('(function('+args+')'+qualitySource.functions[key]+')',scope);
 r.root.upDataWeapon=fn('upDataWeapon','target');
 const slot=v=>({...v,setThing(next){for(const k of Object.keys(this))if(typeof this[k]!=='function')delete this[k];Object.assign(this,next);}});
 const forge={_parent:r.root,item:slot(item),stone:slot(stone),gradeSuccess:qualitySource.gradeSuccess,makeItem:fn('makeItem'),useGem:fn('useGem','useNme'),flashInfo(){events.push('info');}};
 forge.item.upData=()=>{events.push('update');r.root.upDataWeapon(forge.item);};
 return {r,forge,events,normalize(v){r.root.upDataWeapon(v);return v;},yes:()=>fn('yes').call({_parent:forge}),item:()=>clean(forge.item),stone:()=>forge.stone.type==='空格'?null:clean(forge.stone)};
}

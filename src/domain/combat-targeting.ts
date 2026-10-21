import type {CombatTarget} from './monster-behavior.ts';
export interface PlayerTargeting {x:number;y:number;facing:'left'|'right';target?:string}
/** RoleMC.lockTarget: a valid retained target wins, ties in new selection keep
 * the highest source slot. Source Activities clears dead retained targets first. */
export function lockPlayerTarget(p:PlayerTargeting,units:readonly CombatTarget[],width:number,height:number){
 const side=p.facing==='left'?1:-1;
 let target=units.find(u=>u.id===p.target);
 if(!target||side*(p.x-target.x)<0||Math.abs(p.x-target.x)>width||Math.abs(p.y-target.y)>height){
  target=undefined;
  for(let i=units.length-1;i>=0;i--){const u=units[i]!;
   if(u.alive&&side*(p.x-u.x)>0&&Math.abs(p.x-u.x)<=width&&Math.abs(p.y-u.y)<=height&&(!target||Math.abs(p.x-u.x)<Math.abs(p.x-target.x)))target=u;
  }
 }
 p.target=target?.id;return Boolean(target);
}
/** Clicking sets facing and starts the profession's base action; it does not
 * directly assign myTarget. Equality is intentionally rejected here. */
export function clickAttack(p:PlayerTargeting,target:CombatTarget,profession:'warrior'|'mage'){
 if(Math.abs(target.x-p.x)>=(profession==='warrior'?150:400)||Math.abs(target.y-p.y)>=(profession==='warrior'?30:40))return false;
 p.facing=target.x>p.x?'right':'left';return true;
}

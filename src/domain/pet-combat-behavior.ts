import type {CombatTarget,MonsterHit} from './monster-behavior.ts';
export interface PetCombatBehavior extends CombatTarget {
 visible:boolean;facing:'left'|'right';motion:'idle'|'left'|'right'|'up'|'down'|'acting'|'finished';target?:string;
 effect:'none'|'attack'|'skill';stopTime:number;attackStopTime:number;followLength:number;followHeight:number;
 attackLength:number;attackHeight:number;speedX:number;speedY:number;minAttack:number;maxAttack:number;
}
/** HuanShouMC Activities. Normal attack becomes finished immediately and is
 * resolved on the next Activities call; its projectile is presentation only. */
export function stepPet(p:PetCombatBehavior,role:CombatTarget&{target?:string},enemies:readonly CombatTarget[],random:(n:number)=>number):MonsterHit[]{
 if(!p.visible||p.motion==='acting')return [];
 let target=enemies.find(u=>u.id===p.target);
 if(p.motion==='finished'){
  const hits:MonsterHit[]=[];
  if(p.effect!=='none'&&target&&Math.abs(p.x-target.x)<=p.attackLength&&Math.abs(p.y-target.y)<=p.attackHeight){const attack=p.minAttack+random(p.maxAttack-p.minAttack+1);hits.push({target:target.id,attack,isMax:attack===p.maxAttack});}
  p.effect='none';p.stopTime=p.attackStopTime;p.motion='idle';return hits;
 }
 if(p.stopTime>0){p.stopTime--;return [];}
 if(!target?.alive)p.target=undefined;
 const move=(dx:number,dy:number,width:number,height:number)=>{
  if(dx>width){p.x-=p.speedX;p.motion='left';}else if(dx< -width){p.x+=p.speedX;p.motion='right';}
  if(dy>height){p.y-=p.speedY;p.motion='up';}else if(dy< -height){p.y+=p.speedY;p.motion='down';}
 };
 if(p.target===undefined||!p.alive){
  if(role.target!==undefined&&p.alive)p.target=role.target;
  else {const dx=p.x-role.x,dy=p.y-role.y;if(Math.abs(dx)>p.followLength||Math.abs(dy)>p.followHeight){p.facing=dx<=0?'right':'left';move(dx,dy,p.followLength,p.followHeight);}}
 }
 if(p.alive){
  if(role.target===undefined)role.target=p.target;
  target=enemies.find(u=>u.id===p.target);
  if(target?.alive){const dx=p.x-target.x,dy=p.y-target.y;p.facing=dx<=0?'right':'left';move(dx,dy,p.attackLength*.8,p.attackHeight*.8);
   if(Math.abs(dx)<=p.attackLength&&Math.abs(dy)<=p.attackHeight){p.effect='attack';p.motion='finished';}
  }else p.motion='idle';
 }
 return [];
}

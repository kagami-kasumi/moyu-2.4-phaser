/** MonsterMC Activities / lockTarget. Coordinates remain in the source map space.
 * Animation completion is supplied by a verified timeline, never a render callback.
 */
export interface CombatTarget {id:string;x:number;y:number;alive:boolean}
export interface MonsterBehavior extends CombatTarget {
 facing:'left'|'right';motion:'idle'|'left'|'right'|'up'|'down'|'acting'|'finished';
 target?:string;effect:'none'|'attack'|'skill'|'ranged';stopTime:number;
 attackStopTime:number;stopRate:number;guardLength:number;guardHeight:number;
 attackLength:number;attackHeight:number;speedX:number;speedY:number;
 minAttack:number;maxAttack:number;attackTypeNum:number;ranged:boolean;
}
export interface MonsterHit {target:string;attack:number;isMax:boolean}
export function lockMonsterTarget(m:MonsterBehavior,units:readonly CombatTarget[]){
 let best=538.5164807134504;
 // Source intentionally retains an existing target and uses sqrt(dx*dy), not distance.
 for(let i=units.length-1;i>=0;i--){const u=units[i]!,dx=m.x-u.x,dy=m.y-u.y,d=Math.sqrt(dx*dy);
  if(u.alive&&Math.abs(dx)<=m.guardLength&&Math.abs(dy)<=m.guardHeight&&d<=best){m.target=u.id;best=d;}
 }
}
export function stepMonster(m:MonsterBehavior,units:readonly CombatTarget[],random:(n:number)=>number):MonsterHit[]{
 if(!m.alive||m.motion==='acting')return [];
 let target=units.find(u=>u.id===m.target);
 if(m.motion==='finished'){
  const hits:MonsterHit[]=[];
  if(m.effect!=='none'&&target&&Math.abs(m.x-target.x)<=m.attackLength&&Math.abs(m.y-target.y)<=m.attackHeight){const attack=m.minAttack+random(m.maxAttack-m.minAttack+1);hits.push({target:target.id,attack,isMax:attack===m.maxAttack});}
  m.effect='none';m.stopTime=m.attackStopTime;m.motion='idle';return hits;
 }
 if(m.stopTime>0){m.stopTime--;return [];}
 if(random(m.stopRate*10)<15){m.stopTime=m.attackStopTime;m.motion='idle';return [];}
 if(!target?.alive)m.target=undefined;
 if(m.target===undefined)lockMonsterTarget(m,units);
 target=units.find(u=>u.id===m.target);
 if(!target?.alive){m.motion='idle';return [];}
 const dx=m.x-target.x,dy=m.y-target.y;m.facing=dx<=0?'right':'left';
 if(dx>Math.abs(m.attackLength*2)||dy>Math.abs(m.attackHeight*2))lockMonsterTarget(m,units);
 if(dx>m.attackLength*.8){m.x-=m.speedX;m.motion='left';}
 else if(dx< -m.attackLength*.8){m.x+=m.speedX;m.motion='right';}
 if(dy>m.attackHeight*.8){m.y-=m.speedY;m.motion='up';}
 else if(dy< -m.attackHeight*.8){m.y+=m.speedY;m.motion='down';}
 // Eligibility uses the pre-movement displacement, matching the source locals.
 if(Math.abs(dx)<=m.attackLength&&Math.abs(dy)<=m.attackHeight){
  m.effect=m.ranged?'ranged':random(m.attackTypeNum)===1?'skill':'attack';
  m.motion=m.ranged?'finished':'acting';
 }else lockMonsterTarget(m,units);
 return [];
}

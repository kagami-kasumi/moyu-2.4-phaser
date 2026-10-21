import {stepMonster,type CombatTarget,type MonsterHit} from './monster-behavior.ts';
import {stepPet,type PetCombatBehavior} from './pet-combat-behavior.ts';
import type {FirstCombatMonster} from './first-combat-spawn.ts';

export interface CombatRoleClock extends CombatTarget {target?:string;motion:'idle'|'acting'|'finished';animationFrame:number}
export interface CombatSessionPorts {
 role:CombatRoleClock;
 /** Must read current slots, not a cached list: death, recall and merge can occur in a hit. */
 pets:()=>PetCombatBehavior[];
 roleActivity:()=>void;
 hitMonster:(pet:PetCombatBehavior,hit:MonsterHit)=>void;
 hitParty:(monster:FirstCombatMonster,hit:MonsterHit)=>void;
 random:(n:number)=>number;
}
/** Source map onEnterFrame order: role, pets 1..3, monsters 1..6, then child
 * timeline progression. 15 Hz is a design clock reproducing these source ticks.
 * All damage is delivered here, independent of Phaser display callbacks. */
export class CombatSession {
 tick=0;paused=false;active=true;private phase=0;private revision=0;
 constructor(public monsters:FirstCombatMonster[],readonly ports:CombatSessionPorts){}
 close(){this.active=false;this.revision++;this.phase=0;this.ports.role.target=undefined;this.ports.role.motion='idle';this.ports.role.animationFrame=1;for(const p of this.ports.pets()){p.target=undefined;p.motion='idle';p.effect='none';p.stopTime=0;}for(const m of this.monsters)m.target=undefined;}
 /** A map replacement owns a new session. An old callback cannot re-open this one. */
 advance(ms:number){if(!Number.isFinite(ms)||ms<0)throw Error('Invalid combat clock delta');if(!this.active||this.paused)return;this.phase+=ms*15;while(this.active&&!this.paused&&this.phase>=1000-1e-7){this.phase=Math.max(0,this.phase-1000);this.step();}}
 step(){
  if(!this.active||this.paused)return;this.tick++;const revision=this.revision,valid=()=>this.active&&revision===this.revision;
  const role=this.ports.role,roleActing=role.motion==='acting',oldMonsters=new Map(this.monsters.map(m=>[m,m.motion==='acting']));
  if(role.target&&!this.monsters.some(m=>m.id===role.target&&m.alive))role.target=undefined;
  this.ports.roleActivity();if(!valid())return;
  // Snapshot order, but verify identity against the live roster before each turn.
  const pets=this.ports.pets().slice(0,3);
  for(const p of pets){if(!this.ports.pets().includes(p))continue;for(const hit of stepPet(p,role,this.monsters,this.ports.random)){this.ports.hitMonster(p,hit);if(!valid())return;}}
  for(const m of [...this.monsters]){
   if(!this.monsters.includes(m))continue;
   const units:CombatTarget[]=[role,...this.ports.pets().slice(0,3)];
   for(const hit of stepMonster(m,units,this.ports.random)){this.ports.hitParty(m,hit);if(!valid())return;}
  }
  if(roleActing&&role.motion==='acting'){role.animationFrame++;if(role.animationFrame===11)role.motion='finished';}
  for(const m of this.monsters){
   if(!m.alive)continue;
   if(m.motion==='acting'){
    if(!oldMonsters.get(m)){m.animationFrame=1;continue;}
    m.animationFrame++;const end=(m.effect==='skill'?m.skillFrames:undefined)??m.attackFrames??(m.species==='鹿角兽'?9:m.effect==='skill'?7:10);
    if(m.animationFrame===end)m.motion='finished';
   }else if(m.motion==='left'||m.motion==='right'||m.motion==='up'||m.motion==='down')m.animationFrame=m.animationFrame%(m.runFrames??(m.species==='鹿角兽'?16:14))+1;
   else if(m.motion!=='finished')m.animationFrame=1;
  }
 }
}

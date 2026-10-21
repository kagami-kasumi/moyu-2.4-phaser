import {spawnFrostBattle,isFrostRegion} from './ice-palace-battle.ts';
import {spawnIceBattle,isIceRegion} from './ice-battle.ts';
import {initialBorderField,advanceBorderField,isBorderField,spawnBorderBoss,spawnBorderField,borderFieldDrops,borderBossDrops,type BorderFieldState,type BorderBossKind} from './border-field.ts';
import {spawnIcePalaceMirage,icePalaceMirageDrops} from './ice-palace-city.ts';
import {spawnBorderMirage,borderMirageDrops} from './border-city.ts';
import {initialSouthField,advanceSouthField,isSouthField,spawnSouthBoss,southBossDrops,type SouthFieldState,type SouthBossKind} from './south-field.ts';
import {spawnRescue,isRescueRegion,rescueDrops,type PrisonWave} from './south-rescue.ts';
import {spawnSouthMirage,southMirageDrops} from './south-city.ts';
import {spawnSouthBattle,isSouthRegion} from './south-battle.ts';
import {spawnSwampMirage,swampMirageDrops} from './swamp-city.ts';
import {spawnSwampBattle,isSwampRegion} from './swamp-battle.ts';
import {spawnGobiBattle,isGobiRegion,gobiDrops} from './gobi-battle.ts';
import {spawnBandits,banditDrops,type BanditWave} from './shuxin-bandits.ts';
import {spawnGobiMirage,gobiMirageDrops} from './gobi-city.ts';
import {spawnShuxinMirage,shuxinMirageDrops} from './shuxin-city.ts';
import {mirageDrops} from './kasano-mirage.ts';
import {initialLuckyWave,rollLuckyWave,spawnLuckyWave,luckyDrops,type LuckyWave} from './lucky-gate.ts';
import {finaleChestDrops} from './finale-chest.ts';
import {CombatSession,type CombatRoleClock} from './combat-session.ts';
import {CombatEffects} from './combat-effects.ts';
import {spawnFirstCombat,spawnFinaleBoss,type FinaleBossKind,type CombatRegion,type FirstCombatMonster} from './first-combat-spawn.ts';
import {clickAttack,lockPlayerTarget} from './combat-targeting.ts';
import {basePlayerStrike} from './base-player-strike.ts';
import {worldIncomingHit,type CombatantNumbers,type IncomingEffect} from '../content/pet-world-combat-rules.ts';
import {partyIncomingHit} from './party-incoming-hit.ts';
import {PET_COMBAT_DATA} from '../content/pet-combat-data.ts';
import {petLife,grantPetExperience,type PetProgression} from './pet-progression.ts';
import type {PetCombatBehavior} from './pet-combat-behavior.ts';
import type {PetRecord,Item} from './npc-reward.ts';
import type {Inventory} from './inventory.ts';
import {grantExperience} from './player-experience.ts';
import {advanceItemSpirit,refreshItemNumbers} from '../content/item-numeric-rules.ts';
import {refreshEquipmentAttributes} from './equipment-attributes.ts';
import {palacePrize} from './palace-lottery.ts';
import {skillFields} from './character-skills.ts';
import {firstCombatDrops,firstBossDrops,advanceFirstBoss,type FirstBossReward} from './first-combat-drops.ts';

export interface CombatLedger {bossLevel:number;bossMoreFire:number;kills:Record<string,number>;overflowExp:number;nowPower:number;nowExp:number}
export const initialCombatLedger=():CombatLedger=>({bossLevel:1,bossMoreFire:0,kills:{},overflowExp:0,nowPower:0,nowExp:0});
export type WarningTarget='刺虫人头目'|'提风护卫'|'剌虫王'|'第二批强盗'|'强盗首领'|'挑战怪物'|'龙怪头目'|'鹿角护卫'|'龙王'|'宝箱'|'监狱守卫'|'监狱长'|'炎女头目'|'恐兽护卫'|'妖王';
export interface FirstCombatSave {borderBossKind?:BorderBossKind;borderBossFire?:number;southBossKind?:SouthBossKind;southBossFire?:number;prisonWave?:PrisonWave;banditWave?:BanditWave;lucky?:LuckyWave;bossKind?:FinaleBossKind;moreFire?:number;warningTarget?:WarningTarget;chest?:{x:number;y:number;opened:boolean};boss:boolean;level:number;warningTicks:number;monsters:{x:number;y:number;life:number;facing:'left'|'right';attackLength?:number;attackHeight?:number}[]}
interface PetBody extends PetCombatBehavior {record:PetRecord;slot:number}
export interface FirstCombatPorts {borderField?:BorderFieldState;southField?:SouthFieldState;rescueActive?:()=>boolean;rescued?:()=>void;gobiActive?:()=>boolean;gobiDefeated?:(name:string)=>void;inventory:Inventory;pets:PetProgression;position:()=>{x:number;y:number;facing:'left'|'right'};contains:(x:number,y:number)=>boolean;notice:(text:string)=>void;region?:CombatRegion;ownsMap?:()=>boolean;catchThing?:(name:string,count:number)=>void}
const zero:CombatantNumbers={attackFire:0,burst:0,jook:0,reduceDamage:0,defense:0,wind:0,fire:0,water:0,soil:0};
/** Live ownership boundary. Rendering consumes this session; it never delivers hits. */
export class FirstCombat {
 readonly role:CombatRoleClock&{facing:'left'|'right'}={id:'role',x:0,y:0,alive:true,motion:'idle',animationFrame:1,facing:'left'};
 readonly session:CombatSession;private bodies=new Map<PetRecord,PetBody>();
 borderBossKind?:BorderBossKind;borderBossFire=0;private borderField:BorderFieldState;
 southBossKind?:SouthBossKind;southBossFire=0;private southField:SouthFieldState;prisonWave?:PrisonWave;banditWave?:BanditWave;
 lucky?:LuckyWave;
 bossKind?:FinaleBossKind;waveMoreFire=0;warningTarget?:WarningTarget;chest?:{x:number;y:number;opened:boolean};
 warningTicks=0;private effects=new CombatEffects((id,value)=>{const m=this.monsters.find(m=>m.id===id);if(m)m.stopTime=value;});
 constructor(readonly ports:FirstCombatPorts,readonly ledger=initialCombatLedger(),readonly random:(n:number)=>number=n=>Math.floor(Math.random()*Math.max(0,Math.trunc(n))),readonly fraction=()=>Math.random()){
  this.borderField=ports.borderField??initialBorderField();if(ports.region==='borderWildFive'){this.borderBossKind='initial';this.borderBossFire=this.borderField.moreFire;}
  this.southField=ports.southField??initialSouthField();if(ports.region==='southWildFive'){this.southBossKind='initial';this.southBossFire=this.southField.moreFire;}
  if(ports.region==='banditField')this.banditWave=1;
  if(ports.region==='luckyGate'){this.lucky=initialLuckyWave();this.warningTicks=45;this.warningTarget='挑战怪物';}
  this.prisonWave=ports.region==='southPrison'?1:undefined;this.bossKind=ports.region==='wildFive'?'initial':undefined;this.waveMoreFire=ledger.bossMoreFire;this.syncRole();this.session=new CombatSession(this.borderBossKind?spawnBorderBoss(this.borderBossKind,this.borderField.level,this.borderBossFire,random):ports.region&&isBorderField(ports.region)?spawnBorderField(ports.region,random):this.southBossKind?spawnSouthBoss(this.southBossKind,this.southField.level,this.southBossFire,random):ports.region==='icePalaceMirage'?spawnIcePalaceMirage(random):ports.region==='borderMirage'?spawnBorderMirage(random):ports.region&&isRescueRegion(ports.region)?spawnRescue(ports.region,random):ports.region&&isFrostRegion(ports.region)?(ports.gobiActive?.()?spawnFrostBattle(ports.region,random):[]):ports.region&&isIceRegion(ports.region)?(ports.gobiActive?.()?spawnIceBattle(ports.region,random):[]):ports.region&&isSouthRegion(ports.region)?(ports.gobiActive?.()?spawnSouthBattle(ports.region,random):[]):ports.region&&isSwampRegion(ports.region)?(ports.gobiActive?.()?spawnSwampBattle(ports.region,random):[]):ports.region&&isGobiRegion(ports.region)?(ports.gobiActive?.()?spawnGobiBattle(ports.region,random):[]):ports.region==='southMirage'?spawnSouthMirage(random):ports.region==='swampMirage'?spawnSwampMirage(random):ports.region==='gobiMirage'?spawnGobiMirage(random):ports.region==='shuxinMirage'?spawnShuxinMirage(random):this.banditWave?spawnBandits(this.banditWave,random):this.lucky?[]:this.bossKind?spawnFinaleBoss(random,this.bossKind,ledger.bossLevel,this.waveMoreFire):spawnFirstCombat(random,undefined,ports.region),{role:this.role,pets:()=>this.pets(),random,roleActivity:()=>this.roleActivity(),hitMonster:(p,h)=>this.hitMonster(h.target,h.attack,this.petNumbers(p as PetBody),p.id),hitParty:(m,h)=>this.hitParty(m,h.target,h.attack)});
 }
 get monsters(){return this.session.monsters;}
 snapshot():FirstCombatSave {return {...(this.borderBossKind?{borderBossKind:this.borderBossKind,borderBossFire:this.borderBossFire}:{}),...(this.southBossKind?{southBossKind:this.southBossKind,southBossFire:this.southBossFire}:{}),...(this.prisonWave?{prisonWave:this.prisonWave}:{}),...(this.banditWave?{banditWave:this.banditWave}:{}),...(this.lucky?{lucky:{...this.lucky}}:{}),...(this.bossKind?{bossKind:this.bossKind,moreFire:this.waveMoreFire}:{}),...(this.warningTarget?{warningTarget:this.warningTarget}:{}),...(this.chest?{chest:{...this.chest}}:{}),boss:!!this.borderBossKind||!!this.southBossKind||!!this.bossKind||this.monsters[0]?.name==='龙怪头目',level:this.monsters[0]?.level??1,warningTicks:this.warningTicks,monsters:this.monsters.map(m=>({x:m.x,y:m.y,life:m.life,facing:m.facing,attackLength:m.attackLength,attackHeight:m.attackHeight}))};}
 /** Design: retain resolved world state, cancel pending hits and random AI pauses. */
 restore(saved:FirstCombatSave){this.borderBossKind=saved.borderBossKind;this.borderBossFire=saved.borderBossFire??0;this.southBossKind=saved.southBossKind;this.southBossFire=saved.southBossFire??0;this.prisonWave=saved.prisonWave;this.banditWave=saved.banditWave;this.lucky=saved.lucky?{...saved.lucky}:undefined;this.bossKind=saved.bossKind;this.waveMoreFire=saved.moreFire??0;this.warningTarget=saved.warningTarget??(saved.warningTicks>0?'龙怪头目':undefined);this.chest=saved.chest?{...saved.chest}:undefined;this.session.monsters=this.borderBossKind?spawnBorderBoss(this.borderBossKind,saved.level,this.borderBossFire,()=>0):this.ports.region&&isBorderField(this.ports.region)?spawnBorderField(this.ports.region,()=>0):this.southBossKind?spawnSouthBoss(this.southBossKind,saved.level,this.southBossFire,()=>0):this.ports.region==='icePalaceMirage'?spawnIcePalaceMirage(()=>0):this.ports.region==='borderMirage'?spawnBorderMirage(()=>0):this.ports.region&&isRescueRegion(this.ports.region)?spawnRescue(this.ports.region,()=>0,this.prisonWave):this.ports.region&&isFrostRegion(this.ports.region)?(saved.monsters.length?spawnFrostBattle(this.ports.region,()=>0):[]):this.ports.region&&isIceRegion(this.ports.region)?(saved.monsters.length?spawnIceBattle(this.ports.region,()=>0):[]):this.ports.region&&isSouthRegion(this.ports.region)?(saved.monsters.length?spawnSouthBattle(this.ports.region,()=>0):[]):this.ports.region&&isSwampRegion(this.ports.region)?(saved.monsters.length?spawnSwampBattle(this.ports.region,()=>0):[]):this.ports.region&&isGobiRegion(this.ports.region)?(saved.monsters.length?spawnGobiBattle(this.ports.region,()=>0):[]):this.ports.region==='southMirage'?spawnSouthMirage(()=>0):this.ports.region==='swampMirage'?spawnSwampMirage(()=>0):this.ports.region==='gobiMirage'?spawnGobiMirage(()=>0):this.ports.region==='shuxinMirage'?spawnShuxinMirage(()=>0):this.banditWave?spawnBandits(this.banditWave,()=>0):this.lucky?spawnLuckyWave({...this.lucky,finished:false},()=>0):this.bossKind?spawnFinaleBoss(this.random,this.bossKind,saved.level,this.waveMoreFire):spawnFirstCombat(this.random,saved.boss?saved.level:undefined,this.ports.region);saved.monsters.forEach((m,n)=>Object.assign(this.monsters[n]!,m,{alive:m.life>0}));this.warningTicks=saved.warningTicks;this.role.motion='idle';this.role.target=undefined;}
 get dead(){return this.ports.inventory.vitals.life<=0;}
 private syncRole(){Object.assign(this.role,this.ports.position(),{alive:!this.dead});}
 roleNumbers(){const s=this.ports.inventory.stats();return {...s,attackFire:s.roleFire+this.ports.pets.fire};}
 private petNumbers(body:PetBody):CombatantNumbers {const p=this.ports.pets,d=p.details(body.record);return {...zero,defense:d?.defense??0,attackFire:Math.floor((d?.allFen??0)/100)+(p.bells[body.slot]?Number(p.bells[body.slot]!.grade)+1:0)};}
 pets():PetBody[]{
  const result:PetBody[]=[];
  this.ports.pets.slots.forEach((record,slot)=>{
   if(!record)return;const d=this.ports.pets.details(record),data=PET_COMBAT_DATA[record.type];if(!d||!data)return;
   let body=this.bodies.get(record);if(!body){body={id:'pet'+(slot+1),record,slot,x:this.role.x,y:this.role.y,alive:true,visible:true,facing:'left',motion:'idle',effect:'none',stopTime:0,attackStopTime:8,followLength:[60,90,30][slot]!,followHeight:[60,30,90][slot]!,...data,minAttack:d.minAttack,maxAttack:d.maxAttack};this.bodies.set(record,body);}
   Object.assign(body,{id:'pet'+(slot+1),slot,followLength:[60,90,30][slot],followHeight:[60,30,90][slot],alive:petLife(record)>0,visible:!record.inOne,minAttack:d.minAttack,maxAttack:d.maxAttack});result.push(body);
  });
  for(const record of this.bodies.keys())if(!this.ports.pets.slots.includes(record))this.bodies.delete(record);
  return result;
 }
 attack(id?:string){
  if(!this.session.active||this.dead||this.role.motion!=='idle')return false;this.syncRole();
  const mage=this.ports.inventory.reward.profession==='法师';
  if(id){const target=this.monsters.find(m=>m.id===id&&m.alive);if(!target||!clickAttack(this.role,target,mage?'mage':'warrior'))return false;}
  lockPlayerTarget(this.role,this.monsters,mage?400:150,30);
  if(mage)this.ports.inventory.vitals.mp=Math.max(0,this.ports.inventory.vitals.mp-1);
  this.role.motion='acting';this.role.animationFrame=1;return true;
 }
 private roleActivity(){
  const i=this.ports.inventory;this.role.alive=!this.dead;if(!this.role.alive)return;
  if(this.role.motion==='finished'){
   const passive=skillFields(i.skills,i.reward.profession),s=this.roleNumbers();
   const strike={...this.role,...s,profession:i.reward.profession,level:i.vitals.level,life:i.vitals.life,maxLife:i.vitals.maxLife,anger:false,fly:false,heavyHit:passive.heavyHit??0,frost:passive.frost??0,heavyDamage:passive.heavyDamage??0,nonDefense:passive.nonDefense??0};
   basePlayerStrike(strike,this.monsters,this.random,(target,event)=>{
    if(event.type==='frost'||event.type==='nonDefense')this.effects.run(target,event.type,event.duration,this.session.tick);
    // Source heavy.run reads unresolved `form`, not its `from` parameter.
    // Do not invent an attacker or silently repair that source anomaly.
   },(target,attack)=>this.hitMonster(target,attack,this.roleNumbers()),()=>{this.random(100);});
   this.role.target=strike.target;this.role.motion='idle';this.role.animationFrame=1;
  }
 }
 step(){if(!this.session.active||this.session.paused)return;this.syncRole();this.session.step();
  this.effects.step(this.session.tick,id=>!!this.monsters.find(m=>m.id===id)?.alive);
  if(this.warningTicks>0&&!((this.borderBossKind||this.ports.region&&isBorderField(this.ports.region)||this.southBossKind||this.prisonWave||this.lucky||this.banditWave||this.ports.region&&isSouthField(this.ports.region))&&this.dead)&&--this.warningTicks===0)this.spawnBoss();
 }
 spawnBoss(){if(this.ports.region&&isBorderField(this.ports.region))return this.advanceBorderBoss();if(this.ports.region&&isSouthField(this.ports.region))return this.advanceSouthBoss();if(this.ports.region&&isRescueRegion(this.ports.region)){if(this.ports.region!=='southPrison'||!this.session.active||this.dead||this.monsters.some(m=>m.alive)||!['监狱守卫','监狱长'].includes(this.warningTarget??''))return false;this.prisonWave=this.warningTarget==='监狱守卫'?2:3;this.warningTicks=0;this.warningTarget=undefined;this.effects.clear();this.role.target=undefined;for(const p of this.pets()){p.target=undefined;p.motion='idle';p.effect='none';}this.session.monsters=spawnRescue('southPrison',this.random,this.prisonWave);return true;}if(this.ports.region&&(isFrostRegion(this.ports.region)||isIceRegion(this.ports.region)||isSouthRegion(this.ports.region)||isGobiRegion(this.ports.region)||isSwampRegion(this.ports.region)))return false;if(this.banditWave)return this.advanceBandits();if(this.ports.region==='icePalaceMirage'||this.ports.region==='borderMirage'||this.ports.region==='southMirage'||this.ports.region==='swampMirage'||this.ports.region==='gobiMirage'||this.ports.region==='kasanoMirage'||this.ports.region==='shuxinMirage')return false;if(this.lucky)return this.advanceLucky();if(!this.session.active||this.monsters.some(m=>m.alive)||this.ports.region==='wildFive'&&!this.warningTarget)return false;const target=this.warningTarget??'龙怪头目';this.warningTarget=undefined;this.warningTicks=0;this.effects.clear();this.role.target=undefined;for(const p of this.pets()){p.target=undefined;p.effect='none';p.motion='idle';}
  if(target==='宝箱'){const p=this.ports.position();this.chest={x:p.x,y:p.y,opened:false};this.ports.notice('宝箱出现，点击打开。');return true;}
  this.bossKind=target==='鹿角护卫'?'guard':target==='龙王'?'king':undefined;this.waveMoreFire=this.ledger.bossMoreFire;
  this.session.monsters=this.bossKind?spawnFinaleBoss(this.random,this.bossKind,this.ledger.bossLevel,this.waveMoreFire):spawnFirstCombat(this.random,this.ledger.bossLevel);this.ports.notice(target+'出现！');return true;
 }
 private advanceBorderBoss(){if(!this.session.active||this.dead||this.monsters.some(m=>m.alive)||!['刺虫人头目','提风护卫','剌虫王','宝箱'].includes(this.warningTarget??''))return false;const target=this.warningTarget!;this.warningTicks=0;this.warningTarget=undefined;this.effects.clear();this.role.target=undefined;for(const p of this.pets()){p.target=undefined;p.motion='idle';p.effect='none';}if(target==='宝箱'){const p=this.ports.position();this.chest={x:p.x,y:p.y,opened:false};this.ports.notice('宝箱出现，点击打开。');return true;}this.borderBossKind=target==='提风护卫'?'guard':target==='剌虫王'?'king':'random';this.borderBossFire=this.borderField.moreFire;this.session.monsters=spawnBorderBoss(this.borderBossKind,this.borderField.level,this.borderBossFire,this.random);this.ports.notice(target+'出现！');return true;}
 private advanceSouthBoss(){if(!this.session.active||this.dead||this.monsters.some(m=>m.alive)||!['炎女头目','恐兽护卫','妖王','宝箱'].includes(this.warningTarget??''))return false;const target=this.warningTarget!;this.warningTicks=0;this.warningTarget=undefined;this.effects.clear();this.role.target=undefined;for(const p of this.pets()){p.target=undefined;p.motion='idle';p.effect='none';}if(target==='宝箱'){const p=this.ports.position();this.chest={x:p.x,y:p.y,opened:false};this.ports.notice('宝箱出现，点击打开。');return true;}this.southBossKind=target==='恐兽护卫'?'guard':target==='妖王'?'king':'random';this.southBossFire=this.southField.moreFire;this.session.monsters=spawnSouthBoss(this.southBossKind,this.southField.level,this.southBossFire,this.random);this.ports.notice(target+'出现！');return true;}
 private advanceBandits(){if(!this.session.active||this.dead||!this.banditWave||this.banditWave===3||!this.warningTarget||this.monsters.some(monster=>monster.alive))return false;this.banditWave=(this.banditWave+1) as BanditWave;this.warningTicks=0;this.warningTarget=undefined;this.effects.clear();this.role.target=undefined;for(const pet of this.pets()){pet.target=undefined;pet.effect='none';pet.motion='idle';}this.session.monsters=spawnBandits(this.banditWave,this.random);this.ports.notice(this.banditWave===2?'第二批强盗出现！':'强盗首领出现！');return true;}
 private advanceLucky(){if(!this.session.active||this.dead||!this.warningTarget||this.monsters.some(m=>m.alive)||this.lucky!.finished)return false;const next=rollLuckyWave(this.lucky!.round+1,this.ports.inventory.vitals.level,this.random);this.warningTicks=0;this.warningTarget=undefined;this.effects.clear();this.role.target=undefined;for(const p of this.pets()){p.target=undefined;p.effect='none';p.motion='idle';}if(next.finished){this.lucky!.finished=true;const p=this.ports.position();this.chest={x:p.x,y:p.y,opened:false};this.ports.notice('幸运之门已经关闭！宝箱出现。');return true;}this.lucky=next;this.session.monsters=spawnLuckyWave(next,this.random);this.ports.notice('幸运之门 第'+next.round+'/30轮 · '+this.monsters[0]!.species);return true;}
 openChest(expected=this.chest){if(!this.session.active||this.dead||!expected||expected!==this.chest||expected.opened)return false;expected.opened=true;finaleChestDrops(this.random,item=>this.reward(expected,{kind:'create-item',item}));this.ports.notice('宝箱已开启，奖励掉落在地上。');return true;}

 close(){this.warningTarget=undefined;this.warningTicks=0;this.effects.clear();this.session.close();}
 private hitMonster(id:string,attack:number,from:CombatantNumbers,attackerId='role'):number|false {
  const m=this.monsters.find(m=>m.id===id);if(!m?.alive)return false;
  const hit=worldIncomingHit({kind:'monster',alive:m.alive,attack,life:m.life,maxLife:m.maxLife,defender:m,from,roleFire:this.roleNumbers().attackFire,nonDefense:this.effects.nonDefense(id),bellSkill:0},this.random);
  m.life=hit.life;const i=this.ports.inventory;
  if(hit.xpCharges&&i.xpEnabled&&!i.consumables.isFull){if(++this.ledger.nowExp>=18){this.ledger.nowExp=0;this.ledger.nowPower++;if(this.ledger.nowPower===i.consumables.maxPower)i.consumables.isFull=true;}}
  if(m.target===undefined)m.target=attackerId;if(m.life<=0)this.kill(m);return hit.returnedAttack;
 }
 private hitParty(monster:FirstCombatMonster,id:string,attack:number){
  const i=this.ports.inventory,p=this.ports.pets,bodies=this.pets(),role=this.roleNumbers();
  const body=id==='role'?bodies.find(b=>b.record.inOne&&b.alive):bodies.find(b=>b.id===id);
  if(id!=='role'&&!body?.alive||id==='role'&&this.dead)return;
  const readLife=()=>body?petLife(body.record):i.vitals.life;
  const writeLife=(v:number)=>{const maximum=body?p.details(body.record)!.maxLife:i.vitals.maxLife;v=Math.max(0,Math.min(maximum,v));if(body)body.record.life=v;else i.vitals.life=v;};
  const effect=(e:IncomingEffect)=>{if(e.type==='reflect')this.hitMonster(monster.id,e.attack,id==='role'?this.roleNumbers():this.petNumbers(body!),id);else this.effects.run(monster.id,'frost',e.duration,this.session.tick);};
  if(id==='role')partyIncomingHit({alive:!this.dead,attack,role,from:monster,life:i.vitals.life,maxLife:i.vitals.maxLife,fly:false,nonDefense:false,slots:bodies.map(b=>({id:b.id,life:petLife(b.record),maxLife:p.details(b.record)!.maxLife,open:true,merged:!!b.record.inOne,bellSkill:Number(p.bells[b.slot]?.skill??0)}))},this.random,{readLife,writeLife,effect});
  else worldIncomingHit({kind:'pet',alive:body!.alive,attack,life:readLife(),maxLife:p.details(body!.record)!.maxLife,defender:this.petNumbers(body!),from:monster,roleFire:role.attackFire,nonDefense:false,bellSkill:Number(p.bells[body!.slot]?.skill??0)},this.random,{readLife,writeLife,effect});
  const receiver=id==='role'?this.role:body!;if(receiver.target===undefined)receiver.target=monster.id;
  if(body&&petLife(body.record)<=0){p.death(body.record);this.random(2);body.alive=false;body.target=undefined;body.motion='idle';body.effect='none';}
  if(this.dead&&this.role.alive){this.role.alive=false;this.role.motion='idle';this.role.target=undefined;if(i.reward.credit>10)i.reward.credit--;this.ports.notice('人物死亡，请复活返回安全区域。');}
 }
 private kill(m:FirstCombatMonster){
  if(!this.session.active||!this.monsters.includes(m)||!m.alive)return;this.random(10);m.alive=false;m.life=0;
  const i=this.ports.inventory,r=i.reward;
  for(const item of Object.values(i.equipment))if(item&&item.spirit!==undefined)advanceItemSpirit(item,1);i.refresh();
  const amount=Math.round((1+this.roleNumbers().moreExp*.01)*(m.level*3+15));
  if(!this.dead){if(i.vitals.level<i.maxLevel)grantExperience(i,amount);else{this.ledger.overflowExp+=amount;while(this.ledger.overflowExp>=5000){this.ledger.overflowExp-=5000;r.store({type:'经验球'},this.role,this.ports.contains);}}if(this.ports.ownsMap?.())r.res+=amount*20;r.messages.push('获得'+amount+'点经验值'+(this.ports.ownsMap?.()?'，获得'+amount*20+'点资源':''));}
  for(const p of this.ports.pets.slots)if(p)grantPetExperience(p,amount,i.vitals.level,this.ports.pets.bells[this.ports.pets.slots.indexOf(p)]);
  const emit=(event:FirstBossReward)=>this.reward(m,event);
  if(this.borderBossKind)borderBossDrops(m.name,m.level,r.profession,this.ports.region==='borderWildFive',this.random,this.fraction,emit);
  else if(this.ports.region&&isBorderField(this.ports.region))borderFieldDrops(m.name,m.level,r.profession,this.monsters.some(other=>other.alive),this.random,emit);
  else if(this.southBossKind)southBossDrops(m.name,m.level,r.profession,this.ports.region==='southWildFive',this.random,this.fraction,emit);
  else if(this.ports.region&&isRescueRegion(this.ports.region)){rescueDrops(m.name,m.level,r.profession,this.monsters.some(other=>other.alive),this.ports.rescueActive?.()??false,this.random,this.fraction,emit);if(m.name==='监狱长')this.ports.rescued?.();}
  else if(this.ports.region&&(isFrostRegion(this.ports.region)||isIceRegion(this.ports.region)||isSouthRegion(this.ports.region)||isGobiRegion(this.ports.region)||isSwampRegion(this.ports.region))){gobiDrops(m.name,m.level,r.profession,this.random,this.fraction,emit);this.ports.gobiDefeated?.(m.name);}
  else if(this.banditWave)banditDrops(this.banditWave,r.profession,this.monsters.some(other=>other.alive),this.random,this.fraction,emit);
  else if(this.lucky)luckyDrops(this.lucky,m.level,this.monsters.some(other=>other.alive),this.random,this.fraction,emit);
  else if(this.ports.region==='icePalaceMirage')icePalaceMirageDrops(this.monsters.some(other=>other.alive),this.random,(event,atRole)=>this.reward(atRole?this.role:m,event));
  else if(this.ports.region==='borderMirage')borderMirageDrops(this.monsters.some(other=>other.alive),this.random,(event,atRole)=>this.reward(atRole?this.role:m,event));
  else if(this.ports.region==='southMirage')southMirageDrops(this.monsters.some(other=>other.alive),this.random,(event,atRole)=>this.reward(atRole?this.role:m,event));
  else if(this.ports.region==='swampMirage')swampMirageDrops(this.monsters.some(other=>other.alive),this.random,(event,atRole)=>this.reward(atRole?this.role:m,event));
  else if(this.ports.region==='gobiMirage')gobiMirageDrops(this.monsters.some(other=>other.alive),this.random,(event,atRole)=>this.reward(atRole?this.role:m,event));
  else if(this.ports.region==='shuxinMirage')shuxinMirageDrops(this.monsters.some(other=>other.alive),this.random,(event,atRole)=>this.reward(atRole?this.role:m,event));
  else if(this.ports.region==='kasanoMirage')mirageDrops(this.monsters.some(other=>other.alive),this.random,(e,atRole)=>this.reward(atRole?this.role:m,e));
  else if(['龙怪头目','鹿角护卫','龙王'].includes(m.name))firstBossDrops(m.level,r.profession,this.random,this.fraction,emit,m.name,this.ports.region==='wildFive');
  else firstCombatDrops(m.level,r.profession,this.monsters.some(other=>other.alive),this.random,emit,m.name as '鹿角兽'|'鹿角兽精英'|'龙怪'|'龙怪精英');
 }
 private reward(m:{x:number;y:number},event:FirstBossReward){
  const r=this.ports.inventory.reward;
  if(event.kind==='catch'){this.ledger.kills[event.name]=(this.ledger.kills[event.name]??0)+event.count;this.ports.catchThing?.(event.name,event.count);return;}
  if(event.kind==='credit'){if(this.ports.region&&(isSouthField(this.ports.region)||isBorderField(this.ports.region))||this.banditWave||this.ports.region==='icePalaceMirage'||this.ports.region==='borderMirage'||this.ports.region==='southMirage'||this.ports.region==='swampMirage'||this.ports.region==='gobiMirage'||this.ports.region==='shuxinMirage'||(this.ports.region&&(isFrostRegion(this.ports.region)||isIceRegion(this.ports.region)||isSouthRegion(this.ports.region)||isGobiRegion(this.ports.region)||isSwampRegion(this.ports.region)))){r.credit=Math.min(500,r.credit+event.amount);r.titleLevel=Math.max(r.titleLevel,Math.floor(r.credit/50));}else r.credit+=event.amount;return;}
  if(event.kind==='border-boss-level'){advanceBorderField(this.borderField);return;}
  if(event.kind==='south-boss-level'){advanceSouthField(this.southField);return;}
  if(event.kind==='boss-level'){const next=advanceFirstBoss(this.ledger.bossLevel,this.ledger.bossMoreFire);this.ledger.bossLevel=next.level;this.ledger.bossMoreFire=next.moreFire;return;}
  if(event.kind==='warning'){this.warningTarget=event.name;this.warningTicks=event.seconds*15;this.ports.notice(event.name+'即将在'+event.seconds+'秒后出现');return;}
  let item:Item=event.kind==='create'?palacePrize(event.name):{...event.item};
  // Source createThing sets values for the advanced gem call sites.
  if(event.kind==='create'&&event.name.startsWith('高级')){const values:Record<string,[number,number]>={高级攻击宝石:[15,1000],高级减伤害宝石:[8,1000],高级经验宝石:[25,500],高级战斗力宝石:[5,2000]};const v=values[event.name];if(v){item.val1=v[0];item.salePrice=v[1];}}
  if(['武器','鞋','头盔','衣服'].includes(item.type))refreshEquipmentAttributes(item);else refreshItemNumbers(item);
  let x=m.x+75-this.random(150),y=m.y+25-this.random(50);if(!this.ports.contains(x,y)){x=m.x;y=m.y;}
  r.drops.push({item:{...item,number:item.number??0},x,y});
 }
}


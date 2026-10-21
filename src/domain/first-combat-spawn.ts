import type {LuckySpecies} from '../content/lucky-gate-data.ts';
import type {MonsterBehavior} from './monster-behavior.ts';
import type {CombatantNumbers} from '../content/pet-world-combat-rules.ts';
export interface FirstCombatMonster extends MonsterBehavior,CombatantNumbers {name:string;textColor:number;species:LuckySpecies|'死神战将'|'刺虫人'|'炎女'|'强盗'|'冰妖剑士'|'魔军士兵'|'魔军副将'|'魔军主将';attackFrames?:number;skillFrames?:number;runFrames?:number;level:number;life:number;maxLife:number;animationFrame:number}
export type CombatRegion=import('./black-abyss-field.ts').AbyssFieldRegion|import('./black-abyss-battle.ts').AbyssRegion|'icePalaceMirage'|import('./ice-palace-battle.ts').FrostRegion|import('./ice-battle.ts').IceRegion|import('./border-field.ts').BorderRegion|'borderMirage'|'southWildFive'|import('./south-rescue.ts').RescueRegion|'southMirage'|import('./south-battle.ts').SouthRegion|'swampMirage'|import('./swamp-battle.ts').SwampRegion|import('./gobi-battle.ts').GobiRegion|'gobiMirage'|'shuxinMirage'|'banditField'|'kasanoMirage'|'luckyGate'|'wildFour'|'wildFive'|'wildOne'|'wildTwo'|'wildThree';
export const isCombatRegion=(map:string):map is CombatRegion=>['abyssWildOne','abyssWildTwo','abyssWildThree','abyssLeft','abyssUp','abyssCenter','abyssDown','abyssRight','icePalaceMirage','frostLeft','frostUp','frostCenter','frostDown','frostRight','iceLeft','iceUp','iceCenter','iceDown','iceRight','borderWildOne','borderWildTwo','borderWildThree','borderWildFour','borderWildFive','borderMirage','southWildFive','southWildOne','southWildTwo','southWildThree','southWildFour','southPrison','southMirage','southLeft','southUp','southCenter','southDown','southRight','swampMirage','swampLeft','swampUp','swampCenter','swampDown','swampRight','gobiMirage','gobiLeft','gobiUp','gobiCenter','gobiDown','gobiRight','shuxinMirage','banditField','kasanoMirage','luckyGate','wildOne','wildTwo','wildThree','wildFour','wildFive'].includes(map);
export function spawnFirstCombat(random:(n:number)=>number,bossLevel?:number,region:CombatRegion='wildOne'):FirstCombatMonster[]{
 const mirage=region==='kasanoMirage',boss=bossLevel!==undefined,level=bossLevel??(region==='wildTwo'?3:region==='wildThree'||mirage?5:region==='wildFour'?8:1),scale=level+(boss?5:0);
 const elite=region==='wildTwo'||region==='wildFour';
 const points=mirage?[[60,300],[155,380],[320,400],[245,290]]:boss?[[95,325]]:elite?[[125,385],[475,355],[115,265],[245,290]]:[[region==='wildThree'?60:80,300],[155,380],[320,400],[220,305],[470,320],[495,250]];
 return points.map(([x,y],i)=>{
  const attackLength=150+random(20)-10,attackHeight=30+random(10)-5,facing=random(2)!==1?'right':'left';
  return {id:'monster'+(i+1),x:x!,y:y!,alive:true,facing,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:boss?150:90,
   guardLength:boss?400:elite||mirage?200:150,guardHeight:boss?150:elite||mirage?100:70,attackLength,attackHeight,speedX:boss?8:4,speedY:boss?4:2,
   minAttack:(.65+.8+.65*2)*(boss?1.5:1)*scale*.8,maxAttack:(.65+.8+.65*2)*(boss?1.5:1)*scale*1.2,defense:(.6+.75+.6*2)*scale,
   ranged:false,attackTypeNum:2,name:mirage?'幻影龙怪':boss?'龙怪头目':region==='wildTwo'?'鹿角兽精英':region==='wildFour'?'龙怪精英':region==='wildThree'?'龙怪':'鹿角兽',textColor:boss?16711680:elite||mirage?6724095:16777215,species:mirage||boss||region==='wildThree'||region==='wildFour'?'龙怪':'鹿角兽',level,life:51*(mirage?20:boss?10:elite?4:1)*scale,maxLife:51*(mirage?20:boss?10:elite?4:1)*scale,
   attackFire:Math.floor(level*2+(mirage?20:0)),burst:5,jook:boss?15:5,reduceDamage:0,wind:0,fire:0,water:0,soil:0,animationFrame:1};
 });
}


export type FinaleBossKind='initial'|'guard'|'king';
/** Source frame3 differs from flashBoss. Subsequent waves read the advanced ledger. */
export function spawnFinaleBoss(random:(n:number)=>number,kind:FinaleBossKind,level:number,moreFire:number):FirstCombatMonster[]{
 const monsters=spawnFirstCombat(random,level),m=monsters[0]!,scale=level+5;
 const high=kind==='initial'&&level>=30;
 const attack=kind==='initial'?(high?.65+.8*1.1+.65*2*1.1:.65+.8+.65*2):(kind==='guard'?.65+.8+.65*2*1.1:.65+.8*1.1+.65*2*1.1)*1.5;
 const defense=kind==='initial'?(high?.6+.75*1.5+.6*2*1.5:.6+.75+.6*2):.6+.75*1.1+.6*2*1.1;
 Object.assign(m,{name:kind==='initial'?'龙怪头目':kind==='guard'?'鹿角护卫':'龙王',species:kind==='guard'?'鹿角兽':'龙怪',textColor:kind==='king'?16763955:16711680,minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:defense*scale,life:51*(kind==='initial'?(high?11:8):12)*scale,maxLife:51*(kind==='initial'?(high?11:8):12)*scale,jook:kind==='initial'?5:15,attackFire:Math.floor(level*2+(kind==='initial'?(high?moreFire:0):moreFire+(kind==='guard'?10:20)))});
 return monsters;
}

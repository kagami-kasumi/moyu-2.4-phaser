import {isAbyssField,initialAbyssField,spawnAbyssField,spawnAbyssFieldBoss,type AbyssFieldRegion,type AbyssFieldBossKind} from '../domain/black-abyss-field.ts';
import type {GameProgress} from './save-types.ts';
export function promoteAbyssField(p:GameProgress,raw:Record<string,unknown>){if(!p.abyssField)p.abyssField={level:(raw.bossLevels8levels??130) as number,moreFire:(raw.bossLevels8moreFire??0) as number};}
export function validateAbyssField(p:Record<string,unknown>){
 const fail=():never=>{throw Error('黑渊野外存档无效');};
 const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:fail();
 const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 const integer=(v:unknown,min:number,max:number)=>finite(v,min,max)&&Number.isSafeInteger(v);
 const level=(v:unknown)=>integer(v,1,135)&&(v===1||(v as number)%5===0);
 if(p.abyssField!==undefined){const state=obj(p.abyssField);if(!level(state.level)||!integer(state.moreFire,0,270)||(state.moreFire as number)%5)fail();}
 const region=String(p.map),c=p.combat===undefined?undefined:obj(p.combat);
 if(!isAbyssField(region)){if(c&&['abyssFieldBossKind','abyssFieldBossFire','abyssFieldEliteLevel'].some(k=>c[k]!==undefined))fail();return;}
 if(!c||p.abyssField===undefined||p.combatLedger===undefined) return fail();
 if(['borderBossKind','borderBossFire','southBossKind','southBossFire','prisonWave','banditWave','lucky','bossKind','moreFire'].some(k=>c[k]!==undefined))fail();
 const kind=c.abyssFieldBossKind,hidden=region==='abyssWildThree';let expected;
 if(kind===undefined){
  if(hidden||c.boss!==false||c.abyssFieldBossFire!==undefined||c.abyssFieldEliteLevel!==undefined||c.chest!==undefined)fail();
  expected=spawnAbyssField(region,()=>0);if(c.level!==expected[0]!.level)fail();
 }else{
  if(!['initial','random','guard','king'].includes(String(kind))||!hidden&&kind!=='random'||c.boss!==true||!level(c.level)||!level(c.abyssFieldEliteLevel)||!integer(c.abyssFieldBossFire,0,270)||(c.abyssFieldBossFire as number)%5)fail();
  expected=[...spawnAbyssFieldBoss(kind as AbyssFieldBossKind,c.level as number,c.abyssFieldBossFire as number,()=>0),...spawnAbyssField(region,()=>0,c.abyssFieldEliteLevel as number).slice(hidden?0:1)];
 }
 if(!Array.isArray(c.monsters)||c.monsters.length!==expected.length||!integer(c.warningTicks,0,150))fail();
 const monsters=c.monsters as unknown[];
 monsters.forEach((value,n)=>{const m=obj(value),base=expected[n]!;if(!finite(m.life,0,base.maxLife)||!finite(m.x,-10000,10000)||!finite(m.y,-10000,10000)||!['left','right'].includes(String(m.facing))||!integer(m.attackLength,140,159)||!integer(m.attackHeight,25,34)||kind&&!hidden&&n>0&&m.life!==0)fail();});
 if((c.warningTicks as number)>0){
  const target=c.warningTarget;if(!['暗黑格拉斯头目','巨杰士护卫','暗黑之王','宝箱'].includes(String(target)))fail();
  if(target==='暗黑格拉斯头目'){if((c.warningTicks as number)>75||monsters.some(m=>obj(m).life!==0))fail();}
  else if(!hidden||obj(monsters[0]).life!==0||target!==(kind==='initial'||kind==='random'?'巨杰士护卫':kind==='guard'?'暗黑之王':'宝箱'))fail();
 }else if(c.warningTarget!==undefined)fail();
 if(c.chest!==undefined){const chest=obj(c.chest);if(!hidden||kind===undefined||kind==='initial'||!finite(chest.x,-10000,10000)||!finite(chest.y,-10000,10000)||typeof chest.opened!=='boolean')fail();}
}

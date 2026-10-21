import {isBorderField,initialBorderField,spawnBorderField} from '../domain/border-field.ts';
import type {GameProgress} from './save-types.ts';
export function promoteBorderField(p:GameProgress,raw:Record<string,unknown>){if(p.borderField)return;p.borderField={level:(raw.bossLevels5levels??initialBorderField().level) as number,moreFire:(raw.bossLevels5moreFire??0) as number};}
export function validateBorderField(p:Record<string,unknown>){
 const fail=():never=>{throw Error('边关野外头目存档无效');};
 const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:fail();
 const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 const integer=(v:unknown,min:number,max:number)=>finite(v,min,max)&&Number.isSafeInteger(v);
 if(p.borderField!==undefined){const s=obj(p.borderField);if(!integer(s.level,1,135)||(s.level!==1&&(s.level as number)%5!==0)||!integer(s.moreFire,0,270)||(s.moreFire as number)%5!==0)fail();}
 if(p.combat===undefined){if(isBorderField(String(p.map)))fail();return;}const c=obj(p.combat),kind=c.borderBossKind;
 if(kind===undefined){if(c.borderBossFire!==undefined||p.map==='borderWildFive')fail();if(!isBorderField(String(p.map)))return;
 if(c.boss!==false||c.southBossKind!==undefined||c.southBossFire!==undefined||c.prisonWave!==undefined||c.banditWave!==undefined||c.lucky!==undefined||c.bossKind!==undefined||c.moreFire!==undefined||c.chest!==undefined)fail();
 const expected=spawnBorderField(p.map as Parameters<typeof spawnBorderField>[0],()=>0);
 if(c.level!==expected[0]!.level||!Array.isArray(c.monsters)||c.monsters.length!==expected.length||!integer(c.warningTicks,0,75)||p.combatLedger===undefined)fail();
 (c.monsters as unknown[]).forEach((value,n)=>{const m=obj(value),base=expected[n]!;if(!finite(m.life,0,base.maxLife)||!finite(m.x,-10000,10000)||!finite(m.y,-10000,10000)||!['left','right'].includes(String(m.facing))||!integer(m.attackLength,140,159)||!integer(m.attackHeight,25,34))fail();});
 if((c.warningTicks as number)>0){if(!(c.monsters as unknown[]).every(m=>obj(m).life===0)||c.warningTarget!=='刺虫人头目')fail();}else if(c.warningTarget!==undefined)fail();return;}
 if(!isBorderField(String(p.map))||!['initial','random','guard','king'].includes(String(kind))||(kind==='random'?p.map==='borderWildFive':p.map!=='borderWildFive')||p.borderField===undefined)fail();
 if(c.southBossKind!==undefined||c.southBossFire!==undefined||c.boss!==true||c.prisonWave!==undefined||c.banditWave!==undefined||c.lucky!==undefined||c.bossKind!==undefined||c.moreFire!==undefined||!integer(c.level,1,135)||!integer(c.borderBossFire,0,270)||!integer(c.warningTicks,0,150)||!Array.isArray(c.monsters)||c.monsters.length!==1)fail();
 if((c.level!==1&&(c.level as number)%5!==0)||(c.borderBossFire as number)%5!==0)fail();const m=obj((c.monsters as unknown[])[0]);if(!finite(m.life,0,51*12*((c.level as number)+5))||!finite(m.x,-10000,10000)||!finite(m.y,-10000,10000)||!['left','right'].includes(String(m.facing))||!integer(m.attackLength,140,159)||!integer(m.attackHeight,25,34))fail();
 if(c.chest!==undefined){const chest=obj(c.chest);if(kind!=='king'||m.life!==0||c.warningTicks!==0||!finite(chest.x,-10000,10000)||!finite(chest.y,-10000,10000)||typeof chest.opened!=='boolean')fail();}
 if((c.warningTicks as number)>0){if(m.life!==0||kind==='random'||c.warningTarget!==(kind==='initial'?'提风护卫':kind==='guard'?'剌虫王':'宝箱')||c.chest!==undefined)fail();}else if(c.warningTarget!==undefined||m.life===0&&kind!=='random'&&c.chest===undefined)fail();
 if(p.combatLedger===undefined)fail();
}

import {isSouthField,initialSouthField} from '../domain/south-field.ts';
import type {GameProgress} from './save-types.ts';
export function promoteSouthField(p:GameProgress,raw:Record<string,unknown>){if(p.southField)return;p.southField={level:(raw.bossLevels4levels??initialSouthField().level) as number,moreFire:(raw.bossLevels4moreFire??0) as number};}
export function validateSouthField(p:Record<string,unknown>){
 const fail=():never=>{throw Error('南城野外头目存档无效');};
 const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:fail();
 const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 const integer=(v:unknown,min:number,max:number)=>finite(v,min,max)&&Number.isSafeInteger(v);
 if(p.southField!==undefined){const s=obj(p.southField);if(!integer(s.level,1,135)||(s.level!==1&&(s.level as number)%5!==0)||!integer(s.moreFire,0,270)||(s.moreFire as number)%5!==0)fail();}
 if(p.combat===undefined){if(p.map==='southWildFive')fail();return;}const c=obj(p.combat),kind=c.southBossKind;
 if(kind===undefined){if(c.southBossFire!==undefined||p.map==='southWildFive')fail();return;}
 if(!isSouthField(String(p.map))||!['initial','random','guard','king'].includes(String(kind))||(kind==='random'?p.map==='southWildFive':p.map!=='southWildFive')||p.southField===undefined)fail();
 if(c.boss!==true||c.prisonWave!==undefined||c.banditWave!==undefined||c.lucky!==undefined||c.bossKind!==undefined||c.moreFire!==undefined||!integer(c.level,1,135)||!integer(c.southBossFire,0,270)||!integer(c.warningTicks,0,150)||!Array.isArray(c.monsters)||c.monsters.length!==1)fail();
 if((c.level!==1&&(c.level as number)%5!==0)||(c.southBossFire as number)%5!==0)fail();const m=obj((c.monsters as unknown[])[0]);if(!finite(m.life,0,51*12*((c.level as number)+5))||!finite(m.x,-10000,10000)||!finite(m.y,-10000,10000)||!['left','right'].includes(String(m.facing))||!integer(m.attackLength,140,159)||!integer(m.attackHeight,25,34))fail();
 if(c.chest!==undefined){const chest=obj(c.chest);if(kind!=='king'||m.life!==0||c.warningTicks!==0||!finite(chest.x,-10000,10000)||!finite(chest.y,-10000,10000)||typeof chest.opened!=='boolean')fail();}
 if((c.warningTicks as number)>0){if(m.life!==0||kind==='random'||c.warningTarget!==(kind==='initial'?'恐兽护卫':kind==='guard'?'妖王':'宝箱')||c.chest!==undefined)fail();}else if(c.warningTarget!==undefined||m.life===0&&kind!=='random'&&c.chest===undefined)fail();
 if(p.combatLedger===undefined)fail();
}

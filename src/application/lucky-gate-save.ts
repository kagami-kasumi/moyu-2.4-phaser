import type {FirstCombatSave} from '../domain/first-combat.ts';
import {spawnLuckyWave,type LuckyWave} from '../domain/lucky-gate.ts';
/** Strict modern extension. Source files did not persist encounter progress. */
export function validateLuckyCombat(value:unknown):asserts value is FirstCombatSave {
 const fail=()=>{throw Error('幸运之门挑战存档无效');},obj=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=='object'||Array.isArray(v))return fail();return v as Record<string,unknown>;},int=(v:unknown,a:number,b:number)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=a&&v<=b;
 const c=obj(value),w=obj(c.lucky);if(!int(w.round,0,30)||!int(w.roleLevel,1,150)||!int(w.species,0,11)||typeof w.finished!=='boolean'||!int(w.fire,0,w.round===0?0:(w.round as number)%10===0?(w.round as number)*10-1:49)||w.finished&&w.round!==30)fail();
 if(c.banditWave!==undefined||c.boss!==false||c.bossKind!==undefined||c.moreFire!==undefined)fail();
 const generated=spawnLuckyWave({...w,finished:false} as unknown as LuckyWave,()=>0);if(c.level!==(generated[0]?.level??1)||!Array.isArray(c.monsters)||c.monsters.length!==generated.length)fail();
 (c.monsters as unknown[]).forEach((v,n)=>{const m=obj(v);if(typeof m.life!=='number'||!Number.isFinite(m.life)||m.life<0||m.life>generated[n]!.maxLife||!['left','right'].includes(String(m.facing))||!int(m.attackLength,140,159)||!int(m.attackHeight,25,34))fail();for(const p of [m.x,m.y])if(typeof p!=='number'||!Number.isFinite(p)||Math.abs(p)>10000)fail();});
 if(!int(c.warningTicks,0,w.round===0?45:(w.round as number)%10===0?150:45))fail();const allDead=(c.monsters as unknown[]).every(m=>obj(m).life===0);
 if((c.warningTicks as number)>0){if(!allDead||w.finished||c.warningTarget!==(w.round===30?'宝箱':'挑战怪物'))fail();}else if(c.warningTarget!==undefined)fail();
 if(w.round===0&&(c.warningTicks===0||w.finished))fail();if(w.finished!==!!c.chest)fail();
 if(c.chest){const chest=obj(c.chest);if(!allDead||c.warningTicks!==0||typeof chest.opened!=='boolean')fail();for(const p of [chest.x,chest.y])if(typeof p!=='number'||!Number.isFinite(p)||Math.abs(p)>10000)fail();}
 if(w.round!==0&&allDead&&!w.finished&&c.warningTicks===0)fail();
}

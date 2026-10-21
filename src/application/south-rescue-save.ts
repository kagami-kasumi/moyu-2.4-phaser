import {initialRescue,isRescueRegion,spawnRescue} from '../domain/south-rescue.ts';
import type {GameProgress} from './save-types.ts';
import {SAVE_NPCS} from '../content/save-field-data.ts';
export function promoteRescue(p:GameProgress,raw:Record<string,unknown>){
 if(p.rescue)return;const complete=raw.branchTask2isComplete===true||p.cityVisit?.southPrisonRescued===true;
 const npc=(name:string)=>SAVE_NPCS.findIndex(n=>n.id==='npc:'+name);
 p.rescue={...initialRescue(),isDoing:raw.branchTask2isDoing===true,isComplete:complete,son:complete?1:0,daughter:complete?1:0,dukeCmd:typeof raw['npcState'+npc('南城公爵')+'cmd']==='number'?raw['npcState'+npc('南城公爵')+'cmd'] as number:complete?9366:raw.branchTask2isDoing===true?9365:9361,chestCmd:raw['npcState'+npc('公爵的宝箱')+'cmd']===undefined?4020:typeof raw['npcState'+npc('公爵的宝箱')+'cmd']==='number'?raw['npcState'+npc('公爵的宝箱')+'cmd'] as number:null};
}
export function validateRescue(p:Record<string,unknown>){
 const fail=():never=>{throw Error('南城劫狱存档无效');};
 const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:fail();
 const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 if(p.rescue!==undefined){const q=obj(p.rescue);if(typeof q.isDoing!=='boolean'||typeof q.isComplete!=='boolean'||![0,1].includes(q.son as number)||![0,1].includes(q.daughter as number)||q.isComplete!==(q.son===1&&q.daughter===1)||!Number.isSafeInteger(q.dukeCmd)||!(q.chestCmd===null||Number.isSafeInteger(q.chestCmd)))fail();if(p.cityVisit&&obj(p.cityVisit).southPrisonRescued!==undefined&&obj(p.cityVisit).southPrisonRescued!==q.isComplete)fail();}
 if(p.map==='southCastle'&&(!p.rescue||obj(p.rescue).isComplete!==true))fail();
 if(!isRescueRegion(String(p.map)))return;const c=obj(p.combat),prison=p.map==='southPrison';if(!prison&&c.southBossKind!==undefined)return;
 if(prison?![1,2,3].includes(c.prisonWave as number):c.prisonWave!==undefined)fail();
 if(c.boss!==false||c.banditWave!==undefined||c.lucky!==undefined||c.bossKind!==undefined||c.moreFire!==undefined||c.chest!==undefined)fail();
 const expected=spawnRescue(p.map as Parameters<typeof spawnRescue>[0],()=>0,c.prisonWave as 1|2|3);
 if(c.level!==expected[0]!.level||!Array.isArray(c.monsters)||c.monsters.length!==expected.length||!finite(c.warningTicks,0,75)||!Number.isSafeInteger(c.warningTicks))fail();
 (c.monsters as unknown[]).forEach((value,n)=>{const m=obj(value),base=expected[n]!;if(!finite(m.life,0,base.maxLife)||!finite(m.x,-10000,10000)||!finite(m.y,-10000,10000)||!['left','right'].includes(String(m.facing))||!finite(m.attackLength,base.attackLength,base.attackLength+19)||!Number.isSafeInteger(m.attackLength)||!finite(m.attackHeight,base.attackHeight,base.attackHeight+9)||!Number.isSafeInteger(m.attackHeight))fail();});
 if(prison&&(c.prisonWave!==1||(c.warningTicks as number)>0)){const q=obj(p.rescue);const rescued=c.prisonWave===3&&(c.monsters as unknown[]).every(m=>obj(m).life===0);if(rescued?q.isComplete!==true:q.isDoing!==true||q.isComplete!==false)fail();}
 if((c.warningTicks as number)>0){if(!((c.monsters as unknown[]).every(m=>obj(m).life===0))||c.warningTarget!==(prison?(c.prisonWave===1?'监狱守卫':c.prisonWave===2?'监狱长':undefined):'炎女头目')||prison&&c.prisonWave===3)fail();}else if(c.warningTarget!==undefined)fail();
 if(p.combatLedger===undefined)fail();
}

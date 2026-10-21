import type {FirstCombatSave} from '../domain/first-combat.ts';
export function validateIcePalaceMirageCombat(value:unknown):asserts value is FirstCombatSave {
 const fail=():never=>{throw Error('冰宫幻境存档无效');};
 const object=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:fail();
 const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 const integer=(v:unknown,min:number,max:number)=>finite(v,min,max)&&Number.isSafeInteger(v),c=object(value);
 if(c.level!==125||c.boss!==false||c.warningTicks!==0||c.warningTarget!==undefined||c.banditWave!==undefined||c.lucky!==undefined||c.bossKind!==undefined||c.moreFire!==undefined||c.chest!==undefined||c.prisonWave!==undefined||c.borderBossKind!==undefined||c.borderBossFire!==undefined||c.southBossKind!==undefined||c.southBossFire!==undefined||!Array.isArray(c.monsters)||c.monsters.length!==4)fail();
 for(const value of c.monsters as unknown[]){const m=object(value);if(!finite(m.life,0,127500)||!finite(m.x,-10000,10000)||!finite(m.y,-10000,10000)||!['left','right'].includes(String(m.facing))||!integer(m.attackLength,140,159)||!integer(m.attackHeight,25,34))fail();}
}

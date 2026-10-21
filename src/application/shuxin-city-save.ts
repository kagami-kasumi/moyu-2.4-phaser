import type {FirstCombatSave} from '../domain/first-combat.ts';

export function validateShuxinMirageCombat(value:unknown):asserts value is FirstCombatSave {
 const fail=():never=>{throw Error('树心幻境存档无效');};
 const object=(input:unknown):Record<string,unknown>=>{if(!input||typeof input!=='object'||Array.isArray(input))return fail();return input as Record<string,unknown>;};
 const finite=(input:unknown,min:number,max:number)=>typeof input==='number'&&Number.isFinite(input)&&input>=min&&input<=max;
 const integer=(input:unknown,min:number,max:number)=>finite(input,min,max)&&Number.isSafeInteger(input);
 const combat=object(value);
 if(combat.level!==25||combat.boss!==false||combat.warningTicks!==0||combat.warningTarget!==undefined||combat.banditWave!==undefined||combat.lucky!==undefined||combat.bossKind!==undefined||combat.moreFire!==undefined||combat.chest!==undefined)fail();
 if(!Array.isArray(combat.monsters)||combat.monsters.length!==4)fail();
 for(const value of combat.monsters as unknown[]){
  const monster=object(value);
  if(!finite(monster.life,0,25500)||!finite(monster.x,-10000,10000)||!finite(monster.y,-10000,10000)||!['left','right'].includes(String(monster.facing))||!integer(monster.attackLength,140,159)||!integer(monster.attackHeight,25,34))fail();
 }
}

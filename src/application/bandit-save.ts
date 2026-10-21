import {spawnBandits,type BanditWave} from '../domain/shuxin-bandits.ts';
import type {FirstCombatSave} from '../domain/first-combat.ts';

export function validateBanditCombat(value:unknown):asserts value is FirstCombatSave {
 const fail=():never=>{throw Error('强盗遭遇存档无效');};
 const object=(input:unknown):Record<string,unknown>=>{if(!input||typeof input!=='object'||Array.isArray(input))return fail();return input as Record<string,unknown>;};
 const integer=(input:unknown,min:number,max:number)=>typeof input==='number'&&Number.isSafeInteger(input)&&input>=min&&input<=max;
 const combat=object(value);
 if(!integer(combat.banditWave,1,3)||combat.level!==20||combat.boss!==false||combat.lucky!==undefined||combat.bossKind!==undefined||combat.moreFire!==undefined||combat.chest!==undefined)fail();
 const generated=spawnBandits(combat.banditWave as BanditWave,()=>0);
 if(!Array.isArray(combat.monsters)||combat.monsters.length!==generated.length)fail();
 const monsters=combat.monsters as unknown[];
 monsters.forEach((value,index)=>{
  const monster=object(value);
  if(typeof monster.life!=='number'||!Number.isFinite(monster.life)||monster.life<0||monster.life>generated[index]!.maxLife||!['left','right'].includes(String(monster.facing))||!integer(monster.attackLength,140,159)||!integer(monster.attackHeight,25,34))fail();
  for(const coordinate of [monster.x,monster.y])if(typeof coordinate!=='number'||!Number.isFinite(coordinate)||Math.abs(coordinate)>10000)fail();
 });
 if(!integer(combat.warningTicks,0,75))fail();
 const allDead=monsters.every(monster=>object(monster).life===0);
 if((combat.warningTicks as number)>0){if(!allDead||combat.banditWave===3||combat.warningTarget!==(combat.banditWave===1?'第二批强盗':'强盗首领'))fail();}
 else if(combat.warningTarget!==undefined||allDead&&combat.banditWave!==3)fail();
}

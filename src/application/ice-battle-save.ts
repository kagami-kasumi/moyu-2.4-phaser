import {initialIceBattle,isIceRegion,iceFlag,ICE_REGIONS} from '../domain/ice-battle.ts';
import type {GameProgress} from './save-types.ts';

export function validateIceProgress(value:Record<string,unknown>){
 const fail=():never=>{throw Error('冰域战场或反攻存档无效');};
 const object=(input:unknown):Record<string,unknown>=>{if(!input||typeof input!=='object'||Array.isArray(input))return fail();return input as Record<string,unknown>;};
 const finite=(input:unknown,min:number,max:number)=>typeof input==='number'&&Number.isFinite(input)&&input>=min&&input<=max;
 const integer=(input:unknown,min:number,max:number)=>finite(input,min,max)&&Number.isSafeInteger(input);
 const state=value.iceBattle===undefined?undefined:object(value.iceBattle),quest=object(value.firstQuest??{}),region=String(value.map);
 if(state){for(const area of ICE_REGIONS)if(typeof state[iceFlag(area)]!=='boolean')fail();if(typeof state.oldCity!=='string'||state.oldCity.length>10000||!integer(state.warningTicks,0,75))fail();if(Number(state.warningTicks)>0&&(region!=='iceCorridor'||quest.counterattackActive!==true||object(quest.counterattack??{}).isComplete===true))fail();}
 if(quest.icePalaceActive!==undefined&&typeof quest.icePalaceActive!=='boolean'||quest.honorPrompt!==undefined&&typeof quest.honorPrompt!=='boolean')fail();
 for(const [key,max]of [['counterattack',1]] as const)if(quest[key]!==undefined){const task=object(quest[key]);if(!integer(task.number,0,max)||typeof task.isDoing!=='boolean'||typeof task.isComplete!=='boolean'||task.isComplete!==(task.number===max)||key==='counterattack'&&task.isDoing!==(quest.counterattackActive??false))fail();}
 if(region==='iceCorridor'&&!state)fail();
 if(!isIceRegion(region))return;
 if(!state||value.combatLedger===undefined)return fail();const combat=object(value.combat);
 if(combat.boss!==false||combat.warningTicks!==0||['borderBossKind','borderBossFire','southBossKind','southBossFire','prisonWave','warningTarget','banditWave','lucky','bossKind','moreFire','chest'].some(key=>combat[key]!==undefined))fail();
 if(!Array.isArray(combat.monsters)||![0,4].includes(combat.monsters.length))fail();
 const monsters=combat.monsters as unknown[];
 if(monsters.length&&state[iceFlag(region)]===false&&Number(object(monsters[0]).life)>0)fail();
 if(combat.level!==(monsters.length?(region==='iceRight'?75:72):1)||!monsters.length&&state[iceFlag(region)]!==false)fail();
 for(const [index,value]of monsters.entries()){
  const monster=object(value),boss=index===0,right=region==='iceRight';
  if(!finite(monster.life,0,boss?(right?61200:47124):10710)||!finite(monster.x,-10000,10000)||!finite(monster.y,-10000,10000)||!['left','right'].includes(String(monster.facing))||!integer(monster.attackLength,boss?190:140,boss?209:159)||!integer(monster.attackHeight,boss&&right?40:25,boss&&right?49:34))fail();
 }
}
export function promoteIceProgress(progress:GameProgress,raw:Record<string,unknown>){
 if(progress.iceBattle===undefined)progress.iceBattle={...initialIceBattle(),oldCity:(raw.map_oldCity??'卡萨诺城二') as string};
 const quest=progress.firstQuest;if(!quest)return;
 if(quest.counterattack===undefined&&(quest.counterattackActive===true||raw.mainTask11isDoing===true||raw.mainTask11isComplete===true)){quest.counterattackActive=(quest.counterattackActive??raw.mainTask11isDoing??false) as boolean;quest.counterattack={number:raw.mainTask11isComplete===true?1:0,isDoing:quest.counterattackActive,isComplete:(raw.mainTask11isComplete??false) as boolean};}
 if(quest.icePalaceActive===undefined&&raw.mainTask12isDoing===true)quest.icePalaceActive=true;
}

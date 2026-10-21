import {initialFrostBattle,isFrostRegion,frostFlag,FROST_REGIONS} from '../domain/ice-palace-battle.ts';
import type {GameProgress} from './save-types.ts';

export function validateFrostProgress(value:Record<string,unknown>){
 const fail=():never=>{throw Error('冰宫战场或进入冰宫存档无效');};
 const object=(input:unknown):Record<string,unknown>=>{if(!input||typeof input!=='object'||Array.isArray(input))return fail();return input as Record<string,unknown>;};
 const finite=(input:unknown,min:number,max:number)=>typeof input==='number'&&Number.isFinite(input)&&input>=min&&input<=max;
 const integer=(input:unknown,min:number,max:number)=>finite(input,min,max)&&Number.isSafeInteger(input);
 const state=value.frostBattle===undefined?undefined:object(value.frostBattle),quest=object(value.firstQuest??{}),region=String(value.map);
 if(state){for(const area of FROST_REGIONS)if(typeof state[frostFlag(area)]!=='boolean')fail();if(typeof state.oldCity!=='string'||state.oldCity.length>10000||!integer(state.warningTicks,0,75))fail();if(Number(state.warningTicks)>0&&(region!=='frostOutskirts'||quest.icePalaceActive!==true||object(quest.icePalace??{}).isComplete===true))fail();}
 if(quest.blackAbyssActive!==undefined&&typeof quest.blackAbyssActive!=='boolean'||quest.honorPrompt!==undefined&&typeof quest.honorPrompt!=='boolean')fail();
 for(const [key,max]of [['icePalace',1]] as const)if(quest[key]!==undefined){const task=object(quest[key]);if(!integer(task.number,0,max)||typeof task.isDoing!=='boolean'||typeof task.isComplete!=='boolean'||task.isComplete!==(task.number===max)||key==='icePalace'&&task.isDoing!==(quest.icePalaceActive??false))fail();}
 if(region==='frostOutskirts'&&!state)fail();
 if(!isFrostRegion(region))return;
 if(!state||value.combatLedger===undefined)return fail();const combat=object(value.combat);
 if(combat.boss!==false||combat.warningTicks!==0||['borderBossKind','borderBossFire','southBossKind','southBossFire','prisonWave','warningTarget','banditWave','lucky','bossKind','moreFire','chest'].some(key=>combat[key]!==undefined))fail();
 if(!Array.isArray(combat.monsters)||![0,4].includes(combat.monsters.length))fail();
 const monsters=combat.monsters as unknown[];
 if(monsters.length&&state[frostFlag(region)]===false&&Number(object(monsters[0]).life)>0)fail();
 if(combat.level!==(monsters.length?(region==='frostRight'?85:82):1)||!monsters.length&&state[frostFlag(region)]!==false)fail();
 for(const [index,value]of monsters.entries()){
  const monster=object(value),boss=index===0,right=region==='frostRight';
  if(!finite(monster.life,0,boss?(right?68850:66555):12240)||!finite(monster.x,-10000,10000)||!finite(monster.y,-10000,10000)||!['left','right'].includes(String(monster.facing))||!integer(monster.attackLength,boss?190:140,boss?209:159)||!integer(monster.attackHeight,boss&&right?40:25,boss&&right?49:34))fail();
 }
}
export function promoteFrostProgress(progress:GameProgress,raw:Record<string,unknown>){
 if(progress.frostBattle===undefined)progress.frostBattle={...initialFrostBattle(),oldCity:(raw.map_oldCity??'卡萨诺城二') as string};
 const quest=progress.firstQuest;if(!quest)return;
 if(quest.icePalace===undefined&&(quest.icePalaceActive===true||raw.mainTask12isDoing===true||raw.mainTask12isComplete===true)){quest.icePalaceActive=(quest.icePalaceActive??raw.mainTask12isDoing??false) as boolean;quest.icePalace={number:raw.mainTask12isComplete===true?1:0,isDoing:quest.icePalaceActive,isComplete:(raw.mainTask12isComplete??false) as boolean};}
 if(quest.blackAbyssActive===undefined&&raw.mainTask13isDoing===true)quest.blackAbyssActive=true;
}

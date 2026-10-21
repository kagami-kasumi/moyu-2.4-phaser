import {initialSwampBattle,isSwampRegion,swampFlag,SWAMP_REGIONS} from '../domain/swamp-battle.ts';
import type {GameProgress} from './save-types.ts';

export function validateSwampProgress(value:Record<string,unknown>){
 const fail=():never=>{throw Error('沼泽战场或进入沼泽存档无效');};
 const object=(input:unknown):Record<string,unknown>=>{if(!input||typeof input!=='object'||Array.isArray(input))return fail();return input as Record<string,unknown>;};
 const finite=(input:unknown,min:number,max:number)=>typeof input==='number'&&Number.isFinite(input)&&input>=min&&input<=max;
 const integer=(input:unknown,min:number,max:number)=>finite(input,min,max)&&Number.isSafeInteger(input);
 const state=value.swampBattle===undefined?undefined:object(value.swampBattle),quest=object(value.firstQuest??{}),region=String(value.map);
 if(state){for(const area of SWAMP_REGIONS)if(typeof state[swampFlag(area)]!=='boolean')fail();if(typeof state.oldCity!=='string'||state.oldCity.length>10000||!integer(state.warningTicks,0,75))fail();if(Number(state.warningTicks)>0&&(region!=='swampOutskirts'||quest.swampActive!==true||object(quest.swamp??{}).isComplete===true))fail();}
 if(quest.southActive!==undefined&&typeof quest.southActive!=='boolean'||quest.honorPrompt!==undefined&&typeof quest.honorPrompt!=='boolean')fail();
 for(const [key,max]of [['swamp',1]] as const)if(quest[key]!==undefined){const task=object(quest[key]);if(!integer(task.number,0,max)||typeof task.isDoing!=='boolean'||typeof task.isComplete!=='boolean'||task.isComplete!==(task.number===max)||key==='swamp'&&task.isDoing!==(quest.swampActive??false))fail();}
 if(region==='swampOutskirts'&&!state)fail();
 if(!isSwampRegion(region))return;
 if(!state||value.combatLedger===undefined)return fail();const combat=object(value.combat);
 if(combat.boss!==false||combat.warningTicks!==0||['warningTarget','banditWave','lucky','bossKind','moreFire','chest'].some(key=>combat[key]!==undefined))fail();
 if(!Array.isArray(combat.monsters)||![0,4].includes(combat.monsters.length))fail();
 const monsters=combat.monsters as unknown[];
 if(monsters.length&&state[swampFlag(region)]===false&&Number(object(monsters[0]).life)>0)fail();
 if(combat.level!==(monsters.length?(region==='swampRight'?55:52):1)||!monsters.length&&state[swampFlag(region)]!==false)fail();
 for(const [index,value]of monsters.entries()){
  const monster=object(value),boss=index===0,right=region==='swampRight';
  if(!finite(monster.life,0,boss?(right?45900:34884):7650)||!finite(monster.x,-10000,10000)||!finite(monster.y,-10000,10000)||!['left','right'].includes(String(monster.facing))||!integer(monster.attackLength,boss?190:140,boss?209:159)||!integer(monster.attackHeight,boss&&right?40:25,boss&&right?49:34))fail();
 }
}
export function promoteSwampProgress(progress:GameProgress,raw:Record<string,unknown>){
 if(progress.swampBattle===undefined)progress.swampBattle={...initialSwampBattle(),oldCity:(raw.map_oldCity??'卡萨诺城二') as string};
 const quest=progress.firstQuest;if(!quest)return;
 if(quest.swamp===undefined&&(quest.swampActive===true||raw.mainTask9isDoing===true||raw.mainTask9isComplete===true)){quest.swampActive=(quest.swampActive??raw.mainTask9isDoing??false) as boolean;quest.swamp={number:raw.mainTask9isComplete===true?1:0,isDoing:quest.swampActive,isComplete:(raw.mainTask9isComplete??false) as boolean};}
 if(quest.southActive===undefined&&raw.mainTask10isDoing===true)quest.southActive=true;
}

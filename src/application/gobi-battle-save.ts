import {initialGobiBattle,isGobiRegion,gobiFlag,GOBI_REGIONS} from '../domain/gobi-battle.ts';
import type {GameProgress} from './save-types.ts';

export function validateGobiProgress(value:Record<string,unknown>){
 const fail=():never=>{throw Error('戈壁战场或接应国王存档无效');};
 const object=(input:unknown):Record<string,unknown>=>{if(!input||typeof input!=='object'||Array.isArray(input))return fail();return input as Record<string,unknown>;};
 const finite=(input:unknown,min:number,max:number)=>typeof input==='number'&&Number.isFinite(input)&&input>=min&&input<=max;
 const integer=(input:unknown,min:number,max:number)=>finite(input,min,max)&&Number.isSafeInteger(input);
 const state=value.gobiBattle===undefined?undefined:object(value.gobiBattle),quest=object(value.firstQuest??{}),region=String(value.map);
 if(state){for(const area of GOBI_REGIONS)if(typeof state[gobiFlag(area)]!=='boolean')fail();if(typeof state.oldCity!=='string'||state.oldCity.length>10000||!integer(state.warningTicks,0,75))fail();if(Number(state.warningTicks)>0&&(region!=='gobiOutskirts'||quest.kingActive!==true||object(quest.king??{}).isComplete===true))fail();}
 if(quest.swampActive!==undefined&&typeof quest.swampActive!=='boolean'||quest.honorPrompt!==undefined&&typeof quest.honorPrompt!=='boolean')fail();
 for(const [key,max]of [['king',1],['honor',100]] as const)if(quest[key]!==undefined){const task=object(quest[key]);if(!integer(task.number,0,max)||typeof task.isDoing!=='boolean'||typeof task.isComplete!=='boolean'||task.isComplete!==(task.number===max)||key==='king'&&task.isDoing!==(quest.kingActive??false))fail();}
 if(region==='gobiOutskirts'&&!state)fail();
 if(!isGobiRegion(region))return;
 if(!state||value.combatLedger===undefined)return fail();const combat=object(value.combat);
 if(combat.boss!==false||combat.warningTicks!==0||['warningTarget','banditWave','lucky','bossKind','moreFire','chest'].some(key=>combat[key]!==undefined))fail();
 if(!Array.isArray(combat.monsters)||![0,4].includes(combat.monsters.length))fail();
 const monsters=combat.monsters as unknown[];
 if(monsters.length&&state[gobiFlag(region)]===false&&Number(object(monsters[0]).life)>0)fail();
 if(combat.level!==(monsters.length?35:1)||!monsters.length&&state[gobiFlag(region)]!==false)fail();
 for(const [index,value]of monsters.entries()){
  const monster=object(value),boss=index===0,right=region==='gobiRight';
  if(!finite(monster.life,0,boss?24480:153*(right?30:35))||!finite(monster.x,-10000,10000)||!finite(monster.y,-10000,10000)||!['left','right'].includes(String(monster.facing))||!integer(monster.attackLength,boss?(right?190:170):140,boss?(right?209:189):159)||!integer(monster.attackHeight,boss&&right?40:25,boss&&right?49:34))fail();
 }
}
export function promoteGobiProgress(progress:GameProgress,raw:Record<string,unknown>){
 if(progress.gobiBattle===undefined)progress.gobiBattle={...initialGobiBattle(),oldCity:(raw.map_oldCity??'卡萨诺城二') as string};
 const quest=progress.firstQuest;if(!quest)return;
 if(quest.king===undefined&&(quest.kingActive===true||raw.mainTask8isDoing===true||raw.mainTask8isComplete===true)){quest.kingActive=(quest.kingActive??raw.mainTask8isDoing??false) as boolean;quest.king={number:raw.mainTask8isComplete===true?1:0,isDoing:quest.kingActive,isComplete:(raw.mainTask8isComplete??false) as boolean};}
 if(quest.swampActive===undefined&&raw.mainTask9isDoing===true)quest.swampActive=true;
 if(quest.honor===undefined&&(raw.dailyTask11isDoing===true||raw.dailyTask11isComplete===true)){const complete=(raw.dailyTask11isComplete??false) as boolean;quest.honor={number:complete?100:(raw.dailyTask11need_number??0) as number,isDoing:(raw.dailyTask11isDoing??false) as boolean,isComplete:complete};}
}

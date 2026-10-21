import {initialSouthBattle,isSouthRegion,southFlag,SOUTH_REGIONS} from '../domain/south-battle.ts';
import type {GameProgress} from './save-types.ts';

export function validateSouthProgress(value:Record<string,unknown>){
 const fail=():never=>{throw Error('南城战场或进入南城存档无效');};
 const object=(input:unknown):Record<string,unknown>=>{if(!input||typeof input!=='object'||Array.isArray(input))return fail();return input as Record<string,unknown>;};
 const finite=(input:unknown,min:number,max:number)=>typeof input==='number'&&Number.isFinite(input)&&input>=min&&input<=max;
 const integer=(input:unknown,min:number,max:number)=>finite(input,min,max)&&Number.isSafeInteger(input);
 const state=value.southBattle===undefined?undefined:object(value.southBattle),quest=object(value.firstQuest??{}),region=String(value.map);
 if(state){for(const area of SOUTH_REGIONS)if(typeof state[southFlag(area)]!=='boolean')fail();if(typeof state.oldCity!=='string'||state.oldCity.length>10000||!integer(state.warningTicks,0,75))fail();if(Number(state.warningTicks)>0&&(region!=='southOutskirts'||quest.southActive!==true||object(quest.south??{}).isComplete===true))fail();}
 if(quest.counterattackActive!==undefined&&typeof quest.counterattackActive!=='boolean'||quest.honorPrompt!==undefined&&typeof quest.honorPrompt!=='boolean')fail();
 for(const [key,max]of [['south',1]] as const)if(quest[key]!==undefined){const task=object(quest[key]);if(!integer(task.number,0,max)||typeof task.isDoing!=='boolean'||typeof task.isComplete!=='boolean'||task.isComplete!==(task.number===max)||key==='south'&&task.isDoing!==(quest.southActive??false))fail();}
 if(region==='southOutskirts'&&!state)fail();
 if(!isSouthRegion(region))return;
 if(!state||value.combatLedger===undefined)return fail();const combat=object(value.combat);
 if(combat.boss!==false||combat.warningTicks!==0||['warningTarget','banditWave','lucky','bossKind','moreFire','chest'].some(key=>combat[key]!==undefined))fail();
 if(!Array.isArray(combat.monsters)||![0,4].includes(combat.monsters.length))fail();
 const monsters=combat.monsters as unknown[];
 if(monsters.length&&state[southFlag(region)]===false&&Number(object(monsters[0]).life)>0)fail();
 if(combat.level!==(monsters.length?(region==='southRight'?65:62):1)||!monsters.length&&state[southFlag(region)]!==false)fail();
 for(const [index,value]of monsters.entries()){
  const monster=object(value),boss=index===0,right=region==='southRight';
  if(!finite(monster.life,0,boss?(right?53550:41004):9180)||!finite(monster.x,-10000,10000)||!finite(monster.y,-10000,10000)||!['left','right'].includes(String(monster.facing))||!integer(monster.attackLength,boss?190:140,boss?209:159)||!integer(monster.attackHeight,boss&&right?40:25,boss&&right?49:34))fail();
 }
}
export function promoteSouthProgress(progress:GameProgress,raw:Record<string,unknown>){
 if(progress.southBattle===undefined)progress.southBattle={...initialSouthBattle(),oldCity:(raw.map_oldCity??'卡萨诺城二') as string};
 const quest=progress.firstQuest;if(!quest)return;
 if(quest.south===undefined&&(quest.southActive===true||raw.mainTask10isDoing===true||raw.mainTask10isComplete===true)){quest.southActive=(quest.southActive??raw.mainTask10isDoing??false) as boolean;quest.south={number:raw.mainTask10isComplete===true?1:0,isDoing:quest.southActive,isComplete:(raw.mainTask10isComplete??false) as boolean};}
 if(quest.counterattackActive===undefined&&raw.mainTask11isDoing===true)quest.counterattackActive=true;
}

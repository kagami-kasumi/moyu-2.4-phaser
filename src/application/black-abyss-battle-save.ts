import {initialAbyssBattle,isAbyssRegion,abyssFlag,ABYSS_REGIONS} from '../domain/black-abyss-battle.ts';
import type {GameProgress} from './save-types.ts';

export function validateAbyssProgress(value:Record<string,unknown>){
 const fail=():never=>{throw Error('黑渊战场或进入黑渊存档无效');};
 const object=(input:unknown):Record<string,unknown>=>{if(!input||typeof input!=='object'||Array.isArray(input))return fail();return input as Record<string,unknown>;};
 const finite=(input:unknown,min:number,max:number)=>typeof input==='number'&&Number.isFinite(input)&&input>=min&&input<=max;
 const integer=(input:unknown,min:number,max:number)=>finite(input,min,max)&&Number.isSafeInteger(input);
 const state=value.abyssBattle===undefined?undefined:object(value.abyssBattle),quest=object(value.firstQuest??{}),region=String(value.map);
 if(state){for(const area of ABYSS_REGIONS)if(typeof state[abyssFlag(area)]!=='boolean')fail();if(typeof state.oldCity!=='string'||state.oldCity.length>10000||!integer(state.warningTicks,0,75))fail();if(Number(state.warningTicks)>0&&(region!=='abyssEntrance'||quest.blackAbyssActive!==true||object(quest.blackAbyss??{}).isComplete===true))fail();}
 if(quest.firstLegionRebirth!==undefined&&!integer(quest.firstLegionRebirth,0,Number.MAX_SAFE_INTEGER))fail();
 if(quest.firstLegionActive!==undefined&&typeof quest.firstLegionActive!=='boolean'||quest.honorPrompt!==undefined&&typeof quest.honorPrompt!=='boolean')fail();
 for(const [key,max]of [['blackAbyss',1]] as const)if(quest[key]!==undefined){const task=object(quest[key]);if(!integer(task.number,0,max)||typeof task.isDoing!=='boolean'||typeof task.isComplete!=='boolean'||task.isComplete!==(task.number===max)||key==='blackAbyss'&&task.isDoing!==(quest.blackAbyssActive??false))fail();}
 if(region==='abyssEntrance'&&!state)fail();
 if(!isAbyssRegion(region))return;
 if(!state||value.combatLedger===undefined)return fail();const combat=object(value.combat);
 if(combat.boss!==false||combat.warningTicks!==0||['borderBossKind','borderBossFire','southBossKind','southBossFire','prisonWave','warningTarget','banditWave','lucky','bossKind','moreFire','chest'].some(key=>combat[key]!==undefined))fail();
 if(!Array.isArray(combat.monsters)||![0,4].includes(combat.monsters.length))fail();
 const monsters=combat.monsters as unknown[];
 if(monsters.length&&state[abyssFlag(region)]===false&&Number(object(monsters[0]).life)>0)fail();
 if(combat.level!==(monsters.length?(region==='abyssRight'?95:92):1)||!monsters.length&&state[abyssFlag(region)]!==false)fail();
 for(const [index,value]of monsters.entries()){
  const monster=object(value),boss=index===0,right=region==='abyssRight';
  if(!finite(monster.life,0,boss?(right?76500:region==='abyssLeft'?89046:74205):13770)||!finite(monster.x,-10000,10000)||!finite(monster.y,-10000,10000)||!['left','right'].includes(String(monster.facing))||!integer(monster.attackLength,boss?190:140,boss?209:159)||!integer(monster.attackHeight,25,34))fail();
 }
}
export function promoteAbyssProgress(progress:GameProgress,raw:Record<string,unknown>){
 if(progress.abyssBattle===undefined)progress.abyssBattle={...initialAbyssBattle(),oldCity:(raw.map_oldCity??'卡萨诺城二') as string};
 const quest=progress.firstQuest;if(!quest)return;if(quest.firstLegionRebirth===undefined&&typeof raw.mainBossLv==='number'&&Number.isSafeInteger(raw.mainBossLv)&&raw.mainBossLv>0)quest.firstLegionRebirth=raw.mainBossLv as number;
 if(quest.blackAbyss===undefined&&(quest.blackAbyssActive===true||raw.mainTask13isDoing===true||raw.mainTask13isComplete===true)){quest.blackAbyssActive=(quest.blackAbyssActive??raw.mainTask13isDoing??false) as boolean;quest.blackAbyss={number:raw.mainTask13isComplete===true?1:0,isDoing:quest.blackAbyssActive,isComplete:(raw.mainTask13isComplete??false) as boolean};}
 if(quest.firstLegionActive===undefined&&raw.mainTask14isDoing===true)quest.firstLegionActive=true;
}

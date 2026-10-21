import {PET_SHOP_UPGRADES} from '../content/pet-shop-upgrade-data.ts';
import {SHOP_UPGRADES} from '../content/shop-upgrade-data.ts';
import {ROLE_PROGRESSION_RULES} from '../content/role-progression-rules.ts';
import {skillFields} from '../domain/character-skills.ts';
import {SAVE_FIELDS,SAVE_NPCS} from '../content/save-field-data.ts';
import {contentOfKind,itemContentId} from '../content/registry.ts';
import {CHARACTERS} from '../content/character-entry.ts';
import type {GameProgress} from './save-types.ts';

export const SOURCE_EQUIPMENT=['头盔','衣服','武器','鞋','幸运符','戒指'] as const;
/** Reviewed expressions contain string literals, i and n only; never execute source text. */
export function concreteKey(expression:string,i=0,n=0){return expression.split(' + ').map(t=>t==='i'?String(i):t==='n'?String(n):/^"[^"]*"$/.test(t)?JSON.parse(t) as string:(()=>{throw Error('未支持的源键表达式');})()).join('');}
const unwrap=(v:unknown):unknown=>v&&typeof v==='object'&&'state'in v&&(v as {state:string}).state==='undefined'?undefined:v;
const quests=contentOfKind('quest'),skills=contentOfKind('skill'),buildings=contentOfKind('building'),bosses=contentOfKind('boss-growth');
export function sourceFieldInstances(f:typeof SAVE_FIELDS[number],p:GameProgress):{i:number;n?:number;value?:unknown}[]{
 if(!f.dynamic)return [{i:0}];
 const size=f.owner==='backPack'?40:f.owner==='fastKey'?7:f.owner==='wareHouse'?54:f.owner==='equipment'?6:f.owner==='huanShouItem.bell'?3:f.owner==='mainCastle.building'?buildings.length:f.owner==='map.npcState'?SAVE_NPCS.length:f.owner==='roleSkills'?skills.length:f.owner==='map'?bosses.length:f.owner==='allTitle'?contentOfKind('pet').length:f.owner==='huanShou.allHuanShou'?p.reward.pets.length:f.owner==='friend'?0:-1;
 if(size>=0)return Array.from({length:size},(_,i)=>({i:i+(['backPack','fastKey','wareHouse','huanShouItem.bell'].includes(f.owner)?1:0)}));
 if(f.owner.startsWith('task.'))return quests.filter(q=>q.data.sourceGroup===f.owner.slice(5)).flatMap(q=>{
  const i=Number(q.data.sourceIndex),data=q.data,needs=Array.isArray(data.need)?data.need:[];
  if(f.key.includes(' + n + '))return needs.map((need,n)=>({i,n,value:unwrap((need as Record<string,unknown>)[f.property])}));
  return [{i,value:f.key.endsWith('"need_number"')?unwrap((needs[0] as Record<string,unknown>|undefined)?.number):f.key.endsWith('"need_length"')?needs.length:unwrap(data[f.property])}];
 });
 throw Error('未映射持久字段域 '+f.owner);
}

/** New-game initialization only. Unimplemented generated values are explicitly deferred,
 * never guessed or executed. Loaded raw keys bypass all seed/default logic. */
export function initialSource(p:GameProgress){
 const source:Record<string,unknown>={},deferred:string[]=[];
 for(const f of SAVE_FIELDS)for(const instance of sourceFieldInstances(f,p)){
  const {i,n}=instance,key=f.dynamic?concreteKey(f.key,i,n):f.key;
  let value:unknown='value'in f?unwrap(f.value):undefined;
  if('values'in f)value=unwrap(f.values?.[i]?.value);
  if(f.owner==='map.npcState'&&f.dynamic)value=unwrap((SAVE_NPCS[i]!.values as Record<string,unknown>)[f.property]);
  if(f.owner.startsWith('task.')&&'value'in instance)value=instance.value;
  if(f.owner==='roleSkills')value=f.property==='name'?skills[i]!.name:skills[i]!.name===CHARACTERS[p.profession].skill?1:0;
  if(value===undefined&&!['backPack','fastKey','wareHouse','equipment','huanShouItem.bell','make','makeBell','splitStone','castleStone'].includes(f.owner)&&!['content-template-or-generator','no-initial-reference'].includes(f.seedStatus))deferred.push(key);
  source[key]=value;
 }
 Object.assign(source,{playID:Math.floor(Math.random()*100000)+1,role_lifeSourseLevels:1,role_mpSourseLevels:1,role_lifeSourse:0,role_mpSourse:0,role_maxLifeSourse:p.vitals.maxLife,role_maxMpSourse:p.vitals.maxMp});
 return {source,deferred,buildings:Object.fromEntries(buildings.map(b=>[b.id,{needMainLevels:b.data.needMainLevels}]))};
}

/** Write only fields represented by live domain owners; opaque source keys remain untouched. */
export function updateSource(raw:Record<string,unknown>,p:GameProgress):Record<string,unknown>{
 const s=structuredClone(raw),r=p.reward,v=p.vitals,i=p.inventory;
 if(r.petCollectionEdited){
  const oldCount=typeof raw.allHuanShou_length==='number'&&Number.isInteger(raw.allHuanShou_length)&&raw.allHuanShou_length>=0&&raw.allHuanShou_length<=40?raw.allHuanShou_length:r.pets.length;
  for(const key of Object.keys(s)){const match=/^allHuanShou(\d+)[A-Za-z_]/.exec(key);if(match&&Number(match[1])<Math.max(oldCount,r.pets.length))delete s[key];}
  for(const [n,pet]of r.pets.entries()){
   for(const f of SAVE_FIELDS)if(f.owner==='huanShou.allHuanShou'&&f.dynamic)s[concreteKey(f.key,n)]=('value'in f?unwrap(f.value):undefined);
   for(const [key,value]of Object.entries(pet.sourceExtras??{}))s['allHuanShou'+n+key]=structuredClone(value);
  }
 }
 if(p.petTitles)p.petTitles.forEach((n,i)=>{if(n!==null)s['allTitle'+i]=n;});
 if(p.petProgression)s.maxBattleNum=p.petProgression.maxBattleNum;
 if(p.marshalQuests)p.marshalQuests.forEach((q,n)=>{s[`branchTask${n}isDoing`]=q.isDoing;s[`branchTask${n}isComplete`]=q.isComplete;});
 if(p.firstQuest){s[`mainTask${p.initialState.mainTask.index+2}isDoing`]=p.firstQuest.secondActive;if(p.firstQuest.later)p.firstQuest.later.forEach((t,n)=>{s[`mainTask${p.initialState.mainTask.index+(n+1)*2}isDoing`]=t.isDoing;s[`mainTask${p.initialState.mainTask.index+(n+1)*2}isComplete`]=t.isComplete;});if(p.firstQuest.fourthActive!==undefined)s.mainTask6isDoing=p.firstQuest.fourthActive;if(p.firstQuest.fourth)s.mainTask6isComplete=p.firstQuest.fourth.isComplete;if(p.firstQuest.nextActive!==undefined)s.mainTask7isDoing=p.firstQuest.nextActive;if(p.firstQuest.bandits){s.mainTask7isDoing=p.firstQuest.bandits.isDoing;s.mainTask7isComplete=p.firstQuest.bandits.isComplete;}if(p.firstQuest.kingActive!==undefined)s.mainTask8isDoing=p.firstQuest.kingActive;}
 if(p.iceBattle&&(p.map.startsWith('ice')||p.cityVisit?.homeCity==='冰域战场左'))s.map_oldCity=p.iceBattle.oldCity;
 if(p.gobiBattle)s.map_oldCity=p.gobiBattle.oldCity;if(p.swampBattle&&(p.map.startsWith('swamp')||p.cityVisit?.homeCity==='沼泽战场左'))s.map_oldCity=p.swampBattle.oldCity;if(p.southBattle&&(p.map.startsWith('south')||p.cityVisit?.homeCity==='南城战场左'))s.map_oldCity=p.southBattle.oldCity;
 if(p.iceBattle&&(p.map.startsWith('ice')||p.cityVisit?.homeCity==='冰域战场左'))s.map_oldCity=p.iceBattle.oldCity;
 if(p.firstQuest?.king){s.mainTask8isDoing=p.firstQuest.king.isDoing;s.mainTask8isComplete=p.firstQuest.king.isComplete;}if(p.firstQuest?.swampActive!==undefined)s.mainTask9isDoing=p.firstQuest.swampActive;if(p.firstQuest?.swamp){s.mainTask9isDoing=p.firstQuest.swamp.isDoing;s.mainTask9isComplete=p.firstQuest.swamp.isComplete;}if(p.firstQuest?.southActive!==undefined)s.mainTask10isDoing=p.firstQuest.southActive;if(p.firstQuest?.south){s.mainTask10isDoing=p.firstQuest.south.isDoing;s.mainTask10isComplete=p.firstQuest.south.isComplete;}if(p.firstQuest?.counterattackActive!==undefined)s.mainTask11isDoing=p.firstQuest.counterattackActive;if(p.firstQuest?.honor){s.dailyTask11isDoing=p.firstQuest.honor.isDoing;s.dailyTask11isComplete=p.firstQuest.honor.isComplete;if(p.firstQuest.honor.isDoing)s.dailyTask11need_number=p.firstQuest.honor.number;}
 if(p.frostBattle&&(p.map.startsWith('frost')||p.cityVisit?.homeCity==='冰宫战场左'))s.map_oldCity=p.frostBattle.oldCity;
 if(p.firstQuest?.icePalace){s.mainTask12isDoing=p.firstQuest.icePalace.isDoing;s.mainTask12isComplete=p.firstQuest.icePalace.isComplete;}if(p.firstQuest?.blackAbyssActive!==undefined)s.mainTask13isDoing=p.firstQuest.blackAbyssActive;
 if(p.firstQuest?.counterattack){s.mainTask11isDoing=p.firstQuest.counterattack.isDoing;s.mainTask11isComplete=p.firstQuest.counterattack.isComplete;}if(p.firstQuest?.icePalaceActive!==undefined)s.mainTask12isDoing=p.firstQuest.icePalaceActive;
 if(p.borderField){s.bossLevels5levels=p.borderField.level;s.bossLevels5moreFire=p.borderField.moreFire;}
 if(p.southField){s.bossLevels4levels=p.southField.level;s.bossLevels4moreFire=p.southField.moreFire;}
 if(p.combatLedger){s.bossLevels0levels=p.combatLedger.bossLevel;s.bossLevels0moreFire=p.combatLedger.bossMoreFire;s.role_overflowExp=p.combatLedger.overflowExp;s.XPPower_nowPower=p.combatLedger.nowPower;s.XPPower_nowExp=p.combatLedger.nowExp;}
 if(p.rescue){s.branchTask2isDoing=p.rescue.isDoing;s.branchTask2isComplete=p.rescue.isComplete;for(const [name,cmd]of [['南城公爵',p.rescue.dukeCmd],['公爵的宝箱',p.rescue.chestCmd]] as const){const index=SAVE_NPCS.findIndex(n=>n.id==='npc:'+name);if(cmd!==null)s['npcState'+index+'cmd']=cmd;}}
 if(p.cityVisit){if(p.cityVisit.icePalaceMirageGranted!==undefined)s.map_冰宫获得幻境=p.cityVisit.icePalaceMirageGranted;if(p.cityVisit.borderMirageGranted!==undefined)s.map_边关获得幻境=p.cityVisit.borderMirageGranted;s.map_homeCity=p.cityVisit.homeCity;if(p.cityVisit.southMirageGranted!==undefined)s.map_南城获得幻境=p.cityVisit.southMirageGranted;if(p.cityVisit.southPrisonRescued!==undefined)s.branchTask2isComplete=p.cityVisit.southPrisonRescued;s.map_卡萨诺城获得幻境=p.cityVisit.mirageGranted;if(p.cityVisit.swampMirageGranted!==undefined)s.map_沼泽获得幻境=p.cityVisit.swampMirageGranted;if(p.cityVisit.gobiMirageGranted!==undefined)s.map_戈壁获得幻境=p.cityVisit.gobiMirageGranted;if(p.cityVisit.gobiPetShopOpenNumber!==undefined)s.huanShouShop2=p.cityVisit.gobiPetShopOpenNumber;if(p.cityVisit.shuxinMirageGranted!==undefined)s.map_树心城获得幻境=p.cityVisit.shuxinMirageGranted;}
 if(p.warehouse)s.wareHouse_number=54;
 if(p.outskirtsProperty!==undefined)s.map_卡萨诺城产权=p.outskirtsProperty;
 if(p.royalChests){for(const [kind,title]of [['prince','王子的宝箱'],['princess','公主的宝箱']] as const){const cmd=p.royalChests[kind];if(cmd!==null){const n=SAVE_NPCS.findIndex(v=>v.id==='npc:'+title);s['npcState'+n+'cmd']=cmd;}}}
 if(i.militaryRank!==undefined){s.role_militaryRank=i.militaryRank;s.role_militaryRankName=ROLE_PROGRESSION_RULES.militaryRanks[i.militaryRank]!;s.role_militaryRankFire=i.militaryRankFire??0;}
 if(i.nobilityRank!==undefined){s.role_chaw=i.nobilityRank;s.role_chawName=ROLE_PROGRESSION_RULES.nobility[i.nobilityRank]!.name;s.role_chawFire=ROLE_PROGRESSION_RULES.nobility[i.nobilityRank]!.fire;}
 if(r.upLevelPrize!==undefined)s.upLevelPrize=r.upLevelPrize;
 if(i.maxLevel!==undefined)s.role_maxLevels=i.maxLevel;
 if(p.shop){s.shop=p.shop.openNumber;if(p.shop.upgrades){const n=SAVE_NPCS.findIndex(n=>n.id==='npc:杂货商');s['npcState'+n+'jobLevels']=p.shop.upgrades.level;SHOP_UPGRADES.forEach((q,i)=>{const t=p.shop!.upgrades!.tasks[i]!;s['branchTask'+q.index+'isDoing']=t.isDoing;s['branchTask'+q.index+'isComplete']=t.isComplete;});}}
 if(p.petShop){s.huanShouShop=p.petShop.openNumber;if(p.petShop.upgrades){const n=SAVE_NPCS.findIndex(n=>n.id==='npc:幻兽商');s['npcState'+n+'jobLevels']=p.petShop.upgrades.level;PET_SHOP_UPGRADES.forEach((q,i)=>{const t=p.petShop!.upgrades!.tasks[i]!;s['branchTask'+q.index+'isDoing']=t.isDoing;s['branchTask'+q.index+'isComplete']=t.isComplete;});}}
 if(p.pharmacy)s.drugShop=p.pharmacy.openNumber;
 Object.assign(s,{saved:true,versions:1.8,saveTime:new Date().toISOString(),role_myName:p.name,role_vocational:p.profession,role_levels:v.level,role_life:v.life,role_maxLife:v.maxLife,role_mp:v.mp,role_maxMp:v.maxMp,role_nowExp:v.exp,role_maxExp:v.maxExp,role_ms:r.ms,role_res:r.res,role_credit:r.credit,role_titleLevel:r.titleLevel,role_exploit:i.exploit,role_militaryExploit:i.militaryExploit,role_x:p.x,role_y:p.y,map_nowMap:p.map==='icePalaceCity'?'冰宫':p.map==='icePalaceMirage'?'冰宫幻境':p.map==='frostOutskirts'?'冰宫郊区':p.map==='frostLeft'?'冰宫战场左':p.map==='frostUp'?'冰宫战场上':p.map==='frostCenter'?'冰宫战场中':p.map==='frostDown'?'冰宫战场下':p.map==='frostRight'?'冰宫战场右':p.map==='iceCorridor'?'冰封走廊':p.map==='iceLeft'?'冰域战场左':p.map==='iceUp'?'冰域战场上':p.map==='iceCenter'?'冰域战场中':p.map==='iceDown'?'冰域战场下':p.map==='iceRight'?'冰域战场右':p.map==='borderWildOne'?'边关野外一':p.map==='borderWildTwo'?'边关野外二':p.map==='borderWildThree'?'边关野外三':p.map==='borderWildFour'?'边关野外四':p.map==='borderWildFive'?'边关野外五':p.map==='borderCity'?'边关':p.map==='borderOutskirts'?'边关郊区':p.map==='borderMirage'?'边境幻境':p.map==='southWildOne'?'南城野外一':p.map==='southWildTwo'?'南城野外二':p.map==='southWildThree'?'南城野外三':p.map==='southWildFour'?'南城野外四':p.map==='southWildFive'?'南城野外五':p.map==='southPrison'?'监狱':p.map==='southCastle'?'公爵城堡':p.map==='southCity'?'南城一':p.map==='southSecond'?'南城二':p.map==='southMirage'?'南城幻境':p.map==='southOutskirts'?'南城郊区':p.map==='southLeft'?'南城战场左':p.map==='southUp'?'南城战场上':p.map==='southCenter'?'南城战场中':p.map==='southDown'?'南城战场下':p.map==='southRight'?'南城战场右':p.map==='swampCity'?'沼泽':p.map==='swampMirage'?'沼泽幻境':p.map==='swampOutskirts'?'沼泽郊区':p.map==='swampLeft'?'沼泽战场左':p.map==='swampUp'?'沼泽战场上':p.map==='swampCenter'?'沼泽战场中':p.map==='swampDown'?'沼泽战场下':p.map==='swampRight'?'沼泽战场右':p.map==='gobiCity'?'戈壁':p.map==='gobiMirage'?'戈壁幻境':p.map==='gobiOutskirts'?'戈壁郊区':p.map==='gobiLeft'?'戈壁战场左':p.map==='gobiUp'?'戈壁战场上':p.map==='gobiCenter'?'戈壁战场中':p.map==='gobiDown'?'戈壁战场下':p.map==='gobiRight'?'戈壁战场右':p.map==='shuxinCity'?'树心城':p.map==='shuxinMirage'?'树心幻境':p.map==='shuxinOutskirts'?'树心城郊区':p.map==='shuxinRoad'?'树心路':p.map==='banditField'?'树平':p.map==='kasanoMirage'?'卡萨诺幻境':p.map==='luckyGate'?'幸运之门':p.map==='wildFour'?'卡萨诺城野外四':p.map==='wildFive'?'卡萨诺城野外五':p.map==='wildTwo'?'卡萨诺城野外二':p.map==='wildThree'?'卡萨诺城野外三':p.map==='wildOne'?'卡萨诺城野外一':p.map==='eastPalace'?'东宫':p.map==='outerHall'?'殿外':p.map==='garden'?'花园':p.map==='observatory'?'观天亭':p.map==='palace'?'皇宫':p.map==='cityThird'?'卡萨诺城三':p.map==='citySecond'?'卡萨诺城二':p.map==='city'?'卡萨诺城一':'卡萨诺城郊区',allHuanShou_length:r.pets.length});
 if(i.consumables){for(const [key,value]of Object.entries(i.consumables))s[(key==='maxPower'||key==='isFull'?'XPPower_':'role_')+key]=value;s.role_maxLifeSourse=v.maxLife*i.consumables.lifeSourseLevels;s.role_maxMpSourse=v.maxMp*i.consumables.mpSourseLevels;}
 for(const f of SAVE_FIELDS){
  if(f.owner==='wareHouse'&&f.dynamic&&p.warehouse)for(let n=0;n<54;n++)if(!p.warehouse.reserved.includes(n))s[concreteKey(f.key,n+1)]=p.warehouse.items[n]?.[f.property];
  if(f.owner==='huanShouItem.bell'&&p.petProgression?.bells)for(let n=0;n<3;n++)if(!p.petProgression.reserved?.includes(n))s[concreteKey(f.key,n+1)]=p.petProgression.bells[n]?.[f.property];
  if(f.owner==='backPack'&&f.dynamic)for(let n=0;n<40;n++)s[concreteKey(f.key,n+1)]=r.bag[n]?.[f.property];
  if(f.owner==='equipment')SOURCE_EQUIPMENT.forEach((slot,n)=>{if(slot!=='幸运符')s[concreteKey(f.key,n)]=i.equipment[slot]?.[f.property];});
  if(f.owner==='makeBell'&&p.bellFusion){const slot=f.key.split('_')[1] as 'item1'|'item2';if(!p.bellFusion.reserved.includes(slot))s[f.key]=p.bellFusion[slot]?.[f.key.slice(('makeBell_'+slot+'_').length)];}
  if(f.owner==='castleStone'&&p.fusion){const slot=f.key.split('_')[1] as 'stone1'|'stone2',prefix='castleStone_'+slot+'_',item=p.fusion[slot],rawType=raw[prefix+'type'];const opaque=item===null&&typeof rawType==='string'&&rawType!=='空格'&&(rawType!=='宝石'||!itemContentId({type:rawType,name:raw[prefix+'name'] as string|undefined}));if(!opaque)s[f.key]=item?.[f.key.slice(prefix.length)];}
  if(f.owner==='splitStone'&&p.splitStone){const slot=f.key.startsWith('splitStone_item_')?'item':f.key.split('_')[1] as 'stone1'|'stone2'|'stone3';if(slot in p.splitStone){const prefix='splitStone_'+slot+'_',rawType=raw[prefix+'type'];const opaque=p.splitStone[slot]===null&&typeof rawType==='string'&&rawType!=='空格'&&!itemContentId({type:rawType,name:raw[prefix+'name'] as string|undefined,vocational:raw[prefix+'vocational'] as string|undefined});if(!opaque)s[f.key]=p.splitStone[slot]?.[f.key.slice(prefix.length)];}}
  if(f.owner==='make'){const slot=f.key.startsWith('make_item_')?'item':'stone';s[f.key]=p.crafting[slot]?.[f.key.slice(('make_'+slot+'_').length)];}
  if(f.owner==='huanShou.allHuanShou'&&f.dynamic)r.pets.forEach((pet,n)=>{if(f.property in pet)s[concreteKey(f.key,n)]=(pet as unknown as Record<string,unknown>)[f.property];});
 }
 if(i.skills){for(const [key,value]of Object.entries(skillFields(i.skills,p.profession)))if(key!=='skillAddFire')s['role_'+key]=value;s.XPPower_isUsed=i.xpEnabled??false;}
 const elder=SAVE_NPCS.findIndex(n=>n.id==='npc:老兵');s[`npcState${elder}cmd`]=r.cmd;
 for(const [slot,name]of Object.entries(p.initialState.fastKeys)){s[`fastKey${slot}type`]='技能图标';s[`fastKey${slot}name`]=name;}
 s[`mainTask${p.initialState.mainTask.index}isDoing`]=p.initialState.mainTask.isDoing;s[`mainTask${p.initialState.mainTask.index}isComplete`]=p.initialState.mainTask.isComplete;
 skills.forEach((skill,n)=>{const live=i.skills?{level:i.skills[skill.name]??0}:p.initialState.skills.find(v=>v.name===skill.name);if(live||skill.name==='英勇'){s[`allSkills${n}name`]=skill.name;s[`allSkills${n}levels`]=skill.name==='英勇'?i.bravery:live!.level;}});
 return s;
}

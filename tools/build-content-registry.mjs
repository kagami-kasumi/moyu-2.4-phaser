// Selected source tables -> declarative runtime catalog. Does not implement effects.
import fs from 'node:fs';
import {controlScopes,functionRange} from './lib/as2-data.mjs';
import {verifyMapRegistrations} from './lib/map-registration-evidence.mjs';
import {verifyStaticDeclarations} from './lib/static-registration-evidence.mjs';
import {verifyLiteralItemRegistrations} from './lib/item-registration-evidence.mjs';
import {enemySpawnEvidence} from './lib/enemy-spawn-evidence.mjs';
import {verifyLiteralPetRegistrations} from './lib/pet-registration-evidence.mjs';
import {verifyProfessionRegistrations} from './lib/profession-registration-evidence.mjs';
import {verifyEnemyRegistrations} from './lib/enemy-registration-evidence.mjs';
import {verifyObjectiveRegistrations} from './lib/objective-registration-evidence.mjs';
import {verifyRewardRegistrations} from './lib/reward-registration-evidence.mjs';
import {verifyParameterItems} from './lib/parameter-item-evidence.mjs';
import {verifyMissingFactoryItems} from './lib/missing-factory-evidence.mjs';
import {verifyBellRegistrations} from './lib/bell-registration-evidence.mjs';
import {verifyLuckyCharms} from './lib/lucky-charm-evidence.mjs';
import {verifyMiracleRegistration} from './lib/miracle-registration-evidence.mjs';
import {verifyRingRegistrations} from './lib/ring-registration-evidence.mjs';
const survey=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/source-survey.json'));
const census=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/object-census.json'));
const definitions=[];
const mapEvidenceScope=verifyMapRegistrations(survey.maps);
function add(kind,key,name,aliases,source,data){definitions.push({id:kind+':'+key,kind,name,aliases,source:Array.isArray(source)?source:[source],evidence:'inferred',availability:'registered',data});}
for(const row of survey.items){
 // Fall-through cases can be real aliases (转世水晶) or distinct named items.
 const dynamic=row.data.type?.expression==='tThing.type';
 if(dynamic)for(const name of row.aliases)add('item',name,name,[name],row.source,{...row.data,type:name});
 else {const name=row.data.name??row.data.type;if(typeof name!=='string')throw Error('Non-literal item identity');add('item',name,name,row.aliases,row.source,row.data);}
}
for(const row of survey.equipmentNames)for(const [index,name] of row.names.entries())add('equipment',row.profession+':'+name,name,[name],row.source,{profession:row.profession,family:row.family,sourceNameIndex:index});
// Directly constructed equipment is not part of createThing's switch.
for(const name of ['新手戒指','结婚戒指','永恒幸运符','真理幸运符','庇护铃铛','凤翼铃铛','翡翠铃铛']){
 const rows=census.objects.filter(x=>x.data.name===name||x.data.name?.expression?.includes('"'+name+'"'));
 const production=rows.filter(x=>!x.source.file.includes('测试专用'));
 if(!production.length)throw Error('No production definition for '+name);
 add('item',name,name,[name],production.map(x=>x.source),{type:production[0].data.type,variants:production.map(x=>({source:x.source,definition:x.data})),generation:'source-dependent instance attributes; not a fixed numeric template'});
}
// Ring selectors and random attribute bounds are data contracts, not executable AS.
const weddingFile='DefineSprite_4312/frame_1/DoAction.as';
const weddingText=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+weddingFile,'utf8');
const wedding=functionRange(weddingText,'function getWeddingRing(who)');
const partnerSelectors=[];
for(const branch of controlScopes(wedding.text).filter(s=>s.header.startsWith('case '))){
 const partner=branch.header.match(/^case "([^"]+)":$/)?.[1],body=wedding.text.slice(branch.start,branch.end);
 const first=body.match(/_loc3_ = "([^"]+)"/)?.[1],second=body.match(/_loc2_ = "([^"]+)"/)?.[1];
 if(!partner||!first||!second)throw Error('Unreviewed wedding selectors');
 partnerSelectors.push({partner,mainTypes:[first,second],source:{file:weddingFile,line:wedding.line+branch.line-1}});
}
for(const name of ['新手戒指','结婚戒指']){
 const definition=definitions.find(d=>d.kind==='item'&&d.name===name);
 const variants=definition.data.variants;
 definition.data.generationRules={mainPool:['moreAttack','moreDefense','moreLife','moreMp'],pairPool:['attack','defense','maxLife','maxMp','otherFire','reduceDamage','burst','jook'],pairSelection:{draws:4,withoutReplacement:true},variants:variants.map(v=>({source:v.source,mainSelection:v.source.file===weddingFile?{byPartner:partnerSelectors,duplicatesArePreserved:true,unmatchedPartner:'source leaves selectors undefined; not a valid registered partner outcome'}:{draws:2,withoutReplacement:true},randomBounds:Object.fromEntries(Object.entries(v.definition).flatMap(([key,value])=>{
  const match=value?.expression?.match(/^(\d+) \+ random\((\d+)\)$/);return match?[[key,{minimum:Number(match[1]),maximum:Number(match[1])+Number(match[2])-1,integer:true,expression:value.expression}]]:[];
 }))}))};
}
// Source references rejected by createThing must remain visible as defects, not be invented.
for(const name of ['月光礼包','月光宝盒','30点声望']){
 const rows=census.objects.filter(x=>x.data.type===name&&!x.source.file.includes('测试专用'));
 add('item',name,name,[name],rows.map(x=>x.source),{type:name,definitionStatus:'referenced-without-factory-case',instances:rows.map(x=>x.data)});
}
for(const row of survey.maps){
 add('map',row.name,row.name,[row.name],row.source,{sprite:4536,frame:row.frame,destinations:row.destinations,npcs:row.npcs});
 Object.assign(definitions.at(-1),{evidence:'verified',evidenceScope:mapEvidenceScope});
}
const ordinal={};
for(const row of survey.tasks){const index=ordinal[row.group]??0;ordinal[row.group]=index+1;add('quest',row.group+':'+index,row.data.name,[],row.source,{...row.data,sourceGroup:row.group,sourceIndex:index});}
for(const row of survey.npcs)add('npc',row.data.nTitle,row.data.nTitle,[row.data.nTitle],row.source,row.data);
for(const row of survey.skills)add('skill',row.data.name,row.data.name,[row.data.name],row.source,row.data);
for(const row of census.objects.filter(x=>x.source.file==='DefineSprite_2313_主城堡/frame_1/DoAction.as'&&x.data.upPrice!==undefined))add('building',row.data.name,row.data.name,[row.data.name],row.source,row.data);
for(const row of census.objects.filter(x=>x.source.file==='DefineSprite_4536/frame_1/DoAction.as'&&x.data.name&&x.data.maxLevels!==undefined&&x.data.moreFire!==undefined))add('boss-growth',row.data.name,row.data.name,[row.data.name],row.source,row.data);
const objectives=census.objects.filter(x=>typeof x.data.name==='string'&&x.data.needNumber!==undefined);
for(const name of new Set(objectives.map(x=>x.data.name))){const rows=objectives.filter(x=>x.data.name===name);add('objective',name,name,[name],rows.map(x=>x.source),{matching:'task.catchThing compares need.name with incoming item name/type or explicit event string',requirements:rows.map(x=>({source:x.source,definition:x.data}))});}
for(const name of ['魔石','资源','军功','功勋','声望','接荣誉任务','出征3个幻兽']){
 const rows=census.objects.filter(x=>x.data.type===name);add('reward',name,name,[name],rows.map(x=>x.source),{discriminator:name,records:rows.map(x=>({source:x.source,definition:x.data})),dispatchSource:'DefineSprite_2210_任务系统/frame_1/DoAction.as:getPrize'});
}
const petRows=census.objects.filter(x=>typeof x.data.type==='string'&&Object.hasOwn(x.data,'rateLife')&&Object.hasOwn(x.data,'maxZs')&&!x.source.file.includes('测试专用'));
const petSource=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction.as','utf8');
const petScopes=controlScopes(petSource);
function petInitialization(row){
 const result={source:row.source,definition:row.data};
 if(row.source.file==='frame_9/DoAction.as'){
  const offset=petSource.split('\n').slice(0,row.source.line-1).join('\n').length+1;
  const branch=petScopes.filter(s=>s.start<offset&&s.end>offset&&s.header.startsWith('case ')).at(-1);
  const trigger=branch?.header.match(/^case "([^"]+)":$/)?.[1];
  if(trigger)result.itemTrigger=trigger;
 }
 return result;
}
for(const name of new Set(petRows.map(x=>x.data.type))){
 const rows=petRows.filter(x=>x.data.type===name),data={type:name,initializations:rows.map(petInitialization)};
 if(name==='奇迹龙')data.generationRules={implementation:'src/content/miracle-dragon-rules.ts:miracleDragonSeed',source:{file:'frame_9/DoAction.as',line:616},branchCount:4,drawCount:4,drawDomain:'0 <= draw < 1',quantization:10000,baseSpans:[35,3,3,2],boostedSpans:[105,9,9,6],selection:'exactly one span boosted',coupling:'maxAttack uses already rounded minAttack',evidence:'verified-by-original-useItem',contract:'docs/reverse-engineering/content-registry/miracle-dragon.md'};
 add('pet',name,name,[name],rows.map(x=>x.source),data);
}
const enemyVariants={};
for(const row of survey.enemies){const key=row.source.file+':'+row.data.myName,variant=enemyVariants[key]??0;enemyVariants[key]=variant+1;add('enemy',key+':'+variant,row.data.myName,[],row.source,{...row.data,spawn:enemySpawnEvidence(row)});}
for(const frame of [5,6]){
 const file=`frame_${frame}/DoAction.as`,source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
 const match=source.match(/begingVocational = "([^"]+)"/);if(!match)throw Error('Missing profession');
 const name=match[1];add('profession',name,name,[name],{file,line:source.slice(0,match.index).split('\n').length},{informationFrame:frame});
}
const ids=new Set();for(const row of definitions){if(ids.has(row.id))throw Error('Duplicate '+row.id);ids.add(row.id);}
for(const id of verifyEnemyRegistrations(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['source call identity','literal fields and exact source expressions','spawn argument ranges'],notClaimed:['real dynamic input domains','spawn eligibility','enemy combat behavior','all possible evaluated values']}});
for(const id of verifyProfessionRegistrations(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['profession identity','original information frame label','source confirmation event writes'],notClaimed:['modern character-selection UI','profession combat implementation']}});
for(const id of verifyLiteralPetRegistrations(definitions).verified)Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['species identity','all literal item-trigger initialization seeds'],notClaimed:['pet combat behavior','derived attributes','inventory availability']}});
for(const id of verifyLiteralItemRegistrations(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['literal default factory output','all declared aliases'],notClaimed:['item effects','inventory availability','dynamic instance overrides']}});
for(const id of verifyStaticDeclarations(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['identity','source declaration fields (quest expressions checked for both professions)','source location and original table position'],notClaimed:['gameplay behavior','runtime derived attributes','content availability']}});
const startFile='DefineSprite_4536/frame_2/DoAction.as';
for(const id of verifyRingRegistrations(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['source seed literals and exact selector expressions','random attribute endpoint values'],notClaimed:['all gameplay acquisition paths','all derived ring attributes; separate generator tests required']}});
for(const id of verifyMiracleRegistration(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['source seed declaration and generator linkage','bounded generator checked separately against original useItem'],notClaimed:['all downstream pet behavior','inventory availability']}});
for(const id of verifyLuckyCharms(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['all four source seed declarations','name selection and lover field expressions','literal field presence including price omission'],notClaimed:['relationship eligibility','derived charm attributes','inventory availability']}});
for(const id of verifyBellRegistrations(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['source seed declarations','every random quality outcome in each registered variant'],notClaimed:['drop eligibility or probability','derived equipment attributes','bell effects']}});
for(const id of verifyMissingFactoryItems(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['original factory call reference','factory rejects name without emitting an item'],notClaimed:['usable item implementation','intended missing item effects']}});
for(const id of verifyParameterItems(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['factory identity','literal fields','exact override expressions and parameter routing'],notClaimed:['item effects','normal gameplay input bounds']}});
for(const id of verifyRewardRegistrations(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['special reward identity','all source declaration values and anchors','exact friend-level formula'],notClaimed:['downstream reward effects','quest reachability']}});
for(const id of verifyObjectiveRegistrations(definitions))Object.assign(definitions.find(d=>d.id===id),{evidence:'verified',evidenceScope:{verified:['objective identity','all source literal requirement declarations and anchors'],notClaimed:['event reachability','quest gameplay implementation']}});
const startSource=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+startFile,'utf8');
const startRange=functionRange(startSource,'function wudi()');
const startEnd=startSource.slice(0,startRange.end).split('\n').length;
const startGrants=census.objects.filter(row=>row.source.file===startFile&&row.source.line>startRange.line&&row.source.line<startEnd).map(row=>{
 const name=row.data.name??row.data.type;
 const item=definitions.filter(d=>d.kind==='item'&&(d.name===name||d.aliases.includes(name)));
 if(item.length!==1)throw Error('Unresolved starting grant '+name);
 return {contentId:item[0].id,source:row.source,instance:row.data};
});
const data={schemaVersion:1,sourceSha256:'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9',definitions,startGrants};
fs.writeFileSync('src/content/registry-data.ts',"// Generated by tools/build-content-registry.mjs. Source coverage audit pending.\nimport type {RegistryData} from './registry-types.ts';\nexport const registryData:RegistryData = "+JSON.stringify(data,null,2)+';\n');
console.log('Generated '+definitions.length+' definitions; not a completeness claim.');

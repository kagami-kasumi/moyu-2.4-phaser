import fs from 'node:fs';
import {registryData} from '../src/content/registry-data.ts';
import {functionRange} from './lib/as2-data.mjs';
import {questDeclarationTarget} from './lib/quest-reference-evidence.mjs';
import {enemyDeclarationTarget} from './lib/enemy-reference-evidence.mjs';
import {dailyObjectiveDomain} from './lib/daily-objective-domain.mjs';
import {referenceAnomalies} from './lib/reference-anomalies.mjs';
const root='docs/reverse-engineering/content-registry/';
const census=JSON.parse(fs.readFileSync(root+'object-census.json'));
const definitions=registryData.definitions;
const lookup=(kind,name)=>definitions.filter(d=>d.kind===kind&&(d.name===name||d.aliases.includes(name))).map(d=>d.id);
const equipmentTypes={武器:'weaponName',衣服:'clotheName',鞋:'shoesName',头盔:'helmetName'};
const directives=new Map([['魔石','currency'],['资源','currency'],['军功','progression'],['功勋','progression'],['声望','progression'],['接荣誉任务','quest-command'],['出征3个幻兽','pet-capacity-command']]);
const rows=[];
const read=file=>fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
const taskSource=read('DefineSprite_2210_任务系统/frame_1/DoAction.as');
const friendFunction=functionRange(taskSource,'this.setFriendTask =');
const friendNames=[...new Set([...friendFunction.text.matchAll(/_loc4_ = "([^"]+)"/g)].map(m=>m[1]))];
const dynamicDomains=[];
function dynamicDomain(candidate){
 const d=candidate.data,file=candidate.source.file,expression=d.type?.expression??d.name?.expression;
 if(file.startsWith('__Packages/mx/')||file.includes('测试专用'))return null;
 if(!expression)return null;
 const ternary=expression.match(/\?\s*"([^"]+)"\s*:\s*"([^"]+)"/);
 if(ternary)return {kind:d.myName?'profession':'item',names:[ternary[1],ternary[2]],method:'literal ternary outcomes',expression};
 if(expression==='tThing.type'&&file==='frame_9/DoAction.as'){
  const survey=JSON.parse(fs.readFileSync(root+'source-survey.json'));
  const branch=survey.items.find(x=>x.source.line===candidate.source.line);
  if(branch)return {kind:'item',names:branch.aliases,method:'enclosing createThing case labels',expression};
 }
 if(expression.startsWith('moyu_so.data'))return {kind:'persistence-reference',names:[],method:'restore existing content identity from conditional stored field; preservation, not a new content generator',expression};
 if(file==='__Packages/MonsterMC.as'||file==='__Packages/HuanShouMC.as')return {kind:'render-effect',names:[],method:'attachMovie projectile initial property type; not an inventory identity',expression};
 if(file==='DefineSprite_4536/frame_1/DoAction.as'&&expression==='_loc2_')return {kind:'equipment-family',names:Object.keys(equipmentTypes),method:'dropNormal/rare/boss functions select four equipment categories; grade, level and holes are instance parameters',expression};
 if(file==='DefineSprite_2084_幻兽研究所/frame_1/DoAction.as'&&expression==='_loc5_')return {kind:'item',names:['初级月光宝盒','中级月光宝盒'],method:'sell: material chosen by requested middle/high box',expression};
 if(file==='DefineSprite_4312/frame_1/DoAction_2.as'&&expression==='_loc5_ + "神兽内丹"')return {kind:'item',names:['水神兽内丹','风神兽内丹','火神兽内丹','地神兽内丹'],method:'getNeidan: positive main attribute tests form a nonempty pool, then random(pool.length)',expression};
 if(file==='DefineSprite_2210_任务系统/frame_1/DoAction.as'){
  if(/^monstName[12]$/.test(expression))return dailyObjectiveDomain(candidate);
  if(expression==='_loc4_'||expression==='_loc4_ + "精英"')return {kind:'enemy',names:friendNames.map(n=>n+(expression.includes('精英')?'精英':'')),method:'setFriendTask homeCity switch with 龙怪 fallback',expression};
 }
 return null;
}
for(const candidate of census.objects){
 const d=candidate.data,file=candidate.source.file;let classification,targets=[],reason;
 if(file.startsWith('__Packages/mx/')){classification='excluded';reason='Flash component framework metadata/event, not game content';}
 else if(file.includes('测试专用')){classification='test-source';reason='original debug source retained separately; not a production definition';}
 else if(d.type==='空格'){classification='empty-slot';reason='container absence sentinel, not an item';}
 else if(d.type==='技能图标'){classification='skill-shortcut';reason='runtime shortcut references a skill record; not an item factory type';}
 else if(d.type==='宝箱'){classification='npc-instance';targets=lookup('npc','宝箱');}
 else if(directives.has(d.type)){classification=directives.get(d.type);targets=lookup('reward',d.type);reason='task reward discriminator; handled before item factory';}
 else if(typeof d.nTitle==='string'){classification='npc';targets=lookup('npc',d.nTitle);}
 else if(typeof d.myName==='string'){classification='enemy';targets=enemyDeclarationTarget(definitions,candidate);}
 else if(d.need&&d.prize){classification='quest';targets=questDeclarationTarget(definitions,candidate);}
 else if(d.studied!==undefined&&d.condition!==undefined){classification='skill';targets=lookup('skill',d.name);}
 else if(d.upPrice!==undefined&&d.needMainLevels!==undefined){classification='building';targets=lookup('building',d.name);}
 else if(d.name&&d.maxLevels!==undefined&&d.moreFire!==undefined){classification='boss-growth';targets=lookup('boss-growth',d.name);}
 else if(d.rateLife!==undefined&&d.maxZs!==undefined&&typeof d.type==='string'){classification='pet';targets=lookup('pet',d.type);}
 else if(typeof d.type==='string'){
  if(equipmentTypes[d.type]){classification='equipment';targets=typeof d.name==='string'?lookup('equipment',d.name):definitions.filter(x=>x.kind==='equipment'&&x.data.family===equipmentTypes[d.type]).map(x=>x.id);}
  else{classification='item';const name=['宝石','药品','技能书','戒指','幸运符'].includes(d.type)?d.name:d.type;
   if(typeof name==='string')targets=lookup('item',name);
   else if(name?.expression){classification='generated-item-name';reason='expression chooses item variant; targets must come from its bounded generator domain';}
  }
 }
 else if(typeof d.name==='string'&&d.needNumber!==undefined){classification='quest-requirement';targets=lookup('objective',d.name);}
 else if(d.name?.expression&&d.needNumber!==undefined){classification='dynamic-quest-requirement';reason='setDailyTask/setFriendTask or readGame constructs a runtime objective; source conditions retained for generator audit';}
 else if(d.type?.expression){classification='dynamic-identity';reason='runtime input or computed identity; generator/reader audit required';}
 else {classification='unclassified';reason='requires contextual source review';}
 const domain=dynamicDomain(candidate);
 if(domain){
  const missing=[],domainTargets=[];
  for(const name of domain.names){const ids=domain.kind==='equipment-family'?definitions.filter(x=>x.kind==='equipment'&&x.data.family===equipmentTypes[name]).map(x=>x.id):lookup(domain.kind,name);if(!ids.length)missing.push(name);domainTargets.push(...ids);}
  if(!['quest','enemy'].includes(classification))targets=[...new Set(domainTargets)];
  dynamicDomains.push({source:candidate.source,...domain,targets:[...new Set(domainTargets)],missing});
 }
 const unresolved=classification==='unclassified'||(!targets.length&&!reason);
 rows.push({source:candidate.source,classification,targets,reason,unresolved,identity:{type:d.type,name:d.name,nTitle:d.nTitle,myName:d.myName}});
}
const counts={};for(const row of rows)counts[row.classification]=(counts[row.classification]??0)+1;
const pending=rows.filter(x=>['dynamic-identity','generated-item-name','dynamic-quest-requirement'].includes(x.classification)&&!dynamicDomains.some(d=>d.source.file===x.source.file&&d.source.line===x.source.line&&d.expression===(x.identity.type?.expression??x.identity.name?.expression)));
fs.writeFileSync(root+'reference-audit.json',JSON.stringify({status:'classification-audit-in-progress',counts,rows,dynamicDomains,unparsed:census.unparsed,anomalies:referenceAnomalies(census.unparsed)},null,2)+'\n');
console.log(JSON.stringify({counts,unresolved:rows.filter(x=>x.unresolved),dynamicRequiringReview:pending,missingDynamicTargets:dynamicDomains.filter(d=>d.missing.length)},null,2));

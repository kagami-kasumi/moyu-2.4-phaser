import fs from 'node:fs';
import {initializationEvidence} from './lib/initialization-evidence.mjs';
import {itemFieldSemantics} from './lib/item-field-semantics.mjs';
import {classAccessorEvidence} from './lib/class-accessor-evidence.mjs';
import {reviewPersistenceFields} from './lib/persistence-field-review.mjs';
import {npcDefaults} from './lib/npc-defaults.mjs';
import {externalSaveAccess} from './lib/external-save-access.mjs';
import {finalizePersistenceFields,restorationMatrix,persistenceHandoffCoverage} from './lib/persistence-schema-review.mjs';
import {source as loadSwf,timeline} from './lib/first-slice.mjs';
const path='docs/reverse-engineering/content-registry/';
const survey=JSON.parse(fs.readFileSync(path+'source-survey.json'));
const census=JSON.parse(fs.readFileSync(path+'object-census.json'));
const root='local-resources/moyu/source-index/as/scripts/';
const numeric=JSON.parse(fs.readFileSync(path+'numeric-rule-index.json')).rules;
const bindings=JSON.parse(fs.readFileSync(path+'source-bindings.json')).roots;
const itemSemantics=itemFieldSemantics(fs.readFileSync(root+'__Packages/ThingMC.as','utf8'),fs.readFileSync(root+'__Packages/SecreteCodeMC.as','utf8'));
const npcInitial=npcDefaults(fs.readFileSync(root+'__Packages/FriendClass.as','utf8'),fs.readFileSync(root+'__Packages/SecreteCode.as','utf8'),survey.npcs);
const classAccessors=Object.fromEntries([['RoleMC','SecreteCodeMC'],['HuanShouClass','SecreteCode'],['BuildingClass','SecreteCode'],['FriendClass','SecreteCode']].map(([name,base])=>{
 const file=`__Packages/${name}.as`,codecFile=`__Packages/${base}.as`;
 return [name,classAccessorEvidence(fs.readFileSync(root+file,'utf8'),file,fs.readFileSync(root+codecFile,'utf8'),codecFile)];
}));
const initialization=Object.fromEntries(['RoleMC','HuanShouClass','FriendClass','ThingMC','BuildingClass'].map(name=>{
 const file='__Packages/'+name+'.as';return [name,initializationEvidence(fs.readFileSync(root+file,'utf8'),file,name)];
}));
const observations=new Map();
const typeEvidence=new Map();
function observe(property,type,source,reason){const types=observations.get(property)??new Set();types.add(type);observations.set(property,types);const evidence=typeEvidence.get(property)??[];evidence.push({type,source,reason});typeEvidence.set(property,evidence);}
for(const row of census.objects)for(const [key,val] of Object.entries(row.data)){
 if(val===null||!['number','string','boolean'].includes(typeof val))continue;
 const types=observations.get(key)??new Set();types.add(typeof val);observations.set(key,types);
}
for(const steps of Object.values(initialization))for(const step of steps){if(!['number','string','boolean'].includes(typeof step.value))continue;const types=observations.get(step.property)??new Set();types.add(typeof step.value);observations.set(step.property,types);}
for(const rule of numeric){
 const property=rule.target.match(/(?:^|\.)([\p{L}\p{N}_]+)$/u)?.[1];if(!property||property.startsWith('_loc'))continue;
 if(['number','string','boolean'].includes(typeof rule.value))observe(property,typeof rule.value,rule.source,'source assignment literal');
}
const normalize=key=>typeof key==='string'?key:key.expression.replace(/\s+/g,'');
const dictionary=new Map();
for(const access of survey.persistence.save.filter(x=>x.access==='write')){
 const key=normalize(access.key);
 const expression=access.statement.slice(access.statement.indexOf('=')+1).trim().replace(/;$/,'');
 const property=expression.match(/\.([\p{L}\p{N}_]+)$/u)?.[1]??expression;
 const owner=/^this\["huanShouItem"\s*\+\s*i\]\.bell\./.test(expression)?'huanShouItem.bell':expression.match(/(?:this\.)?(map\.role|map\.npcState|huanShou\.allHuanShou|task\.[\w]+|mainCastle\.building|[\w]+)(?:\[|\.)/)?.[1]??'root';
 const className=owner==='map.role'?'RoleMC':owner==='map.npcState'?'FriendClass':owner==='huanShou.allHuanShou'?'HuanShouClass':owner==='mainCastle.building'?'BuildingClass':undefined;
 const seeds=className?initialization[className].filter(s=>s.property===property):[];
 const ownerRoot=owner.split('.')[0],sprite=bindings.find(b=>b.name===ownerRoot)?.sprite;
 if(!className){
  for(const rule of numeric){
   const initScope=rule.scope.signature==='script/class initialization'||/\b(?:initData|initNewGame|wudi)\s*=\s*function/.test(rule.scope.signature);
   if(!initScope)continue;
   const target=rule.target.replace(/^this\./,''),expected=expression.replace(/^(?:this\.|_root\.)/,'');
   const rootMatch=/^frame_\d+\//.test(rule.source.file)&&target===expected;
   const spriteMatch=sprite&&new RegExp('^DefineSprite_'+sprite+'(?:_|/)').test(rule.source.file)&&target===property;
   if(rootMatch||spriteMatch)seeds.push({property,phase:rule.scope.signature,value:rule.value,source:{file:rule.source.file,line:rule.source.line},conditions:rule.conditions});
  }
 }
 const observed=[...new Set([...(observations.get(property)??[]),...seeds.map(s=>typeof s.value).filter(t=>['number','boolean','string'].includes(t))])];
 const literal=expression==='true'||expression==='false'?'boolean':/^[+-]?\d+(\.\d+)?$/.test(expression)?'number':null;if(literal)observed.push(literal);
 const row=dictionary.get(key)??{key:access.key,owner,property,save:[],load:[],type:observed.length?{status:'inferred',observedTypes:[...new Set(observed)],evidence:(typeEvidence.get(property)??[]).slice(0,8),reason:'literal field observations; source use-site audit still required'}:{status:'unknown'},default:seeds.length?{status:'source-initialization-steps',steps:seeds,finalValue:'requires constructor/setter and content initialization order'}:{status:'unknown'},semantics:'conditional persistent field; never synthesize zero for absent source properties'};
 row.save.push({source:access.source,expression,conditions:access.conditions});dictionary.set(key,row);
}
for(const access of survey.persistence.load){const row=dictionary.get(normalize(access.key));if(!row)throw Error('Read without source save: '+normalize(access.key));row.load.push({source:access.source,statement:access.fullStatement,conditions:access.conditions});}
for(const access of survey.persistence.save.filter(a=>a.access==='read')){
 const row=dictionary.get(normalize(access.key));if(!row)throw Error('Internal save read without field '+normalize(access.key));
 (row.saveReads??=[]).push({source:access.source,statement:access.fullStatement,conditions:access.conditions});
}
for(const row of dictionary.values()){
 const name=row.owner==='map.role'?'RoleMC':row.owner==='huanShou.allHuanShou'?'HuanShouClass':row.owner==='mainCastle.building'?'BuildingClass':row.owner==='map.npcState'?'FriendClass':undefined;
 const accessor=name&&classAccessors[name].find(a=>a.property===row.property);
 if(!accessor)continue;
 row.type={status:'verified',value:'number',evidence:[accessor.getter.source,accessor.decoder.source],reason:'numeric decoder getter or direct alias; does not imply verified setter or final default'};
 row.accessor={class:name,property:row.property,reference:'class-accessor-evidence.json',restoreReview:'readGame may assign a different property; follow exact stored-key load statement rather than invoking the saved getter name'};
}
for(const [key,property] of [['role_ms','xxx_ms'],['role_res','xxx_res']]){
 const row=dictionary.get(key);if(!row)throw Error('Missing currency key');
 row.type={status:'verified',value:'number',evidence:[{file:'__Packages/RoleMC.as',line:property==='xxx_ms'?198:232}],reason:'reviewed capped currency setter/getter; role-currency-source.json'};
 row.default={status:'verified-new-game-value',value:100000000,source:[{file:'DefineSprite_4536/frame_2/DoAction.as',line:41},{file:'__Packages/RoleMC.as',line:property==='xxx_ms'?198:232}],reason:'wudi writes 1000000000 through setter capped at 100000000'};
 row.restoreSemantics={missingOrNaNWrite:'preserve-previous-value',upperLimit:100000000,lowerLimit:null,sideEffects:['update currency mirror','update formatted display'],source:'role-currency-source.json'};
}
const itemOwners=new Set(['backPack','fastKey','wareHouse','equipment','huanShouItem.bell','makeBell','make','splitStone','castleStone']);
const tableFile='frame_9/DoAction_2.as',tableText=fs.readFileSync(root+tableFile,'utf8');
const ringDomains=Object.fromEntries(['Main','Pair'].map(kind=>[kind,[...tableText.matchAll(new RegExp('_global\\.ring'+kind+'Type\\.(\\w+) = "[^"\\r\\n]+";','g'))].map(m=>({value:m[1],source:{file:tableFile,line:tableText.slice(0,m.index).split('\n').length}}))]));
if(ringDomains.Main.length!==4||ringDomains.Pair.length!==8)throw Error('Unreviewed ring selector domains');
const swf=loadSwf();
const slotBindings=timeline(swf,0)[8].layers.filter(p=>itemOwners.has(p.name)||/^huanShouItem[123]$/.test(p.name??'')).map(parent=>({owner:parent.name,parentSprite:parent.characterId,slots:timeline(swf,parent.characterId)[0].layers.filter(p=>p.characterId===2049).map(p=>({name:p.name,sprite:p.characterId,depth:p.depth}))}));
if(slotBindings.some(b=>!b.slots.length)||slotBindings.length!==11)throw Error('Unreviewed item timeline bindings');
if(!fs.readFileSync(root+'物品栏物品.as','utf8').includes('Object.registerClass("物品栏物品",ThingMC);'))throw Error('Item class binding changed');
for(const row of dictionary.values()){
 if(!itemOwners.has(row.owner)||row.save.every(s=>/^(?:this\.)?(?:backPack|fastKey|wareHouse)\.number$/.test(s.expression)))continue;
 if(/^(mainType[12]|pairType[1-4])$/.test(row.property)){
  const domain=ringDomains[row.property.startsWith('main')?'Main':'Pair'];
  row.type={status:'verified',value:'string',allowUndefined:true,expectedValues:domain.map(v=>v.value),evidence:domain.map(v=>v.source),reason:'ring attribute selector, not the numeric value of that attribute; source generators and delivery use string property names'};
  row.default={status:'content-generated',reference:'item:新手戒指 or item:结婚戒指 generationRules',reason:'drawn selectors or partner-specific pair; no universal scalar default, wedding duplicates retained'};
  row.restoreSemantics={undefinedWrite:'assign-undefined when ring delivery branch is entered',otherItemType:'ring selector fields untouched',source:{file:'frame_9/DoAction.as',line:60},absencePolicy:'keep absent value and original generator identity; do not roll new selectors when loading'};
  continue;
 }
 const semantic=itemSemantics.find(s=>s.property===row.property);
 if(!semantic)continue;
 row.type={status:'verified',value:'number',evidence:semantic.source,reason:'ThingMC encoded getter returns decoded number; not same-name global observations'};
 row.default={status:'verified-fresh-instance-read',value:0,source:semantic.source,scope:'unassigned ThingMC backing field only; content initialization may replace this value'};
 row.restoreSemantics={missingOrNaNWrite:semantic.missingOrNaNWrite,source:semantic.source,condition:'delivery reaches the property assignment for this item type',absencePolicy:'preserve absent stored property separately; never fill every missing field from fresh-instance defaults',classBinding:'item-field-semantics.json: slotBindings; sprite 2049; 物品栏物品.as:1'};
}
const referenceAudit=JSON.parse(fs.readFileSync(path+'reference-audit.json'));
reviewPersistenceFields([...dictionary.values()],{survey,census,initialization,npcInitial,referenceAudit});
for(const access of externalSaveAccess(census.sources)){
 const row=dictionary.get(access.key);if(!row)throw Error('Unmapped external save key '+access.key);
 (row.externalAccess??=[]).push(access);
}
for(const row of dictionary.values())if(!row.load.length)row.readCoverage={gameRestore:false,externalReads:(row.externalAccess??[]).filter(a=>a.access==='read').length,classification:row.externalAccess?.length?'save-selection metadata used outside readGame':'written but no direct source read found',scope:'all 734 scripts; moyu_so.data literal accesses; dynamic aliasing is not inferred',modernPolicy:'preserve stored value independently; do not discard solely because readGame does not read it'};
const finalFields=finalizePersistenceFields([...dictionary.values()]);
fs.writeFileSync(path+'persistence-survey.json',JSON.stringify({status:'final-schema-reviewed',fields:finalFields},null,2)+'\n');
fs.writeFileSync(path+'restore-matrix.json',JSON.stringify(restorationMatrix(finalFields),null,2)+'\n');
const handoff=JSON.parse(fs.readFileSync(path+'pet-world-coverage.json','utf8'));
fs.writeFileSync(path+'persistence-coverage.json',JSON.stringify(persistenceHandoffCoverage(finalFields,handoff.records),null,2)+'\n');
fs.writeFileSync(path+'item-field-semantics.json',JSON.stringify({scope:'ThingMC encoded numeric properties; other item fields require separate evidence',slotBindings,fields:itemSemantics},null,2)+'\n');
fs.writeFileSync(path+'initialization-evidence.json',JSON.stringify(initialization,null,2)+'\n');
fs.writeFileSync(path+'class-accessor-evidence.json',JSON.stringify(classAccessors,null,2)+'\n');
fs.writeFileSync(path+'npc-defaults.json',JSON.stringify({scope:'actual FriendClass constructor and declarations applied to all 60 source NPC seeds; numeric defaults normalize signed zero, absent values remain explicit',records:npcInitial},null,2)+'\n');
console.log(JSON.stringify({fields:dictionary.size,withTypeObservations:[...dictionary.values()].filter(f=>f.type.status==='inferred').length,verifiedTypedFields:[...dictionary.values()].filter(f=>f.type.status==='verified').length,withInitializationSteps:[...dictionary.values()].filter(f=>f.default.status==='source-initialization-steps').length,scope:'reviewed field semantics and initialization/restore matrix; no storage adapter'}));

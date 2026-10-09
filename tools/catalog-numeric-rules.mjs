// Declarative source rule index: preserves targets, expressions, dependencies and
// enclosing branches. It is not an AS interpreter and never executes source text.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {tokens,matching,value,controlScopes,functionRange} from './lib/as2-data.mjs';
import {itemFieldSemantics} from './lib/item-field-semantics.mjs';
const root='local-resources/moyu/source-index/as/scripts/';
const dir='docs/reverse-engineering/content-registry/';
const census=JSON.parse(fs.readFileSync(dir+'object-census.json'));
const rules=[],exclusions=[];
const reviewedModules=[{
 id:'numeric:xp-energy',file:'DefineSprite_4603/frame_1/DoAction.as',
 sha256:'f764fafe3c40cdac339df3691a52cfdba422aae6986567f5b461233a15a0215a',
 contract:'docs/reverse-engineering/content-registry/xp-energy.md',
 runtime:'src/content/xp-energy-rules.ts',
 additionalOperations:[{line:18,expression:'++this.nowExp',meaning:'increment before charge threshold comparison'},{line:45,expression:'nowPower--',meaning:'consume after hiding current energy cell'}],
},{
 id:'numeric:castle-building-fields',file:'__Packages/BuildingClass.as',
 sha256:'84718e8d6406dc5474222e115364b6eb7e9b0a3eb97528b4a461f6426100c803',
 contract:'docs/reverse-engineering/content-registry/buildings.md',
 runtime:'src/content/building-rules.ts',additionalOperations:[],
},{
 id:'numeric:castle-buildings',file:'DefineSprite_2313_主城堡/frame_1/DoAction.as',
 sha256:'e0e7677dae88cb7462cf46170bcbf12c7dd02d0b64332fee69ec435bf692ee25',
 contract:'docs/reverse-engineering/content-registry/buildings.md',
 runtime:'src/content/building-rules.ts',
 semanticStatus:'reviewed-with-source-anomaly',
 openQuestions:['Effective AVM1 outcome of parent.role.res write; static evidence indicates missing map path'],
 additionalOperations:[{line:17,expression:'i++',meaning:'initialization array traversal'},{line:24,expression:'i--',meaning:'reverse panel binding traversal'},{line:54,expression:'i--',meaning:'reverse information refresh traversal'},{line:97,expression:'this.building[num].levels++',meaning:'main castle upgrade after housing and credit guards'},{line:115,expression:'this.building[num].needMainLevels++',meaning:'raise next main-castle prerequisite, not persisted'}],
}];
// Explicitly reviewed accessors only. Do not promote the rest of RoleMC by file association.
const roleFile='__Packages/RoleMC.as',roleText=fs.readFileSync(root+roleFile,'utf8');
for(const group of [
 {id:'role-progression',runtime:'role-progression-rules',fields:['xxx_maxLevels','levels','xxx_militaryRank','militaryRank','xxx_chaw','chaw','militaryExploit','exploit','job','xxx_credit','militaryRankFire','chawFire','jobFire','titleLevel','maxLevels','maxExp','xxx_nowExp','expBallNum']},
 {id:'role-vitals',runtime:'role-vital-rules',fields:['life','xxx_maxLife','maxLife','mp','maxMp','lifeSourseLevels','maxLifeSourse','lifeSourse','mpSourseLevels','maxMpSourse','mpSourse']},
])for(const field of group.fields)for(const kind of ['get','set']){
 const marker=`function ${kind} ${field}(${kind==='set'?'val':''})`,range=functionRange(roleText,marker);
 reviewedModules.push({id:`numeric:${group.id}:${kind}:${field}`,file:roleFile,sha256:'ffe6f75ae7967f9ce79ebe2f3895178d786683a56fd0d6f321f60b85b22a8ace',startLine:range.line,endLine:roleText.slice(0,range.end).split('\n').length,contract:`docs/reverse-engineering/content-registry/${group.id}.md`,runtime:`src/content/${group.runtime}.ts`,additionalOperations:[],scope:'accessor reads/writes and documented immediate effects; does not certify downstream view functions'});
}
const questFile='DefineSprite_2210_任务系统/frame_1/DoAction.as',questText=fs.readFileSync(root+questFile,'utf8');
for(const name of ['catchThing','getPrize','taskComplete','setDailyTask','setFriendTask']){
 const range=functionRange(questText,`this.${name} =`);
 reviewedModules.push({id:`numeric:quest-dispatch:${name}`,file:questFile,sha256:'7304f43ad32ce00dc93b936db83a388a6c2865bc1ae3436278f21c30d1136974',startLine:range.line,endLine:questText.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/quest-dispatch.md',runtime:['setDailyTask','setFriendTask'].includes(name)?'src/content/quest-generator-rules.ts':'src/content/quest-dispatch-rules.ts',additionalOperations:[],scope:'objective counting, generation and reward dispatch writes; downstream calls are not certified'});
}
for(const name of ['priseExp','expUp']){
 const range=functionRange(roleText,`function ${name}(val)`);
 reviewedModules.push({id:`numeric:role-experience:${name}`,file:roleFile,sha256:'ffe6f75ae7967f9ce79ebe2f3895178d786683a56fd0d6f321f60b85b22a8ace',startLine:range.line,endLine:roleText.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/role-experience.md',runtime:'src/content/role-experience-rules.ts',additionalOperations:[],scope:'experience dispatch and threshold writes; downstream pet growth and attribute refresh excluded'});
}
for(const name of ['militaryExploitUp','exploitUp']){
 const range=functionRange(roleText,`function ${name}(val)`);
 reviewedModules.push({id:`numeric:merit:${name}`,file:roleFile,sha256:'ffe6f75ae7967f9ce79ebe2f3895178d786683a56fd0d6f321f60b85b22a8ace',startLine:range.line,endLine:roleText.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/merit.md',runtime:'src/content/merit-rules.ts',additionalOperations:[],scope:'award rounding, cumulative thresholds and rank writes; setter effects reviewed separately'});
}
for(const name of ['spendMs','spendRes','consumeMp','creditUp']){
 const range=functionRange(roleText,`function ${name}(val)`);
 reviewedModules.push({id:`numeric:resource-consumption:${name}`,file:roleFile,sha256:'ffe6f75ae7967f9ce79ebe2f3895178d786683a56fd0d6f321f60b85b22a8ace',startLine:range.line,endLine:roleText.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/resource-consumption.md',runtime:'src/content/resource-consumption-rules.ts',additionalOperations:[],scope:'method guards, writes and return values; property setter effects separate'});
}
{
 const range=functionRange(roleText,'function upGod()');
 reviewedModules.push({id:'numeric:role-rebirth',file:roleFile,sha256:'ffe6f75ae7967f9ce79ebe2f3895178d786683a56fd0d6f321f60b85b22a8ace',startLine:range.line,endLine:roleText.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/role-rebirth.md',runtime:'src/content/role-rebirth-rules.ts',additionalOperations:[],scope:'rebirth guards, writes and experience composition; pet reset internals excluded'});
}
for(const entry of [
 {file:'__Packages/HuanShouClass.as',marker:'function reset()',sha256:'272527ee87e7cbb21c6a3e9f65410266a65e10a3477a44c43b1bda821d6fcc46',id:'pet-reset'},
 {file:'frame_9/DoAction.as',marker:'this.huanShou.reset =',sha256:'2d64d13f0d7c5a63599943713b704bbf808e1b90176e73af5d47ba0253634745',id:'pet-collection-reset'},
]){
 const text=fs.readFileSync(root+entry.file,'utf8'),range=functionRange(text,entry.marker);
 reviewedModules.push({id:'numeric:'+entry.id,file:entry.file,sha256:entry.sha256,startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-reset.md',runtime:'src/content/pet-reset-rules.ts',additionalOperations:[],scope:'reset writes, ordering and collection traversal; attribute refresh and view internals excluded'});
}
{
 const file='__Packages/HuanShouMC.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,'function expUp(val)');
 reviewedModules.push({id:'numeric:pet-experience',file,sha256:'4556c1fb054753ef4d96b50b6e2cd6ad84194db33c0b1eb985e7ce63550177ef',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-experience.md',runtime:'src/content/pet-experience-rules.ts',additionalOperations:[],scope:'experience guards, threshold table, cap and insight restoration; attribute refresh internals excluded'});
}
for(const name of ['turned','lifeLvUp']){
 const file='__Packages/HuanShouClass.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,`function ${name}()`);
 reviewedModules.push({id:`numeric:pet-generation:${name}`,file,sha256:'272527ee87e7cbb21c6a3e9f65410266a65e10a3477a44c43b1bda821d6fcc46',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-generation.md',runtime:'src/content/pet-generation-rules.ts',additionalOperations:[],scope:'turn and generation guards, ordering and direct writes; setters and derived refresh separate'});
}
for(const name of ['moreAttribute','flashAttribute']){
 const file='__Packages/HuanShouClass.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,`function ${name}()`);
 reviewedModules.push({id:`numeric:pet-attributes:${name}`,file,sha256:'272527ee87e7cbb21c6a3e9f65410266a65e10a3477a44c43b1bda821d6fcc46',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-attributes.md',runtime:'src/content/pet-attribute-rules.ts',additionalOperations:[],scope:'element and active bell bonuses; rounded derived attribute writes; setter internals separate'});
}
{
 const file='__Packages/HuanShouClass.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,'function checkUp()');
 reviewedModules.push({id:'numeric:pet-score',file,sha256:'272527ee87e7cbb21c6a3e9f65410266a65e10a3477a44c43b1bda821d6fcc46',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-score.md',runtime:'src/content/pet-score-rules.ts',additionalOperations:[],scope:'score formula writes, element/title tables and total; score setter semantics separate'});
}
for(const field of ['allFen','levels','mainFen','lifeFen','minAttackFen','maxAttackFen','defenseFen','rareFen','zsFen','elementFen','titleFen'])for(const kind of ['get','set']){
 const file='__Packages/HuanShouClass.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,`function ${kind} ${field}(${kind==='set'?'val':''})`);
 reviewedModules.push({id:`numeric:pet-score:${kind}:${field}`,file,sha256:'272527ee87e7cbb21c6a3e9f65410266a65e10a3477a44c43b1bda821d6fcc46',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-score.md',runtime:'src/content/pet-score-rules.ts',additionalOperations:[],scope:'NaN guard, sorting mirrors where present, and codec delegation; codec implementation separate'});
}
for(const field of ['life','maxLife','burst','jook','wind','soil','fire','water','reduceDamage','minAttack','maxAttack','defense'])for(const kind of ['get','set']){
 const file='__Packages/HuanShouClass.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,`function ${kind} ${field}(${kind==='set'?'val':''})`);
 reviewedModules.push({id:`numeric:pet-vitals:${kind}:${field}`,file,sha256:'272527ee87e7cbb21c6a3e9f65410266a65e10a3477a44c43b1bda821d6fcc46',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-attributes.md',runtime:'src/content/pet-attribute-rules.ts',additionalOperations:[],scope:'NaN guards, life clamping order and codec delegation; codec implementation separate'});
}
for(const field of ['nowExp','maxExp','attackLength','attackHeight','zs','maxZs','element','titleNum','rateLife','rateMinAttack','rateMaxAttack','rateDefense','moreLife','moreMinAttack','moreMaxAttack','moreDefense','maxRateLife','maxRateMinAttack','maxRateMaxAttack','maxRateDefense','maxLifeFen','maxMinAttackFen','maxMaxAttackFen','maxDefenseFen','oldLevels','oldNowExp','oldMaxExp'])for(const kind of ['get','set']){
 const file='__Packages/HuanShouClass.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,`function ${kind} ${field}(${kind==='set'?'val':''})`);
 reviewedModules.push({id:`numeric:pet-fields:${kind}:${field}`,file,sha256:'272527ee87e7cbb21c6a3e9f65410266a65e10a3477a44c43b1bda821d6fcc46',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-numeric-accessors.md',runtime:'src/content/pet-numeric-accessor-rules.ts',additionalOperations:[],scope:'NaN guard and unchanged codec delegation; codec internals separate'});
}
for(const name of ['lifeLv','GodName']){
 const file='__Packages/HuanShouClass.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,`function get ${name}()`);
 reviewedModules.push({id:`numeric:pet-label:${name}`,file,sha256:'272527ee87e7cbb21c6a3e9f65410266a65e10a3477a44c43b1bda821d6fcc46',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/pet-generation.md',runtime:'src/content/pet-generation-rules.ts',additionalOperations:[],scope:'derived generation and god labels only'});
}
reviewedModules.push({id:'numeric:codec',file:'__Packages/SecreteCode.as',sha256:'7602048507ebad4241c82ac3e535315b936593a5f6ff9f02c99447790a7fc353',contract:'docs/reverse-engineering/content-registry/numeric-codec.md',runtime:'src/content/numeric-codec-rules.ts',additionalOperations:[],scope:'linear codec arithmetic, random parameter ranges and missing-value decode; random lifecycle separate'});
reviewedModules.push({id:'numeric:codec-movieclip',file:'__Packages/SecreteCodeMC.as',sha256:'bf3159ed901b7276793d3380234114723880eb1086c7c4f6aa21ebe760f68387',contract:'docs/reverse-engineering/content-registry/numeric-codec.md',runtime:'src/content/numeric-codec-rules.ts',additionalOperations:[],scope:'linear codec arithmetic and separate class base; MovieClip lifecycle excluded'});
for(const marker of ['function set number(val)','function get number()','function get room()','function addNumber(val)']){
 const file='__Packages/ThingMC.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,marker);
 reviewedModules.push({id:`numeric:item-stack:${marker}`,file,sha256:'49047b15fd24f831577b04537818284723ef1b52cdd96cc392c6ffad3c8b5eea',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/item-stack-fields.md',runtime:'src/content/item-stack-rules.ts',additionalOperations:[],scope:'quantity writes, label/capacity update, room and overflow return; container behavior separate'});
}
{
 const file='__Packages/ThingMC.as',text=fs.readFileSync(root+file,'utf8');
 const fields=itemFieldSemantics(text,fs.readFileSync(root+'__Packages/SecreteCodeMC.as','utf8'));
 for(const field of fields.filter(f=>f.property!=='number'))for(const kind of ['get','set']){
  const range=functionRange(text,`function ${kind} ${field.property}(${kind==='set'?'val':''})`);
  reviewedModules.push({id:`numeric:item-field:${kind}:${field.property}`,file,sha256:'49047b15fd24f831577b04537818284723ef1b52cdd96cc392c6ffad3c8b5eea',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/item-stack-fields.md',runtime:'src/content/item-field-rules.ts',additionalOperations:[],scope:'complete accessor bodies: invalid input policy and codec delegation; item effects separate'});
 }
}
reviewedModules.push({id:'numeric:friend-fields',file:'__Packages/FriendClass.as',sha256:'9d886b87e8a5b362b149149877201d84215d67dfec0468046f4b2b73fc901a8e',contract:'docs/reverse-engineering/content-registry/friend-fields.md',runtime:'src/content/friend-field-rules.ts',additionalOperations:[],scope:'constructor defaults, class flags and relation accessors; social progression elsewhere'});
for(const marker of ['this.levelsUp = function(lv)','this.getAllLevels = function()']){
 const file='DefineSprite_2381_朋友/frame_1/DoAction.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,marker);
 reviewedModules.push({id:`numeric:friend-capacity:${marker}`,file,sha256:'aa304a6778bf2db9cd721ac1ada97a1f723ee9627fd5618ba62634c14d76a99c',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/friend-capacity.md',runtime:'src/content/friend-capacity-rules.ts',additionalOperations:[],scope:'capacity assignment and reverse level sum; upData internals separate'});
}
for(const marker of ['this.initData = function()','this.setRelationName = function(npc)','this.addRelation = function(npc, val)','this.upToLover = function(NPC)','this.addFriend = function(NPC)','this.delFriend = function(tname)']){
 const file='DefineSprite_2381_朋友/frame_1/DoAction.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,marker);
 reviewedModules.push({id:`numeric:friend-relation:${marker}`,file,sha256:'aa304a6778bf2db9cd721ac1ada97a1f723ee9627fd5618ba62634c14d76a99c',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/friend-relation.md',runtime:'src/content/friend-relation-rules.ts',additionalOperations:[],scope:'relation naming, gain and lover promotion; call eligibility and removal separate'});
}
{
 const file='DefineSprite_4312/frame_1/DoAction.as',text=fs.readFileSync(root+file,'utf8');
 for(const command of [8100,8112,8113,8114,8122,8123,8124]){
  const start=text.indexOf(`      case ${command}:`,text.indexOf('this.command2 = function()'));
  const end=text.indexOf('      case ',start+10);
  if(start<0||end<0)throw Error('Missing reviewed social command '+command);
  reviewedModules.push({id:`numeric:social-command:${command}`,file,sha256:'1a006e3ce15b66f7d49eea49beb1cb4e1b3647b8760c0e7626dd0ea1a8774f67',startLine:text.slice(0,start).split('\n').length,endLine:text.slice(0,end).split('\n').length-1,contract:'docs/reverse-engineering/content-registry/friend-relation.md',runtime:'src/content/friend-relation-rules.ts',additionalOperations:[],scope:'command dispatch, amounts and call order; called method internals and dialogue availability separate'});
 }
}
{
 const file='DefineSprite_4312/frame_1/DoAction_2.as',text=fs.readFileSync(root+file,'utf8'),range=functionRange(text,'this.setFriendTask = function()');
 reviewedModules.push({id:'numeric:gift-task-offer',file,sha256:'641bb5e3fa324340e376e1a3fcb7a7ae7b8afcdff792b9627cde214fe7c85375',startLine:range.line,endLine:text.slice(0,range.end).split('\n').length,contract:'docs/reverse-engineering/content-registry/friend-relation.md',runtime:'src/content/friend-relation-rules.ts',additionalOperations:[],scope:'gift task prompt guards, probability and spouse priority; acceptance callback separate'});
}
for(const review of reviewedModules){
 const hash=createHash('sha256').update(fs.readFileSync(root+review.file)).digest('hex');
 if(hash!==review.sha256)throw Error('Numeric semantic review requires renewal: '+review.file);
 const lines=fs.readFileSync(root+review.file,'utf8').split(/\r?\n/);
 for(const operation of review.additionalOperations)if(!lines[operation.line-1]?.includes(operation.expression))throw Error('Invalid semantic operation anchor: '+review.file+':'+operation.line);
}
const scopeFiles=census.sources.filter(s=>{
 if(s.file.startsWith('__Packages/mx/')||s.file.startsWith('__Packages/AS2_4399_API/')||s.file.includes('测试专用')){exclusions.push({file:s.file,reason:s.file.includes('测试专用')?'original debug UI':'platform/component framework'});return false;}return true;
});
for(const file of scopeFiles){
 const text=fs.readFileSync(root+file.file,'utf8'),ts=tokens(text),controls=controlScopes(text),functions=[];
 const raw=(a,b)=>a<b?text.slice(ts[a].start,ts[b-1].end):'';
 for(let i=0;i<ts.length;i++)if(ts[i].value==='function'&&ts[i].kind==='identifier'){
  let open=i+1;while(open<ts.length&&ts[open].value!=='(')open++;if(open===ts.length)throw Error('Missing function parameters');
  const close=matching(ts,open),body=close+1;if(ts[body]?.value!=='{')throw Error('Missing function body');
  const end=matching(ts,body);let start=i;
  if(ts[i-1]?.value==='='){start=i-2;while(start>0&&ts[start-1].line===ts[start].line&&![';','{','}'].includes(ts[start-1].value))start--;}
  functions.push({signature:raw(start,close+1),start:ts[body].start,end:ts[end].end,line:ts[start].line,parameters:raw(open+1,close)});
 }
 for(let i=0;i<ts.length;i++){
  if(ts[i].kind==='identifier'&&ts[i].value==='return'){
   let end=i+1;while(end<ts.length){if(ts[end].kind==='punctuation'&&ts[end].value===';')break;if(ts[end].kind==='punctuation'&&['(','[','{'].includes(ts[end].value))end=matching(ts,end);end++;}
   if(end===ts.length)throw Error('Unterminated return '+file.file+':'+ts[i].line);
   const inside=functions.filter(f=>f.start<ts[i].start&&f.end>ts[i].end).sort((a,b)=>b.start-a.start)[0];
   const conditions=controls.filter(s=>s.start<ts[i].start&&s.end>ts[i].end).map(s=>({header:s.header,line:s.line}));
   rules.push({id:file.file+':'+ts[i].line+':return',source:{file:file.file,line:ts[i].line},scope:inside?{signature:inside.signature,line:inside.line,parameters:inside.parameters}:{signature:'script return',line:1,parameters:''},target:'$return',operator:'return',value:value(text,ts,i+1,end),inputs:[...new Set(ts.slice(i+1,end).filter(t=>t.kind==='identifier').map(t=>t.value))],conditions,classification:'return-value',evidence:'verified-source-syntax',semanticStatus:'requires-module-review'});
   continue;
  }
  if(ts[i].kind!=='punctuation'||ts[i].value!=='='||['=','!','<','>'].includes(ts[i-1]?.value)||ts[i+1]?.value==='='||ts[i+1]?.value==='function')continue;
  let start=i-1,operator='=';
  if(['+','-','*','/','%'].includes(ts[start]?.value)){operator=ts[start].value+'=';start--;}
  while(start>0){const prev=ts[start-1];if(prev.kind==='punctuation'&&[';','{','}'].includes(prev.value))break;if(prev.line<ts[start].line)break;start--;}
  let target=raw(start,operator==='='?i:i-1).replace(/^\s*(?:static\s+)?var\s+/,'').trim();
  // for header assignments are represented by their full enclosing loop header.
  if(!target||/\b(?:if|while|for|return|case)\b/.test(target)||target.includes(':'))continue;
  let end=i+1;while(end<ts.length){if(ts[end].kind==='punctuation'&&ts[end].value===';')break;if(ts[end].kind==='punctuation'&&['(','[','{'].includes(ts[end].value))end=matching(ts,end);end++;}
  if(end===ts.length)throw Error('Unterminated assignment '+file.file+':'+ts[i].line);
  const expression=raw(i+1,end),inside=functions.filter(f=>f.start<ts[i].start&&f.end>ts[i].end).sort((a,b)=>b.start-a.start)[0];
  const numeric=ts.slice(i+1,end).some(t=>t.kind==='number')||/[*/%]|\b(?:Math|random|getTimer|Number|parseInt)\b/.test(expression);
  const presentation=/(?:\.text|\._[xy]|\.open[XY]|textColor|filters|alpha|_visible|_width|_height|_rotation|_scale)/.test(target);
  const conditions=controls.filter(s=>s.start<ts[i].start&&s.end>ts[i].end).map(s=>({header:s.header,line:s.line}));
  const inputs=[...new Set(ts.slice(i+1,end).filter(t=>t.kind==='identifier').map(t=>t.value))].filter(n=>!['true','false','null','undefined','new'].includes(n));
  rules.push({id:file.file+':'+ts[i].line+':'+target,source:{file:file.file,line:ts[i].line},scope:inside?{signature:inside.signature,line:inside.line,parameters:inside.parameters}:{signature:'script/class initialization',line:1,parameters:''},target,operator,value:value(text,ts,i+1,end),inputs,conditions,classification:presentation?'presentation':numeric?'numeric-definition-or-update':'supporting-state',evidence:'verified-source-syntax',semanticStatus:'requires-module-review'});
 }
}
const byClass={};for(const r of rules)byClass[r.classification]=(byClass[r.classification]??0)+1;
for(const rule of rules){
 const review=reviewedModules.find(r=>r.file===rule.source.file&&(r.startLine===undefined||(rule.source.line>=r.startLine&&rule.source.line<=r.endLine)));
 if(review){rule.semanticStatus=review.semanticStatus??'reviewed-module';rule.semanticModule=review.id;rule.semanticContract=review.contract;}
}
fs.writeFileSync(dir+'numeric-rule-index.json',JSON.stringify({status:'partial-semantic-review',scope:'source assignment semantics with branch/scope/inputs; reviewed module contracts also cover explicitly listed non-assignment operations; not a runtime evaluator',sourceFiles:scopeFiles,exclusions,reviewedModules,counts:byClass,rules},null,2)+'\n');
console.log(JSON.stringify({files:scopeFiles.length,excludedFiles:exclusions.length,rules:rules.length,counts:byClass}));

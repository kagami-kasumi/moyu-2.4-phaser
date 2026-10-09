// Owner-specific reviews. These are source contracts, not guesses from equal property names.
import fs from 'node:fs';
const sourceRoot='local-resources/moyu/source-index/as/scripts/';
const cache=new Map();
function anchor(file,fragment,last=false){
 const text=cache.get(file)??fs.readFileSync(sourceRoot+file,'utf8');cache.set(file,text);
 const index=last?text.lastIndexOf(fragment):text.indexOf(fragment);if(index<0)throw Error('Reviewed persistence anchor changed: '+file+' / '+fragment);
 return {file,line:text.slice(0,index).split('\n').length};
}
const main='frame_9/DoAction.as',extra='frame_9/DoAction_2.as',map='DefineSprite_4536/frame_1/DoAction.as',start='DefineSprite_4536/frame_2/DoAction.as';
const itemOwners=new Set(['backPack','fastKey','wareHouse','equipment','huanShouItem.bell','makeBell','make','splitStone','castleStone']);
const plainItemTypes={type:'string',name:'string',vocational:'string',loveName:'string',isFirstLove:'boolean',maxLife:'number',maxMp:'number',skill:'number',attributeType1:'number',attributeType2:'number',attributeType3:'number',pure:'number',val1:'number',val2:'number',hpVal:'number',mpVal:'number'};
export function persistenceItemTemplates(census,audit){
 if(census.objects.length!==audit.rows.length)throw Error('Stale object classification count');
 return census.objects.filter((object,index)=>{
  const row=audit.rows[index];
  const identity=Object.fromEntries(['type','name','nTitle','myName'].filter(k=>Object.hasOwn(object.data,k)).map(k=>[k,object.data[k]]));
  if(JSON.stringify(row.source)!==JSON.stringify(object.source)||JSON.stringify(row.identity)!==JSON.stringify(identity))throw Error('Stale object classification identity at '+index);
  return ['item','equipment','generated-item-name'].includes(row.classification);
 });
}
export function reviewPersistenceFields(fields,{survey,census,initialization,npcInitial,referenceAudit}){
 const itemTemplates=persistenceItemTemplates(census,referenceAudit);
 function typed(row,type,sources,meaning,allowUndefined=false){
  row.type={status:'verified',value:type,allowUndefined,evidence:sources,reason:meaning};
 }
 function literal(row,value,file,fragment,meaning){
  const source=anchor(file,fragment);typed(row,typeof value,[source],meaning);
  row.default={status:'verified-initial-state',value,source:[source]};
 }
 for(const row of fields){
  const {owner,property,key}=row;
  if(itemOwners.has(owner)&&Object.hasOwn(plainItemTypes,property)){
   const sources=[anchor(main,`target.${property} = sourse.${property};`)];
   if(/^attributeType[23]$/.test(property))sources.push(anchor(main,`this.item1.${property} =`));
   if(property==='isFirstLove')sources.push(anchor('DefineSprite_2381_朋友/frame_1/DoAction.as','isFirstLove = true;'));
   if(property==='skill'||property==='pure'||property==='attributeType1')sources.push(anchor(map,'attributeType1:1,attributeVal1:5,pure:1,skill:0'));
   if(property==='maxLife'||property==='maxMp')sources.push(anchor(start,'name:"新手戒指"'));
   const templates=itemTemplates.filter(o=>Object.hasOwn(o.data,property));
   typed(row,plainItemTypes[property],sources,'plain item field copied by delivery in the type-specific branch; persisted skill here is a numeric bell skill selector, not a skill-shortcut object',true);
   row.default={status:'content-template-or-generator',sources:templates.map(o=>o.source),whenUnassigned:'undefined; no universal value across item types',recipe:'registered item variant / factory followed by delivery; do not replace missing values with another item template'};
   row.restoreSemantics={mode:'direct-copy-in-delivery-branch',whenSourceUndefined:'assign undefined if branch copies this field; other type branches leave it untouched',source:sources[0],modernPolicy:'restore a new instance and preserve original field presence'};
   if(property==='type'||property==='name'||property==='vocational')row.reference={kind:'item/equipment identity',resolver:'itemContentId using type/name/vocational together; unknown identity preserved'};
   continue;
  }
  if(key==='saved'){literal(row,true,extra,'moyu_so.data.saved = true;','save-slot existence marker');row.default.scope='created at save time, not a gameplay default';}
  else if(key==='versions')literal(row,1.8,'frame_3/DoAction.as','versions = 1.8;','original save format version');
  else if(key==='saveTime'){
   const source=anchor(extra,'moyu_so.data.saveTime = timedate.getMonth()');
   typed(row,'string',[source],'local calendar display label, not sortable timestamp');row.default={status:'generated-on-save',expression:row.save[0].expression,source:[source]};
  }else if(key==='usedTimer'){
   literal(row,0,'frame_3/DoAction.as','usedTimer = 0;','accumulated milliseconds');
   row.restoreSemantics={mode:'assign-only-if-defined',source:anchor(extra,'if(moyu_so.data.usedTimer != undefined)'),saveFormula:'getTimer() - beginTimer + usedTimer'};
  }else if(key==='playID'){
   const source=anchor('frame_3/DoAction.as','playID = random(100000) + 1;');
   typed(row,'number',[source],'original random play identity, not a guaranteed unique primary key');row.default={status:'source-generator',expression:'random(100000) + 1',minimum:1,maximum:100000,integer:true,source:[source]};
  }else if(key==='readTimes'){
   literal(row,0,'frame_3/DoAction.as','readTimes = 0;','load counter');row.restoreSemantics={mode:'stored-value-plus-one',source:anchor(extra,'readTimes = moyu_so.data.readTimes + 1;'),missing:'source arithmetic receives undefined; do not silently reinterpret as zero'};
  }else if(['upLevelPrize','taskTime'].includes(key)){
   literal(row,1,extra,`${key} = 1;`,'progression reward state');row.restoreSemantics={mode:'assign-only-if-defined',source:anchor(extra,`if(moyu_so.data.${key} != undefined)`)};
  }else if(typeof key==='string'&&/^winpk\d+$/.test(key))literal(row,false,extra,`${property} = false;`,'arena victory flag');
  else if(owner==='_root'&&['daoshiLv','useRecord','魔军主将转世'].includes(property))literal(row,0,start,`_root.${property} = 0;`,'new-game global progression state');
  else if(['backPack_number','fastKey_number','wareHouse_number'].includes(key)){
   const value={backPack_number:40,fastKey_number:7,wareHouse_number:54}[key];literal(row,value,main,`this.${owner}.number = ${value};`,'container capacity, not item stack count');
  }else if(property==='openNumber'&&['huanShouShop','shop','drugShop','bookShop','castleHuanShouShop'].includes(owner)){
   const value={huanShouShop:9,shop:4,drugShop:2,bookShop:14,castleHuanShouShop:0}[owner];literal(row,value,extra,`this.${owner}.openNumber = ${value};`,'number of unlocked shop rows');
  }else if(owner==='huanShou'&&property==='maxBattleNum')literal(row,2,main,'this.huanShou.maxBattleNum = 2;','maximum deployed pets');
  else if(owner==='XPPower'){
   const file='DefineSprite_4603/frame_1/DoAction.as';
   if(property==='_visible'){
    const i=key.match(/_(\d)_visible$/)?.[1];literal(row,false,file,`this.能量格${i}._visible = false;`,'persisted XP-cell visibility');
   }else{
    const value={nowPower:0,nowExp:0,maxPower:3,isFull:false,isUsed:false}[property];
    if(value===undefined)throw Error('Unreviewed XP field');literal(row,value,file,`var ${property} = ${value};`,'XP charge state');
   }
  }else if(owner==='map'&&(/产权$|获得幻境$/.test(property)))literal(row,false,map,`${property} = false;`,'region ownership/reward flag');
  else if(owner==='map'&&['tempTaskPlace','homeCity','oldCity'].includes(property)){
   const value=property==='oldCity'?'卡萨诺城二':'';literal(row,value,map,`${property} = "${value}";`,'region reference; empty string is an intentional initial state');row.reference={kind:'map/region',allowEmpty:true};
  }else if(owner==='friend'&&property==='maxFriendNumber')literal(row,2,'DefineSprite_2381_朋友/frame_1/DoAction.as','maxFriendNumber = 2;','friend capacity before progression updates');
  else if(owner==='allTitle'&&property==='number'){
   const source=anchor(extra,'var allTitle = new Array(');typed(row,'number',[source],'per-pet title counter');row.default={status:'verified-initial-state',value:3,source:[source],registryReference:'pet type selected by original allTitle index'};
  }
  if(owner==='map.npcState'){
   if(property==='length'){
    typed(row,'number',[anchor(map,'var npcState = new Array();')],'NPC table cardinality');row.default={status:'verified-initial-state',value:survey.npcs.length,source:survey.npcs.map(n=>n.source)};
   }else{
    const values=npcInitial.map(n=>n.values[property]);
    const types=[...new Set(values.filter(v=>typeof v!=='object').map(v=>typeof v))];
    if(types.length!==1||types[0]==='undefined')throw Error('Unreviewed NPC property '+property);
    typed(row,types[0],[anchor('__Packages/FriendClass.as','function FriendClass(target)')], 'FriendClass defaults applied to every registered NPC; optional unnamed-NPC state is preserved',values.some(v=>typeof v==='object'));
    row.default={status:'verified-per-content-initial-state',reference:'npc-defaults.json',selector:'npc:nTitle',property};
    row.restoreSemantics={mode:['nTitle','cmd','oldCmd'].includes(property)?'unconditional assignment':'restore only when stored NPC name is neither empty nor undefined',source:row.load[0]?.source,ordering:'source indexes current npcState order; modern stable IDs must retain legacy index mapping'};
    if(property==='nTitle')row.reference={kind:'npc',identity:'npc:nTitle'};
   }
  }
  if(owner==='map.role'&&row.type.status!=='verified'){
   const seeds=initialization.RoleMC.filter(s=>s.property===property&&['number','string','boolean'].includes(typeof s.value));
   if(seeds.length){
    const last=seeds.at(-1);typed(row,typeof last.value,seeds.map(s=>s.source),'owner-specific RoleMC declaration or constructor field');
    row.default={status:'verified-constructor-value',value:last.value,source:seeds.map(s=>s.source),scope:'before profession/map initialization; source class field is not a UI text field'};
   }else if(property==='myName'){
    typed(row,'string',[anchor(map,'role.myName = _parent.beginName;')],'selected player name');row.default={status:'user-input',expression:'_parent.beginName',source:[anchor(map,'role.myName = _parent.beginName;')]};
   }else if(property==='vocational'){
    typed(row,'string',[anchor(map,'role.vocational = "战士";'),anchor(map,'role.vocational = "法师";')],'selected profession');row.default={status:'selected-content',values:['战士','法师'],reference:'profession registry'};row.reference={kind:'profession'};
   }else if(property==='_x'||property==='_y'){
    const source=anchor(map,`this.role.${property} =`);typed(row,'number',[source],'map-local coordinate');row.default={status:'map-entry-coordinate',expression:`map[nextEntry].${property}`,source:[source,anchor(start,'this.nextEntry = "entry3";')]};
    row.restoreSemantics={mode:'restore-both-coordinates-if-both-defined; clear nextEntry to prevent entry relocation',source:anchor(extra,'if(moyu_so.data.role_x != undefined && moyu_so.data.role_y != undefined)')};
   }else throw Error('Unreviewed raw RoleMC field '+property);
  }
  if(owner==='map.role'&&['militaryRank','militaryRankFire','xxx_chaw','chawFire','job','jobFire','titleLevel','xxx_credit'].includes(property)){
   const file='__Packages/RoleMC.as';
   const initializationFragment=property.startsWith('militaryRank')?'this.xxx_militaryRank = 0;':property==='xxx_chaw'||property==='chawFire'?'this.xxx_chaw = 0;':property==='job'||property==='jobFire'?'this.job = 0;':'this.xxx_credit = 0;';
   row.default={status:'verified-constructor-value',value:0,scope:'after RoleMC constructor; before wudi/other gameplay initialization',source:[anchor(file,initializationFragment)],contract:'role-progression.md'};
   if(property==='xxx_credit'||property==='titleLevel')row.default={status:'verified-initialization-stage',value:property==='xxx_credit'?500:10,scope:'after normal initNewGame calls wudi; later gameplay/readGame may replace it',source:[anchor(start,'this.role.xxx_credit = 500;'),anchor(file,'var _loc3_ = Math.floor(val / 50);')],contract:'role-progression.md'};
   row.restoreSemantics={mode:'exact source load property setter; never write read-only getter alias',missingOrNaNWrite:'preserve previous decoded value',source:row.load[0]?.source,order:'rank/chaw/job/credit first; saved militaryRankFire/chawFire/jobFire/titleLevel afterwards override derived state',contract:'role-progression.md'};
  }
  if(owner==='map.role'&&['lifeSourseLevels','mpSourseLevels','maxLifeSourse','maxMpSourse','lifeSourse','mpSourse','maxLife','maxMp','life','mp'].includes(property)){
   const file='__Packages/RoleMC.as';
   const recipe=property.endsWith('SourseLevels')?'constructor sets 1; capacity recalculated using current maximum':property.startsWith('max')&&property.endsWith('Sourse')?'current maximum multiplied by source level; recalculated after either setter':property.endsWith('Sourse')?'fresh decoded read 0; no constructor refill':property==='maxLife'||property==='maxMp'?'profession rates plus level/skill/equipment terms then percentage and Math.round in flashAttribute':'map initializes equipment attributes, then isAlive=true fills current value to current maximum';
   row.default={status:'source-initialization-recipe',recipe,source:[anchor(file,'function RoleMC()'),anchor(file,'function flashAttribute()'),anchor(map,'role.isAlive = true;',true)],contract:'role-vitals.md',scope:'staged source initialization, not an arbitrary universal numeric default'};
   row.restoreSemantics={mode:'source load accessor assignment',source:row.load[0]?.source,missingOrNaNWrite:'preserve previous decoded value',order:'source levels/capacities/current first; maxima afterwards recompute capacities; current life/mp then apply ordered upper/lower comparisons',contract:'role-vitals.md'};
  }
  if(owner==='map.role'&&['maxExp','xxx_nowExp','xxx_maxLevels','levels','militaryExploit','exploit','expBallNum'].includes(property)){
   const value={maxExp:9,xxx_nowExp:0,xxx_maxLevels:150,levels:1,militaryExploit:0,exploit:0,expBallNum:0}[property],file='__Packages/RoleMC.as';
   row.default={status:'verified-constructor-value',value,scope:'after constructor; before new-game/load and post-entry debug-name branch',source:[anchor(file,`this.${property} = ${value};`)],contract:'role-progression.md'};
   if(property==='levels')row.default.laterOverride={condition:'myName.toLowerCase() == "debug" && levels < 100',value:100,source:anchor(start,'if(this.role.levels < 100)')};
   row.restoreSemantics={mode:'assign through source numeric setter',missingOrNaNWrite:'preserve previous decoded value',source:row.load[0]?.source,limit:property==='xxx_maxLevels'?'upper cap 150':property==='levels'?'reject above current xxx_maxLevels; no lower clamp':'no range clamp',postEntry:'debug-name function runs after both new-game and readGame paths; raises levels below 100 without recomputing maxExp',contract:'role-progression.md'};
  }
  if(owner.startsWith('task.')){
   const group=owner.slice(5),records=survey.tasks.filter(t=>t.group===group),sources=records.map(t=>t.source);
   if(property==='isComplete'||property==='isDoing'){
    if(!records.every(t=>t.data[property]===false))throw Error('Task flag seed changed');
    typed(row,'boolean',sources,'task state flag; source container/index identity retained');
    row.default={status:'verified-initial-state',value:false,source:sources};
    if(group==='mainTask'&&property==='isDoing')row.default={status:'profession-conditional',base:false,activeIndex:{战士:0,法师:1},source:[anchor('DefineSprite_2210_任务系统/frame_1/DoAction.as','this.nextMainTask = function()'),anchor(start,'_parent.task.nextMainTask();')]};
   }else{
    const type=['name','explain'].includes(property)?'string':'number';typed(row,type,sources,'daily objective state, distinct from quest title identity');
    row.default={status:'per-task-definition',reference:'quest registry',group,property,scope:'initial need/explain; accepting a dynamic daily task replaces need using setDailyTask/setFriendTask'};
    if(property==='length')row.default.projection='need.length';
    if(property==='number')row.default.projection=row.save[0].expression.includes('need[0]')?'need[0].number':'need[n].number';
   }
   row.restoreSemantics={mode:group==='dailyTask'?'flags first; only active daily tasks restore objectives, four special tasks restore need[0].number, others rebuild the need array; friend commission also restores explain':'restore flags by original array index',source:row.load[0]?.source,missing:'source does not apply generic defaults for missing flags'};
   row.reference={kind:'quest',identity:group+':index',objectiveNames:'event/objective or enemy/item references; retain raw source string'};
  }
  if(owner==='roleSkills'){
   typed(row,property==='name'?'string':'number',survey.skills.map(s=>s.source),'learned skill name/level; only studied skills are written');
   row.default={status:'per-skill-definition-plus-profession',reference:'skill registry',unlearnedLevel:0,initialLearned:{战士:'斩魂',法师:'火球术'},source:[anchor(start,'this._parent.roleSkills.addSkill("斩魂");'),anchor(start,'this._parent.roleSkills.addSkill("火球术");')]};
   row.restoreSemantics={mode:'call addSkill(stored name, stored level); not direct field assignment',source:anchor(extra,'this.roleSkills.addSkill(moyu_so.data[')};row.reference={kind:'skill'};
  }
  if(owner==='friend'&&property!=='maxFriendNumber'){
   const source=anchor('DefineSprite_2381_朋友/frame_1/DoAction.as','allFriends.splice(0,allFriends.length);');
   typed(row,property==='length'?'number':'string',[source,anchor(extra,'this.friend.allFriends.splice(0,this.friend.allFriends.length);')],'NPC relationship reference or relationship count',property==='nTitle');
   row.default=property==='length'?{status:'verified-initial-state',value:0,source:[source]}:{status:'no-initial-reference',value:{state:'undefined'},source:[anchor('DefineSprite_2381_朋友/frame_1/DoAction.as','lover = undefined;')]};
   row.reference={kind:'npc',resolver:'map.getNpc(nTitle)'};row.restoreSemantics={mode:'lover lookup only when stored name defined; clear/rebuild friends and call friend.upData',source:anchor(extra,'this.friend.allFriends.splice(0,this.friend.allFriends.length);')};
  }
  if(owner==='map'&&['levels','moreFire'].includes(property)){
   const records=census.objects.filter(o=>o.source.file===map&&o.data.maxLevels!==undefined&&o.data.moreFire!==undefined&&typeof o.data.name==='string');
   if(records.length!==13||records.some(o=>typeof o.data[property]!=='number'))throw Error('Boss growth table changed');
   typed(row,'number',records.map(r=>r.source),'boss progression table state');row.default={status:'verified-per-content-initial-state',values:records.map(r=>({contentId:'boss-growth:'+r.data.name,value:r.data[property]}))};row.reference={kind:'boss-growth',identity:'original bossLevels index maps to registered name'};
  }
  if(owner==='map'&&property==='nowMap'){
   typed(row,'string',[anchor(map,'this.nowMap = this.nextMap;')],'current map label');row.default={status:'verified-new-game-value',value:'卡萨诺城郊区',source:[anchor(start,'this.nextMap = "卡萨诺城郊区";')]};row.reference={kind:'map'};
  }
  if(owner==='mainCastle.building'){
   const records=census.objects.filter(o=>o.source.file==='DefineSprite_2313_主城堡/frame_1/DoAction.as'&&o.data.upPrice!==undefined);
   row.default={status:'verified-per-content-initial-state',values:records.map(r=>({contentId:'building:'+r.data.name,value:r.data[property]})),source:[anchor('DefineSprite_2313_主城堡/frame_1/DoAction.as','this.initData = function()')]};row.reference={kind:'building',identity:'original building array index'};
   row.restoreSemantics={mode:'numeric-setter assignment in current building order',missingOrNaNWrite:'preserve previous decoded value',source:row.load[0]?.source,loopBound:'building.length; source _loc4_ remains zero, not a ten-record limit',notStored:'needMainLevels changes on upgrade but is neither stored nor reset by initData; name/upPrice/maxLevels also not stored',contract:'buildings.md'};
  }
  if(owner==='huanShou.allHuanShou'&&row.type.status!=='verified'){
   const file='__Packages/HuanShouClass.as';
   if(property==='length'){
    typed(row,'number',[anchor(start,'_parent.useItem({type:"凯恩"});')],'pet array length');row.default={status:'verified-new-game-value',value:1,source:[anchor(start,'_parent.useItem({type:"凯恩"});')]};
   }else if(property==='type'){
    typed(row,'string',[anchor(file,'this.type = hs.type;')],'pet species identity');row.default={status:'selected-pet-template',reference:'pet registry; initial pet is 凯恩'};row.reference={kind:'pet'};
   }else if(property==='isGod'){
    typed(row,'boolean',[anchor(file,'if(hs.isGod == true)')],'constructor normalizes only true to god state');row.default={status:'constructor-fallback',value:false,condition:'hs.isGod != true',source:[anchor(file,'if(hs.isGod == true)')]};
   }else if(['nowLifeLv','sd','qyg'].includes(property)){
    typed(row,'number',[anchor(file,`var ${property} = 0;`)],'pet evolution/life-generation state');row.default={status:'constructor-fallback',value:0,condition:`hs.${property} == undefined`,source:[anchor(file,`var ${property} = 0;`)]};
   }else if(property==='nextLvRate'){
    typed(row,'number',[anchor(file,'var nextLvRate = random(3) * 0.1 + 1.3;')],'next life-generation growth multiplier');row.default={status:'source-generator',expression:'random(3) * 0.1 + 1.3',condition:'hs.nextLvRate == undefined',source:[anchor(file,'var nextLvRate = random(3) * 0.1 + 1.3;')]};
   }else throw Error('Unreviewed pet field '+property);
  }
  if(owner==='huanShou.allHuanShou'&&['levels','rateLife','rateMinAttack','rateMaxAttack','rateDefense','zs','maxZs','element','titleNum','nowExp','maxExp','oldLevels','oldNowExp','oldMaxExp','rareFen'].includes(property)){
   const file='__Packages/HuanShouClass.as';
   const fallback={nowExp:0,maxExp:'Math.floor(this.levels * 9)',oldLevels:1,oldNowExp:0,oldMaxExp:'Math.floor(this.levels * 9)'};
   row.default={status:'source-initialization-recipe',recipe:property==='rareFen'?'species initialize value, replaced by hs.rareFen only when strictly larger':Object.hasOwn(fallback,property)?`hs.${property} when != undefined, otherwise ${fallback[property]}`:`hs.${property} through original numeric setter; supplied by registered pet variant or random generator`,source:[anchor(file,'function HuanShouClass(hs)'),anchor(file,'this.initialize();'),anchor(file,'this.checkUp();')],contract:'pet-initialization.md',scope:'constructor through species initialization and attribute calculation; not a universal per-species scalar'};
   row.restoreSemantics={mode:'readGame creates a new HuanShouClass from stored fields',source:row.load[0]?.source,contract:'pet-initialization.md',ordering:'constructor optional defaults, species initialize, rareFen floor, checkUp and full life refill',sourceDefect:'readGame object repeats nextLvRate for sd/qyg; preserve separate modern fields rather than silently imitate a guessed duplicate-key outcome'};
  }
 }
 for(const row of fields){
  if(row.restoreSemantics||!row.load.length)continue;
  const sources=row.load.map(s=>s.source);
  if(row.key==='versions'){
   row.restoreSemantics={mode:'control metadata, not assigned to game version',source:sources,ordering:'newer-version rejection occurs before getLocal(requested slot); later older-version migration uses the opened slot',migration:'older versions set huanShouShop.number=20 and add 3 unlocked rows; shop.number=16 and unlock 16 if previously 15; castleGemShop number/openNumber=8',contract:'restore-remaining-fields.md'};
  }else if(row.owner==='huanShou.allHuanShou'){
   row.restoreSemantics={mode:row.property==='length'?'clear array then iterate i < stored length and construct each pet':'passed into HuanShouClass constructor',source:sources,contract:'pet-initialization.md',sourceDefect:['sd','qyg','nextLvRate'].includes(row.property)?'source repeats nextLvRate keys; modern fields must remain distinct':'none for this field',afterRestore:'checkUp called again per pet, then huanShou.afterAdd()'};
  }else if(['root','_root','map','map.role','XPPower','huanShouShop','shop','drugShop','bookShop','castleHuanShouShop','friend','allTitle','huanShou'].includes(row.owner)){
   if(row.owner==='map.role'){
    const text=cache.get('__Packages/RoleMC.as');
    if(text.includes(`function set ${row.property}(`))throw Error('Unreviewed role setter restore '+row.property);
   }
   row.restoreSemantics={mode:row.property==='_visible'?'direct assignment to native MovieClip visibility':'direct source assignment',source:sources,missing:'source passes undefined; no generic default fill or validation',conditions:row.load.map(s=>s.conditions),contract:'restore-remaining-fields.md'};
   if(row.owner==='map.role'&&['militaryRankName','chawName','jobName'].includes(row.property))row.restoreSemantics.laterEffect='later rank/job setters may replace the stored display name';
   if(['huanShouShop','shop'].includes(row.owner))row.restoreSemantics.laterEffect='older-version migration may change unlocked row count';
   if(row.owner==='XPPower')row.restoreSemantics.laterEffect='energy count, full flag and six visibility flags restored independently; no consistency recomputation in readGame';
   if(row.owner==='map'&&['levels','moreFire'].includes(row.property))row.restoreSemantics.iteration='current bossLevels length, not stored array length; _loc4_ is not incremented';
  }else throw Error('Missing restore review '+row.owner+'.'+row.property);
 }
 return fields;
}

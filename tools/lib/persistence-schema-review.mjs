import fs from 'node:fs';
import {functionRange} from './as2-data.mjs';
const root='local-resources/moyu/source-index/as/scripts/';
const main='frame_9/DoAction_2.as';
const source=fs.readFileSync(root+main,'utf8');
const loc=(fragment,file=main)=>{
 const text=file===main?source:fs.readFileSync(root+file,'utf8'),index=text.indexOf(fragment);
 if(index<0)throw Error('Missing schema anchor: '+file+' / '+fragment);
 return {file,line:text.slice(0,index).split('\n').length};
};
export const restorationPhases=[
 ['metadata',1687,1717,'Filename guard, then version guard before getLocal; timer/progress then identity.'],
 ['role',1718,1767,'Exact load setter names and order; source capacities overwritten by maxima; rank/job derived values overwritten by saved bonuses.'],
 ['pets',1768,1777,'Clear, construct each stored pet, checkUp again, afterAdd; source constructor object repeats nextLvRate three times. Constructor refills life; no saved deployment.'],
 ['items',1778,1940,'Backpack 1..40, shortcuts 1..7, warehouse 1..54, six equipment slots, bells 1..3, crafting slots; empty/missing type goes through empty-slot branch.'],
 ['buildings-shops',1941,1954,'Current building order levels then prizeLv; shop unlock counts. Source loop guard counter never increments.'],
 ['npcs',1955,1981,'Current NPC table order; nTitle/cmd/oldCmd always assigned; other fields only for nonempty defined saved name.'],
 ['quests',1982,2034,'Main, branch, dare, daily flags; only active daily objectives rebuilt; four named daily tasks keep their objective identity.'],
 ['skills',2035,2040,'Current skill table length, addSkill(saved name, level), no blanket clear here.'],
 ['friends',2041,2053,'Clear friends, optional lover lookup, capacity, addFriend by nTitle then upData; resolve after NPC restoration.'],
 ['world',2054,2089,'Boss progression by current index; map and paired coordinates; missing coordinate chooses entry1.'],
 ['xp-title-pk',2090,2115,'XP fields and six visibility values independently; title counts then PK flags.'],
 ['legacy-migration',2116,2127,'Older source version applies shop capacity/unlock adjustments.'],
 ['finalize',2128,2131,'Detach SharedObject, message, equipment.flashAttribute (calls role.flashAttribute), task.showTask. Map frame2 then changeDepth/gotoAndStop/debug.'],
].map(([id,start,end,semantics])=>({id,start,end,semantics,source:{file:main,line:start},evidence:'verified'}));

const itemOwners=new Set(['backPack','fastKey','wareHouse','equipment','huanShouItem.bell','makeBell','make','splitStone','castleStone']);
const stageSources=[loc('function RoleMC()','__Packages/RoleMC.as'),loc('role.myName = _parent.beginName;','DefineSprite_4536/frame_1/DoAction.as'),loc('initData = function()'),loc('initNewGame = function()','DefineSprite_4536/frame_2/DoAction.as'),loc('debug();','DefineSprite_4536/frame_2/DoAction.as')];

function finalInitialization(row){
 const owner=row.owner,p=row.property;
 if(owner==='map.role')return {
  evidence:'verified',sources:stageSources,
  recipe:['Apply class declarations and RoleMC constructor (see field default).','Apply selected profession rates/name, equipment.flashAttribute, isAlive=true refill.','Run root initData; new-game only: KaiEn pet + battle, profession skill + shortcut, nextMainTask, source grants and random ring, wudi currency/credit.','Enter map at entry3; debug name additionally grants ring/items, credit=500, levels=max(levels,100).'],
  result:['maxLife','maxMp','maxLifeSourse','maxMpSourse'].includes(p)?'Recomputed from profession, level, skills, equipment and source levels; do not use a universal scalar.':p==='life'||p==='mp'?'Refilled at map frame1 maxima; subsequent maximum recalculations do not refill or clamp.':p==='_x'||p==='_y'?'Source entry3 coordinate in starting map; never use constructor display placement.':p==='levels'?'1 for normal name; 100 for case-insensitive debug name, maxExp remains 9.':p==='xxx_credit'?'500 after wudi (cap 500).':p==='titleLevel'?'10 after wudi credit setter.':'Field-specific default above, then only the listed initialization setters/conditional overrides; no missing-save default substitution.',
 };
 if(itemOwners.has(owner))return {evidence:'verified',sources:[loc('initData = function()'),loc('initNewGame = function()','DefineSprite_4536/frame_2/DoAction.as')],recipe:'Container reset/empty slots, then source grants/factories and type-specific delivery; template defaults, getter-zero and random selectors are distinct. Backpack receives random starter ring and wudi grants; fastKey slot5 receives profession skill icon (source references the first skill slot object); debug name adds grants. Other slots remain empty unless explicitly initialized. Capacity is separate from stack number.',result:'Use registered template/generator + setter semantics; never reroll a loaded item or fill absent fields from another type.'};
 if(owner==='huanShou.allHuanShou')return {evidence:'verified',sources:[loc('_parent.useItem({type:"凯恩"});','DefineSprite_4536/frame_2/DoAction.as'),loc('function HuanShouClass(hs)','__Packages/HuanShouClass.as')],recipe:'New game constructs the registered 凯恩 seed, applies optional fallbacks, species initialization, rareFen floor, checkUp and life refill, then battle first pet. nextLvRate is a draw, not fixed 1.3. Restore constructs from saved fields instead.',result:'Per-field pet-initialization.md recipe, including explicit zero and species-dependent score limits.'};
 if(owner.startsWith('task.'))return {evidence:'verified',sources:[loc('_parent.task.nextMainTask();','DefineSprite_4536/frame_2/DoAction.as')],recipe:'Task definitions and initData, then profession-selective nextMainTask; daily objective definitions remain until task acceptance generates a replacement.',result:'Field default and registered quest definition; main active index depends on profession.'};
 return {evidence:'verified',sources:stageSources.slice(2),recipe:'Use this owner-specific field default (literal, per-content record or explicit generator). Root initData resets task/friend/building state; new-game script is skipped for readGame, but the common debug-name tail still runs afterwards.',result:'No universal fallback on missing load; retain missing raw key and apply the recorded source restore condition.'};
}

export function finalizePersistenceFields(fields){
 for(const row of fields){
  if(row.type.status!=='verified'||['unknown','source-initialization-steps'].includes(row.default.status))throw Error('Incomplete persistence field '+JSON.stringify(row.key));
  if(!row.restoreSemantics){
   if(row.load.length)throw Error('Unreviewed restore '+JSON.stringify(row.key));
   row.restoreSemantics={mode:row.externalAccess?.length?'selection-metadata-only':'preserve-without-source-restore',readCoverage:row.readCoverage,modernPolicy:'Keep raw value; unsupported capacity/count never truncates retained entries.'};
  }
  row.finalInitialization=finalInitialization(row);
  row.postRestoreEffects=row.owner==='map.role'?{evidence:'verified',source:[loc('this.roleSkills.addSkill(moyu_so.data['),loc('this.equipment.flashAttribute();'),loc('this.roleSkills.effect = function','frame_9/DoAction.as')],recipe:'Later addSkill calls effect: heavyDamage/frost/skillAttack/heavyHit/nonDefense/skillDefense/skillLife/skillMp may replace earlier saved values; passive effects call role.flashAttribute. Final equipment.flashAttribute again calls role.flashAttribute. Maxima/capacities are derived again; current life/mp/source values are not refilled by a maximum write.'}:
   row.owner==='roleSkills'?{evidence:'verified',source:[loc('this.roleSkills.addSkill = function','frame_9/DoAction.as')],recipe:'Search current list by name backwards; reject when current level+1 exceeds maxLevels before applying reLv. Zero current level marks studied/increments count (XP skills set isUsed); numeric reLv including 0 assigned, otherwise increment; effect then afterAdd sorts current list and rebuilds page. readGame iterates current allSkills length while the list can reorder. Missing/unrecognized name returns false. Later stored XPPower.isUsed overrides the addSkill effect.'}:
   row.owner==='friend'||row.owner==='map.npcState'?{evidence:'verified',source:[loc('this.addFriend = function(NPC)','DefineSprite_2381_朋友/frame_1/DoAction.as'),loc('this.addRelation = function(npc, val)','DefineSprite_2381_朋友/frame_1/DoAction.as')],recipe:'After NPC fields, friends are added by resolved object. addFriend enforces capacity and rejects duplicate object identities; successful append changes friendNumber, calls addRelation(NPC,0), updates pages. addRelation can change levels/relation names/maxRelation even for zero increment when threshold met.'}:
   {evidence:'verified',recipe:'Apply field restore semantics and ordered phase, including final dependency refresh; no additional field-specific restore callback beyond its recorded owner/accessor contract.'};
  row.restorePlan=row.load.map(access=>{
   const phase=restorationPhases.find(p=>access.source.line>=p.start&&access.source.line<=p.end);
   if(!phase)throw Error('Unmapped restore position '+access.source.line);
   return {phase:phase.id,source:access.source,statement:access.statement,conditions:access.conditions};
  });
  row.persistence={evidence:'design',storage:'source-key',presence:'absent key and explicit undefined remain distinct',valueModel:'PreservedValue',projection:'Only implemented, validated fields may execute; raw data retained even when projection is unavailable.',mutation:'Exact owned-key set/delete; omission from projection is never deletion.',classification:['saved','saveTime','versions'].includes(row.key)?'metadata':row.owner==='map.role'&&['maxLife','maxMp','maxLifeSourse','maxMpSourse','militaryRankName','chawName','jobName','militaryRankFire','chawFire','jobFire','titleLevel'].includes(row.property)?'persistent-with-derived-overwrite':'persistent'};
 }
 return fields;
}

export function restorationMatrix(fields){
 const read=functionRange(source,'readGame = function()').text;
 return {schemaVersion:1,scope:'Complete source field semantics and data representation; no storage adapter or playable restore.',phases:restorationPhases,
  sourceRestoreBody:read,
  fieldOrder:fields.flatMap(row=>row.restorePlan.map(plan=>({key:row.key,...plan}))).sort((a,b)=>a.source.line-b.source.line),
  nonRestored:fields.filter(row=>!row.load.length).map(row=>({key:row.key,policy:row.restoreSemantics})),
  designOrder:['Validate selected envelope/version without changing live state.','Retain complete raw source and extensions.','Build fresh owners/identity maps; follow source restore matrix for legacy projection, applying documented repairs.','Recompute equipment/role dependencies, then apply modern extension current-state overrides.','Resolve references only for supported content; keep dangling records opaque.','Publish complete state atomically; rebuild view and input transients.'],
 };
}

export function persistenceHandoffCoverage(fields,records){
 const handoff=records.filter(r=>r.group==='persistence-handoff');
 const rows=handoff.map(row=>{
  const matches=fields.filter(f=>[...f.save,...f.load,...(f.externalAccess??[])].some(a=>a.source.file===row.source.file&&a.source.line===row.source.line));
  let disposition,reason;
  if(matches.length){disposition='field-semantics';reason='Mapped to exact source access and field restore/default/preservation contract.';}
  else if(row.source.file.startsWith('DefineSprite_4233/')||row.source.file.startsWith('DefineSprite_4234/')){disposition='transient-slot-ui';reason='Slot filename/SharedObject handle, selection control or rendered text; not a stored game field. Selection reads retained in externalAccess.';}
  else if(row.source.file==='frame_8/DoAction.as'){disposition='transient-preload';reason='Selected slot handle and isRead routing; role name/profession pre-read mapped separately.';}
  else if(row.source.file===main){
   if(['i','n','_loc4_','_loc8_','thingType','_loc27_','$return','moyu_so','timedate','saveinfo'].includes(row.target)){disposition='transient-control';reason='Loop/index/type/slot/date/flush or return control; retain loop bounds and conditions in sourceRestoreBody/savePlan, not a domain save key.';}
   else if(row.target==='this.task.dailyTask[i].need'){disposition='derived-restore-container';reason='Active daily objective array cleared before recorded length/elements are pushed; raw absent/hole values remain preserved.';}
   else if(row.target==='this.map.nextEntry'){disposition='derived-entry-routing';reason='Both coordinates present clears nextEntry; otherwise entry1. Paired coordinate policy in world phase.';}
   else if(row.source.line>=2118&&row.source.line<=2126){disposition='legacy-version-adjustment';reason='Older-version shop capacities/unlock adjustment; explicit one-time modern migration, never generic current-version default.';}
  }
  if(!disposition)throw Error('Unreviewed persistence handoff '+row.id);
  return {id:row.id,source:row.source,target:row.target,disposition,reason,fields:matches.map(f=>typeof f.key==='string'?f.key:f.key.expression)};
 });
 if(rows.length!==927||new Set(rows.map(r=>r.id)).size!==927)throw Error('Persistence handoff set changed; review required');
 return {task:'TASK-DATA-019',scope:'927 DATA-018 handoff records, field semantics or explicit nonpersistent control disposition',counts:Object.fromEntries([...new Set(rows.map(r=>r.disposition))].map(d=>[d,rows.filter(r=>r.disposition===d).length])),records:rows};
}

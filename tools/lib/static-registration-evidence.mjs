import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root='local-resources/moyu/source-index/as/scripts/';
const plain=v=>JSON.parse(JSON.stringify(v));
/** Execute only selected original table declarations in an offline, bounded context. */
export function verifyStaticDeclarations(definitions){
 const expected=[];
 const tables=[
  {kind:'npc',file:'DefineSprite_4536/frame_1/DoAction.as',prefix:'npcState.push(',identity:'nTitle',context:()=>({npcState:[],FriendClass:function(seed){Object.assign(this,seed);}}),result:c=>c.npcState},
  {kind:'building',file:'DefineSprite_2313_主城堡/frame_1/DoAction.as',prefix:'building.push(',identity:'name',context:()=>({building:[],BuildingClass:function(seed){Object.assign(this,seed);}}),result:c=>c.building},
  {kind:'skill',file:'frame_9/DoAction.as',prefix:'this.roleSkills.allSkills.push(',identity:'name',context:()=>({roleSkills:{allSkills:[]}}),result:c=>c.roleSkills.allSkills},
  {kind:'boss-growth',file:'DefineSprite_4536/frame_1/DoAction.as',prefix:'bossLevels.push(',identity:'name',context:()=>({bossLevels:[]}),result:c=>c.bossLevels},
 ];
 for(const table of tables){
  const lines=fs.readFileSync(root+table.file,'utf8').split(/\r?\n/);
  for(const [i,line] of lines.entries())if(line.trim().startsWith(table.prefix)){
   const context=table.context();vm.runInNewContext(line,context,{timeout:1000});
   const rows=plain(table.result(context));assert.equal(rows.length,1,'Unexpected table statement result');
   const data=rows[0],name=data[table.identity];expected.push({kind:table.kind,id:table.kind+':'+name,name,data,source:[{file:table.file,line:i+1}]});
  }
 }
 const file='frame_9/DoAction_2.as',lines=fs.readFileSync(root+file,'utf8').split(/\r?\n/);
 for(const [i,line] of lines.entries()){
  const m=line.match(/^_global\.(战士|法师)(weaponName|clotheName|shoesName|helmetName) = /);if(!m)continue;
  const context={_global:{}};vm.runInNewContext(line,context,{timeout:1000});
  const names=plain(context._global[m[1]+m[2]]);
  for(const [index,name] of names.entries())expected.push({kind:'equipment',id:'equipment:'+m[1]+':'+name,name,data:{profession:m[1],family:m[2],sourceNameIndex:index},source:[{file,line:i+1}]});
 }
 const questFile='DefineSprite_2210_任务系统/frame_1/DoAction_2.as';
 const questLines=fs.readFileSync(root+questFile,'utf8').split(/\r?\n/),ordinals={};
 for(const [i,line] of questLines.entries()){
  const match=line.trim().match(/^(mainTask|branchTask|dareTask|dailyTask)\.push\(/);if(!match)continue;
  const group=match[1],index=ordinals[group]??0;ordinals[group]=index+1;
  const scenarios=['战士','法师'].map(vocational=>{
   const context={[group]:[],role:{vocational}};vm.runInNewContext(line,context,{timeout:1000});assert.equal(context[group].length,1);
   return {vocational,data:{...plain(context[group][0]),sourceGroup:group,sourceIndex:index}};
  });
  expected.push({kind:'quest',id:`quest:${group}:${index}`,name:scenarios[0].data.name,scenarios,line,source:[{file:questFile,line:i+1}]});
 }
 const kinds=['npc','building','skill','equipment','quest','boss-growth'];
 for(const kind of kinds)assert.equal(definitions.filter(d=>d.kind===kind).length,expected.filter(d=>d.kind===kind).length,'Static table count '+kind);
 assert.equal(new Set(expected.map(d=>d.id)).size,expected.length,'Duplicate source identity');
 for(const row of expected){
  const actual=definitions.find(d=>d.id===row.id);assert.ok(actual,'Missing static declaration '+row.id);
  assert.equal(actual.name,row.name);
  if(row.scenarios){
   for(const scenario of row.scenarios){
    const resolve=value=>{
     if(Array.isArray(value))return value.map(resolve);
     if(value&&typeof value==='object'){
      if(Object.keys(value).length===1&&typeof value.expression==='string'){
       assert.ok(row.line.includes(value.expression),'Expression does not occur in source '+row.id);
       return vm.runInNewContext('('+value.expression+')',{role:{vocational:scenario.vocational}},{timeout:1000});
      }
      return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,resolve(v)]));
     }return value;
    };
    assert.deepEqual(resolve(actual.data),scenario.data,'Static data differs '+row.id+' / '+scenario.vocational);
   }
  }else assert.deepEqual(actual.data,row.data,'Static data differs '+row.id);
  assert.deepEqual(actual.source,row.source,'Static anchor differs '+row.id);
 }
 return expected.map(d=>d.id);
}

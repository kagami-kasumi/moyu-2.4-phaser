import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {tokens,matching,value,functionRange,controlScopes} from './lib/as2-data.mjs';
import {source as loadSwf,timeline} from './lib/first-slice.mjs';

const root='local-resources/moyu/source-index/as/scripts/';
const output='docs/reverse-engineering/content-registry';
const hashes=[];
function read(file){const text=fs.readFileSync(root+file,'utf8');hashes.push({file,sha256:crypto.createHash('sha256').update(text).digest('hex')});return text;}
function objects(file,source,pattern){
 const ts=tokens(source),records=[];
 for(const match of source.matchAll(pattern)){
  const index=ts.findIndex(t=>t.start>=match.index+match[0].length&&t.value==='{'&&t.kind==='punctuation');
  if(index<0)throw Error('Missing record '+file);const end=matching(ts,index);
  records.push({source:{file,line:ts[index].line},group:match[1]??null,data:value(source,ts,index,end+1)});
 }return records;
}
const mainFile='frame_9/DoAction.as',main=read(mainFile);
const taskFile='DefineSprite_2210_任务系统/frame_1/DoAction_2.as';
const tasks=objects(taskFile,read(taskFile),/\b(mainTask|branchTask|dareTask|dailyTask)\.push\(/g);
const npcFile='DefineSprite_4536/frame_1/DoAction.as';
const npcs=objects(npcFile,read(npcFile),/\bnpcState\.push\(/g);
const skills=objects(mainFile,main,/this\.roleSkills\.allSkills\.push\(/g);
const factory=functionRange(main,'this.createThing =');
const factoryTokens=tokens(factory.text),items=[];
// The second switch resolves item aliases; first switch only normalizes type/name.
const switchIndices=factoryTokens.map((t,i)=>t.value==='switch'?i:-1).filter(i=>i>=0);
const switchStart=factoryTokens.findIndex((t,i)=>i>switchIndices[1]&&t.value==='{');
const switchEnd=matching(factoryTokens,switchStart);let aliases=[];
for(let i=switchStart+1;i<switchEnd;i++){
 if(factoryTokens[i].value==='case'&&factoryTokens[i+1]?.kind==='string')aliases.push(factoryTokens[i+1].value);
 if(factoryTokens[i].value==='_loc2_'&&factoryTokens[i+1]?.value==='='&&factoryTokens[i+2]?.value==='{'){
  const end=matching(factoryTokens,i+2);items.push({aliases,source:{file:mainFile,line:factory.line+factoryTokens[i].line-1},data:value(factory.text,factoryTokens,i+2,end+1)});aliases=[];i=end;
 }
}
if(aliases.length)throw Error('Unconsumed item cases');
const maps=[],enemies=[];
for(const frame of fs.readdirSync(root+'DefineSprite_4536').filter(n=>/^frame_\d+$/.test(n)).sort((a,b)=>Number(a.slice(6))-Number(b.slice(6)))){
 const file=`DefineSprite_4536/${frame}/DoAction.as`;if(!fs.existsSync(root+file))continue;const source=read(file);
 const names=[...source.matchAll(/allowJumpMap\("([^"]+)"\)/g)];
 for(const m of names)maps.push({name:m[1],frame:Number(frame.slice(6)),source:{file,line:source.slice(0,m.index).split('\n').length},destinations:[...source.matchAll(/(?:this\.)?(entry\d+)\.toMap\s*=\s*"([^"]+)"/g)].map(x=>({entry:x[1],map:x[2]})),npcs:[...source.matchAll(/getNpc\("([^"]+)"\)/g)].map(x=>x[1])});
 enemies.push(...objects(file,source,/\binitMonster\([^\n{]*?(?=\{)/g));
}
const globalsFile='frame_9/DoAction_2.as',globals=read(globalsFile),equipmentNames=[];
for(const m of globals.matchAll(/_global\.(战士|法师)(weaponName|clotheName|helmetName|shoesName) = new Array\(([^;]+)\);/g))equipmentNames.push({profession:m[1],family:m[2],names:[...m[3].matchAll(/"([^"]+)"/g)].map(x=>x[1]),source:{file:globalsFile,line:globals.slice(0,m.index).split('\n').length}});
const save=functionRange(globals,'saveGame ='),load=functionRange(globals,'readGame =');
function fields(block){
 const ts=tokens(block.text),records=[],scopes=controlScopes(block.text);
 for(let i=0;i<ts.length;i++){
  if(ts[i].value!=='moyu_so'||ts[i+1]?.value!=='.'||ts[i+2]?.value!=='data')continue;
  let end=i+3,key;
  if(ts[end]?.value==='.'){key=String(ts[end+1].value);end+=2;}
  else if(ts[end]?.value==='['){const close=matching(ts,end);key={expression:block.text.slice(ts[end+1].start,ts[close-1].end)};end=close+1;}else continue;
  let statementEnd=end;while(statementEnd<ts.length&&ts[statementEnd].value!==';')statementEnd++;
  const statementStart=block.text.lastIndexOf('\n',ts[i].start)+1;
  records.push({key,access:ts[end]?.value==='='&&ts[end+1]?.value!=='='?'write':'read',source:{file:globalsFile,line:block.line+ts[i].line-1},statement:block.text.slice(ts[i].start,ts[Math.min(statementEnd,ts.length-1)].end),fullStatement:block.text.slice(statementStart,ts[Math.min(statementEnd,ts.length-1)].end).trim(),conditions:scopes.filter(s=>s.start<ts[i].start&&s.end>ts[i].end).map(s=>({header:s.header,source:{file:globalsFile,line:block.line+s.line-1}}))});
 }
 return records;
}
const result={status:'survey-not-completion-evidence',sourceRoot:root,items,equipmentNames,tasks,npcs,skills,maps,enemies,persistence:{save:fields(save),load:fields(load)},hashes:[...new Map(hashes.map(h=>[h.file,h])).values()]};
fs.mkdirSync(output,{recursive:true});fs.writeFileSync(output+'/source-survey.json',JSON.stringify(result,null,2)+'\n');
const roots=timeline(loadSwf(),0)[8].layers.filter(p=>p.name).map(p=>({name:p.name,sprite:p.characterId,depth:p.depth}));
fs.writeFileSync(output+'/source-bindings.json',JSON.stringify({sourceSha256:'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9',rootFrame:9,roots},null,2)+'\n');
console.log(JSON.stringify({itemBranches:items.length,itemAliases:items.flatMap(i=>i.aliases).length,equipmentNames:equipmentNames.flatMap(i=>i.names).length,tasks:tasks.length,npcs:npcs.length,skills:skills.length,maps:maps.length,enemyDefinitions:enemies.length,saveAccesses:result.persistence.save.length,loadAccesses:result.persistence.load.length}));

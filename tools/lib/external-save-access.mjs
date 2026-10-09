import fs from 'node:fs';
import {tokens,matching,value,functionRange,controlScopes} from './as2-data.mjs';
export function externalSaveAccess(sources){
 const rows=[];
 for(const source of sources){
  const file=source.file,text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
  if(!text.includes('moyu_so'))continue;
  const ts=tokens(text),scopes=controlScopes(text),excluded=file==='frame_9/DoAction_2.as'?['saveGame =','readGame ='].map(m=>functionRange(text,m)):[];
  for(let i=0;i<ts.length;i++){
   if(ts[i].kind!=='identifier'||ts[i].value!=='moyu_so'||ts[i+1]?.value!=='.'||ts[i+2]?.value!=='data'||excluded.some(r=>ts[i].start>=r.start&&ts[i].end<=r.end))continue;
   let end=i+3,key;
   if(ts[end]?.value==='.'){key=ts[end+1].value;end+=2;}
   else if(ts[end]?.value==='['){const close=matching(ts,end);key=value(text,ts,end+1,close);end=close+1;}
   else continue;
   if(typeof key!=='string')throw Error('Unreviewed external dynamic save key: '+file+':'+ts[i].line);
   rows.push({key,access:ts[end]?.value==='='&&ts[end+1]?.value!=='='?'write':'read',source:{file,line:ts[i].line},lineText:text.split(/\r?\n/)[ts[i].line-1].trim(),conditions:scopes.filter(s=>s.start<ts[i].start&&s.end>ts[i].end).map(s=>({header:s.header,line:s.line}))});
  }
 }
 return rows;
}

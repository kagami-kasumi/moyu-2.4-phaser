// Completeness audit input, independent of the selected factory/table survey.
// A candidate is not automatically classified as a gameplay item.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {tokens,matching,value} from './lib/as2-data.mjs';
const root='local-resources/moyu/source-index/as/scripts';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):e.name.endsWith('.as')?[dir+'/'+e.name]:[]);}
const files=walk(root).sort(),objects=[],sources=[],unparsed=[];
for(const file of files){
 const source=fs.readFileSync(file,'utf8'),ts=tokens(source),relative=file.slice(root.length+1);
 sources.push({file:relative,sha256:crypto.createHash('sha256').update(source).digest('hex')});
 for(let i=0;i<ts.length;i++){
  if(ts[i].kind!=='punctuation'||ts[i].value!=='{'||ts[i+2]?.value!==':')continue;
  const end=matching(ts,i);let data;
  try{data=value(source,ts,i,end+1);}catch(error){unparsed.push({source:{file:relative,line:ts[i].line},reason:error.message,text:source.slice(ts[i].start,ts[end].end)});continue;}
  if(['type','name','nTitle','myName'].some(k=>Object.hasOwn(data,k)))objects.push({source:{file:relative,line:ts[i].line},data});
 }
}
const output={status:'candidate-census-requires-classification',sources,objects,unparsed};
fs.mkdirSync('docs/reverse-engineering/content-registry',{recursive:true});
fs.writeFileSync('docs/reverse-engineering/content-registry/object-census.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({scripts:files.length,objects:objects.length,types:[...new Set(objects.map(x=>x.data.type).filter(x=>typeof x==='string'))].sort()}));


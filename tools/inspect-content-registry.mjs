// Read-only catalog inspection. Does not load original SWF or initialize game objects.
import {registryData} from '../src/content/registry-data.ts';
const args=process.argv.slice(2);
const options={};
for(let i=0;i<args.length;i++){
 if(!['--kind','--name','--id'].includes(args[i])||!args[i+1]||args[i+1].startsWith('--'))throw Error('Usage: npm run inspect:content -- [--kind item] [--name 名称] [--id 稳定ID]');
 options[args[i].slice(2)]=args[++i];
}
const definitions=registryData.definitions.filter(d=>(!options.kind||d.kind===options.kind)&&(!options.id||d.id===options.id)&&(!options.name||d.name===options.name||d.aliases.includes(options.name)));
if(args.length){
 console.log(JSON.stringify(definitions,null,2));
 if(!definitions.length)process.exitCode=1;
}else{
 const counts={};
 for(const d of definitions){const row=counts[d.kind]??={records:0,registeredOnly:0,evidence:{}};row.records++;row.registeredOnly+=d.availability==='registered'?1:0;row.evidence[d.evidence]=(row.evidence[d.evidence]??0)+1;}
 console.log(JSON.stringify({schemaVersion:registryData.schemaVersion,sourceSha256:registryData.sourceSha256,total:definitions.length,counts,orderedStartGrants:registryData.startGrants.length,scope:'Registration records do not mean implemented behavior. See docs/reverse-engineering/content-registry/source-contract.md for verification scope.'},null,2));
}

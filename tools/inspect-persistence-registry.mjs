// Only imports the formal catalog. No original-source or evidence-directory dependency.
import {persistenceFields,persistenceReviewStatus} from '../src/content/persistence-registry-data.ts';
const options={},args=process.argv.slice(2);
for(let i=0;i<args.length;i++){
 if(!['--owner','--property','--id'].includes(args[i])||!args[i+1]||args[i+1].startsWith('--'))throw Error('Usage: inspect:persistence -- [--owner map.role] [--property life] [--id ID]');
 options[args[i].slice(2)]=args[++i];
}
const fields=persistenceFields.filter(f=>Object.entries(options).every(([key,value])=>f[key]===value));
if(args.length){console.log(JSON.stringify({reviewStatus:persistenceReviewStatus,fields},null,2));if(!fields.length)process.exitCode=1;}
else{
 const owners={};for(const field of fields)owners[field.owner]=(owners[field.owner]??0)+1;
 console.log(JSON.stringify({reviewStatus:persistenceReviewStatus,fieldTemplates:fields.length,owners,scope:'Reviewed source field schema, initialization recipes and ordered restore statements; data representation only, no storage adapter'},null,2));
}

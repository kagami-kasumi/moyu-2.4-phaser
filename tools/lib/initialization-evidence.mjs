import {tokens,matching,value,controlScopes} from './as2-data.mjs';

/** Class declarations and constructor writes, preserving source order and guards.
 * These are initialization steps, not a claim about the final value after setters/callbacks.
 */
export function initializationEvidence(source,file,className){
 const ts=tokens(source),scopes=controlScopes(source),steps=[];
 const constructor=source.indexOf('function '+className+'(');
 if(constructor<0)throw Error('Missing constructor '+className);
 const body=ts.findIndex(t=>t.start>=constructor&&t.kind==='punctuation'&&t.value==='{'),end=matching(ts,body);
 const record=(property,start,rhs,last,phase)=>steps.push({property,phase,value:value(source,ts,rhs,last),source:{file,line:ts[start].line},conditions:scopes.filter(s=>s.start<ts[start].start&&s.end>ts[last-1].end).map(s=>({header:s.header,source:{file,line:s.line}}))});
 // Before the constructor only: source classes place their declaration defaults here.
 for(let i=0;i<body;i++)if(ts[i].value==='var'&&ts[i+2]?.value==='='){
  let j=i+3;while(j<ts.length&&ts[j].value!==';'){if(['[','{','('].includes(ts[j].value)&&ts[j].kind==='punctuation')j=matching(ts,j);j++;}
  record(ts[i+1].value,i,i+3,j,'class-declaration');i=j;
 }
 for(let i=body+1;i<end;i++)if(ts[i].value==='this'&&ts[i+1]?.value==='.'&&ts[i+3]?.value==='='&&ts[i+4]?.value!=='='){
  let j=i+4;while(j<end&&ts[j].value!==';'){if(['[','{','('].includes(ts[j].value)&&ts[j].kind==='punctuation')j=matching(ts,j);j++;}
  record(ts[i+2].value,i,i+4,j,'constructor');i=j;
 }
 return steps;
}

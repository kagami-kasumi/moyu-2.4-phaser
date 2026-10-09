// Offline structural reader. Never executes ActionScript or resolves expressions.
export function tokens(source) {
  const out=[]; let i=0,line=1;
  while(i<source.length){
    const start=i,at=line,c=source[i];
    if(/\s/.test(c)){if(c==='\n')line++;i++;continue;}
    if(source.startsWith('//',i)){while(i<source.length&&source[i]!=='\n')i++;continue;}
    if(source.startsWith('/*',i)){i+=2;while(i<source.length&&!source.startsWith('*/',i)){if(source[i++]==='\n')line++;}if(i===source.length)throw Error('Unclosed comment');i+=2;continue;}
    if(c==='"'||c==="'"){
      i++;let value='',closed=false;
      while(i<source.length){let ch=source[i++];if(ch===c){closed=true;break;}if(ch==='\n')line++;
        if(ch==='\\'){ch=source[i++];const escapes={n:'\n',r:'\r',t:'\t',b:'\b',f:'\f'};if(ch==='u'||ch==='x'){const size=ch==='u'?4:2,hex=source.slice(i,i+size);if(!/^[\da-f]+$/i.test(hex)||hex.length!==size)throw Error('Bad escape');value+=String.fromCharCode(parseInt(hex,16));i+=size;}else value+=escapes[ch]??ch;}else value+=ch;
      }if(!closed)throw Error('Unclosed string');out.push({kind:'string',value,start,end:i,line:at});continue;
    }
    const number=source.slice(i).match(/^(?:0x[\da-f]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)/i);
    if(number){i+=number[0].length;out.push({kind:'number',value:Number(number[0]),start,end:i,line:at});continue;}
    const identifier=source.slice(i).match(/^[\p{L}_$][\p{L}\p{N}_$]*/u);
    if(identifier){i+=identifier[0].length;out.push({kind:'identifier',value:identifier[0],start,end:i,line:at});continue;}
    out.push({kind:'punctuation',value:c,start,end:++i,line:at});
  }return out;
}
export function matching(ts,start){
  const pairs={'{':'}','[':']','(':')'},stack=[];
  for(let i=start;i<ts.length;i++){if(ts[i].kind!=='punctuation')continue;const v=ts[i].value;if(pairs[v])stack.push(pairs[v]);else if(['}',']',')'].includes(v)){if(stack.pop()!==v)throw Error('Mismatched delimiter at '+ts[i].line);if(!stack.length)return i;}}
  throw Error('Unclosed delimiter at '+ts[start]?.line);
}
export function split(ts,start,end,separator=','){
  const ranges=[];let begin=start;
  for(let i=start;i<end;i++){if(ts[i].kind==='punctuation'&&['{','[','('].includes(ts[i].value))i=matching(ts,i);else if(ts[i].value===separator&&ts[i].kind==='punctuation'){ranges.push([begin,i]);begin=i+1;}}
  if(begin<end)ranges.push([begin,end]);return ranges;
}
export function value(source,ts,start,end){
  const first=ts[start];if(!first)return {expression:''};
  if(end-start===1){if(first.kind==='string'||first.kind==='number')return first.value;if(first.value==='true')return true;if(first.value==='false')return false;if(first.value==='null')return null;}
  if(end-start===2&&first.value==='-'&&ts[start+1].kind==='number')return -ts[start+1].value;
  if(['{','['].includes(first.value)&&first.kind==='punctuation'&&matching(ts,start)===end-1){
    const parts=split(ts,start+1,end-1);
    if(first.value==='[')return parts.map(([a,b])=>value(source,ts,a,b));
    const obj={};for(const [a,b] of parts){if(ts[a+1]?.value!==':')throw Error('Unsupported object property at '+ts[a].line);if(Object.hasOwn(obj,ts[a].value))throw Error('Duplicate object property');obj[ts[a].value]=value(source,ts,a+2,b);}return obj;
  }
  return {expression:source.slice(first.start,ts[end-1].end)};
}
export function functionRange(source,marker){
  const start=source.indexOf(marker);if(start<0)throw Error('Missing '+marker);const ts=tokens(source);const a=ts.findIndex(t=>t.start>=start&&t.value==='{'&&t.kind==='punctuation');const b=matching(ts,a);return {start:ts[a].start,end:ts[b].end,line:ts[a].line,text:source.slice(ts[a].start,ts[b].end)};
}
/** Retain enclosing control-flow headers; an else is preserved as else, not guessed true/false. */
export function controlScopes(source){
 const ts=tokens(source),result=[];
 for(let i=0;i<ts.length;i++){
  if(ts[i].kind!=='identifier'||!['if','while','for','switch','else'].includes(ts[i].value))continue;
  let start=i,body=i+1;
  if(ts[i].value==='else'&&ts[i+1]?.value==='if')continue; // the if entry below includes else
  if(ts[i].value==='if'&&ts[i-1]?.value==='else')start=i-1;
  if(ts[body]?.value==='(')body=matching(ts,body)+1;
  if(ts[body]?.value!=='{')continue;
  const end=matching(ts,body);
  result.push({header:source.slice(ts[start].start,ts[body].start).trim(),line:ts[start].line,start:ts[body].start,end:ts[end].end});
  if(ts[i].value==='switch'){
   const branches=[];
   for(let j=body+1;j<end;j++){
    if(ts[j].kind==='punctuation'&&['{','(','['].includes(ts[j].value)){j=matching(ts,j);continue;}
    if(ts[j].kind==='identifier'&&['case','default'].includes(ts[j].value)){
     let colon=j+1;while(colon<end&&!(ts[colon].kind==='punctuation'&&ts[colon].value===':'))colon++;
     if(colon===end)throw Error('Missing case colon');branches.push({begin:j,colon});j=colon;
    }
   }
   for(let j=0;j<branches.length;j++){
    const first=branches[j],headers=[source.slice(ts[first.begin].start,ts[first.colon].end)];let last=first;
    while(branches[j+1]?.begin===last.colon+1){last=branches[++j];headers.push(source.slice(ts[last.begin].start,ts[last.colon].end));}
    result.push({header:headers.join(' '),line:ts[first.begin].line,start:ts[last.colon].end-1,end:ts[branches[j+1]?.begin??end].start});
   }
  }
 }
 return result;
}

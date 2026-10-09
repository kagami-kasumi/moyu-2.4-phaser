import fs from 'node:fs';
import crypto from 'node:crypto';
const root='local-resources/moyu/source-index/as/scripts/';
const paths=['DefineSprite_4312/frame_1/DoAction.as','frame_9/DoAction.as'];
const [npc,main]=paths.map(p=>fs.readFileSync(root+p,'utf8'));
function block(s,marker){const start=s.indexOf(marker);if(start<0)throw Error(marker);let p=s.indexOf('{',start),i=p+1,d=1;for(;d;i++){if(s[i]==='{')d++;if(s[i]==='}')d--;}return s.slice(p,i);}
const cases=npc.slice(npc.indexOf('      case 6:\r\n'),npc.indexOf('      case 8:\r\n'));
if(!cases.includes('useThing'))throw Error('missing exchange');
const functions={command:'{ this.clearAnswer(); switch(nextCmd) {\n'+cases+'\n} this.openDialog(); }',accountThing:block(main,'this.backPack.accountThing ='),useThing:block(main,'this.backPack.useThing =')};
const hashes=paths.flatMap(p=>[root+p,root.replace('/as/','/pcode/')+p.replace(/\.as$/,'.pcode')]).map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));
fs.mkdirSync('docs/reverse-engineering/veteran-exchange',{recursive:true});
fs.writeFileSync('docs/reverse-engineering/veteran-exchange/source-functions.json',JSON.stringify({functions,hashes},null,2)+'\n',{flag:'wx'});

import fs from 'node:fs';import crypto from 'node:crypto';import {functionRange} from './lib/as2-data.mjs';
const base='local-resources/moyu/source-index/',read=f=>fs.readFileSync(base+'as/scripts/'+f+'.as','utf8'),npc='DefineSprite_4312/frame_1/DoAction',bag='frame_9/DoAction',text=read(npc),cases=Object.fromEntries([151,155,156,157,158,159,160].map(id=>{const at=text.indexOf('      case '+id+':');return [id,text.slice(at,text.indexOf('      case ',at+12))];}));
const functions={command:'{ this.clearAnswer(); switch(nextCmd) {\n'+Object.values(cases).join('\n')+'\n} this.openDialog(); }'};
for(const n of ['accountThing','useThing'])functions[n]=functionRange(read(bag),'this.backPack.'+n+' = function').text;
const hashes=[npc,bag].flatMap(f=>['as','pcode'].map(ext=>{const path=base+ext+'/scripts/'+f+'.'+ext;return {path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')};}));
const dir='docs/reverse-engineering/legion-packing';fs.mkdirSync(dir,{recursive:true});const out=dir+'/source-functions.json';if(fs.existsSync(out))throw Error('Refuse overwrite');fs.writeFileSync(out,JSON.stringify({cases,functions,hashes},null,2)+'\n');

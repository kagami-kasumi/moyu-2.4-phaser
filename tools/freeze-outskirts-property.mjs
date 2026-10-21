import fs from 'node:fs';import crypto from 'node:crypto';import {functionRange} from './lib/as2-data.mjs';
const base='local-resources/moyu/source-index/',read=f=>fs.readFileSync(base+'as/scripts/'+f+'.as','utf8'),npc='DefineSprite_4312/frame_1/DoAction',role='__Packages/RoleMC',text=read(npc);
const cases=Object.fromEntries([3011,3101,3102].map(id=>[id,text.slice(text.indexOf('      case '+id+':'),text.indexOf('      case ',text.indexOf('      case '+id+':')+12))]));
const functions={command:'{ this.clearAnswer(); switch(nextCmd) {\n'+Object.values(cases).join('\n')+'\n} this.openDialog(); }'};
for(const n of ['spendMs','exploitUp'])functions[n]=functionRange(read(role),'function '+n+'(').text;
const files=[npc,role,'DefineSprite_4536/frame_1/DoAction','frame_9/DoAction_2'];const hashes=files.flatMap(f=>['as','pcode'].map(ext=>{const path=base+ext+'/scripts/'+f+'.'+ext;return {path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')};}));
const out='docs/reverse-engineering/outskirts-property/source-functions.json';fs.mkdirSync('docs/reverse-engineering/outskirts-property',{recursive:true});if(fs.existsSync(out))throw Error('Baseline exists');fs.writeFileSync(out,JSON.stringify({cases,functions,hashes},null,2)+'\n');

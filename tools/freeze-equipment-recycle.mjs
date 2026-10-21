import fs from 'node:fs';import crypto from 'node:crypto';import {functionRange} from './lib/as2-data.mjs';
const base='local-resources/moyu/source-index/',files=['DefineSprite_4312/frame_1/DoAction_2','DefineSprite_2111_给予物品/frame_1/DoAction','DefineSprite_4312/frame_1/DoAction','frame_9/DoAction'],read=p=>fs.readFileSync(base+'as/scripts/'+p+'.as','utf8'),functions={};
for(const n of ['testToExp','weaponToExp','testToBreakUp'])functions[n]=functionRange(read(files[0]),'this.'+n+' = function').text;
for(const n of ['give','setThing'])functions[n]=functionRange(read(files[1]),'this.'+n+' = function').text;
const hashes=files.flatMap(f=>['as','pcode'].map(ext=>{const path=base+ext+'/scripts/'+f+'.'+ext;return {path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')};}));
const dir='docs/reverse-engineering/equipment-recycle';fs.mkdirSync(dir,{recursive:true});const p=dir+'/source-functions.json';if(fs.existsSync(p))throw Error('Refuse overwrite');fs.writeFileSync(p,JSON.stringify({functions,hashes},null,2)+'\n');

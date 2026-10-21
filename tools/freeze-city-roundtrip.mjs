import fs from 'node:fs';import crypto from 'node:crypto';import {functionRange} from './lib/as2-data.mjs';
const base='local-resources/moyu/source-index/',files=[1,8,9].map(n=>'DefineSprite_4536/frame_'+n+'/DoAction'),read=f=>fs.readFileSync(base+'as/scripts/'+f+'.as','utf8'),functions={};
for(const n of ['jumpMap','jumpToMap','allowJumpMap','afterJumpMap'])functions[n]=functionRange(read(files[0]),'this.'+n+' = function').text;
const frames=Object.fromEntries(files.slice(1).map(f=>[f,read(f)])),hashes=files.flatMap(f=>['as','pcode'].map(ext=>{const path=base+ext+'/scripts/'+f+'.'+ext;return {path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')};}));
const out='docs/reverse-engineering/city-roundtrip/source-functions.json';fs.mkdirSync('docs/reverse-engineering/city-roundtrip',{recursive:true});if(fs.existsSync(out))throw Error('Baseline exists');fs.writeFileSync(out,JSON.stringify({frames,functions,hashes},null,2)+'\n');

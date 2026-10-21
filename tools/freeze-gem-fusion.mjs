import fs from 'node:fs';import crypto from 'node:crypto';import {functionRange} from './lib/as2-data.mjs';
const base='local-resources/moyu/source-index/',paths=['frame_9/DoAction','frame_9/DoAction_2','__Packages/ThingMC'],source=fs.readFileSync(base+'as/scripts/'+paths[0]+'.as','utf8');
const functions=Object.fromEntries(['setThing','notice','flashInfo','beginRefine','yesButton.onRelease'].map(k=>[k,functionRange(source,'this.castleStone.'+k+' =').text]));
const hashes=paths.flatMap(p=>['as','pcode'].map(f=>{const path=base+f+'/scripts/'+p+'.'+f;return {path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')};}));
fs.mkdirSync('docs/reverse-engineering/gem-fusion',{recursive:true});fs.writeFileSync('docs/reverse-engineering/gem-fusion/source-functions.json',JSON.stringify({functions,hashes},null,2)+'\n');

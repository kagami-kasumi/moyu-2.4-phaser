import fs from 'node:fs';
import crypto from 'node:crypto';
import {functionRange} from './lib/as2-data.mjs';
const root='local-resources/moyu/source-index/as/scripts/';
const files=['__Packages/RoleMC.as','__Packages/SecreteCodeMC.as'];
const source=Object.fromEntries(files.map(file=>[file,fs.readFileSync(root+file,'utf8')]));
const functions={};
for(const field of ['xxx_ms','xxx_res'])for(const operation of ['get','set']){
 const file=files[0],marker=`function ${operation} ${field}(${operation==='set'?'val':''})`,range=functionRange(source[file],marker);
 functions[operation+'_'+field]={source:{file,line:range.line},body:range.text};
}
for(const operation of ['getSecreteCode','setSecreteCode']){
 const file=files[1],range=functionRange(source[file],`function ${operation}(val)`);
 functions[operation]={source:{file,line:range.line},body:range.text};
}
fs.writeFileSync('docs/reverse-engineering/content-registry/role-currency-source.json',JSON.stringify({files:files.map(file=>({file,sha256:crypto.createHash('sha256').update(source[file]).digest('hex')})),functions},null,2)+'\n');

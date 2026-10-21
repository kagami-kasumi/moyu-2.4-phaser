import fs from 'node:fs';
import crypto from 'node:crypto';

const directory='docs/reverse-engineering/ice-palace-city/baseline';
const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/ice-palace-city/source-fixture.json'));
fs.mkdirSync(directory,{recursive:true});
const files=Object.keys(fixture.shapes).map(identity=>{
 const bytes=fs.readFileSync(`local-resources/moyu/ice-palace-city-088-reference/${identity}.png`);
 const file=identity+'.png';fs.writeFileSync(directory+'/'+file,bytes,{flag:'wx'});
 return {file,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
});
fs.writeFileSync(directory+'/provenance.json',JSON.stringify({tool:'FFDec 26.0.0',sourceSha256:'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9',command:'ffdec-cli -onerror abort -selectid '+Object.keys(fixture.shapes).join(',')+' -format shape:png -export shape local-resources/moyu/ice-palace-city-088-reference 魔域2.4.swf',files},null,2)+'\n',{flag:'wx'});


import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {execFileSync} from 'node:child_process';import sharp from 'sharp';
import {source,timeline} from './lib/first-slice.mjs';import {readRect} from './lib/swf.mjs';
const s=source(),nodes={};
for(const [id,label] of [[2292,'女法师'],[2047,'火球术图标']]){
 const frames=timeline(s,id);const i=frames.findIndex(f=>f.label===label);if(i<0)throw Error('Missing '+label);
 nodes[id]={id,code:39,frames:[{frame:i+1,label,layers:frames[i].layers}]};
 for(const l of frames[i].layers){const t=s.chars.get(l.characterId),b=readRect(s.payload(t),2);nodes[l.characterId]={id:l.characterId,code:t.code,bounds:[b.xmin/20,b.ymin/20,b.xmax/20,b.ymax/20]};}
}
const leaves=Object.values(nodes).filter(n=>n.code!==39),temp=fs.mkdtempSync(path.join(os.tmpdir(),'moyu-entry-ui-'));
execFileSync('C:/Program Files (x86)/FFDec/ffdec-cli.exe',['-onerror','abort','-selectid',leaves.map(n=>n.id).join(','),'-format','shape:png','-export','shape',temp,'魔域2.4.swf']);
const out='public/assets/character-entry-ui';fs.mkdirSync(out,{recursive:true});
for(const n of leaves){const file=path.join(temp,n.id+'.png'),meta=await sharp(file).metadata();n.width=meta.width;n.height=meta.height;n.file='../character-entry-ui/'+n.id+'.png';await sharp(file).png().toFile(out+'/'+n.id+'.png');}
fs.writeFileSync(out+'/manifest.json',JSON.stringify({nodes},null,2)+'\n');

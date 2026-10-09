import fs from 'node:fs';
import crypto from 'node:crypto';
const root='local-resources/moyu/source-index/as/scripts/';
const paths=['frame_9/DoAction.as','__Packages/RoleMC.as','__Packages/ThingMC.as'];
const source=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(root+p,'utf8')]));
function block(path,marker){const s=source[path],start=s.indexOf(marker);if(start<0)throw Error(marker);const p=s.indexOf('{',start);let d=1,i=p+1;for(;d;i++){if(s[i]==='{')d++;if(s[i]==='}')d--;}return s.slice(p,i);}
const functions={};
for(const [name,marker] of Object.entries({useItem:'this.useItem =',equip:'this.equipment.setThing =',equipmentInit:'this.equipment.init =',equipmentStats:'this.equipment.flashAttribute =',addSkill:'this.roleSkills.addSkill =',skillEffect:'this.roleSkills.effect =',createThing:'this.createThing =',addPet:'this.huanShou.addHuanShou ='}))functions[name]=block(paths[0],marker);
for(const [name,marker] of Object.entries({roleStats:'function flashAttribute()',roleInit:'function init()',exploit:'function exploitUp(',military:'function militaryExploitUp('}))functions[name]=block(paths[1],marker);
const hashes=paths.flatMap(p=>[root+p,root.replace('/as/','/pcode/')+p.replace(/\.as$/,'.pcode')]).map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));
fs.mkdirSync('docs/reverse-engineering/inventory',{recursive:true});
fs.writeFileSync('docs/reverse-engineering/inventory/source-functions.json',JSON.stringify({functions,hashes},null,2)+'\n',{flag:'wx'});

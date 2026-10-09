import fs from 'node:fs';
import crypto from 'node:crypto';
const root='local-resources/moyu/source-index/as/scripts/';
const paths=['DefineSprite_148_地面物品/frame_1/DoAction.as','DefineSprite_4253/frame_1/DoAction.as','frame_9/DoAction.as','frame_9/DoAction_2.as','__Packages/ThingMC.as'];
const sources=paths.map(p=>fs.readFileSync(root+p,'utf8'));
function block(i,marker){const s=sources[i],start=s.indexOf(marker);if(start<0)throw Error(marker);let p=s.indexOf('{',start),end=p+1,d=1;for(;d;end++){if(s[end]==='{')d++;if(s[end]==='}')d--;}return s.slice(p,end);}
const functions={pickUp:block(0,'this.pickUp ='),onRelease:block(0,'this.onRelease ='),flashPic:block(0,'this.flashPic ='),autoPickUp:block(1,'this.autoPickUp ='),clearGoods:block(1,'this.clearGoods ='),setThing:block(2,'this.backPack.setThing ='),accountThing:block(2,'this.backPack.accountThing ='),addNumber:block(4,'function addNumber(')};
const hashes=paths.flatMap(p=>[root+p,root.replace('/as/','/pcode/')+p.replace(/\.as$/,'.pcode')]).map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));
fs.mkdirSync('docs/reverse-engineering/ground-items',{recursive:true});
fs.writeFileSync('docs/reverse-engineering/ground-items/source-functions.json',JSON.stringify({functions,spaceKey:sources[3].slice(sources[3].indexOf('      case 32:'),sources[3].indexOf('      case 17:')),hashes},null,2)+'\n',{flag:'wx'});

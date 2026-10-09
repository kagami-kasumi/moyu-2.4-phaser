import fs from 'node:fs';
import crypto from 'node:crypto';
const root='local-resources/moyu/source-index/as/scripts/';
const paths=['frame_9/DoAction.as','__Packages/PanelMC.as','DefineSprite_2049_物品栏物品/frame_1/DoAction.as','DefineSprite_4536/frame_1/DoAction.as','frame_9/DoAction_2.as'];
const sources=paths.map(p=>fs.readFileSync(root+p,'utf8'));
function block(n,marker){const s=sources[n],start=s.indexOf(marker);if(start<0)throw Error(marker);let p=s.indexOf('{',start),i=p+1,d=1;for(;d;i++){if(s[i]==='{')d++;if(s[i]==='}')d--;}return s.slice(p,i);}
const functions={};for(const [name,marker]of Object.entries({setThing:'this.make.setThing =',notice:'this.make.notice =',flashInfo:'this.make.flashInfo =',makeItem:'this.make.makeItem =',useGem:'this.make.useGem =',yes:'this.make.yesButton.onRelease =',upDataWeapon:'this.upDataWeapon =',closeAllPanel:'this.closeAllPanel ='}))functions[name]=block(0,marker);
functions.closePanel=block(1,'function closePanel()');functions.itemUpdate=block(2,'this.upData =');
const hashes=paths.flatMap(p=>[root+p,root.replace('/as/','/pcode/')+p.replace(/\.as$/,'.pcode')]).map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));
fs.mkdirSync('docs/reverse-engineering/equipment-magic',{recursive:true});fs.writeFileSync('docs/reverse-engineering/equipment-magic/source-functions.json',JSON.stringify({functions,hashes},null,2)+'\n',{flag:'wx'});


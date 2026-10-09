import fs from 'node:fs';
import crypto from 'node:crypto';
const root='local-resources/moyu/source-index/as/scripts/';
const npc='DefineSprite_4312/frame_1/DoAction.as', main='frame_9/DoAction.as', map='DefineSprite_4536/frame_2/DoAction.as';
function block(path,marker){const s=fs.readFileSync(root+path,'utf8'),start=s.indexOf(marker);if(start<0)throw Error(marker);let p=s.indexOf('{',start),d=1,i=p+1;for(;d;i++){if(s[i]==='{')d++;if(s[i]==='}')d--;}return s.slice(p,i);}
const functions={};
for(const [name,path,marker] of [
 ['createThing',main,'this.createThing ='],['upDataWeapon',main,'this.upDataWeapon ='],['setThing',main,'this.backPack.setThing ='],['addHuanShou',main,'this.huanShou.addHuanShou ='],
 ['initNewGame',map,'initNewGame ='],['setCommand',npc,'this.setCommand ='],['openDialog',npc,'this.openDialog ='],['closeDialog',npc,'this.closeDialog ='],
 ['talkOpen','DefineSprite_2293_NPC对话框/frame_1/DoAction.as','this.open ='],['talkInit','DefineSprite_2293_NPC对话框/frame_1/DoAction.as','this.init ='],
 ['throwGoods','DefineSprite_4253/frame_1/DoAction.as','this.throwGoods ='],['addNumber','__Packages/ThingMC.as','function addNumber(']
])functions[name]=block(path,marker);
const n=fs.readFileSync(root+npc,'utf8');functions.command='{ this.clearAnswer(); var __weapon; switch(nextCmd) {\n'+n.slice(n.indexOf('      case 1:\r\n         words = _parent.role.myName'),n.indexOf('      case 7:\r\n         nextCmd = myID.cmd;'))+'\n} this.openDialog(); }';
if(!functions.command.includes('case 6:'))throw Error('NPC bounded extraction failed');
const paths=[npc,main,map,'frame_9/DoAction_2.as','DefineSprite_4536/frame_1/DoAction.as','DefineSprite_2293_NPC对话框/frame_1/DoAction.as','DefineSprite_2217/frame_1/DoAction.as','DefineSprite_2049_物品栏物品/frame_1/DoAction.as','DefineSprite_4253/frame_1/DoAction.as','__Packages/PanelMC.as','__Packages/ThingMC.as','__Packages/HuanShouClass.as'];
const hashes=paths.flatMap(p=>[root+p,root.replace('/as/','/pcode/')+p.replace(/\.as$/,'.pcode')]).map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));
fs.writeFileSync('docs/reverse-engineering/npc-reward/behavior-source.json',JSON.stringify({functions,hashes},null,2)+'\n',{flag:'wx'});

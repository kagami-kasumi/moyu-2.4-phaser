import fs from 'node:fs';import crypto from 'node:crypto';
const root='local-resources/moyu/source-index/as/scripts/';
function block(path,marker){const s=fs.readFileSync(root+path,'utf8'),start=s.indexOf(marker);if(start<0)throw Error(marker);let p=s.indexOf('{',start),depth=1,i=p+1;for(;depth;i++){if(s[i]==='{')depth++;if(s[i]==='}')depth--;}return s.slice(p,i);}
const role='__Packages/RoleMC.as',map='DefineSprite_4536/frame_1/DoAction.as',functions={};
for(const name of ['站立','向左上跑','向左下跑','向右上跑','向右下跑','向左跑','向右跑','向上跑','向下跑'])functions[name]=block(role,`function ${name}()`);
for(const [name,marker]of [['Activities','role.Activities = function()'],['turnDirection','this.role.turnDirection = function()'],['jumpMap','this.jumpMap = function()'],['jumpToMap','this.jumpToMap = function(entry)'],['allowJumpMap','this.allowJumpMap = function(toMap)'],['afterJumpMap','this.afterJumpMap = function(toMap)']])functions[name]=block(map,marker);
const paths=[role,map,'__Packages/groundMC.as','DefineSprite_4247/frame_1/DoAction.as','DefineSprite_4536/frame_2/DoAction.as','DefineSprite_4536/frame_8/DoAction.as','DefineSprite_4536/frame_9/DoAction.as','frame_3/DoAction.as','frame_4/DoAction.as','frame_5/DoAction.as','frame_9/DoAction_2.as'];
const hashes=paths.flatMap(p=>[root+p,root.replace('/as/','/pcode/')+p.replace(/\.as$/,'.pcode')]).map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));
fs.writeFileSync('docs/reverse-engineering/first-slice/behavior-source.json',JSON.stringify({functions,hashes},null,2),{flag:'wx'});

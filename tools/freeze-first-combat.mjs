import fs from 'node:fs';import crypto from 'node:crypto';import {functionRange} from './lib/as2-data.mjs';
const root='local-resources/moyu/source-index/',out='docs/reverse-engineering/first-combat';
const selection={
 '__Packages/MonsterMC':['function Activities(','function lockTarget(','function byAttack(','function toDeath('],
 '__Packages/RoleMC':['function autoAttack(','function lockTarget(','function 斩魂(','function 斩魂效果(','function 火球术(','function 火球术效果(','function byAttack(','function toDeath(','function priseExp('],
 '__Packages/HuanShouMC':['function Activities(','function byAttack('],
 'DefineSprite_4536/frame_1/DoAction':['role.Activities =','this.initMonster =','this.dangerous =','this.jumpToMap =','this.afterJumpMap =','this.reLife =','this.roleRelive =','this.onEnterFrame =','this.monsterDeath =','this.dropItem ='],
};
const files=[...Object.keys(selection),...[7,8].map(n=>`DefineSprite_4536/frame_${n}/DoAction`),...[[2943,11],[3031,11],[3135,9],[3146,9]].map(([id,n])=>`DefineSprite_${id}/frame_${n}/DoAction`)];
const functions={},hashes=[];
for(const name of files){const text=fs.readFileSync(root+'as/scripts/'+name+'.as','utf8');functions[name]=selection[name]?Object.fromEntries(selection[name].map(marker=>[marker,functionRange(text,marker)])):text;
 for(const ext of ['as','pcode']){const path=root+ext+'/scripts/'+name+'.'+ext;hashes.push({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')});}}
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/source-functions.json',JSON.stringify({functions,hashes},null,2)+'\n',{flag:'wx'});

import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';
import {functionRange} from './lib/as2-data.mjs';
const base='local-resources/moyu/source-index/',file='frame_9/DoAction',source=fs.readFileSync(base+'as/scripts/'+file+'.as','utf8');
const functions={};for(const [key,marker]of [['useItem','this.useItem = function(item)'],['addSkill','this.roleSkills.addSkill = function(skillName, reLv)'],['effect','this.roleSkills.effect = function(skillName, levels)']])functions[key]=functionRange(source,marker).text;
const skills=[...source.matchAll(/this.roleSkills.allSkills.push\((\{[^\r\n]+\})\);/g)].map(m=>JSON.parse(JSON.stringify(vm.runInNewContext('('+m[1]+')'))));
const books=[...source.matchAll(/_loc2_ = (\{type:"技能书"[^\r\n]+\});/g)].map(m=>JSON.parse(JSON.stringify(vm.runInNewContext('('+m[1]+')'))));
const hashes=[file,'frame_9/DoAction_2'].flatMap(f=>['as','pcode'].map(format=>{const path=base+format+'/scripts/'+f+'.'+format;return {path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')};}));
fs.mkdirSync('docs/reverse-engineering/character-skills',{recursive:true});fs.writeFileSync('docs/reverse-engineering/character-skills/source-functions.json',JSON.stringify({functions,skills,books,hashes},null,2)+'\n');

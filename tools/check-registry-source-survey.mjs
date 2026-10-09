import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {source,timeline} from './lib/first-slice.mjs';
const base='local-resources/moyu/source-index/';
const survey=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/source-survey.json'));
const census=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/object-census.json'));
const manifest=JSON.parse(fs.readFileSync(base+'extraction-manifest.json'));
const originals=manifest.files.filter(f=>f.path.startsWith('as/scripts/')&&f.path.endsWith('.as'));
assert.equal(census.sources.length,originals.length,'census must include every originally exported script');
for(const original of originals){
 const relative=original.path.slice('as/scripts/'.length),record=census.sources.find(s=>s.file===relative);
 assert.ok(record,'missing script '+relative);
 assert.equal(record.sha256,original.sha256,'changed export '+relative);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(base+original.path)).digest('hex'),original.sha256);
}
const frames=timeline(source(),4536),labels=frames.flatMap((f,i)=>f.label?[{name:f.label,frame:i+1}]:[]);
assert.deepEqual(survey.maps.map(m=>({name:m.name,frame:m.frame})),labels,'AS map list differs from original SWF labels');
for(const row of survey.hashes)assert.equal(row.sha256,census.sources.find(f=>f.file===row.file)?.sha256);
// Independent line-oriented counts: these do not use the structural reader.
const read=p=>fs.readFileSync(base+'as/scripts/'+p,'utf8');
const taskSource=read('DefineSprite_2210_任务系统/frame_1/DoAction_2.as');
for(const group of ['mainTask','branchTask','dailyTask','dareTask'])assert.equal(survey.tasks.filter(t=>t.group===group).length,taskSource.split(/\r?\n/).filter(line=>line.trim().startsWith(group+'.push(')).length);
assert.equal(survey.npcs.length,read('DefineSprite_4536/frame_1/DoAction.as').split(/\r?\n/).filter(l=>l.startsWith('npcState.push(')).length);
assert.equal(survey.skills.length,read('frame_9/DoAction.as').split(/\r?\n/).filter(l=>l.startsWith('this.roleSkills.allSkills.push(')).length);
console.log(`Verified ${originals.length} original script hashes, ${labels.length} SWF map labels/frames and task/NPC/skill table cardinality. Value semantics and runtime coverage are separate, still pending.`);

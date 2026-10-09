import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {npcDefaults} from './lib/npc-defaults.mjs';
import {persistenceItemTemplates} from './lib/persistence-field-review.mjs';

test('item default evidence excludes non-items and rejects stale source classification',()=>{
 const root='docs/reverse-engineering/content-registry/';
 const census=JSON.parse(fs.readFileSync(root+'object-census.json','utf8'));
 const audit=JSON.parse(fs.readFileSync(root+'reference-audit.json','utf8'));
 const selected=persistenceItemTemplates(census,audit);
 assert.ok(selected.length>0);
 assert.ok(selected.every(o=>o.data.rateLife===undefined&&o.data.nTitle===undefined&&o.data.type!=='技能图标'&&o.data.type!=='空格'));
 const excluded=audit.rows.filter(r=>!['item','equipment','generated-item-name'].includes(r.classification));
 assert.ok(excluded.some(r=>r.classification==='pet'));
 assert.ok(excluded.some(r=>r.classification==='skill-shortcut'));
 const stale=structuredClone(audit);stale.rows[0].source.line++;
 assert.throws(()=>persistenceItemTemplates(census,stale),/Stale object classification/);
});

test('NPC default extraction preserves absent jobLevels and explicit false/zero overrides',()=>{
 const root='local-resources/moyu/source-index/as/scripts/__Packages/';
 const source=fs.readFileSync(root+'FriendClass.as','utf8'),codec=fs.readFileSync(root+'SecreteCode.as','utf8');
 const records=npcDefaults(source,codec,[{source:{file:'test',line:1},data:{nTitle:'blank'}},{source:{file:'test',line:2},data:{nTitle:'override',cmd:5,oldCmd:0,name:'',jobLevels:0,isLover:false,relation:7,maxRelation:8}}]);
 assert.deepEqual(records[0].values,{nTitle:'blank',cmd:-1,oldCmd:-1,name:'',sex:'',address:'未知',isLover:false,jobLevels:{state:'undefined'},jobMaxLevels:0,levels:0,relationName:'',rejectTimes:0,isFriend:false,isIntimate:false,relation:-0,maxRelation:-0,isTask:false,isBest:false});
 assert.equal(records[1].values.oldCmd,0);assert.equal(records[1].values.jobLevels,0);assert.equal(records[1].values.isLover,false);assert.equal(records[1].values.relation,7);assert.equal(records[1].values.maxRelation,8);
 const actual=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/npc-defaults.json','utf8')).records;
 assert.equal(actual.length,60);assert.equal(new Set(actual.map(r=>r.contentId)).size,60);
 assert.ok(actual.some(r=>r.values.jobLevels?.state==='undefined'));assert.ok(actual.some(r=>typeof r.values.jobLevels==='number'));
});

test('persistence reviews distinguish item fields from capacity and unrelated same-name properties',()=>{
 const {fields}=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/persistence-survey.json','utf8'));
 const capacity=fields.find(r=>r.key==='backPack_number');assert.equal(capacity.default.value,40);
 const stack=fields.find(r=>r.owner==='backPack'&&r.property==='number'&&typeof r.key==='object');assert.equal(stack.default.value,0);assert.equal(stack.restoreSemantics.missingOrNaNWrite,'write-zero');
 const ringLife=fields.find(r=>r.owner==='backPack'&&r.property==='maxLife');assert.equal(ringLife.type.value,'number');assert.equal(ringLife.default.status,'content-template-or-generator');
 const rank=fields.find(r=>r.owner==='map.npcState'&&r.property==='jobLevels');assert.equal(rank.type.allowUndefined,true);assert.equal(rank.default.reference,'npc-defaults.json');
 assert.equal(fields.find(r=>r.key==='saveTime').type.value,'string');assert.equal(fields.find(r=>r.key==='readTimes').restoreSemantics.mode,'stored-value-plus-one');
});

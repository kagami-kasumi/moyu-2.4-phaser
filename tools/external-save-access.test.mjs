import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {externalSaveAccess} from './lib/external-save-access.mjs';
test('save metadata consumers outside readGame include slot display and pre-load character selection',()=>{
 const dir='docs/reverse-engineering/content-registry/';
 const census=JSON.parse(fs.readFileSync(dir+'object-census.json','utf8'));
 const reads=externalSaveAccess(census.sources);
 assert.ok(reads.every(r=>r.access==='read'));
 assert.equal(reads.filter(r=>r.key==='saved').length,2);
 assert.equal(reads.filter(r=>r.key==='saveTime').length,1);
 assert.deepEqual(reads.filter(r=>r.source.file==='frame_8/DoAction.as').map(r=>r.key),['role_vocational','role_myName']);
 assert.ok(!reads.some(r=>['backPack_number','fastKey_number','wareHouse_number','npcState_length'].includes(r.key)));
});

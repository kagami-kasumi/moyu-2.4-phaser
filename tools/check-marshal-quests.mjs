import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {source,timeline} from './lib/first-slice.mjs';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/marshal-quests/source-fixture.json')),s=source();
for(const h of f.hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);
for(const a of f.actions)assert(timeline(s,a.timeline).flatMap(f=>f.actions).some(b=>crypto.createHash('sha256').update(b).digest('hex')===a.sha256));
console.log('Marshal AS/P-code hashes and independent AVM1 Actions passed');

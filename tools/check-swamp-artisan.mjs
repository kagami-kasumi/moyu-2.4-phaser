import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/swamp-artisan/source-fixture.json'));
for(const file of fixture.provenance)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file.path)).digest('hex'),file.sha256,file.path);
for(let command=10100;command<=10107;command++)assert(fixture.commands[command].startsWith('      case '+command+':'));
assert.match(fixture.map,/appear\(getNpc\("巧匠"\),450,180\)/);assert.match(fixture.npc,/cmd:10100/);
const baseline=JSON.parse(fs.readFileSync('docs/reverse-engineering/swamp-city/baseline/provenance.json')).files.find(f=>f.file==='4277.png');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(fixture.portrait.baseline)).digest('hex'),baseline.sha256);
console.log('Swamp artisan seven original command branches, AS/P-code hashes and reused independent portrait passed');

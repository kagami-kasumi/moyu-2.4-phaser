// Independent raw-tag checks against the bounded FFDec-derived structural index.
// This does not execute AVM1 or certify gameplay/animation timing.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import { inspectSwf, parseTags, readRect } from './lib/swf.mjs';

const index = JSON.parse(fs.readFileSync('docs/reverse-engineering/source-index.json', 'utf8'));
const file = fs.readFileSync(index.source.path);
assert.equal(inspectSwf(file).hashes.compressedSha256, index.source.sha256);
const body = file.toString('ascii', 0, 3) === 'CWS' ? zlib.inflateSync(file.subarray(8)) : file.subarray(8);
const tags = parseTags(body, readRect(body).bytes + 4, body.length).tags;
const sprites = new Map(tags.filter(t => t.code === 39).map(t => [t.characterId, t]));
const timeline = id => id === 0 ? tags : sprites.get(id).children;
const frameTags = (id, frame) => {
  let current = 1;
  return timeline(id).filter(t => { const match = current === frame; if (t.code === 1) current++; return match; });
};
for (const s of index.sprites) assert.equal(sprites.get(s.characterId)?.frameCount, s.declaredFrames, `sprite ${s.characterId}`);
for (const l of index.labels) {
  assert(frameTags(l.timeline, l.frame).some(t => t.code === 43 && body.subarray(t.offset, t.offset + t.length).toString('utf8').split('\0')[0] === l.label), `label ${l.label}`);
}
for (const p of index.placements) {
  assert(frameTags(p.timeline, p.frame).some(t => {
    if (t.code !== 26) return false;
    const b = body.subarray(t.offset, t.offset + t.length);
    return Boolean(b[0] & 2) && b.readUInt16LE(1) === p.depth && b.readUInt16LE(3) === p.characterId && (!p.instance || Boolean(b[0] & 32) && b.includes(Buffer.from(p.instance + '\0')));
  }), `placement ${JSON.stringify(p)}`);
}
assert(tags.some(t => t.code === 59 && body.readUInt16LE(t.offset) === 3106 && body.subarray(t.offset, t.offset + t.length).includes(Buffer.from('RoleMC\0'))), 'role registration');
assert(!tags.some(t => t.code === 57 || t.code === 71), 'unexpected ImportAssets');
console.log(`Source index verified against raw SWF: ${index.sprites.length} sprites, ${index.labels.length} labels, ${index.placements.length} placements; registration and no ImportAssets confirmed. Gameplay remains unexecuted.`);

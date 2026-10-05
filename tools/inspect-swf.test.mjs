import test from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { inspectSwf, readRect } from './lib/swf.mjs';

function minimalBody(rect = Buffer.from([0x08, 0]), tags = Buffer.from([0, 0])) {
  return Buffer.concat([rect, Buffer.from([0, 0, 1, 0]), tags]);
}
function swf(body, compressed = false) {
  const header = Buffer.alloc(8); header.write(compressed ? 'CWS' : 'FWS', 0, 3, 'ascii'); header[3] = 8; header.writeUInt32LE(body.length + 8, 4);
  return Buffer.concat([header, compressed ? zlib.deflateSync(body) : body]);
}

test('parses FWS header, frame data, and tags', () => {
  const result = inspectSwf(swf(minimalBody()));
  assert.equal(result.signature, 'FWS'); assert.equal(result.frameCount, 1); assert.equal(result.tags.counts.End, 1);
});
test('parses CWS and reports VM indicators', () => {
  const doAction = Buffer.from([0, 3]);
  const result = inspectSwf(swf(minimalBody(undefined, Buffer.concat([doAction, Buffer.from([0, 0])])), true));
  assert.equal(result.signature, 'CWS'); assert.equal(result.actionScript.vmIndicators.avm1, true);
});
test('rejects truncated and malformed compressed data', () => {
  assert.throws(() => inspectSwf(Buffer.from('CWS0800000000deadbeef', 'hex')), /truncated|invalid zlib/);
  assert.throws(() => inspectSwf(swf(minimalBody()).subarray(0, 10)), /truncated|does not match/);
});
test('reads signed RECT values and rejects truncated RECT', () => {
  // Nbits=6, followed by xmin=-4, xmax=10, ymin=-2, ymax=15, MSB-first.
  const bits = '00110' + [ -4, 10, -2, 15 ].map(v => (v < 0 ? (1 << 6) + v : v).toString(2).padStart(6, '0')).join('');
  const rect = Buffer.alloc(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) if (bits[i] === '1') rect[i >> 3] |= 1 << (7 - (i & 7));
  const parsed = readRect(rect);
  assert.equal(parsed.nbits, 6); assert.equal(parsed.xmin, -4); assert.equal(parsed.xmax, 10); assert.equal(parsed.ymin, -2); assert.equal(parsed.ymax, 15);
  assert.throws(() => readRect(Buffer.from([0xF8])), /invalid RECT|truncated/);
});
test('requires exact End tags, including nested sprites', () => {
  assert.throws(() => inspectSwf(swf(minimalBody(undefined, Buffer.alloc(0)))), /missing End/);
  const spritePayload = Buffer.from([1, 0, 1, 0]); // character 1, one frame, no nested End
  const spriteHeader = Buffer.from([0xc4, 0x09]); // DefineSprite, short length 4
  assert.throws(() => inspectSwf(swf(minimalBody(undefined, Buffer.concat([spriteHeader, spritePayload])))), /truncated|long|missing End/);
});

import crypto from 'node:crypto';
import zlib from 'node:zlib';

const TAG_NAMES = new Map([
  [0, 'End'], [1, 'ShowFrame'], [2, 'DefineShape'], [4, 'PlaceObject'],
  [5, 'RemoveObject'], [6, 'DefineBits'], [7, 'DefineButton'],
  [9, 'SetBackgroundColor'], [10, 'DefineFont'], [11, 'DefineText'],
  [12, 'DoAction'], [13, 'DefineFontInfo'], [14, 'DefineSound'],
  [15, 'StartSound'], [17, 'DefineButtonSound'], [18, 'SoundStreamHead'],
  [19, 'SoundStreamBlock'], [20, 'DefineBitsLossless'], [21, 'DefineBitsJPEG2'],
  [22, 'DefineShape2'], [26, 'PlaceObject2'], [28, 'RemoveObject2'],
  [32, 'DefineShape3'], [35, 'DefineBitsJPEG3'], [36, 'DefineBitsLossless2'],
  [39, 'DefineSprite'], [43, 'FrameLabel'], [45, 'SoundStreamHead2'],
  [56, 'ExportAssets'], [59, 'DoInitAction'], [60, 'DefineVideoStream'],
  [61, 'VideoFrame'], [69, 'FileAttributes'], [70, 'PlaceObject3'],
  [76, 'SymbolClass'], [77, 'Metadata'], [82, 'DoABC'], [83, 'DefineShape4'],
  [86, 'DefineSceneAndFrameLabelData'], [87, 'DefineBinaryData'],
  [88, 'DefineFontName'], [89, 'StartSound2'], [90, 'DefineBitsJPEG4'],
  [91, 'DefineFont4'],
]);

const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const need = (condition, message) => { if (!condition) throw new Error(message); };

function readRect(bytes, offset = 0) {
  need(offset < bytes.length, 'truncated RECT');
  const nbits = bytes[offset] >> 3;
  need(nbits >= 1 && nbits <= 31, `invalid RECT Nbits ${nbits}`);
  const total = 5 + nbits * 4;
  const size = Math.ceil(total / 8);
  need(offset + size <= bytes.length, 'truncated RECT');
  let bit = offset * 8 + 5;
  const readSigned = () => {
    let value = 0;
    for (let i = 0; i < nbits; i++, bit++) value = value * 2 + ((bytes[bit >> 3] >> (7 - (bit & 7))) & 1);
    return (value & (1 << (nbits - 1))) ? value - (2 ** nbits) : value;
  };
  const xmin = readSigned(), xmax = readSigned(), ymin = readSigned(), ymax = readSigned();
  return { bytes: size, nbits, xmin, xmax, ymin, ymax, widthTwips: xmax - xmin, heightTwips: ymax - ymin };
}

function parseTags(bytes, start, end, nested = false, depth = 0) {
  need(depth <= 128, 'nested sprite depth exceeds limit');
  const tags = [];
  let offset = start;
  let ended = false;
  while (offset < end) {
    need(offset + 2 <= end, 'truncated tag header');
    const record = bytes[offset] | (bytes[offset + 1] << 8); offset += 2;
    const code = record >> 6;
    let length = record & 0x3f;
    if (length === 63) { need(offset + 4 <= end, 'truncated long tag length'); length = bytes.readUInt32LE(offset); offset += 4; }
    need(length <= end - offset, `truncated ${TAG_NAMES.get(code) ?? `tag ${code}`} payload`);
    const payloadStart = offset, payloadEnd = offset + length;
    const entry = { code, name: TAG_NAMES.get(code) ?? 'Unknown', length, offset: payloadStart };
    if (code === 39) {
      need(length >= 4, 'truncated DefineSprite header');
      entry.characterId = bytes[offset] | (bytes[offset + 1] << 8);
      entry.frameCount = bytes[offset + 2] | (bytes[offset + 3] << 8);
      entry.children = parseTags(bytes, offset + 4, payloadEnd, true, depth + 1).tags;
    }
    tags.push(entry);
    offset = payloadEnd;
    if (code === 0) {
      need(length === 0, 'End tag must have zero length');
      ended = true;
      need(offset === end, 'bytes found after End tag');
      break;
    }
  }
  need(ended, nested ? 'nested tag stream is missing End tag' : 'tag stream is missing End tag');
  return { tags, offset };
}

function flatten(tags, out = []) { for (const tag of tags) { out.push(tag); if (tag.children) flatten(tag.children, out); } return out; }

export function inspectSwf(input) {
  const file = Buffer.from(input);
  need(file.length >= 8, 'SWF header is truncated');
  const signature = file.subarray(0, 3).toString('ascii');
  need(signature === 'FWS' || signature === 'CWS', `unsupported SWF signature ${JSON.stringify(signature)}`);
  const version = file[3];
  const declaredLength = file.readUInt32LE(4);
  const compressedBody = file.subarray(8);
  let body;
  if (signature === 'CWS') {
    try { body = zlib.inflateSync(compressedBody); } catch (error) { throw new Error(`invalid zlib body: ${error.message}`); }
  } else body = compressedBody;
  need(declaredLength >= 8, 'invalid declared file length');
  need(declaredLength === body.length + 8, `declared file length ${declaredLength} does not match uncompressed length ${body.length + 8}`);
  const rect = readRect(body);
  const frameHeader = rect.bytes;
  need(body.length >= frameHeader + 4, 'truncated SWF frame header');
  const frameRateRaw = body[frameHeader] | (body[frameHeader + 1] << 8);
  const frameCount = body[frameHeader + 2] | (body[frameHeader + 3] << 8);
  const tagStart = frameHeader + 4;
  const parsed = parseTags(body, tagStart, body.length);
  need(parsed.offset === body.length, 'tag stream has trailing or invalid data');
  const allTags = flatten(parsed.tags);
  const counts = {};
  for (const tag of allTags) counts[tag.name] = (counts[tag.name] ?? 0) + 1;
  const urls = [...new Set((body.toString('latin1').match(/https?:\/\/[^\x00\s"'<>]+/gi) ?? []).map(s => s.replace(/[),.;]+$/, '')))];
  const uncompressed = Buffer.concat([Buffer.from('FWS', 'ascii'), Buffer.from([version]), Buffer.from([declaredLength & 255, (declaredLength >>> 8) & 255, (declaredLength >>> 16) & 255, (declaredLength >>> 24) & 255]), body]);
  return {
    format: 'SWF', signature, version,
    declaredUncompressedLength: declaredLength,
    compressedLength: file.length,
    compressedBodyLength: compressedBody.length,
    uncompressedBodyLength: body.length,
    hashes: { compressedSha256: sha256(file), uncompressedSha256: sha256(uncompressed) },
    stage: { rect, widthPx: rect.widthTwips / 20, heightPx: rect.heightTwips / 20 },
    frameRate: frameRateRaw / 256, frameRateRaw, frameCount,
    tags: { total: allTags.length, topLevel: parsed.tags.length, counts },
    actionScript: { doAction: counts.DoAction ?? 0, doInitAction: counts.DoInitAction ?? 0, doABC: counts.DoABC ?? 0, vmIndicators: { avm1: (counts.DoAction ?? 0) + (counts.DoInitAction ?? 0) > 0, avm2: (counts.DoABC ?? 0) > 0 } },
    symbols: { symbolClass: counts.SymbolClass ?? 0, exportAssets: counts.ExportAssets ?? 0 },
    externalUrls: urls,
  };
}

export { readRect, parseTags };

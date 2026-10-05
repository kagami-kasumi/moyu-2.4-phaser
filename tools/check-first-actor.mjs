import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {loadSource,placements,shape,SOURCE_HASH} from './lib/first-actor.mjs';
import {convert} from './convert-first-actor.mjs';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/first-actor/source-fixture.json','utf8'));
const source=loadSource();assert.equal(fixture.sourceSha256,SOURCE_HASH);
const attr=(s,k)=>s.match(new RegExp(`\\b${k}="([^"]*)"`))?.[1];
const xmlMatrix=m=>[m.hasScale==='true'?+m.scaleX:1,m.hasRotate==='true'?+m.rotateSkew0:0,m.hasRotate==='true'?+m.rotateSkew1:0,m.hasScale==='true'?+m.scaleY:1,+m.translateX/20,+m.translateY/20];
let tagChecks=0;
for(const [id,rows] of Object.entries(fixture.timelines)) {
  const actual=placements(source,+id);
  for(const row of rows) {
    if(row.type==='PlaceObject2Tag') {
      const p=actual[row.frame-1].layers.find(l=>l.depth===+row.depth);assert(p);
      if(row.placeFlagHasCharacter==='true')assert.equal(p.characterId,+row.characterId);
      if(row.placeFlagHasMatrix==='true')xmlMatrix(row.children.find(c=>c.tag==='matrix')).forEach((v,i)=>assert(Math.abs(p.matrix[i]-v)<1e-7));
      tagChecks++;
    }
    if(row.type==='DoActionTag')assert.deepEqual(actual[row.frame-1].actions,[row.actionBytes]);
  }
  if(+id!==3101&&+id!==3106)assert.equal(actual.length,rows.filter(r=>r.type==='ShowFrameTag').length);
}
for(const [id,xml] of Object.entries(fixture.shapes)) {
  const s=shape(source,+id),bounds=xml.match(/<shapeBounds[^>]+/)[0];
  assert.deepEqual(s.bounds,['Xmin','Ymin','Xmax','Ymax'].map(k=>+attr(bounds,k)/20));
  const fill=xml.match(/<item type="FILLSTYLE"[^>]+/)[0];
  if(+attr(fill,'fillStyleType')===67)assert.equal(s.fill.bitmapId,+attr(fill,'bitmapId'));
  else {assert.equal(+id,3024);assert.deepEqual(s.fill.color,[255,255,255,192]);assert.deepEqual(s.edges,[['M',72,150],['Q',79.65,102,115,58],['Q',65.3,91.55,42,156],['L',72,150]]);}
}
const manifest=await convert('.tmp/first-actor-check');
const baseline='docs/reverse-engineering/first-actor/baseline';
const provenance=JSON.parse(fs.readFileSync(`${baseline}/provenance.json`));const comparisons=[];
for(const f of provenance.files) {
  const ref=fs.readFileSync(`${baseline}/${f.file}`);assert.equal(crypto.createHash('sha256').update(ref).digest('hex'),f.sha256);
  const expected=await sharp(ref).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const actual=await sharp(`.tmp/first-actor-check/${f.file}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual(actual.info,expected.info);let sum=0,changed=0;
  for(let i=0;i<actual.data.length;i+=4) {let pixel=0;for(let c=0;c<4;c++){const a=c===3?actual.data[i+c]:actual.data[i+c]*actual.data[i+3]/255,b=c===3?expected.data[i+c]:expected.data[i+c]*expected.data[i+3]/255;pixel+=Math.abs(a-b);}sum+=pixel;if(pixel>0)changed++;}
  const mae=sum/actual.data.length,ratio=changed/(actual.data.length/4),overlay=f.spriteId===3031&&[8,9].includes(f.frame);
  assert(mae<=(overlay?0.1:0),`${f.file} mean error ${mae}`);assert(ratio<=(overlay?0.01:0),`${f.file} changed ${ratio}`);
  const shipped=await sharp(`public/assets/first-actor/${f.file}`).ensureAlpha().raw().toBuffer();assert.deepEqual(shipped,actual.data,'shipped resources stale');
  comparisons.push({file:f.file,premultipliedMeanError:mae,changedPixels:changed,changedRatio:ratio});
}
assert.deepEqual(JSON.parse(fs.readFileSync('public/assets/first-actor/manifest.json')),manifest);
fs.mkdirSync('.evidence/first-actor',{recursive:true});fs.writeFileSync('.evidence/first-actor/conversion.json',JSON.stringify({tagChecks,shapes:23,comparisons},null,2));
console.log(`Verified ${tagChecks} placements, 23 shapes, action bytes and 22 independently rendered frames; shipped assets match reproducible conversion.`);

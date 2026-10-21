import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {source,timeline} from './lib/first-slice.mjs';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/swamp-city/source-fixture.json'));
const parsed=source();
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function compareLayers(actual,expected){
 assert.equal(actual.length,expected.length);
 for(const layer of expected){
  const found=actual.find(value=>value.depth===layer.depth);
  assert(found);assert.equal(found.characterId,Number(layer.characterId));
  if(layer.name)assert.equal(found.name,layer.name);
  const matrix=layer.matrix;
  const values=matrix?[matrix.hasScale==='true'?Number(matrix.scaleX):1,matrix.hasRotate==='true'?Number(matrix.rotateSkew0):0,matrix.hasRotate==='true'?Number(matrix.rotateSkew1):0,matrix.hasScale==='true'?Number(matrix.scaleY):1,Number(matrix.translateX)/20,Number(matrix.translateY)/20]:[1,0,0,1,0,0];
  values.forEach((value,index)=>assert(Math.abs(found.matrix[index]-value)<1e-7));
  if(layer.colorTransform)assert.equal(found.color.mult[3],Number(layer.colorTransform.alphaMultTerm));
 }
}
for(const entry of fixture.hashes)assert.equal(hash(fs.readFileSync(entry.path)),entry.sha256,entry.path);
for(const entry of fixture.actions)assert(timeline(parsed,entry.timeline)[entry.frame-1].actions.some(bytes=>hash(bytes)===entry.sha256));
for(const [identity,expected]of Object.entries(fixture.timelines)){
 const actual=timeline(parsed,Number(identity));assert.equal(actual.length,expected.frames.length);
 expected.frames.forEach((layers,index)=>compareLayers(actual[index].layers,layers));
}
for(const [number,layers]of Object.entries(fixture.maps))compareLayers(timeline(parsed,4536)[Number(number)-1].layers,layers);
assert.equal(fixture.timelines[fixture.selector].frames.length,8);
assert.equal(fixture.timelines['3361'].frames.length,12);assert.equal(fixture.timelines['3370'].frames.length,9);assert.equal(fixture.timelines['3379'].frames.length,8);

const maps=JSON.parse(fs.readFileSync('public/assets/first-slice/manifest.json'));
for(const [key,frame,name]of [['swampCity',53,'沼泽'],['swampMirage',54,'沼泽幻境']]){
 assert.equal(maps.maps[key].frame,frame);assert.equal(maps.maps[key].name,name);
 compareLayers(maps.maps[key].layers,fixture.maps[frame].filter(layer=>layer.depth<22||(key==='swampCity'&&layer.name==='backPoint')));
}
const combat=JSON.parse(fs.readFileSync('public/assets/first-combat/manifest.json')).families['绿魔精'];
compareLayers([combat.parent],[fixture.parent]);
assert.equal(combat.selectors.length,8);
fixture.timelines[fixture.selector].frames.forEach((layers,index)=>compareLayers(combat.selectors[index].layers,layers));
for(const identity of [3361,3370,3379]){
 const expected=fixture.timelines[identity].frames,actual=combat.animations[identity];assert.equal(actual.length,expected.length);
 expected.forEach((layers,index)=>{compareLayers(actual[index].layers,layers);assert.equal(actual[index].endMarker,fixture.actions.some(action=>action.timeline===identity&&action.frame===index+1));});
}
const baseline='docs/reverse-engineering/swamp-city/baseline';
const provenance=JSON.parse(fs.readFileSync(baseline+'/provenance.json'));
for(const entry of provenance.files){
 const bytes=fs.readFileSync(baseline+'/'+entry.file);assert.equal(hash(bytes),entry.sha256);
 const identity=Number(entry.file.split('.')[0]);
 const actual=await sharp(`public/assets/${identity>=3347&&identity<=3378?'first-combat':'first-slice'}/${entry.file}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const expected=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.deepEqual(actual.info,expected.info,entry.file);
 let sum=0;
 for(let index=0;index<actual.data.length;index+=4)for(let channel=0;channel<4;channel++)sum+=Math.abs(channel===3?actual.data[index+channel]-expected.data[index+channel]:actual.data[index+channel]*actual.data[index+3]/255-expected.data[index+channel]*expected.data[index+3]/255);
 assert(sum/actual.data.length<.05,entry.file+' pixel difference '+sum/actual.data.length);
}
console.log('Swamp city independent XML matrices, eight selectors, Action/AS/P-code hashes and 22 PNGs passed');

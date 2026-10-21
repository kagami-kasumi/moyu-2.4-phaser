import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {source,timeline} from './lib/first-slice.mjs';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/south-field/source-fixture.json'));
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

const maps=JSON.parse(fs.readFileSync('public/assets/first-slice/manifest.json'));
for(const [key,frame]of [['southWildOne',59],['southWildTwo',60],['southWildThree',61],['southWildFour',62],['southWildFive',63]]){assert.equal(maps.maps[key].frame,frame);compareLayers(maps.maps[key].layers,fixture.maps[frame].filter(p=>p.depth<22||p.name?.startsWith('entry')||p.name==='backPoint'));}
const assets=JSON.parse(fs.readFileSync('public/assets/first-combat/manifest.json'));
for(const [name,def]of Object.entries(fixture.families)){
 const family=assets.families[name];compareLayers([family.parent],[def.parent]);const frames=fixture.timelines[def.selector].frames.slice(0,name==='炎女'?6:8);assert.equal(family.selectors.length,frames.length);frames.forEach((layers,n)=>compareLayers(family.selectors[n].layers,layers));
 for(const [identity,animation]of Object.entries(family.animations)){const expected=fixture.timelines[identity];assert.equal(animation.length,expected.frames.length);expected.frames.forEach((layers,n)=>{compareLayers(animation[n].layers,layers);assert.equal(animation[n].endMarker,fixture.actions.some(a=>a.timeline===Number(identity)&&a.frame===n+1));});}
}
const baseline='docs/reverse-engineering/south-field/baseline',provenance=JSON.parse(fs.readFileSync(baseline+'/provenance.json'));
for(const entry of provenance.files){const bytes=fs.readFileSync(baseline+'/'+entry.file);assert.equal(hash(bytes),entry.sha256);const id=Number(entry.file.split('.')[0]);const actual=await sharp(`public/assets/${id>=3241&&id<=3437?'first-combat':'first-slice'}/${entry.file}`).ensureAlpha().raw().toBuffer({resolveWithObject:true}),expected=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual(actual.info,expected.info,entry.file);let sum=0;for(let n=0;n<actual.data.length;n+=4)for(let c=0;c<4;c++)sum+=Math.abs(c===3?actual.data[n+c]-expected.data[n+c]:actual.data[n+c]*actual.data[n+3]/255-expected.data[n+c]*expected.data[n+3]/255);assert(sum/actual.data.length<.05,entry.file+' difference '+sum/actual.data.length);}
console.log('South field XML, Action/AS/P-code, two full families and 40 independent FFDec PNG comparisons passed');

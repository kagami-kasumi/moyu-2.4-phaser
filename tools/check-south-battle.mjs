import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {source,timeline} from './lib/first-slice.mjs';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/south-battle/source-fixture.json')),parsed=source();
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function compareLayers(actual,expected){
 assert.equal(actual.length,expected.length);
 for(const layer of expected){
  const found=actual.find(value=>value.depth===layer.depth);assert(found);assert.equal(found.characterId,Number(layer.characterId));if(layer.name)assert.equal(found.name,layer.name);
  const matrix=layer.matrix,values=matrix?[matrix.hasScale==='true'?Number(matrix.scaleX):1,matrix.hasRotate==='true'?Number(matrix.rotateSkew0):0,matrix.hasRotate==='true'?Number(matrix.rotateSkew1):0,matrix.hasScale==='true'?Number(matrix.scaleY):1,Number(matrix.translateX)/20,Number(matrix.translateY)/20]:[1,0,0,1,0,0];
  values.forEach((value,index)=>assert(Math.abs(found.matrix[index]-value)<1e-7));if(layer.colorTransform)assert.equal(found.color.mult[3],Number(layer.colorTransform.alphaMultTerm));
 }
}
for(const entry of fixture.hashes)assert.equal(hash(fs.readFileSync(entry.path)),entry.sha256,entry.path);
for(const entry of fixture.actions)assert(timeline(parsed,entry.timeline)[entry.frame-1].actions.some(bytes=>hash(bytes)===entry.sha256));
for(const [identity,expected]of Object.entries(fixture.timelines)){const actual=timeline(parsed,Number(identity));assert.equal(actual.length,expected.frames.length);expected.frames.forEach((layers,index)=>compareLayers(actual[index].layers,layers));}
for(const [number,layers]of Object.entries(fixture.maps))compareLayers(timeline(parsed,4536)[Number(number)-1].layers,layers);
const maps=JSON.parse(fs.readFileSync('public/assets/first-slice/manifest.json'));
for(const [key,frame,name]of [['southOutskirts',58,'南城郊区'],['southUp',108,'南城战场上'],['southCenter',112,'南城战场中'],['southDown',116,'南城战场下'],['southLeft',120,'南城战场左'],['southRight',124,'南城战场右']]){
 assert.equal(maps.maps[key].frame,frame);assert.equal(maps.maps[key].name,name);compareLayers(maps.maps[key].layers,fixture.maps[frame].filter(layer=>layer.depth<22||layer.name==='backPoint'||layer.name?.startsWith('entry')));
}
const combat=JSON.parse(fs.readFileSync('public/assets/first-combat/manifest.json'));
for(const [name,family]of Object.entries(fixture.families)){
 const actual=combat.families[name],expected=fixture.timelines[family.selector].frames;compareLayers([actual.parent],[family.parent]);assert.equal(actual.selectors.length,expected.length);
 expected.forEach((layers,index)=>compareLayers(actual.selectors[index].layers,layers));
 for(const [identity,frames]of Object.entries(actual.animations)){
  assert.equal(frames.length,fixture.timelines[identity].frames.length);
  fixture.timelines[identity].frames.forEach((layers,index)=>{compareLayers(frames[index].layers,layers);assert.equal(frames[index].endMarker,fixture.actions.some(action=>action.timeline===Number(identity)&&action.frame===index+1));});
 }
}
const directory='docs/reverse-engineering/south-battle/baseline';
for(const entry of JSON.parse(fs.readFileSync(directory+'/provenance.json')).files){
 const bytes=fs.readFileSync(directory+'/'+entry.file);assert.equal(hash(bytes),entry.sha256);const identity=Number(entry.file.split('.')[0]);
 const actual=await sharp(`public/assets/${identity>=3827&&identity<=3910?'first-combat':'first-slice'}/${entry.file}`).ensureAlpha().raw().toBuffer({resolveWithObject:true}),expected=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual(actual.info,expected.info,entry.file);
 let sum=0;for(let index=0;index<actual.data.length;index+=4)for(let channel=0;channel<4;channel++)sum+=Math.abs(channel===3?actual.data[index+channel]-expected.data[index+channel]:actual.data[index+channel]*actual.data[index+3]/255-expected.data[index+channel]*expected.data[index+3]/255);
 assert(sum/actual.data.length<.05,entry.file+' pixel difference '+sum/actual.data.length);
}
console.log('South six maps, 3 families / 20 selectors, matrices, Action/AS/P-code and 52 independent PNGs passed');

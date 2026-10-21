import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {source,timeline} from './lib/first-slice.mjs';
import sharp from 'sharp';import os from 'node:os';import path from 'node:path';import {convertCombat} from './convert-first-combat.mjs';
const base='docs/reverse-engineering/first-combat/',f=JSON.parse(fs.readFileSync(base+'source-fixture.json','utf8')),s=source();
const boss=JSON.parse(fs.readFileSync(base+'boss-fixture.json','utf8'));Object.assign(f.timelines,boss.timelines);f.actions.push(...boss.actions);
const matrix=m=>[m.hasScale==='true'?+m.scaleX:1,m.hasRotate==='true'?+m.rotateSkew0:0,m.hasRotate==='true'?+m.rotateSkew1:0,m.hasScale==='true'?+m.scaleY:1,+m.translateX/20,+m.translateY/20];
function layers(actual,expected){assert.equal(actual.length,expected.length);for(const e of expected){const a=actual.find(p=>p.depth===e.depth);assert.equal(a.characterId,+e.characterId);if(e.name)assert.equal(a.name,e.name);if(e.matrix)matrix(e.matrix).forEach((v,i)=>assert(Math.abs(v-a.matrix[i])<1e-7));if(e.colorTransform)assert.equal(a.color.mult[3],+e.colorTransform.alphaMultTerm);}}
for(const [id,v]of Object.entries(f.timelines)){const actual=timeline(s,+id);assert.equal(actual.length,v.frames.length);v.frames.forEach((frame,i)=>layers(actual[i].layers,frame));for(const [frame,label]of Object.entries(v.labels))assert.equal(actual[+frame-1].label,label);}
layers(timeline(s,4536)[6].layers,f.mapFrames[7]);
for(const a of f.actions)assert(timeline(s,a.timeline)[a.frame-1].actions.some(b=>crypto.createHash('sha256').update(b).digest('hex')===a.sha256));
for(const h of JSON.parse(fs.readFileSync(base+'source-functions.json','utf8')).hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);
for(const h of JSON.parse(fs.readFileSync(base+'source-runtime-hashes.json','utf8')))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);
for(const [id,end]of [[3135,9],[3146,9],[2943,11],[3031,11],[3178,10],[3187,7]]){const t=timeline(s,id);assert.equal(t.length,end);assert.deepEqual(t.flatMap((f,i)=>f.actions.length?[i+1]:[]),[end]);}
console.log(`First combat XML/binary: ${Object.keys(f.timelines).length} timelines, ${f.actions.length} Action hashes, complete frame7 display list and AS/P-code hashes passed. Asset pixels and runtime integration have separate gates.`);
// Check the assets actually consumed by Journey, not only the standalone export.
const slice=JSON.parse(fs.readFileSync('public/assets/first-slice/manifest.json','utf8'));
layers(slice.maps.wildOne.layers,f.mapFrames[7].filter(p=>p.depth<22));
for(const id of [2808,4321])assert.deepEqual(fs.readFileSync(`public/assets/first-slice/${id}.png`),fs.readFileSync(`public/assets/first-combat/${id}.png`));
const mage=JSON.parse(fs.readFileSync('public/assets/mage/manifest.json','utf8'));
assert.equal(mage.actions.attack.spriteId,2943);assert.equal(mage.actions.attack.frames.length,11);
for(const [i,frame]of timeline(s,2943).entries()){
 const shape=frame.layers[0].characterId,a=await sharp(`public/assets/mage/attack-${i+1}.png`).raw().toBuffer(),b=await sharp(base+`baseline/${shape}.png`).raw().toBuffer();assert.deepEqual(a,b);
}
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'moyu-combat-')),report=[];
try{
 await convertCombat(tmp);
 assert.equal(fs.readFileSync(path.join(tmp,'manifest.json'),'utf8'),fs.readFileSync('public/assets/first-combat/manifest.json','utf8'));
 const provenance=JSON.parse(fs.readFileSync(base+'baseline/provenance.json','utf8'));
 provenance.files.push(...JSON.parse(fs.readFileSync(base+'baseline/boss-provenance.json','utf8')).files);
 for(const {file,sha256}of provenance.files){
  const baseline=base+'baseline/'+file;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(baseline)).digest('hex'),sha256);
  assert.deepEqual(fs.readFileSync(path.join(tmp,file)),fs.readFileSync('public/assets/first-combat/'+file));
  const a=await sharp(path.join(tmp,file)).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=await sharp(baseline).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual(a.info,b.info);
  let sum=0,max=0;for(let i=0;i<a.data.length;i+=4)for(let c=0;c<4;c++){const av=c===3?a.data[i+c]:a.data[i+c]*a.data[i+3]/255,bv=c===3?b.data[i+c]:b.data[i+c]*b.data[i+3]/255,error=Math.abs(av-bv);sum+=error;max=Math.max(max,error);}
  const mean=sum/a.data.length;report.push({file,mean,max});assert(mean<(file==='2808.png'?.03:.00001),`${file}: mean=${mean}, max=${max}`);
 }
}finally{assert(path.resolve(tmp).startsWith(path.resolve(os.tmpdir())+path.sep+'moyu-combat-'));fs.rmSync(tmp,{recursive:true,force:true});}
fs.mkdirSync('.evidence/first-combat',{recursive:true});fs.writeFileSync('.evidence/first-combat/assets.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));

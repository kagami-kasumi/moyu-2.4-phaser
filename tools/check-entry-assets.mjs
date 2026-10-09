import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';import sharp from 'sharp';
import {loadSource,placements} from './lib/first-actor.mjs';import {convert} from './convert-first-actor.mjs';
const dir='docs/reverse-engineering/character-entry',fixture=JSON.parse(fs.readFileSync(dir+'/mage-fixture.json')),s=loadSource();
const matrix=m=>[m.hasScale==='true'?+m.scaleX:1,m.hasRotate==='true'?+m.rotateSkew0:0,m.hasRotate==='true'?+m.rotateSkew1:0,m.hasScale==='true'?+m.scaleY:1,+m.translateX/20,+m.translateY/20];
const layer=(p,e)=>{assert.equal(p.characterId,Number(e.characterId));matrix(e.matrix).forEach((v,i)=>assert(Math.abs(p.matrix[i]-v)<1e-7));};
for(const [id,t]of Object.entries(fixture.timelines)){
 const actual=placements(s,+id);assert.equal(actual.length,t.frames.length);
 actual.forEach((f,i)=>{assert.equal(f.actions.length,0);assert.equal(f.layers.length,1);layer(f.layers[0],t.frames[i][0]);});
 // Prove no nested timeline, clock/action/clip-action tags, rather than infer timing from SWF FPS alone.
 for(const tag of fixture.tags[id])assert(['PlaceObject2Tag','ShowFrameTag','EndTag','SoundStreamHead2Tag'].includes(tag.type),tag.type);
 for(const f of actual)assert.equal(s.chars.get(f.layers[0].characterId).code,2);
}
for(const [frame,e]of Object.entries(fixture.selectors))layer(placements(s,3101)[+frame-1].layers[0],e[0]);
layer(placements(s,3106)[0].layers[0],fixture.parent);
const manifest=await convert('.tmp/mage-check','mage'),provenance=JSON.parse(fs.readFileSync(dir+'/baseline/provenance.json')),comparisons=[];
for(const f of provenance.files){const ref=fs.readFileSync(dir+'/baseline/'+f.file);assert.equal(crypto.createHash('sha256').update(ref).digest('hex'),f.sha256);
 const expected=await sharp(ref).ensureAlpha().raw().toBuffer({resolveWithObject:true}),actual=await sharp('.tmp/mage-check/'+f.file).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual(actual,expected,f.file);
 assert.deepEqual(await sharp('public/assets/mage/'+f.file).ensureAlpha().raw().toBuffer(),actual.data);
 let minX=actual.info.width,minY=actual.info.height,maxX=-1,maxY=-1;for(let y=0;y<actual.info.height;y++)for(let x=0;x<actual.info.width;x++)if(actual.data[(y*actual.info.width+x)*4+3]){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
 comparisons.push({file:f.file,width:actual.info.width,height:actual.info.height,alphaBounds:[minX,minY,maxX+1,maxY+1],changedPixels:0});
}
assert.deepEqual(JSON.parse(fs.readFileSync('public/assets/mage/manifest.json')),manifest);
const ui=JSON.parse(fs.readFileSync('public/assets/character-entry-ui/manifest.json')),uiFixture=JSON.parse(fs.readFileSync(dir+'/ui-fixture.json'));
for(const [id,e]of Object.entries(uiFixture.nodes)){const n=ui.nodes[id];if(e.layers){const f=n.frames[0];assert.equal(f.label,e.label);assert.equal(f.frame,e.frame);assert.equal(f.layers.length,e.layers.length);f.layers.forEach((p,i)=>layer(p,e.layers[i]));}else assert.deepEqual(n.bounds,e.bounds);}
fs.mkdirSync('.evidence/character-entry',{recursive:true});fs.writeFileSync('.evidence/character-entry/conversion.json',JSON.stringify({comparisons},null,2));console.log('Verified independent XML matrices, non-nested timelines, 11 exact FFDec RGBA frames and shipped mage resources.');

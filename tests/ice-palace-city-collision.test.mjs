import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';

const json=path=>JSON.parse(fs.readFileSync(path));
test('new map collision agrees with independent FFDec alpha interiors and exteriors including curved city ground',async()=>{
 const journey=new Journey(json('public/assets/first-slice/manifest.json'),new Actor(json('public/assets/first-actor/manifest.json')));
 let tested=0;
 for(const [map,identity]of [['frostOutskirts',2704],['icePalaceCity',2696],['icePalaceMirage',2696]]){
  const expected=await sharp(`docs/reverse-engineering/ice-palace-city/baseline/${identity}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const [originX,originY]=journey.manifest.shapes[identity].bounds;
  for(let py=2;py<expected.info.height-2;py+=3)for(let px=2;px<expected.info.width-2;px+=3){
   const alpha=(x,y)=>expected.data[(y*expected.info.width+x)*4+3];
   const value=alpha(px,py);if(value!==0&&value!==255)continue;
   let stable=true;for(let deltaY=-1;deltaY<=1;deltaY++)for(let deltaX=-1;deltaX<=1;deltaX++)if(alpha(px+deltaX,py+deltaY)!==value)stable=false;
   if(!stable)continue;
   assert.equal(journey.groundContains((originX+px+.5)*journey.manifest.rootMatrix[0],(originY+py+.5)*journey.manifest.rootMatrix[3],map),value===255,`${map} ${px},${py}`);tested++;
  }
 }
 assert(tested>20000);

});

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import {loadSource,placements,shape,bitmap,SOURCE_HASH} from './lib/first-actor.mjs';

export async function convert(out='public/assets/first-actor') {
  const source=loadSource();fs.mkdirSync(out,{recursive:true});
  const selectors=placements(source,3101),parent=placements(source,3106)[0].layers[0].matrix;
  const manifest={version:1,sourceSha256:SOURCE_HASH,stage:{width:580,height:500},fps:15,parentMatrix:parent,
    timing:{basis:'source frame ticks; nominal 1000/15 ms, not measured wall time',phaseOrder:['Activities','timeline-frame-action','render'],attackEndFrame:11,effect:'next Activities after end marker; no damage simulation'},
    crop:'untrimmed source bitmap rectangle; offset [0,0]; registration follows matrix chain',collision:null,actions:{}};
  for(const [name,id,left,right] of [['idle',2986,15,16],['run',3007,17,18],['attack',3031,19,20]]) {
    const frames=placements(source,id),action={spriteId:id,selectorFrames:{left,right},matrices:{left:selectors[left-1].layers[0].matrix,right:selectors[right-1].layers[0].matrix},frames:[]};
    for(const [i,frame] of frames.entries()) {
      const base=shape(source,frame.layers[0].characterId); assert(base.fill.bitmapId);assert.deepEqual(base.fill.matrix,[20,0,0,20,0,0]);
      const image=bitmap(source,base.fill.bitmapId);assert.deepEqual(base.bounds,[0,0,image.width,image.height]);
      for(const layer of frame.layers)assert.deepEqual(layer.matrix,[1,0,0,1,0,0]);
      let pipeline=sharp(image.data,{raw:{width:image.width,height:image.height,channels:4}});
      if(frame.layers.length>1) {
        assert.equal(frame.layers.length,2);const overlay=shape(source,frame.layers[1].characterId),color=overlay.fill.color;assert(color);
        const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${image.width}" height="${image.height}"><path d="${overlay.edges.map(e=>e.join(' ')).join(' ')} Z" fill="rgb(${color.slice(0,3)})" fill-opacity="${color[3]/255}"/></svg>`;
        pipeline=pipeline.composite([{input:Buffer.from(svg)}]);
      }
      const file=`${name}-${i+1}.png`;await pipeline.png().toFile(path.join(out,file));
      action.frames.push({frame:i+1,file,width:image.width,height:image.height,durationTicks:1,offset:[0,0],layers:frame.layers.map(l=>({depth:l.depth,shapeId:l.characterId})),bitmapId:base.fill.bitmapId,endMarker:frame.actions.length>0});
    }
    manifest.actions[name]=action;
  }
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]?.endsWith('convert-first-actor.mjs')) {await convert(process.argv[2]);console.log('Converted 22 source frames and manifest.');}

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Actor} from '../src/domain/actor.ts';
import {ActorClock} from '../src/application/clock.ts';
import {validateManifest} from '../src/content/manifest.ts';
const data=JSON.parse(fs.readFileSync('public/assets/first-actor/manifest.json','utf8'));
const make=()=>new Actor(validateManifest(structuredClone(data)));

test('source attack trace: end marker on frame 11, effect on following Activities only',()=>{
  const a=make();a.select('attack');const trace=[a.snapshot()];
  for(let i=0;i<11;i++){a.step();trace.push(a.snapshot());}
  assert.deepEqual(trace.map(s=>[s.action,s.frame]),[['attack',1],['attack',2],['attack',3],['attack',4],['attack',5],['attack',6],['attack',7],['attack',8],['attack',9],['attack',10],['attack',11],['idle',1]]);
  assert.deepEqual(a.events,[{tick:10,type:'attack-ended'},{tick:11,type:'effect-requested'}]);
  a.advance(10000);assert.equal(a.events.length,2);
});
test('left/right selector updates preserve run child; action replacement starts first frame',()=>{
  const a=make();a.select('run');a.advance(200);assert.equal(a.frame,4);
  a.select('run','right');assert.equal(a.frame,4);a.advance(1400/3);assert.equal(a.frame,1);
  a.select('idle');a.select('run');assert.equal(a.frame,1);
});
test('attack reentry and state interruption do not duplicate effects or swap facing',()=>{
  const a=make();a.select('attack','right');a.advance(600);
  assert.equal(a.select('attack','left'),false);assert.equal(a.select('run','left'),false);assert.equal(a.facing,'right');
  a.advance(200);assert.equal(a.action,'idle');assert.equal(a.events.length,2);
  a.select('attack');a.advance(800);assert.equal(a.events.filter(e=>e.type==='effect-requested').length,2);
});
test('15/30/60/144 Hz render schedules and a long stall preserve logic sequence',()=>{
  const results=[];
  for(const hz of [15,30,60,144]){const a=make();a.select('attack');for(let i=0;i<hz*2;i++)a.advance(1000/hz);results.push(a.snapshot());}
  const stalled=make();stalled.select('attack');stalled.advance(2000);for(const r of results)assert.deepEqual(r,stalled.snapshot());
});
test('pause preserves fractional hold; resume and reset do not catch up paused time',()=>{
  const a=make();a.select('run');a.advance(30);a.paused=true;a.advance(99999);assert.equal(a.frame,1);
  a.paused=false;a.advance(36);assert.equal(a.frame,1);a.advance(1);assert.equal(a.frame,2);
  a.reset();assert.deepEqual(a.snapshot(),{action:'idle',facing:'left',frame:1,tick:0,paused:false,events:[]});
  assert.throws(()=>a.advance(-1));assert.throws(()=>a.advance(NaN));
});
test('clock consumes monotonic elapsed time without renderer and freezes paused duration',()=>{
  const a=make();let now=0;const clock=new ActorClock(a,()=>now);a.select('attack');
  now=700;clock.pump();assert.equal(a.frame,11);clock.pause(true);now=5700;clock.pump();assert.equal(a.events.length,1);
  clock.pause(false);now=5767;clock.pump();assert.equal(a.events.length,2);clock.reset();assert.equal(a.tick,0);
});
test('manifest rejects missing frames, foreign resources, timing and event corruption',()=>{
  for(const mutate of [(m:any)=>m.actions.run.frames.pop(),(m:any)=>m.fps=60,(m:any)=>m.actions.idle.frames[0].file='../x.png',(m:any)=>m.actions.attack.frames[2].endMarker=true,(m:any)=>m.parentMatrix=[NaN,0,0,1,0,0],(m:any)=>m.collision={}]){const m=structuredClone(data);mutate(m);assert.throws(()=>validateManifest(m));}
});

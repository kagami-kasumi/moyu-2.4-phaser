import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
const baselines='docs/reverse-engineering/first-actor/baseline';
const evidence='.evidence/first-actor';

test('cold standalone build, 44 source-frame projections and controlled lifecycle',async({page})=>{
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('data:'))requests.push(r.url());});
  await page.goto('/actor.html?manual');await expect(page.locator('body')).toHaveAttribute('data-ready','true');
  // Independent expected projection: frozen FFDec images + reviewed SWF matrix constants.
  const matrices={idle:{left:[1,-49.55,0.45],right:[-1,167.45,0.45]},run:{left:[1,-69.55,4],right:[-1,180.45,4]},attack:{left:[1,-93.7,-49.65],right:[-1,206.3,-49.65]}};
  const comparisons=[];
  for(const [action,count]of [['idle',1],['run',10],['attack',11]])for(const facing of ['left','right'])for(let frame=1;frame<=count;frame++){
    await page.evaluate(({action,facing,frame})=>{const p=window.actorProbe;p.reset();p.select(action,facing);p.advance((frame-1)*1000/15);p.render();},{action,facing,frame});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const png=await page.locator('#stage canvas').screenshot();
    const reference=fs.readFileSync(`${baselines}/${action}-${frame}.png`).toString('base64');
    const expected=await page.evaluate(async({reference,m})=>{const c=document.createElement('canvas');c.width=580;c.height=500;const ctx=c.getContext('2d');ctx.fillStyle='#172630';ctx.fillRect(0,0,580,500);const img=new Image();img.src=`data:image/png;base64,${reference}`;await img.decode();const scale=52428/65536;ctx.translate(290-44.45,340-101.5);ctx.scale(scale,scale);ctx.translate(m[1],m[2]);ctx.scale(m[0],1);ctx.drawImage(img,0,0);return c.toDataURL();},{reference,m:matrices[action][facing]});
    const a=await sharp(png).removeAlpha().raw().toBuffer(),b=await sharp(Buffer.from(expected.split(',')[1],'base64')).removeAlpha().raw().toBuffer();expect(a.length).toBe(b.length);
    let sum=0,bad=0;for(let i=0;i<a.length;i+=3){let max=0;for(let c=0;c<3;c++){const d=Math.abs(a[i+c]-b[i+c]);sum+=d;max=Math.max(max,d);}if(max>16)bad++;}
    const mae=sum/a.length,ratio=bad/(580*500);comparisons.push({action,facing,frame,meanError:mae,pixelsOver16:bad});
    expect(mae,`${action}/${facing}/${frame}`).toBeLessThan(0.03);expect(bad).toBeLessThan(60);
    if(action==='attack'&&frame===8){fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(`${evidence}/actual-${facing}.png`,png);fs.writeFileSync(`${evidence}/expected-${facing}.png`,Buffer.from(expected.split(',')[1],'base64'));}
  }
  await page.evaluate(()=>{const p=window.actorProbe;p.reset();p.select('attack','right');p.advance(10*1000/15);});
  let s=await page.evaluate(()=>window.actorProbe.snapshot());expect(s.frame).toBe(11);expect(s.events).toEqual([{tick:10,type:'attack-ended'}]);
  await page.evaluate(()=>{window.actorProbe.pause(true);window.actorProbe.advance(5000);});expect((await page.evaluate(()=>window.actorProbe.snapshot())).events).toHaveLength(1);
  await page.evaluate(()=>{window.actorProbe.pause(false);window.actorProbe.advance(1000/15);});s=await page.evaluate(()=>window.actorProbe.snapshot());expect(s.action).toBe('idle');expect(s.events).toHaveLength(2);
  await page.evaluate(()=>{window.actorProbe.reset();window.actorProbe.select('run','left');window.actorProbe.advance(400);window.actorProbe.render();});
  await page.screenshot({path:`${evidence}/workbench.png`,fullPage:true});
  await page.evaluate(()=>{const p=window.actorProbe;p.reset();p.select('attack','left');p.sleepRenderer();p.startClock();});
  await expect.poll(()=>page.evaluate(()=>window.actorProbe.snapshot().events.length)).toBe(2);
  const withoutRender=await page.evaluate(()=>{const p=window.actorProbe;p.stopClock();const s=p.snapshot();p.wakeRenderer();return s;});
  expect(withoutRender.events).toEqual([{tick:10,type:'attack-ended'},{tick:11,type:'effect-requested'}]);
  fs.writeFileSync(`${evidence}/browser-comparison.json`,JSON.stringify({renderer:await page.evaluate(()=>window.actorProbe.renderer()),comparisons,withoutRender,errors,requests},null,2));
  expect(errors).toEqual([]);expect(requests.filter(u=>new URL(u).origin!=='http://127.0.0.1:4173')).toEqual([]);expect(requests.some(u=>/\.swf|local-resources|\.evidence|ffdec/i.test(u))).toBeFalsy();
});

test('visible buttons pause, single-step, resume and reset the running scene',async({page})=>{
  await page.goto('/actor.html');await expect(page.locator('body')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'跑动',exact:true}).click();await page.getByRole('button',{name:'右 →',exact:true}).click();
  await page.getByRole('button',{name:'暂停',exact:true}).click();const before=await page.locator('#status').textContent();
  await page.waitForTimeout(200);expect(await page.locator('#status').textContent()).toBe(before);
  await page.getByRole('button',{name:'单步',exact:true}).click();expect(await page.locator('#status').textContent()).not.toBe(before);
  await page.getByRole('button',{name:'继续播放',exact:true}).click();await expect(page.locator('#status')).not.toContainText('已暂停');
  await page.getByRole('button',{name:'重置',exact:true}).click();await expect(page.locator('#status')).toContainText('待机 · 左向 · 帧 1/1');
  await page.getByRole('button',{name:'斩魂',exact:true}).click();await expect(page.locator('#events')).toContainText('效果请求');
});


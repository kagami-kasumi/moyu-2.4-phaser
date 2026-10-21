import {rewardEquipment} from '../../src/domain/npc-reward.ts';
import {refreshEquipmentAttributes} from '../../src/domain/equipment-attributes.ts';
import {reviveParty} from '../../src/domain/pet-recovery.ts';
import {test,expect} from '@playwright/test';import fs from 'node:fs';
import {Journey} from '../../src/domain/journey.ts';import {Actor} from '../../src/domain/actor.ts';
import {captureSave} from '../../src/application/save-game.ts';import {decodeSave,encodeSave,savedProgress} from '../../src/application/save-codec.ts';
import {literalItem} from '../../src/content/registry.ts';
const out='.evidence/black-abyss-battle';fs.mkdirSync(out,{recursive:true});const json=p=>JSON.parse(fs.readFileSync(p)),maps=json('public/assets/first-slice/manifest.json'),actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:15000});
async function load(page,file){await page.goto('/');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(file);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await expect(page.locator('#save-message')).toContainText('保存成功');await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const file=`${out}/${name}.json`;await(await download).saveAs(file);const progress=savedProgress(decodeSave(fs.readFileSync(file,'utf8')));await page.locator('#close-manager').click();await page.locator('#close-system').click();return progress;}
async function move(page,key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
async function click(page,x,y){const b=await page.locator('canvas').boundingBox();await page.mouse.click(b.x+x,b.y+y);}
function route(p,entry){const j=new Journey(maps,new Actor(actors[p.profession]),actors);j.map=p.map;const target=maps.maps[p.map].layers.find(l=>l.name===entry).matrix,queue=[[0,0]],seen=new Map([['0,0',null]]),keys=['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'],deltas=[[1,0],[-1,0],[0,1],[0,-1]];let end;
 for(let n=0;n<queue.length;n++){const [a,b]=queue[n],x=p.x+a*12,y=p.y+b*9;if(Math.abs(x-target[4])<24&&Math.abs(y-target[5])<18){end=[a,b];break;}for(let k=0;k<4;k++){const aa=a+deltas[k][0],bb=b+deltas[k][1],xx=p.x+aa*12,yy=p.y+bb*9,key=aa+','+bb;if(xx<0||xx>580||yy<0||yy>500||seen.has(key)||!j.groundContains(xx,yy)||![[6,0],[-6,0],[0,4.5],[0,-4.5]].every(([mx,my])=>j.groundContains(xx+mx,yy+my)))continue;seen.set(key,{prev:[a,b],key:keys[k]});queue.push([aa,bb]);}}
 if(!end)throw Error('No floor route '+p.map+' '+entry);const path=[];for(let node=seen.get(end.join(','));node;node=seen.get(node.prev.join(',')))path.push(node.key);path.reverse();const runs=[];for(const key of path){if(runs.at(-1)?.key===key)runs.at(-1).steps++;else runs.push({key,steps:1});}return runs;}
async function portal(page,id,entry,destination){for(let n=0;n<8;n++){const p=await save(page,id+'-position');if(true){for(const run of route(p,entry))await move(page,run.key,run.steps*1000/15);}else{const target=maps.maps[p.map].layers.find(l=>l.name===entry).matrix,dx=target[4]-p.x,dy=target[5]-p.y;if(Math.abs(dx)>18)await move(page,dx>0?'ArrowRight':'ArrowLeft',Math.abs(dx)/180*1000);if(Math.abs(dy)>10)await move(page,dy>0?'ArrowDown':'ArrowUp',Math.abs(dy)/135*1000);}await page.keyboard.press('q');if(await page.locator('#map-name').textContent()===destination)return;}await expect(page.locator('#map-name')).toHaveText(destination);}
async function item(page,name,verb='使用'){const cell=page.locator('#bag-items [data-item="'+name+'"]').first();if(!await cell.evaluate(e=>e.open))await cell.locator('summary').click();await cell.getByRole('button',{name:verb+' '+name,exact:true}).click();}

function approach(p,target){const maps=JSON.parse(fs.readFileSync('public/assets/first-slice/manifest.json')),actor=JSON.parse(fs.readFileSync('public/assets/first-actor/manifest.json')),j=new Journey(maps,new Actor(actor));j.map=p.map;const queue=[[0,0]],seen=new Map([['0,0',null]]),keys=['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'],ds=[[1,0],[-1,0],[0,1],[0,-1]];let end;
 for(let n=0;n<queue.length;n++){const[a,b]=queue[n],x=p.x+a*6,y=p.y+b*4.5;if(Math.abs(x-target.x)<135&&Math.abs(y-target.y)<27){end=[a,b];break;}for(let k=0;k<4;k++){const aa=a+ds[k][0],bb=b+ds[k][1],xx=p.x+aa*6,yy=p.y+bb*4.5,key=aa+','+bb;if(xx<0||xx>580||yy<0||yy>500||seen.has(key)||!j.groundContains(xx,yy))continue;seen.set(key,{prev:[a,b],key:keys[k]});queue.push([aa,bb]);}}
 if(!end)throw Error('No reachable attack point '+p.map+' '+JSON.stringify(target));const path=[];for(let v=seen.get(end.join(','));v;v=seen.get(v.prev.join(',')))path.push(v.key);path.reverse();const runs=[];for(const key of path){if(runs.at(-1)?.key===key)runs.at(-1).steps++;else runs.push({key,steps:1});}return {runs,face:p.x+end[0]*6>target.x?'ArrowLeft':'ArrowRight'};
}


async function fight(page,id,stage){
 let partial=false;
 for(let cycle=0;cycle<300;cycle++){
  await page.keyboard.press('f');await page.waitForTimeout(850);await expect(page.locator('#combat-revive')).toBeHidden();if(cycle%4!==3)continue;
  const state=await save(page,id+'-'+stage+'-tracking');console.log(id,stage,cycle,state.combat.monsters.map(monster=>Math.round(monster.life)));
  if(state.combat.monsters.every(monster=>monster.life<=0)){await save(page,id+'-'+stage+'-cleared');return state;}
  if(!partial&&state.combat.monsters.some((monster,index)=>monster.life>0&&monster.life<(index===0?(stage==='right'?76500:74205):13770))){await load(page,`${out}/${id}-${stage}-tracking.json`);partial=true;}
  const target=state.combat.monsters.find(monster=>monster.life>0),plan=approach(state,target);for(const run of plan.runs)await move(page,run.key,run.steps*1000/30);await move(page,plan.face,35);
 }
 throw Error('Natural field combat did not finish');
}

for(const id of ['warrior','mage'])test(`${id}: 088 actual home enters second legion, five regions, reward, ice palace home and restore`,async({page})=>{
 test.setTimeout(1200000);page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await load(page,`.evidence/ice-palace-city/${id}-home.json`);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();
 await portal(page,id,'entry3','黑渊入口');await save(page,id+'-entrance');await page.screenshot({path:`${out}/${id}-entrance.png`});await expect(page.locator('#map-name')).toHaveText('黑渊战场左',{timeout:8000});await page.screenshot({path:`${out}/${id}-left.png`});
 await click(page,280,160);await page.locator('#gobi-medicine').click();await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();await expect(page.locator('[data-good]')).toHaveCount(7);await page.locator('[data-good="2"]').click();await page.getByRole('textbox',{name:'购买数量'}).fill('1');await page.getByRole('button',{name:'确认购买',exact:true}).click();await page.keyboard.press('Escape');await click(page,280,160);await page.locator('#gobi-revive').click();await expect(page.locator('#notice')).toContainText('军需官已恢复');
 await portal(page,id,'entry2','黑渊战场中');await fight(page,id,'center');await portal(page,id,'entry2','黑渊战场上');await fight(page,id,'up');await portal(page,id,'entry2','黑渊战场中');await portal(page,id,'entry3','黑渊战场下');await fight(page,id,'down');await portal(page,id,'entry3','黑渊战场右');
 const cleared=await fight(page,id,'right');expect(cleared.firstQuest.blackAbyss.isComplete).toBe(true);expect(cleared.firstQuest.firstLegionActive).toBe(true);expect(cleared.firstQuest.firstLegionRebirth).toBe(1);await page.screenshot({path:`${out}/${id}-cleared.png`});await load(page,`${out}/${id}-right-cleared.json`);await page.locator('#abyss-quest-prize').click();await page.keyboard.press('x');await item(page,'超级经验球');await page.keyboard.press('Escape');const awarded=await save(page,id+'-awarded');expect(awarded.reward.res).toBe(cleared.reward.res+250000);expect(awarded.inventory.consumables.expBallNum).toBe(Math.min(150,cleared.inventory.consumables.expBallNum+1));expect(awarded.firstQuest.blackAbyss.isDoing).toBe(false);
 await portal(page,id,'entry2','黑渊战场中');await portal(page,id,'entry1','黑渊战场左');await click(page,280,160);await page.locator('#gobi-leave').click();await expect(page.locator('#map-name')).toHaveText('冰宫');const home=await save(page,id+'-home');expect(home.cityVisit.homeCity).toBe('冰宫');await page.reload();await ready(page);await page.locator('#continue-game').click();await load(page,`${out}/${id}-home.json`);await expect(page.locator('#map-name')).toHaveText('冰宫');expect(errors).toEqual([]);
});

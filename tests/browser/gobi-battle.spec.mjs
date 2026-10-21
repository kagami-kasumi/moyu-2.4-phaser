import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {decodeSave,savedProgress} from '../../src/application/save-codec.ts';

const out='.evidence/gobi-battle';fs.mkdirSync(out,{recursive:true});
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:15000});
async function load(page,file){await page.goto('/');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(file);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await expect(page.locator('#save-message')).toContainText('保存成功');await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const file=`${out}/${name}.json`;await(await download).saveAs(file);const progress=savedProgress(decodeSave(fs.readFileSync(file,'utf8')));await page.locator('#close-manager').click();await page.locator('#close-system').click();return progress;}
async function move(page,key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
async function click(page,x,y){const bounds=await page.locator('canvas').boundingBox();await page.mouse.click(bounds.x+x,bounds.y+y);}
async function walk(page,x,y){const bounds=await page.locator('canvas').boundingBox();await page.mouse.move(bounds.x+x,bounds.y+y);await page.mouse.down();await page.waitForTimeout(4200);await page.mouse.up();}
async function portal(page,id,x,y,destination){
 for(let attempt=0;attempt<6;attempt++){const position=await save(page,id+'-position'),dx=x-position.x,dy=y-position.y;if(Math.abs(dx)>18)await move(page,dx>0?'ArrowRight':'ArrowLeft',Math.abs(dx)/180*1000);if(Math.abs(dy)>10)await move(page,dy>0?'ArrowDown':'ArrowUp',Math.abs(dy)/135*1000);await page.keyboard.press('q');if(await page.locator('#map-name').textContent()===destination)return;}
 await expect(page.locator('#map-name')).toHaveText(destination);
}
async function toOutskirts(page){
 for(const [x,y,map]of [[42,411.6,'树心路'],[300,350,'树心路'],[42,200.95,'树心城郊区'],[41.55,401,'卡萨诺城三'],[42,411.6,'卡萨诺城二'],[510,340,'卡萨诺城二'],[42,411.6,'卡萨诺城一'],[42,306.6,'卡萨诺城郊区']]){await walk(page,x,y);await expect(page.locator('#map-name')).toHaveText(map);}
}
async function toTree(page){
 for(const [x,y,map]of [[539,306.6,'卡萨诺城一'],[542,411.6,'卡萨诺城二'],[510,340,'卡萨诺城二'],[540,415.6,'卡萨诺城三'],[542,411.6,'树心城郊区'],[531,217,'树心路'],[300,350,'树心路'],[538,422,'树心城']]){await walk(page,x,y);await expect(page.locator('#map-name')).toHaveText(map);}
}
async function sellResources(page,command){await click(page,450,190);await page.locator('[data-trade="3103"]').click();await page.locator('[data-trade="'+command+'"]').click();await expect(page.locator('#trade-panel')).toContainText('成功出售');await page.keyboard.press('Escape');}
async function fight(page,id,stage){
 let partial=false;
 for(let cycle=0;cycle<300;cycle++){
  await page.keyboard.press('f');await page.waitForTimeout(850);await expect(page.locator('#combat-revive')).toBeHidden();if(cycle%4!==3)continue;
  const state=await save(page,id+'-'+stage+'-tracking');console.log(id,stage,cycle,state.combat.monsters.map(monster=>Math.round(monster.life)));
  if(state.combat.monsters.every(monster=>monster.life<=0)){await save(page,id+'-'+stage+'-cleared');return state;}
  if(!partial&&state.combat.monsters.some((monster,index)=>monster.life>0&&monster.life<(index===0?24480:stage==='right'?4590:5355))){await load(page,`${out}/${id}-${stage}-tracking.json`);partial=true;}
  const target=state.combat.monsters.find(monster=>monster.life>0),targetY=Math.min(410,Math.max(180,target.y)),targetX=Math.min(490,Math.max(70,target.x+50));
  if(Math.abs(targetY-state.y)>12)await move(page,targetY>state.y?'ArrowDown':'ArrowUp',Math.min(1800,Math.abs(targetY-state.y)/135*1000));
  if(Math.abs(targetX-state.x)>50)await move(page,targetX>state.x?'ArrowRight':'ArrowLeft',Math.min(2200,Math.abs(targetX-state.x)/180*1000));await move(page,cycle%8===3?'ArrowLeft':'ArrowRight',70);
 }
 throw Error('Natural field combat did not finish');
}
for(const id of ['warrior','mage'])test(`${id}: natural seventh legion combat, king reward consumption, quartermaster and import`,async({page})=>{
 test.setTimeout(1200000);page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await load(page,`.evidence/shuxin-city/${id}-home.json`);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();
 await toOutskirts(page);await sellResources(page,3107);const funded=await save(page,id+'-funded');await toTree(page);
 await walk(page,542,411.6);await expect(page.locator('#map-name')).toHaveText('戈壁郊区');await expect(page.locator('#map-name')).toHaveText('戈壁战场左',{timeout:8000});
 await page.screenshot({path:`${out}/${id}-left.png`});await click(page,280,160);await page.locator('#gobi-medicine').click();await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();await expect(page.locator('[data-good]')).toHaveCount(4);await page.locator('[data-good="2"]').click();await page.getByRole('textbox',{name:'购买数量'}).fill('1');await page.getByRole('button',{name:'确认购买',exact:true}).click();await expect(page.locator('#shop-feedback')).toContainText('花费 30');await page.keyboard.press('Escape');
 await click(page,280,160);await page.locator('#gobi-revive').click();await expect(page.locator('#notice')).toContainText('军需官已恢复');
 await portal(page,id,542,256,'戈壁战场中');const center=await fight(page,id,'center');expect(center.combatLedger.kills.魔军副将).toBe(1);expect(center.gobiBattle.centerRegion).toBe(false);await page.screenshot({path:`${out}/${id}-center-cleared.png`});
 await portal(page,id,542,257.6,'戈壁战场右');const cleared=await fight(page,id,'right');expect(cleared.combatLedger.kills.魔军主将).toBe(1);expect(cleared.firstQuest.king.isComplete).toBe(true);expect(cleared.firstQuest.swampActive).toBe(true);await load(page,`${out}/${id}-right-cleared.json`);await page.locator('#king-quest-prize').click();await expect(page.locator('#honor-task')).toContainText('是否接受');await page.locator('#honor-accept').click();
 await page.keyboard.press('x');const item=page.locator('#bag-items [data-item="超级经验球"]').first();if(!await item.evaluate(element=>element.open))await item.locator('summary').click();await item.getByRole('button',{name:'使用 超级经验球',exact:true}).click();await page.keyboard.press('Escape');const awarded=await save(page,id+'-awarded');expect(awarded.reward.res).toBe(funded.reward.res+100000);expect(awarded.inventory.consumables.expBallNum).toBe(cleared.inventory.consumables.expBallNum+1);expect(awarded.firstQuest.honor.isDoing).toBe(true);expect(awarded.firstQuest.king.isDoing).toBe(false);
 await portal(page,id,42,256,'戈壁战场中');await portal(page,id,42,257.6,'戈壁战场左');await click(page,280,160);await page.locator('#gobi-leave').click();await expect(page.locator('#map-name')).toHaveText('树心城');await save(page,id+'-home');
 await toOutskirts(page);await sellResources(page,3106);const used=await save(page,id+'-reward-used');expect(used.reward.res).toBe(awarded.reward.res-100000);await page.screenshot({path:`${out}/${id}-reward-used.png`});
 await page.reload();await ready(page);await page.locator('#continue-game').click();await load(page,`${out}/${id}-reward-used.json`);await expect(page.locator('#map-name')).toHaveText('卡萨诺城郊区');expect(errors).toEqual([]);
});

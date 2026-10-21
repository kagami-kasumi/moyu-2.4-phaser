import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {decodeSave,savedProgress} from '../../src/application/save-codec.ts';

const out='.evidence/south-battle';fs.mkdirSync(out,{recursive:true});
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
  if(!partial&&state.combat.monsters.some((monster,index)=>monster.life>0&&monster.life<(index===0?(stage==='right'?53550:41004):9180))){await load(page,`${out}/${id}-${stage}-tracking.json`);partial=true;}
  const target=state.combat.monsters.find(monster=>monster.life>0),targetY=Math.min(410,Math.max(180,target.y)),targetX=Math.min(490,Math.max(70,target.x+50));
  if(Math.abs(targetY-state.y)>12)await move(page,targetY>state.y?'ArrowDown':'ArrowUp',Math.min(1800,Math.abs(targetY-state.y)/135*1000));
  if(Math.abs(targetX-state.x)>50)await move(page,targetX>state.x?'ArrowRight':'ArrowLeft',Math.min(2200,Math.abs(targetX-state.x)/180*1000));await move(page,cycle%8===3?'ArrowLeft':'ArrowRight',70);
 }
 throw Error('Natural field combat did not finish');
}
for(const id of ['warrior','mage'])test(`${id}: real cleared save, complete resource reward and consumption, return home`,async({page})=>{
 test.setTimeout(300000);page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await load(page,`${out}/${id}-right-cleared.json`);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();
 await portal(page,id,42,256,'南城战场中');await portal(page,id,42,257.6,'南城战场左');await click(page,280,160);await page.locator('#gobi-revive').click();await click(page,280,160);await page.locator('#gobi-leave').click();await expect(page.locator('#map-name')).toHaveText('沼泽');
 await portal(page,id,42,440.05,'沼泽郊区');await walk(page,350,300);await portal(page,id,218,121.6,'卡萨诺城二');await walk(page,510,340);await walk(page,42,411.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城一');await walk(page,42,306.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城郊区');
 await sellResources(page,3107);const before=await save(page,id+'-room-for-reward');expect(before.reward.res).toBeLessThanOrEqual(99800000);await page.locator('#south-quest-prize').click();
 await page.keyboard.press('x');const ball=page.locator('#bag-items [data-item="超级经验球"]').first();if(!await ball.evaluate(e=>e.open))await ball.locator('summary').click();await ball.getByRole('button',{name:'使用 超级经验球',exact:true}).click();await page.keyboard.press('Escape');const awarded=await save(page,id+'-complete-reward');expect(awarded.reward.res).toBe(before.reward.res+200000);expect(awarded.inventory.exploit).toBe(Math.min(38500,before.inventory.exploit+1000));expect(awarded.inventory.consumables.expBallNum).toBe(before.inventory.consumables.expBallNum+1);
 await sellResources(page,3106);await sellResources(page,3106);const used=await save(page,id+'-resources-used');expect(used.reward.res).toBe(before.reward.res);expect(used.reward.ms).toBe(awarded.reward.ms+1700);await page.screenshot({path:`${out}/${id}-resources-used.png`});
 await walk(page,539,306.6);await walk(page,542,411.6);await walk(page,303.65,437.2);await expect(page.locator('#map-name')).toHaveText('沼泽郊区');await walk(page,350,300);await walk(page,542,411.6);await expect(page.locator('#map-name')).toHaveText('沼泽');const home=await save(page,id+'-home');expect(home.firstQuest.south.isDoing).toBe(false);expect(home.firstQuest.counterattackActive).toBe(true);
 await page.reload();await ready(page);await page.locator('#continue-game').click();await load(page,`${out}/${id}-home.json`);await expect(page.locator('#map-name')).toHaveText('沼泽');expect(errors).toEqual([]);
});

import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {decodeSave,savedProgress} from '../../src/application/save-codec.ts';

const out='.evidence/shuxin-bandits';fs.mkdirSync(out,{recursive:true});
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true');
async function load(page,file){await page.goto('/');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(file);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await expect(page.locator('#save-message')).toContainText('保存成功');await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const file=`${out}/${name}.json`;await(await download).saveAs(file);return savedProgress(decodeSave(fs.readFileSync(file,'utf8')));}
async function close(page){await page.locator('#close-manager').click();await page.locator('#close-system').click();}
async function move(page,key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
async function walk(page,x,y,ms=4200){const bounds=await page.locator('canvas').boundingBox();await page.mouse.move(bounds.x+x,bounds.y+y);await page.mouse.down();await page.waitForTimeout(ms);await page.mouse.up();}
async function click(page,x,y){const bounds=await page.locator('canvas').boundingBox();await page.mouse.click(bounds.x+x,bounds.y+y);}
for(const id of ['warrior','mage'])test(`${id}: natural 066 save, three bandit waves, reward promotion, donation and roundtrip`,async({page})=>{
 test.setTimeout(900000);page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const input=`.evidence/kasano-finale/${id}-training-rewards-used.json`,before=savedProgress(decodeSave(fs.readFileSync(input,'utf8')));
 await load(page,input);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();
 await page.keyboard.press('q');await expect(page.locator('#map-name')).toHaveText('花园');await page.keyboard.press('q');await expect(page.locator('#map-name')).toHaveText('皇宫');
 await walk(page,42,411.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');await walk(page,510,340);await walk(page,540,415.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城三');
 await walk(page,542,411.6);await expect(page.locator('#map-name')).toHaveText('树心城郊区');await page.screenshot({path:`${out}/${id}-outskirts.png`});
 await click(page,340,110);await expect(page.locator('#notice')).toContainText('管理员已复活');await page.keyboard.press('c');await page.getByRole('button',{name:'为所选幻兽分配经验球',exact:true}).click();for(let count=0;count<70;count++)await page.getByRole('button',{name:'确认用于幻兽',exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('c');if(await page.locator('#pet-merge-button').textContent()==='合体幻兽')await page.locator('#pet-merge-button').click();await expect(page.locator('#pet-detail')).toContainText('已合体');await page.keyboard.press('Escape');
 await save(page,id+'-outskirts');await load(page,`${out}/${id}-outskirts.json`);await click(page,340,110);await expect(page.locator('#notice')).toContainText('管理员已复活');
 await walk(page,531,217);await expect(page.locator('#map-name')).toHaveText('树心路');const warning=await save(page,id+'-road-warning');expect(warning.banditWarning).toBeGreaterThan(0);await page.waitForTimeout(1000);await load(page,`${out}/${id}-road-warning.json`);
 await expect(page.locator('#map-name')).toHaveText('树平',{timeout:12000});await page.screenshot({path:`${out}/${id}-first-wave.png`});
 const waves=new Set();let partial=false,cleared;
 for(let cycle=0;cycle<240;cycle++){
  await page.keyboard.press('f');await page.waitForTimeout(850);await expect(page.locator('#combat-revive')).toBeHidden();
  if(cycle%4!==3)continue;
  const state=await save(page,id+'-tracking');waves.add(state.combat.banditWave);console.log(id,cycle,state.combat.banditWave,state.combat.monsters.map(monster=>Math.round(monster.life)));
  if(state.firstQuest.bandits?.isComplete){cleared=state;await close(page);break;}
  if(!partial&&state.combat.monsters.some(monster=>monster.life>0&&monster.life<(state.combat.banditWave===3?10200:2040))){await load(page,`${out}/${id}-tracking.json`);partial=true;}else await close(page);
  const target=state.combat.monsters.find(monster=>monster.life>0);
  if(target){
   const targetY=Math.min(430,Math.max(210,target.y)),targetX=Math.min(510,Math.max(70,target.x+50));
   if(Math.abs(targetY-state.y)>12)await move(page,targetY>state.y?'ArrowDown':'ArrowUp',Math.min(1600,Math.abs(targetY-state.y)/135*1000));
   if(Math.abs(targetX-state.x)>50)await move(page,targetX>state.x?'ArrowRight':'ArrowLeft',Math.min(2400,Math.abs(targetX-state.x)/180*1000));
   await move(page,cycle%8===3?'ArrowLeft':'ArrowRight',70);
  }
 }
 expect(cleared).toBeDefined();expect(partial).toBe(true);expect([...waves].sort()).toEqual([1,2,3]);
 expect(cleared.combatLedger.kills.强盗).toBe(6);expect(cleared.combatLedger.kills.强盗首领).toBe(1);
 await save(page,id+'-complete-unclaimed');await load(page,`${out}/${id}-complete-unclaimed.json`);await page.locator('#bandit-quest-prize').click();await expect(page.locator('#bandit-quest-prize')).toBeHidden();
 const claimed=await save(page,id+'-claimed');expect(claimed.inventory.exploit).toBe(before.inventory.exploit+500);expect(claimed.inventory.militaryExploit).toBe(before.inventory.militaryExploit+500);expect(claimed.firstQuest.kingActive).toBe(true);
 await load(page,`${out}/${id}-claimed.json`);await page.keyboard.press('x');
 for(let number=0;number<4;number++){const medal=page.locator('#bag-items [data-item="勇士勋章"]').first();if(!await medal.evaluate(element=>element.open))await medal.locator('summary').click();await medal.getByRole('button',{name:'使用 勇士勋章',exact:true}).click();}
 await page.keyboard.press('Escape');const promoted=await save(page,id+'-promoted');expect(promoted.inventory.militaryRank).toBe(1);expect(promoted.inventory.nobilityRank).toBe(1);expect(promoted.inventory.exploit).toBe(claimed.inventory.exploit+400);await close(page);
 await walk(page,300.4,281.6);await expect(page.locator('#map-name')).toHaveText('树心路');await page.screenshot({path:`${out}/${id}-road-cleared.png`});await page.waitForTimeout(5500);await expect(page.locator('#map-name')).toHaveText('树心路');
 await page.keyboard.press('q');await expect(page.locator('#map-name')).toHaveText('树心城郊区');await walk(page,41.55,401);await expect(page.locator('#map-name')).toHaveText('卡萨诺城三');await walk(page,42,411.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');
 await walk(page,510,340);await walk(page,527,108.5);await expect(page.locator('#map-name')).toHaveText('皇宫');await click(page,200,140);await expect(page.locator('#palace-panel')).toBeVisible();await page.getByRole('button',{name:'捐献1000魔石',exact:true}).click();await page.getByRole('button',{name:'确认捐献',exact:true}).click();await expect(page.locator('#palace-panel')).toContainText('获得500点功勋');await page.screenshot({path:`${out}/${id}-reward-consumer.png`});
 await page.keyboard.press('Escape');await walk(page,42,411.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');const home=await save(page,id+'-home');expect(home.inventory.exploit).toBe(promoted.inventory.exploit+500);
 await page.reload();await ready(page);await page.locator('#continue-game').click();await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');await load(page,`${out}/${id}-home.json`);await expect(page.locator('#bandit-quest-prize')).toBeHidden();expect(errors).toEqual([]);
});

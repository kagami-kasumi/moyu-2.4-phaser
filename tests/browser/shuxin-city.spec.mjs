import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {decodeSave,savedProgress} from '../../src/application/save-codec.ts';

const out='.evidence/shuxin-city';fs.mkdirSync(out,{recursive:true});
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:15000});
async function load(page,file){await page.goto('/');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(file);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await expect(page.locator('#save-message')).toContainText('保存成功');await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const file=`${out}/${name}.json`;await(await download).saveAs(file);return savedProgress(decodeSave(fs.readFileSync(file,'utf8')));}
async function close(page){await page.locator('#close-manager').click();await page.locator('#close-system').click();}
async function move(page,key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
async function walk(page,x,y,ms=4200){const bounds=await page.locator('canvas').boundingBox();await page.mouse.move(bounds.x+x,bounds.y+y);await page.mouse.down();await page.waitForTimeout(ms);await page.mouse.up();}
async function click(page,x,y){const bounds=await page.locator('canvas').boundingBox();await page.mouse.click(bounds.x+x,bounds.y+y);}
async function item(page,scope,name,verb){const cell=page.locator(scope+' [data-item="'+name+'"]').first();if(!await cell.evaluate(element=>element.open))await cell.locator('summary').click();await cell.getByRole('button',{name:verb+' '+name,exact:true}).click();}
async function prepare(page,id){
 await walk(page,42,411.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城一');
 await click(page,320,250);await page.getByRole('button',{name:'我想买点东西',exact:true}).click();
 for(const name of ['月光宝盒','极品玉石','9朵玫瑰']){const buttons=page.locator('[data-sell]').filter({hasText:name});while(await buttons.count())await buttons.first().click();}
 await page.keyboard.press('Escape');await page.keyboard.press('e');
 const names=id==='warrior'?['长军刀','蓝色深邃','野蛮行径']:['蛇杖','紫色占卜','虚幻圆舞'];
 for(const name of names)await page.getByRole('button',{name:'卸下 '+name,exact:true}).click();
 await page.keyboard.press('Escape');await page.keyboard.press('x');
 async function choose(label,name){const select=page.getByRole('combobox',{name:label});const value=await select.locator('option').evaluateAll((options,title)=>options.find(option=>option.textContent.startsWith(title+' ·'))?.value,name);expect(value).toBeDefined();await select.selectOption(value);}
 for(const name of names){
  await page.locator('#quality-button').click();await choose('选择品质装备',name);await choose('选择品质材料','灵魂晶石');
  for(let count=0;count<30&&!((await page.locator('#socket-item').textContent()).includes('极品'));count++)await page.locator('#forge-sockets').click();await expect(page.locator('#socket-item')).toContainText('极品');await page.getByRole('button',{name:'取回材料',exact:true}).click();await page.locator('#close-sockets').click();
  await page.locator('#level-button').click();
  for(let count=0;count<4;count++){if(!await page.getByRole('button',{name:'取回材料',exact:true}).count()){await page.locator('#close-sockets').click();await item(page,'#bag-items','幻魔礼包','使用');await page.locator('#level-button').click();await choose('选择幻魔材料','幻魔之心');}await page.locator('#forge-sockets').click();}
  await expect(page.locator('#socket-item')).toContainText('60级');if(await page.getByRole('button',{name:'取回材料',exact:true}).count())await page.getByRole('button',{name:'取回材料',exact:true}).click();await page.locator('#close-sockets').click();
  await page.locator('#magic-button').click();
  for(let count=0;count<12;count++){if(!await page.getByRole('button',{name:'取回材料',exact:true}).count()){await page.locator('#close-sockets').click();await item(page,'#bag-items','魔魂礼包','使用');await page.locator('#magic-button').click();await choose('选择魔魂材料','魔魂之心');}await page.locator('#forge-sockets').click();}
  if(await page.getByRole('button',{name:'取回材料',exact:true}).count())await page.getByRole('button',{name:'取回材料',exact:true}).click();
  const details=await page.locator('#socket-item').textContent();console.log(id,'normal forge',details);await page.getByRole('button',{name:'取回装备',exact:true}).click();await page.locator('#close-sockets').click();
  await item(page,'#bag-items',details.match(/^装备(.+?) ·/)[1],'装备');
 }
 await page.keyboard.press('Escape');await page.keyboard.press('c');await page.getByRole('button',{name:'召回所选幻兽',exact:true}).click();await page.getByRole('button',{name:'5. 嘻哈牛',exact:true}).click();await page.getByRole('button',{name:'出征所选幻兽',exact:true}).click();await page.getByRole('button',{name:'为所选幻兽分配经验球',exact:true}).click();for(let count=0;count<70;count++)await page.getByRole('button',{name:'确认用于幻兽',exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('c');await page.locator('#pet-merge-button').click();await expect(page.locator('#pet-detail')).toContainText('已合体');await page.keyboard.press('Escape');await page.keyboard.press('e');await page.screenshot({path:`${out}/${id}-prepared.png`});console.log(id,await page.locator('#equipment-stats').textContent());await page.keyboard.press('Escape');
 await walk(page,542,411.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');await save(page,id+'-prepared');await close(page);
}
for(const id of ['warrior','mage'])test(`${id}: natural road to city, pharmacy, four ice swordsmen, reward sale and home import`,async({page})=>{
 test.setTimeout(1200000);page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await load(page,`.evidence/shuxin-bandits/${id}-reward-used.json`);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();await prepare(page,id);
 await walk(page,510,340);await walk(page,540,415.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城三');
 await walk(page,542,411.6);await expect(page.locator('#map-name')).toHaveText('树心城郊区');await walk(page,531,217);await expect(page.locator('#map-name')).toHaveText('树心路');
 await walk(page,300,350);await walk(page,538,422);await expect(page.locator('#map-name')).toHaveText('树心城');await page.screenshot({path:`${out}/${id}-city.png`});
 await expect(async()=>{await click(page,455,260);await expect(page.getByRole('button',{name:'好的，我想买点药',exact:true})).toBeVisible({timeout:500});}).toPass({timeout:5000});
 await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();await expect(page.locator('[data-good]')).toHaveCount(4);
 for(const [index,name]of [[2,'中型生命药'],[3,'中型魔力药']]){
  await page.locator('[data-good="'+index+'"]').click();await page.getByRole('textbox',{name:'购买数量'}).fill('1');await page.getByRole('button',{name:'确认购买',exact:true}).click();await expect(page.locator('#shop-feedback')).toContainText('花费 30');
  await page.keyboard.press('Escape');await page.keyboard.press('x');await item(page,'#bag-items',name,'使用');await expect(page.locator('#reward-message')).toContainText('已使用 '+name);await page.keyboard.press('Escape');
  if(index===2){await click(page,455,260);await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();}
 }
 const city=await save(page,id+'-city');expect(city.cityVisit.homeCity).toBe('树心城');expect(city.cityVisit.shuxinMirageGranted).toBe(true);expect(city.pharmacy.openNumber).toBe(4);
 await load(page,`${out}/${id}-city.json`);await page.keyboard.press('x');await item(page,'#bag-items','树心幻境','使用');await page.keyboard.press('Escape');await expect(page.locator('#map-name')).toHaveText('树心幻境');await page.screenshot({path:`${out}/${id}-first.png`});
 let partial=false,cleared;
 for(let cycle=0;cycle<400;cycle++){
  await page.keyboard.press('f');await page.waitForTimeout(850);await expect(page.locator('#combat-revive')).toBeHidden();
  if(cycle%4!==3)continue;
  const state=await save(page,id+'-tracking');console.log(id,cycle,state.combat.monsters.map(monster=>Math.round(monster.life)));
  if(state.combat.monsters.every(monster=>monster.life<=0)){cleared=state;await close(page);break;}
  if(!partial&&state.combat.monsters.some(monster=>monster.life>0&&monster.life<25500)){await load(page,`${out}/${id}-tracking.json`);partial=true;}else await close(page);
  const target=state.combat.monsters.find(monster=>monster.life>0),targetY=Math.min(410,Math.max(230,target.y)),targetX=Math.min(490,Math.max(70,target.x+50));
  if(Math.abs(targetY-state.y)>12)await move(page,targetY>state.y?'ArrowDown':'ArrowUp',Math.min(1600,Math.abs(targetY-state.y)/135*1000));
  if(Math.abs(targetX-state.x)>50)await move(page,targetX>state.x?'ArrowRight':'ArrowLeft',Math.min(2200,Math.abs(targetX-state.x)/180*1000));
  await move(page,cycle%8===3?'ArrowLeft':'ArrowRight',70);
 }
 expect(cleared).toBeDefined();expect(partial).toBe(true);expect(cleared.combatLedger.kills.幻影冰妖剑士).toBe(4);
 await save(page,id+'-cleared');await load(page,`${out}/${id}-cleared.json`);await page.screenshot({path:`${out}/${id}-cleared.png`});
 await page.keyboard.press('x');await item(page,'#ground-items','电浆药水','拾取');await page.keyboard.press('Escape');
 for(let attempt=0;attempt<5;attempt++){const position=await save(page,id+'-exit-position');await close(page);const dx=338.45-position.x,dy=331.55-position.y;if(Math.abs(dx)>15)await move(page,dx>0?'ArrowRight':'ArrowLeft',Math.abs(dx)/180*1000);if(Math.abs(dy)>10)await move(page,dy>0?'ArrowDown':'ArrowUp',Math.abs(dy)/135*1000);await page.keyboard.press('q');if(await page.locator('#map-name').textContent()==='树心城')break;}await expect(page.locator('#map-name')).toHaveText('树心城');
 await click(page,455,260);await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();await page.locator('[data-sell]').filter({hasText:'电浆药水'}).first().click();await expect(page.locator('#shop-feedback')).toContainText('出售 电浆药水');
 await page.screenshot({path:`${out}/${id}-reward-used.png`});await page.keyboard.press('Escape');
 const home=await save(page,id+'-home');expect(home.cityVisit.homeCity).toBe('树心城');expect(home.reward.ms).toBeGreaterThan(city.reward.ms);
 await page.reload();await ready(page);await page.locator('#continue-game').click();await load(page,`${out}/${id}-home.json`);await expect(page.locator('#map-name')).toHaveText('树心城');expect(errors).toEqual([]);
});

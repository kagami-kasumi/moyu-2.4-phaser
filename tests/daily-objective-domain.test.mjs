import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyObjectiveDomain} from '../tools/lib/daily-objective-domain.mjs';
const candidate=(line,expression)=>({source:{file:'DefineSprite_2210_任务系统/frame_1/DoAction.as',line},data:{name:{expression}}});
test('daily target domains distinguish first/second monsters, elites and bosses',()=>{
 const first=dailyObjectiveDomain(candidate(156,'monstName1')).names;
 const second=dailyObjectiveDomain(candidate(156,'monstName2')).names;
 assert.equal(first.length,7);assert.equal(second.length,7);
 assert.ok(first.includes('鹿角兽'));assert.ok(!first.includes('龙怪'));assert.ok(second.includes('龙怪'));
 assert.deepEqual(dailyObjectiveDomain(candidate(161,'monstName1')).names,first.map(n=>n+'精英'));
 const bosses=dailyObjectiveDomain(candidate(166,'monstName1')).names;
 assert.equal(bosses.length,8);assert.ok(bosses.every(n=>n.endsWith('头目')));
 assert.throws(()=>dailyObjectiveDomain(candidate(166,'monstName2')));
 assert.throws(()=>dailyObjectiveDomain(candidate(999,'monstName1')));
});

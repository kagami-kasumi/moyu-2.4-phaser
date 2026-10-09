import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { functionRange } from '../tools/lib/as2-data.mjs';
import { QUEST_DISPATCH_RULES as rules } from '../src/content/quest-dispatch-rules.ts';
const source = fs.readFileSync('local-resources/moyu/source-index/as/scripts/' + rules.source.file, 'utf8');
test('completion recomputes its flag and treats empty needs as complete',()=>{
  const fn=vm.runInNewContext('(function(task)'+functionRange(source,'this.taskComplete =').text+')');
  for(const [need,expected] of [[[],true],[[{number:0,needNumber:1}],false],[[{number:1,needNumber:1}],true],[[{number:2,needNumber:1}],true],[[{number:3,needNumber:3},{number:0,needNumber:1}],false]]){
    const task={need,isComplete:!expected};assert.equal(fn(task),expected);assert.equal(task.isComplete,expected);
  }
});
function context(extra) {
  return vm.createContext({ isNaN, Math, _global: { sysMsg: { addMsg() {} }, msg: { open() {} }, numberToString: String }, showTask() {}, taskDetail() {}, nextMainTask() {}, nowTaskType: 0, ...extra });
}
test('objectives consume only the last eligible match, retain overflow and accept negative quantities', () => {
  const quest = () => ({ isDoing: true, levels: 1, need: [{ name: 'fixture', number: 0, needNumber: 3 }] });
  const a = quest(), b = quest();
  const ctx = context({ allTask: [[a, b]], _parent: { map: { role: { levels: 1 } } }, nowTask: undefined, taskComplete: () => false });
  const fn = vm.runInContext('(function(thing,num)' + functionRange(source, 'this.catchThing =').text + ')', ctx);
  const item = { type: 'fixture', number: 8 };
  assert.equal(fn(item), true); assert.equal(b.need[0].number, 3); assert.equal(a.need[0].number, 0); assert.equal(item.number, 5);
  assert.equal(fn('fixture', -2), true); assert.equal(a.need[0].number, -2);
  assert.equal(fn('fixture', NaN), false);
  const zero = { type: 'fixture', number: 0 }; fn(zero); assert.equal(a.need[0].number, -1); assert.equal(zero.number, 0);
});
test('reward dispatch reverses order, bypasses factory for special rewards and clears daily task despite factory failure', () => {
  const events = [], role = { xxx_ms: 0, xxx_res: 0 };
  for (const method of ['militaryExploitUp', 'exploitUp', 'creditUp']) role[method] = n => events.push([method, n]);
  const parent = { map: { role }, huanShou: {}, createThing: p => { events.push(['factory', p.type]); return false; }, upDataWeapon: p => events.push(['equipment', p.type]), backPack: { setThing: p => events.push(['bag', p.type]) } };
  const task = { name: 'fixture', type: '日常任务', isDoing: true, isComplete: true, need: [{ number: 3 }], prize: [{ type: '魔石', val: 10 }, { type: '声望', val: 2 }, { type: '武器' }, { type: 'fixture', number: 2.5 }, { type: '出征3个幻兽' }] };
  const ctx = context({ nowTask: task, _parent: parent, role });
  const fn = vm.runInContext('(function()' + functionRange(source, 'this.getPrize =').text + ')', ctx);
  fn.call({ _parent: parent });
  assert.deepEqual(events, [['factory', 'fixture'], ['factory', 'fixture'], ['factory', 'fixture'], ['equipment', '武器'], ['bag', '武器'], ['creditUp', 2]]);
  assert.equal(role.xxx_ms, 10); assert.equal(parent.huanShou.maxBattleNum, 3);
  assert.equal(task.need[0].number, 0); assert.equal(task.isDoing, false); assert.equal(task.isComplete, false); assert.equal(ctx.nowTask, undefined);
});
test('friend rewards use seven-level buckets including fallback, while honor rewards refuse panel claims', () => {
  for (const levels of [-1, 0, 6, 7, 13, 14, 21, 28, 35, 42, 100]) {
    const items = [], role = { xxx_ms: 0 }, friend = { isTask: true };
    const task = { name: '好友委托', type: '日常任务', isDoing: true, isComplete: true, need: [], prize: [] };
    const parent = { map: { role }, friend: { getAllLevels: () => levels }, createThing: p => items.push(p.type) };
    const ctx = context({ nowTask: task, _parent: parent, friend });
    const fn = vm.runInContext('(function()' + functionRange(source, 'this.getPrize =').text + ')', ctx);
    fn.call({ _parent: parent });
    assert.equal(role.xxx_ms, levels * 10 + 100);
    assert.deepEqual(items, [rules.reward.friend.pets[Math.floor(levels / 7)] ?? rules.reward.friend.fallback]);
    assert.equal(friend.isTask, false);
  }
  const task = { name: '荣誉任务', isDoing: true, isComplete: true };
  const ctx = context({ nowTask: task });
  const fn = vm.runInContext('(function()' + functionRange(source, 'this.getPrize =').text + ')', ctx);
  assert.equal(fn(), false); assert.equal(ctx.nowTask, task); assert.equal(task.isDoing, true);
});

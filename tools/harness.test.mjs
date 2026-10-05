import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkSnapshots, readConfig, renderSnapshots, selectNext, validateState } from './harness.mjs';

const base = () => ({ version: 1,
  featureLines: [{ id: 'LINE-1', title: '基础', status: 'Active', coverage: 'docs/coverage.md' }],
  tasks: [{ id: 'TASK-1', title: '实现', line: 'LINE-1', status: 'Ready', type: 'implementation', dependsOn: [], definition: 'docs/tasks/TASK-1.md', completion: null, blocker: null }],
  governance: [] });
const config = { version: 1, requiredFiles: [], entrypoints: [], documents: [] };
const headings = ['## 目标', '## 输入', '## 范围', '## 输出', '## 验收', '## 停止与拆分'].join('\n');
const fixtureRoots = [];
after(() => {
  for (const root of fixtureRoots) {
    if (path.dirname(root) !== path.resolve(os.tmpdir()) || !path.basename(root).startsWith('magic-harness-')) throw new Error('Unexpected fixture cleanup path');
    fs.rmSync(root, { recursive: true, force: true });
  }
});
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'magic-harness-'));
  fixtureRoots.push(root);
  fs.mkdirSync(path.join(root, 'docs', 'tasks'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'coverage.md'), '# coverage');
  fs.writeFileSync(path.join(root, 'docs', 'tasks', 'TASK-1.md'), headings);
  fs.writeFileSync(path.join(root, 'docs', 'tasks', 'state.json'), JSON.stringify(base()));
  return root;
}

test('accepts a valid state with real contract and coverage documents', () => {
  const result = validateState(base(), { root: fixture(), config, allowMissingSnapshots: true });
  assert.equal(result.ok, true);
});

test('rejects duplicate IDs and unknown dependencies', () => {
  const state = base(); state.tasks.push({ ...state.tasks[0], id: 'TASK-1', dependsOn: ['MISSING'] });
  const result = validateState(state, { root: fixture(), config, allowMissingSnapshots: true });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /unique|unknown dependency/);
});

test('rejects dependency cycles', () => {
  const state = base(); state.tasks[0].dependsOn = ['TASK-2']; state.tasks.push({ ...state.tasks[0], id: 'TASK-2', dependsOn: ['TASK-1'] });
  const result = validateState(state, { root: fixture(), config, allowMissingSnapshots: true });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /dependency cycle/);
});

test('governance takes precedence and next is read-only selection', () => {
  const state = base(); state.governance = [{ id: 'GOV-1', title: '审查', status: 'Blocked', definition: 'docs/gov.md', blocker: '等待证据' }];
  const next = selectNext(state); assert.equal(next.kind, 'governance'); assert.equal(next.blocker, '等待证据');
});

test('rejects paths outside the workspace', () => {
  const state = base(); state.tasks[0].definition = '../outside.md'; state.featureLines[0].coverage = '../coverage.md';
  const result = validateState(state, { root: fixture(), config, allowMissingSnapshots: true });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /escapes workspace root/);
});

test('requires completion evidence for Done tasks', () => {
  const state = base(); state.tasks[0].status = 'Done';
  const result = validateState(state, { root: fixture(), config, allowMissingSnapshots: true });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /requires completion/);
});

test('render creates docs/tasks snapshots and is idempotent', () => {
  const root = fixture(); const state = base();
  const first = renderSnapshots(state, { root, config });
  assert.equal(first.ok, true); assert.equal(checkSnapshots(state, { root }).ok, true);
  const board = fs.readFileSync(path.join(root, 'docs', 'tasks', 'task-board.md'), 'utf8');
  const second = renderSnapshots(state, { root, config });
  assert.equal(second.ok, true); assert.equal(fs.readFileSync(path.join(root, 'docs', 'tasks', 'task-board.md'), 'utf8'), board);
});

test('reports independent errors for multiple current tasks, bad links and null entries', () => {
  const root = fixture(); const state = base();
  state.tasks.push({ ...state.tasks[0], id: 'TASK-2', title: '第二项' });
  state.featureLines.push({ id: 'LINE-2', title: '第二线路', status: 'Planned', coverage: 'docs/coverage.md' });
  state.tasks[1].line = 'LINE-2';
  fs.writeFileSync(path.join(root, 'docs', 'coverage.md'), '[bad](missing.md)');
  state.featureLines.push(null);
  const result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.equal(result.ok, false);
  for (const expected of [/current game task/, /missing link/, /non-object/, /must belong to Active line/]) assert.match(result.errors.join('\n'), expected);
});

test('requires a blocker for Blocked governance and rejects stale blockers', () => {
  const root = fixture(); const state = base();
  state.governance = [{ id: 'GOV-1', title: '审查', status: 'Blocked', definition: 'docs/tasks/TASK-1.md', blocker: '' }];
  let result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /blocker/);
  state.governance[0].status = 'Ready'; state.governance[0].blocker = 'stale';
  result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /blocker/);
});

test('current task cannot skip unfinished dependencies even if governance is current', () => {
  const root = fixture(); const state = base();
  state.tasks.push({ ...state.tasks[0], id: 'TASK-2', status: 'Planned' });
  state.tasks[0].dependsOn = ['TASK-2'];
  state.governance.push({ id: 'GOV-1', title: '治理', status: 'Ready', definition: 'docs/tasks/TASK-1.md', blocker: null });
  const result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.match(result.errors.join('\n'), /current-capable task TASK-1 has unfinished dependency/);
});

test('both task and governance contracts require the actual acceptance heading', () => {
  const root = fixture(); const state = base();
  fs.writeFileSync(path.join(root, 'docs/tasks/TASK-1.md'), headings.replace('## 验收', '## 验收前提'));
  state.governance.push({ id: 'GOV-1', title: '治理', status: 'Ready', definition: 'docs/tasks/TASK-1.md', blocker: null });
  const result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.equal(result.errors.filter(error => error.includes('missing heading ## 验收')).length, 2);
});

test('Done requires existing evidence and completed prerequisites; line cannot close early', () => {
  const root = fixture(); const state = base();
  state.tasks[0].status = 'Done'; state.featureLines[0].status = 'Done';
  state.tasks[0].completion = { summary: '完成', checks: [{ command: 'node test.mjs', result: 'passed' }], evidence: ['docs/result.md'] };
  let result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.match(result.errors.join('\n'), /evidence is missing/);
  fs.writeFileSync(path.join(root, 'docs/result.md'), 'Independent result');
  result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(selectNext(state), null);
  state.tasks.push({ ...base().tasks[0], id: 'TASK-2', status: 'Planned' });
  state.tasks[0].dependsOn = ['TASK-2'];
  result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.match(result.errors.join('\n'), /Done task TASK-1 depends on unfinished/);
  assert.match(result.errors.join('\n'), /Done line LINE-1 contains unfinished/);
});

test('generated nested contract links work, drift fails, and render repairs snapshots', () => {
  const root = fixture(); const state = base();
  fs.mkdirSync(path.join(root, 'docs/tasks/task-definitions'));
  state.tasks[0].definition = 'docs/tasks/task-definitions/TASK-1.md';
  fs.writeFileSync(path.join(root, state.tasks[0].definition), headings);
  assert.equal(renderSnapshots(state, { root, config }).ok, true);
  const queuePath = path.join(root, 'docs/tasks/execution-queue.md');
  const original = fs.readFileSync(queuePath, 'utf8');
  assert.match(original, /\]\(task-definitions\/TASK-1\.md\)/);
  fs.writeFileSync(queuePath, original.replace('task-definitions/TASK-1.md', 'nonexistent.md'));
  assert.equal(checkSnapshots(state, { root }).ok, false);
  assert.match(validateState(state, { root, config }).errors.join('\n'), /missing link target/);
  assert.equal(renderSnapshots(state, { root, config }).ok, true);
  assert.equal(checkSnapshots(state, { root }).ok, true);
  state.tasks.push({ ...state.tasks[0], id: 'TASK-2' });
  assert.equal(renderSnapshots(state, { root, config }).written, false);
  assert.equal(fs.readFileSync(queuePath, 'utf8'), original);
});

test('malformed paths report diagnostics and configuration cannot silently disappear', () => {
  const root = fixture(); const state = base();
  state.featureLines[0].coverage = 42;
  const result = validateState(state, { root, config, allowMissingSnapshots: true });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /coverage|paths must be strings/);
  assert.throws(() => readConfig(root), /missing configuration/);
  fs.mkdirSync(path.join(root, '.agents'));
  fs.writeFileSync(path.join(root, '.agents/harness.json'), JSON.stringify({ ...config, documents: 'wrong' }));
  assert.throws(() => readConfig(root), /documents must be an array/);
});

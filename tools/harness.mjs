import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(TOOL_DIR, '..');
const GAME_STATUSES = new Set(['Ready', 'Active', 'Blocked']);
const LINE_STATUSES = new Set(['Active', 'Planned', 'Done']);
const TASK_STATUSES = new Set(['Ready', 'Active', 'Planned', 'Blocked', 'Done']);
const TYPES = new Set(['reverse', 'implementation', 'review']);
const GOVERNANCE_STATUSES = new Set(['Ready', 'Active', 'Blocked', 'Done']);
const REQUIRED_HEADINGS = ['## 目标', '## 输入', '## 范围', '## 输出', '## 验收', '## 停止与拆分'];
const SNAPSHOT_FILES = ['docs/tasks/task-board.md', 'docs/tasks/execution-queue.md'];

function asArray(value) { return Array.isArray(value) ? value : []; }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function add(errors, condition, message) { if (!condition) errors.push(message); }
function unique(values) { return new Set(values).size === values.length; }

export function readConfig(root = DEFAULT_ROOT) {
  const filename = path.join(root, '.agents', 'harness.json');
  if (!fs.existsSync(filename)) throw new Error(`missing configuration: .agents/harness.json`);
  const config = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (!isObject(config) || config.version !== 1) throw new Error(`${path.relative(root, filename)} must use version 1`);
  for (const key of ['requiredFiles', 'entrypoints', 'documents']) if (!Array.isArray(config[key]) || config[key].some(item => typeof item !== 'string' || !item.trim())) throw new Error(`${path.relative(root, filename)}.${key} must be an array of nonblank strings`);
  return config;
}

function withinRoot(root, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath)) return false;
  const resolved = path.resolve(root, relativePath);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`);
}

function documentedFiles(root, config, state) {
  const files = new Set(SNAPSHOT_FILES);
  for (const item of [...asArray(config.requiredFiles), ...asArray(config.entrypoints), ...asArray(config.documents)]) files.add(item);
  for (const line of asArray(state?.featureLines)) if (isObject(line) && line.coverage) files.add(line.coverage);
  for (const task of asArray(state?.tasks)) if (isObject(task) && task.definition) files.add(task.definition);
  for (const item of asArray(state?.governance)) if (isObject(item) && item.definition) files.add(item.definition);
  return [...files];
}

function checkMarkdownLinks(root, files, errors, { allowMissingSnapshots = false } = {}) {
  for (const filename of files) {
    if (!withinRoot(root, filename)) { errors.push(`path escapes workspace root: ${filename}`); continue; }
    if (allowMissingSnapshots && SNAPSHOT_FILES.includes(filename.replaceAll('\\', '/'))) continue;
    const absolute = path.resolve(root, filename);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile() || !filename.toLowerCase().endsWith('.md')) continue;
    const source = fs.readFileSync(absolute, 'utf8');
    const links = source.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g);
    for (const match of links) {
      const target = match[1].trim();
      if (/^(?:[a-z]+:|#|\/\/)/i.test(target)) continue;
      const clean = decodeURIComponent(target.split('#', 1)[0].split('?', 1)[0]);
      if (!clean) continue;
      const linkPath = path.normalize(path.join(path.dirname(filename), clean));
      if (!withinRoot(root, linkPath)) errors.push(`${filename}: link escapes workspace root: ${target}`);
      else if (!fs.existsSync(path.resolve(root, linkPath)) && !(allowMissingSnapshots && SNAPSHOT_FILES.includes(linkPath.replaceAll('\\', '/')))) errors.push(`${filename}: missing link target: ${target}`);
    }
  }
}

function checkDefinition(root, filename, errors) {
  if (!withinRoot(root, filename)) return;
  const absolute = path.resolve(root, filename);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) { errors.push(`missing task definition file: ${filename}`); return; }
  const text = fs.readFileSync(absolute, 'utf8');
  const headings = new Set(text.split(/\r?\n/).map(line => line.trimEnd()));
  for (const heading of REQUIRED_HEADINGS) if (!headings.has(heading)) errors.push(`${filename}: missing heading ${heading}`);
}

function checkCompletion(task, errors) {
  if (task.status !== 'Done') return;
  const completion = task.completion;
  add(errors, isObject(completion), `Done task ${task.id} requires completion`);
  if (!isObject(completion)) return;
  add(errors, typeof completion.summary === 'string' && completion.summary.trim().length > 0, `Done task ${task.id} requires completion.summary`);
  add(errors, asArray(completion.checks).length > 0, `Done task ${task.id} requires completion.checks`);
  add(errors, asArray(completion.evidence).length > 0, `Done task ${task.id} requires completion.evidence`);
  for (const check of asArray(completion.checks)) add(errors, isObject(check) && typeof check.command === 'string' && check.command.trim().length > 0 && check.result === 'passed', `Done task ${task.id} has an invalid completion check`);
  for (const evidence of asArray(completion.evidence)) add(errors, typeof evidence === 'string' && evidence.length > 0, `Done task ${task.id} has invalid completion evidence`);
}

export function validateState(state, { root = DEFAULT_ROOT, config = readConfig(root), allowMissingSnapshots = false } = {}) {
  const errors = [];
  add(errors, isObject(state), 'state must be an object');
  if (!isObject(state)) return { ok: false, errors };
  add(errors, state.version === 1, 'state.version must be 1');
  const lineEntries = asArray(state.featureLines); const taskEntries = asArray(state.tasks); const governanceEntries = asArray(state.governance);
  const lines = lineEntries.filter(isObject); const tasks = taskEntries.filter(isObject); const governance = governanceEntries.filter(isObject);
  add(errors, Array.isArray(state.featureLines), 'featureLines must be an array');
  add(errors, Array.isArray(state.tasks), 'tasks must be an array');
  add(errors, Array.isArray(state.governance), 'governance must be an array');
  add(errors, lines.length === lineEntries.length, 'featureLines contains null or non-object entry');
  add(errors, tasks.length === taskEntries.length, 'tasks contains null or non-object entry');
  add(errors, governance.length === governanceEntries.length, 'governance contains null or non-object entry');
  const lineIds = lines.map(line => line.id); const taskIds = tasks.map(task => task.id); const governanceIds = governance.map(item => item.id);
  add(errors, unique(lineIds), 'feature line IDs must be unique');
  add(errors, unique(taskIds), 'task IDs must be unique');
  add(errors, unique(governanceIds), 'governance IDs must be unique');
  add(errors, unique([...taskIds, ...governanceIds]), 'task and governance IDs must be unique across collections');
  const lineById = new Map(lines.map(line => [line.id, line]));
  const taskById = new Map(tasks.map(task => [task.id, task]));
  for (const line of lines) {
    add(errors, typeof line.id === 'string' && line.id.trim().length > 0 && typeof line.title === 'string' && line.title.trim().length > 0, 'feature lines require nonblank id and title');
    add(errors, isObject(line) && LINE_STATUSES.has(line.status), `invalid feature line status: ${line?.id}`);
    add(errors, typeof line.coverage === 'string' && line.coverage.trim().length > 0, `feature line requires coverage: ${line.id}`);
  }
  for (const task of tasks) {
    add(errors, typeof task.id === 'string' && task.id.trim().length > 0 && typeof task.title === 'string' && task.title.trim().length > 0, 'tasks require nonblank id and title');
    add(errors, typeof task.line === 'string' && lineById.has(task.line), `task ${task.id} references an unknown line`);
    add(errors, TASK_STATUSES.has(task.status), `invalid task status: ${task.id}`);
    add(errors, TYPES.has(task.type), `invalid task type: ${task.id}`);
    add(errors, Array.isArray(task.dependsOn), `task ${task.id} dependsOn must be an array`);
    for (const dependency of asArray(task.dependsOn)) add(errors, taskById.has(dependency), `task ${task.id} has unknown dependency ${dependency}`);
    add(errors, unique(asArray(task.dependsOn)), `task ${task.id} has duplicate dependencies`);
    if (task.status === 'Done') for (const dependency of asArray(task.dependsOn)) add(errors, taskById.get(dependency)?.status === 'Done', `Done task ${task.id} depends on unfinished task ${dependency}`);
    add(errors, typeof task.definition === 'string' && task.definition.trim().length > 0, `task ${task.id} requires definition`);
    add(errors, ('blocker' in task) && (task.blocker === null || typeof task.blocker === 'string'), `task ${task.id} has invalid blocker`);
    if (GAME_STATUSES.has(task.status) && task.status === 'Blocked') add(errors, typeof task.blocker === 'string' && task.blocker.trim().length > 0, `current task ${task.id} requires a nonblank blocker`);
    if (task.status !== 'Blocked') add(errors, task.blocker === null, `non-blocked task ${task.id} must have blocker null`);
    if (task.status !== 'Done') add(errors, task.completion === null, `unfinished task ${task.id} must have completion null`);
    checkCompletion(task, errors);
  }
  for (const item of governance) {
    add(errors, typeof item.id === 'string' && item.id.trim().length > 0 && typeof item.title === 'string' && item.title.trim().length > 0, 'governance items require nonblank id and title');
    add(errors, isObject(item) && GOVERNANCE_STATUSES.has(item.status), `invalid governance status: ${item?.id}`);
    add(errors, typeof item.definition === 'string' && item.definition.trim().length > 0, `governance ${item.id} requires definition`);
    add(errors, ('blocker' in item) && (item.blocker === null || typeof item.blocker === 'string'), `governance ${item.id} has invalid blocker`);
    add(errors, item.status === 'Blocked' ? typeof item.blocker === 'string' && item.blocker.trim().length > 0 : item.blocker === null, `invalid blocker for governance ${item.id}`);
  }
  // Detect dependency cycles with a DFS over task IDs.
  const visiting = new Set(); const visited = new Set();
  const visit = id => { if (visiting.has(id)) { errors.push(`dependency cycle includes ${id}`); return; } if (visited.has(id)) return; visiting.add(id); for (const dep of asArray(taskById.get(id)?.dependsOn)) if (taskById.has(dep)) visit(dep); visiting.delete(id); visited.add(id); };
  for (const id of taskIds) visit(id);
  const unfinished = tasks.filter(task => task.status !== 'Done');
  const unfinishedGame = unfinished.filter(task => TYPES.has(task.type));
  if (unfinishedGame.length > 0) add(errors, lines.filter(line => line.status === 'Active').length === 1, 'exactly one feature line must be Active while tasks are unfinished');
  if (unfinishedGame.length === 0) add(errors, lines.every(line => line.status !== 'Active'), 'no feature line may be Active when all game tasks are Done');
  for (const line of lines.filter(line => line.status === 'Done')) {
    add(errors, tasks.filter(task => task.line === line.id).every(task => task.status === 'Done'), `Done line ${line.id} contains unfinished tasks`);
  }
  for (const task of unfinishedGame.filter(task => GAME_STATUSES.has(task.status))) {
    add(errors, lineById.get(task.line)?.status === 'Active', `current-capable task ${task.id} must belong to Active line`);
    add(errors, asArray(task.dependsOn).every(dep => taskById.get(dep)?.status === 'Done'), `current-capable task ${task.id} has unfinished dependency`);
  }
  const unfinishedGovernance = governance.filter(item => item.status !== 'Done');
  const readyGovernance = unfinishedGovernance.filter(item => GAME_STATUSES.has(item.status));
  add(errors, readyGovernance.length <= 1, 'at most one current governance item is allowed');
  const readyGame = unfinishedGame.filter(task => GAME_STATUSES.has(task.status));
  if (unfinishedGame.length > 0) add(errors, readyGame.length === 1, 'exactly one current game task is required');
  const generated = new Set(SNAPSHOT_FILES);
  for (const filename of documentedFiles(root, config, state)) {
    if (typeof filename !== 'string') { errors.push('document paths must be strings'); continue; }
    if (allowMissingSnapshots && generated.has(filename.replaceAll('\\', '/'))) continue;
    if (!withinRoot(root, filename)) errors.push(`path escapes workspace root: ${filename}`);
    else if (!fs.existsSync(path.resolve(root, filename))) errors.push(`missing required document: ${filename}`);
  }
  for (const task of tasks) if (typeof task.definition === 'string') checkDefinition(root, task.definition, errors);
  for (const item of governance) if (typeof item.definition === 'string') checkDefinition(root, item.definition, errors);
  for (const task of tasks) for (const evidence of asArray(task.completion?.evidence)) if (typeof evidence === 'string') {
    if (!withinRoot(root, evidence) || !fs.existsSync(path.resolve(root, evidence))) errors.push(`Done task ${task.id} evidence is missing or outside root: ${evidence}`);
  }
  checkMarkdownLinks(root, documentedFiles(root, config, state).filter(file => typeof file === 'string' && file.toLowerCase().endsWith('.md')), errors, { allowMissingSnapshots });
  return { ok: errors.length === 0, errors, state };
}

export function selectNext(state) {
  const lines = new Map(asArray(state.featureLines).map(line => [line.id, line]));
  const governance = asArray(state.governance).find(item => item.status !== 'Done' && GAME_STATUSES.has(item.status));
  if (governance) return { kind: 'governance', item: governance, path: governance.definition, blocker: governance.blocker ?? null };
  const tasks = asArray(state.tasks);
  const selected = tasks.find(task => task.status !== 'Done' && GAME_STATUSES.has(task.status) && lines.get(task.line)?.status === 'Active' && asArray(task.dependsOn).every(dep => tasks.find(candidate => candidate.id === dep)?.status === 'Done'));
  if (!selected) return null;
  return { kind: 'game', item: selected, path: selected.definition, blocker: selected.blocker ?? null };
}

function snapshotLines(state) {
  const cell = value => String(value).replaceAll('|', '\\|').replace(/\r?\n/g, '<br>');
  const link = (label, filename) => `[${label}](${encodeURI(path.posix.relative('docs/tasks', filename.replaceAll('\\', '/')))})`;
  const banner = '<!-- AUTO-GENERATED BY tools/harness.mjs; do not edit -->';
  const source = '状态来源：[state.json](state.json)。修改后运行 `npm run generate:harness`。';
  const board = [banner, '# 任务看板', '', source, '', '## 功能线', '', '| ID | 目标 | 状态 | 覆盖合同 |', '| --- | --- | --- | --- |'];
  for (const line of state.featureLines) board.push(`| ${cell(line.id)} | ${cell(line.title)} | ${line.status} | ${link('覆盖', line.coverage)} |`);
  board.push('', '## 任务', '', '| ID | 标题 | 类型 | 功能线 | 状态 | 依赖 | 定义 |', '| --- | --- | --- | --- | --- | --- | --- |');
  for (const task of state.tasks) board.push(`| ${cell(task.id)} | ${cell(task.title)} | ${task.type} | ${cell(task.line)} | ${task.status} | ${cell(task.dependsOn.join(', ') || '—')} | ${link('合同', task.definition)} |`);
  const queue = [banner, '# 执行队列', '', source, '', '当前治理项优先；Blocked 保留当前位置，不跳过。', '', '| 当前项 | 标题 | 类型 | 状态 | 定义 | 阻塞原因 |', '| --- | --- | --- | --- | --- | --- |'];
  const next = selectNext(state);
  queue.push(next ? `| ${cell(next.item.id)} | ${cell(next.item.title)} | ${next.kind} | ${next.item.status} | ${link('合同', next.path)} | ${cell(next.blocker ?? '—')} |` : '| — | 无当前任务；按任务生成协议检查路线并生成下一项 | — | — | [生成协议](../workflow/task-generation.md) | — |');
  return { board: `${board.join('\n')}\n`, queue: `${queue.join('\n')}\n` };
}

export function renderSnapshots(state, { root = DEFAULT_ROOT, config = readConfig(root) } = {}) {
  const validation = validateState(state, { root, config, allowMissingSnapshots: true });
  if (!validation.ok) return { ...validation, written: false };
  const snapshots = snapshotLines(state);
  const outputDir = path.join(root, 'docs', 'tasks'); fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'task-board.md'), snapshots.board, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'execution-queue.md'), snapshots.queue, 'utf8');
  const finalCheck = validateState(state, { root, config });
  if (!finalCheck.ok) return { ...finalCheck, written: true, ...snapshots };
  return { ok: true, errors: [], written: true, ...snapshots };
}

export function checkSnapshots(state, { root = DEFAULT_ROOT } = {}) {
  const expected = snapshotLines(state);
  const errors = [];
  for (const [filename, content] of [['docs/tasks/task-board.md', expected.board], ['docs/tasks/execution-queue.md', expected.queue]]) {
    const actualPath = path.join(root, filename);
    if (!fs.existsSync(actualPath)) errors.push(`missing generated snapshot: ${filename}`);
    else if (fs.readFileSync(actualPath, 'utf8') !== content) errors.push(`${filename} is stale; run render`);
  }
  return { ok: errors.length === 0, errors };
}

function loadState(root) { return JSON.parse(fs.readFileSync(path.join(root, 'docs', 'tasks', 'state.json'), 'utf8')); }
function usage() { console.error('Usage: node tools/harness.mjs check|render|next'); }

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const command = process.argv[2];
  try {
    const root = DEFAULT_ROOT; const config = readConfig(root); const state = loadState(root);
    if (command === 'check') {
      const result = validateState(state, { root, config });
      if (result.ok) { const snapshots = checkSnapshots(state, { root }); result.errors.push(...snapshots.errors); result.ok = result.errors.length === 0; }
      if (!result.ok) { console.error(result.errors.join('\n')); process.exitCode = 1; } else console.log('OK');
    } else if (command === 'render') {
      const result = renderSnapshots(state, { root, config });
      if (!result.ok) { console.error(result.errors.join('\n')); process.exitCode = 1; } else console.log('Rendered docs/tasks/task-board.md and docs/tasks/execution-queue.md');
    } else if (command === 'next') {
      const result = validateState(state, { root, config, allowMissingSnapshots: true });
      if (!result.ok) { console.error(result.errors.join('\n')); process.exitCode = 1; }
      else { const next = selectNext(state); console.log(next ? `${next.kind}\t${next.item.id}\t${next.item.title}\t${next.path}\t${next.item.status}\t${next.blocker ?? '—'}` : 'NEEDS_TASK\t无当前任务；按 docs/workflow/task-generation.md 自主检查路线并生成下一项'); }
    } else { usage(); process.exitCode = 2; }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

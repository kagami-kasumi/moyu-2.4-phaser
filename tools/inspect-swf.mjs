#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { inspectSwf } from './lib/swf.mjs';

const args = process.argv.slice(2);
const check = args.includes('--check');
const flags = args.filter(a => a.startsWith('--'));
if (flags.some(a => a !== '--check') || flags.filter(a => a === '--check').length > 1) {
  console.error('usage: node tools/inspect-swf.mjs [--check] [input.swf] [output.json]');
  process.exit(2);
}
const positional = args.filter(a => !a.startsWith('--'));
if (positional.length > 2) {
  console.error('usage: node tools/inspect-swf.mjs [--check] [input.swf] [output.json]');
  process.exit(2);
}
const input = positional[0] ?? '魔域2.4.swf';
const output = positional[1] ?? 'docs/reference/swf-inventory.json';
try {
  if (!check && path.resolve(input) === path.resolve(output)) throw new Error('refusing to overwrite input SWF');
  const inventory = inspectSwf(fs.readFileSync(input));
  const rendered = `${JSON.stringify(inventory, null, 2)}\n`;
  if (check) {
    const existing = fs.readFileSync(output, 'utf8');
    if (existing !== rendered) { console.error(`SWF inventory is stale: ${output}`); process.exitCode = 1; }
    else console.log(`SWF inventory is current: ${output}`);
  } else {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, rendered);
    console.log(`Wrote ${output}`);
  }
} catch (error) { console.error(`inspect-swf: ${error.message}`); process.exitCode = 1; }

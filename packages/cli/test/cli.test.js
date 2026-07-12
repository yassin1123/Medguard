import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, run } from '../src/cli.js';

test('parseArgs collects drug names', () => {
  const opts = parseArgs(['warfarin', 'aspirin']);
  assert.deepEqual(opts.drugs, ['warfarin', 'aspirin']);
});

test('parseArgs reads --data path', () => {
  const opts = parseArgs(['--data', 'foo.json', 'x', 'y']);
  assert.equal(opts.data, 'foo.json');
  assert.deepEqual(opts.drugs, ['x', 'y']);
});

test('parseArgs recognises flags', () => {
  assert.equal(parseArgs(['--help']).help, true);
  assert.equal(parseArgs(['-v']).version, true);
  assert.equal(parseArgs(['--list']).list, true);
});

function capture() {
  const out = [];
  return { io: { log: (s) => out.push(String(s)), error: (s) => out.push(String(s)) }, out };
}

test('run --help prints usage and exits 0', async () => {
  const { io, out } = capture();
  const code = await run(['--help'], io);
  assert.equal(code, 0);
  assert.ok(out.join('\n').includes('Usage'));
});

test('run requires at least two drugs', async () => {
  const { io, out } = capture();
  const code = await run(['warfarin'], io);
  assert.equal(code, 1);
  assert.ok(out.join('\n').toLowerCase().includes('at least two'));
});

test('run exits 2 when an alarming interaction is found', async () => {
  const { io } = capture();
  const code = await run(['warfarin', 'aspirin'], io);
  assert.equal(code, 2);
});

test('run exits 0 for a clean combination', async () => {
  const { io } = capture();
  const code = await run(['warfarin', 'metformin'], io);
  assert.equal(code, 0);
});

test('run --list shows the dataset', async () => {
  const { io, out } = capture();
  const code = await run(['--list'], io);
  assert.equal(code, 0);
  assert.ok(out.join('\n').includes('Warfarin'));
});

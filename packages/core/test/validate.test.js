import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDataset } from '../src/validate.js';

const good = {
  meta: { source: 's', version: '1', updated: '2026-01-01' },
  drugs: [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
  ],
  interactions: [
    { a: 'a', b: 'b', severity: 'minor', summary: 'ok' },
  ],
};

test('accepts a well-formed dataset', () => {
  const r = validateDataset(good);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('rejects non-objects', () => {
  assert.equal(validateDataset(null).ok, false);
  assert.equal(validateDataset('nope').ok, false);
});

test('flags duplicate drug ids', () => {
  const r = validateDataset({
    ...good,
    drugs: [
      { id: 'a', name: 'A' },
      { id: 'a', name: 'Also A' },
    ],
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('Duplicate drug id')));
});

test('flags interactions referencing unknown drugs', () => {
  const r = validateDataset({
    ...good,
    interactions: [{ a: 'a', b: 'zzz', severity: 'minor', summary: 'x' }],
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('unknown drug')));
});

test('flags invalid severity', () => {
  const r = validateDataset({
    ...good,
    interactions: [{ a: 'a', b: 'b', severity: 'huge', summary: 'x' }],
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('severity')));
});

test('flags self-interactions', () => {
  const r = validateDataset({
    ...good,
    interactions: [{ a: 'a', b: 'a', severity: 'minor', summary: 'x' }],
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('itself')));
});

test('collects multiple errors at once', () => {
  const r = validateDataset({ meta: {}, drugs: 'no', interactions: 'no' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.length >= 3);
});

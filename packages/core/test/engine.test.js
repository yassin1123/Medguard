import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InteractionEngine } from '../src/engine.js';

const dataset = {
  meta: { source: 'test', version: '1', updated: '2026-01-01' },
  drugs: [
    { id: 'warfarin', name: 'Warfarin', aliases: ['Coumadin'] },
    { id: 'aspirin', name: 'Aspirin', aliases: ['ASA'] },
    { id: 'ibuprofen', name: 'Ibuprofen', aliases: ['Advil'] },
    { id: 'metformin', name: 'Metformin' },
  ],
  interactions: [
    { a: 'warfarin', b: 'aspirin', severity: 'major', summary: 'bleeding' },
    { a: 'aspirin', b: 'ibuprofen', severity: 'moderate', summary: 'stomach' },
  ],
};

function engine() {
  return new InteractionEngine(dataset);
}

test('constructor validates by default', () => {
  assert.throws(() => new InteractionEngine({ drugs: [], interactions: 'x' }));
});

test('resolve matches by primary name', () => {
  assert.equal(engine().resolve('Warfarin'), 'warfarin');
});

test('resolve matches by alias, case-insensitively', () => {
  assert.equal(engine().resolve('coumadin'), 'warfarin');
  assert.equal(engine().resolve('ADVIL'), 'ibuprofen');
});

test('resolve tolerates minor typos', () => {
  assert.equal(engine().resolve('warfrin'), 'warfarin');
});

test('resolve returns null for gibberish', () => {
  assert.equal(engine().resolve('qqqzzz123'), null);
});

test('getInteraction is order-independent', () => {
  const e = engine();
  const ab = e.getInteraction('warfarin', 'aspirin');
  const ba = e.getInteraction('aspirin', 'warfarin');
  assert.equal(ab, ba);
  assert.equal(ab.severity, 'major');
});

test('getInteraction returns null when no interaction exists', () => {
  assert.equal(engine().getInteraction('warfarin', 'metformin'), null);
});

test('check finds all interacting pairs', () => {
  const result = engine().check(['Warfarin', 'Aspirin', 'Advil']);
  assert.equal(result.findings.length, 2);
});

test('check sorts findings most serious first', () => {
  const result = engine().check(['Warfarin', 'Aspirin', 'Advil']);
  assert.equal(result.findings[0].interaction.severity, 'major');
  assert.equal(result.findings[1].interaction.severity, 'moderate');
});

test('check separates unresolved input with suggestions', () => {
  const result = engine().check(['Warfarin', 'notadrug']);
  assert.equal(result.resolved.length, 1);
  assert.equal(result.unresolved.length, 1);
  assert.ok(Array.isArray(result.unresolved[0].suggestions));
});

test('suggest returns display names ranked by closeness', () => {
  const names = engine().suggest('warfarn');
  assert.ok(names.includes('Warfarin'));
});

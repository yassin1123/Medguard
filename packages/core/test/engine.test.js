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

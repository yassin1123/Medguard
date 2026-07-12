import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  severityRank,
  compareSeverityDesc,
  isAlarming,
  SEVERITY_ORDER,
} from '../src/severity.js';

test('severity ranks increase with seriousness', () => {
  assert.ok(severityRank('minor') < severityRank('moderate'));
  assert.ok(severityRank('moderate') < severityRank('major'));
  assert.ok(severityRank('major') < severityRank('contraindicated'));
});

test('unknown severity throws', () => {
  assert.throws(() => severityRank('catastrophic'));
});

test('compareSeverityDesc sorts most serious first', () => {
  const arr = ['minor', 'contraindicated', 'moderate', 'major'];
  arr.sort(compareSeverityDesc);
  assert.deepEqual(arr, ['contraindicated', 'major', 'moderate', 'minor']);
});

test('isAlarming flags major and above only', () => {
  assert.equal(isAlarming('minor'), false);
  assert.equal(isAlarming('moderate'), false);
  assert.equal(isAlarming('major'), true);
  assert.equal(isAlarming('contraindicated'), true);
});

test('order array is the four known levels', () => {
  assert.deepEqual(SEVERITY_ORDER, [
    'minor',
    'moderate',
    'major',
    'contraindicated',
  ]);
});

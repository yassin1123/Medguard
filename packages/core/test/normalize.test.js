import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, levenshtein } from '../src/normalize.js';

test('normalize lowercases and trims', () => {
  assert.equal(normalize('  Advil  '), 'advil');
});

test('normalize strips symbols and diacritics', () => {
  assert.equal(normalize('Tylenol®'), 'tylenol');
  assert.equal(normalize('Növariant'), 'novariant');
});

test('normalize collapses internal whitespace and hyphens', () => {
  assert.equal(normalize('acetyl - salicylic   acid'), 'acetyl salicylic acid');
});

test('normalize handles non-strings gracefully', () => {
  assert.equal(normalize(null), '');
  assert.equal(normalize(undefined), '');
  assert.equal(normalize(42), '');
});

test('levenshtein basic distances', () => {
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('advil', 'advil'), 0);
  assert.equal(levenshtein('', 'abc'), 3);
  assert.equal(levenshtein('abc', ''), 3);
});

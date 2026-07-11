/**
 * Dataset validation. We validate at load time so that a malformed dataset
 * fails loudly with a helpful message, rather than producing silently wrong
 * results downstream — which for this kind of tool would be dangerous.
 */

import { SEVERITY_ORDER } from './severity.js';

/** @typedef {import('./severity.js').Severity} Severity */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} ok
 * @property {string[]} errors
 */

/**
 * Validate a raw dataset object against MedGuard's expectations.
 * Returns every problem it finds rather than throwing on the first one, so a
 * data maintainer can fix them all in one pass.
 * @param {unknown} dataset
 * @returns {ValidationResult}
 */
export function validateDataset(dataset) {
  /** @type {string[]} */
  const errors = [];

  if (dataset === null || typeof dataset !== 'object') {
    return { ok: false, errors: ['Dataset must be an object.'] };
  }

  const { meta, drugs, interactions } = /** @type {any} */ (dataset);

  if (!meta || typeof meta !== 'object') {
    errors.push('Missing "meta" object.');
  } else {
    for (const key of ['source', 'version', 'updated']) {
      if (typeof meta[key] !== 'string') {
        errors.push(`meta.${key} must be a string.`);
      }
    }
  }

  const drugIds = new Set();
  if (!Array.isArray(drugs)) {
    errors.push('"drugs" must be an array.');
  } else {
    drugs.forEach((drug, i) => {
      if (!drug || typeof drug !== 'object') {
        errors.push(`drugs[${i}] must be an object.`);
        return;
      }
      if (typeof drug.id !== 'string' || drug.id === '') {
        errors.push(`drugs[${i}].id must be a non-empty string.`);
      } else if (drugIds.has(drug.id)) {
        errors.push(`Duplicate drug id "${drug.id}".`);
      } else {
        drugIds.add(drug.id);
      }
      if (typeof drug.name !== 'string' || drug.name === '') {
        errors.push(`drugs[${i}].name must be a non-empty string.`);
      }
      if (drug.aliases !== undefined && !Array.isArray(drug.aliases)) {
        errors.push(`drugs[${i}].aliases must be an array when present.`);
      }
    });
  }

  if (!Array.isArray(interactions)) {
    errors.push('"interactions" must be an array.');
  } else {
    interactions.forEach((ix, i) => {
      if (!ix || typeof ix !== 'object') {
        errors.push(`interactions[${i}] must be an object.`);
        return;
      }
      for (const key of ['a', 'b']) {
        if (typeof ix[key] !== 'string') {
          errors.push(`interactions[${i}].${key} must be a drug id string.`);
        } else if (drugIds.size && !drugIds.has(ix[key])) {
          errors.push(`interactions[${i}].${key} references unknown drug "${ix[key]}".`);
        }
      }
      if (ix.a === ix.b && typeof ix.a === 'string') {
        errors.push(`interactions[${i}] links a drug to itself ("${ix.a}").`);
      }
      if (!SEVERITY_ORDER.includes(ix.severity)) {
        errors.push(
          `interactions[${i}].severity must be one of ${SEVERITY_ORDER.join(', ')}.`
        );
      }
      if (typeof ix.summary !== 'string' || ix.summary === '') {
        errors.push(`interactions[${i}].summary must be a non-empty string.`);
      }
    });
  }

  return { ok: errors.length === 0, errors };
}

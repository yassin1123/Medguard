/**
 * The interaction engine.
 *
 * Design goals:
 *  - Pure and deterministic: same dataset in, same answers out. No I/O here.
 *  - Fast lookups: we build indexes once at construction, then every query is
 *    a hash lookup rather than a scan.
 *  - Forgiving input: users can type brand names, aliases, or slightly-off
 *    spellings and still get matched.
 */

import { normalize, levenshtein } from './normalize.js';
import { validateDataset } from './validate.js';
import { compareSeverityDesc } from './severity.js';

/** @typedef {import('./severity.js').Severity} Severity */

/**
 * @typedef {Object} Drug
 * @property {string} id
 * @property {string} name
 * @property {string[]} [aliases]
 * @property {string} [class]
 */

/**
 * @typedef {Object} Interaction
 * @property {string} a
 * @property {string} b
 * @property {Severity} severity
 * @property {string} summary
 * @property {string} [advice]
 */

/** Unordered key for a drug pair, so (a,b) and (b,a) collide intentionally. */
function pairKey(id1, id2) {
  return id1 < id2 ? `${id1}\u0000${id2}` : `${id2}\u0000${id1}`;
}

export class InteractionEngine {
  /**
   * @param {{drugs: Drug[], interactions: Interaction[], meta?: object}} dataset
   * @param {{validate?: boolean}} [options]
   */
  constructor(dataset, options = {}) {
    const { validate = true } = options;
    if (validate) {
      const result = validateDataset(dataset);
      if (!result.ok) {
        throw new Error(
          `Invalid dataset:\n  - ${result.errors.join('\n  - ')}`
        );
      }
    }

    this.meta = dataset.meta ?? {};
    /** @type {Drug[]} */
    this.drugs = dataset.drugs;
    /** @type {Interaction[]} */
    this.interactions = dataset.interactions;

    /** id -> Drug */
    this._byId = new Map();
    /** normalized name/alias -> id */
    this._byName = new Map();
    /** pairKey -> Interaction */
    this._byPair = new Map();

    this._buildIndexes();
  }

  _buildIndexes() {
    for (const drug of this.drugs) {
      this._byId.set(drug.id, drug);
      this._byName.set(normalize(drug.name), drug.id);
      this._byName.set(normalize(drug.id), drug.id);
      for (const alias of drug.aliases ?? []) {
        this._byName.set(normalize(alias), drug.id);
      }
    }
    for (const ix of this.interactions) {
      this._byPair.set(pairKey(ix.a, ix.b), ix);
    }
  }

}

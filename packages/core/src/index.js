/**
 * @medguard/core — public API.
 *
 * Frontends should import from here rather than reaching into individual
 * modules, so internal structure can change without breaking consumers.
 */

export { InteractionEngine } from './engine.js';
export { validateDataset } from './validate.js';
export { normalize, levenshtein } from './normalize.js';
export {
  SEVERITY_ORDER,
  SEVERITY_META,
  severityRank,
  compareSeverityDesc,
  isAlarming,
} from './severity.js';

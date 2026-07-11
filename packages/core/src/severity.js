/**
 * The four severity levels MedGuard recognises, ordered from least to most
 * serious. Keeping this as the single source of truth means the CLI, the web
 * UI, and the sorting logic never disagree about what "major" means.
 */

/** @typedef {'minor'|'moderate'|'major'|'contraindicated'} Severity */

/** Ordered least-serious first. Index doubles as a numeric rank. */
export const SEVERITY_ORDER = /** @type {const} */ ([
  'minor',
  'moderate',
  'major',
  'contraindicated',
]);

export function severityRank(severity) {
  const rank = SEVERITY_ORDER.indexOf(severity);
  if (rank === -1) throw new Error(`Unknown severity: ${severity}`);
  return rank;
}

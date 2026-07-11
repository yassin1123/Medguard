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

/** Human-facing metadata for each level, used by frontends for labels/colours. */
export const SEVERITY_META = {
  minor: {
    label: 'Minor',
    tone: 'info',
    blurb: 'Usually not a problem, but worth being aware of.',
  },
  moderate: {
    label: 'Moderate',
    tone: 'warn',
    blurb: 'Can matter for some people. Worth checking with a professional.',
  },
  major: {
    label: 'Major',
    tone: 'danger',
    blurb: 'Potentially serious. Get medical advice before combining.',
  },
  contraindicated: {
    label: 'Do not combine',
    tone: 'critical',
    blurb: 'These should not be taken together.',
  },
};

/**
 * Numeric rank for a severity, higher = more serious.
 * @param {Severity} severity
 * @returns {number}
 */
export function severityRank(severity) {
  const rank = SEVERITY_ORDER.indexOf(severity);
  if (rank === -1) throw new Error(`Unknown severity: ${severity}`);
  return rank;
}

/**
 * Compare two severities. Sorts most-serious first when used with Array.sort.
 * @param {Severity} a
 * @param {Severity} b
 * @returns {number}
 */
export function compareSeverityDesc(a, b) {
  return severityRank(b) - severityRank(a);
}

/**
 * Whether a severity is one a user should be actively warned about.
 * @param {Severity} severity
 * @returns {boolean}
 */
export function isAlarming(severity) {
  return severityRank(severity) >= severityRank('major');
}

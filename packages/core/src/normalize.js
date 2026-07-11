/**
 * Text normalisation. Real-world drug input is messy: users type "Advil ",
 * "ADVIL", "advil®". We reduce everything to a canonical comparable form so
 * that lookups are forgiving without being wrong.
 */

/**
 * Lower-cases, trims, strips punctuation/symbols, and collapses whitespace.
 * @param {string} text
 * @returns {string}
 */
export function normalize(text) {
  if (typeof text !== 'string') return '';
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ') // drop symbols like ® / ™
    .replace(/[-\s]+/g, ' ')
    .trim();
}

/**
 * A cheap edit-distance used only for "did you mean" suggestions. Not on the
 * hot path, so clarity beats micro-optimisation.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

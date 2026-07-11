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

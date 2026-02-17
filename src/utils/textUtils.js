/**
 * Text utilities — validation, formatting, and content helpers.
 */

/**
 * Count words in a string.
 */
function wordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Check if text contains em dashes (prohibited by style guide).
 * Returns array of positions where em dashes are found.
 */
function findEmDashes(text) {
  if (!text) return [];
  const positions = [];
  const emDash = '\u2014';
  let idx = text.indexOf(emDash);
  while (idx !== -1) {
    positions.push(idx);
    idx = text.indexOf(emDash, idx + 1);
  }
  // Also check for double hyphens (common em dash substitute)
  idx = text.indexOf('--');
  while (idx !== -1) {
    positions.push(idx);
    idx = text.indexOf('--', idx + 2);
  }
  return positions;
}

/**
 * Validate bio text against production rules.
 * @returns {Object} { valid, warnings, errors }
 */
function validateBio(text) {
  const result = { valid: true, warnings: [], errors: [] };

  if (!text || !text.trim()) {
    result.valid = false;
    result.errors.push('Bio text is required');
    return result;
  }

  const words = wordCount(text);

  if (words < 60) {
    result.warnings.push(`Bio is ${words} words (minimum recommended: 60)`);
  }
  if (words > 120) {
    result.warnings.push(`Bio is ${words} words (maximum recommended: 120)`);
  }

  const emDashes = findEmDashes(text);
  if (emDashes.length > 0) {
    result.warnings.push(`Found ${emDashes.length} em dash(es) — use commas, periods, or en dashes instead`);
  }

  return result;
}

/**
 * Format dates with en dash separator.
 */
function formatDates(birthYear, deathYear) {
  if (!birthYear) return '';
  if (!deathYear) return String(birthYear) + ' \u2013 Present';
  return String(birthYear) + ' \u2013 ' + String(deathYear);
}

/**
 * Wrap a quote in curly double quotes.
 */
function formatQuote(quote) {
  if (!quote) return '';
  // Strip existing quotes
  let q = quote.replace(/^["'\u201C\u201D\u2018\u2019]+/, '').replace(/["'\u201C\u201D\u2018\u2019]+$/, '').trim();
  return '\u201C' + q + '\u201D';
}

/**
 * Format attribution with middle dots.
 * Input: "Author | Philologist | Professor" or "Author, Philologist, Professor"
 * Output: "Author · Philologist · Professor"
 */
function formatAttribution(attr) {
  if (!attr) return '';
  return attr
    .split(/\s*[|,]\s*/)
    .filter(s => s.trim())
    .join(' \u00B7 ');
}

module.exports = {
  wordCount,
  findEmDashes,
  validateBio,
  formatDates,
  formatQuote,
  formatAttribution
};

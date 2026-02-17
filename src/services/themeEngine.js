/**
 * Theme Engine — resolves category + subcategory + team/branch into a complete visual spec.
 *
 * Usage:
 *   const spec = resolveTheme({ category: 'sports', team: 'Chicago Bears' });
 *   // Returns full theme with team colors overlaid
 */

const themes = require('../data/themes');
const typography = require('../data/typography');
const fs = require('fs');
const path = require('path');

// Cache loaded color databases
const colorDbCache = {};

function loadColorDb(dbName) {
  if (colorDbCache[dbName]) return colorDbCache[dbName];
  const filePath = path.join(__dirname, '..', 'data', 'colors', `${dbName}.json`);
  if (!fs.existsSync(filePath)) return null;
  colorDbCache[dbName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return colorDbCache[dbName];
}

/**
 * Darken a hex color by a factor (0-1, where 0 = black, 1 = unchanged).
 */
function darkenHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return '#' + [r, g, b].map(c =>
    Math.round(c * factor).toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Lighten a hex color by mixing with white.
 * amount: 0 = unchanged, 1 = white.
 */
function lightenHex(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return '#' + [r, g, b].map(c =>
    Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Convert hex to rgba string.
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Resolve a complete visual spec for a hero piece.
 *
 * @param {Object} opts
 * @param {string} opts.category - military|sports|historical|national|music|personal
 * @param {string} [opts.subcategory] - genre, branch type, etc.
 * @param {string} [opts.team] - team name (sports) or branch (military) or country (national)
 * @param {string} [opts.colorDb] - which color database to use (nfl, military, etc.)
 * @returns {Object} Complete visual spec
 */
function resolveTheme(opts) {
  const { category, subcategory, team, colorDb } = opts;
  const baseTheme = themes[category];

  if (!baseTheme) {
    throw new Error(`Unknown category: ${category}`);
  }

  // Start with the base theme (deep clone)
  const spec = JSON.parse(JSON.stringify(baseTheme));

  // Add typography
  spec.typography = {
    display: typography.display[category] || typography.display.military,
    body: typography.body[category] || typography.body.military,
    quote: typography.quote[category] || typography.quote.military,
    sizes: typography.sizes,
    rules: typography.rules
  };

  // Handle music subcategories
  if (category === 'music' && subcategory) {
    const musicKey = `music-${subcategory.toLowerCase()}`;
    if (typography.display[musicKey]) {
      spec.typography.display = typography.display[musicKey];
    }

    // Classical music gets light bio panel
    if (subcategory.toLowerCase() === 'classical') {
      spec.bio.background = 'linear-gradient(160deg, #f8f4ee 0%, #f0ebe0 50%, #e8e2d4 100%)';
      spec.bio.nameColor = '#2a1e14';
      spec.bio.textColor = '#3a2e22';
      spec.bio.quoteColor = '#3a2e22';
      spec.bio.attributionColor = '#8a7e6e';
    }
  }

  // Overlay team/branch/flag colors
  if (team && colorDb) {
    const db = loadColorDb(colorDb);
    if (db && db[team]) {
      const colors = db[team];
      overlayTeamColors(spec, category, colors);
    }
  }

  return spec;
}

/**
 * Overlay team/branch/flag colors onto the base theme.
 */
function overlayTeamColors(spec, category, colors) {
  const { primary, secondary, tertiary } = colors;

  switch (category) {
    case 'sports':
      // Frame accent uses team primary
      spec.frame.border = `linear-gradient(145deg, ${darkenHex(primary, 0.3)}, ${darkenHex(primary, 0.4)} 15%, #111 40%, ${darkenHex(primary, 0.35)} 70%, #0a0a0a)`;
      // Mat stays dark but with subtle team tint
      spec.mat.background = darkenHex(primary, 0.08);
      // Bio panel uses team color subtly
      spec.bio.background = `linear-gradient(160deg, #f8f6f2 0%, ${lightenHex(primary, 0.92)} 50%, #e8e2d8 100%)`;
      spec.bio.divider = `linear-gradient(90deg, transparent, ${primary}, transparent)`;
      // Accent color is team primary
      spec.accent = primary;
      spec.accentSecondary = secondary;
      break;

    case 'military':
      // Subtle branch accent in mat color
      spec.mat.background = darkenHex(primary, 0.1);
      spec.bio.divider = `linear-gradient(90deg, transparent, ${lightenHex(primary, 0.3)}, transparent)`;
      spec.accent = primary;
      spec.accentSecondary = secondary;
      break;

    case 'national':
      // Flag colors influence mat and bio
      spec.mat.background = darkenHex(primary, 0.12);
      spec.bio.divider = `linear-gradient(90deg, transparent, ${primary}, transparent)`;
      spec.accent = primary;
      spec.accentSecondary = secondary;
      break;

    default:
      spec.accent = primary;
      break;
  }
}

/**
 * Get a list of available color databases.
 */
function getColorDatabases() {
  const colorDir = path.join(__dirname, '..', 'data', 'colors');
  return fs.readdirSync(colorDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

module.exports = {
  resolveTheme,
  getColorDatabases,
  loadColorDb,
  darkenHex,
  lightenHex,
  hexToRgba
};

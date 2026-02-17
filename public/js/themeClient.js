/**
 * Theme Client — client-side theme data and resolution for instant preview updates.
 * Mirror of the server-side theme engine, loaded once at startup.
 */

window.ThemeClient = (function() {
  let themes = null;
  let typography = null;
  let colorDbs = {};

  async function init() {
    const [themesRes, typoRes, colorsRes] = await Promise.all([
      fetch('/api/themes').then(r => r.json()),
      fetch('/api/typography').then(r => r.json()),
      fetch('/api/colors').then(r => r.json())
    ]);

    themes = themesRes;
    typography = typoRes;

    // Pre-load all color databases
    for (const db of colorsRes) {
      colorDbs[db] = await fetch(`/api/colors/${db}`).then(r => r.json());
    }
  }

  /**
   * Resolve a complete visual spec, hitting the server API.
   */
  async function resolveTheme(opts) {
    const res = await fetch('/api/themes/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts)
    });
    return res.json();
  }

  /**
   * Get the full theme for a category (from the server).
   */
  async function getTheme(category) {
    const res = await fetch(`/api/themes/${category}`);
    return res.json();
  }

  /**
   * Get teams/branches/countries from a color database.
   */
  function getColorDb(name) {
    return colorDbs[name] || null;
  }

  /**
   * Get list of entries in a color database.
   */
  function getColorDbEntries(name) {
    const db = colorDbs[name];
    if (!db) return [];
    return Object.keys(db).sort();
  }

  /**
   * Get available color databases.
   */
  function getColorDatabases() {
    return Object.keys(colorDbs);
  }

  /**
   * Get all category names.
   */
  function getCategories() {
    return themes ? Object.keys(themes) : [];
  }

  /**
   * Get category label.
   */
  function getCategoryLabel(key) {
    return themes && themes[key] ? themes[key].label : key;
  }

  /**
   * Get subcategory options for a given category.
   */
  function getSubcategories(category) {
    const subs = {
      military: [],
      sports: [
        { value: 'nfl', label: 'NFL Football' },
        { value: 'nba', label: 'NBA Basketball' },
        { value: 'mlb', label: 'MLB Baseball' },
        { value: 'nhl', label: 'NHL Hockey' },
        { value: 'college', label: 'College' },
        { value: 'international', label: 'International' },
        { value: 'other', label: 'Other Sport' }
      ],
      historical: [
        { value: 'author', label: 'Author / Writer' },
        { value: 'scientist', label: 'Scientist' },
        { value: 'explorer', label: 'Explorer' },
        { value: 'leader', label: 'Leader / Statesperson' },
        { value: 'inventor', label: 'Inventor' },
        { value: 'other', label: 'Other' }
      ],
      national: [],
      music: [
        { value: 'rock', label: 'Rock / Metal' },
        { value: 'classical', label: 'Classical' },
        { value: 'jazz', label: 'Jazz / Blues' },
        { value: 'hiphop', label: 'Hip-Hop / R&B' },
        { value: 'country', label: 'Country / Folk' },
        { value: 'other', label: 'Other' }
      ],
      personal: []
    };
    return subs[category] || [];
  }

  /**
   * Map category + subcategory to the appropriate color database.
   */
  function getColorDbForCategory(category, subcategory) {
    if (category === 'military') return 'military';
    if (category === 'sports') {
      if (subcategory === 'nfl') return 'nfl';
      if (subcategory === 'nba') return 'nba';
      if (subcategory === 'mlb') return 'mlb';
      if (subcategory === 'nhl') return 'nhl';
      return null;
    }
    return null;
  }

  return {
    init,
    resolveTheme,
    getTheme,
    getColorDb,
    getColorDbEntries,
    getColorDatabases,
    getCategories,
    getCategoryLabel,
    getSubcategories,
    getColorDbForCategory
  };
})();

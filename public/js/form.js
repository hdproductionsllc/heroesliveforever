/**
 * Form Controller — manages cascading fields, validation, and change events.
 */

window.Form = (function() {
  let onChangeCallback = null;

  // DOM references
  const els = {};

  function init(onChange) {
    onChangeCallback = onChange;
    cacheElements();
    setupListeners();
    updateCascadingFields();
    updateLayoutOptions();
    updateWordCount();
  }

  function cacheElements() {
    els.name = document.getElementById('hero-name');
    els.birthYear = document.getElementById('birth-year');
    els.deathYear = document.getElementById('death-year');
    els.category = document.getElementById('category');
    els.subcategoryField = document.getElementById('subcategory-field');
    els.subcategory = document.getElementById('subcategory');
    els.colorDbField = document.getElementById('color-db-field');
    els.colorDb = document.getElementById('color-db');
    els.teamField = document.getElementById('team-field');
    els.team = document.getElementById('team');
    els.frameSize = document.getElementById('frame-size');
    els.panelLayout = document.getElementById('panel-layout');
    els.bio = document.getElementById('bio-text');
    els.quote = document.getElementById('quote');
    els.attribution = document.getElementById('attribution');
    els.heroCaption = document.getElementById('hero-caption');
    els.secondaryCaption = document.getElementById('secondary-caption');
    els.tertiaryCaption = document.getElementById('tertiary-caption');
    els.tertiarySection = document.getElementById('tertiary-section');
    els.wordCount = document.getElementById('word-count');
    els.bioWarnings = document.getElementById('bio-warnings');
  }

  function setupListeners() {
    // All text inputs trigger preview update
    const textInputs = [els.name, els.birthYear, els.deathYear, els.bio, els.quote,
                        els.attribution, els.heroCaption, els.secondaryCaption, els.tertiaryCaption];
    for (const input of textInputs) {
      if (input) input.addEventListener('input', debounce(notifyChange, 150));
    }

    // Category change → update cascading fields + theme
    els.category.addEventListener('change', () => {
      updateCascadingFields();
      notifyChange();
    });

    // Subcategory change → update color DB options
    els.subcategory.addEventListener('change', () => {
      updateColorDbField();
      notifyChange();
    });

    // Color DB change → update team list
    els.colorDb.addEventListener('change', () => {
      updateTeamList();
      notifyChange();
    });

    // Team change → update theme
    els.team.addEventListener('change', notifyChange);

    // Frame size change → update layout options + preview
    els.frameSize.addEventListener('change', () => {
      updateLayoutOptions();
      notifyChange();
    });

    // Layout change → update preview + show/hide tertiary
    els.panelLayout.addEventListener('change', () => {
      updateTertiaryVisibility();
      notifyChange();
    });

    // Bio text → word count + validation
    els.bio.addEventListener('input', () => {
      updateWordCount();
      validateBioText();
    });
  }

  /**
   * Update which cascading fields are visible based on category.
   */
  function updateCascadingFields() {
    const category = els.category.value;
    const subcategories = ThemeClient.getSubcategories(category);

    // Subcategory
    if (subcategories.length > 0) {
      els.subcategoryField.style.display = '';
      els.subcategory.innerHTML = '<option value="">— Select —</option>';
      for (const sub of subcategories) {
        const opt = document.createElement('option');
        opt.value = sub.value;
        opt.textContent = sub.label;
        els.subcategory.appendChild(opt);
      }
    } else {
      els.subcategoryField.style.display = 'none';
      els.subcategory.value = '';
    }

    // Color DB — show if category uses one
    updateColorDbField();
  }

  function updateColorDbField() {
    const category = els.category.value;
    const subcategory = els.subcategory.value;
    const dbName = ThemeClient.getColorDbForCategory(category, subcategory);

    if (dbName) {
      els.colorDbField.style.display = 'none'; // Auto-select, don't show
      els.colorDb.value = dbName;
      updateTeamList();
    } else if (category === 'military') {
      els.colorDbField.style.display = 'none';
      els.colorDb.value = 'military';
      updateTeamList();
    } else {
      els.colorDbField.style.display = 'none';
      els.colorDb.value = '';
      els.teamField.style.display = 'none';
      els.team.value = '';
    }
  }

  function updateTeamList() {
    const dbName = els.colorDb.value;
    if (!dbName) {
      els.teamField.style.display = 'none';
      return;
    }

    const entries = ThemeClient.getColorDbEntries(dbName);
    if (entries.length === 0) {
      els.teamField.style.display = 'none';
      return;
    }

    // Update label based on category
    const category = els.category.value;
    const label = els.teamField.querySelector('label');
    if (category === 'military') label.textContent = 'Branch';
    else if (category === 'national') label.textContent = 'Country';
    else label.textContent = 'Team';

    els.teamField.style.display = '';
    els.team.innerHTML = '<option value="">— Select —</option>';
    for (const entry of entries) {
      const opt = document.createElement('option');
      opt.value = entry;
      opt.textContent = entry;
      els.team.appendChild(opt);
    }
  }

  /**
   * Update layout dropdown options based on frame size.
   */
  function updateLayoutOptions() {
    const frameSize = els.frameSize.value;
    const layoutMap = {
      '8x10': ['3-panel'],
      '12x16': ['3-panel'],
      '16x20': ['3-panel', '4-panel'],
      '20x24': ['3-panel', '4-panel'],
      '24x24': ['3-panel', '4-panel'],
      '24x36': ['3-panel', '4-panel', '4-panel-alt']
    };

    const layouts = layoutMap[frameSize] || ['3-panel'];
    const current = els.panelLayout.value;
    els.panelLayout.innerHTML = '';

    const labels = {
      '3-panel': '3-Panel (Standard)',
      '4-panel': '4-Panel',
      '4-panel-alt': '4-Panel Alternate'
    };

    for (const id of layouts) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = labels[id] || id;
      if (id === current) opt.selected = true;
      els.panelLayout.appendChild(opt);
    }

    // If current layout not available, select first
    if (!layouts.includes(current)) {
      els.panelLayout.value = layouts[0];
    }

    updateTertiaryVisibility();
  }

  function updateTertiaryVisibility() {
    const needsTertiary = Renderer.needsTertiaryImage(els.panelLayout.value);
    els.tertiarySection.style.display = needsTertiary ? '' : 'none';
  }

  function updateWordCount() {
    const text = els.bio.value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    els.wordCount.textContent = `${count} words`;

    els.wordCount.className = 'word-count';
    if (count >= 60 && count <= 120) els.wordCount.classList.add('ok');
    else if (count > 0 && (count < 60 || count > 120)) els.wordCount.classList.add('warn');
  }

  function validateBioText() {
    const text = els.bio.value;
    els.bioWarnings.innerHTML = '';

    // Check for em dashes
    if (text.includes('\u2014') || text.includes('--')) {
      const warn = document.createElement('div');
      warn.className = 'warning';
      warn.textContent = 'Em dashes detected — use commas, periods, or en dashes instead';
      els.bioWarnings.appendChild(warn);
    }
  }

  /**
   * Collect all form data into a single object.
   */
  function getData() {
    return {
      name: els.name.value.trim(),
      birthYear: els.birthYear.value.trim(),
      deathYear: els.deathYear.value.trim(),
      dates: formatDates(els.birthYear.value.trim(), els.deathYear.value.trim()),
      category: els.category.value,
      subcategory: els.subcategory.value,
      colorDb: els.colorDb.value,
      team: els.team.value,
      frameSize: els.frameSize.value,
      layout: els.panelLayout.value,
      bio: els.bio.value.trim(),
      quote: els.quote.value.trim(),
      attribution: els.attribution.value.trim(),
      heroCaption: els.heroCaption.value.trim(),
      secondaryCaption: els.secondaryCaption.value.trim(),
      tertiaryCaption: els.tertiaryCaption.value.trim(),
      captions: {
        hero: els.heroCaption.value.trim(),
        secondary: els.secondaryCaption.value.trim(),
        tertiary: els.tertiaryCaption.value.trim()
      }
    };
  }

  function formatDates(birth, death) {
    if (!birth) return '';
    if (!death) return birth;
    return `${birth} \u2013 ${death}`;
  }

  function notifyChange() {
    if (onChangeCallback) onChangeCallback();
  }

  function debounce(fn, ms) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  return {
    init,
    getData
  };
})();

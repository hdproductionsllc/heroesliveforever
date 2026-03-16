/**
 * Form Controller — manages cascading fields, validation, and change events.
 */

window.Form = (function() {
  let onChangeCallback = null;
  let heroWikiTitle = '';
  let fullBio = '';
  let isAutoPopulated = false;
  let _suppressManualFlag = false;
  let _lookupCompleteCallbacks = [];
  let _lookupAbortController = null;

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
    els.showCaptions = document.getElementById('show-captions');
    els.tertiarySection = document.getElementById('tertiary-section');
    els.wordCount = document.getElementById('word-count');
    els.bioWarnings = document.getElementById('bio-warnings');
    els.lookupBtn = document.getElementById('btn-lookup');
    els.lookupLabel = els.lookupBtn.querySelector('.lookup-label');
    els.lookupSpinner = els.lookupBtn.querySelector('.lookup-spinner');
  }

  function setupListeners() {
    // All text inputs trigger preview update
    const textInputs = [els.name, els.birthYear, els.deathYear, els.bio, els.quote,
                        els.attribution, els.heroCaption, els.secondaryCaption, els.tertiaryCaption];
    for (const input of textInputs) {
      if (input) input.addEventListener('input', debounce(notifyChange, 150));
    }

    // Show captions checkbox
    els.showCaptions.addEventListener('change', notifyChange);

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

    // Bio text → word count + validation + manual edit detection
    els.bio.addEventListener('input', () => {
      if (!_suppressManualFlag) {
        isAutoPopulated = false;
      }
      updateWordCount();
      validateBioText();
    });

    // Look Up button → fetch from Wikipedia
    els.lookupBtn.addEventListener('click', handleLookup);

    // Also trigger lookup on Enter key in name field
    els.name.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLookup();
      }
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
      '8x10':  ['3-panel', '3-panel-right'],
      '12x16': ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom'],
      '16x20': ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom', '3-panel-center', '4-panel', '4-panel-right'],
      '20x24': ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom', '3-panel-center', '4-panel', '4-panel-right', '4-panel-top'],
      '24x24': ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom', '3-panel-center', '4-panel', '4-panel-right', '4-panel-top'],
      '24x36': ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom', '3-panel-center', '4-panel', '4-panel-right', '4-panel-top', '4-panel-alt']
    };

    const layouts = layoutMap[frameSize] || ['3-panel'];
    const current = els.panelLayout.value;
    els.panelLayout.innerHTML = '';

    const labels = {
      '3-panel': '3-Panel: Hero Left',
      '3-panel-right': '3-Panel: Hero Right',
      '3-panel-top': '3-Panel: Hero Top',
      '3-panel-bottom': '3-Panel: Hero Bottom',
      '3-panel-center': '3-Panel: Centered Hero',
      '4-panel': '4-Panel: Hero Left',
      '4-panel-right': '4-Panel: Hero Right',
      '4-panel-top': '4-Panel: Hero Top',
      '4-panel-alt': '4-Panel: Triptych'
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
    if (count >= 80 && count <= 140) els.wordCount.classList.add('ok');
    else if (count > 0 && (count < 80 || count > 140)) els.wordCount.classList.add('warn');
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
      showCaptions: els.showCaptions.checked,
      heroCaption: els.showCaptions.checked ? els.heroCaption.value.trim() : '',
      secondaryCaption: els.showCaptions.checked ? els.secondaryCaption.value.trim() : '',
      tertiaryCaption: els.showCaptions.checked ? els.tertiaryCaption.value.trim() : '',
      captions: {
        hero: els.showCaptions.checked ? els.heroCaption.value.trim() : '',
        secondary: els.showCaptions.checked ? els.secondaryCaption.value.trim() : '',
        tertiary: els.showCaptions.checked ? els.tertiaryCaption.value.trim() : ''
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

  /**
   * Handle the Look Up button click — call the API and populate the form.
   */
  async function handleLookup() {
    const name = els.name.value.trim();
    if (!name) {
      showLookupMessage('Enter a name first.', 'error');
      return;
    }

    // Show loading state
    els.lookupBtn.disabled = true;
    els.lookupLabel.style.display = 'none';
    els.lookupSpinner.style.display = '';
    clearLookupMessage();

    // Cancel any in-flight lookup
    if (_lookupAbortController) _lookupAbortController.abort();
    _lookupAbortController = new AbortController();

    try {
      const res = await fetch('/api/hero/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        signal: _lookupAbortController.signal
      });

      const data = await res.json();

      if (!res.ok) {
        showLookupMessage(data.error || 'Lookup failed.', 'error');
        return;
      }

      populateFromLookup(data);
      showLookupMessage('Auto-populated from Wikipedia', 'success');
    } catch (err) {
      if (err.name === 'AbortError') return; // Cancelled by a newer lookup
      showLookupMessage('Network error — could not reach server.', 'error');
    } finally {
      _lookupAbortController = null;
      els.lookupBtn.disabled = false;
      els.lookupLabel.style.display = '';
      els.lookupSpinner.style.display = 'none';
    }
  }

  /**
   * Populate form fields from lookup data and trigger all cascading updates.
   */
  function populateFromLookup(data) {
    // Track Wikipedia title for gallery lookups
    if (data.name) heroWikiTitle = data.name;

    // Store full bio source for dynamic retrimming
    fullBio = data.fullBio || '';
    isAutoPopulated = true;

    // Set text fields
    if (data.name) els.name.value = data.name;
    if (data.birthYear) els.birthYear.value = data.birthYear;
    if (data.deathYear) els.deathYear.value = data.deathYear;
    if (data.bio) els.bio.value = data.bio;
    if (data.attribution) els.attribution.value = data.attribution;

    // Set category and trigger cascading update
    if (data.category && els.category.querySelector(`option[value="${data.category}"]`)) {
      els.category.value = data.category;
      updateCascadingFields();
    }

    // Update word count and bio validation
    updateWordCount();
    validateBioText();

    // Trigger preview render
    notifyChange();

    // Notify lookup-complete listeners (e.g. retrim reference capture)
    for (const cb of _lookupCompleteCallbacks) cb();

    // Auto-fill captions from Wikipedia
    if (data.captions) {
      if (data.captions.hero) els.heroCaption.value = data.captions.hero;
      if (data.captions.secondary) els.secondaryCaption.value = data.captions.secondary;
      if (data.captions.tertiary) els.tertiaryCaption.value = data.captions.tertiary;
    }

    // Clear old images, then load new ones into all panels
    ImageUpload.clearAll();
    if (data.images) {
      loadAllPanelImages(data.images);
    }
  }

  /**
   * Download and load images into all available panels.
   * Downloads happen in parallel for speed.
   */
  async function loadAllPanelImages(images) {
    // Build download tasks: [panelId, url] pairs
    const tasks = [];
    if (images.hero) tasks.push(['hero', images.hero]);
    if (images.secondary) tasks.push(['secondary', images.secondary]);
    if (images.tertiary) tasks.push(['tertiary', images.tertiary]);

    // Download all in parallel
    const results = await Promise.allSettled(
      tasks.map(async ([panelId, url]) => {
        const res = await fetch('/api/images/download-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.filename ? { panelId, data } : null;
      })
    );

    // Load each successful download into its panel
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const { panelId, data } = result.value;
        ImageUpload.loadFromServer(panelId, data);
      }
    }
  }

  /**
   * Show a feedback message below the name lookup row.
   */
  function showLookupMessage(text, type) {
    clearLookupMessage();
    const msg = document.createElement('div');
    msg.className = type === 'error' ? 'lookup-error' : 'lookup-success';
    msg.textContent = text;
    msg.id = 'lookup-message';
    els.lookupBtn.closest('.field').appendChild(msg);

    // Auto-clear success messages
    if (type === 'success') {
      setTimeout(clearLookupMessage, 4000);
    }
  }

  function clearLookupMessage() {
    const existing = document.getElementById('lookup-message');
    if (existing) existing.remove();
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
    getData,
    getWikiTitle() { return heroWikiTitle; },
    getFullBio() { return fullBio; },
    isAutoPopulatedBio() { return isAutoPopulated; },
    setBio(text) {
      _suppressManualFlag = true;
      els.bio.value = text;
      _suppressManualFlag = false;
      updateWordCount();
      notifyChange();
    },
    onLookupComplete(callback) {
      _lookupCompleteCallbacks.push(callback);
    }
  };
})();

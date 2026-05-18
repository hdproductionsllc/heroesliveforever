/**
 * Live Preview Renderer — builds the frame/mat/panels with inline styles.
 * Pixel-for-pixel match with the Tolkien HTML prototype, dynamically themed.
 *
 * All colors, fonts, and gradients come from the resolved theme spec.
 * Updates in real-time on every form change.
 */

window.Renderer = (function() {
  let container = null;
  let currentTheme = null;
  let currentLayout = null;
  let currentFrameSize = null;
  let postRenderCallbacks = [];
  let gridAreaMap = {}; // Maps panel ID to grid area name (for drag-swap)
  let customRatios = {}; // User-adjusted panel ratios keyed by layout ID

  // Frame size configs (same as server)
  const frameSizes = {
    '8x10':  { w: 8,  h: 10, pw: 340, molding: 0.75 },
    '11.75x14.75': { w: 11.75, h: 14.75, pw: 415, printW: 11, printH: 14, molding: 0.75, sleek: true },
    '12.25x14.75': { w: 12.25, h: 14.75, pw: 425, printW: 8.5, printH: 11, molding: 0.75 },
    '12.75x14.75': { w: 12.75, h: 14.75, pw: 440, printW: 8, printH: 10, molding: 0.75 },
    '12x16': { w: 12, h: 16, pw: 400, molding: 0.75 },
    '16x20': { w: 16, h: 20, pw: 480, molding: 0.75 },
    '20x24': { w: 20, h: 24, pw: 540, molding: 0.75 },
    '24x24': { w: 24, h: 24, pw: 620, molding: 0.75 },
    '24x36': { w: 24, h: 36, pw: 500, molding: 0.75 }
  };

  // Layout grid configs — must match server-side layouts.js
  const layoutGrids = {
    // 2-panel variants
    '2-panel': {
      columns: '1.3fr 1fr',
      rows: '1fr',
      areas: '"hero bio"',
      panels: ['hero', 'bio']
    },
    '2-panel-top': {
      columns: '1fr',
      rows: '1.5fr 1fr',
      areas: '"hero" "bio"',
      panels: ['hero', 'bio']
    },
    // 3-panel variants
    '3-panel': {
      columns: '1.15fr 1fr',
      rows: '1fr 1fr',
      areas: '"hero secondary" "hero bio"',
      panels: ['hero', 'secondary', 'bio']
    },
    '3-panel-right': {
      columns: '1fr 1.15fr',
      rows: '1fr 1fr',
      areas: '"bio hero" "secondary hero"',
      panels: ['hero', 'secondary', 'bio']
    },
    '3-panel-top': {
      columns: '1fr 1fr',
      rows: '1.3fr 1fr',
      areas: '"hero hero" "secondary bio"',
      panels: ['hero', 'secondary', 'bio']
    },
    '3-panel-bottom': {
      columns: '1fr 1fr',
      rows: '1fr 1.3fr',
      areas: '"secondary bio" "hero hero"',
      panels: ['hero', 'secondary', 'bio']
    },
    '3-panel-center': {
      columns: '1fr 1.4fr 1fr',
      rows: '1fr',
      areas: '"secondary hero bio"',
      panels: ['hero', 'secondary', 'bio']
    },
    // 4-panel variants
    '4-panel': {
      columns: '1.15fr 1fr',
      rows: '1fr 1fr 1fr',
      areas: '"hero secondary" "hero tertiary" "hero bio"',
      panels: ['hero', 'secondary', 'tertiary', 'bio']
    },
    '4-panel-right': {
      columns: '1fr 1.15fr',
      rows: '1fr 1fr 1fr',
      areas: '"bio hero" "secondary hero" "tertiary hero"',
      panels: ['hero', 'secondary', 'tertiary', 'bio']
    },
    '4-panel-top': {
      columns: '1fr 1fr 1fr',
      rows: '1.5fr 1fr',
      areas: '"hero hero hero" "secondary tertiary bio"',
      panels: ['hero', 'secondary', 'tertiary', 'bio']
    },
    '4-panel-alt': {
      columns: '1fr 1.2fr 1fr',
      rows: '2.5fr 1fr',
      areas: '"secondary hero tertiary" "bio bio bio"',
      panels: ['hero', 'secondary', 'tertiary', 'bio']
    }
  };

  function parseFrValues(str) {
    return str.split(/\s+/).map(s => parseFloat(s));
  }

  function init(containerEl) {
    container = containerEl;
  }

  /**
   * Render the full preview.
   *
   * @param {Object} data - { theme, heroData, frameSize, layout, images }
   */
  function render(data) {
    const { theme, heroData, frameSize, layout, images } = data;
    // Reset panel position map when layout or frame size changes
    if (layout !== currentLayout || frameSize !== currentFrameSize) {
      gridAreaMap = {};
      if (layout !== currentLayout) {
        delete customRatios[layout]; // Fresh start for new layout
      }
    }

    currentTheme = theme;
    currentLayout = layout;
    currentFrameSize = frameSize;

    const fs = frameSizes[frameSize];
    if (!fs) return;

    const previewWidth = fs.pw;
    const previewHeight = Math.round(fs.pw * (fs.h / fs.w));
    const scale = previewWidth / 620; // Scale relative to 24x24 reference

    const pxPerIn = previewWidth / fs.w;

    // Wood molding (face width) — explicit if specified, otherwise a legacy
    // aesthetic value that scales with frame size.
    const moldingIn = fs.molding !== undefined ? fs.molding : (14 * scale) / pxPerIn;
    const frameBorderW = Math.round(moldingIn * pxPerIn);

    // Three frame modes:
    //  1. Faux mat — mat is printed onto the sheet; sheet fills inner opening.
    //  2. Real mat with target print size — mat board fills the gap.
    //  3. Legacy aesthetic mat that scales with frame size.
    const isFauxMat = !!fs.fauxMat;

    let matPadding;            // visible mat in pixels (excludes molding)
    let matInchesW, matInchesH; // visible mat in inches (excludes molding)
    if (isFauxMat) {
      matInchesW = matInchesH = fs.fauxMat;
      matPadding = Math.round(fs.fauxMat * pxPerIn);
    } else if (fs.printW && fs.printH) {
      // Total padding from outer edge to print = molding + visible mat
      matInchesW = Math.max(0, (fs.w - fs.printW) / 2 - moldingIn);
      matInchesH = Math.max(0, (fs.h - fs.printH) / 2 - moldingIn);
      matPadding = Math.round(matInchesW * pxPerIn);
    } else {
      matPadding = Math.round(18 * scale);
      matInchesW = matInchesH = matPadding / pxPerIn;
    }

    // Print sheet dimensions (what gets sent to the printer)
    let printW, printH;
    if (isFauxMat) {
      printW = +(fs.w - 2 * moldingIn).toFixed(2);
      printH = +(fs.h - 2 * moldingIn).toFixed(2);
    } else {
      printW = fs.printW || +(fs.w - 2 * (moldingIn + matInchesW)).toFixed(2);
      printH = fs.printH || +(fs.h - 2 * (moldingIn + matInchesH)).toFixed(2);
    }

    // Inner artwork — only distinct from print sheet when faux mat is in use
    const innerW = isFauxMat ? +(printW - 2 * fs.fauxMat).toFixed(2) : printW;
    const innerH = isFauxMat ? +(printH - 2 * fs.fauxMat).toFixed(2) : printH;

    // Panel gap rule: inter-panel gap should not exceed the outer mat thickness,
    // EXCEPT when the mat is 0 (sleek/no-mat) — in that case a hairline gap is
    // still needed to read as intentional separation, not one solid piece.
    // Aesthetic default is ~10*scale px; cap at matPadding (or minHairline for sleek).
    const idealGap = Math.round(10 * scale);
    const minHairlineGap = Math.max(2, Math.round(4 * scale));
    const gapCeiling = matPadding === 0 ? minHairlineGap : matPadding;
    const panelGap = Math.min(idealGap, gapCeiling);
    const fmt = n => {
      const s = (Math.round(n * 100) / 100).toString();
      return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
    };

    container.innerHTML = '';

    // Title
    const title = el('div', { class: 'preview-title' },
      `Heroes Live Forever \u00B7 ${fs.w} \u00D7 ${fs.h}`
    );
    container.appendChild(title);

    // Top dimension \u2014 outer width
    const dimTop = el('div', {
      class: 'dim-label',
      style: `width: ${previewWidth}px`
    }, `${fs.w} in`);
    container.appendChild(dimTop);

    // Print dimension (top) \u2014 width of the printed sheet inside the mat
    const printPxW = Math.round(printW * pxPerIn);
    const printDimTop = el('div', {
      class: 'dim-label dim-label--print',
      style: `width: ${printPxW}px`
    }, `${fmt(printW)} in print`);
    container.appendChild(printDimTop);

    // Frame wrapper
    const frameWrap = el('div', { class: 'frame-wrap' });

    // Frame
    const frame = el('div', {}, null, {
      width: previewWidth + 'px',
      height: previewHeight + 'px',
      border: `${frameBorderW}px solid`,
      borderImage: `${theme.frame.border} 1`,
      // Drop the inset decorative rings — they were tuned for dark mats and now
      // show as visible color stripes inside lighter mats. Mat color must read
      // uniformly from wood edge to panel edge.
      boxShadow: theme.frame.shadow,
      background: theme.mat.background,
      padding: matPadding + 'px'
    });

    // Mat (inner grid)
    const grid = layoutGrids[layout];
    const custom = customRatios[layout];
    const colValues = (custom && custom.columns) || parseFrValues(grid.columns);
    const rowValues = (custom && custom.rows) || parseFrValues(grid.rows);
    const mat = el('div', { class: 'mat' }, null, {
      width: '100%',
      height: '100%',
      background: theme.mat.background,
      border: `1px solid ${theme.mat.background}`,
      display: 'grid',
      gridTemplateColumns: colValues.map(v => v + 'fr').join(' '),
      gridTemplateRows: rowValues.map(v => v + 'fr').join(' '),
      gridTemplateAreas: grid.areas,
      gap: panelGap + 'px',
      padding: panelGap + 'px',
      position: 'relative'
    });

    // Build each panel
    for (const panelId of grid.panels) {
      if (panelId === 'bio') {
        mat.appendChild(buildBioPanel(panelId, theme, heroData, scale));
      } else {
        mat.appendChild(buildImagePanel(panelId, theme, images, heroData, scale));
      }
    }

    frame.appendChild(mat);
    frameWrap.appendChild(frame);

    // Side dimension — outer height (vertical lines flank the rotated text)
    const dimSide = el('div', {
      class: 'dim-side',
      style: `height: ${previewHeight}px`
    });
    dimSide.appendChild(el('span', { class: 'dim-text' }, `${fs.h} in`));
    frameWrap.appendChild(dimSide);

    // Print dimension (side) — height of the printed sheet
    const printPxH = Math.round(printH * pxPerIn);
    const dimSidePrint = el('div', {
      class: 'dim-side dim-side--print',
      style: `height: ${printPxH}px`
    });
    dimSidePrint.appendChild(el('span', { class: 'dim-text' }, `${fmt(printH)} in print`));
    frameWrap.appendChild(dimSidePrint);

    container.appendChild(frameWrap);

    // Caption strip — full breakdown (different for faux vs real mat)
    const matLabel = matInchesW !== matInchesH
      ? `${fmt(matInchesW)} × ${fmt(matInchesH)} in`
      : `${fmt(matInchesW)} in`;
    const breakdownText = isFauxMat
      ? `Outer ${fs.w} × ${fs.h} in  ·  Frame face ${fmt(moldingIn)} in  ·  Print sheet ${fmt(printW)} × ${fmt(printH)} in  ·  Faux mat ${matLabel} (printed)  ·  Inner artwork ${fmt(innerW)} × ${fmt(innerH)} in`
      : `Outer ${fs.w} × ${fs.h} in  ·  Frame face ${fmt(moldingIn)} in  ·  Mat ${matLabel}  ·  Print ${fmt(printW)} × ${fmt(printH)} in`;
    const breakdown = el('div', { class: 'preview-breakdown' }, breakdownText);
    container.appendChild(breakdown);

    // Fire post-render callbacks (e.g. to reattach drag-drop listeners)
    for (const cb of postRenderCallbacks) {
      cb(container);
    }
  }

  /**
   * Build an image panel.
   */
  function buildImagePanel(panelId, theme, images, heroData, scale) {
    const panel = el('div', { class: 'panel', 'data-panel': panelId }, null, {
      gridArea: gridAreaMap[panelId] || panelId,
      border: `1px solid ${theme.mat.background}`,
      overflow: 'hidden',
      position: 'relative',
      background: theme.mat.panelBg
    });

    const imgData = images && images[panelId];
    if (imgData && imgData.src) {
      const img = document.createElement('img');
      img.src = imgData.src;
      img.alt = imgData.caption || '';

      // Image positioning and filters
      const isHero = panelId === 'hero';
      img.style.cssText = [
        'width: 100%',
        'height: 100%',
        'object-fit: cover',
        'display: block',
        `object-position: ${imgData.position || (isHero ? 'center 20%' : 'center 12%')}`,
        `filter: ${isHero ? theme.image.filter : theme.image.secondaryFilter}`,
        `opacity: ${isHero ? theme.image.opacity : theme.image.secondaryOpacity}`
      ].join('; ');

      panel.appendChild(img);

      // Optional image tint overlay — driven by palette override only.
      // Themes don't set this; it only appears when the user picks a tint.
      if (theme.image && theme.image.tintOverride) {
        const tint = document.createElement('div');
        tint.style.cssText = [
          'position: absolute',
          'inset: 0',
          `background: ${theme.image.tintOverride}`,
          'mix-blend-mode: multiply',
          'opacity: 0.35',
          'pointer-events: none'
        ].join('; ');
        panel.appendChild(tint);
      }
    } else {
      // Placeholder
      const ph = el('div', { class: 'placeholder' }, panelId.toUpperCase());
      panel.appendChild(ph);
    }

    // Caption
    const captionKey = panelId + 'Caption';
    const captionText = heroData[captionKey] || (heroData.captions && heroData.captions[panelId]);
    if (captionText) {
      const cap = el('div', { class: 'cap' }, captionText, {
        color: theme.caption.color,
        background: theme.caption.background
      });
      panel.appendChild(cap);
    }

    return panel;
  }

  /**
   * Build the bio panel — the complex one.
   */
  function buildBioPanel(panelId, theme, heroData, scale) {
    const bio = theme.bio;
    const typo = theme.typography;
    const sizes = typo.sizes;

    // Dynamic content scaling — adjust font sizes so bio text fills the panel
    // with balanced margins regardless of word count.
    // Capped at 1.20 (was 1.35) because larger scaling on short bios pushed
    // content past the panel height and clipped the name at the top.
    const wordCount = (heroData.bio || '').split(/\s+/).filter(w => w).length;
    const idealWords = 110;
    const contentScale = wordCount > 0
      ? Math.max(0.82, Math.min(1.20, Math.sqrt(idealWords / wordCount)))
      : 1;

    const panel = el('div', { class: 'panel', 'data-panel': panelId }, null, {
      gridArea: gridAreaMap[panelId] || panelId,
      border: `1px solid ${theme.mat.background}`,
      overflow: 'hidden',
      position: 'relative',
      background: bio.background,
      display: 'flex',
      flexDirection: 'column',
      // "safe center" centers content when it fits, falls back to flex-start
      // when it would overflow — so the name is always visible at the top.
      justifyContent: 'safe center',
      alignItems: 'center',
      padding: `${Math.round(10 * scale)}px ${Math.round(14 * scale)}px`,
      textAlign: 'center',
      boxSizing: 'border-box'
    });

    // Name
    if (heroData.name) {
      const name = el('div', { class: 'bio-name' }, heroData.name.toUpperCase(), {
        fontFamily: typo.display.family,
        fontSize: Math.round(sizes.name.fontSize * scale) + 'px',
        letterSpacing: Math.round(sizes.name.letterSpacing * scale) + 'px',
        color: bio.nameColor,
        fontWeight: typo.display.weight,
        textTransform: 'uppercase',
        lineHeight: 1.05,
        marginBottom: Math.round(3 * scale) + 'px',
        maxWidth: '100%',
        wordBreak: 'break-word'
      });
      panel.appendChild(name);
    }

    // Dates
    const dates = formatDatesDisplay(heroData.birthYear, heroData.deathYear);
    if (dates) {
      const datesEl = el('div', { class: 'bio-dates' }, dates, {
        fontSize: Math.round(sizes.dates.fontSize * scale) + 'px',
        letterSpacing: Math.round(sizes.dates.letterSpacing * scale) + 'px',
        color: bio.datesColor,
        marginBottom: Math.round(5 * scale * contentScale) + 'px',
        fontWeight: 300
      });
      panel.appendChild(datesEl);
    }

    // Divider
    const divider = el('div', { class: 'bio-divider' }, null, {
      width: Math.round(36 * scale) + 'px',
      height: '1px',
      background: bio.divider,
      marginBottom: Math.round(6 * scale * contentScale) + 'px'
    });
    panel.appendChild(divider);

    // Bio text — font size scales with content length for balanced margins
    if (heroData.bio) {
      const bioFontSize = sizes.bioText.fontSize * scale * contentScale;
      const bioLineHeight = sizes.bioText.lineHeight + (contentScale > 1.1 ? 0.1 : 0);
      const bioMaxWidth = Math.round(sizes.bioText.maxWidth * scale * Math.min(contentScale, 1.15));

      const text = el('div', { class: 'bio-text' }, heroData.bio, {
        fontFamily: typo.body.family,
        fontSize: bioFontSize.toFixed(1) + 'px',
        lineHeight: bioLineHeight,
        color: bio.textColor,
        maxWidth: bioMaxWidth + 'px',
        textAlign: 'center',
        marginBottom: Math.round(7 * scale * contentScale) + 'px'
      });
      panel.appendChild(text);
    }

    // Quote
    if (heroData.quote) {
      const quoteText = `\u201C${heroData.quote.replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '')}\u201D`;
      const quoteFontSize = sizes.quote.fontSize * scale * Math.min(contentScale, 1.15);
      const quote = el('div', { class: 'bio-quote' }, quoteText, {
        fontFamily: typo.quote.family,
        fontSize: Math.round(quoteFontSize) + 'px',
        lineHeight: sizes.quote.lineHeight,
        color: bio.quoteColor,
        fontStyle: typo.quote.style || 'italic',
        fontWeight: typo.quote.weight,
        maxWidth: Math.round(sizes.quote.maxWidth * scale) + 'px',
        marginBottom: Math.round(3 * scale * contentScale) + 'px'
      });
      panel.appendChild(quote);
    }

    // Attribution
    if (heroData.attribution) {
      const attrText = heroData.attribution
        .split(/\s*[|,]\s*/)
        .filter(s => s.trim())
        .join(' \u00B7 ')
        .toUpperCase();

      const attr = el('div', { class: 'bio-attribution' }, attrText, {
        fontSize: (sizes.attribution.fontSize * scale).toFixed(1) + 'px',
        letterSpacing: (sizes.attribution.letterSpacing * scale).toFixed(1) + 'px',
        color: bio.attributionColor,
        textTransform: 'uppercase',
        fontFamily: 'sans-serif'
      });
      panel.appendChild(attr);
    }

    // Aged texture overlay
    if (bio.overlay && bio.overlay !== 'none') {
      const overlay = el('div', { class: 'bio-overlay' }, null, {
        background: bio.overlay
      });
      panel.appendChild(overlay);
    }

    // Bevel effect
    const bevel = el('div', { class: 'bio-bevel' });
    panel.appendChild(bevel);

    return panel;
  }

  /**
   * Format dates for display.
   */
  function formatDatesDisplay(birth, death) {
    if (!birth) return '';
    const b = String(birth).trim();
    const d = death ? String(death).trim() : '';
    if (!d) return b;
    return `${b} \u2013 ${d}`;
  }

  /**
   * Helper to create a DOM element with attributes, text, and inline styles.
   */
  function el(tag, attrs, text, styles) {
    const elem = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        elem.setAttribute(k, v);
      }
    }
    if (text) elem.textContent = text;
    if (styles) {
      for (const [k, v] of Object.entries(styles)) {
        elem.style[k] = v;
      }
    }
    return elem;
  }

  /**
   * Swap two panels' grid positions. Updates the map and DOM directly.
   */
  function swapPanels(panelA, panelB) {
    const areaA = gridAreaMap[panelA] || panelA;
    const areaB = gridAreaMap[panelB] || panelB;
    gridAreaMap[panelA] = areaB;
    gridAreaMap[panelB] = areaA;

    if (!container) return;
    const elA = container.querySelector(`[data-panel="${panelA}"]`);
    const elB = container.querySelector(`[data-panel="${panelB}"]`);
    if (elA) elA.style.gridArea = areaB;
    if (elB) elB.style.gridArea = areaA;
  }

  /**
   * Get the current preview HTML for export.
   */
  function getPreviewHtml() {
    if (!container) return '';
    // Clone and return the frame content (skip title and dimensions)
    const frameWrap = container.querySelector('.frame-wrap');
    return frameWrap ? frameWrap.outerHTML : container.innerHTML;
  }

  /**
   * Check if a layout needs a tertiary image panel.
   */
  function needsTertiaryImage(layoutId) {
    const grid = layoutGrids[layoutId];
    return grid && grid.panels.includes('tertiary');
  }

  /**
   * Register a callback to run after every render.
   */
  function onPostRender(callback) {
    postRenderCallbacks.push(callback);
  }

  /**
   * Get current fr values for the active layout (custom or default).
   */
  function getCurrentFrValues() {
    const grid = layoutGrids[currentLayout];
    if (!grid) return null;
    const custom = customRatios[currentLayout];
    return {
      columns: (custom && custom.columns) || parseFrValues(grid.columns),
      rows: (custom && custom.rows) || parseFrValues(grid.rows)
    };
  }

  /**
   * Store user-adjusted ratios for an axis of the current layout.
   */
  function setCustomRatios(axisKey, values) {
    if (!currentLayout) return;
    if (!customRatios[currentLayout]) customRatios[currentLayout] = {};
    customRatios[currentLayout][axisKey] = values;
  }

  /**
   * Clear custom ratios for the current layout, reverting to defaults.
   */
  function resetCustomRatios() {
    if (currentLayout) delete customRatios[currentLayout];
  }

  return {
    init,
    render,
    getPreviewHtml,
    needsTertiaryImage,
    onPostRender,
    swapPanels,
    getCurrentFrValues,
    setCustomRatios,
    resetCustomRatios
  };
})();

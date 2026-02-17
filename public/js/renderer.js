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

  // Frame size configs (same as server)
  const frameSizes = {
    '8x10':  { w: 8,  h: 10, pw: 340 },
    '12x16': { w: 12, h: 16, pw: 400 },
    '16x20': { w: 16, h: 20, pw: 480 },
    '20x24': { w: 20, h: 24, pw: 540 },
    '24x24': { w: 24, h: 24, pw: 620 },
    '24x36': { w: 24, h: 36, pw: 500 }
  };

  // Layout grid configs
  const layoutGrids = {
    '3-panel': {
      columns: '1.15fr 1fr',
      rows: '1fr 1fr',
      areas: '"hero secondary" "hero bio"',
      panels: ['hero', 'secondary', 'bio']
    },
    '4-panel': {
      columns: '1.15fr 1fr',
      rows: '1fr 1fr 1fr',
      areas: '"hero secondary" "hero tertiary" "hero bio"',
      panels: ['hero', 'secondary', 'tertiary', 'bio']
    },
    '4-panel-alt': {
      columns: '1fr 1.2fr 1fr',
      rows: '2.5fr 1fr',
      areas: '"secondary hero tertiary" "bio bio bio"',
      panels: ['hero', 'secondary', 'tertiary', 'bio']
    }
  };

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
    currentTheme = theme;
    currentLayout = layout;
    currentFrameSize = frameSize;

    const fs = frameSizes[frameSize];
    if (!fs) return;

    const previewWidth = fs.pw;
    const previewHeight = Math.round(fs.pw * (fs.h / fs.w));
    const scale = previewWidth / 620; // Scale relative to 24x24 reference

    // Frame border width scales with preview
    const frameBorderW = Math.round(14 * scale);
    const matPadding = Math.round(18 * scale);
    const panelGap = Math.round(10 * scale);

    container.innerHTML = '';

    // Title
    const title = el('div', { class: 'preview-title' },
      `Heroes Live Forever \u00B7 ${fs.w} \u00D7 ${fs.h}`
    );
    container.appendChild(title);

    // Top dimension
    const dimTop = el('div', {
      class: 'dim-label',
      style: `width: ${previewWidth}px`
    }, `${fs.w} inches`);
    container.appendChild(dimTop);

    // Frame wrapper
    const frameWrap = el('div', { class: 'frame-wrap' });

    // Frame
    const frame = el('div', {}, null, {
      width: previewWidth + 'px',
      height: previewHeight + 'px',
      border: `${frameBorderW}px solid`,
      borderImage: `${theme.frame.border} 1`,
      boxShadow: [
        `inset 0 0 0 2px ${theme.frame.innerBorder}`,
        `inset 0 0 0 4px ${theme.frame.outerShadow}`,
        theme.frame.shadow
      ].join(', '),
      background: theme.mat.background,
      padding: matPadding + 'px'
    });

    // Mat (inner grid)
    const grid = layoutGrids[layout];
    const mat = el('div', {}, null, {
      width: '100%',
      height: '100%',
      border: `1px solid ${theme.mat.border}`,
      display: 'grid',
      gridTemplateColumns: grid.columns,
      gridTemplateRows: grid.rows,
      gridTemplateAreas: grid.areas,
      gap: panelGap + 'px',
      padding: panelGap + 'px'
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

    // Side dimension
    const dimSide = el('div', { class: 'dim-side' }, `${fs.h} inches`);
    frameWrap.appendChild(dimSide);

    container.appendChild(frameWrap);
  }

  /**
   * Build an image panel.
   */
  function buildImagePanel(panelId, theme, images, heroData, scale) {
    const panel = el('div', { class: 'panel' }, null, {
      gridArea: panelId,
      border: `1px solid ${theme.mat.panelBorder}`,
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

    const panel = el('div', { class: 'panel' }, null, {
      gridArea: panelId,
      border: `1px solid ${theme.mat.panelBorder}`,
      overflow: 'hidden',
      position: 'relative',
      background: bio.background,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: `0 ${Math.round(14 * scale)}px`,
      textAlign: 'center'
    });

    // Name
    if (heroData.name) {
      const name = el('div', { class: 'bio-name' }, heroData.name.toUpperCase(), {
        fontFamily: typo.display.family,
        fontSize: Math.round(sizes.name.fontSize * scale) + 'px',
        letterSpacing: Math.round(sizes.name.letterSpacing * scale) + 'px',
        color: bio.nameColor,
        fontWeight: typo.display.weight,
        textTransform: 'uppercase'
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
        marginBottom: Math.round(5 * scale) + 'px',
        fontWeight: 300
      });
      panel.appendChild(datesEl);
    }

    // Divider
    const divider = el('div', { class: 'bio-divider' }, null, {
      width: Math.round(36 * scale) + 'px',
      height: '1px',
      background: bio.divider,
      marginBottom: Math.round(6 * scale) + 'px'
    });
    panel.appendChild(divider);

    // Bio text
    if (heroData.bio) {
      const text = el('div', { class: 'bio-text' }, heroData.bio, {
        fontFamily: typo.body.family,
        fontSize: (sizes.bioText.fontSize * scale).toFixed(1) + 'px',
        lineHeight: sizes.bioText.lineHeight,
        color: bio.textColor,
        maxWidth: Math.round(sizes.bioText.maxWidth * scale) + 'px',
        textAlign: 'center',
        marginBottom: Math.round(7 * scale) + 'px'
      });
      panel.appendChild(text);
    }

    // Quote
    if (heroData.quote) {
      const quoteText = `\u201C${heroData.quote.replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '')}\u201D`;
      const quote = el('div', { class: 'bio-quote' }, quoteText, {
        fontFamily: typo.quote.family,
        fontSize: Math.round(sizes.quote.fontSize * scale) + 'px',
        lineHeight: sizes.quote.lineHeight,
        color: bio.quoteColor,
        fontStyle: typo.quote.style || 'italic',
        fontWeight: typo.quote.weight,
        maxWidth: Math.round(sizes.quote.maxWidth * scale) + 'px',
        marginBottom: Math.round(3 * scale) + 'px'
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

  return {
    init,
    render,
    getPreviewHtml,
    needsTertiaryImage
  };
})();

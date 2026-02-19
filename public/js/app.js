/**
 * App — main initialization and coordination.
 */

(async function() {
  // Initialize theme data
  await ThemeClient.init();

  // Initialize renderer
  Renderer.init(document.getElementById('preview-container'));

  // Initialize image upload
  ImageUpload.init(onFormChange);

  // Initialize form
  Form.init(onFormChange);

  // Initialize exports
  Exports.init(getFullHeroData);

  // Panel drag state (persists across renders, document listeners attached once)
  let dragState = null;
  let swapTarget = null;

  // Bio retrim state — tracks reference panel size for dynamic word count
  let retrimReferenceArea = null;   // bio panel pixel area at initial render
  let retrimReferenceWords = null;  // word count at that reference size
  let retrimTimer = null;           // debounce timer
  let _lastLayout = null;           // detect layout changes
  let _lastFrameSize = null;        // detect frame size changes

  function parsePosition(posStr) {
    const parts = (posStr || 'center center').split(/\s+/);
    const xStr = parts[0] || 'center';
    const yStr = parts[1] || 'center';
    return {
      x: xStr === 'center' ? 50 : parseFloat(xStr),
      y: yStr === 'center' ? 50 : parseFloat(yStr)
    };
  }

  function getPanelAt(x, y) {
    const elem = document.elementFromPoint(x, y);
    if (!elem) return null;
    return elem.closest('.panel[data-panel]');
  }

  function highlightSwap(panel) {
    panel.style.outline = '2px dashed rgba(200,160,80,0.8)';
    panel.style.outlineOffset = '-2px';
    panel.style.opacity = '0.7';
  }

  function clearSwap(panel) {
    if (!panel) return;
    panel.style.outline = '';
    panel.style.outlineOffset = '';
    panel.style.opacity = '';
  }

  document.addEventListener('mousemove', (e) => {
    if (!dragState) return;

    const panelUnder = getPanelAt(e.clientX, e.clientY);

    if (panelUnder && panelUnder !== dragState.sourcePanel) {
      // Over a different panel — show swap indicator
      if (swapTarget !== panelUnder) {
        clearSwap(swapTarget);
        swapTarget = panelUnder;
        highlightSwap(swapTarget);
      }
    } else {
      // Over source panel or gap — image reposition mode
      if (swapTarget) {
        clearSwap(swapTarget);
        swapTarget = null;
      }

      if (dragState.sourceImg && panelUnder === dragState.sourcePanel) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        const rect = dragState.sourcePanel.getBoundingClientRect();
        const pctX = Math.max(0, Math.min(100, dragState.startPosX - (dx / rect.width) * 100));
        const pctY = Math.max(0, Math.min(100, dragState.startPosY - (dy / rect.height) * 100));
        dragState.sourceImg.style.objectPosition = `${pctX.toFixed(1)}% ${pctY.toFixed(1)}%`;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    if (!dragState) return;

    if (swapTarget) {
      const targetId = swapTarget.dataset.panel;
      clearSwap(swapTarget);
      Renderer.swapPanels(dragState.sourcePanelId, targetId);
      // Bio panel may have moved to a different grid area — retrim for new size
      scheduleRetrim();
      swapTarget = null;
    } else if (dragState.sourceImg) {
      const finalPos = dragState.sourceImg.style.objectPosition;
      if (finalPos) {
        ImageUpload.setImagePosition(dragState.sourcePanelId, finalPos);
      }
    }

    dragState.sourcePanel.style.cursor = '';
    dragState = null;
  });

  // Register drag-drop on preview panels after each render
  Renderer.onPostRender(attachPanelDragDrop);
  Renderer.onPostRender(attachDividerHandles);

  // Initial render
  onFormChange();

  // ── Bio Retrim ─────────────────────────────────────────────────────
  // Dynamically adjusts bio word count when the bio panel is resized.

  /**
   * Measure the current bio panel's pixel area via getBoundingClientRect.
   */
  function getBioPanelArea() {
    const container = document.getElementById('preview-container');
    if (!container) return null;
    const bioPanel = container.querySelector('[data-panel="bio"]');
    if (!bioPanel) return null;
    const rect = bioPanel.getBoundingClientRect();
    return rect.width * rect.height;
  }

  /**
   * Capture the current bio panel size and word count as the baseline.
   */
  function captureRetrimReference() {
    const area = getBioPanelArea();
    if (!area || area === 0) return;
    const data = Form.getData();
    const wordCount = data.bio ? data.bio.split(/\s+/).filter(w => w).length : 0;
    if (wordCount === 0) return;
    retrimReferenceArea = area;
    retrimReferenceWords = wordCount;
  }

  /**
   * Core retrim algorithm: greedy sentence selection from the start of fullBio.
   * Selects complete sentences until within 85–115% of targetWords.
   */
  function retrimToTarget(fullBioText, targetWords) {
    if (!fullBioText) return '';

    // Split into sentences (period followed by space or end-of-string)
    const sentences = fullBioText.match(/[^.!?]+[.!?]+(?:\s|$)/g);
    if (!sentences || sentences.length === 0) return fullBioText;

    let result = '';
    let wordCount = 0;

    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(/\s+/).filter(w => w).length;
      const newCount = wordCount + sentenceWords;

      // If adding this sentence overshoots, check if it's closer than stopping here
      if (newCount > targetWords * 1.15 && wordCount >= targetWords * 0.85) {
        break;
      }

      result += sentence;
      wordCount = newCount;

      // Within target range — stop here
      if (wordCount >= targetWords * 0.85) break;
    }

    return result.trim();
  }

  /**
   * Calculate ideal word count based on panel area ratio.
   * Formula: referenceWords * sqrt(currentArea / referenceArea), clamped [50, 300].
   */
  function calculateTargetWords() {
    if (!retrimReferenceArea || !retrimReferenceWords) return null;
    const currentArea = getBioPanelArea();
    if (!currentArea || currentArea === 0) return null;
    const ratio = currentArea / retrimReferenceArea;
    const target = retrimReferenceWords * Math.sqrt(ratio);
    return Math.max(50, Math.min(300, Math.round(target)));
  }

  /**
   * Schedule a bio retrim after a 2-second debounce.
   * Guards: only runs if bio is auto-populated, fullBio exists, and
   * the target word count differs from current by >20%.
   */
  function scheduleRetrim() {
    if (retrimTimer) clearTimeout(retrimTimer);

    retrimTimer = setTimeout(() => {
      retrimTimer = null;

      // Guard: must be auto-populated with a full bio available
      if (!Form.isAutoPopulatedBio()) return;
      const fullBioText = Form.getFullBio();
      if (!fullBioText) return;

      const target = calculateTargetWords();
      if (target === null) return;

      // Guard: only retrim if difference is >20%
      const currentBio = Form.getData().bio;
      const currentWords = currentBio ? currentBio.split(/\s+/).filter(w => w).length : 0;
      if (currentWords === 0) return;
      const diff = Math.abs(target - currentWords) / currentWords;
      if (diff <= 0.20) return;

      // Perform the retrim
      const newBio = retrimToTarget(fullBioText, target);
      if (newBio && newBio !== currentBio) {
        Form.setBio(newBio);
      }
    }, 2000);
  }

  /**
   * Reset all retrim state (called on new lookups, layout changes).
   */
  function resetRetrimState() {
    retrimReferenceArea = null;
    retrimReferenceWords = null;
    if (retrimTimer) {
      clearTimeout(retrimTimer);
      retrimTimer = null;
    }
  }

  // When a new hero is looked up, reset retrim state so it recalibrates
  Form.onLookupComplete(() => {
    resetRetrimState();
  });

  /**
   * Called whenever form data or images change.
   */
  async function onFormChange() {
    const data = Form.getData();
    const images = ImageUpload.getImages();

    // Resolve the theme for current category + team
    let theme;
    try {
      theme = await ThemeClient.resolveTheme({
        category: data.category,
        subcategory: data.subcategory,
        team: data.team,
        colorDb: data.colorDb
      });
    } catch (err) {
      console.error('Theme resolve error:', err);
      try {
        theme = await ThemeClient.getTheme(data.category);
      } catch (fallbackErr) {
        console.error('Theme fallback also failed:', fallbackErr);
        return; // Can't render without a theme
      }
    }

    // Render preview
    Renderer.render({
      theme,
      heroData: data,
      frameSize: data.frameSize,
      layout: data.layout,
      images
    });

    // Update DPI badges (debounced, doesn't block render)
    ImageUpload.updateDpiBadges(data.frameSize, data.layout);

    // Retrim: detect layout/frame changes → reset reference so it recalibrates
    if (data.layout !== _lastLayout || data.frameSize !== _lastFrameSize) {
      _lastLayout = data.layout;
      _lastFrameSize = data.frameSize;
      resetRetrimState();
    }

    // Retrim: capture baseline reference after first render with auto-populated bio
    if (Form.isAutoPopulatedBio() && retrimReferenceArea === null) {
      captureRetrimReference();
    }
  }

  /**
   * Get the full hero data for export (form data + image references).
   */
  function getFullHeroData() {
    const data = Form.getData();
    const images = ImageUpload.getImages();

    // Attach image info for exports
    data.images = {};
    for (const [key, img] of Object.entries(images)) {
      if (img) {
        data.images[key] = {
          filename: img.filename,
          serverPath: img.serverPath,
          caption: data.captions[key] || ''
        };
      }
    }

    return data;
  }

  /**
   * Attach drag-drop handlers to preview panels.
   * File drops load images; click-drag repositions images or swaps panels.
   * Called after every render to reattach to fresh DOM elements.
   */
  function attachPanelDragDrop(container) {
    const panels = container.querySelectorAll('.panel[data-panel]');
    panels.forEach(panel => {
      const panelId = panel.dataset.panel;

      // File drag-drop
      panel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        panel.style.outline = '2px solid var(--accent, #c8a050)';
        panel.style.outlineOffset = '-2px';
      });

      panel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        panel.style.outline = '';
        panel.style.outlineOffset = '';
      });

      panel.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        panel.style.outline = '';
        panel.style.outlineOffset = '';

        if (e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            ImageUpload.loadFileToPanel(panelId, file);
          }
        }
      });

      // Click-drag: reposition image within panel, or swap with another panel
      panel.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();

        const img = panel.querySelector('img');
        dragState = {
          sourcePanel: panel,
          sourcePanelId: panelId,
          sourceImg: img,
          startX: e.clientX,
          startY: e.clientY,
          startPosX: 50,
          startPosY: 50
        };

        if (img) {
          const pos = parsePosition(img.style.objectPosition);
          dragState.startPosX = pos.x;
          dragState.startPosY = pos.y;
        }

        panel.style.cursor = 'grabbing';
      });
    });
  }
  /**
   * Attach invisible divider handles on CSS Grid gaps.
   * Dragging resizes adjacent panel columns/rows by adjusting fr ratios.
   * Called after every render to reattach to fresh DOM elements.
   */
  function attachDividerHandles(container) {
    container.querySelectorAll('.divider-handle').forEach(h => h.remove());

    const mat = container.querySelector('.mat');
    if (!mat) return;

    const style = getComputedStyle(mat);
    const gap = parseFloat(style.gap) || 0;
    const pad = parseFloat(style.paddingLeft) || 0;
    const contentW = mat.clientWidth - pad * 2;
    const contentH = mat.clientHeight - pad * 2;

    const colPx = style.gridTemplateColumns.split(' ').map(parseFloat);
    const rowPx = style.gridTemplateRows.split(' ').map(parseFloat);

    const grabExtra = 4; // Extra pixels on each side for easier grabbing

    function addHandle(axis, index, pos) {
      const handle = document.createElement('div');
      handle.className = 'divider-handle ' + axis;
      Object.assign(handle.style, pos);

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const freshFr = Renderer.getCurrentFrValues();
        if (!freshFr) return;

        const axisKey = axis === 'col' ? 'columns' : 'rows';
        const prop = axis === 'col' ? 'gridTemplateColumns' : 'gridTemplateRows';
        const startFr = [...freshFr[axisKey]];
        const startPos = axis === 'col' ? e.clientX : e.clientY;

        // Read current pixel sizes for accurate delta conversion
        const trackPx = (axis === 'col'
          ? getComputedStyle(mat).gridTemplateColumns
          : getComputedStyle(mat).gridTemplateRows
        ).split(' ').map(parseFloat);

        const combinedPx = trackPx[index] + trackPx[index + 1];
        const combinedFr = startFr[index] + startFr[index + 1];

        handle.classList.add('dragging');
        document.body.style.cursor = axis === 'col' ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';

        function onMove(ev) {
          const delta = (axis === 'col' ? ev.clientX : ev.clientY) - startPos;
          const deltaFr = (delta / combinedPx) * combinedFr;

          const newA = startFr[index] + deltaFr;
          const newB = startFr[index + 1] - deltaFr;

          // Enforce minimum panel size
          if (newA < 0.3 || newB < 0.3) return;

          const newValues = [...startFr];
          newValues[index] = newA;
          newValues[index + 1] = newB;

          mat.style[prop] = newValues.map(v => v.toFixed(3) + 'fr').join(' ');
        }

        function onUp() {
          handle.classList.remove('dragging');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);

          // Commit final fr values
          const finalStr = mat.style[prop];
          const finalFr = finalStr.split(' ').map(s => parseFloat(s));
          const axisKey = axis === 'col' ? 'columns' : 'rows';
          Renderer.setCustomRatios(axisKey, finalFr);

          // Schedule bio retrim for new panel proportions
          scheduleRetrim();

          // Reposition handles to match new track sizes
          attachDividerHandles(container);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      // Double-click resets to default proportions
      handle.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        Renderer.resetCustomRatios();
        resetRetrimState();
        onFormChange();
        // scheduleRetrim will recapture reference on next render via onFormChange
        scheduleRetrim();
      });

      mat.appendChild(handle);
    }

    // Column dividers
    let x = pad;
    for (let i = 0; i < colPx.length - 1; i++) {
      x += colPx[i];
      addHandle('col', i, {
        left: (x - grabExtra) + 'px',
        top: pad + 'px',
        width: (gap + grabExtra * 2) + 'px',
        height: contentH + 'px'
      });
      x += gap;
    }

    // Row dividers
    let y = pad;
    for (let i = 0; i < rowPx.length - 1; i++) {
      y += rowPx[i];
      addHandle('row', i, {
        left: pad + 'px',
        top: (y - grabExtra) + 'px',
        width: contentW + 'px',
        height: (gap + grabExtra * 2) + 'px'
      });
      y += gap;
    }
  }
})();

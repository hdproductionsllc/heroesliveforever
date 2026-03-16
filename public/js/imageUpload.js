/**
 * Image Upload — drag-drop handling, preview thumbnails, and DPI badge display.
 */

window.ImageUpload = (function() {
  // Uploaded image data keyed by panel ID
  const uploadedImages = {};
  let onChangeCallback = null;

  function init(onChange) {
    onChangeCallback = onChange;
    setupDropZones();
  }

  function setupDropZones() {
    document.querySelectorAll('.drop-zone').forEach(zone => {
      const panel = zone.dataset.panel;
      const fileInput = zone.querySelector('.file-input');

      // Click to upload (but not when clicking the Browse overlay)
      zone.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-gallery')) return;
        if (e.target !== fileInput) fileInput.click();
      });

      // File selected
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          handleFile(panel, e.target.files[0], zone);
        }
      });

      // Drag events
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          handleFile(panel, e.dataTransfer.files[0], zone);
        }
      });
    });
  }

  /**
   * Inject the "Find alternative" overlay button into a drop zone.
   * Only shows on hover when the zone has an image.
   */
  function addGalleryOverlay(zone, panelId) {
    // Remove any existing overlay first
    const existing = zone.querySelector('.btn-gallery');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-gallery';
    btn.dataset.panel = panelId;
    btn.textContent = 'Find alternative';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openGallery(panelId);
    });
    zone.appendChild(btn);
  }

  async function handleFile(panelId, file, zone) {
    if (!file.type.startsWith('image/')) return;

    // Show loading state
    zone.classList.add('has-image');
    zone.innerHTML = '';

    // Create local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      const thumb = document.createElement('img');
      thumb.src = e.target.result;
      thumb.className = 'preview-thumb';
      zone.appendChild(thumb);

      // Re-add the file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.className = 'file-input';
      input.dataset.panel = panelId;
      input.addEventListener('change', (ev) => {
        if (ev.target.files.length > 0) handleFile(panelId, ev.target.files[0], zone);
      });
      zone.appendChild(input);

      // Add gallery overlay if a wiki title is available
      if (Form.getWikiTitle()) addGalleryOverlay(zone, panelId);

      // Store the data URL for preview
      uploadedImages[panelId] = {
        src: e.target.result,
        filename: null,
        localFile: file,
        caption: ''
      };

      notifyChange();
    };
    reader.readAsDataURL(file);

    // Upload to server for DPI checking
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.filename) {
        uploadedImages[panelId].filename = data.filename;
        uploadedImages[panelId].serverPath = data.path;
        uploadedImages[panelId].dimensions = data.dimensions;

        // Update meta display
        updateMeta(panelId, data);

        // Auto-analyze crop position
        analyzeAndSetPosition(panelId, data.filename);
      }
    } catch (err) {
      console.error('Upload error:', err);
      const metaEl = document.querySelector(`.image-meta[data-panel="${panelId}"]`);
      if (metaEl) {
        metaEl.innerHTML = '<span style="color:#c44;">Upload failed — try again</span>';
      }
    }
  }

  function updateMeta(panelId, data) {
    const metaEl = document.querySelector(`.image-meta[data-panel="${panelId}"]`);
    if (!metaEl) return;

    const dims = data.dimensions;
    metaEl.innerHTML = '';

    // Dimensions
    const dimSpan = document.createElement('span');
    dimSpan.style.color = '#777';
    dimSpan.textContent = `${dims.width} \u00D7 ${dims.height}`;
    metaEl.appendChild(dimSpan);

    // File size
    const sizeSpan = document.createElement('span');
    sizeSpan.style.color = '#555';
    sizeSpan.textContent = formatFileSize(data.size);
    metaEl.appendChild(sizeSpan);
  }

  /**
   * Update DPI badges after layout/frame size changes.
   */
  async function updateDpiBadges(frameSize, layoutId) {
    // Calculate panel sizes from layout
    try {
      const res = await fetch('/api/layout/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameSize, layout: layoutId })
      });
      const layout = await res.json();

      for (const panel of layout.panels.inches) {
        if (panel.type !== 'image') continue;
        const img = uploadedImages[panel.id];
        if (!img || !img.filename) continue;

        const checkRes = await fetch('/api/images/check-resolution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: img.filename,
            placedWidthIn: panel.width,
            placedHeightIn: panel.height
          })
        });
        const result = await checkRes.json();

        // Update badge
        const metaEl = document.querySelector(`.image-meta[data-panel="${panel.id}"]`);
        if (metaEl) {
          // Remove existing badge
          const existing = metaEl.querySelector('.dpi-badge');
          if (existing) existing.remove();

          const badge = document.createElement('span');
          badge.className = `dpi-badge ${result.status.toLowerCase()}`;
          badge.textContent = `${result.dpi} DPI`;
          badge.title = result.message;
          metaEl.appendChild(badge);
        }
      }
    } catch (err) {
      console.error('DPI check error:', err);
    }
  }

  /**
   * Load an image from a server-downloaded URL response into a panel.
   * Called after the server proxy-downloads from Wikipedia/LoC.
   *
   * @param {string} panelId - 'hero', 'secondary', or 'tertiary'
   * @param {Object} serverData - response from /api/images/download-url
   */
  function loadFromServer(panelId, serverData, license) {
    const zone = document.querySelector(`.drop-zone[data-panel="${panelId}"]`);
    if (!zone) return;

    // Set up the zone with the image
    zone.classList.add('has-image');
    zone.innerHTML = '';

    // Create thumbnail from server path
    const thumb = document.createElement('img');
    thumb.src = serverData.path;
    thumb.className = 'preview-thumb';
    zone.appendChild(thumb);

    // Re-add file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.className = 'file-input';
    input.dataset.panel = panelId;
    input.addEventListener('change', (ev) => {
      if (ev.target.files.length > 0) handleFile(panelId, ev.target.files[0], zone);
    });
    zone.appendChild(input);

    // Add gallery overlay if a wiki title is available
    if (Form.getWikiTitle()) addGalleryOverlay(zone, panelId);

    // Store image data — use server path as src for preview
    uploadedImages[panelId] = {
      src: serverData.path,
      filename: serverData.filename,
      serverPath: serverData.path,
      dimensions: serverData.dimensions,
      caption: ''
    };

    // Update meta display
    updateMeta(panelId, serverData);

    // Show license warning if image is not public domain
    if (license && !license.safe) {
      showLicenseWarning(panelId, license.name);
    }

    // Auto-analyze crop position
    analyzeAndSetPosition(panelId, serverData.filename);

    notifyChange();
  }

  /**
   * Show a license warning badge on an image panel's meta area.
   */
  function showLicenseWarning(panelId, licenseName) {
    const metaEl = document.querySelector(`.image-meta[data-panel="${panelId}"]`);
    if (!metaEl) return;
    const badge = document.createElement('span');
    badge.className = 'license-badge license-warning';
    badge.title = licenseName
      ? 'License: ' + licenseName + ' — may require attribution or restrict commercial use'
      : 'Unknown license — verify rights before production use';
    badge.textContent = licenseName || 'Unknown license';
    metaEl.appendChild(badge);
  }

  /**
   * Load a File object directly into a panel — used by drag-drop on preview panels.
   *
   * @param {string} panelId - 'hero', 'secondary', or 'tertiary'
   * @param {File} file - the dropped file
   */
  function loadFileToPanel(panelId, file) {
    if (!file.type.startsWith('image/')) return;

    const zone = document.querySelector(`.drop-zone[data-panel="${panelId}"]`);
    if (!zone) return;

    handleFile(panelId, file, zone);
  }

  /**
   * Call the server to analyze image entropy and set object-position.
   * Only applies if user hasn't manually repositioned.
   */
  async function analyzeAndSetPosition(panelId, filename) {
    try {
      const res = await fetch('/api/images/analyze-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      if (!res.ok) return;

      const data = await res.json();
      const img = uploadedImages[panelId];
      if (img && !img.manualPosition) {
        img.position = data.position;
        notifyChange();
      }
    } catch (err) {
      console.error('Crop analysis error:', err);
      // Non-critical: auto-crop is a convenience feature, image still loads fine
    }
  }

  function getImages() {
    return { ...uploadedImages };
  }

  function getImage(panelId) {
    return uploadedImages[panelId] || null;
  }

  function notifyChange() {
    if (onChangeCallback) onChangeCallback();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Clear all panels — removes images, resets drop zones, clears stored data.
   * Called before loading a new hero so old images don't linger.
   */
  function clearAll() {
    const panelIds = ['hero', 'secondary', 'tertiary'];
    for (const panelId of panelIds) {
      delete uploadedImages[panelId];

      const zone = document.querySelector(`.drop-zone[data-panel="${panelId}"]`);
      if (zone) {
        zone.classList.remove('has-image');
        // Restore default content but keep the file input
        const input = zone.querySelector('.file-input');
        zone.innerHTML = '';
        const label = document.createElement('span');
        label.className = 'drop-label';
        label.textContent = 'Drop image or click';
        zone.appendChild(label);
        if (input) {
          zone.appendChild(input);
        } else {
          const newInput = document.createElement('input');
          newInput.type = 'file';
          newInput.accept = 'image/*';
          newInput.className = 'file-input';
          newInput.dataset.panel = panelId;
          newInput.addEventListener('change', (ev) => {
            if (ev.target.files.length > 0) handleFile(panelId, ev.target.files[0], zone);
          });
          zone.appendChild(newInput);
        }
      }

      // Clear meta display
      const meta = document.querySelector(`.image-meta[data-panel="${panelId}"]`);
      if (meta) meta.innerHTML = '';
    }
    notifyChange();
  }

  /**
   * Open gallery popover for a panel — fetches all Wikipedia images for the current hero.
   */
  async function openGallery(panelId) {
    const title = Form.getWikiTitle();
    if (!title) return;

    // Close any existing gallery
    closeGallery();

    const uploadSection = document.getElementById(`upload-${panelId}`);
    if (!uploadSection) return;

    // Create gallery container
    const gallery = document.createElement('div');
    gallery.className = 'image-gallery';
    gallery.id = 'active-gallery';
    gallery.dataset.panel = panelId;

    // Header with close button
    const header = document.createElement('div');
    header.className = 'gallery-header';
    header.innerHTML = `<span class="gallery-title">Wikipedia images</span>`;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'gallery-close';
    closeBtn.textContent = '\u00D7';
    closeBtn.addEventListener('click', closeGallery);
    header.appendChild(closeBtn);
    gallery.appendChild(header);

    // Loading state
    const loading = document.createElement('div');
    loading.className = 'gallery-loading';
    loading.innerHTML = '<div class="lookup-spinner"></div><div>Loading images\u2026</div>';
    gallery.appendChild(loading);

    uploadSection.appendChild(gallery);

    // Dismiss when clicking outside
    setTimeout(() => {
      document.addEventListener('mousedown', handleGalleryOutsideClick);
    }, 0);

    // Fetch images
    try {
      const res = await fetch('/api/hero/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      const data = await res.json();

      // Remove loading indicator
      loading.remove();

      if (!data.images || data.images.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'gallery-empty';
        empty.textContent = 'No alternative images found';
        gallery.appendChild(empty);
        return;
      }

      // Build thumbnail grid
      const grid = document.createElement('div');
      grid.className = 'gallery-grid';

      for (const img of data.images) {
        const cell = document.createElement('div');
        cell.className = 'gallery-thumb';
        cell.addEventListener('click', () => selectGalleryImage(panelId, img.url));

        const thumb = document.createElement('img');
        thumb.src = img.thumb;
        thumb.alt = img.filename;
        thumb.loading = 'lazy';
        cell.appendChild(thumb);

        const dims = document.createElement('span');
        dims.className = 'gallery-dims';
        dims.textContent = `${img.width}\u00D7${img.height}`;
        cell.appendChild(dims);

        grid.appendChild(cell);
      }

      gallery.appendChild(grid);
    } catch (err) {
      loading.remove();
      const errDiv = document.createElement('div');
      errDiv.className = 'gallery-empty';
      errDiv.textContent = 'Failed to load images';
      gallery.appendChild(errDiv);
    }
  }

  /**
   * Select a gallery image — download via existing proxy then load into panel.
   */
  async function selectGalleryImage(panelId, url) {
    closeGallery();

    try {
      const res = await fetch('/api/images/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data.filename) {
        loadFromServer(panelId, data);
      }
    } catch (err) {
      console.error('Gallery selection error:', err);
    }
  }

  /**
   * Close any open gallery popover.
   */
  function closeGallery() {
    const existing = document.getElementById('active-gallery');
    if (existing) existing.remove();
    document.removeEventListener('mousedown', handleGalleryOutsideClick);
  }

  function handleGalleryOutsideClick(e) {
    const gallery = document.getElementById('active-gallery');
    if (gallery && !gallery.contains(e.target) && !e.target.classList.contains('btn-gallery')) {
      closeGallery();
    }
  }

  /**
   * Manually set an image's position (from drag reposition on preview panel).
   */
  function setImagePosition(panelId, position) {
    const img = uploadedImages[panelId];
    if (img) {
      img.position = position;
      img.manualPosition = true;
      notifyChange();
    }
  }

  return {
    init,
    getImages,
    getImage,
    updateDpiBadges,
    loadFromServer,
    loadFileToPanel,
    setImagePosition,
    clearAll,
    openGallery,
    closeGallery
  };
})();

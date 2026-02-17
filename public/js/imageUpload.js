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

      // Click to upload
      zone.addEventListener('click', (e) => {
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
      }
    } catch (err) {
      console.error('Upload error:', err);
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

  return {
    init,
    getImages,
    getImage,
    updateDpiBadges
  };
})();

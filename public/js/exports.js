/**
 * Export Controller — handles print PDF and HTML export actions.
 */

window.Exports = (function() {
  let getHeroDataFn = null;

  function init(getHeroData) {
    getHeroDataFn = getHeroData;

    document.getElementById('btn-export-pdf').addEventListener('click', exportDesignPdf);
    document.getElementById('btn-export-html').addEventListener('click', exportHtml);
    document.getElementById('btn-export-print-image').addEventListener('click', exportPrintImage);
    document.getElementById('btn-export-spec-sheet').addEventListener('click', exportSpecSheet);
  }

  function showStatus(message, type) {
    const el = document.getElementById('export-status');
    el.innerHTML = `<div class="${type}">${message}</div>`;
    if (type === 'success') {
      setTimeout(() => { el.innerHTML = ''; }, 8000);
    }
  }

  async function exportDesignPdf() {
    const heroData = getHeroDataFn();
    if (!heroData.name) {
      showStatus('Enter a hero name first', 'error');
      return;
    }

    showStatus('Generating print-ready PDF (this may take a moment)...', 'loading');
    try {
      const rendererHtml = Renderer.getPreviewHtml();

      const res = await fetch('/api/exports/design-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroData, rendererHtml })
      });
      const data = await res.json();

      if (data.success) {
        const sizeInfo = `${data.matSize.width}" \u00D7 ${data.matSize.height}"`;
        showStatus(`Generated: ${data.filename} (${sizeInfo} mat)`, 'success');
        downloadFile(data.downloadUrl, data.filename);
      } else {
        showStatus(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showStatus(`Error: ${err.message}`, 'error');
    }
  }

  async function exportHtml() {
    const heroData = getHeroDataFn();
    if (!heroData.name) {
      showStatus('Enter a hero name first', 'error');
      return;
    }

    showStatus('Generating self-contained HTML...', 'loading');
    try {
      const rendererHtml = Renderer.getPreviewHtml();

      const res = await fetch('/api/exports/html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroData, rendererHtml })
      });
      const data = await res.json();

      if (data.success) {
        showStatus(`Generated: ${data.filename}`, 'success');
        downloadFile(data.downloadUrl, data.filename);
      } else {
        showStatus(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showStatus(`Error: ${err.message}`, 'error');
    }
  }

  async function exportPrintImage() {
    const heroData = getHeroDataFn();
    if (!heroData.name) {
      showStatus('Enter a hero name first', 'error');
      return;
    }

    showStatus('Generating print-ready PNG (this may take a moment)...', 'loading');
    try {
      const rendererHtml = Renderer.getPreviewHtml();

      const res = await fetch('/api/exports/print-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroData, rendererHtml })
      });
      const data = await res.json();

      if (data.success) {
        const sizeInfo = `${data.pixels.width} × ${data.pixels.height} px @ ${data.dpi} DPI`;
        let statusHtml = `Generated: ${data.filename} (${sizeInfo})`;

        // Show resolution report
        if (data.resolutionReport && data.resolutionReport.length > 0) {
          statusHtml += '<div style="margin-top:6px;font-size:11px;">';
          for (const r of data.resolutionReport) {
            const icon = r.status === 'GREEN' ? '&#9679;' : r.status === 'YELLOW' ? '&#9679;' : '&#9679;';
            const color = r.status === 'GREEN' ? '#4a4' : r.status === 'YELLOW' ? '#ca2' : '#c44';
            statusHtml += `<div><span style="color:${color}">${icon}</span> ${r.label}: ${r.dpi} DPI — ${r.message}</div>`;
          }
          statusHtml += '</div>';
        }

        showStatus(statusHtml, 'success');
        downloadFile(data.downloadUrl, data.filename);
      } else {
        showStatus(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showStatus(`Error: ${err.message}`, 'error');
    }
  }

  async function exportSpecSheet() {
    const heroData = getHeroDataFn();
    if (!heroData.name) {
      showStatus('Enter a hero name first', 'error');
      return;
    }

    showStatus('Generating spec sheet...', 'loading');
    try {
      const res = await fetch('/api/exports/spec-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData)
      });
      const data = await res.json();

      if (data.success) {
        showStatus(`Generated: ${data.filename}`, 'success');
        downloadFile(data.downloadUrl, data.filename);
      } else {
        showStatus(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showStatus(`Error: ${err.message}`, 'error');
    }
  }

  function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return { init };
})();

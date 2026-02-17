/**
 * Export Controller — handles InDesign JSX, bio PDF, and HTML export actions.
 */

window.Exports = (function() {
  let getHeroDataFn = null;

  function init(getHeroData) {
    getHeroDataFn = getHeroData;

    document.getElementById('btn-export-jsx').addEventListener('click', exportJsx);
    document.getElementById('btn-export-pdf').addEventListener('click', exportPdf);
    document.getElementById('btn-export-html').addEventListener('click', exportHtml);
  }

  function showStatus(message, type) {
    const el = document.getElementById('export-status');
    el.innerHTML = `<div class="${type}">${message}</div>`;
    if (type === 'success') {
      setTimeout(() => { el.innerHTML = ''; }, 5000);
    }
  }

  async function exportJsx() {
    const heroData = getHeroDataFn();
    if (!heroData.name) {
      showStatus('Enter a hero name first', 'error');
      return;
    }

    showStatus('Generating InDesign script...', 'loading');
    try {
      const res = await fetch('/api/exports/jsx', {
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

  async function exportPdf() {
    const heroData = getHeroDataFn();
    if (!heroData.name) {
      showStatus('Enter a hero name first', 'error');
      return;
    }

    showStatus('Generating bio panel PDF (this may take a moment)...', 'loading');
    try {
      const res = await fetch('/api/exports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData)
      });
      const data = await res.json();

      if (data.success) {
        const sizeInfo = `${data.panelSize.width.toFixed(2)}" × ${data.panelSize.height.toFixed(2)}"`;
        showStatus(`Generated: ${data.filename} (${sizeInfo})`, 'success');
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

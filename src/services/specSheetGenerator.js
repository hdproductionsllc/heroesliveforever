/**
 * Spec Sheet Generator — renders a dimension reference PDF for the
 * 3D print operator using Puppeteer.
 *
 * Contains frame, mat, and print dimensions plus a nested-rectangle diagram.
 */

const puppeteer = require('puppeteer');
const { frameSizes, printDimensions, layouts } = require('../data/layouts');
const { calculateLayout } = require('./layoutEngine');

/**
 * Generate a dimension spec sheet PDF.
 *
 * @param {Object} heroData - Full hero data from the form
 * @param {string} outputPath - Where to save the PDF
 * @returns {{ path: string }}
 */
async function generateSpecSheet(heroData, outputPath) {
  const frame = frameSizes[heroData.frameSize];
  if (!frame) throw new Error(`Unknown frame size: ${heroData.frameSize}`);

  const layout = calculateLayout(heroData.frameSize, heroData.layout);
  const layoutDef = layouts[heroData.layout];

  const { frameBorder, matPadding, bleed, dpi: targetDpi, panelGap } = printDimensions;

  const openingWidth = frame.width - 2 * frameBorder - 2 * matPadding;
  const openingHeight = frame.height - 2 * frameBorder - 2 * matPadding;
  const printWidthIn = openingWidth + 2 * bleed;
  const printHeightIn = openingHeight + 2 * bleed;

  // Cap DPI for pixel calculation
  const maxPx = 6400;
  const longestEdge = Math.max(printWidthIn, printHeightIn);
  const effectiveDpi = Math.min(targetDpi, maxPx / longestEdge);
  const widthPx = Math.round(printWidthIn * effectiveDpi);
  const heightPx = Math.round(printHeightIn * effectiveDpi);
  const actualDpi = Math.round(Math.min(widthPx / printWidthIn, heightPx / printHeightIn));

  const panels = layout.panels.inches;

  const html = buildSpecHtml(heroData, frame, layoutDef, {
    frameBorder, matPadding, bleed, panelGap,
    openingWidth, openingHeight,
    printWidthIn, printHeightIn,
    widthPx, heightPx, actualDpi,
    panels
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    })
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });

    return { path: outputPath };
  } finally {
    await browser.close();
  }
}

function buildSpecHtml(heroData, frame, layoutDef, dims) {
  const {
    frameBorder, matPadding, bleed, panelGap,
    openingWidth, openingHeight,
    printWidthIn, printHeightIn,
    widthPx, heightPx, actualDpi,
    panels
  } = dims;

  const fmt = (n) => (Math.round(n * 1000) / 1000).toString();

  // Build panel rows
  const panelRows = panels.map((p, i) => `
    <tr>
      <td>${p.label || p.id}</td>
      <td>${p.type}</td>
      <td>${fmt(p.x)}"</td>
      <td>${fmt(p.y)}"</td>
      <td>${fmt(p.width)}"</td>
      <td>${fmt(p.height)}"</td>
    </tr>
  `).join('');

  // Diagram scale: fit the frame into a 300px wide box
  const diagramScale = 300 / Math.max(frame.width, frame.height);
  const dW = frame.width * diagramScale;
  const dH = frame.height * diagramScale;
  const dFB = frameBorder * diagramScale;
  const dMP = matPadding * diagramScale;
  const dOW = openingWidth * diagramScale;
  const dOH = openingHeight * diagramScale;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11px;
    color: #222;
    line-height: 1.5;
  }
  h1 { font-size: 18px; margin-bottom: 4px; }
  h2 { font-size: 13px; color: #555; margin-bottom: 12px; font-weight: normal; }
  h3 { font-size: 12px; margin: 16px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
  .header { margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .specs-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .specs-table th, .specs-table td {
    text-align: left; padding: 3px 8px; border-bottom: 1px solid #eee;
  }
  .specs-table th { font-weight: 600; color: #444; }
  .specs-table .label { color: #666; width: 45%; }
  .specs-table .value { font-weight: 500; }
  .panel-table { width: 100%; border-collapse: collapse; font-size: 10px; }
  .panel-table th, .panel-table td {
    text-align: left; padding: 2px 6px; border-bottom: 1px solid #eee;
  }
  .panel-table th { font-weight: 600; color: #444; background: #f5f5f5; }
  .diagram-wrap { display: flex; justify-content: center; margin-top: 10px; }
  .diagram {
    position: relative;
    width: ${dW}px;
    height: ${dH}px;
    border: 2px solid #333;
    background: #d4a574;
  }
  .diagram .mat {
    position: absolute;
    left: ${dFB}px; top: ${dFB}px;
    width: ${dW - 2 * dFB}px;
    height: ${dH - 2 * dFB}px;
    background: #e8e0d4;
    border: 1px solid #999;
  }
  .diagram .opening {
    position: absolute;
    left: ${dMP}px; top: ${dMP}px;
    width: ${dOW}px;
    height: ${dOH}px;
    background: #f9f6f0;
    border: 1px dashed #888;
  }
  .dim-annotation {
    position: absolute; font-size: 8px; color: #666;
    white-space: nowrap;
  }
  .footer { margin-top: 16px; font-size: 9px; color: #888; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(heroData.name || 'Hero')} — Production Spec Sheet</h1>
    <h2>${frame.width}" × ${frame.height}" frame &nbsp;|&nbsp; ${layoutDef ? layoutDef.label : heroData.layout}</h2>
  </div>

  <div class="grid">
    <div>
      <h3>Frame Dimensions</h3>
      <table class="specs-table">
        <tr><td class="label">Outer frame</td><td class="value">${frame.width}" × ${frame.height}"</td></tr>
        <tr><td class="label">Frame border width</td><td class="value">${frameBorder}"</td></tr>
        <tr><td class="label">Aspect ratio</td><td class="value">${frame.aspect}</td></tr>
      </table>

      <h3>Mat Dimensions</h3>
      <table class="specs-table">
        <tr><td class="label">Mat outer</td><td class="value">${fmt(frame.width - 2 * frameBorder)}" × ${fmt(frame.height - 2 * frameBorder)}"</td></tr>
        <tr><td class="label">Mat border width</td><td class="value">${matPadding}"</td></tr>
        <tr><td class="label">Mat opening</td><td class="value">${fmt(openingWidth)}" × ${fmt(openingHeight)}"</td></tr>
      </table>

      <h3>Print Image</h3>
      <table class="specs-table">
        <tr><td class="label">Print area (with bleed)</td><td class="value">${fmt(printWidthIn)}" × ${fmt(printHeightIn)}"</td></tr>
        <tr><td class="label">Bleed</td><td class="value">${bleed}" per side</td></tr>
        <tr><td class="label">Resolution</td><td class="value">${actualDpi} DPI</td></tr>
        <tr><td class="label">Pixel dimensions</td><td class="value">${widthPx} × ${heightPx} px</td></tr>
        <tr><td class="label">Panel gap</td><td class="value">${panelGap}"</td></tr>
      </table>
    </div>

    <div>
      <h3>Diagram</h3>
      <div class="diagram-wrap">
        <div class="diagram">
          <div class="dim-annotation" style="top: -14px; left: 50%; transform: translateX(-50%);">${frame.width}"</div>
          <div class="dim-annotation" style="left: -30px; top: 50%; transform: translateY(-50%) rotate(-90deg);">${frame.height}"</div>
          <div class="mat">
            <div class="dim-annotation" style="top: -12px; left: 50%; transform: translateX(-50%); font-size: 7px;">${frameBorder}" border</div>
            <div class="opening">
              <div class="dim-annotation" style="top: 2px; left: 50%; transform: translateX(-50%); font-size: 7px;">${fmt(openingWidth)}" × ${fmt(openingHeight)}"</div>
              <div class="dim-annotation" style="top: -12px; left: 50%; transform: translateX(-50%); font-size: 7px;">${matPadding}" mat</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <h3>Panel Positions (relative to mat opening)</h3>
  <table class="panel-table">
    <thead>
      <tr><th>Panel</th><th>Type</th><th>X</th><th>Y</th><th>Width</th><th>Height</th></tr>
    </thead>
    <tbody>
      ${panelRows}
    </tbody>
  </table>

  <div class="footer">
    Heroes Live Forever — Generated ${new Date().toISOString().split('T')[0]}
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { generateSpecSheet };

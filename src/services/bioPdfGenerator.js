/**
 * Bio Panel PDF Generator — renders the bio panel HTML at 300 DPI using Puppeteer.
 * Outputs a print-ready PDF at exact physical dimensions.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { resolveTheme } = require('./themeEngine');

/**
 * Generate a print-ready bio panel PDF.
 *
 * @param {Object} heroData - Full hero data
 * @param {Object} panelDims - { width, height } in inches
 * @param {string} outputPath - Where to save the PDF
 * @returns {string} Path to the generated PDF
 */
async function generateBioPdf(heroData, panelDims, outputPath) {
  const theme = resolveTheme({
    category: heroData.category,
    subcategory: heroData.subcategory,
    team: heroData.team,
    colorDb: heroData.colorDb
  });

  const widthIn = panelDims.width;
  const heightIn = panelDims.height;
  const dpi = 300;
  const widthPx = Math.round(widthIn * dpi);
  const heightPx = Math.round(heightIn * dpi);

  // Scale factor: how many CSS px per inch at 300 DPI
  // Puppeteer renders at 96 CSS px per inch by default.
  // To get 300 DPI, we render at larger CSS px and let the PDF scale.
  const cssPxPerInch = 96;
  const cssWidth = widthIn * cssPxPerInch;
  const cssHeight = heightIn * cssPxPerInch;

  // Font paths
  const fontsDir = path.join(__dirname, '..', '..', 'public', 'fonts');

  const displayFont = theme.typography.display.family.split("'")[1] || 'Cormorant Garamond';
  const bodyFont = theme.typography.body.family.split("'")[1] || 'EB Garamond';
  const quoteFont = theme.typography.quote.family.split("'")[1] || 'Cormorant Garamond';

  // Build HTML for the bio panel
  const html = buildBioHtml(heroData, theme, cssWidth, cssHeight, fontsDir, {
    displayFont, bodyFont, quoteFont
  });

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    width: `${widthIn}in`,
    height: `${heightIn}in`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true
  });

  await browser.close();
  return outputPath;
}

/**
 * Build the bio panel HTML for PDF rendering.
 */
function buildBioHtml(heroData, theme, width, height, fontsDir, fonts) {
  const bio = theme.bio;
  const typo = theme.typography;
  const sizes = typo.sizes;

  // Scale sizes for print (larger than preview)
  const scale = width / 250; // 250px was roughly the bio panel width at 620px preview

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;700&family=Bebas+Neue&family=Archivo+Black&family=Source+Sans+3:wght@400;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    size: ${width}px ${height}px;
    margin: 0;
  }

  body {
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    font-family: ${typo.body.family};
  }

  .bio-panel {
    width: 100%;
    height: 100%;
    background: ${bio.background};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 ${14 * scale / 3}px;
    text-align: center;
    position: relative;
  }

  .bio-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${bio.overlay || 'none'};
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  .name {
    font-family: ${typo.display.family};
    font-size: ${sizes.name.fontSize * scale / 3}px;
    letter-spacing: ${sizes.name.letterSpacing * scale / 3}px;
    color: ${bio.nameColor};
    font-weight: ${typo.display.weight};
    text-transform: uppercase;
  }

  .dates {
    font-size: ${sizes.dates.fontSize * scale / 3}px;
    letter-spacing: ${sizes.dates.letterSpacing * scale / 3}px;
    color: ${bio.datesColor};
    margin-bottom: ${5 * scale / 3}px;
    font-weight: 300;
  }

  .divider {
    width: ${36 * scale / 3}px;
    height: 1px;
    background: ${bio.divider};
    margin-bottom: ${6 * scale / 3}px;
  }

  .text {
    font-size: ${sizes.bioText.fontSize * scale / 3}px;
    line-height: ${sizes.bioText.lineHeight};
    color: ${bio.textColor};
    max-width: ${sizes.bioText.maxWidth * scale / 3}px;
    text-align: center;
    margin-bottom: ${7 * scale / 3}px;
  }

  .quote {
    font-family: ${typo.quote.family};
    font-size: ${sizes.quote.fontSize * scale / 3}px;
    line-height: ${sizes.quote.lineHeight};
    color: ${bio.quoteColor};
    font-style: ${typo.quote.style || 'italic'};
    font-weight: ${typo.quote.weight};
    max-width: ${sizes.quote.maxWidth * scale / 3}px;
    margin-bottom: ${3 * scale / 3}px;
  }

  .attribution {
    font-size: ${sizes.attribution.fontSize * scale / 3}px;
    letter-spacing: ${sizes.attribution.letterSpacing * scale / 3}px;
    color: ${bio.attributionColor};
    text-transform: uppercase;
    font-family: sans-serif;
  }
</style>
</head>
<body>
  <div class="bio-panel">
    <div class="name">${escapeHtml(heroData.name || '')}</div>
    <div class="dates">${escapeHtml(heroData.dates || '')}</div>
    <div class="divider"></div>
    <div class="text">${escapeHtml(heroData.bio || '')}</div>
    ${heroData.quote ? `<div class="quote">\u201C${escapeHtml(heroData.quote)}\u201D</div>` : ''}
    ${heroData.attribution ? `<div class="attribution">${escapeHtml(heroData.attribution)}</div>` : ''}
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

module.exports = { generateBioPdf };

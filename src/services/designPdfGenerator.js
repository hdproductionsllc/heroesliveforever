/**
 * Full Design PDF Generator — renders the complete mat (minus frame border)
 * at print quality using Puppeteer.
 *
 * Takes the live preview HTML from the client, embeds images as base64,
 * strips the decorative frame border, and scales the design to exact
 * physical mat dimensions for direct-to-printer output.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { frameSizes, printDimensions } = require('../data/layouts');

/**
 * Generate a print-ready full design PDF.
 *
 * @param {Object} heroData - Full hero data from the form
 * @param {string} rendererHtml - outerHTML from Renderer.getPreviewHtml()
 * @param {string} outputPath - Where to save the PDF
 * @returns {{ path: string, matWidth: number, matHeight: number }}
 */
async function generateDesignPdf(heroData, rendererHtml, outputPath) {
  const frame = frameSizes[heroData.frameSize];
  if (!frame) throw new Error(`Unknown frame size: ${heroData.frameSize}`);

  // Mat = frame minus the physical frame border on each side
  const matWidthIn = frame.width - 2 * printDimensions.frameBorder;
  const matHeightIn = frame.height - 2 * printDimensions.frameBorder;

  // Embed uploaded images as base64 data URLs
  const html = embedImages(heroData, rendererHtml);

  // Build full HTML document for Puppeteer
  const fullHtml = buildPrintHtml(html, matWidthIn, matHeightIn);

  // CSS pixel dimensions at 96 px/inch (standard browser DPI)
  const cssWidth = Math.round(matWidthIn * 96);
  const cssHeight = Math.round(matHeightIn * 96);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: cssWidth, height: cssHeight });
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  // Strip the frame border, fix aspect ratio, and scale to fill print page
  await page.evaluate((pageW, pageH) => {
    // Remove preview-only decorative elements
    document.querySelectorAll('.dim-side, .dim-label, .preview-title').forEach(el => el.remove());

    const frameWrap = document.querySelector('.frame-wrap');
    if (!frameWrap) return;

    // The frame div is the first child of .frame-wrap
    const frameDiv = frameWrap.children[0];
    if (!frameDiv) return;

    // Strip the physical frame border (we're printing the mat only)
    frameDiv.style.border = 'none';
    frameDiv.style.borderImage = 'none';
    frameDiv.style.boxShadow = 'none';

    // Fix mat border overflow: include border in its dimensions
    const matDiv = frameDiv.children[0];
    if (matDiv) matDiv.style.boxSizing = 'border-box';

    // Measure the frame div's visible area after border removal.
    const rect = frameDiv.getBoundingClientRect();

    // The preview uses screen-optimized proportions that don't match the
    // physical mat aspect ratio. Adjust the frame so the content fills
    // the print page without gaps on any side.
    const pageAspect = pageW / pageH;
    const contentAspect = rect.width / rect.height;
    const padding = parseFloat(frameDiv.style.padding) || 0;

    if (Math.abs(pageAspect - contentAspect) > 0.001) {
      if (contentAspect > pageAspect) {
        // Content too wide relative to height — increase height
        const targetH = rect.width / pageAspect;
        frameDiv.style.height = (targetH - 2 * padding) + 'px';
      } else {
        // Content too tall relative to width — increase width
        const targetW = rect.height * pageAspect;
        frameDiv.style.width = (targetW - 2 * padding) + 'px';
      }
    }

    // Re-measure after aspect correction and scale uniformly to fill
    const adjusted = frameDiv.getBoundingClientRect();
    const scale = pageW / adjusted.width;
    frameDiv.style.transformOrigin = 'top left';
    frameDiv.style.transform = `scale(${scale})`;

    // Size the wrapper to the page
    frameWrap.style.width = pageW + 'px';
    frameWrap.style.height = pageH + 'px';
    frameWrap.style.overflow = 'hidden';
  }, cssWidth, cssHeight);

  await page.pdf({
    path: outputPath,
    width: `${matWidthIn}in`,
    height: `${matHeightIn}in`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true
  });

  await browser.close();
  return { path: outputPath, matWidth: matWidthIn, matHeight: matHeightIn };
}

/**
 * Replace image src URLs in the HTML with base64 data URLs.
 * Mirrors the logic in htmlExporter.js.
 */
function embedImages(heroData, html) {
  let result = html;
  if (!heroData.images) return result;

  for (const [key, img] of Object.entries(heroData.images)) {
    if (img && img.serverPath && img.filename) {
      try {
        const data = fs.readFileSync(img.serverPath);
        const ext = path.extname(img.serverPath).slice(1).toLowerCase();
        const mime = ext === 'jpg' ? 'jpeg' : ext;
        const dataUrl = `data:image/${mime};base64,${data.toString('base64')}`;
        const escaped = img.filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(
          new RegExp(`src="[^"]*${escaped}[^"]*"`, 'g'),
          `src="${dataUrl}"`
        );
      } catch (e) {
        // Skip if file not found
      }
    }
  }

  return result;
}

/**
 * Build the full HTML document for Puppeteer rendering.
 * Includes Google Fonts, renderer panel styles, and the design content.
 */
function buildPrintHtml(contentHtml, matWidthIn, matHeightIn) {
  const cssWidth = Math.round(matWidthIn * 96);
  const cssHeight = Math.round(matHeightIn * 96);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;700&family=Bebas+Neue&family=Archivo+Black&family=Source+Sans+3:wght@400;600&display=swap');

  * { margin: 0; padding: 0; }

  @page {
    size: ${matWidthIn}in ${matHeightIn}in;
    margin: 0;
  }

  body {
    width: ${cssWidth}px;
    height: ${cssHeight}px;
    overflow: hidden;
  }

  /* Hide preview-only elements */
  .dim-side, .dim-label, .preview-title {
    display: none !important;
  }

  /* Structural panel styles (from renderer.css) */
  .frame-wrap { position: relative; }
  .panel { overflow: hidden; position: relative; }
  .panel img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    user-select: none;
  }
  .panel .placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #333;
    font-family: sans-serif; letter-spacing: 1px; text-transform: uppercase;
  }
  .panel .cap {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 10px 10px 7px;
    font-size: 7px; letter-spacing: 2px;
    text-transform: uppercase; font-family: sans-serif; text-align: right;
  }
  .bio-overlay {
    position: absolute; inset: 0;
    pointer-events: none; mix-blend-mode: multiply;
  }
  .bio-bevel {
    position: absolute; inset: 0;
    box-shadow:
      inset 0 1px 4px rgba(0,0,0,0.12),
      inset 0 -1px 2px rgba(255,240,200,0.06),
      inset 1px 0 3px rgba(0,0,0,0.06);
    pointer-events: none;
  }

  /* Remove grab cursor for print */
  .panel[data-panel] { cursor: default; }
</style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;
}

module.exports = { generateDesignPdf };

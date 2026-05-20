/**
 * Print Image Generator — renders the mat opening content as a high-res PNG
 * with bleed for large-format inkjet printing.
 *
 * Takes the renderer HTML, strips frame border and mat border, renders at
 * print DPI via Puppeteer screenshot, then embeds DPI metadata with sharp.
 */

const puppeteer = require('puppeteer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { frameSizes, printDimensions } = require('../data/layouts');
const { calculateLayout } = require('./layoutEngine');
const { checkResolution } = require('./resolutionChecker');
const { imageToDataUrl } = require('../utils/imageUtils');

const MAX_PIXELS = 6400;

/**
 * Generate a print-ready PNG of the mat opening content.
 *
 * @param {Object} heroData - Full hero data from the form
 * @param {string} rendererHtml - outerHTML from Renderer.getPreviewHtml()
 * @param {string} outputPath - Where to save the PNG
 * @returns {{ path, widthIn, heightIn, widthPx, heightPx, dpi, resolutionReport }}
 */
async function generatePrintImage(heroData, rendererHtml, outputPath) {
  const frame = frameSizes[heroData.frameSize];
  if (!frame) throw new Error(`Unknown frame size: ${heroData.frameSize}`);

  const { bleed, dpi: targetDpi } = printDimensions;

  // Pull canonical dimensions from layout engine — honors per-frame molding
  // and printW/printH overrides.
  const layout = calculateLayout(heroData.frameSize, heroData.layout);
  const moldingIn = layout.dimensions.moldingIn;
  const matWidthIn = layout.dimensions.matPaddingIn;
  const matHeightIn = layout.dimensions.matPaddingHeightIn;

  const openingWidth = frame.width - 2 * moldingIn - 2 * matWidthIn;
  const openingHeight = frame.height - 2 * moldingIn - 2 * matHeightIn;

  // When the frame has a standard print size (sleek, 8×10, 8.5×11, etc.) the
  // PNG matches that exactly so it goes straight to a print lab. Otherwise we
  // export the opening + bleed for custom-cut sheets.
  const printWidthIn = frame.printW || (openingWidth + 2 * bleed);
  const printHeightIn = frame.printH || (openingHeight + 2 * bleed);

  // Margin from sheet edge to the visible inner opening. For sleek frames this
  // is the overlap the molding hides; for custom-cut sheets it's the trim
  // bleed. Either way, the design must sit centered in the inner area and the
  // margin must be filled with the mat color — otherwise the slipped-in print
  // shows a visible band of wrong color along the molding edge.
  const sheetMarginXIn = Math.max(0, (printWidthIn - openingWidth) / 2);
  const sheetMarginYIn = Math.max(0, (printHeightIn - openingHeight) / 2);

  // Calculate pixel dimensions, capped at MAX_PIXELS
  const longestEdge = Math.max(printWidthIn, printHeightIn);
  const effectiveDpi = Math.min(targetDpi, MAX_PIXELS / longestEdge);
  let widthPx = Math.round(printWidthIn * effectiveDpi);
  let heightPx = Math.round(printHeightIn * effectiveDpi);

  // Ensure we don't exceed cap
  if (widthPx > MAX_PIXELS) widthPx = MAX_PIXELS;
  if (heightPx > MAX_PIXELS) heightPx = MAX_PIXELS;

  const actualDpi = Math.round(Math.min(widthPx / printWidthIn, heightPx / printHeightIn));

  // Run resolution checks on source images
  const resolutionReport = await checkSourceImages(heroData);

  // Embed uploaded images as base64
  const html = embedImages(heroData, rendererHtml);

  // Build clean HTML for the print area only
  const fullHtml = buildPrintHtml(html, printWidthIn, printHeightIn);

  // Puppeteer viewport in CSS pixels (96 DPI), scale factor gets us to print DPI
  const cssWidth = Math.round(printWidthIn * 96);
  const cssHeight = Math.round(printHeightIn * 96);
  const deviceScaleFactor = actualDpi / 96;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    })
  });
  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: cssWidth,
      height: cssHeight,
      deviceScaleFactor
    });
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Ensure all web fonts are loaded before screenshot — otherwise glyphs
    // get rasterized as fallback fonts.
    await page.evaluate(() => document.fonts.ready);

    // Convert the rendered preview into a print sheet:
    //   1. Measure the mat WHILE the frame border is intact — the mat's
    //      `width: 100%` resolves against the frame's content box, which is
    //      exactly the inner opening (frame outer minus molding minus visible
    //      mat). Strip the border later and the mat balloons to the full
    //      outer frame size.
    //   2. Scale that mat to fit the print sheet's inner area (Math.min so
    //      nothing crops), centered.
    //   3. Paint the surrounding margin in the mat's own color so the strip
    //      hidden behind the molding (sleek) or trimmed off (matted) reads as
    //      a seamless extension of the design.
    await page.evaluate((pageW, pageH, marginX, marginY) => {
      // Remove preview-only elements
      document.querySelectorAll('.dim-side, .dim-label, .preview-title, .divider-handle').forEach(el => el.remove());

      const frameWrap = document.querySelector('.frame-wrap');
      if (!frameWrap) return;

      const frameDiv = frameWrap.children[0];
      if (!frameDiv) return;

      const matDiv = frameDiv.children[0];
      if (!matDiv) return;

      // Capture the mat color and its inner-opening dimensions BEFORE any
      // mutation. Order matters: stripping the frame border first would expand
      // the frame's content box and make the mat re-resolve to the outer frame
      // size instead of the inner opening.
      // Prefer the inline shorthand (preserves gradients); fall back to the
      // computed solid color for any theme that only sets background-color.
      const matBg = matDiv.style.background || window.getComputedStyle(matDiv).backgroundColor || '#2c2c2c';
      const rect = matDiv.getBoundingClientRect();
      const matW = rect.width;
      const matH = rect.height;

      // Lock mat dimensions in absolute pixels so neither the upcoming frame
      // resize nor any layout reflow can change them.
      matDiv.style.width = `${matW}px`;
      matDiv.style.height = `${matH}px`;

      // Now safe to strip the frame's preview-only chrome.
      frameDiv.style.border = 'none';
      frameDiv.style.borderImage = 'none';
      frameDiv.style.boxShadow = 'none';
      frameDiv.style.padding = '0';

      // Fit the design into the print sheet's inner area (the part that's
      // visible through the molding, or the trim area for cut-down sheets).
      const innerW = pageW - 2 * marginX;
      const innerH = pageH - 2 * marginY;
      const scale = Math.min(innerW / matW, innerH / matH);

      const scaledW = matW * scale;
      const scaledH = matH * scale;
      const offsetX = marginX + (innerW - scaledW) / 2;
      const offsetY = marginY + (innerH - scaledH) / 2;

      matDiv.style.transformOrigin = 'top left';
      matDiv.style.transform = `scale(${scale})`;
      matDiv.style.position = 'absolute';
      matDiv.style.left = `${offsetX}px`;
      matDiv.style.top = `${offsetY}px`;

      // Frame becomes the print sheet, painted with mat color so the margin
      // around the scaled design reads as continuous mat.
      frameDiv.style.position = 'relative';
      frameDiv.style.width = `${pageW}px`;
      frameDiv.style.height = `${pageH}px`;
      frameDiv.style.overflow = 'hidden';
      frameDiv.style.background = matBg;

      frameWrap.style.width = `${pageW}px`;
      frameWrap.style.height = `${pageH}px`;
      frameWrap.style.overflow = 'hidden';

      document.body.style.background = matBg;
    }, cssWidth, cssHeight, Math.round(sheetMarginXIn * 96), Math.round(sheetMarginYIn * 96));

    // Take screenshot as raw PNG, then encode to JPG with sharp.
    // JPG at quality 92 is visually indistinguishable from lossless and
    // produces files ~5-10x smaller — the right format for print labs.
    const screenshotBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: cssWidth, height: cssHeight }
    });

    await sharp(screenshotBuffer)
      .withMetadata({ density: actualDpi })
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(outputPath);

    return {
      path: outputPath,
      widthIn: Math.round(printWidthIn * 1000) / 1000,
      heightIn: Math.round(printHeightIn * 1000) / 1000,
      widthPx,
      heightPx,
      dpi: actualDpi,
      resolutionReport
    };
  } finally {
    await browser.close();
  }
}

/**
 * Check resolution of all source images at their placed sizes.
 */
async function checkSourceImages(heroData) {
  const report = [];
  const layout = calculateLayout(heroData.frameSize, heroData.layout);
  const imagePanels = layout.panels.inches.filter(p => p.type === 'image');

  for (const panel of imagePanels) {
    const imgData = heroData.images && heroData.images[panel.id];
    if (!imgData || !imgData.serverPath) {
      report.push({
        panel: panel.id,
        label: panel.label,
        status: 'RED',
        dpi: 0,
        message: 'No image assigned'
      });
      continue;
    }

    const result = await checkResolution(imgData.serverPath, panel.width, panel.height);
    report.push({
      panel: panel.id,
      label: panel.label,
      status: result.status,
      dpi: result.dpi,
      sourceWidth: result.width,
      sourceHeight: result.height,
      message: result.message
    });
  }

  return report;
}

/**
 * Replace image src URLs with base64 data URLs.
 */
function embedImages(heroData, html) {
  let result = html;
  if (!heroData.images) return result;

  for (const [key, img] of Object.entries(heroData.images)) {
    if (img && img.serverPath && img.filename) {
      try {
        const dataUrl = imageToDataUrl(img.serverPath);
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
 * Build HTML document for Puppeteer print rendering.
 * Body fills the print sheet; the in-page script paints it with the actual
 * mat color once the renderer is mounted.
 */
function buildPrintHtml(contentHtml, printWidthIn, printHeightIn) {
  const cssWidth = Math.round(printWidthIn * 96);
  const cssHeight = Math.round(printHeightIn * 96);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;700&family=Bebas+Neue&family=Archivo+Black&family=Source+Sans+3:wght@400;600&display=swap');

  * { margin: 0; padding: 0; }

  body {
    width: ${cssWidth}px;
    height: ${cssHeight}px;
    overflow: hidden;
  }

  /* Hide preview-only elements */
  .dim-side, .dim-label, .preview-title, .divider-handle {
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

module.exports = { generatePrintImage };

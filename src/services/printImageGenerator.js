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

  const { frameBorder, matPadding, bleed, dpi: targetDpi } = printDimensions;

  // Print area = mat opening + bleed on each side
  const openingWidth = frame.width - 2 * frameBorder - 2 * matPadding;
  const openingHeight = frame.height - 2 * frameBorder - 2 * matPadding;
  const printWidthIn = openingWidth + 2 * bleed;
  const printHeightIn = openingHeight + 2 * bleed;

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
  const fullHtml = buildPrintHtml(html, printWidthIn, printHeightIn, bleed, matPadding);

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

    // Strip frame border and mat border, scale content to fill print area
    await page.evaluate((pageW, pageH, bleedPx, matPaddingPx) => {
      // Remove preview-only elements
      document.querySelectorAll('.dim-side, .dim-label, .preview-title, .divider-handle').forEach(el => el.remove());

      const frameWrap = document.querySelector('.frame-wrap');
      if (!frameWrap) return;

      const frameDiv = frameWrap.children[0];
      if (!frameDiv) return;

      // Strip frame border
      frameDiv.style.border = 'none';
      frameDiv.style.borderImage = 'none';
      frameDiv.style.boxShadow = 'none';
      frameDiv.style.padding = '0';

      // Find the mat div (first child of frame)
      const matDiv = frameDiv.children[0];
      if (!matDiv) return;

      // Strip mat border — we want just the opening content
      matDiv.style.border = 'none';
      matDiv.style.padding = '0';
      matDiv.style.boxSizing = 'border-box';

      // Measure the mat content area
      const rect = matDiv.getBoundingClientRect();

      // Scale to fill print area (minus bleed which is the mat background)
      const contentAreaW = pageW - 2 * bleedPx;
      const contentAreaH = pageH - 2 * bleedPx;
      const scale = Math.max(contentAreaW / rect.width, contentAreaH / rect.height);

      // Position: offset by bleed, then center
      const scaledW = rect.width * scale;
      const scaledH = rect.height * scale;
      const offsetX = bleedPx + (contentAreaW - scaledW) / 2;
      const offsetY = bleedPx + (contentAreaH - scaledH) / 2;

      matDiv.style.transformOrigin = 'top left';
      matDiv.style.transform = `scale(${scale})`;
      matDiv.style.position = 'absolute';
      matDiv.style.left = `${offsetX}px`;
      matDiv.style.top = `${offsetY}px`;

      // Hide frame div, just show mat content
      frameDiv.style.position = 'relative';
      frameDiv.style.width = `${pageW}px`;
      frameDiv.style.height = `${pageH}px`;
      frameDiv.style.overflow = 'hidden';
      frameDiv.style.background = 'none';

      frameWrap.style.width = `${pageW}px`;
      frameWrap.style.height = `${pageH}px`;
      frameWrap.style.overflow = 'hidden';
    }, cssWidth, cssHeight, Math.round(bleed * 96), Math.round(matPadding * 96));

    // Take screenshot as PNG
    const screenshotBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: cssWidth, height: cssHeight }
    });

    // Embed DPI metadata with sharp
    await sharp(screenshotBuffer)
      .withMetadata({ density: actualDpi })
      .png()
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
 * Body = print area with mat background color filling the bleed zone.
 */
function buildPrintHtml(contentHtml, printWidthIn, printHeightIn, bleedIn, matPaddingIn) {
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
    background: #2c2c2c; /* mat background for bleed zone */
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

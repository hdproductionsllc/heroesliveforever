/**
 * Layout Engine — converts frame size + layout type into exact panel positions.
 * Outputs both inches (for InDesign) and pixels (for browser preview).
 */

const { layouts, frameSizes, printDimensions } = require('../data/layouts');

/**
 * Calculate panel positions for a given frame size and layout.
 *
 * @param {string} frameSize - e.g. '24x24'
 * @param {string} layoutId - e.g. '3-panel'
 * @returns {Object} { inches: [...panels], pixels: [...panels], previewWidth, previewHeight }
 */
function calculateLayout(frameSize, layoutId) {
  const frame = frameSizes[frameSize];
  const layout = layouts[layoutId];

  if (!frame) throw new Error(`Unknown frame size: ${frameSize}`);
  if (!layout) throw new Error(`Unknown layout: ${layoutId}`);

  const { panelGap } = printDimensions;

  // Wood molding (frame face width) — per-frame override falls back to global.
  const moldingIn = frame.molding !== undefined ? frame.molding : printDimensions.frameBorder;

  // Visible mat width — derived from print size when specified, else global default.
  // Matches renderer.js logic: total padding = molding + visible mat.
  let matInchesW, matInchesH;
  if (frame.printW && frame.printH) {
    matInchesW = Math.max(0, (frame.width - frame.printW) / 2 - moldingIn);
    matInchesH = Math.max(0, (frame.height - frame.printH) / 2 - moldingIn);
  } else {
    matInchesW = matInchesH = printDimensions.matPadding;
  }

  // Mat interior — the area inside the molding AND visible mat where panels live.
  const matWidth = frame.width - (moldingIn * 2) - (matInchesW * 2);
  const matHeight = frame.height - (moldingIn * 2) - (matInchesH * 2);

  // Panel gap rule: cap to mat thickness; hairline minimum for sleek/no-mat.
  const minHairlineGap = 0.04; // ~2-3px at common preview scales
  const gapCeilingW = matInchesW === 0 ? minHairlineGap : matInchesW;
  const effectiveGap = Math.min(panelGap, gapCeilingW);

  const inchPanels = calculatePanelPositions(layout, matWidth, matHeight, effectiveGap);

  // Preview dimensions
  const previewWidth = frame.previewWidth;
  const scale = previewWidth / frame.width;
  const previewHeight = Math.round(frame.height * scale);

  // Preview mat area in pixels — mirror the inch calculation
  const previewMolding = moldingIn * scale;
  const previewMatPadW = matInchesW * scale;
  const previewMatPadH = matInchesH * scale;
  const previewMatWidth = previewWidth - (previewMolding * 2) - (previewMatPadW * 2);
  const previewMatHeight = previewHeight - (previewMolding * 2) - (previewMatPadH * 2);
  const previewGap = effectiveGap * scale;

  const pixelPanels = calculatePanelPositions(layout, previewMatWidth, previewMatHeight, previewGap);

  // Print sheet dimensions — what's sent to the printer.
  const printSheetW = frame.printW || +(frame.width - 2 * (moldingIn + matInchesW)).toFixed(2);
  const printSheetH = frame.printH || +(frame.height - 2 * (moldingIn + matInchesH)).toFixed(2);

  return {
    frameSize,
    layoutId,
    frame: {
      width: frame.width,
      height: frame.height,
      previewWidth,
      previewHeight
    },
    mat: {
      inches: { width: matWidth, height: matHeight },
      pixels: { width: previewMatWidth, height: previewMatHeight }
    },
    panels: {
      inches: inchPanels,
      pixels: pixelPanels
    },
    dimensions: {
      frameBorderPx: Math.round(previewMolding),
      matPaddingPx: Math.round(previewMatPadW),
      matPaddingHeightPx: Math.round(previewMatPadH),
      gapPx: Math.round(previewGap),
      frameBorderIn: moldingIn,
      moldingIn,
      matPaddingIn: matInchesW,
      matPaddingHeightIn: matInchesH,
      gapIn: effectiveGap,
      printSheetW,
      printSheetH,
      sleek: !!frame.sleek
    }
  };
}

/**
 * Calculate panel positions given mat dimensions and gap.
 */
function calculatePanelPositions(layout, matWidth, matHeight, gap) {
  const { columns, rows } = layout.grid;
  const numCols = columns.length;
  const numRows = rows.length;

  // Total fractional units
  const totalColFr = columns.reduce((sum, fr) => sum + fr, 0);
  const totalRowFr = rows.reduce((sum, fr) => sum + fr, 0);

  // Available space after gaps
  const availWidth = matWidth - (gap * (numCols - 1));
  const availHeight = matHeight - (gap * (numRows - 1));

  // Column widths
  const colWidths = columns.map(fr => (fr / totalColFr) * availWidth);
  // Row heights
  const rowHeights = rows.map(fr => (fr / totalRowFr) * availHeight);

  // Column X positions (left edge)
  const colX = [];
  let x = 0;
  for (let i = 0; i < numCols; i++) {
    colX.push(x);
    x += colWidths[i] + gap;
  }

  // Row Y positions (top edge)
  const rowY = [];
  let y = 0;
  for (let i = 0; i < numRows; i++) {
    rowY.push(y);
    y += rowHeights[i] + gap;
  }

  // Map panels to positions
  return layout.panels.map(panel => {
    const colStart = panel.column[0] - 1; // 1-indexed to 0-indexed
    const colEnd = panel.column[1] - 1;
    const rowStart = panel.row[0] - 1;
    const rowEnd = panel.row[1] - 1;

    const px = colX[colStart];
    const py = rowY[rowStart];

    // Width: from start of first column to end of last column
    let pw = 0;
    for (let c = colStart; c <= colEnd; c++) {
      pw += colWidths[c];
      if (c < colEnd) pw += gap;
    }

    // Height: from start of first row to end of last row
    let ph = 0;
    for (let r = rowStart; r <= rowEnd; r++) {
      ph += rowHeights[r];
      if (r < rowEnd) ph += gap;
    }

    return {
      id: panel.id,
      type: panel.type,
      label: panel.label,
      x: Math.round(px * 1000) / 1000,
      y: Math.round(py * 1000) / 1000,
      width: Math.round(pw * 1000) / 1000,
      height: Math.round(ph * 1000) / 1000,
      imagePosition: panel.imagePosition || null
    };
  });
}

/**
 * Get available layouts for a frame size.
 */
function getLayoutsForSize(frameSize) {
  const frame = frameSizes[frameSize];
  if (!frame) return [];
  return frame.layouts.map(id => ({
    id,
    ...layouts[id]
  }));
}

module.exports = {
  calculateLayout,
  getLayoutsForSize
};

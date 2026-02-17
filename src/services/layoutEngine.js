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

  const { frameBorder, matPadding, panelGap } = printDimensions;

  // Mat interior dimensions in inches (inside frame border and mat padding)
  const matWidth = frame.width - (frameBorder * 2) - (matPadding * 2);
  const matHeight = frame.height - (frameBorder * 2) - (matPadding * 2);

  // Calculate panel positions in inches
  const inchPanels = calculatePanelPositions(layout, matWidth, matHeight, panelGap);

  // Preview dimensions
  const previewWidth = frame.previewWidth;
  const scale = previewWidth / frame.width;
  const previewHeight = Math.round(frame.height * scale);

  // Preview mat area in pixels
  const previewFrameBorder = frameBorder * scale;
  const previewMatPadding = matPadding * scale;
  const previewMatWidth = previewWidth - (previewFrameBorder * 2) - (previewMatPadding * 2);
  const previewMatHeight = previewHeight - (previewFrameBorder * 2) - (previewMatPadding * 2);
  const previewGap = panelGap * scale;

  // Calculate pixel positions
  const pixelPanels = calculatePanelPositions(layout, previewMatWidth, previewMatHeight, previewGap);

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
      frameBorderPx: Math.round(previewFrameBorder),
      matPaddingPx: Math.round(previewMatPadding),
      gapPx: Math.round(previewGap),
      frameBorderIn: frameBorder,
      matPaddingIn: matPadding,
      gapIn: panelGap
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

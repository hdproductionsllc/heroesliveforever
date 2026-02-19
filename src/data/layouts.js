/**
 * Panel layout definitions.
 *
 * All measurements relative to the mat interior (after frame border + padding).
 * The layoutEngine converts these to absolute positions in inches and pixels.
 *
 * Grid uses fractional units for proportional sizing.
 * gap: space between panels (as fraction of mat width).
 */

const layouts = {
  // ═══ 3-PANEL LAYOUTS ═══

  '3-panel': {
    label: '3-Panel: Hero Left',
    description: 'Hero left (full height), secondary top-right, bio bottom-right',
    panelCount: 3,
    minSize: '8x10',
    grid: {
      columns: [1.15, 1],
      rows: [1, 1],
      gap: 10
    },
    panels: [
      { id: 'hero', type: 'image', label: 'Hero Image', column: [1, 1], row: [1, 2], imagePosition: 'center 20%' },
      { id: 'secondary', type: 'image', label: 'Secondary Image', column: [2, 2], row: [1, 1], imagePosition: 'center 12%' },
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [2, 2], row: [2, 2] }
    ]
  },

  '3-panel-right': {
    label: '3-Panel: Hero Right',
    description: 'Bio top-left, secondary bottom-left, hero right (full height)',
    panelCount: 3,
    minSize: '8x10',
    grid: {
      columns: [1, 1.15],
      rows: [1, 1],
      gap: 10
    },
    panels: [
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [1, 1], row: [1, 1] },
      { id: 'secondary', type: 'image', label: 'Secondary Image', column: [1, 1], row: [2, 2], imagePosition: 'center 12%' },
      { id: 'hero', type: 'image', label: 'Hero Image', column: [2, 2], row: [1, 2], imagePosition: 'center 20%' }
    ]
  },

  '3-panel-top': {
    label: '3-Panel: Hero Top',
    description: 'Hero spanning top, secondary bottom-left, bio bottom-right',
    panelCount: 3,
    minSize: '12x16',
    grid: {
      columns: [1, 1],
      rows: [1.3, 1],
      gap: 10
    },
    panels: [
      { id: 'hero', type: 'image', label: 'Hero Image', column: [1, 2], row: [1, 1], imagePosition: 'center 30%' },
      { id: 'secondary', type: 'image', label: 'Secondary Image', column: [1, 1], row: [2, 2], imagePosition: 'center center' },
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [2, 2], row: [2, 2] }
    ]
  },

  '3-panel-bottom': {
    label: '3-Panel: Hero Bottom',
    description: 'Secondary top-left, bio top-right, hero spanning bottom',
    panelCount: 3,
    minSize: '12x16',
    grid: {
      columns: [1, 1],
      rows: [1, 1.3],
      gap: 10
    },
    panels: [
      { id: 'secondary', type: 'image', label: 'Secondary Image', column: [1, 1], row: [1, 1], imagePosition: 'center center' },
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [2, 2], row: [1, 1] },
      { id: 'hero', type: 'image', label: 'Hero Image', column: [1, 2], row: [2, 2], imagePosition: 'center 30%' }
    ]
  },

  '3-panel-center': {
    label: '3-Panel: Centered Hero',
    description: 'Secondary left, hero center (dominant), bio right',
    panelCount: 3,
    minSize: '16x20',
    grid: {
      columns: [1, 1.4, 1],
      rows: [1],
      gap: 10
    },
    panels: [
      { id: 'secondary', type: 'image', label: 'Secondary Image', column: [1, 1], row: [1, 1], imagePosition: 'center center' },
      { id: 'hero', type: 'image', label: 'Hero Image', column: [2, 2], row: [1, 1], imagePosition: 'center 20%' },
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [3, 3], row: [1, 1] }
    ]
  },

  // ═══ 4-PANEL LAYOUTS ═══

  '4-panel': {
    label: '4-Panel: Hero Left',
    description: 'Hero left (full height), three panels stacked right',
    panelCount: 4,
    minSize: '16x20',
    grid: {
      columns: [1.15, 1],
      rows: [1, 1, 1],
      gap: 10
    },
    panels: [
      { id: 'hero', type: 'image', label: 'Hero Image', column: [1, 1], row: [1, 3], imagePosition: 'center 20%' },
      { id: 'secondary', type: 'image', label: 'Secondary Image', column: [2, 2], row: [1, 1], imagePosition: 'center 12%' },
      { id: 'tertiary', type: 'image', label: 'Tertiary Image', column: [2, 2], row: [2, 2], imagePosition: 'center center' },
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [2, 2], row: [3, 3] }
    ]
  },

  '4-panel-right': {
    label: '4-Panel: Hero Right',
    description: 'Three panels stacked left, hero right (full height)',
    panelCount: 4,
    minSize: '16x20',
    grid: {
      columns: [1, 1.15],
      rows: [1, 1, 1],
      gap: 10
    },
    panels: [
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [1, 1], row: [1, 1] },
      { id: 'secondary', type: 'image', label: 'Secondary Image', column: [1, 1], row: [2, 2], imagePosition: 'center 12%' },
      { id: 'tertiary', type: 'image', label: 'Tertiary Image', column: [1, 1], row: [3, 3], imagePosition: 'center center' },
      { id: 'hero', type: 'image', label: 'Hero Image', column: [2, 2], row: [1, 3], imagePosition: 'center 20%' }
    ]
  },

  '4-panel-top': {
    label: '4-Panel: Hero Top',
    description: 'Hero spanning top, three panels in bottom row',
    panelCount: 4,
    minSize: '20x24',
    grid: {
      columns: [1, 1, 1],
      rows: [1.5, 1],
      gap: 10
    },
    panels: [
      { id: 'hero', type: 'image', label: 'Hero Image', column: [1, 3], row: [1, 1], imagePosition: 'center 30%' },
      { id: 'secondary', type: 'image', label: 'Secondary Image', column: [1, 1], row: [2, 2], imagePosition: 'center center' },
      { id: 'tertiary', type: 'image', label: 'Tertiary Image', column: [2, 2], row: [2, 2], imagePosition: 'center center' },
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [3, 3], row: [2, 2] }
    ]
  },

  '4-panel-alt': {
    label: '4-Panel: Triptych',
    description: 'Three images top row, bio full-width bottom',
    panelCount: 4,
    minSize: '24x36',
    grid: {
      columns: [1, 1.2, 1],
      rows: [2.5, 1],
      gap: 10
    },
    panels: [
      { id: 'secondary', type: 'image', label: 'Image 1 (Left)', column: [1, 1], row: [1, 1], imagePosition: 'center center' },
      { id: 'hero', type: 'image', label: 'Hero Image (Center)', column: [2, 2], row: [1, 1], imagePosition: 'center 20%' },
      { id: 'tertiary', type: 'image', label: 'Image 3 (Right)', column: [3, 3], row: [1, 1], imagePosition: 'center center' },
      { id: 'bio', type: 'bio', label: 'Bio Panel', column: [1, 3], row: [2, 2] }
    ]
  }
};

/**
 * Frame sizes — outer dimensions in inches.
 * previewWidth: base pixel width for browser preview.
 */
const frameSizes = {
  '8x10':  { width: 8,  height: 10, aspect: '4:5',  previewWidth: 340, layouts: ['3-panel', '3-panel-right'] },
  '12x16': { width: 12, height: 16, aspect: '3:4',  previewWidth: 400, layouts: ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom'] },
  '16x20': { width: 16, height: 20, aspect: '4:5',  previewWidth: 480, layouts: ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom', '3-panel-center', '4-panel', '4-panel-right'] },
  '20x24': { width: 20, height: 24, aspect: '5:6',  previewWidth: 540, layouts: ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom', '3-panel-center', '4-panel', '4-panel-right', '4-panel-top'] },
  '24x24': { width: 24, height: 24, aspect: '1:1',  previewWidth: 620, layouts: ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom', '3-panel-center', '4-panel', '4-panel-right', '4-panel-top'] },
  '24x36': { width: 24, height: 36, aspect: '2:3',  previewWidth: 500, layouts: ['3-panel', '3-panel-right', '3-panel-top', '3-panel-bottom', '3-panel-center', '4-panel', '4-panel-right', '4-panel-top', '4-panel-alt'] }
};

/**
 * Physical dimensions for print (inches).
 */
const printDimensions = {
  frameBorder: 0.75,
  matPadding: 1.0,
  panelGap: 0.375,
  bleed: 0.125,
  dpi: 300
};

module.exports = { layouts, frameSizes, printDimensions };

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
  '3-panel': {
    label: '3-Panel (Standard)',
    description: 'Hero left, secondary top-right, bio bottom-right',
    minSize: '8x10',
    grid: {
      columns: [1.15, 1],    // fr units
      rows: [1, 1],          // fr units
      gap: 10                // px at 620px reference
    },
    panels: [
      {
        id: 'hero',
        type: 'image',
        label: 'Hero Image',
        column: [1, 1],      // grid-column: 1
        row: [1, 2],         // grid-row: 1 / 3 (spans both rows)
        imagePosition: 'center 20%'
      },
      {
        id: 'secondary',
        type: 'image',
        label: 'Secondary Image',
        column: [2, 2],
        row: [1, 1],
        imagePosition: 'center 12%'
      },
      {
        id: 'bio',
        type: 'bio',
        label: 'Bio Panel',
        column: [2, 2],
        row: [2, 2]
      }
    ]
  },

  '4-panel': {
    label: '4-Panel',
    description: 'Hero left, secondary top-right, tertiary mid-right, bio bottom-right',
    minSize: '16x20',
    grid: {
      columns: [1.15, 1],
      rows: [1, 1, 1],
      gap: 10
    },
    panels: [
      {
        id: 'hero',
        type: 'image',
        label: 'Hero Image',
        column: [1, 1],
        row: [1, 3],
        imagePosition: 'center 20%'
      },
      {
        id: 'secondary',
        type: 'image',
        label: 'Secondary Image',
        column: [2, 2],
        row: [1, 1],
        imagePosition: 'center 12%'
      },
      {
        id: 'tertiary',
        type: 'image',
        label: 'Tertiary Image',
        column: [2, 2],
        row: [2, 2],
        imagePosition: 'center center'
      },
      {
        id: 'bio',
        type: 'bio',
        label: 'Bio Panel',
        column: [2, 2],
        row: [3, 3]
      }
    ]
  },

  '4-panel-alt': {
    label: '4-Panel Alternate',
    description: 'Three images top row, bio full-width bottom',
    minSize: '24x36',
    grid: {
      columns: [1, 1.2, 1],
      rows: [2.5, 1],
      gap: 10
    },
    panels: [
      {
        id: 'secondary',
        type: 'image',
        label: 'Image 1 (Left)',
        column: [1, 1],
        row: [1, 1],
        imagePosition: 'center center'
      },
      {
        id: 'hero',
        type: 'image',
        label: 'Hero Image (Center)',
        column: [2, 2],
        row: [1, 1],
        imagePosition: 'center 20%'
      },
      {
        id: 'tertiary',
        type: 'image',
        label: 'Image 3 (Right)',
        column: [3, 3],
        row: [1, 1],
        imagePosition: 'center center'
      },
      {
        id: 'bio',
        type: 'bio',
        label: 'Bio Panel',
        column: [1, 3],
        row: [2, 2]
      }
    ]
  }
};

/**
 * Frame sizes — outer dimensions in inches.
 * previewWidth: base pixel width for browser preview.
 */
const frameSizes = {
  '8x10':  { width: 8,  height: 10, aspect: '4:5',  previewWidth: 340, layouts: ['3-panel'] },
  '12x16': { width: 12, height: 16, aspect: '3:4',  previewWidth: 400, layouts: ['3-panel'] },
  '16x20': { width: 16, height: 20, aspect: '4:5',  previewWidth: 480, layouts: ['3-panel', '4-panel'] },
  '20x24': { width: 20, height: 24, aspect: '5:6',  previewWidth: 540, layouts: ['3-panel', '4-panel'] },
  '24x24': { width: 24, height: 24, aspect: '1:1',  previewWidth: 620, layouts: ['3-panel', '4-panel'] },
  '24x36': { width: 24, height: 36, aspect: '2:3',  previewWidth: 500, layouts: ['3-panel', '4-panel', '4-panel-alt'] }
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

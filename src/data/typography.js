/**
 * Typography system — font families, weights, and sizes per category.
 * Reference: 620px preview width = 24" frame.
 * All sizes specified at 24x24 reference; layoutEngine scales proportionally.
 */

const typography = {
  // Display fonts for hero names
  display: {
    military: {
      family: "'Cormorant Garamond', serif",
      weight: 600,
      fallback: "'Playfair Display', serif"
    },
    sports: {
      family: "'Oswald', sans-serif",
      weight: 700,
      fallback: "'Bebas Neue', sans-serif"
    },
    historical: {
      family: "'Playfair Display', serif",
      weight: 700,
      fallback: "'Cormorant Garamond', serif"
    },
    national: {
      family: "'Cormorant Garamond', serif",
      weight: 500,
      fallback: "'EB Garamond', serif"
    },
    music: {
      family: "'Archivo Black', sans-serif",
      weight: 400,
      fallback: "'Oswald', sans-serif"
    },
    personal: {
      family: "'EB Garamond', serif",
      weight: 500,
      fallback: "'Cormorant Garamond', serif"
    }
  },

  // Body fonts for bio text
  body: {
    military: { family: "'EB Garamond', 'Georgia', serif", weight: 400 },
    sports: { family: "'Source Sans 3', 'Helvetica Neue', sans-serif", weight: 400 },
    historical: { family: "'EB Garamond', 'Georgia', serif", weight: 400 },
    national: { family: "'EB Garamond', 'Georgia', serif", weight: 400 },
    music: { family: "'Source Sans 3', 'Helvetica Neue', sans-serif", weight: 400 },
    personal: { family: "'EB Garamond', 'Georgia', serif", weight: 400 }
  },

  // Quote fonts
  quote: {
    military: { family: "'Cormorant Garamond', serif", weight: 400, style: 'italic' },
    sports: { family: "'Oswald', sans-serif", weight: 400, style: 'italic' },
    historical: { family: "'Playfair Display', serif", weight: 400, style: 'italic' },
    national: { family: "'Cormorant Garamond', serif", weight: 400, style: 'italic' },
    music: { family: "'Cormorant Garamond', serif", weight: 300, style: 'italic' },
    personal: { family: "'Cormorant Garamond', serif", weight: 400, style: 'italic' }
  },

  // Sizes at 24x24 reference (620px preview). Scale factor: previewPx / 620.
  sizes: {
    name: { fontSize: 18, letterSpacing: 4, textTransform: 'uppercase' },
    dates: { fontSize: 9, letterSpacing: 4, fontWeight: 300 },
    bioText: { fontSize: 7.5, lineHeight: 1.55, maxWidth: 218 },
    quote: { fontSize: 10, lineHeight: 1.4, maxWidth: 200 },
    attribution: { fontSize: 6.5, letterSpacing: 3.5, textTransform: 'uppercase' },
    caption: { fontSize: 7, letterSpacing: 2, textTransform: 'uppercase' }
  },

  // Rules
  rules: {
    nameTransform: 'uppercase',
    nameLetterSpacing: '3-5px',
    datesSeparator: '\u2013', // en dash
    dividerWidth: 36,
    bioLineHeight: 1.55,
    bioMaxWords: 140,
    bioMinWords: 80,
    quoteChars: ['\u201C', '\u201D'], // curly double quotes
    noEmDashes: true
  }
};

module.exports = typography;

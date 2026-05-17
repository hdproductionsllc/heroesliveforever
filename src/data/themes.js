/**
 * Category themes — complete visual specs for each subject category.
 *
 * Aesthetic: bold, modern, sports-broadcast — high contrast, solid colors,
 * minimal sepia/aged tones. Think MLB.com / ESPN / Topps card / modern
 * memorial brand. Each category keeps its own subject-appropriate voice
 * but the visual language is uniformly contemporary and punchy.
 *
 * Structure per theme (do not add new top-level keys — downstream
 * themeEngine.js merges `typography` and `accent` at resolve time):
 *   frame   — outer painted/metal finish
 *   mat     — solid surface surrounding the image
 *   bio     — bio card panel (trading-card / stat-panel feel)
 *   image   — image filter / opacity (kept sharp and modern)
 *   caption — caption text + gradient over image
 */

const themes = {
  military: {
    label: 'Military / Veterans',
    // Brushed gunmetal / matte black frame — modern memorial, not aged oak.
    frame: {
      border: 'linear-gradient(145deg, #1f2622, #2a322c 15%, #131816 40%, #232a25 70%, #0d1110)',
      shadow: '0 10px 44px rgba(0,0,0,0.72), 0 0 0 1px rgba(196,30,38,0.18)',
      innerBorder: '#0a0d0c',
      outerShadow: '#05070a'
    },
    // Bone-white mat — high contrast against gunmetal frame. Memorial gravitas.
    mat: {
      background: '#e8e3d6',
      border: '#c8c2b1',
      panelBorder: '#aaa494',
      panelBg: '#f2ede0'
    },
    // Bio panel: dark olive/charcoal with a sharp red service accent.
    bio: {
      background: 'linear-gradient(160deg, #1a1f1c 0%, #14181a 60%, #0e1213 100%)',
      nameColor: '#f5f3ec',
      datesColor: '#8a948b',
      textColor: '#d6d8d2',
      quoteColor: '#ffffff',
      attributionColor: '#9aa49a',
      divider: 'linear-gradient(90deg, transparent, #c41e26, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.08) saturate(1.04) brightness(0.98)',
      opacity: 1,
      secondaryFilter: 'contrast(1.06) saturate(1.0) brightness(0.96)',
      secondaryOpacity: 0.97
    },
    caption: {
      color: '#c8ccc4',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.92))'
    }
  },

  sports: {
    label: 'Sports Legends',
    // Glossy black painted frame with a thin red broadcast halo.
    frame: {
      border: 'linear-gradient(145deg, #141414, #1f1f1f 15%, #050505 40%, #1a1a1a 70%, #000000)',
      shadow: '0 12px 48px rgba(0,0,0,0.82), 0 0 0 1px rgba(196,30,38,0.35)',
      innerBorder: '#000000',
      outerShadow: '#000000'
    },
    // Cardinals-red mat — bold broadcast color block.
    mat: {
      background: '#a3122a',
      border: '#6b0a1a',
      panelBorder: '#7a0d20',
      panelBg: '#0a0a0a'
    },
    // Trading-card stat panel: bone white, jet black numerals, red accent.
    bio: {
      background: 'linear-gradient(160deg, #ffffff 0%, #f4f4f4 100%)',
      nameColor: '#0a0a0a',
      datesColor: '#a3122a',
      textColor: '#1a1a1a',
      quoteColor: '#0a0a0a',
      attributionColor: '#a3122a',
      divider: 'linear-gradient(90deg, transparent, #0a0a0a 20%, #a3122a 50%, #0a0a0a 80%, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.18) saturate(1.22) brightness(1.02)',
      opacity: 1,
      secondaryFilter: 'contrast(1.15) saturate(1.18)',
      secondaryOpacity: 1
    },
    caption: {
      color: '#f4f4f4',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.92))'
    }
  },

  historical: {
    label: 'Historical Figures',
    // Matte black frame with a thin warm bronze hairline — NYT retrospective.
    frame: {
      border: 'linear-gradient(145deg, #1a1a1a, #232323 15%, #0c0c0c 40%, #1d1d1d 70%, #050505)',
      shadow: '0 10px 44px rgba(0,0,0,0.7), 0 0 0 1px rgba(184,138,73,0.22)',
      innerBorder: '#0a0a0a',
      outerShadow: '#000000'
    },
    // Bone editorial mat — NYT retrospective contrast against matte black frame.
    mat: {
      background: '#f0ebde',
      border: '#1a1a1a',
      panelBorder: '#1f1f1f',
      panelBg: '#0a0a0a'
    },
    // Bone-white editorial card, black serif name, bronze accent rule.
    bio: {
      background: '#f7f4ec',
      nameColor: '#0a0a0a',
      datesColor: '#7a6a4e',
      textColor: '#1c1c1c',
      quoteColor: '#0a0a0a',
      attributionColor: '#8a7a5e',
      divider: 'linear-gradient(90deg, transparent, #b88a49, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.12) saturate(1.02) brightness(0.99)',
      opacity: 1,
      secondaryFilter: 'contrast(1.08) saturate(1.0) brightness(0.97)',
      secondaryOpacity: 0.98
    },
    caption: {
      color: '#d8d2c4',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
    }
  },

  national: {
    label: 'National Heroes / Heads of State',
    // Deep navy painted frame, brushed.
    frame: {
      border: 'linear-gradient(145deg, #0d1730, #142142 15%, #070d1e 40%, #111c38 70%, #04081a)',
      shadow: '0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(196,30,38,0.25)',
      innerBorder: '#04081a',
      outerShadow: '#02040d'
    },
    // Cream mat — patriotic navy + cream + red palette. High contrast.
    mat: {
      background: '#f4ebd0',
      border: '#d4c9a7',
      panelBorder: '#a89c79',
      panelBg: '#fbf5e2'
    },
    // Cream card with navy name, red accent divider — modern civic plaque.
    bio: {
      background: 'linear-gradient(160deg, #fbf7ec 0%, #f3eddc 100%)',
      nameColor: '#0a1430',
      datesColor: '#8a6a3c',
      textColor: '#13192a',
      quoteColor: '#0a1430',
      attributionColor: '#7a6850',
      divider: 'linear-gradient(90deg, transparent, #c41e26, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.1) saturate(1.08) brightness(1.0)',
      opacity: 1,
      secondaryFilter: 'contrast(1.06) saturate(1.04)',
      secondaryOpacity: 0.98
    },
    caption: {
      color: '#e6e0cc',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
    }
  },

  music: {
    label: 'Music / Arts / Culture',
    // Pure black concert-poster frame with a neon-yellow hairline.
    frame: {
      border: 'linear-gradient(145deg, #0a0a0a, #161616 15%, #000000 40%, #121212 70%, #000000)',
      shadow: '0 12px 50px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,221,0,0.32)',
      innerBorder: '#000000',
      outerShadow: '#000000'
    },
    // Neon yellow mat — pure concert-poster impact against black frame.
    mat: {
      background: '#ffdd00',
      border: '#d4b800',
      panelBorder: '#9c8800',
      panelBg: '#fff14a'
    },
    // Black card, white name, neon-yellow accent — gig-poster energy.
    bio: {
      background: '#0a0a0a',
      nameColor: '#ffffff',
      datesColor: '#ffdd00',
      textColor: '#e6e6e6',
      quoteColor: '#ffffff',
      attributionColor: '#ffdd00',
      divider: 'linear-gradient(90deg, transparent, #ffdd00, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.18) saturate(1.18) brightness(0.98)',
      opacity: 1,
      secondaryFilter: 'contrast(1.14) saturate(1.14) brightness(0.96)',
      secondaryOpacity: 0.98
    },
    caption: {
      color: '#ffdd00',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.95))'
    }
  },

  personal: {
    label: 'Personal Heroes',
    // Warm dark walnut-painted finish — minimal, contemporary.
    frame: {
      border: 'linear-gradient(145deg, #1f1814, #2a221c 15%, #15110d 40%, #241c16 70%, #0d0a07)',
      shadow: '0 10px 42px rgba(0,0,0,0.62), 0 0 0 1px rgba(212,140,56,0.22)',
      innerBorder: '#100c08',
      outerShadow: '#070504'
    },
    // Warm cream mat — high contrast against walnut frame, modern home gallery.
    mat: {
      background: '#e8dcc4',
      border: '#c9bda3',
      panelBorder: '#a89977',
      panelBg: '#f3eada'
    },
    // Off-white card, near-black name, amber accent.
    bio: {
      background: 'linear-gradient(160deg, #fbf8f2 0%, #f3ede1 100%)',
      nameColor: '#1a140e',
      datesColor: '#8a6a3c',
      textColor: '#2a221a',
      quoteColor: '#1a140e',
      attributionColor: '#8a6a3c',
      divider: 'linear-gradient(90deg, transparent, #d48c38, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.08) saturate(1.06) brightness(1.0)',
      opacity: 1,
      secondaryFilter: 'contrast(1.05) saturate(1.04) brightness(0.98)',
      secondaryOpacity: 0.98
    },
    caption: {
      color: '#e6dccc',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.88))'
    }
  }
};

module.exports = themes;

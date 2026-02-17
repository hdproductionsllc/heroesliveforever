/**
 * Category themes — complete visual specs for each subject category.
 * CSS values extracted from the Tolkien prototype + production bible.
 */

const themes = {
  military: {
    label: 'Military / Veterans',
    frame: {
      border: 'linear-gradient(145deg, #2c2018, #3a2a1c 15%, #1e1610 40%, #2a1e14 70%, #1a120c)',
      shadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 2px rgba(180,150,100,0.08)',
      innerBorder: '#3a2a1a',
      outerShadow: '#0a0806'
    },
    mat: {
      background: '#0a0908',
      border: '#181410',
      panelBorder: '#1a1610',
      panelBg: '#12100c'
    },
    bio: {
      background: [
        'radial-gradient(ellipse at 25% 20%, #ddd0b8 0%, transparent 60%)',
        'radial-gradient(ellipse at 75% 80%, #c8b898 0%, transparent 60%)',
        'linear-gradient(160deg, #d4c6aa 0%, #ccbda0 35%, #c4b494 65%, #bead8a 100%)'
      ].join(', '),
      nameColor: '#2c2014',
      datesColor: '#6e5e4a',
      textColor: '#3c3224',
      quoteColor: '#3c3224',
      attributionColor: '#7a6a54',
      divider: 'linear-gradient(90deg, transparent, #8a7a5e, transparent)',
      overlay: [
        'radial-gradient(ellipse at 15% 10%, rgba(180,160,110,0.14) 0%, transparent 45%)',
        'radial-gradient(ellipse at 85% 90%, rgba(120,100,60,0.1) 0%, transparent 45%)'
      ].join(', ')
    },
    image: {
      filter: 'sepia(0.12) contrast(1.08)',
      opacity: 0.92,
      secondaryFilter: 'sepia(0.25) contrast(1.05) brightness(0.88)',
      secondaryOpacity: 0.9
    },
    caption: {
      color: '#5a4a3a',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
    }
  },

  sports: {
    label: 'Sports Legends',
    frame: {
      border: 'linear-gradient(145deg, #1a1a1a, #2a2a2a 15%, #111 40%, #222 70%, #0a0a0a)',
      shadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 3px rgba(255,255,255,0.05)',
      innerBorder: '#333',
      outerShadow: '#000'
    },
    mat: {
      background: '#0a0a0a',
      border: '#1a1a1a',
      panelBorder: '#222',
      panelBg: '#111'
    },
    bio: {
      background: 'linear-gradient(160deg, #f8f6f2 0%, #f0ece4 50%, #e8e2d8 100%)',
      nameColor: '#111',
      datesColor: '#555',
      textColor: '#222',
      quoteColor: '#333',
      attributionColor: '#666',
      divider: 'linear-gradient(90deg, transparent, #999, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.1) saturate(1.05)',
      opacity: 1,
      secondaryFilter: 'contrast(1.05)',
      secondaryOpacity: 0.95
    },
    caption: {
      color: '#888',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'
    }
  },

  historical: {
    label: 'Historical Figures',
    frame: {
      border: 'linear-gradient(145deg, #4a1e14, #5c2a1c 15%, #3a1610 40%, #4a2014 70%, #2e120c)',
      shadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 2px rgba(200,160,80,0.1)',
      innerBorder: '#5a3020',
      outerShadow: '#1a0a06'
    },
    mat: {
      background: '#1a0a0a',
      border: '#2a1410',
      panelBorder: '#2e1a14',
      panelBg: '#1a100c'
    },
    bio: {
      background: [
        'radial-gradient(ellipse at 30% 25%, #f8f2ea 0%, transparent 60%)',
        'linear-gradient(160deg, #f5f0e6 0%, #efe8dc 50%, #e8e0d0 100%)'
      ].join(', '),
      nameColor: '#2a1a10',
      datesColor: '#7a6650',
      textColor: '#3a2a1c',
      quoteColor: '#3a2a1c',
      attributionColor: '#8a7660',
      divider: 'linear-gradient(90deg, transparent, #b8a080, transparent)',
      overlay: 'radial-gradient(ellipse at 20% 15%, rgba(200,180,140,0.08) 0%, transparent 50%)'
    },
    image: {
      filter: 'sepia(0.08) contrast(1.05) brightness(0.95)',
      opacity: 0.95,
      secondaryFilter: 'sepia(0.15) contrast(1.05) brightness(0.9)',
      secondaryOpacity: 0.92
    },
    caption: {
      color: '#6a5a4a',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'
    }
  },

  national: {
    label: 'National Heroes / Heads of State',
    frame: {
      border: 'linear-gradient(145deg, #1a1a1a, #2a2a28 15%, #141414 40%, #222220 70%, #0e0e0e)',
      shadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 2px rgba(200,180,120,0.08)',
      innerBorder: '#333',
      outerShadow: '#080808'
    },
    mat: {
      background: '#0c0c14',
      border: '#181820',
      panelBorder: '#1c1c24',
      panelBg: '#12121a'
    },
    bio: {
      background: 'linear-gradient(160deg, #faf8f5 0%, #f5f2ee 50%, #f0ece6 100%)',
      nameColor: '#1a1a1a',
      datesColor: '#666',
      textColor: '#2a2a2a',
      quoteColor: '#333',
      attributionColor: '#777',
      divider: 'linear-gradient(90deg, transparent, #aaa, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.05) brightness(0.97)',
      opacity: 0.95,
      secondaryFilter: 'contrast(1.03) brightness(0.95)',
      secondaryOpacity: 0.93
    },
    caption: {
      color: '#777',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'
    }
  },

  music: {
    label: 'Music / Arts / Culture',
    frame: {
      border: 'linear-gradient(145deg, #1a1a1a, #252525 15%, #101010 40%, #1e1e1e 70%, #0a0a0a)',
      shadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 3px rgba(200,170,80,0.06)',
      innerBorder: '#2a2a2a',
      outerShadow: '#050505'
    },
    mat: {
      background: '#080808',
      border: '#151515',
      panelBorder: '#1a1a1a',
      panelBg: '#0e0e0e'
    },
    bio: {
      background: 'linear-gradient(160deg, #1a1a1a 0%, #151515 50%, #111 100%)',
      nameColor: '#f0e8d8',
      datesColor: '#8a8070',
      textColor: '#c8c0b0',
      quoteColor: '#d8d0c0',
      attributionColor: '#7a7268',
      divider: 'linear-gradient(90deg, transparent, #c8a050, transparent)',
      overlay: 'none'
    },
    image: {
      filter: 'contrast(1.1) brightness(0.95)',
      opacity: 0.95,
      secondaryFilter: 'contrast(1.08) brightness(0.92)',
      secondaryOpacity: 0.92
    },
    caption: {
      color: '#888',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
    }
  },

  personal: {
    label: 'Personal Heroes',
    frame: {
      border: 'linear-gradient(145deg, #3a2a1a, #4a3828 15%, #2e2018 40%, #3c2c1e 70%, #241a10)',
      shadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 2px rgba(180,150,100,0.1)',
      innerBorder: '#4a3a2a',
      outerShadow: '#0c0a06'
    },
    mat: {
      background: '#141210',
      border: '#1e1a16',
      panelBorder: '#221e1a',
      panelBg: '#181410'
    },
    bio: {
      background: [
        'radial-gradient(ellipse at 25% 20%, #e8dcc8 0%, transparent 60%)',
        'radial-gradient(ellipse at 75% 80%, #d8ccb4 0%, transparent 60%)',
        'linear-gradient(160deg, #dcd0b8 0%, #d4c8ae 50%, #ccbea4 100%)'
      ].join(', '),
      nameColor: '#2e2014',
      datesColor: '#70604c',
      textColor: '#3e3226',
      quoteColor: '#3e3226',
      attributionColor: '#7c6c58',
      divider: 'linear-gradient(90deg, transparent, #a09070, transparent)',
      overlay: [
        'radial-gradient(ellipse at 15% 10%, rgba(180,160,120,0.1) 0%, transparent 45%)',
        'radial-gradient(ellipse at 85% 90%, rgba(140,120,80,0.08) 0%, transparent 45%)'
      ].join(', ')
    },
    image: {
      filter: 'sepia(0.06) contrast(1.04) brightness(0.98)',
      opacity: 0.94,
      secondaryFilter: 'sepia(0.1) contrast(1.03) brightness(0.95)',
      secondaryOpacity: 0.92
    },
    caption: {
      color: '#6a5a4a',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'
    }
  }
};

module.exports = themes;

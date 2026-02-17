# HEROES LIVE FOREVER — Production System

## Brand Identity

**Heroes Live Forever** is a premium framed tribute product line. Each piece is a museum-quality, multi-panel composition honoring a legendary figure — military heroes, athletes, historical icons, cultural legends, national figures, and personal heroes.

Every piece tells a story through images, biography, and design language that is **sensitive to the subject**. A piece honoring a fallen Marine looks nothing like one celebrating Michael Jordan. The frame, mat, colors, typography, and layout all respond to who the hero is.

**Brand voice:** Reverent but not somber. Bold but not loud. The product speaks with the quiet confidence of something built to last on a wall for decades.

**Tagline:** *Heroes Live Forever*

---

## Product Specifications

### Frame Sizes (outer dimensions, inches)

| Size | Aspect | Use Case | Min Panels | Print DPI |
|------|--------|----------|------------|-----------|
| 8×10 | 4:5 | Desktop / shelf / gift | 3 | 300 |
| 12×16 | 3:4 | Small wall / office | 3 | 300 |
| 16×20 | 4:5 | Standard wall art | 3-4 | 300 |
| 20×24 | 5:6 | Feature wall | 3-4 | 300 |
| 24×24 | 1:1 | Statement piece | 3-4 | 300 |
| 24×36 | 2:3 | Large format | 4-5 | 300 |

### Resolution Requirements

At 300 DPI (print standard), minimum image dimensions:

| Frame Size | Full-bleed px | Hero Panel (60%) | Secondary Panel (40%) |
|------------|---------------|-------------------|-----------------------|
| 8×10 | 2400×3000 | 1440×3000 | 960×1500 |
| 12×16 | 3600×4800 | 2160×4800 | 1440×2400 |
| 16×20 | 4800×6000 | 2880×6000 | 1920×3000 |
| 20×24 | 6000×7200 | 3600×7200 | 2400×3600 |
| 24×24 | 7200×7200 | 4320×7200 | 2880×3600 |
| 24×36 | 7200×10800 | 4320×10800 | 2880×5400 |

**Resolution flag thresholds:**
- GREEN: Image meets or exceeds required DPI at placed size
- YELLOW: Image is 200-299 DPI at placed size (acceptable with sharpening)
- RED: Image is below 200 DPI at placed size (will print soft — flag for replacement)

---

## Panel System

Every piece has a minimum of 3 panels cut into the mat:

### Required Panels
1. **Hero Panel** — The dominant image. Full-height left column or top section. This is the emotional anchor. Typically 55-65% of visual weight.
2. **Secondary Panel** — Supporting image: action shot, artifact, historical photo, team photo, insignia, or related artwork. 20-30% of visual weight.
3. **Bio Panel** — Printed on separate stock (aged parchment, team-colored card, etc.), mounted in its own mat window. Contains: name, dates, biographical text, signature quote, attribution line.

### Optional Panels (for larger sizes)
4. **Tertiary Panel** — Additional image, insignia, coat of arms, team logo, flag, map, or artifact photo.
5. **Accent Panel** — Small window for medal, patch, rank insignia, jersey number, or iconic symbol.

### Panel Layout Grids

#### 3-Panel (all sizes)
```
┌──────────────┬──────────┐
│              │  IMAGE 2 │
│   HERO       │          │
│   IMAGE      ├──────────┤
│              │  BIO     │
│              │  PANEL   │
└──────────────┴──────────┘
  ~58% width     ~42% width
```

#### 4-Panel (16×20 and up)
```
┌──────────────┬──────────┐
│              │  IMAGE 2 │
│   HERO       ├──────────┤
│   IMAGE      │  IMAGE 3 │
│              ├──────────┤
│              │  BIO     │
└──────────────┴──────────┘
```

#### 4-Panel Alternate (24×36 landscape subjects)
```
┌──────────┬──────────┬──────────┐
│          │          │          │
│  IMAGE 1 │  HERO    │  IMAGE 3 │
│          │  IMAGE   │          │
│          │          │          │
├──────────┴──────────┴──────────┤
│           BIO PANEL            │
└────────────────────────────────┘
```

---

## Content-Sensitive Design System

The entire color palette, mat finish, frame material, and typography shift based on **subject category**. This is the core differentiator — every piece feels custom because it IS custom to the subject.

### Category: Military / Veterans

**Design language:** Solemn dignity. Museum-grade restraint.

| Element | Specification |
|---------|--------------|
| Frame | Dark walnut or black with subtle wood grain |
| Mat | Deep charcoal (#0a0908) or navy (#0c1220) |
| Bio stock | Aged parchment (warm cream to tan gradient) |
| Typography | Cormorant Garamond (name), EB Garamond (body) |
| Accent colors | Branch-specific: Army green, Navy blue, Marine scarlet, Air Force silver-blue |
| Image treatment | Slight sepia wash, subtle contrast boost |
| Tone | "Served with honor" — reverent, strong |

**Bio panel content pattern:**
- Full name and rank
- Birth/death years
- Service branch and unit
- Key engagements or campaigns
- Decorations (if notable)
- Brief narrative (3-5 sentences)
- Signature quote or motto
- Attribution: Rank, Branch, Years of Service

### Category: Sports Legends

**Design language:** Dynamic energy. Team pride. Championship gravity.

| Element | Specification |
|---------|--------------|
| Frame | Team primary color or metallic (gold/silver for champions) |
| Mat | Team secondary color or black |
| Bio stock | Team-colored card stock with subtle pattern |
| Typography | Bold condensed sans-serif (name), clean serif (body) |
| Accent colors | **Pulled directly from team brand guide** |
| Image treatment | High contrast, vivid color, action-oriented |
| Tone | "Greatest of all time" — celebratory, powerful |

**Team color database required.** For every major league:
- NFL (32 teams), NBA (30), MLB (30), NHL (32), MLS (29)
- College: Power 5 conferences + notable programs
- International: Premier League, La Liga, etc.
- Each entry: primary, secondary, tertiary hex values + Pantone

**Bio panel content pattern:**
- Full name and nickname
- Birth year (death year if applicable)
- Position / Role
- Teams and years
- Key statistics (career highlights, not exhaustive)
- Championships / Awards
- Brief narrative emphasizing legacy
- Signature quote
- Attribution: Position, Team(s), Era

### Category: Historical Figures

**Design language:** Scholarly authority. Period-appropriate atmosphere.

| Element | Specification |
|---------|--------------|
| Frame | Rich wood tones (mahogany, cherry) or gilded for royalty |
| Mat | Deep burgundy, forest green, or charcoal |
| Bio stock | Heavy cream or ivory, letterpress feel |
| Typography | Playfair Display or Crimson Text (name), Garamond (body) |
| Accent colors | Period-appropriate earth tones, golds, deep jewel tones |
| Image treatment | Vintage film look, grain, warmth appropriate to era |
| Tone | "Changed the world" — authoritative, timeless |

### Category: National Heroes / Heads of State

**Design language:** Patriotic gravity. State ceremony.

| Element | Specification |
|---------|--------------|
| Frame | Formal black or dark wood with gold accent |
| Mat | **Flag-derived**: dominant flag color as mat |
| Bio stock | National colors as subtle background or border accent |
| Typography | Formal serif (name), clean readable serif (body) |
| Accent colors | **National flag palette** — primary, secondary, tertiary |
| Image treatment | Official portrait treatment, high dignity |
| Tone | "For the nation" — statesmanlike, proud |

**Flag color database required.** Every UN member nation:
- Primary, secondary, tertiary hex values
- Cultural design associations (e.g., Japan = minimalist red/white)

### Category: Music / Arts / Culture

**Design language:** Expressive. Genre-sensitive.

| Element | Specification |
|---------|--------------|
| Frame | Varies wildly: matte black (rock), ornate gold (classical), raw wood (folk) |
| Mat | Genre-appropriate: black (rock/hip-hop), cream (classical), earth (folk/country) |
| Bio stock | Varies: concert-poster feel, vinyl-sleeve aesthetic, gallery white |
| Typography | Genre-matched: display type for rock, elegant serif for classical |
| Accent colors | Album art or genre conventions |
| Image treatment | Performance shots, studio portraits, genre-appropriate grading |
| Tone | "The music lives on" — expressive, genre-authentic |

### Category: Personal Heroes (Custom Orders)

**Design language:** Family warmth. Personal reverence.

| Element | Specification |
|---------|--------------|
| Frame | Warm wood tones (oak, maple) or client-selected |
| Mat | Soft charcoal, navy, or forest — universally dignified |
| Bio stock | Warm cream parchment, classic and timeless |
| Typography | Readable, warm serifs — nothing flashy |
| Image treatment | Gentle, flattering, warm |
| Tone | "Forever in our hearts" — personal, loving, not generic |

---

## Typography System

### Display Fonts (Names / Titles)
| Category | Primary | Fallback |
|----------|---------|----------|
| Military | Cormorant Garamond 600 | Playfair Display |
| Sports | Oswald 700 / Bebas Neue | Impact |
| Historical | Playfair Display 700 | Crimson Text |
| National | Cormorant Garamond 500 | EB Garamond |
| Music-Rock | Archivo Black | Oswald |
| Music-Classical | Cormorant Garamond 300 italic | Playfair Display |
| Personal | EB Garamond 500 | Cormorant Garamond |

### Body Fonts (Bio Text)
| Category | Font | Size Range (for 24×24) |
|----------|------|----------------------|
| All categories | EB Garamond 400 | 7-9pt equivalent |
| Sports alternate | Source Sans 3 | 7-9pt |

### Typographic Rules
- **Name:** ALL CAPS, letter-spacing 3-5px, largest element on bio panel
- **Dates:** Small caps or reduced weight, generous letter-spacing
- **Divider:** Thin horizontal rule, gradient fade at edges
- **Bio text:** Centered, max-width constrainted, 1.5-1.6 line height
- **Quote:** Italic, slightly larger than body, curly quotes always
- **Attribution:** ALL CAPS, tiny, wide letter-spacing, muted color
- **NO EM DASHES.** Use commas, periods, or en dashes for date ranges only.

---

## Bio Panel Specifications

The bio panel is a **separate printed piece** mounted in its own mat window. It is NOT printed on the mat material (which is 3D-printed and cannot accept inkjet/laser printing).

### Print Specs
| Property | Value |
|----------|-------|
| Stock | 100lb+ cover weight, matte or linen finish |
| Finish | Category-dependent (parchment texture for military, satin for sports) |
| Print method | High-quality inkjet or offset |
| Trim | Cut to exact mat window size minus 1/16" margin per side |
| Mount | Adhesive-backed foam tape or friction-fit behind mat |

### Content Structure (all categories)
```
[NAME — large, tracked out]
[DATES — small, muted]
[DIVIDER LINE]
[BIOGRAPHICAL TEXT — 60-120 words, centered]
[SIGNATURE QUOTE — italic, attributed]
[ATTRIBUTION LINE — role/title dots]
```

### Background Treatments by Category
- **Military:** Aged parchment gradient (#d4c6aa → #bead8a), radial age spots
- **Sports:** Team secondary color at 8-12% opacity over white, or team pattern
- **Historical:** Heavy cream (#f5f0e6) with subtle linen texture
- **National:** White or very light tint of flag secondary color
- **Music:** Genre-specific (black with metallic text for rock, cream for classical)
- **Personal:** Warm cream parchment, universal and timeless

---

## Adobe InDesign Integration

### Approach: ExtendScript Automation

Each piece is generated via an InDesign ExtendScript (.jsx) that:
1. Creates a new document at the specified frame size
2. Sets up the grid layout with proper margins and gaps
3. Places images with resolution checking
4. Generates the bio panel with proper typography
5. Applies the category-specific color theme
6. Runs preflight and flags any resolution issues

### Template Structure

```
/heroes-live-forever/
├── templates/
│   ├── 3-panel/
│   │   ├── 8x10_3panel.idml
│   │   ├── 12x16_3panel.idml
│   │   ├── 16x20_3panel.idml
│   │   ├── 20x24_3panel.idml
│   │   ├── 24x24_3panel.idml
│   │   └── 24x36_3panel.idml
│   └── 4-panel/
│       ├── 16x20_4panel.idml
│       ├── 20x24_4panel.idml
│       ├── 24x24_4panel.idml
│       └── 24x36_4panel.idml
├── scripts/
│   ├── generate_piece.jsx          # Main production script
│   ├── check_resolution.jsx        # Image DPI checker
│   ├── apply_theme.jsx             # Category color application
│   ├── generate_bio_panel.jsx      # Bio text layout
│   └── preflight_export.jsx        # Final QC and PDF export
├── assets/
│   ├── color-databases/
│   │   ├── nfl_teams.json
│   │   ├── nba_teams.json
│   │   ├── mlb_teams.json
│   │   ├── nhl_teams.json
│   │   ├── college_teams.json
│   │   ├── international_football.json
│   │   ├── national_flags.json
│   │   └── military_branches.json
│   ├── fonts/
│   │   └── (Google Fonts downloads for offline use)
│   └── textures/
│       ├── parchment_overlay.png
│       ├── linen_texture.png
│       └── grain_overlay.png
├── output/
│   ├── print-ready/               # Final PDFs (PDF/X-4)
│   ├── proofs/                    # Low-res proofs for approval
│   └── web-preview/               # Web mockups (HTML)
├── data/
│   └── heroes.json                # Subject database
└── CLAUDE.md                      # This file
```

### ExtendScript: generate_piece.jsx (Core Logic)

```javascript
// HEROES LIVE FOREVER — InDesign Production Script
// Usage: Run from InDesign Scripts panel with heroes.json data

#target indesign

// ============================================
// CONFIGURATION
// ============================================

var CONFIG = {
    // Frame dimensions in inches (outer frame, not document)
    sizes: {
        "8x10":   { w: 8,  h: 10, panels: 3 },
        "12x16":  { w: 12, h: 16, panels: 3 },
        "16x20":  { w: 16, h: 20, panels: [3,4] },
        "20x24":  { w: 20, h: 24, panels: [3,4] },
        "24x24":  { w: 24, h: 24, panels: [3,4] },
        "24x36":  { w: 24, h: 36, panels: [3,4,5] }
    },
    // Mat and frame dimensions
    frameBorder: 0.75,   // inches — physical frame width
    matPadding: 1.0,     // inches — mat border around panels
    panelGap: 0.375,     // inches — gap between panel windows
    // Print
    bleed: 0.125,        // inches
    dpi: 300,
    minAcceptableDPI: 200
};

// ============================================
// COLOR THEMES (loaded from JSON in production)
// ============================================

var THEMES = {
    military: {
        frame: [30, 22, 16],      // RGB dark walnut
        mat: [10, 9, 8],           // Near-black
        bioBg: [212, 198, 170],    // Parchment
        bioText: [60, 50, 36],     // Dark brown
        accent: [90, 70, 50],      // Muted gold
        nameColor: [44, 32, 20],
        quoteColor: [60, 50, 36]
    },
    sports: {
        // Overridden per-team from color database
        frame: [0, 0, 0],
        mat: [0, 0, 0],
        bioBg: [255, 255, 255],
        bioText: [30, 30, 30],
        accent: [200, 0, 0],       // Team primary
        nameColor: [0, 0, 0],
        quoteColor: [60, 60, 60]
    },
    historical: {
        frame: [80, 30, 20],       // Mahogany
        mat: [40, 15, 15],         // Deep burgundy
        bioBg: [245, 240, 230],    // Heavy cream
        bioText: [50, 40, 30],
        accent: [140, 110, 60],    // Gold
        nameColor: [40, 30, 20],
        quoteColor: [60, 50, 40]
    },
    national: {
        // Overridden per-country from flag database
        frame: [20, 20, 20],
        mat: [10, 10, 30],
        bioBg: [250, 248, 245],
        bioText: [30, 30, 30],
        accent: [180, 0, 0],
        nameColor: [20, 20, 20],
        quoteColor: [50, 50, 50]
    },
    music: {
        frame: [15, 15, 15],
        mat: [8, 8, 8],
        bioBg: [20, 20, 20],
        bioText: [200, 200, 200],
        accent: [200, 170, 80],
        nameColor: [240, 240, 240],
        quoteColor: [180, 180, 180]
    },
    personal: {
        frame: [60, 45, 30],       // Warm oak
        mat: [25, 22, 20],
        bioBg: [220, 210, 190],    // Warm cream
        bioText: [50, 40, 30],
        accent: [120, 100, 70],
        nameColor: [40, 30, 20],
        quoteColor: [60, 50, 40]
    }
};

// ============================================
// MAIN FUNCTION
// ============================================

function createHeroPiece(heroData) {
    /*
    heroData = {
        name: "J.R.R. Tolkien",
        dates: "1892-1973",
        category: "historical",       // military|sports|historical|national|music|personal
        subcategory: "author",         // branch, team, genre, country, etc.
        teamOrCountry: null,           // "Chicago Bulls" or "United Kingdom"
        frameSize: "24x24",
        bio: "Born in South Africa...",
        quote: "Not all those who wander are lost.",
        attribution: "Author | Philologist | Professor",
        images: {
            hero: { path: "/path/to/hero.jpg", caption: "Description" },
            secondary: { path: "/path/to/secondary.jpg", caption: "Description" },
            tertiary: null  // Optional
        }
    }
    */

    var size = CONFIG.sizes[heroData.frameSize];
    var theme = resolveTheme(heroData);

    // 1. Create document
    var doc = createDocument(size);

    // 2. Apply color swatches
    applyColorSwatches(doc, theme);

    // 3. Build mat background
    buildMat(doc, size, theme);

    // 4. Create panel windows
    var panels = createPanelWindows(doc, size, heroData);

    // 5. Place images with resolution checking
    var resolutionReport = placeImages(doc, panels, heroData);

    // 6. Build bio panel
    buildBioPanel(doc, panels.bio, heroData, theme);

    // 7. Run preflight
    var preflightResult = runPreflight(doc, resolutionReport);

    // 8. Export
    exportPiece(doc, heroData, preflightResult);

    return preflightResult;
}

// ============================================
// RESOLUTION CHECKER
// ============================================

function checkImageResolution(imagePath, placedWidth, placedHeight) {
    /*
    Returns: {
        status: "GREEN" | "YELLOW" | "RED",
        actualDPI: number,
        requiredDPI: 300,
        imageWidth: number,
        imageHeight: number,
        message: string
    }
    */
    var file = new File(imagePath);
    if (!file.exists) {
        return {
            status: "RED",
            message: "FILE NOT FOUND: " + imagePath
        };
    }

    // Read image dimensions (using ExtendScript bridge to Photoshop or file metadata)
    // In production, use: app.place() then check effectivePpi on the placed graphic
    // After placing in InDesign:
    // var graphic = frame.allGraphics[0];
    // var hRes = graphic.effectivePpi[0];
    // var vRes = graphic.effectivePpi[1];
    // var effectiveDPI = Math.min(hRes, vRes);

    var effectiveDPI = 0; // Calculated after placement

    if (effectiveDPI >= 300) {
        return { status: "GREEN", actualDPI: effectiveDPI, message: "Print quality excellent" };
    } else if (effectiveDPI >= 200) {
        return { status: "YELLOW", actualDPI: effectiveDPI, message: "Acceptable with sharpening" };
    } else {
        return { status: "RED", actualDPI: effectiveDPI, message: "TOO LOW — will print soft" };
    }
}

// After placing each image, check resolution:
function postPlacementCheck(frame) {
    if (frame.allGraphics.length > 0) {
        var graphic = frame.allGraphics[0];
        var hRes = graphic.effectivePpi[0];
        var vRes = graphic.effectivePpi[1];
        var effectiveDPI = Math.min(hRes, vRes);

        // Add colored label to frame based on DPI
        if (effectiveDPI >= 300) {
            frame.label = "RES:GREEN:" + Math.round(effectiveDPI) + "dpi";
            frame.fillColor = "Paper"; // No warning
        } else if (effectiveDPI >= 200) {
            frame.label = "RES:YELLOW:" + Math.round(effectiveDPI) + "dpi";
            // Add yellow overlay note
        } else {
            frame.label = "RES:RED:" + Math.round(effectiveDPI) + "dpi";
            // Add red flag — DO NOT PRINT
        }
        return { dpi: effectiveDPI, status: frame.label.split(":")[1] };
    }
    return { dpi: 0, status: "NO_IMAGE" };
}
```

### ExtendScript: check_resolution.jsx

This standalone script runs on any open InDesign document and generates a resolution report:

```javascript
#target indesign

function auditResolution() {
    var doc = app.activeDocument;
    var report = [];
    var hasIssues = false;

    for (var i = 0; i < doc.allGraphics.length; i++) {
        var graphic = doc.allGraphics[i];
        var frame = graphic.parent;
        var hRes = graphic.effectivePpi[0];
        var vRes = graphic.effectivePpi[1];
        var effectiveDPI = Math.min(hRes, vRes);
        var filePath = graphic.itemLink ? graphic.itemLink.filePath : "Embedded";

        var status = "GREEN";
        if (effectiveDPI < 200) { status = "RED"; hasIssues = true; }
        else if (effectiveDPI < 300) { status = "YELLOW"; }

        report.push({
            image: filePath,
            effectiveDPI: Math.round(effectiveDPI),
            status: status,
            frameName: frame.name || "unnamed",
            pageNumber: frame.parentPage ? frame.parentPage.name : "pasteboard"
        });
    }

    // Display report
    var msg = "HEROES LIVE FOREVER — Resolution Audit\n";
    msg += "=" .repeat(50) + "\n\n";

    for (var j = 0; j < report.length; j++) {
        var r = report[j];
        var icon = r.status === "GREEN" ? "✓" : (r.status === "YELLOW" ? "⚠" : "✗");
        msg += icon + " [" + r.status + "] " + r.effectiveDPI + " DPI — " + r.image + "\n";
    }

    msg += "\n" + (hasIssues ? "⚠ ISSUES FOUND — Review RED items before printing" : "✓ All images meet print requirements");

    alert(msg);
    return report;
}

auditResolution();
```

---

## Production Workflow

### Step 1: Subject Intake
Collect from client or research:
- Subject name, dates, category
- 2-4 high-resolution images (hero + supporting)
- Biographical text (60-120 words) or approval to write it
- Signature quote
- Attribution line
- Frame size selection
- Any specific color/team/country requirements

### Step 2: Image Assessment
Run all candidate images through resolution checker:
- Flag any below 200 DPI at target placement size
- Recommend cropping strategy for each image
- Identify best hero candidate (highest impact + highest resolution)

### Step 3: Theme Resolution
Based on category and subcategory:
- Auto-select frame color, mat color, bio stock
- For sports: pull team colors from database
- For national: pull flag colors from database
- For military: pull branch colors
- Generate color swatch set

### Step 4: Layout Generation
Run generate_piece.jsx with subject data:
- Creates InDesign document at specified size
- Places all panels with proper proportions
- Flows bio text with correct typography
- Applies complete color theme
- Runs resolution audit

### Step 5: Design Review
Designer reviews generated layout:
- Adjust image cropping/positioning
- Fine-tune bio text fit
- Verify color harmony
- Check mat window proportions
- Ensure nothing feels generic

### Step 6: Preflight & Export
- Run InDesign preflight (custom profile for Heroes Live Forever)
- Export print-ready PDF (PDF/X-4, 300 DPI, CMYK)
- Export low-res proof for client approval
- Export web preview mockup

### Step 7: Production
- Print bio panel on appropriate stock
- Print images on photo paper (if not using actual photographs)
- Cut mat windows on 3D printer or CNC
- Assemble: frame → mat → images + bio panel → backing → hardware

---

## Web Preview Generator

For client proofs and e-commerce, generate HTML mockups that show the piece in context. The HTML file should:

1. Render the exact frame layout at screen resolution
2. Embed images as base64 (no external dependencies)
3. Show frame, mat, and panel arrangement accurately
4. Include production notes below the preview
5. Be self-contained (single HTML file, works offline)

### HTML Template Variables
```javascript
const heroData = {
    brand: "Heroes Live Forever",
    name: "Subject Name",
    dates: "YYYY-YYYY",
    category: "military|sports|historical|national|music|personal",
    frameSize: "24x24",
    theme: {
        frameBorderColor: "#1e1610",
        matColor: "#0a0908",
        bioBgGradient: ["#d4c6aa", "#bead8a"],
        bioTextColor: "#3c3224",
        nameColor: "#2c2014",
        accentColor: "#8a7a5e"
    },
    bio: "Biographical text...",
    quote: "Signature quote.",
    attribution: "Title | Role | Era",
    images: {
        hero: { src: "data:image/jpeg;base64,...", caption: "..." },
        secondary: { src: "data:image/jpeg;base64,...", caption: "..." }
    }
};
```

---

## Team Color Database (Partial — Expand in Production)

### NFL Teams
```json
{
    "Arizona Cardinals": { "primary": "#97233F", "secondary": "#000000", "tertiary": "#FFB612" },
    "Atlanta Falcons": { "primary": "#A71930", "secondary": "#000000", "tertiary": "#A5ACAF" },
    "Baltimore Ravens": { "primary": "#241773", "secondary": "#000000", "tertiary": "#9E7C0C" },
    "Buffalo Bills": { "primary": "#00338D", "secondary": "#C60C30", "tertiary": "#FFFFFF" },
    "Carolina Panthers": { "primary": "#0085CA", "secondary": "#101820", "tertiary": "#BFC0BF" },
    "Chicago Bears": { "primary": "#0B162A", "secondary": "#C83803", "tertiary": "#FFFFFF" },
    "Cincinnati Bengals": { "primary": "#FB4F14", "secondary": "#000000", "tertiary": "#FFFFFF" },
    "Cleveland Browns": { "primary": "#311D00", "secondary": "#FF3C00", "tertiary": "#FFFFFF" },
    "Dallas Cowboys": { "primary": "#003594", "secondary": "#869397", "tertiary": "#FFFFFF" },
    "Denver Broncos": { "primary": "#FB4F14", "secondary": "#002244", "tertiary": "#FFFFFF" },
    "Detroit Lions": { "primary": "#0076B6", "secondary": "#B0B7BC", "tertiary": "#FFFFFF" },
    "Green Bay Packers": { "primary": "#203731", "secondary": "#FFB612", "tertiary": "#FFFFFF" },
    "Houston Texans": { "primary": "#03202F", "secondary": "#A71930", "tertiary": "#FFFFFF" },
    "Indianapolis Colts": { "primary": "#002C5F", "secondary": "#A2AAAD", "tertiary": "#FFFFFF" },
    "Jacksonville Jaguars": { "primary": "#006778", "secondary": "#9F792C", "tertiary": "#000000" },
    "Kansas City Chiefs": { "primary": "#E31837", "secondary": "#FFB81C", "tertiary": "#FFFFFF" },
    "Las Vegas Raiders": { "primary": "#000000", "secondary": "#A5ACAF", "tertiary": "#FFFFFF" },
    "Los Angeles Chargers": { "primary": "#002A5E", "secondary": "#FFC20E", "tertiary": "#0080C6" },
    "Los Angeles Rams": { "primary": "#003594", "secondary": "#FFA300", "tertiary": "#FFFFFF" },
    "Miami Dolphins": { "primary": "#008E97", "secondary": "#FC4C02", "tertiary": "#005778" },
    "Minnesota Vikings": { "primary": "#4F2683", "secondary": "#FFC62F", "tertiary": "#FFFFFF" },
    "New England Patriots": { "primary": "#002244", "secondary": "#C60C30", "tertiary": "#B0B7BC" },
    "New Orleans Saints": { "primary": "#D3BC8D", "secondary": "#101820", "tertiary": "#FFFFFF" },
    "New York Giants": { "primary": "#0B2265", "secondary": "#A71930", "tertiary": "#A5ACAF" },
    "New York Jets": { "primary": "#125740", "secondary": "#000000", "tertiary": "#FFFFFF" },
    "Philadelphia Eagles": { "primary": "#004C54", "secondary": "#A5ACAF", "tertiary": "#ACC0C6" },
    "Pittsburgh Steelers": { "primary": "#FFB612", "secondary": "#101820", "tertiary": "#A5ACAF" },
    "San Francisco 49ers": { "primary": "#AA0000", "secondary": "#B3995D", "tertiary": "#FFFFFF" },
    "Seattle Seahawks": { "primary": "#002244", "secondary": "#69BE28", "tertiary": "#A5ACAF" },
    "Tampa Bay Buccaneers": { "primary": "#D50A0A", "secondary": "#FF7900", "tertiary": "#0A0A08" },
    "Tennessee Titans": { "primary": "#0C2340", "secondary": "#4B92DB", "tertiary": "#C8102E" },
    "Washington Commanders": { "primary": "#5A1414", "secondary": "#FFB612", "tertiary": "#FFFFFF" }
}
```

### Military Branches
```json
{
    "US Army": { "primary": "#4B5320", "secondary": "#000000", "tertiary": "#FFC72C" },
    "US Navy": { "primary": "#003B6F", "secondary": "#FFFFFF", "tertiary": "#C8AA14" },
    "US Marine Corps": { "primary": "#CC0000", "secondary": "#000000", "tertiary": "#C8AA14" },
    "US Air Force": { "primary": "#00308F", "secondary": "#A5A5A5", "tertiary": "#FFFFFF" },
    "US Coast Guard": { "primary": "#003366", "secondary": "#FF6600", "tertiary": "#FFFFFF" },
    "US Space Force": { "primary": "#000C1D", "secondary": "#A5A5A5", "tertiary": "#FFFFFF" },
    "British Army": { "primary": "#8B0000", "secondary": "#000000", "tertiary": "#C8AA14" },
    "Royal Navy": { "primary": "#003366", "secondary": "#FFFFFF", "tertiary": "#C8AA14" },
    "Royal Air Force": { "primary": "#5B7FA3", "secondary": "#8B0000", "tertiary": "#FFFFFF" }
}
```

---

## Marketing & Sales Strategy

### Positioning
Heroes Live Forever occupies the **premium memorial art** space. Not cheap printed posters. Not mass-produced fan art. These are **heirloom-quality, museum-framed tribute pieces** with real 3D-printed mats, archival printing, and custom color-matched design.

**Price positioning:** $89-$349 depending on size and complexity.

| Size | Suggested Retail |
|------|-----------------|
| 8×10 | $89 |
| 12×16 | $129 |
| 16×20 | $179 |
| 20×24 | $229 |
| 24×24 | $269 |
| 24×36 | $349 |

### Sales Channels

1. **Direct-to-consumer website** (heroesliveforever.com)
   - Browse by category (military, sports, historical, etc.)
   - Select hero → choose size → preview → order
   - Custom orders (personal heroes, specific athletes)

2. **Sports retail partnerships**
   - Stadium gift shops
   - Official team stores
   - Sports memorabilia shows

3. **Military / veteran channels**
   - VFW / American Legion gift shops
   - Military base exchanges (PX/BX)
   - Veteran memorials and museums

4. **Gift market**
   - Father's Day (biggest single opportunity)
   - Graduation gifts (sports heroes for young athletes)
   - Memorial / sympathy gifts
   - Retirement gifts (military, coaching)

5. **Corporate / institutional**
   - Hall of fame installations
   - Office decor (law firms, financial advisors — historical figures)
   - Locker room installations
   - School hallway displays

### Product Line Tiers

**Signature Collection** — Pre-designed, ready-to-ship heroes
- 20-50 of the most universally recognized figures
- Military: Washington, Patton, Audie Murphy, Chris Kyle
- Sports: Jordan, Ali, Ruth, Montana, Gretzky
- Historical: Lincoln, Churchill, MLK, Einstein
- Ready-to-ship = faster fulfillment, lower cost

**Custom Collection** — Made-to-order for any subject
- Customer provides subject, we design
- 2-3 week turnaround
- Higher price point for custom work
- This is where the InDesign automation REALLY pays off

**Personal Heroes** — Memorial tributes for private individuals
- Highest margin, deepest emotional connection
- Funeral homes, memorial services, veteran organizations
- Requires careful, respectful design process
- White-glove customer service

### Marketing Copy Angles

**For Military:**
> "Some gave all. All gave some. Now their sacrifice lives forever on your wall."

**For Sports:**
> "The roar of the crowd fades. The legacy doesn't."

**For Historical:**
> "The figures who shaped our world, presented with the reverence they deserve."

**For Personal:**
> "Because the people who matter most deserve to be remembered beautifully."

**General:**
> "Heroes Live Forever. Premium framed tributes honoring the legends who shaped our world — and yours."

---

## Claude Code Implementation Notes

When building a new Heroes Live Forever piece, Claude should:

1. **Ask the right questions first:**
   - Who is the subject?
   - What category? (military, sports, historical, national, music, personal)
   - What frame size?
   - Do you have images, or should I find public domain options?
   - Any specific color preferences or requirements?

2. **Research the subject:**
   - Pull biographical facts (dates, key accomplishments, service record, stats)
   - Identify the signature quote
   - Determine the correct color theme (team colors, branch colors, flag colors)
   - Find appropriate public domain imagery if needed

3. **Generate the design:**
   - Build the HTML preview with embedded base64 images
   - Apply the correct category design language
   - Write the bio text (60-120 words, no em dashes)
   - Set typography, colors, and layout per the design system

4. **Generate the InDesign script:**
   - Output an ExtendScript .jsx that creates the InDesign document
   - Include all text content, color values, and image placement coordinates
   - Include the resolution checker
   - Set up for PDF/X-4 export

5. **Deliver:**
   - HTML preview file (self-contained, base64 images)
   - InDesign ExtendScript file (.jsx)
   - Bio panel content as separate text file
   - Resolution report
   - Production notes

---

## Quality Checklist

Before any piece ships:

- [ ] All images GREEN (300+ DPI) at placed size
- [ ] No em dashes anywhere in text
- [ ] Bio text is 60-120 words, factually accurate
- [ ] Quote is correctly attributed
- [ ] Colors match the subject category
- [ ] For sports: team colors verified against official brand guide
- [ ] For military: branch, rank, and unit verified
- [ ] For national: flag colors accurate
- [ ] Typography hierarchy is correct (name > quote > bio > attribution)
- [ ] Bio panel prints separately on appropriate stock
- [ ] Mat windows properly sized for all panels
- [ ] Frame color complements the composition
- [ ] No spelling errors
- [ ] Dates verified
- [ ] Overall composition feels custom, not templated
- [ ] "Would I hang this on my own wall?" — if no, redesign

---

*Heroes Live Forever — Built by HD Productions LLC*
*Design system v1.0*

# Heroes Live Forever — Phase 1 Build Checklist

## Step 1: Project Bootstrap
- [ ] Create package.json with dependencies
- [ ] Create server.js (Express, static files, dir creation)
- [ ] Create full directory structure
- [ ] Download Google Fonts locally
- [ ] Init git repo

## Step 2: Data Layer
- [ ] src/data/themes.js — 6 category themes with CSS values
- [ ] src/data/typography.js — Font families, weights, sizes
- [ ] src/data/layouts.js — Panel grid definitions
- [ ] src/data/colors/nfl.json — 32 teams
- [ ] src/data/colors/military.json — branches
- [ ] API routes: GET /api/themes, /api/colors/:db, /api/layouts

## Step 3: Theme Engine
- [ ] src/services/themeEngine.js — category + subcategory + team → visual spec
- [ ] Team/branch/flag color overlay logic

## Step 4: Frontend App Shell + Form
- [ ] public/index.html — two-column layout
- [ ] public/css/app.css — dark theme, form styles
- [ ] public/css/renderer.css — preview area styles
- [ ] public/js/app.js — app initialization
- [ ] public/js/form.js — cascading fields, validation, word counter
- [ ] public/js/themeClient.js — client-side theme resolution

## Step 5: Live Preview Renderer
- [ ] public/js/renderer.js — DOM builder matching Tolkien quality
- [ ] All 3 layout types (3-panel, 4-panel, 4-panel-alt)
- [ ] All 6 frame sizes with proportional scaling
- [ ] Real-time updates on form changes

## Step 6: Image Upload + DPI Checking
- [ ] src/services/resolutionChecker.js (sharp)
- [ ] POST /api/images/upload endpoint
- [ ] public/js/imageUpload.js — drag-drop + DPI badges
- [ ] src/utils/imageUtils.js — image processing helpers

## Step 7: InDesign ExtendScript Export
- [ ] src/services/layoutEngine.js — panel positions (inches + pixels)
- [ ] src/services/jsxGenerator.js — ES3 ExtendScript output
- [ ] POST /api/exports/jsx endpoint

## Step 8: Bio Panel PDF Export
- [ ] src/services/bioPdfGenerator.js (Puppeteer)
- [ ] POST /api/exports/pdf endpoint

## Step 9: Self-Contained HTML Export
- [ ] src/services/htmlExporter.js — base64 images, embedded fonts
- [ ] POST /api/exports/html endpoint

## Step 10: Polish
- [ ] Text validation (em dash detection, word count)
- [ ] src/utils/textUtils.js — text utilities
- [ ] Brand name "Heroes Live Forever" everywhere
- [ ] End-to-end test with Tolkien data
- [ ] End-to-end test with military hero
- [ ] End-to-end test with sports legend

## Verification
- [ ] Live preview matches Tolkien reference visually
- [ ] .jsx runs in InDesign with correct output
- [ ] Bio PDF has correct size, DPI, parchment background
- [ ] HTML export works offline with embedded images
- [ ] DPI badges show correctly for test images

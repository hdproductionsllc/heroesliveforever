# Heroes Live Forever — Phase 1 Build Checklist

## Step 1: Project Bootstrap
- [x] Create package.json with dependencies
- [x] Create server.js (Express, static files, dir creation)
- [x] Create full directory structure
- [ ] Download Google Fonts locally (using CDN for now)
- [x] Init git repo

## Step 2: Data Layer
- [x] src/data/themes.js — 6 category themes with CSS values
- [x] src/data/typography.js — Font families, weights, sizes
- [x] src/data/layouts.js — 9 panel layout variants (5 three-panel + 4 four-panel)
- [x] src/data/colors/nfl.json — 32 teams
- [x] src/data/colors/military.json — branches
- [x] API routes: GET /api/themes, /api/colors/:db, /api/layouts + more

## Step 3: Theme Engine
- [x] src/services/themeEngine.js — category + subcategory + team → visual spec
- [x] Team/branch/flag color overlay logic

## Step 4: Frontend App Shell + Form
- [x] public/index.html — two-column layout
- [x] public/css/app.css — dark theme, form styles
- [x] public/css/renderer.css — preview area styles
- [x] public/js/app.js — app initialization
- [x] public/js/form.js — cascading fields, validation, word counter
- [x] public/js/themeClient.js — client-side theme resolution

## Step 5: Live Preview Renderer
- [x] public/js/renderer.js — DOM builder matching Tolkien quality
- [x] 9 layout variants (5 three-panel + 4 four-panel orientations)
- [x] All 6 frame sizes with proportional scaling
- [x] Real-time updates on form changes

## Step 6: Image Upload + DPI Checking
- [x] src/services/resolutionChecker.js (sharp)
- [x] POST /api/images/upload endpoint
- [x] public/js/imageUpload.js — drag-drop + DPI badges
- [x] src/utils/imageUtils.js — image processing helpers

## Step 7: InDesign ExtendScript Export
- [x] src/services/layoutEngine.js — panel positions (inches + pixels)
- [x] src/services/jsxGenerator.js — ES3 ExtendScript output
- [x] POST /api/exports/jsx endpoint
- [x] Verified: generates valid ES3, correct dimensions, color swatches

## Step 8: Bio Panel PDF Export
- [x] src/services/bioPdfGenerator.js (Puppeteer)
- [x] POST /api/exports/pdf endpoint

## Step 9: Self-Contained HTML Export
- [x] src/services/htmlExporter.js — base64 images, embedded fonts
- [x] POST /api/exports/html endpoint

## Step 10a: Wikipedia Auto-Populate
- [x] src/services/heroLookup.js — Wikipedia REST API integration
- [x] POST /api/hero/lookup endpoint in api.js
- [x] "Look Up" button in index.html next to name field
- [x] populateFromLookup() in form.js with cascading updates
- [x] CSS for lookup button + loading spinner
- [x] Verified: Tolkien → historical, 1892–1973, Writer | Philologist
- [x] Verified: Michael Jordan → sports, 1963, Basketball player | Businessman
- [x] Verified: Audie Murphy → military, 1925–1971, Soldier | Actor
- [x] Verified: Winston Churchill → national, 1874–1965, Statesman | Writer

## Step 10: Polish
- [x] Text validation (em dash detection, word count)
- [x] src/utils/textUtils.js — text utilities
- [x] Brand name "Heroes Live Forever" everywhere
- [ ] End-to-end test with Tolkien data (browser)
- [ ] End-to-end test with military hero (browser)
- [ ] End-to-end test with sports legend (browser)

## Verification
- [ ] Live preview matches Tolkien reference visually
- [ ] .jsx runs in InDesign with correct output
- [ ] Bio PDF has correct size, DPI, parchment background
- [ ] HTML export works offline with embedded images
- [ ] DPI badges show correctly for test images

---

# Phase 2: Image System + Export Fix

## Phase 2.1: Fix JSX/InDesign Export
- [x] Convert serverPath → absolute filesystem paths in exports.js
- [x] Use forward slashes for ExtendScript cross-platform compatibility
- [x] Add safeFont() helper with fallback chain (requested → named fallback → Times New Roman → app.fonts[0])
- [x] Fix addSwatch() to use .isValid instead of try/catch
- [x] Add UTF-8 BOM (\uFEFF) to JSX output

## Phase 2.2: Auto-Load Images from Hero Lookup
- [x] heroLookup.js: return originalImageUrl (Wikipedia originalimage.source)
- [x] heroLookup.js: LoC presidential portrait lookup (all 47 presidents)
- [x] api.js: POST /api/images/download-url (proxy-download from whitelisted domains)
- [x] imageUpload.js: loadFromServer(panelId, serverData) method
- [x] imageUpload.js: loadFileToPanel(panelId, file) method
- [x] form.js: loadHeroImage() called in populateFromLookup() after text fields set

## Phase 2.5: Multi-Image Auto-Populate (All Panels)
- [x] heroLookup.js: fetchMediaList() — fetch all images from Wikipedia article
- [x] heroLookup.js: fetchImageInfo() — batch get URLs + dimensions via MediaWiki API
- [x] heroLookup.js: fetchHeroImages() — classify images (portrait vs dramatic vs extra)
- [x] heroLookup.js: return `images: { hero, secondary, tertiary }` from lookupHero()
- [x] form.js: loadAllPanelImages() — parallel download + load into all panels
- [x] Verified: CS Lewis, Tolkien, Lincoln, Babe Ruth, Elvis all return 3 images

## Phase 2.3: Drag and Drop on Preview Panels
- [x] renderer.js: data-panel attribute on image panels in buildImagePanel()
- [x] renderer.js: onPostRender(callback) hook
- [x] app.js: attachPanelDragDrop() with dragover/dragleave/drop handlers
- [x] Gold outline visual feedback on dragover

## Phase 2.4: Smart Auto-Crop + Manual Reposition
- [x] api.js: POST /api/images/analyze-crop (sharp entropy analysis)
- [x] imageUpload.js: analyzeAndSetPosition() after upload/download
- [x] imageUpload.js: setImagePosition() for manual position persistence
- [x] app.js: mousedown/mousemove/mouseup for click-drag repositioning
- [x] renderer.css: grab/grabbing cursor styles, user-select: none on images
- [x] Position survives re-renders (stored in uploadedImages, read by renderer)

## Phase 2.6: Per-Panel Gallery Picker (Browse Wikipedia Images)
- [x] heroLookup.js: fetchGallery(title) — returns all viable images with thumbnail URLs
- [x] heroLookup.js: makeThumbUrl() helper — converts full Wikimedia URLs to sized thumbnails
- [x] api.js: POST /api/hero/gallery endpoint
- [x] form.js: heroWikiTitle tracking + getWikiTitle() export
- [x] index.html: Browse button on each image panel (hero, secondary, tertiary)
- [x] app.css: gallery popover styles (.image-gallery, .gallery-grid, .gallery-thumb, etc.)
- [x] imageUpload.js: openGallery(), selectGalleryImage(), closeGallery()
- [x] Verified: Lincoln returns 27 gallery images, thumbs generate correctly, sorted by size

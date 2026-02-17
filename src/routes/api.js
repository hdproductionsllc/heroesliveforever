/**
 * API Routes — data endpoints and image upload.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const themes = require('../data/themes');
const typography = require('../data/typography');
const { layouts, frameSizes, printDimensions } = require('../data/layouts');
const { resolveTheme, getColorDatabases, loadColorDb } = require('../services/themeEngine');
const { getLayoutsForSize, calculateLayout } = require('../services/layoutEngine');
const { checkResolution, getImageDimensions } = require('../services/resolutionChecker');
const { validateBio } = require('../utils/textUtils');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|tiff|tif|webp|gif/i;
    const ext = allowed.test(path.extname(file.originalname));
    const mime = allowed.test(file.mimetype.split('/')[1]);
    cb(null, ext || mime);
  }
});

// GET /api/themes — all category themes
router.get('/themes', (req, res) => {
  const summary = {};
  for (const [key, theme] of Object.entries(themes)) {
    summary[key] = { label: theme.label, category: key };
  }
  res.json(summary);
});

// GET /api/themes/:category — full theme for a category
router.get('/themes/:category', (req, res) => {
  const theme = themes[req.params.category];
  if (!theme) return res.status(404).json({ error: 'Unknown category' });
  res.json(theme);
});

// POST /api/themes/resolve — resolve a complete visual spec
router.post('/themes/resolve', (req, res) => {
  try {
    const spec = resolveTheme(req.body);
    res.json(spec);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/typography
router.get('/typography', (req, res) => {
  res.json(typography);
});

// GET /api/colors — list available color databases
router.get('/colors', (req, res) => {
  res.json(getColorDatabases());
});

// GET /api/colors/:db — get a color database
router.get('/colors/:db', (req, res) => {
  const db = loadColorDb(req.params.db);
  if (!db) return res.status(404).json({ error: 'Color database not found' });
  res.json(db);
});

// GET /api/layouts — all layout definitions
router.get('/layouts', (req, res) => {
  res.json(layouts);
});

// GET /api/layouts/:frameSize — layouts available for a frame size
router.get('/layouts/:frameSize', (req, res) => {
  const available = getLayoutsForSize(req.params.frameSize);
  if (available.length === 0) return res.status(404).json({ error: 'Unknown frame size' });
  res.json(available);
});

// GET /api/frame-sizes — all frame sizes
router.get('/frame-sizes', (req, res) => {
  res.json(frameSizes);
});

// POST /api/layout/calculate — calculate panel positions
router.post('/layout/calculate', (req, res) => {
  try {
    const result = calculateLayout(req.body.frameSize, req.body.layout);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/images/upload — upload an image + return dimensions and DPI
router.post('/images/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const filePath = req.file.path;
    const dims = await getImageDimensions(filePath);

    // If placement size provided, calculate DPI
    let resolution = null;
    if (req.body.placedWidthIn && req.body.placedHeightIn) {
      resolution = await checkResolution(
        filePath,
        parseFloat(req.body.placedWidthIn),
        parseFloat(req.body.placedHeightIn)
      );
    }

    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      dimensions: dims,
      resolution
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/images/check-resolution — check DPI for an already-uploaded image
router.post('/images/check-resolution', async (req, res) => {
  const { filename, placedWidthIn, placedHeightIn } = req.body;
  if (!filename || !placedWidthIn || !placedHeightIn) {
    return res.status(400).json({ error: 'filename, placedWidthIn, and placedHeightIn required' });
  }

  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
  try {
    const result = await checkResolution(filePath, parseFloat(placedWidthIn), parseFloat(placedHeightIn));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/validate/bio — validate bio text
router.post('/validate/bio', (req, res) => {
  const result = validateBio(req.body.text);
  res.json(result);
});

module.exports = router;

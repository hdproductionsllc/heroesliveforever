/**
 * API Routes — data endpoints and image upload.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const fs = require('fs');
const https = require('https');
const http = require('http');
const sharp = require('sharp');
const themes = require('../data/themes');
const typography = require('../data/typography');
const { layouts, frameSizes, printDimensions } = require('../data/layouts');
const { resolveTheme, getColorDatabases, loadColorDb } = require('../services/themeEngine');
const { getLayoutsForSize, calculateLayout } = require('../services/layoutEngine');
const { checkResolution, getImageDimensions } = require('../services/resolutionChecker');
const { validateBio } = require('../utils/textUtils');
const { lookupHero, fetchGallery } = require('../services/heroLookup');

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
  const { frameSize, layout } = req.body;

  // Validate against allowed values
  if (!frameSize || !frameSizes[frameSize]) {
    return res.status(400).json({ error: `Invalid frame size: ${frameSize}` });
  }
  if (!layout || !layouts[layout]) {
    return res.status(400).json({ error: `Invalid layout: ${layout}` });
  }

  try {
    const result = calculateLayout(frameSize, layout);
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

// POST /api/hero/lookup — auto-populate hero data from Wikipedia
router.post('/hero/lookup', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const data = await lookupHero(name);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/hero/gallery — fetch all viable images from a Wikipedia article
router.post('/hero/gallery', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const images = await fetchGallery(title.trim().replace(/\s+/g, '_'));
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/images/download-url — proxy-download an image from a whitelisted URL
router.post('/images/download-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  // Whitelist domains
  const allowed = ['upload.wikimedia.org', 'commons.wikimedia.org'];
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!allowed.includes(parsed.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  try {
    // Download the image (with timeout and size limit)
    const MAX_DOWNLOAD_SIZE = 50 * 1024 * 1024; // 50MB
    const DOWNLOAD_TIMEOUT = 15000; // 15 seconds

    const downloadImage = (targetUrl) => new Promise((resolve, reject) => {
      const proto = new URL(targetUrl).protocol === 'https:' ? https : http;
      const timeout = setTimeout(() => reject(new Error('Download timed out')), DOWNLOAD_TIMEOUT);

      const request = (reqUrl, redirectCount) => {
        if (redirectCount > 5) {
          clearTimeout(timeout);
          return reject(new Error('Too many redirects'));
        }
        const req = proto.get(reqUrl, { headers: { 'User-Agent': 'HeroesLiveForever/1.0' } }, (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            return request(response.headers.location, redirectCount + 1);
          }
          if (response.statusCode === 429) {
            clearTimeout(timeout);
            response.resume();
            return reject(new Error('RATE_LIMITED'));
          }
          if (response.statusCode !== 200) {
            clearTimeout(timeout);
            return reject(new Error(`Download failed: HTTP ${response.statusCode}`));
          }
          const chunks = [];
          let totalSize = 0;
          response.on('data', chunk => {
            totalSize += chunk.length;
            if (totalSize > MAX_DOWNLOAD_SIZE) {
              response.destroy();
              clearTimeout(timeout);
              reject(new Error('Image exceeds 50MB size limit'));
              return;
            }
            chunks.push(chunk);
          });
          response.on('end', () => {
            clearTimeout(timeout);
            resolve(Buffer.concat(chunks));
          });
          response.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
        req.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      };
      request(targetUrl, 0);
    });

    // Download with retry on rate limiting (Wikimedia 429s)
    let imageBuffer;
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        imageBuffer = await downloadImage(url);
        break;
      } catch (err) {
        lastErr = err;
        if (err.message === 'RATE_LIMITED' && attempt < 2) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    if (!imageBuffer) throw lastErr;

    // Determine extension from URL or content-type
    const urlPath = parsed.pathname;
    let ext = path.extname(urlPath).toLowerCase();
    if (!ext || !/^\.(jpg|jpeg|png|gif|tiff|tif|webp)$/.test(ext)) ext = '.jpg';

    const filename = uuidv4() + ext;
    const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
    fs.writeFileSync(filePath, imageBuffer);

    // Get dimensions
    const dims = await getImageDimensions(filePath);

    res.json({
      filename,
      originalName: path.basename(urlPath),
      path: `/uploads/${filename}`,
      size: imageBuffer.length,
      dimensions: dims
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/images/analyze-crop — entropy-based smart crop position
router.post('/images/analyze-crop', async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename is required' });

  const filePath = path.join(__dirname, '..', '..', 'uploads', path.basename(filename));

  try {
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;
    const isPortrait = height > width * 1.3;

    // Divide image into vertical thirds and compare entropy
    const thirdHeight = Math.floor(height / 3);

    const [topStats, midStats, botStats] = await Promise.all([
      sharp(filePath).extract({ left: 0, top: 0, width, height: thirdHeight }).stats(),
      sharp(filePath).extract({ left: 0, top: thirdHeight, width, height: thirdHeight }).stats(),
      sharp(filePath).extract({ left: 0, top: thirdHeight * 2, width, height: height - thirdHeight * 2 }).stats()
    ]);

    // Use entropy as a proxy for detail/interest
    const topEntropy = topStats.entropy;
    const midEntropy = midStats.entropy;
    const botEntropy = botStats.entropy;

    let position;
    if (isPortrait) {
      // Portrait images: bias toward top (faces are usually top third)
      position = 'center 20%';
    } else if (topEntropy >= midEntropy && topEntropy >= botEntropy) {
      position = 'center 20%';
    } else if (botEntropy >= midEntropy && botEntropy >= topEntropy) {
      position = 'center 70%';
    } else {
      position = 'center center';
    }

    res.json({
      position,
      entropy: { top: topEntropy, mid: midEntropy, bot: botEntropy },
      isPortrait,
      dimensions: { width, height }
    });
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

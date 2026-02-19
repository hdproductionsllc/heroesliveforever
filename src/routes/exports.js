/**
 * Export Routes — generate InDesign JSX, bio PDF, and self-contained HTML.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { generateJsx } = require('../services/jsxGenerator');
const { generateBioPdf } = require('../services/bioPdfGenerator');
const { generateDesignPdf } = require('../services/designPdfGenerator');
const { exportHtml } = require('../services/htmlExporter');
const { calculateLayout } = require('../services/layoutEngine');

// POST /api/exports/jsx — generate InDesign ExtendScript
router.post('/jsx', (req, res) => {
  try {
    const heroData = req.body;

    // Convert server paths to absolute filesystem paths for ExtendScript
    if (heroData.images) {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      for (const [key, img] of Object.entries(heroData.images)) {
        if (img && img.serverPath) {
          const filename = path.basename(img.serverPath);
          img.absolutePath = path.resolve(uploadsDir, filename).replace(/\\/g, '/');
        }
      }
    }

    const jsx = generateJsx(heroData);

    const safeName = (heroData.name || 'hero').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${safeName}_${heroData.frameSize}_${Date.now()}.jsx`;
    const outputPath = path.join(__dirname, '..', '..', 'output', 'jsx', filename);

    // Prepend UTF-8 BOM for InDesign compatibility
    fs.writeFileSync(outputPath, '\uFEFF' + jsx, 'utf8');

    res.json({
      success: true,
      filename,
      path: `/output/jsx/${filename}`,
      downloadUrl: `/api/exports/download/jsx/${filename}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exports/pdf — generate bio panel PDF
router.post('/pdf', async (req, res) => {
  try {
    const heroData = req.body;

    // Calculate the bio panel dimensions
    const layout = calculateLayout(heroData.frameSize, heroData.layout);
    const bioPanel = layout.panels.inches.find(p => p.id === 'bio');

    if (!bioPanel) {
      return res.status(400).json({ error: 'No bio panel found in layout' });
    }

    const safeName = (heroData.name || 'hero').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${safeName}_bio_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '..', '..', 'output', 'pdf', filename);

    await generateBioPdf(heroData, {
      width: bioPanel.width,
      height: bioPanel.height
    }, outputPath);

    res.json({
      success: true,
      filename,
      panelSize: { width: bioPanel.width, height: bioPanel.height },
      path: `/output/pdf/${filename}`,
      downloadUrl: `/api/exports/download/pdf/${filename}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exports/design-pdf — generate full design print PDF (mat only, no frame)
router.post('/design-pdf', async (req, res) => {
  try {
    const { heroData, rendererHtml } = req.body;

    if (!rendererHtml) {
      return res.status(400).json({ error: 'No renderer HTML provided' });
    }

    // Resolve image server paths to absolute filesystem paths
    if (heroData.images) {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      for (const [key, img] of Object.entries(heroData.images)) {
        if (img && img.serverPath) {
          const filename = path.basename(img.serverPath);
          img.serverPath = path.resolve(uploadsDir, filename);
        }
      }
    }

    const safeName = (heroData.name || 'hero').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${safeName}_${heroData.frameSize}_print_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '..', '..', 'output', 'pdf', filename);

    const result = await generateDesignPdf(heroData, rendererHtml, outputPath);

    res.json({
      success: true,
      filename,
      matSize: { width: result.matWidth, height: result.matHeight },
      downloadUrl: `/api/exports/download/pdf/${filename}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exports/html — generate self-contained HTML
router.post('/html', async (req, res) => {
  try {
    const { heroData, rendererHtml } = req.body;

    const safeName = (heroData.name || 'hero').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${safeName}_${heroData.frameSize}_${Date.now()}.html`;
    const outputPath = path.join(__dirname, '..', '..', 'output', 'html', filename);

    await exportHtml(heroData, rendererHtml, outputPath);

    res.json({
      success: true,
      filename,
      path: `/output/html/${filename}`,
      downloadUrl: `/api/exports/download/html/${filename}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/exports/download/:type/:filename — download an exported file
router.get('/download/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const validTypes = ['jsx', 'pdf', 'html'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid export type' });
  }

  // Sanitize filename to prevent path traversal
  const safeName = path.basename(filename);
  const filePath = path.join(__dirname, '..', '..', 'output', type, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const contentTypes = {
    jsx: 'application/javascript',
    pdf: 'application/pdf',
    html: 'text/html'
  };

  res.setHeader('Content-Type', contentTypes[type]);
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.sendFile(filePath);
});

module.exports = router;

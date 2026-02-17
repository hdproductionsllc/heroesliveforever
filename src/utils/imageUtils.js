/**
 * Image utilities — processing helpers for uploads and exports.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Generate a thumbnail for preview.
 */
async function createThumbnail(inputPath, outputPath, maxWidth = 800) {
  await sharp(inputPath)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
  return outputPath;
}

/**
 * Convert an image file to base64 data URL.
 */
function imageToDataUrl(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mimeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    tiff: 'image/tiff',
    tif: 'image/tiff'
  };
  const mime = mimeMap[ext] || 'image/jpeg';
  return `data:${mime};base64,${data.toString('base64')}`;
}

/**
 * Get image dimensions without loading full pixel data.
 */
async function getDimensions(filePath) {
  const meta = await sharp(filePath).metadata();
  return {
    width: meta.width,
    height: meta.height,
    format: meta.format
  };
}

module.exports = { createThumbnail, imageToDataUrl, getDimensions };

/**
 * Resolution Checker — reads image dimensions with sharp, calculates DPI at placed size.
 */

const sharp = require('sharp');
const path = require('path');

/**
 * Check image resolution at a given placement size.
 *
 * @param {string} imagePath - Path to the image file
 * @param {number} placedWidthIn - Width of the placement in inches
 * @param {number} placedHeightIn - Height of the placement in inches
 * @returns {Object} { status, dpi, width, height, placedDpiH, placedDpiV, message }
 */
async function checkResolution(imagePath, placedWidthIn, placedHeightIn) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      return {
        status: 'RED',
        dpi: 0,
        width: 0,
        height: 0,
        message: 'Could not read image dimensions'
      };
    }

    // DPI at placed size
    const placedDpiH = width / placedWidthIn;
    const placedDpiV = height / placedHeightIn;
    const effectiveDpi = Math.min(placedDpiH, placedDpiV);

    let status, message;
    if (effectiveDpi >= 300) {
      status = 'GREEN';
      message = 'Print quality excellent';
    } else if (effectiveDpi >= 200) {
      status = 'YELLOW';
      message = 'Acceptable with sharpening';
    } else {
      status = 'RED';
      message = 'Too low — will print soft';
    }

    return {
      status,
      dpi: Math.round(effectiveDpi),
      width,
      height,
      placedDpiH: Math.round(placedDpiH),
      placedDpiV: Math.round(placedDpiV),
      message
    };
  } catch (err) {
    return {
      status: 'RED',
      dpi: 0,
      width: 0,
      height: 0,
      message: `Error reading image: ${err.message}`
    };
  }
}

/**
 * Quick metadata read — just dimensions, no DPI calculation.
 */
async function getImageDimensions(imagePath) {
  const metadata = await sharp(imagePath).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    space: metadata.space,
    channels: metadata.channels,
    density: metadata.density || null
  };
}

module.exports = { checkResolution, getImageDimensions };

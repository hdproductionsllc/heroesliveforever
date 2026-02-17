/**
 * InDesign ExtendScript Generator — outputs ES3-compatible .jsx files.
 * Creates complete InDesign documents with panels, images, bio text, and theme colors.
 *
 * CRITICAL: ExtendScript is ES3. No arrow functions, no template literals,
 * no let/const, no destructuring, no default params. Use var and string concat only.
 */

const { calculateLayout } = require('./layoutEngine');
const { resolveTheme } = require('./themeEngine');

/**
 * Convert hex color to ExtendScript RGB array [r, g, b] (0-255).
 */
function hexToRgb(hex) {
  if (!hex || hex === 'transparent') return [0, 0, 0];
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16)
  ];
}

/**
 * Escape a string for ExtendScript (ES3 string literal).
 */
function escStr(s) {
  if (!s) return '';
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\u2013/g, '\\u2013')  // en dash
    .replace(/\u2014/g, '\\u2014')  // em dash
    .replace(/\u201C/g, '\\u201C')  // left double quote
    .replace(/\u201D/g, '\\u201D')  // right double quote
    .replace(/\u2018/g, '\\u2018')  // left single quote
    .replace(/\u2019/g, '\\u2019'); // right single quote
}

/**
 * Generate the complete .jsx ExtendScript for a hero piece.
 *
 * @param {Object} heroData - Full hero data from the form
 * @returns {string} ExtendScript source code
 */
function generateJsx(heroData) {
  const layout = calculateLayout(heroData.frameSize, heroData.layout);
  const theme = resolveTheme({
    category: heroData.category,
    subcategory: heroData.subcategory,
    team: heroData.team,
    colorDb: heroData.colorDb
  });

  const frame = layout.frame;
  const panels = layout.panels.inches;
  const dims = layout.dimensions;

  const matRgb = hexToRgb(theme.mat.background);
  const bioNameRgb = hexToRgb(theme.bio.nameColor);
  const bioTextRgb = hexToRgb(theme.bio.textColor);
  const bioQuoteRgb = hexToRgb(theme.bio.quoteColor);
  const bioAttrRgb = hexToRgb(theme.bio.attributionColor);
  const bioDatesRgb = hexToRgb(theme.bio.datesColor);

  const displayFont = theme.typography.display.family.split("'")[1] || 'Cormorant Garamond';
  const bodyFont = theme.typography.body.family.split("'")[1] || 'EB Garamond';
  const quoteFont = theme.typography.quote.family.split("'")[1] || 'Cormorant Garamond';

  // Build the ExtendScript
  var jsx = '';

  jsx += '// HEROES LIVE FOREVER — InDesign ExtendScript\n';
  jsx += '// Generated: ' + new Date().toISOString() + '\n';
  jsx += '// Hero: ' + escStr(heroData.name) + '\n';
  jsx += '// Frame: ' + heroData.frameSize + ' | Layout: ' + heroData.layout + '\n';
  jsx += '// Category: ' + heroData.category + '\n';
  jsx += '#target indesign\n\n';

  // Main function
  jsx += '(function() {\n';
  jsx += '  var docWidth = ' + frame.width + ';\n';
  jsx += '  var docHeight = ' + frame.height + ';\n';
  jsx += '  var frameBorder = ' + dims.frameBorderIn + ';\n';
  jsx += '  var matPadding = ' + dims.matPaddingIn + ';\n';
  jsx += '  var panelGap = ' + dims.gapIn + ';\n\n';

  // Create document
  jsx += '  // Create document\n';
  jsx += '  var doc = app.documents.add();\n';
  jsx += '  doc.documentPreferences.pageWidth = docWidth + " in";\n';
  jsx += '  doc.documentPreferences.pageHeight = docHeight + " in";\n';
  jsx += '  doc.documentPreferences.facingPages = false;\n';
  jsx += '  doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.INCHES;\n';
  jsx += '  doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;\n\n';

  // Color swatches
  jsx += '  // Color swatches\n';
  jsx += '  function addSwatch(name, r, g, b) {\n';
  jsx += '    try { return doc.colors.itemByName(name); } catch(e) {}\n';
  jsx += '    var c = doc.colors.add();\n';
  jsx += '    c.name = name;\n';
  jsx += '    c.model = ColorModel.PROCESS;\n';
  jsx += '    c.space = ColorSpace.RGB;\n';
  jsx += '    c.colorValue = [r, g, b];\n';
  jsx += '    return c;\n';
  jsx += '  }\n\n';

  jsx += '  var matColor = addSwatch("HLF Mat", ' + matRgb.join(', ') + ');\n';
  jsx += '  var bioNameColor = addSwatch("HLF Bio Name", ' + bioNameRgb.join(', ') + ');\n';
  jsx += '  var bioTextColor = addSwatch("HLF Bio Text", ' + bioTextRgb.join(', ') + ');\n';
  jsx += '  var bioQuoteColor = addSwatch("HLF Bio Quote", ' + bioQuoteRgb.join(', ') + ');\n';
  jsx += '  var bioAttrColor = addSwatch("HLF Bio Attr", ' + bioAttrRgb.join(', ') + ');\n';
  jsx += '  var bioDatesColor = addSwatch("HLF Bio Dates", ' + bioDatesRgb.join(', ') + ');\n\n';

  // Mat background
  jsx += '  // Mat background (full page)\n';
  jsx += '  var page = doc.pages[0];\n';
  jsx += '  var matBg = page.rectangles.add();\n';
  jsx += '  matBg.geometricBounds = [0, 0, docHeight, docWidth];\n';
  jsx += '  matBg.fillColor = matColor;\n';
  jsx += '  matBg.strokeWeight = 0;\n';
  jsx += '  matBg.name = "Mat Background";\n\n';

  // Panel windows
  jsx += '  // Panel windows\n';
  jsx += '  var offsetX = frameBorder + matPadding;\n';
  jsx += '  var offsetY = frameBorder + matPadding;\n\n';

  for (const panel of panels) {
    const top = 'offsetY + ' + panel.y;
    const left = 'offsetX + ' + panel.x;
    const bottom = 'offsetY + ' + (panel.y + panel.height);
    const right = 'offsetX + ' + (panel.x + panel.width);

    if (panel.type === 'image') {
      jsx += '  // ' + panel.label + '\n';
      jsx += '  var ' + panel.id + 'Frame = page.rectangles.add();\n';
      jsx += '  ' + panel.id + 'Frame.geometricBounds = [' + top + ', ' + left + ', ' + bottom + ', ' + right + '];\n';
      jsx += '  ' + panel.id + 'Frame.name = "' + escStr(panel.label) + '";\n';
      jsx += '  ' + panel.id + 'Frame.fillColor = "Paper";\n';
      jsx += '  ' + panel.id + 'Frame.strokeWeight = 0;\n';

      // Place image if path provided
      const imageKey = panel.id === 'secondary' ? 'secondary' : panel.id === 'tertiary' ? 'tertiary' : 'hero';
      if (heroData.images && heroData.images[imageKey] && heroData.images[imageKey].path) {
        jsx += '  try {\n';
        jsx += '    var ' + panel.id + 'Img = ' + panel.id + 'Frame.place(new File("' + escStr(heroData.images[imageKey].path) + '"));\n';
        jsx += '    ' + panel.id + 'Frame.fit(FitOptions.FILL_PROPORTIONALLY);\n';
        jsx += '    ' + panel.id + 'Frame.fit(FitOptions.CENTER_CONTENT);\n';
        jsx += '  } catch(e) { /* image not found */ }\n';
      }
      jsx += '\n';

    } else if (panel.type === 'bio') {
      jsx += '  // Bio Panel\n';
      jsx += '  var bioFrame = page.rectangles.add();\n';
      jsx += '  bioFrame.geometricBounds = [' + top + ', ' + left + ', ' + bottom + ', ' + right + '];\n';
      jsx += '  bioFrame.name = "Bio Panel";\n';
      jsx += '  bioFrame.fillColor = "Paper";\n';
      jsx += '  bioFrame.strokeWeight = 0;\n\n';

      // Bio text frame
      jsx += '  var bioText = page.textFrames.add();\n';
      jsx += '  bioText.geometricBounds = [\n';
      jsx += '    ' + top + ' + 0.25,\n';
      jsx += '    ' + left + ' + 0.3,\n';
      jsx += '    ' + bottom + ' - 0.25,\n';
      jsx += '    ' + right + ' - 0.3\n';
      jsx += '  ];\n';
      jsx += '  bioText.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;\n';
      jsx += '  bioText.textFramePreferences.insetSpacing = [0, 0, 0, 0];\n\n';

      // Build bio content
      jsx += '  // Bio content\n';
      jsx += '  var story = bioText.parentStory;\n\n';

      // Name
      jsx += '  story.insertionPoints[-1].contents = "' + escStr(heroData.name || 'HERO NAME').toUpperCase() + '\\n";\n';
      jsx += '  var nameRange = story.paragraphs[-1];\n';
      jsx += '  nameRange.appliedFont = app.fonts.itemByName("' + escStr(displayFont) + '");\n';
      jsx += '  nameRange.pointSize = 18;\n';
      jsx += '  nameRange.tracking = 200;\n';
      jsx += '  nameRange.fillColor = bioNameColor;\n';
      jsx += '  nameRange.justification = Justification.CENTER_ALIGN;\n';
      jsx += '  nameRange.capitalization = Capitalization.ALL_CAPS;\n\n';

      // Dates
      if (heroData.dates) {
        jsx += '  story.insertionPoints[-1].contents = "' + escStr(heroData.dates) + '\\n";\n';
        jsx += '  var datesRange = story.paragraphs[-1];\n';
        jsx += '  datesRange.appliedFont = app.fonts.itemByName("' + escStr(bodyFont) + '");\n';
        jsx += '  datesRange.pointSize = 9;\n';
        jsx += '  datesRange.tracking = 200;\n';
        jsx += '  datesRange.fillColor = bioDatesColor;\n';
        jsx += '  datesRange.justification = Justification.CENTER_ALIGN;\n';
        jsx += '  datesRange.spaceAfter = 6;\n\n';
      }

      // Bio text
      if (heroData.bio) {
        jsx += '  story.insertionPoints[-1].contents = "' + escStr(heroData.bio) + '\\n";\n';
        jsx += '  var bioRange = story.paragraphs[-1];\n';
        jsx += '  bioRange.appliedFont = app.fonts.itemByName("' + escStr(bodyFont) + '");\n';
        jsx += '  bioRange.pointSize = 8;\n';
        jsx += '  bioRange.leading = 12;\n';
        jsx += '  bioRange.fillColor = bioTextColor;\n';
        jsx += '  bioRange.justification = Justification.CENTER_ALIGN;\n';
        jsx += '  bioRange.spaceAfter = 8;\n\n';
      }

      // Quote
      if (heroData.quote) {
        jsx += '  story.insertionPoints[-1].contents = "\\u201C' + escStr(heroData.quote) + '\\u201D\\n";\n';
        jsx += '  var quoteRange = story.paragraphs[-1];\n';
        jsx += '  quoteRange.appliedFont = app.fonts.itemByName("' + escStr(quoteFont) + '");\n';
        jsx += '  quoteRange.fontStyle = "Italic";\n';
        jsx += '  quoteRange.pointSize = 10;\n';
        jsx += '  quoteRange.fillColor = bioQuoteColor;\n';
        jsx += '  quoteRange.justification = Justification.CENTER_ALIGN;\n';
        jsx += '  quoteRange.spaceAfter = 4;\n\n';
      }

      // Attribution
      if (heroData.attribution) {
        jsx += '  story.insertionPoints[-1].contents = "' + escStr(heroData.attribution).toUpperCase() + '";\n';
        jsx += '  var attrRange = story.paragraphs[-1];\n';
        jsx += '  attrRange.appliedFont = app.fonts.itemByName("Helvetica");\n';
        jsx += '  attrRange.pointSize = 6.5;\n';
        jsx += '  attrRange.tracking = 200;\n';
        jsx += '  attrRange.fillColor = bioAttrColor;\n';
        jsx += '  attrRange.justification = Justification.CENTER_ALIGN;\n';
        jsx += '  attrRange.capitalization = Capitalization.ALL_CAPS;\n\n';
      }
    }
  }

  // Resolution check
  jsx += '  // Resolution audit\n';
  jsx += '  var report = [];\n';
  jsx += '  for (var i = 0; i < doc.allGraphics.length; i++) {\n';
  jsx += '    var graphic = doc.allGraphics[i];\n';
  jsx += '    var frame = graphic.parent;\n';
  jsx += '    var hRes = graphic.effectivePpi[0];\n';
  jsx += '    var vRes = graphic.effectivePpi[1];\n';
  jsx += '    var eDpi = Math.min(hRes, vRes);\n';
  jsx += '    var status = eDpi >= 300 ? "GREEN" : (eDpi >= 200 ? "YELLOW" : "RED");\n';
  jsx += '    report.push(frame.name + ": " + Math.round(eDpi) + " DPI [" + status + "]");\n';
  jsx += '  }\n\n';

  jsx += '  if (report.length > 0) {\n';
  jsx += '    alert("Heroes Live Forever — Resolution Report\\n\\n" + report.join("\\n"));\n';
  jsx += '  }\n\n';

  jsx += '  alert("Heroes Live Forever\\n\\nDocument created: ' + escStr(heroData.name) + '\\n' + heroData.frameSize + ' | ' + heroData.layout + '");\n';
  jsx += '})();\n';

  return jsx;
}

module.exports = { generateJsx };

/**
 * App — main initialization and coordination.
 */

(async function() {
  // Initialize theme data
  await ThemeClient.init();

  // Initialize renderer
  Renderer.init(document.getElementById('preview-container'));

  // Initialize image upload
  ImageUpload.init(onFormChange);

  // Initialize form
  Form.init(onFormChange);

  // Initialize exports
  Exports.init(getFullHeroData);

  // Initial render
  onFormChange();

  /**
   * Called whenever form data or images change.
   */
  async function onFormChange() {
    const data = Form.getData();
    const images = ImageUpload.getImages();

    // Resolve the theme for current category + team
    let theme;
    try {
      theme = await ThemeClient.resolveTheme({
        category: data.category,
        subcategory: data.subcategory,
        team: data.team,
        colorDb: data.colorDb
      });
    } catch (err) {
      console.error('Theme resolve error:', err);
      theme = await ThemeClient.getTheme(data.category);
    }

    // Render preview
    Renderer.render({
      theme,
      heroData: data,
      frameSize: data.frameSize,
      layout: data.layout,
      images
    });

    // Update DPI badges (debounced, doesn't block render)
    ImageUpload.updateDpiBadges(data.frameSize, data.layout);
  }

  /**
   * Get the full hero data for export (form data + image references).
   */
  function getFullHeroData() {
    const data = Form.getData();
    const images = ImageUpload.getImages();

    // Attach image info for exports
    data.images = {};
    for (const [key, img] of Object.entries(images)) {
      if (img) {
        data.images[key] = {
          filename: img.filename,
          serverPath: img.serverPath,
          caption: data.captions[key] || ''
        };
      }
    }

    return data;
  }
})();

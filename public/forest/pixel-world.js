(function (root) {
  'use strict';
  const ASSETS = {
    forest: { path: 'assets/pixel-world/forest.png', width: 1672, height: 941 },
    ground: { path: 'assets/pixel-world/ground.png', width: 2172, height: 724 }
  };
  const FLOOR_TILE_WIDTH = 512;
  function load(ImageClass, changed = () => {}) {
    const state = { images: {}, loaded: new Set(), ready: false, error: null };
    for (const [id, asset] of Object.entries(ASSETS)) {
      const image = new ImageClass(); state.images[id] = image;
      const failed = () => { state.error = asset.path; state.ready = false; changed(state); };
      image.onload = () => {
        if (image.naturalWidth !== asset.width || image.naturalHeight !== asset.height) { failed(); return; }
        state.loaded.add(id); state.ready = !state.error && state.loaded.size === Object.keys(ASSETS).length; changed(state);
      };
      image.onerror = failed; image.src = asset.path;
    }
    return state;
  }
  function draw(ctx, images, groundY = 590, width = 1280, height = 720) {
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(images.forest, 0, 0, width, height);
    // Tile at a fixed scale; the top pixel is exactly the existing physical floor.
    const groundHeight = FLOOR_TILE_WIDTH * ASSETS.ground.height / ASSETS.ground.width;
    ctx.beginPath(); ctx.rect(0, groundY, width, height - groundY); ctx.clip();
    for (let x = 0; x < width; x += FLOOR_TILE_WIDTH) ctx.drawImage(images.ground, x, groundY, FLOOR_TILE_WIDTH, groundHeight);
    ctx.restore();
  }
  const api = { ASSETS, FLOOR_TILE_WIDTH, load, draw };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PixelWorld = api;
})(typeof window !== 'undefined' ? window : globalThis);

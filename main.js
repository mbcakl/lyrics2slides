import { initPreview } from './src/preview.js';
import { initInput } from './src/input.js';
import { initNavigation } from './src/navigation.js';
import { initControls } from './src/controls.js';
import { initExport } from './src/export.js';
import { initBible } from './src/bible.js';
import { initCarousel } from './src/carousel.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initPreview();
  initInput();
  initNavigation();
  initControls();
  initExport();
  initBible();
  initCarousel();
});

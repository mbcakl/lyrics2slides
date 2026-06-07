import { state, subscribe } from './state.js';
import { getUnavailableFonts, getActiveFontFamilies } from './fonts.js';
import { renderSlide } from './renderer.js';

// DOM elements
let slidePreview;
let primaryText;
let secondaryText;
let slideCounter;
let fontWarning;

// Track last checked fonts to avoid repeated warnings
let lastCheckedFonts = '';

export function initPreview() {
  slidePreview = document.getElementById('slide-preview');
  primaryText = document.getElementById('primary-text');
  secondaryText = document.getElementById('secondary-text');
  slideCounter = document.getElementById('slide-counter');

  // Create font warning element
  fontWarning = document.createElement('div');
  fontWarning.id = 'font-warning';
  fontWarning.className = 'font-warning';
  fontWarning.setAttribute('role', 'alert');
  fontWarning.style.display = 'none';
  slidePreview.parentElement.insertBefore(fontWarning, slidePreview);

  // Subscribe to state changes
  subscribe(renderPreview);

  // Re-render on window resize to recalculate font scale
  window.addEventListener('resize', () => renderPreview(state));

  // Initial render
  renderPreview(state);
}

async function checkFonts(settings, mode) {
  const [primary, secondary] = getActiveFontFamilies(settings, mode);
  const fontKey = `${mode}|${primary}|${secondary}`;
  if (fontKey === lastCheckedFonts) return;
  lastCheckedFonts = fontKey;

  const unavailable = await getUnavailableFonts(settings, mode);
  if (unavailable.length > 0) {
    fontWarning.textContent = `Font not found: ${unavailable.join(', ')}. Preview may not match export.`;
    fontWarning.style.display = 'block';
  } else {
    fontWarning.style.display = 'none';
  }
}

function renderPreview(state) {
  const { slides, currentSlide, settings, mode } = state;

  // Check fonts asynchronously
  checkFonts(settings, mode);

  const isBible = mode === 'bible';

  // Update background
  slidePreview.style.backgroundColor = isBible ? settings.bibleBackgroundColor : settings.backgroundColor;

  // Render slide content using the shared renderer
  const slide = slides.length > 0 ? slides[currentSlide] : null;
  renderSlide(slidePreview, slide, settings, { mode });

  // Update counter
  if (slides.length === 0) {
    slideCounter.textContent = '0 / 0';
  } else {
    slideCounter.textContent = `${currentSlide + 1} / ${slides.length}`;
  }
}

import { state, updateSettings, subscribe } from './state.js';
import { clampFontSize } from './validation.js';

export function initControls() {
  // Background color
  const bgColor = document.getElementById('bg-color');
  bgColor.addEventListener('input', (e) => {
    if (state.mode === 'bible') {
      updateSettings({ bibleBackgroundColor: e.target.value });
    } else {
      updateSettings({ backgroundColor: e.target.value });
    }
  });

  // Keep bg-color input in sync with state
  subscribe((newState) => {
    const currentBg = newState.mode === 'bible' ? newState.settings.bibleBackgroundColor : newState.settings.backgroundColor;
    if (bgColor.value !== currentBg) {
      bgColor.value = currentBg;
    }
  });

  // Primary font settings
  const fontPrimary = document.getElementById('font-primary');
  const sizePrimary = document.getElementById('size-primary');
  const colorPrimary = document.getElementById('color-primary');
  const boldPrimary = document.getElementById('bold-primary');

  fontPrimary.addEventListener('input', (e) => {
    updateSettings({ fontFamilyPrimary: e.target.value });
  });

  sizePrimary.addEventListener('input', (e) => {
    const size = clampFontSize(e.target.value);
    e.target.value = size; // Update displayed value to clamped value
    updateSettings({ fontSizePrimary: size });
  });

  sizePrimary.addEventListener('blur', (e) => {
    // Ensure valid value on blur
    const size = clampFontSize(e.target.value);
    e.target.value = size;
    updateSettings({ fontSizePrimary: size });
  });

  colorPrimary.addEventListener('input', (e) => {
    updateSettings({ fontColorPrimary: e.target.value });
  });

  boldPrimary.addEventListener('change', (e) => {
    updateSettings({ fontBoldPrimary: e.target.checked });
  });

  // Secondary font settings
  const fontSecondary = document.getElementById('font-secondary');
  const sizeSecondary = document.getElementById('size-secondary');
  const colorSecondary = document.getElementById('color-secondary');
  const boldSecondary = document.getElementById('bold-secondary');

  fontSecondary.addEventListener('input', (e) => {
    updateSettings({ fontFamilySecondary: e.target.value });
  });

  sizeSecondary.addEventListener('input', (e) => {
    const size = clampFontSize(e.target.value);
    e.target.value = size;
    updateSettings({ fontSizeSecondary: size });
  });

  sizeSecondary.addEventListener('blur', (e) => {
    const size = clampFontSize(e.target.value);
    e.target.value = size;
    updateSettings({ fontSizeSecondary: size });
  });

  colorSecondary.addEventListener('input', (e) => {
    updateSettings({ fontColorSecondary: e.target.value });
  });

  boldSecondary.addEventListener('change', (e) => {
    updateSettings({ fontBoldSecondary: e.target.checked });
  });

  // Bible Primary Font
  const bibleFontPrimary = document.getElementById('bible-font-primary');
  const bibleSizePrimary = document.getElementById('bible-size-primary');
  const bibleColorPrimary = document.getElementById('bible-color-primary');
  const bibleBoldPrimary = document.getElementById('bible-bold-primary');

  bibleFontPrimary.addEventListener('input', (e) => {
    updateSettings({ bibleFontFamilyPrimary: e.target.value });
  });

  bibleSizePrimary.addEventListener('input', (e) => {
    const size = clampFontSize(e.target.value);
    updateSettings({ bibleFontSizePrimary: size });
  });

  bibleColorPrimary.addEventListener('input', (e) => {
    updateSettings({ bibleFontColorPrimary: e.target.value });
  });

  bibleBoldPrimary.addEventListener('change', (e) => {
    updateSettings({ bibleFontBoldPrimary: e.target.checked });
  });

  // Bible Secondary Font
  const bibleFontSecondary = document.getElementById('bible-font-secondary');
  const bibleSizeSecondary = document.getElementById('bible-size-secondary');
  const bibleColorSecondary = document.getElementById('bible-color-secondary');
  const bibleBoldSecondary = document.getElementById('bible-bold-secondary');

  bibleFontSecondary.addEventListener('input', (e) => {
    updateSettings({ bibleFontFamilySecondary: e.target.value });
  });

  bibleSizeSecondary.addEventListener('input', (e) => {
    const size = clampFontSize(e.target.value);
    updateSettings({ bibleFontSizeSecondary: size });
  });

  bibleColorSecondary.addEventListener('input', (e) => {
    updateSettings({ bibleFontColorSecondary: e.target.value });
  });

  bibleBoldSecondary.addEventListener('change', (e) => {
    updateSettings({ bibleFontBoldSecondary: e.target.checked });
  });

  // Sync controls with state on load
  syncControlsWithState();
}

export function syncControlsWithState() {
  const s = state.settings;
  
  // Background
  const bgColor = document.getElementById('bg-color');
  if (bgColor) bgColor.value = s.backgroundColor;
  
  // Primary
  document.getElementById('font-primary').value = s.fontFamilyPrimary;
  document.getElementById('size-primary').value = s.fontSizePrimary;
  document.getElementById('color-primary').value = s.fontColorPrimary;
  document.getElementById('bold-primary').checked = s.fontBoldPrimary;
  
  // Secondary
  document.getElementById('font-secondary').value = s.fontFamilySecondary;
  document.getElementById('size-secondary').value = s.fontSizeSecondary;
  document.getElementById('color-secondary').value = s.fontColorSecondary;
  document.getElementById('bold-secondary').checked = s.fontBoldSecondary;
  
  // Bible
  const bibleBgColor = document.getElementById('bible-bg-color');
  if (bibleBgColor) bibleBgColor.value = s.bibleBackgroundColor;
  
  document.getElementById('bible-font-primary').value = s.bibleFontFamilyPrimary;
  document.getElementById('bible-size-primary').value = s.bibleFontSizePrimary;
  document.getElementById('bible-color-primary').value = s.bibleFontColorPrimary;
  document.getElementById('bible-bold-primary').checked = s.bibleFontBoldPrimary;
  
  document.getElementById('bible-font-secondary').value = s.bibleFontFamilySecondary;
  document.getElementById('bible-size-secondary').value = s.bibleFontSizeSecondary;
  document.getElementById('bible-color-secondary').value = s.bibleFontColorSecondary;
  document.getElementById('bible-bold-secondary').checked = s.bibleFontBoldSecondary;
  
  document.getElementById('bible-secondary-enable').checked = s.bibleSecondaryEnable;
}

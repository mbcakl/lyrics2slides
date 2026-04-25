import { updateSettings } from './state.js';
import { clampFontSize } from './validation.js';

export function initControls() {
  // Background color
  const bgColor = document.getElementById('bg-color');
  bgColor.addEventListener('input', (e) => {
    updateSettings({ backgroundColor: e.target.value });
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

  // Bible Settings
  const bibleBgColor = document.getElementById('bible-bg-color');
  bibleBgColor.addEventListener('input', (e) => {
    updateSettings({ bibleBackgroundColor: e.target.value });
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
}

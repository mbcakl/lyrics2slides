import { PPTX_SLIDE_HEIGHT_PT } from './constants.js';

/**
 * Renders a slide to the provided element.
 */
export function renderSlide(element, slide, settings, options = {}) {
  const { mode = 'lyrics' } = options;
  const primaryText = element.querySelector('.primary-text');
  const secondaryText = element.querySelector('.secondary-text');

  if (!slide) {
    primaryText.textContent = '';
    secondaryText.textContent = '';
    element.classList.add('empty');
    return;
  }

  element.classList.remove('empty');
  const previewHeight = element.clientHeight || PPTX_SLIDE_HEIGHT_PT;
  const fontScale = previewHeight / PPTX_SLIDE_HEIGHT_PT;

  const isBible = mode === 'bible';

  // Select correct settings
  const currentSettings = isBible ? {
    fontFamilyPrimary: settings.bibleFontFamilyPrimary,
    fontSizePrimary: settings.bibleFontSizePrimary,
    fontBoldPrimary: settings.bibleFontBoldPrimary,
    fontColorPrimary: settings.bibleFontColorPrimary,
    fontFamilySecondary: settings.bibleFontFamilySecondary,
    fontSizeSecondary: settings.bibleFontSizeSecondary,
    fontBoldSecondary: settings.bibleFontBoldSecondary,
    fontColorSecondary: settings.bibleFontColorSecondary
  } : settings;

  const hasPrimary = slide.primary && slide.primary.length > 0;
  const hasSecondary = slide.secondary && slide.secondary.length > 0;
  const onlyPrimary = hasPrimary && !hasSecondary;

  primaryText.classList.toggle('centered', onlyPrimary);
  primaryText.classList.toggle('left-aligned', isBible);
  if (secondaryText) {
    secondaryText.classList.toggle('left-aligned', isBible);
  }
  
  // Render Primary
  primaryText.textContent = slide.primary.join('\n');
  primaryText.style.fontFamily = currentSettings.fontFamilyPrimary;
  primaryText.style.fontSize = `${currentSettings.fontSizePrimary * fontScale}px`;
  primaryText.style.fontWeight = currentSettings.fontBoldPrimary ? 'bold' : 'normal';
  primaryText.style.color = currentSettings.fontColorPrimary;

  // Render Secondary
  if (secondaryText) {
    secondaryText.textContent = (slide.secondary || []).join('\n');
    secondaryText.style.fontFamily = currentSettings.fontFamilySecondary;
    secondaryText.style.fontSize = `${currentSettings.fontSizeSecondary * fontScale}px`;
    secondaryText.style.fontWeight = currentSettings.fontBoldSecondary ? 'bold' : 'normal';
    secondaryText.style.color = currentSettings.fontColorSecondary;
  }
}

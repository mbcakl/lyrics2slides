import { PPTX_SLIDE_HEIGHT_PT } from './constants.js';

/**
 * Renders a slide to the provided element.
 */
export function renderSlide(element, slide, settings, options = {}) {
  const { isPreview = false } = options;
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

  const hasPrimary = slide.primary && slide.primary.length > 0;
  const hasSecondary = slide.secondary && slide.secondary.length > 0;
  const onlyPrimary = hasPrimary && !hasSecondary;

  primaryText.classList.toggle('centered', onlyPrimary);
  
  // Render Primary
  primaryText.textContent = slide.primary.join('\n');
  primaryText.style.fontFamily = settings.fontFamilyPrimary;
  primaryText.style.fontSize = `${settings.fontSizePrimary * fontScale}px`;
  primaryText.style.fontWeight = settings.fontBoldPrimary ? 'bold' : 'normal';
  primaryText.style.color = settings.fontColorPrimary;

  // Render Secondary
  if (secondaryText) {
    secondaryText.textContent = (slide.secondary || []).join('\n');
    secondaryText.style.fontFamily = settings.fontFamilySecondary;
    secondaryText.style.fontSize = `${settings.fontSizeSecondary * fontScale}px`;
    secondaryText.style.fontWeight = settings.fontBoldSecondary ? 'bold' : 'normal';
    secondaryText.style.color = settings.fontColorSecondary;
  }
}

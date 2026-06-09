import { PPTX_SLIDE_HEIGHT_PT, LAYOUT } from '../constants.js';
import { toSuperscript } from './data.js';

// Default DOM measurer. Sets ONLY the font spec; line-heights (1.3/1.4) and the
// 864px width come from the existing CSS on #measure-box / .secondary-measure.
// Returns null when the measure box is absent (callers then get [] from buildBibleSlides).
export function createDomMeasurer(settings) {
  const measureBox = document.getElementById('measure-box');
  if (!measureBox) return null;
  const pMeasure = measureBox.querySelector('.primary-measure');
  const sMeasure = measureBox.querySelector('.secondary-measure');

  pMeasure.style.fontFamily = settings.bibleFontFamilyPrimary;
  pMeasure.style.fontSize = `${settings.bibleFontSizePrimary}px`;
  pMeasure.style.fontWeight = settings.bibleFontBoldPrimary ? 'bold' : 'normal';

  sMeasure.style.fontFamily = settings.bibleFontFamilySecondary;
  sMeasure.style.fontSize = `${settings.bibleFontSizeSecondary}px`;
  sMeasure.style.fontWeight = settings.bibleFontBoldSecondary ? 'bold' : 'normal';

  return {
    measure(primaryText, secondaryText) {
      pMeasure.textContent = primaryText;
      sMeasure.textContent = secondaryText;
      return { primary: pMeasure.clientHeight, secondary: sMeasure.clientHeight };
    }
  };
}

export function buildBibleSlides(primaryVerses, secondaryVerses, settings, { primaryRef = '', secondaryRef = '', measurer } = {}) {
  if (!measurer) return [];

  const hasSecondary = secondaryVerses && secondaryVerses.length > 0;
  const heightPercent = hasSecondary ? LAYOUT.PRIMARY_HEIGHT_PERCENT : LAYOUT.CENTERED_HEIGHT_PERCENT;
  const maxHeight = (PPTX_SLIDE_HEIGHT_PT * heightPercent) / 100 - 20; // 20pt safety margin

  const slides = [];
  let currentPrimary = [];
  let currentSecondary = [];

  for (let i = 0; i < primaryVerses.length; i++) {
    const pVerse = primaryVerses[i];
    const sVerse = hasSecondary ? secondaryVerses[i] : null;

    const nextPText = [...currentPrimary, `${toSuperscript(pVerse.verse)} ${pVerse.text}`].join(' ');
    const nextSText = sVerse ? [...currentSecondary, `${toSuperscript(sVerse.verse)} ${sVerse.text}`].join(' ') : '';

    const { primary: pHeight, secondary: sHeightRaw } = measurer.measure(nextPText, nextSText);
    const sHeight = hasSecondary ? sHeightRaw : 0;

    if (currentPrimary.length > 0 && (pHeight > maxHeight || sHeight > maxHeight)) {
      slides.push({
        id: slides.length + 1,
        primary: [currentPrimary.join(' ')],
        secondary: hasSecondary ? [currentSecondary.join(' ')] : []
      });
      currentPrimary = [`${toSuperscript(pVerse.verse)} ${pVerse.text}`];
      currentSecondary = sVerse ? [`${toSuperscript(sVerse.verse)} ${sVerse.text}`] : [];
    } else {
      currentPrimary.push(`${toSuperscript(pVerse.verse)} ${pVerse.text}`);
      if (sVerse) currentSecondary.push(`${toSuperscript(sVerse.verse)} ${sVerse.text}`);
    }
  }

  if (currentPrimary.length > 0) {
    const pText = currentPrimary.join(' ');
    const sText = hasSecondary ? currentSecondary.join(' ') : '';
    const pAttributed = primaryRef ? `${pText} (${primaryRef})` : pText;
    const sAttributed = secondaryRef ? `${sText} (${secondaryRef})` : sText;
    slides.push({
      id: slides.length + 1,
      primary: [pAttributed],
      secondary: hasSecondary ? [sAttributed] : []
    });
  }

  return slides;
}

export function reSplitBible(state, setSlides, measurer) {
  if (state.mode !== 'bible' || state.biblePrimaryVerses.length === 0) return;
  const slides = buildBibleSlides(
    state.biblePrimaryVerses,
    state.bibleSecondaryVerses,
    state.settings,
    {
      primaryRef: state.biblePrimaryReference,
      secondaryRef: state.bibleSecondaryReference,
      measurer
    }
  );
  setSlides(slides);
}

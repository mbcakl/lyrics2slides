import { PPTX_SLIDE_HEIGHT_PT, LAYOUT } from './constants.js';
import { toSuperscript } from './bible.js';

export function dynamicSplit(primaryVerses, secondaryVerses, settings) {
  const measureBox = document.getElementById('measure-box');
  if (!measureBox) return []; // Guard for non-browser envs
  
  const pMeasure = measureBox.querySelector('.primary-measure');
  const sMeasure = measureBox.querySelector('.secondary-measure');
  
  // Set styles based on settings
  pMeasure.style.fontFamily = settings.bibleFontFamilyPrimary;
  pMeasure.style.fontSize = `${settings.bibleFontSizePrimary}px`;
  pMeasure.style.fontWeight = settings.bibleFontBoldPrimary ? 'bold' : 'normal';
  
  sMeasure.style.fontFamily = settings.bibleFontFamilySecondary;
  sMeasure.style.fontSize = `${settings.bibleFontSizeSecondary}px`;
  sMeasure.style.fontWeight = settings.bibleFontBoldSecondary ? 'bold' : 'normal';

  const maxHeight = (PPTX_SLIDE_HEIGHT_PT * LAYOUT.PRIMARY_HEIGHT_PERCENT) / 100; // ~232.2pt
  const hasSecondary = secondaryVerses && secondaryVerses.length > 0;

  const slides = [];
  let currentPrimary = [];
  let currentSecondary = [];

  for (let i = 0; i < primaryVerses.length; i++) {
    const pVerse = primaryVerses[i];
    const sVerse = hasSecondary ? secondaryVerses[i] : null;

    const nextPText = [...currentPrimary, `${toSuperscript(pVerse.verse)} ${pVerse.text}`].join(' ');
    const nextSText = sVerse ? [...currentSecondary, `${toSuperscript(sVerse.verse)} ${sVerse.text}`].join(' ') : '';

    pMeasure.textContent = nextPText;
    sMeasure.textContent = nextSText;

    const pHeight = pMeasure.clientHeight;
    const sHeight = hasSecondary ? sMeasure.clientHeight : 0;

    if (currentPrimary.length > 0 && (pHeight > maxHeight || sHeight > maxHeight)) {
      // Current verse makes it too long, push current group and start new
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

  // Push final group
  if (currentPrimary.length > 0) {
    slides.push({
      id: slides.length + 1,
      primary: [currentPrimary.join(' ')],
      secondary: hasSecondary ? [currentSecondary.join(' ')] : []
    });
  }

  return slides;
}

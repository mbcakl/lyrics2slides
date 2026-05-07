import { state } from './state.js';
import { LAYOUT } from './constants.js';

let downloadBtn;
let PptxGenJS = null;

export function initExport() {
  downloadBtn = document.getElementById('download-btn');
  downloadBtn.addEventListener('click', generatePptx);
}

async function loadPptxGenJS() {
  if (!PptxGenJS) {
    const module = await import('pptxgenjs');
    PptxGenJS = module.default;
  }
  return PptxGenJS;
}

async function generatePptx() {
  const { slides, settings, mode } = state;

  if (slides.length === 0) {
    alert('Please enter some lyrics first.');
    return;
  }

  // Show loading state
  const originalText = downloadBtn.textContent;
  downloadBtn.textContent = 'Generating...';
  downloadBtn.disabled = true;

  try {
    // Lazy load pptxgenjs
    const PptxGenJSClass = await loadPptxGenJS();
    const pptx = new PptxGenJSClass();
    pptx.layout = 'LAYOUT_WIDE'; // 16:9
    pptx.author = 'Lyrics2Slides';
    pptx.title = 'Lyrics Slides';

    const isBible = mode === 'bible';

    // Remove # from hex color for pptxgenjs
    const bgColor = (isBible ? settings.bibleBackgroundColor : settings.backgroundColor).replace('#', '');
    const alignMode = isBible ? 'left' : 'center';

    const primarySettings = isBible ? {
      font: settings.bibleFontFamilyPrimary,
      size: settings.bibleFontSizePrimary,
      bold: settings.bibleFontBoldPrimary,
      color: settings.bibleFontColorPrimary
    } : {
      font: settings.fontFamilyPrimary,
      size: settings.fontSizePrimary,
      bold: settings.fontBoldPrimary,
      color: settings.fontColorPrimary
    };

    const secondarySettings = isBible ? {
      font: settings.bibleFontFamilySecondary,
      size: settings.bibleFontSizeSecondary,
      bold: settings.bibleFontBoldSecondary,
      color: settings.bibleFontColorSecondary
    } : {
      font: settings.fontFamilySecondary,
      size: settings.fontSizeSecondary,
      bold: settings.fontBoldSecondary,
      color: settings.fontColorSecondary
    };

    for (const slide of slides) {
      const pptSlide = pptx.addSlide();
      pptSlide.background = { color: bgColor };

      const hasPrimary = slide.primary.length > 0;
      const hasSecondary = slide.secondary.length > 0;
      const onlyPrimary = hasPrimary && !hasSecondary;

      if (onlyPrimary) {
        // Only primary - center vertically
        pptSlide.addText(slide.primary.join('\n'), {
          x: `${LAYOUT.MARGIN_PERCENT}%`,
          y: `${LAYOUT.MARGIN_PERCENT}%`,
          w: `${LAYOUT.CONTENT_WIDTH_PERCENT}%`,
          h: `${LAYOUT.CENTERED_HEIGHT_PERCENT}%`,
          fontSize: primarySettings.size,
          fontFace: primarySettings.font,
          bold: primarySettings.bold,
          color: primarySettings.color.replace('#', ''),
          align: alignMode,
          valign: 'middle',
          wrap: true
        });
      } else {
        // Both languages - use split layout
        if (hasPrimary) {
          pptSlide.addText(slide.primary.join('\n'), {
            x: `${LAYOUT.MARGIN_PERCENT}%`,
            y: `${LAYOUT.PRIMARY_TOP_PERCENT}%`,
            w: `${LAYOUT.CONTENT_WIDTH_PERCENT}%`,
            h: `${LAYOUT.PRIMARY_HEIGHT_PERCENT}%`,
            fontSize: primarySettings.size,
            fontFace: primarySettings.font,
            bold: primarySettings.bold,
            color: primarySettings.color.replace('#', ''),
            align: alignMode,
            valign: 'bottom',
            wrap: true
          });
        }

        if (hasSecondary) {
          pptSlide.addText(slide.secondary.join('\n'), {
            x: `${LAYOUT.MARGIN_PERCENT}%`,
            y: `${LAYOUT.SECONDARY_TOP_PERCENT}%`,
            w: `${LAYOUT.CONTENT_WIDTH_PERCENT}%`,
            h: `${LAYOUT.SECONDARY_HEIGHT_PERCENT}%`,
            fontSize: secondarySettings.size,
            fontFace: secondarySettings.font,
            bold: secondarySettings.bold,
            color: secondarySettings.color.replace('#', ''),
            align: alignMode,
            valign: 'top',
            wrap: true
          });
        }
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    await pptx.writeFile({ fileName: `lyrics-slides-${timestamp}.pptx` });

  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to generate PPTX. Please try again.');
  } finally {
    // Restore button
    downloadBtn.textContent = originalText;
    downloadBtn.disabled = false;
  }
}

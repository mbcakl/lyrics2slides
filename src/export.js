import { state } from './state.js';
import { LAYOUT } from './constants.js';
import { getBackground, getImageDataUrl } from './background.js';

export const BACKGROUND_MASTER = 'L2S_BACKGROUND';

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

/**
 * Slide master holding the background, so an image is embedded once rather
 * than once per slide. The dim overlay sits on the master too, where it
 * doesn't get in the way when editing slide text in PowerPoint.
 */
export function buildBackgroundMaster({ color, dim }, imageDataUrl) {
  const objects = [];
  if (imageDataUrl && dim > 0) {
    objects.push({
      rect: {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: '000000', transparency: Math.round((1 - dim) * 100) },
        line: { type: 'none' }
      }
    });
  }
  return {
    title: BACKGROUND_MASTER,
    background: imageDataUrl
      ? { data: imageDataUrl, path: 'background.jpg' }
      : { color: color.replace('#', '') },
    objects
  };
}

async function generatePptx() {
  const { slides, settings, mode } = state;

  if (slides.length === 0) {
    alert('Please enter some lyrics first.');
    return;
  }

  // Show loading state
  const label = downloadBtn.querySelector('.btn-label') || downloadBtn;
  const originalText = label.textContent;
  label.textContent = 'Generating...';
  downloadBtn.disabled = true;

  try {
    // Lazy load pptxgenjs
    const PptxGenJSClass = await loadPptxGenJS();
    const pptx = new PptxGenJSClass();
    pptx.layout = 'LAYOUT_WIDE'; // 16:9
    pptx.author = 'Lyrics2Slides';
    pptx.title = 'Lyrics Slides';

    const isBible = mode === 'bible';

    const background = getBackground(settings, mode);
    const imageDataUrl = background.imageId ? await getImageDataUrl(background.imageId) : null;
    pptx.defineSlideMaster(buildBackgroundMaster(background, imageDataUrl));
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
      const pptSlide = pptx.addSlide({ masterName: BACKGROUND_MASTER });

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
    label.textContent = originalText;
    downloadBtn.disabled = false;
  }
}

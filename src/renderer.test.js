import { describe, it, expect, beforeEach } from 'vitest';
import { renderSlide } from './renderer.js';

describe('renderer', () => {
  let element;
  let primaryText;
  let secondaryText;
  const settings = {
    fontFamilyPrimary: 'Arial',
    fontSizePrimary: 64,
    fontBoldPrimary: true,
    fontColorPrimary: '#ff0000',
    fontFamilySecondary: 'Verdana',
    fontSizeSecondary: 40,
    fontBoldSecondary: false,
    fontColorSecondary: '#00ff00',
    backgroundColor: '#000000'
  };

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="slide-preview">
        <div class="primary-text"></div>
        <div class="secondary-text"></div>
      </div>
    `;
    element = document.getElementById('slide-preview');
    primaryText = element.querySelector('.primary-text');
    secondaryText = element.querySelector('.secondary-text');
    
    // Mock clientHeight to avoid fontScale being 0/NaN
    // In JSDOM clientHeight is 0 by default.
    // PPTX_SLIDE_HEIGHT_PT is 540.
    Object.defineProperty(element, 'clientHeight', { value: 540, configurable: true });
  });

  it('renders an empty state when no slide is provided', () => {
    renderSlide(element, null, settings);
    expect(primaryText.textContent).toBe('');
    expect(secondaryText.textContent).toBe('');
    expect(element.classList.contains('empty')).toBe(true);
  });

  it('renders primary text only and centers it', () => {
    const slide = {
      primary: ['Line 1', 'Line 2'],
      secondary: []
    };
    renderSlide(element, slide, settings);

    expect(primaryText.textContent).toBe('Line 1\nLine 2');
    expect(secondaryText.textContent).toBe('');
    expect(primaryText.classList.contains('centered')).toBe(true);
    expect(primaryText.style.fontFamily).toBe('Arial');
    expect(primaryText.style.fontSize).toBe('64px'); // 64 * (540/540)
    expect(primaryText.style.fontWeight).toBe('bold');
    expect(primaryText.style.color).toBe('rgb(255, 0, 0)'); // hex to rgb
  });

  it('renders both primary and secondary text', () => {
    const slide = {
      primary: ['Primary Line'],
      secondary: ['Secondary Line']
    };
    renderSlide(element, slide, settings);

    expect(primaryText.textContent).toBe('Primary Line');
    expect(secondaryText.textContent).toBe('Secondary Line');
    expect(primaryText.classList.contains('centered')).toBe(false);
    
    expect(primaryText.style.fontSize).toBe('64px');
    expect(secondaryText.style.fontFamily).toBe('Verdana');
    expect(secondaryText.style.fontSize).toBe('40px');
    expect(secondaryText.style.fontWeight).toBe('normal');
    expect(secondaryText.style.color).toBe('rgb(0, 255, 0)');
  });

  it('calculates font scale based on element height', () => {
    // PPTX_SLIDE_HEIGHT_PT is 540
    Object.defineProperty(element, 'clientHeight', { value: 270, configurable: true });
    
    const slide = {
      primary: ['Text'],
      secondary: []
    };
    renderSlide(element, slide, settings);

    // scale = 270 / 540 = 0.5
    // size = 64 * 0.5 = 32
    expect(primaryText.style.fontSize).toBe('32px');
  });
});

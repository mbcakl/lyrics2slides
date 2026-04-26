import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toSuperscript, reSplitBible } from './bible.js';
import { dynamicSplit } from './dynamicSplitter.js';
import { state, setMode, setBiblePrimaryVerses, setSlides } from './state.js';

describe('Bible utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="measure-box">
        <div class="primary-measure"></div>
        <div class="secondary-measure"></div>
      </div>
    `;
  });

  describe('toSuperscript', () => {
    it('converts numbers to superscript', () => {
      expect(toSuperscript('1')).toBe('¹');
      expect(toSuperscript('12')).toBe('¹²');
      expect(toSuperscript('0')).toBe('⁰');
    });
  });

  describe('reSplitBible', () => {
    it('does nothing if not in bible mode', () => {
      setMode('lyrics');
      setBiblePrimaryVerses([{ verse: 1, text: 'V1' }]);
      
      const oldSlides = [...state.slides];
      reSplitBible();
      expect(state.slides).toEqual(oldSlides);
    });

    it('does nothing if no bible verses', () => {
      setMode('bible');
      setBiblePrimaryVerses([]);
      
      setSlides([{ primary: ['Existing'], secondary: [] }]);
      reSplitBible();
      expect(state.slides).toEqual([{ primary: ['Existing'], secondary: [] }]);
    });

    it('re-splits when in bible mode with verses', () => {
      setMode('bible');
      const verses = [{ verse: 1, text: 'V1' }];
      setBiblePrimaryVerses(verses);
      
      // Mock height to be small so it fits in one slide
      const pMeasure = document.querySelector('.primary-measure');
      Object.defineProperty(pMeasure, 'clientHeight', { value: 10, configurable: true });
      
      reSplitBible();
      
      expect(state.slides.length).toBeGreaterThan(0);
      expect(state.slides[0].primary).toEqual(['¹ V1']);
    });
  });
});

describe('dynamicSplit', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="measure-box">
        <div class="primary-measure"></div>
        <div class="secondary-measure"></div>
      </div>
    `;
  });

  it('splits verses when height exceeds limit', () => {
    const pMeasure = document.querySelector('.primary-measure');
    const settings = { 
        bibleFontSizePrimary: 40,
        bibleFontFamilyPrimary: 'Arial',
        bibleFontBoldPrimary: false,
        bibleFontSizeSecondary: 40,
        bibleFontFamilySecondary: 'Arial',
        bibleFontBoldSecondary: false
    };

    // Mock height: 1st call (verse 1) 100px, 2nd call (verse 1+2) 500px (> 466px safety limit)
    let callCount = 0;
    Object.defineProperty(pMeasure, 'clientHeight', {
      get: () => {
        callCount++;
        return callCount === 1 ? 100 : 500;
      },
      configurable: true
    });

    const pVerses = [{ verse: 1, text: 'V1' }, { verse: 2, text: 'V2' }];
    const slides = dynamicSplit(pVerses, [], settings, 'John 3:1-2');
    
    expect(slides).toHaveLength(2);
    expect(slides[0].primary).toEqual(['¹ V1']);
    expect(slides[1].primary).toEqual(['² V2 (John 3:1-2)']);
  });
});

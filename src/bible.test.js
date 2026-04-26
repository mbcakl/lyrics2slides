import { describe, it, expect } from 'vitest';
import { toSuperscript, formatVerses } from './bible.js';
import { parseLyrics } from './parser.js';
import { dynamicSplit } from './dynamicSplitter.js';

describe('Bible utilities', () => {
  describe('toSuperscript', () => {
    it('converts numbers to superscript', () => {
      expect(toSuperscript('1')).toBe('¹');
      expect(toSuperscript('12')).toBe('¹²');
      expect(toSuperscript('0')).toBe('⁰');
    });
  });

  describe('formatVerses', () => {
    it('formats a single verse', () => {
      const verses = [{ verse: 1, text: 'Verse text' }];
      expect(formatVerses(verses)).toBe('¹ Verse text');
    });

    it('joins multiple verses with spaces', () => {
      const verses = [
        { verse: 1, text: 'Verse 1' },
        { verse: 2, text: 'Verse 2' }
      ];
      expect(formatVerses(verses)).toBe('¹ Verse 1 ² Verse 2');
    });

    it('adds double newline every 4 verses', () => {
      const verses = [
        { verse: 1, text: 'V1' },
        { verse: 2, text: 'V2' },
        { verse: 3, text: 'V3' },
        { verse: 4, text: 'V4' },
        { verse: 5, text: 'V5' }
      ];
      const result = formatVerses(verses);
      expect(result).toBe('¹ V1 ² V2 ³ V3 ⁴ V4\n\n⁵ V5');
    });

    it('works with parseLyrics to create grouped slides', () => {
      const verses = [
        { verse: 1, text: 'V1' },
        { verse: 2, text: 'V2' },
        { verse: 3, text: 'V3' },
        { verse: 4, text: 'V4' },
        { verse: 5, text: 'V5' }
      ];
      const formatted = formatVerses(verses);
      const slides = parseLyrics(formatted, '');
      
      expect(slides).toHaveLength(2);
      expect(slides[0].primary).toEqual(['¹ V1 ² V2 ³ V3 ⁴ V4']);
      expect(slides[1].primary).toEqual(['⁵ V5']);
    });
  });
});

describe('dynamicSplit', () => {
  it('splits verses when height exceeds limit', () => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="measure-box">
        <div class="primary-measure"></div>
        <div class="secondary-measure"></div>
      </div>
    `;
    
    const pMeasure = document.querySelector('.primary-measure');
    const settings = { 
        bibleFontSizePrimary: 40,
        bibleFontFamilyPrimary: 'Arial',
        bibleFontBoldPrimary: false,
        bibleFontSizeSecondary: 40,
        bibleFontFamilySecondary: 'Arial',
        bibleFontBoldSecondary: false
    };

    // Mock height: 1st call (verse 1) 100px, 2nd call (verse 1+2) 250px (> 232px)
    let callCount = 0;
    Object.defineProperty(pMeasure, 'clientHeight', {
      get: () => {
        callCount++;
        return callCount === 1 ? 100 : 250;
      },
      configurable: true
    });

    const pVerses = [{ verse: 1, text: 'V1' }, { verse: 2, text: 'V2' }];
    const slides = dynamicSplit(pVerses, [], settings);
    
    expect(slides).toHaveLength(2);
    expect(slides[0].primary).toEqual(['¹ V1']);
    expect(slides[1].primary).toEqual(['² V2']);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toSuperscript, reSplitBible, parseReference, matchBook } from './bible.js';
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

  describe('matchBook', () => {
    it('matches by English prefix', () => {
      const matches = matchBook('Gen');
      expect(matches[0].code).toBe('GEN');
    });
    it('matches by Chinese prefix', () => {
      const matches = matchBook('创');
      expect(matches[0].code).toBe('GEN');
    });
    it('matches by Pinyin initials', () => {
      const matches = matchBook('csj');
      expect(matches[0].code).toBe('GEN');
    });
    it('matches by exact code', () => {
      const matches = matchBook('GEN');
      expect(matches[0].code).toBe('GEN');
    });
    it('returns empty array for no match', () => {
      expect(matchBook('xyzxyz')).toEqual([]);
    });
  });

  describe('parseReference', () => {
    it('returns null for empty string', () => {
      expect(parseReference('GEN', '')).toBeNull();
      expect(parseReference('GEN', '  ')).toBeNull();
    });

    it('handles chapter only', () => {
      expect(parseReference('GEN', '1')).toEqual({
        book: 'GEN',
        chapter: 1,
        startVerse: null,
        endVerse: null
      });
    });

    it('handles chapter and single verse', () => {
      expect(parseReference('GEN', '1:1')).toEqual({
        book: 'GEN',
        chapter: 1,
        startVerse: 1,
        endVerse: 1
      });
    });

    it('handles chapter and verse range', () => {
      expect(parseReference('GEN', '1:1-5')).toEqual({
        book: 'GEN',
        chapter: 1,
        startVerse: 1,
        endVerse: 5
      });
    });

    it('returns null for invalid format', () => {
      expect(parseReference('GEN', 'abc')).toBeNull();
      expect(parseReference('GEN', '1:abc')).toBeNull();
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

import { describe, it, expect } from 'vitest';
import { buildBibleSlides, reSplitBible } from './slides.js';
import { state, setMode, setBiblePrimaryVerses, setSlides } from '../state.js';

const settings = {
  bibleFontSizePrimary: 40, bibleFontFamilyPrimary: 'Arial', bibleFontBoldPrimary: false,
  bibleFontSizeSecondary: 40, bibleFontFamilySecondary: 'Arial', bibleFontBoldSecondary: false
};

// Fake measurer: returns heights from a scripted queue, one call per iteration.
function queueMeasurer(primaryHeights, secondaryHeights = []) {
  let i = 0;
  return {
    measure() {
      const r = { primary: primaryHeights[i] ?? 0, secondary: secondaryHeights[i] ?? 0 };
      i++;
      return r;
    }
  };
}

describe('buildBibleSlides', () => {
  it('returns [] when no measurer is provided (guard)', () => {
    expect(buildBibleSlides([{ verse: 1, text: 'V1' }], [], settings, {})).toEqual([]);
  });

  it('keeps verses on one slide when under the height limit', () => {
    const verses = [{ verse: 1, text: 'V1' }, { verse: 2, text: 'V2' }];
    const slides = buildBibleSlides(verses, [], settings, {
      primaryRef: 'John 3:1-2', measurer: queueMeasurer([100, 200])
    });
    expect(slides).toHaveLength(1);
    expect(slides[0].primary).toEqual(['¹ V1 ² V2 (John 3:1-2)']);
  });

  it('splits when adding a verse exceeds the limit (maxHeight ≈ 466 for primary-only)', () => {
    const verses = [{ verse: 1, text: 'V1' }, { verse: 2, text: 'V2' }];
    // 1st iteration (V1): 100. 2nd iteration (V1+V2): 500 (> 466) -> break.
    const slides = buildBibleSlides(verses, [], settings, {
      primaryRef: 'John 3:1-2', measurer: queueMeasurer([100, 500])
    });
    expect(slides).toHaveLength(2);
    expect(slides[0].primary).toEqual(['¹ V1']);
    expect(slides[1].primary).toEqual(['² V2 (John 3:1-2)']);
  });

  it('breaks when the SECONDARY stream overflows even if primary fits', () => {
    const p = [{ verse: 1, text: 'P1' }, { verse: 2, text: 'P2' }];
    const s = [{ verse: 1, text: 'S1' }, { verse: 2, text: 'S2' }];
    // dual layout maxHeight ≈ 212. primary stays small; secondary 2nd iter overflows.
    const slides = buildBibleSlides(p, s, settings, {
      primaryRef: 'J 1', secondaryRef: 'J 1', measurer: queueMeasurer([50, 60], [50, 300])
    });
    expect(slides).toHaveLength(2);
    expect(slides[0].secondary).toEqual(['¹ S1']);
    expect(slides[1].secondary).toEqual(['² S2 (J 1)']);
  });
});

describe('reSplitBible', () => {
  it('does nothing if not in bible mode', () => {
    setMode('lyrics');
    setBiblePrimaryVerses([{ verse: 1, text: 'V1' }]);
    const before = [...state.slides];
    reSplitBible(state, setSlides, queueMeasurer([10]));
    expect(state.slides).toEqual(before);
  });

  it('does nothing if there are no verses', () => {
    setMode('bible');
    setBiblePrimaryVerses([]);
    setSlides([{ primary: ['Existing'], secondary: [] }]);
    reSplitBible(state, setSlides, queueMeasurer([10]));
    expect(state.slides).toEqual([{ primary: ['Existing'], secondary: [] }]);
  });

  it('re-splits in bible mode with verses', () => {
    setMode('bible');
    setBiblePrimaryVerses([{ verse: 1, text: 'V1' }]);
    reSplitBible(state, setSlides, queueMeasurer([10]));
    expect(state.slides.length).toBeGreaterThan(0);
    expect(state.slides[0].primary).toEqual(['¹ V1']);
  });
});

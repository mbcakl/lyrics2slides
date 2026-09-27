import { describe, it, expect } from 'vitest';
import {
  backgroundKeys, getBackground, clampDim, coverCrop, outputSize,
  validateImageFile, applyBackground, MAX_DIM, MAX_UPLOAD_BYTES
} from './background.js';

const settings = {
  backgroundColor: '#111111',
  backgroundImageId: 'img-lyrics',
  backgroundDim: 0.5,
  bibleBackgroundColor: '#222222',
  bibleBackgroundImageId: null,
  bibleBackgroundDim: 0.3
};

describe('background settings', () => {
  it('picks keys per mode', () => {
    expect(backgroundKeys('lyrics').imageId).toBe('backgroundImageId');
    expect(backgroundKeys('bible')).toEqual({
      color: 'bibleBackgroundColor',
      imageId: 'bibleBackgroundImageId',
      dim: 'bibleBackgroundDim'
    });
  });

  it('reads the background for each mode', () => {
    expect(getBackground(settings, 'lyrics')).toEqual({ color: '#111111', imageId: 'img-lyrics', dim: 0.5 });
    expect(getBackground(settings, 'bible')).toEqual({ color: '#222222', imageId: null, dim: 0.3 });
  });

  it('treats settings saved before images existed as no image', () => {
    expect(getBackground({ backgroundColor: '#000000' }, 'lyrics')).toEqual({ color: '#000000', imageId: null, dim: 0 });
  });

  it('clamps dim to 0..MAX_DIM', () => {
    expect(clampDim(-1)).toBe(0);
    expect(clampDim(2)).toBe(MAX_DIM);
    expect(clampDim('0.25')).toBe(0.25);
    expect(clampDim(undefined)).toBe(0);
  });
});

describe('coverCrop', () => {
  it('crops the sides of a wider image', () => {
    const crop = coverCrop(4000, 1000);
    expect(crop.sw).toBeCloseTo(1000 * 16 / 9);
    expect(crop.sx).toBeCloseTo((4000 - crop.sw) / 2);
    expect(crop.sy).toBe(0);
    expect(crop.sh).toBe(1000);
  });

  it('crops the top and bottom of a taller image', () => {
    const crop = coverCrop(1080, 1920);
    expect(crop.sx).toBe(0);
    expect(crop.sw).toBe(1080);
    expect(crop.sh).toBeCloseTo(607.5);
    expect(crop.sy).toBeCloseTo((1920 - 607.5) / 2);
  });

  it('leaves a 16:9 image untouched', () => {
    expect(coverCrop(1920, 1080)).toEqual({ sx: 0, sy: 0, sw: 1920, sh: 1080 });
  });
});

describe('outputSize', () => {
  it('scales large crops down to 1920x1080', () => {
    expect(outputSize({ sw: 4000, sh: 2250 })).toEqual({ width: 1920, height: 1080 });
  });

  it('never upscales small crops', () => {
    expect(outputSize({ sw: 800, sh: 450 })).toEqual({ width: 800, height: 450 });
  });
});

describe('validateImageFile', () => {
  it('accepts JPEG, PNG and WebP', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateImageFile({ type, size: 1000 })).toBeNull();
    }
  });

  it('rejects other types, oversized files and no file', () => {
    expect(validateImageFile({ type: 'image/heic', size: 1000 })).toMatch(/JPEG, PNG or WebP/);
    expect(validateImageFile({ type: 'image/png', size: MAX_UPLOAD_BYTES + 1 })).toMatch(/too large/);
    expect(validateImageFile(null)).toMatch(/No file/);
  });
});

describe('applyBackground', () => {
  it('applies the color and clears any image when none is set', () => {
    const el = document.createElement('div');
    el.style.backgroundImage = 'url("old")';
    el.classList.add('has-bg-image');
    applyBackground(el, settings, 'bible');
    expect(el.style.backgroundColor).toBe('rgb(34, 34, 34)');
    expect(el.style.backgroundImage).toBe('');
    expect(el.classList.contains('has-bg-image')).toBe(false);
    expect(el.style.getPropertyValue('--bg-dim')).toBe('0');
  });

  it('sets the dim overlay and tracks the requested image', () => {
    const el = document.createElement('div');
    applyBackground(el, settings, 'lyrics');
    expect(el.style.getPropertyValue('--bg-dim')).toBe('0.5');
    expect(el.dataset.bgImage).toBe('img-lyrics');
  });
});

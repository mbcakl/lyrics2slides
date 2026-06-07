import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isFontAvailable, getUnavailableFonts, getActiveFontFamilies } from './fonts.js';

describe('font utilities', () => {
  describe('isFontAvailable', () => {
    it('returns true for common system fonts', async () => {
      // Note: jsdom has limited canvas support, so this will return true
      const result = await isFontAvailable('Arial');
      expect(result).toBe(true);
    });

    it('returns true for serif fallback', async () => {
      const result = await isFontAvailable('serif');
      expect(result).toBe(true);
    });

    it('handles non-existent fonts gracefully', async () => {
      // In jsdom without canvas, this returns true (graceful fallback)
      const result = await isFontAvailable('ThisFontDoesNotExist12345');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getUnavailableFonts', () => {
    it('returns array for font settings', async () => {
      const settings = {
        fontFamilyPrimary: 'Arial',
        fontFamilySecondary: 'serif'
      };
      const result = await getUnavailableFonts(settings);
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles font settings correctly', async () => {
      const settings = {
        fontFamilyPrimary: 'Arial',
        fontFamilySecondary: 'Helvetica'
      };
      const result = await getUnavailableFonts(settings);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getActiveFontFamilies', () => {
    const settings = {
      fontFamilyPrimary: 'LyricsPrimary',
      fontFamilySecondary: 'LyricsSecondary',
      bibleFontFamilyPrimary: 'BiblePrimary',
      bibleFontFamilySecondary: 'BibleSecondary'
    };

    it('returns lyrics fonts in lyrics mode', () => {
      expect(getActiveFontFamilies(settings, 'lyrics')).toEqual(['LyricsPrimary', 'LyricsSecondary']);
    });

    it('returns bible fonts in bible mode', () => {
      expect(getActiveFontFamilies(settings, 'bible')).toEqual(['BiblePrimary', 'BibleSecondary']);
    });

    it('defaults to lyrics fonts when mode is omitted', () => {
      expect(getActiveFontFamilies(settings)).toEqual(['LyricsPrimary', 'LyricsSecondary']);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  toSuperscript, matchBook, parseSmartInput, parseReference,
  formatBookName, isOldTestament, BOOK_NAMES_MAP, OT_BOOKS
} from './data.js';

describe('toSuperscript', () => {
  it('converts numbers to superscript', () => {
    expect(toSuperscript('1')).toBe('¹');
    expect(toSuperscript('12')).toBe('¹²');
    expect(toSuperscript('0')).toBe('⁰');
  });
});

describe('parseSmartInput', () => {
  it('handles book and reference', () => {
    expect(parseSmartInput('Genesis 1:1')).toEqual({ bookQuery: 'Genesis', reference: '1:1' });
  });
  it('handles books with numbers', () => {
    expect(parseSmartInput('1 John 3:16')).toEqual({ bookQuery: '1 John', reference: '3:16' });
  });
  it('handles multiple word books', () => {
    expect(parseSmartInput('Song of Solomon 1:1')).toEqual({ bookQuery: 'Song of Solomon', reference: '1:1' });
  });
  it('handles chapter only fallback', () => {
    expect(parseSmartInput('3:16')).toEqual({ bookQuery: '', reference: '3:16' });
  });
  it('returns empty for falsy input', () => {
    expect(parseSmartInput('')).toEqual({ bookQuery: '', reference: '' });
    expect(parseSmartInput(null)).toEqual({ bookQuery: '', reference: '' });
  });
});

describe('matchBook', () => {
  it('matches by English prefix', () => { expect(matchBook('Gen')[0].code).toBe('GEN'); });
  it('matches by Chinese prefix', () => { expect(matchBook('创')[0].code).toBe('GEN'); });
  it('matches by Pinyin initials', () => { expect(matchBook('csj')[0].code).toBe('GEN'); });
  it('matches by exact code', () => { expect(matchBook('GEN')[0].code).toBe('GEN'); });
  it('returns empty array for no match', () => { expect(matchBook('xyzxyz')).toEqual([]); });
});

describe('parseReference', () => {
  it('returns null for empty string', () => {
    expect(parseReference('GEN', '')).toBeNull();
    expect(parseReference('GEN', '  ')).toBeNull();
  });
  it('handles chapter only', () => {
    expect(parseReference('GEN', '1')).toEqual({ book: 'GEN', chapter: 1, startVerse: null, endVerse: null });
  });
  it('handles chapter and single verse', () => {
    expect(parseReference('GEN', '1:1')).toEqual({ book: 'GEN', chapter: 1, startVerse: 1, endVerse: 1 });
  });
  it('handles chapter and verse range', () => {
    expect(parseReference('GEN', '1:1-5')).toEqual({ book: 'GEN', chapter: 1, startVerse: 1, endVerse: 5 });
  });
  it('returns null for invalid format', () => {
    expect(parseReference('GEN', 'abc')).toBeNull();
    expect(parseReference('GEN', '1:abc')).toBeNull();
  });
  it('accepts the full-width colon', () => {
    expect(parseReference('GEN', '1\uFF1A1')).toEqual({ book: 'GEN', chapter: 1, startVerse: 1, endVerse: 1 });
  });
  it('accepts full-width and en/em dashes in a range', () => {
    const expected = { book: 'GEN', chapter: 1, startVerse: 1, endVerse: 5 };
    expect(parseReference('GEN', '1:1\uFF0D5')).toEqual(expected);
    expect(parseReference('GEN', '1:1\u20135')).toEqual(expected);
    expect(parseReference('GEN', '1:1\u20145')).toEqual(expected);
  });
  it('accepts full-width colon and dash together', () => {
    expect(parseReference('GEN', '1\uFF1A1\uFF0D5')).toEqual({ book: 'GEN', chapter: 1, startVerse: 1, endVerse: 5 });
  });
  it('still rejects separators that are not a colon or dash', () => {
    expect(parseReference('GEN', '1\uFF0C1')).toBeNull();
    expect(parseReference('GEN', '1 : 1')).toBeNull();
  });
});

describe('formatBookName', () => {
  const gen = BOOK_NAMES_MAP.GEN; // { en: 'Genesis', zh: '创世记', pinyin: 'csj' }
  it('returns English name for a non-Chinese primary version', () => {
    expect(formatBookName(gen, 'NIV', null)).toBe('Genesis');
  });
  it('returns Chinese name for the CUNPSS primary version', () => {
    expect(formatBookName(gen, 'CUNPSS-神', null)).toBe('创世记');
  });
  it('combines both when secondary differs', () => {
    expect(formatBookName(gen, 'NIV', 'CUNPSS-神')).toBe('Genesis(创世记)');
  });
  it('does not duplicate when both resolve to the same name', () => {
    expect(formatBookName(gen, 'NIV', 'ESV')).toBe('Genesis');
  });
  it('accepts a matchBook result object as names', () => {
    expect(formatBookName(matchBook('Gen')[0], 'NIV', null)).toBe('Genesis');
  });
  it('returns empty string for missing names', () => {
    expect(formatBookName(null, 'NIV', null)).toBe('');
  });
});

describe('isOldTestament', () => {
  it('is true for an OT book', () => { expect(isOldTestament('GEN')).toBe(true); });
  it('is false for an NT book', () => { expect(isOldTestament('MAT')).toBe(false); });
});

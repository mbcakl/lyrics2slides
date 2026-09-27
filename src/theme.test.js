import { describe, it, expect, beforeEach } from 'vitest';
import { THEMES, THEME_KEY, DEFAULT_THEME, getStoredTheme, applyTheme, initTheme } from './theme.js';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    document.body.innerHTML = '<select id="theme-select"></select>';
  });

  it('defaults to midnight when nothing is stored', () => {
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('ignores an unknown stored theme', () => {
    localStorage.setItem(THEME_KEY, 'neon');
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('maps the legacy classic theme to midnight', () => {
    localStorage.setItem(THEME_KEY, 'classic');
    expect(getStoredTheme()).toBe('midnight');
  });

  it('accepts the liquid glass theme', () => {
    localStorage.setItem(THEME_KEY, 'glass');
    expect(getStoredTheme()).toBe('glass');
  });

  it('applyTheme sets the data-theme attribute and persists it', () => {
    applyTheme('hymnal');
    expect(document.documentElement.dataset.theme).toBe('hymnal');
    expect(localStorage.getItem(THEME_KEY)).toBe('hymnal');
  });

  it('applyTheme falls back to the default for invalid ids', () => {
    expect(applyTheme('nope')).toBe(DEFAULT_THEME);
    expect(document.documentElement.dataset.theme).toBe(DEFAULT_THEME);
  });

  it('initTheme fills the select and restores the stored theme', () => {
    localStorage.setItem(THEME_KEY, 'stage');
    initTheme();
    const select = document.getElementById('theme-select');
    expect([...select.options].map((o) => o.value)).toEqual(THEMES.map((t) => t.id));
    expect(select.value).toBe('stage');
    expect(document.documentElement.dataset.theme).toBe('stage');
  });

  it('changing the select switches the theme', () => {
    initTheme();
    const select = document.getElementById('theme-select');
    select.value = 'sanctuary';
    select.dispatchEvent(new Event('change'));
    expect(document.documentElement.dataset.theme).toBe('sanctuary');
    expect(localStorage.getItem(THEME_KEY)).toBe('sanctuary');
  });
});

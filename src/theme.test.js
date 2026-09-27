import { describe, it, expect, beforeEach } from 'vitest';
import { THEME_KEY, DEFAULT_THEME, getStoredTheme, applyTheme, initThemeToggle } from './theme.js';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    document.body.innerHTML = '<button id="theme-toggle"></button>';
  });

  it('defaults to the classic theme', () => {
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
    expect(DEFAULT_THEME).toBe('classic');
  });

  it('ignores unknown stored values', () => {
    localStorage.setItem(THEME_KEY, 'neon');
    expect(getStoredTheme()).toBe('classic');
  });

  it('applies and persists a theme', () => {
    applyTheme('glass');
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(localStorage.getItem(THEME_KEY)).toBe('glass');
  });

  it('toggles between themes and updates the button label', () => {
    initThemeToggle();
    const button = document.getElementById('theme-toggle');
    expect(document.documentElement.dataset.theme).toBe('classic');
    expect(button.getAttribute('aria-label')).toBe('Switch to Liquid Glass theme');

    button.click();
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(localStorage.getItem(THEME_KEY)).toBe('glass');
    expect(button.getAttribute('aria-label')).toBe('Switch to classic theme');

    button.click();
    expect(document.documentElement.dataset.theme).toBe('classic');
  });

  it('restores the saved theme on init', () => {
    localStorage.setItem(THEME_KEY, 'glass');
    initThemeToggle();
    expect(document.documentElement.dataset.theme).toBe('glass');
  });
});

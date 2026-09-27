// UI theme switching. The stylesheet defines each theme as a set of CSS
// variables under <html data-theme="…">; index.html applies the saved theme
// before first paint, and this module wires up the header toggle.

export const THEME_KEY = 'lyrics2slides_theme';
export const THEMES = ['classic', 'glass'];
export const DEFAULT_THEME = 'classic';

export function getStoredTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return THEMES.includes(theme) ? theme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme, root = document.documentElement) {
  const next = THEMES.includes(theme) ? theme : DEFAULT_THEME;
  root.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Storage unavailable (private mode etc.): theme still applies for this visit
  }
  return next;
}

function nextTheme(theme) {
  return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
}

function updateToggle(button, theme) {
  const label = nextTheme(theme) === 'glass' ? 'Switch to Liquid Glass theme' : 'Switch to classic theme';
  button.setAttribute('aria-label', label);
  button.title = label;
}

export function initThemeToggle() {
  const button = document.getElementById('theme-toggle');
  const theme = applyTheme(document.documentElement.dataset.theme || getStoredTheme());
  if (!button) return;
  updateToggle(button, theme);
  button.addEventListener('click', () => {
    updateToggle(button, applyTheme(nextTheme(document.documentElement.dataset.theme)));
  });
}

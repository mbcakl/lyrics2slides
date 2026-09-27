// App chrome themes. The slide itself is styled by user settings, not the theme.
export const THEME_KEY = 'lyrics2slides_theme';

export const THEMES = [
  { id: 'midnight', label: 'Midnight' },
  { id: 'sanctuary', label: 'Sanctuary' },
  { id: 'hymnal', label: 'Hymnal' },
  { id: 'stage', label: 'Stage Monitor' },
  { id: 'glass', label: 'Liquid Glass' },
];

// Earlier builds stored the Midnight theme as 'classic'
const LEGACY_THEMES = { classic: 'midnight' };

export const DEFAULT_THEME = 'midnight';

export function isValidTheme(id) {
  return THEMES.some((theme) => theme.id === id);
}

export function getStoredTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    const stored = LEGACY_THEMES[raw] || raw;
    return isValidTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(id) {
  const theme = isValidTheme(id) ? id : DEFAULT_THEME;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage unavailable (private mode); the theme still applies for this visit
  }
  return theme;
}

export function initTheme() {
  const select = document.getElementById('theme-select');
  const current = applyTheme(getStoredTheme());
  if (!select) return;

  select.replaceChildren(...THEMES.map(({ id, label }) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = label;
    return option;
  }));
  select.value = current;

  select.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });
}

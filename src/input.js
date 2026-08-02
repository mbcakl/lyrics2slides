import {
  state, setSlides, setPrimaryLyrics, setSecondaryLyrics, updateSettings,
  addSavedLyrics, removeSavedLyrics, subscribe
} from './state.js';
import { parseLyrics } from './parser.js';
import { syncControlsWithState } from './controls.js';
import { deriveTitle, renderSavedLyrics } from './lyrics/view.js';

// Font settings a saved song carries with it, so loading one restores its look.
const SONG_SETTING_KEYS = [
  'fontFamilyPrimary', 'fontSizePrimary', 'fontBoldPrimary', 'fontColorPrimary',
  'fontFamilySecondary', 'fontSizeSecondary', 'fontBoldSecondary', 'fontColorSecondary'
];

let primaryTextarea;
let secondaryTextarea;
let secondaryGroup;
let secondaryHasBeenUsed = false;

function setSecondaryEnabled(enabled) {
  secondaryTextarea.disabled = !enabled;

  if (enabled) {
    secondaryGroup.style.opacity = '1';
    secondaryGroup.style.pointerEvents = 'auto';
  } else {
    secondaryGroup.style.opacity = '0.4';
    secondaryGroup.style.pointerEvents = 'none';
    secondaryTextarea.value = '';
    setSecondaryLyrics('');
  }
}

function pickSongSettings(settings) {
  const picked = {};
  SONG_SETTING_KEYS.forEach(key => { picked[key] = settings[key]; });
  return picked;
}

export function initInput() {
  primaryTextarea = document.getElementById('primary-lyrics');
  secondaryTextarea = document.getElementById('secondary-lyrics');
  secondaryGroup = document.getElementById('secondary-group');
  const saveBtn = document.getElementById('save-lyrics-btn');
  const savedLyricsGrid = document.getElementById('saved-lyrics-grid');

  // Debounce timer
  let debounceTimer;

  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Use proper setters instead of direct mutation
      setPrimaryLyrics(primaryTextarea.value);
      setSecondaryLyrics(secondaryTextarea.value);

      // Enable/disable secondary based on primary content
      const hasPrimary = primaryTextarea.value.trim().length > 0;
      setSecondaryEnabled(hasPrimary);
      saveBtn.disabled = !deriveTitle(primaryTextarea.value);

      // When secondary is first used, set both font sizes to 40
      const hasSecondary = secondaryTextarea.value.trim().length > 0;
      if (hasSecondary && !secondaryHasBeenUsed) {
        secondaryHasBeenUsed = true;
        updateSettings({ fontSizePrimary: 40, fontSizeSecondary: 40 });
        // Update the UI inputs
        document.getElementById('size-primary').value = 40;
        document.getElementById('size-secondary').value = 40;
      }

      const slides = parseLyrics(state.primaryLyrics, state.secondaryLyrics);
      setSlides(slides);
    }, 150);
  }

  function saveCurrentSong() {
    const title = deriveTitle(primaryTextarea.value);
    if (!title) return;
    addSavedLyrics({
      id: Date.now(),
      title,
      primary: primaryTextarea.value,
      secondary: secondaryTextarea.value,
      settings: pickSongSettings(state.settings)
    });
  }

  function loadSavedSong(song) {
    // A pending debounce would otherwise overwrite the loaded text with the
    // pre-load textarea contents.
    clearTimeout(debounceTimer);

    primaryTextarea.value = song.primary;
    setPrimaryLyrics(song.primary);

    // Order matters: disabling secondary clears its textarea, so toggle first.
    const hasPrimary = song.primary.trim().length > 0;
    setSecondaryEnabled(hasPrimary);
    const secondary = song.secondary || '';
    secondaryTextarea.value = secondary;
    setSecondaryLyrics(secondary);

    // The saved sizes are what the user chose for this song; don't let the
    // first-secondary-use 40/40 adjustment fire on top of them.
    secondaryHasBeenUsed = secondary.trim().length > 0;

    if (song.settings) {
      updateSettings(pickSongSettings({ ...state.settings, ...song.settings }));
      syncControlsWithState();
    }

    saveBtn.disabled = !deriveTitle(song.primary);
    setSlides(parseLyrics(song.primary, secondary));
  }

  primaryTextarea.addEventListener('input', handleInput);
  secondaryTextarea.addEventListener('input', handleInput);
  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    saveCurrentSong();
  });

  // Re-render the grid only when the saved-songs array identity changes.
  let lastSavedLyrics = state.savedLyrics;
  subscribe((newState) => {
    if (newState.savedLyrics !== lastSavedLyrics) {
      lastSavedLyrics = newState.savedLyrics;
      renderSavedLyrics(savedLyricsGrid, newState.savedLyrics, { onLoad: loadSavedSong, onDelete: removeSavedLyrics });
    }
  });

  // Initial state - secondary disabled, nothing to save yet
  setSecondaryEnabled(false);
  saveBtn.disabled = true;
  renderSavedLyrics(savedLyricsGrid, state.savedLyrics, { onLoad: loadSavedSong, onDelete: removeSavedLyrics });
}

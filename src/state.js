// Application state
const VERSES_KEY = 'lyrics2slides_saved_verses';
const LYRICS_KEY = 'lyrics2slides_saved_lyrics';
const SETTINGS_KEY = 'lyrics2slides_settings';
const MODE_KEY = 'lyrics2slides_mode';

let initialSavedVerses = [];
const storedVerses = localStorage.getItem(VERSES_KEY);
if (storedVerses) {
  try {
    initialSavedVerses = JSON.parse(storedVerses);
  } catch (e) {
    console.error('Failed to parse saved verses', e);
  }
}

let initialSavedLyrics = [];
const storedLyrics = localStorage.getItem(LYRICS_KEY);
if (storedLyrics) {
  try {
    initialSavedLyrics = JSON.parse(storedLyrics);
  } catch (e) {
    console.error('Failed to parse saved lyrics', e);
  }
}

let initialSettings = {
  backgroundColor: '#000000',
  fontFamilyPrimary: 'Kaiti SC',
  fontSizePrimary: 64,
  fontBoldPrimary: true,
  fontColorPrimary: '#ffff00',
  fontFamilySecondary: 'Calibri',
  fontSizeSecondary: 40,
  fontBoldSecondary: true,
  fontColorSecondary: '#ffff00',
  // Bible-specific settings
  bibleBackgroundColor: '#000000',
  bibleFontFamilyPrimary: 'Kaiti SC',
  bibleFontSizePrimary: 40,
  bibleFontBoldPrimary: true,
  bibleFontColorPrimary: '#ffff00',
  bibleFontFamilySecondary: 'Calibri',
  bibleFontSizeSecondary: 40,
  bibleFontBoldSecondary: true,
  bibleFontColorSecondary: '#ffff00',
  bibleSecondaryEnable: false
};

const storedSettings = localStorage.getItem(SETTINGS_KEY);
if (storedSettings) {
  try {
    const parsed = JSON.parse(storedSettings);
    initialSettings = { ...initialSettings, ...parsed };
  } catch (e) {
    console.error('Failed to parse settings', e);
  }
}

export const state = {
  primaryLyrics: '',
  secondaryLyrics: '',
  mode: localStorage.getItem(MODE_KEY) || 'bible',
  bibleSelectedBook: 'GEN',
  biblePrimaryText: '',
  bibleSecondaryText: '',
  biblePrimaryVerses: [],
  bibleSecondaryVerses: [],
  biblePrimaryReference: '',
  bibleSecondaryReference: '',
  savedVerses: initialSavedVerses,
  savedLyrics: initialSavedLyrics,
  slides: [],
  currentSlide: 0,
  settings: initialSettings
};

// Listeners for state changes
const listeners = new Set();
const syncChannel = new BroadcastChannel('lyrics2slides_sync');

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify() {
  listeners.forEach(listener => listener(state));
  syncChannel.postMessage({ type: 'SYNC_STATE', state });
}

// Handle requests for initial state and navigation from other windows
syncChannel.onmessage = (event) => {
  if (event.data.type === 'REQUEST_STATE') {
    syncChannel.postMessage({ type: 'SYNC_STATE', state });
  } else if (event.data.type === 'PREV_SLIDE') {
    prevSlide();
  } else if (event.data.type === 'NEXT_SLIDE') {
    nextSlide();
  }
};

export function setPrimaryLyrics(lyrics) {
  state.primaryLyrics = lyrics;
  notify();
}

export function setSecondaryLyrics(lyrics) {
  state.secondaryLyrics = lyrics;
  notify();
}

export function setMode(mode) {
  state.mode = mode;
  localStorage.setItem(MODE_KEY, mode);
  notify();
}

export function setBibleSelectedBook(bookCode) {
  state.bibleSelectedBook = bookCode;
  notify();
}

export function setBiblePrimaryText(text) {
  state.biblePrimaryText = text;
  notify();
}

export function setBibleSecondaryText(text) {
  state.bibleSecondaryText = text;
  notify();
}

export function setBiblePrimaryVerses(verses) {
  state.biblePrimaryVerses = verses;
  notify();
}

export function setBibleSecondaryVerses(verses) {
  state.bibleSecondaryVerses = verses;
  notify();
}

export function setBiblePrimaryReference(ref) {
  state.biblePrimaryReference = ref;
  notify();
}

export function setBibleSecondaryReference(ref) {
  state.bibleSecondaryReference = ref;
  notify();
}

export function addSavedVerse(verse) {
  // verse: { id, book, reference, pVersion, sVersion, sEnabled }
  // Check for duplicates
  const exists = state.savedVerses.some(v => 
    v.book === verse.book && 
    v.reference === verse.reference && 
    v.pVersion === verse.pVersion &&
    v.sVersion === verse.sVersion &&
    v.sEnabled === verse.sEnabled
  );
  if (!exists) {
    state.savedVerses = [...state.savedVerses, verse];
    localStorage.setItem(VERSES_KEY, JSON.stringify(state.savedVerses));
    notify();
  }
}

export function removeSavedVerse(id) {
  state.savedVerses = state.savedVerses.filter(v => v.id !== id);
  localStorage.setItem(VERSES_KEY, JSON.stringify(state.savedVerses));
  notify();
}

export function addSavedLyrics(song) {
  // song: { id, title, primary, secondary, settings }
  // Unlike verses (a re-fetchable pointer), a song carries its own text, so the
  // title is its identity: re-saving under the same title updates in place.
  const title = song.title.trim();
  if (!title) return;

  const entry = { ...song, title };
  const index = state.savedLyrics.findIndex(s => s.title === title);
  if (index === -1) {
    state.savedLyrics = [...state.savedLyrics, entry];
  } else {
    state.savedLyrics = state.savedLyrics.map((s, i) =>
      i === index ? { ...entry, id: s.id } : s
    );
  }
  localStorage.setItem(LYRICS_KEY, JSON.stringify(state.savedLyrics));
  notify();
}

export function removeSavedLyrics(id) {
  state.savedLyrics = state.savedLyrics.filter(s => s.id !== id);
  localStorage.setItem(LYRICS_KEY, JSON.stringify(state.savedLyrics));
  notify();
}

export function updateSettings(updates) {
  Object.assign(state.settings, updates);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  notify();
}

export function setSlides(slides) {
  state.slides = slides;
  state.currentSlide = Math.min(state.currentSlide, Math.max(0, slides.length - 1));
  notify();
}

export function setCurrentSlide(index) {
  if (index >= 0 && index < state.slides.length) {
    state.currentSlide = index;
    notify();
  }
}

export function nextSlide() {
  if (state.currentSlide < state.slides.length - 1) {
    state.currentSlide++;
    notify();
  }
}

export function prevSlide() {
  if (state.currentSlide > 0) {
    state.currentSlide--;
    notify();
  }
}

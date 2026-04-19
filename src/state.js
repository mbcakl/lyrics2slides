// Application state
export const state = {
  primaryLyrics: '',
  secondaryLyrics: '',
  slides: [],
  currentSlide: 0,
  settings: {
    backgroundColor: '#000000',
    fontFamilyPrimary: 'Kaiti SC',
    fontSizePrimary: 64,
    fontBoldPrimary: true,
    fontColorPrimary: '#ffff00',
    fontFamilySecondary: 'Calibri',
    fontSizeSecondary: 40,
    fontBoldSecondary: true,
    fontColorSecondary: '#ffff00'
  }
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

export function updateSettings(updates) {
  Object.assign(state.settings, updates);
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

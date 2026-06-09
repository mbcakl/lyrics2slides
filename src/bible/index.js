import {
  state, setMode, setBibleSelectedBook,
  setBiblePrimaryText, setBibleSecondaryText,
  setBiblePrimaryVerses, setBibleSecondaryVerses,
  setBiblePrimaryReference, setBibleSecondaryReference,
  setSlides, subscribe, updateSettings,
  addSavedVerse, removeSavedVerse
} from '../state.js';
import { parseLyrics } from '../parser.js';
import { BOOK_NAMES_MAP, matchBook, parseSmartInput, parseReference, formatBookName } from './data.js';
import { loadBibleDb, fetchVerses } from './db.js';
import { buildBibleSlides, createDomMeasurer, reSplitBible } from './slides.js';
import { renderBookGrid, renderSavedVerses, renderAutocomplete, showInputError } from './view.js';

export async function initBible() {
  let db = null;
  let dbError = false;
  try {
    db = await loadBibleDb();
  } catch (err) {
    console.error('Failed to load Bible database:', err);
    dbError = true;
  }

  // DOM refs
  const tabLyrics = document.getElementById('tab-lyrics');
  const tabBible = document.getElementById('tab-bible');
  const lyricsContainer = document.getElementById('lyrics-container');
  const bibleContainer = document.getElementById('bible-container');
  const pickerDialog = document.getElementById('bible-picker-dialog');
  const otGrid = document.getElementById('ot-grid');
  const ntGrid = document.getElementById('nt-grid');
  const closePickerBtn = document.getElementById('close-picker-btn');
  const secEnable = document.getElementById('bible-secondary-enable');
  const secTrans = document.getElementById('bible-translation-secondary');
  const secGroup = document.getElementById('bible-secondary-group');
  const primaryTextarea = document.getElementById('bible-primary-text');
  const secondaryTextarea = document.getElementById('bible-secondary-text');
  const saveBtn = document.getElementById('save-bible-btn');
  const savedVersesGrid = document.getElementById('saved-verses-grid');
  const primaryTrans = document.getElementById('bible-translation-primary');
  const smartInput = document.getElementById('bible-smart-input');
  const autocompleteDropdown = document.getElementById('bible-autocomplete-dropdown');
  const searchBtn = document.getElementById('bible-search-btn');
  const pickerBtn = document.getElementById('bible-book-picker-btn');

  let highlightedIndex = -1;
  let currentMatches = [];

  // DB-load error surfacing (was a silent console.error)
  if (dbError) {
    const errEl = document.createElement('div');
    errEl.className = 'bible-error';
    errEl.setAttribute('role', 'alert');
    errEl.textContent = 'Failed to load the Bible database. Search is unavailable.';
    bibleContainer.prepend(errEl);
    searchBtn.disabled = true;
    smartInput.disabled = true;
  }

  function getVersions() {
    return { pVersion: primaryTrans.value, sVersion: secEnable.checked ? secTrans.value : null };
  }

  function updateSlidesFromMode() {
    if (state.mode === 'lyrics') {
      setSlides(parseLyrics(state.primaryLyrics, state.secondaryLyrics));
    } else {
      setSlides(parseLyrics(state.biblePrimaryText, state.bibleSecondaryText));
    }
  }

  function executeFetch() {
    const { bookQuery, reference: cvStr } = parseSmartInput(smartInput.value);
    let bookCode = state.bibleSelectedBook;

    if (bookQuery) {
      const cleanQuery = bookQuery.replace(/\s*\(.*?\)\s*/, '').trim();
      const possibleBooks = matchBook(cleanQuery);
      if (possibleBooks.length > 0) {
        bookCode = possibleBooks[0].code;
        setBibleSelectedBook(bookCode);
      } else {
        showInputError(smartInput);
        return;
      }
    }

    if (!cvStr || !db) return; // guard position matches the original bible.js exactly
    const ref = parseReference(bookCode, cvStr);
    if (!ref) { showInputError(smartInput); return; }

    const bookNames = BOOK_NAMES_MAP[ref.book];
    let range = '';
    if (ref.chapter) {
      range = ` ${ref.chapter}`;
      if (ref.startVerse) {
        range += `:${ref.startVerse}${ref.endVerse !== ref.startVerse ? '-' + ref.endVerse : ''}`;
      }
    }

    const pVersion = primaryTrans.value;
    const pVerses = fetchVerses(db, ref, pVersion);
    let sVerses = [];
    let sVersion = '';
    if (secEnable.checked) {
      sVersion = secTrans.value;
      sVerses = fetchVerses(db, ref, sVersion);
    }

    const pRef = `${pVersion === 'CUNPSS-神' ? bookNames.zh : bookNames.en}${range}`;
    let sRef = '';
    if (secEnable.checked) {
      sRef = `${sVersion === 'CUNPSS-神' ? bookNames.zh : bookNames.en}${range}`;
    }

    const measurer = createDomMeasurer(state.settings); // fresh per build (current fonts)
    const slides = buildBibleSlides(pVerses, sVerses, state.settings, { primaryRef: pRef, secondaryRef: sRef, measurer });

    const pText = slides.map(s => s.primary.join('\n')).join('\n\n');
    primaryTextarea.value = pText;
    setBiblePrimaryText(pText);
    if (secEnable.checked) {
      const sText = slides.map(s => s.secondary.join('\n')).join('\n\n');
      secondaryTextarea.value = sText;
      setBibleSecondaryText(sText);
    }

    setBiblePrimaryVerses(pVerses);
    setBibleSecondaryVerses(sVerses);
    setBiblePrimaryReference(pRef);
    setBibleSecondaryReference(sRef);
    setSlides(slides);
  }

  function selectMatch(match) {
    setBibleSelectedBook(match.code);
    const { pVersion, sVersion } = getVersions();
    smartInput.value = `${formatBookName(match, pVersion, sVersion)} `;
    renderAutocomplete(autocompleteDropdown, [], -1);
    highlightedIndex = -1;
    smartInput.focus();
  }

  function loadSavedVerse(v) {
    setBibleSelectedBook(v.book);
    primaryTrans.value = v.pVersion;
    secTrans.value = v.sVersion;
    secEnable.checked = v.sEnabled;
    secTrans.disabled = !v.sEnabled;
    if (!v.sEnabled) {
      secGroup.style.opacity = '0.4';
      secGroup.style.pointerEvents = 'none';
    } else {
      secGroup.style.opacity = '1';
      secGroup.style.pointerEvents = 'auto';
    }
    const { pVersion, sVersion } = getVersions();
    smartInput.value = `${formatBookName(BOOK_NAMES_MAP[v.book], pVersion, sVersion)} ${v.reference}`;
    executeFetch();
  }

  // --- event listeners ---
  searchBtn.addEventListener('click', (e) => { e.preventDefault(); executeFetch(); });

  pickerBtn.addEventListener('click', () => {
    renderBookGrid(otGrid, ntGrid, {
      selectedBook: state.bibleSelectedBook,
      onSelect: (code) => {
        setBibleSelectedBook(code);
        pickerDialog.close();
        const { pVersion, sVersion } = getVersions();
        smartInput.value = `${formatBookName(BOOK_NAMES_MAP[code], pVersion, sVersion)} `;
        smartInput.focus();
      }
    });
    pickerDialog.showModal();
  });

  closePickerBtn.addEventListener('click', (e) => { e.preventDefault(); pickerDialog.close(); });

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const { reference } = parseSmartInput(smartInput.value);
    if (!reference) return;
    addSavedVerse({
      id: Date.now(),
      book: state.bibleSelectedBook,
      reference,
      pVersion: primaryTrans.value,
      sVersion: secTrans.value,
      sEnabled: secEnable.checked
    });
  });

  smartInput.addEventListener('input', (e) => {
    const val = e.target.value;
    const bookPartMatch = val.match(/^([a-zA-Z一-龥0-9\s]+?)(?:\s\d|$)/);
    const hasChapter = /\s\d/.test(val);
    if (bookPartMatch && !hasChapter) {
      currentMatches = matchBook(bookPartMatch[1].trim()).slice(0, 5);
      highlightedIndex = -1;
      renderAutocomplete(autocompleteDropdown, currentMatches, highlightedIndex);
    } else {
      renderAutocomplete(autocompleteDropdown, [], -1);
    }
  });

  smartInput.addEventListener('keydown', (e) => {
    if (autocompleteDropdown.style.display === 'block') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, currentMatches.length - 1);
        renderAutocomplete(autocompleteDropdown, currentMatches, highlightedIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        renderAutocomplete(autocompleteDropdown, currentMatches, highlightedIndex);
      } else if ((e.key === 'Enter' || e.key === 'Tab') && highlightedIndex >= 0) {
        e.preventDefault();
        selectMatch(currentMatches[highlightedIndex]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeFetch();
    }
  });

  document.addEventListener('click', (e) => {
    if (!smartInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
      renderAutocomplete(autocompleteDropdown, [], -1);
      highlightedIndex = -1;
    }
  });

  autocompleteDropdown.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.autocomplete-item');
    if (item) selectMatch(currentMatches[parseInt(item.dataset.index, 10)]);
  });

  tabLyrics.addEventListener('click', () => {
    setMode('lyrics');
    tabLyrics.classList.add('active');
    tabBible.classList.remove('active');
    lyricsContainer.style.display = 'block';
    bibleContainer.style.display = 'none';
    updateSlidesFromMode();
  });

  tabBible.addEventListener('click', () => {
    setMode('bible');
    tabBible.classList.add('active');
    tabLyrics.classList.remove('active');
    bibleContainer.style.display = 'block';
    lyricsContainer.style.display = 'none';
    updateSlidesFromMode();
  });

  secEnable.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    updateSettings({ bibleSecondaryEnable: enabled });
    secTrans.disabled = !enabled;
    secondaryTextarea.disabled = !enabled;
    if (enabled) {
      secGroup.style.opacity = '1';
      secGroup.style.pointerEvents = 'auto';
    } else {
      secGroup.style.opacity = '0.4';
      secGroup.style.pointerEvents = 'none';
      secondaryTextarea.value = '';
      setBibleSecondaryText('');
      updateSlidesFromMode();
    }
  });

  primaryTextarea.addEventListener('input', (e) => {
    setBiblePrimaryText(e.target.value);
    setBiblePrimaryVerses([]);
    setBibleSecondaryVerses([]);
    updateSlidesFromMode();
  });

  secondaryTextarea.addEventListener('input', (e) => {
    setBibleSecondaryText(e.target.value);
    setBiblePrimaryVerses([]);
    setBibleSecondaryVerses([]);
    updateSlidesFromMode();
  });

  // Subscription: settings-change re-split (with JSON dedupe) + saved-verses re-render (identity dedupe).
  // INVARIANT: set lastSettings BEFORE reSplitBible — reSplitBible's setSlides notifies synchronously
  // and re-enters this handler; updating lastSettings first prevents an infinite loop.
  let lastSettings = JSON.stringify(state.settings);
  let lastSavedVerses = state.savedVerses;
  subscribe((newState) => {
    const currentSettings = JSON.stringify(newState.settings);
    if (newState.mode === 'bible' && newState.biblePrimaryVerses.length > 0 && currentSettings !== lastSettings) {
      lastSettings = currentSettings;
      reSplitBible(newState, setSlides, createDomMeasurer(newState.settings));
    } else {
      lastSettings = currentSettings;
    }
    if (newState.savedVerses !== lastSavedVerses) {
      lastSavedVerses = newState.savedVerses;
      renderSavedVerses(savedVersesGrid, newState.savedVerses, { onLoad: loadSavedVerse, onDelete: removeSavedVerse });
    }
  });

  function applyInitialState() {
    if (state.mode === 'bible') {
      tabBible.classList.add('active');
      tabLyrics.classList.remove('active');
      bibleContainer.style.display = 'block';
      lyricsContainer.style.display = 'none';
    } else {
      tabLyrics.classList.add('active');
      tabBible.classList.remove('active');
      lyricsContainer.style.display = 'block';
      bibleContainer.style.display = 'none';
    }
    const enabled = state.settings.bibleSecondaryEnable;
    secEnable.checked = enabled;
    secTrans.disabled = !enabled;
    secondaryTextarea.disabled = !enabled;
    if (enabled) {
      secGroup.style.opacity = '1';
      secGroup.style.pointerEvents = 'auto';
    } else {
      secGroup.style.opacity = '0.4';
      secGroup.style.pointerEvents = 'none';
    }
  }

  applyInitialState();
  updateSlidesFromMode();
  renderSavedVerses(savedVersesGrid, state.savedVerses, { onLoad: loadSavedVerse, onDelete: removeSavedVerse });
}

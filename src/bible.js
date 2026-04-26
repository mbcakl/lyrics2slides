import initSqlJs from 'sql.js';
import { 
  state, 
  setMode, 
  setBiblePrimaryText, 
  setBibleSecondaryText, 
  setBiblePrimaryVerses,
  setBibleSecondaryVerses,
  setSlides,
  subscribe
} from './state.js';
import { parseLyrics } from './parser.js';
import { dynamicSplit } from './dynamicSplitter.js';

let db = null;

const superscriptMap = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};

const bookMap = {
  'genesis': 'GEN', 'exodus': 'EXO', 'leviticus': 'LEV', 'numbers': 'NUM', 'deuteronomy': 'DEU',
  'joshua': 'JOS', 'judges': 'JDG', 'ruth': 'RUT', '1 samuel': '1SA', '2 samuel': '2SA',
  '1 kings': '1KI', '2 kings': '2KI', '1 chronicles': '1CH', '2 chronicles': '2CH',
  'ezra': 'EZR', 'nehemiah': 'NEH', 'esther': 'EST', 'job': 'JOB', 'psalms': 'PSA', 'psalm': 'PSA',
  'proverbs': 'PRO', 'ecclesiastes': 'ECC', 'song of solomon': 'SNG', 'isaiah': 'ISA',
  'jeremiah': 'JER', 'lamentations': 'LAM', 'ezekiel': 'EZK', 'daniel': 'DAN', 'hosea': 'HOS',
  'joel': 'JOL', 'amos': 'AMO', 'obadiah': 'OBA', 'jonah': 'JON', 'micah': 'MIC', 'nahum': 'NAM',
  'habakkuk': 'HAB', 'zephaniah': 'ZEP', 'haggai': 'HAG', 'zechariah': 'ZEC', 'malachi': 'MAL',
  'matthew': 'MAT', 'mark': 'MRK', 'luke': 'LUK', 'john': 'JHN', 'acts': 'ACT', 'romans': 'ROM',
  '1 corinthians': '1CO', '2 corinthians': '2CO', 'galatians': 'GAL', 'ephesians': 'EPH',
  'philippians': 'PHP', 'colossians': 'COL', '1 thessalonians': '1TH', '2 thessalonians': '2TH',
  '1 timothy': '1TI', '2 timothy': '2TI', 'titus': 'TIT', 'philemon': 'PHM', 'hebrews': 'HEB',
  'james': 'JAS', '1 peter': '1PE', '2 peter': '2PE', '1 john': '1JN', '2 john': '2JN',
  '3 john': '3JN', 'jude': 'JUD', 'revelation': 'REV',
  // Chinese names mapping
  '创世记': 'GEN', '出埃及记': 'EXO', '利未记': 'LEV', '民数记': 'NUM', '申命记': 'DEU',
  '约书亚记': 'JOS', '士师记': 'JDG', '路得记': 'RUT', '撒母耳记上': '1SA', '撒母耳记下': '2SA',
  '列王纪上': '1KI', '列王纪下': '2KI', '历代志上': '1CH', '历代志下': '2CH', '拉结记': 'EZR',
  '尼希米记': 'NEH', '以斯帖记': 'EST', '约伯记': 'JOB', '诗篇': 'PSA', '箴言': 'PRO',
  '传道书': 'ECC', '雅歌': 'SNG', '以赛亚书': 'ISA', '耶利米书': 'JER', '耶利米哀歌': 'LAM',
  '以西结书': 'EZK', '但以理书': 'DAN', '何西阿书': 'HOS', '约珥书': 'JOL', '阿摩司书': 'AMO',
  '俄巴底亚书': 'OBA', '约拿书': 'JON', '弥迦书': 'MIC', '那鸿书': 'NAM', '哈巴谷书': 'HAB',
  '西番雅书': 'ZEP', '哈该书': 'HAG', '撒迦利亚书': 'ZEC', '玛拉基书': 'MAL', '马太福音': 'MAT',
  '马可福音': 'MRK', '路加福音': 'LUK', '约翰福音': 'JHN', '使徒行传': 'ACT', '罗马书': 'ROM',
  '哥林多前书': '1CO', '哥林多后书': '2CO', '加拉太书': 'GAL', '以弗所书': 'EPH', '腓立比书': 'PHP',
  '歌罗西书': 'COL', '帖撒罗尼迦前书': '1TH', '帖撒罗尼迦后书': '2TH', '提摩太前书': '1TI',
  '提摩太后书': '2TI', '提多书': 'TIT', '腓利门书': 'PHM', '希伯来书': 'HEB', '雅各书': 'JAS',
  '彼得前书': '1PE', '彼得后书': '2PE', '约翰一书': '1JN', '约翰二书': '2JN', '约翰三书': '3JN',
  '犹大书': 'JUD', '启示录': 'REV'
};

export function toSuperscript(numStr) {
  return String(numStr).split('').map(c => superscriptMap[c] || c).join('');
}

export async function initBible() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `/${file}`
    });

    const response = await fetch('/bible.db');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));
    console.log('Bible database loaded successfully');
  } catch (err) {
    console.error('Failed to load Bible database:', err);
  }

  // UI Setup
  const tabLyrics = document.getElementById('tab-lyrics');
  const tabBible = document.getElementById('tab-bible');
  const lyricsContainer = document.getElementById('lyrics-container');
  const bibleContainer = document.getElementById('bible-container');
  const fetchBtn = document.getElementById('fetch-bible-btn');
  const secEnable = document.getElementById('bible-secondary-enable');
  const secTrans = document.getElementById('bible-translation-secondary');
  const secGroup = document.getElementById('bible-secondary-group');
  const primaryTextarea = document.getElementById('bible-primary-text');
  const secondaryTextarea = document.getElementById('bible-secondary-text');

  function updateSlidesFromMode() {
    if (state.mode === 'lyrics') {
      setSlides(parseLyrics(state.primaryLyrics, state.secondaryLyrics));
    } else {
      setSlides(parseLyrics(state.biblePrimaryText, state.bibleSecondaryText));
    }
  }

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
    secTrans.disabled = !e.target.checked;
    secondaryTextarea.disabled = !e.target.checked;
    if (e.target.checked) {
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
    updateSlidesFromMode();
  });

  secondaryTextarea.addEventListener('input', (e) => {
    setBibleSecondaryText(e.target.value);
    updateSlidesFromMode();
  });

  fetchBtn.addEventListener('click', async () => {
    const refStr = document.getElementById('bible-reference').value.trim();
    if (!refStr || !db) return;

    const ref = parseReference(refStr);
    if (!ref) {
      alert('Invalid reference format. Use e.g., "John 3:16" or "Genesis 1:1-5"');
      return;
    }

    const pVersion = document.getElementById('bible-translation-primary').value;
    const pVerses = fetchVerses(ref, pVersion);
    
    let sVerses = [];
    if (secEnable.checked) {
      const sVersion = secTrans.value;
      sVerses = fetchVerses(ref, sVersion);
    }

    // Replace old slide generation with dynamicSplit
    const settings = state.settings;
    const slides = dynamicSplit(pVerses, sVerses, settings);
    
    // Update textareas with the "joined" view (all verses in one block per translation)
    const pText = pVerses.map(v => `${toSuperscript(v.verse)} ${v.text}`).join(' ');
    primaryTextarea.value = pText;
    setBiblePrimaryText(pText);

    if (secEnable.checked) {
      const sText = sVerses.map(v => `${toSuperscript(v.verse)} ${v.text}`).join(' ');
      secondaryTextarea.value = sText;
      setBibleSecondaryText(sText);
    }

    setBiblePrimaryVerses(pVerses);
    setBibleSecondaryVerses(sVerses);
    setSlides(slides);
  });

  let lastSettings = JSON.stringify(state.settings);
  subscribe((newState) => {
    const currentSettings = JSON.stringify(newState.settings);
    if (newState.mode === 'bible' && newState.biblePrimaryVerses.length > 0 && currentSettings !== lastSettings) {
      lastSettings = currentSettings;
      reSplitBible();
    } else {
      lastSettings = currentSettings;
    }
  });
}

export function reSplitBible() {
  if (state.mode !== 'bible' || state.biblePrimaryVerses.length === 0) return;
  const slides = dynamicSplit(state.biblePrimaryVerses, state.bibleSecondaryVerses, state.settings);
  setSlides(slides);
}

function parseReference(refStr) {
  // Simple parser for "Book Chapter:Verse" or "Book Chapter:Start-End"
  const regex = /^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/;
  const match = refStr.match(regex);
  if (!match) return null;

  let book = match[1].toLowerCase().trim();
  // Map full name to abbreviation if exists
  if (bookMap[book]) {
    book = bookMap[book];
  } else {
    // Check if it's already a valid 3-letter abbreviation by searching keys/values
    const values = Object.values(bookMap);
    if (!values.includes(book.toUpperCase())) {
      // Try to find by partial match or just uppercase if unknown
      book = book.toUpperCase();
    } else {
      book = book.toUpperCase();
    }
  }

  return {
    book: book,
    chapter: parseInt(match[2]),
    startVerse: parseInt(match[3]),
    endVerse: match[4] ? parseInt(match[4]) : parseInt(match[3])
  };
}

function fetchVerses(ref, version) {
  console.log('Fetching verses:', ref, version);
  const stmt = db.prepare('SELECT text, verse FROM verses WHERE book = :book AND chapter = :chapter AND verse >= :start AND verse <= :end AND version = :version ORDER BY verse ASC');
  stmt.bind({
    ':book': ref.book,
    ':chapter': ref.chapter,
    ':start': ref.startVerse,
    ':end': ref.endVerse,
    ':version': version
  });

  const verses = [];
  while (stmt.step()) {
    verses.push(stmt.getAsObject());
  }
  stmt.free();
  console.log(`Found ${verses.length} verses`);
  return verses;
}

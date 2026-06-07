import initSqlJs from 'sql.js';
import { 
  state, 
  setMode, 
  setBibleSelectedBook,
  setBiblePrimaryText, 
  setBibleSecondaryText, 
  setBiblePrimaryVerses,
  setBibleSecondaryVerses,
  setBiblePrimaryReference,
  setBibleSecondaryReference,
  setSlides,
  subscribe,
  updateSettings,
  addSavedVerse,
  removeSavedVerse
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
  'jude': 'JUD', 'revelation': 'REV',
  // Chinese names mapping
  '创世记': 'GEN', '出埃及记': 'EXO', '利未记': 'LEV', '民数记': 'NUM', '申命记': 'DEU',
  '约书亚记': 'JOS', '士师记': 'JDG', '路得记': 'RUT', '撒母耳记上': '1SA', '撒母耳记下': '2SA',
  '列王纪上': '1KI', '列王纪下': '2KI', '历代志上': '1CH', '历代志下': '2CH', '以斯拉记': 'EZR',
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

  const bookNamesMap = {
  'GEN': { en: 'Genesis', zh: '创世记', pinyin: 'csj' },
  'EXO': { en: 'Exodus', zh: '出埃及记', pinyin: 'cajj' },
  'LEV': { en: 'Leviticus', zh: '利未记', pinyin: 'lwj' },
  'NUM': { en: 'Numbers', zh: '民数记', pinyin: 'msj' },
  'DEU': { en: 'Deuteronomy', zh: '申命记', pinyin: 'smj' },
  'JOS': { en: 'Joshua', zh: '约书亚记', pinyin: 'ysyj' },
  'JDG': { en: 'Judges', zh: '士师记', pinyin: 'ssj' },
  'RUT': { en: 'Ruth', zh: '路得记', pinyin: 'ldj' },
  '1SA': { en: '1 Samuel', zh: '撒母耳记上', pinyin: 'smejs' },
  '2SA': { en: '2 Samuel', zh: '撒母耳记下', pinyin: 'smejx' },
  '1KI': { en: '1 Kings', zh: '列王纪上', pinyin: 'lwjs' },
  '2KI': { en: '2 Kings', zh: '列王纪下', pinyin: 'lwjx' },
  '1CH': { en: '1 Chronicles', zh: '历代志上', pinyin: 'ldzs' },
  '2CH': { en: '2 Chronicles', zh: '历代志下', pinyin: 'ldzx' },
  'EZR': { en: 'Ezra', zh: '以斯拉记', pinyin: 'yslj' },
  'NEH': { en: 'Nehemiah', zh: '尼希米记', pinyin: 'nxmj' },
  'EST': { en: 'Esther', zh: '以斯帖记', pinyin: 'ystj' },
  'JOB': { en: 'Job', zh: '约伯记', pinyin: 'ybj' },
  'PSA': { en: 'Psalms', zh: '诗篇', pinyin: 'sp' },
  'PRO': { en: 'Proverbs', zh: '箴言', pinyin: 'zy' },
  'ECC': { en: 'Ecclesiastes', zh: '传道书', pinyin: 'cds' },
  'SNG': { en: 'Song of Solomon', zh: '雅歌', pinyin: 'yg' },
  'ISA': { en: 'Isaiah', zh: '以赛亚书', pinyin: 'ysys' },
  'JER': { en: 'Jeremiah', zh: '耶利米书', pinyin: 'ylms' },
  'LAM': { en: 'Lamentations', zh: '耶利米哀歌', pinyin: 'ylmag' },
  'EZK': { en: 'Ezekiel', zh: '以西结书', pinyin: 'yxjs' },
  'DAN': { en: 'Daniel', zh: '但以理书', pinyin: 'dyls' },
  'HOS': { en: 'Hosea', zh: '何西阿书', pinyin: 'hxas' },
  'JOL': { en: 'Joel', zh: '约珥书', pinyin: 'yes' },
  'AMO': { en: 'Amos', zh: '阿摩司书', pinyin: 'ams' },
  'OBA': { en: 'Obadiah', zh: '俄巴底亚书', pinyin: 'ebdys' },
  'JON': { en: 'Jonah', zh: '约拿书', pinyin: 'yns' },
  'MIC': { en: 'Micah', zh: '弥迦书', pinyin: 'mjs' },
  'NAM': { en: 'Nahum', zh: '那鸿书', pinyin: 'nhs' },
  'HAB': { en: 'Habakkuk', zh: '哈巴谷书', pinyin: 'hbgs' },
  'ZEP': { en: 'Zephaniah', zh: '西番雅书', pinyin: 'xfys' },
  'HAG': { en: 'Haggai', zh: '哈该书', pinyin: 'hgs' },
  'ZEC': { en: 'Zechariah', zh: '撒迦利亚书', pinyin: 'sjlys' },
  'MAL': { en: 'Malachi', zh: '玛拉基书', pinyin: 'mljs' },
  'MAT': { en: 'Matthew', zh: '马太福音', pinyin: 'mtfy' },
  'MRK': { en: 'Mark', zh: '马可福音', pinyin: 'mkfy' },
  'LUK': { en: 'Luke', zh: '路加福音', pinyin: 'ljfy' },
  'JHN': { en: 'John', zh: '约翰福音', pinyin: 'yhfy' },
  'ACT': { en: 'Acts', zh: '使徒行传', pinyin: 'stxz' },
  'ROM': { en: 'Romans', zh: '罗马书', pinyin: 'lms' },
  '1CO': { en: '1 Corinthians', zh: '哥林多前书', pinyin: 'gldqs' },
  '2CO': { en: '2 Corinthians', zh: '哥林多后书', pinyin: 'gldhs' },
  'GAL': { en: 'Galatians', zh: '加拉太书', pinyin: 'jlts' },
  'EPH': { en: 'Ephesians', zh: '以弗所书', pinyin: 'yfss' },
  'PHP': { en: 'Philippians', zh: '腓立比书', pinyin: 'flbs' },
  'COL': { en: 'Colossians', zh: '歌罗西书', pinyin: 'glxs' },
  '1TH': { en: '1 Thessalonians', zh: '帖撒罗尼迦前书', pinyin: 'tslnjqs' },
  '2TH': { en: '2 Thessalonians', zh: '帖撒罗尼迦后书', pinyin: 'tslnjhs' },
  '1TI': { en: '1 Timothy', zh: '提摩太前书', pinyin: 'tmtqs' },
  '2TI': { en: '2 Timothy', zh: '提摩太后书', pinyin: 'tmths' },
  'TIT': { en: 'Titus', zh: '提多书', pinyin: 'tds' },
  'PHM': { en: 'Philemon', zh: '腓利门书', pinyin: 'flms' },
  'HEB': { en: 'Hebrews', zh: '希伯来书', pinyin: 'xbls' },
  'JAS': { en: 'James', zh: '雅各书', pinyin: 'ygs' },
  '1PE': { en: '1 Peter', zh: '彼得前书', pinyin: 'bdqs' },
  '2PE': { en: '2 Peter', zh: '彼得后书', pinyin: 'bdhs' },
  '1JN': { en: '1 John', zh: '约翰一书', pinyin: 'yhys' },
  '2JN': { en: '2 John', zh: '约翰二书', pinyin: 'yhes' },
  '3JN': { en: '3 John', zh: '约翰三书', pinyin: 'yhss' },
  'JUD': { en: 'Jude', zh: '犹大书', pinyin: 'yds' },
  'REV': { en: 'Revelation', zh: '启示录', pinyin: 'qsl' }
  };

const otBooks = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
];

export function toSuperscript(numStr) {
  return String(numStr).split('').map(c => superscriptMap[c] || c).join('');
}

export function matchBook(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  const results = [];

  Object.entries(bookNamesMap).forEach(([code, names]) => {
    if (
      code.toLowerCase() === q ||
      names.en.toLowerCase().startsWith(q) ||
      names.zh.startsWith(q) ||
      names.pinyin.startsWith(q)
    ) {
      results.push({ code, ...names });
    }
  });

  return results;
}

export function parseSmartInput(input) {
  if (!input) return { bookQuery: '', reference: '' };
  const val = input.trim();
  const match = val.match(/^(.+?)\s+(\d.*)$/);
  if (match) {
    return { bookQuery: match[1].trim(), reference: match[2].trim() };
  }
  return { bookQuery: '', reference: val };
}

export function showInputError(element) {
  if (!element) return;
  element.style.border = '1px solid red';
  setTimeout(() => element.style.border = '', 1000);
}

export async function initBible() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `./${file}`
    });

    const response = await fetch('./bible.db');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));
  } catch (err) {
    console.error('Failed to load Bible database:', err);
  }

  // UI Setup
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

  function getFormattedBookName(code, names) {
    if (!names) names = bookNamesMap[code];
    if (!names) return '';
    
    const pVersion = primaryTrans.value;
    const sVersion = secEnable.checked ? secTrans.value : null;

    const pName = pVersion === 'CUNPSS-神' ? names.zh : names.en;
    let sName = '';
    
    if (sVersion) {
      sName = sVersion === 'CUNPSS-神' ? names.zh : names.en;
    }

    if (sName && sName !== pName) {
      return `${pName}(${sName})`;
    }
    return pName;
  }

  function updateSlidesFromMode() {
    if (state.mode === 'lyrics') {
      setSlides(parseLyrics(state.primaryLyrics, state.secondaryLyrics));
    } else {
      setSlides(parseLyrics(state.biblePrimaryText, state.bibleSecondaryText));
    }
  }

  function populateGrids() {
    otGrid.innerHTML = '';
    ntGrid.innerHTML = '';
    
    Object.entries(bookNamesMap).forEach(([code, names]) => {
      const btn = document.createElement('button');
      btn.className = 'book-btn';
      if (state.bibleSelectedBook === code) btn.classList.add('active');
      
      btn.innerHTML = `
        <span class="zh">${names.zh}</span>
        <span class="en">${names.en}</span>
      `;
      
      btn.onclick = (e) => {
        e.preventDefault(); // Prevent any default behavior
        setBibleSelectedBook(code);
        pickerDialog.close();
        smartInput.value = `${getFormattedBookName(code, names)} `;
        smartInput.focus();
      };
      
      if (otBooks.includes(code)) {
        otGrid.appendChild(btn);
      } else {
        ntGrid.appendChild(btn);
      }
    });
  }

  function renderSavedVerses() {
    if (!savedVersesGrid) return;
    savedVersesGrid.innerHTML = '';

    state.savedVerses.forEach(v => {
      const bookNames = bookNamesMap[v.book];
      const card = document.createElement('div');
      card.className = 'verse-card';
      
      const versions = v.sEnabled ? `${v.pVersion} / ${v.sVersion}` : v.pVersion;
      
      card.innerHTML = `
        <div class="info">
          <div class="ref">${bookNames.zh} ${v.reference}</div>
          <div class="version">${versions}</div>
        </div>
        <button class="delete-card-btn" title="Remove">&times;</button>
      `;

      card.onclick = (e) => {
        if (e.target.classList.contains('delete-card-btn')) {
          removeSavedVerse(v.id);
          return;
        }
        
        // Load saved verse
        setBibleSelectedBook(v.book);
        const bookNames = bookNamesMap[v.book];
        primaryTrans.value = v.pVersion;
        secTrans.value = v.sVersion;
        secEnable.checked = v.sEnabled;
        
        // Update UI state for secondary translation
        secTrans.disabled = !v.sEnabled;
        if (!v.sEnabled) {
          secGroup.style.opacity = '0.4';
          secGroup.style.pointerEvents = 'none';
        } else {
          secGroup.style.opacity = '1';
          secGroup.style.pointerEvents = 'auto';
        }

        if (smartInput) {
          smartInput.value = `${getFormattedBookName(v.book, bookNames)} ${v.reference}`;
        }

        executeFetch();
      };

      savedVersesGrid.appendChild(card);
    });
  }

  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    executeFetch();
  });

  pickerBtn.addEventListener('click', () => {
    populateGrids();
    document.getElementById('bible-picker-dialog').showModal();
  });

  closePickerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    pickerDialog.close();
  });

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const bookCode = state.bibleSelectedBook;
    let reference = '';
    if (smartInput) {
      const { reference: parsedRef } = parseSmartInput(smartInput.value);
      reference = parsedRef;
    }
    
    if (!reference) return;

    const verse = {
      id: Date.now(),
      book: bookCode,
      reference,
      pVersion: primaryTrans.value,
      sVersion: secTrans.value,
      sEnabled: secEnable.checked
    };

    addSavedVerse(verse);
  });

  smartInput.addEventListener('input', (e) => {
    const val = e.target.value;
    const bookPartMatch = val.match(/^([a-zA-Z\u4e00-\u9fa50-9\s]+?)(?:\s\d|$)/);
    const hasChapter = /\s\d/.test(val);

    if (bookPartMatch && !hasChapter) {
      const query = bookPartMatch[1].trim();
      currentMatches = matchBook(query).slice(0, 5); // top 5
      
      if (currentMatches.length > 0) {
        autocompleteDropdown.innerHTML = currentMatches.map((m, i) => `
          <div class="autocomplete-item" data-index="${i}" style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--border-color); ${i === highlightedIndex ? 'background: var(--bg-hover);' : ''}">
            ${m.en} (${m.zh})
          </div>
        `).join('');
        autocompleteDropdown.style.display = 'block';
      } else {
        autocompleteDropdown.style.display = 'none';
      }
    } else {
      autocompleteDropdown.style.display = 'none';
    }
  });

  smartInput.addEventListener('keydown', (e) => {
    if (autocompleteDropdown.style.display === 'block') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, currentMatches.length - 1);
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        updateHighlight();
      } else if ((e.key === 'Enter' || e.key === 'Tab') && highlightedIndex >= 0) {
        e.preventDefault();
        selectMatch(currentMatches[highlightedIndex]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeFetch();
    }
  });

  function updateHighlight() {
    Array.from(autocompleteDropdown.children).forEach((el, i) => {
      el.style.background = i === highlightedIndex ? 'var(--bg-hover, #333)' : 'transparent';
    });
  }

  function selectMatch(match) {
    setBibleSelectedBook(match.code);
    smartInput.value = `${getFormattedBookName(match.code, match)} `;
    autocompleteDropdown.style.display = 'none';
    highlightedIndex = -1;
    smartInput.focus();
  }

  document.addEventListener('click', (e) => {
    if (!smartInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
      autocompleteDropdown.style.display = 'none';
      highlightedIndex = -1;
    }
  });

  autocompleteDropdown.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.autocomplete-item');
    if (item) {
      const idx = parseInt(item.dataset.index, 10);
      selectMatch(currentMatches[idx]);
    }
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

  function executeFetch() {
    const val = smartInput.value;
    const { bookQuery, reference: cvStr } = parseSmartInput(val);
    
    let bookCode = state.bibleSelectedBook;

    if (bookQuery) {
       // Clean the bookQuery to ignore anything in parentheses for matching
       const cleanQuery = bookQuery.replace(/\s*\(.*?\)\s*/, '').trim();
       const possibleBooks = matchBook(cleanQuery);
       if (possibleBooks.length > 0) {
         bookCode = possibleBooks[0].code;
         setBibleSelectedBook(bookCode);
       } else {
         // explicit visual feedback for book not found
         showInputError(smartInput);
         return;
       }
    }

    if (!cvStr || !db) return;

    const ref = parseReference(bookCode, cvStr);
    if (!ref) {
      // visual feedback
      showInputError(smartInput);
      return;
    }

    const bookNames = bookNamesMap[ref.book];
    let range = '';
    if (ref.chapter) {
      range = ` ${ref.chapter}`;
      if (ref.startVerse) {
        range += `:${ref.startVerse}${ref.endVerse !== ref.startVerse ? '-' + ref.endVerse : ''}`;
      }
    }

    const pVersion = document.getElementById('bible-translation-primary').value;
    const pVerses = fetchVerses(ref, pVersion);
    
    let sVerses = [];
    let sVersion = '';
    if (secEnable.checked) {
      sVersion = secTrans.value;
      sVerses = fetchVerses(ref, sVersion);
    }

    const pRef = `${pVersion === 'CUNPSS-神' ? bookNames.zh : bookNames.en}${range}`;
    let sRef = '';
    if (secEnable.checked) {
      sRef = `${sVersion === 'CUNPSS-神' ? bookNames.zh : bookNames.en}${range}`;
    }

    // Replace old slide generation with dynamicSplit
    const settings = state.settings;
    const slides = dynamicSplit(pVerses, sVerses, settings, pRef, sRef);
    
    // Update textareas from the generated slides to preserve breaks
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

  let lastSettings = JSON.stringify(state.settings);
  subscribe((newState) => {
    const currentSettings = JSON.stringify(newState.settings);
    if (newState.mode === 'bible' && newState.biblePrimaryVerses.length > 0 && currentSettings !== lastSettings) {
      lastSettings = currentSettings;
      reSplitBible();
    } else {
      lastSettings = currentSettings;
    }
    renderSavedVerses();
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

    // Handle secondary enable
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
  renderSavedVerses();
}

export function reSplitBible() {
  if (state.mode !== 'bible' || state.biblePrimaryVerses.length === 0) return;
  const slides = dynamicSplit(
    state.biblePrimaryVerses, 
    state.bibleSecondaryVerses, 
    state.settings,
    state.biblePrimaryReference,
    state.bibleSecondaryReference
  );
  setSlides(slides);
}

export function parseReference(bookCode, cvStr) {
  if (!cvStr || !cvStr.trim()) {
    return null; // Require at least a chapter
  }

  // Handle "Chapter" or "Chapter:Verse" or "Chapter:Start-End"
  const regex = /^(\d+)(?::(\d+)(?:-(\d+))?)?$/;
  const match = cvStr.trim().match(regex);
  if (!match) return null;

  const chapter = parseInt(match[1]);
  const startVerse = match[2] ? parseInt(match[2]) : null;
  const endVerse = match[3] ? parseInt(match[3]) : startVerse;

  return {
    book: bookCode,
    chapter,
    startVerse,
    endVerse
  };
}

function fetchVerses(ref, version) {
  let sql = 'SELECT text, verse, chapter FROM verses WHERE book = :book AND version = :version';
  const params = { ':book': ref.book, ':version': version };

  if (ref.chapter) {
    sql += ' AND chapter = :chapter';
    params[':chapter'] = ref.chapter;
  }
  if (ref.startVerse) {
    sql += ' AND verse >= :start AND verse <= :end';
    params[':start'] = ref.startVerse;
    params[':end'] = ref.endVerse;
  }
  sql += ' ORDER BY chapter ASC, verse ASC';

  const stmt = db.prepare(sql);
  stmt.bind(params);

  const verses = [];
  while (stmt.step()) {
    verses.push(stmt.getAsObject());
  }
  stmt.free();
  return verses;
}

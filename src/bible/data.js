export const SUPERSCRIPT_MAP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};

export const BOOK_NAMES_MAP = {
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

export const OT_BOOKS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
];

export function toSuperscript(numStr) {
  return String(numStr).split('').map(c => SUPERSCRIPT_MAP[c] || c).join('');
}

export function matchBook(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  const results = [];
  Object.entries(BOOK_NAMES_MAP).forEach(([code, names]) => {
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

export function parseReference(bookCode, cvStr) {
  if (!cvStr || !cvStr.trim()) return null;
  const regex = /^(\d+)(?::(\d+)(?:-(\d+))?)?$/;
  const match = cvStr.trim().match(regex);
  if (!match) return null;
  const chapter = parseInt(match[1]);
  const startVerse = match[2] ? parseInt(match[2]) : null;
  const endVerse = match[3] ? parseInt(match[3]) : startVerse;
  return { book: bookCode, chapter, startVerse, endVerse };
}

// Pure refactor of getFormattedBookName: takes versions as args instead of reading the DOM.
export function formatBookName(names, pVersion, sVersion) {
  if (!names) return '';
  const pName = pVersion === 'CUNPSS-神' ? names.zh : names.en;
  let sName = '';
  if (sVersion) {
    sName = sVersion === 'CUNPSS-神' ? names.zh : names.en;
  }
  if (sName && sName !== pName) return `${pName}(${sName})`;
  return pName;
}

export function isOldTestament(code) {
  return OT_BOOKS.includes(code);
}

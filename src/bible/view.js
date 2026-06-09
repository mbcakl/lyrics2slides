import { BOOK_NAMES_MAP, isOldTestament } from './data.js';

export function renderBookGrid(otGrid, ntGrid, { selectedBook, onSelect }) {
  otGrid.innerHTML = '';
  ntGrid.innerHTML = '';
  Object.entries(BOOK_NAMES_MAP).forEach(([code, names]) => {
    const btn = document.createElement('button');
    btn.className = 'book-btn';
    if (selectedBook === code) btn.classList.add('active');

    const zh = document.createElement('span');
    zh.className = 'zh';
    zh.textContent = names.zh;
    const en = document.createElement('span');
    en.className = 'en';
    en.textContent = names.en;
    btn.append(zh, en);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      onSelect(code);
    });

    (isOldTestament(code) ? otGrid : ntGrid).appendChild(btn);
  });
}

export function renderSavedVerses(grid, savedVerses, { onLoad, onDelete }) {
  if (!grid) return;
  grid.innerHTML = '';
  savedVerses.forEach(v => {
    const bookNames = BOOK_NAMES_MAP[v.book];

    const card = document.createElement('div');
    card.className = 'verse-card';

    const info = document.createElement('div');
    info.className = 'info';
    const ref = document.createElement('div');
    ref.className = 'ref';
    ref.textContent = `${bookNames.zh} ${v.reference}`;
    const version = document.createElement('div');
    version.className = 'version';
    version.textContent = v.sEnabled ? `${v.pVersion} / ${v.sVersion}` : v.pVersion;
    info.append(ref, version);

    const del = document.createElement('button');
    del.className = 'delete-card-btn';
    del.title = 'Remove';
    del.textContent = '×';

    card.append(info, del);

    del.addEventListener('click', (e) => {
      e.stopPropagation();
      onDelete(v.id);
    });
    card.addEventListener('click', () => onLoad(v));

    grid.appendChild(card);
  });
}

export function renderAutocomplete(dropdown, matches, highlightedIndex) {
  dropdown.innerHTML = '';
  if (!matches || matches.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  matches.forEach((m, i) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.dataset.index = i;
    if (i === highlightedIndex) item.classList.add('highlighted');
    item.textContent = `${m.en} (${m.zh})`;
    dropdown.appendChild(item);
  });
  dropdown.style.display = 'block';
}

export function showInputError(element) {
  if (!element) return;
  element.style.border = '1px solid red';
  setTimeout(() => { element.style.border = ''; }, 1000);
}

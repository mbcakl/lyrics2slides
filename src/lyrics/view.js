import { parseLyrics } from '../parser.js';

/**
 * Derive a song title from its lyrics: the first non-empty line of the primary text.
 *
 * @param {string} primaryLyrics - Raw primary lyrics text
 * @returns {string} Trimmed title, or '' when there is nothing to title
 */
export function deriveTitle(primaryLyrics) {
  if (!primaryLyrics) return '';
  const firstLine = primaryLyrics.split('\n').find(line => line.trim().length > 0);
  return firstLine ? firstLine.trim() : '';
}

export function renderSavedLyrics(grid, savedLyrics, { onLoad, onDelete }) {
  if (!grid) return;
  grid.innerHTML = '';
  savedLyrics.forEach(song => {
    const card = document.createElement('div');
    card.className = 'song-card';

    const info = document.createElement('div');
    info.className = 'info';
    const title = document.createElement('div');
    title.className = 'ref';
    title.textContent = song.title;

    const slideCount = parseLyrics(song.primary, song.secondary).length;
    const meta = document.createElement('div');
    meta.className = 'version';
    meta.textContent = `${slideCount} ${slideCount === 1 ? 'slide' : 'slides'}`;
    if (song.secondary && song.secondary.trim()) meta.textContent += ' · dual';
    info.append(title, meta);

    const del = document.createElement('button');
    del.className = 'delete-card-btn';
    del.title = 'Remove';
    del.textContent = '×';

    card.append(info, del);

    del.addEventListener('click', (e) => {
      e.stopPropagation();
      onDelete(song.id);
    });
    card.addEventListener('click', () => onLoad(song));

    grid.appendChild(card);
  });
}

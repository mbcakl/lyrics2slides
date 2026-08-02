import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deriveTitle, renderSavedLyrics } from './view.js';

describe('deriveTitle', () => {
  it('takes the first non-empty line, trimmed', () => {
    expect(deriveTitle('  Amazing Grace  \nhow sweet the sound')).toBe('Amazing Grace');
  });

  it('skips leading blank lines', () => {
    expect(deriveTitle('\n\n   \nHoly Holy Holy\nLord God Almighty')).toBe('Holy Holy Holy');
  });

  it('returns empty string for empty or whitespace-only lyrics', () => {
    expect(deriveTitle('')).toBe('');
    expect(deriveTitle('   \n\n  ')).toBe('');
    expect(deriveTitle(undefined)).toBe('');
  });
});

describe('renderSavedLyrics', () => {
  const song = (over = {}) => ({
    id: 1,
    title: 'Amazing Grace',
    primary: 'Amazing grace\nhow sweet the sound\n\nT was grace that taught',
    secondary: '',
    settings: {},
    ...over
  });

  beforeEach(() => { document.body.innerHTML = '<div id="grid"></div>'; });

  it('renders a card per song with the title as TEXT, not HTML (no injection)', () => {
    const grid = document.getElementById('grid');
    renderSavedLyrics(grid, [song({ title: '<img src=x onerror=alert(1)>' })], { onLoad: () => {}, onDelete: () => {} });

    expect(grid.querySelectorAll('.song-card').length).toBe(1);
    expect(grid.querySelector('img')).toBeNull();
    expect(grid.querySelector('.ref').textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('shows the slide count, singularized, and flags dual-language songs', () => {
    const grid = document.getElementById('grid');
    renderSavedLyrics(grid, [
      song({ id: 1 }),
      song({ id: 2, primary: 'One section only' }),
      song({ id: 3, secondary: 'Cómo suena' })
    ], { onLoad: () => {}, onDelete: () => {} });

    const metas = [...grid.querySelectorAll('.version')].map(el => el.textContent);
    expect(metas).toEqual(['2 slides', '1 slide', '2 slides · dual']);
  });

  it('clears previously rendered cards on re-render', () => {
    const grid = document.getElementById('grid');
    const handlers = { onLoad: () => {}, onDelete: () => {} };
    renderSavedLyrics(grid, [song({ id: 1 }), song({ id: 2, title: 'Other' })], handlers);
    renderSavedLyrics(grid, [song({ id: 1 })], handlers);

    expect(grid.querySelectorAll('.song-card').length).toBe(1);
  });

  it('fires onDelete (not onLoad) when the delete button is clicked', () => {
    const grid = document.getElementById('grid');
    const onLoad = vi.fn(); const onDelete = vi.fn();
    renderSavedLyrics(grid, [song({ id: 7 })], { onLoad, onDelete });

    grid.querySelector('.delete-card-btn').click();

    expect(onDelete).toHaveBeenCalledWith(7);
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('fires onLoad with the song when the card body is clicked', () => {
    const grid = document.getElementById('grid');
    const onLoad = vi.fn();
    const s = song({ id: 7 });
    renderSavedLyrics(grid, [s], { onLoad, onDelete: () => {} });

    grid.querySelector('.song-card').click();

    expect(onLoad).toHaveBeenCalledWith(s);
  });

  it('is a no-op when the grid is missing', () => {
    expect(() => renderSavedLyrics(null, [song()], { onLoad: () => {}, onDelete: () => {} })).not.toThrow();
  });
});

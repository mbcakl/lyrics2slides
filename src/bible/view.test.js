import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderBookGrid, renderSavedVerses, renderAutocomplete } from './view.js';

describe('renderBookGrid', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ot"></div><div id="nt"></div>';
  });
  it('routes OT and NT books into their grids and fires onSelect', () => {
    const ot = document.getElementById('ot');
    const nt = document.getElementById('nt');
    const onSelect = vi.fn();
    renderBookGrid(ot, nt, { selectedBook: 'GEN', onSelect });
    expect(ot.children.length).toBe(39);
    expect(nt.children.length).toBe(27);
    expect(ot.querySelector('.book-btn.active')).toBeTruthy();
    ot.querySelector('.book-btn').click();
    expect(onSelect).toHaveBeenCalledWith('GEN');
  });
});

describe('renderSavedVerses', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="grid"></div>'; });

  it('renders user-typed reference as TEXT, not HTML (no injection)', () => {
    const grid = document.getElementById('grid');
    renderSavedVerses(grid, [
      { id: 1, book: 'GEN', reference: '<img src=x onerror=alert(1)>', pVersion: 'NIV', sEnabled: false }
    ], { onLoad: () => {}, onDelete: () => {} });
    expect(grid.querySelector('img')).toBeNull();
    expect(grid.querySelector('.ref').textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('fires onDelete (not onLoad) when the delete button is clicked', () => {
    const grid = document.getElementById('grid');
    const onLoad = vi.fn(); const onDelete = vi.fn();
    renderSavedVerses(grid, [{ id: 7, book: 'GEN', reference: '1:1', pVersion: 'NIV', sEnabled: false }], { onLoad, onDelete });
    grid.querySelector('.delete-card-btn').click();
    expect(onDelete).toHaveBeenCalledWith(7);
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('fires onLoad when the card body is clicked', () => {
    const grid = document.getElementById('grid');
    const onLoad = vi.fn();
    const v = { id: 7, book: 'GEN', reference: '1:1', pVersion: 'NIV', sEnabled: false };
    renderSavedVerses(grid, [v], { onLoad, onDelete: () => {} });
    grid.querySelector('.verse-card').click();
    expect(onLoad).toHaveBeenCalledWith(v);
  });
});

describe('renderAutocomplete', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="dd"></div>'; });
  it('renders one item per match with text content and a highlight class', () => {
    const dd = document.getElementById('dd');
    renderAutocomplete(dd, [{ code: 'GEN', en: 'Genesis', zh: '创世记' }], 0);
    expect(dd.children.length).toBe(1);
    expect(dd.children[0].textContent).toBe('Genesis (创世记)');
    expect(dd.children[0].classList.contains('highlighted')).toBe(true);
    expect(dd.style.display).toBe('block');
  });
  it('hides the dropdown when there are no matches', () => {
    const dd = document.getElementById('dd');
    renderAutocomplete(dd, [], -1);
    expect(dd.children.length).toBe(0);
    expect(dd.style.display).toBe('none');
  });
});

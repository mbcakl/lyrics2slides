import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initBible } from './index.js';
import { state } from '../state.js';

const prepareSpy = vi.fn().mockReturnValue({
  bind: vi.fn(), step: vi.fn().mockReturnValue(false), getAsObject: vi.fn(), free: vi.fn()
});
vi.mock('sql.js', () => ({
  default: vi.fn().mockResolvedValue({
    Database: class { constructor() {} prepare(...a) { return prepareSpy(...a); } close() {} }
  })
}));
global.fetch = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)) });

const DOM = `
  <button id="tab-lyrics"></button>
  <button id="tab-bible"></button>
  <div id="lyrics-container"></div>
  <div id="bible-container">
    <input id="bible-smart-input" value="">
    <button id="bible-search-btn"></button>
    <button id="bible-book-picker-btn"></button>
    <div id="bible-autocomplete-dropdown"></div>
    <button id="save-bible-btn"></button>
    <select id="bible-translation-primary">
      <option value="CUNPSS-神">CUNPSS</option><option value="NIV">NIV</option>
    </select>
    <input type="checkbox" id="bible-secondary-enable">
    <select id="bible-translation-secondary">
      <option value="NIV">NIV</option><option value="CUNPSS-神">CUNPSS</option>
    </select>
    <div id="saved-verses-grid"></div>
    <div id="bible-secondary-group"></div>
    <textarea id="bible-primary-text"></textarea>
    <textarea id="bible-secondary-text"></textarea>
  </div>
  <dialog id="bible-picker-dialog"><div id="ot-grid"></div><div id="nt-grid"></div><button id="close-picker-btn"></button></dialog>
  <div id="measure-box"><div class="primary-measure"></div><div class="secondary-measure"></div></div>
`;

describe('Bible controller', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    state.savedVerses = [];
    state.mode = 'bible';
  });

  it('renders saved verses from state on init', async () => {
    state.savedVerses = [{ id: 1, book: 'GEN', reference: '1:1', pVersion: 'CUNPSS-神', sEnabled: false }];
    await initBible();
    const grid = document.getElementById('saved-verses-grid');
    expect(grid.children.length).toBe(1);
    expect(grid.textContent).toContain('创世记');
    expect(grid.textContent).toContain('1:1');
  });

  it('adds a verse to state when save is clicked', async () => {
    await initBible();
    state.bibleSelectedBook = 'GEN';
    document.getElementById('bible-smart-input').value = 'GEN 3:16';
    document.getElementById('save-bible-btn').click();
    expect(state.savedVerses.length).toBe(1);
    expect(state.savedVerses[0].reference).toBe('3:16');
    expect(state.savedVerses[0].book).toBe('GEN');
  });

  it('removes a verse when delete is clicked', async () => {
    state.savedVerses = [{ id: 123, book: 'GEN', reference: '1:1', pVersion: 'CUNPSS-神', sEnabled: false }];
    await initBible();
    document.querySelector('#saved-verses-grid .delete-card-btn').click();
    expect(state.savedVerses.length).toBe(0);
  });

  it('loads a saved verse into inputs and fetches when its card is clicked', async () => {
    state.savedVerses = [{ id: 1, book: 'JHN', reference: '3:16', pVersion: 'NIV', sVersion: 'CUNPSS-神', sEnabled: true }];
    await initBible();
    document.querySelector('#saved-verses-grid .verse-card').click();
    expect(state.bibleSelectedBook).toBe('JHN');
    expect(document.getElementById('bible-smart-input').value).toContain('3:16');
    expect(document.getElementById('bible-translation-primary').value).toBe('NIV');
    expect(document.getElementById('bible-translation-secondary').value).toBe('CUNPSS-神');
    expect(document.getElementById('bible-secondary-enable').checked).toBe(true);
    expect(prepareSpy).toHaveBeenCalled();
  });

  it('surfaces a visible error and disables search when the DB fails to load', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await initBible();
    expect(document.querySelector('.bible-error')).toBeTruthy();
    expect(document.getElementById('bible-search-btn').disabled).toBe(true);
  });
});

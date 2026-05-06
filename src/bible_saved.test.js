import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initBible } from './bible.js';
import { state, addSavedVerse, removeSavedVerse } from './state.js';

// Mock sql.js
vi.mock('sql.js', () => ({
  default: vi.fn().mockResolvedValue({
    Database: vi.fn().mockImplementation(() => ({
      prepare: vi.fn(),
      close: vi.fn()
    }))
  })
}));

describe('Bible Saved Verses UI', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="tab-lyrics"></button>
      <button id="tab-bible"></button>
      <div id="lyrics-container"></div>
      <div id="bible-container">
        <button id="bible-book-btn"></button>
        <input id="bible-chapter-verse" value="">
        <button id="save-bible-btn"></button>
        <select id="bible-translation-primary">
          <option value="CUNPSS-神">CUNPSS</option>
          <option value="NIV">NIV</option>
        </select>
        <input type="checkbox" id="bible-secondary-enable">
        <select id="bible-translation-secondary">
          <option value="NIV">NIV</option>
          <option value="CUNPSS-神">CUNPSS</option>
        </select>
        <button id="fetch-bible-btn"></button>
        <div id="saved-verses-grid"></div>
        <div id="bible-secondary-group"></div>
        <textarea id="bible-primary-text"></textarea>
        <textarea id="bible-secondary-text"></textarea>
      </div>
      <dialog id="bible-picker-dialog">
        <div id="ot-grid"></div>
        <div id="nt-grid"></div>
        <button id="close-picker-btn"></button>
      </dialog>
    `;
    
    // Clear state
    state.savedVerses = [];
  });

  it('renders saved verses from state on init', async () => {
    state.savedVerses = [
      { id: 1, book: 'GEN', reference: '1:1', pVersion: 'CUNPSS-神', sEnabled: false }
    ];
    
    await initBible();
    
    const grid = document.getElementById('saved-verses-grid');
    expect(grid.children.length).toBe(1);
    expect(grid.innerHTML).toContain('创世记');
    expect(grid.innerHTML).toContain('1:1');
  });

  it('adds a verse to state when save button is clicked', async () => {
    await initBible();
    
    const input = document.getElementById('bible-chapter-verse');
    input.value = '3:16';
    
    const saveBtn = document.getElementById('save-bible-btn');
    saveBtn.click();
    
    expect(state.savedVerses.length).toBe(1);
    expect(state.savedVerses[0].reference).toBe('3:16');
    expect(state.savedVerses[0].book).toBe('GEN');
  });

  it('removes a verse when delete button is clicked', async () => {
    state.savedVerses = [
      { id: 123, book: 'GEN', reference: '1:1', pVersion: 'CUNPSS-神', sEnabled: false }
    ];
    
    await initBible();
    
    const grid = document.getElementById('saved-verses-grid');
    const deleteBtn = grid.querySelector('.delete-btn');
    deleteBtn.click();
    
    expect(state.savedVerses.length).toBe(0);
  });

  it('loads saved verse into inputs when card is clicked', async () => {
    state.savedVerses = [
      { id: 1, book: 'JHN', reference: '3:16', pVersion: 'NIV', sVersion: 'CUNPSS-神', sEnabled: true }
    ];
    
    await initBible();
    
    const grid = document.getElementById('saved-verses-grid');
    const card = grid.querySelector('.saved-verse-card');
    
    const fetchBtn = document.getElementById('fetch-bible-btn');
    const fetchSpy = vi.spyOn(fetchBtn, 'click');
    
    card.click();
    
    expect(state.bibleSelectedBook).toBe('JHN');
    expect(document.getElementById('bible-chapter-verse').value).toBe('3:16');
    expect(document.getElementById('bible-translation-primary').value).toBe('NIV');
    expect(document.getElementById('bible-translation-secondary').value).toBe('CUNPSS-神');
    expect(document.getElementById('bible-secondary-enable').checked).toBe(true);
    expect(fetchSpy).toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock BroadcastChannel
const mockPostMessage = vi.fn();
let mockOnMessage;

class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
  }
  postMessage = mockPostMessage;
  set onmessage(cb) {
    mockOnMessage = cb;
  }
  get onmessage() {
    return mockOnMessage;
  }
}

vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);

// Mock localStorage
const mockGetItem = vi.fn();
const mockSetItem = vi.fn();
vi.stubGlobal('localStorage', {
  getItem: mockGetItem,
  setItem: mockSetItem,
});

// Reset module state between tests
let stateModule;

describe('state module', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockPostMessage.mockClear();
    mockGetItem.mockReset();
    mockGetItem.mockReturnValue(null);
    mockSetItem.mockClear();
    stateModule = await import('./state.js');
  });

  describe('savedVerses', () => {
    it('initializes from localStorage if available', async () => {
      const saved = [{ id: 1, book: 'GEN', reference: '1:1' }];
      mockGetItem.mockReturnValue(JSON.stringify(saved));
      
      // We need to re-import to trigger the initialization with the mocked value
      vi.resetModules();
      stateModule = await import('./state.js');
      
      expect(stateModule.state.savedVerses).toEqual(saved);
      expect(mockGetItem).toHaveBeenCalledWith('lyrics2slides_saved_verses');
    });

    it('initializes with empty array if localStorage is empty', () => {
      // mockGetItem returns null by default in beforeEach
      expect(stateModule.state.savedVerses).toEqual([]);
    });

    it('addSavedVerse adds a verse, persists and notifies', () => {
      const listener = vi.fn();
      stateModule.subscribe(listener);
      const verse = { id: 1, book: 'GEN', reference: '1:1', pVersion: 'NIV', sVersion: 'KJV', sEnabled: true };
      
      stateModule.addSavedVerse(verse);
      
      expect(stateModule.state.savedVerses).toContainEqual(verse);
      expect(mockSetItem).toHaveBeenCalledWith('lyrics2slides_saved_verses', JSON.stringify([verse]));
      expect(listener).toHaveBeenCalled();
    });

    it('addSavedVerse prevents duplicates', () => {
      const verse = { id: 1, book: 'GEN', reference: '1:1', pVersion: 'NIV', sVersion: 'KJV', sEnabled: true };
      stateModule.addSavedVerse(verse);
      mockSetItem.mockClear();
      
      // Try adding same verse again
      stateModule.addSavedVerse(verse);
      
      expect(stateModule.state.savedVerses).toHaveLength(1);
      expect(mockSetItem).not.toHaveBeenCalled();
    });

    it('addSavedVerse produces a new array reference', () => {
      stateModule.state.savedVerses = [];
      const before = stateModule.state.savedVerses;
      stateModule.addSavedVerse({ id: 1, book: 'GEN', reference: '1:1', pVersion: 'NIV', sVersion: 'NIV', sEnabled: false });
      expect(stateModule.state.savedVerses).not.toBe(before);
      expect(stateModule.state.savedVerses).toHaveLength(1);
    });

    it('removeSavedVerse removes a verse, persists and notifies', () => {
      const verse = { id: 1, book: 'GEN', reference: '1:1' };
      stateModule.state.savedVerses = [verse];
      const listener = vi.fn();
      stateModule.subscribe(listener);
      
      stateModule.removeSavedVerse(1);
      
      expect(stateModule.state.savedVerses).not.toContainEqual(verse);
      expect(mockSetItem).toHaveBeenCalledWith('lyrics2slides_saved_verses', JSON.stringify([]));
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('setPrimaryLyrics', () => {
    it('updates primary lyrics and notifies', () => {
      const listener = vi.fn();
      stateModule.subscribe(listener);

      stateModule.setPrimaryLyrics('Test lyrics');

      expect(stateModule.state.primaryLyrics).toBe('Test lyrics');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SYNC_STATE',
        state: stateModule.state
      });
    });
  });

  describe('setSecondaryLyrics', () => {
    it('updates secondary lyrics and notifies', () => {
      const listener = vi.fn();
      stateModule.subscribe(listener);

      stateModule.setSecondaryLyrics('Secondary text');

      expect(stateModule.state.secondaryLyrics).toBe('Secondary text');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SYNC_STATE',
        state: stateModule.state
      });
    });
  });

  describe('setSlides', () => {
    it('updates slides and clamps currentSlide', () => {
      stateModule.state.currentSlide = 5;

      stateModule.setSlides([{ id: 1 }, { id: 2 }]);

      expect(stateModule.state.slides).toHaveLength(2);
      expect(stateModule.state.currentSlide).toBe(1); // Clamped to max index
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SYNC_STATE',
        state: stateModule.state
      });
    });

    it('sets currentSlide to 0 for empty slides', () => {
      stateModule.setSlides([]);

      expect(stateModule.state.currentSlide).toBe(0);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      stateModule.setSlides([{ id: 1 }, { id: 2 }, { id: 3 }]);
      stateModule.setCurrentSlide(1);
      mockPostMessage.mockClear(); // Clear message from setSlides/setCurrentSlide
    });

    it('nextSlide increments within bounds', () => {
      stateModule.nextSlide();
      expect(stateModule.state.currentSlide).toBe(2);
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SYNC_STATE',
        state: stateModule.state
      });
    });

    it('nextSlide does not exceed max', () => {
      stateModule.setCurrentSlide(2);
      stateModule.nextSlide();
      expect(stateModule.state.currentSlide).toBe(2);
    });

    it('prevSlide decrements within bounds', () => {
      stateModule.prevSlide();
      expect(stateModule.state.currentSlide).toBe(0);
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SYNC_STATE',
        state: stateModule.state
      });
    });

    it('prevSlide does not go below 0', () => {
      stateModule.setCurrentSlide(0);
      stateModule.prevSlide();
      expect(stateModule.state.currentSlide).toBe(0);
    });
  });

  describe('broadcast synchronization', () => {
    beforeEach(() => {
      stateModule.setSlides([{ id: 1 }, { id: 2 }, { id: 3 }]);
      stateModule.setCurrentSlide(1);
      mockPostMessage.mockClear();
    });

    it('responds to REQUEST_STATE', () => {
      mockOnMessage({ data: { type: 'REQUEST_STATE' } });
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SYNC_STATE',
        state: stateModule.state
      });
    });

    it('responds to PREV_SLIDE', () => {
      mockOnMessage({ data: { type: 'PREV_SLIDE' } });
      expect(stateModule.state.currentSlide).toBe(0);
    });

    it('responds to NEXT_SLIDE', () => {
      mockOnMessage({ data: { type: 'NEXT_SLIDE' } });
      expect(stateModule.state.currentSlide).toBe(2);
    });
  });

  describe('subscribe', () => {
    it('returns unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = stateModule.subscribe(listener);

      stateModule.notify();
      expect(listener).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SYNC_STATE',
        state: stateModule.state
      });

      unsubscribe();
      stateModule.notify();
      expect(listener).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  describe('bible state', () => {
    it('updates mode and notifies', () => {
      const listener = vi.fn();
      stateModule.subscribe(listener);

      stateModule.setMode('bible');

      expect(stateModule.state.mode).toBe('bible');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('updates bible primary text and notifies', () => {
      const listener = vi.fn();
      stateModule.subscribe(listener);

      stateModule.setBiblePrimaryText('John 3:16');

      expect(stateModule.state.biblePrimaryText).toBe('John 3:16');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('updates bible secondary text and notifies', () => {
      const listener = vi.fn();
      stateModule.subscribe(listener);

      stateModule.setBibleSecondaryText('CUNPSS text');

      expect(stateModule.state.bibleSecondaryText).toBe('CUNPSS text');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('updates bible-specific settings', () => {
      stateModule.updateSettings({
        bibleFontFamilyPrimary: 'Arial'
      });

      expect(stateModule.state.settings.bibleFontFamilyPrimary).toBe('Arial');
    });

    it('has default bibleSelectedBook as GEN', () => {
      expect(stateModule.state.bibleSelectedBook).toBe('GEN');
    });

    it('updates bibleSelectedBook and notifies', () => {
      const listener = vi.fn();
      stateModule.subscribe(listener);

      stateModule.setBibleSelectedBook('JHN');

      expect(stateModule.state.bibleSelectedBook).toBe('JHN');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('has bibleSecondaryEnable default false', () => {
      expect(stateModule.state.settings.bibleSecondaryEnable).toBe(false);
    });
  });

  describe('persistence', () => {
    it('initializes mode from localStorage with default bible', async () => {
      mockGetItem.mockReturnValue(null);
      vi.resetModules();
      stateModule = await import('./state.js');
      expect(stateModule.state.mode).toBe('bible');

      mockGetItem.mockImplementation((key) => {
        if (key === 'lyrics2slides_mode') return 'lyrics';
        return null;
      });
      vi.resetModules();
      stateModule = await import('./state.js');
      expect(stateModule.state.mode).toBe('lyrics');
    });

    it('initializes settings from localStorage', async () => {
      const savedSettings = { fontSizePrimary: 100, bibleSecondaryEnable: true };
      mockGetItem.mockImplementation((key) => {
        if (key === 'lyrics2slides_settings') return JSON.stringify(savedSettings);
        return null;
      });
      
      vi.resetModules();
      stateModule = await import('./state.js');
      
      expect(stateModule.state.settings.fontSizePrimary).toBe(100);
      expect(stateModule.state.settings.bibleSecondaryEnable).toBe(true);
      // Verify other defaults still exist
      expect(stateModule.state.settings.backgroundColor).toBe('#000000');
    });

    it('setMode persists to localStorage', () => {
      stateModule.setMode('lyrics');
      expect(mockSetItem).toHaveBeenCalledWith('lyrics2slides_mode', 'lyrics');
    });

    it('updateSettings persists to localStorage', () => {
      stateModule.updateSettings({ fontSizePrimary: 80 });
      const expectedSettings = { ...stateModule.state.settings, fontSizePrimary: 80 };
      expect(mockSetItem).toHaveBeenCalledWith('lyrics2slides_settings', JSON.stringify(expectedSettings));
    });

    it('handles corrupted settings JSON gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetItem.mockImplementation((key) => {
        if (key === 'lyrics2slides_settings') return 'invalid json';
        return null;
      });
      
      vi.resetModules();
      stateModule = await import('./state.js');
      
      expect(stateModule.state.settings.fontSizePrimary).toBe(64); // Default
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('handles corrupted saved verses JSON gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetItem.mockImplementation((key) => {
        if (key === 'lyrics2slides_saved_verses') return 'invalid json';
        return null;
      });
      
      vi.resetModules();
      stateModule = await import('./state.js');
      
      expect(stateModule.state.savedVerses).toEqual([]); // Default
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('has default bibleBackgroundColor as #000000', () => {
      expect(stateModule.state.settings.bibleBackgroundColor).toBe('#000000');
    });
  });
});

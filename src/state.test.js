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

// Reset module state between tests
let stateModule;

describe('state module', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockPostMessage.mockClear();
    stateModule = await import('./state.js');
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
        bibleBackgroundColor: '#123456',
        bibleFontFamilyPrimary: 'Arial'
      });

      expect(stateModule.state.settings.bibleBackgroundColor).toBe('#123456');
      expect(stateModule.state.settings.bibleFontFamilyPrimary).toBe('Arial');
    });
  });
});

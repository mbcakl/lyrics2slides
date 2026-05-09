import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCarousel } from './carousel.js';
import * as renderer from './renderer.js';

// Mock the renderer
vi.mock('./renderer.js', () => ({
  renderSlide: vi.fn()
}));

describe('updateCarousel', () => {
  let container;
  let mockState;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockState = {
      slides: [{ primary: ['A'] }, { primary: ['B'] }],
      currentSlide: 0,
      settings: { backgroundColor: '#000' },
      mode: 'lyrics'
    };
    renderer.renderSlide.mockClear();
  });

  it('renders correct number of thumbnails', () => {
    updateCarousel(container, mockState, vi.fn());
    expect(container.children.length).toBe(2);
    expect(renderer.renderSlide).toHaveBeenCalledTimes(2);
  });

  it('creates the correct inner DOM structure for each thumbnail', () => {
    updateCarousel(container, mockState, vi.fn());
    const thumbnail = container.children[0];
    const content = thumbnail.querySelector('.slide-content');
    expect(content).not.toBeNull();
    expect(content.querySelector('.primary-text')).not.toBeNull();
    expect(content.querySelector('.secondary-text')).not.toBeNull();
  });

  it('marks current slide as active', () => {
    updateCarousel(container, mockState, vi.fn());
    expect(container.children[0].classList.contains('active')).toBe(true);
    expect(container.children[1].classList.contains('active')).toBe(false);
  });

  it('triggers callback on thumbnail click', () => {
    const callback = vi.fn();
    updateCarousel(container, mockState, callback);
    
    // Click the second thumbnail
    // Since we use event delegation, the event bubbles up
    const clickEvent = new MouseEvent('click', { bubbles: true });
    container.children[1].dispatchEvent(clickEvent);
    expect(callback).toHaveBeenCalledWith(1);
  });
});

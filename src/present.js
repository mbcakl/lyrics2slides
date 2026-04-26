import { renderSlide } from './renderer.js';

const slidePreview = document.getElementById('slide-preview');
const syncChannel = new BroadcastChannel('lyrics2slides_sync');

syncChannel.onmessage = (event) => {
  if (event.data.type === 'SYNC_STATE') {
    const { slides, currentSlide, settings, mode } = event.data.state;
    const isBible = mode === 'bible';
    slidePreview.style.backgroundColor = isBible ? settings.bibleBackgroundColor : settings.backgroundColor;
    renderSlide(slidePreview, slides[currentSlide], settings, { mode });
  }
};

// Request initial state from main window
syncChannel.postMessage({ type: 'REQUEST_STATE' });

// Keyboard navigation in presentation window
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') syncChannel.postMessage({ type: 'PREV_SLIDE' });
  if (e.key === 'ArrowRight') syncChannel.postMessage({ type: 'NEXT_SLIDE' });
});

window.addEventListener('resize', () => {
  // Re-render when resized
  syncChannel.postMessage({ type: 'REQUEST_STATE' });
});

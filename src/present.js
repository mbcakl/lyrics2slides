import { renderSlide } from './renderer.js';

const slidePreview = document.getElementById('slide-preview');
const syncChannel = new BroadcastChannel('lyrics2slides_sync');

let lastState = null;

function render() {
  if (!lastState) return;
  const { slides, currentSlide, settings, mode } = lastState;
  const slide = slides[currentSlide];
  const isBible = mode === 'bible';
  slidePreview.style.backgroundColor = isBible ? settings.bibleBackgroundColor : settings.backgroundColor;
  renderSlide(slidePreview, slide, settings, { mode });
}

syncChannel.onmessage = (event) => {
  if (event.data.type === 'SYNC_STATE') {
    lastState = event.data.state;
    render();
  }
};

// Request initial state from main window
syncChannel.postMessage({ type: 'REQUEST_STATE' });

// Keyboard navigation in presentation window
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') syncChannel.postMessage({ type: 'PREV_SLIDE' });
  if (e.key === 'ArrowRight') syncChannel.postMessage({ type: 'NEXT_SLIDE' });
  if (e.key === 'f') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
});

window.addEventListener('resize', () => {
  // Re-render when resized using last known state
  requestAnimationFrame(render);
});

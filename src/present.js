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

// Request initial state from main window, retrying until it answers so a
// missed first reply can't leave the window blank until the next change
syncChannel.postMessage({ type: 'REQUEST_STATE' });
let stateRequests = 1;
const stateRequestTimer = setInterval(() => {
  if (lastState || stateRequests >= 20) {
    clearInterval(stateRequestTimer);
    return;
  }
  syncChannel.postMessage({ type: 'REQUEST_STATE' });
  stateRequests++;
}, 250);

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

// Re-render whenever the slide box changes size. Font sizes are derived from
// its height, and the popup can still be settling to its final size when the
// first state arrives (a window resize event alone can be missed).
new ResizeObserver(() => render()).observe(slidePreview);

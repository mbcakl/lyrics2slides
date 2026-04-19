import { nextSlide, prevSlide } from './state.js';

export function initNavigation() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const presentBtn = document.getElementById('present-btn');

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  presentBtn.addEventListener('click', () => {
    window.open('/present.html', 'lyrics2slides_present', 'width=1280,height=720');
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Don't navigate if user is typing in textarea
    if (e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });
}

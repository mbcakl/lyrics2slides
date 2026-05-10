import { renderSlide } from './renderer.js';
import { state, subscribe, setCurrentSlide } from './state.js';

let lastSlides = null;
let lastSettings = null;
let lastMode = null;

export function updateCarousel(container, state, onThumbnailClick) {
  if (!container || !state || !state.slides) return;
  
  const { slides, currentSlide, settings, mode } = state;
  const isBible = mode === 'bible';
  const bgColor = isBible ? settings.bibleBackgroundColor : settings.backgroundColor;

  // Fast path: only currentSlide changed
  if (slides === lastSlides && settings === lastSettings && mode === lastMode && container.children.length === slides.length) {
    Array.from(container.children).forEach((thumb, index) => {
      if (index === currentSlide) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
    return;
  }

  // Save state for future fast paths
  lastSlides = slides;
  lastSettings = settings;
  lastMode = mode;

  // Clear container
  container.innerHTML = '';

  // Pass 1: Build DOM and append to container (so clientHeight is available)
  const thumbnails = slides.map((slide, index) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = `carousel-thumbnail ${index === currentSlide ? 'active' : ''}`;
    thumbnail.style.backgroundColor = bgColor;
    thumbnail.dataset.index = index;
    
    // Create inner content structure expected by renderSlide
    const content = document.createElement('div');
    content.className = 'slide-content';
    const primary = document.createElement('div');
    primary.className = 'primary-text';
    const secondary = document.createElement('div');
    secondary.className = 'secondary-text';
    
    content.appendChild(primary);
    content.appendChild(secondary);
    thumbnail.appendChild(content);

    container.appendChild(thumbnail);
    return thumbnail;
  });

  // Pass 2: Render slides now that elements have physical dimensions
  thumbnails.forEach((thumbnail, index) => {
    renderSlide(thumbnail, slides[index], settings, { mode });
  });

  // Single event listener for delegation
  container.onclick = (e) => {
    const thumb = e.target.closest('.carousel-thumbnail');
    if (thumb && onThumbnailClick) {
      onThumbnailClick(parseInt(thumb.dataset.index, 10));
    }
  };
}

export function initCarousel() {
  const container = document.getElementById('slide-carousel');
  if (!container) return;

  // Horizontal scroll with mouse wheel
  container.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      container.scrollLeft += e.deltaY * 1.5; // Increased speed multiplier
    }
  }, { passive: false });

  // Render on state change
  subscribe((currentState) => {
    updateCarousel(container, currentState, (index) => {
      setCurrentSlide(index);
    });

    // Auto-scroll logic
    const activeThumb = container.querySelector('.carousel-thumbnail.active');
    if (activeThumb) {
      const containerRect = container.getBoundingClientRect();
      const thumbRect = activeThumb.getBoundingClientRect();
      
      // If thumbnail is out of view, scroll it into view
      if (thumbRect.left < containerRect.left || thumbRect.right > containerRect.right) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  });

  // Initial render
  updateCarousel(container, state, (index) => {
    setCurrentSlide(index);
  });
}

# Slide Sorter Carousel Design

## Overview
Replace the static "Quick Start" section with a horizontal slide sorter carousel below the main preview area to allow users to see all generated slides and quickly jump between them.

## UI Changes

### 1. Relocate Quick Start Info
*   **Action:** Remove the existing `.quick-start` container from the bottom of the `.preview-section`.
*   **New Location:** Add an info icon/button to the header controls.
*   **Interaction:** Clicking the button will toggle a popover containing the quick start tips.

### 2. Slide Carousel Component
*   **Location:** Below the slide navigation (`.slide-nav`) in the right-hand preview panel.
*   **Container:** A horizontally scrolling container (`overflow-x: auto`) taking full width.
*   **Thumbnails:**
    *   Maintain a 16:9 aspect ratio.
    *   Fixed small height (e.g., ~60px-80px).
    *   Re-use the existing `renderSlide` function from `src/renderer.js` to render mini versions of the slides.
    *   Background color follows the current mode's setting (standard vs. bible).

## Interactivity

1.  **Selection:** Clicking a thumbnail updates the global state `currentSlide` and immediately updates the main preview.
2.  **Active State:** The thumbnail corresponding to `currentSlide` receives visual distinction (e.g., a thick accent-colored border).
3.  **Auto-scrolling:** When `currentSlide` changes (via keyboard, prev/next buttons, or external state change), the carousel container must scroll horizontally to ensure the active thumbnail is centered or at least fully visible in the viewable area.

## Architecture & Integration

*   **HTML:** Add the new container structure to `index.html`.
*   **CSS:** Add styles for the carousel container, thumbnails, and active state in `style.css`. Add styles for the new header info popover.
*   **JS Module:** Create a new module (e.g., `src/carousel.js` or integrate into `src/preview.js`) responsible for managing the carousel DOM.
*   **State:** Subscribe to `state` changes (specifically `slides` array and `currentSlide` index) to trigger re-renders and auto-scrolling.

## Performance Considerations
*   Rendering many thumbnails at once could be heavy.
*   **Mitigation:** The initial implementation will render all thumbnails when slides change. If performance issues arise with large slide decks, future iterations can implement lazy rendering (only rendering thumbnails visible in the scroll port) or debounce the thumbnail generation. The current `renderSlide` is fast enough for typical lyric/bible usage.
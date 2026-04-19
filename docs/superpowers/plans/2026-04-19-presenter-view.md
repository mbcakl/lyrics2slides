# Presenter View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Present" button that opens a separate, synchronized presentation window for dual-monitor setups.

**Architecture:** Use `BroadcastChannel` for real-time state synchronization between the main window and a new presentation window. Extract shared rendering logic into a `renderer.js` utility.

**Tech Stack:** Vanilla JS, HTML5 BroadcastChannel API, CSS.

---

### Task 1: Extract Shared Renderer

**Files:**
- Create: `src/renderer.js`
- Modify: `src/preview.js`
- Test: `src/renderer.test.js` (New)

- [ ] **Step 1: Create the shared renderer**

```javascript
import { PPTX_SLIDE_HEIGHT_PT } from './constants.js';

/**
 * Renders a slide to the provided element.
 */
export function renderSlide(element, slide, settings, options = {}) {
  const { isPreview = false } = options;
  const primaryText = element.querySelector('.primary-text');
  const secondaryText = element.querySelector('.secondary-text');

  if (!slide) {
    primaryText.textContent = '';
    secondaryText.textContent = '';
    element.classList.add('empty');
    return;
  }

  element.classList.remove('empty');
  const previewHeight = element.clientHeight || PPTX_SLIDE_HEIGHT_PT;
  const fontScale = previewHeight / PPTX_SLIDE_HEIGHT_PT;

  const hasPrimary = slide.primary && slide.primary.length > 0;
  const hasSecondary = slide.secondary && slide.secondary.length > 0;
  const onlyPrimary = hasPrimary && !hasSecondary;

  primaryText.classList.toggle('centered', onlyPrimary);
  
  // Render Primary
  primaryText.textContent = slide.primary.join('\n');
  primaryText.style.fontFamily = settings.fontFamilyPrimary;
  primaryText.style.fontSize = `${settings.fontSizePrimary * fontScale}px`;
  primaryText.style.fontWeight = settings.fontBoldPrimary ? 'bold' : 'normal';
  primaryText.style.color = settings.fontColorPrimary;

  // Render Secondary
  if (secondaryText) {
    secondaryText.textContent = slide.secondary.join('\n');
    secondaryText.style.fontFamily = settings.fontFamilySecondary;
    secondaryText.style.fontSize = `${settings.fontSizeSecondary * fontScale}px`;
    secondaryText.style.fontWeight = settings.fontBoldSecondary ? 'bold' : 'normal';
    secondaryText.style.color = settings.fontColorSecondary;
  }
}
```

- [ ] **Step 2: Update `src/preview.js` to use the shared renderer**

- [ ] **Step 3: Run tests to ensure no regressions**

Run: `npm test`
Expected: All existing tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/renderer.js src/preview.js
git commit -m "refactor: extract shared slide renderer"
```

### Task 2: Implement State Broadcasting

**Files:**
- Modify: `src/state.js`

- [ ] **Step 1: Add BroadcastChannel to `src/state.js`**

```javascript
const syncChannel = new BroadcastChannel('lyrics2slides_sync');

export function subscribe(callback) {
  subscribers.push(callback);
}

function notify() {
  subscribers.forEach(cb => cb(state));
  syncChannel.postMessage({ type: 'SYNC_STATE', state });
}

// Handle requests for initial state
syncChannel.onmessage = (event) => {
  if (event.data.type === 'REQUEST_STATE') {
    syncChannel.postMessage({ type: 'SYNC_STATE', state });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/state.js
git commit -m "feat: add broadcast channel for state synchronization"
```

### Task 3: Create Presentation Window

**Files:**
- Create: `present.html`
- Create: `src/present.js`
- Modify: `style.css`

- [ ] **Step 1: Create `present.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Presentation - Lyrics2Slides</title>
  <link rel="stylesheet" href="/style.css">
  <style>
    body { margin: 0; background: black; overflow: hidden; cursor: none; }
    .presentation-container { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .slide-preview { border: none; box-shadow: none; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div class="presentation-container">
    <div id="slide-preview" class="slide-preview">
      <div class="slide-content">
        <div class="primary-text"></div>
        <div class="secondary-text"></div>
      </div>
    </div>
  </div>
  <script type="module" src="/src/present.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `src/present.js`**

```javascript
import { renderSlide } from './renderer.js';

const slidePreview = document.getElementById('slide-preview');
const syncChannel = new BroadcastChannel('lyrics2slides_sync');

syncChannel.onmessage = (event) => {
  if (event.data.type === 'SYNC_STATE') {
    const { slides, currentSlide, settings } = event.data.state;
    renderSlide(slidePreview, slides[currentSlide], settings);
  }
};

// Request initial state
syncChannel.postMessage({ type: 'REQUEST_STATE' });

// Keyboard navigation (optional but helpful)
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') syncChannel.postMessage({ type: 'PREV_SLIDE' });
  if (e.key === 'ArrowRight') syncChannel.postMessage({ type: 'NEXT_SLIDE' });
});

window.addEventListener('resize', () => {
  // Trigger re-render on resize to update font scale
  syncChannel.postMessage({ type: 'REQUEST_STATE' });
});
```

- [ ] **Step 3: Update `src/state.js` to handle navigation messages**

- [ ] **Step 4: Commit**

```bash
git add present.html src/present.js style.css
git commit -m "feat: implement presentation window and sync logic"
```

### Task 4: Add "Present" Button and Launch Logic

**Files:**
- Modify: `index.html`
- Modify: `src/navigation.js`

- [ ] **Step 1: Add "Present" button to `index.html`**

```html
<button id="present-btn" class="btn-secondary">Present</button>
```

- [ ] **Step 2: Add launch logic to `src/navigation.js`**

```javascript
const presentBtn = document.getElementById('present-btn');
presentBtn.addEventListener('click', () => {
  window.open('/present.html', 'lyrics2slides_present', 'width=1280,height=720');
});
```

- [ ] **Step 3: Commit**

```bash
git add index.html src/navigation.js
git commit -m "feat: add present button and window launcher"
```

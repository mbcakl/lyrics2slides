# Saved Bible Verses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to save Bible verse references for quick access. Saved verses persist in `localStorage` and appear as interactive cards that automatically fetch the text when clicked.

**Architecture:** Extend the central state to include `savedVerses`. Use the subscription model to update the UI grid. Implement persistence in `src/state.js` using `localStorage`.

**Tech Stack:** JavaScript (Vanilla), CSS, HTML, Vitest (for state logic testing)

---

### Task 1: Update State Management and Persistence

**Files:**
- Modify: `src/state.js`
- Test: `src/state.test.js`

- [ ] **Step 1: Update initial state and persistence logic**

Add `savedVerses` to the initial state, loading from `localStorage` if available.

```javascript
// src/state.js

// Load saved verses from localStorage
const storedVerses = localStorage.getItem('lyrics2slides_saved_verses');
const initialSavedVerses = storedVerses ? JSON.parse(storedVerses) : [];

export const state = {
  // ... existing state ...
  savedVerses: initialSavedVerses,
  // ...
};

// ...

export function addSavedVerse(verse) {
  // verse: { id, book, reference, pVersion, sVersion, sEnabled }
  // Check for duplicates
  const exists = state.savedVerses.some(v => 
    v.book === verse.book && 
    v.reference === verse.reference && 
    v.pVersion === verse.pVersion &&
    v.sVersion === verse.sVersion &&
    v.sEnabled === verse.sEnabled
  );
  if (!exists) {
    state.savedVerses.push(verse);
    localStorage.setItem('lyrics2slides_saved_verses', JSON.stringify(state.savedVerses));
    notify();
  }
}

export function removeSavedVerse(id) {
  state.savedVerses = state.savedVerses.filter(v => v.id !== id);
  localStorage.setItem('lyrics2slides_saved_verses', JSON.stringify(state.savedVerses));
  notify();
}
```

- [ ] **Step 2: Add tests for saved verses in state**

```javascript
// src/state.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state, addSavedVerse, removeSavedVerse } from './state.js';

describe('Saved Verses State', () => {
  beforeEach(() => {
    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
    });
    state.savedVerses = [];
  });

  it('should add a saved verse', () => {
    const verse = { id: 1, book: 'GEN', reference: '1:1', pVersion: 'NIV' };
    addSavedVerse(verse);
    expect(state.savedVerses).toHaveLength(1);
    expect(state.savedVerses[0]).toEqual(verse);
  });

  it('should not add duplicate verses', () => {
    const verse = { id: 1, book: 'GEN', reference: '1:1', pVersion: 'NIV' };
    addSavedVerse(verse);
    addSavedVerse(verse);
    expect(state.savedVerses).toHaveLength(1);
  });

  it('should remove a saved verse', () => {
    addSavedVerse({ id: 1, book: 'GEN', reference: '1:1' });
    removeSavedVerse(1);
    expect(state.savedVerses).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm run test:run src/state.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/state.js src/state.test.js
git commit -m "feat: add savedVerses to state with persistence"
```

---

### Task 2: Update UI Structure and Styling

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Add Save button and Grid container in HTML**

```html
<!-- index.html around line 71 -->
<div style="display: flex; gap: 0.5rem;">
  <button id="bible-book-btn" class="text-input" style="flex: 1; text-align: left;">创世记 Genesis</button>
  <input type="text" id="bible-chapter-verse" placeholder="e.g., 3:1-16" class="text-input" style="flex: 1;">
  <button id="save-bible-btn" class="btn-secondary" style="padding: 0.5rem 1rem;" title="Save to Quick Access">💾</button>
</div>

<!-- ... around line 94 ... -->
<button id="fetch-bible-btn" class="btn-primary" style="margin-bottom: 1rem; width: 100%;">Fetch Verses</button>

<!-- New Container -->
<div id="saved-verses-grid" class="saved-verses-grid"></div>
```

- [ ] **Step 2: Add styles for cards and grid**

```css
/* style.css */
.saved-verses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.verse-card {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.verse-card:hover {
  border-color: var(--accent);
  background: var(--bg-primary);
}

.verse-card .ref {
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.verse-card .version {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.delete-card-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-card-btn:hover {
  background: #ef4444;
  color: white;
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html style.css
git commit -m "style: add save button and saved verses grid layout"
```

---

### Task 3: Implement Logic in bible.js

**Files:**
- Modify: `src/bible.js`

- [ ] **Step 1: Implement save handler and card rendering**

Add the logic to handle the save button and update the grid.

```javascript
// src/bible.js

// ... inside initBible() ...

const saveBtn = document.getElementById('save-bible-btn');
const savedGrid = document.getElementById('saved-verses-grid');

function renderSavedVerses() {
  savedGrid.innerHTML = '';
  state.savedVerses.forEach(verse => {
    const card = document.createElement('div');
    card.className = 'verse-card';
    
    // Get Book Names for display
    const bookNames = bookNamesMap[verse.book];
    const displayRef = `${bookNames.zh} ${verse.reference}`;
    
    card.innerHTML = `
      <button class="delete-card-btn" data-id="${verse.id}">✕</button>
      <div class="ref">${displayRef}</div>
      <div class="version">${verse.pVersion}${verse.sEnabled ? ' / ' + verse.sVersion : ''}</div>
    `;
    
    // Retrieval logic
    card.onclick = (e) => {
      if (e.target.classList.contains('delete-card-btn')) return;
      
      // Update UI
      setBibleSelectedBook(verse.book);
      updateBookButton();
      chapterVerseInput.value = verse.reference;
      
      const pTrans = document.getElementById('bible-translation-primary');
      const sTrans = document.getElementById('bible-translation-secondary');
      const sCheck = document.getElementById('bible-secondary-enable');
      
      pTrans.value = verse.pVersion;
      sCheck.checked = verse.sEnabled;
      sTrans.value = verse.sVersion;
      sTrans.disabled = !verse.sEnabled;
      secGroup.style.opacity = verse.sEnabled ? '1' : '0.4';
      secGroup.style.pointerEvents = verse.sEnabled ? 'auto' : 'none';
      
      // Trigger fetch
      fetchBtn.click();
    };
    
    // Delete logic
    card.querySelector('.delete-card-btn').onclick = (e) => {
      e.stopPropagation();
      removeSavedVerse(verse.id);
    };
    
    savedGrid.appendChild(card);
  });
}

saveBtn.onclick = (e) => {
  e.preventDefault();
  const ref = chapterVerseInput.value.trim();
  if (!ref) return;
  
  const verse = {
    id: Date.now(),
    book: state.bibleSelectedBook,
    reference: ref,
    pVersion: document.getElementById('bible-translation-primary').value,
    sVersion: document.getElementById('bible-translation-secondary').value,
    sEnabled: document.getElementById('bible-secondary-enable').checked
  };
  
  addSavedVerse(verse);
};

// Initial render
renderSavedVerses();

// Subscribe to state changes for the grid
subscribe((newState) => {
  // Only re-render if savedVerses changed
  // Simple check for now
  renderSavedVerses(); 
});
```

- [ ] **Step 2: Commit**

```bash
git add src/bible.js
git commit -m "feat: implement save and retrieval logic for bible verses"
```

---

### Task 4: Final Verification

- [ ] **Step 1: Test Save functionality**
    - Select a book (e.g., Genesis).
    - Enter a reference (e.g., 1:1).
    - Click the 💾 button.
    - Verify card appears.

- [ ] **Step 2: Test Retrieval functionality**
    - Click the card.
    - Verify inputs are updated and verses are fetched.

- [ ] **Step 3: Test Persistence**
    - Refresh page.
    - Verify cards are still there.

- [ ] **Step 4: Test Removal**
    - Click X on a card.
    - Verify it disappears and doesn't return on refresh.

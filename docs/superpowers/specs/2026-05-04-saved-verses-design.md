# Design Document: Saved Bible Verses (Quick Access)

## Goal
Allow users to save specific Bible verse references for quick retrieval. Saved verses should persist across browser sessions and appear as interactive cards in the Bible tab.

## Proposed Changes

### 1. UI Components (index.html)
- **Save Button**: Add a button with ID `save-bible-btn` next to the chapter/verse input field.
- **Saved Grid**: Add a container with ID `saved-verses-grid` below the "Fetch Verses" button.
- **Verse Cards**: Dynamic HTML elements created for each saved verse, containing the reference text and a delete button.

### 2. Styling (style.css)
- Style the `save-bible-btn` to match the existing button themes.
- Create a `.saved-verses-grid` layout (likely a flexbox or CSS grid).
- Style `.verse-card`:
    - Compact, interactive tile.
    - Hover effects for clickability.
    - A small, absolute-positioned delete button (`.delete-card-btn`).

### 3. State Management (src/state.js)
- Add `savedVerses` to the initial state (defaulting to an empty array or loaded from `localStorage`).
- Add `addSavedVerse` and `removeSavedVerse` actions.
- Implement persistence:
    - Load `savedVerses` from `localStorage` on initialization.
    - Save to `localStorage` whenever the state changes.

### 4. Application Logic (src/bible.js)
- **Save Action**:
    - Listener for `save-bible-btn`.
    - Captures current: `selectedBook`, `chapterVerseInput`, `primaryTranslation`, `secondaryTranslation`, `secondaryEnabled`.
    - Validates that it's not a duplicate.
- **Rendering**:
    - Subscribe to `state.savedVerses`.
    - Clear and re-render the `#saved-verses-grid` whenever the list changes.
- **Retrieval Action**:
    - Listener on verse cards.
    - When clicked:
        1. Update `state` and UI inputs to match the card's data.
        2. Programmatically trigger the "Fetch" logic to load the verses.

## Data Structure
Each saved verse object:
```json
{
  "id": "timestamp-or-uuid",
  "book": "GEN",
  "reference": "1:1-5",
  "pVersion": "CUNPSS-神",
  "sVersion": "KJV",
  "sEnabled": true
}
```

## Architecture
- **State-Driven UI**: The cards are a direct reflection of the `savedVerses` array in the central state.
- **Local Storage Persistence**: Uses the browser's `localStorage` API for simple, zero-backend persistence.

## Verification Plan

### Manual Testing
1.  **Saving**:
    - Fetch a verse.
    - Click the "Save" button.
    - Verify a new card appears in the grid.
2.  **Retrieval**:
    - Change the book and verse input to something else.
    - Click the saved card.
    - Verify the inputs update and the correct verses are automatically loaded into the preview.
3.  **Removal**:
    - Click the 'X' on a card.
    - Verify the card disappears.
4.  **Persistence**:
    - Save a few verses.
    - Refresh the page.
    - Verify the cards are still there.
5.  **Duplicates**:
    - Attempt to save the same verse twice.
    - Verify it doesn't create a duplicate entry.

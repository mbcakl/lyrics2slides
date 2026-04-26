# Spec: Bible Grid Picker

## Overview
Improve the UX for Bible book selection by replacing the current long dropdown menu with a responsive grid-based picker hosted in a native HTML `<dialog>` element.

## Goals
- Faster book finding through visual grouping and spatial layout.
- Clean up the main UI by moving the exhaustive book list into a modal.
- Native desktop feel with keyboard support.

## User Interface
### Trigger
- Replace `<select id="bible-book">` with a `<button id="bible-book-btn">`.
- The button displays the currently selected book (e.g., "创世记 Genesis").

### Dialog Modal (`<dialog id="bible-picker-dialog">`)
- **Header:** Title "Select Bible Book" and a close button (X).
- **Body:** Two main sections:
    - **Old Testament:** 39 books.
    - **New Testament:** 27 books.
- **Grid Layout:** 
    - Desktop: 6-8 columns.
    - Books are buttons containing the Chinese name (primary) and English name (secondary, smaller).
- **Styling:**
    - Distinctive background colors for OT vs NT sections.
    - Hover effects and active state for the current selection.
    - Large enough touch/click targets.

## Logic & State
- **Initialization:** Populate the grid buttons dynamically from `bookNamesMap` in `bible.js`, maintaining the standard biblical order (Genesis to Revelation).
- **Selection:**
    1. Click button -> Set selected book code in `state.js` (or via `bible.js` local logic if appropriate).
    2. Update trigger button text.
    3. Close dialog.
- **Keyboard:**
    - `Esc` to close.
    - Arrows to navigate (standard button focus).
- **Integration:** Maintain compatibility with existing chapter/verse fetching logic.

## Technical Changes
- **`index.html`:** Add `<dialog>` structure. Replace `<select>`.
- **`style.css`:** Add dialog and grid styling.
- **`src/bible.js`:** 
    - Implement dialog open/close logic.
    - Dynamically generate grid buttons.
    - Update event listeners to handle button-based selection instead of change events.
- **`src/state.js`:** Ensure bible book state is tracked if needed for persistence/re-splitting.

## Verification
- Verify the dialog opens on click.
- Verify clicking a book updates the UI and closes the dialog.
- Verify fetching verses still works with the new selection method.
- Verify `Esc` closes the dialog.

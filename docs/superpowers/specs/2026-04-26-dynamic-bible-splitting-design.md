# Design Spec: Dynamic Bible Verse Splitting

## 1. Purpose
The goal is to automatically group Bible verses into slides so that they fit perfectly within the available space (43% of slide height), even when using dual translations. This eliminates the need for manual verse count settings and prevents text overflow.

## 2. Architecture

### 2.1 Measurement Component (`MeasureBox`)
A hidden DOM element will be used to simulate slide rendering.
- **Styling**: Must match `.primary-text` and `.secondary-text` exactly (width, line-height, font-family, font-size).
- **Visibility**: `visibility: hidden; position: absolute; pointer-events: none;`.

### 2.2 Splitting Algorithm (`greedySplit`)
A function that iterates through verses and determines slide boundaries.
- **Inputs**: Array of Primary verses, Array of Secondary verses, Settings (fonts, sizes).
- **Process**:
    1. Start a new slide group.
    2. Add the next verse to the group.
    3. Measure the height of the current group for both Primary and Secondary versions.
    4. If Primary height > MaxHeight OR Secondary height > MaxHeight:
        - Move the last verse to a new slide group.
    5. Repeat until all verses are processed.

### 2.3 Integration Points
- **`src/bible.js`**: Update `fetchBtn` click handler to use the dynamic splitting instead of fixed 4-verse chunks.
- **`src/state.js`**: Add a trigger to recalculate slides when settings (like font size) change while in Bible mode.

## 3. Data Flow
1. User clicks "Fetch Verses" or adjusts Font Size.
2. `bible.js` fetches raw verses from SQLite.
3. `dynamicSplitter.js` (new) uses a hidden DOM element to measure heights.
4. `bible.js` receives the grouped verses and calls `setSlides()`.
5. `renderer.js` displays the perfectly fitted slides.

## 4. Testing Strategy
- **Unit Tests**: Test the splitting logic by providing mocked measurement values (e.g., "if verse 1 is 100px and verse 2 is 150px, they should split if MaxHeight is 200px").
- **Integration Tests**: Verify that changing the Primary font size correctly triggers a re-split of the existing Bible text.

## 5. Scope & Constraints
- Only applies to Bible mode. Lyrics mode continues to use manual blank-line splitting.
- Assumes the user is in a browser environment (required for DOM measurement).
- Max height is fixed at 43% of 540pt (approx 232pt) to match the established layout.

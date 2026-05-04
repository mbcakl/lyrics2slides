# Design Document: Vertical Resizing for Lyrics and Verse Textboxes

## Goal
Enable users to independently resize the vertical height of the lyrics and Bible verse input textboxes to better accommodate varying lengths of content.

## Proposed Changes

### 1. Styling Changes (CSS)
- **`style.css`**:
    - Update `.textarea-group textarea` to enable vertical resizing.
    - Set `resize: vertical;` instead of `resize: none;`.
    - Ensure `.input-section` allows vertical scrolling when content exceeds the viewport height.
    - Adjust `.main` layout to support scrolling in the input column while keeping the preview column stable.

### 2. Layout Considerations
- The resizing will be independent for each of the four textareas:
    - Primary Lyrics
    - Secondary Lyrics
    - Primary Bible Verses (Editable)
    - Secondary Bible Verses (Editable)
- The left column (`.input-section`) will gain a vertical scrollbar if the resized textareas push the content beyond the available vertical space.

## Architecture
- **Pure CSS Solution**: The primary mechanism will be the native browser `resize` property on `textarea` elements.
- **Flexbox/Grid Compatibility**: The current grid layout in `.main` will be maintained, with scrolling limited to the input section.

## Verification Plan

### Manual Testing
1.  **Lyrics Tab**:
    - Locate "Primary" and "Secondary" textareas.
    - Drag the resize handle on the bottom-right corner of each.
    - Verify they resize vertically and independently.
2.  **Bible Tab**:
    - Locate "Primary Verses" and "Secondary Verses" textareas.
    - Drag the resize handle on the bottom-right corner of each.
    - Verify they resize vertically and independently.
3.  **Scroll Behavior**:
    - Expand multiple textareas until they exceed the window height.
    - Verify that a scrollbar appears on the left side of the screen.
    - Verify that the right-side preview remains visible and doesn't scroll with the input section.
4.  **Responsive Check**:
    - Verify resizing still works on smaller screen sizes (mobile viewports).

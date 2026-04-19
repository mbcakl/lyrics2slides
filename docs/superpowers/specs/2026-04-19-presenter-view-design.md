# Design Spec: Presenter View (Dual Window)

## Overview
Add a "Present" button to the main interface that opens a separate presentation window. This window can be moved to a second monitor and made fullscreen, while the main window remains as a "Presenter View" for editing and control.

## User Interface
- **Main Window:**
  - Add a "Present" button next to "Download PPTX" in the header.
  - The "Present" button will open `present.html` in a new window.
- **Presentation Window (`present.html`):**
  - Minimal UI: only the slide preview area.
  - Black background by default.
  - No scrollbars or chrome (as much as the browser allows).
  - Keyboard navigation (Arrow keys) will also work here.

## Architecture
- **State Synchronization:**
  - Use `BroadcastChannel` (name: `lyrics2slides_sync`) for real-time communication between the main window and the presentation window.
  - Main window broadcasts the full state whenever it changes.
  - Presentation window listens for updates and renders the slide.
- **Shared Rendering:**
  - Extract the slide rendering logic from `src/preview.js` into a shared component or utility so both windows render slides identically.
- **Initialization:**
  - When the presentation window opens, it sends a "REQUEST_STATE" message.
  - The main window responds with the current "SYNC_STATE".

## Components
1.  **`index.html`:** Add the "Present" button.
2.  **`src/present.js`:** Logic for the presentation window (BroadcastChannel listener, rendering).
3.  **`present.html`:** The entry point for the presentation window.
4.  **`src/state.js`:** Add BroadcastChannel broadcasting on state changes.
5.  **`src/renderer.js` (New):** Shared logic for rendering slides to a DOM element.

## Error Handling
- **Popup Blocker:** Alert the user if the window fails to open.
- **Sync Loss:** The presentation window will show a "Waiting for connection..." message if no state is received.

## Testing
- Verify that typing in textareas updates the presentation window instantly.
- Verify that color/font changes update the presentation window.
- Verify that Arrow keys in either window navigate the slides for both.

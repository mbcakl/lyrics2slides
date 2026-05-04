# Vertical Resizing for Lyrics and Verse Textboxes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable independent vertical resizing for lyrics and Bible verse textboxes while keeping the UI responsive and the preview fixed.

**Architecture:** Utilize native CSS `resize: vertical` on `textarea` elements and configure the input section layout to handle overflow scrolling.

**Tech Stack:** CSS (Vanilla)

---

### Task 1: Update CSS for Resizing and Scrolling

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Enable vertical resizing on textareas**

Update the `.textarea-group textarea` rule to allow vertical resizing.

```css
/* Find this in style.css */
.textarea-group textarea {
  flex: 1;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical; /* Changed from none */
  min-height: 100px;
}
```

- [ ] **Step 2: Enable vertical scrolling on the input section**

Update `.input-section` to handle content that exceeds the viewport height.

```css
/* Find this in style.css */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto; /* Add this */
  min-height: 0;   /* Ensure flex container can shrink/scroll */
}
```

- [ ] **Step 3: Refine main layout for scrolling**

Ensure the `.main` container correctly supports the scrollable child.

```css
/* Find this in style.css */
.main {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  padding: 2rem;
  flex: 1;
  overflow: hidden; /* This keeps the main container from scrolling the whole page */
}
```

- [ ] **Step 4: Commit CSS changes**

```bash
git add style.css
git commit -m "feat: enable vertical resizing for textboxes and scrollable input section"
```

---

### Task 2: Verification

- [ ] **Step 1: Verify Lyrics Textareas**
    - Open the app.
    - Resizing: Click and drag the handle at the bottom-right of the "Primary" and "Secondary" lyrics textareas.
    - Independence: Verify resizing one does not affect the other.
    - Scroll: Expand them until a scrollbar appears in the left panel. Verify scrolling works.

- [ ] **Step 2: Verify Bible Textareas**
    - Switch to the "Bible" tab.
    - Resizing: Verify "Primary Verses" and "Secondary Verses" textareas can be resized vertically.
    - Independence: Verify resizing one does not affect the other.

- [ ] **Step 3: Verify Layout Integrity**
    - Ensure the right-side "Preview" section stays in place and doesn't scroll when the left panel is scrolled.
    - Ensure the "Header" stays fixed at the top.

- [ ] **Step 4: Verify Responsive Design**
    - Resize the window to mobile width (< 768px).
    - Verify that the textareas are still resizable and the single-column layout scrolls correctly.

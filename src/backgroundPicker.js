import { state, subscribe, updateSettings } from './state.js';
import {
  backgroundKeys, getBackground, validateImageFile, normalizeImage, saveImage,
  deleteImage, listImages, pruneImages, getImageUrl, applyBackground
} from './background.js';

let els;
let recentIds = [];

// Images referenced by either mode must survive pruning and deletion
function imagesInUse(settings) {
  return [settings.backgroundImageId, settings.bibleBackgroundImageId].filter(Boolean);
}

function showError(message) {
  els.error.textContent = message || '';
  els.error.hidden = !message;
  // Errors from a drop on the slide need the popover open to be seen
  if (message) els.picker.open = true;
}

async function useImageFile(file) {
  const invalid = validateImageFile(file);
  if (invalid) {
    showError(invalid);
    return;
  }

  showError(null);
  const label = els.choose.textContent;
  els.choose.textContent = 'Processing…';
  els.choose.disabled = true;
  try {
    const blob = await normalizeImage(file);
    const id = await saveImage(blob);
    updateSettings({ [backgroundKeys(state.mode).imageId]: id });
    await pruneImages(imagesInUse(state.settings));
    await refreshRecent();
  } catch (e) {
    console.error('Failed to set background image', e);
    showError('Could not use that image. Please try another one.');
  } finally {
    els.choose.textContent = label;
    els.choose.disabled = false;
  }
}

async function removeStoredImage(id) {
  const updates = {};
  if (state.settings.backgroundImageId === id) updates.backgroundImageId = null;
  if (state.settings.bibleBackgroundImageId === id) updates.bibleBackgroundImageId = null;
  if (Object.keys(updates).length > 0) updateSettings(updates);
  try {
    await deleteImage(id);
  } catch (e) {
    console.error('Failed to delete background image', e);
  }
  await refreshRecent();
}

async function refreshRecent() {
  let images = [];
  try {
    images = await listImages();
  } catch {
    // Storage unavailable: no image library, the rest of the picker still works
  }
  recentIds = images.map(img => img.id);

  els.recentGrid.replaceChildren(...images.map(({ id }) => {
    const item = document.createElement('div');
    item.className = 'bg-recent-item';
    item.dataset.id = id;

    const select = document.createElement('button');
    select.type = 'button';
    select.className = 'bg-recent-thumb';
    select.setAttribute('aria-label', 'Use this background image');
    getImageUrl(id).then(url => {
      if (url) select.style.backgroundImage = `url("${url}")`;
    });
    select.addEventListener('click', () => {
      showError(null);
      updateSettings({ [backgroundKeys(state.mode).imageId]: id });
    });

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'bg-recent-delete';
    del.title = 'Delete image';
    del.setAttribute('aria-label', 'Delete image');
    del.textContent = '×';
    del.addEventListener('click', () => removeStoredImage(id));

    item.append(select, del);
    return item;
  }));

  els.recent.hidden = images.length === 0;
  sync(state);
}

function sync(currentState) {
  const { settings, mode } = currentState;
  const { color, imageId, dim } = getBackground(settings, mode);

  if (els.color.value !== color) els.color.value = color;
  applyBackground(els.swatch, settings, mode);

  els.remove.hidden = !imageId;
  els.dimRow.hidden = !imageId;
  const percent = Math.round(dim * 100);
  if (Number(els.dim.value) !== percent) els.dim.value = percent;
  els.dimValue.textContent = `${percent}%`;

  Array.from(els.recentGrid.children).forEach(item => {
    item.classList.toggle('active', item.dataset.id === imageId);
  });

  // An image removed elsewhere (e.g. pruned) shouldn't linger as the selection
  if (imageId && recentIds.length > 0 && !recentIds.includes(imageId)) {
    getImageUrl(imageId).then(url => {
      if (!url) updateSettings({ [backgroundKeys(mode).imageId]: null });
    });
  }
}

function hasFiles(e) {
  return Array.from(e.dataTransfer?.types || []).includes('Files');
}

export function initBackgroundPicker() {
  els = {
    picker: document.getElementById('bg-picker'),
    color: document.getElementById('bg-color'),
    swatch: document.getElementById('bg-swatch'),
    choose: document.getElementById('bg-image-choose'),
    remove: document.getElementById('bg-image-remove'),
    input: document.getElementById('bg-image-input'),
    dimRow: document.getElementById('bg-dim-row'),
    dim: document.getElementById('bg-dim'),
    dimValue: document.getElementById('bg-dim-value'),
    recent: document.getElementById('bg-recent'),
    recentGrid: document.getElementById('bg-recent-grid'),
    error: document.getElementById('bg-error'),
    preview: document.getElementById('slide-preview')
  };
  if (!els.color) return;

  els.color.addEventListener('input', (e) => {
    updateSettings({ [backgroundKeys(state.mode).color]: e.target.value });
  });

  els.choose.addEventListener('click', () => els.input.click());
  els.input.addEventListener('change', () => {
    const file = els.input.files[0];
    els.input.value = ''; // allow re-choosing the same file
    if (file) useImageFile(file);
  });

  els.remove.addEventListener('click', () => {
    updateSettings({ [backgroundKeys(state.mode).imageId]: null });
  });

  els.dim.addEventListener('input', (e) => {
    updateSettings({ [backgroundKeys(state.mode).dim]: Number(e.target.value) / 100 });
  });

  // Drop an image straight onto the slide preview
  els.preview.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    els.preview.classList.add('drop-target');
  });
  els.preview.addEventListener('dragleave', () => els.preview.classList.remove('drop-target'));
  els.preview.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    els.preview.classList.remove('drop-target');
    const file = e.dataTransfer.files[0];
    if (file) useImageFile(file);
  });

  subscribe(sync);
  sync(state);
  refreshRecent();
}

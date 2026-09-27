// Slide background images.
//
// Images live in IndexedDB; settings only hold an image id. Settings are
// written to localStorage and broadcast to the present window on every state
// change, so carrying a multi-megabyte data URL there would be far too costly.

export const BG_WIDTH = 1920;
export const BG_HEIGHT = 1080;
export const BG_JPEG_QUALITY = 0.85;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_DIM = 0.8;
export const MAX_STORED_IMAGES = 12;

const DB_NAME = 'lyrics2slides_backgrounds';
const STORE = 'images';

/**
 * Setting keys for the background of the given mode (lyrics and bible are styled separately).
 */
export function backgroundKeys(mode) {
  return mode === 'bible'
    ? { color: 'bibleBackgroundColor', imageId: 'bibleBackgroundImageId', dim: 'bibleBackgroundDim' }
    : { color: 'backgroundColor', imageId: 'backgroundImageId', dim: 'backgroundDim' };
}

export function getBackground(settings, mode) {
  const keys = backgroundKeys(mode);
  return {
    color: settings[keys.color],
    imageId: settings[keys.imageId] || null,
    dim: clampDim(settings[keys.dim])
  };
}

export function clampDim(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(MAX_DIM, Math.max(0, n));
}

/**
 * Source rectangle that crops an image to fill the target aspect ratio, centered.
 */
export function coverCrop(srcWidth, srcHeight, targetWidth = BG_WIDTH, targetHeight = BG_HEIGHT) {
  const targetRatio = targetWidth / targetHeight;
  if (srcWidth / srcHeight > targetRatio) {
    const sw = srcHeight * targetRatio;
    return { sx: (srcWidth - sw) / 2, sy: 0, sw, sh: srcHeight };
  }
  const sh = srcWidth / targetRatio;
  return { sx: 0, sy: (srcHeight - sh) / 2, sw: srcWidth, sh };
}

/**
 * Output size for a crop: the crop's own size, capped at BG_WIDTH x BG_HEIGHT (never upscaled).
 */
export function outputSize(crop) {
  const width = Math.round(Math.min(BG_WIDTH, crop.sw));
  return { width, height: Math.round(width * BG_HEIGHT / BG_WIDTH) };
}

/**
 * Returns an error message for a file that can't be used as a background, or null.
 */
export function validateImageFile(file) {
  if (!file) return 'No file selected.';
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPEG, PNG or WebP image.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'That image is too large (max 25 MB).';
  }
  return null;
}

/**
 * Crops an image file to 16:9, scales it down to at most 1920x1080 and
 * re-encodes it as JPEG, so preview, presentation and PPTX all match.
 */
export async function normalizeImage(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const crop = coverCrop(bitmap.width, bitmap.height);
    const { width, height } = outputSize(crop);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed'))),
        'image/jpeg',
        BG_JPEG_QUALITY
      );
    });
  } finally {
    bitmap.close?.();
  }
}

// --- Storage (IndexedDB) ---

let dbPromise = null;

function openDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is unavailable'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    dbPromise.catch(() => { dbPromise = null; });
  }
  return dbPromise;
}

async function withStore(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function newId() {
  return globalThis.crypto?.randomUUID?.() || `bg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function saveImage(blob) {
  const id = newId();
  await withStore('readwrite', store => store.put({ id, blob, createdAt: Date.now() }));
  return id;
}

export async function getImageBlob(id) {
  if (!id) return null;
  const record = await withStore('readonly', store => store.get(id));
  return record ? record.blob : null;
}

export async function deleteImage(id) {
  await withStore('readwrite', store => store.delete(id));
  revokeImageUrl(id);
}

/**
 * All stored images, newest first: [{ id, blob, createdAt }].
 */
export async function listImages() {
  const records = await withStore('readonly', store => store.getAll());
  return (records || []).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Deletes the oldest images beyond MAX_STORED_IMAGES, never touching ids in `keep`.
 */
export async function pruneImages(keep = []) {
  const images = await listImages();
  const removable = images.slice(MAX_STORED_IMAGES).filter(img => !keep.includes(img.id));
  await Promise.all(removable.map(img => deleteImage(img.id)));
}

// --- Object URL cache ---

const urlCache = new Map();

export function getCachedImageUrl(id) {
  return urlCache.get(id) || null;
}

export async function getImageUrl(id) {
  if (!id) return null;
  if (urlCache.has(id)) return urlCache.get(id);
  try {
    const blob = await getImageBlob(id);
    if (!blob) return null;
    // Another caller may have resolved it while we were reading
    if (!urlCache.has(id)) urlCache.set(id, URL.createObjectURL(blob));
    return urlCache.get(id);
  } catch (e) {
    console.error('Failed to load background image', e);
    return null;
  }
}

function revokeImageUrl(id) {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
}

export async function getImageDataUrl(id) {
  const blob = await getImageBlob(id);
  if (!blob) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// --- Rendering ---

function setImage(element, url) {
  element.style.backgroundImage = url ? `url("${url}")` : '';
  element.classList.toggle('has-bg-image', Boolean(url));
}

/**
 * Applies the mode's background (color, image, dim overlay) to a slide element.
 * The image is set synchronously when already loaded, otherwise once it resolves.
 */
export function applyBackground(element, settings, mode) {
  const { color, imageId, dim } = getBackground(settings, mode);
  element.style.backgroundColor = color;
  element.style.setProperty('--bg-dim', imageId ? String(dim) : '0');
  element.dataset.bgImage = imageId || '';

  if (!imageId) {
    setImage(element, null);
    return;
  }

  const cached = getCachedImageUrl(imageId);
  if (cached) {
    setImage(element, cached);
    return;
  }

  getImageUrl(imageId).then(url => {
    // Skip if the element has since been given a different background
    if (element.dataset.bgImage === imageId) setImage(element, url);
  });
}

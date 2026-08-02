import { describe, it, expect, vi, beforeEach } from 'vitest';

class MockBroadcastChannel {
  postMessage() {}
  set onmessage(cb) { this._cb = cb; }
  get onmessage() { return this._cb; }
}
vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);

const store = new Map();
vi.stubGlobal('localStorage', {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, value)
});

const HTML = `
  <input id="bg-color" type="color">
  <button id="save-lyrics-btn"></button>
  <div id="saved-lyrics-grid"></div>
  <textarea id="primary-lyrics"></textarea>
  <input id="font-primary"><input id="size-primary" type="number">
  <input id="color-primary" type="color"><input id="bold-primary" type="checkbox">
  <div id="secondary-group">
    <textarea id="secondary-lyrics"></textarea>
    <input id="font-secondary"><input id="size-secondary" type="number">
    <input id="color-secondary" type="color"><input id="bold-secondary" type="checkbox">
  </div>
  <input id="bible-font-primary"><input id="bible-size-primary" type="number">
  <input id="bible-color-primary" type="color"><input id="bible-bold-primary" type="checkbox">
  <input id="bible-font-secondary"><input id="bible-size-secondary" type="number">
  <input id="bible-color-secondary" type="color"><input id="bible-bold-secondary" type="checkbox">
  <input id="bible-secondary-enable" type="checkbox">
`;

let stateModule;
let saveBtn, grid, primary, secondary;

// initInput debounces state writes by 150ms; flush that timer.
function flushInput() {
  vi.advanceTimersByTime(200);
}

async function setup() {
  vi.resetModules();
  store.clear();
  document.body.innerHTML = HTML;

  stateModule = await import('./state.js');
  const { initInput } = await import('./input.js');
  initInput();

  saveBtn = document.getElementById('save-lyrics-btn');
  grid = document.getElementById('saved-lyrics-grid');
  primary = document.getElementById('primary-lyrics');
  secondary = document.getElementById('secondary-lyrics');
}

describe('initInput saved songs', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await setup();
  });

  it('keeps the save button disabled until there are lyrics to title', () => {
    expect(saveBtn.disabled).toBe(true);

    primary.value = 'Amazing grace\nhow sweet the sound';
    primary.dispatchEvent(new Event('input'));
    flushInput();

    expect(saveBtn.disabled).toBe(false);
  });

  it('saves the current song and renders a card for it', () => {
    primary.value = 'Amazing grace\nhow sweet the sound';
    primary.dispatchEvent(new Event('input'));
    flushInput();

    saveBtn.click();

    expect(grid.querySelectorAll('.song-card').length).toBe(1);
    expect(grid.querySelector('.ref').textContent).toBe('Amazing grace');
    expect(stateModule.state.savedLyrics[0]).toMatchObject({
      title: 'Amazing grace',
      primary: 'Amazing grace\nhow sweet the sound',
      secondary: ''
    });
  });

  it('captures the font settings in force at save time', () => {
    stateModule.updateSettings({ fontFamilyPrimary: 'Georgia', fontColorPrimary: '#ff0000' });
    primary.value = 'Holy holy holy';
    primary.dispatchEvent(new Event('input'));
    flushInput();

    saveBtn.click();

    expect(stateModule.state.savedLyrics[0].settings).toMatchObject({
      fontFamilyPrimary: 'Georgia',
      fontColorPrimary: '#ff0000'
    });
  });

  it('restores text, settings and font inputs when a card is clicked', () => {
    primary.value = 'Holy holy holy\nLord God Almighty\n\nEarly in the morning';
    secondary.value = '圣哉三一\n全能大主宰\n\n清晨我众歌声';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    stateModule.updateSettings({ fontFamilyPrimary: 'Georgia', fontSizePrimary: 52 });
    saveBtn.click();

    // Move away from the saved song, then load it back.
    primary.value = 'Something else entirely';
    secondary.value = '';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    stateModule.updateSettings({ fontFamilyPrimary: 'Impact', fontSizePrimary: 12 });

    grid.querySelector('.song-card').click();

    expect(primary.value).toBe('Holy holy holy\nLord God Almighty\n\nEarly in the morning');
    expect(secondary.value).toBe('圣哉三一\n全能大主宰\n\n清晨我众歌声');
    expect(stateModule.state.primaryLyrics).toBe(primary.value);
    expect(stateModule.state.secondaryLyrics).toBe(secondary.value);
    expect(stateModule.state.settings.fontFamilyPrimary).toBe('Georgia');
    expect(stateModule.state.settings.fontSizePrimary).toBe(52);
    expect(document.getElementById('font-primary').value).toBe('Georgia');
    expect(document.getElementById('size-primary').value).toBe('52');
    expect(stateModule.state.slides).toHaveLength(2);
  });

  it('re-enables the secondary textarea when loading a dual-language song', () => {
    primary.value = 'Line one';
    secondary.value = 'Línea uno';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    saveBtn.click();

    // Clearing primary disables (and empties) secondary.
    primary.value = '';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    expect(secondary.disabled).toBe(true);

    grid.querySelector('.song-card').click();

    expect(secondary.disabled).toBe(false);
    expect(secondary.value).toBe('Línea uno');
  });

  it('does not let the saved font size be overwritten by the first-secondary-use default', async () => {
    primary.value = 'Line one';
    secondary.value = 'Línea uno';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    stateModule.updateSettings({ fontSizePrimary: 52, fontSizeSecondary: 30 });
    saveBtn.click();

    // Reload: a fresh session has not seen secondary lyrics yet, so the 40/40
    // adjustment is still armed when the dual-language song is loaded.
    document.body.innerHTML = HTML;
    vi.resetModules();
    stateModule = await import('./state.js');
    const { initInput } = await import('./input.js');
    initInput();
    secondary = document.getElementById('secondary-lyrics');

    document.querySelector('#saved-lyrics-grid .song-card').click();
    secondary.dispatchEvent(new Event('input'));
    flushInput();

    expect(stateModule.state.settings.fontSizePrimary).toBe(52);
    expect(stateModule.state.settings.fontSizeSecondary).toBe(30);
  });

  it('drops a pending debounce so a load is not overwritten by stale input', () => {
    primary.value = 'Saved song';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    saveBtn.click();

    primary.value = 'Half-typed replacement';
    primary.dispatchEvent(new Event('input')); // debounce still pending
    grid.querySelector('.song-card').click();
    flushInput();

    expect(primary.value).toBe('Saved song');
    expect(stateModule.state.primaryLyrics).toBe('Saved song');
  });

  it('removes a song when its delete button is clicked', () => {
    primary.value = 'Doomed song';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    saveBtn.click();

    grid.querySelector('.delete-card-btn').click();

    expect(grid.querySelectorAll('.song-card').length).toBe(0);
    expect(stateModule.state.savedLyrics).toEqual([]);
  });

  it('re-saving an edited song updates its card instead of adding a second one', () => {
    primary.value = 'Same title\nfirst version';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    saveBtn.click();

    primary.value = 'Same title\nsecond version';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    saveBtn.click();

    expect(grid.querySelectorAll('.song-card').length).toBe(1);
    expect(stateModule.state.savedLyrics[0].primary).toBe('Same title\nsecond version');
  });

  it('renders songs persisted from a previous session on init', async () => {
    primary.value = 'Persisted song';
    primary.dispatchEvent(new Event('input'));
    flushInput();
    saveBtn.click();

    // Reload the app against the same localStorage.
    document.body.innerHTML = HTML;
    vi.resetModules();
    stateModule = await import('./state.js');
    const { initInput } = await import('./input.js');
    initInput();

    expect(document.querySelectorAll('#saved-lyrics-grid .song-card').length).toBe(1);
    expect(document.querySelector('#saved-lyrics-grid .ref').textContent).toBe('Persisted song');
  });
});

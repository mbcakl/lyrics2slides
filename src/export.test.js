import { describe, it, expect } from 'vitest';
import { buildBackgroundMaster, BACKGROUND_MASTER } from './export.js';

describe('buildBackgroundMaster', () => {
  it('uses a plain color background without an image', () => {
    const master = buildBackgroundMaster({ color: '#123456', imageId: null, dim: 0.4 }, null);
    expect(master).toEqual({ title: BACKGROUND_MASTER, background: { color: '123456' }, objects: [] });
  });

  it('embeds the image once with a dim overlay', () => {
    const master = buildBackgroundMaster({ color: '#000000', imageId: 'x', dim: 0.4 }, 'data:image/jpeg;base64,AAA');
    expect(master.background).toEqual({ data: 'data:image/jpeg;base64,AAA', path: 'background.jpg' });
    expect(master.objects).toHaveLength(1);
    expect(master.objects[0].rect.fill).toEqual({ color: '000000', transparency: 60 });
  });

  it('skips the overlay when dim is zero', () => {
    const master = buildBackgroundMaster({ color: '#000000', imageId: 'x', dim: 0 }, 'data:image/jpeg;base64,AAA');
    expect(master.objects).toEqual([]);
  });
});

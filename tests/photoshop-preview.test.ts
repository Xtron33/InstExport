import { expect, test, vi } from 'vitest';
import type { PreviewPlan } from '../src/geometry/plans';
import { createPreviewDataUrl } from '../src/photoshop/preview';
import type { Photoshop, PhotoshopImageData } from '../src/photoshop/types';

const preview: PreviewPlan = {
  kind: 'full',
  documentID: 7,
  historyStateID: 12,
  sourceBounds: { left: 0, top: 0, right: 6000, bottom: 4000 },
  targetSize: { width: 480, height: 320 },
  canvas: { width: 240, height: 160 },
  image: { width: 240, height: 160 },
  offset: { left: 0, top: 0 },
  seams: [],
};

function mockPhotoshop(encode: () => Promise<string>) {
  const imageData: PhotoshopImageData = { dispose: vi.fn() };
  const getPixels = vi.fn(async () => ({ imageData }));
  const encodeImageData = vi.fn(encode);
  const imaging = { getPixels, encodeImageData } as Photoshop['imaging'];
  const executeAsModal = vi.fn(
    async (callback: Parameters<Photoshop['core']['executeAsModal']>[0]) =>
      callback({} as Parameters<typeof callback>[0]),
  );
  const core = { executeAsModal } as Photoshop['core'];
  return { photoshop: { core, imaging }, imageData, getPixels, encodeImageData, executeAsModal };
}

test('requests a small RGB composite and returns a JPEG data URL', async () => {
  const mock = mockPhotoshop(async () => 'encoded');

  await expect(createPreviewDataUrl(mock.photoshop, preview)).resolves.toBe(
    'data:image/jpeg;base64,encoded',
  );
  expect(mock.executeAsModal).toHaveBeenCalledWith(expect.any(Function), {
    commandName: 'Update preview',
  });
  expect(mock.getPixels).toHaveBeenCalledWith({
    documentID: 7,
    historyStateID: 12,
    sourceBounds: preview.sourceBounds,
    targetSize: preview.targetSize,
    colorSpace: 'RGB',
    colorProfile: 'sRGB IEC61966-2.1',
    componentSize: 8,
    applyAlpha: true,
  });
  expect(mock.imageData.dispose).toHaveBeenCalledOnce();
});

test('disposes Photoshop image data when encoding fails', async () => {
  const mock = mockPhotoshop(async () => {
    throw new Error('encode failed');
  });

  await expect(createPreviewDataUrl(mock.photoshop, preview)).rejects.toThrow('encode failed');
  expect(mock.imageData.dispose).toHaveBeenCalledOnce();
});

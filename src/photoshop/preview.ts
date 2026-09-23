import type { PreviewPlan } from '../geometry/plans';
import type { Photoshop } from './types';

let previewQueue: Promise<void> = Promise.resolve();

export async function createPreviewDataUrl(
  photoshop: Pick<Photoshop, 'core' | 'imaging'>,
  preview: PreviewPlan,
): Promise<string> {
  return photoshop.core.executeAsModal(
    async () => {
      const result = await photoshop.imaging.getPixels({
        documentID: preview.documentID,
        historyStateID: preview.historyStateID,
        sourceBounds: preview.sourceBounds,
        targetSize: preview.targetSize,
        colorSpace: 'RGB',
        colorProfile: 'sRGB IEC61966-2.1',
        componentSize: 8,
        applyAlpha: true,
      });

      try {
        const encoded = await photoshop.imaging.encodeImageData({
          imageData: result.imageData,
          base64: true,
        });
        return `data:image/jpeg;base64,${encoded}`;
      } finally {
        result.imageData.dispose();
      }
    },
    { commandName: i18n.t('photoshop.previewCommand') },
  );
}

export function getPreviewDataUrl(preview: PreviewPlan): Promise<string> {
  const photoshop = require('photoshop') as Photoshop;
  const task = previewQueue.then(
    () => createPreviewDataUrl(photoshop, preview),
    () => createPreviewDataUrl(photoshop, preview),
  );
  previewQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}
import i18n from '../i18n';

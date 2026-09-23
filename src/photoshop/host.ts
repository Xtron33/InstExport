import { exportPlan, ExportFailure, type ExportReport } from '../workflows/export';
import type { Plan } from '../geometry/plans';
import type { Photoshop, Uxp, PsDocument, FolderEntry } from './types';
import { DocumentInformation } from '../lib/types';
import i18n from '../i18n';

const ps = require('photoshop') as Photoshop;
export const uxp = require('uxp') as Uxp;

export async function chooseFolder() {
  return uxp.storage.localFileSystem.getFolder();
}
async function action(command: object) {
  const results = await ps.action.batchPlay([command], {});
  for (const result of results)
    if (result._obj === 'error' || (result.result !== undefined && result.result < 0)) {
      throw new Error(result.message || i18n.t('photoshop.operationFailed'));
    }
}
function assertSupported(doc: PsDocument) {
  if (doc.artboards.length) throw new Error(i18n.t('photoshop.artboards'));
  if (doc.pixelAspectRatio !== 1) throw new Error(i18n.t('photoshop.squarePixels'));
  if (
    doc.bitsPerChannel !== ps.constants.BitsPerChannelType.EIGHT &&
    doc.bitsPerChannel !== ps.constants.BitsPerChannelType.SIXTEEN
  ) {
    throw new Error(i18n.t('photoshop.bitDepth'));
  }
  const modes = ps.constants.DocumentMode;
  if (![modes.RGB, modes.CMYK, modes.LAB, modes.GRAYSCALE].includes(doc.mode))
    throw new Error(i18n.t('photoshop.colorMode'));
}

export async function runExport(
  info: DocumentInformation,
  plan: Plan,
  folder: FolderEntry,
  overwriteNames: string[],
  progress: (text: string) => void,
): Promise<ExportReport> {
  const tempRoot = await uxp.storage.localFileSystem.getTemporaryFolder();
  const staging = await tempRoot.createFolder(
    `instasaver-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const allowed = new Set(overwriteNames.map((n) => n.toLowerCase()));
  try {
    return await ps.core.executeAsModal(
      async (context) => {
        const source = Array.from(ps.app.documents).find((doc) => doc.id === info.id);
        if (!source) throw new Error(i18n.t('photoshop.sourceClosed'));
        if (
          source.width !== plan.source.width ||
          source.height !== plan.source.height ||
          source.name !== info.name
        )
          throw new Error(i18n.t('photoshop.sourceChanged'));
        assertSupported(source);
        const c = ps.constants;
        const checkCancelled = () => {
          if (context.isCancelled) throw new Error(i18n.t('photoshop.cancelled'));
        };
        return exportPlan(
          source,
          plan,
          {
            checkCancelled,
            async duplicate(from) {
              checkCancelled();
              const doc = await from.duplicate(`InstaSaver — ${from.name}`, true);
              try {
                await context.hostControl.registerAutoCloseDocument(doc.id);
              } catch (error) {
                await doc.closeWithoutSaving();
                throw error;
              }
              return doc;
            },
            async prepare(doc) {
              checkCancelled();
              ps.app.activeDocument = doc;
              doc.quickMaskMode = false;
              doc.activeChannels = doc.componentChannels;
              await doc.selection.deselect();
              if (doc.mode !== c.DocumentMode.RGB) await doc.changeMode(c.ChangeMode.RGB);
              await doc.convertProfile(
                'sRGB IEC61966-2.1',
                c.Intent.RELATIVECOLORIMETRIC,
                true,
                true,
              );
              if (doc.bitsPerChannel !== c.BitsPerChannelType.EIGHT)
                doc.bitsPerChannel = c.BitsPerChannelType.EIGHT;
              // A merged copy with transparency needs an explicit white layer underneath.
              if (!doc.backgroundLayer) {
                const white = await doc.createPixelLayer({ name: 'InstaSaver White' });
                await doc.selection.selectAll();
                await action({
                  _obj: 'fill',
                  using: { _enum: 'fillContents', _value: 'white' },
                  opacity: { _unit: 'percentUnit', _value: 100 },
                  mode: { _enum: 'blendMode', _value: 'normal' },
                  _options: { dialogOptions: 'dontDisplay' },
                });
                await doc.selection.deselect();
                await white.sendToBack();
              }
              await doc.flatten();
            },
            async resize(doc, target) {
              checkCancelled();
              ps.app.activeDocument = doc;
              if (doc.width !== target.image.width || doc.height !== target.image.height) {
                const enlarging =
                  target.image.width > doc.width || target.image.height > doc.height;
                await doc.resizeImage(
                  target.image.width,
                  target.image.height,
                  undefined,
                  enlarging ? c.ResampleMethod.BICUBICSMOOTHER : c.ResampleMethod.BICUBICSHARPER,
                );
              }
              if (doc.width !== target.canvas.width || doc.height !== target.canvas.height) {
                // Explicit white extension avoids depending on Photoshop's background swatch.
                // Center anchoring is the only position change; never translate layers afterward.
                await action({
                  _obj: 'canvasSize',
                  width: { _unit: 'pixelsUnit', _value: target.canvas.width },
                  height: { _unit: 'pixelsUnit', _value: target.canvas.height },
                  horizontal: { _enum: 'horizontalLocation', _value: 'center' },
                  vertical: { _enum: 'verticalLocation', _value: 'center' },
                  canvasExtensionColorType: { _enum: 'canvasExtensionColorType', _value: 'white' },
                  _options: { dialogOptions: 'dontDisplay' },
                });
              }
              if (doc.width !== target.canvas.width || doc.height !== target.canvas.height)
                throw new Error(i18n.t('photoshop.canvasSize'));
            },
            async crop(doc, left, right) {
              checkCancelled();
              ps.app.activeDocument = doc;
              await doc.crop({ left, top: 0, right, bottom: 1080 });
              if (doc.width !== 1080 || doc.height !== 1080)
                throw new Error(i18n.t('photoshop.sliceSize'));
            },
            async save(doc, name) {
              checkCancelled();
              ps.app.activeDocument = doc;
              const staged = await staging.createFile(name, { overwrite: false });
              await doc.saveAs.jpg(
                staged,
                {
                  quality: 12,
                  embedColorProfile: true,
                  formatOptions: c.JPEGFormatOptions.STANDARDBASELINE,
                },
                true,
              );
              checkCancelled();
              // Existing destination is touched only after JPEG encoding succeeded.
              await staged.copyTo(folder, { overwrite: allowed.has(name.toLowerCase()) });
            },
            async close(doc) {
              await doc.closeWithoutSaving();
              await context.hostControl.unregisterAutoCloseDocument(doc.id);
            },
            async restore(doc) {
              if (!context.isCancelled) ps.app.activeDocument = doc;
            },
          },
          progress,
        );
      },
      { commandName: i18n.t('photoshop.command') },
    );
  } catch (error) {
    if (error instanceof ExportFailure) throw error;
    throw new ExportFailure(error instanceof Error ? error.message : String(error), {
      saved: [],
      warnings: [],
    });
  } finally {
    // Never remove user files; this is the plugin-owned staging directory only.
    try {
      for (const entry of await staging.getEntries()) await entry.delete();
      await staging.delete();
    } catch (error) {
      console.warn('InstaSaver: temporary JPEG cleanup failed', error);
    }
  }
}

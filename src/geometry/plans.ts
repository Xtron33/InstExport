import { Mode, type DocumentInformation } from '../lib/types';
import i18n from '../i18n';

export interface Size {
  width: number;
  height: number;
}
export interface Layout {
  image: Size;
  canvas: Size;
  padding: { left: number; right: number; top: number; bottom: number };
}
export interface Output {
  name: string;
  size: Size;
  slice?: number;
}
export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export interface PreviewPlan {
  kind: 'slices' | 'full';
  documentID: number;
  historyStateID: number;
  sourceBounds: Bounds;
  targetSize: Size;
  canvas: Size;
  image: Size;
  offset: { left: number; top: number };
  seams: number[];
}
export interface Plan {
  mode: Mode;
  source: Size;
  full: Layout;
  strip?: Layout;
  count: number;
  outputs: Output[];
  warnings: string[];
  previews: PreviewPlan[];
}
export const MIN_RATIO = 3 / 4;
export const MAX_RATIO = 1.91;
const PREVIEW_MAX_WIDTH = 244;
const PREVIEW_MAX_HEIGHT = 160;
const PREVIEW_PIXEL_RATIO = 2;

function validate(size: Size) {
  if (
    ![size.width, size.height].every(
      (value) => Number.isInteger(value) && value > 0 && value <= 300000,
    )
  ) {
    throw new Error(i18n.t('plan.invalidSize'));
  }
}

export function layout(image: Size, canvas: Size): Layout {
  const dx = canvas.width - image.width,
    dy = canvas.height - image.height;
  if (dx < 0 || dy < 0) throw new Error(i18n.t('plan.outsideCanvas'));
  return {
    image,
    canvas,
    padding: {
      left: Math.floor(dx / 2),
      right: Math.ceil(dx / 2),
      top: Math.floor(dy / 2),
      bottom: Math.ceil(dy / 2),
    },
  };
}
export function fit(source: Size, canvas: Size, upscale: boolean): Layout {
  const scale = Math.min(
    canvas.width / source.width,
    canvas.height / source.height,
    upscale ? Infinity : 1,
  );
  return layout(
    {
      width: Math.max(1, Math.min(canvas.width, Math.round(source.width * scale))),
      height: Math.max(1, Math.min(canvas.height, Math.round(source.height * scale))),
    },
    canvas,
  );
}
export function universal(source: Size): Layout {
  const ratio = source.width / source.height;
  if (ratio < MIN_RATIO) return fit(source, { width: 1080, height: 1440 }, false);
  if (ratio > MAX_RATIO) return fit(source, { width: 1080, height: 566 }, false);
  const scale = Math.min(1, 1080 / source.width);
  const image = {
    width: Math.max(1, Math.round(source.width * scale)),
    height: Math.max(1, Math.round(source.height * scale)),
  };
  const canvas = { ...image };
  if (canvas.width / canvas.height > MAX_RATIO) canvas.height = Math.ceil(canvas.width / MAX_RATIO);
  if (canvas.width / canvas.height < MIN_RATIO) canvas.width = Math.ceil(canvas.height * MIN_RATIO);
  return layout(image, canvas);
}
export function baseName(name: string): string {
  // eslint-disable-next-line no-control-regex -- Strip control characters forbidden in filenames.
  const unsafeFilenameChars = /[<>:"/\\|?*\x00-\x1f]/g;
  let result = name
    .replace(/\.[^.]+$/, '')
    .replace(unsafeFilenameChars, '_')
    .replace(/[. ]+$/, '')
    .trim();
  if (!result) result = 'photo';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(result)) result = `_${result}`;
  return result.slice(0, 160);
}

function buildPreview(
  source: DocumentInformation,
  value: Layout,
  count: number,
  kind: PreviewPlan['kind'],
): PreviewPlan {
  const scale = Math.min(
    PREVIEW_MAX_WIDTH / value.canvas.width,
    PREVIEW_MAX_HEIGHT / value.canvas.height,
  );
  const canvas = {
    width: Math.max(1, Math.round(value.canvas.width * scale)),
    height: Math.max(1, Math.round(value.canvas.height * scale)),
  };
  const image = {
    width: Math.max(1, Math.round(value.image.width * scale)),
    height: Math.max(1, Math.round(value.image.height * scale)),
  };
  const offset = {
    left: Math.round(value.padding.left * scale),
    top: Math.round(value.padding.top * scale),
  };

  return {
    kind,
    documentID: source.id,
    historyStateID: source.historyStateID,
    sourceBounds: { left: 0, top: 0, right: source.width, bottom: source.height },
    targetSize: {
      width: image.width * PREVIEW_PIXEL_RATIO,
      height: image.height * PREVIEW_PIXEL_RATIO,
    },
    canvas,
    image,
    offset,
    seams: Array.from({ length: Math.max(0, count - 1) }, (_, index) =>
      Math.round(((index + 1) * canvas.width) / count),
    ),
  };
}

export function buildPlan(source: DocumentInformation, mode: Mode): Plan {
  validate(source);

  const name = baseName(source.name);
  const full =
    mode === Mode.Panorama ? fit(source, { width: 2160, height: 1132 }, true) : universal(source);

  const plan: Plan = {
    mode,
    source: { width: source.width, height: source.height },
    full,
    count: 0,
    outputs: [{ name: `${name}.jpg`, size: full.canvas }],
    warnings: [],
    previews: [buildPreview(source, full, 0, 'full')],
  };

  if (mode === Mode.Panorama) {
    if (source.width <= source.height) {
      throw new Error(i18n.t('plan.horizontalRequired'));
    }

    const ratio = source.width / source.height;
    const nearest = Math.round(ratio);
    plan.count = Math.max(
      2,
      Math.abs(source.width - nearest * source.height) <= 1 ? nearest : Math.ceil(ratio),
    );

    if (plan.count * 1080 > 300000) {
      throw new Error(i18n.t('plan.panoramaTooLarge'));
    }

    plan.strip = fit(source, { width: plan.count * 1080, height: 1080 }, true);

    for (let index = 0; index < plan.count; index += 1) {
      plan.outputs.push({
        name: `${name}-${index + 1}.jpg`,
        size: { width: 1080, height: 1080 },
        slice: index,
      });
    }

    if (plan.strip.padding.left || plan.strip.padding.right) {
      plan.warnings.push(i18n.t('plan.edgePadding'));
    }

    if (plan.count > 20) {
      plan.warnings.push(i18n.t('plan.manySquares'));
    }

    plan.warnings.push(i18n.t('plan.mixedRatios'));
  }

  if (
    mode === Mode.Universal &&
    full.image.width === source.width &&
    full.image.height === source.height
  ) {
    plan.warnings.push(i18n.t('plan.noUpscale'));
  }

  if (full.image.width > source.width || full.image.height > source.height) {
    plan.warnings.push(i18n.t('plan.upscale'));
  }

  if (plan.strip) {
    plan.previews = [
      buildPreview(source, plan.strip, plan.count, 'slices'),
      buildPreview(source, plan.full, 0, 'full'),
    ];
  }

  return plan;
}

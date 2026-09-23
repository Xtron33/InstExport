import { test, expect } from 'vitest';
import { buildPlan, universal, baseName, MAX_RATIO, MIN_RATIO } from '../src/geometry/plans';
import { Mode } from '../src/lib/types';

const document = (width: number, height: number, name = 'photo.psd') => ({
  id: 1,
  historyStateID: 10,
  name,
  width,
  height,
});

test('universal preserves native 3:2, 4:5, square and 3:4', () => {
  for (const [width, height, outW, outH] of [
    [6000, 4000, 1080, 720],
    [4000, 5000, 1080, 1350],
    [3000, 3000, 1080, 1080],
    [3000, 4000, 1080, 1440],
    [800, 1000, 800, 1000],
  ]) {
    const result = universal({ width, height });
    expect(result.canvas).toEqual({ width: outW, height: outH });
    expect(result.image).toEqual(result.canvas);
  }
});
test('out-of-range images gain symmetric background, not a crop', () => {
  const wide = universal({ width: 4000, height: 2000 });
  expect(wide.image).toEqual({ width: 1080, height: 540 });
  expect(wide.padding).toEqual({ left: 0, right: 0, top: 13, bottom: 13 });
  const tall = universal({ width: 2000, height: 3000 });
  expect(tall.image).toEqual({ width: 960, height: 1440 });
  expect(tall.padding.left).toBe(60);
  expect(tall.padding.right).toBe(60);
  expect(universal({ width: 200, height: 100 }).image).toEqual({ width: 200, height: 100 });
});
test('panorama count, padding and naming are derived from source', () => {
  for (const [w, count, side] of [
    [4000, 2, 0],
    [6000, 3, 0],
    [8000, 4, 0],
    [5000, 3, 270],
  ]) {
    const result = buildPlan(document(w, 2000, 'DSCF.123.RAF'), Mode.Panorama);
    expect(result.count).toBe(count);
    expect(result.strip!.padding.left).toBe(side);
    expect(result.outputs).toHaveLength(count + 1);
    expect(result.outputs[count].name).toBe(`DSCF.123-${count}.jpg`);
    expect(result.full.canvas).toEqual({ width: 2160, height: 1132 });
  }
  const full = buildPlan(document(4000, 2000, 'test.psd'), Mode.Panorama).full;
  expect(full.padding.top).toBe(26);
  expect(full.padding.bottom).toBe(26);
});
test('near integer ratios tolerate one source pixel only', () => {
  expect(buildPlan(document(6001, 2000, 'x'), Mode.Panorama).count).toBe(3);
  expect(buildPlan(document(6002, 2000, 'x'), Mode.Panorama).count).toBe(4);
});
test('preview plan contains a bounded imaging request and rendered geometry', () => {
  const plan = buildPlan(document(5000, 2000, 'wide.psd'), Mode.Panorama);
  const [slices, full] = plan.previews;

  expect(plan.previews).toHaveLength(2);
  expect(slices.kind).toBe('slices');
  expect(full.kind).toBe('full');
  expect(slices.documentID).toBe(1);
  expect(slices.historyStateID).toBe(10);
  expect(slices.sourceBounds).toEqual({ left: 0, top: 0, right: 5000, bottom: 2000 });
  expect(slices.canvas.width).toBeLessThanOrEqual(244);
  expect(slices.canvas.height).toBeLessThanOrEqual(160);
  expect(slices.targetSize).toEqual({
    width: slices.image.width * 2,
    height: slices.image.height * 2,
  });
  expect(slices.seams).toHaveLength(2);
  expect(slices.offset.left).toBeGreaterThan(0);
  expect(slices.offset.top).toBe(0);
  expect(full.seams).toEqual([]);
  expect(full.canvas).not.toEqual(slices.canvas);
});

test('universal plan contains only the full image preview', () => {
  const plan = buildPlan(document(4000, 5000), Mode.Universal);
  expect(plan.previews).toHaveLength(1);
  expect(plan.previews[0].kind).toBe('full');
});
test('geometry invariants across sizes and boundary ratios', () => {
  for (const width of [1, 2, 3, 191, 749, 750, 751, 1080, 1909, 1910, 1911, 6001, 299999]) {
    for (const height of [1, 2, 100, 566, 1000, 1440, 2000, 300000]) {
      const result = universal({ width, height });
      expect(result.image.width).toBeLessThanOrEqual(width);
      expect(result.image.height).toBeLessThanOrEqual(height);
      expect(result.image.width).toBeLessThanOrEqual(result.canvas.width);
      expect(result.image.height).toBeLessThanOrEqual(result.canvas.height);
      expect(result.canvas.width / result.canvas.height).toBeLessThanOrEqual(MAX_RATIO);
      expect(result.canvas.width / result.canvas.height).toBeGreaterThanOrEqual(MIN_RATIO);
      expect(Math.abs(result.padding.left - result.padding.right)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.padding.top - result.padding.bottom)).toBeLessThanOrEqual(1);
    }
  }
});
test('plan validation rejects invalid and non-horizontal panorama sources', () => {
  expect(() => buildPlan(document(1000, 2000, 'x'), Mode.Panorama)).toThrow(/horizontal image/);
  expect(() => buildPlan(document(0, 2000, 'x'), Mode.Universal)).toThrow();
  expect(() => buildPlan(document(300000, 1, 'x'), Mode.Panorama)).toThrow(/maximum/);
});
test('filenames remove only final extension and cannot create paths', () => {
  expect(baseName('a.b.RAF')).toBe('a.b');
  expect(baseName('CON.jpg')).toBe('_CON');
  expect(baseName('../a:b.jpg')).toBe('.._a_b');
  expect(baseName('.jpg')).toBe('photo');
});

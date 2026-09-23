import { test, expect } from 'vitest';
import { exportPlan, ExportFailure, type Driver } from '../src/workflows/export';
import { buildPlan } from '../src/geometry/plans';
import { findConflicts } from '../src/storage/conflicts';
import type { FolderEntry } from '../src/photoshop/types';
import { Mode } from '../src/lib/types';
function mock(failOn = '', cancelAfter = Infinity) {
  let sequence = 0;
  const open = new Set<number>();
  const saved: string[] = [],
    crops: number[][] = [],
    prepared: number[] = [],
    resized: number[] = [];
  let restored = false;
  const driver: Driver<number> = {
    async duplicate() {
      const id = ++sequence;
      open.add(id);
      return id;
    },
    async prepare(doc) {
      prepared.push(doc);
    },
    async resize(doc) {
      resized.push(doc);
    },
    async crop(doc, left, right) {
      crops.push([left, right]);
    },
    async save(doc, name) {
      if (name === failOn) throw new Error('disk full');
      saved.push(name);
    },
    async close(doc) {
      open.delete(doc);
    },
    async restore(doc) {
      expect(doc).toBe(0);
      restored = true;
    },
    checkCancelled() {
      if (saved.length >= cancelAfter) throw new Error('cancelled');
    },
  };
  return { driver, open, saved, crops, prepared, resized, restored: () => restored };
}
const plan = buildPlan(
  { id: 1, historyStateID: 10, width: 5000, height: 2000, name: 'photo.psd' },
  Mode.Panorama,
);
test('slices cover the entire prepared strip once and never modify source', async () => {
  const m = mock();
  const report = await exportPlan(0, plan, m.driver, () => {});
  expect(m.crops).toEqual([
    [0, 1080],
    [1080, 2160],
    [2160, 3240],
  ]);
  expect(report.saved).toEqual(['photo.jpg', 'photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg']);
  expect(m.prepared).not.toContain(0);
  expect(m.resized).not.toContain(0);
  expect(m.open.size).toBe(0);
  expect(m.restored()).toBe(true);
});
test('failed save reports partial output and closes all owned documents', async () => {
  const m = mock('photo-2.jpg');
  const operation = exportPlan(0, plan, m.driver, () => {});
  await expect(operation).rejects.toBeInstanceOf(ExportFailure);
  await expect(operation).rejects.toMatchObject({
    message: 'disk full',
    report: { saved: ['photo.jpg', 'photo-1.jpg'] },
  });
  expect(m.open.size).toBe(0);
  expect(m.restored()).toBe(true);
});
test('cancellation closes copies and keeps saved result accounting', async () => {
  const m = mock('', 1);
  await expect(exportPlan(0, plan, m.driver, () => {})).rejects.toThrow(/cancelled/);
  expect(m.open.size).toBe(0);
  expect(m.restored()).toBe(true);
  expect(m.saved).toEqual(['photo.jpg']);
});
test('cleanup is attempted after prepare failure', async () => {
  const m = mock();
  m.driver.prepare = async () => {
    throw new Error('profile failure');
  };
  await expect(exportPlan(0, plan, m.driver, () => {})).rejects.toThrow(/profile failure/);
  expect(m.open.size).toBe(0);
  expect(m.saved).toEqual([]);
});
test('conflicts are case insensitive and directories cannot be replaced', async () => {
  const folder = {
    getEntries: async () => [
      { name: 'PHOTO.JPG', isFile: true },
      { name: 'blocked.jpg', isFile: false },
    ],
  } as unknown as FolderEntry;
  expect(await findConflicts(folder, ['photo.jpg', 'new.jpg'])).toEqual(['photo.jpg']);
  await expect(findConflicts(folder, ['blocked.jpg'])).rejects.toThrow(/used by a folder/);
});

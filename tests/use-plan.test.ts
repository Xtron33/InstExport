import { beforeEach, expect, test, vi } from 'vitest';
import { Mode, type DocumentInformation } from '../src/lib/types';

const state = vi.hoisted(() => ({ document: null as DocumentInformation | null }));

vi.mock('react', () => ({ useMemo: (factory: () => unknown) => factory() }));
vi.mock('../src/lib/store/active-document.store', () => ({
  useActiveDocument: (selector: (value: typeof state) => unknown) => selector(state),
}));

import { usePlan } from '../src/lib/hooks/use-plan';

beforeEach(() => {
  state.document = null;
});

test('returns a render-safe error when no Photoshop document is open', () => {
  expect(usePlan({ mode: Mode.Universal })).toEqual({
    plan: null,
    error: 'An image must be open.',
  });
});

test('builds a plan from the active document and selected mode', () => {
  state.document = {
    id: 7,
    historyStateID: 10,
    name: 'DSCF.123.RAF',
    width: 5000,
    height: 2000,
  };

  const result = usePlan({ mode: Mode.Panorama });

  expect(result.error).toBeNull();
  expect(result.plan?.count).toBe(3);
  expect(result.plan?.outputs.map((output) => output.name)).toEqual([
    'DSCF.123.jpg',
    'DSCF.123-1.jpg',
    'DSCF.123-2.jpg',
    'DSCF.123-3.jpg',
  ]);
});

test('converts plan validation failures into hook errors', () => {
  state.document = {
    id: 7,
    historyStateID: 10,
    name: 'portrait.psd',
    width: 1000,
    height: 2000,
  };

  const result = usePlan({ mode: Mode.Panorama });

  expect(result.plan).toBeNull();
  expect(result.error).toMatch(/horizontal image/);
});

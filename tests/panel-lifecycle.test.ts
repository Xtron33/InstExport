import { afterEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createRoot: vi.fn(() => ({ render: vi.fn(), unmount: vi.fn() })),
  setup: vi.fn(),
}));
vi.mock('react-dom/client', () => ({ createRoot: mocks.createRoot }));
vi.mock('../src/photoshop/host', () => ({ uxp: { entrypoints: { setup: mocks.setup } } }));
vi.mock('../src/panel/App', () => ({ App: () => null }));
afterEach(() => vi.unstubAllGlobals());

test('panel reuses React root while hidden and creates a new root after destruction', async () => {
  const container = {};
  vi.stubGlobal('document', { getElementById: () => container });
  await import('../src/index');
  const panel = mocks.setup.mock.calls[0][0].panels.instexport;
  expect(mocks.createRoot).not.toHaveBeenCalled();

  panel.show();
  const first = mocks.createRoot.mock.results[0].value;
  expect(mocks.createRoot).toHaveBeenCalledWith(container);
  panel.hide();
  expect(first.unmount).not.toHaveBeenCalled();
  panel.show();
  expect(mocks.createRoot).toHaveBeenCalledTimes(1);
  expect(first.render).toHaveBeenCalledTimes(2);

  panel.destroy();
  panel.destroy();
  expect(first.unmount).toHaveBeenCalledTimes(1);
  panel.show();
  expect(mocks.createRoot).toHaveBeenCalledTimes(2);
  expect(mocks.createRoot.mock.results[1].value.render).toHaveBeenCalledTimes(1);
  panel.destroy();
});

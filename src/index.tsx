import './panel/styles.css';
import { createRoot, type Root } from 'react-dom/client';
import { App } from './panel/App';
import { uxp } from './photoshop/host';
import './i18n';

const container = document.getElementById('root')!;
let root: Root | null = null;
uxp.entrypoints.setup({
  panels: {
    instexport: {
      show() {
        root ??= createRoot(container);
        root.render(<App />);
      },
      hide() {
        /* Keep export state intact while the panel is hidden. */
      },
      destroy() {
        root?.unmount();
        root = null;
      },
    },
  },
});

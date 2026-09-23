import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import sharp from 'sharp';

const root = fileURLToPath(new URL('.', import.meta.url));
const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

const ICON_SOURCE = 'static/icon.png';

const icons = [
  {
    fileName: 'icons/plugin-icon@1x.png',
    size: 24,
  },
  {
    fileName: 'icons/plugin-icon@2x.png',
    size: 48,
  },
  {
    fileName: 'icons/panel-icon@1x.png',
    size: 23,
  },
  {
    fileName: 'icons/panel-icon@2x.png',
    size: 46,
  },
] as const;

function uxpAssets(): Plugin {
  return {
    name: 'instasaver-uxp-assets',

    buildStart() {
      // Changes to these files also trigger a Vite watch rebuild.
      for (const file of ['manifest.json', 'static/index.html', 'index.html', ICON_SOURCE]) {
        this.addWatchFile(path(file));
      }
    },

    async generateBundle() {
      for (const [source, fileName] of [
        ['manifest.json', 'manifest.json'],
        ['static/index.html', 'index.html'],
      ]) {
        this.emitFile({
          type: 'asset',
          fileName,
          source: await readFile(path(source), 'utf8'),
        });
      }

      const iconSource = await readFile(path(ICON_SOURCE));

      for (const icon of icons) {
        const source = await sharp(iconSource)
          .resize(icon.size, icon.size, {
            fit: 'contain',
          })
          .png()
          .toBuffer();

        this.emitFile({
          type: 'asset',
          fileName: icon.fileName,
          source,
        });
      }
    },

    async writeBundle() {
      // Check both UDT entrypoints after all assets have been written.
      for (const file of ['manifest.json', 'dist/manifest.json']) {
        const manifest = JSON.parse(await readFile(path(file), 'utf8'));
        const htmlPath = new URL(manifest.main, new URL(file, import.meta.url));
        const html = await readFile(htmlPath, 'utf8');

        for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
          await readFile(new URL(match[1], htmlPath));
        }
      }
    },
  };
}

export default defineConfig({
  root,
  publicDir: false,
  plugins: [uxpAssets()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'chrome85',
    sourcemap: true,
    minify: true,

    // UXP loads CommonJS, not browser ES modules or the Vite dev client.
    lib: {
      entry: path('src/index.tsx'),
      formats: ['cjs'],
      fileName: () => 'index.js',
      cssFileName: 'styles',
    },

    rollupOptions: {
      external: ['photoshop', 'uxp'],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

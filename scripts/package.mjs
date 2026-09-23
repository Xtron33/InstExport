import { build } from 'vite';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { zipSync } from 'fflate';
await build();
const manifest = JSON.parse(await readFile('dist/manifest.json', 'utf8'));
const files = {};
for (const name of await readdir('dist')) {
  if (!name.endsWith('.map')) files[name] = new Uint8Array(await readFile(`dist/${name}`));
}
await mkdir('release', { recursive: true });
const target = `release/InstExport-${manifest.version}.ccx`;
await writeFile(target, zipSync(files));
console.log(`Packaged ${target}. Installation must be verified in Creative Cloud / Photoshop.`);

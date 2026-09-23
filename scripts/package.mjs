import { build } from 'vite';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { zipSync } from 'fflate';

await build();

const distDir = 'dist';

const manifest = JSON.parse(await readFile(join(distDir, 'manifest.json'), 'utf8'));

async function collectFiles(dir, root = dir) {
  const result = {};

  for (const entry of await readdir(dir, {
    withFileTypes: true,
  })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      Object.assign(result, await collectFiles(fullPath, root));

      continue;
    }

    if (entry.name.endsWith('.map')) {
      continue;
    }

    const archivePath = relative(root, fullPath).replaceAll('\\', '/');

    result[archivePath] = new Uint8Array(await readFile(fullPath));
  }

  return result;
}

const files = await collectFiles(distDir);

await mkdir('release', {
  recursive: true,
});

const target = `release/InstExport-${manifest.version}.ccx`;

await writeFile(
  target,
  zipSync(files, {
    level: 9,
  }),
);

console.log(`Packaged ${target}`);

// Vite plugin: exposes `virtual:media-manifest`, a map of which photos and
// 3D models exist on disk for each specimen. Adding files to
// public/specimens/ROCK-XXXX/ is all it takes for them to appear on the site.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {
  SPECIMENS_DIR, ID_PATTERN, SIZES, DERIVED_DIR, scanSpecimenFolder, derivedName,
} from './lib/catalogue.mjs';

const VIRTUAL = 'virtual:media-manifest';
const RESOLVED = '\0' + VIRTUAL;

async function buildManifest() {
  const manifest = {};
  if (!fs.existsSync(SPECIMENS_DIR)) return manifest;
  for (const id of fs.readdirSync(SPECIMENS_DIR).filter((d) => ID_PATTERN.test(d))) {
    const { photosDir, photos, modelName, modelBytes } = scanSpecimenFolder(id);
    const base = `specimens/${id}`;
    const entries = [];
    for (const file of photos) {
      let width = null, height = null;
      try {
        const meta = await sharp(path.join(photosDir, file)).metadata();
        const rotated = (meta.orientation ?? 1) >= 5;
        width = rotated ? meta.height : meta.width;
        height = rotated ? meta.width : meta.height;
      } catch { /* unreadable image: still list it */ }
      const variant = (size) => {
        const name = derivedName(file, size);
        return fs.existsSync(path.join(photosDir, DERIVED_DIR, name))
          ? `${base}/photos/${DERIVED_DIR}/${encodeURIComponent(name)}`
          : `${base}/photos/${encodeURIComponent(file)}`; // dev fallback before `npm run media`
      };
      entries.push({
        file,
        original: `${base}/photos/${encodeURIComponent(file)}`,
        thumb: variant('thumb'),
        large: variant('large'),
        width, height,
      });
    }
    manifest[id] = {
      photos: entries,
      model: modelName ? { src: `${base}/${modelName}`, bytes: modelBytes } : null,
    };
  }
  return manifest;
}

export default function mediaManifest() {
  let server;
  return {
    name: 'museum-media-manifest',
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : null),
    async load(id) {
      if (id !== RESOLVED) return null;
      return `export default ${JSON.stringify(await buildManifest())};`;
    },
    configureServer(s) {
      server = s;
      s.watcher.add(SPECIMENS_DIR);
      const refresh = (file) => {
        if (!file.includes(path.join('public', 'specimens')) || file.includes(DERIVED_DIR)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      s.watcher.on('add', refresh);
      s.watcher.on('unlink', refresh);
    },
  };
}
export { SIZES };

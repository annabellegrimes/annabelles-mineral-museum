// npm run optimize-model -- ROCK-0004 "C:/path/to/polycam-export.glb" [--max-texture 2048]
//
// Shrinks a Polycam GLB/GLTF export for the web and saves it as
// public/specimens/<ID>/model.glb. The original export is never modified.
//  - welds and simplifies the mesh lightly (keeps visible detail)
//  - meshopt-compresses geometry
//  - resizes textures and re-encodes them as WebP
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup, prune, weld, simplify, textureCompress, meshopt, resample, center,
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import {
  readJSON, writeJSON, SPECIMENS_JSON, SPECIMENS_DIR, ID_PATTERN,
} from './lib/catalogue.mjs';

const [id, input, ...rest] = process.argv.slice(2);
const maxTexArg = rest.indexOf('--max-texture');
const maxTexture = maxTexArg >= 0 ? Number(rest[maxTexArg + 1]) : 2048;

if (!ID_PATTERN.test(id ?? '') || !input) {
  console.error('Usage: npm run optimize-model -- ROCK-0004 "path/to/export.glb" [--max-texture 2048]');
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`✖ File not found: ${input}`);
  process.exit(1);
}

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
});

const before = fs.statSync(input).size;
const doc = await io.read(input);
await doc.transform(
  center({ pivot: 'center' }),
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.75, error: 0.0005 }),
  resample(),
  prune(),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [maxTexture, maxTexture], quality: 88 }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);

const outDir = path.join(SPECIMENS_DIR, id);
fs.mkdirSync(path.join(outDir, 'photos'), { recursive: true });
const out = path.join(outDir, 'model.glb');
await io.write(out, doc);
const after = fs.statSync(out).size;

// Record the original scan filename in the catalogue, if the entry exists.
const specimens = readJSON(SPECIMENS_JSON);
const entry = specimens.find((s) => s.id === id);
if (entry) {
  entry.media ??= {};
  entry.media.originalScanFilename = path.basename(input);
  writeJSON(SPECIMENS_JSON, specimens);
}

const mb = (b) => (b / 1048576).toFixed(1) + ' MB';
console.log(`✔ ${id}: ${mb(before)} → ${mb(after)}  (public/specimens/${id}/model.glb)`);
if (!entry) console.warn(`⚠ ${id} is not in data/specimens.json yet — run "npm run new-specimen" first.`);

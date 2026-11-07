// Shared catalogue helpers used by the build plugin and the maintenance scripts.
// Runs in Node only (never shipped to the browser).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SPECIMENS_JSON = path.join(ROOT, 'data/specimens.json');
export const MINERALS_JSON = path.join(ROOT, 'data/minerals.json');
export const SPECIMENS_DIR = path.join(ROOT, 'public/specimens');

export const ID_PATTERN = /^ROCK-\d{4}$/;
export const PHOTO_EXT = /\.(jpe?g|png|webp)$/i;
export const MODEL_NAMES = ['model.glb', 'model.gltf'];
export const DERIVED_DIR = '_web';
export const SIZES = { thumb: 720, large: 2200 };

export const ID_STATUSES = ['confirmed', 'tentative', 'pending', 'unidentified'];
export const RECORD_STATUSES = ['complete', 'in-progress', 'awaiting-import'];
export const CONFIDENCE = ['high', 'medium', 'low'];
export const ACQUISITION_TYPES = ['purchased', 'collected', 'gift', 'trade', 'inherited', 'other'];
export const COLOURS = [
  'colourless', 'white', 'grey', 'black', 'brown', 'red', 'orange', 'yellow',
  'green', 'blue', 'purple', 'pink', 'metallic', 'multicoloured',
];

export const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

export const formatId = (n) => `ROCK-${String(n).padStart(4, '0')}`;
export const idNumber = (id) => Number(id.slice(5));

/** A blank specimen record. Every unknown is null / empty — never a guess. */
export function blankSpecimen(id) {
  return {
    id,
    recordStatus: 'in-progress',
    identification: {
      name: null, species: null, status: 'unidentified', confidence: null,
      method: null, notes: null, alternatives: [],
    },
    collection: {
      dateAcquired: null, acquisitionType: null, acquiredFrom: null,
      originalLabel: null, notes: null,
    },
    observations: {
      colours: [], colourDescription: null, habit: null, lustre: null,
      associatedMinerals: [], dimensions: null, mass: null, notes: null,
    },
    mineralogy: {},
    provenance: { documented: null, hypotheses: [], formationEnvironment: null, notes: null },
    media: { cover: null, photos: [], originalScanFilename: null, scanNotes: null },
  };
}

/** Lists the media files that physically exist for one specimen. */
export function scanSpecimenFolder(id) {
  const dir = path.join(SPECIMENS_DIR, id);
  const photosDir = path.join(dir, 'photos');
  const photos = fs.existsSync(photosDir)
    ? fs.readdirSync(photosDir).filter((f) => PHOTO_EXT.test(f)).sort()
    : [];
  const modelName = MODEL_NAMES.find((m) => fs.existsSync(path.join(dir, m))) ?? null;
  const modelBytes = modelName ? fs.statSync(path.join(dir, modelName)).size : 0;
  return { dir, photosDir, photos, modelName, modelBytes };
}

export const derivedName = (file, size) => `${file.replace(/\.[^.]+$/, '')}.${size}.webp`;

/**
 * Validates the catalogue. Returns { errors, warnings } as arrays of strings.
 * Errors fail the build; warnings are printed.
 */
export function validateCatalogue(specimens, minerals) {
  const errors = [];
  const warnings = [];
  const seen = new Set();
  const err = (id, msg) => errors.push(`${id}: ${msg}`);
  const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

  if (!Array.isArray(specimens)) return { errors: ['specimens.json must be a JSON array'], warnings };

  specimens.forEach((s, i) => {
    const id = s?.id ?? `entry #${i + 1}`;
    if (!s || typeof s !== 'object') return err(id, 'is not an object');
    if (!ID_PATTERN.test(s.id ?? '')) err(id, 'id must look like ROCK-0001');
    if (seen.has(s.id)) err(id, 'duplicate id');
    seen.add(s.id);

    if (s.recordStatus && !RECORD_STATUSES.includes(s.recordStatus))
      err(id, `recordStatus must be one of ${RECORD_STATUSES.join(', ')}`);

    const ident = s.identification ?? {};
    if (!ID_STATUSES.includes(ident.status))
      err(id, `identification.status must be one of ${ID_STATUSES.join(', ')}`);
    if (ident.confidence != null && !CONFIDENCE.includes(ident.confidence))
      warn(id, `identification.confidence "${ident.confidence}" is not one of ${CONFIDENCE.join('/')} (shown as written)`);
    if ((ident.status === 'confirmed' || ident.status === 'tentative') && !ident.name)
      err(id, `a ${ident.status} identification needs identification.name`);
    if (ident.status === 'unidentified' && ident.species)
      err(id, 'an unidentified specimen should not have identification.species');
    if (ident.species && !minerals[ident.species])
      warn(id, `species "${ident.species}" has no entry in data/minerals.json (reference properties will not be shown)`);
    (ident.alternatives ?? []).forEach((a, k) => {
      if (!a?.name) err(id, `identification.alternatives[${k}] needs a name`);
    });

    const acq = s.collection?.acquisitionType;
    if (acq && !ACQUISITION_TYPES.includes(acq))
      warn(id, `collection.acquisitionType "${acq}" is not one of ${ACQUISITION_TYPES.join(', ')}`);
    const date = s.collection?.dateAcquired;
    if (date && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(date))
      err(id, 'collection.dateAcquired must be YYYY, YYYY-MM or YYYY-MM-DD');

    (s.observations?.colours ?? []).forEach((c) => {
      if (!COLOURS.includes(c)) err(id, `colour "${c}" must be one of: ${COLOURS.join(', ')}`);
    });

    const prov = s.provenance ?? {};
    if (prov.documented && !prov.documented.locality)
      err(id, 'provenance.documented needs a locality (or set documented to null)');
    (prov.hypotheses ?? []).forEach((h, k) => {
      const where = `provenance.hypotheses[${k}]`;
      if (!h?.locality) err(id, `${where} needs a locality`);
      if (!CONFIDENCE.includes(h?.confidence)) err(id, `${where}.confidence must be one of ${CONFIDENCE.join('/')}`);
      if (!h?.evidence?.length) err(id, `${where} needs at least one piece of evidence — a hypothesis without evidence should not be listed`);
    });

    if (ID_PATTERN.test(s.id ?? '')) {
      const media = scanSpecimenFolder(s.id);
      if (!fs.existsSync(media.dir)) warn(id, `no media folder at public/specimens/${s.id}/`);
      const listed = (s.media?.photos ?? []).map((p) => (typeof p === 'string' ? p : p?.file));
      listed.forEach((f) => {
        if (!media.photos.includes(f)) err(id, `media.photos lists "${f}" but it is not in public/specimens/${s.id}/photos/`);
      });
      if (s.media?.cover && !media.photos.includes(s.media.cover))
        err(id, `media.cover "${s.media.cover}" is not in public/specimens/${s.id}/photos/`);
      if (media.modelBytes > 50 * 1024 * 1024)
        warn(id, `3D model is ${(media.modelBytes / 1048576).toFixed(0)} MB — run "npm run optimize-model" to shrink it`);
    }
  });

  // Gaps in numbering are allowed (a specimen may be removed) but worth knowing about.
  const nums = [...seen].filter((x) => ID_PATTERN.test(x)).map(idNumber).sort((a, b) => a - b);
  nums.forEach((n, k) => {
    if (k > 0 && n !== nums[k - 1] + 1) warnings.push(`catalogue: numbering jumps from ${formatId(nums[k - 1])} to ${formatId(n)}`);
  });

  // Media folders without a catalogue entry
  if (fs.existsSync(SPECIMENS_DIR)) {
    fs.readdirSync(SPECIMENS_DIR)
      .filter((d) => ID_PATTERN.test(d) && !seen.has(d))
      .forEach((d) => warnings.push(`${d}: media folder exists but there is no catalogue entry`));
  }

  return { errors, warnings };
}

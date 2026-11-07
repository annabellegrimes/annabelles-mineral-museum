// Browser-side view of the catalogue. Combines:
//   data/specimens.json  — what is known about each physical specimen
//   data/minerals.json   — general reference properties of mineral species
//   virtual:media-manifest — which photos / models actually exist on disk
import rawSpecimens from '../../data/specimens.json';
import minerals from '../../data/minerals.json';
import manifest from 'virtual:media-manifest';

const BASE = import.meta.env.BASE_URL;
export const asset = (p) => (p ? BASE + p : null);

export const STATUS = {
  confirmed: {
    label: 'Confirmed',
    short: 'Confirmed',
    blurb: 'Identification has been confirmed.',
  },
  tentative: {
    label: 'Tentative identification',
    short: 'Tentative',
    blurb: 'A working identification that has not been confirmed.',
  },
  pending: {
    label: 'Identification pending confirmation',
    short: 'Pending',
    blurb: 'A candidate identification exists but is awaiting confirmation.',
  },
  unidentified: {
    label: 'Unidentified',
    short: 'Unidentified',
    blurb: 'No identification has been made yet.',
  },
};
export const STATUS_ORDER = ['confirmed', 'tentative', 'pending', 'unidentified'];

export const CONFIDENCE_LABEL = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' };

export const COLOUR_SWATCH = {
  colourless: 'linear-gradient(135deg,#fff 0%,#e8eef0 50%,#fff 100%)',
  white: '#f6f4ef', grey: '#9a9a96', black: '#262423', brown: '#7b5435',
  red: '#a8322b', orange: '#d27a2c', yellow: '#e2c34a', green: '#4f8a52',
  blue: '#3d6fa8', purple: '#6f4c8c', pink: '#d891a6',
  metallic: 'linear-gradient(135deg,#d9d9d9 0%,#8c8c8c 45%,#f0f0f0 60%,#7a7a7a 100%)',
  multicoloured: 'conic-gradient(#a8322b,#e2c34a,#4f8a52,#3d6fa8,#6f4c8c,#a8322b)',
};

/** Title shown for a specimen, honest about uncertainty. */
function displayName(s) {
  const { name, status } = s.identification;
  if (status === 'unidentified' || !name) {
    return status === 'pending' ? 'Identification pending' : 'Unidentified specimen';
  }
  return name;
}

function orderPhotos(id, media) {
  const found = manifest[id]?.photos ?? [];
  const byFile = Object.fromEntries(found.map((p) => [p.file, p]));
  const listed = (media?.photos ?? [])
    .map((p) => (typeof p === 'string' ? { file: p } : p))
    .filter((p) => byFile[p.file]);
  const listedFiles = new Set(listed.map((p) => p.file));
  const ordered = [
    ...listed.map((p) => ({ ...byFile[p.file], caption: p.caption ?? null })),
    ...found.filter((p) => !listedFiles.has(p.file)).map((p) => ({ ...p, caption: null })),
  ];
  if (media?.cover) {
    const i = ordered.findIndex((p) => p.file === media.cover);
    if (i > 0) ordered.unshift(...ordered.splice(i, 1));
  }
  return ordered.map((p) => ({
    ...p,
    thumb: asset(p.thumb),
    large: asset(p.large),
    original: asset(p.original),
  }));
}

function enrich(s) {
  const species = s.identification.species ? minerals[s.identification.species] ?? null : null;
  const photos = orderPhotos(s.id, s.media);
  const model = manifest[s.id]?.model;
  // Mineral group for filtering: the specimen's own record wins, then the species reference.
  // Only used when an identification (confirmed or tentative) actually names a species.
  const hasWorkingId = s.identification.status === 'confirmed' || s.identification.status === 'tentative';
  const group = s.mineralogy?.group ?? (hasWorkingId ? species?.group : null) ?? null;
  return {
    ...s,
    title: displayName(s),
    species,
    group,
    colours: s.observations?.colours ?? [],
    photos,
    cover: photos[0] ?? null,
    model: model ? { src: asset(model.src), bytes: model.bytes } : null,
    searchText: [
      s.id, s.identification.name, s.identification.notes, group,
      ...(s.identification.alternatives ?? []).map((a) => a.name),
      s.collection?.acquiredFrom, s.collection?.originalLabel, s.collection?.notes,
      s.observations?.colourDescription, s.observations?.notes,
      ...(s.observations?.associatedMinerals ?? []),
      s.provenance?.documented?.locality,
      ...(s.provenance?.hypotheses ?? []).map((h) => h.locality),
    ].filter(Boolean).join(' ').toLowerCase(),
  };
}

export const specimens = rawSpecimens.map(enrich).sort((a, b) => a.id.localeCompare(b.id));
export const byId = Object.fromEntries(specimens.map((s) => [s.id, s]));
export { minerals };

export function facetCounts(list) {
  const groups = {}, colours = {}, statuses = {};
  list.forEach((s) => {
    const g = s.group ?? '__unknown';
    groups[g] = (groups[g] ?? 0) + 1;
    statuses[s.identification.status] = (statuses[s.identification.status] ?? 0) + 1;
    (s.colours.length ? s.colours : ['__unrecorded']).forEach((c) => {
      colours[c] = (colours[c] ?? 0) + 1;
    });
  });
  return { groups, colours, statuses };
}

export function formatDate(d) {
  if (!d) return null;
  const [y, m, day] = d.split('-').map(Number);
  if (!m) return String(y);
  const opts = { year: 'numeric', month: 'long', ...(day ? { day: 'numeric' } : {}) };
  return new Date(Date.UTC(y, m - 1, day || 1)).toLocaleDateString('en-CA', { ...opts, timeZone: 'UTC' });
}

export const formatBytes = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** External database search links for a species name. */
export function databaseLinks(name) {
  if (!name) return [];
  const q = encodeURIComponent(name);
  return [
    { label: 'Mindat', url: `https://www.mindat.org/search.php?search=${q}` },
    { label: 'RRUFF', url: `https://rruff.info/${q}` },
    { label: 'Webmineral', url: `https://www.webmineral.com/data/${q}.shtml` },
  ];
}

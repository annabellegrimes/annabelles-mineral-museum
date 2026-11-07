import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SpecimenCard from '../components/SpecimenCard.jsx';
import { Search } from '../components/Icons.jsx';
import {
  specimens, facetCounts, STATUS, STATUS_ORDER, COLOUR_SWATCH,
} from '../lib/catalogue.js';

const SORTS = {
  id: { label: 'Catalogue number', fn: (a, b) => a.id.localeCompare(b.id) },
  name: { label: 'Name', fn: (a, b) => (a.identification.name ?? '￿').localeCompare(b.identification.name ?? '￿') || a.id.localeCompare(b.id) },
  acquired: {
    label: 'Date acquired',
    fn: (a, b) => (b.collection?.dateAcquired ?? '').localeCompare(a.collection?.dateAcquired ?? '') || a.id.localeCompare(b.id),
  },
};

const splitParam = (v) => (v ? v.split(',').filter(Boolean) : []);

const GalleryCanvas = lazy(() => import('../components/Gallery3D.jsx').then((m) => ({ default: m.GalleryCanvas })));

const VIEW_KEY = 'museum.galleryView';
const webglAvailable = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
})();
function initialView() {
  try { return localStorage.getItem(VIEW_KEY) === 'photos' ? 'photos' : '3d'; } catch { return '3d'; }
}

export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState(initialView);
  const chooseView = (v) => {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode */ }
  };
  const anyModels = specimens.some((s) => s.model);
  const can3d = webglAvailable && anyModels;
  const show3d = can3d && view === '3d';
  const q = params.get('q') ?? '';
  const statuses = splitParam(params.get('status'));
  const colours = splitParam(params.get('colour'));
  const group = params.get('group') ?? '';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'id';

  useEffect(() => { document.title = "Annabelle's Mineral Museum"; }, []);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || (Array.isArray(value) && !value.length)) next.delete(key);
    else next.set(key, Array.isArray(value) ? value.join(',') : value);
    setParams(next, { replace: true });
  };
  const toggle = (key, list, v) => update(key, list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const facets = useMemo(() => facetCounts(specimens), []);
  const groupOptions = Object.keys(facets.groups).filter((g) => g !== '__unknown').sort();
  const colourOptions = Object.keys(facets.colours).filter((c) => c !== '__unrecorded');

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return specimens
      .filter((s) => terms.every((t) => s.searchText.includes(t)))
      .filter((s) => !statuses.length || statuses.includes(s.identification.status))
      .filter((s) => !group || (group === '__unknown' ? !s.group : s.group === group))
      .filter((s) => !colours.length || colours.some((c) => s.colours.includes(c)))
      .sort(SORTS[sort].fn);
  }, [q, statuses.join(), group, colours.join(), sort]);

  const filtering = q || statuses.length || colours.length || group;
  const stats = {
    total: specimens.length,
    models: specimens.filter((s) => s.model).length,
    confirmed: specimens.filter((s) => s.identification.status === 'confirmed').length,
  };

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">A personal natural history collection</div>
            <h1>Annabelle's <em>Mineral</em> Museum</h1>
            <p className="subtitle">An interactive collection of rocks, minerals, and geological curiosities.</p>
            <p className="lede">
              I've been collecting rocks and minerals for years, and my shelves have officially outgrown my ability
              to remember what anything is.
            </p>
            <p className="lede">
              Armed with an iPhone, Polycam, and a healthy amount of geological guesswork, I'm building a digital
              mineral museum: 3D-scanned specimens, interactive models, mineral identifications, and a little
              detective work into where they might have come from.
            </p>
          </div>
          <aside className="placard" aria-label="Collection status">
            <p className="construction">
              <span aria-hidden="true">⚒</span>
              <span><strong>Currently under construction.</strong> Turns out I have a lot of rocks.</span>
            </p>
            <dl className="stats">
              <div><dd>{stats.total}</dd><dt>Specimens</dt></div>
              <div><dd>{stats.models}</dd><dt>3D models</dt></div>
              <div><dd>{stats.confirmed}</dd><dt>Confirmed IDs</dt></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="wrap" aria-labelledby="collection-heading">
        <div className="section-head">
          <h2 id="collection-heading">The Collection</h2>
          <span className="mono muted" style={{ fontSize: '0.85rem' }}>
            {filtering ? `${results.length} of ${specimens.length}` : `${specimens.length} specimens`}
          </span>
        </div>

        <div className={`filters${filtersOpen ? ' is-open' : ''}`}>
          <div className="filter-row">
            <label className="search">
              <Search />
              <span className="sr-only">Search the collection</span>
              <input
                type="search" value={q} onChange={(e) => update('q', e.target.value)}
                placeholder="Search by name, ID, locality, notes…"
              />
            </label>
            <select className="select" value={sort} onChange={(e) => update('sort', e.target.value === 'id' ? '' : e.target.value)} aria-label="Sort by">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v.label}</option>)}
            </select>
            {can3d && (
              <div className="view-toggle" role="group" aria-label="Show specimens as">
                <button type="button" aria-pressed={view === '3d'} onClick={() => chooseView('3d')}>3D</button>
                <button type="button" aria-pressed={view === 'photos'} onClick={() => chooseView('photos')}>Photos</button>
              </div>
            )}
            <button type="button" className="chip filters-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}>
              Filters{(statuses.length + colours.length + (group ? 1 : 0)) ? ` (${statuses.length + colours.length + (group ? 1 : 0)})` : ''}
            </button>
          </div>

          <div className="filter-row collapsible">
            <span className="filter-label">Identification</span>
            <div className="chips">
              {STATUS_ORDER.map((st) => (
                <button
                  key={st} type="button" className="chip" aria-pressed={statuses.includes(st)}
                  onClick={() => toggle('status', statuses, st)} disabled={!facets.statuses[st] && !statuses.includes(st)}
                  title={STATUS[st].blurb}
                >
                  {STATUS[st].short} <span className="count">{facets.statuses[st] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row collapsible">
            <span className="filter-label">Group</span>
            <select className="select" value={group} onChange={(e) => update('group', e.target.value)} aria-label="Mineral group">
              <option value="">All mineral groups</option>
              {groupOptions.map((g) => <option key={g} value={g}>{g} ({facets.groups[g]})</option>)}
              {facets.groups.__unknown && <option value="__unknown">Not yet determined ({facets.groups.__unknown})</option>}
            </select>
          </div>

          <div className="filter-row collapsible">
            <span className="filter-label">Colour</span>
            <div className="chips">
              {colourOptions.length ? colourOptions.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={colours.includes(c)} onClick={() => toggle('colour', colours, c)}>
                  <span className="swatch" style={{ background: COLOUR_SWATCH[c] }} />
                  {c[0].toUpperCase() + c.slice(1)} <span className="count">{facets.colours[c]}</span>
                </button>
              )) : (
                <span className="unknown" style={{ fontSize: '0.88rem' }}>
                  Specimen colours haven't been recorded yet.
                </span>
              )}
            </div>
          </div>

          {filtering && (
            <div className="result-line">
              <span>Showing {results.length} of {specimens.length}</span>
              <button type="button" className="linklike" onClick={() => setParams({}, { replace: true })}>Clear all</button>
            </div>
          )}
        </div>

        {results.length ? (
          <div className="grid">
            {results.map((s) => <SpecimenCard key={s.id} s={s} show3d={show3d} />)}
          </div>
        ) : (
          <div className="empty">
            <p>No specimens match those filters.</p>
            <button type="button" className="linklike" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
          </div>
        )}
      </section>

      {show3d && (
        <Suspense fallback={null}>
          <GalleryCanvas />
        </Suspense>
      )}
    </>
  );
}

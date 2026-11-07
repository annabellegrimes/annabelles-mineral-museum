import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MediaStage from '../components/MediaStage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { Field, Fields, Panel, list } from '../components/Fields.jsx';
import { External, Chevron } from '../components/Icons.jsx';
import NotFound from './NotFound.jsx';
import {
  byId, specimens, STATUS, CONFIDENCE_LABEL, formatDate, formatBytes, databaseLinks,
} from '../lib/catalogue.js';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function Specimen() {
  const { id } = useParams();
  const s = byId[id?.toUpperCase()];

  useEffect(() => {
    if (s) document.title = `${s.id} · ${s.title} — Annabelle's Mineral Museum`;
  }, [s]);

  if (!s) return <NotFound what={`specimen ${id}`} />;

  const idx = specimens.findIndex((x) => x.id === s.id);
  const prev = specimens[idx - 1];
  const next = specimens[idx + 1];
  const { identification: ident, collection: col = {}, observations: obs = {}, provenance: prov = {} } = s;
  const uncertain = ident.status !== 'confirmed';

  return (
    <article className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Collection</Link><span aria-hidden="true">/</span><span className="mono">{s.id}</span>
      </nav>

      <header className="specimen-head">
        <span className="id">{s.id}</span>
        <h1 className={uncertain ? 'is-uncertain' : ''}>
          {s.title}{ident.status === 'tentative' && <span aria-label="(tentative)">?</span>}
        </h1>
        <div className="head-row">
          <StatusBadge status={ident.status} large />
          {ident.confidence && <span>{CONFIDENCE_LABEL[ident.confidence] ?? ident.confidence}</span>}
          {s.group && <span>{s.group}</span>}
        </div>
        {s.recordStatus === 'awaiting-import' && (
          <p className="record-note">
            This entry is a placeholder. Its details are still being transcribed from the collection catalogue,
            so anything shown as “Not recorded” may simply not have been entered yet.
          </p>
        )}
      </header>

      <div className="specimen-layout">
        <div className="media-col">
          <MediaStage specimen={s} />
        </div>

        <div className="label-card">
          <Panel title="Identification" id="p-ident">
            <Fields>
              <Field label="Identified as" value={ident.name} unknown={ident.status === 'unidentified' ? 'Not yet identified' : 'Not recorded'} />
              <Field label="Status">{STATUS[ident.status]?.label}</Field>
              <Field label="Confidence" value={ident.confidence ? (CONFIDENCE_LABEL[ident.confidence] ?? ident.confidence) : null} />
              <Field label="How identified" value={ident.method} />
              <Field label="Identification notes" value={ident.notes} />
              {ident.alternatives?.length > 0 && (
                <Field label="Alternatives considered">
                  <ul className="alt-list">
                    {ident.alternatives.map((a) => (
                      <li key={a.name}><strong>{a.name}</strong>{a.notes && <> — {a.notes}</>}</li>
                    ))}
                  </ul>
                </Field>
              )}
            </Fields>
          </Panel>

          <Panel title="Collection record" id="p-col">
            <Fields>
              <Field label="Catalogue number"><span className="mono">{s.id}</span></Field>
              <Field label="Date acquired" value={formatDate(col.dateAcquired)} />
              <Field label="Acquired" value={[cap(col.acquisitionType), col.acquiredFrom].filter(Boolean).join(' — ') || null} />
              <Field label="Original label">
                {col.originalLabel ? <span className="quote">“{col.originalLabel}”</span> : null}
              </Field>
              <Field label="Notes" value={col.notes} />
            </Fields>
          </Panel>

          <Panel title="This specimen" id="p-obs" intro="Observations made on this particular specimen.">
            <Fields>
              <Field label="Colour" value={obs.colourDescription ?? list(obs.colours?.map(cap))} />
              <Field label="Crystal habit" value={obs.habit} />
              <Field label="Lustre" value={obs.lustre} />
              <Field label="Associated minerals" value={list(obs.associatedMinerals)} />
              <Field label="Dimensions" value={obs.dimensions} />
              <Field label="Mass" value={obs.mass} />
              <Field label="Notes" value={obs.notes} />
            </Fields>
          </Panel>

          <Mineralogy s={s} />

          <Provenance prov={prov} species={s.species} status={ident.status} />

          <Panel title="Media" id="p-media">
            <Fields>
              <Field label="Photographs" value={s.photos.length ? `${s.photos.length}` : null} unknown="None yet" />
              <Field label="3D model" value={s.model ? `Yes · ${formatBytes(s.model.bytes)}` : null} unknown="None yet" />
              <Field label="Original scan file" value={s.media?.originalScanFilename ? <span className="mono">{s.media.originalScanFilename}</span> : null} />
            </Fields>
          </Panel>

          {ident.name && ident.status !== 'unidentified' && (
            <Panel title="Further reading" id="p-links" intro={`External mineralogical databases — entries for ${ident.name} in general${ident.status !== 'confirmed' ? ', for comparison with the proposed identification' : ''}.`}>
              <div className="ext-links">
                {databaseLinks(ident.name).map((l) => (
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer">{l.label} <External /></a>
                ))}
                {s.species?.sources?.map((src) => (
                  <a key={src.url} href={src.url} target="_blank" rel="noreferrer">{src.label.split(' — ')[0]} <External /></a>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <nav className="pager" aria-label="Neighbouring specimens">
        {prev ? (
          <Link to={`/specimen/${prev.id}`}>
            <span className="eyebrow"><Chevron dir="left" style={{ width: 12, height: 12, verticalAlign: '-1px' }} /> {prev.id}</span>
            <span className="t">{prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/specimen/${next.id}`}>
            <span className="eyebrow">{next.id} <Chevron style={{ width: 12, height: 12, verticalAlign: '-1px' }} /></span>
            <span className="t">{next.title}</span>
          </Link>
        ) : <span />}
      </nav>
    </article>
  );
}

const MINERALOGY_FIELDS = [
  ['formula', 'Chemical formula', (v) => <span className="formula">{v}</span>],
  ['group', 'Mineral group'],
  ['class', 'Class'],
  ['crystalSystem', 'Crystal system'],
  ['hardness', 'Hardness (Mohs)'],
  ['specificGravity', 'Specific gravity'],
  ['colour', 'Typical colour'],
  ['streak', 'Streak'],
  ['lustre', 'Lustre'],
  ['habit', 'Typical habit'],
  ['typicalAssociates', 'Commonly associated with', (v) => v.join(', ')],
];

function Mineralogy({ s }) {
  const { status, name } = s.identification;
  const own = s.mineralogy ?? {};
  const ownEntries = MINERALOGY_FIELDS.filter(([k]) => own[k] != null && own[k] !== '');
  const ref = status === 'unidentified' ? null : s.species;

  let caveat = null;
  if (ref) {
    caveat = {
      confirmed: `General properties of ${ref.name} as a species, from published references. They describe the mineral in general — they are not measurements of this specimen.`,
      tentative: `Shown on the assumption that the tentative identification as ${ref.name} is correct; if it is revised, these will change. General species properties, not measurements of this specimen.`,
      pending: `Properties of ${ref.name}, the candidate identification awaiting confirmation. General species properties, not measurements of this specimen.`,
    }[status];
  }

  return (
    <Panel title="Mineralogy" id="p-min">
      {ownEntries.length > 0 && (
        <Fields>
          {ownEntries.map(([k, label, fmt]) => <Field key={k} label={label}>{fmt ? fmt(own[k]) : own[k]}</Field>)}
          {own.properties?.length > 0 && (
            <Field label="Notable properties"><ul className="prop-list">{own.properties.map((p) => <li key={p}>{p}</li>)}</ul></Field>
          )}
        </Fields>
      )}
      {ref ? (
        <div className="reference" style={ownEntries.length ? { marginTop: 14 } : undefined}>
          <p className={`caveat${status === 'confirmed' ? ' confirmed' : ''}`}>
            <span aria-hidden="true">ⓘ</span><span>{caveat}</span>
          </p>
          <Fields>
            {MINERALOGY_FIELDS.filter(([k]) => ref[k] != null && !(Array.isArray(ref[k]) && !ref[k].length)).map(([k, label, fmt]) => (
              <Field key={k} label={label}>{fmt ? fmt(ref[k]) : ref[k]}</Field>
            ))}
          </Fields>
          {ref.properties?.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginTop: 12 }}>Interesting properties</div>
              <ul className="prop-list">{ref.properties.map((p) => <li key={p}>{p}</li>)}</ul>
            </>
          )}
          {ref.sources?.length > 0 && (
            <div className="sources">
              Source: {ref.sources.map((src, i) => (
                <span key={src.url}>{i > 0 && '; '}<a href={src.url} target="_blank" rel="noreferrer">{src.label}</a></span>
              ))}
            </div>
          )}
        </div>
      ) : (
        !ownEntries.length && (
          <p className="notice">
            {status === 'unidentified' || !name
              ? 'Mineralogical properties will be added once the specimen has been identified.'
              : `No reference properties have been added for ${name} yet.`}
          </p>
        )
      )}
    </Panel>
  );
}

function Provenance({ prov, species, status }) {
  const hyps = prov.hypotheses ?? [];
  return (
    <Panel title="Geological provenance" id="p-prov">
      <p className="notice">
        Where a mineral is commonly found is <em>not</em> evidence of where this particular specimen came from.
        Only a documented origin is treated as known; anything else is a hypothesis, shown with its evidence.
      </p>

      {prov.documented ? (
        <div className="documented">
          <div className="eyebrow">Documented origin</div>
          <p><strong>{prov.documented.locality}</strong></p>
          {prov.documented.source && <p className="muted" style={{ fontSize: '0.88rem' }}>Source: {prov.documented.source}</p>}
        </div>
      ) : (
        <Fields>
          <Field label="Documented origin" value={null} unknown="Unknown — no documented locality" />
        </Fields>
      )}

      {hyps.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Possible origins (speculative)</div>
          {hyps.map((h, i) => (
            <div className="hypothesis" key={i}>
              <h3>{h.locality} <span className="conf">{CONFIDENCE_LABEL[h.confidence] ?? h.confidence}</span></h3>
              <h4>Evidence</h4>
              <ul>{h.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
              {h.against?.length > 0 && (<><h4>Against / caveats</h4><ul>{h.against.map((e) => <li key={e}>{e}</li>)}</ul></>)}
            </div>
          ))}
        </div>
      )}

      <Fields>
        {!prov.documented && hyps.length === 0 && (
          <Field label="Possible origins" value={null} unknown="No hypotheses yet" />
        )}
        <Field label="Formation environment (this specimen)" value={prov.formationEnvironment} />
        {!prov.formationEnvironment && species?.formationEnvironment && status !== 'unidentified' && (
          <Field label={`Typical setting for ${species.name}`}>
            <span className="muted">{species.formationEnvironment}</span>
          </Field>
        )}
        <Field label="Notes" value={prov.notes} />
      </Fields>
    </Panel>
  );
}

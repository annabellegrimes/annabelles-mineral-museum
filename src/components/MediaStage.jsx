import { lazy, Suspense, useState } from 'react';
import PhotoGallery from './PhotoGallery.jsx';
import { Cube } from './Icons.jsx';
import { formatBytes } from '../lib/catalogue.js';

const ModelViewer = lazy(() => import('./ModelViewer.jsx'));
const AUTOLOAD_BYTES = 12 * 1024 * 1024; // smaller models load straight away

export default function MediaStage({ specimen }) {
  const { model, photos, title, id } = specimen;
  const [tab, setTab] = useState(model ? '3d' : 'photos');
  const [requested, setRequested] = useState(() => !!model && model.bytes <= AUTOLOAD_BYTES);
  const [failed, setFailed] = useState(false);

  const showTabs = !!model;
  const showModel = model && tab === '3d';

  return (
    <div>
      {showTabs && (
        <div className="tabs" role="tablist" aria-label="Specimen media">
          <button type="button" role="tab" className="tab" aria-selected={tab === '3d'} onClick={() => setTab('3d')}>3D model</button>
          <button type="button" role="tab" className="tab" aria-selected={tab === 'photos'} onClick={() => setTab('photos')}>
            Photographs{photos.length ? ` (${photos.length})` : ''}
          </button>
        </div>
      )}

      {showModel && failed && (
        <div className="viewer">
          {photos[0] && <img className="viewer-poster" src={photos[0].large} alt="" />}
          <div className="viewer-overlay">
            <p className="viewer-error">
              The 3D model couldn’t be displayed on this device.
              {photos.length ? ' The photographs are shown instead.' : ''}
            </p>
          </div>
        </div>
      )}

      {showModel && !failed && (requested ? (
        <Suspense fallback={<div className="viewer"><div className="viewer-overlay"><span>Preparing viewer…</span></div></div>}>
          <ModelViewer src={model.src} title={title} onError={() => { setFailed(true); }} />
        </Suspense>
      ) : (
        <div className="viewer">
          {photos[0] && <img className="viewer-poster" src={photos[0].large} alt="" />}
          <div className="viewer-overlay">
            <button type="button" className="load-btn" onClick={() => setRequested(true)}>
              <span className="ring"><Cube /></span>
              <strong>Explore in 3D</strong>
              <small>{formatBytes(model.bytes)} download</small>
            </button>
          </div>
        </div>
      ))}

      {showModel && failed && photos.length > 0 && <div style={{ marginTop: 16 }}><PhotoGallery photos={photos} title={title} id={id} /></div>}

      {!showModel && <PhotoGallery photos={photos} title={title} id={id} />}

      {model && tab === '3d' && (
        <p className="scan-note">
          <strong>About this scan.</strong> Made with an iPhone and Polycam. Photogrammetry struggles with translucent,
          reflective and finely crystalline surfaces, so fine needles, sparkle and transparency may look smoothed,
          blurred or missing — the photographs are the better record of true colour and detail.
          {specimen.media?.scanNotes && <> {specimen.media.scanNotes}</>}
        </p>
      )}
      {!model && (
        <p className="scan-note">
          {photos.length ? 'No 3D scan has been added for this specimen yet.' : 'No photographs or 3D scan have been added for this specimen yet.'}
        </p>
      )}
    </div>
  );
}

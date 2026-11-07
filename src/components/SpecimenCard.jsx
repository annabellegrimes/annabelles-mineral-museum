import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import Placeholder from './Placeholder.jsx';
import { Cube } from './Icons.jsx';

const CardModel = lazy(() => import('./Gallery3D.jsx').then((m) => ({ default: m.CardModel })));

/** True once the element has come within `margin` of the viewport (then stays true). */
function useNearViewport(ref, enabled, margin = '300px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!enabled || near || !ref.current) return;
    if (!('IntersectionObserver' in window)) { setNear(true); return; }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: margin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, enabled, near, margin]);
  return near;
}

export default function SpecimenCard({ s, show3d = false }) {
  const uncertain = s.identification.status !== 'confirmed';
  const plateRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const want3d = show3d && !!s.model && !failed;
  const near = useNearViewport(plateRef, want3d);
  const onLoaded = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const showing3d = want3d && ready;

  return (
    <Link
      to={`/specimen/${s.id}`}
      className="card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={plateRef} className={`plate${showing3d ? ' is-3d' : ''}`}>
        {s.cover ? (
          <img
            src={s.cover.thumb}
            alt={showing3d ? '' : `${s.title} (${s.id})`}
            loading="lazy"
            decoding="async"
            width={s.cover.width ?? undefined}
            height={s.cover.height ?? undefined}
          />
        ) : (
          !showing3d && <Placeholder />
        )}
        {want3d && near && (
          <Suspense fallback={null}>
            <CardModel src={s.model.src} id={s.id} hovered={hovered} onLoaded={onLoaded} onError={onError} />
          </Suspense>
        )}
        {showing3d && <span className="sr-only">Rotating 3D scan of {s.title} ({s.id})</span>}
        {s.model && (
          <span className="badge-3d"><Cube /> 3D</span>
        )}
      </div>
      <div className="card-meta">
        <span className="id">{s.id}</span>
        <h3 className={uncertain ? 'is-uncertain' : ''}>
          {s.title}
          {s.identification.status === 'tentative' && <span aria-hidden="true">?</span>}
        </h3>
        <div className="sub">
          <StatusBadge status={s.identification.status} short />
          {s.group && <span className="group">{s.group}</span>}
        </div>
      </div>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import Placeholder from './Placeholder.jsx';
import { Cube } from './Icons.jsx';

export default function SpecimenCard({ s }) {
  const uncertain = s.identification.status !== 'confirmed';
  return (
    <Link to={`/specimen/${s.id}`} className="card">
      <div className="plate">
        {s.cover ? (
          <img
            src={s.cover.thumb}
            alt={`${s.title} (${s.id})`}
            loading="lazy"
            decoding="async"
            width={s.cover.width ?? undefined}
            height={s.cover.height ?? undefined}
          />
        ) : (
          <Placeholder />
        )}
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

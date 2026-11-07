import { CrystalMark } from './Icons.jsx';

/** Clearly-labelled stand-in when no photograph exists. Never a fake specimen image. */
export default function Placeholder({ label = 'Photograph forthcoming', id }) {
  return (
    <div className="placeholder" role="img" aria-label={`${label}${id ? ` for ${id}` : ''}`}>
      <div>
        <CrystalMark />
        <div className="ph-label">{label}</div>
        {id && <div className="mono muted" style={{ fontSize: '0.75rem', marginTop: 6 }}>{id}</div>}
      </div>
    </div>
  );
}

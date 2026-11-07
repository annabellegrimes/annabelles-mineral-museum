import { STATUS } from '../lib/catalogue.js';

export default function StatusBadge({ status, large = false, short = false }) {
  const s = STATUS[status] ?? STATUS.unidentified;
  return (
    <span className={`status${large ? ' lg' : ''}`} data-status={status} title={s.blurb}>
      <span className="dot" aria-hidden="true" />
      {short ? s.short : s.label}
    </span>
  );
}

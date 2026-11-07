import { useEffect, useRef, useState } from 'react';
import Placeholder from './Placeholder.jsx';
import { Close, Chevron } from './Icons.jsx';

export default function PhotoGallery({ photos, title, id }) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, photos.length]);

  if (!photos.length) {
    return (
      <div className="photo-main" style={{ cursor: 'default' }}>
        <Placeholder id={id} />
      </div>
    );
  }

  const current = photos[index] ?? photos[0];
  const alt = (i) => `${title} (${id}) — photograph ${i + 1} of ${photos.length}`;

  return (
    <div>
      <button type="button" className="photo-main" onClick={() => setOpen(true)} aria-label={`Enlarge photograph ${index + 1}`}>
        <img src={current.large} alt={alt(index)} width={current.width ?? undefined} height={current.height ?? undefined} />
      </button>
      {current.caption && <p className="photo-caption">{current.caption}</p>}
      {photos.length > 1 && (
        <div className="thumbs" role="list">
          {photos.map((p, i) => (
            <button
              key={p.file} type="button" role="listitem" className="thumb"
              aria-current={i === index} onClick={() => setIndex(i)} aria-label={`Show photograph ${i + 1}`}
            >
              <img src={p.thumb} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <dialog ref={dialogRef} className="lightbox" onClose={() => setOpen(false)} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="lightbox-inner" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          {open && <img src={current.original} alt={alt(index)} />}
          <button type="button" className="lb-btn lb-close" onClick={() => setOpen(false)} aria-label="Close"><Close /></button>
          {photos.length > 1 && (
            <>
              <button type="button" className="lb-btn lb-prev" onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)} aria-label="Previous photograph"><Chevron dir="left" /></button>
              <button type="button" className="lb-btn lb-next" onClick={() => setIndex((i) => (i + 1) % photos.length)} aria-label="Next photograph"><Chevron /></button>
              <span className="lb-count">{index + 1} / {photos.length}</span>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}

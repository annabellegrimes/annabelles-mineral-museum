/** A definition-list row that is explicit when something is unknown. */
export function Field({ label, children, value, unknown = 'Not recorded' }) {
  const content = children ?? value;
  const empty = content == null || content === '' || (Array.isArray(content) && content.length === 0);
  return (
    <div className="field">
      <dt>{label}</dt>
      <dd>{empty ? <span className="unknown">{unknown}</span> : content}</dd>
    </div>
  );
}

export function Fields({ children }) {
  return <dl className="fields">{children}</dl>;
}

export function Panel({ title, intro, children, id }) {
  return (
    <section className="panel" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {intro && <p className="panel-intro">{intro}</p>}
      {children}
    </section>
  );
}

export const list = (arr) => (arr?.length ? arr.join(', ') : null);

import { Link } from 'react-router-dom';

export default function NotFound({ what = 'that page' }) {
  return (
    <div className="wrap prose" style={{ paddingBottom: 40 }}>
      <h1>Not in the collection</h1>
      <p>We couldn't find {what}. It may not have been catalogued yet.</p>
      <p><Link to="/">← Back to the collection</Link></p>
    </div>
  );
}

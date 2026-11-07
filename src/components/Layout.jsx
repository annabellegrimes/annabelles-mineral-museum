import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CrystalMark, Strata, Sun, Moon } from './Icons.jsx';

const HOME = 'https://annabelle-grimes.com/';

/** Same behaviour as the toggle on annabelle-grimes.com: follows the system until clicked. */
function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme')
    ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch { /* private mode */ }
}

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <header className="site-header">
        <div className="wrap">
          <div className="brand">
            <a className="home-name" href={HOME}>Annabelle Grimes</a>
            <span className="brand-sep" aria-hidden="true">/</span>
            <Link to="/" className="wordmark" aria-label="Mineral Museum — collection">
              <CrystalMark />
              <span className="wordmark-text">Mineral Museum</span>
            </Link>
          </div>
          <nav className="site-nav" aria-label="Museum">
            <NavLink to="/" end>Collection</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
          <a className="back-home" href={HOME}>&larr; <span className="long">Back to </span>home</a>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
            <Sun className="i-sun" /><Moon className="i-moon" />
          </button>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <Strata className="strata" />
        <div className="wrap" style={{ marginTop: 28 }}>
          <span>Annabelle's Mineral Museum · a personal collection, catalogued with an iPhone and Polycam.</span>
          <span>
            By <a href={HOME}>Annabelle Grimes</a>
            {' · '}
            <a href="https://github.com/annabellegrimes/annabelles-mineral-museum">Source on GitHub</a>
          </span>
        </div>
      </footer>
    </>
  );
}

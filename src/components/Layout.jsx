import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CrystalMark, Strata } from './Icons.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <header className="site-header">
        <div className="wrap">
          <Link to="/" className="wordmark" aria-label="Annabelle's Mineral Museum — home">
            <CrystalMark />
            <span className="wordmark-text">Annabelle's <em>Mineral</em><span className="long"> Museum</span></span>
          </Link>
          <nav className="site-nav" aria-label="Main">
            <NavLink to="/" end>Collection</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
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
            <a href="https://annabelle-grimes.com">annabelle-grimes.com</a>
            {' · '}
            <a href="https://github.com/annabellegrimes/annabelles-mineral-museum">Source on GitHub</a>
          </span>
        </div>
      </footer>
    </>
  );
}

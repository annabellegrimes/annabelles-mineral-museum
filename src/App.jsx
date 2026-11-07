import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Gallery from './pages/Gallery.jsx';
import Specimen from './pages/Specimen.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

// HashRouter keeps deep links (…/#/specimen/ROCK-0004) working on GitHub Pages,
// which cannot rewrite unknown paths to index.html.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Gallery />} />
          <Route path="specimen/:id" element={<Specimen />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

# Annabelle's Mineral Museum

*An interactive collection of rocks, minerals, and geological curiosities.*

**🔗 https://annabellegrimes.github.io/annabelles-mineral-museum/**

I've been collecting rocks and minerals for years, and my shelves have officially outgrown my ability to remember what anything is.

Armed with an iPhone, Polycam, and a healthy amount of geological guesswork, I'm building a digital mineral museum: 3D-scanned specimens, interactive models, mineral identifications, and a little detective work into where they might have come from.

> **Currently under construction.** Turns out I have a lot of rocks.

---

## What's here

- **Gallery** of every specimen, with search and filters for mineral name, mineral group, colour and identification status.
- **Specimen pages** with collection records, observations, mineralogy and provenance, plus an **interactive 3D viewer** (rotate, zoom, pan, reset, fullscreen) for Polycam scans. A photograph is shown when there's no model.
- **Honest uncertainty.** Every identification is labelled *Confirmed*, *Tentative*, *Pending confirmation* or *Unidentified*. General properties of a mineral species are always kept separate from observations of the actual specimen. Possible localities are shown as hypotheses, with their evidence, confidence and caveats. A mineral's well-known localities are never presented as evidence of where a specimen came from.

## Adding a specimen

```bash
npm run new-specimen                                   # assigns the next ROCK-XXXX and scaffolds it
# add photos to public/specimens/ROCK-XXXX/photos/
npm run optimize-model -- ROCK-XXXX "path/to/scan.glb" # shrinks the Polycam export for the web
# fill in the entry at the bottom of data/specimens.json
npm run validate && npm run dev                        # check it, then preview it
git add . && git commit -m "Add ROCK-XXXX" && git push # the site redeploys automatically
```

No application code changes are needed. The full walkthrough, including every catalogue field, is in **[docs/adding-specimens.md](docs/adding-specimens.md)**.

## Project layout

```text
data/
  specimens.json        ← the catalogue: one entry per specimen
  minerals.json         ← reference properties of mineral species (not of specimens)
public/specimens/
  ROCK-0001/
    photos/             ← original photographs (web copies are generated at build time)
    model.glb           ← optimised 3D scan (optional)
src/
  components/           ← gallery cards, 3D viewer, photo gallery, labels
  pages/                ← Gallery, Specimen, About
  lib/catalogue.js      ← joins the catalogue, species references and media
  styles/museum.css     ← visual identity
scripts/                ← validate, new-specimen, optimize-model, prepare-media
docs/                   ← guides and roadmap
```

## Development

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # local preview at http://localhost:5173/annabelles-mineral-museum/
npm run build      # validates the catalogue, prepares photos, builds to dist/
npm run preview    # serve the production build locally
```

## Deployment

Every push to `main` is built and published to GitHub Pages by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The site uses hash-based URLs (`…/#/specimen/ROCK-0004`), so deep links work under the `/annabelles-mineral-museum/` sub-path without any server configuration. To serve it from a custom domain or the root of a site, build with `BASE_PATH=/ npm run build`.

## Tech

React + Vite, React Three Fiber / drei / three.js for the 3D viewer (loaded only when a model is opened), sharp for photo resizing, and glTF-Transform + meshoptimizer for compressing Polycam scans.

## Roadmap

See [docs/roadmap.md](docs/roadmap.md): an origins map, an identification lab, specimen comparisons, an acquisition timeline and a virtual shelf.

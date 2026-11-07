# Roadmap

The current focus is a polished gallery and 3D viewer. These features are planned, and the data model already has room for them, so none should need a catalogue rewrite.

| Feature | Builds on |
|---|---|
| **Origins map:** documented localities as solid markers, hypotheses as dashed or uncertain ones | `provenance.documented.coordinates`, `provenance.hypotheses[].coordinates` / `confidence` |
| **Identification lab:** unidentified specimens alongside their observations and candidate species, to compare properties | `identification.status`, `identification.alternatives`, `observations`, `data/minerals.json` |
| **Specimen comparisons:** two or more specimens side by side, including their 3D models | `/specimen/:id` data and the `ModelViewer` component (reusable as-is) |
| **External database links:** per-species Mindat/RRUFF IDs rather than search links | add `mindatId` / `rruffId` to `data/minerals.json`; `databaseLinks()` in `src/lib/catalogue.js` |
| **Acquisition timeline** | `collection.dateAcquired` (partial dates supported) |
| **Virtual shelf / exhibition view:** several models in one scene | `model.glb` files are centred and scale-normalised by the viewer |

Suggested approach: add each as a new route in `src/App.jsx` and a page in `src/pages/`, and lazy-load anything heavy (maps, multi-model scenes) the way `ModelViewer` is loaded.

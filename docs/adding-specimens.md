# Adding specimens

Adding a rock never requires touching the website code. Everything lives in two places:

- **`data/specimens.json`**: what you know about each specimen
- **`public/specimens/ROCK-XXXX/`**: its photographs and 3D model

The site finds the photos and models in those folders automatically.

---

## Quick version

```bash
npm run new-specimen
```

This prints the new ID (say `ROCK-0006`), creates `public/specimens/ROCK-0006/photos/`, and adds a blank entry at the bottom of `data/specimens.json`. Then:

1. **Photos:** copy them into `public/specimens/ROCK-0006/photos/`.
2. **3D scan:** `npm run optimize-model -- ROCK-0006 "C:/path/to/Polycam export.glb"`
3. **Details:** fill in the new entry in `data/specimens.json`.
4. **Check:** `npm run validate`, then `npm run dev` and open the page.
5. **Publish:** commit and push to `main`. GitHub Actions rebuilds the site in a minute or two.

---

## 1. Specimen IDs

IDs are permanent: `ROCK-0001`, `ROCK-0002`, …. Never reuse or renumber one, even if a specimen leaves the collection. Just remove its entry (the validator will note the gap, which is fine). Use the ID in filenames too: `ROCK-0006_01.jpg`, `ROCK-0006_polycam.glb`.

## 2. Photographs

- Put **JPEG, PNG or WebP** files in `public/specimens/ROCK-XXXX/photos/`.
- iPhones save **HEIC** by default. Either set *Settings → Camera → Formats → Most Compatible*, or export the photos as JPEG.
- Full-resolution originals are fine. At build time, `npm run media` creates web-sized copies in `photos/_web/`. That folder isn't committed; it's regenerated automatically.
- **Background-free photos:** the current photos are cut-outs (transparent PNGs, trimmed to the rock and padded to the gallery's 4:5 shape). The unedited originals are kept in `photos/_original/`, which the site ignores. To do the same for new photos, run them through a background remover such as [rembg](https://github.com/danielgatis/rembg), then save the PNG in `photos/` and the original in `photos/_original/`.
- The first photo alphabetically becomes the gallery cover. To choose a different cover, or to add captions:

```json
"media": {
  "cover": "ROCK-0006_03.jpg",
  "photos": [
    { "file": "ROCK-0006_03.jpg", "caption": "Front, natural light" },
    { "file": "ROCK-0006_01.jpg", "caption": "Under longwave UV" }
  ]
}
```

Photos that aren't listed still appear, after the listed ones.

## 3. 3D models (Polycam)

1. In Polycam, export the scan as **GLB** (or glTF).
2. Run the optimiser, which never modifies your original:

   ```bash
   npm run optimize-model -- ROCK-0006 "C:/Users/annab/Downloads/ROCK-0006.glb"
   ```

   It compresses the geometry (meshopt), resizes textures to at most 2048 px as WebP, and writes
   `public/specimens/ROCK-0006/model.glb`. It also records the original filename in `media.originalScanFilename`.
   Use `--max-texture 4096` for very detailed specimens, or `1024` for an even smaller file.
3. Keep raw exports out of git. A `scans-raw/` folder in the repo is git-ignored if you want to keep them nearby.

Models up to 12 MB load automatically on the specimen page; larger ones show an **Explore in 3D** button with the download size. Aim for 2–10 MB.

**Tricky specimens.** Photogrammetry struggles with translucent, glassy, metallic, or finely acicular minerals (scolecite sprays, for example). Useful tricks: diffuse, even lighting; a matte, contrasting background; and many overlapping photos. If a scan is poor, note why in `media.scanNotes`. The page already tells visitors that photographs are the better record of colour and fine detail.

## 4. Catalogue fields

Leave anything you don't know as `null` (or `[]` for lists). The site shows these as *Not recorded* rather than guessing. **Never fill a field with a plausible guess.**

### Identification

*Illustrative example. The real ROCK-0005 entry only has what is actually recorded.*

```json
"identification": {
  "name": "Scolecite",
  "species": "scolecite",
  "status": "tentative",
  "confidence": "medium",
  "method": "Visual comparison; habit and lustre",
  "notes": "Original notes, verbatim from the catalogue",
  "alternatives": [
    { "name": "Natrolite", "notes": "Very similar fibrous zeolite; needs optical/XRD to separate" }
  ]
}
```

| Field | Meaning |
|---|---|
| `status` | `confirmed`, `tentative`, `pending` (candidate awaiting confirmation) or `unidentified` |
| `confidence` | `high`, `medium`, `low`, or `null` if not recorded |
| `species` | Key into `data/minerals.json`. Links the page to that species' reference properties. Leave `null` while unidentified. |

### Collection record

`dateAcquired` (`"2023"`, `"2023-07"` or `"2023-07-14"`), `acquisitionType` (`purchased`, `collected`, `gift`, `trade`, `inherited`, `other`), `acquiredFrom` (shop, show, site…), `originalLabel` (transcribed exactly), `notes`.

### Observations of *this* specimen

`colours` drives the colour filter, so use only these words: `colourless`, `white`, `grey`, `black`, `brown`, `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `metallic`, `multicoloured`. Also: `colourDescription` (free text, e.g. "pale apple-green crust"), `habit`, `lustre`, `associatedMinerals` (list), `dimensions` (e.g. "52 × 38 × 20 mm"), `mass` (e.g. "64 g"), `notes`.

### Mineralogy

General species properties (formula, crystal system, hardness…) come from `data/minerals.json` and are always labelled on the page as *species* properties, not measurements of your specimen. For a *tentative* identification they are shown "on the assumption that the identification is correct".

Use the specimen's own `mineralogy` object only for something specific to it, or for a rock that isn't a single species:

```json
"mineralogy": { "group": "Igneous rock", "properties": ["Fluoresces green under shortwave UV (tested)"] }
```

Supported keys: `formula`, `group`, `class`, `crystalSystem`, `hardness`, `specificGravity`, `colour`, `streak`, `lustre`, `habit`, `typicalAssociates`, `properties`.

**Adding a new species reference.** Add an entry to `data/minerals.json`, keyed by the lowercase name, with the same fields as the existing ones. Cite a source in `sources` (for example the *Handbook of Mineralogy* or Mindat), and don't include notable localities.

### Geological provenance

*The values below are illustrative only. They are not data about any specimen in the collection.*

```json
"provenance": {
  "documented": { "locality": "Bisbee, Cochise Co., Arizona, USA", "source": "Dealer's label", "coordinates": [31.44, -109.92] },
  "hypotheses": [
    {
      "locality": "Deccan Traps, Maharashtra, India",
      "confidence": "low",
      "evidence": ["Bought alongside Indian zeolites from the same dealer", "Matrix resembles altered basalt"],
      "against": ["Scolecite also occurs in Iceland, Brazil, Scotland…", "No label"],
      "coordinates": [19.0, 74.0]
    }
  ],
  "formationEnvironment": "Vesicle filling in basalt (observed matrix)",
  "notes": null
}
```

The rules (the validator enforces most of them):

- **`documented`** is only for a locality backed by a record: a label, a receipt, or your own field notes. Otherwise it's `null`.
- **`hypotheses`** must each have at least one piece of **evidence specific to your specimen** (matrix, associated minerals, where and from whom it was bought, label fragments…), plus a `confidence`. "Scolecite is common in India" is *not* evidence. Put alternative localities and caveats in `against`.
- `coordinates` (`[lat, lon]`) are optional; they're there for a future origins map.
- `formationEnvironment` describes *this* specimen. If it's blank, the page shows the species' typical setting, clearly labelled.

### Record status

`recordStatus` is `complete`, `in-progress`, or `awaiting-import`. The last one shows a note on the page saying the details are still being transcribed.

## 5. Check and preview

```bash
npm run validate   # catches typos, bad IDs, missing files, unsupported colours…
npm run dev        # http://localhost:5173/annabelles-mineral-museum/
```

A JSON syntax error (a missing comma is the usual culprit) is reported with its line and column.

## 6. Publish

```bash
git add data public
git commit -m "Add ROCK-0006"
git push
```

Watch the **Actions** tab on GitHub. When the run is green, the site is live.

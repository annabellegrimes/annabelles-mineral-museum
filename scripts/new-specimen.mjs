// npm run new-specimen — assigns the next ROCK-XXXX id, creates its media
// folder and appends a blank catalogue entry for you to fill in.
import fs from 'node:fs';
import path from 'node:path';
import {
  readJSON, writeJSON, SPECIMENS_JSON, SPECIMENS_DIR, ID_PATTERN,
  formatId, idNumber, blankSpecimen,
} from './lib/catalogue.mjs';

const specimens = readJSON(SPECIMENS_JSON);
const used = specimens.map((s) => s.id).filter((id) => ID_PATTERN.test(id));
if (fs.existsSync(SPECIMENS_DIR)) used.push(...fs.readdirSync(SPECIMENS_DIR).filter((d) => ID_PATTERN.test(d)));
const next = formatId(Math.max(0, ...used.map(idNumber)) + 1);

const photos = path.join(SPECIMENS_DIR, next, 'photos');
fs.mkdirSync(photos, { recursive: true });
fs.writeFileSync(path.join(photos, '.gitkeep'), '');
specimens.push(blankSpecimen(next));
writeJSON(SPECIMENS_JSON, specimens);

console.log(`
✔ Created ${next}

  1. Photos  → public/specimens/${next}/photos/   (e.g. ${next}_01.jpg)
  2. 3D scan → npm run optimize-model -- ${next} "path/to/polycam-export.glb"
  3. Details → data/specimens.json (the new entry is at the bottom)
  4. Check   → npm run validate, then npm run dev
`);

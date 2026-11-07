// npm run validate — checks data/specimens.json before every build.
import { readJSON, SPECIMENS_JSON, MINERALS_JSON, validateCatalogue } from './lib/catalogue.mjs';

let specimens, minerals;
try {
  specimens = readJSON(SPECIMENS_JSON);
  minerals = readJSON(MINERALS_JSON);
} catch (e) {
  console.error(`✖ Could not read the catalogue JSON: ${e.message}`);
  console.error('  (A missing comma or quote is the usual culprit — the line/column above points to it.)');
  process.exit(1);
}

const { errors, warnings } = validateCatalogue(specimens, minerals);
warnings.forEach((w) => console.warn(`⚠ ${w}`));
errors.forEach((e) => console.error(`✖ ${e}`));
if (errors.length) {
  console.error(`\n${errors.length} error(s) — fix these before publishing.`);
  process.exit(1);
}
console.log(`✔ Catalogue OK — ${specimens.length} specimen(s)${warnings.length ? `, ${warnings.length} warning(s)` : ''}.`);

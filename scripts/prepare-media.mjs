// npm run media — makes web-sized WebP copies of every specimen photo.
// Originals stay untouched; copies go in photos/_web/ (git-ignored, rebuilt in CI).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {
  SPECIMENS_DIR, ID_PATTERN, SIZES, DERIVED_DIR, scanSpecimenFolder, derivedName,
} from './lib/catalogue.mjs';

if (!fs.existsSync(SPECIMENS_DIR)) process.exit(0);
let made = 0;
for (const id of fs.readdirSync(SPECIMENS_DIR).filter((d) => ID_PATTERN.test(d))) {
  const { photosDir, photos } = scanSpecimenFolder(id);
  if (!photos.length) continue;
  const out = path.join(photosDir, DERIVED_DIR);
  fs.mkdirSync(out, { recursive: true });
  for (const file of photos) {
    const src = path.join(photosDir, file);
    const srcTime = fs.statSync(src).mtimeMs;
    for (const [size, width] of Object.entries(SIZES)) {
      const dest = path.join(out, derivedName(file, size));
      if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= srcTime) continue;
      await sharp(src)
        .rotate() // respect iPhone EXIF orientation
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: size === 'thumb' ? 78 : 85 })
        .toFile(dest);
      made++;
    }
  }
}
console.log(`✔ Photos ready${made ? ` (${made} web image(s) generated)` : ''}.`);

/**
 * Shrinks every image in src/assets/images to a sensible web size, in place.
 *
 *   npm install --save-dev sharp
 *   node scripts/optimize-images.mjs            ← does it
 *   node scripts/optimize-images.mjs --dry      ← only reports what it would do
 *
 * - Max width 1600px (photos are never shown wider than that on the site)
 * - WebP quality 78 (visually identical, much smaller)
 * - Keeps the same file names, so no imports need to change
 * - Skips files that are already small enough
 * Commit first (git) so you can always go back.
 */
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("src/assets/images");
const MAX_WIDTH = 1600;
const QUALITY = 78;
const DRY = process.argv.includes("--dry");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const kb = (b) => `${Math.round(b / 1024)} KB`;
let before = 0;
let after = 0;
const notWebp = [];

for await (const file of walk(ROOT)) {
  const ext = path.extname(file).toLowerCase();
  if (![".webp", ".jpg", ".jpeg", ".png"].includes(ext)) continue;

  const rel = path.relative(process.cwd(), file);
  const size = (await stat(file)).size;
  before += size;

  if (ext !== ".webp") {
    notWebp.push(rel);
    after += size;
    continue;
  }

  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  const tooWide = (meta.width ?? 0) > MAX_WIDTH;
  const tooHeavy = size > 300 * 1024;

  if (!tooWide && !tooHeavy) {
    after += size;
    continue;
  }

  const output = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toBuffer();

  if (output.length >= size) {
    after += size;
    continue;
  }

  after += output.length;
  console.log(`${DRY ? "would shrink" : "✓"} ${rel}  ${meta.width}px ${kb(size)} → ${Math.min(meta.width ?? 0, MAX_WIDTH)}px ${kb(output.length)}`);
  if (!DRY) await writeFile(file, output);
}

console.log(`\nTotal: ${kb(before)} → ${kb(after)}${DRY ? " (dry run, nothing changed)" : ""}`);
if (notWebp.length) {
  console.log(`\nStill JPG/PNG (convert these to WebP and update their imports):`);
  notWebp.forEach((f) => console.log(`  ${f}`));
}

/**
 * generate-walk-sprites.mjs
 *
 * Produces static direction sprites from the base character PNG.
 * Walk animation is handled at runtime via canvas transforms (bob/sway),
 * so no frame-by-frame generation is needed.
 *
 * Output:
 *   - character1-south.png  (trimmed + centered front view)
 *   - character1-north.png  (back view: face replaced with hair)
 *
 * East/west are derived at runtime by flipping the south sprite.
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const INPUT = path.join(ROOT, 'public/private-town/sprites/character1.png');
const OUTPUT_DIR = path.join(ROOT, 'public/private-town/sprites/walk');

// Minimum alpha to consider a pixel "visible" (skip anti-aliasing ghosts)
const ALPHA_THRESHOLD = 10;

// ---------------------------------------------------------------------------
// Pixel helpers
// ---------------------------------------------------------------------------

function idx(x, y, w) {
  return (y * w + x) * 4;
}

function getPixel(buf, x, y, w) {
  const i = idx(x, y, w);
  return [buf[i], buf[i + 1], buf[i + 2], buf[i + 3]];
}

function setPixel(buf, x, y, w, r, g, b, a) {
  const i = idx(x, y, w);
  buf[i] = r;
  buf[i + 1] = g;
  buf[i + 2] = b;
  buf[i + 3] = a;
}

function cloneBuf(buf) {
  return Buffer.from(buf);
}

// ---------------------------------------------------------------------------
// Bounding-box detection
// ---------------------------------------------------------------------------

function findBounds(buf, w, h) {
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (buf[idx(x, y, w) + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

// ---------------------------------------------------------------------------
// Back-view generation
// ---------------------------------------------------------------------------

/** Back-view approximation: cover the face area with hair-coloured pixels. */
function makeBackView(base, w, h, bounds) {
  const charH = bounds.maxY - bounds.minY;
  const charW = bounds.maxX - bounds.minX;
  const headEndY = bounds.minY + Math.round(charH * 0.45);

  // Collect hair-colour samples from the head zone
  const hairSamples = [];
  for (let y = bounds.minY; y <= headEndY; y++) {
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const [r, g, b, a] = getPixel(base, x, y, w);
      if (a < 128) continue;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 100 && (r - b) < 30) {
        hairSamples.push([r, g, b]);
      }
    }
  }

  const avgHair = hairSamples.length > 0
    ? hairSamples.reduce(
        ([sr, sg, sb], [r, g, b]) => [sr + r, sg + g, sb + b],
        [0, 0, 0],
      ).map((v) => Math.round(v / hairSamples.length))
    : [40, 30, 25];

  const dst = cloneBuf(base);

  // Face region: generous inner portion of the head
  const faceMinX = bounds.minX + Math.round(charW * 0.20);
  const faceMaxX = bounds.maxX - Math.round(charW * 0.20);
  const faceMinY = bounds.minY + Math.round(charH * 0.12);
  const faceMaxY = headEndY;

  for (let y = faceMinY; y <= faceMaxY; y++) {
    for (let x = faceMinX; x <= faceMaxX; x++) {
      const [r, g, b, a] = getPixel(base, x, y, w);
      if (a < 128) continue;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 55) {
        const si = (x * 7 + y * 13) % Math.max(1, hairSamples.length);
        const sample = hairSamples.length > 0 ? hairSamples[si] : avgHair;
        const v = ((x + y) % 4 === 0) ? 6 : ((x + y) % 4 === 1) ? -4 : ((x + y) % 4 === 2) ? 3 : 0;
        setPixel(dst, x, y, w,
          Math.max(0, Math.min(255, sample[0] + v)),
          Math.max(0, Math.min(255, sample[1] + v)),
          Math.max(0, Math.min(255, sample[2] + v)),
          a,
        );
      }
    }
  }

  return dst;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Loading base sprite …');
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const { data, info } = await sharp(INPUT)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  console.log(`  Image size: ${w}×${h}`);

  const bounds = findBounds(data, w, h);
  console.log(`  Bounds: (${bounds.minX},${bounds.minY})–(${bounds.maxX},${bounds.maxY})`);

  // --- South (front view) ---
  console.log('Writing south (front view) …');
  await sharp(Buffer.from(data), { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'character1-south.png'));

  // --- North (back view) ---
  console.log('Writing north (back view) …');
  const northBuf = makeBackView(data, w, h, bounds);
  await sharp(northBuf, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'character1-north.png'));

  console.log('Done! 2 static direction sprites generated.');
  console.log('East/west are handled at runtime via horizontal flip.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.resolve(__dirname, '../assets');
const OUTPUT_FILE = path.resolve(__dirname, '../src/lib/characterData.json');
const TARGET_POINTS = 1500;

// The 6 requested colors
const PALETTE = [
  [118, 210, 205],
  [120, 198, 202],
  [27, 158, 180],
  [227, 201, 73],
  [90, 166, 206],
  [148, 224, 246]
].map(c => [c[0] / 255, c[1] / 255, c[2] / 255]); // normalized for WebGL

async function processImages() {
  const files = fs.readdirSync(ASSETS_DIR).filter(f => 
    (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')) &&
    f !== 'miku_r03_head_icon.png'
  );

  const characters = [];

  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    try {
      const { data, info } = await sharp(filePath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const validPoints = [];
      for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          const idx = (y * info.width + x) * 4;
          const a = data[idx + 3];
          if (a > 50) { // non-transparent
            validPoints.push({
              x: x,
              y: y
            });
          }
        }
      }

      if (validPoints.length === 0) continue;

      // Randomly sample TARGET_POINTS
      const sampled = [];
      for (let i = 0; i < TARGET_POINTS; i++) {
        sampled.push(validPoints[Math.floor(Math.random() * validPoints.length)]);
      }

      // Calculate bounds for centering and scaling
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      sampled.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const maxDim = Math.max(maxX - minX, maxY - minY);
      const scale = 25 / maxDim; // Scale to roughly fit a 25x25 area in 3D space

      const finalPoints = sampled.map(p => {
        // Invert Y because canvas Y is down, WebGL Y is up
        const nx = (p.x - centerX) * scale;
        const ny = -(p.y - centerY) * scale;
        // Assign random palette color
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        return { x: nx, y: ny, color };
      });

      characters.push({
        name: file.replace(/\.[^/.]+$/, ""),
        points: finalPoints
      });
      console.log(`Processed ${file}: generated ${TARGET_POINTS} points.`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }

  // Fallback if no images found
  if (characters.length === 0) {
    console.log("No valid character images found in ./assets/. Creating a dummy placeholder shape.");
    const dummyPoints = [];
    for (let i = 0; i < TARGET_POINTS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 10;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      dummyPoints.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        color
      });
    }
    characters.push({ name: 'dummy_circle', points: dummyPoints });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(characters));
  console.log(`Saved character data to ${OUTPUT_FILE}`);
}

processImages();

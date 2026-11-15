const fs = require('fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
    const source = path.join(__dirname, 'miku.webp');

    console.log("Processing image with sharp...");
    const { data: raw, info: { width, height } } = await sharp(source)
        .toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    console.log(`Image size: ${width}x${height}`);

    const edges = [];
    
    // Simple edge detection based on white background
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const r = raw[idx];
            const g = raw[idx + 1];
            const b = raw[idx + 2];
            
            // Not purely white
            if (r < 250 || g < 250 || b < 250) {
                // Check neighbors for white
                let isEdge = false;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        if (raw[nIdx] >= 250 && raw[nIdx+1] >= 250 && raw[nIdx+2] >= 250) {
                            isEdge = true;
                            break;
                        }
                    }
                    if (isEdge) break;
                }

                if (isEdge) {
                    edges.push({ x, y });
                }
            }
        }
    }

    console.log(`Found ${edges.length} edge pixels.`);

    if (edges.length === 0) throw new Error('No silhouette edges found.');
    const count = Math.min(edges.length, 12500);

    const scale = 8.0;
    const pointsCode = Array.from({ length: count }, (_, i) => {
        const p = edges[Math.floor(i * edges.length / count)];
        const nx = ((p.x / width) - 0.5) * scale;
        const ny = (0.5 - (p.y / height)) * scale * (height / width);
        const nz = (Math.random() - 0.5) * 0.1;
        return [nx, ny, nz].map(value => Number(value.toFixed(4))).join(', ');
    });

    const fileContent = `const coordinates = new Float32Array([
  ${pointsCode.join(',\n  ')}
]);

export function generateMikuSilhouette() {
  const points = [];
  for (let i = 0; i < coordinates.length; i += 3) {
    points.push({ x: coordinates[i], y: coordinates[i + 1], z: coordinates[i + 2] });
  }

  return points;
}
`;

    fs.writeFileSync(path.join(__dirname, '../src/lib/mikuSilhouette.js'), fileContent);
    console.log("Successfully wrote points to src/lib/mikuSilhouette.js");
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});

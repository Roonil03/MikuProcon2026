const fs = require('fs');
const sharp = require('sharp');

async function main() {
    console.log("Fetching image...");
    const buffer = fs.readFileSync('miku.webp');

    console.log("Processing image with sharp...");
    const image = sharp(Buffer.from(buffer));
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;

    const raw = await image.ensureAlpha().raw().toBuffer();

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

    const targetPoints = 15000;
    const sampledEdges = [];
    
    if (edges.length > 0) {
        const step = Math.max(1, edges.length / targetPoints);
        for (let i = 0; i < targetPoints; i++) {
            const index = Math.floor((i * step) % edges.length);
            sampledEdges.push(edges[index]);
        }
    }

    const scale = 8.0;
    const pointsCode = sampledEdges.map(p => {
        const nx = ((p.x / width) - 0.5) * scale;
        const ny = (0.5 - (p.y / height)) * scale * (height / width);
        const nz = (Math.random() - 0.5) * 0.1;
        return `{ x: ${nx.toFixed(4)}, y: ${ny.toFixed(4)}, z: ${nz.toFixed(4)} }`;
    });

    const fileContent = `export function generateMikuSilhouette() {
  const points = [
    ${pointsCode.join(',\n    ')}
  ];

  while (points.length < 15000) {
    const source = points[Math.floor(Math.random() * points.length)];
    if (!source) break;
    points.push({
      x: source.x + (Math.random() - 0.5) * 0.05,
      y: source.y + (Math.random() - 0.5) * 0.05,
      z: source.z + (Math.random() - 0.5) * 0.05,
    });
  }

  return points;
}
`;

    fs.writeFileSync('../src/lib/mikuSilhouette.js', fileContent);
    console.log("Successfully wrote points to src/lib/mikuSilhouette.js");
}

main().catch(console.error);

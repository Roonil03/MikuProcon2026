export function generateMikuSilhouette() {
  const points = [];

  function bezier(p0, p1, p2, p3, steps) {
    const result = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      result.push({
        x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
        y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
      });
    }
    return result;
  }

  function addEllipse(cx, cy, rx, ry, startAngle, endAngle, count) {
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / count);
      points.push({
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
        z: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  function addLine(x1, y1, x2, y2, count) {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      points.push({
        x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 0.04,
        y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.25,
      });
    }
  }

  function addBezierCurve(p0, p1, p2, p3, count) {
    const curve = bezier(p0, p1, p2, p3, count);
    for (const p of curve) {
      points.push({
        x: p.x,
        y: p.y,
        z: (Math.random() - 0.5) * 0.25,
      });
    }
  }

  function fillRegion(cx, cy, rx, ry, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      points.push({
        x: cx + rx * r * Math.cos(angle),
        y: cy + ry * r * Math.sin(angle),
        z: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  addEllipse(0, 2.8, 0.85, 1.0, 0, Math.PI * 2, 120);
  fillRegion(0, 2.8, 0.7, 0.85, 60);

  addBezierCurve(
    { x: 0, y: 3.8 }, { x: -0.5, y: 4.3 },
    { x: -0.9, y: 4.6 }, { x: -0.7, y: 4.2 }, 30
  );
  addBezierCurve(
    { x: 0, y: 3.8 }, { x: 0.5, y: 4.3 },
    { x: 0.9, y: 4.6 }, { x: 0.7, y: 4.2 }, 30
  );
  addBezierCurve(
    { x: -0.3, y: 3.6 }, { x: -0.8, y: 4.0 },
    { x: -1.0, y: 4.2 }, { x: -0.6, y: 3.8 }, 20
  );
  addBezierCurve(
    { x: 0.3, y: 3.6 }, { x: 0.8, y: 4.0 },
    { x: 1.0, y: 4.2 }, { x: 0.6, y: 3.8 }, 20
  );

  addEllipse(0, 2.85, 0.95, 1.1, 0, Math.PI * 2, 80);

  addEllipse(-0.25, 2.85, 0.12, 0.15, 0, Math.PI * 2, 20);
  addEllipse(0.25, 2.85, 0.12, 0.15, 0, Math.PI * 2, 20);
  fillRegion(-0.25, 2.85, 0.08, 0.1, 10);
  fillRegion(0.25, 2.85, 0.08, 0.1, 10);

  addBezierCurve(
    { x: -0.15, y: 2.55 }, { x: -0.05, y: 2.5 },
    { x: 0.05, y: 2.5 }, { x: 0.15, y: 2.55 }, 15
  );

  addLine(0, 1.8, 0, 1.5, 30);
  addLine(-0.08, 1.8, -0.08, 1.5, 20);
  addLine(0.08, 1.8, 0.08, 1.5, 20);

  addBezierCurve(
    { x: -0.4, y: 1.5 }, { x: -0.6, y: 1.45 },
    { x: -0.8, y: 1.2 }, { x: -0.7, y: 0.8 }, 30
  );
  addBezierCurve(
    { x: 0.4, y: 1.5 }, { x: 0.6, y: 1.45 },
    { x: 0.8, y: 1.2 }, { x: 0.7, y: 0.8 }, 30
  );

  addLine(-0.4, 1.5, 0.4, 1.5, 25);
  addLine(-0.35, 1.3, 0.35, 1.3, 25);

  addBezierCurve(
    { x: -0.35, y: 1.3 }, { x: -0.4, y: 0.8 },
    { x: -0.3, y: 0.3 }, { x: -0.25, y: 0.0 }, 30
  );
  addBezierCurve(
    { x: 0.35, y: 1.3 }, { x: 0.4, y: 0.8 },
    { x: 0.3, y: 0.3 }, { x: 0.25, y: 0.0 }, 30
  );

  addLine(-0.35, 1.3, -0.7, 0.8, 20);
  addLine(0.35, 1.3, 0.7, 0.8, 20);

  addBezierCurve(
    { x: -0.7, y: 0.8 }, { x: -0.75, y: 0.5 },
    { x: -0.65, y: 0.2 }, { x: -0.55, y: 0.0 }, 25
  );
  addBezierCurve(
    { x: 0.7, y: 0.8 }, { x: 0.75, y: 0.5 },
    { x: 0.65, y: 0.2 }, { x: 0.55, y: 0.0 }, 25
  );

  addBezierCurve(
    { x: -0.55, y: 0.0 }, { x: -0.5, y: -0.3 },
    { x: -0.4, y: -0.5 }, { x: -0.35, y: -0.7 }, 25
  );
  addBezierCurve(
    { x: 0.55, y: 0.0 }, { x: 0.5, y: -0.3 },
    { x: 0.4, y: -0.5 }, { x: 0.35, y: -0.7 }, 25
  );

  addBezierCurve(
    { x: -0.25, y: 0.0 }, { x: -0.2, y: -0.3 },
    { x: -0.18, y: -0.5 }, { x: -0.15, y: -0.7 }, 25
  );
  addBezierCurve(
    { x: 0.25, y: 0.0 }, { x: 0.2, y: -0.3 },
    { x: 0.18, y: -0.5 }, { x: 0.15, y: -0.7 }, 25
  );

  addLine(-0.35, -0.7, -0.15, -0.7, 15);
  addLine(0.15, -0.7, 0.35, -0.7, 15);

  addBezierCurve(
    { x: -0.35, y: -0.7 }, { x: -0.4, y: -1.2 },
    { x: -0.35, y: -1.7 }, { x: -0.3, y: -2.0 }, 30
  );
  addBezierCurve(
    { x: -0.15, y: -0.7 }, { x: -0.12, y: -1.2 },
    { x: -0.14, y: -1.7 }, { x: -0.15, y: -2.0 }, 30
  );
  addBezierCurve(
    { x: 0.35, y: -0.7 }, { x: 0.4, y: -1.2 },
    { x: 0.35, y: -1.7 }, { x: 0.3, y: -2.0 }, 30
  );
  addBezierCurve(
    { x: 0.15, y: -0.7 }, { x: 0.12, y: -1.2 },
    { x: 0.14, y: -1.7 }, { x: 0.15, y: -2.0 }, 30
  );

  addLine(-0.3, -2.0, -0.4, -2.1, 10);
  addLine(-0.15, -2.0, -0.2, -2.1, 10);
  addLine(0.3, -2.0, 0.4, -2.1, 10);
  addLine(0.15, -2.0, 0.2, -2.1, 10);

  function generateTwinTail(side) {
    const sx = side;
    const baseX = sx * 0.6;
    const baseY = 3.0;

    addBezierCurve(
      { x: baseX, y: baseY },
      { x: baseX + sx * 0.5, y: baseY - 0.3 },
      { x: baseX + sx * 0.8, y: baseY - 1.0 },
      { x: baseX + sx * 1.0, y: baseY - 2.0 },
      50
    );

    addBezierCurve(
      { x: baseX + sx * 1.0, y: baseY - 2.0 },
      { x: baseX + sx * 1.1, y: baseY - 2.8 },
      { x: baseX + sx * 0.9, y: baseY - 3.5 },
      { x: baseX + sx * 0.7, y: baseY - 4.2 },
      50
    );

    addBezierCurve(
      { x: baseX + sx * 0.7, y: baseY - 4.2 },
      { x: baseX + sx * 0.5, y: baseY - 4.8 },
      { x: baseX + sx * 0.3, y: baseY - 5.3 },
      { x: baseX + sx * 0.2, y: baseY - 5.6 },
      40
    );

    addBezierCurve(
      { x: baseX + sx * 0.15, y: baseY },
      { x: baseX + sx * 0.35, y: baseY - 0.5 },
      { x: baseX + sx * 0.55, y: baseY - 1.3 },
      { x: baseX + sx * 0.7, y: baseY - 2.2 },
      40
    );

    addBezierCurve(
      { x: baseX + sx * 0.7, y: baseY - 2.2 },
      { x: baseX + sx * 0.8, y: baseY - 3.0 },
      { x: baseX + sx * 0.6, y: baseY - 3.8 },
      { x: baseX + sx * 0.4, y: baseY - 4.5 },
      40
    );

    addBezierCurve(
      { x: baseX + sx * 0.4, y: baseY - 4.5 },
      { x: baseX + sx * 0.25, y: baseY - 5.0 },
      { x: baseX + sx * 0.1, y: baseY - 5.3 },
      { x: baseX + sx * 0.05, y: baseY - 5.5 },
      30
    );

    for (let i = 0; i < 50; i++) {
      const t = Math.random();
      const t2 = t * t;
      const t3 = t2 * t;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      const outerX = mt3 * (baseX + sx * 1.0) + 3 * mt2 * t * (baseX + sx * 1.1) + 3 * mt * t2 * (baseX + sx * 0.9) + t3 * (baseX + sx * 0.7);
      const outerY = mt3 * (baseY - 2.0) + 3 * mt2 * t * (baseY - 2.8) + 3 * mt * t2 * (baseY - 3.5) + t3 * (baseY - 4.2);
      const innerX = mt3 * (baseX + sx * 0.7) + 3 * mt2 * t * (baseX + sx * 0.8) + 3 * mt * t2 * (baseX + sx * 0.6) + t3 * (baseX + sx * 0.4);
      const innerY = mt3 * (baseY - 2.2) + 3 * mt2 * t * (baseY - 3.0) + 3 * mt * t2 * (baseY - 3.8) + t3 * (baseY - 4.5);
      const blend = Math.random();
      points.push({
        x: outerX * blend + innerX * (1 - blend),
        y: outerY * blend + innerY * (1 - blend),
        z: (Math.random() - 0.5) * 0.4,
      });
    }

    for (let band = 0; band < 3; band++) {
      const bandY = baseY - 1.5 - band * 1.3;
      for (let i = 0; i < 15; i++) {
        const t = i / 15;
        const waveX = baseX + sx * (0.3 + t * 0.6) + Math.sin(t * Math.PI * 3) * 0.08;
        const waveY = bandY + Math.cos(t * Math.PI * 2) * 0.1;
        points.push({
          x: waveX,
          y: waveY,
          z: (Math.random() - 0.5) * 0.15,
        });
      }
    }
  }

  generateTwinTail(-1);
  generateTwinTail(1);

  addEllipse(-0.55, 3.3, 0.15, 0.1, 0, Math.PI * 2, 20);
  addEllipse(0.55, 3.3, 0.15, 0.1, 0, Math.PI * 2, 20);
  fillRegion(-0.55, 3.3, 0.1, 0.07, 8);
  fillRegion(0.55, 3.3, 0.1, 0.07, 8);

  addBezierCurve(
    { x: -0.15, y: 3.8 }, { x: -0.2, y: 4.0 },
    { x: 0.2, y: 4.0 }, { x: 0.15, y: 3.8 }, 20
  );
  addLine(-0.1, 3.85, 0.1, 3.85, 10);

  addBezierCurve(
    { x: -0.6, y: 1.5 }, { x: -0.85, y: 1.3 },
    { x: -1.0, y: 0.9 }, { x: -0.95, y: 0.5 }, 25
  );
  addBezierCurve(
    { x: 0.6, y: 1.5 }, { x: 0.85, y: 1.3 },
    { x: 1.0, y: 0.9 }, { x: 0.95, y: 0.5 }, 25
  );
  addBezierCurve(
    { x: -0.95, y: 0.5 }, { x: -0.9, y: 0.2 },
    { x: -0.85, y: 0.0 }, { x: -0.8, y: -0.1 }, 15
  );
  addBezierCurve(
    { x: 0.95, y: 0.5 }, { x: 0.9, y: 0.2 },
    { x: 0.85, y: 0.0 }, { x: 0.8, y: -0.1 }, 15
  );

  addLine(-0.8, -0.1, -0.7, 0.0, 10);
  addLine(-0.7, 0.0, -0.55, 0.0, 10);
  addLine(0.8, -0.1, 0.7, 0.0, 10);
  addLine(0.7, 0.0, 0.55, 0.0, 10);

  const scale = 0.55;
  const offsetY = 0.3;

  const scaled = points.map(p => ({
    x: p.x * scale,
    y: p.y * scale + offsetY,
    z: p.z * scale,
  }));

  while (scaled.length < 1500) {
    const source = scaled[Math.floor(Math.random() * scaled.length)];
    scaled.push({
      x: source.x + (Math.random() - 0.5) * 0.08,
      y: source.y + (Math.random() - 0.5) * 0.08,
      z: source.z + (Math.random() - 0.5) * 0.08,
    });
  }

  return scaled;
}

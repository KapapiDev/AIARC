// Re-authors the skyline from its own structure instead of tracing pixels.
//
// The traced centreline was faithful but read as a nervous sketch: every stroke
// carried the raster's micro-wobble, and the skeleton walker had chopped long
// roofs into as many as six fragments, so the joins added their own jitter.
//
// Here the fragments are re-joined, each stroke is reduced to its intentional
// anchors, and the drawing is emitted as straight runs with rounded corners plus
// a single shallow bow per run. That is what a person drawing with intent
// produces: deliberate lines, soft corners, a slight lean - not a tremor.

const fs = require('fs');
const path = require('path');

const r = (n) => Math.round(n * 10) / 10;

const rdp = (p, e) => {
  const n = p.length, keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
  const st = [[0, n - 1]];
  while (st.length) {
    const [a, b] = st.pop(); if (b <= a + 1) continue;
    const ax = p[a][0], ay = p[a][1], dx = p[b][0] - ax, dy = p[b][1] - ay, dd = dx * dx + dy * dy;
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const px = p[i][0] - ax, py = p[i][1] - ay; let d;
      if (dd === 0) d = px * px + py * py;
      else { let t = (px * dx + py * dy) / dd; t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = px - t * dx, ey = py - t * dy; d = ex * ex + ey * ey; }
      if (d > best) { best = d; bi = i; }
    }
    if (best > e * e) { keep[bi] = 1; st.push([a, bi], [bi, b]); }
  }
  return p.filter((_, i) => keep[i]);
};

// a fixed, repeatable wobble - the same drawing every build
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

// Straight runs, rounded corners, one shallow bow per run.
function draw(pts, { radius, bow, bowMin }) {
  if (pts.length < 2) return '';
  const n = pts.length;
  const cut = [];                       // [before, after] for each interior anchor
  for (let i = 1; i < n - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const la = dist(a, b), lc = dist(b, c);
    const ra = Math.min(radius, la * 0.4), rc = Math.min(radius, lc * 0.4);
    cut[i] = [lerp(b, a, la ? ra / la : 0), lerp(b, c, lc ? rc / lc : 0)];
  }
  // a run is the straight part between two rounded corners
  const run = (from, to) => {
    const L = dist(from, to);
    if (L < bowMin) return `L${r(to[0])},${r(to[1])}`;
    const amt = (rnd() - 0.5) * 2 * bow;
    const mx = (from[0] + to[0]) / 2, my = (from[1] + to[1]) / 2;
    const nx = -(to[1] - from[1]) / L, ny = (to[0] - from[0]) / L;
    return `Q${r(mx + nx * amt * 2)},${r(my + ny * amt * 2)} ${r(to[0])},${r(to[1])}`;
  };
  let d = `M${r(pts[0][0])},${r(pts[0][1])}`;
  let from = pts[0];
  for (let i = 1; i < n - 1; i++) {
    d += run(from, cut[i][0]);
    d += `Q${r(pts[i][0])},${r(pts[i][1])} ${r(cut[i][1][0])},${r(cut[i][1][1])}`;
    from = cut[i][1];
  }
  d += run(from, pts[n - 1]);
  return d;
}

// The central tower, drawn deliberately instead of traced.
//
// What the trace produced was one near-vertical wall and one hard diagonal
// running from the base to the tip, so it read as a leaning sail rather than a
// building, with a notch and a stray wing at the top. This is the same mass and
// the same footprint, but tapered evenly on both sides to a single clean point.
// It starts and ends mid-base, on a straight run, so the seam is invisible and
// every real corner is an interior anchor and gets rounded.
const TOWER = [
  [1112, 325], [1080, 325], [1099, 84], [1110, 20], [1121, 84], [1144, 325], [1112, 325],
];
// the traced sail, matched by its footprint so the swap survives a re-trace
const isTower = (s) => {
  const xs = s.map((p) => p[0]), ys = s.map((p) => p[1]);
  return Math.min(...xs) > 1060 && Math.max(...xs) < 1160 && Math.min(...ys) < 30;
};

// A dead-end that doubles straight back on itself within a few pixels is a slip
// of the pen, not a building edge. Trim those; keep every hanging wall.
function trimSpikes(s, maxLen, minTurn) {
  const ang = (a, b, c) => {
    const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
    const d = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1);
    return Math.acos(Math.max(-1, Math.min(1, d))) * 180 / Math.PI;
  };
  let out = s.slice();
  while (out.length > 2 && dist(out[out.length - 2], out[out.length - 1]) < maxLen
         && ang(out[out.length - 3], out[out.length - 2], out[out.length - 1]) < minTurn) out.pop();
  while (out.length > 2 && dist(out[0], out[1]) < maxLen
         && ang(out[2], out[1], out[0]) < minTurn) out.shift();
  return out;
}

function build(strokes, opt) {
  seed = 7;
  const GROUND = opt.ground;
  const len = (s) => s.reduce((t, p, i) => i ? t + dist(s[i - 1], p) : 0, 0);
  return strokes
    .map((s) => (isTower(s) ? TOWER.slice() : trimSpikes(rdp(s, opt.tolerance), opt.spike, 40)))
    .filter((s) => s.length >= 2 && len(s) > opt.minLen)
    // squash towards the ground line: lowers the skyline without narrowing it
    .map((s) => s.map(([x, y]) => [x, GROUND - (GROUND - y) * opt.vScale]))
    .map((s) => draw(s, opt))
    .join('');
}

module.exports = { build, rdp, draw };

if (require.main === module) {
  const strokes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '_joined.json'), 'utf8'));
  const opt = { tolerance: +process.argv[2] || 8, radius: +process.argv[3] || 5,
                bow: +process.argv[4] || 0.6, bowMin: 26, vScale: +process.argv[5] || 1,
                ground: 390.9, spike: 16, minLen: 26 };
  const d = build(strokes, opt);
  process.stdout.write(d);
}

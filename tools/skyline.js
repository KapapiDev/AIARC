// Generates the hero skyline by tracing the reference drawing.
//
// Earlier versions were hand-authored from looking at the reference and kept
// missing it. These numbers are not estimates: REF_RUNS is the silhouette read out
// of the supplied reference drawing by sampling the topmost inked pixel in every
// column and flattening the result into horizontal runs; the spire and the ground
// row came from the same pass. Only the measurements are kept here, not the image
// itself, which is not ours to redistribute.
//
// Two things that pass turned up which no amount of squinting had:
//   - the reference has NO ink below its ground line. Every previous version put
//     a stub under most buildings, which read as a fringe along the bottom.
//   - the tall tower's mast is only 5px wide and reaches far higher than any roof.

// --- traced from the reference (451x188 px) ----------------------------------
const REF_GROUND = 126;
const REF_X0 = 47;                 // where the drawn line starts
const REF_SPIRE = { x0: 228, x1: 232, top: 16 };
// [xStart, xEnd, roofY] in reference pixels, left to right
const REF_RUNS = [
  [47, 122, 125], [123, 148, 88], [149, 168, 55], [170, 176, 90],
  [177, 189, 45], [190, 203, 63], [204, 211, 108], [212, 218, 95],
  [219, 227, 33], [232, 239, 32], [240, 253, 100], [254, 277, 59],
  [280, 293, 97], [295, 314, 110], [315, 360, 125],
];

// --- mapping into the hero's viewBox -----------------------------------------
const BASE = 177;                  // ground line, unchanged so the graphic keeps its place
const S = 1.0;                     // uniform: shape proportions stay exactly as traced
const REF_W = REF_RUNS[REF_RUNS.length - 1][1] - REF_X0;
const X0 = Math.round((630 - REF_W * S) / 2);

const mx = (rx) => (rx - REF_X0) * S + X0;
const my = (ry) => BASE - (REF_GROUND - ry) * S;

// a small deterministic lean, matching the reference's slightly off-vertical edges
let seed = 20260905;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const jit = (a) => (rnd() - 0.5) * 2 * a;

const r = (n) => Math.round(n * 10) / 10;
const pts = [];
const to = (x, y) => pts.push([x, y]);

// Each building in the reference is drawn with BOTH walls running down to the
// ground, so neighbours of different heights show a pair of near-parallel verticals.
// Stepping straight from one roof to the next instead merges them into a single
// stepped mass, which is what made earlier versions read as one hill.
const GROUND_Y = my(REF_GROUND - 1);
const buildings = REF_RUNS.slice(1, -1);
// the mast sits between the twin towers, so those two are joined through it
const mastAfter = buildings.findIndex(([, rx1]) => rx1 < REF_SPIRE.x0 && rx1 > REF_SPIRE.x0 - 12);

to(0, GROUND_Y);
to(mx(REF_RUNS[0][1]), GROUND_Y);                // flat run in from the left edge

buildings.forEach(([rx0, rx1, ry], i) => {
  const y = my(ry);
  const joinedFromMast = i - 1 === mastAfter;
  if (!joinedFromMast) to(mx(rx0) + jit(0.7), GROUND_Y + jit(0.5));  // foot of the left wall
  to(mx(rx0) + jit(0.7), y + jit(0.6));          // up the left wall
  to(mx(rx1) + jit(0.7), y + jit(0.6));          // across the roof

  if (i === mastAfter) {
    // A needle, not a wedge: run along the roof to the mast's foot first, then
    // straight up and straight back down. Going diagonally to the tip from the
    // roof's end drew a triangle instead of the reference's thin vertical line.
    const c = mx((REF_SPIRE.x0 + REF_SPIRE.x1) / 2);
    to(c - 0.6, y + jit(0.4));
    to(c + jit(0.25), my(REF_SPIRE.top));
    to(c + 0.9, y + jit(0.4));
    return;                                       // next tower picks up from here
  }
  to(mx(rx1) + jit(0.7), GROUND_Y + jit(0.5));   // down the right wall to the ground
});

to(mx(REF_RUNS[REF_RUNS.length - 1][0]), GROUND_Y);
to(630, GROUND_Y);                               // and out to the right edge

const d = 'M ' + pts.map(([x, y]) => `${r(x)},${r(y)}`).join(' L ');

// --- checks -------------------------------------------------------------------
if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (p, m) => { console.log((p ? 'ok   ' : 'FAIL ') + m); if (!p) bad++; };
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);

  report((d.match(/M/g) || []).length === 1, 'a single unbroken stroke');
  report(xs[0] === 0 && xs[xs.length - 1] === 630, 'spans the full viewBox width');

  // the reference has no ink below its ground line, so neither may this
  report(Math.max(...ys) <= BASE + 0.5, `nothing below the ground line (max y ${r(Math.max(...ys))})`);

  // Every traced roof must land where the reference put it. Sample the drawn line
  // at each roof's midpoint rather than near a run boundary, where two points share
  // an x at different heights and the nearest-point test picks the wrong one.
  const yAt = (qx) => {
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      if (qx >= Math.min(ax, bx) && qx <= Math.max(ax, bx) && ax !== bx)
        return ay + (by - ay) * ((qx - ax) / (bx - ax));
    }
    return null;
  };
  let worst = 0, worstRun = null;
  for (const [rx0, rx1, ry] of REF_RUNS) {
    if (REF_SPIRE.x0 >= rx0 && REF_SPIRE.x1 <= rx1 + 6) continue; // mast splits this roof
    const got = yAt(mx((rx0 + rx1) / 2));
    if (got === null) continue;
    const err = Math.abs(got - my(ry));
    if (err > worst) { worst = err; worstRun = [rx0, rx1, ry]; }
  }
  report(worst <= 1.5, `every roof within ${r(worst)} of the traced height${worst > 1.5 ? ' (worst ' + worstRun + ')' : ''}`);

  report(Math.abs(Math.min(...ys) - my(REF_SPIRE.top)) < 1.5, `spire reaches the traced top`);

  // buildings must stand on the ground, not hang off each other's roofs
  const feet = ys.filter((y) => Math.abs(y - my(REF_GROUND - 1)) < 1.2).length;
  report(feet >= REF_RUNS.length * 1.5,
    `${feet} points on the ground line, so walls reach it between buildings`);
  report(!/NaN|undefined/.test(d), 'no NaN in path');
  process.exit(bad ? 1 : 0);
}

if (process.argv[2] === '--sync') {
  const fs = require('fs'), path = require('path');
  for (const rel of ['index.html', path.join('tools', 'og-card.html')]) {
    const file = path.join(__dirname, '..', rel);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const re = /(<path id="skyline-line" d=")[^"]*(")/;
    if (!re.test(html)) { console.error(`skyline-line not found in ${rel}`); process.exit(1); }
    fs.writeFileSync(file, html.replace(re, (m, a, b) => a + d + b));
    console.log(`synced ${rel}`);
  }
  process.exit(0);
}

console.log(d);

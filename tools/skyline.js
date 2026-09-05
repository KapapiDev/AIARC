// Generates the hero skyline: a continuous one-line drawing.
//
// Same viewBox / baseline / y-band as Altitude's mountain ridge (0 0 630 360, base
// y=177, apex y~95) so the graphic keeps its screen position at every width.
//
// The earlier version was a clean architectural elevation, drawn strictly left to
// right with the pen lifting between blocks. This is the opposite: ONE stroke that
// never lifts. Each building is traced up the left edge, across the roof, then down
// past the ground line before coming back up to continue, so the line crosses
// itself at every building. Those crossings, plus a small seeded wobble, are what
// make it read as drawn by hand rather than plotted.
//
// Two consequences of the style, both deliberate:
//   - x is NOT monotonic any more. The pen doubles back; that is the whole point.
//   - there is no fill and no second depth plane. A one-line drawing is just a line.

const BASE = 177;
const APEX = 95;
const OVERSHOOT_MAX = 12; // how far below the ground line a descender may stab

// deterministic wobble, so the committed path is stable across runs
let seed = 20260905;
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const jit = (a) => (rnd() - 0.5) * 2 * a;

const r = (n) => Math.round(n * 10) / 10;
const pts = [];
const to = (x, y) => pts.push([x, y]);

// --- composition -------------------------------------------------------------
// Follows the reference: long flat ground on the left, a rising mid-rise group,
// the tall cluster a little past centre with a spire, then a descending tail and
// flat ground again on the right.
//
// [x, width, roofY, kind]
//   block - plain building
//   spire - carries a thin mast
//   twin  - two narrow towers in one gesture, dipping between without reaching ground
const plan = [
  [100, 50, 150, 'block'],
  [142, 18, 116, 'block'],
  [168, 40, 138, 'block'],
  [200, 16, 105, 'block'],
  [236, 32, 131, 'block'],
  [262, 18, 121, 'spire'],
  [292, 26, 106, 'twin'],
  [312, 42, 134, 'block'],
  [350, 15, 114, 'block'],
  [388, 36, 146, 'block'],
  [418, 16, 122, 'block'],
  [430, 46, 156, 'block'],
  [500, 24, 167, 'block'],
];

to(0, BASE + jit(0.6));
to(40, BASE + jit(0.8));

for (const [x, w, top, kind] of plan) {
  to(x - 3 + jit(1.2), BASE + jit(0.8));        // approach along the ground
  to(x + jit(1.4), top + jit(1.6));             // up the left edge, slightly off-vertical

  if (kind === 'twin') {
    const mid = x + w * 0.45;
    to(mid + jit(1.2), top + jit(1.5));
    to(mid + jit(1.4), top + 22 + jit(2));      // dip between the towers
    to(mid + 3 + jit(1.2), top - 9 + jit(2));   // back up, taller
    to(x + w + jit(1.4), top - 7 + jit(1.8));
  } else if (kind === 'spire') {
    const c = x + w * 0.5;
    to(c - 2 + jit(0.8), top + jit(1.2));
    to(c + jit(0.7), top - 21 + jit(1.5));      // the mast
    to(c + 2 + jit(0.8), top + jit(1.2));
    to(x + w + jit(1.4), top + jit(1.6));
  } else {
    to(x + w + jit(1.4), top + jit(1.6));       // across the roof
  }

  // down the right edge and PAST the ground, then back up: this is the crossing
  to(x + w + jit(1.6), BASE + 3 + rnd() * 6);
  to(x + w + 2 + jit(1.5), BASE + jit(0.7));
}

to(586, BASE + jit(0.8));
to(630, BASE + jit(0.6));

const d = 'M ' + pts.map(([x, y]) => `${r(x)},${r(y)}`).join(' L ');

// --- checks -------------------------------------------------------------------
if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (pass, msg) => { console.log((pass ? 'ok   ' : 'FAIL ') + msg); if (!pass) bad++; };

  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  report((d.match(/M/g) || []).length === 1, 'a single unbroken stroke (one M command)');
  report(top >= APEX - 4 && top <= 100, `apex ${r(top)} inside the ridge band`);
  report(bottom <= BASE + OVERSHOOT_MAX, `deepest descender ${r(bottom)} <= ${BASE + OVERSHOOT_MAX}`);
  report(xs[0] === 0 && xs[xs.length - 1] === 630, 'spans the full 0..630 viewBox');
  report(Math.abs(ys[0] - BASE) < 2 && Math.abs(ys[ys.length - 1] - BASE) < 2,
    'both ends sit on the ground line');

  // The defining property of this style is that the stroke crosses ITSELF. Counting
  // backtracks in x was only a proxy and stopped tracking once the gaps widened, so
  // measure the real thing: proper intersections between non-adjacent segments.
  const seg = pts.slice(0, -1).map((p, i) => [p, pts[i + 1]]);
  const cross = (a, b, c, dd) => {
    const o = (p, q, s) => Math.sign((q[0] - p[0]) * (s[1] - p[1]) - (q[1] - p[1]) * (s[0] - p[0]));
    return o(a, b, c) !== o(a, b, dd) && o(c, dd, a) !== o(c, dd, b);
  };
  let hits = 0;
  for (let i = 0; i < seg.length; i++)
    for (let j = i + 2; j < seg.length; j++)
      if (cross(seg[i][0], seg[i][1], seg[j][0], seg[j][1])) hits++;
  report(hits >= plan.length, `${hits} self-intersections (>= ${plan.length}, one per building)`);

  const dips = ys.filter((y) => y > BASE + 3).length;
  report(dips >= plan.length, `${dips} descenders cross the ground line`);

  report(!/NaN|undefined/.test(d), 'no NaN in path');
  process.exit(bad ? 1 : 0);
}

if (process.argv[2] === '--sync') {
  const fs = require('fs');
  const path = require('path');
  const targets = ['index.html', path.join('tools', 'og-card.html')];
  for (const rel of targets) {
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

// Generates the hero skyline path.
//
// Same viewBox / baseline / y-range as Altitude's mountain ridge (0 0 630 360, base
// y=177, peaks reaching y~95) so the graphic lands in the identical screen position
// at every width. Straight segments only: the ridge's C-curves become elevation lines.
//
// The ridge never returns to a baseline mid-span, so neither does this. Buildings are
// grouped into blocks that share party walls, giving one continuous stepped roofline;
// only a handful of streets drop to the ground. That keeps the density near the ridge's
// instead of reading as a row of separate towers on a shelf.

const BASE = 177;
const r = (n) => Math.round(n * 10) / 10;
const p = [];
const to = (x, y) => p.push(`L ${r(x)},${r(y)}`);

// --- roof vocabulary ---------------------------------------------------------
// Pen enters at (x, y) on the left edge of the roof, leaves at (x + w, y).
const roofs = {
  flat: (x, w, y) => to(x + w, y),

  // flat roof carrying a thin mast
  mast: (x, w, y, h = 16) => {
    to(x + w * 0.5, y); to(x + w * 0.5, y - h); to(x + w * 0.5, y); to(x + w, y);
  },

  // low-rise pitched roof
  gable: (x, w, y, rise = 7) => {
    to(x + w * 0.5, y - rise); to(x + w, y);
  },

  // raised parapet / tower cap
  crown: (x, w, y, h = 9) => {
    to(x + w * 0.3, y); to(x + w * 0.3, y - h); to(x + w * 0.7, y - h);
    to(x + w * 0.7, y); to(x + w, y);
  },

  // art-deco setback: the mass narrows as it rises
  setback: (x, w, y, d = 12) => {
    to(x + w * 0.2, y); to(x + w * 0.2, y - d); to(x + w * 0.8, y - d);
    to(x + w * 0.8, y); to(x + w, y);
  },
};

// --- composition -------------------------------------------------------------
// Blocks of party-wall buildings [width, roofY, kind, arg]. The macro silhouette
// echoes the ridge it replaces: low left shoulder, tall cluster near x=180-240,
// a dip around x=290, a second rise near x=480, tapering away to the right.
const blocks = [
  { x: 0, buildings: [[30, 172, 'flat'], [26, 166, 'gable', 6], [30, 158, 'flat'], [26, 150, 'crown', 8]] },
  { x: 120, buildings: [[26, 141, 'flat'], [22, 128, 'setback', 10], [24, 112, 'mast', 17], [20, 110, 'setback', 12], [22, 118, 'flat'], [24, 130, 'crown', 9]] },
  { x: 266, buildings: [[26, 152, 'flat'], [22, 160, 'gable', 6], [28, 148, 'flat']] },
  { x: 350, buildings: [[24, 139, 'crown', 8], [26, 133, 'flat'], [22, 143, 'flat'], [24, 136, 'setback', 9]] },
  { x: 454, buildings: [[24, 126, 'flat'], [20, 122, 'setback', 10], [22, 127, 'mast', 15], [24, 121, 'flat'], [22, 132, 'crown', 8]] },
  { x: 578, buildings: [[24, 152, 'flat'], [16, 163, 'gable', 5], [12, 172, 'flat']] },
];

p.push(`M 0,${BASE}`);
let cursor = 0;

for (const block of blocks) {
  if (block.x > cursor) to(block.x, BASE); // street
  let x = block.x;
  let prevY = BASE;
  for (const [w, y, kind, arg] of block.buildings) {
    to(x, y);                              // party wall between prevY and y
    roofs[kind](x, w, y, arg);
    x += w;
    prevY = y;
  }
  to(x, BASE);                             // down to the ground at the block's end
  cursor = x;
}
to(630, BASE);

const d = p.filter((seg, i) => seg !== p[i - 1]).join(' ');

if (process.argv[2] === '--check') {
  const pts = [...d.matchAll(/[ML] (-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  // drawn left-to-right, so x must never double back or the stroke overdraws itself
  const backtrack = xs.findIndex((x, i) => i && x < xs[i - 1] - 1e-9);
  // how often the outline drops to the ground: the ridge does it twice (its two ends),
  // so keep this low or the graphic reads as separate towers on a shelf
  const groundRuns = ys.filter((y, i) => y === BASE && ys[i - 1] !== BASE).length;
  const checks = [
    [Math.min(...ys) >= 94 && Math.min(...ys) <= 100, `tallest point ${Math.min(...ys)} within the ridge band (94..100)`],
    [Math.max(...ys) === BASE, `baseline ${Math.max(...ys)} === ${BASE}`],
    [xs[0] === 0 && xs[xs.length - 1] === 630, 'spans the full 0..630 viewBox'],
    [backtrack === -1, `x is monotonic (first backtrack at index ${backtrack})`],
    [groundRuns <= 8, `${groundRuns} descents to ground (<= 8)`],
    [!/NaN|undefined/.test(d), 'no NaN in path'],
  ];
  let bad = 0;
  for (const [pass, msg] of checks) { console.log((pass ? 'ok   ' : 'FAIL ') + msg); if (!pass) bad++; }
  process.exit(bad ? 1 : 0);
}

// write the path into index.html, matched by id so it can never hit another <path>
if (process.argv[2] === '--sync') {
  const fs = require('fs');
  const file = require('path').join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const re = /(<path id="skyline-path" d=")[^"]*(")/;
  if (!re.test(html)) { console.error('skyline-path not found in index.html'); process.exit(1); }
  fs.writeFileSync(file, html.replace(re, (m, a, b) => a + d + b));
  console.log(`synced ${d.length} chars into index.html`);
  process.exit(0);
}

console.log(d);

// Generates the hero skyline path(s).
//
// Same viewBox / baseline / y-range as Altitude's mountain ridge (0 0 630 360, base
// y=177, apex y=95) so the graphic lands in the identical screen position at every
// width. Straight segments only: the ridge's C-curves become elevation lines.
//
// Two things drive the composition:
//
// 1. Real skylines are power-law, not a comb. Seoul is one 555m tower against a
//    245-333m cluster and a long low-rise tail. Mapping that ratio onto the ridge
//    band (82 units) gives one dominant tower, two secondaries, a mid group, and a
//    lot of low mass -- the height hierarchy the first version was missing.
// 2. Width has to vary as much as height. Narrow spires next to wide slabs are what
//    stop it reading as a row of same-size boxes.
//
// Roof heights are fitted to the ridge's own y-values across x (177 at both edges,
// ~148 by x=60, peak near x=180, dip near x=290, secondary rise near x=470), so the
// skyline reads as the same silhouette rebuilt out of buildings.
//
// The ridge never returns to a baseline mid-span, so neither does this: buildings
// share party walls inside a block, and only a few streets drop to the ground.

const BASE = 177;
const APEX = 95;
const r = (n) => Math.round(n * 10) / 10;

function buildPath(blocks) {
  const p = [];
  const to = (x, y) => p.push(`L ${r(x)},${r(y)}`);

  // Pen enters at (x, y) on the left of the roof, leaves at (x + w, y).
  const roofs = {
    flat: (x, w, y) => to(x + w, y),

    // thin mast on a flat roof
    mast: (x, w, y, h = 16) => {
      const c = x + w * 0.5;
      to(c, y); to(c, y - h); to(c, y); to(x + w, y);
    },

    // pitched roof, low-rise only
    gable: (x, w, y, rise = 7) => {
      to(x + w * 0.5, y - rise); to(x + w, y);
    },

    // raised parapet
    crown: (x, w, y, h = 9) => {
      to(x + w * 0.3, y); to(x + w * 0.3, y - h); to(x + w * 0.7, y - h);
      to(x + w * 0.7, y); to(x + w, y);
    },

    // art-deco setback
    setback: (x, w, y, d = 12) => {
      to(x + w * 0.2, y); to(x + w * 0.2, y - d); to(x + w * 0.8, y - d);
      to(x + w * 0.8, y); to(x + w, y);
    },

    // tapered shaft rising to a spire — the dominant tower's crown
    taper: (x, w, y, h = 26) => {
      const c = x + w * 0.5;
      to(x + w * 0.26, y); to(x + w * 0.38, y - h * 0.62);
      to(c, y - h); to(x + w * 0.62, y - h * 0.62);
      to(x + w * 0.74, y); to(x + w, y);
    },

    // stepped crown, two shoulders
    stepped: (x, w, y, d = 10) => {
      to(x + w * 0.14, y); to(x + w * 0.14, y - d * 0.5);
      to(x + w * 0.3, y - d * 0.5); to(x + w * 0.3, y - d);
      to(x + w * 0.7, y - d); to(x + w * 0.7, y - d * 0.5);
      to(x + w * 0.86, y - d * 0.5); to(x + w * 0.86, y); to(x + w, y);
    },
  };

  p.push(`M 0,${BASE}`);
  let cursor = 0;
  for (const block of blocks) {
    if (block.x > cursor) to(block.x, BASE); // street
    let x = block.x;
    for (const [w, y, kind, arg] of block.buildings) {
      to(x, y);                              // party wall
      roofs[kind](x, w, y, arg);
      x += w;
    }
    to(x, BASE);
    cursor = x;
  }
  to(630, BASE);
  return p.filter((seg, i) => seg !== p[i - 1]).join(' ');
}

// --- foreground ---------------------------------------------------------------
// Macro silhouette echoes the ridge: low left shoulder, dominant tower near x=180,
// a dip around x=300, a secondary rise near x=470, tapering right.
const front = [
  { x: 0,   buildings: [[26, 166, 'flat'], [18, 158, 'gable', 6], [30, 152, 'flat'], [14, 144, 'crown', 7]] },
  { x: 96,  buildings: [[34, 148, 'flat'], [16, 136, 'flat'], [24, 142, 'stepped', 8]] },
  { x: 178, buildings: [[22, 138, 'flat'], [12, 118, 'taper', 23], [26, 130, 'flat'], [14, 124, 'mast', 12]] },
  { x: 260, buildings: [[40, 156, 'flat'], [20, 148, 'gable', 6], [24, 158, 'flat']] },
  { x: 352, buildings: [[22, 142, 'crown', 8], [34, 148, 'flat'], [16, 136, 'setback', 9]] },
  { x: 432, buildings: [[26, 138, 'flat'], [13, 128, 'mast', 15], [24, 133, 'stepped', 9], [30, 146, 'flat']] },
  { x: 533, buildings: [[28, 156, 'flat'], [22, 164, 'gable', 5], [20, 172, 'flat']] },
];

// --- background ---------------------------------------------------------------
// A second, much fainter plane. Sparse and simple on purpose: it reads as depth,
// not as more detail. Sits behind and slightly higher so it peeks between the
// front masses rather than competing with them.
const back = [
  { x: 40,  buildings: [[50, 150, 'flat'], [28, 142, 'flat']] },
  { x: 160, buildings: [[30, 128, 'flat'], [22, 118, 'crown', 7]] },
  { x: 270, buildings: [[44, 150, 'flat'], [26, 142, 'flat']] },
  { x: 400, buildings: [[32, 132, 'flat'], [38, 140, 'flat']] },
  { x: 505, buildings: [[30, 146, 'flat'], [26, 158, 'flat']] },
];

const paths = { front: buildPath(front), back: buildPath(back) };

// --- checks -------------------------------------------------------------------
if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (pass, msg) => { console.log((pass ? 'ok   ' : 'FAIL ') + msg); if (!pass) bad++; };

  for (const [name, d] of Object.entries(paths)) {
    const pts = [...d.matchAll(/[ML] (-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    // drawn left-to-right, so x must never double back or the stroke overdraws itself
    const backtrack = xs.findIndex((x, i) => i && x < xs[i - 1] - 1e-9);
    const top = Math.min(...ys);
    report(top >= APEX - 1 && top <= (name === 'front' ? 100 : 130),
      `${name}: apex ${top} inside its band`);
    report(Math.max(...ys) === BASE, `${name}: baseline ${Math.max(...ys)} === ${BASE}`);
    report(xs[0] === 0 && xs[xs.length - 1] === 630, `${name}: spans 0..630`);
    report(backtrack === -1, `${name}: x monotonic (first backtrack ${backtrack})`);
    report(!/NaN|undefined/.test(d), `${name}: no NaN`);
  }

  // the front plane must actually have hierarchy, not be a comb: the tallest
  // building should stand well clear of the median roof height
  const roofs = front.flatMap((b) => b.buildings.map(([, y]) => y)).sort((a, b) => a - b);
  const tallest = roofs[0];
  const median = roofs[Math.floor(roofs.length / 2)];
  report(median - tallest >= 25, `front: hierarchy, median roof ${median} vs tallest ${tallest}`);

  const widths = front.flatMap((b) => b.buildings.map(([w]) => w));
  report(Math.max(...widths) / Math.min(...widths) >= 3,
    `front: width variance ${Math.min(...widths)}..${Math.max(...widths)} (>=3x)`);

  process.exit(bad ? 1 : 0);
}

if (process.argv[2] === '--sync') {
  const fs = require('fs');
  const path = require('path');
  // the social card reuses the same silhouette, so it is synced from here too
  const targets = ['index.html', path.join('tools', 'og-card.html')];
  for (const rel of targets) {
    const file = path.join(__dirname, '..', rel);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    for (const [name, d] of Object.entries(paths)) {
      const re = new RegExp(`(<path id="skyline-${name}" d=")[^"]*(")`);
      if (!re.test(html)) { console.error(`skyline-${name} not found in ${rel}`); process.exit(1); }
      html = html.replace(re, (m, a, b) => a + d + b);
    }
    fs.writeFileSync(file, html);
    console.log(`synced ${rel}`);
  }
  process.exit(0);
}

console.log(JSON.stringify(paths, null, 1));

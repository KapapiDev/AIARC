// The hero's architectural drawing.
//
// Composition, from the approved comp: documents stacked on the left, a couple of
// small masses bridging the middle, a dynamic canopy and frames on the right. The
// centre column is left empty so the copy sits on unbroken ground.
//
// The line is not a plain vector edge and not a rough brush either. Every edge is
// drawn once as the real line, then given sketch marks ONLY where a hand leaves
// them: a slight overshoot past a corner, a doubled stroke at the start and the
// end of a run, and a faint parallel ghost on the long verticals and diagonals.
// Spraying noise along the whole length is what makes this kind of graphic look
// low-resolution rather than drawn, so the middle of a short edge gets nothing.

const VB_W = 1600;
const VB_H = 900;
const STROKE = 2;                    // at a 1600-wide render; CSS holds the px
const INK = 'rgba(255,255,255,0.45)';
const GHOST = 'rgba(255,255,255,0.27)';

// deterministic wobble - the same drawing every build
let seed = 20260906;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const jit = (a) => (rnd() - 0.5) * 2 * a;
const r = (n) => Math.round(n * 10) / 10;

// --- the composition ----------------------------------------------------------
// `poly` closes, `line` does not. Order is left group, centre bridge, right group.
const SHAPES = [
  // ── left: documents and mass, rectangles overlapping in shallow perspective ──
  { k: 'poly', p: [[92, 350], [402, 316], [416, 700], [106, 734]] },        // outer sheet
  { k: 'poly', p: [[262, 374], [394, 364], [398, 566], [266, 576]] },       // sheet within it
  { k: 'line', p: [[106, 734], [110, 836]] },                               // outer sheet, carried down
  { k: 'line', p: [[416, 700], [420, 640]] },                               // and its right edge
  { k: 'poly', p: [[142, 594], [244, 588], [248, 790], [146, 796]] },       // sheet in front, lower
  { k: 'poly', p: [[456, 450], [510, 442], [516, 742], [462, 750]] },       // thin panel alongside
  { k: 'line', p: [[452, 736], [518, 730], [518, 688], [580, 684], [580, 646], [642, 642]] }, // steps up

  // ── centre: two small masses and a bridge, kept quiet ────────────────────────
  { k: 'line', p: [[652, 842], [656, 566], [700, 540], [736, 566], [740, 704]] },  // pitched mass
  { k: 'poly', p: [[798, 844], [800, 728], [866, 724], [868, 842]] },              // small block
  { k: 'line', p: [[740, 704], [806, 700], [812, 686], [934, 682]] },              // the bridge

  // ── right: canopy, the frame under it, a long low mass, verticals ────────────
  // the canopy is a wedge, not one diagonal: two edges converging to the right,
  // then the whole thing falls to the floor
  { k: 'line', p: [[1038, 528], [1452, 312], [1472, 328], [1476, 806]] },   // upper edge, and the fall
  { k: 'line', p: [[1038, 528], [1052, 572], [1446, 366], [1452, 312]] },   // underside, closing the wedge
  { k: 'line', p: [[1052, 572], [1196, 574]] },                             // underside carried in
  { k: 'line', p: [[1446, 366], [1450, 690]] },                             // inner post under the canopy
  { k: 'poly', p: [[1196, 484], [1298, 480], [1302, 600], [1200, 604]] },   // frame beneath it
  { k: 'poly', p: [[944, 688], [1338, 700], [1340, 844], [948, 836]] },     // long mass, in front
  { k: 'line', p: [[1196, 574], [1200, 604]] },                             // tie into that frame
  { k: 'poly', p: [[1490, 336], [1552, 348], [1556, 800], [1494, 794]] },   // tall frame, far right
  { k: 'line', p: [[1572, 356], [1600, 360]] },                             // one more, off the edge
  { k: 'line', p: [[1576, 800], [1600, 798]] },
  { k: 'line', p: [[1574, 356], [1578, 800]] },
];

// --- drawing ------------------------------------------------------------------
const len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const norm = (a, b) => { const L = len(a, b) || 1; return [-(b[1] - a[1]) / L, (b[0] - a[0]) / L]; };
const off = (p, n, d) => [p[0] + n[0] * d, p[1] + n[1] * d];

// one edge, bowed a hair so it is not machine-straight
function edge(a, b, bow = 0.5) {
  const L = len(a, b);
  if (L < 8) return `M${r(a[0])},${r(a[1])}L${r(b[0])},${r(b[1])}`;
  const n = norm(a, b), m = lerp(a, b, 0.5), d = jit(bow);
  return `M${r(a[0])},${r(a[1])}Q${r(m[0] + n[0] * d * 2)},${r(m[1] + n[1] * d * 2)} ${r(b[0])},${r(b[1])}`;
}

// The sketch marks. Overshoot rides past a corner the way a pen does; the ghost is
// a faint parallel that only exists on long runs, and only over part of them.
function marks(a, b, closed) {
  const out = [];
  const L = len(a, b);
  const n = norm(a, b);
  const dir = [(b[0] - a[0]) / (L || 1), (b[1] - a[1]) / (L || 1)];

  // overshoot past the far corner, the way a pen carries on before it lifts
  if (closed && L > 40 && rnd() < 0.45) {
    const over = 6 + rnd() * 10;
    const t = [b[0] + dir[0] * over, b[1] + dir[1] * over];
    out.push({ d: `M${r(b[0])},${r(b[1])}L${r(t[0])},${r(t[1])}`, ghost: true });
  }
  // doubled stroke where the hand sets down and where it lifts - the two places a
  // drawn line always frays, and the reason the middle of an edge is left alone
  if (L > 55) {
    const s = 0.12 + rnd() * 0.10, e = 0.14 + rnd() * 0.10;
    const o1 = jit(1.7), o2 = jit(1.7);
    out.push({ d: edge(off(a, n, o1), off(lerp(a, b, s), n, o1 * 0.35), 0.4), ghost: true });
    out.push({ d: edge(off(lerp(a, b, 1 - e), n, o2 * 0.35), off(b, n, o2), 0.4), ghost: true });
  }
  // a parallel strand alongside the long verticals and diagonals, over part of the
  // run only, so it reads as a second pass of the pen rather than a thicker line
  const steep = Math.abs(dir[1]) > 0.30;
  if (L > 110 && steep && rnd() < 0.8) {
    const o = (rnd() < 0.5 ? -1 : 1) * (1.9 + rnd() * 1.5);
    const t0 = 0.05 + rnd() * 0.14, t1 = 0.78 + rnd() * 0.16;
    out.push({ d: edge(off(lerp(a, b, t0), n, o), off(lerp(a, b, t1), n, o), 1.1), ghost: true });
  }
  return out;
}

function build() {
  seed = 20260906;
  const ink = [], ghost = [];
  for (const s of SHAPES) {
    const pts = s.p, closed = s.k === 'poly';
    const n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      ink.push(edge(a, b));
      for (const m of marks(a, b, closed)) (m.ghost ? ghost : ink).push(m.d);
    }
  }
  return { ink: ink.join(''), ghost: ghost.join('') };
}

const { ink, ghost } = build();

if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (p, m) => { console.log((p ? 'ok   ' : 'FAIL ') + m); if (!p) bad++; };
  const all = ink + ghost;
  const xs = [], ys = [];
  all.replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, a, b) => { xs.push(+a); ys.push(+b); });

  report(!/NaN|undefined/.test(all), 'no NaN in the art');
  report(!/Z/.test(all), 'strokes only, nothing fills');

  // The centre column belongs to the copy: the headline spans about x 545..1055
  // in this box and the button's underside lands near y=512. Nothing may cross it.
  const intrudes = [];
  all.replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, a, b) => {
    if (+a > 545 && +a < 1055 && +b < 515) intrudes.push(`${a},${b}`);
  });
  report(intrudes.length === 0, `centre column clear above the CTA (${intrudes.length} points inside)`);

  report(Math.min(...ys) > 280, `nothing climbs into the headline (top y ${Math.min(...ys)})`);
  report(Math.max(...ys) <= VB_H, `stays inside the box (bottom y ${Math.max(...ys)})`);
  report(Math.min(...xs) < 120 && Math.max(...xs) >= VB_W - 4, 'reaches both edges');

  const inkRuns = (ink.match(/M/g) || []).length, ghostRuns = (ghost.match(/M/g) || []).length;
  report(ghostRuns > 20 && ghostRuns < inkRuns * 3, `${inkRuns} drawn edges, ${ghostRuns} sketch marks`);
  process.exit(bad ? 1 : 0);
}

if (process.argv[2] === '--sync') {
  const fs = require('fs'), path = require('path');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" ` +
    `preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">\n` +
    `          <path id="hero-art-ghost" d="${ghost}" fill="none" stroke="${GHOST}" ` +
    `stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>\n` +
    `          <path id="hero-art-ink" d="${ink}" fill="none" stroke="${INK}" ` +
    `stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>\n` +
    `        </svg>`;
  const file = path.join(__dirname, '..', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const re = /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 [\d.]+ [\d.]+"[\s\S]*?<\/svg>/;
  if (!re.test(html)) { console.error('hero svg not found'); process.exit(1); }
  html = html.replace(re, svg);
  fs.writeFileSync(file, html);
  console.log(`synced index.html (${(ink.match(/M/g) || []).length} edges, ${(ghost.match(/M/g) || []).length} marks, ${(ink + ghost).length} chars)`);
  process.exit(0);
}

console.log(JSON.stringify({ ink, ghost }));

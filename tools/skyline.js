// Generates the hero skyline by tracing the reference drawing.
//
// TRACE below is not drawn by eye. It is the pen path read out of the reference
// image by scanning every row for horizontal ink runs and every column for
// vertical ones, then walking the result end to end. Only the measurements live
// here, not the image, which is not ours to redistribute.
//
// Three facts the pixels gave up that no amount of squinting had:
//   - There is NO ground under the city. The ground line exists only at the far
//     left (x 47-125) and far right (x 313-360). Between them every wall stops
//     in mid-air somewhere around y 97-122. Drawing the walls down onto a
//     continuous ground - which every earlier version did - turns a loose,
//     floating sketch into a solid stepped mass. This is the single biggest
//     reason it read as a different drawing.
//   - The tall tower is a tapering obelisk, not a needle on a roof: its walls
//     run from a 10px base at y=108 up to a 3px point at y=16, and the roofline
//     of the two flanking towers crosses straight through it at y=32.
//   - Several walls are walked down and back up before the line moves on, and
//     three roofs overshoot into a short stub before doubling back. Those stubs
//     are visible in the drawing and are part of why it reads as hand-made.

// --- traced from the reference (451x188 px) ----------------------------------
const REF_GROUND = 126;
const REF_X0 = 47;
const REF_X1 = 360;
const REF_TOP = 16;                // the obelisk's point

// The pen path, in reference pixels, in stroke order.
const TRACE = [
  [47, 126], [100, 126], [119, 126], [124, 125.5],          // ground, left
  [124, 89],                                                 // up the first wall
  [138, 88.5], [152, 88],                                    // roof
  [151, 104], [150.5, 120],                                  // down, hanging
  [149.5, 100], [149.5, 56],                                 // and back up
  [158, 55.5], [168, 56],                                    // roof
  [168.5, 73], [168.5, 89.5],                                // down
  [161, 89.5],                                               // stub back to the left
  [170, 90], [177, 90],                                      // roof
  [175.5, 104], [175.5, 118],                                // down, hanging
  [176.5, 80], [177, 45.5],                                  // and back up
  [183, 45.5], [189, 46],                                    // roof
  [190, 70], [190, 97],                                      // down, hanging
  [189, 80], [189, 63],                                      // and back up
  [196, 63], [202, 63],                                      // roof
  [202.5, 85], [202.5, 106],                                 // down
  [182, 107.5],                                              // stub back to the left
  [196, 108], [210, 108],                                    // and out to the right
  [212, 115], [212, 122],                                    // down
  [211.5, 108], [211.5, 95.5],                               // and back up
  [217, 95.5], [222, 96],                                    // roof
  [222, 109],                                                // down
  [220, 109],                                                // across the narrow base
  [219.5, 70], [219.5, 33.5],                                // up the tall left wall
  [228.5, 32.8],                                             // roof, into the obelisk
  [229, 24], [229.5, 16],                                    // up to the point
  [231, 33], [232, 50], [233.5, 62], [234, 72],              // down the right side,
  [234.7, 82], [235, 92], [236, 101], [235, 108],            //   flaring as it falls
  [230, 108], [225, 108],                                    // base
  [224, 100], [225, 90], [226, 80], [227, 70],               // up the left side
  [227.7, 60], [228, 50], [228.3, 33],
  [233, 32.4], [238, 32],                                    // roof continues right
  [238, 66], [238.5, 101],                                   // down, hanging
  [246, 100.7], [254, 100.5],                                // roof
  [255.5, 108], [256, 116],                                  // down, hanging
  [255, 90], [255, 59],                                      // and back up
  [266, 59], [277, 59],                                      // roof
  [277.5, 88], [278, 116],                                   // down
  [280, 115.5],                                              // across
  [280, 106], [280, 97],                                     // up
  [286, 97], [293, 97],                                      // roof
  [293, 104], [293.5, 109],                                  // down
  [287, 110],                                                // stub back to the left
  [300, 110.5], [313, 111],                                  // and out to the right
  [313.5, 119], [313.5, 126],                                // down to the ground
  [336, 125.7], [356, 126], [360, 126],                      // ground, right
];

// Topmost inked pixel per column, flattened into runs. Read out of the image in
// a separate pass from TRACE, so it works as an independent check on it.
const REF_RUNS = [
  [47, 122, 125], [123, 148, 88], [149, 168, 55], [170, 176, 90],
  [177, 189, 45], [190, 203, 63], [204, 211, 108], [212, 218, 95],
  [219, 227, 33], [232, 239, 32], [240, 253, 100], [254, 277, 59],
  [280, 293, 97], [295, 314, 110], [315, 360, 125],
];

// --- mapping into the hero's viewBox -----------------------------------------
const VB_W = 630;
// The viewBox is cropped tight to the drawing. It used to be 630x360 with the
// ground line at y=177, which left the bottom half of the svg empty and forced
// the hero to position it by a top:% guess. With no dead space the graphic can
// simply be anchored to the bottom of the viewport, which is what keeps the
// obelisk clear of the CTA now that the drawing is at the reference's own scale.
const VB_H = 166;
const BASE = 158;                  // ground line, 8 units of air below it for the cap
// The reference's drawing fills 69% of its frame width (313 of 451 px). Placing
// it at S=1 in a 630-wide viewBox filled only 50%, which is why it looked small
// and cramped with too much flat line either side.
const S = VB_W / 451;
const REF_W = REF_X1 - REF_X0;
const X0 = Math.round((VB_W - REF_W * S) / 2);

const mx = (rx) => (rx - REF_X0) * S + X0;
const my = (ry) => BASE - (REF_GROUND - ry) * S;

const r = (n) => Math.round(n * 10) / 10;
const pts = TRACE.map(([x, y]) => [mx(x), my(y)]);

// The two flat ground runs are the only thing extended past the reference's own
// frame: on the page they run out to the viewport edges instead of stopping in
// mid-air at 69% width. Nothing else about the drawing is changed.
pts.unshift([0, my(REF_GROUND)]);
pts.push([VB_W, my(REF_GROUND)]);

const d = 'M ' + pts.map(([x, y]) => `${r(x)},${r(y)}`).join(' L ');

// --- checks -------------------------------------------------------------------
if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (p, m) => { console.log((p ? 'ok   ' : 'FAIL ') + m); if (!p) bad++; };
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);

  report((d.match(/M/g) || []).length === 1, 'a single unbroken stroke');
  report(xs[0] === 0 && xs[xs.length - 1] === VB_W, 'spans the full viewBox width');
  report(Math.max(...ys) <= BASE + 0.5, `nothing below the ground line (max y ${r(Math.max(...ys))})`);
  report(Math.min(...ys) > 0 && Math.max(...ys) < VB_H,
    `the drawing fits the ${VB_W}x${VB_H} viewBox (y ${r(Math.min(...ys))}..${r(Math.max(...ys))})`);
  report(Math.abs(Math.min(...ys) - my(REF_TOP)) < 1.5, 'the obelisk reaches the traced point');

  // Topmost drawn y at a given x, checked against the reference's own profile.
  const topAt = (qx) => {
    let top = null;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      if (ax === bx) continue;
      if (qx < Math.min(ax, bx) || qx > Math.max(ax, bx)) continue;
      const y = ay + (by - ay) * ((qx - ax) / (bx - ax));
      if (top === null || y < top) top = y;
    }
    return top;
  };
  let worst = 0, worstRun = null;
  for (const [rx0, rx1, ry] of REF_RUNS) {
    const got = topAt(mx((rx0 + rx1) / 2));
    if (got === null) continue;
    const err = Math.abs(got - my(ry));
    if (err > worst) { worst = err; worstRun = [rx0, rx1, ry]; }
  }
  report(worst <= 2, `every roof within ${r(worst)} of the traced profile${worst > 2 ? ' (worst ' + worstRun + ')' : ''}`);

  // The city floats. Only the two flat runs at the ends touch the ground; if a
  // wall in between reaches it, the drawing has turned back into a solid mass.
  const groundY = my(REF_GROUND);
  const onGround = pts.filter(([x, y]) => Math.abs(y - groundY) < 2 && x > mx(126) && x < mx(312));
  report(onGround.length === 0, `no wall touches the ground between the two flat runs (${onGround.length} do)`);

  const gotWidthShare = (REF_W * S) / VB_W;
  const wantWidthShare = REF_W / 451;
  report(Math.abs(gotWidthShare - wantWidthShare) < 0.03,
    `drawing fills ${(gotWidthShare * 100).toFixed(0)}% of the width (reference ${(wantWidthShare * 100).toFixed(0)}%)`);

  const STROKE = 2.1;                                       // must match the CSS
  const wantStrokeRatio = 1.5 / (REF_GROUND - REF_TOP);
  const gotStrokeRatio = STROKE / ((REF_GROUND - REF_TOP) * S);
  report(Math.abs(gotStrokeRatio - wantStrokeRatio) / wantStrokeRatio < 0.08,
    `line is ${(gotStrokeRatio * 100).toFixed(2)}% of drawing height (reference ${(wantStrokeRatio * 100).toFixed(2)}%)`);

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
    const vb = /(viewBox=")0 0 630 \d+(")/;
    if (!vb.test(html)) { console.error(`skyline viewBox not found in ${rel}`); process.exit(1); }
    fs.writeFileSync(file, html.replace(re, (m, a, b) => a + d + b)
                                .replace(vb, (m, a, b) => `${a}0 0 ${VB_W} ${VB_H}${b}`));
    console.log(`synced ${rel}`);
  }
  process.exit(0);
}

// --overlay emits the inverse transform, so the generated path can be laid back
// over the reference image at 1:1 for a real look-at-it comparison.
if (process.argv[2] === '--overlay') {
  console.log(JSON.stringify({
    d,
    transform: `translate(${r(REF_X0 - X0 / S)},${r(REF_GROUND - BASE / S)}) scale(${(1 / S).toFixed(5)})`,
    strokeWidth: (2.1 / S).toFixed(2),
  }));
  process.exit(0);
}

console.log(d);

// The hero skyline: a re-authored clean vector line.
//
// Provenance, in order. It began as a raster target image, traced as a filled
// outline of its ink, then converted to a centreline so the weight could be a
// number instead of geometry. That centreline was faithful but read as a nervous
// sketch: it carried the raster micro-wobble, and the skeleton walker had
// chopped long roofs into as many as six fragments whose joins added their own
// jitter. 11.2KB of path data to draw a tremor.
//
// This version stops tracing. The fragments were re-joined into 14 strokes, each
// reduced to its intentional anchors (Douglas-Peucker at 8px, which removes the
// tremor while a real 90-degree corner survives any tolerance), and re-emitted as
// straight runs with rounded corners and one shallow bow each. The bow uses a
// fixed seed, so the drawing is identical every build - a designed lean, not
// noise. 2.2KB, a fifth of what it replaced.
//
// The central tower is drawn outright, in tools/refine.js. The trace gave it one
// near-vertical wall and one hard diagonal to the tip, so it read as a leaning
// sail with a notch on top; it is now tapered evenly to a single clean point.
//
// The whole drawing is squashed to 90% of its height about the ground line, which
// lowers the peak without narrowing the silhouette, and sits lower in the hero so
// it backs the copy up rather than competing with it.
//
// viewBox is 1905 x 394. 1905 was the source content width, so at a 1920
// viewport the drawing is 1:1 and runs edge to edge. Ink occupies y 57..391.

const VB_W = 1905;
const VB_H = 394;
// Width at a 1920 viewport, down from 2.4. non-scaling-stroke takes it out of the
// viewBox scale so the CSS can hold it in real pixels: 0.099vw is exactly this at
// 1920 and keeps the proportion on bigger screens, with a floor because the
// proportional width on a 390px phone is 0.39px, which is a smear not a line.
const STROKE = 1.9;
const COLOUR = '#f8f8f8';

const d = 'M1105.5,59.3Q1111.4,75 1116,91Q1117.6,95.8 1122.6,96.3Q1141.8,99.3 1161.2,100.2Q1166.2,100.7 1166.2,105.7Q1165,205.1 1164.3,304.5Q1164.3,309.5 1169.3,309.5Q1215.1,310.7 1261,309.9Q1266,309.9 1267.8,314.6Q1275.5,331.4 1281.2,349.1Q1283,353.7 1282.7,348.7Q1278.9,265.9 1273.5,183.1M1112,331.6Q1098.5,331.9 1085,331.6Q1080,331.6 1080.4,326.6Q1088.4,223 1098.6,119.7Q1099,114.7 1099.9,109.8Q1103.5,85.7 1109.1,62Q1110,57.1 1110.9,62Q1114.4,86.1 1120.1,109.8Q1121,114.7 1121.5,119.7Q1131.4,223.3 1143.5,326.6Q1144,331.6 1139,331.6Q1125.5,331.5 1112,331.6M786,329.3Q853.4,325 920.7,320.9Q925.7,320.6 925.8,315.6Q926.5,258.4 926.9,201.2Q927,196.2 922,196.1Q883.1,194.7 844.2,193.9Q839.2,193.7 839.5,198.7Q841.4,244 844.7,289.2Q845,294.2 843.6,289.3Q839.3,272.2 833.7,255.4Q832.3,250.6 832.7,245.6Q833.9,225.4 835.5,205.1M1489,339.2Q1506.7,338.7 1524.4,338.2Q1529.4,338.1 1529.4,333.1Q1530.1,319.1 1529.1,305.2Q1529.1,300.2 1524.1,300.2Q1488.3,300.3 1452.5,299.8Q1447.5,299.8 1446.9,304.8Q1444.5,325.6 1442.1,346.3Q1441.5,351.3 1436.5,351.5L1433.6,351.6Q1428.6,351.8 1428.4,346.8Q1423.3,266.6 1420.3,186.3Q1420,181.3 1415,181.3Q1346,180.7 1277,181.3M400.5,276.2Q398.5,330.5 398.1,384.8Q398,389.8 393,389.8Q196.5,389.2 0,387.8M646,274.9Q670.9,271.7 695.9,270Q700.9,269.5 700.5,264.5Q698.1,220.8 693.4,177.3Q693,172.3 688,172.2Q633.7,171.8 579.5,169.7Q574.5,169.6 574.4,174.6Q572.9,239.3 571.2,304Q571.1,309 572.4,313.8Q579.5,339.5 586.5,365.3M1905,387.4Q1790.3,390 1675.5,390.8Q1670.5,390.9 1670.1,385.9Q1667.8,367.6 1667.4,349.2Q1667,344.2 1662,344Q1595.8,341.8 1529.5,340.1M986.5,371.6Q988.8,335.8 989.8,299.9Q990,294.9 995,294.5Q1013.7,292 1032.5,291.5Q1037.5,291.1 1037.5,286.1Q1038,196.4 1038,106.6Q1038,101.6 1043,101.8Q1069.2,103.6 1095.5,103.4M416.5,273.5Q496.9,271.9 577.4,271.4Q582.4,271.3 582.5,276.3Q583,313.2 584,350M757,138.5Q753.4,238.5 749,338.3M860.5,331.6Q916.3,332 972,333.3Q977,333.4 978.2,338.2Q981.6,351.3 985,364.4M747.5,359Q744.5,321.2 740.5,283.5Q740,278.5 735,278.3Q709,278 683,276.7M761,137.2Q794.4,137.2 827.8,138.9Q832.8,139 833.3,144Q834.7,168.6 838,193M1037,294.2Q1037.3,308 1038.2,321.6Q1038.4,326.6 1041.9,330.2L1047.5,335.8Q1051,339.3 1051.1,334.3Q1051.3,317.9 1052,301.5Q1052.2,296.5 1047.3,295.2L1038.5,292.9';

// --- checks -------------------------------------------------------------------
if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (p, m) => { console.log((p ? 'ok   ' : 'FAIL ') + m); if (!p) bad++; };
  const xs = [], ys = [];
  d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, a, b) => { xs.push(+a); ys.push(+b); });

  report(!/NaN|undefined/.test(d), 'no NaN in path');
  report(!/Z/.test(d), 'open strokes, so nothing reads as a filled shape');
  const strokes = (d.match(/M/g) || []).length;
  report(strokes > 8 && strokes < 20, `${strokes} strokes`);

  // Full bleed is the one thing that must never regress.
  report(Math.min(...xs) <= 0.5, `runs to the left edge (min x ${Math.min(...xs)})`);
  report(Math.max(...xs) >= VB_W - 0.5, `runs to the right edge (max x ${Math.max(...xs)})`);

  const top = Math.min(...ys), bot = Math.max(...ys);
  report(top - STROKE / 2 > 0 && bot + STROKE / 2 < VB_H,
    `stroked extent ${(top - STROKE / 2).toFixed(1)}..${(bot + STROKE / 2).toFixed(1)} fits ${VB_H}`);
  // The squash is the point: undoing it would put the tower back into the copy.
  report(bot - top < 345, `drawing is ${(bot - top).toFixed(0)} units tall, lowered from 376`);

  report(STROKE <= 2.05 && STROKE >= 1.75,
    `stroke ${STROKE}, ${(100 - STROKE / 2.4 * 100).toFixed(0)}% thinner than before`);
  // Rounded corners and bowed runs are quadratics; a path of pure L commands
  // would mean the re-authoring pass never ran.
  report(/Q/.test(d), 'rounded corners and bowed runs are present');
  process.exit(bad ? 1 : 0);
}

if (process.argv[2] === '--sync') {
  const fs = require('fs'), path = require('path');
  for (const rel of ['index.html', path.join('tools', 'og-card.html')]) {
    const file = path.join(__dirname, '..', rel);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');

    // Rewrite the whole element, so the stroke attributes can never drift from
    // the path they belong to.
    const el = /<path id="skyline-line"[^>]*\/>/;
    if (!el.test(html)) { console.error(`skyline-line not found in ${rel}`); process.exit(1); }
    html = html.replace(el, `<path id="skyline-line" d="${d}" fill="none" stroke="${COLOUR}" ` +
      `stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round" ` +
      `vector-effect="non-scaling-stroke"/>`);

    // The viewBox must be rewritten on the skyline's OWN svg. Matching the first
    // viewBox in the file overwrote the hamburger icon's 0 0 24 24 and left the
    // skyline untouched, which is how the drawing once rendered three times
    // oversize. Walk back from the path to the <svg that opens it instead.
    const at = html.indexOf('id="skyline-line"');
    const open = html.lastIndexOf('<svg', at);
    const close = html.indexOf('>', open);
    if (open < 0 || close < 0 || close > at) { console.error(`skyline svg not found in ${rel}`); process.exit(1); }
    const tag = html.slice(open, close);
    if (!/viewBox="/.test(tag)) { console.error(`skyline viewBox not found in ${rel}`); process.exit(1); }
    html = html.slice(0, open)
         + tag.replace(/viewBox="[^"]*"/, `viewBox="0 0 ${VB_W} ${VB_H}"`)
         + html.slice(close);

    fs.writeFileSync(file, html);
    console.log(`synced ${rel} (viewBox 0 0 ${VB_W} ${VB_H}, stroke ${STROKE})`);
  }
  process.exit(0);
}

console.log(d);

// The hero skyline, rebuilt from the supplied art-direction image.
//
// The reference is a genuine one-line drawing: the pen enters at the left frame
// edge, walks the city, and leaves at the right. That structure is the point of
// the graphic, so this is ONE path - a single M, no fragments, nothing that can
// read as a broken piece.
//
// How it got here, and why it is not a pixel trace. The reference was
// thresholded, thinned to a one-pixel skeleton (Zhang-Suen, 6 passes), and the
// skeleton walked by following the heading rather than by node degree. That gave
// 20 fragments, because the walker stops wherever the line crosses itself; they
// were re-joined nearest-end-first into one chain running x 0 to 2171, and the
// one short hanging wall left over was spliced back in as a there-and-back
// detour, which is what the pen itself did.
//
// The chain was then reduced from 4799 points to 75 intentional anchors
// (Douglas-Peucker at 4) and re-emitted as straight runs with rounded corners
// and one shallow bow each. That is the difference between copying the raster
// and moving the drawing across: the silhouette is the reference, the tremor is
// not. Measured against the reference image, 99.7% of its ink is within 4px of
// this path and 100% of this path is within 4px of its ink.
//
// viewBox 1905 x 300, the page content width at 1920, so the drawing is 1:1 and
// runs edge to edge. Ink occupies y 14..286; the ground line sits at 284.5.

const VB_W = 1905;
const VB_H = 300;
// The reference draws a 5px line on a 2172-wide frame, which is 4.4 at this
// scale. That is heavier than the 1.9 this replaces, so it lands between the
// two: present enough to match the reference's weight, still a thin line.
// non-scaling-stroke takes it out of the viewBox scale so the CSS can hold it in
// real pixels - 0.156vw is exactly this at 1920, with a floor because the
// proportional width on a 390px phone is 0.6px, which is a smear not a line.
const STROKE = 3;
const COLOUR = '#f8f8f8';

const d = 'M0,284.5Q146.3,284.9 292.6,286.2Q296.6,286.2 298.7,282.9L300.6,280Q302.7,276.6 303.1,272.6Q305.6,252.5 306.8,232.3Q307.1,228.3 311.1,228.3Q356.7,228.5 402.3,228.3Q406.3,228.3 408.7,231.4L410,233Q412.4,236.2 412.5,240.2Q412.2,253.3 413.2,266.4Q413.3,270.4 417.3,270.9L432.1,272.6Q436.1,273.1 436.3,269.1Q438,219.9 441.2,170.8Q441.4,166.8 445.4,166.7Q469.5,166.5 493.5,165.2Q497.5,165.1 497.7,169Q499.9,209.8 501.7,250.6Q501.9,254.6 502.3,250.6Q503.4,228.7 506,206.8Q506.3,202.8 510.3,202.8Q535.7,201.7 561.1,202Q565.1,201.9 565.3,205.9Q566.1,229.6 568.3,253.3Q568.6,257.3 572.6,257.3Q607.6,258.5 642.7,258.1Q646.7,258.1 649.5,260.2L650.9,261.3Q653.7,263.4 654.4,267.4L656.6,281.4Q657.2,285.4 661.2,285.5L676,286.1Q680,286.2 680.1,282.2Q681.4,213.4 682.6,144.5Q682.7,140.5 686.7,140.3Q712.1,139.1 737.5,138Q741.5,137.8 741.6,141.8Q742.7,175.6 744,209.4Q744.1,213.4 748.1,213.5Q770.9,214.4 793.6,215Q797.6,215.1 799.7,216.9L800.8,217.7Q802.9,219.5 802.9,223.5Q802.4,240.1 802.9,256.8Q802.9,260.8 803,256.8Q804.2,227.9 804.5,198.9Q804.7,194.9 808.6,195L830.5,195.7Q834.5,195.8 834.5,199.8Q835.1,239.7 835.3,279.6Q835.4,283.6 839.4,283.7Q856.4,284 873.5,284.4Q877.5,284.5 877.7,280.5Q878.9,264.8 879.1,249Q879.2,245 883.2,244.6L904.2,242.7Q908.2,242.3 909.3,238.5L911.5,230.4Q912.6,226.5 916.6,226.5Q942.4,226.3 968.2,226.5Q972.2,226.5 972.6,230.5Q974,245 975.4,259.4Q975.8,263.4 979.7,263.8L996.3,265.6Q1000.3,266 1001,270L1002.3,277.9Q1003,281.9 1005.8,283.3L1007.2,284Q1010,285.4 1010,281.4Q1010.2,209 1011.7,136.6Q1011.7,132.6 1014.6,129.7L1020.3,124Q1023.1,121.1 1027.1,121.1L1045.5,121.1Q1049.5,121.1 1049.7,125.1Q1051.3,156.3 1053.6,187.4Q1053.9,191.4 1052.8,195.3Q1047.2,215 1042.6,234.9Q1041.6,238.8 1041.3,242.8Q1040.5,259.9 1039.2,277Q1038.9,281 1039.7,277Q1049.8,221.6 1061,166.3Q1061.8,162.4 1061.9,158.4Q1065.6,88.2 1067.7,18Q1067.9,14 1068.6,17.9Q1072.4,36.7 1075.1,55.7Q1075.8,59.7 1079.5,61.2L1088.8,65.1Q1092.5,66.7 1094.4,70.2L1098.4,77.3Q1100.4,80.7 1100.5,84.7Q1105.3,183.1 1109.8,281.4Q1110,285.4 1114,285.3L1137.6,284.6Q1141.6,284.5 1142,280.5Q1144.2,255.5 1146.5,230.5Q1146.9,226.5 1150.9,226.4Q1178,225 1205.2,224.9Q1209.2,224.8 1209.5,220.8Q1211.6,188.7 1215,156.7Q1215.3,152.8 1219.3,153L1242.9,154.3Q1246.9,154.5 1247,158.5Q1248.9,219.5 1251.1,280.5Q1251.3,284.5 1255.3,284.3Q1273.2,284 1291.2,282.9Q1295.2,282.7 1295.2,278.7Q1294.9,264.3 1295.9,249.8Q1296,245.9 1299.5,244.1L1301.3,243.2Q1304.8,241.5 1305.3,237.5L1307,221.7Q1307.4,217.7 1311.4,218L1332.4,219.3Q1336.4,219.5 1336.8,223.5Q1338.4,243.2 1340.4,262.9Q1340.8,266.9 1344.8,267Q1361.8,268 1378.9,267.7Q1382.9,267.8 1384.7,266.4L1385.5,265.7Q1387.3,264.3 1387.4,260.3Q1387.8,207.2 1389,154.1Q1389,150.1 1393,150.2Q1418,150.7 1443,150.9Q1447,151 1447,155Q1448.1,210.7 1448.7,266.4Q1448.7,270.4 1450.5,271.5L1451.3,272Q1453.1,273.1 1456.8,271.6L1460.8,270.1Q1464.5,268.7 1464.8,264.7Q1465.5,248.5 1466.9,232.3Q1467.1,228.3 1471.1,228.1L1489.5,227.5Q1493.5,227.4 1494.4,223.5L1496.9,212.9Q1497.9,209 1501.9,209L1525.4,209Q1529.4,209 1530.1,212.9Q1532.1,225.6 1534.1,238.4Q1534.7,242.3 1538.7,242.4Q1580.8,243.5 1622.8,244Q1626.8,244.1 1627.6,248Q1631.1,264.7 1634,281.4Q1634.7,285.4 1638.7,285.4Q1771.9,284.8 1905,285.4';

// --- checks -------------------------------------------------------------------
if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (p, m) => { console.log((p ? 'ok   ' : 'FAIL ') + m); if (!p) bad++; };
  const xs = [], ys = [];
  d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, a, b) => { xs.push(+a); ys.push(+b); });

  report(!/NaN|undefined/.test(d), 'no NaN in path');
  // The brief is explicit: one continuous line, nothing that can read as a piece.
  report((d.match(/M/g) || []).length === 1, `a single unbroken path (${(d.match(/M/g) || []).length} M commands)`);
  report(!/Z/.test(d), 'open, so it is a line and not a closed shape');

  // Full bleed, both ends on the frame edge.
  report(Math.min(...xs) <= 0.5, `starts at the left edge (min x ${Math.min(...xs)})`);
  report(Math.max(...xs) >= VB_W - 0.5, `ends at the right edge (max x ${Math.max(...xs)})`);

  const top = Math.min(...ys), bot = Math.max(...ys);
  report(top - STROKE / 2 > 0 && bot + STROKE / 2 < VB_H,
    `stroked extent ${(top - STROKE / 2).toFixed(1)}..${(bot + STROKE / 2).toFixed(1)} fits ${VB_H}`);

  // The tallest point belongs near the middle, as it does in the reference.
  let peakX = 0, peakY = 1e9;
  d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, a, b) => { if (+b < peakY) { peakY = +b; peakX = +a; } });
  const share = peakX / VB_W;
  report(share > 0.35 && share < 0.65, `tallest point at ${(share * 100).toFixed(0)}% across`);

  report(/Q/.test(d), 'rounded corners and bowed runs are present');
  report(STROKE >= 2.5 && STROKE <= 3.5, `stroke ${STROKE}`);
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

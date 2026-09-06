// Embeds the brand symbol exported from Illustrator into the three places that
// need it, without redrawing any of it.
//
// Same contract as embed-art.js: the SVG on the desktop is the master. No path
// is rewritten, no coordinate moves, no transform is added. Re-run after a
// re-export and all three copies pick the new file up verbatim.
//
// The one thing that does change is the viewBox. The export is an artboard-sized
// 0 0 1920 1080 with the mark sitting in the middle of it, which is unusable as
// a logo - a header would have to render a 1920-wide box to show a 480-wide mark.
// Retargeting the viewBox to the mark's own bounds moves the window, not the
// artwork: every coordinate in every path stays exactly as exported.
//
// The bounds below came from the browser's getBBox() on the exported <g>, which
// is exact for the curves too (the numbers in a path's d are control points, and
// a cubic's hull is wider than the curve it draws - measuring the d text would
// have given a box that is too big). GEOMETRY_SHA pins the artwork those bounds
// were measured against, so a re-export that actually moves something is caught
// rather than silently rendering off-centre.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// The desktop export is the master while the mark is being worked on, but a
// clone that has never seen that desktop still has to be able to rebuild the
// artwork - so a copy lives beside this script and is used when the export is
// not there. Keep the two identical: --check compares the embed against
// whichever of them was read.
const DESKTOP = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Desktop', '심볼.svg');
const VENDORED = path.join(__dirname, 'symbol-source.svg');
const SRC = process.env.SYMBOL_SVG || (fs.existsSync(DESKTOP) ? DESKTOP : VENDORED);

const VIEWBOX = '764.91 345.85 479.68 389.15';   // getBBox() of the exported <g>
const ASPECT = 479.68 / 389.15;                  // 1.2326
const GEOMETRY_SHA = 'e75a7c798da509ae';         // set on first run, see --check

const ROOT = path.join(__dirname, '..');
const HTML_TARGETS = [path.join(ROOT, 'index.html'), path.join(__dirname, 'og-card.html')];
const FAVICON = path.join(ROOT, 'favicon.svg');

function geometry(raw) {
  // everything between the root <svg ...> and </svg>, i.e. the exported <g>
  const open = raw.match(/<svg\b[^>]*>/);
  if (!open) throw new Error('no <svg> element found');
  const start = raw.indexOf(open[0]) + open[0].length;
  const end = raw.lastIndexOf('</svg>');
  if (end < 0) throw new Error('unterminated <svg>');
  return raw.slice(start, end).trim();
}

function shapes(t) {
  return (t.match(/ d="[^"]*"|points="[^"]*"|<rect[^>]*>/g) || []).join('');
}
const sha = (t) => crypto.createHash('sha256').update(t).digest('hex').slice(0, 16);

const raw = fs.readFileSync(SRC, 'utf8');
const geom = geometry(raw);
const geomSha = sha(shapes(geom));

// The mark inherits its colour so it always matches the wordmark beside it.
//
// The export goes in verbatim, its own indentation included. Re-indenting would
// mean rewriting the whitespace inside the multi-line d="..." attributes, and
// then --check could no longer claim the artwork is byte-identical to the file
// on disk - which is the one guarantee here worth having.
const markup = () =>
  `<svg class="brand-mark" viewBox="${VIEWBOX}" fill="currentColor" aria-hidden="true" focusable="false">\n` +
  geom + '\n</svg>';

function replaceMark(html) {
  const start = html.indexOf('<svg class="brand-mark"');
  if (start < 0) return null;
  const end = html.indexOf('</svg>', start);
  if (end < 0) return null;
  return html.slice(0, start) + markup() + html.slice(end + '</svg>'.length);
}

if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (p, m) => { console.log((p ? 'ok   ' : 'FAIL ') + m); if (!p) bad++; };
  const src = shapes(geom);
  report(geomSha === GEOMETRY_SHA,
    `geometry matches the bounds on file (sha ${geomSha}${geomSha === GEOMETRY_SHA ? '' : ` != ${GEOMETRY_SHA} - re-measure getBBox and update VIEWBOX`})`);
  for (const f of [...HTML_TARGETS, FAVICON]) {
    const html = fs.readFileSync(f, 'utf8');
    const name = path.basename(f);
    const at = html.indexOf('<svg class="brand-mark"');
    report(at >= 0, `${name}: carries the symbol`);
    if (at < 0) continue;
    const block = html.slice(at, html.indexOf('</svg>', at));
    report(shapes(block) === src, `${name}: every path, polygon and rect is byte-identical to the export`);
    report(block.includes(`viewBox="${VIEWBOX}"`), `${name}: viewBox is the mark's own bounds`);
    report(!/transform=/.test(block), `${name}: no transform added`);
    report(html.indexOf('<svg class="brand-mark"', at + 1) < 0, `${name}: exactly one copy`);
  }
  const n = (src.match(/-?\d+\.?\d*/g) || []).length;
  report(true, `${n} coordinates carried through, aspect ${ASPECT.toFixed(4)}`);
  process.exit(bad ? 1 : 0);
}

for (const f of HTML_TARGETS) {
  const html = fs.readFileSync(f, 'utf8');
  const next = replaceMark(html);
  if (!next) { console.error(`no brand-mark slot in ${path.basename(f)}`); process.exit(1); }
  fs.writeFileSync(f, next);
  console.log(`embedded into ${path.basename(f)}`);
}
const fav = fs.readFileSync(FAVICON, 'utf8');
const nextFav = replaceMark(fav);
if (!nextFav) { console.error('no brand-mark slot in favicon.svg'); process.exit(1); }
fs.writeFileSync(FAVICON, nextFav);
console.log('embedded into favicon.svg');

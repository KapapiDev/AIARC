// Embeds the hero artwork exported from Illustrator, without redrawing any of it.
//
// The SVG on the desktop is the master. Nothing here touches geometry: no path or
// polyline is rewritten, no coordinate moves, the viewBox is kept, and no
// transform is added. Re-run this after any re-export and the page picks the new
// file up verbatim.
//
// What it does change, and why each is unavoidable rather than a design decision:
//
//   * The <style> block Illustrator writes uses bare class names (.st0 ... .st3).
//     Inlined into the page those become global rules that would style anything
//     else called .st1. Every selector is prefixed with the svg's own id so the
//     rules reach exactly the elements they came with, and nothing else.
//   * The root <svg> gains an id, preserveAspectRatio and the aria attributes an
//     inline decorative graphic needs. No width/height is added, so the box
//     scales with its container and the artwork's own proportions are kept.
//   * The XML prolog and the Illustrator generator comment are dropped; they are
//     not valid inside an HTML body.
//
// CLEAN is one continuous polyline, which is what makes the draw animation
// possible at all - its length is read at runtime with getTotalLength(), so the
// dash figures are never hard-coded against geometry that might be re-exported.

const fs = require('fs');
const path = require('path');

const SRC = process.env.ART_SVG ||
  path.join(process.env.USERPROFILE || process.env.HOME || '', 'Desktop', 'AIARC 라인그래픽-두께수정.svg');
const DEST = path.join(__dirname, '..', 'index.html');

function prepare(raw) {
  let s = raw;

  // --- strip the envelope -----------------------------------------------------
  // None of this is artwork. An export saved with "Preserve Illustrator Editing
  // Capabilities" wraps the drawing in a lot of Adobe scaffolding, and most of it
  // is either invalid inside an HTML body or dead weight:
  //
  //   * a DOCTYPE whose internal subset declares the &ns_*; entities. HTML has no
  //     internal subset, so leaving the entity references behind would be a parse
  //     error - the DOCTYPE and every attribute that uses one have to go together.
  //   * <switch> + <foreignObject requiredExtensions="&ns_ai;">, which points at
  //     the editing blob. Browsers already fall through it; unwrapping removes a
  //     branch that only Illustrator takes.
  //   * <i:aipgf>, the editing blob itself - zstd/base64, and in this export 935KB
  //     of a 1.04MB file. Inlined it would have put ~900KB of dead base64 into
  //     every page load.
  s = s.replace(/<\?xml[^>]*\?>\s*/g, '');
  s = s.replace(/<!--[\s\S]*?-->\s*/g, '');
  s = s.replace(/<!DOCTYPE[^[>]*(\[[\s\S]*?\])?\s*>\s*/gi, '');
  s = s.replace(/<i:aipgf\b[\s\S]*?<\/i:aipgf>\s*/gi, '');
  s = s.replace(/<foreignObject\b[\s\S]*?<\/foreignObject>\s*/gi, '');
  s = s.replace(/<\/?switch>\s*/gi, '');
  // the namespace declarations and attributes that referenced those entities
  s = s.replace(/\s+xmlns:(?:x|i|graph)="[^"]*"/g, '');
  s = s.replace(/\s+(?:i|x|graph):[\w-]+="[^"]*"/g, '');
  s = s.trim();

  if (/&ns_\w+;/.test(s)) throw new Error('an undefined entity reference survived the strip');

  const open = s.match(/<svg\b[^>]*>/);
  if (!open) throw new Error('no <svg> element found');

  // keep version/xmlns/viewBox exactly as exported; drop only the Illustrator
  // canvas hints, which do nothing in a browser and set a background colour
  let tag = open[0]
    .replace(/\s+x="0px"/, '')
    .replace(/\s+y="0px"/, '')
    .replace(/\s+style="enable-background:[^"]*"/, '')
    .replace(/\s+xml:space="preserve"/, '')
    // Illustrator writes the layer name as the root id (id="레이어_1"). Leaving it
    // means the tag carries two ids, the browser keeps the first, ours is ignored,
    // and every scoped .st rule silently stops matching - the artwork renders
    // unstyled. Drop whatever is there and set our own.
    .replace(/\s+id="[^"]*"/, '');

  if (!/preserveAspectRatio=/.test(tag)) {
    // meet, not slice: the brief is explicit that the artwork's own internal
    // margins are part of the design, and slice scales the drawing up as the
    // window narrows, which eats them. Anchored to the bottom so the drawing
    // keeps sitting on the floor of the hero when a short window letterboxes it.
    tag = tag.replace(/>$/, ' preserveAspectRatio="xMidYMax meet">');
  }
  tag = tag.replace(/>$/, ' id="hero-art-svg" aria-hidden="true" focusable="false">');
  s = s.replace(open[0], tag);

  // scope the exported class rules to this svg so they cannot leak into the page
  s = s.replace(/<style[^>]*>([\s\S]*?)<\/style>/, (m, css) => {
    const scoped = css.replace(/(^|[}\s])(\.[A-Za-z_][\w-]*)/g, (mm, pre, sel) => `${pre}#hero-art-svg ${sel}`);
    return `<style>${scoped}</style>`;
  });

  // CLEAN is a guide, not a line anyone should see. Moving the group bodily into a
  // <mask> is what makes that true by construction rather than by a colour or an
  // opacity that could be got wrong: mask content is never painted. Its white
  // stroke becomes the reveal, and animating the dash offset on it wipes TEXTURE
  // in along the drawn path instead of fading the whole layer up.
  //
  // The group is moved, never edited - the polyline's points are untouched, which
  // --check proves byte-for-byte against the file on disk.
  //
  // MASK_W is the brush's own spread: measured against this artwork the texture
  // sits a median of 10 and 95% within 40 units of the guide, so 110 (55 either
  // side) covers it with room while keeping the leading edge tight.
  const MASK_W = 110;
  const clean = s.match(/<g id="CLEAN">[\s\S]*?<\/g>/);
  if (!clean) throw new Error('CLEAN group not found');
  s = s.replace(clean[0], '');
  s = s.replace(/(<g id="TEXTURE")/,
    `<defs>\n<mask id="art-reveal" maskUnits="userSpaceOnUse" x="-160" y="-160" ` +
    `width="2240" height="1400" stroke-width="${MASK_W}">\n${clean[0]}\n</mask>\n</defs>\n$1 mask="url(#art-reveal)"`);

  const verify = {
    viewBox: (tag.match(/viewBox="([^"]+)"/) || [])[1],
    polylines: (s.match(/<polyline/g) || []).length,
    paths: (s.match(/<path/g) || []).length,
    polygons: (s.match(/<polygon/g) || []).length,
    hasClean: /id="CLEAN"/.test(s),
    hasTexture: /id="TEXTURE"/.test(s),
    transformsAdded: (s.match(/transform=/g) || []).length,
    rootIds: (open[0].match(/\sid="/g) || []).length,
    // TEXTURE shapes with no class are the knockouts: the artist fills them with
    // the page colour so they hide the lines behind them. SVG's default fill is
    // black, so index.html paints them the background token instead - see the
    // rule next to #hero-art-svg. Counted here so a re-export that changes them
    // shows up rather than silently turning into dark patches.
    knockouts: (() => {
      const tex = s.slice(s.indexOf('<g id="TEXTURE"'));
      return (tex.match(/<(?:path|polygon)(?![^>]*\sclass=)/g) || []).length;
    })(),
    ourRootId: (tag.match(/\sid="[^"]*"/g) || []).length === 1 && /id="hero-art-svg"/.test(tag),
    cleanInMask: /<mask id="art-reveal"[\s\S]*?<g id="CLEAN">/.test(s),
    textureMasked: /<g id="TEXTURE" mask="url\(#art-reveal\)"/.test(s),
    cleanOutsideMask: /<\/mask>[\s\S]*<g id="CLEAN">/.test(s),
  };
  return { svg: s, verify };
}

const raw = fs.readFileSync(SRC, 'utf8');
const { svg, verify } = prepare(raw);

// the geometry that must survive untouched
const coords = (t) => (t.match(/-?\d+\.?\d*/g) || []).length;
const before = { d: (raw.match(/ d="[^"]*"/g) || []).join(''), pts: (raw.match(/points="[^"]*"/g) || []).join('') };
const after = { d: (svg.match(/ d="[^"]*"/g) || []).join(''), pts: (svg.match(/points="[^"]*"/g) || []).join('') };

if (process.argv[2] === '--check') {
  let bad = 0;
  const report = (p, m) => { console.log((p ? 'ok   ' : 'FAIL ') + m); if (!p) bad++; };
  report(before.d === after.d, `every path d is byte-identical (${coords(after.d)} numbers)`);
  report(before.pts === after.pts, `every polyline points is byte-identical (${coords(after.pts)} numbers)`);
  report(verify.viewBox === '0 0 1920 1080', `viewBox unchanged: ${verify.viewBox}`);
  report(verify.hasClean && verify.hasTexture, 'CLEAN and TEXTURE groups both present');
  report(verify.polylines === 1, `CLEAN is one continuous polyline (${verify.polylines})`);
  const src = { paths: (raw.match(/<path/g) || []).length,
                polygons: (raw.match(/<polygon/g) || []).length,
                polylines: (raw.match(/<polyline/g) || []).length };
  report(verify.paths === src.paths && verify.polygons === src.polygons && verify.polylines === src.polylines,
    `every shape survived: ${verify.paths} paths, ${verify.polygons} polygons, ${verify.polylines} polyline`);
  report(verify.transformsAdded === 0, 'no transform added anywhere');
  report(verify.ourRootId, 'the root svg carries exactly one id, ours' +
    (verify.rootIds ? ' (the export had its own, dropped)' : ''));
  report(verify.cleanInMask, 'CLEAN lives inside the mask, so it is never painted');
  report(!verify.cleanOutsideMask, 'no second copy of CLEAN outside the mask');
  report(verify.textureMasked, 'TEXTURE is masked by the CLEAN reveal');
  report(verify.knockouts > 0,
    `${verify.knockouts} unclassed shapes, painted the page colour as knockouts`);
  report(!/<style>[^<]*[^ ]\.st/.test(svg.replace(/#hero-art-svg \.st/g, '')), 'exported class rules are scoped to the svg');
  report(!/&ns_|<i:aipgf|<switch|<!DOCTYPE/i.test(svg), 'no Illustrator envelope left in the embed');
  const shed = raw.length - svg.length;
  report(shed >= 0, `${(svg.length / 1024).toFixed(0)}KB embedded, ${(shed / 1024).toFixed(0)}KB of envelope dropped`);
  process.exit(bad ? 1 : 0);
}

if (process.argv[2] === '--sync') {
  // The page and the social card carry the same artwork from the same master, so
  // they cannot drift. Both mark the spot with the same container class; the card
  // then leaves the reveal mask open in its own CSS, since a still has nothing to
  // animate.
  for (const file of [DEST, path.join(__dirname, 'og-card.html')]) {
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');

    // Anchor on the slot, not on "the first <svg> in the file". A lazy
    // <svg>...</svg> match starts at the hamburger icon near the top of the body
    // and swallows everything down to the hero's closing tag - it ate the whole
    // hero the first time this ran. Find the container, then the svg inside it.
    const slot = html.indexOf('<div class="hero-art-clip">');
    if (slot < 0) { console.error(`hero-art-clip not found in ${path.basename(file)}`); process.exit(1); }
    const start = html.indexOf('<svg', slot);
    const end = html.indexOf('</svg>', start);
    if (start < 0 || end < 0 || start > slot + 400) { console.error(`no svg inside hero-art-clip in ${path.basename(file)}`); process.exit(1); }
    const indented = svg.split('\n').join('\n        ');
    html = html.slice(0, start) + indented + html.slice(end + '</svg>'.length);
    fs.writeFileSync(file, html);
    console.log(`embedded into ${path.basename(file)}: viewBox ${verify.viewBox}, ` +
      `${verify.polylines} polyline, ${verify.paths} paths, ${verify.polygons} polygons, ${svg.length} chars`);
  }
  process.exit(0);
}

process.stdout.write(svg);

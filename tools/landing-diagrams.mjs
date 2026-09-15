// Draws the landing's isometric line diagrams and writes them inline into index.html,
// after each <!-- diagram:name --> marker. Run: node tools/landing-diagrams.mjs
import { readFileSync, writeFileSync } from "node:fs";
const C = Math.cos(Math.PI / 6);
const r = (n) => Math.round(n * 10) / 10;
let seen = [];
const P = (x, y, z = 0) => { const p = [r((x - y) * C), r((x + y) * 0.5 - z)]; seen.push(p); return p; };
const bounds = () => { const xs = seen.map((p) => p[0]), ys = seen.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
const poly = (pts, cls) => `<path class="${cls}" d="M${pts.map((p) => p.join(" ")).join("L")}Z"/>`;
const line = (a, b, cls) => `<path class="${cls}" d="M${a.join(" ")}L${b.join(" ")}"/>`;
function box(x0, y0, z0, w, d, h, cls = "") {
  const [x1, y1, z1] = [x0 + w, y0 + d, z0 + h];
  return `<g class="box ${cls}">` +
    poly([P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)], "face side") +
    poly([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], "face front") +
    poly([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], "face top") + "</g>";
}
const tile = (x0, y0, w, d, cls = "ground") => poly([P(x0, y0), P(x0 + w, y0), P(x0 + w, y0 + d), P(x0, y0 + d)], cls);

// A. Versions and evidence stack up; the top plate is the current valid state.
function stateDiagram() {
  const S = 220, levels = [0, 52, 104, 156, 208], top = 292, T = 12;
  const labels = [["07.03", "원도면 A"], ["07.12", "현장 변경지시"], ["07.13", "수정도면 B"], ["07.14", "회의록 · 메일"], ["07.15", "현장사진"]];
  let g = "";
  levels.forEach((z) => (g += box(0, 0, z, S, S, 3, "sheet")));
  // connectors between layers at the front corner
  for (let i = 0; i < levels.length; i++) {
    const from = P(S, S, levels[i] + 3), to = P(S, S, i + 1 < levels.length ? levels[i + 1] : top);
    g += line(from, to, "thread");
  }
  g += box(0, 0, top, S, S, T, "current");
  const z = top + T;
  g += poly([P(40, 40, z), P(180, 40, z), P(180, 180, z), P(40, 180, z)], "plan");
  g += line(P(92, 40, z), P(92, 180, z), "plan-old");
  g += line(P(132, 40, z), P(132, 180, z), "plan-new");
  const [ax, ay] = P(92, 40, z), [bx, by] = P(132, 40, z);
  g += `<text class="mark dim" x="${ax - 2}" y="${ay - 10}">A</text><text class="mark" x="${bx - 2}" y="${by - 10}">B</text>`;
  // labels to the right of each plate's right corner
  const lx = 236, tx = 250;
  levels.forEach((lv, i) => {
    const [cx, cy] = P(S, 0, lv + 1.5);
    g += `<path class="leader" d="M${cx + 6} ${cy}H${lx}"/>` +
      `<text class="label" x="${tx}" y="${r(cy + 5)}"><tspan class="date">${labels[i][0]}</tspan><tspan dx="12">${labels[i][1]}</tspan></text>`;
  });
  const [sx, sy] = P(S, 0, top + T / 2);
  g += `<path class="leader strong" d="M${sx + 6} ${sy}H${lx}"/><text class="label strong" x="${tx}" y="${r(sy + 5)}">현재 상태 · B</text>`;
  return `<svg class="diagram diagram-state" viewBox="-204 -330 700 566" aria-hidden="true" focusable="false">${g}</svg>`;
}

// B. Expansion from one person to a construction work network, one vignette each.
const person = () => tile(-50, -50, 100, 100, "ground dashed") + box(-20, -20, 0, 40, 40, 40);
const project = (x = 0, y = 0, size = 150, h = 70) => tile(x - size / 2, y - size / 2, size, size) + box(x - size / 5, y - size / 5, 0, size * 0.4, size * 0.4, h, "building");
const company = (x, y, size, heights) => tile(x - size / 2, y - size / 2, size, size, "ground dashed") +
  heights.map((h, i) => box(x - size * 0.34 + i * size * 0.4, y - size * 0.1 - i * size * 0.24, 0, size * 0.24, size * 0.24, h, "building")).join("");
const vignettes = [
  person,
  () => project(),
  () => {
    const around = [[-70, 20], [20, -70], [58, 12], [12, 58]];
    return tile(-75, -75, 150, 150) + around.map(([x, y]) => line(P(x + 8, y + 8, 8), P(0, 0, 40), "link")).join("") +
      box(-30, -30, 0, 60, 60, 70, "building") + around.map(([x, y]) => box(x, y, 0, 16, 16, 16)).join("");
  },
  () => tile(-95, -95, 190, 190, "ground dashed") + project(-46, 46, 76, 42) + project(46, -46, 76, 56),
  () => company(-50, 50, 92, [36, 50]) + company(50, -50, 92, [44, 32]) + line(P(-30, 30, 28), P(30, -30, 28), "link strong"),
  () => {
    const nodes = [[-80, 80], [80, -80], [-66, -66], [66, 66], [-8, -96], [-96, -8]];
    const edges = [[0, 3], [3, 1], [1, 4], [4, 2], [2, 5], [5, 0], [2, 3], [0, 4]];
    return nodes.map(([x, y]) => tile(x - 24, y - 24, 48, 48, "ground dashed")).join("") +
      edges.map(([a, b]) => line(P(nodes[a][0], nodes[a][1], 18), P(nodes[b][0], nodes[b][1], 18), "link")).join("") +
      nodes.map(([x, y], i) => box(x - 11, y - 11, 0, 22, 22, [30, 24, 20, 36, 22, 26][i], "building")).join("");
  },
];
const drawn = vignettes.map((draw) => { seen = []; const body = draw(); return { body, b: bounds() }; });
// One shared scale: the vignettes grow on the page as the scope grows.
const pad = 8, bx0 = Math.min(...drawn.map((d) => d.b[0])), bx1 = Math.max(...drawn.map((d) => d.b[2]));
const by0 = Math.min(...drawn.map((d) => d.b[1])), by1 = Math.max(...drawn.map((d) => d.b[3]));
const half = Math.max(-bx0, bx1) + pad;
const expansion = drawn.map(({ body }) => `<svg class="diagram" viewBox="${r(-half)} ${r(by0 - pad)} ${r(half * 2)} ${r(by1 - by0 + pad * 2)}" aria-hidden="true" focusable="false">${body}</svg>`);
const svgs = { state: stateDiagram(), ...Object.fromEntries(expansion.map((svg, i) => [`expansion-${i}`, svg])) };
const page = new URL("../index.html", import.meta.url);
const html = readFileSync(page, "utf8").replace(/<!-- diagram:([\w-]+) -->(?:<svg[\s\S]*?<\/svg>)?/g, (_, name) => `<!-- diagram:${name} -->${svgs[name]}`);
writeFileSync(page, html);
console.log(Object.fromEntries(Object.entries(svgs).map(([k, v]) => [k, v.length])));

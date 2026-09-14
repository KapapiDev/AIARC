const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 939px)');

// Try AIARC. The window hosts the exported browser demo itself; the script below only
// moves a drawn cursor and presses the app's own buttons, so no product logic lives here.
const stage = $('#try');
const view = $('.window-view', stage);
const frame = $('iframe', stage);
const cursor = $('.cursor', stage);
const folder = $('[data-folder]', stage);
const replay = $('[data-replay]');
const status = $('#stage-status');
const DEMO = './demo/index.html';

function fit() {
  const [width, height] = narrow.matches ? [390, 720] : [1280, 800];
  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
  view.style.setProperty('--s', view.clientWidth / width);
}
new ResizeObserver(fit).observe(view);

const sleep = (ms, signal) => new Promise((resolve, reject) => {
  const timer = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
});
const say = (text) => { status.textContent = text; };

let loading;
function load(fresh = false) {
  if (loading && !fresh) return loading;
  delete stage.dataset.live;
  frame.tabIndex = -1;
  loading = new Promise((resolve) => {
    frame.addEventListener('load', async () => {
      const doc = frame.contentDocument;
      for (let i = 0; i < 200 && !$('#unified-canvas', doc); i++) await sleep(50);
      await doc.fonts?.ready;
      for (const type of ['pointerdown', 'click', 'keydown', 'dragenter']) doc.addEventListener(type, (event) => { if (intent(event)) takeOver(); }, true);
      stage.dataset.live = 'ready';
      frame.tabIndex = 0;
      resolve(doc);
    }, { once: true });
    fit();
    if (fresh) frame.contentWindow.location.replace(DEMO); else frame.src = DEMO;
  });
  return loading;
}
const canvasOf = (doc) => $('#unified-canvas', doc);
const isFresh = (doc) => canvasOf(doc)?.dataset.state === 'empty' && !$('.conversation-message', doc);
const appButton = (doc, label, selector = 'button') => $$(selector, doc).find((button) => button.offsetParent && button.textContent.trim() === label);
async function until(find, signal, timeout = 10000) {
  for (const end = Date.now() + timeout; Date.now() < end; await sleep(80, signal)) { const found = find(); if (found) return found; }
  throw new Error('The demo did not reach the expected state.');
}
async function freshApp() {
  const doc = await load();
  return isFresh(doc) ? doc : load(true);
}

// Stage coordinates of an element on the page or inside the scaled app.
function point(element, fx = 0.5, fy = 0.5) {
  const box = stage.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  let left = 0, top = 0, scale = 1;
  if (element.ownerDocument !== document) {
    const outer = frame.getBoundingClientRect();
    [left, top, scale] = [outer.left, outer.top, outer.width / frame.offsetWidth];
  }
  return [left + (rect.left + rect.width * fx) * scale - box.left, top + (rect.top + rect.height * fy) * scale - box.top];
}

let run, ghost, dragTransfer, running = [];
let at = [0, 0];
const translate = ([x, y]) => ({ transform: `translate(${x}px, ${y}px)` });
function animate(element, keyframes, options, signal) {
  const animation = element.animate(keyframes, { fill: 'forwards', ...options });
  running.push(animation);
  return new Promise((resolve, reject) => {
    animation.finished.then(resolve, () => reject(signal?.reason));
    signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
}
function move(to, duration, signal) {
  const options = { duration, easing: 'cubic-bezier(.45, .05, .2, 1)' };
  const moves = [animate(cursor, [translate(at), translate(to)], options, signal)];
  if (ghost) moves.push(animate(ghost, [translate([at[0] - 52, at[1] - 26]), translate([to[0] - 52, to[1] - 26])], options, signal));
  at = to;
  return Promise.all(moves);
}
async function press(signal) {
  $('i', cursor).animate([{ opacity: 0.9, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1.3)' }], { duration: 420, easing: 'ease-out' });
  await animate($('svg', cursor), [{ transform: 'scale(1)' }, { transform: 'scale(.86)' }, { transform: 'scale(1)' }], { duration: 200, fill: 'none' }, signal);
}
function lift(from) {
  ghost = folder.cloneNode(true);
  ghost.removeAttribute('data-folder');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.tabIndex = -1;
  ghost.className = 'desk-item drag-ghost';
  Object.assign(ghost.style, translate([from[0] - 52, from[1] - 26]));
  stage.append(ghost);
  folder.classList.add('is-lifted');
}
function settle(dropped) {
  folder.classList.remove('is-lifted');
  if (!ghost) return;
  const done = ghost;
  ghost = null;
  if (!dropped) return done.remove();
  done.animate([{ opacity: 0.92, scale: 1 }, { opacity: 0, scale: 0.6 }], { duration: 240, easing: 'ease-in' }).finished.then(() => done.remove(), () => done.remove());
}
function dragSignal(doc, type) {
  const win = frame.contentWindow;
  if (type === 'dragenter') {
    dragTransfer = new win.DataTransfer();
    dragTransfer.items.add(new win.File([''], 'OOO근린생활시설_준공서류'));
  }
  if (!dragTransfer) return;
  canvasOf(doc).dispatchEvent(new win.DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dragTransfer }));
  if (type === 'dragleave') dragTransfer = null;
}

async function choreography(doc, signal) {
  const box = stage.getBoundingClientRect();
  at = [box.width * 0.58, box.height * 0.9];
  Object.assign(cursor.style, translate(at));
  await animate(cursor, [{ opacity: 0 }, { opacity: 1 }], { duration: 240 }, signal);
  await move(point(folder, 0.5, 0.3), 780, signal);
  await press(signal);
  lift(at);
  const dropAt = point(canvasOf(doc), 0.5, 0.3);
  const carrying = move(dropAt, 1200, signal);
  carrying.catch(() => {});
  await sleep(700, signal);
  dragSignal(doc, 'dragenter');
  await carrying;
  await sleep(380, signal);
  dragSignal(doc, 'dragleave');
  settle(true);
  appButton(doc, '샘플로 시작').click();
  await move(point(canvasOf(doc), 0.56, 0.6), 900, signal);
  const organize = await until(() => appButton(doc, '정리안 반영', 'button.primary-action'), signal);
  await sleep(700, signal);
  await move(point(organize), 760, signal);
  await press(signal);
  organize.click();
  const review = await until(() => appButton(doc, '확인하기', 'button.primary-action'), signal);
  await sleep(1100, signal);
  await move(point(review), 700, signal);
  await press(signal);
  review.click();
  const request = await until(() => $('.document-field[data-highlight=true]', doc) && appButton(doc, '보완 요청', 'button.primary-action'), signal);
  await sleep(1200, signal);
  await move(point(request, 0.55, 0.85), 820, signal);
}
async function instant(doc, signal) {
  appButton(doc, '샘플로 시작').click();
  for (const label of ['정리안 반영', '확인하기']) (await until(() => appButton(doc, label, 'button.primary-action'), signal)).click();
  await until(() => appButton(doc, '보완 요청', 'button.primary-action'), signal);
}
function hideCursor(delay = 0) {
  const fade = cursor.animate([{ opacity: getComputedStyle(cursor).opacity }, { opacity: 0 }], { duration: 260, delay, fill: 'forwards' });
  fade.finished.then(() => {
    if (!run) { running.forEach((animation) => animation.cancel()); running = []; }
    fade.cancel();
  }, () => {});
}
async function play(before) {
  run?.abort();
  const controller = run = new AbortController();
  const { signal } = controller;
  running.forEach((animation) => animation.cancel());
  running = [];
  stage.dataset.state = 'playing';
  replay.hidden = true;
  try {
    const [doc] = await Promise.all([freshApp(), before]);
    signal.throwIfAborted();
    say('AIARC 시연을 시작합니다.');
    await (reducedMotion.matches ? instant(doc, signal) : choreography(doc, signal));
    stage.dataset.state = 'done';
    say('시연이 끝났습니다. 화면을 직접 조작하거나 다시 볼 수 있습니다.');
    hideCursor(1800);
  } catch {
    if (!signal.aborted) { stage.dataset.state = 'done'; hideCursor(); }
  } finally {
    if (run === controller) run = null;
    replay.hidden = false;
  }
}
// The visitor's own input always wins: the script stops and the app stays as it is.
function takeOver() {
  if (!run) return;
  run.abort();
  run = null;
  if (dragTransfer && frame.contentDocument) dragSignal(frame.contentDocument, 'dragleave');
  settle(false);
  hideCursor();
  stage.dataset.state = 'taken';
  replay.hidden = false;
}

function reveal() {
  const rect = stage.getBoundingClientRect();
  if (rect.top >= 60 && rect.bottom <= innerHeight) return Promise.resolve();
  const smooth = !reducedMotion.matches;
  stage.scrollIntoView({ block: rect.height > innerHeight - 64 ? 'start' : 'center', behavior: smooth ? 'smooth' : 'auto' });
  return smooth ? sleep(520) : Promise.resolve();
}
$$('[data-try]').forEach((button) => {
  button.addEventListener('click', () => play(reveal()));
  for (const type of ['pointerenter', 'focus']) button.addEventListener(type, () => load(), { once: true });
});
replay.addEventListener('click', () => play(reveal()));
// A touch that scrolls the page is not a takeover; a tap is.
const intent = (event) => event.isTrusted && !(event.type === 'pointerdown' && event.pointerType === 'touch');
for (const type of ['pointerdown', 'click']) stage.addEventListener(type, (event) => { if (intent(event)) { takeOver(); load(); } }, true);
narrow.addEventListener('change', () => { takeOver(); fit(); });

// Visitors can move the sample folder themselves, by dragging or by pressing it.
let drag;
async function openSampleFolder() {
  const doc = await freshApp();
  appButton(doc, '샘플로 시작')?.click();
  stage.dataset.state = 'taken';
  replay.hidden = false;
}
folder.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  drag = { x: event.clientX, y: event.clientY, moved: false };
  folder.setPointerCapture(event.pointerId);
});
folder.addEventListener('pointermove', (event) => {
  if (!drag) return;
  if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
  const box = stage.getBoundingClientRect();
  const here = [event.clientX - box.left, event.clientY - box.top];
  if (!drag.moved) { drag.moved = true; lift(here); }
  Object.assign(ghost.style, translate([here[0] - 52, here[1] - 26]));
});
folder.addEventListener('pointerup', (event) => {
  if (!drag) return;
  const { moved } = drag;
  drag = null;
  const win = $('.window', stage).getBoundingClientRect();
  const inside = event.clientX >= win.left && event.clientX <= win.right && event.clientY >= win.top && event.clientY <= win.bottom;
  settle(moved && inside);
  if (!moved || inside) openSampleFolder();
});
folder.addEventListener('pointercancel', () => { drag = null; settle(false); });
folder.addEventListener('click', (event) => { if (event.detail === 0) openSampleFolder(); });

// Real files dropped anywhere on the stage go to the app, which reads only names, types and sizes locally.
stage.addEventListener('dragover', (event) => {
  if (!event.dataTransfer?.types.includes('Files')) return;
  event.preventDefault();
  load();
});
stage.addEventListener('drop', async (event) => {
  const files = [...(event.dataTransfer?.files || [])];
  if (!files.length) return;
  event.preventDefault();
  takeOver();
  await load();
  const doc = frame.contentDocument, win = frame.contentWindow;
  const transfer = new win.DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  canvasOf(doc).dispatchEvent(new win.DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  stage.dataset.state = 'taken';
  replay.hidden = false;
});

// Theme, unchanged from the previous landing: dark by default, remembered when chosen.
const themeToggle = $('.theme-toggle');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.innerHTML = `화면: ${theme === 'dark' ? '다크' : '라이트'} <span aria-hidden="true">◐</span>`;
  themeToggle.setAttribute('aria-label', `${theme === 'dark' ? '밝은' : '어두운'} 테마로 전환`);
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#08090a' : '#f8f8f7';
}
try { const saved = localStorage.getItem('aiarc-landing-theme'); if (saved === 'light' || saved === 'dark') setTheme(saved); } catch { /* Storage may be disabled; the page remains usable. */ }
themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem('aiarc-landing-theme', theme); } catch {}
});
$$('.brand[href="#"]').forEach((brand) => brand.addEventListener('click', (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}));

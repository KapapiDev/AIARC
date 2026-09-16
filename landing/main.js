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
// The demo marks its actions with stable, non-visual hooks, so the script never depends on visible labels.
const appAction = (doc, id) => $$(`[data-demo-action="${id}"]`, doc).find((button) => button.offsetParent);
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
  const outerScale = stage.getBoundingClientRect().width / stage.offsetWidth;
  return [(left + (rect.left + rect.width * fx) * scale - box.left) / outerScale, (top + (rect.top + rect.height * fy) * scale - box.top) / outerScale];
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
  at = [stage.offsetWidth * 0.58, stage.offsetHeight * 0.9];
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
  appAction(doc, 'start-sample').click();
  await move(point(canvasOf(doc), 0.56, 0.6), 900, signal);
  const organize = await until(() => appAction(doc, 'apply-plan'), signal);
  await sleep(700, signal);
  await move(point(organize), 760, signal);
  await press(signal);
  organize.click();
  const review = await until(() => appAction(doc, 'inspect'), signal);
  await sleep(1100, signal);
  await move(point(review), 700, signal);
  await press(signal);
  review.click();
  const request = await until(() => $('.document-field[data-highlight=true]', doc) && appAction(doc, 'request-fix'), signal);
  await sleep(1200, signal);
  await move(point(request, 0.55, 0.85), 820, signal);
}
async function instant(doc, signal) {
  appAction(doc, 'start-sample').click();
  for (const id of ['apply-plan', 'inspect']) (await until(() => appAction(doc, id), signal)).click();
  await until(() => appAction(doc, 'request-fix'), signal);
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
  appAction(doc, 'start-sample')?.click();
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
  const outerScale = box.width / stage.offsetWidth;
  const here = [(event.clientX - box.left) / outerScale, (event.clientY - box.top) / outerScale];
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

$$('.brand[href="#"]').forEach((brand) => brand.addEventListener('click', (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}));

// Keep the scroll utility out of the way of product imagery, copy and actions.
const backToTop = $('.back-to-top');
const backToTopObstacles = $$('main h1, main h2, main p, main picture, main ol, main .diagram, main button, main a, main summary, footer a, footer .footer-bottom');
function updateBackToTop() {
  const right = Math.max(16, parseFloat(getComputedStyle(backToTop).right) || 16);
  const bottom = Math.max(16, parseFloat(getComputedStyle(backToTop).bottom) || 16);
  const x = document.documentElement.clientWidth - right - 44, y = innerHeight - bottom - 44;
  const blocked = backToTopObstacles.some(element => {
    const r = element.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.left < x + 48 && r.right > x - 4 && r.top < y + 48 && r.bottom > y - 4;
  });
  backToTop.hidden = scrollY < 600 || blocked;
}
let backToTopPending = false;
function scheduleBackToTop() {
  if (backToTopPending) return;
  backToTopPending = true;
  requestAnimationFrame(() => { backToTopPending = false; updateBackToTop(); });
}
addEventListener('scroll', scheduleBackToTop, { passive: true });
addEventListener('resize', scheduleBackToTop);
addEventListener('load', scheduleBackToTop);
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});
updateBackToTop();

// Still-image inspection is separate from the interactive product demo.
const imageViewer = $('.image-viewer');
const viewerImage = $('img', imageViewer);
const viewerScroll = $('.image-viewer-scroll', imageViewer);
const zoomImage = $('[data-image-zoom]', imageViewer);
let imageOpener;
function resetImageZoom() {
  delete imageViewer.dataset.zoomed;
  zoomImage.setAttribute('aria-pressed', 'false');
  zoomImage.textContent = '확대';
  viewerScroll.scrollTo(0, 0);
}
$$('[data-image-viewer]').forEach(link => link.addEventListener('click', event => {
  if (!matchMedia('(max-width: 760px)').matches) { event.preventDefault(); return; }
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  imageOpener = link;
  viewerImage.src = link.href;
  viewerImage.alt = $('img', link).alt;
  $('#image-viewer-title').textContent = link.getAttribute('aria-label').replace(' 확대', '');
  resetImageZoom();
  imageViewer.showModal();
  $('[data-image-close]', imageViewer).focus();
}));
zoomImage.addEventListener('click', () => {
  if (imageViewer.hasAttribute('data-zoomed')) return resetImageZoom();
  imageViewer.dataset.zoomed = '';
  zoomImage.setAttribute('aria-pressed', 'true');
  zoomImage.textContent = '전체 보기';
  viewerScroll.scrollLeft = Math.max(0, (viewerScroll.scrollWidth - viewerScroll.clientWidth) / 2);
});
$('[data-image-close]', imageViewer).addEventListener('click', () => imageViewer.close());
imageViewer.addEventListener('close', () => { resetImageZoom(); imageOpener?.focus({ preventScroll: true }); });

// Switch only between unmodified captures reached through the demo's own controls.
const emailChapter = $('#email-workflow');
const mailViews = {
  request: { label: '보완 요청', alt: '전체 AIARC 앱 프레임에서 제품명 불일치에 대한 요청 대상, 제목과 내용을 확인하는 가상 보완 요청 초안입니다.' },
  email: { label: '수정본 회신', alt: $('.product-shot img', emailChapter).alt }
};
$$('[data-mail-view]').forEach(button => button.addEventListener('click', () => {
  const name = button.dataset.mailView;
  const link = $('.shot-link', emailChapter);
  const picture = $('picture', link);
  $$('source', picture).forEach((source, i) => { source.srcset = `./landing/assets/chapter-${name}-${i === 0 ? 'mobile' : 'tablet'}.webp`; });
  $('img', picture).src = `./landing/assets/chapter-${name}-desktop.webp`;
  $('img', picture).alt = mailViews[name].alt;
  link.href = $('img', picture).src;
  link.setAttribute('aria-label', `${mailViews[name].label} 전체 앱 화면 확대`);
  $$('[data-mail-view]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  $('.mail-state', emailChapter).textContent = `${mailViews[name].label} 화면`;
}));

// Scale the complete desktop stage together, preserving the approved wallpaper exposure.
const stageHost = $('.stage-host');
function sizeStageHost() {
  if (matchMedia('(min-width: 1280px)').matches) {
    const scale = stageHost.clientWidth / 1296;
    stageHost.style.setProperty('--stage-scale', scale);
    stageHost.style.height = `${772 * scale}px`;
  } else {
    stageHost.style.removeProperty('--stage-scale');
    stageHost.style.removeProperty('height');
  }
}
new ResizeObserver(sizeStageHost).observe(stageHost);
sizeStageHost();

const mobileInspection = matchMedia('(max-width: 760px)');
function updateInspectionLinks() {
  $$('[data-image-viewer]').forEach(link => {
    link.tabIndex = mobileInspection.matches ? 0 : -1;
    if (mobileInspection.matches) link.setAttribute('aria-haspopup', 'dialog');
    else link.removeAttribute('aria-haspopup');
  });
  if (!mobileInspection.matches && imageViewer.open) imageViewer.close();
}
mobileInspection.addEventListener('change', updateInspectionLinks);
updateInspectionLinks();

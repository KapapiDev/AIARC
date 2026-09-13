const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const menu = $('.menu-toggle');
const links = $('#nav-links');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open'); menu.setAttribute('aria-label', '메뉴 열기'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기'); links.classList.toggle('is-open', open); });
$$('a', links).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });

const steps = {
  drop: { title: '현장 폴더를 그대로 놓으세요.', note: '파일 이름과 형식 감지는 실제로 동작합니다. 분류·누락 분석은 샘플 결과를 사용합니다.', alt: 'AIARC 캔버스에 파일과 폴더를 놓는 드롭 화면' },
  plan: { title: '정리할 문서와 확인할 항목을 한눈에.', note: '샘플 47개 중 45개 분류 · 2개 보류. 내용 확인 2개 · 중복 후보 3개 · 누락 3개.', alt: '샘플 문서 47개의 분류와 중복 후보, 누락을 보여 주는 AIARC 정리안' },
  organized: { title: '정리된 현장 문서함을 확인합니다.', note: '45개가 현장 문서함으로 정리되고, 보류 2개는 따로 남습니다. 원본 파일은 그대로입니다.', alt: '자재, 품질, 감리, 공사, 준공 문서함에 45개 문서가 정리되고 2개는 보류된 실제 화면' }
};
function animateImage(image) { image.classList.remove('image-enter'); requestAnimationFrame(() => image.classList.add('image-enter')); }
function selectStep(key, focus = false) {
  const state = steps[key];
  const image = $('#flow-image'); image.src = `./landing/assets/${key}.png`; image.alt = state.alt; animateImage(image);
  $('#flow-title').textContent = state.title; $('#flow-note').textContent = state.note;
  $('#flow-panel').setAttribute('aria-labelledby', `step-${key}`);
  $$('[data-step]').forEach(button => { const selected = button.dataset.step === key; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; if (focus && selected) button.focus(); });
}
$$('[data-step]').forEach((button, index, buttons) => {
  button.addEventListener('click', () => selectStep(button.dataset.step));
  button.addEventListener('keydown', event => { let next; if (event.key === 'ArrowRight') next = (index + 1) % buttons.length; if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length; if (event.key === 'Home') next = 0; if (event.key === 'End') next = buttons.length - 1; if (next !== undefined) { event.preventDefault(); selectStep(buttons[next].dataset.step, true); } });
});
$$('[data-evidence]').forEach(button => button.addEventListener('click', () => {
  $$('[data-evidence]').forEach(item => { const selected = item === button; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', String(selected)); });
  const image = $('#evidence-image'); image.src = `./landing/assets/${button.dataset.evidence}.png`; image.alt = button.dataset.evidence === 'evidence' ? '시험성적서의 ABC-120 제품명과 해당 항목으로 연결된 AI 메시지' : '자재승인원의 ABC-100 제품명과 해당 항목으로 연결된 AI 메시지';
  $('.evidence-image').dataset.image = button.dataset.evidence; animateImage(image);
}));

// Public illustrative story: these are prepared examples, not project analysis results.
const stateStory = {
  original: { moment: '07.03 당시 상태', value: 'A', description: '원도면 A의 위치가 기준인 상태', reason: '아직 변경지시 없음', date: '변경 전', evidence: '원도면 A', next: '이후 변경지시와 수정도면이 들어오면 함께 확인' },
  change: { moment: '07.12 당시 상태', value: '변경 중', description: '현장 변경지시가 도착한 상태', reason: '현장 변경지시', date: '7월 12일', evidence: '원도면 A · 변경지시 기록', next: '다음 확인 · 변경 내용을 반영한 수정도면' },
  revision: { moment: '07.13 당시 상태', value: 'B 후보', description: '변경 내용을 담은 수정도면 B 수신', reason: '현장 변경지시', date: '7월 12일', evidence: '원도면 A · 변경지시 · 수정도면 B', next: '다음 확인 · 관련 확인 기록과 현장 반영 여부' },
  record: { moment: '07.14 당시 상태', value: 'B', description: '회의록과 메일에서 변경 내용을 확인', reason: '현장 변경지시', date: '7월 12일', evidence: '원도면 A · 수정도면 B · 회의록 · 메일', next: '다음 확인 · 실제 시공에 변경 내용이 반영됐는지' },
  built: { moment: '현재 상태', value: 'B', description: '수정도면 B의 위치로 시공된 상태', reason: '현장 변경지시', date: '7월 12일', evidence: '원도면 A · 수정도면 B · 회의록 · 메일 · 현장사진', next: '다음 확인 · 변경 내용의 최종 반영 여부' }
};
function selectState(key) {
  const state = stateStory[key];
  if (!state) return;
  for (const field of ['moment', 'value', 'description', 'reason', 'date', 'evidence', 'next']) $('#state-' + field).textContent = state[field];
  $$('[data-state]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.state === key)));
}
$$('[data-state]').forEach(button => button.addEventListener('click', () => selectState(button.dataset.state)));

$$('[data-case]').forEach(button => button.addEventListener('click', () => {
  const confirmed = button.dataset.case === 'state-confirmed';
  $$('[data-case]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const image = $('#state-case-image');
  image.src = `./landing/assets/${button.dataset.case}.png`;
  image.alt = confirmed ? '수정본과 사용자 확인을 거쳐 단열재의 확인 상태와 이력이 갱신된 제품 방향 시연' : '단열재 제품명 불일치의 현재 상태, 변경 이력과 원문 근거를 연결한 제품 방향 시연';
  const preview = $('.state-case-image');
  preview.dataset.image = button.dataset.case;
  preview.dataset.imageTitle = confirmed ? '사용자 확인 후 갱신된 Project State' : '단열재의 현재 상태와 변경 이력';
  animateImage(image);
}));

const demoDialog = $('#demo-dialog'); const imageDialog = $('#image-dialog');
const iframe = $('iframe', demoDialog); let dialogOpener;
function openDialog(dialog, opener) { closeMenu(); dialogOpener = opener; dialog.showModal(); document.body.classList.add('modal-open'); }
$$('[data-demo]').forEach(button => button.addEventListener('click', () => {
  openDialog(demoDialog, button);
  if (!iframe.getAttribute('src')) iframe.src = iframe.dataset.src;
}));
iframe.addEventListener('load', () => { $('.demo-loading').hidden = true; });
$$('[data-image]').forEach(button => button.addEventListener('click', () => {
  $('#image-title').textContent = button.dataset.imageTitle;
  const image = $('img', imageDialog); image.src = `./landing/assets/${button.dataset.image}.png`; image.alt = button.dataset.imageTitle;
  openDialog(imageDialog, button);
}));
$$('dialog').forEach(dialog => {
  $('.close-dialog', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); dialogOpener?.focus({ preventScroll: true }); });
});

// The requested Linear reference establishes dark as the default brand presentation.
const themeToggle = $('.theme-toggle');
function setTheme(theme) { document.documentElement.dataset.theme = theme; themeToggle.innerHTML = `화면: ${theme === 'dark' ? '다크' : '라이트'} <span aria-hidden="true">◐</span>`; themeToggle.setAttribute('aria-label', `${theme === 'dark' ? '밝은' : '어두운'} 테마로 전환`); $('meta[name="theme-color"]').content = theme === 'dark' ? '#08090a' : '#f8f8f7'; }
try { const saved = localStorage.getItem('aiarc-landing-theme'); if (saved === 'light' || saved === 'dark') setTheme(saved); } catch { /* Storage may be disabled; the page remains usable. */ }
themeToggle.addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(theme); try { localStorage.setItem('aiarc-landing-theme', theme); } catch {} });
// Back to top: appears once the hero is well out of view, and doubles as the brand-logo behaviour.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const toTop = $('.to-top');
function scrollToTop() { window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }); }
toTop.addEventListener('click', () => { scrollToTop(); $('.header .brand').focus({ preventScroll: true }); });
$$('.brand[href="#"]').forEach(brand => brand.addEventListener('click', event => { event.preventDefault(); closeMenu(); scrollToTop(); }));
let toTopQueued = false;
function updateToTop() { toTopQueued = false; toTop.classList.toggle('is-visible', scrollY > innerHeight * 1.2); }
addEventListener('scroll', () => { if (!toTopQueued) { toTopQueued = true; requestAnimationFrame(updateToTop); } }, { passive: true });
updateToTop();

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); observer.unobserve(entry.target); } }), { threshold: .06 });
  $$('.reveal').forEach(element => { element.classList.add('is-pending'); observer.observe(element); });
}

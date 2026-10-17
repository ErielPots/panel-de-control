// Arranque: controles, solapas, menú lateral y render. Va al final, después de todas las secciones.

function controls() {
  segBtns('years', RD.map((_, i) => [i, String(i)]).slice(1), 'y', renderAll);
  for (const s of SECCIONES) if (s.controles) s.controles();
}

function showTab(tab, user) {
  st.tab = tab;
  for (const b of document.querySelectorAll('.tabs button')) b.setAttribute('aria-selected', String(b.dataset.tab === tab));
  document.getElementById('v-panel').hidden = tab !== 'panel';
  document.getElementById('v-estados').hidden = tab !== 'estados';
  document.getElementById('secs').hidden = tab !== 'panel';
  buildSide();
  if (user) {
    for (const c of document.querySelectorAll(`#v-${tab} .card`)) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; }
    try { history.replaceState(null, '', tab === 'estados' ? '#estados' : '#panel'); } catch (e) {}
    window.scrollTo(0, 0);
  }
  renderView();
}
document.querySelector('.tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showTab(b.dataset.tab, true); });

function renderView() {
  for (const s of SECCIONES) if (s.vista === st.tab) s.render();
  requestAnimationFrame(() => Object.values(charts).forEach(c => { if (c.getDom().offsetParent) c.resize(); }));
}
function renderAll() { readTokens(); controls(); kpis(); renderView(); }

// índice de cada tarjeta para la entrada escalonada
for (const sec of document.querySelectorAll('section')) sec.querySelectorAll('.card').forEach((c, i) => c.style.setProperty('--i', i));

// menú lateral (y barra de secciones en pantallas angostas): la sección actual en grande
function setActive(id) {
  for (const a of document.querySelectorAll('#side a, #secs a')) a.classList.toggle('on', a.getAttribute('href') === '#' + id);
}
function buildSide() {
  const view = document.getElementById('v-' + st.tab);
  const secs = [...view.querySelectorAll('section')];
  document.getElementById('side').innerHTML = `<div class="lbl">${st.tab === 'panel' ? 'Panel' : 'Estados contables'}</div>` + secs.map(sc => `<a href="#${sc.id}">${sc.querySelector('h2').textContent}</a>`).join('');
  document.getElementById('secs').innerHTML = [...document.querySelectorAll('#v-panel section')].map(sc => `<a href="#${sc.id}">${sc.dataset.nav || sc.querySelector('h2').textContent}</a>`).join('');
  setActive(secs[0].id);
}
if ('IntersectionObserver' in window) {
  const secIO = new IntersectionObserver((ents) => { for (const en of ents) if (en.isIntersecting && en.target.offsetParent) setActive(en.target.id); }, { rootMargin: '-35% 0px -60% 0px' });
  document.querySelectorAll('section').forEach(sc => secIO.observe(sc));
}
window.addEventListener('scroll', () => {
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) { const secs = document.querySelectorAll(`#v-${st.tab} section`); setActive(secs[secs.length - 1].id); }
  else if (scrollY < 40) { setActive(document.querySelector(`#v-${st.tab} section`).id); }
}, { passive: true });

for (const s of SECCIONES) if (s.init) s.init();
readTokens(); controls(); kpis();
showTab(st.tab, false);
let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => Object.values(charts).forEach(c => c.resize()), 120); });
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', renderAll);
new MutationObserver(renderAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

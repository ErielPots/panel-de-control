// Núcleo del panel: datos, formato, colores, piezas de gráfico, cifras de arriba y registro de secciones.
// Lo usan todas las secciones; cambiar algo acá afecta a todo el panel.

const DATA = window.__DATOS__;
const E = DATA.empresas, RD = DATA.rondas, T = E.indexOf('TANGO');
const LAST = RD.length - 1;
const REG = { US: 'EE.UU.', CN: 'China', EU: 'Europa' };
const TEC = { comb: 'Combustión', hib: 'Híbrido', elec: 'Eléctrico', hidr: 'Hidrógeno' };
const MON = { US: 'USD', CN: 'RMB', EU: 'EUR' };
const CAPF = { US: 200, CN: 250 };   // miles de unidades por fábrica
const RATING = ['AAA','AA+','AA','AA-','A+','A','A-','BBB+','BBB','BBB-','BB+','BB','BB-','B+','B','B-','CCC+','CCC','CCC-','CC','C','D'];
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const st = { y: LAST, capreg: 'T', reg: 'US', tec: 'comb', tab: 'panel', emp: T, vista: 'usd' };
try { const s = JSON.parse(localStorage.getItem('panelTango2') || '{}'); for (const k of ['capreg','reg','tec','emp','vista']) if (k in s) st[k] = s[k]; } catch (e) {}
if (['#estados', '#er', '#bal'].includes(location.hash)) st.tab = 'estados';
function save() { try { localStorage.setItem('panelTango2', JSON.stringify({ capreg: st.capreg, reg: st.reg, tec: st.tec, emp: st.emp, vista: st.vista })); } catch (e) {} }

// ---------- formato
const nf = (d) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
const F = (x, d = 1) => x == null || isNaN(x) ? '–' : nf(d).format(x);
const yrs = (y = st.y) => Array.from({ length: y + 1 }, (_, i) => 'A' + i);
const MM = (x) => x == null ? null : x / 1e6;      // miles USD → miles de M USD
const M = (x) => x == null ? null : x / 1e3;       // miles USD → M USD
const sum = (a) => a.reduce((s, v) => s + (v || 0), 0);
const avg = (a) => { const b = a.filter(v => v != null && !isNaN(v)); return b.length ? b.reduce((s, v) => s + v, 0) / b.length : null; };
const mn = (a) => { const b = a.filter(v => v != null && !isNaN(v)); return b.length ? Math.min(...b) : null; };
const mx = (a) => { const b = a.filter(v => v != null && !isNaN(v)); return b.length ? Math.max(...b) : null; };
const serie = (fn, y = st.y) => Array.from({ length: y + 1 }, (_, r) => fn(RD[r], r));
const rank = (vals, k, higherBetter = true) => { const v = vals[k]; if (v == null) return null; return 1 + vals.filter(x => x != null && (higherBetter ? x > v : x < v)).length; };

// ---------- derivados
const ventasU = (d, k) => { let s = 0; for (const rg in d.seg) for (const t in TEC) s += d.seg[rg][t].ventas[k] || 0; return s; };
const demandaU = (d, k) => { let s = 0; for (const rg in d.seg) for (const t in TEC) s += d.seg[rg][t].demanda[k] || 0; return s; };
const prodInt = (d, k, rg) => { let s = 0; for (const r of (rg ? [rg] : ['US','CN'])) for (const t in TEC) s += d.prod_int[r][t][k] || 0; return s; };
const prodCon = (d, k) => { let s = 0; for (const r of ['US','CN']) for (const t in TEC) s += d.prod_con[r][t][k] || 0; return s; };
const invTec = (d, k, t) => (d.inv.US[t][k] || 0) + (d.inv.CN[t][k] || 0);
const invU = (d, k) => Object.keys(TEC).reduce((s, t) => s + invTec(d, k, t), 0);
const insatU = (d, k) => Object.keys(TEC).reduce((s, t) => s + (d.insat[t][k] || 0), 0);
const capNom = (d, k, rg) => (rg ? [rg] : ['US','CN']).reduce((s, r) => s + (d.fab[r][k] || 0) * CAPF[r], 0);
const capEf = (d, k, rg) => (rg ? [rg] : ['US','CN']).reduce((s, r) => { const u = d.cap_usada[r][k]; const p = prodInt(d, k, r); return s + (u > 0 ? p / (u / 100) : (d.fab[r][k] || 0) * CAPF[r]); }, 0);
const roa = (r, k) => { const d = RD[r]; const a0 = r > 0 ? RD[r - 1].activos[k] : d.activos[k]; return d.bn[k] / ((a0 + d.activos[k]) / 2) * 100; };
const caracProm = (d, k) => { let n = 0, s = 0; for (const rg in d.seg) for (const t in TEC) { const v = d.seg[rg][t].ventas[k], c = d.seg[rg][t].carac[k]; if (v && c != null) { n += v; s += v * c; } } return n ? s / n : null; };
const divCap = (r, k) => { if (r === 0) return 0; const P0 = RD[0].precio[k]; return P0 * Math.pow(1 + RD[r].tsr[k] / 100, r) - RD[r].precio[k]; };
const allK = (fn) => E.map((_, k) => fn(k));
const precioMedio = (d, k) => { const u = ventasU(d, k); return u ? d.ing[k] / u : null; };
const costoU = (d, k) => { const u = ventasU(d, k); return u ? d.cv[k] / u : null; };

// ---------- tema
function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
let C = {};
function readTokens() {
  C = {};
  for (const n of ['ink','ink-2','muted','grid','axis','card','tango','own','t1','t2','t3','t4','nova','radar','seven','tcena','nexo','avg','band','good','bad','warn','red1','red2','red3']) C[n] = tok('--' + n);
  C.emp = { NOVA: C.nova, RADAR: C.radar, SEVEN: C.seven, TANGO: C.tango, TCENA: C.tcena, NEXO: C.nexo };
}
const hexA = (hex, a) => { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
const grad = (c, a1 = 1, a2 = .72) => new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: hexA(c, a1) }, { offset: 1, color: hexA(c, a2) }]);
const areaGrad = (c) => ({ color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: hexA(c, .26) }, { offset: 1, color: hexA(c, 0) }]) });

// ---------- registro de gráficos; los que arrancan fuera de pantalla repiten la animación al aparecer
const charts = {}, OPTS = {}, seen = new Set();
const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
  for (const en of ents) {
    if (!en.isIntersecting) continue;
    const id = en.target.id; io.unobserve(en.target);
    if (seen.has(id)) continue; seen.add(id);
    if (!RM && OPTS[id] && en.target.dataset.offscreen === '1') { const c = charts[id]; c.clear(); c.setOption(OPTS[id], true); }
  }
}, { threshold: .2 }) : null;
function chart(id) {
  const el = document.getElementById(id);
  if (!charts[id]) {
    charts[id] = echarts.init(el, null, { renderer: 'canvas' });
    if (io) { const r = el.getBoundingClientRect(); el.dataset.offscreen = (r.top > innerHeight || r.bottom < 0) ? '1' : '0'; io.observe(el); }
  }
  return charts[id];
}
function set(id, opt) { OPTS[id] = opt; const el = document.getElementById(id); if (el.offsetParent === null) return; chart(id).setOption(opt, true); }

const font = { fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' };
const anim = { animationDuration: RM ? 0 : 900, animationEasing: 'cubicOut', animationDurationUpdate: RM ? 0 : 600, animationEasingUpdate: 'cubicInOut' };
const ttBox = () => ({ backgroundColor: C.card, borderColor: C.axis, borderWidth: 1, padding: [8, 10], extraCssText: 'border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);', textStyle: { color: C.ink, fontSize: 12, ...font } });
function base(o = {}) {
  return {
    ...anim,
    textStyle: { ...font, color: C['ink-2'] },
    grid: { left: 8, right: 34, top: 52, bottom: 4, containLabel: true, ...(o.grid || {}) },
    tooltip: { trigger: 'axis', ...ttBox(), axisPointer: { type: 'shadow', shadowStyle: { color: hexA(C.own, .06) } }, ...(o.tooltip || {}) },
    legend: { top: 0, left: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 8, itemGap: 14, textStyle: { color: C['ink-2'], fontSize: 11 }, inactiveColor: C.axis, ...(o.legend || {}) },
  };
}
const lineTT = (o) => ({ ...base().tooltip, axisPointer: { type: 'line', lineStyle: { color: C.axis, type: [4, 3] } }, ...o });
const xCat = (data, name = 'Año') => ({ type: 'category', data, name, nameLocation: 'end', nameGap: 8, nameTextStyle: { color: C.muted, fontSize: 11, verticalAlign: 'top', padding: [6, 0, 0, 0] }, axisLine: { lineStyle: { color: C.axis } }, axisTick: { show: false }, axisLabel: { color: C.muted, fontSize: 11 } });
const yVal = (name, o = {}) => ({ type: 'value', name, nameTextStyle: { color: C.muted, fontSize: 11, align: 'left', padding: [0, 0, 0, -4] }, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted, fontSize: 11, formatter: (v) => F(v, o.dec ?? 0) }, ...o });
const delay = (i) => i * 55;
const bar = (name, data, color, o = {}) => ({ type: 'bar', name, data, barMaxWidth: 28, itemStyle: { color: grad(color), borderRadius: [5, 5, 0, 0] }, emphasis: { itemStyle: { color } }, animationDelay: delay, ...o });
const flat = (name, data, color, o = {}) => bar(name, data, color, { itemStyle: { color, borderRadius: 0 }, ...o });
const line = (name, data, color, o = {}) => ({ type: 'line', name, data, smooth: .25, symbol: 'circle', symbolSize: 6, lineStyle: { width: 2, color }, itemStyle: { color, borderColor: C.card, borderWidth: 1.5 }, animationDelay: delay, ...o });
const avgLine = (data, name = 'Promedio mercado') => line(name, data, C.avg, { lineStyle: { width: 2, type: [6, 4], color: C.avg, shadowColor: C.card, shadowBlur: 4 }, symbol: 'circle', symbolSize: 7, itemStyle: { color: C.card, borderColor: C.avg, borderWidth: 2 }, z: 6, zlevel: 0 });
const lblTop = (d = 1, fmt) => ({ show: true, position: 'top', color: C['ink-2'], fontSize: 10.5, fontWeight: 600, formatter: fmt || ((p) => F(p.value, (d > 0 && Math.abs(p.value) < 1 && p.value !== 0) ? 2 : d)) });
const tip = (d = 1, u = '') => ({ valueFormatter: (v) => v == null ? '–' : F(v, d) + u });
const endLbl = (fmt) => ({ show: true, formatter: fmt, color: C.ink, fontSize: 11, fontWeight: 700, distance: 6 });
const dot = (c) => `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};margin-right:6px"></span>`;

// TANGO contra el rango del mercado: banda mínimo–máximo, promedio punteado y TANGO destacado
function bandChart(id, valFn, { d = 1, unit = '', yName = '', yOpts = {} } = {}) {
  const xs = yrs(), n = xs.length;
  const vals = Array.from({ length: n }, (_, r) => allK(k => valFn(r, k)));
  const lo = vals.map(v => mn(v)), hi = vals.map(v => mx(v));
  const tg = vals.map(v => v[T]), av = vals.map(v => avg(v));
  set(id, { ...base({ grid: { right: 60 } }),
    legend: { ...base().legend, data: ['TANGO', 'Promedio mercado', 'Rango del mercado'] },
    tooltip: lineTT({ formatter: (ps) => { const i = ps[0].dataIndex; const rows = E.map((e, k) => ({ e, v: vals[i][k] })).filter(o => o.v != null).sort((a, b) => b.v - a.v);
      return `<b>${xs[i]}</b><br>` + rows.map(o => `${dot(C.emp[o.e])}${o.e === 'TANGO' ? '<b>' : ''}${o.e} ${F(o.v, d)}${unit}${o.e === 'TANGO' ? '</b>' : ''}`).join('<br>') + `<br><span style="color:${C.muted}">Promedio ${F(av[i], d)}${unit}</span>`; } }),
    xAxis: xCat(xs), yAxis: yVal(yName, yOpts),
    series: [
      { type: 'line', name: '_lo', data: lo, stack: 'band', symbol: 'none', lineStyle: { opacity: 0 }, silent: true, smooth: .25 },
      { type: 'line', name: 'Rango del mercado', data: hi.map((h, i) => h == null || lo[i] == null ? null : h - lo[i]), stack: 'band', symbol: 'none', lineStyle: { opacity: 0 }, areaStyle: { color: C.band, opacity: 1 }, itemStyle: { color: C.avg }, silent: true, smooth: .25 },
      avgLine(av),
      line('TANGO', tg, C.tango, { lineStyle: { width: 3, color: C.tango }, symbolSize: 8, z: 4, endLabel: endLbl((p) => F(p.value, d) + unit) }),
    ] });
}

function pie(items, colors, d = 1, unit = '%') {
  const tot = sum(items.map(i => i.value));
  return {
    ...anim, animationType: 'expansion', animationDuration: RM ? 0 : 1000,
    tooltip: { trigger: 'item', ...ttBox(), formatter: (p) => `${dot(p.color)}${p.name}<br><b>${F(p.value, d)}${unit}</b> · ${F(p.value / tot * 100, 1)}%` },
    series: [{ type: 'pie', radius: ['44%', '66%'], center: ['50%', '54%'], itemStyle: { borderColor: C.card, borderWidth: 3, borderRadius: 6 }, avoidLabelOverlap: true,
      label: { color: C.ink, fontSize: 11, overflow: 'none', formatter: (p) => `{n|${p.name}}\n{v|${F(p.value / tot * 100, 1)}%}`, rich: { n: { color: C['ink-2'], fontSize: 11 }, v: { color: C.ink, fontSize: 14, fontWeight: 700, padding: [3, 0, 0, 0] } } },
      labelLine: { lineStyle: { color: C.axis }, length: 10, length2: 10 },
      emphasis: { scale: true, scaleSize: 6 },
      data: items.map((it, i) => ({ ...it, itemStyle: { color: colors[i] } })) }],
  };
}

// ---------- banda de cifras
const prevK = {};
function countUp(el, to, dec) {
  const from = prevK[el.id] ?? (to == null ? null : to * .6); prevK[el.id] = to;
  if (RM || from == null || to == null || from === to) { el.textContent = F(to, dec); return; }
  const t0 = performance.now(), dur = 800;
  const step = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = F(from + (to - from) * e, dec); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function sem(rk) {
  if (rk == null) return '';
  const c = rk <= 2 ? 'g' : rk <= 4 ? 'y' : 'r';
  return `<span class="sem" title="${rk}º de 6" aria-label="Puesto ${rk} de 6"><i class="${c === 'g' ? 'on g' : ''}"></i><i class="${c === 'y' ? 'on y' : ''}"></i><i class="${c === 'r' ? 'on r' : ''}"></i></span>`;
}
function kpis() {
  const y = st.y, d = RD[y], p = y > 0 ? RD[y - 1] : null;
  document.getElementById('hero').innerHTML = `Panel de control <em>año ${y}</em>`;
  const defs = [
    { id: 'ing', k: 'Ingresos', f: dd => MM(dd.ing[T]), u: 'mil M', dec: 1, all: d.ing, pct: true },
    { id: 'bn', k: 'Beneficio neto', f: dd => MM(dd.bn[T]), u: 'mil M', dec: 2, all: d.bn, pct: true },
    { id: 'ms', k: 'Market share', f: dd => dd.ms[T], u: '%', dec: 1, all: d.ms },
    { id: 'ros', k: 'Margen neto', f: dd => dd.ros[T], u: '%', dec: 1, all: d.ros },
    { id: 'tsr', k: 'TSR anualizado', f: dd => dd.tsr[T], u: '%', dec: 1, all: d.tsr },
    { id: 'pr', k: 'Precio acción', f: dd => dd.precio[T], u: 'USD', dec: 2, all: d.precio, pct: true },
    { id: 'eps', k: 'EPS', f: dd => dd.eps[T], u: 'USD', dec: 2, all: d.eps, pct: true },
    { id: 'rt', k: 'Calificación', txt: true, f: dd => -RATING.indexOf(dd.rating[T]), all: d.rating.map(r => -RATING.indexOf(r)) },
  ];
  const box = document.getElementById('kpis');
  if (!box.children.length) box.innerHTML = defs.map(o => `<div class="kpi"><div class="k"><span>${o.k}</span><span id="s_${o.id}"></span></div><div class="v"><span id="k_${o.id}"></span><small>${o.u || ''}</small></div><div class="d" id="d_${o.id}"></div></div>`).join('');
  for (const o of defs) {
    const v = o.f(d), pv = p ? o.f(p) : null;
    const vEl = document.getElementById('k_' + o.id), dEl = document.getElementById('d_' + o.id);
    if (o.txt) {
      vEl.textContent = d.rating[T];
      const pr = p && p.rating[T];
      dEl.className = 'd' + (pr && pr !== d.rating[T] ? (v > pv ? ' up' : ' dn') : '');
      const esc = pr ? Math.abs(RATING.indexOf(pr) - RATING.indexOf(d.rating[T])) : 0;
      dEl.textContent = !pr ? '' : esc === 0 ? '= sin cambios' : `${v > pv ? '▲' : '▼'} ${esc} ${esc === 1 ? 'escalón' : 'escalones'}`;
    } else {
      countUp(vEl, v, o.dec);
      let dv = null;
      if (pv != null) dv = o.pct ? (pv !== 0 ? (v - pv) / Math.abs(pv) * 100 : null) : v - pv;
      const igual = dv != null && Math.abs(dv) < .05;
      dEl.className = 'd' + (dv == null || igual ? '' : dv > 0 ? ' up' : ' dn');
      dEl.textContent = dv == null ? '' : igual ? '= sin cambios' : `${dv > 0 ? '▲' : '▼'} ${F(Math.abs(dv), 1)}${o.pct ? '%' : ' pp'}`;
    }
    document.getElementById('s_' + o.id).innerHTML = sem(rank(o.all, T));
  }
}

// ---------- tablas contables (las usan las secciones de Estados contables)
function tabla(rows, getter, denom) {
  const y = st.y, k = st.emp, X = yrs(LAST), vista = st.vista;
  const lab = vista === 'usd' ? 'USD millones' : vista === 'pct' ? '% de ' + denom[1] : 'Variación anual';
  const head = `<thead><tr><th>${lab}</th>${X.map((x, i) => `<th class="${i === y ? 'hl' : ''}">${x}</th>`).join('')}</tr></thead>`;
  const body = rows.map(([key, label, cls, sg]) => {
    if (key === '#') return `<tr class="grp"><td>${label}</td>${X.map(() => '<td></td>').join('')}</tr>`;
    const cells = X.map((_, r) => {
      const v = getter(r, key, k), hl = r === y ? 'hl' : '';
      if (v == null) return `<td class="${hl}">–</td>`;
      let txt = '–', neg = false;
      const s = sg === -1 && v !== 0 ? -v : v;
      if (vista === 'usd') { txt = F(s / 1000, 0); neg = !!cls && s < 0; }
      else if (vista === 'pct') { const dn = getter(r, denom[0], k); txt = F(s / dn * 100, 1) + '%'; neg = !!cls && s < 0; }
      else if (r > 0) { const p = getter(r - 1, key, k); if (p) { const ch = (v - p) / Math.abs(p) * 100; txt = (ch > 0 ? '+' : '') + F(ch, 1) + '%'; neg = !!cls && ch < 0; } }
      return `<td class="${neg ? 'neg ' : ''}${hl}">${txt}</td>`;
    }).join('');
    return `<tr class="${cls || ''}"><td>${label}</td>${cells}</tr>`;
  }).join('');
  return `<table class="ec">${head}<tbody>${body}</tbody></table>`;
}

// ---------- registro de secciones: cada carpeta de src/secciones llama a seccion({...})
//   id: el id del <section> · vista: 'panel' o 'estados' · render: dibuja sus gráficos
//   controles (opcional): arma sus botones · init (opcional): corre una vez al cargar
const SECCIONES = [];
function seccion(def) { SECCIONES.push(def); }
function segBtns(id, opts, key, onChange) {
  const el = document.getElementById(id);
  el.innerHTML = opts.map(([v, l, dis]) => `<button type="button" data-v="${v}" aria-pressed="${String(st[key]) === String(v)}" ${dis ? 'disabled' : ''}>${l}</button>`).join('');
  el.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; st[key] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; save(); onChange(); };
}

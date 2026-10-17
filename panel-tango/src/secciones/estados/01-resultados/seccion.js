// Sección: Estado de resultados (solapa Estados contables)
// La empresa y la vista (USD, % vertical, variación) que se eligen acá también aplican al balance.

const ER_ROWS = [
  ['ing', 'Ingresos por ventas', 'sub'],
  ['fab', 'Costos de fabricación interna', '', -1],
  ['carac', 'Costos de las características', '', -1],
  ['contr', 'Costos de fabricación contratada', '', -1],
  ['transp', 'Transporte y aranceles', '', -1],
  ['_bb', 'Beneficio bruto', 'sub'],
  ['id', 'I+D', '', -1],
  ['promo', 'Promoción', '', -1],
  ['adm', 'Administración', '', -1],
  ['ebitda', 'EBITDA', 'sub'],
  ['dep', 'Depreciación', '', -1],
  ['ebit', 'Beneficio operativo (EBIT)', 'sub'],
  ['fin', 'Gastos financieros netos', '', -1],
  ['bai', 'Beneficio antes de impuestos', 'sub'],
  ['imp', 'Impuesto a las ganancias', '', -1],
  ['bn', 'Beneficio neto', 'tot'],
];
const erv = (r, key, k) => { const e = RD[r].er; if (key === '_bb') return e.ing[k] - e.fab[k] - e.carac[k] - e.contr[k] - e.transp[k]; return e[key][k]; };

function resultados() {
  const y = st.y, k = st.emp, X = yrs(LAST), emp = E[k];
  document.getElementById('h_casc').textContent = `Cascada del resultado · ${emp} · año ${y}`;
  const e = RD[y].er;
  const steps = [['Ingresos', e.ing[k], 'start'], ['Fabricación', -e.fab[k]], ['Características', -e.carac[k]], ['Contratada', -e.contr[k]], ['Transporte', -e.transp[k]], ['Beneficio bruto', null, 'sub'], ['I+D', -e.id[k]], ['Promoción', -e.promo[k]], ['Administración', -e.adm[k]], ['Depreciación', -e.dep[k]], ['EBIT', null, 'sub'], ['Financieros', -e.fin[k]], ['Impuestos', -e.imp[k]], ['Beneficio neto', null, 'end']];
  let run = 0; const cats = [], baseS = [], upS = [], dnS = [], totS = [], kind = [];
  for (const [n, v, kd] of steps) {
    cats.push(n); kind.push(kd || 'step');
    if (kd === 'start') { run = v; totS.push(M(v)); baseS.push(0); upS.push(0); dnS.push(0); continue; }
    if (kd) { totS.push(M(run)); baseS.push(0); upS.push(0); dnS.push(0); continue; }
    const nx = run + v; baseS.push(M(Math.min(run, nx))); totS.push(0);
    if (v >= 0) { upS.push(M(v)); dnS.push(0); } else { dnS.push(M(-v)); upS.push(0); }
    run = nx;
  }
  const ingM = M(e.ing[k]);
  const narrow = document.getElementById('c_casc').clientWidth < 520;
  const ws = { stack: 'w', stackStrategy: 'all', barMaxWidth: 34, animationDelay: delay };
  set('c_casc', { ...anim, textStyle: { ...font, color: C['ink-2'] }, grid: { left: 8, right: 16, top: 40, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis', ...ttBox(), axisPointer: { type: 'shadow', shadowStyle: { color: hexA(C.own, .06) } }, formatter: (ps) => { const i = ps[0].dataIndex; const v = kind[i] !== 'step' ? totS[i] : upS[i] ? upS[i] : -dnS[i]; return `<b>${cats[i]}</b><br>${F(v, 0)} M USD · ${F(v / ingM * 100, 1)}% de ingresos`; } },
    xAxis: { type: 'category', data: cats, axisLine: { lineStyle: { color: C.axis } }, axisTick: { show: false }, axisLabel: { color: C.muted, fontSize: narrow ? 9 : 10, interval: 0, rotate: narrow ? 60 : 30 } },
    yAxis: yVal('USD millones'),
    series: [
      { type: 'bar', ...ws, data: baseS, itemStyle: { color: 'rgba(0,0,0,0)' }, silent: true, label: { show: false } },
      { type: 'bar', ...ws, name: 'Subtotal', data: totS, itemStyle: { color: (p) => kind[p.dataIndex] === 'end' ? grad(C.t1) : kind[p.dataIndex] === 'start' ? grad(C.own) : grad(C.t3), borderRadius: 5 }, label: { show: true, position: 'top', color: C.ink, fontSize: narrow ? 9.5 : 11, fontWeight: 700, formatter: (p) => kind[p.dataIndex] === 'step' ? '' : F(p.value / 1000, 1) + (narrow ? '' : ' mil M') } },
      { type: 'bar', ...ws, name: 'Costo', data: dnS, itemStyle: { color: grad(C.bad, .85, .6), borderRadius: 4 }, label: { show: true, position: 'insideTop', color: '#ffffff', fontSize: 10, fontWeight: 600, formatter: (p) => !narrow && p.value && p.value / ingM > .04 ? '−' + F(p.value / 1000, 1) : '' } },
      { type: 'bar', ...ws, name: 'Ingreso', data: upS, itemStyle: { color: grad(C.good, .85, .6), borderRadius: 4 }, label: { show: true, position: 'top', color: C['ink-2'], fontSize: 10, formatter: (p) => p.value ? '+' + F(p.value, 0) + ' M' : '' } },
    ] });
  document.getElementById('h_dolar').textContent = `Destino de cada dólar de ingresos · ${emp}`;
  const parts = [['Fabricación', r => RD[r].er.fab[k] + RD[r].er.contr[k], C.t1], ['Características', r => RD[r].er.carac[k], C.t2], ['Transporte', r => RD[r].er.transp[k], C.t3], ['I+D, prom. y adm.', r => RD[r].er.id[k] + RD[r].er.promo[k] + RD[r].er.adm[k], C.t4], ['Dep., fin. e imp.', r => RD[r].er.dep[k] + RD[r].er.fin[k] + RD[r].er.imp[k], C.avg], ['Beneficio neto', r => RD[r].er.bn[k], C.good]];
  set('c_dolar', { ...base({ grid: { top: 70, right: 16 } }), tooltip: { ...base().tooltip, ...tip(1, '%') }, xAxis: xCat(X, ''), yAxis: yVal('% de ingresos', { min: (v) => Math.min(0, Math.floor(v.min)), max: (v) => Math.max(100, Math.ceil(v.max)) }),
    series: parts.map(([n, f, c], j) => ({ type: 'bar', name: n, stack: 'u', barWidth: '62%', data: X.map((_, r) => f(r) / RD[r].er.ing[k] * 100), itemStyle: { color: c, borderColor: C.card, borderWidth: 1, borderRadius: j === 5 ? [4, 4, 0, 0] : 0 }, animationDelay: (i) => i * 60 + j * 30,
      label: j === 5 ? { show: true, position: 'top', color: C.ink, fontSize: 10, fontWeight: 700, formatter: (p) => F(p.value, 0) + '¢' } : undefined })) });
  document.getElementById('h_ertab').textContent = `Estado de resultados · ${emp}`;
  document.getElementById('t_er').innerHTML = tabla(ER_ROWS, erv, ['ing', 'ingresos']);
}

seccion({ id: 'er', vista: 'estados', render: resultados,
  controles: () => {
    segBtns('f_emp', E.map((e, k) => [k, e]), 'emp', () => { controls(); renderView(); });
    segBtns('f_vista', [['usd', 'USD M'], ['pct', '% vertical'], ['var', 'Var. %']], 'vista', () => { controls(); renderView(); });
  } });

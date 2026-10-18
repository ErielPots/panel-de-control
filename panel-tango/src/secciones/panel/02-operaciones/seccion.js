// Sección: Operaciones
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

// Redondea sólo el tramo de arriba de cada barra apilada (el último con valor)
function topeRedondo(series) {
  const n = series[0].data.length;
  for (let i = 0; i < n; i++) {
    let tope = -1;
    series.forEach((s, j) => { if ((s.data[i] || 0) > 0) tope = j; });
    series.forEach((s, j) => { s.data[i] = { value: s.data[i] || 0, itemStyle: { borderRadius: j === tope ? [5, 5, 0, 0] : 0 } }; });
  }
  return series;
}

function operaciones() {
  const X = yrs();

  // Demanda contra producción: las dos barras llegan a la misma altura.
  // Demanda + stock sobrante = producción + stock inicial + demanda insatisfecha
  const dem = serie(d => demandaU(d, T)), prod = serie(d => prodInt(d, T) + prodCon(d, T));
  const ini = serie((d, r) => r > 0 ? invU(RD[r - 1], T) : 0), sob = serie(d => invU(d, T)), ins = serie(d => insatU(d, T));
  const sDem = topeRedondo([
    { name: 'Demanda', stack: 'dem', data: dem.slice(), color: hexA(C.avg, .55) },
    { name: 'Stock sobrante', stack: 'dem', data: sob.slice(), color: '#f6b17f' },
  ]);
  const sProd = topeRedondo([
    { name: 'Producción', stack: 'prod', data: prod.slice(), color: C.own },
    { name: 'Stock inicial', stack: 'prod', data: ini.slice(), color: C.t4 },
    { name: 'Demanda insatisfecha', stack: 'prod', data: ins.slice(), color: C.bad },
  ]);
  const etiquetados = ['Stock sobrante', 'Demanda insatisfecha'];
  set('c_dem', { ...base(),
    tooltip: { ...base().tooltip, formatter: (ps) => { const i = ps[0].dataIndex; return `<b>${X[i]}</b><br>`
      + `${dot(hexA(C.avg, .8))}Demanda <b>${F(dem[i], 0)}</b><br>${dot(C.own)}Producción <b>${F(prod[i], 0)}</b><br>${dot(C.t4)}Stock inicial <b>${F(ini[i], 0)}</b><br>`
      + `${dot(C.bad)}Demanda insatisfecha <b>${F(ins[i], 0)}</b><br>${dot('#f6b17f')}Stock sobrante <b>${F(sob[i], 0)}</b>`; } },
    legend: { ...base().legend, data: ['Demanda', 'Producción', 'Stock inicial', 'Demanda insatisfecha', 'Stock sobrante'] },
    xAxis: xCat(X), yAxis: yVal('Miles de unidades'),
    series: [...sDem, ...sProd].map(s => ({ type: 'bar', name: s.name, stack: s.stack, data: s.data, barMaxWidth: 34, barGap: '18%',
      itemStyle: { color: s.color }, animationDelay: delay,
      label: etiquetados.includes(s.name) ? { show: true, position: 'top', color: s.name === 'Demanda insatisfecha' ? C.bad : C.ink, fontSize: 10.5, fontWeight: 700, formatter: (p) => p.value > 0.5 ? F(p.value, 0) : '' } : undefined })) });

  // Utilización de planta: capacidad instalada (fábricas × capacidad por fábrica) contra producción propia
  const rg = st.capreg === 'T' ? null : st.capreg;
  const cap = serie(d => capNom(d, T, rg)), pi = serie(d => prodInt(d, T, rg));
  const uso = cap.map((c, i) => c ? pi[i] / c * 100 : null);
  set('c_cap', { ...base(), tooltip: { ...base().tooltip, formatter: (ps) => { const i = ps[0].dataIndex; return `<b>${X[i]}</b><br>${dot(C.t4)}Capacidad instalada <b>${F(cap[i], 0)}</b><br>${dot(C.own)}Producción propia <b>${F(pi[i], 0)}</b><br>Utilización <b>${F(uso[i], 1)}%</b>`; } },
    xAxis: xCat(X), yAxis: yVal('Miles de unidades'),
    series: [
      bar('Capacidad instalada', cap, C.t4, { barGap: '-100%', barMaxWidth: 40, z: 1, itemStyle: { color: C.t4, borderRadius: [5, 5, 0, 0] } }),
      bar('Producción propia', pi, C.own, { barGap: '-100%', barMaxWidth: 40, z: 3,
        label: { show: true, position: 'top', color: C.ink, fontSize: 11, fontWeight: 800, formatter: (p) => uso[p.dataIndex] == null ? '' : F(uso[p.dataIndex], 0) + '%' } }),
    ] });

  set('c_pc', { ...base(), tooltip: { ...base().tooltip, ...tip(0, ' mil u') }, xAxis: xCat(X), yAxis: yVal('Miles de unidades'),
    series: [flat('Propia', serie(d => prodInt(d, T)), C.t1, { stack: 'p' }), bar('Contratada', serie(d => prodCon(d, T)), C.t3, { stack: 'p' })] });
  const tecsInv = Object.keys(TEC).filter(t => RD.some(d => invTec(d, T, t) > 0));
  const cols = [C.t1, C.t3, C.t4, C.avg];
  set('c_inv', { ...base(), tooltip: { ...base().tooltip, ...tip(0, ' mil u') }, xAxis: xCat(X), yAxis: yVal('Miles de unidades'),
    series: tecsInv.map((t, i) => i === tecsInv.length - 1 ? bar(TEC[t], serie(d => invTec(d, T, t)), cols[i], { stack: 'i' }) : flat(TEC[t], serie(d => invTec(d, T, t)), cols[i], { stack: 'i' })) });

  // Fábricas: total apilado por región, o una sola región
  const fu = serie(d => d.fab.US[T]), fc = serie(d => d.fab.CN[T]);
  const lblTot = (vals) => ({ show: true, position: 'top', color: C.ink, fontSize: 11, fontWeight: 700, formatter: (p) => F(vals[p.dataIndex], 0) });
  const tot = fu.map((v, i) => v + fc[i]);
  const fabSeries = st.fabreg === 'US' ? [bar('EE.UU.', fu, C.t1, { label: lblTot(fu) })]
    : st.fabreg === 'CN' ? [bar('China', fc, C.t3, { label: lblTot(fc) })]
    : [flat('EE.UU.', fu, C.t1, { stack: 'f' }), bar('China', fc, C.t3, { stack: 'f', label: lblTot(tot) })];
  set('c_fab', { ...base(), tooltip: { ...base().tooltip, ...tip(0) }, xAxis: xCat(X), yAxis: yVal('Fábricas', { minInterval: 1 }), series: fabSeries });
}

seccion({ id: 'operaciones', vista: 'panel', render: operaciones,
  init: () => { if (!st.fabreg) st.fabreg = 'T'; },
  controles: () => {
    segBtns('capreg', [['T', 'Total'], ['US', 'EE.UU.'], ['CN', 'China']], 'capreg', () => { controls(); operaciones(); });
    segBtns('fabreg', [['T', 'Total'], ['US', 'EE.UU.'], ['CN', 'China']], 'fabreg', () => { controls(); operaciones(); });
  } });

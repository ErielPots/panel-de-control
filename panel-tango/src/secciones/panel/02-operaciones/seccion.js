// Sección: Operaciones
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

function operaciones() {
  const X = yrs();
  set('c_dem', { ...base(), tooltip: { ...base().tooltip, ...tip(0, ' mil u') }, xAxis: xCat(X), yAxis: yVal('Miles de unidades'),
    series: [
      bar('Demanda', serie(d => demandaU(d, T)), C.avg, { itemStyle: { color: grad(C.avg, .55, .35), borderRadius: [5,5,0,0] } }),
      bar('Producción', serie(d => prodInt(d, T) + prodCon(d, T)), C.own),
      line('Demanda insatisfecha', serie(d => insatU(d, T)), C.bad, { symbolSize: 8, smooth: false }),
      line('Stock sobrante', serie(d => invU(d, T)), C.warn, { symbolSize: 9, symbol: 'diamond', smooth: false }),
    ] });
  const rg = st.capreg === 'T' ? null : st.capreg;
  const nom = serie(d => capNom(d, T, rg)), ef = serie(d => capEf(d, T, rg)), pi = serie(d => prodInt(d, T, rg));
  set('c_cap', { ...base(), tooltip: { ...base().tooltip, formatter: (ps) => { const i = ps[0].dataIndex; return `<b>${X[i]}</b><br>Capacidad máxima <b>${F(nom[i], 0)}</b><br>Capacidad efectiva <b>${F(ef[i], 0)}</b><br>Producción propia <b>${F(pi[i], 0)}</b><br>Utilización <b>${F(ef[i] ? pi[i] / ef[i] * 100 : null, 1)}%</b>`; } },
    xAxis: xCat(X), yAxis: yVal('Miles de unidades'),
    series: [
      bar('Capacidad máxima', nom, C.t3, { barGap: '-100%', barMaxWidth: 36, z: 1, itemStyle: { color: hexA(C.t3, .28), borderRadius: [5,5,0,0] } }),
      bar('Capacidad efectiva', ef, C.t3, { barGap: '-100%', barMaxWidth: 36, z: 2, itemStyle: { color: 'rgba(0,0,0,0)', borderColor: C.t2, borderWidth: 1.5, borderType: [4, 3], borderRadius: [5,5,0,0] } }),
      bar('Producción propia', pi, C.t1, { barGap: '-100%', barMaxWidth: 36, z: 3, label: { show: true, position: 'top', color: C.ink, fontSize: 10.5, fontWeight: 700, formatter: (p) => ef[p.dataIndex] ? F(p.value / ef[p.dataIndex] * 100, 0) + '%' : '' } }),
    ] });
  set('c_pc', { ...base(), tooltip: { ...base().tooltip, ...tip(0, ' mil u') }, xAxis: xCat(X), yAxis: yVal('Miles de unidades'),
    series: [flat('Propia', serie(d => prodInt(d, T)), C.t1, { stack: 'p' }), bar('Contratada', serie(d => prodCon(d, T)), C.t3, { stack: 'p' })] });
  const tecsInv = Object.keys(TEC).filter(t => RD.some(d => invTec(d, T, t) > 0));
  const cols = [C.t1, C.t3, C.t4, C.avg];
  set('c_inv', { ...base(), tooltip: { ...base().tooltip, ...tip(0, ' mil u') }, xAxis: xCat(X), yAxis: yVal('Miles de unidades'),
    series: tecsInv.map((t, i) => i === tecsInv.length - 1 ? bar(TEC[t], serie(d => invTec(d, T, t)), cols[i], { stack: 'i' }) : flat(TEC[t], serie(d => invTec(d, T, t)), cols[i], { stack: 'i' })) });
  const y = st.y, Xf = [...X, 'A' + (y + 1), 'A' + (y + 2)];
  const fab = (r) => [...serie(d => d.fab[r][T]), RD[y].fab1[r][T], RD[y].fab2[r][T]];
  const fu = fab('US'), fc = fab('CN');
  set('c_fab', { ...base(), tooltip: { ...base().tooltip, ...tip(0) }, xAxis: xCat(Xf), yAxis: yVal('Fábricas', { minInterval: 1 }),
    series: [
      flat('EE.UU.', fu.map((v, i) => ({ value: v, itemStyle: { opacity: i > y ? .4 : 1 } })), C.t1, { stack: 'f' }),
      bar('China', fc.map((v, i) => ({ value: v, itemStyle: { opacity: i > y ? .4 : 1 } })), C.t3, { stack: 'f', label: { show: true, position: 'top', color: C['ink-2'], fontSize: 10.5, fontWeight: 600, formatter: (p) => F(fu[p.dataIndex] + fc[p.dataIndex], 0) } }),
    ] });
}

seccion({ id: 'operaciones', vista: 'panel', render: operaciones,
  controles: () => segBtns('capreg', [['T', 'Total'], ['US', 'EE.UU.'], ['CN', 'China']], 'capreg', () => { controls(); operaciones(); }) });

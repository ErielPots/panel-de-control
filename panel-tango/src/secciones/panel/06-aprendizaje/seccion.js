// Sección: Aprendizaje
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

function aprendizaje() {
  const y = st.y, X = yrs(), d = RD[y];
  const idv = serie(dd => M(dd.id[T])), idp = serie(dd => dd.id[T] / dd.ing[T] * 100), ida = serie(dd => M(avg(dd.id)));
  set('c_id', { ...base(), tooltip: { ...base().tooltip, formatter: (ps) => { const i = ps[0].dataIndex; return `<b>${X[i]}</b><br>I+D TANGO <b>${F(idv[i], 0)} M USD</b> · ${F(idp[i], 1)}% de ingresos<br>Promedio mercado <b>${F(ida[i], 0)} M USD</b>`; } }, xAxis: xCat(X), yAxis: yVal('USD millones'),
    series: [bar('TANGO', idv, C.own, { label: { ...lblTop(1), formatter: (p) => F(idp[p.dataIndex], 1) + '%' } }), avgLine(ida)] });
  set('c_carac', { ...base({ grid: { right: 44 } }), tooltip: lineTT(tip(1)), xAxis: xCat(X), yAxis: yVal('Características', { min: 0 }),
    series: [line('TANGO', serie(dd => caracProm(dd, T)), C.own, { lineStyle: { width: 3, color: C.own }, areaStyle: areaGrad(C.own), endLabel: endLbl((p) => F(p.value, 1)) }), avgLine(serie(dd => avg(allK(k => caracProm(dd, k)))))] });
  bandChart('c_esg', (r, k) => RD[r].esg.total[k], { d: 2, yName: 'Puntos', yOpts: { scale: true, dec: 2 } });
  document.getElementById('h_esgb').textContent = `ESG por pilar año ${y}`;
  const pil = [['Ambiental', 'E'], ['Social', 'S'], ['Gobernanza', 'G'], ['Total', 'total']];
  set('c_esgb', { ...base(), tooltip: { ...base().tooltip, ...tip(2) }, xAxis: xCat(pil.map(p => p[0]), ''), yAxis: yVal('Puntos', { min: 0, max: 5, interval: 1 }),
    series: [bar('TANGO', pil.map(p => d.esg[p[1]][T]), C.tango, { label: lblTop(2) }), bar('Promedio mercado', pil.map(p => avg(d.esg[p[1]])), C.avg, { itemStyle: { color: grad(C.avg, .45, .3), borderRadius: [5,5,0,0] }, label: lblTop(2) })] });
  bandChart('c_efic', (r, k) => RD[r].efic_rrhh[k], { d: 3, yName: 'Multiplicador', yOpts: { scale: true, dec: 2 } });
  set('c_rot', { ...base(), tooltip: { ...base().tooltip, ...tip(2, '%') }, xAxis: xCat(X), yAxis: yVal('%', { dec: 1 }),
    series: [bar('TANGO', serie(dd => dd.rotacion[T]), C.own, { label: lblTop(1) }), avgLine(serie(dd => avg(dd.rotacion)))] });
  set('c_sal', { ...base(), tooltip: { ...base().tooltip, ...tip(0, ' USD') }, xAxis: xCat(X), yAxis: yVal('USD por mes'),
    series: [bar('Salario', serie(dd => dd.salario[T]), C.t1), bar('Capacitación', serie(dd => dd.capacit[T]), C.t3),
      avgLine(serie(dd => avg(dd.salario)), 'Salario promedio mercado'), line('Capacitación promedio mercado', serie(dd => avg(dd.capacit)), C.avg, { lineStyle: { width: 1.5, type: [2, 3], color: C.avg }, symbol: 'none' })] });
  set('c_pers', { ...base(), tooltip: { ...base().tooltip, ...tip(0) }, xAxis: xCat(X), yAxis: yVal('Personas', { min: 0 }),
    series: [bar('TANGO', serie(dd => dd.personal_id[T]), C.own, { label: lblTop(0) }), avgLine(serie(dd => avg(dd.personal_id)))] });
}

seccion({ id: 'aprendizaje', vista: 'panel', render: aprendizaje });

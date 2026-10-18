// Sección: Principales
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

function principales() {
  const y = st.y, d = RD[y], X = yrs();
  set('c_ing', { ...base(), tooltip: { ...base().tooltip, ...tip(2, ' mil M') }, xAxis: xCat(X), yAxis: yVal('USD miles de M'),
    series: [bar('TANGO', serie(d => MM(d.ing[T])), C.own, { label: lblTop(1) }), avgLine(serie(d => MM(avg(d.ing))))] });
  set('c_bn', { ...base(), tooltip: { ...base().tooltip, ...tip(2, ' mil M') }, xAxis: xCat(X), yAxis: yVal('USD miles de M'),
    series: [bar('TANGO', serie(d => { const v = MM(d.bn[T]); return v < 0 ? { value: v, itemStyle: { color: C.bad, borderRadius: [0, 0, 5, 5] } } : v; }), C.own, { label: lblTop(1) }), avgLine(serie(d => MM(avg(d.bn))))] });
  const ml = (n, key, c, w) => line(n, serie(d => d[key][T]), c, { lineStyle: { width: w, color: c }, endLabel: endLbl((p) => F(p.value, 1) + '%') });
  set('c_marg', { ...base({ grid: { right: 52 } }), tooltip: lineTT(tip(1, '%')), xAxis: xCat(X), yAxis: yVal('%'),
    series: [ml('Bruto', 'mb', C.t3, 2), ml('Operativo', 'mo', C.t2, 2), { ...ml('Neto', 'ros', C.t1, 3), areaStyle: areaGrad(C.t2) }] });

  // market share anual: sólo la evolución de TANGO contra el promedio del mercado
  set('c_ms', { ...base({ grid: { right: 52 } }), tooltip: lineTT(tip(1, '%')), xAxis: xCat(X), yAxis: yVal('%', { min: 0 }),
    series: [line('TANGO', serie(dd => dd.ms[T]), C.own, { lineStyle: { width: 3, color: C.own }, symbolSize: 8, areaStyle: areaGrad(C.own), z: 4,
      label: { show: true, position: 'top', color: C.ink, fontSize: 11, fontWeight: 700, formatter: (p) => F(p.value, 1) } }),
      avgLine(serie(dd => avg(dd.ms)))] });
  document.getElementById('h_mspie').textContent = `Market share año ${y}`;
  const order = E.map((e, k) => k).sort((a, b) => d.ms[b] - d.ms[a]);
  set('c_mspie', pie(order.map(k => ({ name: E[k], value: d.ms[k] })), order.map(k => C.emp[E[k]]), 1, '%'));
  document.getElementById('h_reg').textContent = `Ingresos por región año ${y}`;
  set('c_reg', pie(['US','CN','EU'].map(r => ({ name: REG[r], value: MM(d.ing_reg[r][T]) })), [C.t1, C.t2, C.t3], 2, ' mil M'));
  document.getElementById('h_tec').textContent = `Ingresos por tecnología año ${y}`;
  const tecs = Object.keys(TEC).filter(t => d.ing_tec[t][T] > 0);
  set('c_tec', pie(tecs.map(t => ({ name: TEC[t], value: MM(d.ing_tec[t][T]) })), [C.t1, C.t3, C.t4, C.avg], 2, ' mil M'));
}

seccion({ id: 'principales', vista: 'panel', render: principales });

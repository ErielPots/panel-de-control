// Sección: Accionista
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

function accionista() {
  const y = st.y, X = yrs(), d = RD[y];
  const pr = serie(dd => dd.precio[T]), dv = serie((dd, r) => divCap(r, T)), ts = serie(dd => dd.tsr[T]);
  set('c_tsr', { ...base(), tooltip: { ...base().tooltip, formatter: (ps) => { const i = ps[0].dataIndex; return `<b>${X[i]}</b><br>${dot(C.t1)}Precio de la acción <b>${F(pr[i], 2)} USD</b><br>${dot(C.t3)}Dividendos capitalizados <b>${F(dv[i], 2)} USD</b><br>TSR anualizado <b>${F(ts[i], 1)}%</b>`; } },
    xAxis: xCat(X), yAxis: yVal('USD por acción'),
    series: [
      flat('Precio de la acción', pr, C.t1, { stack: 's', barMaxWidth: 40 }),
      bar('Dividendos capitalizados', dv, C.t3, { stack: 's', barMaxWidth: 40, label: { show: true, position: 'top', color: C.ink, fontSize: 12, fontWeight: 800, formatter: (p) => p.dataIndex === 0 ? '' : F(ts[p.dataIndex], 1) + '%' } }),
    ] });
  document.getElementById('h_tsrk').textContent = `TSR anualizado año ${y}`;
  const ord = E.map((_, k) => k).sort((a, b) => d.tsr[b] - d.tsr[a]);
  set('c_tsrk', { ...anim, textStyle: { ...font, color: C['ink-2'] }, grid: { left: 8, right: 56, top: 8, bottom: 4, containLabel: true }, tooltip: { trigger: 'item', ...ttBox(), formatter: (p) => `${p.name}<br><b>${F(p.value, 2)}%</b>` },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted, fontSize: 11, formatter: v => F(v, 0) + '%' } },
    yAxis: { type: 'category', inverse: true, data: ord.map(k => E[k]), axisLine: { lineStyle: { color: C.axis } }, axisTick: { show: false }, axisLabel: { color: C.ink, fontSize: 12, fontWeight: 600 } },
    series: [{ type: 'bar', name: 'TSR', barMaxWidth: 24, animationDelay: delay,
      data: ord.map((k) => ({ value: d.tsr[k], itemStyle: { color: k === T ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: hexA(C.tango, .7) }, { offset: 1, color: C.tango }]) : hexA(C.avg, .35), borderRadius: [0, 5, 5, 0] } })),
      label: { show: true, position: 'right', color: C.ink, fontSize: 12, fontWeight: 700, formatter: (p) => F(p.value, 1) + '%' } }] });
  set('c_divrec', { ...base(), tooltip: { ...base().tooltip, ...tip(2, ' mil M') }, xAxis: xCat(X), yAxis: yVal('USD miles de M'),
    series: [bar('Dividendos', serie(dd => MM(dd.div[T])), C.t1), bar('Recompra', serie(dd => MM(Math.max(0, dd.recompra[T]))), C.t3)] });
  set('c_acc', { ...base(), legend: { show: false }, tooltip: { ...base().tooltip, ...tip(0, ' M') }, xAxis: xCat(X), yAxis: yVal('Millones de acciones', { min: 0 }),
    series: [bar('Acciones en circulación', serie(dd => dd.acciones[T] / 1000), C.own, { label: lblTop(0) })] });
  set('c_eps', { ...base(), tooltip: { ...base().tooltip, ...tip(2, ' USD') }, xAxis: xCat(X), yAxis: yVal('USD por acción', { dec: 1 }),
    series: [bar('TANGO', serie(dd => dd.eps[T] < 0 ? { value: dd.eps[T], itemStyle: { color: C.bad, borderRadius: [0, 0, 5, 5] } } : dd.eps[T]), C.own, { label: lblTop(2) }), avgLine(serie(dd => avg(dd.eps)))] });
  bandChart('c_cap_m', (r, k) => MM(RD[r].cap[k]), { d: 1, yName: 'USD miles de M' });
  const rl = (n, f, c, sym, w, dash) => line(n, serie((dd, r) => f(r)), c, { symbol: sym, lineStyle: { width: w, color: c, type: dash || 'solid' }, endLabel: endLbl((p) => n + ' ' + F(p.value, 1)), labelLayout: { moveOverlap: 'shiftY' } });
  set('c_rent', { ...base({ grid: { right: 86 } }), tooltip: lineTT(tip(1, '%')), xAxis: xCat(X), yAxis: yVal('%'),
    series: [rl('ROA', r => roa(r, T), C.t3, 'triangle', 2, [5, 3]), { ...rl('ROE', r => RD[r].roe[T], C.t1, 'circle', 3), areaStyle: areaGrad(C.t2) }, rl('ROS', r => RD[r].ros[T], C.t2, 'rect', 2), rl('ROCE', r => RD[r].roce[T], C.t1, 'diamond', 2, [2, 3])] });
  document.getElementById('h_rentb').textContent = `Rentabilidad contra el mercado año ${y}`;
  const keys = [['ROA', k => roa(y, k)], ['ROE', k => d.roe[k]], ['ROS', k => d.ros[k]], ['ROCE', k => d.roce[k]], ['Margen bruto', k => d.mb[k]], ['Margen operativo', k => d.mo[k]]];
  set('c_rentb', { ...base(), tooltip: { ...base().tooltip, ...tip(1, '%') }, xAxis: xCat(keys.map(o => o[0]), ''), yAxis: yVal('%'),
    series: [
      bar('TANGO', keys.map(o => o[1](T)), C.tango, { label: lblTop(1) }),
      bar('Promedio mercado', keys.map(o => avg(allK(o[1]))), C.avg, { itemStyle: { color: grad(C.avg, .4, .28), borderRadius: [5,5,0,0] }, label: lblTop(1) }),
      bar('Mejor del mercado', keys.map(o => Math.max(...allK(o[1]))), C.avg, { itemStyle: { color: grad(C.avg, .75, .55), borderRadius: [5,5,0,0] }, label: lblTop(1) }),
    ] });
}

seccion({ id: 'accionista', vista: 'panel', render: accionista });

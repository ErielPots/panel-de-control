// Sección: Financiamiento
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

function financiamiento() {
  const y = st.y, X = yrs(), d = RD[y];
  set('c_estr', { ...base(), tooltip: { ...base().tooltip, ...tip(2, ' mil M') }, xAxis: xCat(X), yAxis: yVal('USD miles de M'),
    series: [
      flat('Patrimonio neto', serie(dd => MM(dd.pn[T])), C.t1, { stack: 'e' }),
      flat('Deuda largo plazo', serie(dd => MM(dd.dlp[T])), C.t3, { stack: 'e' }),
      flat('Deuda corto plazo', serie(dd => MM(dd.dcp[T])), C.bad, { stack: 'e' }),
      bar('Cuentas por pagar', serie(dd => MM(dd.cxp[T])), C.t4, { stack: 'e' }),
    ] });
  const dcpReg = (r) => serie(dd => M(dd.dcp_reg[r][T]));
  const tot = serie(dd => M(sum(['US','CN','EU'].map(r => dd.dcp_reg[r][T]))));
  set('c_dcp', { ...base(), tooltip: { ...base().tooltip, ...tip(0, ' M') }, xAxis: xCat(X), yAxis: yVal('USD millones'),
    series: [
      flat('EE.UU.', dcpReg('US'), C.red1, { stack: 'd' }),
      flat('China', dcpReg('CN'), C.red2, { stack: 'd' }),
      bar('Europa', dcpReg('EU'), C.red3, { stack: 'd', label: { show: true, position: 'top', color: C.ink, fontSize: 11, fontWeight: 700, formatter: (p) => tot[p.dataIndex] > 0 ? F(tot[p.dataIndex], 0) : '' } }),
    ] });
  set('c_dlp', { ...base(), tooltip: { ...base().tooltip, ...tip(2, ' mil M') }, xAxis: xCat(X), yAxis: yVal('USD miles de M'),
    series: [bar('TANGO', serie(dd => MM(dd.dlp[T])), C.own, { label: lblTop(1) }), avgLine(serie(dd => MM(avg(dd.dlp))))] });
  set('c_dnpn', { ...base(), tooltip: { ...base().tooltip, ...tip(1, '%') }, xAxis: xCat(X), yAxis: yVal('%'),
    series: [bar('TANGO', serie(dd => ({ value: dd.dn_pn[T], itemStyle: { borderRadius: dd.dn_pn[T] < 0 ? [0, 0, 5, 5] : [5, 5, 0, 0] } })), C.own, { label: { show: true, position: 'outside', color: C['ink-2'], fontSize: 10.5, fontWeight: 600, formatter: (p) => F(p.value, 0) } }), avgLine(serie(dd => avg(dd.dn_pn)))] });
  document.getElementById('h_caja').textContent = `Caja al cierre por región año ${y}`;
  const cj = ['US','CN','EU'].map(r => M(d.caja_reg[r][T]));
  set('c_caja', { ...anim, textStyle: { ...font, color: C['ink-2'] }, grid: { left: 8, right: 56, top: 20, bottom: 30, containLabel: true }, tooltip: { trigger: 'item', ...ttBox(), formatter: (p) => `${p.name}<br><b>${F(p.data.real, 0)} M USD</b>` },
    xAxis: { type: 'log', logBase: 10, min: 1, name: 'USD millones (escala log.)', nameLocation: 'middle', nameGap: 26, nameTextStyle: { color: C.muted, fontSize: 11 }, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted, fontSize: 11, formatter: v => v <= 1 ? '' : F(v, 0) } },
    yAxis: { type: 'category', data: ['EE.UU.', 'China', 'Europa'], inverse: true, axisLine: { lineStyle: { color: C.axis } }, axisTick: { show: false }, axisLabel: { color: C.ink, fontSize: 12, fontWeight: 600 } },
    series: [{ type: 'bar', name: 'Caja', data: cj.map(v => ({ value: Math.max(v, 1), real: v, itemStyle: { color: v <= 2.0001 ? C.bad : C.own } })), barMaxWidth: 24, itemStyle: { borderRadius: [0, 5, 5, 0] }, animationDelay: delay,
      label: { show: true, position: 'right', color: C.ink, fontSize: 12, fontWeight: 700, formatter: (p) => F(p.data.real, 0) },
      markLine: { symbol: 'none', silent: true, lineStyle: { color: C.bad, type: [4, 3], width: 1.5 }, label: { formatter: 'Piso 2', color: C.bad, fontSize: 10, position: 'insideEndTop' }, data: [{ xAxis: 2 }] } }] });
}

seccion({ id: 'financiamiento', vista: 'panel', render: financiamiento });

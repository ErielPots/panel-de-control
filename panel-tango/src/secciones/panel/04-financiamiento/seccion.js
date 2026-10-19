// Sección: Financiamiento
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

function financiamiento() {
  const y = st.y, X = yrs(), d = RD[y];
  // estructura de financiamiento: grilla numérica en USD millones y % del total
  const filas = [
    ['Patrimonio neto', dd => dd.pn[T]],
    ['Deuda a largo plazo', dd => dd.dlp[T]],
    ['Deuda a corto plazo no planificada', dd => dd.dcp[T]],
    ['Cuentas por pagar', dd => dd.cxp[T]],
  ];
  const totF = (dd) => dd.pn[T] + dd.dlp[T] + dd.dcp[T] + dd.cxp[T];
  const celdas = (fn, fmt, neg) => X.map((_, r) => { const v = fn(RD[r]); return `<td class="${neg && v > 0.5 ? 'neg ' : ''}${r === y ? 'hl' : ''}">${fmt(v)}</td>`; }).join('');
  const usd = (v) => F(M(v), 0), pct = (v) => F(v, 1) + '%';
  document.getElementById('t_estr').innerHTML = `<table class="ec"><thead><tr><th>USD millones</th>${X.map((x, i) => `<th class="${i === y ? 'hl' : ''}">${x}</th>`).join('')}</tr></thead><tbody>`
    + filas.map(([n, fn], i) => `<tr><td>${n}</td>${celdas(fn, usd, i === 2)}</tr>`).join('')
    + `<tr class="tot"><td>Total financiamiento</td>${celdas(totF, usd)}</tr>`
    + `<tr class="grp"><td>% del total</td>${X.map(() => '<td></td>').join('')}</tr>`
    + `<tr><td>Patrimonio neto</td>${celdas(dd => dd.pn[T] / totF(dd) * 100, pct)}</tr>`
    + `<tr><td>Deuda (largo + corto plazo)</td>${celdas(dd => (dd.dlp[T] + dd.dcp[T]) / totF(dd) * 100, pct)}</tr>`
    + `<tr><td>Cuentas por pagar</td>${celdas(dd => dd.cxp[T] / totF(dd) * 100, pct)}</tr>`
    + `</tbody></table>`;
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
  // caja de cada filial antes de que el simulador la cubra con deuda de corto plazo, año por año
  const regs = ['US', 'CN', 'EU'], nombres = ['EE.UU.', 'China', 'Europa'], colores = [C.t1, C.t3, C.t4];
  const cierre = regs.map(r => serie(dd => M(dd.caja_reg[r][T]))), deuda = regs.map(r => serie(dd => M(dd.dcp_reg[r][T])));
  const antes = cierre.map((c, j) => c.map((v, i) => v - deuda[j][i]));
  set('c_caja', { ...base(),
    tooltip: { ...base().tooltip, formatter: (ps) => { const i = ps[0].dataIndex; return `<b>${X[i]}</b><br>` + regs.map((_, j) =>
      `${dot(antes[j][i] < 0 ? C.bad : colores[j])}${nombres[j]} <b>${F(antes[j][i], 0)} M</b> <span style="color:${C.muted}">(caja ${F(cierre[j][i], 0)} − deuda CP ${F(deuda[j][i], 0)})</span>`).join('<br>'); } },
    legend: { ...base().legend, data: nombres },
    xAxis: xCat(X), yAxis: yVal('USD millones'),
    series: regs.map((_, j) => bar(nombres[j], antes[j].map(v => ({ value: v, itemStyle: { color: v < 0 ? C.bad : colores[j], borderRadius: v < 0 ? [0, 0, 5, 5] : [5, 5, 0, 0] } })), colores[j], { barMaxWidth: 16 })) });
}

seccion({ id: 'financiamiento', vista: 'panel', render: financiamiento });

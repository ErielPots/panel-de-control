// Sección: Accionista
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

const TASA_DIV = 0.10;   // el simulador reinvierte los dividendos al 10% anual

// TANGO en naranja y grueso; cada rival en gris fino con su nombre al final de la línea
function lineasCompetencia(id, valFn, { d = 1, unit = '', yName = '', yOpts = {}, right = 104 } = {}) {
  const X = yrs();
  set(id, { ...base({ grid: { right, top: 30 } }), legend: { show: false },
    tooltip: lineTT({ order: 'valueDesc', valueFormatter: (v) => v == null ? '–' : F(v, d) + unit }),
    xAxis: { ...xCat(X, ''), boundaryGap: false }, yAxis: yVal(yName, yOpts),
    series: E.map((e, k) => {
      const yo = k === T;
      return { type: 'line', name: e, data: X.map((_, r) => valFn(r, k)), z: yo ? 10 : 2, smooth: false,
        symbol: 'circle', symbolSize: yo ? 7 : 0, showSymbol: yo,
        lineStyle: { width: yo ? 3 : 1.4, color: yo ? C.tango : C.avg, opacity: yo ? 1 : .55 },
        itemStyle: { color: yo ? C.tango : C.avg, borderColor: C.card, borderWidth: 1.5 },
        emphasis: { focus: 'series', lineStyle: { width: yo ? 3.5 : 2.4, opacity: 1 } },
        endLabel: { show: true, distance: 6, fontSize: 11, fontWeight: yo ? 800 : 500, color: yo ? C.tango : C.muted, formatter: (p) => `${e} ${F(p.value, d)}${unit}` },
        labelLayout: { moveOverlap: 'shiftY' }, animationDelay: () => (yo ? 0 : 120) };
    }) });
}

// Dividendo por acción pagado en el año r (USD), con el dato real del flujo de casa matriz
const divAccion = (r, k) => r < 1 || !RD[r].acciones[k] ? 0 : RD[r].div[k] / RD[r].acciones[k];
// Dividendos de los años 1..y capitalizados al 10% hasta el año y
const divCapitalizados = (y, k) => { let s = 0; for (let i = 1; i <= y; i++) s += divAccion(i, k) * Math.pow(1 + TASA_DIV, y - i); return s; };

function accionista() {
  const y = st.y, X = yrs(), d = RD[y];

  // retorno total acumulado desde el año 0: (1 + TSR anualizado)^años − 1
  lineasCompetencia('c_tsr', (r, k) => r === 0 ? 0 : (Math.pow(1 + RD[r].tsr[k] / 100, r) - 1) * 100, { d: 0, unit: '%', yName: '%' });

  // primer componente: precio por acción
  lineasCompetencia('c_precio_acc', (r, k) => RD[r].precio[k], { d: 0, yName: 'USD por acción', yOpts: { scale: true }, right: 96 });

  // segundo componente: dividendos por acción capitalizados al 10%, una fila por empresa apilada por año
  document.getElementById('h_divcap').textContent = `Dividendos capitalizados por acción año ${y}`;
  const orden = E.map((_, k) => k).sort((a, b) => divCapitalizados(y, a) - divCapitalizados(y, b));
  const anios = Array.from({ length: y }, (_, i) => i + 1);
  const grises = [.30, .42, .54, .66, .78, .9];
  const seriesDiv = anios.map((a, i) => ({ type: 'bar', name: 'A' + a, stack: 'd', barWidth: '56%',
    data: orden.map(k => {
      const v = divAccion(a, k) * Math.pow(1 + TASA_DIV, y - a);
      return { value: v, itemStyle: { color: k === T ? hexA(C.tango, .45 + .55 * (i + 1) / anios.length) : hexA(C.avg, grises[i % grises.length] * .6) } };
    }),
    itemStyle: { borderColor: C.card, borderWidth: 1 }, animationDelay: (j) => j * 60 + i * 40 }));
  if (seriesDiv.length) {
    const ult = seriesDiv[seriesDiv.length - 1];
    ult.label = { show: true, position: 'right', distance: 8, fontSize: 11, formatter: (p) => F(divCapitalizados(y, orden[p.dataIndex]), 2) };
    ult.data = ult.data.map((o, j) => ({ ...o, label: { color: orden[j] === T ? C.tango : C.muted, fontWeight: orden[j] === T ? 800 : 500 } }));
  }
  set('c_divcap', { ...anim, textStyle: { ...font, color: C['ink-2'] }, grid: { left: 8, right: 56, top: 12, bottom: 30, containLabel: true },
    tooltip: { trigger: 'axis', ...ttBox(), axisPointer: { type: 'shadow', shadowStyle: { color: hexA(C.tango, .06) } },
      formatter: (ps) => { const k = orden[ps[0].dataIndex]; return `<b>${E[k]}</b><br>` + anios.map(a => `A${a}: ${F(divAccion(a, k), 2)} → ${F(divAccion(a, k) * Math.pow(1 + TASA_DIV, y - a), 2)} USD`).join('<br>') + `<br><b>Total ${F(divCapitalizados(y, k), 2)} USD por acción</b>`; } },
    xAxis: { type: 'value', name: 'USD por acción', nameLocation: 'middle', nameGap: 26, nameTextStyle: { color: C.muted, fontSize: 11 }, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted, fontSize: 11, formatter: (v) => F(v, 1) } },
    yAxis: { type: 'category', data: orden.map(k => E[k]), axisLine: { lineStyle: { color: C.axis } }, axisTick: { show: false },
      axisLabel: { fontSize: 12, fontWeight: 600, color: (v) => v === 'TANGO' ? C.tango : C['ink-2'] } },
    series: seriesDiv });

  // acciones en circulación de cada grupo
  lineasCompetencia('c_acc', (r, k) => RD[r].acciones[k] / 1000, { d: 0, yName: 'Millones de acciones', yOpts: { scale: true }, right: 100 });

  set('c_eps', { ...base(), tooltip: { ...base().tooltip, ...tip(2, ' USD') }, xAxis: xCat(X), yAxis: yVal('USD por acción', { dec: 1 }),
    series: [bar('TANGO', serie(dd => dd.eps[T] < 0 ? { value: dd.eps[T], itemStyle: { color: C.bad, borderRadius: [0, 0, 5, 5] } } : dd.eps[T]), C.own, { label: lblTop(2) }), avgLine(serie(dd => avg(dd.eps)))] });
  bandChart('c_cap_m', (r, k) => MM(RD[r].cap[k]), { d: 1, yName: 'USD miles de M' });
  const rl = (n, f, c, sym, w, dash) => line(n, serie((dd, r) => f(r)), c, { symbol: sym, lineStyle: { width: w, color: c, type: dash || 'solid' }, endLabel: endLbl((p) => n + ' ' + F(p.value, 1)), labelLayout: { moveOverlap: 'shiftY' } });
  set('c_rent', { ...base({ grid: { right: 86 } }), tooltip: lineTT(tip(1, '%')), xAxis: xCat(X), yAxis: yVal('%'),
    series: [rl('ROA', r => roa(r, T), C.t3, 'triangle', 2, [5, 3]), { ...rl('ROE', r => RD[r].roe[T], C.t1, 'circle', 3), areaStyle: areaGrad(C.t2) }, rl('ROS', r => RD[r].ros[T], C.t2, 'rect', 2), rl('ROCE', r => RD[r].roce[T], C.t1, 'diamond', 2, [2, 3])] });
}

seccion({ id: 'accionista', vista: 'panel', render: accionista });

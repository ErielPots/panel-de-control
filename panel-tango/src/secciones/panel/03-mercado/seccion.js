// Sección: Mercado y competencia
// Gráficos y títulos de esta sección. El HTML de las tarjetas está en seccion.html.

function segOk(rg, t) { return RD.some(d => d.seg[rg][t].precio.some(v => v)); }
function mercado() {
  const y = st.y, X = yrs(), d = RD[y], rg = st.reg, t = st.tec, cur = MON[rg];
  document.getElementById('h_precio').textContent = `Precio de venta · ${REG[rg]} · ${TEC[t]}`;
  bandChart('c_precio', (r, k) => RD[r].seg[rg][t].precio[k] || null, { d: 0, yName: cur, yOpts: { scale: true } });

  // posicionamiento: precio por empresa, tamaño = ventas, rótulo = precio y características
  document.getElementById('h_pc').textContent = `Posicionamiento año ${y} · ${REG[rg]} · ${TEC[t]}`;
  const s = d.seg[rg][t];
  const pts = E.map((e, k) => ({ e, k, c: s.carac[k], p: s.precio[k], v: s.ventas[k] })).filter(o => o.p).sort((a, b) => b.p - a.p);
  const maxV = Math.max(1, ...pts.map(o => o.v || 0));
  const av = avg(pts.map(o => o.p));
  set('c_pcar', { ...anim, textStyle: { ...font, color: C['ink-2'] },
    grid: { left: 8, right: 118, top: 30, bottom: 30, containLabel: true },
    tooltip: { trigger: 'item', ...ttBox(), formatter: (p) => `${dot(C.emp[p.data.e])}<b>${p.data.e}</b><br>Precio ${F(p.value[0], 0)} ${cur}<br>Características ${F(p.data.c, 0)}<br>Ventas ${F(p.data.v, 1)} mil u` },
    xAxis: { type: 'value', name: cur + ' (miles)', nameLocation: 'middle', nameGap: 26, nameTextStyle: { color: C.muted, fontSize: 11 }, scale: true, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted, fontSize: 11, formatter: v => F(v / 1000, 0) } },
    yAxis: { type: 'category', inverse: true, data: pts.map(o => o.e), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: C.ink, fontSize: 12, fontWeight: 600 } },
    series: [{ type: 'scatter', data: pts.map(o => ({ value: [o.p, o.e], e: o.e, c: o.c, v: o.v, symbolSize: 12 + 30 * Math.sqrt((o.v || 0) / maxV), itemStyle: { color: C.emp[o.e], opacity: o.k === T ? 1 : .8, borderColor: o.k === T ? C.ink : C.card, borderWidth: o.k === T ? 2 : 1.5 } })),
      label: { show: true, position: 'right', distance: 20, color: C['ink-2'], fontSize: 11, formatter: (p) => `${F(p.value[0], 0)} · ${F(p.data.c, 0)} car.` },
      markLine: { symbol: 'none', silent: true, lineStyle: { color: C.avg, type: [5, 4] }, label: { formatter: 'Prom.', color: C.muted, fontSize: 10, position: 'start', distance: 4 }, data: [{ xAxis: av }] },
      animationDelay: delay }] });

  document.getElementById('h_msseg').textContent = `Market share por segmento año ${y}`;
  const segs = [];
  for (const r of ['US','CN','EU']) for (const tt of Object.keys(TEC)) { const m = d.seg[r][tt].ms; if (m.filter(v => v > 0).length >= 2) segs.push({ r, tt, m }); }
  set('c_msseg', { ...base(), tooltip: { ...base().tooltip, ...tip(1, '%') },
    xAxis: { ...xCat(segs.map(o => REG[o.r] + '\n' + TEC[o.tt]), ''), axisLabel: { color: C.muted, fontSize: 10, interval: 0 } }, yAxis: yVal('%'),
    series: [
      bar('TANGO', segs.map(o => o.m[T]), C.tango, { label: lblTop(1) }),
      bar('Líder', segs.map(o => Math.max(...o.m)), C.avg, { itemStyle: { color: grad(C.avg, .55, .4), borderRadius: [5,5,0,0] } }),
      line('Promedio', segs.map(o => avg(o.m.filter(v => v > 0))), C.ink, { symbol: 'rect', symbolSize: [20, 2.5], lineStyle: { opacity: 0 }, itemStyle: { color: C.ink }, smooth: false }),
    ] });
  set('c_costo', { ...base(), tooltip: lineTT(tip(0, ' USD')), xAxis: xCat(X), yAxis: yVal('USD por unidad', { scale: true }),
    series: [
      line('Precio medio TANGO', serie(dd => precioMedio(dd, T)), C.t2, { lineStyle: { width: 3, color: C.t2 }, areaStyle: areaGrad(C.t2) }),
      line('Costo TANGO', serie(dd => costoU(dd, T)), C.t1, { lineStyle: { width: 3, color: C.t1 }, symbol: 'rect' }),
      avgLine(serie(dd => avg(allK(k => precioMedio(dd, k)))), 'Precio medio mercado'),
      line('Costo mercado', serie(dd => avg(allK(k => costoU(dd, k)))), C.avg, { lineStyle: { width: 1.5, type: [2, 3], color: C.avg }, symbol: 'none' }),
    ] });
}

function fixTec() { if (!segOk(st.reg, st.tec)) st.tec = Object.keys(TEC).find(t => segOk(st.reg, t)); }
seccion({ id: 'mercado', vista: 'panel', render: mercado, init: fixTec,
  controles: () => {
    segBtns('f_reg', ['US','CN','EU'].map(r => [r, REG[r]]), 'reg', () => { fixTec(); controls(); mercado(); });
    segBtns('f_tec', Object.keys(TEC).filter(t => ['US','CN','EU'].some(r => segOk(r, t))).map(t => [t, TEC[t], !segOk(st.reg, t)]), 'tec', () => { controls(); mercado(); });
  } });

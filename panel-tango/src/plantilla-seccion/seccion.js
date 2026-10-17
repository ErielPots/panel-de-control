// Sección: Nombre de la sección
// Copiá esta carpeta a src/secciones/panel/07-nombre/ y cambiá "nueva" por el id de tu sección.

function nueva() {
  const X = yrs();
  // Gráfico sólo de TANGO: azul (C.own) contra la línea de promedio del mercado
  set('c_nueva_a', { ...base(), tooltip: { ...base().tooltip, ...tip(1, ' mil M') }, xAxis: xCat(X), yAxis: yVal('USD miles de M'),
    series: [bar('TANGO', serie(d => MM(d.ing[T])), C.own, { label: lblTop(1) }), avgLine(serie(d => MM(avg(d.ing))))] });
  // TANGO contra la competencia: naranja (C.tango) sobre el rango del mercado
  bandChart('c_nueva_b', (r, k) => RD[r].ms[k], { d: 1, yName: '%' });
}

seccion({ id: 'nueva', vista: 'panel', render: nueva });

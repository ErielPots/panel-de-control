// Sección: Estado de situación patrimonial (solapa Estados contables)

const BAL_ROWS = [
  ['#', 'Activo'],
  ['af', 'Activo fijo'], ['inv', 'Inventario'], ['cxc', 'Cuentas por cobrar'], ['caja', 'Caja y equivalentes'],
  ['at', 'Activo total', 'sub'],
  ['#', 'Patrimonio neto'],
  ['cs', 'Capital social'], ['cad', 'Capital adicional'], ['br', 'Beneficio del año'], ['ga', 'Ganancias acumuladas'],
  ['pn', 'Total patrimonio neto', 'sub'],
  ['#', 'Pasivo'],
  ['dlp', 'Deuda a largo plazo'], ['dcp', 'Deuda a corto plazo no planificada'], ['cxp', 'Cuentas por pagar'],
  ['pt', 'Total pasivo', 'sub'],
  ['tot', 'Patrimonio neto y pasivo', 'tot'],
];

function balance() {
  document.getElementById('h_baltab').textContent = `Balance al cierre · ${E[st.emp]}`;
  document.getElementById('t_bal').innerHTML = tabla(BAL_ROWS, (r, key, kk) => RD[r].bal[key][kk], ['tot', 'activo total']);
}

seccion({ id: 'bal', vista: 'estados', render: balance });

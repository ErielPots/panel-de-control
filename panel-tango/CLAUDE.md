# Instrucciones para Claude en este repositorio

Este repositorio arma el panel de control del equipo TANGO en el simulador automotriz (seis empresas: NOVA, RADAR, SEVEN, TANGO, TCENA, NEXO). Lo editan varias personas del equipo a la vez, cada una desde su Claude.

## Antes de editar

- Hacer `git pull` antes de tocar nada.
- Cambiar sólo la carpeta de la sección que pidió la persona (`src/secciones/<vista>/<NN-nombre>/`). Si el cambio exige tocar `src/nucleo/`, decirlo antes de hacerlo: afecta a todas las secciones y a lo que están editando los demás.
- No editar `dist/`: se genera con `python build.py`.
- Después de cada cambio, correr `python build.py` y confirmar que termina con "Listo".

## Cómo funciona una sección

- `seccion.html` empieza con `<section id="..." data-nav="Nombre corto">`. Cada gráfico es una tarjeta `<div class="card sN"><h3>Indicador</h3><div class="ch" id="c_..."></div></div>`. Los id de gráfico no se pueden repetir entre secciones (build.py lo controla).
- `seccion.js` define la función que dibuja y la registra al final con `seccion({ id, vista: 'panel' | 'estados', render, controles?, init? })`.
- Funciones del núcleo para usar: `set(id, opciones)`, `base()`, `xCat()`, `yVal()`, `bar()`, `flat()`, `line()`, `avgLine()`, `lblTop()`, `tip()`, `bandChart()`, `pie()`, `serie()`, `avg()`, `allK()`, `MM()` (miles USD → miles de M), `M()` (miles USD → M), `segBtns()` para botones.
- Datos: `RD[ronda]` con los indicadores de las seis empresas (índice `T` = TANGO), `st.y` es el año elegido. Los campos salen de `extraer_panel.py`; para un indicador nuevo del informe, agregar la fila ahí.

## Reglas de diseño (pedidas por el equipo)

- Sólo gráficos, números y ratios. El título de cada tarjeta es el nombre del indicador, no una pregunta ni una explicación. Los ejes llevan su unidad. Sin párrafos ni notas.
- Uno o dos gráficos por fila (`s12`, o `s6`+`s6`, o `s7`+`s5`); dos en la misma fila sólo si se complementan.
- Color `C.own` (azul) para gráficos que muestran sólo a TANGO. Color `C.tango` (naranja) para TANGO frente a la competencia.
- Colores de equipos fijos (`C.emp`): NOVA verde, RADAR rojo, SEVEN celeste, TANGO naranja, TCENA gris, NEXO marrón. El promedio y el rango del mercado van en gris azulado (`C.avg`, `C.band`).
- Rojo (`C.bad`) sólo para lo negativo: pérdidas, deuda no planificada, caja bajo el piso.
- Cuando un gráfico muestra a cada grupo por separado (retorno acumulado, precio por acción, dividendos, acciones en circulación), cada uno va en el color de su equipo y TANGO más grueso. Para indicadores donde las seis líneas se cruzan mucho, preferir `bandChart` (TANGO sobre el rango del mercado).
- Las barras empiezan en cero.

## Convenciones de cálculo

- El TSR del simulador es anualizado desde el año 0; los dividendos capitalizados se despejan del TSR informado.
- La referencia del mercado es el promedio de las seis empresas.
- Los importes del informe vienen en miles de USD.
- La utilización de planta es producción propia ÷ capacidad instalada, y la capacidad instalada es fábricas × 200 mil (EE.UU.) o 250 mil (China). En los años con mejoras de proceso da menos que la "capacidad empleada" del simulador, que se calcula sobre la capacidad ya recortada.
- Demanda y producción: demanda + stock sobrante = producción + stock inicial + demanda insatisfecha (cierra exacto todos los años).
- Nada se proyecta: todos los gráficos terminan en el último año con informe.

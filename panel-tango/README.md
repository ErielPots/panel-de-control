# Panel de control · Tango Motors

Panel del equipo TANGO en el simulador automotriz: cifras clave con semáforo, seis secciones de gráficos y la solapa de estados contables, del año 0 al último año cargado.

## Cómo está armado

```
informes/              Informes de resultados de cada ronda: r00.xls, r01.xls, ...
src/
  nucleo/              Lo que comparten todas las secciones
    pagina.html        Barra superior, banda de cifras, menú lateral y solapas
    estilos.css        Colores, tipografía y grilla
    nucleo.js          Datos, formatos, piezas de gráfico, cifras de arriba
    arranque.js        Botones, solapas, menú lateral y dibujo de todo
  secciones/
    panel/
      01-principales/  seccion.html (tarjetas) + seccion.js (gráficos)
      02-operaciones/
      03-mercado/
      04-financiamiento/
      05-accionista/
      06-aprendizaje/
    estados/
      01-resultados/
      02-balance/
  plantilla-seccion/   Modelo para crear una sección nueva
extraer_panel.py       Lee los informes y arma los datos
build.py               Junta todo en dist/index.html
```

Cada sección vive en su carpeta y no toca las demás: quien edita Accionista sólo cambia `src/secciones/panel/05-accionista/`. El número del nombre de la carpeta define el orden en la página y en el menú lateral.

## Trabajar en equipo

1. Cada uno trabaja en las carpetas de la sección que le toca.
2. Antes de empezar, bajar la última versión (`git pull`).
3. Al terminar, armar el panel para revisarlo (`python build.py`) y subir los cambios (`git commit` y `git push`).
4. Si dos personas tocan el mismo archivo, Git avisa un conflicto al subir: se resuelve a mano o pidiéndoselo a Claude.

Los archivos de `src/nucleo/` afectan a todo el panel. Conviene avisar al resto antes de cambiarlos.

## Cargar una ronda nueva

Descargar el informe de resultados del simulador, guardarlo en `informes/` con el nombre `r07.xls` (o el número que corresponda, siempre con dos dígitos) y subirlo. El panel suma el año solo.

## Ver el panel

- **En la computadora:** `pip install -r requirements.txt`, después `python build.py`, y abrir `dist/index.html` en el navegador.
- **Publicado:** cada vez que se sube un cambio a `main`, GitHub arma el panel y lo publica en GitHub Pages. Para activarlo una sola vez: en el repositorio, **Settings → Pages → Build and deployment → Source: GitHub Actions**. La dirección aparece ahí mismo después del primer armado (tarda uno o dos minutos).
- **Como artefacto de Claude:** `dist/artefacto.html` es la misma página lista para publicarla como artefacto.

GitHub Pages en un repositorio privado requiere un plan pago de GitHub; en uno público, cualquiera con la dirección ve el panel y los informes.

## Agregar una sección

Copiar `src/plantilla-seccion/` a `src/secciones/panel/07-nombre/`, cambiar el id `nueva` en los dos archivos y armar el panel. Aparece sola en la página y en el menú lateral.

## Reglas del panel

- Sólo gráficos y datos: el título de cada tarjeta es el indicador, y los ejes dicen la unidad. Nada de texto explicativo.
- Uno o dos gráficos por fila, y dos sólo si se complementan.
- Azul para gráficos que muestran sólo a TANGO; naranja para TANGO cuando se compara con la competencia.
- Colores de cada equipo: NOVA verde, RADAR rojo, SEVEN celeste, TANGO naranja, TCENA gris, NEXO marrón.
- Semáforo de las cifras de arriba: verde 1º y 2º, amarillo 3º y 4º, rojo 5º y 6º.

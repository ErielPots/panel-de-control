"""Arma el panel: junta el núcleo, las secciones y los datos de los informes en dist/index.html.

Uso:  python build.py
Requiere: pip install xlrd==2.0.1
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, RAIZ)
from extraer_panel import cargar  # noqa: E402

SRC = os.path.join(RAIZ, "src")
NUCLEO = os.path.join(SRC, "nucleo")
SECCIONES = os.path.join(SRC, "secciones")


def leer(*partes):
    with open(os.path.join(*partes), encoding="utf-8") as f:
        return f.read()


def carpetas(vista):
    base = os.path.join(SECCIONES, vista)
    return [os.path.join(base, d) for d in sorted(os.listdir(base)) if os.path.isdir(os.path.join(base, d))]


def main():
    errores = []
    html = {"panel": [], "estados": []}
    js = []
    for vista in ("panel", "estados"):
        for c in carpetas(vista):
            nombre = os.path.relpath(c, SECCIONES)
            for arch in ("seccion.html", "seccion.js"):
                if not os.path.exists(os.path.join(c, arch)):
                    errores.append(f"{nombre}: falta {arch}")
            if errores:
                continue
            h, j = leer(c, "seccion.html"), leer(c, "seccion.js")
            m = re.search(r'<section id="([^"]+)"', h)
            if not m:
                errores.append(f'{nombre}: seccion.html tiene que empezar con <section id="...">')
                continue
            sid = m.group(1)
            if f"id: '{sid}'" not in j:
                errores.append(f"{nombre}: seccion.js no registra la sección '{sid}' (falta seccion({{ id: '{sid}', ... }}))")
            # cada id de gráfico del HTML tiene que existir una sola vez en toda la página
            html[vista].append(f"<!-- {nombre} -->\n{h.rstrip()}")
            js.append(f"// ===== {nombre} =====\n{j.rstrip()}")
    ids = re.findall(r'id="([^"]+)"', "\n".join(html["panel"] + html["estados"]))
    repetidos = sorted({i for i in ids if ids.count(i) > 1})
    if repetidos:
        errores.append("ids repetidos entre secciones: " + ", ".join(repetidos))
    if errores:
        sys.exit("No se pudo armar el panel:\n  " + "\n  ".join(errores))

    datos = cargar(os.path.join(RAIZ, "informes"))
    scripts = "\n\n".join([leer(NUCLEO, "nucleo.js").rstrip()] + js + [leer(NUCLEO, "arranque.js").rstrip()])
    pagina = leer(NUCLEO, "pagina.html")
    for marca, valor in {
        "/*{{ESTILOS}}*/": leer(NUCLEO, "estilos.css").rstrip(),
        "<!--{{SECCIONES_PANEL}}-->": "\n\n".join(html["panel"]),
        "<!--{{SECCIONES_ESTADOS}}-->": "\n\n".join(html["estados"]),
        "/*{{DATOS}}*/null": json.dumps(datos, ensure_ascii=False, separators=(",", ":")),
        "/*{{SCRIPTS}}*/": scripts,
    }.items():
        if marca not in pagina:
            sys.exit(f"pagina.html perdió la marca {marca}")
        pagina = pagina.replace(marca, valor)

    os.makedirs(os.path.join(RAIZ, "dist"), exist_ok=True)
    # artefacto.html: el contenido tal cual, para publicarlo como artefacto de Claude (Claude le agrega el documento alrededor)
    with open(os.path.join(RAIZ, "dist", "artefacto.html"), "w", encoding="utf-8") as f:
        f.write(pagina)
    # index.html: documento completo para GitHub Pages
    corte = pagina.index("</style>") + len("</style>")
    documento = (
        '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        "<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}"
        "body{margin:0;font-size:14px}img{max-width:100%}[hidden]{display:none!important}</style>\n"
        + pagina[:corte] + "\n</head>\n<body>\n" + pagina[corte:].lstrip() + "\n</body>\n</html>\n"
    )
    salida = os.path.join(RAIZ, "dist", "index.html")
    with open(salida, "w", encoding="utf-8") as f:
        f.write(documento)
    n = len(datos["rondas"]) - 1
    print(f"Listo: dist/index.html (GitHub Pages) y dist/artefacto.html · rondas 0 a {n} · {len(html['panel'])} secciones de Panel y {len(html['estados'])} de Estados contables")


if __name__ == "__main__":
    main()

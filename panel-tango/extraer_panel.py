"""Extrae del informe de resultados (results-rNN.xls) los indicadores del panel de control.
Uso: python extraer_panel.py informes datos.json  (normalmente lo llama build.py)"""
import xlrd, json, sys, os, glob, re

E = ["NOVA", "RADAR", "SEVEN", "TANGO", "TCENA", "NEXO"]


def num(c):
    return c.value if c.ctype == 2 else None


def ronda(path):
    s = xlrd.open_workbook(path).sheet_by_index(0)
    assert s.row_values(4)[1:7] == E

    def R(i, f=1.0):
        return [None if num(c) is None else num(c) * f for c in s.row(i)[1:7]]

    def T(i):
        return [str(v) for v in s.row_values(i)[1:7]]

    def S(*rows, f=1.0):
        cols = [R(i) for i in rows]
        return [sum(c[k] or 0 for c in cols) * f for k in range(6)]

    TEC = ["comb", "hib", "elec", "hidr"]
    d = {}
    # ---- resultados y balance global
    d["ing"] = R(6)
    d["cv"] = S(9, 10, 11, 12)
    d["id"] = R(13)
    d["promo"] = R(14)
    d["ebitda"] = R(18)
    d["ebit"] = R(21)
    d["fin"] = R(22)
    d["bn"] = R(27)
    d["activos"] = R(37)
    d["inv_usd"] = R(34)
    d["caja"] = R(36)
    d["pn"] = R(44)
    d["dlp"] = R(47)
    d["dcp"] = R(48)
    d["cxp"] = R(49)
    # ---- ingresos por región (de mercados) y por tecnología
    d["ing_reg"] = {"US": R(58), "CN": R(144), "EU": R(225)}
    d["ing_tec"] = {t: S(a, b, c) for t, (a, b, c) in zip(TEC, [(927, 994, 1061), (943, 1010, 1077), (959, 1026, 1093), (975, 1042, 1109)])}
    # ---- caja y deuda de corto por región
    d["caja_reg"] = {"US": R(91), "CN": R(177), "EU": R(252)}
    d["dcp_reg"] = {"US": R(103), "CN": R(187), "EU": R(262)}
    # ---- flujo casa matriz
    d["div"] = R(128, -1)
    d["recompra"] = R(129, -1)  # positivo = recompra neta
    # ---- accionista
    d["cap"] = R(295)
    d["acciones"] = R(296)
    d["precio"] = R(297)
    d["tsr"] = R(301)
    d["mb"] = R(304)
    d["mebitda"] = R(305)
    d["mo"] = R(306)
    d["ros"] = R(307)
    d["ratio_pn"] = R(308)
    d["dn_pn"] = R(309)
    d["roce"] = R(310)
    d["roe"] = R(311)
    d["eps"] = R(312)
    d["rating"] = T(313)
    # ---- mercado
    d["ms"] = R(329)
    d["ms_tec_glob"] = {t: R(i) for t, i in zip(TEC, [325, 326, 327, 328])}
    base = {"US": dict(p=[335, 342, 349, 356], ms=[363, 364, 365, 366], mst=367),
            "CN": dict(p=[373, 380, 387, 394], ms=[401, 402, 403, 404], mst=405),
            "EU": dict(p=[411, 418, 425, 432], ms=[439, 440, 441, 442], mst=443)}
    # costos totales del segmento (miles USD) del "Desglose de margen por tec": fila de ingresos + 7
    ing_fila = {"US": dict(zip(TEC, [927, 943, 959, 975])), "CN": dict(zip(TEC, [994, 1010, 1026, 1042])),
                "EU": dict(zip(TEC, [1061, 1077, 1093, 1109]))}
    d["seg"] = {}
    for rg, b in base.items():
        d["seg"][rg] = {}
        for t, p, ms in zip(TEC, b["p"], b["ms"]):
            d["seg"][rg][t] = dict(precio=R(p), carac=R(p + 1), ventas=R(p + 3), demanda=R(p + 4), ms=R(ms),
                                   costo=R(ing_fila[rg][t] + 7))
        d["seg"][rg]["ms_total"] = R(b["mst"])
    # ---- operaciones
    d["prod_int"] = {"US": dict(zip(TEC, [R(i) for i in (604, 605, 606, 607)])), "CN": dict(zip(TEC, [R(i) for i in (610, 611, 612, 613)]))}
    d["prod_con"] = {"US": dict(zip(TEC, [R(i) for i in (617, 618, 619, 620)])), "CN": dict(zip(TEC, [R(i) for i in (623, 624, 625, 626)]))}
    d["cap_usada"] = {"US": S(631, 632, 633, 634), "CN": S(638, 639, 640, 641)}
    d["inv"] = {"US": dict(zip(TEC, [R(i) for i in (646, 647, 648, 649)])), "CN": dict(zip(TEC, [R(i) for i in (654, 655, 656, 657)]))}
    d["costo_inv"] = S(651, 659)
    d["fab"] = {"US": R(663), "CN": R(664)}
    d["fab1"] = {"US": R(667), "CN": R(668)}
    d["fab2"] = {"US": R(671), "CN": R(672)}
    d["insat"] = {t: S(*rows) for t, rows in zip(TEC, [(689, 702, 710), (725, 738, 746), (761, 774, 782), (797, 810, 818)])}
    # ---- aprendizaje
    d["salario"] = R(449)
    d["capacit"] = R(450)
    d["efic_rrhh"] = R(452)
    d["personal_id"] = R(458)
    d["rotacion"] = R(460)
    d["esg"] = {"E": R(497), "S": R(498), "G": R(499), "total": R(500)}
    d["certif"] = T(560)
    # ---- estados contables (global, miles USD)
    d["er"] = {k: R(i) for k, i in dict(ing=6, fab=9, carac=10, contr=11, transp=12, id=13, promo=14, adm=15,
                                         ctot=16, ebitda=18, dep=19, ebit=21, fin=22, bai=24, imp=25, bn=27).items()}
    d["bal"] = {k: R(i) for k, i in dict(af=33, inv=34, cxc=35, caja=36, at=37, cs=40, cad=41, br=42, ga=43, pn=44,
                                          dlp=47, dcp=48, cxp=49, pt=50, tot=52).items()}
    return d


def cargar(carpeta):
    """Lee todos los informes de la carpeta (r00.xls, r01.xls, ...). Las rondas tienen que estar completas desde la 0."""
    encontrados = {}
    for p in glob.glob(os.path.join(carpeta, "*.xls")):
        m = re.search(r"r(\d{2})", os.path.basename(p))
        if m:
            encontrados[int(m.group(1))] = p
    if 0 not in encontrados:
        sys.exit("Falta el informe de la ronda 0 (r00.xls) en " + carpeta)
    rondas = []
    for r in range(0, max(encontrados) + 1):
        if r not in encontrados:
            sys.exit(f"Falta el informe de la ronda {r} (r{r:02d}.xls) en {carpeta}")
        rondas.append(ronda(encontrados[r]))
    return {"empresas": E, "rondas": rondas}


def main(carpeta, salida):
    datos = cargar(carpeta)
    json.dump(datos, open(salida, "w"), ensure_ascii=False)
    print("rondas", len(datos["rondas"]))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

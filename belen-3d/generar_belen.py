"""Genera las piezas STL de los tres belenes (medidas en mm).
Uso: python3 generar_belen.py   ->  crea ./stl/*.stl y ./preview/*.glb
Requiere: pip install manifold3d trimesh numpy
"""
import json, math, os
import numpy as np
import trimesh
from manifold3d import Manifold, CrossSection, JoinType

SEG = 128
PARED = 2.0          # grosor de pared de casas y arboles
HOLG = 0.25          # holgura de encajes
BASE_L, BASE_A, BASE_H = 210.0, 125.0, 6.0
CAJEADO = 1.2        # profundidad de los asientos de la base
HOYO = (40.0, 55.5)  # agujero del palo de la estrella

CREMA, OSCURO, MADERA, ORO = (236, 222, 194), (58, 50, 46), (196, 148, 98), (246, 214, 120)

def sph(r, at=(0, 0, 0), seg=SEG): return Manifold.sphere(r, seg).translate(list(at))
def box(x0, x1, y0, y1, z0, z1):
    return Manifold.cube([x1 - x0, y1 - y0, z1 - z0]).translate([x0, y0, z0])
def caja_redonda(x0, x1, y0, y1, z0, z1, r=1.0):
    return Manifold.batch_hull([sph(r, (x, y, z), 24) for x in (x0 + r, x1 - r) for y in (y0 + r, y1 - r) for z in (z0 + r, z1 - r)])
def prism_xz(pts, y0, y1):
    """Extruye un poligono (x,z) a lo largo de Y entre y0 e y1."""
    return CrossSection([pts]).extrude(y1 - y0).rotate([90, 0, 0]).translate([0, y1, 0])
def redondear(cs, r): return cs.offset(-r, JoinType.Round).offset(r, JoinType.Round, 2.0, 48)
def rect_r(w, d, r): return redondear(CrossSection.square([w, d], True), r)

# ---------------------------------------------------------------- figuras
def capa(H, R):
    pts = [(0, 0), (R - 1.2, 0), (R, 1.2)]
    for i in range(1, 80):
        z = 1.2 + (H - 1.2) * i / 80
        pts.append((R * (1 - (z / H) ** 2) ** 0.55, z))
    pts.append((0, H))
    return Manifold.revolve(CrossSection([pts]), SEG)

R_CABEZA = 9.0
def figura(H, R=20.0, inclina=0.0, manto_abierto=False, baston=False):
    """Manto exterior + tunica interior 2,5 mm mas adentro; la abertura deja ver la tunica y la cara."""
    G = 2.5
    zc = H - 21
    r_in = (R - G) * (1 - (zc / (H - G)) ** 2) ** 0.55
    yc = -(r_in - R_CABEZA + 4.5)
    fuera, dentro = capa(H, R), capa(H - G, R - G)
    if manto_abierto:      # abertura en lagrima desde la cara hasta casi el suelo
        abre = Manifold.batch_hull([sph(11.5, (0, yc - 4, zc)), sph(8.5, (0, -R - 1, 24)), sph(6.5, (0, -R - 3, 2))])
    else:                  # solo el ovalo de la capucha
        abre = sph(1).scale([11, 11, 12.5]).translate([0, yc - 4.5, zc])
    cuerpo = dentro + (fuera - abre)
    pos = None
    if baston:
        a = math.radians(-50)
        bx, by = (R + 4.5) * math.cos(a), (R + 4.5) * math.sin(a)
        manga = Manifold.batch_hull([sph(6, (8 * math.cos(a), 8 * math.sin(a), 48)), sph(5.2, (bx * 0.8, by * 0.8, 39))])
        mano = sph(5.6, (bx, by, 38))
        cuerpo = cuerpo + manga + (sph(5.2, (bx * 0.8, by * 0.8, 39)) + mano).hull()
        cuerpo -= Manifold.cylinder(40, 3.1, 3.1, 48).translate([bx, by, 20])
        pos = (bx, by)
    if inclina:            # ligera inclinacion hacia delante
        cuerpo = cuerpo.transform([[1, 0, 0, 0], [0, 1, -inclina, 0], [0, 0, 1, 0]])
        yc -= inclina * zc
    cuerpo -= sph(R_CABEZA + HOLG, (0, yc, zc))
    cabeza = sph(R_CABEZA, (0, yc, zc)) - box(-20, 20, yc + R_CABEZA - 3, yc + 20, 0, 200)
    return cuerpo, cabeza, pos

def baston(L=76):
    s = CrossSection.square([4, L]).translate([-2, 0])
    aro = CrossSection.circle(8, 64) - CrossSection.circle(4, 64)
    aro = (aro - CrossSection.square([20, 10]).translate([-10, -10])).translate([6, L])
    cola = CrossSection.circle(2, 32).translate([12, L])
    return redondear(s, 1.2).extrude(4) + (aro + cola).extrude(4)      # tumbado

def pesebre():
    out = [(13 + 7 * math.sin(t), 15 * t / (math.pi / 2)) for t in np.linspace(0, math.pi / 2, 28)]
    borde = [(18.75 + 1.25 * math.cos(t), 15 + 1.25 * math.sin(t)) for t in np.linspace(0, math.pi, 14)]
    inn = [(r - 2.5, 3 + (z * 12 / 15)) for r, z in out][::-1]
    cuenco = Manifold.revolve(CrossSection([[(0, 0)] + out + borde + inn + [(0, 3)]]), SEG)
    elip = lambda k: sph(1).scale([12 * k, 9.5 * k, 9 * k])
    nino = elip(1)
    for ang, x in ((25, -3), (-25, 2)):      # pliegues del fajado
        nino -= (elip(1.01) - elip(0.94)) ^ Manifold.cube([1.3, 40, 40], True).rotate([0, 0, ang]).translate([x, 0, 0])
    nino -= box(-20, 20, -20, 20, -20, -5)
    cab = (7, 0, 3.5)
    nino -= sph(6 + HOLG, cab)
    cabeza = sph(6, cab) - box(-20, 20, -20, 20, -20, cab[2] - 4)
    sube = 3 + 5 + 1.5
    return cuenco, nino.translate([0, 0, sube]), cabeza.translate([0, 0, sube])

# ---------------------------------------------------------------- arboles
def arbol(H, R, fase):
    def cono(R, H, rt):
        return (Manifold.cylinder(0.01, R, R, SEG) + sph(rt, (0, 0, H - rt))).hull()
    m = cono(R, H, 3) - cono(R - PARED * 1.25, H - 9, 0.5).translate([0, 0, -0.01])
    m += Manifold.cylinder(2.5, R, R, SEG) - Manifold.cylinder(6, R - 3.2, R - 3.2, SEG).translate([0, 0, -1])  # aro de refuerzo
    alfa = math.atan2(R, H)
    N = int(math.pi * R * math.hypot(R, H) / 240)
    tam = [7.5, 4.5, 6.0, 3.5, 5.5, 4.0, 6.8]
    u0, u1 = 1 - (1 - 9 / H) ** 2, 1 - (1 - (H - 17) / H) ** 2
    for i in range(N):
        u = u0 + (u1 - u0) * (i + 0.5) / N
        z = H * (1 - math.sqrt(1 - u))
        rz = R * (1 - z / H)
        d = min(tam[i % len(tam)], rz * 0.62)
        if d < 2.2: continue
        c = Manifold.cylinder(R + 20, d / 2, d / 2, 40).rotate([0, 90 - math.degrees(alfa), 0])
        m -= c.translate([0, 0, z - rz * math.tan(alfa)]).rotate([0, 0, fase + i * 137.508])
    return m

# ---------------------------------------------------------------- casas
def pent(w, d, alto, r, zb=0.0):
    p = prism_xz([(-w / 2, zb), (w / 2, zb), (w / 2, alto), (0, alto + w / 2), (-w / 2, alto)], -d / 2, d / 2)
    return p ^ rect_r(w, d, r).extrude(alto + w).translate([0, 0, zb])

def arco(w, h):
    return CrossSection.square([w, h - w / 2]).translate([-w / 2, 0]) + \
           CrossSection.circle(w / 2, 64).translate([0, h - w / 2])

def hueco(cara, w, h, u, z, barras=None, *, lado_w, lado_d):
    """Ventana/puerta en arco con marco en relieve. cara: 'f' frente, 'i' izq, 'd' dcha."""
    barras = (w >= 9 and z > 0) if barras is None else barras
    tumba = lambda cs, g: cs.extrude(g).rotate([90, 0, 0])
    corte = tumba(arco(w, h), PARED + 3).translate([u, 1.5, z])
    marco = tumba(arco(w + 3.2, h + 1.6) - arco(w, h), 0.8).translate([u, -PARED, z])
    if z > 0:
        marco += caja_redonda(u - w / 2 - 2.6, u + w / 2 + 2.6, -PARED - 1.4, -PARED + 0.5, z - 1.8, z, 0.45)
    if barras:
        yb = z + (h - w / 2) * 0.55
        b = box(u - 0.7, u + 0.7, -PARED, -0.4, z, z + h) + box(u - w / 2, u + w / 2, -PARED, -0.4, yb - 0.7, yb + 0.7)
        marco += b ^ corte
    def colocar(m):
        if cara == 'f': return m.translate([0, -lado_d / 2 + PARED, 0])
        return m.translate([0, -lado_w / 2 + PARED, 0]).rotate([0, 0, -90 if cara == 'i' else 90])
    return colocar(corte), colocar(marco)

def cuerpo_casa(w, d, alto, huecos, cx=0.0, cy=0.0):
    ext = pent(w, d, alto, 2.5)
    inte = pent(w - 2 * PARED, d - 2 * PARED, alto - PARED * (math.sqrt(2) - 1), 0.8, zb=-1)
    cortes, extras = Manifold(), Manifold()
    for hh in huecos:
        c, a = hueco(*hh, lado_w=w, lado_d=d)
        cortes += c; extras += a
    return [m.translate([cx, cy, 0]) for m in (ext, inte, cortes, extras)]

def tejado(w, d, alto, vuelo=5.0, t=3.6, chimenea=False, cx=0.0, cy=0.0):
    """Dos faldones a 45 grados con cantos redondeados; se imprime tal cual, sin soportes."""
    p = alto + w / 2 + HOLG
    L = w / 2 + vuelo
    r = 1.1; q = 1 / math.sqrt(2)
    y0, y1 = -d / 2 - vuelo, d / 2 + vuelo
    def faldon(s):
        pts = []
        for a in (-t, L * math.sqrt(2)):                 # a lo largo de la pendiente (pasa t de la cumbrera)
            for n in (r, t - r):                          # perpendicular
                x = s * (a * q + n * q); z = p - a * q + n * q
                if a > 0: x -= s * r * q; z += r * q
                else:     x += s * r * q; z -= r * q
                pts += [sph(r, (x, y, z), 24) for y in (y0 + r, y1 - r)]
        return Manifold.batch_hull(pts)
    m = faldon(1) + faldon(-1)
    if chimenea:
        cxh = w * 0.27
        zt = p - cxh + 9
        m += caja_redonda(cxh - 4.5, cxh + 4.5, -4.5, 4.5, p - cxh - 3, zt, 0.8)
        m += caja_redonda(cxh - 5.6, cxh + 5.6, -5.6, 5.6, zt - 2.2, zt + 0.6, 0.8)
    zlow = p - L + 0.9
    m -= prism_xz([(-(p - zlow + 60), zlow - 60), ((p - zlow + 60), zlow - 60), (0, p)], y0 - 1, y1 + 1)
    m -= box(-200, 200, -200, 200, zlow - 50, zlow)
    m = max(m.decompose(), key=lambda k: k.volume())      # descarta esquirlas del corte
    return m.translate([cx, cy, 0])

def casa_grande():
    W, D, A = 62, 46, 42
    h = [('f', 10, 16, -17.5, 21), ('f', 10, 16, -3.5, 21), ('f', 13, 23, 15, 0),
         ('i', 10, 16, 0, 16), ('d', 10, 16, 0, 16)]
    e, i, c, x = cuerpo_casa(W, D, A, h)
    return e + x - i - c, tejado(W, D, A, chimenea=True)

def casa_pequena():
    W, D, A = 44, 34, 27
    h = [('f', 6.5, 9.5, -9.5, 4.5), ('f', 6.5, 9.5, 9.5, 4.5), ('f', 6.5, 9.5, -9.5, 17), ('f', 6.5, 9.5, 9.5, 17),
         ('i', 7, 11, 0, 9), ('d', 7, 11, 0, 9)]
    e, i, c, x = cuerpo_casa(W, D, A, h)
    return e + x - i - c, tejado(W, D, A, vuelo=4, t=3.2, chimenea=True)

def iglesia():
    TW, TD, TA = 30, 30, 78          # torre
    NW, ND, NA, NX = 44, 36, 30, 35  # nave, a la derecha y alineada con el frente
    dy = -(ND - TD) / 2
    te, ti, tc, tx = cuerpo_casa(TW, TD, TA, [('f', 10, 20, 0, 0), ('f', 10, 18, 0, 50, False),
                                              ('i', 8, 14, 0, 52, False), ('d', 8, 14, 0, 52, False)])
    ne, ni, nc, nx = cuerpo_casa(NW, ND, NA, [('f', 8, 12, -8, 9, False), ('f', 8, 12, 10, 9, False),
                                              ('d', 9, 14, 0, 8)], cx=NX, cy=dy)
    # roseton y cornisa de la torre
    ros = Manifold.cylinder(PARED + 3, 3.2, 3.2, 48).rotate([90, 0, 0]).translate([0, -TD / 2 + PARED + 1.5, 38])
    aro = (Manifold.cylinder(0.8, 4.8, 4.8, 48) - Manifold.cylinder(3, 3.2, 3.2, 48).translate([0, 0, -1])).rotate([90, 0, 0]).translate([0, -TD / 2, 38])
    cuerpo = (te + ne + tx + nx + aro) - (ti + ni) - tc - nc - ros
    tej_t = tejado(TW, TD, TA, vuelo=4, t=3.2)
    tej_n = tejado(NW, ND, NA, vuelo=4, t=3.2, cx=NX, cy=dy)
    tej_n -= box(-TW / 2 - HOLG, TW / 2 + HOLG, -TD / 2 - HOLG, TD / 2 + HOLG, 0, 200)
    return cuerpo, tej_t, tej_n

# ---------------------------------------------------------------- establo, estrella, valla
EST_P, EST_D = 92.0, 40.0
def establo():
    tan = math.tan(math.radians(30)); g = 7 / math.cos(math.radians(30)); E = 60
    techo = [(-E, EST_P - E * tan), (0, EST_P), (E, EST_P - E * tan), (E, EST_P - g - E * tan),
             (0, EST_P - g), (-E, EST_P - g - E * tan)]
    cs = CrossSection([techo[::-1]])
    for s in (-1, 1):
        x0 = s * 52
        cs += CrossSection([[(x0, 0), (x0 - s * 7, 0), (x0 - s * 7, 58), (x0, 58)][::-s]])
    cs = redondear(cs, 1.6) + CrossSection.square([7, 4]).translate([-52, 0]) + CrossSection.square([7, 4]).translate([45, 0])
    m = cs.extrude(EST_D).rotate([90, 0, 0]).translate([0, EST_D / 2, 0])
    m -= box(-4 - HOLG, 4 + HOLG, -2 - HOLG, 2 + HOLG, EST_P - 6, EST_P + 1)
    return m

def estrella3d(R, r2, ri, centro=5.5, canto=2.0):
    """Estrella de 8 puntas facetada (plana por detras, para imprimir tumbada)."""
    pts = []
    for k in range(16):
        a = math.radians(90 + 22.5 * k)
        rad = ri if k % 2 else (R * (1.3 if k == 0 else 1.1 if k == 8 else 1) if k % 4 == 0 else r2)
        pts.append((rad * math.cos(a), rad * math.sin(a)))
    m = Manifold()
    for k in range(16):
        (ax, ay), (bx, by) = pts[k], pts[(k + 1) % 16]
        m += Manifold.hull_points([(0, 0, 0), (ax, ay, 0), (bx, by, 0), (0, 0, centro), (ax, ay, canto), (bx, by, canto)])
    return m

def estrella_palo(zc=120.0, hondo=5.0):      # tumbada; el palo entra 5 mm en la base
    palo = redondear(CrossSection.square([5, zc + hondo]).translate([-2.5, -hondo]), 0.8).extrude(4)
    return estrella3d(17, 9.5, 4).translate([0, zc, 0]) + palo

def estrella_establo():
    return estrella3d(19, 10.5, 4.5).translate([0, 20, 0]) + box(-4, 4, -6, 20, 0, 4)

def valla(n=4, paso=13.0, alto=27.0, g=5.0):
    cs = CrossSection()
    for k in range(n):
        x = k * paso
        cs += CrossSection([[(x, 0), (x + 7, 0), (x + 7, alto - 4), (x + 3.5, alto), (x, alto - 4)]])
    L = (n - 1) * paso + 7
    cs += CrossSection.square([L + 6, 4]).translate([-3, 7]) + CrossSection.square([L + 6, 4]).translate([-3, 16])
    cs = redondear(cs, 0.9) + CrossSection.square([L, 3])          # pie recto para el asiento
    return cs.extrude(g).translate([-L / 2, 0, 0])

# ================================================================ piezas
P = {}   # nombre -> (manifold en posicion de montaje, color, transformacion para imprimir)
def reg(nombre, m, color, imprimir=None): P[nombre] = (m, color, imprimir)

maria, cab_m, _ = figura(62, inclina=0.07, manto_abierto=True)
jose, cab_j, POS_BASTON = figura(72, baston=True)
tumbar_cara = lambda m: m.rotate([90, 0, 0])
reg('maria_cuerpo', maria, CREMA); reg('maria_cabeza', cab_m, MADERA, tumbar_cara)
reg('jose_cuerpo', jose, OSCURO);  reg('jose_cabeza', cab_j, MADERA, tumbar_cara)
reg('jose_baston', baston().rotate([90, 0, 0]).translate([0, 2, 0]).rotate([0, 0, 130]).translate([POS_BASTON[0], POS_BASTON[1], 0]),
    CREMA, lambda m: baston())
cu, ni, nc = pesebre()
reg('pesebre_cuenco', cu, MADERA); reg('nino_cuerpo', ni, CREMA); reg('nino_cabeza', nc, MADERA)
reg('arbol_grande', arbol(105, 27, 0), CREMA)
reg('arbol_mediano', arbol(80, 22, 40), CREMA)
reg('arbol_pequeno', arbol(60, 18, 80), CREMA)
c, t = casa_grande();  reg('casa_grande_cuerpo', c, CREMA); reg('casa_grande_tejado', t, OSCURO)
c, t = casa_pequena(); reg('casa_pequena_cuerpo', c, CREMA); reg('casa_pequena_tejado', t, OSCURO)
c, t1, t2 = iglesia()
reg('iglesia_cuerpo', c, CREMA); reg('iglesia_tejado_torre', t1, OSCURO); reg('iglesia_tejado_nave', t2, OSCURO)
reg('establo', establo(), CREMA, lambda m: m.rotate([-90, 0, 0]))
reg('estrella_establo', estrella_establo().rotate([90, 0, 0]).translate([0, 2, EST_P - 6]), ORO, lambda m: estrella_establo())
reg('estrella_con_palo', estrella_palo().rotate([90, 0, 0]).translate([HOYO[0], HOYO[1] + 2, BASE_H - CAJEADO]), ORO, lambda m: estrella_palo())
reg('valla', valla().rotate([90, 0, 0]).translate([0, 2.5, 0]), OSCURO, lambda m: valla())

# ================================================================ escenas y bases
def grupo(pref, x, y, g=0): return [(n, x, y, g) for n in P if n.startswith(pref)]
sagrada = lambda mx, my, px, py, jx, jy: (grupo('maria', mx, my, 15) + grupo('pesebre', px, py) +
                                          grupo('nino', px, py) + grupo('jose', jx, jy, -15))
ESCENAS = {
    'belen_1_casa': (True, grupo('casa_grande', 2, 22) + [('arbol_grande', -66, 20, 0), ('arbol_mediano', 76, 6, 0)]
                     + sagrada(-30, -24, 7, -42, 44, -24)),
    'belen_2_establo': (False, [('establo', 18, 24, 0), ('estrella_establo', 18, 24, 0), ('arbol_grande', -63, 29, 0),
                                ('arbol_pequeno', 86, -8, 0)] + grupo('casa_pequena', -70, -16)
                        + sagrada(-4, -2, 18, -36, 40, 0)),
    'belen_3_pueblo': (True, grupo('iglesia', 2, 32) + grupo('casa_pequena', -42, 22) +
                       [('arbol_pequeno', -84, 12, 0), ('arbol_pequeno', -78, -24, 0), ('arbol_mediano', 78, -8, 0),
                        ('valla', -48, -49, 0)] + sagrada(-28, -18, 5, -43, 34, -12)),
}
CON_LUZ = ('arbol', 'casa_grande_cuerpo', 'casa_pequena_cuerpo', 'iglesia_cuerpo')
ASIENTO = ('maria_cuerpo', 'jose_cuerpo', 'jose_baston', 'pesebre_cuenco', 'arbol', 'casa_grande_cuerpo', 'casa_pequena_cuerpo',
           'iglesia_cuerpo', 'establo', 'valla')

def base(con_estrella, piezas):
    r = BASE_A / 2; dx = BASE_L / 2 - r
    def capa_b(ins, z0, z1):
        cs = (CrossSection.circle(r - ins, 160).translate([-dx, 0]) + CrossSection.circle(r - ins, 160).translate([dx, 0])).hull()
        return cs.extrude(z1 - z0).translate([0, 0, z0])
    RR = 3.0
    capas = [capa_b(0.6, 0, 0.01), capa_b(0, 0.6, BASE_H - RR)]
    capas += [capa_b(RR * (1 - math.cos(a)), BASE_H - RR + RR * math.sin(a) - 0.01, BASE_H - RR + RR * math.sin(a))
              for a in np.linspace(0, math.pi / 2, 10)]
    m = Manifold.batch_hull(capas)
    for n, x, y, g in piezas:
        if not n.startswith(ASIENTO) or n == 'estrella_establo': continue
        cs = P[n][0].slice(1.4)
        if n not in ('establo', 'valla'): cs = cs.hull()
        cs = cs.offset(0.4, JoinType.Round, 2.0, 64)
        m -= cs.extrude(CAJEADO + 1).rotate([0, 0, g]).translate([x, y, BASE_H - CAJEADO])
        if n.startswith(CON_LUZ):     # pasacables + canal por debajo hasta el borde trasero
            xs = [x, x + 35] if n == 'iglesia_cuerpo' else [x]
            for xx in xs:
                m -= Manifold.cylinder(BASE_H + 2, 6, 6, 48).translate([xx, y, -1])
                m -= box(xx - 2.5, xx + 2.5, y, BASE_A, -1, 3)
    if con_estrella:
        m -= box(HOYO[0] - 2.5 - HOLG, HOYO[0] + 2.5 + HOLG, HOYO[1] - 2 - HOLG, HOYO[1] + 2 + HOLG, 1, BASE_H + 1)
    return m

for nombre, (estrella, piezas) in ESCENAS.items():
    reg('base_' + nombre, base(estrella, piezas), CREMA)

def to_tm(m, color=None):
    me = m.to_mesh()
    t = trimesh.Trimesh(np.asarray(me.vert_properties)[:, :3], np.asarray(me.tri_verts), process=False)
    if color: t.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
        baseColorFactor=list(color) + [255], roughnessFactor=0.75, metallicFactor=0.0))
    return t

if __name__ == '__main__':
    os.makedirs('stl', exist_ok=True); os.makedirs('preview', exist_ok=True)
    for f in os.listdir('stl'): os.remove(os.path.join('stl', f))
    print(f"{'pieza':28s} {'X':>6s} {'Y':>6s} {'Z':>6s}  estanca")
    for n, (m, col, imp) in P.items():
        pm = imp(m) if imp else m
        b = pm.bounding_box()
        pm = pm.translate([-(b[0] + b[3]) / 2, -(b[1] + b[4]) / 2, -b[2]])
        t = to_tm(pm); t.export(f'stl/{n}.stl')
        e = t.extents
        print(f"{n:28s} {e[0]:6.1f} {e[1]:6.1f} {e[2]:6.1f}  {t.is_watertight}  vol={pm.volume()/1000:.1f}cm3")

    luces = {}
    for nombre, (estrella, piezas) in ESCENAS.items():
        sc = trimesh.Scene(); puestas = []
        todo = [('base_' + nombre, 0, 0, 0)] + ([('estrella_con_palo', 0, 0, 0)] if estrella else []) + piezas
        for n, x, y, g in todo:
            m, c, _ = P[n]
            z = 0 if n.startswith('base') or n == 'estrella_con_palo' else BASE_H - CAJEADO
            mm = m.rotate([0, 0, g]).translate([x, y, z])
            sc.add_geometry(to_tm(mm, c), node_name=f'{n}_{len(puestas)}', geom_name=f'{n}_{len(puestas)}')
            puestas.append((n, mm))
        sc.export(f'preview/{nombre}.glb')
        luces[nombre] = [[x + dx, y, 22] for n, x, y, g in piezas if n.startswith(CON_LUZ)
                         for dx in ([0, 35] if n == 'iglesia_cuerpo' else [0])]
        # comprobacion de choques entre piezas distintas
        fam = lambda n: n.split('_cuerpo')[0].split('_tejado')[0].split('_cabeza')[0].replace('nino', 'pesebre').replace('_cuenco', '').replace('_baston', '')
        for i in range(len(puestas)):
            for j in range(i + 1, len(puestas)):
                (a, ma), (b, mb) = puestas[i], puestas[j]
                if fam(a) == fam(b) or 'estrella' in a + b and ('base' in a + b or 'establo' in a + b): continue
                v = (ma ^ mb).volume()
                if v > 0.5: print(f'  CHOQUE {nombre}: {a} / {b}  {v:.0f} mm3')
    json.dump(luces, open('preview/luces.json', 'w'))

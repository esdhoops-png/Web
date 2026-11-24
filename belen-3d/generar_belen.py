"""Genera las piezas STL de los tres belenes (medidas en mm).
Uso: python3 generar_belen.py   ->  crea ./stl/*.stl y ./preview/*.glb
"""
import math, os
import numpy as np
import trimesh
from manifold3d import Manifold, CrossSection

SEG = 96
PARED = 2.0          # grosor de pared de casas y arboles
HOLG = 0.25          # holgura de encajes

CREMA, OSCURO, MADERA = (238, 224, 196), (60, 52, 48), (198, 150, 100)

def sph(r, at=(0, 0, 0)): return Manifold.sphere(r, SEG).translate(list(at))
def box(x0, x1, y0, y1, z0, z1):
    return Manifold.cube([x1 - x0, y1 - y0, z1 - z0]).translate([x0, y0, z0])
def prism_xz(pts, y0, y1):
    """Extruye un poligono (x,z) a lo largo de Y entre y0 e y1."""
    return CrossSection([pts]).extrude(y1 - y0).rotate([90, 0, 0]).translate([0, y1, 0])

# ---------------------------------------------------------------- figuras
def capa(H, R):
    pts = [(0, 0), (R - 1, 0), (R, 1)]
    for i in range(1, 60):
        z = 1 + (H - 1) * i / 60
        pts.append((R * (1 - (z / H) ** 2) ** 0.55, z))
    pts.append((0, H))
    return Manifold.revolve(CrossSection([pts]), SEG)

R_CABEZA = 9.0
def figura(H, R=20.0, baston=False):
    zc = H - 20
    r_cuerpo = R * (1 - (zc / H) ** 2) ** 0.55
    yc = -(r_cuerpo - R_CABEZA + 3.5)
    cuerpo = capa(H, R)
    if baston:
        a = math.radians(-50)
        bx, by = (R + 4.5) * math.cos(a), (R + 4.5) * math.sin(a)
        brazo = (sph(5, (9 * math.cos(a), 9 * math.sin(a), 46)) + sph(6.5, (bx, by, 38))).hull()
        cuerpo = cuerpo + brazo
        cuerpo -= Manifold.cylinder(40, 3.1, 3.1, 48).translate([bx, by, 20])
        pos_baston = (bx, by)
    cuerpo -= sph(R_CABEZA + HOLG, (0, yc, zc))
    cabeza = sph(R_CABEZA, (0, yc, zc)) - box(-20, 20, yc + R_CABEZA - 3, yc + 20, 0, 200)
    return (cuerpo, cabeza, pos_baston) if baston else (cuerpo, cabeza)

def baston(L=74):
    s = CrossSection.square([4, L]).translate([-2, 0])
    aro = CrossSection.circle(8, 64) - CrossSection.circle(4, 64)
    aro = (aro - CrossSection.square([20, 10]).translate([-10, -10])).translate([6, L])
    cola = CrossSection.square([4, 6]).translate([10, L - 6])
    return (s + aro + cola).extrude(4)          # tumbado, listo para imprimir

def pesebre():
    out = [(13 + 7 * math.sin(t), 16 * t / (math.pi / 2)) for t in np.linspace(0, math.pi / 2, 24)]
    inn = [(r - 2.5, 3 + (z * 13 / 16)) for r, z in out][::-1]
    cuenco = Manifold.revolve(CrossSection([[(0, 0)] + out + inn + [(0, 3)]]), SEG)
    nino = sph(1).scale([12, 9.5, 9]) - box(-20, 20, -20, 20, -20, -5)
    cab = (7, 0, 3.5)
    nino -= sph(6 + HOLG, cab)
    cabeza = sph(6, cab) - box(-20, 20, -20, 20, -20, cab[2] - 4)
    sube = 3 + 5 + 1.5
    return cuenco, nino.translate([0, 0, sube]), cabeza.translate([0, 0, sube])

# ---------------------------------------------------------------- arboles
def arbol(H, R, seed):
    def cono(R, H, rt):
        return (Manifold.cylinder(0.01, R, R, SEG) + sph(rt, (0, 0, H - rt))).hull()
    m = cono(R, H, 3) - cono(R - PARED * 1.25, H - 9, 0.5).translate([0, 0, -0.01])
    rng = np.random.default_rng(seed)
    z = 9.0
    while z < H - 16:
        rz = R * (1 - z / H)
        d = float(rng.uniform(3.0, max(3.2, min(8.0, rz * 0.7))))
        n = max(3, int(2 * math.pi * rz / (d + 9)))
        a0 = rng.uniform(0, 360)
        for k in range(n):
            if rng.random() < 0.15: continue
            dd = d * rng.uniform(0.7, 1.0)
            m -= (Manifold.cylinder(R + 5, dd / 2, dd / 2, 32).rotate([0, 90, 0])
                  .translate([0, 0, z + rng.uniform(-2, 2)]).rotate([0, 0, a0 + 360 * k / n]))
        z += d + 5.5
    return m

# ---------------------------------------------------------------- casas
def pent(w, alto, y0, y1, zb=0.0):
    return prism_xz([(-w / 2, zb), (w / 2, zb), (w / 2, alto), (0, alto + w / 2), (-w / 2, alto)], y0, y1)

def arco(w, h):
    return CrossSection.square([w, h - w / 2]).translate([-w / 2, 0]) + \
           CrossSection.circle(w / 2, 48).translate([0, h - w / 2])

def hueco(cara, w, h, u, z, barras=None, *, lado_w, lado_d):
    """Ventana/puerta en arco. cara: 'f' frente, 'i' izq, 'd' dcha. u = posicion a lo largo de la cara."""
    barras = (w >= 9 and z > 0) if barras is None else barras
    corte = arco(w, h).extrude(PARED + 2).rotate([90, 0, 0]).translate([u, 1, z])   # y: -PARED-1 .. 1
    add = Manifold()
    if barras:
        b = box(u - 0.7, u + 0.7, -PARED, 0, z, z + h) + box(u - w / 2, u + w / 2, -PARED, 0, z + (h - w / 2) * 0.55 - 0.7, z + (h - w / 2) * 0.55 + 0.7)
        add = b ^ corte
    def colocar(m):
        if cara == 'f': return m.translate([0, -lado_d / 2 + PARED, 0])
        m = m.translate([0, -lado_w / 2 + PARED, 0])
        return m.rotate([0, 0, -90 if cara == 'i' else 90])
    return colocar(corte), colocar(add)

def cuerpo_casa(w, d, alto, huecos, cx=0.0):
    ext = pent(w, alto, -d / 2, d / 2)
    wi = w - 2 * PARED
    inte = pent(wi, alto - PARED * (math.sqrt(2) - 1), -d / 2 + PARED, d / 2 - PARED, zb=-1)
    cortes, extras = Manifold(), Manifold()
    for hh in huecos:
        c, a = hueco(*hh, lado_w=w, lado_d=d)
        cortes += c; extras += a
    T = lambda m: m.translate([cx, 0, 0])
    return T(ext), T(inte), T(cortes), T(extras)

def tejado(w, d, alto, vuelo=5.0, t=3.5, chimenea=False, cx=0.0):
    p = alto + w / 2 + HOLG
    T = t * math.sqrt(2)
    zlow = p - (w / 2 + vuelo)
    y0, y1 = -d / 2 - vuelo, d / 2 + vuelo
    tri = lambda ap, zb: [(-(ap - zb), zb), ((ap - zb), zb), (0, ap)]
    m = prism_xz(tri(p + T, zlow), y0, y1)
    if chimenea:
        m += box(w * 0.2, w * 0.2 + 9, -4.5, 4.5, zlow, p - w * 0.2 + 7)
    m -= prism_xz(tri(p, zlow - 50), y0 - 1, y1 + 1)
    return m.translate([cx, 0, 0])

def casa_grande():
    W, D, A = 62, 46, 42
    h = [('f', 10, 16, -17, 21), ('f', 10, 16, -4, 21), ('f', 13, 22, 16, 0),
         ('i', 10, 16, 0, 16), ('d', 10, 16, 0, 16)]
    e, i, c, x = cuerpo_casa(W, D, A, h)
    return e - i - c + x, tejado(W, D, A, chimenea=True)

def casa_pequena():
    W, D, A = 44, 34, 27
    h = [('f', 6.5, 9.5, -9, 4), ('f', 6.5, 9.5, 9, 4), ('f', 6.5, 9.5, -9, 16), ('f', 6.5, 9.5, 9, 16),
         ('i', 7, 11, 0, 9), ('d', 7, 11, 0, 9)]
    e, i, c, x = cuerpo_casa(W, D, A, h)
    return e - i - c + x, tejado(W, D, A, vuelo=4, t=3, chimenea=True)

def iglesia():
    TW, TD, TA = 30, 30, 78          # torre
    NW, ND, NA, NX = 44, 36, 30, 35  # nave, desplazada a la derecha
    te, ti, tc, tx = cuerpo_casa(TW, TD, TA, [('f', 10, 20, 0, 0), ('f', 10, 18, 0, 50, False),
                                              ('i', 8, 14, 0, 52, False), ('d', 8, 14, 0, 52, False)])
    ne, ni, nc, nx = cuerpo_casa(NW, ND, NA, [('f', 8, 12, -9, 9, False), ('f', 8, 12, 9, 9, False),
                                              ('d', 9, 14, 0, 8)], cx=NX)
    # la nave va alineada con el frente de la torre
    dy = -(ND - TD) / 2
    ne, ni, nc, nx = [m.translate([0, dy, 0]) for m in (ne, ni, nc, nx)]
    cuerpo = (te + ne) - (ti + ni) - tc - nc + tx + nx
    tej_t = tejado(TW, TD, TA, vuelo=4, t=3)
    tej_n = tejado(NW, ND, NA, vuelo=4, t=3, cx=NX).translate([0, dy, 0])
    tej_n -= box(-TW / 2 - HOLG, TW / 2 + HOLG, -TD / 2 - HOLG, TD / 2 + HOLG, 0, 200)
    return cuerpo, tej_t, tej_n

# ---------------------------------------------------------------- establo, estrella, valla, base
EST_P, EST_D = 92.0, 40.0
def establo():
    tan = math.tan(math.radians(30)); g = 7 / math.cos(math.radians(30)); E = 60
    techo = [(-E, EST_P - E * tan), (0, EST_P), (E, EST_P - E * tan), (E, EST_P - g - E * tan),
             (0, EST_P - g), (-E, EST_P - g - E * tan)]
    cs = CrossSection([techo[::-1]])
    for s in (-1, 1):
        x0 = s * 52
        cs += CrossSection([[(x0, 0), (x0 - s * 7, 0), (x0 - s * 7, 58), (x0, 58)][::-s]])
    m = cs.extrude(EST_D).rotate([90, 0, 0]).translate([0, EST_D / 2, 0])
    m -= box(-4 - HOLG, 4 + HOLG, -2 - HOLG, 2 + HOLG, EST_P - 6, EST_P + 1)
    return m

def estrella2d(R=20, r2=11, ri=4.5):
    pts = []
    for k in range(16):
        a = math.radians(90 + 22.5 * k)
        rad = ri if k % 2 else (R * (1.25 if k == 0 else 1) if k % 4 == 0 else r2)
        pts.append((rad * math.cos(a), rad * math.sin(a)))
    return CrossSection([pts])

def estrella_palo(zc=118.0, hondo=5.0):      # tumbada; el palo entra 5 mm en la base
    s = estrella2d(18, 10, 4).translate([0, zc])
    return (s + CrossSection.square([5, zc + hondo]).translate([-2.5, -hondo])).extrude(4)

def estrella_establo():
    s = estrella2d(20, 11, 4.5).translate([0, 18])
    return (s + CrossSection.square([8, 24]).translate([-4, -6])).extrude(4)

def valla(n=5, paso=13.0, alto=27.0, g=5.0):
    cs = CrossSection()
    for k in range(n):
        x = k * paso
        cs += CrossSection([[(x, 0), (x + 7, 0), (x + 7, alto - 4), (x + 3.5, alto), (x, alto - 4)]])
    L = (n - 1) * paso + 7
    cs += CrossSection.square([L + 6, 4]).translate([-3, 6]) + CrossSection.square([L + 6, 4]).translate([-3, 15])
    return cs.extrude(g).translate([-L / 2, 0, 0])

BASE_L, BASE_A, BASE_H = 210.0, 125.0, 6.0
HOYO = (40.0, 55.5)
def base(agujero):
    r = BASE_A / 2; dx = BASE_L / 2 - r
    def st(rr): return (CrossSection.circle(rr, 128).translate([-dx, 0]) + CrossSection.circle(rr, 128).translate([dx, 0])).hull()
    m = (st(r).extrude(BASE_H - 2) + st(r - 2).extrude(BASE_H)).hull()
    if agujero:
        m -= box(HOYO[0] - 2.5 - HOLG, HOYO[0] + 2.5 + HOLG, HOYO[1] - 2 - HOLG, HOYO[1] + 2 + HOLG, 1, BASE_H + 1)
    return m

# ================================================================ construir
P = {}   # nombre -> (manifold en posicion de montaje, color, transformacion para imprimir)
def reg(nombre, m, color, imprimir=None): P[nombre] = (m, color, imprimir)

maria, cab_m = figura(62)
jose, cab_j, POS_BASTON = figura(72, baston=True)
tumbar_cara = lambda m: m.rotate([90, 0, 0])           # cabeza: apoyo plano trasero
reg('maria_cuerpo', maria, CREMA); reg('maria_cabeza', cab_m, MADERA, tumbar_cara)
reg('jose_cuerpo', jose, OSCURO);  reg('jose_cabeza', cab_j, MADERA, tumbar_cara)
reg('jose_baston', baston().rotate([90, 0, 0]).translate([0, 2, 0]).rotate([0, 0, 130]).translate([POS_BASTON[0], POS_BASTON[1], 0]),
    CREMA, lambda m: baston())
cu, ni, nc = pesebre()
reg('pesebre_cuenco', cu, MADERA); reg('nino_cuerpo', ni, CREMA); reg('nino_cabeza', nc, MADERA)
reg('arbol_grande', arbol(105, 27, 1), CREMA)
reg('arbol_mediano', arbol(80, 22, 2), CREMA)
reg('arbol_pequeno', arbol(60, 18, 3), CREMA)
c, t = casa_grande();  reg('casa_grande_cuerpo', c, CREMA); reg('casa_grande_tejado', t, OSCURO)
c, t = casa_pequena(); reg('casa_pequena_cuerpo', c, CREMA); reg('casa_pequena_tejado', t, OSCURO)
c, t1, t2 = iglesia()
reg('iglesia_cuerpo', c, CREMA); reg('iglesia_tejado_torre', t1, OSCURO); reg('iglesia_tejado_nave', t2, OSCURO)
reg('establo', establo(), CREMA, lambda m: m.rotate([-90, 0, 0]))
reg('estrella_establo', estrella_establo().rotate([90, 0, 0]).translate([0, 2, EST_P - 6]), CREMA, lambda m: estrella_establo())
reg('estrella_con_palo', estrella_palo().rotate([90, 0, 0]).translate([HOYO[0], HOYO[1] + 2, BASE_H]), CREMA, lambda m: estrella_palo())
reg('valla', valla().rotate([90, 0, 0]).translate([0, 2.5, 0]), OSCURO, lambda m: valla())
reg('base_lisa', base(False), CREMA); reg('base_con_agujero_estrella', base(True), CREMA)

def to_tm(m, color=None):
    me = m.to_mesh()
    t = trimesh.Trimesh(np.asarray(me.vert_properties)[:, :3], np.asarray(me.tri_verts), process=False)
    if color: t.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(baseColorFactor=list(color) + [255], roughnessFactor=0.8, metallicFactor=0.0))
    return t

if __name__ == '__main__':
    os.makedirs('stl', exist_ok=True); os.makedirs('preview', exist_ok=True)
    print(f"{'pieza':28s} {'X':>6s} {'Y':>6s} {'Z':>6s}  estanca")
    for n, (m, col, imp) in P.items():
        pm = imp(m) if imp else m
        b = pm.bounding_box()
        pm = pm.translate([-(b[0] + b[3]) / 2, -(b[1] + b[4]) / 2, -b[2]])
        t = to_tm(pm); t.export(f'stl/{n}.stl')
        e = t.extents
        print(f"{n:28s} {e[0]:6.1f} {e[1]:6.1f} {e[2]:6.1f}  {t.is_watertight}")

    def col(*items):          # (nombre, x, y, giro, sobre_base)
        sc = trimesh.Scene()
        for it in items:
            n, x, y = it[0], it[1], it[2]
            g = it[3] if len(it) > 3 else 0
            m, c, _ = P[n]
            z = 0 if n.startswith('base') or n == 'estrella_con_palo' else BASE_H
            sc.add_geometry(to_tm(m.rotate([0, 0, g]).translate([x, y, z]), c), node_name=n + str(len(sc.geometry)))
        return sc
    def grupo(pref, x, y, g=0): return [(n, x, y, g) for n in P if n.startswith(pref)]
    sagrada = lambda mx, my, px, py, jx, jy: (grupo('maria', mx, my, 15) + grupo('pesebre', px, py) +
                                              grupo('nino', px, py) + grupo('jose', jx, jy, -15))
    E = {
        'belen_1_casa': [('base_con_agujero_estrella', 0, 0), ('estrella_con_palo', 0, 0)] + grupo('casa_grande', 2, 22)
            + [('arbol_grande', -66, 20), ('arbol_mediano', 76, 6)] + sagrada(-30, -22, 8, -38, 44, -20),
        'belen_2_establo': [('base_lisa', 0, 0), ('establo', 18, 22), ('estrella_establo', 18, 22),
                            ('arbol_grande', -64, 30), ('arbol_pequeno', 86, -6)] + grupo('casa_pequena', -70, -14)
            + sagrada(-8, -6, 22, -30, 50, -4),
        'belen_3_pueblo': [('base_con_agujero_estrella', 0, 0), ('estrella_con_palo', 0, 0)] + grupo('iglesia', -8, 24)
            + grupo('casa_pequena', -42, 0) + [('arbol_grande', -72, 26), ('arbol_mediano', 80, 4),
               ('arbol_pequeno', -86, -14), ('valla', -52, -44)] + sagrada(-12, -28, 22, -42, 52, -20),
    }
    for n, items in E.items(): col(*items).export(f'preview/{n}.glb')

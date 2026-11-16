"""KAI KORA - Estacion de paseo v1 (colgador de correa + rollo de bolsas + nombre).

Uso:  python3 estacion_paseo.py NOMBRE
Genera <nombre>_base.stl, <nombre>_nombre.stl (para otro color en el AMS) y un .step editable.
Se imprime tumbada sobre la espalda, sin soportes. Medidas en mm.
"""
import math, sys
import cadquery as cq

NOMBRE = (sys.argv[1] if len(sys.argv) > 1 else "LUNA").upper()

ANCHO, ALTO, GROSOR, RADIO = 176, 85, 4, 12
ALTURA_TEXTO, RELIEVE = 16, 0.8
TORNILLOS = [(-72, 26), (72, 26)]          # tornillo de 4 mm avellanado
GANCHOS_X, GANCHO_Y = [-62, -22], -14      # dos ganchos: correa y collar/arnes
GANCHO_D, GANCHO_L, INCLINACION = 14, 30, 30
CUNA_X0, CUNA_ANCHO, CUNA_Y0 = 16, 66, -34 # cuna para rollo de bolsas (hasta 61 mm de largo)
CUNA_FONDO, CUNA_ANGULO, PARED = 38, 25, 2.4

# Placa
base = (cq.Workplane("XY").rect(ANCHO, ALTO).extrude(GROSOR)
        .edges("|Z").fillet(RADIO).faces(">Z").edges().chamfer(0.8))

# Ganchos inclinados hacia arriba (se imprimen sin soportes)
def gancho(x):
    cuerpo = cq.Workplane("XY").workplane(offset=-8).circle(GANCHO_D / 2).extrude(GANCHO_L + 8)
    refuerzo = cq.Workplane("XY").add(cq.Solid.makeCone(GANCHO_D / 2 + 4, GANCHO_D / 2, 8, pnt=cq.Vector(0, 0, -2)))
    tope = cq.Workplane("XY").add(cq.Solid.makeCone(GANCHO_D / 2, GANCHO_D / 2 + 3.5, 6, pnt=cq.Vector(0, 0, GANCHO_L)))
    tapa = cq.Workplane("XY").workplane(offset=GANCHO_L + 6).circle(GANCHO_D / 2 + 3.5).extrude(2)
    g = cuerpo.union(refuerzo).union(tope).union(tapa)
    return g.rotate((0, 0, 0), (1, 0, 0), -INCLINACION).translate((x, GANCHO_Y, GROSOR))

for x in GANCHOS_X:
    base = base.union(gancho(x))

# Cuna del rollo: suelo inclinado + dos laterales triangulares
sube = CUNA_FONDO * math.tan(math.radians(CUNA_ANGULO))
z0, z1 = GROSOR - 0.5, GROSOR + CUNA_FONDO
suelo = (cq.Workplane("YZ").workplane(offset=CUNA_X0)
         .polyline([(CUNA_Y0, z0), (CUNA_Y0 + sube, z1), (CUNA_Y0 + sube - 3.3, z1), (CUNA_Y0 - 3.3, z0)])
         .close().extrude(CUNA_ANCHO))
base = base.union(suelo)
for x in (CUNA_X0, CUNA_X0 + CUNA_ANCHO - PARED):
    lateral = (cq.Workplane("YZ").workplane(offset=x)
               .polyline([(CUNA_Y0 - 3.3, z0), (CUNA_Y0 + sube - 3.3, z1), (CUNA_Y0 + sube + 2, z1), (CUNA_Y0 + 46, z0)])
               .close().extrude(PARED))
    base = base.union(lateral)

# Recortar lo que sobresalga por detras y taladrar
base = base.intersect(cq.Workplane("XY").box(400, 400, 200, centered=(True, True, False)))
base = (base.faces("<Z").workplane(invert=True).pushPoints(TORNILLOS).hole(4.5))
for (x, y) in TORNILLOS:  # avellanado por delante
    base = base.cut(cq.Workplane("XY").add(cq.Solid.makeCone(2.25, 4.6, 2.4, pnt=cq.Vector(x, y, GROSOR - 2.4))))

# Nombre en relieve (pieza aparte para asignarle otro filamento)
texto = (cq.Workplane("XY").workplane(offset=GROSOR)
         .center(0, 24).text(NOMBRE, ALTURA_TEXTO, RELIEVE, font="Inter", kind="bold"))
bb = texto.val().BoundingBox()
if bb.xlen > 120:
    sys.exit(f"Nombre demasiado largo ({bb.xlen:.0f} mm): baja ALTURA_TEXTO")

n = NOMBRE.lower()
cq.exporters.export(base, f"{n}_base.stl", tolerance=0.02, angularTolerance=0.1)
cq.exporters.export(texto, f"{n}_nombre.stl", tolerance=0.02, angularTolerance=0.1)
asm = cq.Assembly().add(base, name="base", color=cq.Color(0.92, 0.9, 0.86)).add(texto, name="nombre", color=cq.Color(0.16, 0.16, 0.13))
asm.save(f"{n}_estacion.step")
vol = (base.val().Volume() + texto.val().Volume()) / 1000
bbb = base.val().BoundingBox()
print(f"Volumen macizo {vol:.1f} cm3 | caja {bbb.xlen:.0f} x {bbb.ylen:.0f} x {bbb.zlen:.0f} mm | solido valido: {base.val().isValid()}")

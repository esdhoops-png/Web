"""Traza el logo (PNG) a SVG en los colores de marca."""
from PIL import Image, ImageFilter
import numpy as np, potrace

SRC = "/tmp/claude-0/-home-user-Web/84e3affe-f391-5057-be70-fa9474b58a08/images/1.png"
K = 6  # ampliacion antes de trazar, para suavizar bordes
im = Image.open(SRC).convert("L")
W, H = im.size
big = np.asarray(im.resize((W * K, H * K), Image.BICUBIC).filter(ImageFilter.GaussianBlur(K * 0.6))).astype(float)
bg, fg = np.percentile(big, 99), np.percentile(big, 1)
mask = big < (bg + fg) / 2

def paths(m):
    out = []
    for c in potrace.Bitmap(~m).trace(turdsize=20, alphamax=1.1, opttolerance=0.8):  # la libreria traza los False
        p = lambda q: f"{q.x / K:.2f},{q.y / K:.2f}"
        d = f"M{p(c.start_point)}"
        for s in c.segments:
            d += f"L{p(s.c)}L{p(s.end_point)}" if s.is_corner else f"C{p(s.c1)} {p(s.c2)} {p(s.end_point)}"
        out.append(d + "Z")
    return " ".join(out)

def svg(name, m, box, ink, fondo=None):
    x, y, w, h = box
    rect = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fondo}"/>' if fondo else ""
    open(name, "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}">{rect}'
                          f'<path fill="{ink}" fill-rule="evenodd" d="{paths(m)}"/></svg>\n')

C = {"carbon": "#292822", "blanco": "#F8F6F1", "salvia": "#A6A18D", "beige": "#EAE5DC"}
full = (0, 0, W, H)
for t in ("carbon", "blanco", "salvia"):
    svg(f"logo-{t}.svg", mask, full, C[t])
svg("logo-carbon-sobre-beige.svg", mask, full, C["carbon"], C["beige"])
svg("logo-blanco-sobre-carbon.svg", mask, full, C["blanco"], C["carbon"])

# Simbolo solo (la K con el conejo): filas por encima del hueco entre la K y "KAI"
rows = mask.any(1); ys = np.where(rows)[0]
gap = next(i for i in range(ys[0], H * K) if not rows[i])
sym = mask.copy(); sym[gap:] = False
xs = np.where(sym.any(0))[0]
m = 30  # margen
side = max(xs[-1] - xs[0], gap - ys[0]) / K + 2 * m
cx, cy = (xs[0] + xs[-1]) / 2 / K, (ys[0] + gap) / 2 / K
box = tuple(round(float(v), 1) for v in (cx - side / 2, cy - side / 2, side, side))
for t in ("carbon", "blanco"):
    svg(f"simbolo-{t}.svg", sym, box, C[t])
svg("simbolo-avatar.svg", sym, box, C["carbon"], C["beige"])
print("simbolo caja", box)

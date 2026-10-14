"""Kai Kora cover: the logo as 3D letters mounted on a wall, seen from the side.
Usage: python3 cover3d.py out.png [yaw_degrees] [tagline 0/1]"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = sys.argv[1]
YAW = np.radians(float(sys.argv[2]) if len(sys.argv) > 2 else 38)
TAG = (sys.argv[3] != '0') if len(sys.argv) > 3 else True
W, H = 1080, 1920
here = __file__.rsplit('/', 1)[0]

BG = np.array([198, 194, 182], np.float32)
INK = np.array([74, 78, 61], np.float32)

# ---------- crisp high-res logo mask ----------
src = np.asarray(Image.open(f'{here}/logo.jpg').convert('L')).astype(np.float32)
ink_l = float(np.median(src[src < 110]))
a = np.clip((183 - src) / (183 - ink_l), 0, 1)[262:799, 574:959]
UP = 3
m = Image.fromarray((a * 255).astype(np.uint8))
m = m.resize((m.width * UP, m.height * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
m = np.asarray(m).astype(np.float32) / 255.0
m = np.clip((m - 0.5) * 4 + 0.5, 0, 1)                  # re-sharpen edges
MH, MW = m.shape
MASK = Image.fromarray((m * 255).astype(np.uint8))

# front face: soft emboss so the face edges catch the light
bl = np.asarray(MASK.filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255.0
gy, gx = np.gradient(bl)
emb = (-gx * 0.75 - gy * 0.65) * 9                       # light from upper-left
face_shade = np.clip(1.0 + emb, 0.55, 1.6)

# ---------- camera ----------
WORLD_W = 1.0                                           # logo width in world units
px2w = WORLD_W / MW
D_CAM, F = 3.0, 2650.0
CX, CY = W / 2 + 10, 905
DEPTH, GAP = 0.032, 0.045                                # letter thickness, standoff from wall
c, s = np.cos(YAW), np.sin(YAW)

def project(x, y, z):
    xr = x * c + z * s
    zr = -x * s + z * c + D_CAM
    return CX + F * xr / zr, CY + F * (y - 0.02) / zr

def plane_coeffs(z, off=(0.0, 0.0)):
    """PIL PERSPECTIVE coeffs mapping output pixels -> mask pixels for the logo plane at depth z"""
    src_pts = [(0, 0), (MW, 0), (MW, MH), (0, MH)]
    dst = []
    for (u, v) in src_pts:
        x = (u - MW / 2) * px2w + off[0]
        y = (v - MH / 2) * px2w + off[1]
        dst.append(project(x, y, z))
    A, b = [], []
    for (X, Y), (u, v) in zip(dst, src_pts):
        A.append([X, Y, 1, 0, 0, 0, -u * X, -u * Y]); b.append(u)
        A.append([0, 0, 0, X, Y, 1, -v * X, -v * Y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float))

def warp(img, z, off=(0.0, 0.0), resample=Image.BICUBIC):
    out = img.transform((W, H), Image.PERSPECTIVE, plane_coeffs(z, off), resample)
    return np.asarray(out).astype(np.float32) / 255.0

# ---------- wall ----------
rng = np.random.default_rng(7)
grain = Image.fromarray(rng.normal(128, 40, (H // 2, W // 2)).clip(0, 255).astype(np.uint8))
grain = np.asarray(grain.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# soft light pool from the upper left, falling off across the wall
light = 1.05 - 0.16 * np.sqrt(((xx - W * 0.25) / W) ** 2 + ((yy - H * 0.30) / H) ** 2) * 1.6
img = BG[None, None, :] * light[..., None] + ((grain - 128) / 128 * 2.0)[..., None]

# ---------- shadows on the wall ----------
wall_z = DEPTH + GAP
soft = warp(MASK.filter(ImageFilter.GaussianBlur(28)), wall_z, (0.075, 0.06))
tight = warp(MASK.filter(ImageFilter.GaussianBlur(8)), wall_z, (0.025, 0.02))
sh = np.clip(soft * 0.30 + tight * 0.22, 0, 0.5)
img *= (1 - sh)[..., None]

# ---------- extruded sides (back to front) ----------
N = 40
for i in range(N, 0, -1):
    z = DEPTH * i / N
    lay = warp(MASK, z, resample=Image.BILINEAR)
    t = i / N                                             # 1 at the wall, 0 at the front
    col = INK * (0.50 - 0.18 * t)                        # sides darker, deeper = darker
    img = img * (1 - lay[..., None]) + col[None, None, :] * lay[..., None]

# rim light along the front edge of the sides
rim = np.clip(warp(MASK, DEPTH * 0.6 / N) - warp(MASK, 0.0), 0, 1)

# ---------- front face ----------
face = warp(MASK, 0.0)
shade = warp(Image.fromarray(np.clip(face_shade / 1.6 * 255, 0, 255).astype(np.uint8)), 0.0) * 1.6
shade = np.where(face > 0.01, shade, 1.0)
gradx = 1.20 - 0.14 * (xx / W)                            # face slightly brighter toward the light
col = INK[None, None, :] * (shade * gradx)[..., None]
img = img * (1 - face[..., None]) + col * face[..., None]
img = img + (rim * 18)[..., None]

# ---------- tagline ----------
if TAG:
    pil = Image.fromarray(img.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(pil)
    f = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', 34)
    text, track = 'HOGAR  ·  MASCOTAS', 9
    ws = [f.getlength(ch) for ch in text]; tw = sum(ws) + track * (len(text) - 1)
    x = W / 2 - tw / 2
    for ch, w_ in zip(text, ws):
        d.text((x, 1575), ch, font=f, fill=tuple(int(v) for v in INK)); x += w_ + track
    img = np.asarray(pil).astype(np.float32)

Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(OUT)

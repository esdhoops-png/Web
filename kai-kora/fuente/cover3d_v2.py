"""Kai Kora cover v2: vectorized logo as 3D letters on a limewash wall with window light.
Usage: python3 cover3d_v2.py out.png [yaw_degrees]"""
import sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
YAW = np.radians(float(sys.argv[2]) if len(sys.argv) > 2 else 32)
SS = 2                                   # supersampling
W, H = 1080 * SS, 1920 * SS
here = __file__.rsplit('/', 1)[0]
rng = np.random.default_rng(11)

INK = np.array([72, 77, 58], np.float32)
WALL = np.array([203, 198, 186], np.float32)

# ---------- vectorize the logo: smooth contours, redraw anti-aliased ----------
src = cv2.imread(f'{here}/logo.jpg', cv2.IMREAD_GRAYSCALE).astype(np.float32)
ink_l = float(np.median(src[src < 110]))
a = np.clip((183 - src) / (183 - ink_l), 0, 1)[262:799, 574:959]
UP = 6
big = cv2.resize(a, None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), UP * 0.6)
binm = (big > 0.5).astype(np.uint8)
contours, _ = cv2.findContours(binm, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
MH, MW = binm.shape
canvas = np.zeros((MH * 4, MW * 4), np.uint8)              # draw at 4x with sub-pixel shift for AA
smoothed = []
for cnt in contours:
    p = cnt[:, 0, :].astype(np.float32)
    if len(p) < 12: continue
    k = max(3, min(len(p) // 4, int(UP * 1.6)))
    kern = np.exp(-0.5 * (np.arange(-3 * k, 3 * k + 1) / k) ** 2); kern /= kern.sum()
    ext = np.concatenate([p[-3 * k:], p, p[:3 * k]])
    sx = np.convolve(ext[:, 0], kern, 'valid'); sy = np.convolve(ext[:, 1], kern, 'valid')
    smoothed.append(np.stack([sx, sy], 1))
# even-odd fill handles the holes (bunny, counters of A/O/R)
mask_img = Image.new('L', (MW * 4, MH * 4), 0)
d = ImageDraw.Draw(mask_img)
layer = np.zeros((MH * 4, MW * 4), np.uint8)
for poly in smoothed:
    tmp = Image.new('1', (MW * 4, MH * 4), 0)
    ImageDraw.Draw(tmp).polygon([(x * 4 + 2, y * 4 + 2) for x, y in poly], fill=1)
    layer ^= np.asarray(tmp, dtype=np.uint8)
mask = cv2.resize(layer.astype(np.float32), (MW, MH), interpolation=cv2.INTER_AREA)

# side shading from the outward boundary normal (in the logo plane)
bl = cv2.GaussianBlur(mask, (0, 0), 4)
gy, gx = np.gradient(bl)
gl = np.sqrt(gx ** 2 + gy ** 2) + 1e-6
nx, ny = -gx / gl, -gy / gl                                  # outward normal
c, s = np.cos(YAW), np.sin(YAW)
LIGHT = np.array([-0.55, -0.55, -0.63]); LIGHT /= np.linalg.norm(LIGHT)   # from upper-left-front
# rotate normal (nx, ny, 0) by yaw about Y
wnx, wnz = nx * c, -nx * s
lam = np.clip(-(wnx * LIGHT[0] + ny * LIGHT[1] + wnz * LIGHT[2]), 0, 1)
side_shade = 0.28 + 0.62 * lam                               # 0..1 multiplier for sides

# front face: soft emboss + gentle diagonal gradient
bl2 = cv2.GaussianBlur(mask, (0, 0), 7)
ey, ex = np.gradient(bl2)
emb = np.clip(1 + (-ex * 0.7 - ey * 0.7) * 14, 0.6, 1.5)
vv, uu = np.mgrid[0:MH, 0:MW].astype(np.float32)
face_shade = emb * (1.12 - 0.10 * (uu / MW) - 0.08 * (vv / MH))

# ---------- camera ----------
px2w = 1.0 / MW
D_CAM, F = 3.0, 2620.0 * SS
CX, CY = W / 2 + 8 * SS, 900 * SS
DEPTH, GAP = 0.034, 0.05

def project(x, y, z):
    xr = x * c + z * s
    zr = -x * s + z * c + D_CAM
    return CX + F * xr / zr, CY + F * (y - 0.02) / zr

def homography(z, off=(0.0, 0.0), size=(MW, MH)):
    sw, sh = size
    src_pts = np.float32([(0, 0), (sw, 0), (sw, sh), (0, sh)])
    scale = MW / sw
    dst = []
    for u, v in src_pts:
        x = (u * scale - MW / 2) * px2w + off[0]
        y = (v * scale - MH / 2) * px2w + off[1]
        dst.append(project(x, y, z))
    return cv2.getPerspectiveTransform(src_pts, np.float32(dst))

def warp(img, z, off=(0.0, 0.0), interp=cv2.INTER_LINEAR):
    Hm = homography(z, off, (img.shape[1], img.shape[0]))
    return cv2.warpPerspective(img, Hm, (W, H), flags=interp, borderMode=cv2.BORDER_CONSTANT)

# ---------- wall: limewash texture + window light with leaves ----------
def noise(scale, seed):
    r = np.random.default_rng(seed)
    small = r.normal(0, 1, (H // scale + 2, W // scale + 2)).astype(np.float32)
    return cv2.resize(small, (W, H), interpolation=cv2.INTER_CUBIC)
tex = noise(400, 1) * 0.6 + noise(140, 2) * 0.35 + noise(40, 3) * 0.2 + noise(6, 4) * 0.12 + noise(2, 5) * 0.08
img = WALL[None, None, :] * (1 + tex[..., None] * 0.022)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
falloff = 1.03 - 0.20 * np.sqrt(((xx - W * 0.2) / W) ** 2 + ((yy - H * 0.25) / H) ** 2)
img *= falloff[..., None]

# window light: two panes with a mullion, sheared, very soft
win = np.zeros((H, W), np.float32)
pane_w, pane_h, gapm = int(W * 0.30), int(H * 0.30), int(W * 0.035)
x0, y0 = int(W * 0.02), int(H * 0.06)
for k in range(2):
    for j in range(2):
        px, py = x0 + k * (pane_w + gapm), y0 + j * (pane_h + gapm)
        win[py:py + pane_h, px:px + pane_w] = 1
M = np.float32([[1, 0.0, 0], [0.42, 1, 0]])               # shear: light coming down from the left
win = cv2.warpAffine(win, M, (W, H))
# leaf shadows (a couple of thin stems with leaves) cutting into the light
leaf = np.zeros((H, W), np.uint8)
for stem in range(3):
    bx, by = W * (0.08 + stem * 0.16), H * (0.06 + stem * 0.05)
    ang0 = np.radians(55 + stem * 12)
    pts = []
    for t in np.linspace(0, 1, 9):
        ang = ang0 + 0.5 * t
        bx += np.cos(ang) * W * 0.045; by += np.sin(ang) * W * 0.045
        pts.append((int(bx), int(by)))
        if t > 0.05:
            for side in (-1, 1):
                la = ang + side * np.radians(50)
                cx_, cy_ = bx + np.cos(la) * W * 0.035, by + np.sin(la) * W * 0.035
                cv2.ellipse(leaf, (int(cx_), int(cy_)), (int(W * 0.036), int(W * 0.012)),
                            np.degrees(la), 0, 360, 255, -1, cv2.LINE_AA)
    cv2.polylines(leaf, [np.int32(pts)], False, 255, int(W * 0.004), cv2.LINE_AA)
win = win * (1 - leaf.astype(np.float32) / 255 * 0.85)
win = cv2.GaussianBlur(win, (0, 0), 14 * SS)
WARM = np.array([1.10, 1.07, 1.00], np.float32)
light_mul = (1 - 0.06) + win[..., None] * 0.17 * WARM

# ---------- tagline painted on the wall (same perspective) ----------
tag = Image.new('L', (MW, int(MW * 0.14)), 0)
fnt = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', int(MW * 0.052))
text, track = 'HOGAR  ·  MASCOTAS', MW * 0.014
ws = [fnt.getlength(ch) for ch in text]; tw = sum(ws) + track * (len(text) - 1)
x = MW / 2 - tw / 2; dd = ImageDraw.Draw(tag)
for ch, w_ in zip(text, ws):
    dd.text((x, 0), ch, font=fnt, fill=255); x += w_ + track
tag = np.asarray(tag).astype(np.float32) / 255
tag_full = np.zeros_like(mask); ty = int(MH * 1.0) - tag.shape[0]
# place below the logo: extend canvas downward
tag_canvas = np.zeros((int(MH * 1.22), MW), np.float32)
tag_canvas[int(MH * 1.045):int(MH * 1.045) + tag.shape[0]] = tag
Ht = homography(DEPTH + GAP, (0.0, (tag_canvas.shape[0] - MH) / 2 * px2w), (MW, tag_canvas.shape[0]))
# homography() assumes MH-tall source centered; recompute for the taller canvas
src_pts = np.float32([(0, 0), (MW, 0), (MW, tag_canvas.shape[0]), (0, tag_canvas.shape[0])])
dst = [project((u - MW / 2) * px2w, (v - MH / 2) * px2w, DEPTH + GAP) for u, v in src_pts]
Ht = cv2.getPerspectiveTransform(src_pts, np.float32(dst))
tagw = cv2.warpPerspective(tag_canvas, Ht, (W, H), flags=cv2.INTER_AREA)
img = img * (1 - tagw[..., None] * 0.85) + INK[None, None, :] * 1.05 * tagw[..., None] * 0.85

# ---------- shadows of the letters on the wall ----------
wall_z = DEPTH + GAP
soft = warp(cv2.GaussianBlur(mask, (0, 0), 55), wall_z, (0.045, 0.045))
tight = warp(cv2.GaussianBlur(mask, (0, 0), 9), wall_z, (0.018, 0.016))
sh = np.clip(soft * 0.30 + tight * 0.24, 0, 0.5)
img *= (1 - sh)[..., None]

# ---------- extruded returns, back to front ----------
N = 56
pack = np.dstack([mask, mask * side_shade]).astype(np.float32)
for i in range(N, 0, -1):
    z = DEPTH * i / N
    w2 = warp(pack, z)
    m_, sh_ = w2[..., 0], w2[..., 1]
    shade = np.where(m_ > 1e-3, sh_ / np.maximum(m_, 1e-3), 0)
    ao = 1 - 0.35 * (i / N) ** 2                               # darker where it meets the wall
    col = INK[None, None, :] * (shade * ao)[..., None] * 1.05
    img = img * (1 - m_[..., None]) + col * m_[..., None]

# ---------- front face ----------
pack = np.dstack([mask, mask * face_shade]).astype(np.float32)
w2 = warp(pack, 0.0)
face, fs = w2[..., 0], w2[..., 1]
fshade = np.where(face > 1e-3, fs / np.maximum(face, 1e-3), 1)
spec = np.exp(-((xx / W - 0.30) ** 2 + (yy / H - 0.30) ** 2) / 0.05) * 0.10   # soft satin sheen
col = INK[None, None, :] * (fshade[..., None] * 1.10) + 255 * spec[..., None] * 0.35
img = img * (1 - face[..., None]) + col * face[..., None]
# fine highlight on the lit front edge
edge = np.clip(warp(mask, 0.0) - warp(mask, 0.0, (0.0012, 0.0012)), 0, 1)
img += (edge * 30)[..., None]

img *= light_mul
img = cv2.resize(img.clip(0, 255), (W // SS, H // SS), interpolation=cv2.INTER_AREA)
# film grain
img += np.random.default_rng(5).normal(0, 1.6, img.shape[:2])[..., None]
Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(OUT)

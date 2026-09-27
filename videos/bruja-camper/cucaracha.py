"""Procedural, shaded render of an American cockroach (Periplaneta americana), top view, head pointing down.

Every body part writes into a height field; normals, diffuse and specular lighting are computed from it,
which gives the glossy chitin look. Legs and antennae are animated with a tripod gait.
"""
import math
import numpy as np
from PIL import Image, ImageFilter

CW, CH = 1000, 1600        # canvas size
OX, OY = 50, 120           # offset of the anatomy coordinates inside the canvas
ANCHOR = (450 + OX, 800 + OY)

_rng = np.random.default_rng(11)
_Y, _X = np.mgrid[0:CH, 0:CW].astype(np.float32)
_X -= OX
_Y -= OY


def _blur_noise(sigma, amp):
    n = _rng.normal(0, 1, (CH, CW)).astype(np.float32)
    im = Image.fromarray(((n * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sigma))
    a = np.asarray(im, np.float32) - 128
    return a / (np.abs(a).max() + 1e-6) * amp


NOISE_FINE = _blur_noise(1.2, 1.0)
NOISE_MID = _blur_noise(6, 1.0)
NOISE_BIG = _blur_noise(30, 1.0)


class Canvas:
    def __init__(self):
        self.h = np.full((CH, CW), -1e3, np.float32)   # height field (-inf = empty)
        self.col = np.zeros((CH, CW, 3), np.float32)
        self.a = np.zeros((CH, CW), np.float32)
        self.gloss = np.zeros((CH, CW), np.float32)

    def put(self, box, h, col, a, gloss):
        """Paint a part inside bounding box `box` (x0, y0, x1, y1 in canvas px); later parts go on top."""
        x0, y0, x1, y1 = box
        sl = (slice(y0, y1), slice(x0, x1))
        if not (a > 0).any():
            return
        cov = a[..., None]
        self.col[sl] = self.col[sl] * (1 - cov) + col * cov
        self.gloss[sl] = self.gloss[sl] * (1 - a) + gloss * a
        self.h[sl] = np.where(a > 0.5, h, self.h[sl])
        self.a[sl] = np.maximum(self.a[sl], a)


def _box(cx, cy, r):
    x0 = int(max(0, cx + OX - r)); x1 = int(min(CW, cx + OX + r + 1))
    y0 = int(max(0, cy + OY - r)); y1 = int(min(CH, cy + OY + r + 1))
    return x0, y0, x1, y1


def ellipsoid(cv, cx, cy, rx, ry, rot, amp, base, albedo_fn, gloss=1.0, flat=1.0):
    x0, y0, x1, y1 = _box(cx, cy, max(rx, ry) + 3)
    if x1 <= x0 or y1 <= y0:
        return
    X, Y = _X[y0:y1, x0:x1] - cx, _Y[y0:y1, x0:x1] - cy
    c, s = math.cos(rot), math.sin(rot)
    u, v = c * X + s * Y, -s * X + c * Y
    q = (u / rx) ** 2 + (v / ry) ** 2
    a = np.clip((1 - q) * min(rx, ry) / 2.5, 0, 1).astype(np.float32)
    h = base + amp * np.sqrt(np.clip(1 - q, 0, 1)) ** flat
    col = albedo_fn(u, v, q, x0, y0, x1, y1)
    cv.put((x0, y0, x1, y1), h.astype(np.float32), col, a, gloss)


def capsule(cv, p0, p1, r0, r1, base, color, gloss=0.8, noise=0.0):
    ax, ay = p0; bx, by = p1
    rm = max(r0, r1) + 3
    x0 = int(max(0, min(ax, bx) - rm + OX)); x1 = int(min(CW, max(ax, bx) + rm + OX + 1))
    y0 = int(max(0, min(ay, by) - rm + OY)); y1 = int(min(CH, max(ay, by) + rm + OY + 1))
    if x1 <= x0 or y1 <= y0:
        return
    X, Y = _X[y0:y1, x0:x1], _Y[y0:y1, x0:x1]
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy + 1e-6
    t = np.clip(((X - ax) * dx + (Y - ay) * dy) / L2, 0, 1)
    d = np.hypot(X - (ax + t * dx), Y - (ay + t * dy))
    r = r0 + (r1 - r0) * t
    a = np.clip((r - d) * 1.2, 0, 1).astype(np.float32)
    h = base + r * np.sqrt(np.clip(1 - (d / r) ** 2, 0, 1))
    col = np.empty((y1 - y0, x1 - x0, 3), np.float32)
    shade = 1 + noise * NOISE_MID[y0:y1, x0:x1]
    # slightly darker towards the joints
    joint = 0.8 + 0.2 * np.sin(np.pi * t)
    for k in range(3):
        col[..., k] = color[k] * shade * joint
    cv.put((x0, y0, x1, y1), h.astype(np.float32), col, a, gloss)


def mix(c1, c2, f):
    f = np.clip(f, 0, 1)[..., None]
    return np.asarray(c1, np.float32) * (1 - f) + np.asarray(c2, np.float32) * f


# ---------------------------------------------------------------- body parts albedo
def wing_albedo(side):
    def fn(u, v, q, x0, y0, x1, y1):
        base = mix((118, 50, 16), (62, 24, 8), np.clip(q * 1.3 - 0.2, 0, 1))            # darker to the edges
        base = mix(base, (150, 78, 32), np.clip(-v / 360, 0, 1) * 0.5)                      # lighter towards the rear tip
        veins = 0.5 + 0.5 * np.sin(u * 0.33 + v * 0.02 * side + NOISE_MID[y0:y1, x0:x1] * 3)
        cross = 0.5 + 0.5 * np.sin(v * 0.12 + u * 0.05 + NOISE_MID[y0:y1, x0:x1] * 4)
        k = 1 - 0.10 * veins ** 6 - 0.05 * cross ** 12 + 0.05 * NOISE_FINE[y0:y1, x0:x1] + 0.18 * NOISE_BIG[y0:y1, x0:x1]
        edge = np.clip((q - 0.9) * 10, 0, 1)[..., None]
        out = base * k[..., None]
        out = out * (1 - edge) + np.array([175, 110, 55], np.float32) * edge * 0.9             # translucent rim
        return out
    return fn


def pronotum_albedo(u, v, q, x0, y0, x1, y1):
    pale = np.array([150, 95, 40], np.float32)
    dark = np.array([52, 20, 8], np.float32)
    # dark central blotch with two lobes, the classic American-cockroach mark
    lobes = np.minimum(((np.abs(u) - 60) / 95) ** 2 + ((v + 5) / 88) ** 2,
                       (u / 80) ** 2 + ((v - 35) / 70) ** 2)
    blot = np.clip((1.2 - lobes) * 2.5, 0, 1)
    col = mix(pale, dark, blot)
    col = mix(col, (120, 70, 30), np.clip((q - 0.93) * 12, 0, 1))
    return col * (1 + 0.07 * NOISE_FINE[y0:y1, x0:x1][..., None] + 0.05 * NOISE_BIG[y0:y1, x0:x1][..., None])


def head_albedo(u, v, q, x0, y0, x1, y1):
    col = mix((110, 52, 20), (60, 26, 10), q)
    return col * (1 + 0.06 * NOISE_FINE[y0:y1, x0:x1][..., None])


def solid(c):
    def fn(u, v, q, x0, y0, x1, y1):
        return np.broadcast_to(np.asarray(c, np.float32), u.shape + (3,)).copy()
    return fn


# ---------------------------------------------------------------- legs / antennae
LEG_COL = (120, 54, 20)
TIB_COL = (140, 70, 28)
LEGS = [  # base, femur end, tibia end, tarsus end, phase group  (right side; left is mirrored)
    ((105, 1010), (250, 1075), (330, 1250), (355, 1390), 0),
    ((140, 905), (320, 885), (470, 1000), (535, 1095), 1),
    ((135, 800), (330, 690), (470, 470), (505, 330), 0),
]


def _rot(p, c, ang):
    s, co = math.sin(ang), math.cos(ang)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + co * x - s * y, c[1] + s * x + co * y)


def legs(cv, t, layer_base):
    for side in (-1, 1):
        for i, (b, f, tb, ts, grp) in enumerate(LEGS):
            ph = t * 20 + (grp + (side > 0)) * math.pi
            swing = math.radians(13) * math.sin(ph) * side
            lift = 1 + 0.06 * max(0, math.cos(ph))
            P = [(450 + side * p[0], p[1]) for p in (b, f, tb, ts)]
            P = [P[0]] + [_rot(p, P[0], swing) for p in P[1:]]
            P[3] = (P[2][0] + (P[3][0] - P[2][0]) * lift, P[2][1] + (P[3][1] - P[2][1]) * lift)
            capsule(cv, P[0], P[1], 30, 20, layer_base, LEG_COL, noise=0.08)
            capsule(cv, P[1], P[2], 15, 10, layer_base + 2, TIB_COL, noise=0.08)
            # spines along the tibia
            for k in range(1, 8):
                f = k / 8
                sx = P[1][0] + (P[2][0] - P[1][0]) * f
                sy = P[1][1] + (P[2][1] - P[1][1]) * f
                dx, dy = P[2][0] - P[1][0], P[2][1] - P[1][1]
                n = math.hypot(dx, dy) + 1e-6
                for sgn in (-1, 1):
                    ex = sx + (dx / n) * 22 + sgn * (-dy / n) * 30
                    ey = sy + (dy / n) * 22 + sgn * (dx / n) * 30
                    capsule(cv, (sx, sy), (ex, ey), 4, 1.2, layer_base + 3, (55, 24, 9), gloss=0.5)
            # segmented tarsus
            for k in range(5):
                f0, f1 = k / 5, (k + 0.85) / 5
                a = (P[2][0] + (P[3][0] - P[2][0]) * f0, P[2][1] + (P[3][1] - P[2][1]) * f0)
                c = (P[2][0] + (P[3][0] - P[2][0]) * f1, P[2][1] + (P[3][1] - P[2][1]) * f1)
                capsule(cv, a, c, 6.5, 5, layer_base + 2, (160, 90, 40), gloss=0.6)


def antennae(cv, t):
    for side in (-1, 1):
        x, y = 450 + side * 30, 1150
        ang = side * 0.25
        for k in range(46):
            f = k / 45
            ang += side * 0.028 + 0.05 * math.sin(t * 11 + side * 2 + f * 5) * f
            nx, ny = x + 26 * math.sin(ang), y + 26 * math.cos(ang)
            capsule(cv, (x, y), (nx, ny), 5.5 - 3 * f, 5.0 - 3 * f, 60, (135, 66, 26) if k % 2 else (110, 52, 20), gloss=0.7)
            x, y = nx, ny


# ---------------------------------------------------------------- static body (rendered once)
def _body(cv):
    for side in (-1, 1):   # cerci
        capsule(cv, (450 + side * 40, 300), (450 + side * 95, 170), 11, 5, 30, (120, 58, 22))
        for k in range(8):
            f = k / 8
            capsule(cv, (450 + side * (40 + 55 * f), 300 - 130 * f), (450 + side * (40 + 55 * f) + side * 9, 300 - 130 * f - 4), 2, 1, 32, (80, 40, 15))
    ellipsoid(cv, 450, 640, 185, 400, 0, 55, 40, solid((40, 18, 7)), gloss=0.4)                 # abdomen underside
    ellipsoid(cv, 452, 1128, 78, 62, 0, 30, 45, head_albedo, gloss=0.9)                        # head
    for side in (-1, 1):
        ellipsoid(cv, 450 + side * 46, 1135, 18, 30, side * 0.4, 8, 70, solid((18, 10, 8)), gloss=1.6)  # eyes
        capsule(cv, (450 + side * 22, 1175), (450 + side * 38, 1215), 9, 6, 60, (100, 45, 18))       # palps
    ellipsoid(cv, 434, 600, 168, 395, 0.06, 26, 70, wing_albedo(-1), gloss=1.3, flat=0.45)       # left tegmen
    ellipsoid(cv, 466, 596, 168, 395, -0.06, 26, 92, wing_albedo(1), gloss=1.3, flat=0.45)
    ellipsoid(cv, 450, 985, 200, 130, 0, 20, 110, pronotum_albedo, gloss=1.3, flat=0.6)          # pronotum shield


_STATIC = None


def _static():
    global _STATIC
    if _STATIC is None:
        cv = Canvas()
        _body(cv)
        _STATIC = cv
    return _STATIC


def render(t):
    """RGBA image of the cockroach at time t (seconds)."""
    cv = Canvas()
    legs(cv, t, 20)
    st = _static()
    cv.put((0, 0, CW, CH), st.h, st.col, st.a, st.gloss)
    antennae(cv, t)
    cv.a = np.maximum(cv.a, st.a)

    # lighting from the height field
    h = np.where(cv.a > 0, cv.h, 0).astype(np.float32)
    h = h + (NOISE_FINE * 0.12 + NOISE_MID * 0.25) * (cv.a > 0)
    gy, gx = np.gradient(h)
    nx, ny, nz = -gx * 1.3, -gy * 1.3, np.ones_like(h)
    inv = 1 / np.sqrt(nx * nx + ny * ny + nz * nz)
    nx, ny, nz = nx * inv, ny * inv, nz * inv
    L = np.array([-0.45, -0.55, 0.70]); L /= np.linalg.norm(L)
    Hv = L + np.array([0, 0, 1.0]); Hv /= np.linalg.norm(Hv)
    diff = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    ndh = np.clip(nx * Hv[0] + ny * Hv[1] + nz * Hv[2], 0, 1)
    spec = (ndh ** 80) * 1.3 + (ndh ** 14) * 0.22
    # ambient occlusion: darken where neighbours are higher
    hb = np.asarray(Image.fromarray(np.clip(h, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10)), np.float32)
    ao = np.clip(1 - (hb - np.clip(h, 0, 255)) / 60, 0.45, 1)
    rgb = cv.col * (0.28 + 0.9 * diff)[..., None] * ao[..., None] + (spec * cv.gloss * 255 * 0.85)[..., None] * np.array([1.0, 0.95, 0.88])
    rgb = np.clip(rgb, 0, 255)

    alpha = np.clip(cv.a, 0, 1)
    # soft contact shadow on the ground
    sh = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(18))
    sh = np.roll(np.roll(np.asarray(sh, np.float32) / 255 * 0.6, 28, axis=0), 22, axis=1)
    out_a = alpha + sh * (1 - alpha)
    out_rgb = rgb * (alpha / np.maximum(out_a, 1e-4))[..., None]
    img = np.dstack([out_rgb, out_a * 255]).astype(np.uint8)
    return Image.fromarray(img, 'RGBA')


if __name__ == '__main__':
    import sys
    t = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
    bg = Image.new('RGBA', (CW, CH), (200, 195, 185, 255))
    bg.alpha_composite(render(t))
    bg.convert('RGB').save('cucaracha_test.jpg', quality=90)

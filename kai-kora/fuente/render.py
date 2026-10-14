"""Kai Kora logo animation renderer. Usage: python3 render.py W H out.mp4"""
import sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, OUT = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
FPS, DUR = 30, 7.0
here = __file__.rsplit('/', 1)[0]

# ---------- extract layers from the source logo ----------
src = Image.open(f'{here}/logo.jpg').convert('L')
L = np.asarray(src).astype(np.float32)
BG_L, INK_L = 191.0, float(np.median(L[L < 110]))
alpha = np.clip((BG_L - 8 - L) / (BG_L - 8 - INK_L), 0, 1)
alpha[alpha < 0.04] = 0

bunny_seed = np.load(f'{here}/bunny_seed.npy').astype(np.uint8) * 255
bunny_reg = np.asarray(Image.fromarray(bunny_seed).filter(ImageFilter.MaxFilter(5))) / 255.0

def crop(a, y0, y1, x0, x1):
    return a[y0:y1, x0:x1]

# source boxes (y0,y1,x0,x1) with padding
BOX_K = (266, 572, 612, 918)
BOX_KAI = (598, 708, 600, 930)
BOX_LINE = (728, 738, 578, 955)
BOX_KORA = (752, 795, 652, 884)

k_alpha = crop(alpha, *BOX_K)
bunny_r = crop(bunny_reg, *BOX_K).copy()
bunny_r[559 - BOX_K[0]:] = np.minimum(bunny_r[559 - BOX_K[0]:], k_alpha[559 - BOX_K[0]:])
k_solid = np.maximum(k_alpha, bunny_r)                  # K with bunny filled in
bunny_hole = np.clip(bunny_r * (1 - k_alpha), 0, 1)     # the bunny cut-out

def split_letters(a, min_gap=4):
    cols = a.max(0) > 0.15
    letters, x, n = [], 0, len(cols)
    while x < n:
        if cols[x]:
            s = x
            while x < n and (cols[x] or (x + min_gap < n and cols[x:x + min_gap].any())):
                x += 1
            letters.append((s, x))
        x += 1
    return letters

kai = crop(alpha, *BOX_KAI)
kora = crop(alpha, *BOX_KORA)
line = crop(alpha, *BOX_LINE)
kai_letters = split_letters(kai, 6)
kora_letters = split_letters(kora, 3)

# ---------- layout ----------
logo_src_w = 955 - 578
logo_src_h = 795 - 266
import os
FIT, YC = float(os.environ.get('FIT', 0.62)), float(os.environ.get('YC', 0.465))
S = min(W * FIT / logo_src_w, H * 0.50 / logo_src_h)   # source->output scale
CX = W / 2
TOP = H * YC - (logo_src_h * S) / 2
SRC_CX = (578 + 955) / 2

def place(box):
    y0, y1, x0, x1 = box
    return (CX + (x0 - SRC_CX) * S, TOP + (y0 - 266) * S)

def up(a, scale=S):
    h, w = a.shape
    im = Image.fromarray((a * 255).astype(np.uint8))
    im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255.0

UK_solid, UK_hole, UK_alpha = up(k_solid), up(bunny_hole), up(k_alpha)
UKAI, UKORA, ULINE = up(kai), up(kora), up(line)
UB_zone = up(bunny_r) > 0.5

# tagline
font = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', int(24 * S))
TAG = 'HOGAR  ·  MASCOTAS'
def tracked_text(text, font, track):
    widths = [font.getlength(c) for c in text]
    tw = int(sum(widths) + track * (len(text) - 1)) + 4
    asc, desc = font.getmetrics()
    im = Image.new('L', (tw, asc + desc + 4), 0)
    d = ImageDraw.Draw(im); x = 2
    for c, w in zip(text, widths):
        d.text((x, 2), c, font=font, fill=255); x += w + track
    return np.asarray(im).astype(np.float32) / 255.0
UTAG = tracked_text(TAG, font, int(7 * S)) * 0.85

# ---------- colors / background ----------
BG = np.array([196, 192, 180], np.float32)
INK = np.array([72, 75, 60], np.float32)
rng = np.random.default_rng(7)
grain = Image.fromarray((rng.normal(128, 40, (H // 2, W // 2))).clip(0, 255).astype(np.uint8))
grain = np.asarray(grain.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
grain = (grain - 128) / 128 * 2.2
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
vig = 1 - 0.10 * (((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.75)) ** 2)
BG_IMG = (BG[None, None, :] * vig[..., None] + grain[..., None]).clip(0, 255)

# ---------- easing ----------
def clamp(x): return max(0.0, min(1.0, x))
def prog(t, a, b): return clamp((t - a) / (b - a))
def ease_out(x): return 1 - (1 - x) ** 3
def ease_io(x): return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def ease_back(x, s=1.4): x -= 1; return x * x * ((s + 1) * x + s) + 1

def blit(canvas, a, x, y, op=1.0):
    if op <= 0: return
    x, y = int(round(x)), int(round(y))
    h, w = a.shape
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0: return
    canvas[y0:y1, x0:x1] = np.maximum(canvas[y0:y1, x0:x1], a[y0 - y:y1 - y, x0 - x:x1 - x] * op)

def frame(t):
    cov = np.zeros((H, W), np.float32)

    # 1) K: soft wipe up from baseline + gentle settle
    p = ease_io(prog(t, 0.35, 1.75))
    if p > 0:
        h, w = UK_solid.shape
        edge = (1 - p) * h * 1.15 - h * 0.15                 # wipe line moving up
        rows = np.arange(h, dtype=np.float32)[:, None]
        reveal = np.clip((rows - edge) / (h * 0.15), 0, 1)
        # 2) bunny pops up from behind the baseline
        b = prog(t, 1.75, 2.65)
        if b <= 0:
            k = UK_solid
        else:
            dy = int(round((1 - ease_out(b)) * h * 0.55))
            hole = np.zeros_like(UK_hole)
            if dy < h:
                if dy >= 0: hole[dy:] = UK_hole[:h - dy]
                else: hole[:h + dy] = UK_hole[-dy:]
            k = np.where(UB_zone, UK_solid * (1 - hole), UK_alpha)
            settle = prog(t, 2.45, 2.65)
            k = k * (1 - settle) + UK_alpha * settle
        x, y = place(BOX_K)
        blit(cov, k * reveal, x, y + (1 - p) * 18 * S / 1.6, ease_out(prog(t, 0.35, 1.0)))

    # 3) line draws from the center out
    p = ease_io(prog(t, 2.45, 3.35))
    if p > 0:
        h, w = ULINE.shape
        half = int(w / 2 * p)
        seg = ULINE.copy(); seg[:, :max(0, w // 2 - half)] = 0; seg[:, w // 2 + half:] = 0
        blit(cov, seg, *place(BOX_LINE))

    # 4) KAI: letters rise in, staggered
    x0, y0 = place(BOX_KAI)
    for i, (a, b) in enumerate(kai_letters):
        p = prog(t, 2.75 + i * 0.16, 3.65 + i * 0.16)
        if p > 0:
            ua, ub = int(a * S), int(np.ceil(b * S))
            blit(cov, UKAI[:, ua:ub], x0 + ua, y0 + (1 - ease_out(p)) * 22 * S / 1.6, ease_out(p))

    # 5) KORA: letters converge from wide tracking
    x0, y0 = place(BOX_KORA)
    n = len(kora_letters); mid = (n - 1) / 2
    p = prog(t, 3.45, 4.6)
    if p > 0:
        e = ease_out(p)
        for i, (a, b) in enumerate(kora_letters):
            ua, ub = int(a * S), int(np.ceil(b * S))
            off = (i - mid) * (1 - e) * 26 * S
            blit(cov, UKORA[:, ua:ub], x0 + ua + off, y0, e)

    # 6) tagline
    p = prog(t, 4.6, 5.6)
    if p > 0:
        h, w = UTAG.shape
        _, ky = place(BOX_KORA)
        blit(cov, UTAG, CX - w / 2, ky + 75 * S + (1 - ease_out(p)) * 10, ease_out(p) * 0.8)

    # global: slow push-in + fade from/to background
    z = 1 + 0.035 * ease_io(prog(t, 0, DUR))
    if z != 1:
        im = Image.fromarray((cov * 255).astype(np.uint8))
        nw, nh = int(W * z), int(H * z)
        im = im.resize((nw, nh), Image.BILINEAR).crop(((nw - W) // 2, (nh - H) // 2, (nw - W) // 2 + W, (nh - H) // 2 + H))
        cov = np.asarray(im).astype(np.float32) / 255.0

    img = BG_IMG * (1 - cov[..., None]) + INK[None, None, :] * cov[..., None]
    fade = ease_out(prog(t, 0, 0.5)) * (1 - ease_io(prog(t, DUR - 0.45, DUR)) * 0.0)
    img = BG_IMG * 0.82 * (1 - fade) + img * fade if fade < 1 else img
    return img.clip(0, 255).astype(np.uint8)

if __name__ == '__main__':
    if len(sys.argv) > 4:   # preview stills
        for t in map(float, sys.argv[4].split(',')):
            Image.fromarray(frame(t)).save(f'{OUT}_{t:.1f}.png')
        sys.exit()
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                           '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
                           '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
    for i in range(int(FPS * DUR)):
        ff.stdin.write(frame(i / FPS).tobytes())
    ff.stdin.close(); ff.wait()

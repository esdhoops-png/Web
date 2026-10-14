"""Kai Kora Reel cover: logo on one side, text on the other. Usage: python3 cover.py out.png [left|right]"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT, SIDE = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'left')
W, H = 1080, 1920
here = __file__.rsplit('/', 1)[0]
BG = np.array([196, 192, 180], np.float32)
INK = np.array([72, 75, 60], np.float32)

# background with paper grain + soft vignette (same as the video)
rng = np.random.default_rng(7)
grain = Image.fromarray(rng.normal(128, 40, (H // 2, W // 2)).clip(0, 255).astype(np.uint8))
grain = np.asarray(grain.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
vig = 1 - 0.10 * (((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.75)) ** 2)
bg = BG[None, None, :] * vig[..., None] + ((grain - 128) / 128 * 2.2)[..., None]

# logo alpha from the source image
L = np.asarray(Image.open(f'{here}/logo.jpg').convert('L')).astype(np.float32)
ink_l = float(np.median(L[L < 110]))
alpha = np.clip((183 - L) / (183 - ink_l), 0, 1); alpha[alpha < 0.04] = 0
logo = alpha[266:795, 578:955]
S = 470 / logo.shape[1]
logo = Image.fromarray((logo * 255).astype(np.uint8)).resize(
    (round(logo.shape[1] * S), round(logo.shape[0] * S)), Image.LANCZOS)

cov = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(cov)
CY = H // 2
lx = 70 if SIDE == 'left' else W - 70 - logo.width
cov.paste(logo, (lx, CY - logo.height // 2 - 10), logo)

# thin vertical divider
dx = lx + logo.width + 55 if SIDE == 'left' else lx - 55
d.line((dx, CY - 300, dx, CY + 300), fill=150, width=2)

# text column
F = '/usr/share/fonts/truetype/liberation/'
small = ImageFont.truetype(F + 'LiberationSerif-Regular.ttf', 26)
big = ImageFont.truetype(F + 'LiberationSerif-Italic.ttf', 62)
mid = ImageFont.truetype(F + 'LiberationSerif-Regular.ttf', 30)

def tracked(x, y, text, font, track, fill=255, anchor_right=False):
    widths = [font.getlength(c) for c in text]
    total = sum(widths) + track * (len(text) - 1)
    if anchor_right: x -= total
    for c, w in zip(text, widths):
        d.text((x, y), c, font=font, fill=fill); x += w + track
    return total

col_x = dx + 55 if SIDE == 'left' else 70
col_w = (W - 60 - col_x) if SIDE == 'left' else (dx - 55 - 70)
def line_x(width):  # left-aligned in left layout, right-aligned in right layout
    return col_x if SIDE == 'left' else col_x + col_w - width

y = CY - 250
w = sum(small.getlength(c) for c in 'NUEVA MARCA') + 8 * 10
tracked(line_x(w), y, 'NUEVA MARCA', small, 8, fill=215)
y += 85
for ln in ['Accesorios', 'para tu hogar', 'y tus mascotas']:
    w = big.getlength(ln); d.text((line_x(w), y), ln, font=big, fill=255); y += 78
y += 40
d.line((line_x(70), y, line_x(70) + 70, y), fill=200, width=2)
y += 45
for ln in ['Hechos para', 'compartir el hogar']:
    w = mid.getlength(ln); d.text((line_x(w), y), ln, font=mid, fill=225); y += 44

c = np.asarray(cov).astype(np.float32)[..., None] / 255.0
img = bg * (1 - c) + INK[None, None, :] * c
Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(OUT)

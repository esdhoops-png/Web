import math, random, sys
import numpy as np
import cv2
import imageio.v2 as imageio
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

random.seed(7)
W, H, FPS, DUR = 720, 1280, 30, 15.5
T_SCARE = 13.0
SRC = Image.open('src.png').convert('RGB')
CUT = Image.open('cut.png').convert('RGBA')
SW, SH = SRC.size
CROP = (77, 380, 1129, 2250)           # 9:16 crop avoiding lock-screen UI
S0 = W / (CROP[2] - CROP[0])           # ~0.684
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'

def ease(t):
    t = min(max(t, 0), 1)
    return t * t * (3 - 2 * t)

def seg(t, a, b):
    return min(max((t - a) / (b - a), 0), 1)

# ---------------------------------------------------------------- background photo (person + lock screen removed)
def clean_background():
    arr = np.array(SRC)
    mask = np.zeros((SH, SW), np.uint8)
    alpha = np.array(CUT.split()[3])
    mask[alpha > 10] = 255
    mask[330:650, 140:1060] = 255                 # clock
    mask[2270:2480, 120:330] = 255                # flashlight
    mask[2270:2480, 870:1090] = 255               # camera
    mask = cv2.dilate(mask, np.ones((41, 41), np.uint8))
    k = 4
    small = cv2.resize(arr, (SW // k, SH // k), interpolation=cv2.INTER_AREA)
    msmall = cv2.resize(mask, (SW // k, SH // k), interpolation=cv2.INTER_NEAREST)
    inp = cv2.inpaint(small, msmall, 25, cv2.INPAINT_TELEA)
    inp = cv2.GaussianBlur(inp, (0, 0), 3)
    big = cv2.resize(inp, (SW, SH), interpolation=cv2.INTER_CUBIC)
    noise = np.random.normal(0, 4, big.shape)
    big = np.clip(big + noise, 0, 255).astype(np.uint8)
    m = cv2.GaussianBlur(mask, (0, 0), 12)[..., None] / 255.0
    out = (arr * (1 - m) + big * m).astype(np.uint8)
    return Image.fromarray(out)

def orig_background():
    arr = np.array(SRC)
    mask = np.zeros((SH, SW), np.uint8)
    mask[330:650, 140:1060] = 255
    alpha = np.array(CUT.split()[3])
    mask[alpha > 10] = 0
    k = 3
    small = cv2.resize(arr, (SW // k, SH // k), interpolation=cv2.INTER_AREA)
    msmall = cv2.resize(mask, (SW // k, SH // k), interpolation=cv2.INTER_NEAREST)
    inp = cv2.inpaint(small, msmall, 20, cv2.INPAINT_TELEA)
    big = cv2.resize(cv2.GaussianBlur(inp, (0, 0), 2), (SW, SH), interpolation=cv2.INTER_CUBIC)
    m = cv2.GaussianBlur(mask, (0, 0), 8)[..., None] / 255.0
    return Image.fromarray((arr * (1 - m) + big * m).astype(np.uint8))

print('backgrounds...'); sys.stdout.flush()
BG_EMPTY = clean_background().crop(CROP).resize((W, H), Image.LANCZOS)
BG_ORIG = orig_background().crop(CROP).resize((W, H), Image.LANCZOS)

# ---------------------------------------------------------------- night sky
def make_sky():
    sky = Image.new('RGB', (W, H))
    top, bot = np.array([10, 8, 38]), np.array([74, 34, 96])
    g = np.linspace(0, 1, H)[:, None, None]
    arr = (top * (1 - g) + bot * g).repeat(W, 1).astype(np.uint8)
    sky = Image.fromarray(arr)
    glow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(glow).ellipse((330, 180, 690, 540), fill=140)
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    sky = Image.composite(Image.new('RGB', (W, H), (255, 230, 170)), sky, glow)
    d = ImageDraw.Draw(sky)
    d.ellipse((400, 250, 620, 470), fill=(255, 244, 205))
    for cx, cy, r in [(470, 320, 22), (560, 400, 16), (520, 300, 10), (455, 410, 12)]:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(236, 222, 180))
    # clouds
    cl = Image.new('L', (W, H), 0)
    cd = ImageDraw.Draw(cl)
    for _ in range(26):
        x, y = random.randint(-100, W + 100), random.choice([random.randint(560, 700), random.randint(980, 1150)])
        cd.ellipse((x - 110, y - 30, x + 110, y + 30), fill=random.randint(60, 110))
    cl = cl.filter(ImageFilter.GaussianBlur(25))
    sky = Image.composite(Image.new('RGB', (W, H), (150, 120, 190)), sky, cl)
    return sky

SKY = make_sky()
STARS = [(random.randint(0, W), random.randint(0, 900), random.random() * 6.28, random.choice([1, 1, 2, 3])) for _ in range(140)]

def draw_stars(img, t, alpha=1.0):
    d = ImageDraw.Draw(img)
    for x, y, ph, r in STARS:
        if 380 < x < 640 and 230 < y < 490:
            continue
        b = (0.55 + 0.45 * math.sin(t * 4 + ph)) * alpha
        c = tuple(int(v * b) for v in (255, 250, 220))
        d.ellipse((x - r, y - r, x + r, y + r), fill=c)
        if r == 3 and b > 0.7:
            d.line((x - 7, y, x + 7, y), fill=c)
            d.line((x, y - 7, x, y + 7), fill=c)

def bats(img, t):
    d = ImageDraw.Draw(img)
    for i in range(4):
        x = (t * 70 + i * 190) % (W + 200) - 100
        y = 150 + i * 60 + 15 * math.sin(t * 3 + i)
        f = 10 * math.sin(t * 18 + i)
        d.polygon([(x, y), (x - 18, y - 6 - f), (x - 10, y + 2), (x, y + 6), (x + 10, y + 2), (x + 18, y - 6 - f)], fill=(20, 10, 30))

# ---------------------------------------------------------------- witch layers (drawn in "rig" coordinates = source + OX)
OX = 1600
RW, RH = SW + OX + 150, SH

def witch_person():
    im = CUT.copy()
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.int16)
    a = np.array(im.split()[3])
    ys = np.arange(SH)[:, None]
    blue = (hsv[..., 0] > 125) & (hsv[..., 0] < 175) & (hsv[..., 1] > 20) & (ys > 1330) & (a > 0)
    hsv[..., 0] = np.where(blue, 196, hsv[..., 0])
    hsv[..., 1] = np.where(blue, np.clip(hsv[..., 1] * 1.6 + 25, 0, 255), hsv[..., 1])
    hsv[..., 2] = np.where(blue, (hsv[..., 2] * 0.8).astype(np.int16), hsv[..., 2])
    rgb = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')
    rgb.putalpha(im.split()[3])
    return rgb

PERSON_WITCH = witch_person()

def hat_layer():
    L = Image.new('RGBA', (RW, RH), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    cx, by = OX + 612, 565
    # cone with bent tip
    cone = [(cx - 150, by - 5), (cx - 60, by - 250), (cx - 5, by - 400), (cx + 60, by - 470), (cx + 170, by - 455),
            (cx + 95, by - 420), (cx + 60, by - 300), (cx + 150, by - 5)]
    d.polygon(cone, fill=(34, 20, 48, 255))
    d.polygon([(cx + 20, by - 30), (cx + 60, by - 300), (cx + 95, by - 420), (cx + 170, by - 455), (cx + 70, by - 380), (cx + 110, by - 30)], fill=(52, 32, 72, 255))
    d.ellipse((cx - 250, by - 55, cx + 250, by + 55), fill=(28, 16, 40, 255))
    d.ellipse((cx - 230, by - 40, cx + 230, by + 35), fill=(42, 26, 60, 255))
    d.polygon([(cx - 150, by - 10), (cx + 150, by - 10), (cx + 140, by - 70), (cx - 138, by - 70)], fill=(120, 40, 160, 255))
    d.rectangle((cx - 40, by - 72, cx + 30, by - 8), outline=(240, 195, 70, 255), width=12)
    for s in [(-90, -160), (40, -230), (-20, -330)]:
        sx, sy = cx + s[0], by + s[1]
        d.polygon([(sx, sy - 22), (sx + 7, sy - 7), (sx + 22, sy), (sx + 7, sy + 7), (sx, sy + 22), (sx - 7, sy + 7), (sx - 22, sy), (sx - 7, sy - 7)], fill=(250, 215, 90, 255))
    return L

def cape_layer(t, wind=0.0):
    L = Image.new('RGBA', (RW, RH), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    left, right = [], []
    for i in range(11):
        f = i / 10
        y = 900 + f * 1150
        w = 150 + f * 190
        wave = (25 + 60 * wind) * f * math.sin(t * 7 - f * 5)
        drift = -wind * 380 * f * f
        left.append((OX + 620 - w + wave + drift, y))
        right.append((OX + 620 + w * 0.9 + wave + drift, y + 30 * f * math.sin(t * 5 + f * 3)))
    poly = left + right[::-1]
    d.polygon(poly, fill=(60, 14, 70, 255))
    inner = [(x * 0.92 + (OX + 620) * 0.08, y) for x, y in poly]
    d.polygon(inner, fill=(140, 20, 60, 255))
    d.polygon([(x * 0.97 + (OX + 620) * 0.03, y - 12) for x, y in poly], fill=(60, 14, 70, 255))
    return L

def broom_layer(t, lights=True, sway=0.0):
    L = Image.new('RGBA', (RW, RH), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    p0, p1 = (OX - 150, 1790), (OX + 1290, 1560)   # bristle end -> handle tip
    ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    nx, ny = -math.sin(ang), math.cos(ang)
    hw = 20
    d.polygon([(p0[0] + nx * hw, p0[1] + ny * hw), (p1[0] + nx * hw * .7, p1[1] + ny * hw * .7),
               (p1[0] - nx * hw * .7, p1[1] - ny * hw * .7), (p0[0] - nx * hw, p0[1] - ny * hw)], fill=(120, 72, 36, 255))
    d.line([(p0[0] - nx * 6, p0[1] - ny * 6), (p1[0] - nx * 6, p1[1] - ny * 6)], fill=(160, 104, 58, 255), width=8)
    d.ellipse((p1[0] - 24, p1[1] - 24, p1[0] + 24, p1[1] + 24), fill=(98, 58, 28, 255))
    # bristles (fan pointing backwards)
    bx, by = p0
    for k in range(70):
        f = (k / 69 - 0.5)
        ex = bx - 480 + abs(f) * 90 + random.Random(k).randint(-20, 20)
        ey = by + 20 + f * 330 + 12 * math.sin(t * 9 + k)
        col = (214 + (k % 3) * 10, 170 + (k % 4) * 8, 72, 255)
        d.line([(bx + 20, by + f * 60), (ex, ey)], fill=col, width=9)
    d.polygon([(bx - 20, by - 45), (bx + 60, by - 50), (bx + 60, by + 50), (bx - 20, by + 50)], fill=(150, 40, 170, 255))
    d.line([(bx + 20, by - 48), (bx + 20, by + 50)], fill=(240, 195, 70, 255), width=8)
    # camper trailer, hitched behind the broom
    cx0, cy0 = bx - 1050, by - 120 + sway * 40
    d.line([(bx - 20, by), (cx0 + 560, cy0 + 250)], fill=(90, 60, 40, 255), width=10)
    body = (cx0, cy0, cx0 + 540, cy0 + 300)
    d.rounded_rectangle(body, radius=110, fill=(246, 238, 220, 255), outline=(60, 40, 60, 255), width=10)
    d.rounded_rectangle((cx0 + 10, cy0 + 150, cx0 + 530, cy0 + 205), radius=10, fill=(40, 180, 170, 255))
    d.rounded_rectangle((cx0 + 10, cy0 + 205, cx0 + 530, cy0 + 222), radius=4, fill=(230, 120, 60, 255))
    d.rounded_rectangle((cx0 + 60, cy0 + 50, cx0 + 220, cy0 + 130), radius=25, fill=(255, 214, 110, 255), outline=(60, 40, 60, 255), width=8)
    d.rounded_rectangle((cx0 + 300, cy0 + 45, cx0 + 400, cy0 + 280), radius=18, fill=(200, 90, 150, 255), outline=(60, 40, 60, 255), width=8)
    d.ellipse((cx0 + 375, cy0 + 150, cx0 + 390, cy0 + 165), fill=(240, 195, 70, 255))
    d.ellipse((cx0 + 110, cy0 + 240, cx0 + 230, cy0 + 360), fill=(35, 30, 40, 255))
    d.ellipse((cx0 + 145, cy0 + 275, cx0 + 195, cy0 + 325), fill=(170, 170, 180, 255))
    d.polygon([(cx0 + 460, cy0 + 20), (cx0 + 470, cy0 - 70), (cx0 + 500, cy0 - 70), (cx0 + 505, cy0 + 30)], fill=(90, 80, 90, 255))
    # string lights along the handle and the camper roof
    if lights:
        cols = [(255, 90, 90), (255, 210, 80), (120, 230, 140), (120, 180, 255), (230, 120, 255)]
        pts = [(bx + 80 + i * 95 * math.cos(ang), by + i * 95 * math.sin(ang) + 30 + 18 * math.sin(i * 1.3)) for i in range(13)]
        pts += [(cx0 + 60 + i * 60, cy0 + 8 + 12 * math.sin(i)) for i in range(8)]
        for i, (x, y) in enumerate(pts):
            on = 0.6 + 0.4 * math.sin(t * 8 + i)
            c = tuple(int(v * on) for v in cols[i % len(cols)])
            d.ellipse((x - 13, y - 13, x + 13, y + 13), fill=c + (255,))
    return L

HAT = hat_layer()
PERSON_ORIG_RIG = Image.new('RGBA', (RW, RH)); PERSON_ORIG_RIG.paste(CUT, (OX, 0))
PERSON_WITCH_RIG = Image.new('RGBA', (RW, RH)); PERSON_WITCH_RIG.paste(PERSON_WITCH, (OX, 0))

def build_rig(t, wind=0.0, sway=0.0):
    rig = cape_layer(t, wind)
    rig.alpha_composite(PERSON_WITCH_RIG)
    rig.alpha_composite(broom_layer(t, sway=sway))
    rig.alpha_composite(HAT)
    return rig

ANCHOR = (OX + 612, 1400)   # rig pivot (around her waist)

def place(canvas, img, anchor, pos, scale, angle_deg=0.0, alpha=1.0):
    pre = 1.0
    if scale < 0.6:
        pre = min(1.0, scale * 1.6)
        img = img.resize((int(img.width * pre), int(img.height * pre)), Image.LANCZOS)
        anchor = (anchor[0] * pre, anchor[1] * pre)
        scale = scale / pre
    th = math.radians(angle_deg)
    c, s = math.cos(th), math.sin(th)
    a, b = c / scale, s / scale
    dd, e = -s / scale, c / scale
    cc = anchor[0] - (a * pos[0] + b * pos[1])
    f = anchor[1] - (dd * pos[0] + e * pos[1])
    layer = img.transform((W, H), Image.AFFINE, (a, b, cc, dd, e, f), resample=Image.BICUBIC)
    if alpha < 1:
        layer.putalpha(layer.split()[3].point(lambda v: int(v * alpha)))
    canvas.alpha_composite(layer)

HOME = ((ANCHOR[0] - OX - CROP[0]) * S0, (ANCHOR[1] - CROP[1]) * S0)

# ---------------------------------------------------------------- particles
class Sparks:
    def __init__(self):
        self.p = []
    def emit(self, x, y, n, spread=6, life=1.0, cols=None):
        cols = cols or [(255, 230, 120), (220, 140, 255), (140, 230, 255), (255, 255, 255)]
        for _ in range(n):
            a = random.random() * 6.283
            v = random.random() * spread
            self.p.append([x, y, math.cos(a) * v, math.sin(a) * v - 1, life * (0.5 + random.random() * 0.5), random.choice(cols), random.choice([2, 3, 4, 6])])
    def step_draw(self, img, dt):
        d = ImageDraw.Draw(img)
        alive = []
        for q in self.p:
            q[0] += q[2]; q[1] += q[3]; q[3] += 0.08; q[4] -= dt
            if q[4] <= 0:
                continue
            alive.append(q)
            r = q[6] * min(1, q[4] * 2)
            x, y = q[0], q[1]
            d.ellipse((x - r, y - r, x + r, y + r), fill=q[5] + (255,))
            if q[6] >= 6:
                d.line((x - r * 2.2, y, x + r * 2.2, y), fill=q[5] + (255,), width=2)
                d.line((x, y - r * 2.2, x, y + r * 2.2), fill=q[5] + (255,), width=2)
        self.p = alive

def glow(img, amount=1.0):
    blur = img.filter(ImageFilter.GaussianBlur(8))
    return ImageChops.add(img, blur.point(lambda v: int(v * amount)))

def tint(img, color, k):
    return Image.blend(img, Image.new('RGB', img.size, color), k)

def text_layer(txt, size, alpha, y):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    font = ImageFont.truetype(FONT, size)
    d = ImageDraw.Draw(L)
    w = d.textlength(txt, font=font)
    x = (W - w) / 2
    for o in range(8, 0, -2):
        d.text((x, y), txt, font=font, fill=(170, 60, 255, int(40 * alpha)), stroke_width=o, stroke_fill=(170, 60, 255, int(40 * alpha)))
    d.text((x, y), txt, font=font, fill=(255, 236, 150, int(255 * alpha)), stroke_width=3, stroke_fill=(50, 10, 70, int(255 * alpha)))
    return L

# ---------------------------------------------------------------- jump scare: giant cockroach
def cockroach(t):
    L = Image.new('RGBA', (900, 1400), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    dark, mid, light = (26, 12, 5, 255), (62, 30, 11, 255), (92, 48, 20, 255)
    # legs: three per side, alternating tripod gait
    for side in (-1, 1):
        for i, (ly, base) in enumerate([(640, -35), (780, 5), (900, 45)]):
            ph = t * 22 + (i + (side > 0)) * math.pi
            sw = 14 * math.sin(ph)
            a1 = math.radians(base + sw)
            x0, y0 = 450 + side * 150, ly
            x1 = x0 + side * 190 * math.cos(a1); y1 = y0 + 190 * math.sin(a1)
            a2 = a1 + math.radians(35 if i == 2 else -30)
            x2 = x1 + side * 230 * math.cos(a2); y2 = y1 + 230 * math.sin(a2) + 60
            d.line([(x0, y0), (x1, y1)], fill=mid, width=38)
            d.line([(x1, y1), (x2, y2)], fill=dark, width=24)
            for k in range(1, 6):
                f = k / 6
                sx, sy = x1 + (x2 - x1) * f, y1 + (y2 - y1) * f
                d.line([(sx, sy), (sx + side * 26, sy - 22)], fill=dark, width=5)
            d.ellipse((x1 - 18, y1 - 18, x1 + 18, y1 + 18), fill=mid)
    # cerci at the rear
    for side in (-1, 1):
        d.line([(450 + side * 50, 250), (450 + side * 120, 90)], fill=mid, width=14)
    # abdomen + wings
    d.ellipse((260, 210, 640, 950), fill=dark)
    d.ellipse((275, 240, 448, 930), fill=mid)
    d.ellipse((452, 240, 625, 930), fill=mid)
    d.line([(450, 240), (450, 930)], fill=dark, width=6)
    for k in range(6):
        y = 330 + k * 95
        d.arc((300, y, 600, y + 80), 20, 160, fill=dark, width=3)
    hl = Image.new('RGBA', L.size, (0, 0, 0, 0))
    ImageDraw.Draw(hl).ellipse((330, 320, 400, 700), fill=(255, 225, 190, 110))
    ImageDraw.Draw(hl).ellipse((505, 360, 560, 640), fill=(255, 220, 180, 45))
    L.alpha_composite(hl.filter(ImageFilter.GaussianBlur(12)))
    # pronotum shield and head
    d.ellipse((245, 850, 655, 1070), fill=dark)
    d.ellipse((290, 875, 610, 1045), fill=light)
    d.ellipse((370, 900, 530, 1020), fill=(40, 18, 7, 255))
    d.ellipse((375, 1030, 525, 1150), fill=dark)
    for side in (-1, 1):
        d.ellipse((450 + side * 55 - 20, 1060, 450 + side * 55 + 20, 1100), fill=(10, 5, 5, 255))
        d.line([(450 + side * 25, 1140), (450 + side * 40, 1185)], fill=mid, width=10)
    # long twitchy antennae
    for side in (-1, 1):
        pts = []
        for k in range(26):
            f = k / 25
            ang = math.radians(side * (10 + 55 * f) + 25 * f * math.sin(t * 13 + side + f * 3))
            if not pts:
                pts.append((450 + side * 40, 1120))
            px, py = pts[-1]
            pts.append((px + 34 * math.sin(ang), py + 34 * math.cos(ang) - 6 * f))
        d.line(pts, fill=mid, width=7, joint='curve')
    return L

def scare(frame, u):
    """u = seconds since the scare started."""
    frame = frame.convert('RGB')
    frame = Image.blend(frame, frame.point(lambda v: int(v * 0.45)), min(1, u * 8))
    frame = frame.convert('RGBA')
    pop = 1.0 + 0.35 * math.exp(-u * 18)
    sc = (0.95 + 0.25 * ease(seg(u, 0.3, 2.5))) * pop
    x = W / 2 + 25 * math.sin(u * 9)
    y = 640 + 170 * ease(seg(u, 0.3, 2.5))
    ang = 8 * math.sin(u * 6)
    place(frame, cockroach(u), (450, 700), (x, y), sc, ang)
    ta = seg(u, 0.12, 0.3)
    if ta > 0:
        tl = text_layer_color('¡¡CUCARACHA!!', 62, ta, 90)
        jx, jy = random.randint(-8, 8), random.randint(-8, 8)
        frame.alpha_composite(tl, (jx, jy) if min(jx, jy) >= 0 else (0, 0))
    frame = frame.convert('RGB')
    flash = math.exp(-u * 14)
    if flash > 0.02:
        frame = Image.blend(frame, Image.new('RGB', (W, H), (255, 255, 255)), 0.85 * flash)
    red = 0.25 * math.exp(-u * 3)
    frame = Image.blend(frame, Image.new('RGB', (W, H), (200, 0, 0)), red)
    amp = 40 * math.exp(-u * 3.5) + 4
    dx, dy = random.randint(-int(amp), int(amp)), random.randint(-int(amp), int(amp))
    shaken = Image.new('RGB', (W, H))
    shaken.paste(frame.resize((int(W * 1.08), int(H * 1.08))), (int(-W * 0.04) + dx, int(-H * 0.04) + dy))
    return shaken.convert('RGBA')

def text_layer_color(txt, size, alpha, y):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    font = ImageFont.truetype(FONT, size)
    d = ImageDraw.Draw(L)
    x = (W - d.textlength(txt, font=font)) / 2
    d.text((x, y), txt, font=font, fill=(255, 40, 40, int(255 * alpha)), stroke_width=6, stroke_fill=(255, 255, 255, int(255 * alpha)))
    return L

def make_audio(path, sr=44100):
    """Silence until the scare, then a horror stinger plus cockroach scuttling."""
    import wave
    n = int(DUR * sr)
    a = np.zeros(n)
    rng = np.random.default_rng(3)
    # soft magic shimmer at the transformation
    t0 = int((T_FLASH - 0.4) * sr); tt = np.arange(int(1.2 * sr)) / sr
    env = np.exp(-tt * 3) * np.minimum(1, tt * 10)
    shim = sum(np.sin(2 * np.pi * f * tt) for f in (1318, 1568, 1976, 2637)) * env * 0.05
    a[t0:t0 + len(tt)] += shim
    # stinger
    s0 = int(T_SCARE * sr); tt = np.arange(n - s0) / sr
    env = np.exp(-tt * 1.6)
    chord = sum(np.sign(np.sin(2 * np.pi * f * tt * (1 + 0.01 * np.sin(2 * np.pi * 6 * tt)))) for f in (110, 116.5, 155.6, 233.1, 311.1))
    hit = rng.normal(0, 1, len(tt)) * np.exp(-tt * 9)
    boom = np.sin(2 * np.pi * (60 - 25 * np.minimum(tt, 1)) * tt) * np.exp(-tt * 4)
    a[s0:] += chord * env * 0.12 + hit * 0.6 + boom * 0.8
    # scuttling clicks
    for c in np.arange(T_SCARE + 0.15, DUR - 0.2, 0.035):
        i = int((c + rng.uniform(0, 0.02)) * sr)
        k = np.arange(int(0.006 * sr))
        a[i:i + len(k)] += rng.normal(0, 1, len(k)) * np.exp(-k / (0.0012 * sr)) * 0.25
    fade = np.ones(n); m = int(0.3 * sr); fade[-m:] = np.linspace(1, 0, m)
    a = np.tanh(a * 1.2) * fade
    a = (a / np.abs(a).max() * 0.9 * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(a.tobytes())

# ---------------------------------------------------------------- timeline
sparks = Sparks()
trail = Sparks()
N = int(DUR * FPS)
T_FLASH = 3.7
writer = imageio.get_writer('bruja_camper_mudo.mp4', fps=FPS, codec='libx264', quality=8, pixelformat='yuv420p', macro_block_size=8)

ONLY = [int(float(x) * FPS) for x in sys.argv[1:]]
for fi in range(N):
    if ONLY and fi > max(ONLY): break
    t = fi / FPS
    dt = 1 / FPS
    if t < T_FLASH:
        # ---- scene 1: original photo, magic swirl builds up
        frame = BG_ORIG.copy().convert('RGBA')
        k = seg(t, 1.8, T_FLASH)
        if k > 0:
            frame = tint(frame.convert('RGB'), (40, 10, 70), 0.35 * k).convert('RGBA')
            n = int(2 + 14 * k)
            for i in range(n):
                a = t * 6 + i * 6.283 / n
                r = 260 * (1 - 0.5 * k) + 30 * math.sin(t * 3 + i)
                yy = HOME[1] + (i / n - 0.5) * 1000 * (1 - 0.3 * k) + 80 * math.sin(a)
                sparks.emit(HOME[0] + math.cos(a) * r, yy, 2, spread=1.5, life=0.6)
        sparks.step_draw(frame, dt)
        frame = frame.convert('RGB')
        if k > 0:
            frame = glow(frame, 0.6 * k)
        fl = seg(t, T_FLASH - 0.35, T_FLASH)
        frame = Image.blend(frame, Image.new('RGB', (W, H), (255, 245, 255)), fl ** 2)
    else:
        # background: photo (dusk) -> pan up into night sky
        pan = ease(seg(t, 5.4, 7.4))
        dusk = ease(seg(t, T_FLASH, 5.0))
        photo = tint(BG_EMPTY, (30, 10, 60), 0.55 * dusk)
        photo = Image.blend(photo, photo.point(lambda v: int(v * 0.6)), 0.4 * dusk)
        off = int(pan * H)
        frame = Image.new('RGB', (W, H))
        sky = SKY.copy()
        draw_stars(sky, t, 0.3 + 0.7 * max(dusk, pan))
        if t > 6.5:
            bats(sky, t)
        frame.paste(sky, (0, off - H))
        frame.paste(SKY.getpixel((W // 2, H - 1)), (0, off, W, H))
        # soft seam between photo top and sky
        seam = Image.new('L', (W, H), 255)
        ImageDraw.Draw(seam).rectangle((0, 0, W, 0), fill=0)
        grad = np.clip(np.linspace(0, 1, H) * 5, 0, 1)[:, None].repeat(W, 1)
        photo_rgba = photo.copy(); photo_rgba.putalpha(Image.fromarray((grad * 255).astype(np.uint8)))
        frame.paste(photo_rgba, (0, off), photo_rgba)
        frame = frame.convert('RGBA')

        if t < 5.4:
            # ---- transformed witch standing, then lift-off crouch
            rise = ease(seg(t, 4.7, 5.4)) * 120
            bob = 6 * math.sin(t * 4) * seg(t, 4.2, 4.6)
            pos = (HOME[0], HOME[1] - rise + bob + off)
            rig = build_rig(t, wind=0.1)
            place(frame, rig, ANCHOR, pos, S0, -3 * seg(t, 4.7, 5.4))
            if t > 4.6:
                for _ in range(3):
                    sparks.emit(HOME[0] + random.uniform(-150, 150), HOME[1] + 520 * S0 + off, 2, spread=4, life=0.7,
                                cols=[(200, 190, 220), (170, 150, 200), (255, 230, 150)])
            if t < T_FLASH + 0.6:
                sparks.emit(HOME[0] + random.uniform(-200, 200), HOME[1] + random.uniform(-500, 300), 5, spread=5, life=0.8)
        elif t < 7.4:
            # ---- flying up out of frame while camera pans
            k = ease(seg(t, 5.4, 7.4))
            x = HOME[0] + k * 260
            y = HOME[1] - 120 - k * 700 + off * 0.35
            sc = S0 * (1 - 0.55 * k)
            ang = -3 - 12 * k
            rig = build_rig(t, wind=0.5 + 0.5 * k, sway=math.sin(t * 5))
            place(frame, rig, ANCHOR, (x, y), sc, ang)
            trail.emit(x - 600 * sc, y + 300 * sc, 5, spread=2.5, life=0.9)
        else:
            # ---- night flight past the moon
            if t < 9.8:
                k = ease(seg(t, 7.4, 9.8))
                x = 100 + k * 460
                y = 1150 - k * 680
                sc = 0.22 + 0.05 * k
                ang = -14 + 10 * k
            elif t < 11.0:
                x, y, sc, ang = 560, 470, 0.27, -4
            else:
                k = ease(seg(t, 11.0, 12.5))
                x = 560 + k * 500
                y = 470 - k * 360
                sc = 0.27 - 0.17 * k
                ang = -4 - 14 * k
            y += 14 * math.sin(t * 3.2)
            rig = build_rig(t, wind=1.0, sway=math.sin(t * 4))
            place(frame, rig, ANCHOR, (x, y), sc, ang)
            trail.emit(x - 1300 * sc * math.cos(math.radians(ang)), y + 300 * sc, 6, spread=2, life=1.1)
            ta = seg(t, 9.4, 10.0) * (1 - seg(t, 12.1, 12.5))
            if ta > 0:
                frame.alpha_composite(text_layer('¡Bruja camper!', 72, ta, 930))
                frame.alpha_composite(text_layer('modo escoba: ON', 40, ta, 1025))
        trail.step_draw(frame, dt)
        sparks.step_draw(frame, dt)
        frame = glow(frame.convert('RGB'), 0.35)
        fl = 1 - seg(t, T_FLASH, T_FLASH + 0.5)
        if fl > 0:
            frame = Image.blend(frame, Image.new('RGB', (W, H), (255, 245, 255)), fl ** 2)
        if t >= T_SCARE:
            frame = scare(frame, t - T_SCARE).convert('RGB')
    # vignette-free fade in/out
    fade = min(seg(t, 0, 0.3), 1 - seg(t, DUR - 0.3, DUR))
    if fade < 1:
        frame = Image.blend(Image.new('RGB', (W, H)), frame, fade)
    if not ONLY: writer.append_data(np.array(frame))
    if fi in ONLY: frame.save(f'test_{fi:03d}.jpg', quality=85)
    if fi % 30 == 0:
        print(f'{t:.1f}s'); sys.stdout.flush()
        frame.save(f'prev_{fi:03d}.jpg', quality=80)
writer.close()
if not ONLY:
    import subprocess, imageio_ffmpeg
    make_audio('audio.wav')
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-i', 'bruja_camper_mudo.mp4', '-i', 'audio.wav',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', 'bruja_camper.mp4'], check=True)
print('done')

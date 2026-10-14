"""Vectorize the Kai Kora logo into smooth polygons (meters). Writes logo_polys.json"""
import json, sys
import numpy as np, cv2

here = __file__.rsplit('/', 1)[0]
LOGO_W = 0.60                                     # physical logo width in meters
src = cv2.imread(f'{here}/logo.jpg', cv2.IMREAD_GRAYSCALE).astype(np.float32)
ink_l = float(np.median(src[src < 110]))
a = np.clip((183 - src) / (183 - ink_l), 0, 1)[262:799, 574:959]
UP = 6
big = cv2.resize(a, None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), UP * 0.6)
binm = (big > 0.5).astype(np.uint8)
contours, _ = cv2.findContours(binm, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
MH, MW = binm.shape
k_scale = LOGO_W / MW
polys = []
for cnt in contours:
    p = cnt[:, 0, :].astype(np.float32)
    if len(p) < 20: continue
    k = max(3, min(len(p) // 4, int(UP * 1.6)))
    kern = np.exp(-0.5 * (np.arange(-3 * k, 3 * k + 1) / k) ** 2); kern /= kern.sum()
    ext = np.concatenate([p[-3 * k:], p, p[:3 * k]])
    sm = np.stack([np.convolve(ext[:, 0], kern, 'valid'), np.convolve(ext[:, 1], kern, 'valid')], 1)
    sm = cv2.approxPolyDP(sm.reshape(-1, 1, 2).astype(np.float32), 0.35, True)[:, 0, :]
    if len(sm) < 4: continue
    # to meters, centered, y up
    pts = [(float((x - MW / 2) * k_scale), float((MH / 2 - y) * k_scale)) for x, y in sm]
    polys.append(pts)
json.dump({'polys': polys, 'width': LOGO_W, 'height': MH * k_scale}, open(f'{here}/logo_polys.json', 'w'))
print(len(polys), 'polygons,', sum(len(p) for p in polys), 'points, height', MH * k_scale)

"""Genera la versión instalable (PWA) de Racha HYROX a partir de app-hyrox/index.html."""
import pathlib, re
from PIL import Image, ImageDraw, ImageFont
D = pathlib.Path(__file__).parent
src = (D.parent / "app-hyrox" / "index.html").read_text()
src = src.replace('"Sin sesión: se guarda solo en este dispositivo"', '"Guardado en este móvil"')
head = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#141414">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Racha HYROX">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" href="icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
</head>
<body>
"""
tail = """
<script>if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(()=>{});</script>
</body>
</html>
"""
(D / "index.html").write_text(head + src + tail)
# iconos
font = "/tmp/claude-0/-home-user-Web/99411b3e-5ed0-5a9b-8a56-aaee1b2dc962/scratchpad/font/schibsted-900.ttf"
def icon(n, pad):
    im = Image.new("RGB", (n, n), "#141414"); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(font, int(n * (0.62 - pad)))
    d.text((n / 2, n / 2 - n * .02), "R", font=f, fill="#F1ECE8", anchor="mm")
    r = n * .055; cx, cy = n * (.74 - pad / 2), n * (.70 - pad / 2)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill="#FF5A1F")
    return im
if pathlib.Path(font).exists():
    icon(192, 0).save(D / "icon-192.png"); icon(512, 0).save(D / "icon-512.png")
    icon(512, .14).save(D / "icon-maskable-512.png"); icon(180, 0).save(D / "apple-touch-icon.png")
print("ok")

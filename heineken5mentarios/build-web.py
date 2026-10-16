"""Construye heineken5mentarios-web-ionos.zip con las imágenes incrustadas en el HTML,
para que la web se vea bien aunque solo se suba el index.html."""
import base64, re, zipfile, pathlib
W = pathlib.Path(__file__).parent / "web"
MIME = {".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png"}
def inline(html):
    def rep(m):
        p = W / m.group(2)
        if not p.exists(): return m.group(0)
        return f'{m.group(1)}"data:{MIME[p.suffix]};base64,{base64.b64encode(p.read_bytes()).decode()}"'
    return re.sub(r'((?:src|href)=)"(img/[^"]+)"', rep, html)
def inline_js(html):  # rutas img/... dentro de los datos del portal
    def rep(m):
        p = W / m.group(1)
        if not p.exists(): return m.group(0)
        return 'img: "data:%s;base64,%s"' % (MIME[p.suffix], base64.b64encode(p.read_bytes()).decode())
    return re.sub(r'img: "(img/[^"]+)"', rep, html)
out = W.parent / "heineken5mentarios-web-ionos.zip"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for name in ("index.html", "transparencia.html"):
        z.writestr(name, inline_js(inline((W / name).read_text())))
    for p in sorted((W / "img").iterdir()): z.write(p, f"img/{p.name}")
    for p in sorted((W / "docs").rglob("*")):
        if p.is_file(): z.write(p, str(p.relative_to(W)))
print(out, out.stat().st_size)

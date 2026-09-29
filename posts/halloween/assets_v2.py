# Recursos para la intro v2: logo desgastado (hueso/negro), mapa del borde inferior y niebla
from PIL import Image, ImageFilter, ImageOps
import numpy as np, json
rng=np.random.default_rng(3)
lg=Image.open("../2026-09-25-musica-en-directo/logo/5mentarios-original.png").convert("RGBA")
W,H=lg.size
a=np.asarray(lg).astype(np.float32)/255; lum=a[...,:3].mean(-1); al=a[...,3]
# textura sucia: ruido multi-escala
def noise(scale):
    n=rng.random((H//scale+2,W//scale+2)).astype(np.float32)
    return np.asarray(Image.fromarray((n*255).astype(np.uint8)).resize((W,H),Image.BICUBIC)).astype(np.float32)/255
grime=0.5*noise(64)+0.3*noise(16)+0.2*noise(4)
bone=np.array([0.86,0.82,0.72]); rust=np.array([0.35,0.12,0.06]); black=np.array([0.05,0.04,0.04])
light=bone*(1-0.55*np.clip((grime-0.45)*2.2,0,1))[...,None]+rust*0.5*np.clip((grime-0.6)*2.5,0,1)[...,None]
col=black*(1-lum[...,None])+light*lum[...,None]
# desconchones: huecos en el blanco
chips=np.clip((noise(8)-0.8)*6,0,1)*lum
col=col*(1-chips[...,None])+black*chips[...,None]
Image.fromarray((np.dstack([np.clip(col,0,1),al])*255).astype(np.uint8),"RGBA").save("v2-logo.png")
# borde inferior (para la sangre), normalizado 0..1
A=al>0.5; edge=[]
for x in range(0,W,4):
    ys=np.nonzero(A[:,x])[0]; edge.append([x/W, (ys.max()/H) if len(ys) else None])
json.dump(edge,open("v2-edge.json","w"))
# niebla grande y suave
FW,FH=2400,1400
f=np.zeros((FH,FW),np.float32)
for s,wt in [(200,.5),(90,.3),(40,.2)]:
    n=rng.random((FH//s+2,FW//s+2)).astype(np.float32)
    f+=wt*np.asarray(Image.fromarray((n*255).astype(np.uint8)).resize((FW,FH),Image.BICUBIC)).astype(np.float32)/255
f=np.clip((f-0.35)*1.8,0,1)
fog=np.dstack([np.full_like(f,.75),np.full_like(f,.72),np.full_like(f,.7),f*0.8])
Image.fromarray((fog*255).astype(np.uint8),"RGBA").filter(ImageFilter.GaussianBlur(18)).save("v2-fog.png")
print("ok")

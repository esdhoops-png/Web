# Post-proceso de la intro: VHS, aberración cromática, desgarros, grano y fotogramas subliminales
import numpy as np, sys, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
fps=30; N=len([f for f in os.listdir(src) if f.endswith(".jpg")])
rng=np.random.default_rng(66)
H,W=1920,1080
yy,xx=np.mgrid[0:H,0:W]
vig=(1-0.75*np.clip(np.sqrt(((xx-W/2)/(W*.62))**2+((yy-H*.45)/(H*.62))**2)-0.35,0,1)**1.3)[...,None].astype(np.float32)
scan=(1-0.12*((yy//3)%2))[...,None].astype(np.float32)
load=lambda i: np.asarray(Image.open(f"{src}/f{i:04d}.jpg")).astype(np.float32)/255
# imagen subliminal: logo iluminado en negativo rojo, ampliado
ref=load(int(4.8*fps))
neg=1-ref; neg=np.stack([neg.mean(-1)*1.2, neg.mean(-1)*0.05, neg.mean(-1)*0.08],-1)
z=Image.fromarray((np.clip(neg,0,1)*255).astype(np.uint8)).resize((int(W*1.25),int(H*1.25)))
ox,oy=(z.width-W)//2,(z.height-H)//2+60; sub=np.asarray(z.crop((ox,oy,ox+W,oy+H))).astype(np.float32)/255
SUB={int(3.13*fps),int(3.17*fps)+1, int(8.3*fps)}
def glitchy(t):
    return (1.3<t<3.1 and rng.random()<.45) or (5.95<t<6.35) or (3.1<t<3.35)
for i in range(N):
    t=i/fps
    x=sub.copy() if i in SUB else load(i)
    g=glitchy(t)
    # desgarros horizontales
    if g:
        for _ in range(rng.integers(2,6)):
            y0=rng.integers(0,H-40); h=rng.integers(8,120); s=int(rng.normal(0,60))
            x[y0:y0+h]=np.roll(x[y0:y0+h],s,axis=1)
    # aberración cromática
    ca=int(3+ (14 if g else 0) + 3*np.sin(t*3))
    x[...,0]=np.roll(x[...,0],ca,axis=1); x[...,2]=np.roll(x[...,2],-ca,axis=1)
    # vaivén de proyector
    x=np.roll(x,int(rng.normal(0,1.2)),axis=0)
    # barra de tracking VHS que baja
    by=int((t*420)%(H+300))-150
    band=np.exp(-((yy[:,:1]-by)/40.0)**2)[...,None]
    x=x*(1-0.25*band)+band*0.08
    x=x*vig*scan
    x+=rng.normal(0,.045,(H,W,1)).astype(np.float32)*(0.6+0.4*(1-x.mean(-1,keepdims=True)))
    if i in SUB: x=x*1.1
    Image.fromarray((np.clip(x,0,1)*255).astype(np.uint8)).save(f"{dst}/f{i:04d}.jpg",quality=93)
print("done",N)

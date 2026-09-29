# Genera el logo de 5mentarios en versión Halloween (verde tóxico, grietas y sangre)
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
rng=np.random.default_rng(21)
lg=Image.open("../2026-09-25-musica-en-directo/logo/5mentarios-original.png").convert("RGBA")
W,H=lg.size; pad=int(W*.25)
a=np.asarray(lg).astype(np.float32)/255; lum=a[...,:3].mean(-1); al=a[...,3]
col=np.clip(np.stack([lum*0.78+0.03, lum+0.02, lum*0.62+0.02],-1),0,1)
logo=Image.fromarray((np.dstack([col,al])*255).astype(np.uint8),"RGBA")
CS=(W+2*pad,H+2*pad)
C=Image.new("RGBA",CS,(0,0,0,0))
g=Image.new("RGBA",lg.size,(90,255,120,255)); g.putalpha(lg.getchannel("A"))
glow=Image.new("RGBA",CS,(0,0,0,0)); glow.paste(g,(pad,pad),g); glow=glow.filter(ImageFilter.GaussianBlur(W*.04))
C=Image.alpha_composite(C,glow); C.alpha_composite(logo,(pad,pad))
d=ImageDraw.Draw(C); cx,cy=pad+W/2,pad+H/2
for i in range(9):
    ang=rng.uniform(0,2*np.pi); r0=rng.uniform(.05,.25)*W; x,y=cx+np.cos(ang)*r0,cy+np.sin(ang)*r0; pts=[(x,y)]
    for k in range(rng.integers(4,8)):
        ang+=rng.normal(0,.5); st=rng.uniform(.03,.07)*W; x+=np.cos(ang)*st; y+=np.sin(ang)*st; pts.append((x,y))
    d.line(pts,fill=(0,0,0,200),width=max(2,int(W*.004)))
A=np.asarray(lg.getchannel("A"))>128
edge={}
for x in range(W):
    ys=np.nonzero(A[:,x])[0]
    if len(ys): edge[x]=ys.max()
blood=Image.new("L",CS,0); bd=ImageDraw.Draw(blood)
for x in [x for x in edge if abs(x-W/2)<W*.36]:
    e=edge[x]; th=int(W*(.012+.01*np.sin(x*.05)**2))
    bd.line([(pad+x,pad+e-th*2),(pad+x,pad+e+2)],fill=255)
for i in range(22):
    x=int(W/2+rng.uniform(-.33,.33)*W)
    if x not in edge: continue
    e=pad+edge[x]; X=pad+x; L=W*rng.uniform(.03,.2)*(1 if rng.random()>.3 else .45); w=W*rng.uniform(.007,.016)
    n=30; pl=[];pr=[]
    for k in range(n+1):
        t=k/n; ww=w*(1.6-0.8*t) if t<.3 else w*(0.9-0.25*t); yy=e-2+L*t
        pl.append((X-ww,yy)); pr.append((X+ww,yy))
    bd.polygon(pl+pr[::-1],fill=255)
    bd.ellipse([X-w*1.45,e+L-w*1.1,X+w*1.45,e+L+w*1.9],fill=255)
blood=blood.filter(ImageFilter.GaussianBlur(1.5)).point(lambda v:255 if v>110 else int(v*2.3))
bl=np.asarray(blood).astype(np.float32)/255
inner=np.asarray(blood.filter(ImageFilter.GaussianBlur(7))).astype(np.float32)/255
base=np.array([0.42,0.0,0.03]); dark=np.array([0.16,0.0,0.01])
t=np.clip(inner,0,1)[...,None]; rgb=dark*(1-t)+base*t
rim=np.clip(bl-np.roll(bl,(5,5),(0,1)),0,1)[...,None]*np.array([0.55,0.25,0.25])
rgb=np.clip(rgb+rim,0,1)
B=Image.fromarray((np.dstack([rgb,bl])*255).astype(np.uint8),"RGBA")
full=Image.alpha_composite(C,B); box=full.getbbox()
C.crop(box).save("capa-logo.png"); B.crop(box).save("capa-sangre.png")
C=full.crop(box); C.save("logo-5mentarios-halloween.png"); print(C.size, box)
bg=Image.new("RGBA",C.size,(8,6,10,255)); bg.alpha_composite(C); bg.convert("RGB").resize((C.width//2,C.height//2)).save("/tmp/claude-0/-home-user-Web/3cf86c2b-44ea-5a95-9193-e73049d0645b/scratchpad/hl.jpg")

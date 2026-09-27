from PIL import Image, ImageOps, ImageFilter
import numpy as np, glob, os
rng=np.random.default_rng(5)
def grade(path):
    im=ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    x=np.asarray(im).astype(np.float32)/255; h,w=x.shape[:2]
    lum=(x*[.2126,.7152,.0722]).sum(-1)
    # 1. igualar exposición: llevar la mediana de luminancia a un valor común
    med=np.median(lum); target=0.17
    gamma=np.log(target)/np.log(max(med,1e-3)); gamma=np.clip(gamma,.7,1.35)
    x=np.clip(x,0,1)**gamma
    # 2. balance: neutralizar dominantes fuertes (parcial) usando medios tonos
    lum=(x*[.2126,.7152,.0722]).sum(-1); m=(lum>.15)&(lum<.7)
    ref=x[m].mean(0) if m.sum()>1000 else x.reshape(-1,3).mean(0)
    cyan=max(0.0,float((ref[1]+ref[2])/2-ref[0]))/max(ref.mean(),1e-3)   # dominante cian relativa
    k=0.2+min(0.3,cyan*1.4)
    lw=(x*[.2126,.7152,.0722]).sum(-1,keepdims=True)
    prot=1-np.clip((lw-.6)/.3,0,1)          # no tocar luces muy brillantes (tubos LED, neón)
    x=x*(1+(ref.mean()/ref-1)*k*prot)
    # 3. niveles comunes y curva con negros densos pero no aplastados
    lo=np.percentile(x,0.5); hi=np.percentile(x,99.7); x=np.clip((x-lo)/(hi-lo),0,1)
    x=0.018+x*0.982
    s=x*x*(3-2*x); x=0.5*x+0.5*s
    # 4. tono: sombras verde botella, luces cálidas suaves
    l=(x*[.2126,.7152,.0722]).sum(-1,keepdims=True)
    x+= (1-l)**2.2*np.array([-.03,.03,.0]) + l**2*np.array([.035,.02,-.03])
    # luces muy brillantes (neón, focos) hacia un blanco cálido común
    hl=np.clip((l-.72)/.25,0,1)
    x=x*(1-.5*hl)+hl*.5*(l*np.array([1.04,.98,.86]))
    # 5. saturación: contenida en general, verdes ricos, piel protegida
    mx=x.max(-1); mn=x.min(-1); c=mx-mn+1e-6; r,g,b=x[...,0],x[...,1],x[...,2]
    hue=np.where(mx==r,((g-b)/c)%6,np.where(mx==g,(b-r)/c+2,(r-g)/c+4))*60
    green=np.clip(1-np.abs(hue-125)/45,0,1)
    skin=np.clip(1-np.abs(hue-25)/18,0,1)
    magenta=np.clip(1-np.abs(hue-290)/40,0,1)
    cyanh=np.clip(1-np.abs(hue-185)/30,0,1)
    f=0.8+0.3*green+0.08*skin-0.35*magenta-0.35*cyanh
    gray=l; x=gray+(x-gray)*f[...,None]
    # 6. viñeta y grano
    yy,xx=np.mgrid[0:h,0:w]; d=np.sqrt(((xx-w/2)/(w*.7))**2+((yy-h/2)/(h*.7))**2)
    x*=(1-0.35*np.clip(d-0.4,0,1)**1.4)[...,None]
    x=np.clip(x,0,1)
    x+=rng.normal(0,.012,(h,w,1))*(1-np.abs(x.mean(-1,keepdims=True)-.5)*1.4)
    out=Image.fromarray((np.clip(x,0,1)*255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=1.6,percent=55,threshold=3))
    return im,out
pairs=[]
for p in sorted(glob.glob("posts/fotos/pub2/original/*.jpg")):
    a,b=grade(p); b.save(p.replace("original","editadas"),quality=95); pairs.append((a,b)); print(os.path.basename(p),a.size)
W=216;H=384; c=Image.new("RGB",(W*4+30,H*2+10),"white")
for i,(a,b) in enumerate(pairs):
    c.paste(a.resize((W,H)),(i*(W+10),0)); c.paste(b.resize((W,H)),(i*(W+10),H+10))
c.save("/tmp/claude-0/-home-user-Web/3cf86c2b-44ea-5a95-9193-e73049d0645b/scratchpad/pub2.jpg")

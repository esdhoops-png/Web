import numpy as np
from synth import SR,rng,mf,tt,place,fft_filter,reverb,save,hat
def saw(f,t,ph=0): return 2*((f*t+ph)%1)-1
def chord_saw(ms,d,cut,a=0.005,dec=None,vel=1.0,det=0.12):
    t=tt(d); s=np.zeros(len(t))
    for m in ms:
        for dd in (-det,0,det): s+=saw(mf(m+dd),t,rng.random())
    s=fft_filter(s,hi=cut)/len(ms)/3
    env=np.minimum(t/a,1)*(np.exp(-t/dec) if dec else 1)*np.clip((d-t)/0.08,0,1)
    return s*env*vel
def rhodes(m,d,vel=1.0):
    t=tt(d); f=mf(m); I=1.2*np.exp(-t*4)
    s=np.sin(2*np.pi*f*t+I*np.sin(2*np.pi*f*t))+0.15*np.sin(2*np.pi*f*t*2+0.6*np.sin(2*np.pi*f*t))*np.exp(-t*3)
    trem=1+0.12*np.sin(2*np.pi*4.5*t)
    return s*np.minimum(t/0.006,1)*np.exp(-t*0.9)*np.clip((d-t)/0.2,0,1)*trem*vel*0.16
def k808(m,d,vel=1.0):
    t=tt(d); f=mf(m)*(1+0.5*np.exp(-t*25)); ph=2*np.pi*np.cumsum(f)/SR
    s=np.tanh(2.2*np.sin(ph))*np.exp(-t*1.1)*np.clip((d-t)/0.06,0,1)
    return s*vel*0.42
def hkick(vel=1.0):
    t=tt(0.35); f=48+110*np.exp(-t*35); ph=2*np.pi*np.cumsum(f)/SR
    return np.tanh(1.6*np.sin(ph))*np.exp(-t*10)*vel*0.7
def clap(vel=1.0):
    t=tt(0.3); n=fft_filter(rng.standard_normal(len(t)),lo=1000,hi=6000)
    env=sum(np.exp(-np.maximum(t-o,0)*60)*(t>=o) for o in (0,0.011,0.022))*0.5+np.exp(-t*14)*(t>=0.022)
    return n*env*vel*0.22
def shaker(vel=1.0):
    t=tt(0.09); n=fft_filter(rng.standard_normal(len(t)),lo=6000,hi=12000)
    return n*np.minimum(t/0.01,1)*np.exp(-t*45)*vel*0.07
def sidechain(n,kicks,depth=0.6,rel=0.16):
    t=np.arange(n)/SR; g=np.ones(n)
    for k in kicks:
        m=t>=k; g[m]=np.minimum(g[m],1-depth*np.exp(-(t[m]-k)/rel))
    return g
def riser(d,vel=1.0):
    t=tt(d); n=rng.standard_normal(len(t))
    lo=fft_filter(n,hi=1500); hi=fft_filter(n,lo=2500,hi=9000)
    x=t/d; return (lo*(1-x)+hi*x)*x**2*vel*0.18

# 1. Mañana empieza · deep house 122
def manana():
    D=9.5; n=int(D*SR); bt=60/122; bar=4*bt
    pads=np.zeros(n); drums=np.zeros(n); bass=np.zeros(n)
    prog=[[57,60,64,67,71],[53,57,60,64,67],[50,53,57,60,64],[52,55,59,62,64]]; roots=[33,29,38,28]
    kicks=[]
    for b in range(5):
        t0=b*bar; c=prog[b%4]
        place(pads,chord_saw(c,bar,700+b*250,a=0.3,vel=0.55),t0)
        for o in (0.5,1.5,2.75,3.5):
            place(pads,chord_saw([m+12 for m in c[:4]],0.3,2600,dec=0.09,vel=0.5),t0+o*bt)
        for k in range(4):
            tk=t0+k*bt
            if tk>=bar*0.99: place(drums,hkick(),tk); kicks.append(tk)
            place(drums,shaker(0.6),tk+bt/2); place(drums,hat(0.35,True),tk+bt/2)
            if k in(1,3) and tk>=bar: place(drums,clap(0.8),tk)
            if tk>=bar: place(bass,k808(roots[b%4]+12,bt*0.45,0.45),tk+bt*0.5)
    sc=sidechain(n,kicks)
    x=pads*sc+bass*sc+drums
    place(x,riser(bar*0.9,0.7),bar*0.1)
    return reverb(x,1.4,0.18)
# 2. 12 hábitos · beat oscuro 88.9 (cada hábito = 2 tiempos)
def habitos():
    D=21.2; n=int(D*SR); bt=0.675; H0=2.2
    pads=np.zeros(n); drums=np.zeros(n); b8=np.zeros(n); keys=np.zeros(n)
    prog=[[48,51,55,58,62],[44,48,51,55,58],[51,55,58,62],[46,50,53,57]]; roots=[36,32,39,34]
    place(pads,chord_saw(prog[0],H0+0.3,450,a=0.8,vel=0.8),0)
    place(drums,riser(H0,0.8),0)
    nb=int((D-H0)/bt)+1; kicks=[]
    for i in range(nb):
        t=H0+i*bt; br=i//4; c=prog[br%4]; last=t>=D-2.6
        if i%4==0:
            place(pads,chord_saw(c,bt*4,800,a=0.15,vel=0.6),t)
            for j,m in enumerate(c[1:]): place(keys,rhodes(m+12,bt*3.8,0.7),t+j*0.02)
            if not last: place(b8,k808(roots[br%4],bt*2.6),t)
        if i%4==2 and not last: place(b8,k808(roots[br%4]+(7 if br%2 else 3),bt*1.4,0.8),t+bt*0.5)
        if not last:
            if i%2==0: place(drums,hkick(0.9),t); kicks.append(t)
            else: place(drums,clap(0.9),t)
            if i%4==1: place(drums,hkick(0.6),t+bt*0.75); kicks.append(t+bt*0.75)
            for s in range(4):
                place(drums,shaker(0.9 if s%2==0 else 0.45),t+s*bt/4)
            if i%8==7:
                for s in range(3): place(drums,shaker(0.7),t+bt*0.5+s*bt/6)
    sc=sidechain(n,kicks,0.5,0.2)
    x=pads*sc+keys+b8+drums
    end=H0+12*1.35; place(x,chord_saw(prog[0],2.8,600,a=0.05,vel=0.7),end)
    x=fft_filter(x,hi=9000)
    return reverb(x,1.6,0.22)
# 3. Tu noche · neo-soul lento
def noche():
    D=10; n=int(D*SR); x=np.zeros(n)
    prog=[[50,53,57,60,64],[43,53,57,59,64],[48,52,55,59,62],[45,49,55,58,60]]
    place(x,chord_saw([38,45,50],D,350,a=1.0,vel=0.9),0)
    for m in [53,57,60,64]: place(x,rhodes(m,1.5,0.6),0.0)
    for i,c in enumerate(prog):
        t=1.4+i*1.3
        for j,m in enumerate(c): place(x,rhodes(m,1.6,0.75),t+j*0.035)
        place(x,k808(c[0]-12,1.2,0.55),t)
        place(x,hkick(0.35),t)
        place(x,shaker(0.4),t+0.65)
    t=1.4+4*1.3+0.3
    for j,m in enumerate([50,53,57,60,64,69]): place(x,rhodes(m,3.5,0.65),t+j*0.05)
    place(x,k808(38,3,0.5),t)
    x=fft_filter(x,hi=5000)
    return reverb(x,2.8,0.35)
# 4. Respira · ambient grave
def respira():
    D=35; n=int(D*SR); t=np.arange(n)/SR
    dark=chord_saw([38,45,50,53,60],D,280,a=2.0,vel=1.0)
    bright=chord_saw([38,45,50,53,60,64],D,1400,a=2.0,vel=0.9)
    air=fft_filter(rng.standard_normal(n),lo=400,hi=3000)*0.05
    w=np.zeros(n)
    for k in range(3):
        a=2.5+k*10
        m1=(t>=a)&(t<a+4); w[m1]=(t[m1]-a)/4
        m2=(t>=a+4)&(t<a+10); w[m2]=1-(t[m2]-a-4)/6
    w=0.5-0.5*np.cos(np.pi*np.clip(w,0,1))
    x=dark*(1-w)+bright*w+air*w
    x+=np.sin(2*np.pi*mf(26)*t)*0.12*np.minimum(t/3,1)
    return reverb(x,3.5,0.45)
for name,fn in [('manana',manana),('habitos',habitos),('noche',noche),('respira',respira)]:
    save(fn(),f'{name}2.wav',fade_out=1.2); print(name)

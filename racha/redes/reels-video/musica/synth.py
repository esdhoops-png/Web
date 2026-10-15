import numpy as np, wave, sys
SR=44100
rng=np.random.default_rng(7)
def mf(m): return 440*2**((m-69)/12)
def tt(d): return np.arange(int(d*SR))/SR
def place(buf,sig,t,g=1.0):
    i=int(t*SR); 
    if i>=len(buf): return
    n=min(len(sig),len(buf)-i); buf[i:i+n]+=sig[:n]*g
def fft_filter(x,lo=None,hi=None):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); m=np.ones_like(f)
    if lo: m*=1/(1+(lo/np.maximum(f,1))**4)
    if hi: m*=1/(1+(f/hi)**4)
    return np.fft.irfft(X*m,len(x))
def epiano(m,d=1.6,vel=1.0):
    t=tt(d); f=mf(m); I=2.2*np.exp(-t*6)
    s=np.sin(2*np.pi*f*t+I*np.sin(2*np.pi*f*t))+0.25*np.sin(2*np.pi*2*f*t)*np.exp(-t*5)
    env=np.minimum(t/0.004,1)*np.exp(-t*2.2)
    rel=np.clip((d-t)/0.15,0,1)
    return s*env*rel*vel*0.22
def piano(m,d=2.5,vel=1.0):
    t=tt(d); f=mf(m)
    s=sum(a*np.sin(2*np.pi*f*k*t)*np.exp(-t*(1.5+k*1.2)) for k,a in [(1,1),(2,.45),(3,.22),(4,.1)])
    return s*np.minimum(t/0.003,1)*np.clip((d-t)/0.2,0,1)*vel*0.2
def bell(m,d=3.0,vel=1.0):
    t=tt(d); f=mf(m)
    s=np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*2)+0.2*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*4)
    return s*np.minimum(t/0.002,1)*np.exp(-t*1.4)*vel*0.18
def bass(m,d=0.6,vel=1.0):
    t=tt(d); f=mf(m)
    s=np.sin(2*np.pi*f*t)+0.3*np.sin(2*np.pi*2*f*t)
    return s*np.minimum(t/0.01,1)*np.clip((d-t)/0.05,0,1)*np.exp(-t*1.5)*vel*0.32
def kick(vel=1.0):
    t=tt(0.4); f=45+90*np.exp(-t*30); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*9)*vel*0.75
def snare(vel=1.0):
    t=tt(0.25); n=fft_filter(rng.standard_normal(len(t)),lo=900,hi=7000)
    return (n*0.6*np.exp(-t*20)+0.4*np.sin(2*np.pi*190*t)*np.exp(-t*30))*vel*0.35
def hat(vel=1.0,open_=False):
    t=tt(0.3 if open_ else 0.08); n=fft_filter(rng.standard_normal(len(t)),lo=7000)
    return n*np.exp(-t*(12 if open_ else 70))*vel*0.12
def tick(vel=1.0):
    t=tt(0.12); return (np.sin(2*np.pi*1800*t)+0.5*np.sin(2*np.pi*2700*t))*np.exp(-t*45)*vel*0.18
def pad(ms,d,bright=1200,vel=1.0):
    t=tt(d); s=np.zeros(len(t))
    for m in ms:
        for det in (-0.08,0,0.08):
            f=mf(m+det); s+=2*((f*t+rng.random())%1)-1
    s=fft_filter(s,hi=bright)
    a=np.minimum(t/1.2,1)*np.clip((d-t)/1.2,0,1)
    return s*a*vel*0.05/len(ms)
def reverb(x,dur=1.8,mix=0.25):
    t=tt(dur); ir=rng.standard_normal(len(t))*np.exp(-t*3.2); ir=fft_filter(ir,hi=6000); ir/=np.sqrt((ir**2).sum())
    n=len(x)+len(ir); X=np.fft.rfft(x,n)*np.fft.rfft(ir,n); w=np.fft.irfft(X,n)[:len(x)]
    return x*(1-mix)+w*mix*1.6
def save(x,path,fade_in=0.05,fade_out=1.0):
    t=np.arange(len(x))/SR; d=len(x)/SR
    x=x*np.minimum(t/fade_in,1)*np.clip((d-t)/fade_out,0,1)
    x=x/ (np.abs(x).max()+1e-9)*0.9
    st=np.stack([x,x],1)
    with wave.open(path,'w') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())

# ---------- 1. Mañana empieza (9.5 s) · 120 bpm, alegre
def manana():
    D=9.5; b=np.zeros(int(D*SR)); bpm=120; bt=60/bpm
    prog=[[60,64,67,72],[55,62,67,71],[57,60,64,69],[53,57,60,65]]  # C G Am F
    roots=[36,43,45,41]
    for bar in range(5):
        c=prog[bar%4]; t0=bar*4*bt
        for k in range(4):
            for m in c: place(b,epiano(m,bt*0.9,0.8 if k else 1),t0+k*bt)
            place(b,bass(roots[bar%4],bt*0.9),t0+k*bt)
        for k in range(8):
            place(b,hat(0.8 if k%2 else 0.5),t0+k*bt/2)
        if t0>=1.0:
            place(b,kick(),t0); place(b,kick(0.8),t0+2*bt)
            place(b,snare(),t0+bt); place(b,snare(),t0+3*bt)
    for i in range(4): place(b,tick(1.2),1.4+i*1.1+0.45); place(b,bell(84+[0,2,4,7][i],1.5,0.6),1.4+i*1.1+0.45)
    place(b,bell(84,2.5,0.8),6.2); place(b,bell(91,2.5,0.6),6.2)
    return reverb(b,1.2,0.18)
# ---------- 2. 12 hábitos (21.2 s) · lo-fi 88.9 bpm, cada hábito = 2 tiempos
def habitos():
    D=21.2; b=np.zeros(int(D*SR)); bt=0.675; H0=2.2
    prog=[[57,60,64,67],[53,57,60,64],[48,55,59,64],[55,59,62,64]]  # Am7 Fmaj7 Cmaj7 G6
    roots=[33,29,36,31]
    # intro: pad + Rhodes suave
    place(b,pad([57,60,64,67],H0+0.6,900,1.2),0)
    for k,m in enumerate([69,72,76,79]): place(b,epiano(m,1.4,0.5),0.2+k*0.45)
    nb=int((D-H0)/bt)+1
    for i in range(nb):
        t=H0+i*bt; bar=i//4; c=prog[bar%4]
        if i%4==0:
            for m in c: place(b,epiano(m,bt*4,0.75),t)
            place(b,bass(roots[bar%4],bt*1.8),t); place(b,bass(roots[bar%4]+7,bt*0.9),t+bt*2.5)
        if t<D-2.6:
            if i%2==0: place(b,kick(),t)
            else: place(b,snare(0.9),t)
            if i%4==3: place(b,kick(0.6),t+bt*0.75)
        place(b,hat(0.7),t); place(b,hat(0.45),t+bt*0.58)
    for i in range(12): place(b,tick(0.5),H0+i*1.35)
    end=H0+12*1.35
    for m in [69,72,76,81]: place(b,epiano(m,2.6,0.8),end)
    place(b,bell(88,2.5,0.5),end)
    b=fft_filter(b,hi=7000)+fft_filter(rng.standard_normal(len(b)),lo=3000,hi=9000)*0.004
    return reverb(b,1.4,0.2)
# ---------- 3. Tu noche (10 s) · piano lento
def noche():
    D=10; b=np.zeros(int(D*SR))
    place(b,pad([50,57,62,66],D,700,1.4),0)
    for m,t in [(62,0.0),(69,0.35),(74,0.7)]: place(b,piano(m,3,0.7),t)
    notes=[(74,78),(71,76),(69,74),(66,74)]
    for i,(a,c) in enumerate(notes):
        t=1.4+i*1.3; place(b,piano(a,2.5,0.9),t); place(b,piano(c,2.5,0.5),t+0.05)
        place(b,piano([38,43,45,38][i],3,0.6),t)
    t=1.4+4*1.3+0.3
    for m in [62,66,69,74,78]: place(b,piano(m,3.5,0.6),t)
    return reverb(b,2.5,0.35)
# ---------- 4. Respira (35 s) · ambiente sincronizado con la respiración
def respira():
    D=35; n=int(D*SR); t=np.arange(n)/SR
    dark=pad([50,57,62,64,69],D,500,2.0); bright=pad([50,57,62,64,69],D,2500,2.0)
    w=np.zeros(n)
    for k in range(3):
        a=2.5+k*10
        m1=(t>=a)&(t<a+4); w[m1]=(t[m1]-a)/4
        m2=(t>=a+4)&(t<a+10); w[m2]=1-(t[m2]-a-4)/6
    w=0.5-0.5*np.cos(np.pi*np.clip(w,0,1))
    b=dark*(1-w)+bright*w*1.15
    sub=np.sin(2*np.pi*mf(38)*t)*0.06*np.minimum(t/2,1)
    b+=sub*(0.6+0.4*w)
    for k in range(3):
        a=2.5+k*10; place(b,bell(74,4,0.7),a); place(b,bell(69,5,0.55),a+4)
    place(b,bell(81,4,0.5),0.3); place(b,bell(86,5,0.6),32.5); place(b,bell(78,5,0.4),32.6)
    return reverb(b,3.0,0.4)
if __name__=="__main__":
  for name,fn in [("manana",manana),("habitos",habitos),("noche",noche),("respira",respira)]:
    save(fn(),f"{name}.wav"); print(name)

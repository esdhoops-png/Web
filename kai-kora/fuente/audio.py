"""Synthesized soundtrack for the Kai Kora bunny-hop reel. Usage: python3 audio.py out.wav"""
import sys, wave
import numpy as np

SR, DUR = 48000, 8.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)

def note(f): return 440.0 * 2 ** ((f - 69) / 12)        # midi -> Hz

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); sig = sig[:max(0, N - i)]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gain * gl * 1.414
    R[i:i + len(sig)] += sig * gain * gr * 1.414

def env(n, a, d):                                        # attack seconds, exp decay time constant
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def marimba(m, dur=1.2, bright=1.0):
    f = note(m); n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * env(n, .002, .45)
    s += bright * .35 * np.sin(2 * np.pi * f * 4 * t) * env(n, .001, .06)
    s += .15 * np.sin(2 * np.pi * f * 10 * t) * env(n, .001, .015)
    return s

def bell(m, dur=2.5):
    f = note(m); n = int(dur * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * t) * env(n, .002, d)
            for r, a, d in [(1, 1, 1.1), (2.76, .35, .5), (5.4, .15, .25), (2.0, .25, .8)])
    return s

def pad(ms, dur, att, rel):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for m in ms:
        for det in (-0.12, 0.0, 0.12):                   # gentle chorus
            f = note(m + det)
            s += np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 2 * f * t + 1)
    e = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel)
    return s * e / (len(ms) * 3)

def hop_up(dur=.16):                                     # soft upward "bwip"
    n = int(dur * SR); t = np.arange(n) / SR
    f = 260 + 520 * (t / dur) ** 0.7
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 2

def thump(dur=.18):                                      # soft paw landing
    n = int(dur * SR); t = np.arange(n) / SR
    f = 150 * np.exp(-t * 12) + 70
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .05)
    nz = np.convolve(rng.normal(0, 1, n), np.ones(40) / 40, 'same') * env(n, .001, .02)
    return s + .6 * nz

def whoosh(dur, rise=True):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = rng.normal(0, 1, n)
    out = np.zeros(n); y = 0.0
    cut = (np.linspace(.02, .25, n) if rise else np.linspace(.25, .02, n))
    for i in range(n):                                   # sweeping one-pole lowpass
        y += cut[i] * (nz[i] - y); out[i] = y
    return out * np.sin(np.pi * t / dur) ** 2

def sparkle(t0, count=7, base=84):
    for k in range(count):
        add(bell(base + [0, 4, 7, 12, 16, 19, 24][k % 7], 1.2) * .5, t0 + k * .045, .10 * (1 - k / (count + 2)),
            pan=rng.uniform(-.6, .6))

# ---- timeline (matches render_salto.py) ----
HOPS = [(1.25, 0.50, -0.45), (1.91, 0.48, -0.3), (2.55, 0.78, -0.1)]   # takeoff, duration, pan
T_LAND = 3.49

# music bed: Fmaj9 swelling in, resolving at the end
add(pad([53, 60, 64, 69], 4.2, 1.6, 1.0), 0.0, .16)
add(pad([50, 57, 62, 65], 2.0, .8, .9), 3.3, .13)          # Dm9 colour under the landing
add(pad([53, 60, 65, 69, 72], 3.0, .9, 1.4), 5.0, .17)      # home chord
add(np.sin(2 * np.pi * note(41) * np.arange(int(3.2 * SR)) / SR) * env(int(3.2 * SR), .3, 1.6), 5.0, .10)

# K appears: soft rising air
add(whoosh(1.3), 0.2, .05)

# hops: a little "bwip" on takeoff, paw thump + rising marimba note on landing
melody = [72, 76, 79]
for (t0, d, pan), m in zip(HOPS, melody):
    add(hop_up(.16 if d < .7 else .24), t0 - .02, .07, pan)
    add(thump(), t0 + d, .22, pan + .15)
    add(marimba(m), t0 + d, .23, pan + .15)
# final leap is longer: add a gentle rising swish
add(whoosh(.7), 2.6, .035, -.1)

# landing inside the K: bell + sparkles
add(bell(84, 3.0), 3.33, .20)
add(bell(79, 3.0), 3.36, .12, .2)
sparkle(3.40)

# text: line swish, KAI letters, KORA shimmer, tagline resolution
add(whoosh(.9, rise=False), 3.30, .03)
for k, m in enumerate([77, 81, 84]):                       # K, A, I
    add(marimba(m, bright=.6), 3.59 + k * .16, .11, (k - 1) * .4)
add(whoosh(1.1), 4.25, .025)
add(bell(89, 2.0), 4.75, .05, .3)
add(bell(72, 3.5), 5.44, .14, -.15)
add(bell(77, 3.5), 5.47, .10, .15)
add(bell(81, 3.5), 5.50, .08)

# ---- simple stereo reverb (decaying noise IR) ----
ir_n = int(1.6 * SR); ti = np.arange(ir_n) / SR
irL = rng.normal(0, 1, ir_n) * np.exp(-ti / .45); irR = rng.normal(0, 1, ir_n) * np.exp(-ti / .45)
irL /= np.sqrt((irL ** 2).sum()); irR /= np.sqrt((irR ** 2).sum())
def conv(x, h):
    m = len(x) + len(h); F = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(h, F), F)[:len(x)]
L, R = L + .28 * conv(L, irL), R + .28 * conv(R, irR)

# fade in/out, normalize
t = np.arange(N) / SR
fade = np.minimum(1, t / .05) * np.clip((DUR - t) / 1.2, 0, 1) ** 1.5
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak * .89, R / peak * .89

pcm = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

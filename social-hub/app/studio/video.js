// Motor de vídeo del Estudio: escenas (fotos / vídeos + textos + subtítulos + transiciones + música)
// renderizadas en un canvas y grabadas con MediaRecorder. Es un render real en el navegador, en tiempo real:
// un reel de 20 s tarda unos 20 s en exportarse. No usa IA.
// Documento: { kind:'video', width, height, fps, script, music:{ref,name}|null, outro:true, scenes:[
//   { id, media:{ref, type:'image'|'video', name}|null, duration, text, sub, transition:'cut'|'fade'|'slide', zoom:true } ] }
import { uid } from './engine.js';

let resolveStorage = async (p) => p;
export function setVideoStorageResolver(fn) { resolveStorage = fn; }
const srcOf = async (ref) => (!ref ? null : ref.kind === 'storage' ? resolveStorage(ref.path) : ref.kind === 'asset' ? new URL(ref.path, document.baseURI).href : ref.url);

export const newVideoDoc = (format = 'story') => {
  const [w, h] = format === 'landscape' ? [1920, 1080] : format === 'square' ? [1080, 1080] : [1080, 1920];
  return { kind: 'video', width: w, height: h, fps: 30, script: '', music: null, outro: true, scenes: [newScene()] };
};
export const newScene = () => ({ id: uid(), media: null, duration: 2.5, text: '', sub: '', transition: 'fade', zoom: true });
export const OUTRO = 2.5;
export const totalDuration = (doc) => doc.scenes.reduce((a, s) => a + Number(s.duration || 0), 0) + (doc.outro ? OUTRO : 0);

export function pickMime() {
  const c = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return c.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || null;
}

async function loadMedia(doc) {
  const logo = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = new URL('icons/5mentarios-sello.svg', document.baseURI).href; });
  const items = await Promise.all(doc.scenes.map(async (s) => {
    if (!s.media?.ref) return null;
    const src = await srcOf(s.media.ref);
    if (s.media.type === 'video') {
      const v = document.createElement('video'); v.crossOrigin = 'anonymous'; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = src;
      await new Promise((res) => { v.onloadeddata = res; v.onerror = res; setTimeout(res, 8000); });
      return v;
    }
    return new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  }));
  await Promise.all(['400 60px "Anton"', '600 40px "Barlow Condensed"'].map((f) => document.fonts.load(f).catch(() => {})));
  return { logo, items };
}

function cover(ctx, el, W, H, zoom) {
  const iw = el.videoWidth || el.width, ih = el.videoHeight || el.height; if (!iw || !ih) return;
  const r = Math.max(W / iw, H / ih) * zoom; const dw = iw * r, dh = ih * r;
  ctx.drawImage(el, (W - dw) / 2, (H - dh) / 2, dw, dh);
}
function drawScene(ctx, doc, s, el, local, W, H) {
  ctx.fillStyle = '#050806'; ctx.fillRect(0, 0, W, H);
  if (el) cover(ctx, el, W, H, s.zoom ? 1 + 0.06 * (local / Math.max(s.duration, 0.1)) : 1);
  else { const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.7); g.addColorStop(0, 'rgba(43,176,97,.35)'); g.addColorStop(1, 'rgba(43,176,97,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  const k = W / 1080;
  if (s.text) {
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
    ctx.font = `400 ${Math.round(110 * k)}px "Anton"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const appear = Math.min(1, local / 0.3); ctx.globalAlpha = appear;
    const lines = s.text.toUpperCase().split('\n'); const lh = 118 * k; const y0 = H / 2 - ((lines.length - 1) * lh) / 2;
    ctx.shadowColor = '#2BB061'; ctx.shadowBlur = 40 * k; ctx.fillStyle = '#F2EFE8';
    lines.forEach((ln, i) => ctx.fillText(ln, W / 2, y0 + i * lh + (1 - appear) * 30 * k)); ctx.restore();
  }
  if (s.sub) {
    ctx.save(); ctx.font = `600 ${Math.round(46 * k)}px "Barlow Condensed"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(s.sub).width + 60 * k; const y = H * (H > W ? 0.8 : 0.85);
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect((W - tw) / 2, y - 40 * k, tw, 80 * k);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(s.sub, W / 2, y); ctx.restore();
  }
}
function drawOutro(ctx, logo, local, W, H) {
  ctx.fillStyle = '#050806'; ctx.fillRect(0, 0, W, H);
  const k = Math.min(W, H) / 1080; const p = Math.min(1, local / 0.6); const ease = 1 - Math.pow(1 - p, 3);
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 520 * k); g.addColorStop(0, `rgba(43,176,97,${0.45 * ease})`); g.addColorStop(1, 'rgba(43,176,97,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (logo) { const s = 520 * k * (0.8 + 0.2 * ease); ctx.globalAlpha = ease; ctx.drawImage(logo, (W - s) / 2, H / 2 - s * 0.55, s, s * (1082 / 1176)); }
  ctx.globalAlpha = Math.min(1, Math.max(0, (local - 0.6) / 0.4)); ctx.font = `600 ${Math.round(48 * k)}px "Barlow Condensed"`; ctx.textAlign = 'center'; ctx.fillStyle = '#2BB061';
  ctx.fillText('@heineken5mentarios', W / 2, H / 2 + 330 * k); ctx.globalAlpha = 1;
}

// Dibuja el instante t (segundos). Devuelve el índice de escena (o -1 = cierre)
export function drawAt(ctx, doc, media, t) {
  const W = doc.width, H = doc.height; let acc = 0;
  for (let i = 0; i < doc.scenes.length; i++) {
    const s = doc.scenes[i]; const d = Number(s.duration || 0);
    if (t < acc + d) {
      const local = t - acc; const el = media.items[i];
      if (el && el.tagName === 'VIDEO') { const want = Math.min(local, (el.duration || d) - 0.05); if (Math.abs(el.currentTime - want) > 0.25) el.currentTime = want; }
      drawScene(ctx, doc, s, el, local, W, H);
      const tr = s.transition; const td = 0.4;
      if (i > 0 && local < td && tr !== 'cut') {
        const prev = doc.scenes[i - 1]; const pa = 1 - local / td;
        ctx.save();
        if (tr === 'fade') { ctx.globalAlpha = pa; drawScene(ctx, doc, prev, media.items[i - 1], Number(prev.duration), W, H); }
        if (tr === 'slide') { ctx.translate(-W * (local / td), 0); drawScene(ctx, doc, prev, media.items[i - 1], Number(prev.duration), W, H); }
        ctx.restore();
      }
      return i;
    }
    acc += d;
  }
  if (doc.outro) drawOutro(ctx, media.logo, t - acc, W, H);
  return -1;
}

export async function prepare(doc) { return loadMedia(doc); }

// Exporta el vídeo (tiempo real). onProgress(0..1)
export async function exportVideo(doc, { onProgress, signal } = {}) {
  const mime = pickMime();
  if (!mime) throw new Error('Este navegador no puede grabar vídeo (MediaRecorder). Usa Chrome, Edge o Safari actualizados.');
  const media = await loadMedia(doc);
  const canvas = document.createElement('canvas'); canvas.width = doc.width; canvas.height = doc.height;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(doc.fps || 30);
  let audioEl = null, actx = null;
  if (doc.music?.ref) {
    audioEl = new Audio(); audioEl.crossOrigin = 'anonymous'; audioEl.src = await srcOf(doc.music.ref);
    actx = new AudioContext(); const srcNode = actx.createMediaElementSource(audioEl); const dest = actx.createMediaStreamDestination();
    srcNode.connect(dest); dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  }
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise((res) => (rec.onstop = res));
  const total = totalDuration(doc);
  media.items.forEach((el) => { if (el && el.tagName === 'VIDEO') { el.currentTime = 0; el.play().catch(() => {}); } });
  drawAt(ctx, doc, media, 0);
  rec.start(250);
  if (audioEl) { await actx.resume(); audioEl.currentTime = 0; audioEl.play().catch(() => {}); }
  const t0 = performance.now();
  await new Promise((res) => {
    const tick = () => {
      if (signal?.aborted) return res();
      const t = (performance.now() - t0) / 1000;
      if (t >= total) return res();
      drawAt(ctx, doc, media, t); onProgress && onProgress(t / total);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop(); await done;
  media.items.forEach((el) => el && el.tagName === 'VIDEO' && el.pause());
  if (audioEl) { audioEl.pause(); actx.close(); }
  if (signal?.aborted) throw new Error('Exportación cancelada');
  const type = mime.split(';')[0];
  return { blob: new Blob(chunks, { type }), type, ext: type === 'video/mp4' ? 'mp4' : 'webm', duration: total };
}

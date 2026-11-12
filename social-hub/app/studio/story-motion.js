// Stories animadas de 5mentarios (1080×1920), recreadas del vídeo real «story-esta-semana-12-14-nov.mp4»:
// fondo oscuro con rayos verdes que giran, logo arriba a la izquierda, pastilla verde con las fechas arriba a la derecha,
// escena de entrada («ESTA SEMANA» / «HOY»), una escena por día (día en contorno verde, subtítulo espaciado, filas hora/artista
// que entran una a una, banda verde girada para los eventos), «RESERVA TU MESA» + WhatsApp y cierre con el logo.
// Se dibuja fotograma a fotograma en un canvas: el mismo código sirve para la vista previa, para grabar en el navegador
// (MediaRecorder, en tiempo real) y para renderizar fuera (fotograma a fotograma). No usa IA.
//
// spec = { mode: 'semana' | 'hoy', rango: '26 – 29 NOV', intro: { t1, t2, sub, tags }, days: [
//   { dia: 'VIE 27', kicker: 'MÚSICA EN DIRECTO + DJ', band: null | 'TARDEO PRE NAVIDAD', title: null | '4º ANIVERSARIO',
//     desde: null | 'DESDE LAS 17:00', rows: [['22:30', 'ALBERTO DÉNIZ'], ['00:00', 'DJ AKE']], big: null | 'SOLD OUT' } ],
//   cta: { t1: 'RESERVA', t2: 'TU MESA', pill: 'WHATSAPP 627 304 115' }, outro: 'ARUCAS · TE ESPERAMOS' }

const G = '#2BB061', BG = '#07100B', W0 = 1080, H0 = 1920;
const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const at = (t, start, dur = 0.45) => ease((t - start) / dur);

export function storyTimeline(spec) {
  const sc = [];
  let t = 0;
  const push = (type, dur, data) => { sc.push({ type, start: t, dur, data }); t += dur; };
  push('intro', spec.mode === 'hoy' ? 2.4 : 2.6, spec.intro || {});
  for (const d of spec.days || []) {
    const n = (d.rows || []).length;
    push('day', Math.max(2.8, 1.5 + 0.42 * n + 1.3 + (d.band ? 0.5 : 0)), d);
  }
  if (spec.cta) push('cta', 2.2, spec.cta);
  push('outro', 2.4, { text: spec.outro || 'ARUCAS · TE ESPERAMOS' });
  return sc;
}
export const storyDuration = (spec) => { const s = storyTimeline(spec); const l = s[s.length - 1]; return l.start + l.dur; };

export async function loadStoryAssets(base = document.baseURI) {
  const logo = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = new URL('icons/5mentarios-sello.svg', base).href; });
  await Promise.all(['400 100px "Anton"', '900 40px "Barlow Condensed"', '600 40px "Barlow Condensed"'].map((f) => document.fonts.load(f).catch(() => {})));
  return { logo };
}

function spaced(ctx, text, x, y, ls, align = 'left') {
  const chars = [...text]; const w = chars.reduce((a, c) => a + ctx.measureText(c).width + ls, -ls);
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  for (const c of chars) { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + ls; }
  return w;
}
function fitFont(ctx, text, family, size, maxW, weight = 400) {
  let s = size; ctx.font = `${weight} ${s}px ${family}`;
  while (s > 20 && ctx.measureText(text).width > maxW) { s -= 4; ctx.font = `${weight} ${s}px ${family}`; }
  return s;
}
function pill(ctx, text, cx, y, h, fill, color, size, align = 'center', ls = 3) {
  ctx.font = `900 ${size}px "Barlow Condensed"`;
  const w = [...text].reduce((a, c) => a + ctx.measureText(c).width + ls, -ls) + h * 0.9;
  const x = align === 'center' ? cx - w / 2 : align === 'right' ? cx - w : cx;
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.fillStyle = color; ctx.textBaseline = 'middle'; spaced(ctx, text, x + w / 2, y + h / 2 + 1, ls, 'center'); ctx.textBaseline = 'alphabetic';
}

function background(ctx, t, W, H, strength = 1) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.42, R = H * 1.1, n = 26, rot = t * 0.07;
  ctx.save(); ctx.globalAlpha = 0.38 * strength;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2, da = (Math.PI / n) * 0.55;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, 'rgba(43,176,97,.32)'); g.addColorStop(0.55, 'rgba(43,176,97,.10)'); g.addColorStop(1, 'rgba(43,176,97,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a - da) * R, cy + Math.sin(a - da) * R); ctx.lineTo(cx + Math.cos(a + da) * R, cy + Math.sin(a + da) * R); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.75); glow.addColorStop(0, `rgba(43,176,97,${0.22 * strength})`); glow.addColorStop(1, 'rgba(43,176,97,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(cx, H / 2, H * 0.35, cx, H / 2, H * 0.8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function header(ctx, spec, assets, W, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  if (assets.logo) ctx.drawImage(assets.logo, 60, 64, 112, 112 * (1082 / 1176));
  if (spec.rango) pill(ctx, spec.rango, W - 60, 82, 58, G, '#04140A', 30, 'right', 3);
  ctx.restore();
}

function glowText(ctx, text, x, y, size, color, glow = true, align = 'center') {
  ctx.font = `400 ${size}px "Anton"`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (glow) { ctx.save(); ctx.shadowColor = G; ctx.shadowBlur = size * 0.35; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore(); }
  ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.textAlign = 'left';
}

function sceneIntro(ctx, spec, d, lt, W, H) {
  const a = at(lt, 0.1, 0.5), s = 0.86 + 0.14 * a;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, H * 0.4); ctx.scale(s, s); ctx.translate(-W / 2, -H * 0.4);
  if (spec.mode === 'hoy') {
    glowText(ctx, d.t1 || 'HOY', W / 2, H * 0.42, 380, G);
  } else {
    glowText(ctx, d.t1 || 'ESTA', W / 2, H * 0.33, 250, G);
    glowText(ctx, d.t2 || 'SEMANA', W / 2, H * 0.33 + 240, 250, G);
  }
  ctx.restore();
  const b = at(lt, 0.55, 0.5); ctx.save(); ctx.globalAlpha = b;
  const y = spec.mode === 'hoy' ? H * 0.42 + 120 : H * 0.33 + 350;
  ctx.font = '400 84px "Anton"'; ctx.fillStyle = '#F2EFE8'; ctx.textAlign = 'center'; ctx.fillText(d.sub || 'EN 5MENTARIOS', W / 2, y + (1 - b) * 30);
  if (d.tags) { ctx.font = '900 34px "Barlow Condensed"'; ctx.fillStyle = 'rgba(242,239,232,.7)'; spaced(ctx, d.tags, W / 2, y + 70 + (1 - b) * 30, 7, 'center'); }
  ctx.textAlign = 'left'; ctx.restore();
}

function sceneDay(ctx, spec, d, lt, W, H) {
  // día en contorno verde, arriba
  const a = at(lt, 0, 0.45);
  ctx.save(); ctx.globalAlpha = a;
  const ds = fitFont(ctx, d.dia, '"Anton"', 230, W - 120);
  ctx.font = `400 ${ds}px "Anton"`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = G;
  ctx.shadowColor = G; ctx.shadowBlur = 18; ctx.strokeText(d.dia, W / 2, H * 0.215 - (1 - a) * 40); ctx.restore();
  let y = H * 0.3;
  if (d.band) {
    const b = at(lt, 0.35, 0.4);
    ctx.save(); ctx.globalAlpha = b; ctx.translate(W / 2, y + 50); ctx.rotate(-0.05); ctx.scale(0.8 + 0.2 * b, 0.8 + 0.2 * b);
    const bs = fitFont(ctx, d.band, '"Anton"', 84, W * 0.8); ctx.font = `400 ${bs}px "Anton"`;
    const bw = ctx.measureText(d.band).width + 60;
    ctx.fillStyle = G; ctx.fillRect(-bw / 2, -bs * 0.62, bw, bs * 1.2); ctx.fillStyle = '#04140A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.band, 0, 4);
    ctx.restore(); y += 150;
  }
  if (d.title) {
    const b = at(lt, d.band ? 0.6 : 0.3, 0.45);
    ctx.save(); ctx.globalAlpha = b; const ts = fitFont(ctx, d.title, '"Anton"', 150, W - 140);
    glowText(ctx, d.title, W / 2, y + ts * 0.85 + (1 - b) * 30, ts, '#F2EFE8', false); ctx.restore(); y += ts + 20;
  }
  if (d.kicker || d.desde) {
    const b = at(lt, d.band ? 0.8 : 0.35, 0.45); ctx.save(); ctx.globalAlpha = b;
    ctx.font = '900 36px "Barlow Condensed"'; ctx.fillStyle = G; ctx.textAlign = 'left';
    spaced(ctx, d.kicker || d.desde, W / 2, y + 46, 8, 'center'); ctx.restore(); y += 90;
  }
  if (d.big) {
    const b = at(lt, 0.6, 0.5); ctx.save(); ctx.globalAlpha = b; const bs = fitFont(ctx, d.big, '"Anton"', 200, W - 140);
    glowText(ctx, d.big, W / 2, y + bs * 0.9 + (1 - b) * 40, bs, '#F2EFE8', true); ctx.restore(); y += bs + 40;
  }
  const rows = d.rows || [], start = (d.band ? 1.0 : 0.6) + (d.big ? 0.3 : 0), rh = rows.length > 3 ? 112 : 130;
  const hs = rows.length > 3 ? 64 : 76;
  rows.forEach(([hora, quien], i) => {
    const b = at(lt, start + i * 0.42, 0.42), yy = y + 40 + i * rh;
    ctx.save(); ctx.globalAlpha = b; ctx.translate(-(1 - b) * 70, 0);
    ctx.font = `400 ${hs}px "Anton"`; ctx.fillStyle = G; ctx.textAlign = 'left'; ctx.fillText(hora || '', 130, yy + hs);
    const ns = fitFont(ctx, quien || '', '"Anton"', hs, W - 330 - 110); ctx.font = `400 ${ns}px "Anton"`; ctx.fillStyle = '#F2EFE8'; ctx.fillText(quien || '', 330, yy + hs);
    ctx.fillStyle = 'rgba(43,176,97,.35)'; ctx.fillRect(130, yy + rh - 18, W - 260, 2);
    ctx.restore();
  });
}

function sceneCta(ctx, spec, d, lt, W, H) {
  const a = at(lt, 0, 0.45); ctx.save(); ctx.globalAlpha = a; const s = 0.9 + 0.1 * a;
  ctx.translate(W / 2, H * 0.42); ctx.scale(s, s); ctx.translate(-W / 2, -H * 0.42);
  glowText(ctx, d.t1 || 'RESERVA', W / 2, H * 0.4, 190, '#F2EFE8', false);
  glowText(ctx, d.t2 || 'TU MESA', W / 2, H * 0.4 + 190, 190, '#F2EFE8', false);
  ctx.restore();
  if (d.pill) { const b = at(lt, 0.45, 0.4); ctx.save(); ctx.globalAlpha = b; pill(ctx, d.pill, W / 2, H * 0.4 + 260 + (1 - b) * 20, 76, G, '#04140A', 38, 'center', 3); ctx.restore(); }
}

function sceneOutro(ctx, spec, d, lt, W, H, assets) {
  ctx.save(); ctx.globalAlpha = clamp(lt / 0.35) * 0.85; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const a = at(lt, 0.15, 0.6), s = 0.8 + 0.2 * a, lw = 460;
  if (assets.logo) {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, H * 0.47); ctx.scale(s, s);
    ctx.shadowColor = G; ctx.shadowBlur = 50 + 20 * Math.sin(lt * 4);
    ctx.drawImage(assets.logo, -lw / 2, -lw * (1082 / 1176) / 2, lw, lw * (1082 / 1176)); ctx.restore();
  }
  const b = at(lt, 0.8, 0.5); ctx.save(); ctx.globalAlpha = b; ctx.font = '900 38px "Barlow Condensed"'; ctx.fillStyle = 'rgba(242,239,232,.75)';
  spaced(ctx, d.text, W / 2, H * 0.47 + 330, 8, 'center'); ctx.restore();
}

// Dibuja el fotograma del instante t (segundos)
export function drawStory(ctx, spec, t, assets = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.save(); ctx.scale(W / W0, H / H0);
  const tl = storyTimeline(spec);
  const sc = tl.find((s) => t >= s.start && t < s.start + s.dur) || tl[tl.length - 1];
  const lt = t - sc.start;
  background(ctx, t, W0, H0, sc.type === 'outro' ? Math.max(0, 1 - lt / 0.4) : 1);
  if (sc.type !== 'outro') header(ctx, spec, assets, W0, at(t, 0, 0.4));
  // salida de cada escena: fundido en los últimos 0,28 s (menos la última)
  const out = sc.type === 'outro' ? 1 : clamp((sc.dur - lt) / 0.28);
  ctx.save(); ctx.globalAlpha = out;
  if (sc.type === 'intro') sceneIntro(ctx, spec, sc.data, lt, W0, H0);
  else if (sc.type === 'day') sceneDay(ctx, spec, sc.data, lt, W0, H0);
  else if (sc.type === 'cta') sceneCta(ctx, spec, sc.data, lt, W0, H0);
  else sceneOutro(ctx, spec, sc.data, lt, W0, H0, assets);
  ctx.restore(); ctx.restore();
}

// Graba la story en el navegador (tiempo real). Devuelve { blob, ext, mime }.
export async function recordStory(spec, { onProgress = () => {} } = {}) {
  const assets = await loadStoryAssets();
  const c = document.createElement('canvas'); c.width = W0; c.height = H0; const ctx = c.getContext('2d');
  const mimes = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
  const mime = mimes.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
  if (!mime) throw new Error('Este navegador no puede grabar vídeo (MediaRecorder).');
  const dur = storyDuration(spec); drawStory(ctx, spec, 0, assets);
  const stream = c.captureStream(30); const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise((res) => { rec.onstop = res; });
  rec.start(250); const t0 = performance.now();
  await new Promise((res) => { const loop = () => { const t = (performance.now() - t0) / 1000; drawStory(ctx, spec, Math.min(t, dur - 0.001), assets); onProgress(Math.min(1, t / dur)); if (t < dur) requestAnimationFrame(loop); else res(); }; loop(); });
  rec.stop(); await done;
  const type = mime.split(';')[0];
  return { blob: new Blob(chunks, { type }), ext: type === 'video/mp4' ? 'mp4' : 'webm', mime: type, duration: dur };
}

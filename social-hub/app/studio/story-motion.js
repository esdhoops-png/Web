// Stories animadas de 5mentarios (1080×1920), recreadas del vídeo real «story-esta-semana-12-14-nov.mp4»:
// fondo oscuro con rayos verdes que giran, logo arriba a la izquierda, pastilla verde con las fechas arriba a la derecha,
// escena de entrada («ESTA SEMANA» / «HOY»), una escena por día (día en contorno verde, subtítulo espaciado, filas hora/artista
// que entran una a una, banda verde girada para los eventos), «RESERVA TU MESA» + WhatsApp y cierre con el logo.
// Se dibuja fotograma a fotograma en un canvas: el mismo código sirve para la vista previa, para grabar en el navegador
// (MediaRecorder, en tiempo real) y para renderizar fuera (fotograma a fotograma). No usa IA.
//
// Además: mode 'hoy' (recreada de story-hoy-sabado-31.mp4: «HOY», una escena por actuación con la hora en contorno, foto
// recortada y nombre, resumen y logo) y mode 'partido' (recreada de las stories de Champions del 3 y 4 nov).
//   hoy:     { mode:'hoy', rango:'SÁBADO 31', intro:{ sub, tags }, acts:[{ hora, kicker, name, photo }], resumen:{ t1, t2 }, cta:{ pill } }
//   partido: { mode:'partido', rango:'CHAMPIONS', local, visitante, hora, photo }
// spec = { mode: 'semana', rango: '26 – 29 NOV', intro: { t1, t2, sub, tags }, days: [
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
  if (spec.mode === 'hoy') {
    push('hintro', 2.2, spec.intro || {});
    (spec.acts || []).forEach((a, i) => push('act', 2.4, { ...a, n: i + 1, of: spec.acts.length }));
    push('resumen', 3.2, spec);
    push('outro', 2.3, { text: spec.outro || 'ARUCAS · NOS VEMOS HOY' });
    return sc;
  }
  if (spec.mode === 'partido') {
    push('match', 8.4, spec);
    push('outro', 2.8, { text: spec.outro || 'ARUCAS · NOS VEMOS HOY' });
    return sc;
  }
  push('intro', 2.6, spec.intro || {});
  for (const d of spec.days || []) {
    const n = (d.rows || []).length;
    push('day', Math.max(2.8, 1.5 + 0.42 * n + 1.3 + (d.band ? 0.5 : 0)), d);
  }
  if (spec.cta) push('cta', 2.2, spec.cta);
  push('outro', 2.4, { text: spec.outro || 'ARUCAS · TE ESPERAMOS' });
  return sc;
}
export const storyDuration = (spec) => { const s = storyTimeline(spec); const l = s[s.length - 1]; return l.start + l.dur; };

const img = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
// Logo + fotos de artistas (media/artistas/<archivo>.png, recortes sin fondo sacados de los PSD) que use la story
export async function loadStoryAssets(base = document.baseURI, spec = null) {
  const logo = await img(new URL('icons/5mentarios-sello.svg', base).href);
  const files = [...new Set([...(spec?.acts || []).map((a) => a.photo), spec?.photo].filter(Boolean))];
  const photos = Object.fromEntries(await Promise.all(files.map(async (f) => [f, await img(new URL('media/artistas/' + f, base).href)])));
  await Promise.all(['400 100px "Anton"', '900 40px "Barlow Condensed"', '600 40px "Barlow Condensed"'].map((f) => document.fonts.load(f).catch(() => {})));
  return { logo, photos };
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


// ---------- «HOY» (recreada de story-hoy-sabado-31.mp4) ----------
function glowBg(ctx, W, H, t) {
  ctx.fillStyle = '#060A08'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.36, 0, W / 2, H * 0.36, W * 0.95); g.addColorStop(0, `rgba(30,110,62,${0.42 + 0.04 * Math.sin(t * 1.5)})`); g.addColorStop(0.6, 'rgba(20,70,40,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function sceneHoyIntro(ctx, spec, d, lt, W, H) {
  const a = at(lt, 0, 0.7), s = 2.2 - 1.2 * a;
  ctx.save(); ctx.globalAlpha = Math.min(1, 0.25 + a); ctx.translate(W / 2, H * 0.4); ctx.scale(s, s);
  glowText(ctx, d.t1 || 'HOY', 0, 0, 330, G); ctx.restore();
  const b = at(lt, 0.7, 0.45); ctx.save(); ctx.globalAlpha = b; ctx.textAlign = 'center';
  ctx.font = '400 78px "Anton"'; ctx.fillStyle = '#F2EFE8'; ctx.fillText(d.sub || 'EN 5MENTARIOS', W / 2, H * 0.4 + 120 + (1 - b) * 24);
  if (d.tags) { ctx.font = '900 32px "Barlow Condensed"'; ctx.fillStyle = 'rgba(242,239,232,.75)'; spaced(ctx, d.tags, W / 2, H * 0.4 + 180 + (1 - b) * 24, 7, 'center'); }
  ctx.textAlign = 'left'; ctx.restore();
}
function photoFit(ctx, im, cx, top, maxW, maxH, alpha, scale = 1) {
  const r = Math.min(maxW / im.width, maxH / im.height) * scale, w = im.width * r, h = im.height * r;
  ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(im, cx - w / 2, top + (maxH - h), w, h); ctx.restore();
}
function sceneAct(ctx, spec, d, lt, W, H, assets) {
  const a = at(lt, 0, 0.5);
  ctx.save(); ctx.globalAlpha = a * 0.9; ctx.font = '400 300px "Anton"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(43,176,97,.55)';
  ctx.strokeText(d.hora || '', W / 2, H * 0.215); ctx.restore();
  const im = assets.photos?.[d.photo];
  const nameY = im ? H * 0.745 : H * 0.52;
  if (im) {
    photoFit(ctx, im, W / 2, H * 0.12, W * 0.86, H * 0.54, at(lt, 0.05, 0.6), 1.06 - 0.06 * at(lt, 0, 1.2));
    const f = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.67); f.addColorStop(0, 'rgba(6,10,8,0)'); f.addColorStop(1, 'rgba(6,10,8,1)');
    ctx.fillStyle = f; ctx.fillRect(0, H * 0.5, W, H * 0.18);
  }
  const b = at(lt, 0.35, 0.45); ctx.save(); ctx.globalAlpha = b; ctx.textAlign = 'center';
  if (d.kicker) { ctx.font = '900 32px "Barlow Condensed"'; ctx.fillStyle = G; spaced(ctx, d.kicker, W / 2, nameY - (im ? 165 : 215) + (1 - b) * 20, 7, 'center'); }
  const ns = fitFont(ctx, d.name || '', '"Anton"', im ? 150 : 200, W - 120); ctx.font = `400 ${ns}px "Anton"`; ctx.fillStyle = '#F2EFE8'; ctx.textAlign = 'center';
  ctx.fillText(d.name || '', W / 2, nameY + (1 - b) * 30); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.6; ctx.font = '900 26px "Barlow Condensed"'; ctx.fillStyle = '#9A9A9A'; ctx.textAlign = 'right'; ctx.fillText(`${d.n}/${d.of}`, W - 70, H - 90); ctx.restore();
}
function sceneResumen(ctx, spec, d, lt, W, H) {
  const a = at(lt, 0, 0.45); ctx.save(); ctx.globalAlpha = a;
  ctx.font = '400 150px "Anton"'; ctx.textAlign = 'center'; ctx.fillStyle = '#F2EFE8'; ctx.fillText(spec.resumen?.t1 || 'HOY', W / 2, H * 0.3);
  const t2 = spec.resumen?.t2 || ''; if (t2) { const s2 = fitFont(ctx, t2, '"Anton"', 150, W - 140); ctx.font = `400 ${s2}px "Anton"`; ctx.fillStyle = G; ctx.fillText(t2, W / 2, H * 0.3 + 140); }
  ctx.restore();
  const acts = spec.acts || [], rh = acts.length > 3 ? 92 : 104, y0 = H * 0.3 + 230;
  acts.forEach((x, i) => {
    const b = at(lt, 0.35 + i * 0.22, 0.4), y = y0 + i * rh; ctx.save(); ctx.globalAlpha = b; ctx.translate(-(1 - b) * 50, 0);
    ctx.fillStyle = 'rgba(242,239,232,.14)'; ctx.fillRect(120, y - 6, W - 240, 2);
    ctx.font = '400 54px "Anton"'; ctx.fillStyle = G; ctx.textAlign = 'left'; ctx.fillText(x.hora || '', 130, y + 62);
    const ns = fitFont(ctx, x.name || '', '"Anton"', 54, W - 330 - 130); ctx.font = `400 ${ns}px "Anton"`; ctx.fillStyle = '#F2EFE8'; ctx.fillText(x.name || '', 310, y + 62);
    ctx.restore();
  });
  const c = at(lt, 0.45 + acts.length * 0.22, 0.4), yc = y0 + acts.length * rh + 70; ctx.save(); ctx.globalAlpha = c; ctx.textAlign = 'center';
  ctx.font = '400 66px "Anton"'; ctx.fillStyle = '#F2EFE8'; ctx.fillText('RESERVA TU MESA', W / 2, yc + 20);
  if (spec.cta?.pill) pill(ctx, spec.cta.pill, W / 2, yc + 50, 64, G, '#04140A', 32, 'center', 3);
  ctx.restore();
}
// ---------- Partido (recreada de story-barca-aston-villa-hoy.mp4 / story-aek-real-madrid-hoy.mp4) ----------
function sceneMatch(ctx, spec, d, lt, W, H, assets) {
  const im = assets.photos?.[spec.photo];
  if (im) { const r = Math.max(W / im.width, (H * 0.62) / im.height) * (1.04 - 0.04 * clamp(lt / 8)); ctx.drawImage(im, (W - im.width * r) / 2, 0, im.width * r, im.height * r); }
  else {
    // sin foto: «CHAMPIONS» repetido en contorno (de la portada de Champions), muy suave
    ctx.save(); ctx.font = '400 230px "Anton"'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = i % 2 ? 'rgba(43,176,97,.24)' : 'rgba(242,239,232,.10)'; const off = ((lt * 40 + i * 260) % 900); ctx.strokeText('CHAMPIONS CHAMPIONS', -off, 230 + i * 205); }
    ctx.restore();
  }
  const f = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.66); f.addColorStop(0, 'rgba(6,10,8,0)'); f.addColorStop(1, 'rgba(6,10,8,1)'); ctx.fillStyle = f; ctx.fillRect(0, H * 0.3, W, H * 0.4);
  const x0 = 70, y0 = H * 0.53;
  const a = at(lt, 0.4, 0.45); ctx.save(); ctx.globalAlpha = a; ctx.translate(-(1 - a) * 60, 0);
  glowText(ctx, 'HOY', x0, y0, 250, G, true, 'left'); ctx.restore();
  ctx.font = '400 250px "Anton"'; const hw = ctx.measureText('HOY').width;
  const b = at(lt, 0.9, 0.4); ctx.save(); ctx.globalAlpha = b; ctx.font = '400 58px "Anton"'; ctx.fillStyle = '#F2EFE8'; ctx.fillText(spec.kicker1 || 'FÚTBOL EN', x0 + hw + 30, y0 - 140); ctx.fillText(spec.kicker2 || '5MENTARIOS', x0 + hw + 30, y0 - 78); ctx.restore();
  const c = at(lt, 1.4, 0.45); ctx.save(); ctx.globalAlpha = c; const s1 = fitFont(ctx, spec.local, '"Anton"', 190, W - 140); ctx.font = `400 ${s1}px "Anton"`; ctx.fillStyle = '#F2EFE8'; ctx.fillText(spec.local, x0, y0 + 190 + (1 - c) * 30); ctx.restore();
  const e = at(lt, 1.9, 0.45), yv = y0 + 300; ctx.save(); ctx.globalAlpha = e;
  ctx.fillStyle = G; ctx.beginPath(); ctx.arc(x0 + 34, yv - 30, 34, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#04140A'; ctx.font = '400 34px "Anton"'; ctx.textAlign = 'center'; ctx.fillText('vs', x0 + 34, yv - 18);
  ctx.textAlign = 'left'; const s2 = fitFont(ctx, spec.visitante, '"Anton"', 100, W - 260); ctx.font = `400 ${s2}px "Anton"`; ctx.fillStyle = '#F2EFE8'; ctx.fillText(spec.visitante, x0 + 90, yv); ctx.restore();
  const g2 = at(lt, 2.5, 0.5), yb = yv + 50, bw = W - 2 * x0; ctx.save(); ctx.globalAlpha = g2;
  ctx.fillStyle = '#F2EFE8'; ctx.fillRect(x0, yb, bw * g2, 92); ctx.fillStyle = G; ctx.fillRect(x0, yb, Math.min(200, bw * g2), 92);
  ctx.fillStyle = '#04140A'; ctx.font = '400 60px "Anton"'; ctx.fillText(spec.hora, x0 + 24, yb + 70);
  ctx.font = '900 38px "Barlow Condensed"'; ctx.fillStyle = '#0B0B0B'; spaced(ctx, spec.barra || 'EN PANTALLA GRANDE', x0 + 230, yb + 60, 2); ctx.restore();
  const h = at(lt, 3.1, 0.45); ctx.save(); ctx.globalAlpha = h; ctx.font = '900 34px "Barlow Condensed"'; ctx.fillStyle = 'rgba(242,239,232,.75)';
  const w1 = spaced(ctx, 'RESERVA TU MESA  →', x0, yb + 160, 5); ctx.fillStyle = G; ctx.font = '900 40px "Barlow Condensed"'; spaced(ctx, spec.tel || '627 304 115', x0 + w1 + 24, yb + 160, 3); ctx.restore();
}

// Dibuja el fotograma del instante t (segundos)
export function drawStory(ctx, spec, t, assets = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.save(); ctx.scale(W / W0, H / H0);
  const tl = storyTimeline(spec);
  const sc = tl.find((s) => t >= s.start && t < s.start + s.dur) || tl[tl.length - 1];
  const lt = t - sc.start;
  if (spec.mode === 'hoy' || spec.mode === 'partido') glowBg(ctx, W0, H0, t); else background(ctx, t, W0, H0, sc.type === 'outro' ? Math.max(0, 1 - lt / 0.4) : 1);
  if (sc.type !== 'outro') header(ctx, spec, assets, W0, at(t, 0, 0.4));
  // salida de cada escena: fundido en los últimos 0,28 s (menos la última)
  const out = sc.type === 'outro' ? 1 : clamp((sc.dur - lt) / 0.28);
  ctx.save(); ctx.globalAlpha = out;
  if (sc.type === 'intro') sceneIntro(ctx, spec, sc.data, lt, W0, H0);
  else if (sc.type === 'hintro') sceneHoyIntro(ctx, spec, sc.data, lt, W0, H0);
  else if (sc.type === 'act') sceneAct(ctx, spec, sc.data, lt, W0, H0, assets);
  else if (sc.type === 'resumen') sceneResumen(ctx, spec, sc.data, lt, W0, H0);
  else if (sc.type === 'match') sceneMatch(ctx, spec, sc.data, lt, W0, H0, assets);
  else if (sc.type === 'day') sceneDay(ctx, spec, sc.data, lt, W0, H0);
  else if (sc.type === 'cta') sceneCta(ctx, spec, sc.data, lt, W0, H0);
  else sceneOutro(ctx, spec, sc.data, lt, W0, H0, assets);
  ctx.restore(); ctx.restore();
}

// Graba la story en el navegador (tiempo real). Devuelve { blob, ext, mime }.
export async function recordStory(spec, { onProgress = () => {} } = {}) {
  const assets = await loadStoryAssets(document.baseURI, spec);
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

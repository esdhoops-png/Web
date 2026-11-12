// Motor de diseño del Estudio Creativo: documento editable por capas → Canvas 2D → PNG / JPG reales.
// Documento: { v, width, height, pages: [{ id, bg, layers: [...] }] }
// Capa común: { id, type, name, x, y, w, h, rotation, opacity, visible, locked, bind }
//   rect      fill, radius, stroke, strokeWidth, gradient {angle, stops:[[pos,color],...]}
//   glow      color, strength (0–1)                        → brillo radial
//   circle    fill, stroke, strokeWidth
//   line      color, width
//   text      text, font, size, weight, color, align, valign, letterSpacing, lineHeight, uppercase,
//             strokeColor, strokeWidth, glowColor, glowBlur, fit (encoge para caber)
//   pill      fill, text, font, size, weight, color, letterSpacing, radius, stroke, strokeWidth (pastilla de contorno)
//   image     ref {kind:'storage'|'asset'|'url'|'data', path|url}, fit 'cover'|'contain', grayscale, brightness,
//             frame (px de marco tipo polaroid), frameColor, shadow, placeholder (texto si no hay foto)
//   repeat    text, font, size, color, rows, gap, outlineEvery (filas alternas solo contorno), strokeColor
//   grain     amount (0–1)                                  → textura de grano procedimental
//   rays      color, count, opacity                         → rayos (story «Hoy»)

export const FORMATS = {
  post: { label: 'Post 4:5 · 1080×1350', width: 1080, height: 1350 },
  story: { label: 'Story / reel · 1080×1920', width: 1080, height: 1920 },
  square: { label: 'Cuadrado · 1080×1080', width: 1080, height: 1080 },
  landscape: { label: 'Horizontal · 1920×1080', width: 1920, height: 1080 }
};
export const FONT_LIST = ['Anton', 'Barlow Condensed', 'Permanent Marker', 'Special Elite', 'DM Sans'];
export const uid = () => Math.random().toString(36).slice(2, 10);

let resolveStorage = async (p) => p; // lo inyecta la app (URL firmada de Supabase Storage)
export function setStorageResolver(fn) { resolveStorage = fn; }

const imgCache = new Map();
async function srcOf(ref) {
  if (!ref) return null;
  if (ref.kind === 'storage') return resolveStorage(ref.path);
  if (ref.kind === 'asset') return new URL(ref.path, document.baseURI).href;
  return ref.url || null;
}
function loadImage(src) {
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise((res) => {
    const im = new Image();
    if (!src.startsWith('data:')) im.crossOrigin = 'anonymous';
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
  imgCache.set(src, p);
  return p;
}

export async function loadAssets(doc) {
  const fonts = new Set();
  const jobs = [];
  for (const page of doc.pages) for (const l of page.layers) {
    if ((l.type === 'text' || l.type === 'pill' || l.type === 'repeat' || l.type === 'image') && l.font) fonts.add(`${l.weight || 400} 40px "${l.font}"`);
    if (l.type === 'image' && l.ref) jobs.push(srcOf(l.ref).then((s) => s && loadImage(s)).then((im) => { l._img = im || null; }).catch(() => { l._img = null; }));
  }
  fonts.add('900 40px "Barlow Condensed"'); fonts.add('600 40px "Barlow Condensed"');
  await Promise.all([...[...fonts].map((f) => document.fonts.load(f).catch(() => {})), ...jobs]);
}

// ---------- dibujo ----------
function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function fillStyle(ctx, l) {
  if (l.gradient && l.gradient.stops) {
    const a = ((l.gradient.angle ?? 90) * Math.PI) / 180;
    const cx = l.w / 2, cy = l.h / 2, r = Math.abs(l.w * Math.cos(a)) / 2 + Math.abs(l.h * Math.sin(a)) / 2;
    const g = ctx.createLinearGradient(cx - Math.cos(a) * r, cy - Math.sin(a) * r, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    l.gradient.stops.forEach(([p, c]) => g.addColorStop(p, c));
    return g;
  }
  return l.fill || 'transparent';
}
function setFont(ctx, l, size) {
  ctx.font = `${l.italic ? 'italic ' : ''}${l.weight || 400} ${size}px "${l.font || 'Anton'}", Impact, sans-serif`;
}
function measure(ctx, text, ls) { return ctx.measureText(text).width + Math.max(0, text.length - 1) * (ls || 0); }
function drawSpaced(ctx, text, x, y, ls, mode) {
  if (!ls) { mode === 'stroke' ? ctx.strokeText(text, x, y) : ctx.fillText(text, x, y); return; }
  let cx = x;
  for (const ch of text) { mode === 'stroke' ? ctx.strokeText(ch, cx, y) : ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + ls; }
}
function wrap(ctx, text, maxW, ls) {
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (measure(ctx, t, ls) > maxW && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}
function drawText(ctx, l) {
  let text = l.text ?? '';
  if (l.uppercase) text = text.toUpperCase();
  let size = l.size || 60;
  const ls = l.letterSpacing || 0;
  setFont(ctx, l, size);
  let lines = wrap(ctx, text, l.w, ls * (size / (l.size || size)));
  if (l.fit) {
    while (size > 8 && (lines.some((ln) => measure(ctx, ln, ls) > l.w) || lines.length * size * (l.lineHeight || 1.05) > l.h)) {
      size -= 2; setFont(ctx, l, size); lines = wrap(ctx, text, l.w, ls);
    }
  }
  const lh = size * (l.lineHeight || 1.05);
  const total = lines.length * lh;
  let y = l.valign === 'middle' ? (l.h - total) / 2 : l.valign === 'bottom' ? l.h - total : 0;
  ctx.textBaseline = 'top';
  for (const ln of lines) {
    const wLine = measure(ctx, ln, ls);
    const x = l.align === 'center' ? (l.w - wLine) / 2 : l.align === 'right' ? l.w - wLine : 0;
    const yy = y + (lh - size) / 2 + size * 0.04;
    if (l.glowColor) { ctx.save(); ctx.shadowColor = l.glowColor; ctx.shadowBlur = l.glowBlur || 30; ctx.fillStyle = l.color || '#fff'; drawSpaced(ctx, ln, x, yy, ls); ctx.restore(); }
    if (l.strokeColor && l.strokeWidth) { ctx.lineWidth = l.strokeWidth; ctx.strokeStyle = l.strokeColor; ctx.lineJoin = 'round'; drawSpaced(ctx, ln, x, yy, ls, 'stroke'); }
    if (l.color && l.color !== 'transparent') { ctx.fillStyle = l.color; drawSpaced(ctx, ln, x, yy, ls); }
    y += lh;
  }
}
function drawImage(ctx, l) {
  const f = l.frame || 0;
  if (l.shadow) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = l.frameColor || '#111'; ctx.fillRect(0, 0, l.w, l.h); ctx.restore(); }
  if (f) { ctx.fillStyle = l.frameColor || '#F2EFE8'; ctx.fillRect(0, 0, l.w, l.h); }
  const ix = f, iy = f, iw = l.w - 2 * f, ih = l.h - 2 * f - (l.frameBottom || 0);
  ctx.save();
  roundRect(ctx, ix, iy, iw, ih, l.radius || 0); ctx.clip();
  if (l._img) {
    const im = l._img; const ir = im.width / im.height, br = iw / ih;
    let dw, dh;
    if ((l.fit || 'cover') === 'cover' ? ir > br : ir < br) { dh = ih; dw = ih * ir; } else { dw = iw; dh = iw / ir; }
    const ox = (l.focusX ?? 0.5), oy = (l.focusY ?? 0.5);
    ctx.filter = [l.grayscale ? `grayscale(${l.grayscale})` : '', l.brightness != null ? `brightness(${l.brightness})` : '', l.contrast != null ? `contrast(${l.contrast})` : ''].join(' ').trim() || 'none';
    ctx.drawImage(im, ix + (iw - dw) * ox, iy + (ih - dh) * oy, dw, dh);
    ctx.filter = 'none';
  } else if (l.placeholder !== false) {
    ctx.fillStyle = 'rgba(52,194,107,.10)'; ctx.fillRect(ix, iy, iw, ih);
    ctx.strokeStyle = 'rgba(52,194,107,.55)'; ctx.setLineDash([16, 12]); ctx.lineWidth = 4; ctx.strokeRect(ix + 2, iy + 2, iw - 4, ih - 4); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(242,239,232,.7)'; ctx.font = `600 ${Math.max(18, Math.min(iw, ih) / 12)}px "Barlow Condensed", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(l.placeholder || 'FOTO', ix + iw / 2, iy + ih / 2); ctx.textAlign = 'left';
  }
  ctx.restore();
}
function drawGrain(ctx, l) {
  const n = Math.round((l.w * l.h) / 900 * (l.amount ?? 0.4));
  let s = 1234;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    const v = rnd() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${0.04 + rnd() * 0.06})`;
    ctx.fillRect(rnd() * l.w, rnd() * l.h, 1 + rnd() * 2, 1 + rnd() * 2);
  }
}
function drawLayer(ctx, l) {
  if (l.visible === false) return;
  ctx.save();
  ctx.globalAlpha = l.opacity ?? 1;
  ctx.translate(l.x + l.w / 2, l.y + l.h / 2);
  if (l.rotation) ctx.rotate((l.rotation * Math.PI) / 180);
  ctx.translate(-l.w / 2, -l.h / 2);
  switch (l.type) {
    case 'rect':
      ctx.fillStyle = fillStyle(ctx, l); roundRect(ctx, 0, 0, l.w, l.h, l.radius); ctx.fill();
      if (l.stroke && l.strokeWidth) { ctx.strokeStyle = l.stroke; ctx.lineWidth = l.strokeWidth; ctx.stroke(); }
      break;
    case 'glow': {
      const g = ctx.createRadialGradient(l.w / 2, l.h / 2, 0, l.w / 2, l.h / 2, Math.max(l.w, l.h) / 2);
      const c = l.color || '#2BB061';
      g.addColorStop(0, hexA(c, l.strength ?? 0.6)); g.addColorStop(1, hexA(c, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, l.w, l.h); break;
    }
    case 'circle':
      ctx.beginPath(); ctx.ellipse(l.w / 2, l.h / 2, l.w / 2, l.h / 2, 0, 0, Math.PI * 2);
      if (l.fill) { ctx.fillStyle = l.fill; ctx.fill(); }
      if (l.stroke && l.strokeWidth) { ctx.strokeStyle = l.stroke; ctx.lineWidth = l.strokeWidth; ctx.stroke(); }
      break;
    case 'line':
      ctx.fillStyle = l.color || '#F2EFE8'; ctx.fillRect(0, (l.h - (l.width || 2)) / 2, l.w, l.width || 2); break;
    case 'text': drawText(ctx, l); break;
    case 'pill': {
      ctx.fillStyle = l.fill || '#2BB061'; roundRect(ctx, 0, 0, l.w, l.h, l.radius ?? l.h / 2); ctx.fill();
      if (l.stroke && l.strokeWidth) { ctx.strokeStyle = l.stroke; ctx.lineWidth = l.strokeWidth; roundRect(ctx, l.strokeWidth / 2, l.strokeWidth / 2, l.w - l.strokeWidth, l.h - l.strokeWidth, (l.radius ?? l.h / 2) - l.strokeWidth / 2); ctx.stroke(); }
      drawText(ctx, { ...l, x: 0, y: 0, align: 'center', valign: 'middle', fit: true, color: l.color || '#04140A', glowColor: null }); break;
    }
    case 'image': drawImage(ctx, l); break;
    case 'repeat': {
      setFont(ctx, l, l.size || 160); ctx.textBaseline = 'top';
      const rows = l.rows || 5; const step = (l.size || 160) * (l.gap || 0.95);
      for (let i = 0; i < rows; i++) {
        const txt = Array(6).fill(l.text || 'CHAMPIONS').join(' ');
        const off = i % 2 ? -(l.size || 160) * 1.3 : 0;
        if (l.outlineEvery && i % l.outlineEvery === 1) { ctx.strokeStyle = l.strokeColor || l.color; ctx.lineWidth = 3; ctx.strokeText(txt, off, i * step); }
        else { ctx.fillStyle = i % 3 === 2 && l.altColor ? l.altColor : l.color; ctx.fillText(txt, off, i * step); }
      }
      break;
    }
    case 'grain': drawGrain(ctx, l); break;
    case 'rays': {
      ctx.translate(l.w / 2, l.h / 2);
      const n = l.count || 16; const R = Math.hypot(l.w, l.h);
      ctx.fillStyle = hexA(l.color || '#2BB061', l.strength ?? 0.12);
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + (l.phase || 0); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a, a + Math.PI / n / 1.6); ctx.closePath(); ctx.fill(); }
      break;
    }
  }
  ctx.restore();
}
function hexA(hex, a) {
  const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function renderPage(canvas, doc, pageIndex = 0, scale = 1) {
  const page = doc.pages[pageIndex];
  canvas.width = Math.round(doc.width * scale); canvas.height = Math.round(doc.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = page.bg || doc.bg || '#0B0B0B'; ctx.fillRect(0, 0, doc.width, doc.height);
  for (const l of page.layers) drawLayer(ctx, l);
  return canvas;
}

export async function exportPage(doc, pageIndex, { type = 'image/png', scale = 1, quality = 0.92 } = {}) {
  await loadAssets(doc);
  const c = document.createElement('canvas');
  renderPage(c, doc, pageIndex, scale);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('No se pudo generar la imagen (¿alguna foto sin permiso de lectura?).'))), type, quality));
}

// hit-test para el editor: capa superior bajo el punto (coordenadas del documento)
export function hitTest(doc, pageIndex, x, y) {
  const layers = doc.pages[pageIndex].layers;
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    if (l.visible === false || l.locked) continue;
    const cx = l.x + l.w / 2, cy = l.y + l.h / 2, a = (-(l.rotation || 0) * Math.PI) / 180;
    const dx = x - cx, dy = y - cy;
    const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(rx) <= l.w / 2 && Math.abs(ry) <= l.h / 2) return l;
  }
  return null;
}

// Reescala un documento a otro formato (para diseños sin plantilla de origen)
export function rescaleDoc(doc, width, height) {
  const sx = width / doc.width, sy = height / doc.height, s = Math.min(sx, sy);
  const out = JSON.parse(JSON.stringify(doc, (k, v) => (k === '_img' ? undefined : v)));
  out.width = width; out.height = height;
  for (const p of out.pages) for (const l of p.layers) {
    const full = l.w >= doc.width * 0.98 && l.h >= doc.height * 0.98;
    if (full) { l.x = 0; l.y = 0; l.w = width; l.h = height; continue; }
    const cx = (l.x + l.w / 2) * sx, cy = (l.y + l.h / 2) * sy;
    l.w = l.w * (l.type === 'line' || l.w >= doc.width * 0.9 ? sx : s); l.h *= s;
    l.x = cx - l.w / 2; l.y = cy - l.h / 2;
    if (l.size) l.size = Math.round(l.size * s);
    if (l.letterSpacing) l.letterSpacing *= s;
  }
  return out;
}
export const cleanDoc = (doc) => JSON.parse(JSON.stringify(doc, (k, v) => (k === '_img' ? undefined : v)));

// ---------- ZIP (sin compresión) para exportar carruseles ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
export async function makeZip(files) {
  const enc = new TextEncoder(); const parts = []; const central = []; let offset = 0;
  for (const f of files) {
    const data = new Uint8Array(await f.blob.arrayBuffer()); const name = enc.encode(f.name); const crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 0, true); h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const size = central.reduce((a, b) => a + b.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/zip' });
}
export function downloadBlob(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

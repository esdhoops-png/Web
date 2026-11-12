// ESTUDIO CREATIVO: plantillas, editor por capas, exportación real (PNG/JPG/ZIP), versiones,
// originales verificados, imágenes IA (si hay proveedor configurado) y vídeo.
import { html, useState, useEffect, useRef, Icon, ModalHead, openModal, closeModal, confirmDialog, toast, toastError, fmt, STATUS_LABEL } from '../lib/ui.js';
import { useStore, sb, check, go, signedUrl, profileById, getState, uploadFile } from '../lib/store.js';
import { pickFiles } from '../lib/media.js';
import { driveConnected, driveThumb, driveView } from '../lib/drive.js';
import { FORMATS, FONT_LIST, uid, loadAssets, renderPage, hitTest, rescaleDoc, cleanDoc, makeZip, downloadBlob, setStorageResolver, exportPage } from '../studio/engine.js';
import { TEMPLATES, CATEGORIES, CATEGORY_LABEL, BRAND_COLORS, templateByKey, buildDoc } from '../studio/templates.js';
import { studioAvailable, listCreatives, getCreative, createCreative, updateCreative, saveVersion, renderExports, linkToPost, addToLibrary, refForCanvas } from '../studio/data.js';
import { interpret } from '../studio/brief.js';
import { ORIGINALS, MISSING, RECEIVED } from '../studio/originals.js';
import { aiStatus, generateImage } from '../studio/ai.js';
import { VideoStudio } from './video-studio.js';

setStorageResolver((p) => signedUrl(p));

// Documento en edición que aún no se ha guardado (para pasar de «Crear» al editor)
let pending = null;
export function openInStudio(doc, meta = {}) { pending = { doc, meta }; go('#/estudio?edit=new' + (meta.post_id ? '&post=' + meta.post_id : '') + '&t=' + Date.now()); }

const KIND_TO_TEMPLATE = { champions: 'champions-partido', sports: 'champions-partido', weekly_poster: 'programacion', event: 'programacion', story: 'story-hoy', carousel: 'fotos-portada', promo: 'programacion', special_date: 'marca', reel: 'programacion', post: 'programacion' };
const KIND_TO_CATEGORY = { champions: 'futbol', sports: 'futbol', weekly_poster: 'carteles', event: 'eventos', story: 'stories', carousel: 'carruseles', promo: 'promociones', special_date: 'marca' };

// ---------- reconstrucción respetando ajustes manuales ----------
function rebuild(old, { data, format, images } = {}) {
  const t = templateByKey(old.template);
  if (!t) return old;
  const fmtChanged = format && format !== old.format;
  const d = buildDoc(t, format || old.format, { ...old.data, ...(data || {}) }, { ...(old.images || {}), ...(images || {}) });
  d.overrides = { ...(old.overrides || {}) };
  if (fmtChanged) for (const k of Object.keys(d.overrides)) { const { x, y, w, h, size, ...rest } = d.overrides[k]; d.overrides[k] = rest; }
  d.pages.forEach((p, i) => {
    p.layers.forEach((l) => { const o = d.overrides[`${i}:${l.name}`]; if (o) Object.assign(l, o); });
    const prev = old.pages[i];
    if (prev) { if (prev.bg && prev.bgUser) { p.bg = prev.bg; p.bgUser = true; }
      for (const u of prev.layers.filter((x) => x.user)) p.layers.push(fmtChanged ? rescaleDoc({ width: old.width, height: old.height, pages: [{ layers: [u] }] }, d.width, d.height).pages[0].layers[0] : u); }
  });
  return d;
}
const clone = (doc) => { const c = cleanDoc(doc); return c; };

// ===================================================================== Editor
function Editor({ initial, meta: meta0, creative: creative0, onExit }) {
  const st = useStore();
  const [doc, setDocState] = useState(initial);
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState(null);
  const [meta, setMeta] = useState(meta0);
  const [creative, setCreative] = useState(creative0);
  const [busy, setBusy] = useState('');
  const [hist, setHist] = useState({ past: [], future: [] });
  const [dirty, setDirty] = useState(false);
  const canvasRef = useRef(); const wrapRef = useRef(); const drag = useRef(null);
  const [view, setView] = useState({ scale: 0.4 });
  const tpl = templateByKey(doc.template);
  const layers = doc.pages[page]?.layers || [];
  const selLayer = layers.find((l) => l.id === sel);

  function commit(next, { record = true } = {}) {
    if (record) setHist((h) => ({ past: [...h.past.slice(-40), clone(doc)], future: [] }));
    setDocState(next); setDirty(true);
  }
  const undo = () => setHist((h) => { if (!h.past.length) return h; const prev = h.past[h.past.length - 1]; setDocState(prev); return { past: h.past.slice(0, -1), future: [clone(doc), ...h.future] }; });
  const redo = () => setHist((h) => { if (!h.future.length) return h; const nx = h.future[0]; setDocState(nx); return { past: [...h.past, clone(doc)], future: h.future.slice(1) }; });

  // tamaño de visualización
  useEffect(() => {
    const fit = () => { const el = wrapRef.current; if (!el) return; const maxW = el.clientWidth - 8, maxH = Math.max(380, innerHeight - 260);
      setView({ scale: Math.min(maxW / doc.width, maxH / doc.height) }); };
    fit(); addEventListener('resize', fit); return () => removeEventListener('resize', fit);
  }, [doc.width, doc.height]);
  // render
  useEffect(() => { let on = true; (async () => { await loadAssets(doc); if (!on || !canvasRef.current) return;
    renderPage(canvasRef.current, doc, Math.min(page, doc.pages.length - 1), view.scale * (devicePixelRatio || 1)); })(); return () => { on = false; }; }, [doc, page, view.scale]);
  useEffect(() => {
    const k = (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); removeLayer(); }
      if (sel && e.key.startsWith('Arrow')) { e.preventDefault(); const d = e.shiftKey ? 10 : 1; const l = layers.find((x) => x.id === sel); if (l) setProps({ x: l.x + (e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0), y: l.y + (e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0) }); }
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  });
  useEffect(() => { const f = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; addEventListener('beforeunload', f); return () => removeEventListener('beforeunload', f); }, [dirty]);

  // ---- edición de capas
  function setProps(patch, { record = true } = {}) {
    const next = clone(doc); const p = next.pages[page]; const l = p.layers.find((x) => x.id === sel); if (!l) return;
    Object.assign(l, patch);
    if (next.template && !l.user) { next.overrides = next.overrides || {}; next.overrides[`${page}:${l.name}`] = { ...(next.overrides[`${page}:${l.name}`] || {}), ...patch }; }
    if (next.template && l.bind && !l.bind.includes(':') && patch.text != null) next.data = { ...next.data, [l.bind]: patch.text };
    commit(next, { record });
  }
  function addLayer(type) {
    const next = clone(doc); const W = next.width, H = next.height; const s = W / 1080;
    const base = { id: uid(), type, user: true, visible: true, opacity: 1, rotation: 0 };
    const L = {
      text: { ...base, name: 'Texto', x: 80 * s, y: H * 0.4, w: W - 160 * s, h: 140 * s, text: 'TEXTO', font: 'Anton', size: Math.round(110 * s), color: '#F2EFE8', align: 'center' },
      rect: { ...base, name: 'Rectángulo', x: W * 0.2, y: H * 0.4, w: W * 0.6, h: 120 * s, fill: '#2BB061', radius: 0 },
      circle: { ...base, name: 'Círculo', x: W / 2 - 100 * s, y: H / 2 - 100 * s, w: 200 * s, h: 200 * s, fill: '#FFFFFF' },
      line: { ...base, name: 'Línea', x: 60 * s, y: H * 0.5, w: W - 120 * s, h: 6, width: 2, color: '#F2EFE8' },
      pill: { ...base, name: 'Pastilla', x: W / 2 - 160 * s, y: H * 0.5, w: 320 * s, h: 70 * s, fill: '#2BB061', text: '20:00 H', font: 'Anton', size: Math.round(36 * s), color: '#000' },
      glow: { ...base, name: 'Brillo verde', x: W * 0.1, y: H * 0.25, w: W * 0.8, h: H * 0.5, color: '#2BB061', strength: 0.45 },
      logo: { ...base, type: 'image', name: 'Logo', x: 36 * s, y: 30 * s, w: 110 * s, h: 110 * s * (1082 / 1176), ref: { kind: 'asset', path: 'icons/5mentarios-sello.svg' }, fit: 'contain', placeholder: false },
      image: { ...base, name: 'Foto', x: W * 0.1, y: H * 0.2, w: W * 0.8, h: H * 0.45, placeholder: 'FOTO' },
      grain: { ...base, name: 'Textura', x: 0, y: 0, w: W, h: H, amount: 0.45 }
    }[type];
    next.pages[page].layers.push(L); commit(next); setSel(L.id);
    if (type === 'image') setTimeout(() => changePhoto(L.id), 50);
  }
  function removeLayer() {
    const next = clone(doc); const p = next.pages[page]; const l = p.layers.find((x) => x.id === sel); if (!l) return;
    if (next.template && !l.user) { next.overrides = { ...(next.overrides || {}), [`${page}:${l.name}`]: { ...(next.overrides?.[`${page}:${l.name}`] || {}), visible: false } }; l.visible = false; }
    else p.layers = p.layers.filter((x) => x.id !== sel);
    commit(next); setSel(null);
  }
  function moveOrder(dir) {
    const next = clone(doc); const arr = next.pages[page].layers; const i = arr.findIndex((x) => x.id === sel); const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; commit(next);
  }
  function duplicateLayer() {
    const next = clone(doc); const l = next.pages[page].layers.find((x) => x.id === sel); if (!l) return;
    const c = { ...JSON.parse(JSON.stringify(l)), id: uid(), user: true, name: l.name + ' (copia)', x: l.x + 30, y: l.y + 30, bind: undefined };
    next.pages[page].layers.push(c); commit(next); setSel(c.id);
  }
  async function changePhoto(layerId = sel, viaAI = false) {
    let ref;
    try {
      if (viaAI) { ref = await aiPhoto(); if (!ref) return; }
      else {
        const files = await pickFiles({ title: 'Elegir foto para el diseño', multiple: false, defaultTab: 'upload' });
        if (!files.length) return;
        setBusy('Preparando la foto…'); ref = await refForCanvas(files[0]);
      }
      const next = clone(doc); const l = next.pages[page].layers.find((x) => x.id === layerId); if (!l) return;
      l.ref = ref;
      if (next.template && l.bind?.startsWith('img:')) next.images = { ...(next.images || {}), [l.bind.slice(4)]: ref };
      else if (next.template && !l.user) next.overrides = { ...(next.overrides || {}), [`${page}:${l.name}`]: { ...(next.overrides?.[`${page}:${l.name}`] || {}), ref } };
      commit(next);
    } catch (e) { toastError(e); } finally { setBusy(''); }
  }
  function setField(k, v) { commit(rebuild(doc, { data: { [k]: v } }), { record: false }); }
  function setFormat(f) {
    if (doc.template) commit(rebuild(doc, { format: f }));
    else { const fm = FORMATS[f]; commit({ ...rescaleDoc(doc, fm.width, fm.height), format: f }); }
    setSel(null);
  }
  function addPage(dupe = true) {
    const next = clone(doc); const src = next.pages[page];
    next.pages.splice(page + 1, 0, dupe ? { ...JSON.parse(JSON.stringify(src)), id: uid(), layers: src.layers.map((l) => ({ ...l, id: uid(), user: true, bind: undefined })) } : { id: uid(), bg: '#0B0B0B', layers: [] });
    commit(next); setPage(page + 1);
  }
  function removePage() { if (doc.pages.length < 2) return; const next = clone(doc); next.pages.splice(page, 1); commit(next); setPage(Math.max(0, page - 1)); }

  // ---- ratón / dedo sobre el lienzo
  const toDoc = (e) => { const r = canvasRef.current.getBoundingClientRect(); return { x: (e.clientX - r.left) / view.scale, y: (e.clientY - r.top) / view.scale }; };
  function onDown(e) {
    const p = toDoc(e); const mode = e.target.dataset.handle ? 'resize' : 'move';
    const l = mode === 'resize' ? selLayer : hitTest(doc, page, p.x, p.y);
    if (!l) { setSel(null); return; }
    setSel(l.id); e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { mode, id: l.id, start: p, orig: { x: l.x, y: l.y, w: l.w, h: l.h, size: l.size }, base: clone(doc) };
  }
  function onMove(e) {
    const d = drag.current; if (!d) return; const p = toDoc(e); const dx = p.x - d.start.x, dy = p.y - d.start.y;
    if (Math.abs(dx) + Math.abs(dy) < 2) return;
    const next = clone(d.base); const l = next.pages[page].layers.find((x) => x.id === d.id);
    const patch = d.mode === 'move' ? { x: Math.round(d.orig.x + dx), y: Math.round(d.orig.y + dy) } : { w: Math.max(20, Math.round(d.orig.w + dx)), h: Math.max(10, Math.round(d.orig.h + dy)) };
    if (d.mode === 'resize' && l.type === 'text' && e.shiftKey && d.orig.size) patch.size = Math.round(d.orig.size * (patch.w / d.orig.w));
    Object.assign(l, patch);
    if (next.template && !l.user) { next.overrides = next.overrides || {}; next.overrides[`${page}:${l.name}`] = { ...(next.overrides[`${page}:${l.name}`] || {}), ...patch }; }
    d.moved = true; setDocState(next);
  }
  function onUp() { const d = drag.current; drag.current = null; if (d?.moved) { setHist((h) => ({ past: [...h.past.slice(-40), d.base], future: [] })); setDirty(true); } }

  // ---- guardar / exportar / vincular
  async function ensureCreative() {
    if (creative) return creative;
    const c = await createCreative({ title: meta.title || 'Diseño sin título', category: meta.category || tpl?.category || 'posts', campaign: meta.campaign || null, format: doc.format || 'custom',
      width: doc.width, height: doc.height, pages: doc.pages.length, template_key: doc.template || null, source_ref: meta.source_ref || null, post_id: meta.post_id || null });
    const full = { ...c, creative_versions: [] }; setCreative(full); history.replaceState(null, '', '#/estudio?c=' + c.id); return full;
  }
  async function save(opts = {}) {
    if (busy) return null;
    setBusy(opts.exports ? 'Exportando y guardando…' : 'Guardando…');
    try {
      let c = await ensureCreative();
      if (c.title !== meta.title || c.category !== meta.category || (c.campaign || '') !== (meta.campaign || '') || c.width !== doc.width || c.height !== doc.height || c.pages !== doc.pages.length)
        c = { ...c, ...(await updateCreative(c.id, { title: meta.title || c.title, category: meta.category, campaign: meta.campaign || null, width: doc.width, height: doc.height, pages: doc.pages.length, format: doc.format || 'custom' })) };
      const v = await saveVersion(c, doc, { note: opts.note || null, exports: opts.exports || [] });
      const nc = { ...c, current_version: v.version_no, creative_versions: [...(c.creative_versions || []), v] }; setCreative(nc); setDirty(false);
      toast(`Versión ${v.version_no} guardada`, opts.exports ? `${opts.exports.length} archivo(s) exportado(s) en Storage` : 'Las versiones anteriores se conservan');
      return { c: nc, v };
    } catch (e) { toastError(e); return null; } finally { setBusy(''); }
  }
  function openExport() { openModal((close) => html`<${ExportDialog} doc=${doc} page=${page} close=${close} meta=${meta} onSave=${save} creativeRef=${() => creative} />`, { sticky: true }); }
  async function saveAsTemplate() {
    const r = await save({ note: 'Guardado como plantilla' }); if (!r) return;
    try { const c = await updateCreative(r.c.id, { is_template: true }); setCreative({ ...r.c, ...c }); toast('Guardado como plantilla reutilizable', 'Aparece en Estudio → Plantillas'); } catch (e) { toastError(e); }
  }
  function showVersions() { openModal((close) => html`<${VersionsDialog} creative=${creative} close=${close} onOpen=${(v) => { setHist({ past: [], future: [] }); setDocState(v.doc); setPage(0); setSel(null); setDirty(true); toast(`Abierta la versión ${v.version_no}`, 'Al guardar se creará una versión nueva; la anterior se conserva'); }} />`, { size: 'wide' }); }
  async function exit() { if (dirty && !(await confirmDialog({ title: 'Salir sin guardar', body: 'Hay cambios sin guardar. ¿Salir igualmente?', ok: 'Salir', danger: true }))) return; onExit(); }

  const sc = view.scale;
  const post = meta.post_id ? st.posts.find((p) => p.id === meta.post_id) : null;
  return html`<div class="studio">
    <div class="studio-top">
      <button class="btn ghost sm" onClick=${exit}><${Icon} name="chevL" size=${15} />Estudio</button>
      <input class="input studio-title" value=${meta.title} onInput=${(e) => { setMeta({ ...meta, title: e.target.value }); setDirty(true); }} aria-label="Título del diseño" />
      <select class="input" value=${meta.category} onChange=${(e) => { setMeta({ ...meta, category: e.target.value }); setDirty(true); }} title="Categoría">${CATEGORIES.filter(([k]) => k !== 'video').map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <input class="input" style="width:150px" placeholder="Campaña" value=${meta.campaign || ''} onInput=${(e) => { setMeta({ ...meta, campaign: e.target.value }); setDirty(true); }} />
      <select class="input" value=${doc.format || ''} onChange=${(e) => setFormat(e.target.value)} title="Formato">
        ${!FORMATS[doc.format] ? html`<option value="">${doc.width}×${doc.height}</option>` : null}
        ${Object.entries(FORMATS).filter(([k]) => !tpl || tpl.formats.includes(k)).map(([k, f]) => html`<option value=${k}>${f.label}</option>`)}</select>
      <div class="grow"></div>
      ${busy ? html`<span class="small muted">${busy}</span>` : dirty ? html`<span class="small" style="color:var(--ambar)">Sin guardar</span>` : creative ? html`<span class="small muted">v${creative.current_version} guardada</span>` : null}
      <button class="btn ghost icon sm" title="Deshacer (Ctrl+Z)" disabled=${!hist.past.length} onClick=${undo}>↶</button>
      <button class="btn ghost icon sm" title="Rehacer" disabled=${!hist.future.length} onClick=${redo}>↷</button>
      ${creative ? html`<button class="btn sm" onClick=${showVersions}><${Icon} name="history" size=${15} />Versiones</button>` : null}
      <button class="btn sm" disabled=${!!busy} onClick=${() => save()}>Guardar versión</button>
      <button class="btn primary sm" disabled=${!!busy} onClick=${openExport}><${Icon} name="download" size=${15} />Exportar</button>
    </div>
    ${post ? html`<div class="small" style="margin:-4px 0 10px">Para la publicación <a href=${'#/publicaciones/' + post.id}>${post.title}</a> · ${fmt.dateTime(post.starts_at)} · ${STATUS_LABEL[post.status]}</div>` : null}
    <div class="studio-grid">
      <aside class="studio-side">
        ${tpl && tpl.fields.length ? html`<section class="card stack"><h2>Contenido</h2>
          <p class="xs muted" style="margin:0">Plantilla: ${tpl.name}. Lo que falta va entre [CORCHETES]: no se inventa.</p>
          ${tpl.fields.map((f) => html`<label class="field" key=${f.k}><span>${f.label}</span>${f.multiline
            ? html`<textarea class="input" rows="4" value=${doc.data?.[f.k] ?? ''} onInput=${(e) => setField(f.k, e.target.value)}></textarea>`
            : html`<input class="input" value=${doc.data?.[f.k] ?? ''} onInput=${(e) => setField(f.k, e.target.value)} />`}</label>`)}
          ${tpl.images.length ? html`<div class="stack" style="gap:6px">${tpl.images.map((im) => { const l = doc.pages.flatMap((p) => p.layers).find((x) => x.bind === 'img:' + im.k);
            return l ? html`<button class="btn sm" onClick=${() => { const pi = doc.pages.findIndex((p) => p.layers.includes(l)); setPage(pi); setSel(l.id); setTimeout(() => changePhoto(l.id), 30); }}><${Icon} name="image" size=${14} />${im.label}${doc.images?.[im.k] ? ' ✓' : ''}</button>` : null; })}</div>` : null}
        </section>` : null}
        <section class="card stack"><h2>Añadir</h2><div class="chips">
          ${[['text', 'Texto'], ['image', 'Foto'], ['logo', 'Logo'], ['rect', 'Rectángulo'], ['pill', 'Pastilla'], ['circle', 'Círculo'], ['line', 'Línea'], ['glow', 'Brillo'], ['grain', 'Textura']].map(([k, l]) => html`<button class="chip" onClick=${() => addLayer(k)}>+ ${l}</button>`)}</div>
          <label class="field"><span>Fondo de la página</span><div class="row nowrap"><input type="color" value=${doc.pages[page]?.bg || '#0B0B0B'} onInput=${(e) => { const n = clone(doc); n.pages[page].bg = e.target.value; n.pages[page].bgUser = true; commit(n, { record: false }); }} />
            <div class="chips">${BRAND_COLORS.slice(0, 8).map((c) => html`<button class="swatch" style=${{ background: c }} title=${c} onClick=${() => { const n = clone(doc); n.pages[page].bg = c; n.pages[page].bgUser = true; commit(n); }}></button>`)}</div></div></label>
        </section>
        <section class="card"><h2>Capas</h2><div class="layer-list">${[...layers].reverse().map((l) => html`<div class=${'layer-row' + (l.id === sel ? ' on' : '')} key=${l.id} onClick=${() => setSel(l.id)}>
          <button class="btn ghost icon sm" title=${l.visible === false ? 'Mostrar' : 'Ocultar'} onClick=${(e) => { e.stopPropagation(); setSel(l.id); setTimeout(() => setProps({ visible: l.visible === false }), 0); }}>${l.visible === false ? '◌' : '●'}</button>
          <span class="ellipsis" style=${{ opacity: l.visible === false ? 0.45 : 1 }}>${l.name || l.type}</span>${l.locked ? html`<span class="xs muted">🔒</span>` : null}</div>`)}</div></section>
      </aside>

      <div class="studio-stage" ref=${wrapRef}>
        <div class="stage-pages">${doc.pages.map((p, i) => html`<button class=${'chip' + (i === page ? ' on' : '')} onClick=${() => { setPage(i); setSel(null); }}>${i + 1}</button>`)}
          <button class="chip" title="Duplicar diapositiva" onClick=${() => addPage(true)}>+ Diapositiva</button>
          ${doc.pages.length > 1 ? html`<button class="chip" onClick=${removePage}>Quitar</button>` : null}
          <span class="xs muted">${doc.width}×${doc.height} px · ${doc.pages.length} diapositiva(s)</span></div>
        <div class="stage" style=${{ width: doc.width * sc + 'px', height: doc.height * sc + 'px' }} onPointerDown=${onDown} onPointerMove=${onMove} onPointerUp=${onUp} onPointerCancel=${onUp}>
          <canvas ref=${canvasRef} style=${{ width: doc.width * sc + 'px', height: doc.height * sc + 'px' }} aria-label="Lienzo del diseño"></canvas>
          ${selLayer && selLayer.visible !== false ? html`<div class="sel-box" style=${{ left: selLayer.x * sc + 'px', top: selLayer.y * sc + 'px', width: selLayer.w * sc + 'px', height: selLayer.h * sc + 'px', transform: `rotate(${selLayer.rotation || 0}deg)` }}>
            <span class="sel-handle" data-handle="se" title="Arrastra para cambiar el tamaño (Mayús en textos: escala la letra)"></span></div>` : null}
        </div>
        <p class="xs muted" style="text-align:center">Clic para seleccionar · arrastra para mover · esquina para redimensionar · flechas para ajustar · Supr para borrar</p>
      </div>

      <aside class="studio-side">${selLayer ? html`<${Props} l=${selLayer} set=${setProps} onPhoto=${() => changePhoto()} onAIPhoto=${() => changePhoto(sel, true)}
          onDelete=${removeLayer} onDup=${duplicateLayer} onUp=${() => moveOrder(1)} onDown=${() => moveOrder(-1)} />`
        : html`<section class="card small muted">Selecciona un elemento del lienzo o de la lista de capas para editar su texto, tipografía, tamaño, color, posición, foto o efectos.</section>`}
        <section class="card stack"><h2>Más</h2>
          <button class="btn sm" onClick=${saveAsTemplate}>Guardar como plantilla</button>
          ${doc.template ? html`<p class="xs muted" style="margin:0">Basada en: ${tpl?.basedOn?.note}</p>` : null}
        </section>
      </aside>
    </div>
  </div>`;
}

function Props({ l, set, onPhoto, onAIPhoto, onDelete, onDup, onUp, onDown }) {
  const num = (k, label, step = 1) => html`<label class="field"><span>${label}</span><input class="input" type="number" step=${step} value=${Math.round((l[k] ?? 0) * 100) / 100} onChange=${(e) => set({ [k]: Number(e.target.value) })} /></label>`;
  const color = (k, label) => html`<label class="field"><span>${label}</span><div class="row nowrap"><input type="color" value=${/^#/.test(l[k] || '') ? l[k].slice(0, 7) : '#ffffff'} onInput=${(e) => set({ [k]: e.target.value }, { record: false })} onChange=${(e) => set({ [k]: e.target.value })} />
    <div class="chips">${BRAND_COLORS.map((c) => html`<button class="swatch" style=${{ background: c }} title=${c} onClick=${() => set({ [k]: c })}></button>`)}</div></div></label>`;
  const isText = l.type === 'text' || l.type === 'pill';
  return html`<section class="card stack">
    <h2 class="card-title">${l.name || l.type}</h2>
    <label class="field"><span>Nombre de la capa</span><input class="input" value=${l.name || ''} onChange=${(e) => set({ name: e.target.value })} /></label>
    ${isText ? html`
      <label class="field"><span>Texto</span><textarea class="input" rows="3" value=${l.text || ''} onInput=${(e) => set({ text: e.target.value }, { record: false })} onChange=${(e) => set({ text: e.target.value })}></textarea></label>
      <label class="field"><span>Tipografía</span><select class="input" value=${l.font} onChange=${(e) => set({ font: e.target.value })}>${FONT_LIST.map((f) => html`<option value=${f} style=${{ fontFamily: f }}>${f}</option>`)}</select></label>
      <div class="form-grid">${num('size', 'Tamaño')}${l.font === 'Barlow Condensed' || l.font === 'DM Sans' ? html`<label class="field"><span>Peso</span><select class="input" value=${l.weight} onChange=${(e) => set({ weight: Number(e.target.value) })}>${[400, 600, 700, 900].map((w) => html`<option value=${w}>${w}</option>`)}</select></label>` : num('letterSpacing', 'Espaciado')}</div>
      ${l.font === 'Barlow Condensed' || l.font === 'DM Sans' ? num('letterSpacing', 'Espaciado entre letras') : null}
      ${l.type === 'text' ? html`<div class="seg">${[['left', 'Izq.'], ['center', 'Centro'], ['right', 'Der.']].map(([a, t]) => html`<button class=${l.align === a ? 'on' : ''} onClick=${() => set({ align: a })}>${t}</button>`)}</div>
        <div class="row small"><label class="row"><input type="checkbox" checked=${!!l.uppercase} onChange=${(e) => set({ uppercase: e.target.checked })} />Mayúsculas</label>
          <label class="row"><input type="checkbox" checked=${!!l.fit} onChange=${(e) => set({ fit: e.target.checked })} />Ajustar al cuadro</label>
          <label class="row"><input type="checkbox" checked=${!!l.glowColor} onChange=${(e) => set({ glowColor: e.target.checked ? '#2BB061' : null, glowBlur: 36 })} />Halo verde</label></div>` : null}
      ${color('color', 'Color del texto')}
      ${l.type === 'text' ? html`<label class="row small"><input type="checkbox" checked=${!!l.strokeWidth} onChange=${(e) => set({ strokeWidth: e.target.checked ? 4 : 0, strokeColor: l.strokeColor || '#2BB061' })} />Contorno</label>${l.strokeWidth ? color('strokeColor', 'Color del contorno') : null}` : null}
      ${l.type === 'pill' ? color('fill', 'Color de la pastilla') : null}` : null}
    ${l.type === 'rect' || l.type === 'circle' ? color('fill', 'Relleno') : null}
    ${l.type === 'rect' ? num('radius', 'Esquinas redondeadas') : null}
    ${l.type === 'glow' ? html`${color('color', 'Color del brillo')}${num('strength', 'Intensidad (0–1)', 0.05)}` : null}
    ${l.type === 'line' ? html`${color('color', 'Color')}${num('width', 'Grosor')}` : null}
    ${l.type === 'grain' ? num('amount', 'Cantidad (0–1)', 0.05) : null}
    ${l.type === 'image' ? html`<div class="row"><button class="btn sm primary" onClick=${onPhoto}><${Icon} name="image" size=${14} />${l.ref ? 'Cambiar foto' : 'Elegir foto'}</button>
        <button class="btn sm" onClick=${onAIPhoto}><${Icon} name="sparkle" size=${14} />Generar con IA</button></div>
      <div class="seg"><button class=${(l.fit || 'cover') === 'cover' ? 'on' : ''} onClick=${() => set({ fit: 'cover' })}>Rellenar</button><button class=${l.fit === 'contain' ? 'on' : ''} onClick=${() => set({ fit: 'contain' })}>Encajar</button></div>
      <div class="form-grid">${num('brightness', 'Brillo (1 = normal)', 0.05)}${num('grayscale', 'Blanco y negro (0–1)', 0.1)}${num('focusX', 'Encuadre horizontal (0–1)', 0.05)}${num('focusY', 'Encuadre vertical (0–1)', 0.05)}</div>
      ${num('frame', 'Marco polaroid (px)')}` : null}
    <div class="form-grid">${num('x', 'X')}${num('y', 'Y')}${num('w', 'Ancho')}${num('h', 'Alto')}${num('rotation', 'Rotación (°)')}${num('opacity', 'Opacidad (0–1)', 0.05)}</div>
    <div class="row"><label class="row small"><input type="checkbox" checked=${!!l.locked} onChange=${(e) => set({ locked: e.target.checked })} />Bloquear</label></div>
    <div class="row"><button class="btn sm" onClick=${onUp} title="Traer adelante">↑ Adelante</button><button class="btn sm" onClick=${onDown} title="Enviar atrás">↓ Atrás</button>
      <button class="btn sm" onClick=${onDup}>Duplicar</button><button class="btn sm danger" onClick=${onDelete}><${Icon} name="trash" size=${14} /></button></div>
  </section>`;
}

// ---------- exportar ----------
function ExportDialog({ doc, page, close, meta, onSave, creativeRef }) {
  const st = useStore();
  const [type, setType] = useState('image/png');
  const [scale, setScale] = useState(1);
  const [which, setWhich] = useState(doc.pages.length > 1 ? 'all' : 'one');
  const [postId, setPostId] = useState(meta.post_id || '');
  const [approval, setApproval] = useState(false);
  const [lib, setLib] = useState(true);
  const [busy, setBusy] = useState(false);
  const pages = which === 'all' ? null : [page];
  async function download() {
    setBusy(true);
    try {
      const files = await renderExports(doc, { type, scale, pages });
      if (files.length === 1) downloadBlob(files[0].blob, files[0].name);
      else downloadBlob(await makeZip(files.map((f) => ({ name: f.name, blob: f.blob }))), `${(meta.title || 'diseno').replace(/\W+/g, '-')}.zip`);
      toast('Descargado', `${files.length} archivo(s) ${type === 'image/png' ? 'PNG' : 'JPG'} · ${files[0].width}×${files[0].height}`);
    } catch (e) { toastError(e); } finally { setBusy(false); }
  }
  async function saveExport() {
    setBusy(true);
    try {
      const files = await renderExports(doc, { type, scale, pages });
      const r = await onSave({ exports: files, note: `Exportación ${type === 'image/png' ? 'PNG' : 'JPG'} ${files[0].width}×${files[0].height}` });
      if (!r) return;
      if (lib) await addToLibrary(r.c, r.v);
      if (postId) { await linkToPost(r.c, r.v, postId, { requestApproval: approval }); toast('Vinculado a la publicación', approval ? 'Enviado a aprobación' : 'Añadido como nueva versión del diseño'); }
      close();
    } catch (e) { toastError(e); } finally { setBusy(false); }
  }
  const posts = st.posts.filter((p) => p.status !== 'published' || p.id === postId);
  return html`<${ModalHead} title="Exportar diseño" close=${close} />
    <div class="modal-body stack">
      <div class="form-grid">
        <label class="field"><span>Tipo de archivo</span><div class="seg"><button class=${type === 'image/png' ? 'on' : ''} onClick=${() => setType('image/png')}>PNG</button><button class=${type === 'image/jpeg' ? 'on' : ''} onClick=${() => setType('image/jpeg')}>JPG</button></div></label>
        <label class="field"><span>Resolución</span><div class="seg">${[1, 2, 3].map((s) => html`<button class=${scale === s ? 'on' : ''} onClick=${() => setScale(s)}>${doc.width * s}×${doc.height * s}</button>`)}</div></label>
        ${doc.pages.length > 1 ? html`<label class="field full"><span>Diapositivas</span><div class="seg"><button class=${which === 'all' ? 'on' : ''} onClick=${() => setWhich('all')}>Todas (${doc.pages.length}, ZIP al descargar)</button><button class=${which === 'one' ? 'on' : ''} onClick=${() => setWhich('one')}>Solo la ${page + 1}</button></div></label>` : null}
      </div>
      <p class="xs muted" style="margin:0">PNG para Instagram con la máxima calidad; JPG ocupa menos. ×2 / ×3 para carteles impresos en alta resolución.</p>
      <hr class="sep" />
      <label class="field"><span>Vincular a una publicación del calendario (opcional)</span><select class="input" value=${postId} onChange=${(e) => setPostId(e.target.value)}><option value="">Ninguna</option>
        ${posts.map((p) => html`<option value=${p.id}>${p.starts_at ? fmt.date(p.starts_at) + ' · ' : ''}${p.title}</option>`)}</select></label>
      ${postId ? html`<label class="row small"><input type="checkbox" checked=${approval} onChange=${(e) => setApproval(e.target.checked)} />Enviar a aprobación del propietario</label>` : null}
      <label class="row small"><input type="checkbox" checked=${lib} onChange=${(e) => setLib(e.target.checked)} />Guardar también en la Biblioteca (Estudio creativo)</label>
    </div>
    <div class="modal-foot"><button class="btn ghost" onClick=${close}>Cancelar</button>
      <button class="btn" disabled=${busy} onClick=${download}><${Icon} name="download" size=${15} />Solo descargar</button>
      <button class="btn primary" disabled=${busy} onClick=${saveExport}>${busy ? 'Generando…' : 'Guardar versión y exportar'}</button></div>`;
}

function VersionThumb({ path }) {
  const [u, setU] = useState(null);
  useEffect(() => { if (path) signedUrl(path).then(setU).catch(() => {}); }, [path]);
  return u ? html`<img src=${u} alt="" loading="lazy" />` : html`<${Icon} name="palette" size=${26} />`;
}
function VersionsDialog({ creative, close, onOpen }) {
  const [full, setFull] = useState(null);
  useEffect(() => { getCreative(creative.id).then(setFull).catch(toastError); }, []);
  const vs = (full?.creative_versions || []).sort((a, b) => b.version_no - a.version_no);
  async function dl(e) { try { const u = await signedUrl(e.path); const b = await (await fetch(u)).blob(); downloadBlob(b, e.path.split('/').pop()); } catch (er) { toastError(er); } }
  return html`<${ModalHead} title=${'Versiones · ' + creative.title} close=${close} />
    <div class="modal-body">${!full ? html`<p class="empty">Cargando…</p>` : html`<div class="media-grid" style="grid-template-columns:repeat(auto-fill,minmax(190px,1fr))">${vs.map((v) => html`<div class="media" key=${v.id}>
      <div class="thumb" style="aspect-ratio:auto;height:220px"><${VersionThumb} path=${v.preview_path} /></div>
      <div class="cap stack" style="gap:4px"><b>Versión ${v.version_no}</b><span class="xs muted">${profileById(v.created_by)?.full_name || ''} · ${fmt.dateTime(v.created_at)}</span>
        ${v.note ? html`<span class="xs">${v.note}</span>` : null}
        <button class="btn sm" onClick=${() => { close(); onOpen(v); }}>Abrir y editar</button>
        ${(v.exports || []).map((e) => html`<button class="btn sm ghost" onClick=${() => dl(e)}><${Icon} name="download" size=${13} />${e.width}×${e.height}${v.exports.length > 1 ? ' · p' + e.page : ''}</button>`)}</div></div>`)}</div>`}</div>`;
}

// ===================================================================== Pestañas del estudio
function Thumb({ t, format }) {
  const [u, setU] = useState(null);
  useEffect(() => { let on = true; exportPage(buildDoc(t, format || t.defaultFormat), 0, { type: 'image/jpeg', scale: 0.22, quality: 0.75 }).then((b) => on && setU(URL.createObjectURL(b))).catch(() => {}); return () => { on = false; }; }, [t.key, format]);
  return u ? html`<img src=${u} alt=${t.name} />` : html`<${Icon} name="palette" size=${26} />`;
}

function startTemplate(t, format, extra = {}) {
  const doc = buildDoc(t, format || t.defaultFormat, extra.data || {}, extra.images || {});
  openInStudio(doc, { title: extra.title || t.name, category: extra.category || t.category, campaign: extra.campaign || '', post_id: extra.post_id || null });
}

function CreateTab() {
  const st = useStore();
  const [brief, setBrief] = useState('');
  const [plan, setPlan] = useState(null);
  async function propose() {
    const r = interpret(brief); setPlan(r);
  }
  async function go2(r) {
    const t = templateByKey(r.key); let images = {};
    if (r.wantsPhoto && t.images.length) {
      const files = await pickFiles({ title: 'Elige la fotografía para la propuesta', multiple: false, defaultTab: 'upload' });
      if (files.length) { try { images = { [t.images[0].k]: await refForCanvas(files[0]) }; } catch (e) { toastError(e); } }
    }
    startTemplate(t, t.formats.includes(r.format) ? r.format : t.defaultFormat, { data: r.data, images, title: brief.slice(0, 60) || t.name });
  }
  async function fromPhoto() {
    const files = await pickFiles({ title: 'Fotografía del local', multiple: false, defaultTab: 'upload' }); if (!files.length) return;
    try { const ref = await refForCanvas(files[0]); startTemplate(templateByKey('fotos-portada'), 'post', { images: { foto: ref }, title: 'Diseño con foto del local' }); } catch (e) { toastError(e); }
  }
  const upcoming = st.posts.filter((p) => p.starts_at && new Date(p.starts_at) > Date.now() - 864e5 && ['post', 'reel', 'story', 'carousel', 'weekly_poster', 'champions', 'promo', 'event'].includes(p.kind)).slice(0, 40);
  return html`<div class="stack" style="gap:16px">
    <section class="card hero stack"><h2><${Icon} name="sparkle" />Describe lo que necesitas</h2>
      <textarea class="input" rows="3" placeholder="Quiero un cartel para anunciar el partido de Champions del miércoles. Utiliza el estilo de nuestros carteles anteriores, incorpora esta fotografía y deja espacio para el horario." value=${brief} onInput=${(e) => setBrief(e.target.value)}></textarea>
      <div class="row"><button class="btn primary" disabled=${brief.trim().length < 6} onClick=${propose}>Interpretar instrucción</button>
        <span class="xs muted">Asistente por reglas (sin IA): elige plantilla, formato y datos a partir del texto. No inventa equipos, horas ni artistas.</span></div>
      ${plan ? html`<div class="card stack" style="background:var(--bg2)">
        <div><b>Propuesta:</b> ${templateByKey(plan.key).name} · ${FORMATS[plan.format]?.label || plan.format}</div>
        ${Object.keys(plan.data).length ? html`<div class="small">${Object.entries(plan.data).map(([k, v]) => html`<div><span class="muted">${k}:</span> ${v}</div>`)}</div>` : null}
        ${plan.notes.map((n) => html`<div class="small" style="color:var(--ambar)">· ${n}</div>`)}
        <div class="row"><button class="btn primary" onClick=${() => go2(plan)}>Crear la propuesta visual</button>
          <select class="input" style="width:auto" value=${plan.key} onChange=${(e) => setPlan({ ...plan, key: e.target.value })}>${TEMPLATES.map((t) => html`<option value=${t.key}>${t.name}</option>`)}</select></div></div>` : null}
    </section>
    <div class="grid cols-3">
      <button class="card mode" onClick=${() => startTemplate(templateByKey('blanco'), 'post', { title: 'Diseño desde cero' })}><${Icon} name="plus" size=${26} /><b>Crear desde cero</b><span class="small muted">Lienzo con fondo y logo de la marca</span></button>
      <a class="card mode" href="#/estudio?tab=plantillas"><${Icon} name="layers" size=${26} /><b>Usar una plantilla</b><span class="small muted">Estilos aprobados recreados y editables</span></a>
      <a class="card mode" href="#/estudio?tab=originales"><${Icon} name="copy" size=${26} /><b>Variante de un diseño existente</b><span class="small muted">A partir de los originales o de tus diseños</span></a>
      <button class="card mode" onClick=${fromPhoto}><${Icon} name="image" size=${26} /><b>Usar una foto del local</b><span class="small muted">Sube o elige una foto y diseña encima</span></button>
      <a class="card mode" href="#/estudio?tab=video"><${Icon} name="video" size=${26} /><b>Vídeo / reel</b><span class="small muted">Guion, escenas y exportación real</span></a>
      <a class="card mode" href="#/estudio?tab=ia"><${Icon} name="sparkle" size=${26} /><b>Imágenes con IA</b><span class="small muted">Fondos y recursos (requiere proveedor)</span></a>
    </div>
    <section class="card"><h2>Crear una creatividad para una publicación del calendario</h2>
      ${upcoming.length ? html`<div class="list">${upcoming.map((p) => html`<div class="li" key=${p.id} onClick=${() => designForPost(p)}><div class="when"><b>${fmt.time(p.starts_at)}</b>${fmt.date(p.starts_at)}</div>
        <div class="body"><div class="title">${p.title}</div><div class="sub">${p.format || ''} · plantilla sugerida: ${templateByKey(KIND_TO_TEMPLATE[p.kind] || 'programacion')?.name}</div></div><span class="btn sm">Crear diseño</span></div>`)}</div>` : html`<p class="empty">No hay publicaciones próximas.</p>`}
    </section></div>`;
}

export function designForPost(p) {
  const key = /monólogo|monologo/i.test(p.title) ? 'monologos' : /tardeo/i.test(p.title) && p.kind !== 'story' ? 'tardeo' : /menú|menu/i.test(p.title) ? 'navidad-menus' : /line-up|lineup/i.test(p.title) ? 'lineup' : /hoy/i.test(p.title) && p.kind === 'story' ? 'story-hoy' : KIND_TO_TEMPLATE[p.kind] || 'programacion';
  const t = templateByKey(key);
  const format = p.kind === 'story' || p.kind === 'reel' || /story/i.test(p.format || '') ? (t.formats.includes('story') ? 'story' : t.defaultFormat) : t.defaultFormat;
  const r = interpret(`${p.title} ${p.starts_at ? new Date(p.starts_at).toLocaleDateString('es-ES') : ''}`);
  const data = { ...(r.key === key ? r.data : {}) };
  if (key === 'programacion' && p.copy) { const rows = p.copy.split('\n').filter((l) => /·/.test(l) && /(VIERNES|SÁBADO|JUEVES|DOMINGO|Vie|Sáb|Jue|Dom)/i.test(l)); if (rows.length) data.filas = rows.join('\n'); }
  startTemplate(t, format, { data, title: p.title, category: KIND_TO_CATEGORY[p.kind] || t.category, post_id: p.id });
}

function TemplatesTab({ creatives }) {
  const [cat, setCat] = useState('');
  const mine = creatives.filter((c) => c.is_template && (!cat || c.category === cat));
  return html`<div class="stack" style="gap:16px">
    <div class="chips"><button class=${'chip' + (!cat ? ' on' : '')} onClick=${() => setCat('')}>Todas</button>${CATEGORIES.filter(([k]) => k !== 'video').map(([k, l]) => html`<button class=${'chip' + (cat === k ? ' on' : '')} onClick=${() => setCat(k)}>${l}</button>`)}</div>
    <section class="card"><h2>Plantillas de la marca (recreadas y editables)</h2>
      <div class="tpl-grid">${TEMPLATES.filter((t) => !cat || t.category === cat).map((t) => html`<div class="tpl" key=${t.key}>
        <div class="tpl-prev"><${Thumb} t=${t} /></div>
        <div class="stack" style="gap:4px;padding:10px"><b class="small">${t.name}</b><span class="xs muted">${CATEGORY_LABEL[t.category]} · ${t.basedOn.kind === 'original' ? 'recreada desde original: ' + t.basedOn.files.join(', ') : 'recreada desde la guía'}</span>
          <div class="chips">${t.formats.map((f) => html`<button class="chip" onClick=${() => startTemplate(t, f)}>${FORMATS[f].label.split(' ·')[0]}</button>`)}</div></div></div>`)}</div></section>
    <section class="card"><h2>Tus plantillas guardadas</h2>${mine.length ? html`<div class="tpl-grid">${mine.map((c) => html`<${CreativeCard} c=${c} key=${c.id} asTemplate />`)}</div>` : html`<p class="empty">Aún no has guardado ninguna. En el editor: «Guardar como plantilla».</p>`}</section>
  </div>`;
}

async function variantFromCreative(c, asTemplate) {
  try {
    const full = await getCreative(c.id); const last = full.creative_versions.sort((a, b) => b.version_no - a.version_no)[0];
    if (!last) throw new Error('Este diseño no tiene versiones guardadas.');
    openInStudio(last.doc, { title: (asTemplate ? '' : 'Variante · ') + c.title, category: c.category, campaign: c.campaign || '', source_ref: 'creative:' + c.id });
  } catch (e) { toastError(e); }
}
function CreativeCard({ c, asTemplate }) {
  const last = (c.creative_versions || []).sort((a, b) => b.version_no - a.version_no)[0];
  const st = useStore(); const post = c.post_id ? st.posts.find((p) => p.id === c.post_id) : null;
  return html`<div class="tpl">
    <div class="tpl-prev" onClick=${() => (asTemplate ? variantFromCreative(c, true) : go('#/estudio?c=' + c.id))} style="cursor:pointer"><${VersionThumb} path=${last?.preview_path} /></div>
    <div class="stack" style="gap:4px;padding:10px"><b class="small ellipsis">${c.title}</b>
      <span class="xs muted">${CATEGORY_LABEL[c.category]}${c.campaign ? ' · ' + c.campaign : ''} · ${c.width}×${c.height} · v${c.current_version} · ${fmt.rel(c.updated_at)}</span>
      ${post ? html`<a class="xs" href=${'#/publicaciones/' + post.id}>↳ ${post.title}</a>` : null}
      <div class="row">${asTemplate ? html`<button class="btn sm primary" onClick=${() => variantFromCreative(c, true)}>Usar</button>`
        : html`<button class="btn sm" onClick=${() => go('#/estudio?c=' + c.id)}>Editar</button><button class="btn sm ghost" onClick=${() => variantFromCreative(c)}>Crear variante</button>`}</div></div></div>`;
}

function DesignsTab({ creatives }) {
  const [f, setF] = useState({ q: '', cat: '', camp: '', fmt: '', post: '' });
  const camps = [...new Set(creatives.map((c) => c.campaign).filter(Boolean))];
  const list = creatives.filter((c) => !c.is_template && c.category !== 'video' && (!f.q || c.title.toLowerCase().includes(f.q.toLowerCase())) && (!f.cat || c.category === f.cat) && (!f.camp || c.campaign === f.camp)
    && (!f.fmt || c.format === f.fmt) && (!f.post || (f.post === 'yes' ? c.post_id : !c.post_id)));
  return html`<div class="stack">
    <div class="toolbar"><input class="input" style="flex:1;min-width:180px" placeholder="Buscar diseños…" value=${f.q} onInput=${(e) => setF({ ...f, q: e.target.value })} />
      <select class="input" value=${f.cat} onChange=${(e) => setF({ ...f, cat: e.target.value })}><option value="">Categoría</option>${CATEGORIES.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <select class="input" value=${f.camp} onChange=${(e) => setF({ ...f, camp: e.target.value })}><option value="">Campaña</option>${camps.map((c) => html`<option value=${c}>${c}</option>`)}</select>
      <select class="input" value=${f.fmt} onChange=${(e) => setF({ ...f, fmt: e.target.value })}><option value="">Formato</option>${Object.entries(FORMATS).map(([k, x]) => html`<option value=${k}>${x.label}</option>`)}<option value="video">Vídeo</option></select>
      <select class="input" value=${f.post} onChange=${(e) => setF({ ...f, post: e.target.value })}><option value="">Publicación</option><option value="yes">Vinculados</option><option value="no">Sin vincular</option></select></div>
    ${list.length ? html`<div class="tpl-grid">${list.map((c) => html`<${CreativeCard} c=${c} key=${c.id} />`)}</div>` : html`<p class="empty big">Aún no hay diseños guardados.</p>`}</div>`;
}

function OriginalsTab() {
  async function variant(o) {
    const files = driveConnected() ? [{ source: 'drive', drive_file_id: o.drive, name: o.name, mime_type: 'image/png' }]
      : await pickFiles({ title: `Sube el archivo original «${o.name}» (descárgalo antes de Drive)`, multiple: false, defaultTab: 'upload' });
    if (!files.length) return;
    try {
      const ref = await refForCanvas(files[0]);
      const doc = { v: 1, width: 1080, height: 1350, format: 'post', source: o.id, pages: [{ id: uid(), bg: '#000', layers: [
        { id: uid(), type: 'image', name: 'Original (imagen plana, sin capas)', x: 0, y: 0, w: 1080, h: 1350, ref, fit: 'cover', user: true, visible: true, opacity: 1, rotation: 0, locked: true } ] }] };
      openInStudio(doc, { title: 'Variante · ' + o.name, category: o.category, source_ref: 'drive:' + o.drive });
      toast('Original cargado como imagen plana', 'Está bloqueado como fondo: añade textos, formas o tapa zonas encima. Para editar todo, usa su plantilla recreada.');
    } catch (e) { toastError(e); }
  }
  return html`<div class="stack" style="gap:16px">
    <section class="card small muted">Diseños reales verificados en Google Drive. Los originales se conservan intactos (solo se guarda su referencia). Un PNG o JPG es una <b>imagen plana: no tiene capas editables</b>. Para editarlo por partes usa su <b>plantilla recreada</b>; para retocarlo tal cual, crea una variante encima del original.</section>
    <div class="tpl-grid">${ORIGINALS.map((o) => { const t = templateByKey(o.template); return html`<div class="tpl" key=${o.id}>
      <div class="tpl-prev"><img src=${driveThumb(o.drive, 500)} alt=${o.name} referrerpolicy="no-referrer" onError=${(e) => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: 'Vista previa solo con sesión de Google con acceso' , className: 'xs muted' })); }} /></div>
      <div class="stack" style="gap:6px;padding:10px"><b class="small">${o.name}</b>
        <span class="xs">${o.format} · ${o.flat ? html`<b style="color:var(--ambar)">imagen plana (sin capas)</b>` : 'vectorial'}${o.psd ? html` · PSD: ${o.psd.name} (no abierto aquí)` : ''}</span>
        <div class="row" style="gap:4px">${o.colors.map((c) => html`<span class="swatch" style=${{ background: c }} title=${c}></span>`)}</div>
        <span class="xs muted"><b>Tipografías:</b> ${o.fonts}</span><span class="xs muted"><b>Composición:</b> ${o.composition}</span><span class="xs muted"><b>Reutilizable:</b> ${o.reusable}</span>
        <div class="row">${t ? html`<button class="btn sm primary" onClick=${() => startTemplate(t, t.defaultFormat, { title: 'Nuevo · ' + t.name })}>Usar plantilla recreada</button>` : null}
          ${o.flat ? html`<button class="btn sm" onClick=${() => variant(o)}>Variante sobre el original</button>` : null}
          <a class="btn sm ghost" href=${driveView(o.drive)} target="_blank" rel="noopener"><${Icon} name="external" size=${13} />Original</a></div></div></div>`; })}</div>
    <section class="card stack"><h2>Recibidos el 12 nov (pendientes de subir a la app)</h2>
      ${RECEIVED.map((r) => html`<div class="small" style="padding:6px 0;border-top:1px solid var(--line)"><b>${r.name}</b> · ${r.format}${r.flat ? ' · sin capas editables' : ''}
        <div class="muted xs"><b>Composición:</b> ${r.composition}</div><div class="muted xs"><b>Reutilizable:</b> ${r.reusable}</div></div>`)}
      <p class="xs muted" style="margin:0">Súbelos en su publicación (Subir nueva versión → Subir archivo) para que queden guardados como versión 1.</p></section>
    <section class="card"><h2>No disponible en este proyecto (no se ha importado)</h2><ul class="small" style="margin:0;padding-left:18px">${MISSING.map((m) => html`<li>${m}</li>`)}</ul>
      <p class="xs muted">Cuando subas el paquete a Drive se pueden registrar aquí. Verificado y descartado: «Tipos de personas» es un carrusel de Volcán.</p></section></div>`;
}

let aiPick = null;
async function aiPhoto() {
  const s = await aiStatus();
  if (!s.configured) { openModal((close) => html`<${ModalHead} title="Imágenes con IA" close=${close} /><div class="modal-body"><${AISetup} status=${s} /></div>`, { size: 'wide' }); return null; }
  return new Promise((res) => { aiPick = res; openModal((close) => html`<${ModalHead} title="Generar imagen con IA" close=${() => { close(); res(null); }} /><div class="modal-body"><${AIGenerate} onUse=${(ref) => { close(); res(ref); }} /></div>`, { size: 'wide' }); });
}
function AISetup({ status }) {
  return html`<div class="stack small">
    <div class="tag" style="align-self:flex-start;color:var(--ambar)">${status.deployed ? 'Función desplegada, pero sin proveedor ni API key' : 'Generación de imágenes con IA: necesita configuración'}</div>
    <p style="margin:0">El estudio funciona sin IA (plantillas y fotos). Para crear fondos y recursos con IA hay que conectar un proveedor de pago. La clave se guarda como <b>secreto en Supabase</b> y nunca llega al navegador.</p>
    <ol style="margin:0;padding-left:18px;line-height:1.8">
      <li>Elige proveedor y crea una API key: <b>OpenAI</b> (platform.openai.com → API keys, modelo gpt-image-1) o <b>Stability AI</b> (platform.stability.ai → API keys).</li>
      <li>Despliega la función: <code>npx supabase functions deploy ai-image</code></li>
      <li>Guarda los secretos: <code>npx supabase secrets set AI_IMAGE_PROVIDER=openai OPENAI_API_KEY=sk-…</code> (o <code>AI_IMAGE_PROVIDER=stability STABILITY_API_KEY=…</code>). Opcional: <code>AI_DAILY_LIMIT=25</code>.</li>
      <li>Vuelve aquí: el estado cambiará a «configurado».</li></ol>
    <p class="xs muted" style="margin:0">No se simula ningún resultado: sin proveedor configurado no se genera nada. Cada imagen tiene coste en tu cuenta del proveedor.</p></div>`;
}
function AIGenerate({ onUse }) {
  const st = useStore();
  const [prompt, setPrompt] = useState('Fondo nocturno de bar con luces verdes desenfocadas, sin texto, sin personas reconocibles, estilo fotográfico');
  const [size, setSize] = useState('portrait');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  async function gen() { setBusy(true); try { const r = await generateImage(prompt, size); setRes({ ...r, url: await signedUrl(r.path) }); } catch (e) { toastError(e); } finally { setBusy(false); } }
  async function toLibrary() {
    const cat = st.categories.find((c) => c.slug === 'ia');
    try { check(await sb.from('library_items').insert({ category_id: cat?.id || null, source: 'storage', storage_path: res.path, name: 'IA · ' + prompt.slice(0, 60), mime_type: 'image/png', notes: `Generada con ${res.provider} (${res.model}): ${prompt}` })); toast('Guardada en la biblioteca (Imágenes IA)'); } catch (e) { toastError(e); }
  }
  return html`<div class="stack">
    <label class="field"><span>Describe la imagen</span><textarea class="input" rows="3" value=${prompt} onInput=${(e) => setPrompt(e.target.value)}></textarea>
      <span class="hint">Evita personajes de terceros, marcas ajenas y personas reales (reglas de la marca).</span></label>
    <div class="row"><div class="seg">${[['portrait', 'Vertical'], ['square', 'Cuadrada'], ['landscape', 'Horizontal']].map(([k, l]) => html`<button class=${size === k ? 'on' : ''} onClick=${() => setSize(k)}>${l}</button>`)}</div>
      <button class="btn primary" disabled=${busy} onClick=${gen}>${busy ? 'Generando… (puede tardar)' : 'Generar'}</button></div>
    ${res ? html`<div class="stack"><img src=${res.url} alt="Imagen generada" style="max-height:420px;border-radius:12px;align-self:flex-start" />
      <span class="xs muted">${res.provider} · ${res.model} · ${res.width}×${res.height} · guardada en Storage</span>
      <div class="row">${onUse ? html`<button class="btn primary" onClick=${() => onUse({ kind: 'storage', path: res.path })}>Usar en el diseño</button>` : html`<button class="btn primary" onClick=${() => { const t = templateByKey('blanco'); const d = buildDoc(t, size === 'landscape' ? 'landscape' : size === 'square' ? 'square' : 'story'); d.pages[0].layers.unshift({ id: uid(), type: 'image', name: 'Imagen IA', x: 0, y: 0, w: d.width, h: d.height, ref: { kind: 'storage', path: res.path }, user: true, visible: true, opacity: 1, rotation: 0 }); openInStudio(d, { title: 'Diseño con imagen IA', category: 'posts' }); }}>Crear diseño con ella</button>`}
        <button class="btn" onClick=${toLibrary}>Guardar en la biblioteca</button></div></div>` : null}</div>`;
}
function AITab() {
  const [s, setS] = useState(null);
  useEffect(() => { aiStatus(true).then(setS); }, []);
  if (!s) return html`<p class="empty">Comprobando la configuración del servidor…</p>`;
  return html`<section class="card stack">${s.configured ? html`<span class="tag" style="align-self:flex-start;color:var(--verde)">● Configurado: ${s.provider} · ${s.model}</span><${AIGenerate} />` : html`<${AISetup} status=${s} />`}</section>`;
}

// ===================================================================== Vista principal
export function StudioView({ query }) {
  const st = useStore();
  const [ok, setOk] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [editing, setEditing] = useState(null);
  const tab = query.get('tab') || 'crear';
  const cid = query.get('c');
  const isNew = query.get('edit') === 'new';
  async function reload() { try { setCreatives(await listCreatives()); } catch (e) { toastError(e); } }
  useEffect(() => { studioAvailable(true).then((a) => { setOk(a); if (a) reload(); }); }, []);
  useEffect(() => {
    if (!ok) return;
    if (isNew && pending) { setEditing({ doc: pending.doc, meta: { title: '', category: 'posts', campaign: '', ...pending.meta }, creative: null }); pending = null; return; }
    if (cid) { getCreative(cid).then((c) => { const last = c.creative_versions.sort((a, b) => b.version_no - a.version_no)[0];
      setEditing({ doc: last ? last.doc : buildDoc(templateByKey(c.template_key) || templateByKey('blanco'), c.format), meta: { title: c.title, category: c.category, campaign: c.campaign || '', post_id: c.post_id }, creative: c }); }).catch(toastError); return; }
    setEditing(null);
  }, [ok, cid, isNew, query.get('t')]);
  if (ok === null) return html`<p class="empty">Cargando el estudio…</p>`;
  if (!ok) return html`<div class="page-head"><div><h1>Estudio creativo</h1></div></div><section class="card stack"><h2>Falta activar el estudio en la base de datos</h2>
    <p style="margin:0">Pega <code>supabase/estudio.sql</code> en Supabase → SQL Editor → Run (una sola vez). Crea las tablas de diseños, versiones e imágenes IA con sus permisos.</p>
    <a class="btn primary" style="align-self:flex-start" href="https://raw.githubusercontent.com/esdhoops-png/Web/claude/laughing-heisenberg-hj3u5k/social-hub/supabase/estudio.sql" target="_blank" rel="noopener">Abrir estudio.sql</a></section>`;
  if (editing) return html`<${Editor} key=${(editing.creative?.id || 'new') + (query.get('t') || '')} initial=${editing.doc} meta=${editing.meta} creative=${editing.creative} onExit=${() => { setEditing(null); reload(); go('#/estudio?tab=disenos'); }} />`;
  const TABS = [['crear', 'Crear'], ['disenos', 'Mis diseños'], ['plantillas', 'Plantillas'], ['originales', 'Diseños originales'], ['video', 'Vídeo y reels'], ['ia', 'Imágenes IA']];
  return html`<div class="page-head"><div><h1>Estudio creativo</h1><p>Diseños de Heineken 5mentarios con la identidad de la marca, exportados como archivos reales y conectados al calendario.</p></div></div>
    <div class="seg" style="margin-bottom:16px;flex-wrap:wrap">${TABS.map(([k, l]) => html`<button class=${tab === k ? 'on' : ''} onClick=${() => go('#/estudio?tab=' + k)}>${l}</button>`)}</div>
    ${tab === 'crear' ? html`<${CreateTab} />` : tab === 'disenos' ? html`<${DesignsTab} creatives=${creatives} />` : tab === 'plantillas' ? html`<${TemplatesTab} creatives=${creatives} />`
      : tab === 'originales' ? html`<${OriginalsTab} />` : tab === 'video' ? html`<${VideoStudio} creatives=${creatives} reload=${reload} />` : html`<${AITab} />`}`;
}

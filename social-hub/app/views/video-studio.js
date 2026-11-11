// Módulo de VÍDEO Y REELS: guion, escenas (fotos/vídeos), textos, subtítulos, transiciones, música autorizada
// y exportación real en el navegador (MediaRecorder). Sin IA de vídeo.
import { html, useState, useEffect, useRef, Icon, toast, toastError, fmt, confirmDialog } from '../lib/ui.js';
import { useStore, go, signedUrl, uploadFile } from '../lib/store.js';
import { pickFiles } from '../lib/media.js';
import { newVideoDoc, newScene, totalDuration, prepare, drawAt, exportVideo, pickMime, setVideoStorageResolver, OUTRO } from '../studio/video.js';
import { createCreative, getCreative, saveVersion, linkToPost, addToLibrary, updateCreative } from '../studio/data.js';
import { downloadBlob } from '../studio/engine.js';

setVideoStorageResolver((p) => signedUrl(p));

const GUIONES = {
  'Así fue la noche': ['Gancho: gente cantando / brindis', 'Ambiente general', 'Artista en directo', 'Mesas y barra', 'Así fue la noche en 5mentarios'],
  'Lo que se viene este finde': ['¿Qué hay este finde?', 'Viernes · [artista] · [hora]', 'Sábado · [artista] · [hora]', 'Reserva por WhatsApp 627 304 115'],
  'POV la pides en el 5mentarios': ['POV: pides en la barra', 'Volcán la hace al momento', 'Te la llevamos a la mesa', 'Pide Volcán o Cuor di Pizza']
};

export function VideoStudio({ creatives, reload }) {
  const [editing, setEditing] = useState(null);
  const videos = creatives.filter((c) => c.category === 'video');
  async function open(c) { try { const f = await getCreative(c.id); const last = f.creative_versions.sort((a, b) => b.version_no - a.version_no)[0]; setEditing({ creative: f, doc: last.doc }); } catch (e) { toastError(e); } }
  if (editing) return html`<${VideoEditor} initial=${editing} onExit=${() => { setEditing(null); reload(); }} />`;
  const mime = pickMime();
  return html`<div class="stack" style="gap:16px">
    <section class="card stack"><h2>Nuevo vídeo</h2>
      <p class="small muted" style="margin:0">Monta reels y stories con tus fotos y vídeos, textos, subtítulos, transiciones y música autorizada. Se exporta de verdad en este navegador (${mime ? 'formato ' + mime.split(';')[0] : 'este navegador no puede grabar vídeo'}). Cierre siempre con la animación del logo.</p>
      <div class="row">${[['story', 'Reel / story 9:16'], ['square', 'Cuadrado 1:1'], ['landscape', 'Horizontal 16:9']].map(([k, l]) => html`<button class="btn" onClick=${() => setEditing({ creative: null, doc: newVideoDoc(k) })}><${Icon} name="video" size=${15} />${l}</button>`)}</div>
      <div class="row small"><span class="muted">Empezar con guion:</span>${Object.entries(GUIONES).map(([k, v]) => html`<button class="chip" onClick=${() => { const d = newVideoDoc('story'); d.script = k; d.scenes = v.map((t) => ({ ...newScene(), text: t })); setEditing({ creative: null, doc: d }); }}>${k}</button>`)}</div>
    </section>
    <section class="card"><h2>Vídeos guardados</h2>${videos.length ? html`<div class="list">${videos.map((c) => html`<div class="li" key=${c.id} onClick=${() => open(c)}><${Icon} name="video" />
      <div class="body"><div class="title">${c.title}</div><div class="sub">v${c.current_version} · ${c.width}×${c.height} · ${fmt.rel(c.updated_at)}</div></div><span class="btn sm">Abrir</span></div>`)}</div>` : html`<p class="empty">Aún no hay vídeos.</p>`}</section></div>`;
}

function VideoEditor({ initial, onExit }) {
  const st = useStore();
  const [doc, setDoc] = useState(initial.doc);
  const [creative, setCreative] = useState(initial.creative);
  const [title, setTitle] = useState(initial.creative?.title || 'Reel ' + new Date().toLocaleDateString('es-ES'));
  const [postId, setPostId] = useState(initial.creative?.post_id || '');
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(''); const [progress, setProgress] = useState(0);
  const canvas = useRef(); const raf = useRef(); const media = useRef(null);
  const total = totalDuration(doc);
  const scale = Math.min(320 / doc.width, 520 / doc.height);
  const upd = (i, patch) => setDoc({ ...doc, scenes: doc.scenes.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  async function still(t = 0) { media.current = await prepare(doc); const c = canvas.current; if (!c) return; c.width = doc.width; c.height = doc.height; drawAt(c.getContext('2d'), doc, media.current, t); }
  useEffect(() => { still(0); }, [doc]);
  async function play() {
    if (playing) { cancelAnimationFrame(raf.current); setPlaying(false); return; }
    media.current = await prepare(doc); const ctx = canvas.current.getContext('2d'); const t0 = performance.now(); setPlaying(true);
    media.current.items.forEach((el) => el && el.tagName === 'VIDEO' && (el.currentTime = 0, el.play().catch(() => {})));
    const tick = () => { const t = (performance.now() - t0) / 1000; if (t >= total) { setPlaying(false); return; } drawAt(ctx, doc, media.current, t); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
  }
  async function addMedia(i) {
    const files = await pickFiles({ title: 'Foto o vídeo para la escena', multiple: i == null, defaultTab: 'upload' });
    const ok = files.filter((f) => f.source === 'storage' && /^(image|video)\//.test(f.mime_type || ''));
    if (files.length && !ok.length) { toastError(new Error('Para el vídeo hay que subir el archivo (foto o vídeo) a la app: los enlaces de Drive no se pueden grabar en el navegador.')); return; }
    const mk = (f) => ({ ref: { kind: 'storage', path: f.storage_path }, type: /^video/.test(f.mime_type) ? 'video' : 'image', name: f.name });
    if (i == null) setDoc({ ...doc, scenes: [...doc.scenes.filter((s) => s.media || s.text), ...ok.map((f) => ({ ...newScene(), media: mk(f) }))] });
    else upd(i, { media: mk(ok[0]) });
  }
  async function addMusic() {
    const files = await pickFiles({ title: 'Música autorizada (MP3/M4A)', multiple: false, defaultTab: 'upload' });
    const f = files[0]; if (!f) return;
    if (f.source !== 'storage' || !/^audio\//.test(f.mime_type || '')) { toastError(new Error('Sube un archivo de audio (MP3, M4A, WAV).')); return; }
    if (!(await confirmDialog({ title: 'Música', body: 'Confirma que tienes derechos para usar esta música (Instagram puede silenciar audio con copyright). Lo habitual en 5mentarios es exportar sin música y que el responsable ponga el audio en tendencia en Instagram.', ok: 'Tengo derechos, añadir' }))) return;
    setDoc({ ...doc, music: { ref: { kind: 'storage', path: f.storage_path }, name: f.name } });
  }
  const move = (i, d) => { const a = [...doc.scenes]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setDoc({ ...doc, scenes: a }); };

  async function save(exp) {
    setBusy(exp ? 'Grabando el vídeo en tiempo real…' : 'Guardando…'); setProgress(0);
    try {
      let c = creative || { ...(await createCreative({ title, category: 'video', format: 'video', width: doc.width, height: doc.height, pages: doc.scenes.length, post_id: postId || null })), creative_versions: [] };
      if (creative && creative.title !== title) c = { ...c, ...(await updateCreative(c.id, { title })) };
      let exports = [];
      if (exp) {
        const r = await exportVideo(doc, { onProgress: setProgress });
        exports = [{ blob: r.blob, page: 1, scale: 1, width: doc.width, height: doc.height, name: `reel-${doc.width}x${doc.height}.${r.ext}` }];
        downloadBlob(r.blob, `${title.replace(/\W+/g, '-')}.${r.ext}`);
      }
      // la miniatura del vídeo es el primer fotograma
      const thumb = { v: 1, width: doc.width, height: doc.height, pages: [{ id: 'p', bg: '#050806', layers: [] }] };
      const m = await prepare(doc); const cv = document.createElement('canvas'); cv.width = doc.width; cv.height = doc.height; drawAt(cv.getContext('2d'), doc, m, Math.min(0.5, total));
      thumb.pages[0].layers.push({ id: 'i', type: 'image', x: 0, y: 0, w: doc.width, h: doc.height, ref: { kind: 'url', url: cv.toDataURL('image/jpeg', 0.8) }, visible: true, opacity: 1, rotation: 0 });
      const v = await saveVersion({ ...c }, doc, { previewDoc: thumb, note: exp ? `Vídeo exportado (${exports[0].name.split('.').pop().toUpperCase()}, ${total.toFixed(1)} s)` : 'Guion y escenas', exports });
      const nc = { ...c, current_version: v.version_no }; setCreative(nc);
      if (exp) { await addToLibrary(nc, v); if (postId) { await linkToPost(nc, v, postId, {}); toast('Vídeo vinculado a la publicación'); } }
      toast(exp ? 'Vídeo exportado y guardado' : 'Guardado', `Versión ${v.version_no}`);
    } catch (e) { toastError(e); } finally { setBusy(''); }
  }
  return html`<div class="stack" style="gap:14px">
    <div class="row"><button class="btn ghost sm" onClick=${onExit}><${Icon} name="chevL" size=${15} />Vídeos</button>
      <input class="input" style="max-width:320px" value=${title} onInput=${(e) => setTitle(e.target.value)} />
      <span class="small muted">${doc.width}×${doc.height} · ${total.toFixed(1)} s</span><div class="grow"></div>
      ${busy ? html`<span class="small">${busy} ${progress ? Math.round(progress * 100) + '%' : ''}</span>` : null}
      <button class="btn sm" disabled=${!!busy} onClick=${() => save(false)}>Guardar</button>
      <button class="btn primary sm" disabled=${!!busy || !pickMime()} onClick=${() => save(true)}><${Icon} name="download" size=${15} />Exportar vídeo</button></div>
    <div class="video-grid">
      <div class="stack">
        <section class="card stack"><h2>Guion</h2><textarea class="input" rows="3" placeholder="Idea, gancho y planos…" value=${doc.script} onInput=${(e) => setDoc({ ...doc, script: e.target.value })}></textarea></section>
        <section class="card stack"><h2 class="card-title">Escenas<button class="btn sm" style="margin-left:auto" onClick=${() => addMedia(null)}><${Icon} name="upload" size=${14} />Añadir fotos/vídeos</button></h2>
          ${doc.scenes.map((s, i) => html`<div class="scene" key=${s.id}>
            <div class="row nowrap"><b class="small">Escena ${i + 1}</b><span class="xs muted ellipsis">${s.media ? (s.media.type === 'video' ? '🎬 ' : '🖼 ') + s.media.name : 'sin foto/vídeo'}</span><div class="grow"></div>
              <button class="btn ghost sm" onClick=${() => move(i, -1)}>↑</button><button class="btn ghost sm" onClick=${() => move(i, 1)}>↓</button>
              <button class="btn ghost sm" onClick=${() => setDoc({ ...doc, scenes: doc.scenes.filter((_, j) => j !== i) })}>×</button></div>
            <div class="form-grid">
              <label class="field"><span>Texto grande</span><input class="input" value=${s.text} onInput=${(e) => upd(i, { text: e.target.value })} /></label>
              <label class="field"><span>Subtítulo</span><input class="input" value=${s.sub} onInput=${(e) => upd(i, { sub: e.target.value })} /></label>
              <label class="field"><span>Duración (s)</span><input class="input" type="number" min="0.5" max="15" step="0.5" value=${s.duration} onInput=${(e) => upd(i, { duration: Number(e.target.value) })} /></label>
              <label class="field"><span>Transición de entrada</span><select class="input" value=${s.transition} onChange=${(e) => upd(i, { transition: e.target.value })}><option value="cut">Corte</option><option value="fade">Fundido</option><option value="slide">Deslizar</option></select></label></div>
            <div class="row"><button class="btn sm" onClick=${() => addMedia(i)}>${s.media ? 'Cambiar foto/vídeo' : 'Añadir foto/vídeo'}</button>
              <label class="row small"><input type="checkbox" checked=${s.zoom} onChange=${(e) => upd(i, { zoom: e.target.checked })} />Zoom suave</label></div></div>`)}
          <button class="btn sm" onClick=${() => setDoc({ ...doc, scenes: [...doc.scenes, newScene()] })}>+ Escena</button>
          <label class="row small"><input type="checkbox" checked=${doc.outro} onChange=${(e) => setDoc({ ...doc, outro: e.target.checked })} />Cierre con la animación del logo (${OUTRO} s) — regla de la marca</label>
        </section>
        <section class="card stack"><h2>Música</h2>${doc.music ? html`<div class="row small">🎵 ${doc.music.name}<button class="btn sm ghost" onClick=${() => setDoc({ ...doc, music: null })}>Quitar</button></div>` : html`<p class="small muted" style="margin:0">Sin música (recomendado: el audio en tendencia se pone en Instagram).</p>`}
          <button class="btn sm" style="align-self:flex-start" onClick=${addMusic}>Añadir música autorizada</button></section>
        <section class="card stack"><h2>Publicación</h2><select class="input" value=${postId} onChange=${(e) => setPostId(e.target.value)}><option value="">Sin vincular</option>
          ${st.posts.filter((p) => ['reel', 'story', 'post', 'carousel', 'event'].includes(p.kind) && p.status !== 'published').map((p) => html`<option value=${p.id}>${p.starts_at ? fmt.date(p.starts_at) + ' · ' : ''}${p.title}</option>`)}</select>
          <span class="xs muted">Al exportar, el vídeo se añade como nueva versión del diseño de esa publicación (y a la biblioteca).</span></section>
      </div>
      <div class="stack" style="align-items:center">
        <canvas ref=${canvas} style=${{ width: doc.width * scale + 'px', height: doc.height * scale + 'px', borderRadius: '12px', background: '#000' }}></canvas>
        <button class="btn" onClick=${play}>${playing ? '■ Parar' : '▶ Vista previa'}</button>
        ${busy && progress ? html`<div style="width:100%;height:8px;background:var(--line);border-radius:4px"><div style=${{ width: progress * 100 + '%', height: '100%', background: 'var(--verde)', borderRadius: '4px' }}></div></div>` : null}
      </div>
    </div></div>`;
}

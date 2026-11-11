// Adjuntos y medios: miniaturas, previsualización, selector de archivos (Drive, biblioteca, subida, enlace).
import { html, useState, useEffect, Icon, openModal, ModalHead, toastError, fmt } from './ui.js';
import { getState, useStore, signedUrl, uploadFile } from './store.js';
import {
  driveConfigured, driveConnected, connectDrive, listFolder, searchDrive, driveThumb, driveView, drivePreview,
  driveFolderUrl, isFolder, driveRef
} from './drive.js';

export const isImage = (m) => /^image\//.test(m || '') && !/photoshop|psd/.test(m || '');
export const isVideo = (m) => /^video\//.test(m || '');
export const fileIcon = (m) => (isImage(m) ? 'image' : isVideo(m) ? 'video' : /folder/.test(m || '') ? 'folder' : 'file');
export const openUrl = (a) => a.source === 'drive' ? (a.web_url || driveView(a.drive_file_id)) : a.web_url;

function StorageImg({ path, alt }) {
  const [url, setUrl] = useState(null);
  useEffect(() => { let on = true; signedUrl(path).then((u) => on && setUrl(u)).catch(() => {}); return () => { on = false; }; }, [path]);
  return url ? html`<img src=${url} alt=${alt} loading="lazy" />` : html`<${Icon} name="image" size=${22} />`;
}
function DriveImg({ id, alt, w = 400 }) {
  const [err, setErr] = useState(false);
  return html`<${Icon} name="image" size=${22} />${err ? null : html`<img src=${driveThumb(id, w)} alt=${alt} loading="lazy" referrerpolicy="no-referrer" onError=${() => setErr(true)} />`}`;
}
export function Thumb({ a, w = 400 }) {
  if (a.source === 'drive' && a.drive_file_id && (isImage(a.mime_type) || isVideo(a.mime_type) || /pdf|photoshop/.test(a.mime_type || '')))
    return html`<${DriveImg} id=${a.drive_file_id} alt=${a.name} w=${w} />`;
  if (a.source === 'storage' && isImage(a.mime_type)) return html`<${StorageImg} path=${a.storage_path} alt=${a.name} />`;
  return html`<${Icon} name=${a.source === 'link' ? 'link' : fileIcon(a.mime_type)} size=${22} />`;
}

export function MediaCard({ a, onClick, selected, extra }) {
  return html`<div class=${'media' + (selected ? ' sel' : '')} onClick=${onClick || (() => openPreview(a))} title=${a.name}>
    <div class="thumb"><${Thumb} a=${a} /></div>
    ${isVideo(a.mime_type) ? html`<span class="kind">VÍDEO</span>` : null}
    <div class="cap"><b>${a.name}</b><span class="muted xs">${a.source === 'drive' ? 'Google Drive' : a.source === 'storage' ? 'Subido a la app' : 'Enlace'}${extra ? ' · ' + extra : ''}</span></div>
  </div>`;
}

export function AttachmentRow({ a, onRemove }) {
  return html`<div class="att-row">
    <div class="thumb-sm" onClick=${() => openPreview(a)} style="cursor:pointer"><${Thumb} a=${a} w=${120} /></div>
    <div style="flex:1;min-width:0"><div class="ellipsis" style="font-weight:600">${a.name}</div>
      <div class="muted xs">${a.source === 'drive' ? 'Google Drive' : a.source === 'storage' ? 'Archivo subido' : 'Enlace'}${a.created_at ? ' · ' + fmt.rel(a.created_at) : ''}</div></div>
    <button class="btn ghost icon sm" title="Ver" onClick=${() => openPreview(a)}><${Icon} name="eye" size=${16} /></button>
    ${onRemove ? html`<button class="btn ghost icon sm" title="Quitar" onClick=${onRemove}><${Icon} name="trash" size=${16} /></button>` : null}
  </div>`;
}

export function openPreview(a) {
  openModal((close) => {
    const Comp = () => {
      const [url, setUrl] = useState(a.source === 'link' ? a.web_url : null);
      useEffect(() => { if (a.source === 'storage') signedUrl(a.storage_path).then(setUrl).catch(toastError); }, []);
      let body;
      if (a.source === 'drive') body = html`<iframe class="preview-frame" src=${drivePreview(a.drive_file_id)} allow="autoplay; fullscreen" title=${a.name}></iframe>
        <p class="muted xs">Si no ves la vista previa, inicia sesión en Google con una cuenta que tenga acceso a la carpeta o ábrelo en Drive.</p>`;
      else if (a.source === 'storage' && url && isImage(a.mime_type)) body = html`<img class="preview-img" src=${url} alt=${a.name} />`;
      else if (a.source === 'storage' && url && isVideo(a.mime_type)) body = html`<video src=${url} controls playsinline style="width:100%;max-height:70vh;border-radius:12px;background:#000"></video>`;
      else body = html`<p class="muted">Vista previa no disponible para este tipo de archivo.</p>`;
      const openHref = a.source === 'drive' ? driveView(a.drive_file_id) : url;
      return html`<${ModalHead} title=${a.name} close=${close}>
          ${openHref ? html`<a class="btn sm" href=${openHref} target="_blank" rel="noopener"><${Icon} name="external" size=${15} />${a.source === 'drive' ? 'Abrir en Drive' : 'Abrir original'}</a>` : null}
        </${ModalHead}><div class="modal-body">${body}</div>`;
    };
    return html`<${Comp} />`;
  }, { size: 'wide' });
}

// ---------- Explorador de Google Drive ----------
export function DriveBrowser({ selectable, selected = [], onToggle, onOpenFile, rootId, actions }) {
  const st = useStore();
  const drive = st.settings.drive || {};
  const root = rootId || drive.root_folder_id;
  const [path, setPath] = useState([{ id: root, name: drive.root_folder_name || 'Drive' }]);
  const [files, setFiles] = useState(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const connected = st.driveConnected ?? driveConnected();
  const cur = path[path.length - 1];

  async function load(fn) {
    setLoading(true); setErr(null);
    try { const r = await fn(); setFiles(r.files || []); } catch (e) { setErr(e.message); setFiles([]); } finally { setLoading(false); }
  }
  useEffect(() => { if (connected && cur?.id && !q) load(() => listFolder(cur.id)); }, [connected, cur?.id]);

  if (!driveConfigured()) return html`<${DriveSetupHelp} />`;
  if (!root) return html`<p class="empty">Configura la carpeta raíz de Drive en Ajustes → Google Drive.</p>`;
  if (!connected) return html`<div class="empty big stack" style="align-items:center">
    <${Icon} name="drive" size=${40} />
    <p style="margin:0">Conecta tu cuenta de Google para ver la carpeta <b>${drive.root_folder_name || ''}</b> sin salir de la app.</p>
    <button class="btn primary" onClick=${() => connectDrive().catch(toastError)}><${Icon} name="drive" />Conectar Google Drive</button>
    <p class="xs muted" style="max-width:460px">La app solo pide permiso de lectura. Los archivos siguen en Drive: aquí solo se guardan referencias.</p></div>`;

  const shown = (files || []).filter((f) => filter === 'all' || isFolder(f) || (filter === 'image' ? isImage(f.mimeType) : filter === 'video' ? isVideo(f.mimeType) : !isImage(f.mimeType) && !isVideo(f.mimeType)));
  const doSearch = (e) => { e.preventDefault(); if (q.trim()) load(() => searchDrive(q.trim())); else load(() => listFolder(cur.id)); };

  return html`<div class="stack">
    <div class="toolbar" style="margin:0">
      <form onSubmit=${doSearch} class="row" style="flex:1;min-width:220px"><input class="input" style="flex:1" placeholder="Buscar en Drive…" value=${q} onInput=${(e) => setQ(e.target.value)} />
        <button class="btn sm"><${Icon} name="search" size=${15} /></button></form>
      <div class="seg">${[['all', 'Todo'], ['image', 'Fotos'], ['video', 'Vídeos'], ['other', 'Diseños/otros']].map(([k, l]) => html`<button class=${filter === k ? 'on' : ''} onClick=${() => setFilter(k)}>${l}</button>`)}</div>
      ${(drive.shortcuts || []).length ? html`<select class="input" onChange=${(e) => { const s = drive.shortcuts.find((x) => x.id === e.target.value); if (s) { setQ(''); setPath([{ id: root, name: drive.root_folder_name }, s]); } }}>
        <option value="">Accesos directos…</option>${drive.shortcuts.map((s) => html`<option value=${s.id}>${s.name}</option>`)}</select>` : null}
      <a class="btn sm ghost" href=${driveFolderUrl(cur.id)} target="_blank" rel="noopener"><${Icon} name="external" size=${15} />Abrir en Drive</a>
    </div>
    <div class="crumbs">${path.map((p, i) => html`${i ? html`<${Icon} name="chevR" size=${14} />` : null}<button onClick=${() => { setQ(''); setPath(path.slice(0, i + 1)); }}>${p.name}</button>`)}
      ${q ? html`<span class="muted"> · resultados de «${q}»</span>` : null}</div>
    ${err ? html`<p class="error-text">${err}</p>` : null}
    ${loading ? html`<p class="empty">Cargando archivos de Drive…</p>` : !shown.length ? html`<p class="empty">No hay archivos aquí.</p>` : html`
    <div class="media-grid">${shown.map((f) => isFolder(f)
      ? html`<div class="media" key=${f.id} onClick=${() => { setQ(''); setPath([...path, { id: f.id, name: f.name }]); }}>
          <div class="thumb"><${Icon} name="folder" size=${36} /></div><div class="cap"><b>${f.name}</b><span class="muted xs">Carpeta</span></div></div>`
      : html`<${MediaCard} key=${f.id} a=${{ ...driveRef(f) }} selected=${selected.some((s) => s.drive_file_id === f.id)}
          extra=${f.modifiedTime ? fmt.date(f.modifiedTime) : ''}
          onClick=${() => (selectable ? onToggle(driveRef(f)) : onOpenFile ? onOpenFile(f) : openPreview(driveRef(f)))} />`)}</div>`}
    ${actions || null}
  </div>`;
}

export function DriveSetupHelp() {
  return html`<div class="card stack"><h2><${Icon} name="drive" />Google Drive aún no está conectado</h2>
    <p style="margin:0">Para ver la carpeta de Drive desde la app falta crear un <b>ID de cliente OAuth</b> en Google Cloud y pegarlo en <code>config.js</code> (<code>googleClientId</code>). Los pasos exactos están en el README del proyecto (apartado «Google Drive»).</p>
    <p class="muted small" style="margin:0">Mientras tanto puedes adjuntar archivos subiéndolos o pegando el enlace de Drive.</p></div>`;
}

// ---------- Selector de archivos ----------
export function pickFiles({ title = 'Añadir archivos', multiple = true, defaultTab } = {}) {
  return new Promise((resolve) => {
    openModal((close) => {
      const Comp = () => {
        const st = useStore();
        const [tab, setTab] = useState(defaultTab || (driveConfigured() ? 'drive' : 'upload'));
        const [sel, setSel] = useState([]);
        const [busy, setBusy] = useState(false);
        const [link, setLink] = useState({ url: '', name: '' });
        const done = (v) => { close(); resolve(v); };
        const toggle = (ref) => setSel((s) => (s.some((x) => key(x) === key(ref)) ? s.filter((x) => key(x) !== key(ref)) : multiple ? [...s, ref] : [ref]));
        const key = (r) => r.drive_file_id || r.storage_path || r.web_url;
        async function onUpload(e) {
          const files = [...e.target.files];
          if (!files.length) return;
          setBusy(true);
          try { const refs = []; for (const f of files) refs.push(await uploadFile(f)); done(refs); } catch (err) { toastError(err); } finally { setBusy(false); }
        }
        function addLink() {
          let u = link.url.trim();
          if (!/^https?:\/\//.test(u)) { toastError(new Error('El enlace debe empezar por https://')); return; }
          const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
          done([m ? { source: 'drive', drive_file_id: m[1], name: link.name || 'Archivo de Drive', web_url: u, mime_type: null }
            : { source: 'link', web_url: u, name: link.name || u.replace(/^https?:\/\//, '').slice(0, 60), mime_type: null }]);
        }
        const libItems = st.libraryItems;
        return html`<${ModalHead} title=${title} close=${() => done([])} />
          <div class="modal-body stack">
            <div class="seg" style="align-self:flex-start">
              ${[['drive', 'Google Drive'], ['library', 'Biblioteca'], ['upload', 'Subir archivo'], ['link', 'Enlace']].map(([k, l]) => html`<button class=${tab === k ? 'on' : ''} onClick=${() => setTab(k)}>${l}</button>`)}
            </div>
            ${tab === 'drive' ? html`<${DriveBrowser} selectable selected=${sel} onToggle=${toggle} />` : null}
            ${tab === 'library' ? (libItems.length ? html`<div class="media-grid">${libItems.map((it) => html`<${MediaCard} key=${it.id} a=${it} selected=${sel.some((s) => key(s) === key(it))}
                onClick=${() => toggle({ source: it.source, drive_file_id: it.drive_file_id, storage_path: it.storage_path, web_url: it.web_url, name: it.name, mime_type: it.mime_type, size_bytes: it.size_bytes, library_item_id: it.id })} />`)}</div>`
              : html`<p class="empty">La biblioteca está vacía. Añade archivos desde Biblioteca → Google Drive.</p>`) : null}
            ${tab === 'upload' ? html`<label class="card stack" style="align-items:center;text-align:center;border-style:dashed;cursor:pointer">
                <${Icon} name="upload" size=${32} /><b>${busy ? 'Subiendo…' : 'Elige fotos, vídeos o documentos'}</b>
                <span class="muted small">Máximo 50 MB por archivo. Para vídeos grandes, mejor súbelos a Drive y adjúntalos desde allí.</span>
                <input type="file" multiple=${multiple} hidden disabled=${busy} onChange=${onUpload} /></label>` : null}
            ${tab === 'link' ? html`<div class="stack"><label class="field"><span>Enlace</span><input class="input" placeholder="https://drive.google.com/… o cualquier URL" value=${link.url} onInput=${(e) => setLink({ ...link, url: e.target.value })} /></label>
                <label class="field"><span>Nombre (opcional)</span><input class="input" value=${link.name} onInput=${(e) => setLink({ ...link, name: e.target.value })} /></label>
                <button class="btn primary" style="align-self:flex-start" onClick=${addLink}>Añadir enlace</button></div>` : null}
          </div>
          ${tab === 'drive' || tab === 'library' ? html`<div class="modal-foot"><span class="muted small" style="margin-right:auto">${sel.length} seleccionado(s)</span>
            <button class="btn ghost" onClick=${() => done([])}>Cancelar</button><button class="btn primary" disabled=${!sel.length} onClick=${() => done(sel)}>Añadir</button></div>` : null}`;
      };
      return html`<${Comp} />`;
    }, { size: 'wide' });
  });
}

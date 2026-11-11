// Biblioteca de contenido: categorías propias + explorador de la carpeta de Google Drive.
import { html, useState, Icon, ModalHead, openModal, confirmDialog, toast, toastError, fmt } from '../lib/ui.js';
import { useStore, sb, check, getState } from '../lib/store.js';
import { DriveBrowser, MediaCard, Thumb, openPreview, pickFiles, isImage, isVideo } from '../lib/media.js';
import { driveRef, driveView } from '../lib/drive.js';

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'categoria';

async function addToLibrary(refs, categoryId) {
  const rows = refs.map((r) => ({ category_id: categoryId, source: r.source, drive_file_id: r.drive_file_id || null, storage_path: r.storage_path || null,
    name: r.name, mime_type: r.mime_type || null, web_url: r.web_url || null, size_bytes: r.size_bytes || null }));
  const drive = rows.filter((r) => r.drive_file_id), other = rows.filter((r) => !r.drive_file_id);
  if (drive.length) check(await sb.from('library_items').upsert(drive, { onConflict: 'drive_file_id,category_id', ignoreDuplicates: true }));
  if (other.length) check(await sb.from('library_items').insert(other));
}

async function attachToPost(ref) {
  const st = getState();
  const posts = st.posts.filter((p) => p.status !== 'published');
  return new Promise((resolve) => openModal((close) => {
    const C = () => {
      const [q, setQ] = useState('');
      const list = posts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())).slice(0, 60);
      const pick = async (p) => {
        try {
          check(await sb.from('attachments').insert({ ...refFields(ref), post_id: p.id, role: isVideo(ref.mime_type) ? 'video' : isImage(ref.mime_type) ? 'photo' : 'file' }));
          toast('Adjuntado', `«${ref.name}» → ${p.title}`); close(); resolve(true);
        } catch (e) { toastError(e); }
      };
      return html`<${ModalHead} title="Adjuntar a una publicación" close=${() => { close(); resolve(false); }} />
        <div class="modal-body stack"><input class="input" placeholder="Buscar publicación…" value=${q} onInput=${(e) => setQ(e.target.value)} autofocus />
          <div class="list">${list.map((p) => html`<div class="li" onClick=${() => pick(p)} key=${p.id}><div class="when"><b>${p.starts_at ? fmt.date(p.starts_at) : '—'}</b></div>
            <div class="body"><div class="title">${p.title}</div></div></div>`)}</div></div>`;
    };
    return html`<${C} />`;
  }));
}
const refFields = (r) => ({ source: r.source, drive_file_id: r.drive_file_id || null, storage_path: r.storage_path || null, name: r.name, mime_type: r.mime_type || null, web_url: r.web_url || null, size_bytes: r.size_bytes || null, library_item_id: r.library_item_id || null });

function itemActions(ref, { item } = {}) {
  openModal((close) => {
    const C = () => {
      const st = useStore();
      const [cat, setCat] = useState(item?.category_id || st.categories[0]?.id);
      return html`<${ModalHead} title=${ref.name} close=${close} />
        <div class="modal-body stack">
          <div style="max-width:320px;margin:0 auto;width:100%"><${MediaCard} a=${ref} /></div>
          <div class="row" style="justify-content:center">
            <button class="btn" onClick=${() => openPreview(ref)}><${Icon} name="eye" size=${16} />Ver</button>
            ${ref.source === 'drive' ? html`<a class="btn" href=${driveView(ref.drive_file_id)} target="_blank" rel="noopener"><${Icon} name="external" size=${16} />Abrir original en Drive</a>` : null}
            <button class="btn" onClick=${() => attachToPost({ ...ref, library_item_id: item?.id }).then((ok) => ok && close())}><${Icon} name="clip" size=${16} />Adjuntar a publicación</button>
          </div>
          <hr class="sep" />
          <label class="field"><span>${item ? 'Mover a la categoría' : 'Guardar en la biblioteca, categoría'}</span>
            <div class="row nowrap"><select class="input" value=${cat} onChange=${(e) => setCat(e.target.value)}>${st.categories.map((c) => html`<option value=${c.id}>${c.name}</option>`)}</select>
              <button class="btn primary" onClick=${async () => {
                try {
                  if (item) check(await sb.from('library_items').update({ category_id: cat }).eq('id', item.id));
                  else await addToLibrary([ref], cat);
                  toast(item ? 'Movido' : 'Añadido a la biblioteca'); close();
                } catch (e) { toastError(e); }
              }}>${item ? 'Mover' : 'Guardar'}</button></div></label>
          ${item ? html`<label class="field"><span>Notas</span><textarea class="input" value=${item.notes || ''} onBlur=${async (e) => { try { check(await sb.from('library_items').update({ notes: e.target.value }).eq('id', item.id)); } catch (er) { toastError(er); } }}></textarea></label>
            <button class="btn danger" style="align-self:flex-start" onClick=${async () => {
              if (!(await confirmDialog({ title: 'Quitar de la biblioteca', body: 'Se quita la referencia. El archivo original en Drive NO se borra.', ok: 'Quitar', danger: true }))) return;
              try { check(await sb.from('library_items').delete().eq('id', item.id)); close(); } catch (e) { toastError(e); }
            }}><${Icon} name="trash" size=${16} />Quitar de la biblioteca</button>` : null}
        </div>`;
    };
    return html`<${C} />`;
  });
}

export function LibraryView() {
  const st = useStore();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const canManage = st.me.is_admin || st.me.role === 'marketing';
  const counts = Object.fromEntries(st.categories.map((c) => [c.id, st.libraryItems.filter((i) => i.category_id === c.id).length]));
  const items = st.libraryItems.filter((i) => (tab === 'all' || i.category_id === tab) && (!q || i.name.toLowerCase().includes(q.toLowerCase()) || (i.notes || '').toLowerCase().includes(q.toLowerCase()))
    && (!type || (type === 'image' ? isImage(i.mime_type) : type === 'video' ? isVideo(i.mime_type) : !isImage(i.mime_type) && !isVideo(i.mime_type))));
  async function newCategory() {
    const name = await confirmDialog({ title: 'Nueva categoría', ok: 'Crear', input: { label: 'Nombre', required: true, placeholder: 'Ej.: Conciertos' } });
    if (!name) return;
    try { check(await sb.from('library_categories').insert({ name: name.trim(), slug: slugify(name) + '-' + Date.now().toString(36).slice(-4), sort: 200 })); toast('Categoría creada'); } catch (e) { toastError(e); }
  }
  async function renameCategory(c) {
    const name = await confirmDialog({ title: 'Renombrar categoría', ok: 'Guardar', input: { label: 'Nombre', value: c.name, required: true } });
    if (!name) return;
    try { check(await sb.from('library_categories').update({ name: name.trim() }).eq('id', c.id)); } catch (e) { toastError(e); }
  }
  async function deleteCategory(c) {
    if (!(await confirmDialog({ title: 'Eliminar categoría', body: `Los ${counts[c.id]} elementos de «${c.name}» quedarán sin categoría (no se borra nada de Drive).`, ok: 'Eliminar', danger: true }))) return;
    try { check(await sb.from('library_categories').delete().eq('id', c.id)); setTab('all'); } catch (e) { toastError(e); }
  }
  async function upload() {
    const refs = await pickFiles({ title: 'Añadir a la biblioteca', defaultTab: 'upload' });
    if (!refs.length) return;
    try { await addToLibrary(refs, tab !== 'all' && tab !== 'drive' ? tab : st.categories[0]?.id); toast(`${refs.length} archivo(s) añadidos`); } catch (e) { toastError(e); }
  }
  const cat = st.categories.find((c) => c.id === tab);

  return html`
    <div class="page-head"><div><h1>Biblioteca</h1><p>Los originales siguen en Google Drive; aquí se organizan por categorías sin duplicar archivos.</p></div>
      <div class="actions"><button class="btn" onClick=${newCategory}><${Icon} name="plus" />Categoría</button><button class="btn primary" onClick=${upload}><${Icon} name="upload" />Añadir archivos</button></div></div>
    <div class="lib-layout">
      <nav class="cat-list" aria-label="Categorías">
        <button class=${tab === 'drive' ? 'on' : ''} onClick=${() => setTab('drive')}><${Icon} name="drive" />Google Drive</button>
        <button class=${tab === 'all' ? 'on' : ''} onClick=${() => setTab('all')}><${Icon} name="grid" />Todo<span class="badge">${st.libraryItems.length}</span></button>
        ${st.categories.map((c) => html`<button key=${c.id} class=${tab === c.id ? 'on' : ''} onClick=${() => setTab(c.id)}><${Icon} name=${c.icon} />${c.name}<span class="badge">${counts[c.id] || 0}</span></button>`)}
      </nav>
      <div class="stack" style="min-width:0">
        ${tab === 'drive' ? html`<div class="card"><${DriveBrowser} onOpenFile=${(f) => itemActions(driveRef(f))} /></div>` : html`
          <div class="toolbar" style="margin:0"><input class="input" style="flex:1;min-width:180px" placeholder="Buscar en la biblioteca…" value=${q} onInput=${(e) => setQ(e.target.value)} />
            <div class="seg">${[['', 'Todo'], ['image', 'Fotos'], ['video', 'Vídeos'], ['other', 'Diseños/otros']].map(([k, l]) => html`<button class=${type === k ? 'on' : ''} onClick=${() => setType(k)}>${l}</button>`)}</div>
            ${cat && canManage ? html`<button class="btn sm ghost" onClick=${() => renameCategory(cat)}><${Icon} name="edit" size=${14} />Renombrar</button><button class="btn sm ghost" onClick=${() => deleteCategory(cat)}><${Icon} name="trash" size=${14} /></button>` : null}</div>
          ${items.length ? html`<div class="media-grid">${items.map((i) => html`<${MediaCard} key=${i.id} a=${i} extra=${st.categories.find((c) => c.id === i.category_id)?.name || ''} onClick=${() => itemActions(i, { item: i })} />`)}</div>`
            : html`<div class="empty big">No hay archivos ${cat ? 'en «' + cat.name + '»' : 'en la biblioteca'}.<br /><span class="small">Abre <b>Google Drive</b> en el menú de la izquierda, elige un archivo y guárdalo en una categoría, o súbelo con «Añadir archivos».</span></div>`}`}
      </div>
    </div>`;
}

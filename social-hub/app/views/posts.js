// Publicaciones: listado con filtros, ficha completa (versiones, aprobación, comentarios, historial) y formulario.
import {
  html, useState, useEffect, Icon, Avatar, StatusPill, ModalHead, openModal, confirmDialog, toast, toastError, fmt, dayKey,
  STATUS, STATUS_LABEL, KINDS, KIND_LABEL, KIND_ICON, CONTENT_KINDS, PLATFORMS, PLATFORM_LABEL, FORMATS, toLocalInput, fromLocalInput, Linkify, statusColor
} from '../lib/ui.js';
import { useStore, sb, check, go, profileById, getState, onRealtime } from '../lib/store.js';
import { pickFiles, AttachmentRow, MediaCard } from '../lib/media.js';
import { PostLine, TaskLine } from './dashboard.js';
import { openTaskForm } from './tasks.js';
import { CommentsThread } from './comments.js';

// ---------- Formulario ----------
export function openPostForm(initial = {}, existing = null) {
  openModal((close) => html`<${PostForm} initial=${initial} existing=${existing} close=${close} />`, { size: 'wide', sticky: true });
}

function PostForm({ initial, existing, close }) {
  const st = useStore();
  const base = existing || {
    kind: 'post', title: '', description: '', starts_at: null, all_day: false, deadline: null, platforms: ['instagram'], format: '',
    objective: '', copy: '', hashtags: '', cta: '', material: '', status: 'idea', assignee_id: st.me.role === 'marketing' ? st.me.id : (st.profiles.find((p) => p.role === 'marketing')?.id || null),
    requires_approval: true, pending_info: ''
  };
  const [v, setV] = useState({ ...base, ...initial, requires_approval: initial.requires_approval ?? (existing ? existing.requires_approval : CONTENT_KINDS.includes(initial.kind || base.kind)) });
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e });
  const isContent = CONTENT_KINDS.includes(v.kind);
  const allowedStatus = STATUS.filter(([k]) => existing ? true : !(v.requires_approval && ['approved', 'scheduled', 'published'].includes(k)));

  function validate(draft) {
    const e = {};
    if (!v.title.trim()) e.title = 'Pon un nombre.';
    if (!draft && !v.starts_at && v.status !== 'idea') e.starts_at = 'Indica fecha y hora (o guárdalo como borrador / idea).';
    if (v.deadline && v.starts_at && v.deadline > dayKey(v.starts_at)) e.deadline = 'La fecha límite es posterior a la publicación.';
    if (v.title.length > 200) e.title = 'Máximo 200 caracteres.';
    setErr(e); return !Object.keys(e).length;
  }
  async function save(draft) {
    if (!validate(draft)) return;
    setBusy(true);
    const row = {
      kind: v.kind, title: v.title.trim(), description: v.description || null, starts_at: v.starts_at, all_day: !!v.all_day, deadline: v.deadline || null,
      platforms: v.platforms, format: v.format || null, objective: v.objective || null, copy: v.copy || null, hashtags: v.hashtags || null, cta: v.cta || null,
      material: v.material || null, status: v.status, assignee_id: v.assignee_id || null, requires_approval: !!v.requires_approval,
      pending_info: v.pending_info || null, is_draft: !!draft
    };
    try {
      let saved;
      if (existing) saved = check(await sb.from('posts').update(row).eq('id', existing.id).select().single());
      else saved = check(await sb.from('posts').insert(row).select().single());
      if (files.length) {
        check(await sb.from('attachments').insert(files.map((f) => ({ ...f, post_id: saved.id, role: f.role || (/^video/.test(f.mime_type || '') ? 'video' : /^image/.test(f.mime_type || '') ? 'photo' : 'file') }))));
      }
      toast(draft ? 'Borrador guardado' : existing ? 'Cambios guardados' : 'Publicación creada', saved.title);
      close();
      if (!existing) go('#/publicaciones/' + saved.id);
    } catch (e) { toastError(e); } finally { setBusy(false); }
  }

  return html`<${ModalHead} title=${existing ? 'Editar · ' + existing.title : 'Nuevo elemento del calendario'} close=${close} />
  <div class="modal-body">
    <div class="form-grid">
      <label class="field full"><span>Tipo</span>
        <div class="chips">${KINDS.map(([k, l, i]) => html`<button type="button" class=${'chip' + (v.kind === k ? ' on' : '')}
          onClick=${() => setV({ ...v, kind: k, requires_approval: existing ? v.requires_approval : CONTENT_KINDS.includes(k), format: v.format || ({ reel: 'Reel 9:16', story: 'Story 9:16', carousel: 'Carrusel', weekly_poster: 'Post 4:5' }[k] || '') })}>
          <${Icon} name=${i} size=${13} /> ${l}</button>`)}</div></label>
      <label class="field full"><span>Nombre *</span><input class=${'input' + (err.title ? ' invalid' : '')} value=${v.title} onInput=${set('title')} placeholder="Ej.: Cartel semanal · finde 21-22 nov" maxlength="200" />
        ${err.title ? html`<span class="error-text">${err.title}</span>` : null}</label>
      <label class="field"><span>Fecha y hora</span><input class=${'input' + (err.starts_at ? ' invalid' : '')} type="datetime-local" value=${toLocalInput(v.starts_at)} onInput=${(e) => setV({ ...v, starts_at: fromLocalInput(e.target.value) })} />
        ${err.starts_at ? html`<span class="error-text">${err.starts_at}</span>` : null}
        <label class="row small muted"><input type="checkbox" checked=${v.all_day} onChange=${set('all_day')} /> Todo el día</label></label>
      <label class="field"><span>Fecha límite (preparación)</span><input class=${'input' + (err.deadline ? ' invalid' : '')} type="date" value=${v.deadline || ''} onInput=${set('deadline')} />
        ${err.deadline ? html`<span class="error-text">${err.deadline}</span>` : null}</label>
      <label class="field"><span>Estado</span><select class="input" value=${v.status} onChange=${set('status')}>${allowedStatus.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
        ${v.requires_approval && !existing ? html`<span class="hint">Aprobado/Programado/Publicado se alcanzan con el flujo de aprobación.</span>` : null}</label>
      <label class="field"><span>Responsable</span><select class="input" value=${v.assignee_id || ''} onChange=${set('assignee_id')}><option value="">Sin asignar</option>
        ${st.profiles.filter((p) => p.active).map((p) => html`<option value=${p.id}>${p.full_name}</option>`)}</select></label>
      <label class="field full"><span>Plataformas</span><div class="chips">${PLATFORMS.map(([k, l]) => html`<button type="button" class=${'chip' + (v.platforms.includes(k) ? ' on' : '')}
        onClick=${() => setV({ ...v, platforms: v.platforms.includes(k) ? v.platforms.filter((x) => x !== k) : [...v.platforms, k] })}>${l}</button>`)}</div></label>
      <label class="field"><span>Formato</span><input class="input" list="formats" value=${v.format || ''} onInput=${set('format')} /><datalist id="formats">${FORMATS.map((x) => html`<option value=${x} />`)}</datalist></label>
      <label class="field"><span>Objetivo</span><input class="input" value=${v.objective || ''} onInput=${set('objective')} placeholder="Ej.: llenar el viernes, alcance, comunidad…" /></label>
      <label class="field full"><span>Descripción / idea</span><textarea class="input" value=${v.description || ''} onInput=${set('description')}></textarea></label>
      ${isContent || v.copy ? html`
      <label class="field full"><span>Copy de la publicación</span><textarea class="input" style="min-height:130px" value=${v.copy || ''} onInput=${set('copy')} placeholder="Gancho en la primera línea…"></textarea>
        <span class="hint">${(v.copy || '').length} / 2.200 caracteres (límite de Instagram)</span></label>
      <label class="field"><span>Hashtags</span><input class="input" value=${v.hashtags || ''} onInput=${set('hashtags')} placeholder="#Arucas #GranCanaria #TardeoGranCanaria" /></label>
      <label class="field"><span>CTA (llamada a la acción)</span><input class="input" value=${v.cta || ''} onInput=${set('cta')} placeholder="Reserva tu mesa por DM" /></label>` : null}
      <label class="field full"><span>Material disponible / notas de material</span><input class="input" value=${v.material || ''} onInput=${set('material')} placeholder="Fotos del tardeo de Halloween (Drive), vídeo C0611…" /></label>
      <label class="field full"><span>Pendiente de confirmar</span><input class="input" value=${v.pending_info || ''} onInput=${set('pending_info')} placeholder="Ej.: artista y horario del sábado" /></label>
      <label class="row full small"><input type="checkbox" checked=${v.requires_approval} onChange=${set('requires_approval')} /> Requiere aprobación del propietario antes de programar/publicar</label>
      ${!existing ? html`<div class="field full"><span>Diseño, fotos y vídeos</span>
        <div class="stack">${files.map((f, i) => html`<${AttachmentRow} a=${f} onRemove=${() => setFiles(files.filter((_, j) => j !== i))} />`)}
          <button type="button" class="btn sm" style="align-self:flex-start" onClick=${async () => setFiles([...files, ...(await pickFiles({ title: 'Adjuntar a la publicación' }))])}><${Icon} name="clip" size=${15} />Adjuntar desde Drive, biblioteca o subir</button></div></div>` : null}
    </div>
  </div>
  <div class="modal-foot">
    <button class="btn ghost" onClick=${close}>Cancelar</button>
    <button class="btn" disabled=${busy} onClick=${() => save(true)}>Guardar borrador</button>
    <button class="btn primary" disabled=${busy} onClick=${() => save(false)}>${existing ? 'Guardar cambios' : 'Crear'}</button>
  </div>`;
}

// ---------- Listado ----------
export function PostsView({ query }) {
  const st = useStore();
  const [f, setF] = useState({ q: '', status: query.get('status') || '', kind: '', platform: '', assignee: '', from: '', to: '', drafts: false });
  const items = st.posts.filter((p) => {
    if (f.status && p.status !== f.status) return false;
    if (f.kind && p.kind !== f.kind) return false;
    if (f.platform && !(p.platforms || []).includes(f.platform)) return false;
    if (f.assignee && p.assignee_id !== f.assignee) return false;
    if (f.drafts && !p.is_draft) return false;
    if (f.from && (!p.starts_at || dayKey(p.starts_at) < f.from)) return false;
    if (f.to && (!p.starts_at || dayKey(p.starts_at) > f.to)) return false;
    if (f.q) { const s = (p.title + ' ' + (p.copy || '') + ' ' + (p.description || '') + ' ' + (p.hashtags || '')).toLowerCase(); if (!s.includes(f.q.toLowerCase())) return false; }
    return true;
  });
  const counts = Object.fromEntries(STATUS.map(([k]) => [k, st.posts.filter((p) => p.status === k).length]));
  const noDate = items.filter((p) => !p.starts_at);
  return html`
    <div class="page-head"><div><h1>Publicaciones</h1><p>${st.posts.length} elementos · ${counts.pending_approval} esperando aprobación</p></div>
      <div class="actions"><a class="btn" href="#/generador"><${Icon} name="sparkle" />Generar contenido</a><button class="btn primary" onClick=${() => openPostForm({})}><${Icon} name="plus" />Nueva publicación</button></div></div>
    <div class="chips" style="margin-bottom:12px">
      <button class=${'chip' + (!f.status ? ' on' : '')} onClick=${() => setF({ ...f, status: '' })}>Todas</button>
      ${STATUS.map(([k, l]) => html`<button class=${'chip' + (f.status === k ? ' on' : '')} onClick=${() => setF({ ...f, status: f.status === k ? '' : k })}>
        <span class="dot" style=${{ background: statusColor(k) }}></span> ${l} · ${counts[k]}</button>`)}
    </div>
    <div class="toolbar">
      <input class="input" style="flex:1;min-width:200px" placeholder="Buscar por nombre, copy, hashtags…" value=${f.q} onInput=${(e) => setF({ ...f, q: e.target.value })} />
      <select class="input" value=${f.kind} onChange=${(e) => setF({ ...f, kind: e.target.value })}><option value="">Formato / tipo</option>${KINDS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <select class="input" value=${f.platform} onChange=${(e) => setF({ ...f, platform: e.target.value })}><option value="">Plataforma</option>${PLATFORMS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <select class="input" value=${f.assignee} onChange=${(e) => setF({ ...f, assignee: e.target.value })}><option value="">Responsable</option>${st.profiles.map((p) => html`<option value=${p.id}>${p.full_name}</option>`)}</select>
      <input class="input" type="date" value=${f.from} onInput=${(e) => setF({ ...f, from: e.target.value })} title="Desde" />
      <input class="input" type="date" value=${f.to} onInput=${(e) => setF({ ...f, to: e.target.value })} title="Hasta" />
      <label class="row small"><input type="checkbox" checked=${f.drafts} onChange=${(e) => setF({ ...f, drafts: e.target.checked })} />Solo borradores</label>
    </div>
    <div class="card">${items.length ? html`<div class="list">${items.filter((p) => p.starts_at).map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}
      ${noDate.length ? html`<h2 style="margin-top:14px">Sin fecha (ideas y borradores)</h2>${noDate.map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}` : null}</div>`
      : html`<p class="empty big">No hay publicaciones con estos filtros.</p>`}</div>`;
}

// ---------- Ficha ----------
export function PostDetail({ id }) {
  const st = useStore();
  const p = st.posts.find((x) => x.id === id);
  const [extra, setExtra] = useState({ versions: [], approvals: [], history: [], loaded: false });
  async function loadExtra() {
    const [versions, approvals, history] = await Promise.all([
      sb.from('post_versions').select('*, attachments(*)').eq('post_id', id).order('version_no', { ascending: false }),
      sb.from('approvals').select('*').eq('post_id', id).order('created_at', { ascending: false }),
      sb.from('post_history').select('*').eq('post_id', id).order('changed_at', { ascending: false }).limit(80)
    ]);
    setExtra({ versions: check(versions), approvals: check(approvals), history: check(history), loaded: true });
  }
  useEffect(() => { loadExtra().catch(toastError); return onRealtime((t, pl) => {
    if (['post_versions', 'approvals', 'attachments', 'posts'].includes(t) && (pl.new?.post_id === id || pl.new?.id === id || pl.old?.post_id === id || t === 'attachments')) loadExtra().catch(() => {});
  }); }, [id]);

  if (!p) return html`<div class="empty big">${st.posts.length ? 'Esta publicación no existe o se ha eliminado.' : 'Cargando…'}<br /><a href="#/publicaciones">Volver a publicaciones</a></div>`;
  const me = st.me;
  const assignee = profileById(p.assignee_id);
  const creator = profileById(p.created_by);
  const tasks = st.tasks.filter((t) => t.post_id === p.id);
  const generalAtt = (p.attachments || []).filter((a) => !a.version_id);
  const latest = extra.versions[0];
  const lastReq = extra.approvals.find((a) => a.decision === 'requested');

  async function setStatus(s) {
    try { check(await sb.from('posts').update({ status: s }).eq('id', p.id)); toast('Estado: ' + STATUS_LABEL[s]); } catch (e) { toastError(e); }
  }
  async function requestApproval() {
    if (!extra.versions.length && !(p.attachments || []).length) {
      const ok = await confirmDialog({ title: 'No hay diseño adjunto', body: '¿Seguro que quieres pedir aprobación sin subir el diseño? El propietario solo verá el texto.', ok: 'Pedir igualmente' });
      if (!ok) return;
    }
    setStatus('pending_approval');
  }
  async function decide(decision) {
    const comment = await confirmDialog(decision === 'approved'
      ? { title: 'Aprobar publicación', body: `Vas a aprobar «${p.title}»${latest ? ` (versión ${latest.version_no})` : ''}.`, ok: 'Aprobar', input: { label: 'Comentario (opcional)', multiline: true } }
      : { title: 'Solicitar cambios', body: 'Explica qué hay que modificar. Quedará registrado y se avisará al responsable.', ok: 'Enviar cambios', input: { label: 'Cambios a realizar', multiline: true, required: true, placeholder: 'Me gusta, pero cambiaría el horario…' } });
    if (comment === null) return;
    try { check(await sb.rpc('decide_approval', { p_post: p.id, p_decision: decision, p_comment: comment || null })); toast(decision === 'approved' ? 'Aprobada ✅' : 'Cambios solicitados'); }
    catch (e) { toastError(e); }
  }
  async function markPublished() {
    const url = await confirmDialog({ title: 'Marcar como publicada', body: 'Hazlo solo cuando ya esté publicada de verdad en la red social.', ok: 'Sí, ya está publicada',
      input: { label: 'Enlace a la publicación (opcional)', placeholder: 'https://www.instagram.com/p/…' } });
    if (url === null) return;
    try { check(await sb.from('posts').update({ status: 'published', published_url: url || null }).eq('id', p.id)); toast('Marcada como publicada'); } catch (e) { toastError(e); }
  }
  async function newVersion() {
    const files = await pickFiles({ title: 'Nueva versión del diseño' });
    if (!files.length) return;
    const note = await confirmDialog({ title: 'Nueva versión', ok: 'Subir versión', input: { label: '¿Qué cambia en esta versión?', placeholder: 'Horario corregido…' } });
    if (note === null) return;
    try {
      const v = check(await sb.from('post_versions').insert({ post_id: p.id, note: note || null }).select().single());
      check(await sb.from('attachments').insert(files.map((f) => ({ ...f, post_id: p.id, version_id: v.id, role: 'design' }))));
      toast(`Versión ${v.version_no} subida`, 'Se ha avisado al equipo');
      loadExtra();
    } catch (e) { toastError(e); }
  }
  async function addMedia() {
    const files = await pickFiles({ title: 'Adjuntar fotos, vídeos o archivos' });
    if (!files.length) return;
    try { check(await sb.from('attachments').insert(files.map((f) => ({ ...f, post_id: p.id, role: /^video/.test(f.mime_type || '') ? 'video' : /^image/.test(f.mime_type || '') ? 'photo' : 'file' })))); toast('Archivos adjuntados'); }
    catch (e) { toastError(e); }
  }
  async function removeAtt(a) {
    if (!(await confirmDialog({ title: 'Quitar adjunto', body: `¿Quitar «${a.name}» de esta publicación? (El original en Drive no se borra.)`, ok: 'Quitar', danger: true }))) return;
    try { check(await sb.from('attachments').delete().eq('id', a.id)); } catch (e) { toastError(e); }
  }
  async function duplicate() {
    try { const d = check(await sb.rpc('duplicate_post', { p_post: p.id })); toast('Duplicada (+7 días, como borrador)'); go('#/publicaciones/' + d.id); } catch (e) { toastError(e); }
  }
  async function remove() {
    if (!(await confirmDialog({ title: 'Eliminar', body: `¿Eliminar «${p.title}»? Se borrarán sus comentarios y versiones.`, ok: 'Eliminar', danger: true }))) return;
    try { check(await sb.from('posts').delete().eq('id', p.id)); toast('Eliminada'); go('#/publicaciones'); } catch (e) { toastError(e); }
  }
  async function createStdTasks() {
    const due = p.deadline || (p.starts_at ? dayKey(new Date(new Date(p.starts_at) - 2 * 864e5)) : null);
    const mk = st.profiles.find((x) => x.role === 'marketing');
    const owner = st.profiles.find((x) => x.can_approve);
    const rows = [
      { title: 'Diseño · ' + p.title, assignee_id: p.assignee_id || mk?.id || null, priority: 'high' },
      { title: 'Copy · ' + p.title, assignee_id: p.assignee_id || mk?.id || null, priority: 'medium' },
      { title: 'Aprobación · ' + p.title, assignee_id: owner?.id || null, priority: 'high' }
    ].map((r) => ({ ...r, post_id: p.id, due_date: due }));
    try { check(await sb.from('tasks').insert(rows)); toast('3 tareas creadas', 'Diseño, copy y aprobación'); } catch (e) { toastError(e); }
  }
  const copy = (t) => navigator.clipboard.writeText(t).then(() => toast('Copiado'));
  const fullCopy = [p.copy, p.cta, p.hashtags].filter(Boolean).join('\n\n');
  const fieldLabel = { title: 'Nombre', starts_at: 'Fecha', deadline: 'Fecha límite', status: 'Estado', kind: 'Tipo', platforms: 'Plataformas', format: 'Formato', copy: 'Copy', hashtags: 'Hashtags', cta: 'CTA', objective: 'Objetivo', description: 'Descripción', assignee: 'Responsable' };

  return html`
  <div class="page-head">
    <div style="min-width:0"><a href="#/publicaciones" class="small">← Publicaciones</a>
      <h1 style="margin-top:6px">${p.title}</h1>
      <div class="row" style="margin-top:8px"><${StatusPill} s=${p.status} /><span class="tag"><${Icon} name=${KIND_ICON[p.kind]} size=${13} />${KIND_LABEL[p.kind]}</span>
        ${p.is_draft ? html`<span class="tag" style="color:var(--ambar)">Borrador</span>` : null}
        <span class="tag"><${Icon} name="calendar" size=${13} />${fmt.dateTime(p.starts_at)}</span>
        ${(p.platforms || []).map((x) => html`<span class="tag">${PLATFORM_LABEL[x] || x}</span>`)}</div></div>
    <div class="actions">
      <button class="btn" onClick=${() => openPostForm({}, p)}><${Icon} name="edit" size=${16} />Editar</button>
      <button class="btn" onClick=${duplicate}><${Icon} name="copy" size=${16} />Duplicar</button>
      ${(p.created_by === me.id || me.is_admin) ? html`<button class="btn danger" onClick=${remove}><${Icon} name="trash" size=${16} /></button>` : null}
    </div>
  </div>

  ${p.pending_info ? html`<div class="card" style="border-color:var(--ambar);margin-bottom:16px"><b style="color:var(--ambar)">⚠ Pendiente de confirmar:</b> ${p.pending_info}</div>` : null}

  ${p.status === 'pending_approval' ? html`<div class="approval-box" style="margin-bottom:16px">
    <div class="row between"><div><b>Pendiente de aprobación</b>${lastReq ? html`<div class="muted small">Solicitada por ${profileById(lastReq.decided_by)?.full_name || '—'} · ${fmt.rel(lastReq.created_at)}${latest ? ` · versión ${latest.version_no}` : ''}</div>` : null}</div>
      ${me.can_approve ? html`<div class="row"><button class="btn danger" onClick=${() => decide('changes_requested')}><${Icon} name="alert" size=${16} />Pedir cambios</button>
        <button class="btn primary" onClick=${() => decide('approved')}><${Icon} name="thumb" size=${16} />Aprobar</button></div>` : html`<span class="muted small">Esperando al propietario</span>`}</div></div>` : null}

  <div class="post-grid">
    <div class="stack" style="gap:16px">
      <section class="card"><h2 class="card-title"><${Icon} name="palette" />Diseño${latest ? ` · versión ${latest.version_no}` : ''}
        <button class="btn sm" style="margin-left:auto" onClick=${newVersion}><${Icon} name="upload" size=${14} />Subir nueva versión</button></h2>
        ${latest ? html`<div class="media-grid">${(latest.attachments || []).map((a) => html`<${MediaCard} a=${a} key=${a.id} />`)}</div>
          ${latest.note ? html`<p class="small muted">Nota: ${latest.note}</p>` : null}`
          : html`<p class="empty">Aún no hay diseño. Súbelo como versión 1 para poder pedir aprobación.</p>`}
        ${extra.versions.length > 1 ? html`<details style="margin-top:12px"><summary class="small" style="cursor:pointer">Versiones anteriores (${extra.versions.length - 1})</summary>
          <div class="stack" style="margin-top:10px">${extra.versions.slice(1).map((v) => html`<div class="version" key=${v.id}>
            <div class="row between small"><b>Versión ${v.version_no}</b><span class="muted">${profileById(v.created_by)?.full_name || ''} · ${fmt.dateTime(v.created_at)}</span></div>
            ${v.note ? html`<p class="small muted" style="margin:4px 0">${v.note}</p>` : null}
            <div class="media-grid" style="margin-top:6px">${(v.attachments || []).map((a) => html`<${MediaCard} a=${a} key=${a.id} />`)}</div></div>`)}</div></details>` : null}
      </section>

      <section class="card"><h2 class="card-title"><${Icon} name="edit" />Copy, hashtags y CTA ${fullCopy ? html`<button class="btn sm" style="margin-left:auto" onClick=${() => copy(fullCopy)}><${Icon} name="copy" size=${14} />Copiar todo</button>` : null}</h2>
        ${p.copy ? html`<div class="copybox">${p.copy}</div>` : html`<p class="empty">Sin copy todavía.</p>`}
        <div class="info-grid" style="margin-top:12px"><div><span>CTA</span>${p.cta || '—'}</div><div><span>Hashtags</span>${p.hashtags || '—'}</div></div>
      </section>

      <section class="card"><h2 class="card-title"><${Icon} name="image" />Fotos, vídeos y archivos<button class="btn sm" style="margin-left:auto" onClick=${addMedia}><${Icon} name="clip" size=${14} />Adjuntar</button></h2>
        ${generalAtt.length ? html`<div class="stack">${generalAtt.map((a) => html`<${AttachmentRow} a=${a} key=${a.id} onRemove=${() => removeAtt(a)} />`)}</div>` : html`<p class="empty">Sin archivos adjuntos.</p>`}
      </section>

      <section class="card"><h2 class="card-title"><${Icon} name="chat" />Comentarios</h2><${CommentsThread} postId=${p.id} /></section>
    </div>

    <div class="stack" style="gap:16px">
      <section class="card"><h2 class="card-title">Acciones</h2><div class="stack">
        ${['idea', 'pending_prep', 'in_design', 'in_review'].includes(p.status) ? html`<button class="btn warn block" onClick=${requestApproval}><${Icon} name="eye" size=${16} />Solicitar aprobación</button>` : null}
        ${p.status === 'approved' ? html`<button class="btn primary block" onClick=${() => setStatus('scheduled')}><${Icon} name="clock" size=${16} />Marcar como programada</button>` : null}
        ${(p.status === 'scheduled' || p.status === 'approved' || !p.requires_approval) && p.status !== 'published' ? html`<button class="btn block" onClick=${markPublished}><${Icon} name="check" size=${16} />Marcar como publicada</button>` : null}
        ${p.status === 'published' && p.published_url ? html`<a class="btn block" href=${p.published_url} target="_blank" rel="noopener"><${Icon} name="instagram" size=${16} />Ver publicación</a>` : null}
        <label class="field"><span>Cambiar estado</span><select class="input" value=${p.status} onChange=${(e) => setStatus(e.target.value)}>
          ${STATUS.filter(([k]) => k !== 'approved' || p.status === 'approved').map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
          <span class="hint">Para aprobar se usa el botón «Aprobar» (queda registrado quién aprueba).</span></label>
        <button class="btn block" onClick=${createStdTasks}><${Icon} name="tasks" size=${16} />Crear tareas: diseño, copy y aprobación</button>
        <button class="btn block ghost" onClick=${() => openTaskForm({ post_id: p.id, title: '' })}><${Icon} name="plus" size=${16} />Otra tarea para esta publicación</button>
      </div></section>

      <section class="card"><h2 class="card-title">Detalles</h2><div class="info-grid">
        <div><span>Responsable</span>${assignee ? html`<span class="row" style="gap:6px"><${Avatar} p=${assignee} size="sm" />${assignee.full_name}</span>` : '—'}</div>
        <div><span>Fecha límite</span>${p.deadline ? fmt.date(p.deadline + 'T12:00') : '—'}</div>
        <div><span>Formato</span>${p.format || '—'}</div>
        <div><span>Objetivo</span>${p.objective || '—'}</div>
        <div><span>Creado por</span>${creator?.full_name || '—'} · ${fmt.date(p.created_at)}</div>
        <div><span>Aprobación</span>${p.approved_at ? html`${profileById(p.approved_by)?.full_name} · ${fmt.dateTime(p.approved_at)}` : p.requires_approval ? 'Necesaria' : 'No necesaria'}</div>
        ${p.published_at ? html`<div><span>Publicado</span>${profileById(p.published_by)?.full_name || ''} · ${fmt.dateTime(p.published_at)}</div>` : null}
        <div style="grid-column:1/-1"><span>Material</span>${p.material || '—'}</div>
        <div style="grid-column:1/-1"><span>Descripción</span><div style="white-space:pre-wrap"><${Linkify} text=${p.description || '—'} /></div></div>
      </div></section>

      <section class="card"><h2 class="card-title"><${Icon} name="tasks" />Tareas vinculadas</h2>
        ${tasks.length ? html`<div class="list">${tasks.map((t) => html`<${TaskLine} t=${t} key=${t.id} />`)}</div>` : html`<p class="empty">Ninguna.</p>`}</section>

      <section class="card"><h2 class="card-title"><${Icon} name="thumb" />Aprobaciones</h2>
        ${extra.approvals.length ? html`<div class="timeline-v">${extra.approvals.map((a) => html`<div class="tv-item" key=${a.id}>
          <span class="ic" style=${{ color: a.decision === 'approved' ? 'var(--verde)' : a.decision === 'changes_requested' ? 'var(--rojo)' : 'var(--ambar)' }}>
            <${Icon} name=${a.decision === 'approved' ? 'check' : a.decision === 'changes_requested' ? 'alert' : 'eye'} size=${14} /></span>
          <div class="small"><b>${a.decision === 'approved' ? 'Aprobado' : a.decision === 'changes_requested' ? 'Cambios solicitados' : 'Aprobación solicitada'}</b>
            <div class="muted xs">${profileById(a.decided_by)?.full_name || ''} · ${fmt.dateTime(a.created_at)}${a.version_id ? ' · v' + (extra.versions.find((v) => v.id === a.version_id)?.version_no || '?') : ''}</div>
            ${a.comment ? html`<div style="margin-top:2px">«${a.comment}»</div>` : null}</div></div>`)}</div>` : html`<p class="empty">Sin solicitudes todavía.</p>`}</section>

      <section class="card"><h2 class="card-title"><${Icon} name="history" />Historial de cambios</h2>
        ${extra.history.length ? html`<div>${extra.history.map((h) => html`<div class="act" key=${h.id}><span class="small"><b>${profileById(h.changed_by)?.full_name || 'Sistema'}</b> cambió <b>${fieldLabel[h.field] || h.field}</b>
          ${['copy', 'description'].includes(h.field) ? '' : html`: <span class="muted">${h.old_value || '—'}</span> → ${h.new_value || '—'}`}</span><time>${fmt.rel(h.changed_at)}</time></div>`)}</div>`
          : html`<p class="empty">Sin cambios registrados.</p>`}</section>
    </div>
  </div>`;
}

// Gestor de tareas compartido: lista y tablero Kanban (arrastrar entre columnas), ficha con comentarios y adjuntos.
import { html, useState, useEffect, Icon, Avatar, PriorityPill, ModalHead, openModal, confirmDialog, toast, toastError, fmt, TASK_STATUS, TASK_STATUS_LABEL, PRIORITY, PRIORITY_ORDER, isOverdueDate, todayKey } from '../lib/ui.js';
import { useStore, useRoute, sb, check, go, profileById } from '../lib/store.js';
import { pickFiles, AttachmentRow } from '../lib/media.js';
import { CommentsThread } from './comments.js';
import { TaskLine } from './dashboard.js';

export function openTaskForm(initial = {}, existing = null) {
  openModal((close) => html`<${TaskForm} initial=${initial} existing=${existing} close=${close} />`, { sticky: true });
}

function TaskForm({ initial, existing, close }) {
  const st = useStore();
  const [v, setV] = useState({ title: '', description: '', assignee_id: '', due_date: '', priority: 'medium', status: 'pending', post_id: '', ...(existing || {}), ...initial });
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  async function save() {
    if (!v.title.trim()) { setErr('Pon un nombre a la tarea.'); return; }
    setBusy(true);
    const row = { title: v.title.trim(), description: v.description || null, assignee_id: v.assignee_id || null, due_date: v.due_date || null, priority: v.priority, status: v.status, post_id: v.post_id || null };
    try {
      const t = existing ? check(await sb.from('tasks').update(row).eq('id', existing.id).select().single()) : check(await sb.from('tasks').insert(row).select().single());
      if (files.length) check(await sb.from('attachments').insert(files.map((f) => ({ ...f, task_id: t.id }))));
      toast(existing ? 'Tarea actualizada' : 'Tarea creada', t.title); close();
    } catch (e) { toastError(e); } finally { setBusy(false); }
  }
  const posts = st.posts.filter((p) => p.status !== 'published' || p.id === v.post_id);
  return html`<${ModalHead} title=${existing ? 'Editar tarea' : 'Nueva tarea'} close=${close} />
    <div class="modal-body"><div class="form-grid">
      <label class="field full"><span>Nombre *</span><input class=${'input' + (err ? ' invalid' : '')} value=${v.title} onInput=${set('title')} autofocus maxlength="200" />${err ? html`<span class="error-text">${err}</span>` : null}</label>
      <label class="field full"><span>Descripción</span><textarea class="input" value=${v.description || ''} onInput=${set('description')}></textarea></label>
      <label class="field"><span>Responsable</span><select class="input" value=${v.assignee_id || ''} onChange=${set('assignee_id')}><option value="">Sin asignar</option>${st.profiles.filter((p) => p.active).map((p) => html`<option value=${p.id}>${p.full_name}</option>`)}</select></label>
      <label class="field"><span>Fecha límite</span><input class="input" type="date" value=${v.due_date || ''} onInput=${set('due_date')} /></label>
      <label class="field"><span>Prioridad</span><select class="input" value=${v.priority} onChange=${set('priority')}>${PRIORITY.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select></label>
      <label class="field"><span>Estado</span><select class="input" value=${v.status} onChange=${set('status')}>${TASK_STATUS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select></label>
      <label class="field full"><span>Publicación relacionada</span><select class="input" value=${v.post_id || ''} onChange=${set('post_id')}><option value="">Ninguna</option>
        ${posts.map((p) => html`<option value=${p.id}>${p.starts_at ? fmt.date(p.starts_at) + ' · ' : ''}${p.title}</option>`)}</select></label>
      ${!existing ? html`<div class="field full"><span>Archivos</span><div class="stack">${files.map((f, i) => html`<${AttachmentRow} a=${f} onRemove=${() => setFiles(files.filter((_, j) => j !== i))} />`)}
        <button type="button" class="btn sm" style="align-self:flex-start" onClick=${async () => setFiles([...files, ...(await pickFiles({}))])}><${Icon} name="clip" size=${15} />Adjuntar</button></div></div>` : null}
    </div></div>
    <div class="modal-foot"><button class="btn ghost" onClick=${close}>Cancelar</button><button class="btn primary" disabled=${busy} onClick=${save}>${existing ? 'Guardar' : 'Crear tarea'}</button></div>`;
}

async function setTaskStatus(t, status) {
  try { check(await sb.from('tasks').update({ status, position: Date.now() / 1000 }).eq('id', t.id)); if (status === 'done') toast('Tarea completada ✅', t.title); } catch (e) { toastError(e); }
}

export function TasksView() {
  const st = useStore();
  const { query } = useRoute();
  const [mode, setMode] = useState(innerWidth < 700 ? 'list' : 'kanban');
  const [f, setF] = useState({ q: '', assignee: '', priority: query.get('f') === 'urgent' ? 'urgent' : '', only: query.get('f') === 'overdue' ? 'overdue' : '' });
  const [over, setOver] = useState(null);
  const items = st.tasks.filter((t) => (!f.assignee || t.assignee_id === f.assignee || (f.assignee === 'me' && t.assignee_id === st.me.id))
    && (!f.priority || t.priority === f.priority) && (!f.q || (t.title + ' ' + (t.description || '')).toLowerCase().includes(f.q.toLowerCase()))
    && (f.only !== 'overdue' || (t.status !== 'done' && isOverdueDate(t.due_date))));
  const sorted = [...items].sort((a, b) => (a.status === 'done') - (b.status === 'done') || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || (a.due_date || '9').localeCompare(b.due_date || '9'));
  const today = todayKey();

  return html`
    <div class="page-head"><div><h1>Tareas</h1><p>${st.tasks.filter((t) => t.status !== 'done').length} abiertas · ${st.tasks.filter((t) => t.status !== 'done' && isOverdueDate(t.due_date)).length} atrasadas</p></div>
      <div class="actions"><div class="seg"><button class=${mode === 'list' ? 'on' : ''} onClick=${() => setMode('list')}>Lista</button><button class=${mode === 'kanban' ? 'on' : ''} onClick=${() => setMode('kanban')}>Kanban</button></div>
        <button class="btn primary" onClick=${() => openTaskForm({})}><${Icon} name="plus" />Nueva tarea</button></div></div>
    <div class="toolbar">
      <input class="input" style="flex:1;min-width:180px" placeholder="Buscar tareas…" value=${f.q} onInput=${(e) => setF({ ...f, q: e.target.value })} />
      <select class="input" value=${f.assignee} onChange=${(e) => setF({ ...f, assignee: e.target.value })}><option value="">Todos</option><option value="me">Mis tareas</option>${st.profiles.map((p) => html`<option value=${p.id}>${p.full_name}</option>`)}</select>
      <select class="input" value=${f.priority} onChange=${(e) => setF({ ...f, priority: e.target.value })}><option value="">Todas las prioridades</option>${PRIORITY.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <button class=${'chip' + (f.only === 'overdue' ? ' on' : '')} onClick=${() => setF({ ...f, only: f.only === 'overdue' ? '' : 'overdue' })}>Solo atrasadas</button>
    </div>
    ${mode === 'list' ? html`<div class="stack">${TASK_STATUS.map(([k, l]) => { const col = sorted.filter((t) => t.status === k); return html`<section class="card" key=${k}>
        <h2>${l} · ${col.length}</h2>${col.length ? html`<div class="list">${col.map((t) => html`<div class="row nowrap" key=${t.id}>
          <input type="checkbox" checked=${t.status === 'done'} onChange=${(e) => setTaskStatus(t, e.target.checked ? 'done' : 'pending')} aria-label="Completar" style="width:18px;height:18px;accent-color:var(--verde)" />
          <div style="flex:1;min-width:0"><${TaskLine} t=${t} /></div></div>`)}</div>` : html`<p class="empty">Nada aquí.</p>`}</section>`; })}</div>`
    : html`<div class="kanban">${TASK_STATUS.map(([k, l]) => { const col = sorted.filter((t) => t.status === k);
        return html`<div key=${k} class=${'kcol' + (over === k ? ' drop' : '')} onDragOver=${(e) => { e.preventDefault(); setOver(k); }} onDragLeave=${() => setOver(null)}
          onDrop=${(e) => { e.preventDefault(); setOver(null); const t = st.tasks.find((x) => x.id === e.dataTransfer.getData('text/plain')); if (t && t.status !== k) setTaskStatus(t, k); }}>
          <h3>${l}<span class="badge" style="background:var(--line2);color:var(--fg)">${col.length}</span></h3>
          ${col.map((t) => { const a = profileById(t.assignee_id); const od = t.status !== 'done' && t.due_date && t.due_date < today;
            return html`<div key=${t.id} class=${'kcard' + (od ? ' overdue' : '')} style=${{ '--c': `var(--pr-${t.priority})` }} draggable="true"
              onDragStart=${(e) => { e.dataTransfer.setData('text/plain', t.id); e.currentTarget.classList.add('dragging'); }} onDragEnd=${(e) => e.currentTarget.classList.remove('dragging')}
              onClick=${() => go('#/tareas/' + t.id)}>
              <div class="title">${t.title}</div>
              <div class="row between"><${PriorityPill} p=${t.priority} />${a ? html`<${Avatar} p=${a} size="sm" />` : null}</div>
              ${t.due_date ? html`<div class="xs muted due">${od ? 'Atrasada · ' : ''}${fmt.date(t.due_date + 'T12:00')}</div>` : null}
              ${t.post_id ? html`<div class="xs muted ellipsis">↳ ${st.posts.find((p) => p.id === t.post_id)?.title || ''}</div>` : null}
              <select class="input" style="padding:4px 6px;font-size:12px" value=${t.status} onClick=${(e) => e.stopPropagation()} onChange=${(e) => setTaskStatus(t, e.target.value)} aria-label="Mover a">
                ${TASK_STATUS.map(([s, sl]) => html`<option value=${s}>${sl}</option>`)}</select>
            </div>`; })}
          <button class="btn ghost sm" onClick=${() => openTaskForm({ status: k })}><${Icon} name="plus" size=${14} />Añadir</button></div>`; })}</div>`}`;
}

export function TaskDetail({ id }) {
  const st = useStore();
  const t = st.tasks.find((x) => x.id === id);
  const [att, setAtt] = useState(null);
  const loadAtt = async () => setAtt(check(await sb.from('attachments').select('*').eq('task_id', id).order('created_at')));
  useEffect(() => { loadAtt().catch(toastError); }, [id]);
  if (!t) return html`<div class="empty big">${st.tasks.length ? 'Esta tarea no existe o se ha eliminado.' : 'Cargando…'}<br /><a href="#/tareas">Volver a tareas</a></div>`;
  const a = profileById(t.assignee_id);
  const post = st.posts.find((p) => p.id === t.post_id);
  async function remove() {
    if (!(await confirmDialog({ title: 'Eliminar tarea', body: `¿Eliminar «${t.title}»?`, ok: 'Eliminar', danger: true }))) return;
    try { check(await sb.from('tasks').delete().eq('id', t.id)); go('#/tareas'); } catch (e) { toastError(e); }
  }
  async function addFiles() {
    const files = await pickFiles({});
    if (!files.length) return;
    try { check(await sb.from('attachments').insert(files.map((f) => ({ ...f, task_id: t.id })))); loadAtt(); } catch (e) { toastError(e); }
  }
  return html`
    <div class="page-head"><div><a href="#/tareas" class="small">← Tareas</a><h1 style="margin-top:6px">${t.title}</h1>
      <div class="row" style="margin-top:8px"><${PriorityPill} p=${t.priority} /><span class="tag">${TASK_STATUS_LABEL[t.status]}</span>
        ${t.due_date ? html`<span class="tag" style=${t.status !== 'done' && isOverdueDate(t.due_date) ? 'color:var(--rojo)' : ''}>Vence ${fmt.date(t.due_date + 'T12:00')}</span>` : null}</div></div>
      <div class="actions">${t.status !== 'done' ? html`<button class="btn primary" onClick=${() => setTaskStatus(t, 'done')}><${Icon} name="check" />Completar</button>` : html`<button class="btn" onClick=${() => setTaskStatus(t, 'pending')}>Reabrir</button>`}
        <button class="btn" onClick=${() => openTaskForm({}, t)}><${Icon} name="edit" size=${16} />Editar</button>
        ${(t.created_by === st.me.id || st.me.is_admin) ? html`<button class="btn danger" onClick=${remove}><${Icon} name="trash" size=${16} /></button>` : null}</div></div>
    <div class="post-grid">
      <div class="stack" style="gap:16px">
        <section class="card"><h2>Descripción</h2><div style="white-space:pre-wrap">${t.description || html`<span class="muted">Sin descripción.</span>`}</div></section>
        <section class="card"><h2 class="card-title">Archivos<button class="btn sm" style="margin-left:auto" onClick=${addFiles}><${Icon} name="clip" size=${14} />Adjuntar</button></h2>
          ${att?.length ? html`<div class="stack">${att.map((x) => html`<${AttachmentRow} a=${x} key=${x.id} />`)}</div>` : html`<p class="empty">Sin archivos.</p>`}</section>
        <section class="card"><h2>Comentarios</h2><${CommentsThread} taskId=${t.id} /></section>
      </div>
      <section class="card"><h2>Detalles</h2><div class="info-grid">
        <div><span>Responsable</span>${a ? a.full_name : '—'}</div>
        <div><span>Estado</span><select class="input" value=${t.status} onChange=${(e) => setTaskStatus(t, e.target.value)}>${TASK_STATUS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select></div>
        <div><span>Creada</span>${fmt.dateTime(t.created_at)} · ${profileById(t.created_by)?.full_name || ''}</div>
        <div><span>Completada</span>${t.completed_at ? fmt.dateTime(t.completed_at) : '—'}</div>
        <div style="grid-column:1/-1"><span>Publicación</span>${post ? html`<a href=${'#/publicaciones/' + post.id}>${post.title}</a>` : '—'}</div>
      </div></section>
    </div>`;
}

// Buscador general con filtros.
import { html, useState, useEffect, Icon, Avatar, fmt, dayKey, STATUS, KINDS, PLATFORMS, toastError } from '../lib/ui.js';
import { useStore, sb, check, go, profileById } from '../lib/store.js';
import { PostLine, TaskLine } from './dashboard.js';
import { MediaCard, isImage, isVideo } from '../lib/media.js';
import { driveConnected, searchDrive, driveRef } from '../lib/drive.js';

export function SearchView({ query }) {
  const st = useStore();
  const [q, setQ] = useState(query.get('q') || '');
  const [f, setF] = useState({ from: '', to: '', assignee: '', platform: '', kind: '', status: '', category: '', what: 'all' });
  const [remote, setRemote] = useState({ messages: [], comments: [], drive: [], loading: false });
  const term = q.trim().toLowerCase();
  const inRange = (d) => (!f.from || (d && dayKey(d) >= f.from)) && (!f.to || (d && dayKey(d) <= f.to));

  useEffect(() => {
    if (term.length < 2) { setRemote({ messages: [], comments: [], drive: [], loading: false }); return; }
    const t = setTimeout(async () => {
      setRemote((r) => ({ ...r, loading: true }));
      try {
        const like = `%${term.replace(/[%_]/g, '')}%`;
        const [m, c] = await Promise.all([
          sb.from('chat_messages').select('*').ilike('body', like).is('deleted_at', null).order('created_at', { ascending: false }).limit(30),
          sb.from('comments').select('*').ilike('body', like).order('created_at', { ascending: false }).limit(30)
        ]);
        let drive = [];
        if (driveConnected()) drive = (await searchDrive(term).catch(() => ({ files: [] }))).files || [];
        setRemote({ messages: check(m), comments: check(c), drive, loading: false });
      } catch (e) { toastError(e); setRemote((r) => ({ ...r, loading: false })); }
    }, 300);
    return () => clearTimeout(t);
  }, [term]);

  const posts = st.posts.filter((p) => (!term || [p.title, p.copy, p.description, p.hashtags, p.material, p.objective].join(' ').toLowerCase().includes(term))
    && inRange(p.starts_at) && (!f.assignee || p.assignee_id === f.assignee) && (!f.platform || (p.platforms || []).includes(f.platform))
    && (!f.kind || p.kind === f.kind) && (!f.status || p.status === f.status));
  const tasks = st.tasks.filter((t) => (!term || (t.title + ' ' + (t.description || '')).toLowerCase().includes(term)) && inRange(t.due_date ? t.due_date + 'T12:00' : null) && (!f.assignee || t.assignee_id === f.assignee));
  const files = st.libraryItems.filter((i) => (!term || (i.name + ' ' + (i.notes || '')).toLowerCase().includes(term)) && (!f.category || i.category_id === f.category) && inRange(i.created_at));
  const atts = st.posts.flatMap((p) => (p.attachments || []).map((a) => ({ ...a, _post: p }))).filter((a) => term && a.name.toLowerCase().includes(term));
  const msgs = remote.messages.filter((m) => inRange(m.created_at) && (!f.assignee || m.created_by === f.assignee));
  const show = (k) => f.what === 'all' || f.what === k;
  const total = (term || Object.values(f).some((x) => x && x !== 'all')) ? posts.length + tasks.length + files.length + msgs.length + remote.comments.length : 0;

  return html`
    <div class="page-head"><div><h1>Buscar</h1><p>Publicaciones, diseños, fotos, vídeos, eventos, tareas y mensajes.</p></div></div>
    <form class="toolbar" onSubmit=${(e) => e.preventDefault()}>
      <input class="input" style="flex:1;min-width:240px;font-size:16px;padding:11px 14px" placeholder="¿Qué buscas? (ej.: champions, cartel, navidad…)" value=${q} onInput=${(e) => setQ(e.target.value)} autofocus />
    </form>
    <div class="toolbar">
      <select class="input" value=${f.what} onChange=${(e) => setF({ ...f, what: e.target.value })}>
        <option value="all">Todo</option><option value="posts">Publicaciones y eventos</option><option value="files">Diseños, fotos y vídeos</option><option value="tasks">Tareas</option><option value="msgs">Mensajes y comentarios</option></select>
      <input class="input" type="date" title="Desde" value=${f.from} onInput=${(e) => setF({ ...f, from: e.target.value })} />
      <input class="input" type="date" title="Hasta" value=${f.to} onInput=${(e) => setF({ ...f, to: e.target.value })} />
      <select class="input" value=${f.assignee} onChange=${(e) => setF({ ...f, assignee: e.target.value })}><option value="">Responsable / autor</option>${st.profiles.map((p) => html`<option value=${p.id}>${p.full_name}</option>`)}</select>
      <select class="input" value=${f.platform} onChange=${(e) => setF({ ...f, platform: e.target.value })}><option value="">Plataforma</option>${PLATFORMS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <select class="input" value=${f.kind} onChange=${(e) => setF({ ...f, kind: e.target.value })}><option value="">Formato</option>${KINDS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <select class="input" value=${f.status} onChange=${(e) => setF({ ...f, status: e.target.value })}><option value="">Estado</option>${STATUS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <select class="input" value=${f.category} onChange=${(e) => setF({ ...f, category: e.target.value })}><option value="">Categoría</option>${st.categories.map((c) => html`<option value=${c.id}>${c.name}</option>`)}</select>
    </div>
    ${!total && !remote.loading ? html`<p class="empty big">${term ? 'Sin resultados.' : 'Escribe algo o usa los filtros.'}</p>` : null}
    <div class="stack" style="gap:16px">
      ${show('posts') && posts.length && total ? html`<section class="card"><h2>Publicaciones y eventos · ${posts.length}</h2><div class="list">${posts.slice(0, 50).map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}</div></section>` : null}
      ${show('files') && (files.length || atts.length || remote.drive.length) && total ? html`<section class="card"><h2>Diseños, fotos y vídeos</h2>
        <div class="media-grid">${files.map((i) => html`<${MediaCard} a=${i} key=${i.id} extra="Biblioteca" />`)}
          ${atts.map((a) => html`<${MediaCard} a=${a} key=${a.id} extra=${a._post.title} />`)}
          ${remote.drive.filter((d) => d.mimeType !== 'application/vnd.google-apps.folder').map((d) => html`<${MediaCard} a=${driveRef(d)} key=${'d' + d.id} extra="Drive" />`)}</div></section>` : null}
      ${show('tasks') && tasks.length && total ? html`<section class="card"><h2>Tareas · ${tasks.length}</h2><div class="list">${tasks.map((t) => html`<${TaskLine} t=${t} key=${t.id} />`)}</div></section>` : null}
      ${show('msgs') && (msgs.length || remote.comments.length) ? html`<section class="card"><h2>Mensajes y comentarios</h2><div class="list">
        ${msgs.map((m) => html`<div class="li" key=${m.id} onClick=${() => go('#/chat')}><${Avatar} p=${profileById(m.created_by)} size="sm" /><div class="body"><div class="title" style="font-weight:500">${m.body}</div><div class="sub">Chat · ${fmt.dateTime(m.created_at)}</div></div></div>`)}
        ${remote.comments.map((c) => html`<div class="li" key=${c.id} onClick=${() => go(c.post_id ? '#/publicaciones/' + c.post_id : '#/tareas/' + c.task_id)}><${Avatar} p=${profileById(c.created_by)} size="sm" />
          <div class="body"><div class="title" style="font-weight:500">${c.body}</div><div class="sub">Comentario en ${c.post_id ? st.posts.find((p) => p.id === c.post_id)?.title : st.tasks.find((t) => t.id === c.task_id)?.title} · ${fmt.dateTime(c.created_at)}</div></div></div>`)}
      </div></section>` : null}
      ${remote.loading ? html`<p class="empty">Buscando en mensajes${driveConnected() ? ' y Drive' : ''}…</p>` : null}
    </div>`;
}
